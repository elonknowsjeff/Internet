const PRIVATE_HOST = /^(localhost$|127\.|0\.0\.0\.0$|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|\[::1\])/i;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const escapeAttr = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const READER_CSS = `html{-webkit-text-size-adjust:100%;}
body{margin:0 auto;max-width:820px;padding:18px 16px 40px;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#16181d;background:#fff;-webkit-font-smoothing:antialiased;}
nav ul,.menu,.nav{list-style:none;display:flex;flex-wrap:wrap;gap:10px;padding:0;}
h1,h2,h3{line-height:1.25;margin:1.1em 0 .45em;}
img,video,figure,table{max-width:100%;height:auto;}
a{color:#4f46e5;text-decoration:none;}
a:hover{text-decoration:underline;}
ul,ol{padding-left:1.25em;}
li{margin:.3em 0;}
table{border-collapse:collapse;width:100%;}
td,th{border:1px solid #e5e7eb;padding:6px;text-align:left;}
p{margin:.75em 0;}`;

const bridge = `<meta name="referrer" content="no-referrer">
<style>html{-webkit-text-size-adjust:100%;}img,video{max-width:100%;height:auto;}body{background:#fff;}</style>
<script>
(function(){
  function send(u){ if(!u) return; try { parent.postMessage({ __walzaBrowser: true, url: String(u) }, '*'); } catch(e) {} }
  function fix(){ try { document.querySelectorAll('a[href]').forEach(function(a){
    var h = a.getAttribute('href') || '';
    if(h.indexOf('javascript:') === 0 || h.indexOf('#') === 0) return;
    if(h.indexOf('//') === 0) a.href = location.protocol + h;
    a.target = '_self';
  }); } catch(e) {} }
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if(!a) return;
    var raw = a.getAttribute('href') || '';
    if(raw.indexOf('javascript:') === 0 || raw.indexOf('#') === 0) return;
    if(a.target === '_blank') return;
    e.preventDefault();
    send(a.href);
  }, true);
  document.addEventListener('submit', function(e){
    e.preventDefault();
    var f = e.target;
    if(!f || !f.querySelectorAll) return;
    try {
      var url = new URL(f.getAttribute('action') || location.href, location.href);
      new FormData(f).forEach(function(v, k){ if(typeof v === 'string') url.searchParams.set(k, v); });
      send(url.toString());
    } catch(err) {}
  }, true);
  function reply(id, ok, value) {
    var out;
    try { out = value === undefined ? 'undefined' : typeof value === 'string' ? value : JSON.stringify(value); }
    catch (e) { out = String(value); }
    try { parent.postMessage({ __walzaEvalResult: true, id: id, ok: !!ok, value: out == null ? String(value) : out }, '*'); } catch (e) {}
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__walzaEval !== true || typeof d.code !== 'string') return;
    var out;
    try { out = (0, eval)(d.code); }
    catch (err) { reply(d.id, false, String((err && err.message) || err)); return; }
    if (out && typeof out.then === 'function') {
      out.then(function (v) { reply(d.id, true, v); }, function (err) { reply(d.id, false, String((err && err.message) || err)); });
      return;
    }
    reply(d.id, true, out);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  fix();
})();
</script>`;

