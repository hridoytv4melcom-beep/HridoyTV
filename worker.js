addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  let originalURL = ''

  // চ্যানেল ম্যাপিং
  if (url.pathname.endsWith('/sony-aath.m3u8')) {
    originalURL = 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8'
  } else if (url.pathname.endsWith('/srk-tv.m3u8')) {
    originalURL = 'https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/tracks-v1a1/mono.m3u8'
  } else {
    return new Response('Not Found', { status: 404 })
  }

  try {
    const response = await fetch(originalURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
    headers.set('Access-Control-Allow-Headers', '*')

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (err) {
    return new Response('Stream Fetch Error: ' + err.message, { status: 502 })
  }
}
