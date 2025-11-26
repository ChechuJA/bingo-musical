/**
 * Cloudflare Worker: YouTube Playlist Proxy
 * 
 * Este worker actúa como proxy seguro entre tu frontend y la API de YouTube.
 * Oculta la API Key y evita problemas de CORS.
 * 
 * Deployment: https://workers.cloudflare.com
 * Plan: FREE (100,000 requests/día)
 */

// CONFIGURACIÓN
// Añadir como Environment Variable en Cloudflare Dashboard:
// Variable name: YOUTUBE_API_KEY
// Value: tu_api_key_de_google

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Configurar CORS para permitir requests desde tu dominio
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Cambiar a 'https://bingomusicalgratis.es' en producción
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  // Manejar preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Solo permitir GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    // Obtener playlist ID de la URL
    const url = new URL(request.url)
    const playlistId = url.searchParams.get('id')

    if (!playlistId) {
      return new Response(JSON.stringify({ 
        error: 'Missing playlist ID. Use: ?id=PLAYLIST_ID' 
      }), {
        status: 400,
        headers: corsHeaders
      })
    }

    // Validar formato de playlist ID (alfanumérico, guiones y guiones bajos)
    if (!/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid playlist ID format' 
      }), {
        status: 400,
        headers: corsHeaders
      })
    }

    // Obtener API Key desde environment variable
    const apiKey = YOUTUBE_API_KEY
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing API key' 
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    // Llamar a YouTube API
    const songs = await fetchYouTubePlaylist(playlistId, apiKey)

    // Retornar canciones
    return new Response(JSON.stringify({
      success: true,
      count: songs.length,
      songs: songs
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      success: false
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
}

/**
 * Fetch playlist items from YouTube API
 */
async function fetchYouTubePlaylist(playlistId, apiKey) {
  const songs = []
  let nextPageToken = null
  let pageCount = 0
  const maxPages = 10 // Limitar a 10 páginas = ~500 canciones max

  do {
    // Construir URL de YouTube API
    let apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?` +
      `part=snippet&` +
      `playlistId=${playlistId}&` +
      `maxResults=50&` +
      `key=${apiKey}`

    if (nextPageToken) {
      apiUrl += `&pageToken=${nextPageToken}`
    }

    // Fetch data
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      const errorData = await response.json()
      
      if (response.status === 404) {
        throw new Error('Playlist no encontrada. Verifica que sea pública y que el ID sea correcto.')
      } else if (response.status === 403) {
        throw new Error('Error de permisos. La playlist debe ser pública.')
      } else {
        throw new Error(errorData.error?.message || 'Error al obtener playlist de YouTube')
      }
    }

    const data = await response.json()

    // Extraer canciones
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const title = item.snippet?.title
        const channelTitle = item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle

        // Filtrar videos eliminados o privados
        if (title && title !== 'Deleted video' && title !== 'Private video') {
          songs.push({
            name: cleanTitle(title),
            artist: cleanArtist(channelTitle || 'Unknown Artist')
          })
        }
      }
    }

    // Siguiente página
    nextPageToken = data.nextPageToken
    pageCount++

  } while (nextPageToken && pageCount < maxPages)

  return songs
}

/**
 * Limpiar título del video
 * Remover sufijos comunes como (Official Video), [Official Audio], etc.
 */
function cleanTitle(title) {
  return title
    .replace(/\(Official Video\)/gi, '')
    .replace(/\[Official Video\]/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .replace(/\(Official Music Video\)/gi, '')
    .replace(/\[Official Music Video\]/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\[Lyric Video\]/gi, '')
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\[Lyrics\]/gi, '')
    .replace(/\(Audio\)/gi, '')
    .replace(/\[Audio\]/gi, '')
    .replace(/\(HD\)/gi, '')
    .replace(/\[HD\]/gi, '')
    .replace(/\(4K\)/gi, '')
    .replace(/\[4K\]/gi, '')
    .replace(/Official Video/gi, '')
    .replace(/Official Audio/gi, '')
    .trim()
}

/**
 * Limpiar nombre del artista
 */
function cleanArtist(artist) {
  return artist
    .replace(/VEVO$/gi, '')
    .replace(/Official$/gi, '')
    .replace(/ - Topic$/gi, '')
    .trim()
}
