// api/proxy/[...path].js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    // catch-all path
    const prefix = '/api/proxy/';
    const pathPart = req.url.split(prefix)[1] || '';

    // map short names to real upstream URLs
    const mapping = {
      'sony-aath.m3u8': 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8',
      'srk-tv.m3u8': 'https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/tracks-v1a1/mono.m3u8'
    };

    const upstream = mapping[pathPart] || pathPart; // fallback to pathPart if full URL passed

    if (!upstream) return res.status(400).send('Bad request');

    // fetch upstream with browser-like headers
    const upstreamResp = await fetch(upstream, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://www.google.com'
      },
      redirect: 'follow'
    });

    const ct = upstreamResp.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    const arrayBuffer = await upstreamResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.status(upstreamResp.status).send(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Proxy error: ' + err.message);
  }
}
