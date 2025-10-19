addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let originalURL = ''

  // মেইন .m3u8 লিংক
  if (url.pathname.endsWith('/sony-aath.m3u8')) {
    originalURL = 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8'
  } else if (url.pathname.endsWith('/srk-tv.m3u8')) {
    originalURL = 'https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/tracks-v1a1/mono.m3u8'
  } else if (url.pathname.includes('.ts')) {
    // মূল ts লিংক বানানো
    originalURL = url.href.replace('https://hridoytv.4mel.com', 'https://live20.bozztv.com')
  } else {
    return new Response('Not Found', { status: 404 })
  }

  const response = await fetch(originalURL)

  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Headers', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')

  return new Response(response.body, {
    status: response.status,
    headers: headers
  })
                      }
