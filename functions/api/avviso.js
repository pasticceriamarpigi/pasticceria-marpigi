/**
 * Cloudflare Pages Function — POST /api/avviso
 * Salva le email di chi vuole essere avvisato all'apertura dello shop.
 *
 * Serve un binding KV chiamato AVVISI (vedi wrangler.toml).
 * Crealo una volta sola con:
 *   npx wrangler kv namespace create AVVISI
 */
export async function onRequestPost({ request, env }) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ errore: 'Corpo della richiesta non valido.' }, 400);
  }

  const email = String(body?.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return json({ errore: 'Indirizzo email non valido.' }, 400);
  }

  if (!env.AVVISI) {
    return json({ errore: 'Archivio non configurato.' }, 500);
  }

  await env.AVVISI.put(
    `avviso:${email}`,
    JSON.stringify({
      email,
      data: new Date().toISOString(),
      paese: request.headers.get('CF-IPCountry') ?? null,
    })
  );

  return json({ ok: true });
}

// Le richieste che non sono POST non hanno senso su questo endpoint.
export const onRequest = ({ request }) =>
  request.method === 'POST'
    ? undefined
    : new Response('Metodo non consentito', { status: 405 });