const getPage = (url, ms) =>
  fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(ms),
  });

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    let target = typeof body.url === 'string' ? body.url.trim() : '';

    const isSearch = !target && !!query;
    if (isSearch) target = 'https://lite.duckduckgo.com/lite/?q=' + encodeURIComponent(query);
    if (!target) return Response.json({ error: 'Enter a web address or a search.' }, { status: 400 });
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

    let parsed;
    try {
      parsed = new URL(target);
    } catch (e) {
      return Response.json({ error: 'That web address is not valid.' }, { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol) || PRIVATE_HOST.test(parsed.hostname)) {
      return Response.json({ error: 'That address cannot be opened here.' }, { status: 400 });
    }

    let res;
    try {
      res = await getPage(parsed.toString(), isSearch ? 9000 : 15000);
    } catch (e) {
      if (!isSearch) throw e;
      const alt = new URL('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query));
      try {
        res = await getPage(alt.toString(), 12000);
        parsed = alt;
      } catch (e2) {
        return Response.json(
          { error: 'Search is unavailable right now. Try a full web address instead.', blocked: true },
          { status: 502 }
        );
      }
    }

    const finalUrl = res.url || parsed.toString();
    const type = (res.headers.get('content-type') || '').toLowerCase();

    if (!res.ok) {
      return Response.json({
        url: finalUrl,
        status: res.status,
        error:
          res.status === 403 || res.status === 401
            ? 'That site blocks automated visits (HTTP ' + res.status + '). Open it in a new tab instead.'
            : 'This site refused to load here (HTTP ' + res.status + ').',
        blocked: true,
      });
    }
    if (!type.includes('html') && !type.includes('xml') && type !== '') {
      return Response.json({
        url: finalUrl,
        status: res.status,
        error: 'That link is a file, not a web page. Open it in a new tab instead.',
        blocked: true,
      });
    }

    const bytes = await res.arrayBuffer();
    const headerCharset = ((res.headers.get('content-type') || '').match(/charset=["']?([\w-]+)/i) || [])[1];
    let charset = (headerCharset || 'utf-8').toLowerCase();
    let html = '';
    try {
      html = new TextDecoder(charset).decode(bytes);
    } catch (e) {
      charset = 'utf-8';
      html = new TextDecoder('utf-8').decode(bytes);
    }
    if (!headerCharset) {
      const metaCharset = ((html.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1] || '').toLowerCase();
      if (metaCharset && metaCharset !== charset) {
        try {
          html = new TextDecoder(metaCharset).decode(bytes);
          charset = metaCharset;
        } catch (e) {
          console.log('charset fallback skipped', metaCharset);
        }
      }
    }
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 140) : finalUrl;

    // sandboxed frames drop some external stylesheets — inline the first few so pages keep their look
    const sheetTags = Array.from(html.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)).slice(0, 3);
    for (const tag of sheetTags) {
      const href = (tag[0].match(/href=["']([^"']+)["']/i) || [])[1];
      if (!href) continue;
      try {
        const abs = new URL(href, finalUrl).toString();
        const cssRes = await fetch(abs, {
          headers: { 'User-Agent': UA, Accept: 'text/css,*/*;q=0.1' },
          signal: AbortSignal.timeout(6000),
        });
        if (!cssRes.ok) continue;
        const css = await cssRes.text();
        if (!css || css.length > 400000) continue;
        html = html.replace(tag[0], () => `<style>${css}</style>`);
      } catch (e) {
        console.log('css inline skipped', href);
      }
    }

    const hasOwnStyles = /rel=["']?stylesheet/i.test(html) || /<style[\s>]/i.test(html);
    const tail = (hasOwnStyles ? '' : `<style>${READER_CSS}</style>`) + bridge;

    html = html
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
      .replace(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/gi, '')
      .replace(/<base\b[^>]*>/gi, '');

    const baseTag =
      '<base href="' + escapeAttr(finalUrl) + '" target="_self">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">';
    html = /<head[^>]*>/i.test(html)
      ? html.replace(/<head[^>]*>/i, (m) => m + baseTag)
      : baseTag + html;

    html = /<\/body>/i.test(html)
      ? html.replace(/<\/body>/i, () => tail + '</body>')
      : html + tail;

    if (html.length > 1500000) html = html.slice(0, 1500000) + tail;

    return Response.json({ url: finalUrl, title, html, status: res.status });
  } catch (error) {
    const msg =
      error && error.name === 'TimeoutError'
        ? 'That site took too long to answer. Try again.'
        : (error && error.message) || 'Could not reach that site. Check the address and try again.';
    return Response.json({ error: msg }, { status: 502 });
  }
}