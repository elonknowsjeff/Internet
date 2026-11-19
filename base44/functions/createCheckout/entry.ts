import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { RIDE_TIERS, priceEatsOrder } from '../../shared/storeCatalog.ts';

const STRIPE_API = 'https://api.stripe.com/v1';
const CURRENCY = 'usd';

// The connected Stripe account supplies a test key first; the live key takes over
// once the account is claimed. Ignore placeholder values that are not real keys.
function stripeKey() {
  const looksReal = (k: string) => /^(sk|rk)_(live|test)_[A-Za-z0-9]/.test(k || '');
  const live = secrets.get('STRIPE_SECRET_KEY') || '';
  const test = secrets.get('STRIPE_TEST_SECRET_KEY') || '';
  if (looksReal(live)) return live;
  if (looksReal(test)) return test;
  return '';
}
// Walza+ membership tiers — amounts live on the server so the buyer can never set the price.
const MEMBERSHIP_PLANS: Record<string, { label: string; amount: number }> = {
  plus: { label: 'Walza+', amount: 499 },
  pro: { label: 'Walza+ Pro', amount: 1999 },
  studio: { label: 'Walza+ Studio', amount: 4999 },
  business: { label: 'Walza+ Business', amount: 9999 },
  enterprise: { label: 'Walza+ Enterprise', amount: 19999 },
  ultimate: { label: 'Walza+ Ultimate', amount: 49999 },
};

function form(params) {
  const body = new URLSearchParams();
  const walk = (value, key) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((entry, i) => walk(entry, `${key}[${i}]`));
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => walk(v, `${key}[${k}]`));
      return;
    }
    body.append(key, String(value));
  };
  Object.entries(params).forEach(([k, v]) => walk(v, k));
  return body;
}

export default async function (req) {
  try {
    const origin = req.headers.get('X-Base44-App-Url');
    if (!origin) return Response.json({ error: 'Checkout is unavailable right now.' }, { status: 400 });
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

    const body = await req.json().catch(() => ({}));
    const kind = String(body?.kind || '');
    const lineItems = [];
    let returnPath = '/';
    let mode: 'payment' | 'subscription' = 'payment';
    let planKey = '';

    if (kind === 'eats') {
      const priced = priceEatsOrder(String(body?.store_id || ''), body?.items);
      if (priced.error) return Response.json({ error: priced.error }, { status: 400 });
      for (const line of priced.lines) {
        lineItems.push({
          quantity: line.quantity,
          price_data: { currency: CURRENCY, unit_amount: line.unitAmount, product_data: { name: `${priced.store.name} · ${line.name}` } },
        });
      }
      if (priced.fee > 0) {
        lineItems.push({ quantity: 1, price_data: { currency: CURRENCY, unit_amount: Math.round(priced.fee * 100), product_data: { name: 'Delivery fee' } } });
      }
      returnPath = '/eats?paid=1';
    } else if (kind === 'ride') {
      const tier = RIDE_TIERS[String(body?.tier || '')];
      if (!tier) return Response.json({ error: 'Unknown ride type' }, { status: 400 });
      lineItems.push({
        quantity: 1,
        price_data: { currency: CURRENCY, unit_amount: Math.round(tier.price * 100), product_data: { name: `Ride · ${tier.label}` } },
      });
      returnPath = '/rides?paid=1';
    } else if (kind === 'subscription') {
      planKey = MEMBERSHIP_PLANS[String(body?.plan || 'plus')] ? String(body?.plan || 'plus') : 'plus';
      const plan = MEMBERSHIP_PLANS[planKey];
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: plan.amount,
          recurring: { interval: 'month' },
          product_data: { name: plan.label },
        },
      });
      mode = 'subscription';
      returnPath = '/settings?subscribed=1';
    } else {
      return Response.json({ error: 'Unknown checkout type' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));

    const params: Record<string, unknown> = {
      mode,
      success_url: `${origin}${returnPath}`,
      cancel_url: `${origin}${returnPath.replace(/[?&]paid=1/, '?cancelled=1').replace(/[?&]subscribed=1/, '?cancelled=1')}`,
      line_items: lineItems,
      metadata: { base44_app_id: secrets.get('BASE44_APP_ID'), kind, ...(planKey ? { plan: planKey } : {}) },
    };
    if (mode === 'subscription') {
      params.subscription_data = { metadata: { base44_app_id: secrets.get('BASE44_APP_ID'), kind, ...(planKey ? { plan: planKey } : {}) } };
    }
    if (user?.email) params.customer_email = user.email;

    const key = stripeKey();
    if (!key) return Response.json({ error: 'Card payments are not connected yet — connect Stripe in Integrations.' }, { status: 502 });

    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Stripe-Version': '2025-10-29.clover',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: form(params),
      signal: AbortSignal.timeout(20000),
    });
    const session = await res.json();
    if (!res.ok) {
      const message = String(session?.error?.message || '');
      console.error('stripe checkout failed', message);
      if (/api key|authentication/i.test(message)) {
        return Response.json({ error: 'Card payments are not connected yet — add your Stripe secret key in Settings → Secrets.' }, { status: 502 });
      }
      return Response.json({ error: message || 'Could not start checkout' }, { status: 502 });
    }
    return Response.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error('createCheckout error', error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}