const fetchFn = global.fetch || require('node-fetch')

module.exports = async (req, res) => {
  try {
    const urlPath = req.url || ''
    const pathOnly = urlPath.split('?')[0]
    const p = pathOnly.replace(/^\/api/, '') || '/'

    if (p.endsWith('.m3u8')) {
      let source = ''
      if (p.endsWith('/sony-aath.m3u8')) {
        source = 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8'
      } else if (p.endsWith('/srk-tv.m3u8')) {
        source = 'https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/tracks-v1a1/mono.m3u8'
      } else {
        res.status(404).send('Not found')
        return
      }

      const upstream = await fetchFn(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.google.com'
        }
      })

      if (!upstream.ok) {
        res.status(502).send('Upstream error: ' + upstream.status)
        return
      }

      const text = await upstream.text()
      const lines = text.split(/\r?\n/)
      const rewritten = lines.map(line => {
        line = line.trim()
        if (!line || line.startsWith('#')) return line
        try {
          const src = new URL(line, source).toString()
          return `/api/seg/${encodeURIComponent(src)}`
        } catch (e) {
          return line
        }
      }).join('\n')

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', '*')
      res.status(200).send(rewritten)
      return
    }

    if (p.startsWith('/seg/')) {
      const encoded = p.replace('/seg/', '')
      const original = decodeURIComponent(encoded)

      const upstream = await fetchFn(original, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.google.com'
        }
      })

      if (!upstream.ok) {
        res.status(502).send('Upstream error: ' + upstream.status)
        return
      }

      const buffer = await upstream.arrayBuffer()
      const ct = upstream.headers.get('content-type')
      if (ct) res.setHeader('Content-Type', ct)
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', '*')
      res.status(upstream.status).send(Buffer.from(buffer))
      return
    }

    if (p === '/' || p === '/test.txt') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).send('OK - proxy live')
      return
    }

    res.status(404).send('Not found')
  } catch (err) {
    res.status(500).send('Error: ' + err.message)
  }
          }
