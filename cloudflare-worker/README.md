# 🎵 YouTube Playlist Proxy - Cloudflare Worker

Proxy seguro para importar playlists de YouTube en el Generador de Bingo Musical.

## 📁 Archivos

- **`youtube-proxy.js`**: Código del worker (despliega este archivo en Cloudflare)
- **`DEPLOYMENT-GUIDE.md`**: Guía completa paso a paso de deployment

## ⚡ Quick Start

### 1. Obtener YouTube API Key (5 min)
1. Ir a https://console.cloud.google.com
2. Crear proyecto → Habilitar "YouTube Data API v3"
3. Credentials → Create API Key
4. Restrict key a tu dominio

### 2. Desplegar Worker (10 min)
1. Crear cuenta en https://dash.cloudflare.com
2. Workers & Pages → Create Worker
3. Copiar código de `youtube-proxy.js`
4. Settings → Environment Variables:
   - Name: `YOUTUBE_API_KEY`
   - Value: (tu API key)
   - Type: **Secret** ✅

### 3. Configurar Frontend
En `generador.html` línea ~760:
```javascript
const YOUTUBE_WORKER_URL = 'https://youtube-proxy.TU-SUBDOMINIO.workers.dev';
```
Reemplazar `TU-SUBDOMINIO` con tu URL del worker.

## 🧪 Probar

```bash
# Test worker directamente
https://youtube-proxy.TU-SUBDOMINIO.workers.dev?id=PLI_7Mg2Z_-4LTyVIe8k6VWFmpZKaBV171
```

Respuesta esperada:
```json
{
  "success": true,
  "count": 20,
  "songs": [
    {"name": "Song Title", "artist": "Channel Name"},
    ...
  ]
}
```

## 🔒 Seguridad

✅ API Key oculta (environment variable encriptada)  
✅ CORS configurado  
✅ Validación de playlist ID  
✅ Rate limiting por Cloudflare  

## 💰 Costos

**TODO GRATIS**:
- YouTube API: 10,000 unidades/día
- Cloudflare Workers: 100,000 requests/día

## 📚 Docs Completas

Ver **`DEPLOYMENT-GUIDE.md`** para guía detallada con screenshots y troubleshooting.

---

**Compatible con AdSense**: ✅ El worker no afecta la publicidad del sitio.
