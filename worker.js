addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const referer = request.headers.get('Referer') || ''

  if (!referer.includes('hridoytv.4mel.com')) {
    return new Response('Forbidden', { status: 403 })
  }

  let originalURL = ''

  if (url.pathname.endsWith('/sony-aath.m3u8')) {
    originalURL = 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8'
  } else if (url.pathname.endsWith('/srk-tv.m3u8')) {
    originalURL = 'https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/tracks-v1a1/mono.m3u8'
  } else {
    return new Response('Not Found', { status: 404 })
  }

  const response = await fetch(originalURL)
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  return new Response(response.body, { status: response.status, headers })
}
