import { base44 } from "@/api/base44Client";

// Starts a real Stripe Checkout session for a server-priced order.
// Opens the checkout tab synchronously when the app is framed so popup blockers keep user activation.
export async function startCheckout(payload) {
  const framed = window.self !== window.top;
  const tab = framed ? window.open("", "_blank") : null;
  if (framed && !tab) throw new Error("Allow popups to continue to checkout.");

  try {
    if (tab) tab.opener = null;
    const res = await base44.functions.invoke("createCheckout", payload);
    const url = res?.data?.url;
    if (!url) throw new Error(res?.data?.error || "Checkout is unavailable right now.");
    if (tab) tab.location.replace(url);
    else window.location.assign(url);
  } catch (error) {
    tab?.close();
    throw error;
  }
}

// Walza+ membership — a real Stripe subscription priced on the server.
export function startSubscription(plan = "plus") {
  return startCheckout({ kind: "subscription", plan });
}