import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const prefix = '/api/proxy/';
    const pathPart = req.url.split(prefix)[1] || '';
    const mapping = {
      'sony-aath.m3u8': 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8',
      'srk-tv.m3u8': 'https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/tracks-v1a1/mono.m3u8'
    };

    const upstream = mapping[pathPart] || pathPart;
    if (!upstream) return res.status(400).send('Bad request');

    const upstreamResp = await fetch(upstream, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://www.google.com'
      },
      redirect: 'follow'
    });

    let body = await upstreamResp.text();

    // Manifest rewrite: সব .ts URL proxy route দিয়ে
    body = body.replace(/(https?:\/\/[^\s]+\.ts)/g, (match) => {
      return `/api/proxy/?url=${encodeURIComponent(match)}`;
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    res.status(200).send(body);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Proxy error: ' + err.message);
  }
}
