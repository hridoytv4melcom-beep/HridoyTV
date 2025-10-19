export default async function handler(req, res) {
  try {
    // Catch-all route: [...path].js
    const pathParts = req.query.path || [];
    const fileName = pathParts.join('/');

    // Mapping
    const mapping = {
      'sony-aath.m3u8': 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts'
    };

    const upstream = mapping[fileName];
    if (!upstream) return res.status(400).send('Bad request');

    const response = await fetch(upstream, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    let body = await response.text();

    // Rewrite .ts URLs to proxy
    body = body.replace(/(https?:\/\/[^\s]+\.ts)/g, (match) => {
      return `/api/proxy/?url=${encodeURIComponent(match)}`;
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(body);

  } catch (err) {
    console.error(err);
    res.status(502).send('Proxy error: ' + err.message);
  }
}
