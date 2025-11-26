# 🚀 Guía de Despliegue: YouTube Proxy Worker

## 📋 Requisitos

1. ✅ Cuenta Cloudflare (gratis)
2. ✅ API Key de YouTube (gratis)
3. ⏱️ **Tiempo total: 15 minutos**

---

## Paso 1: Obtener YouTube API Key (5 min)

### 1.1 Ir a Google Cloud Console
Visita: https://console.cloud.google.com

### 1.2 Crear nuevo proyecto
1. Click en selector de proyectos (arriba)
2. Click "New Project"
3. Nombre: `bingo-musical-youtube`
4. Click "Create"

### 1.3 Habilitar YouTube Data API
1. En el menú lateral → "APIs & Services" → "Library"
2. Buscar: `YouTube Data API v3`
3. Click en el resultado
4. Click "ENABLE"

### 1.4 Crear API Key
1. En el menú lateral → "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "API key"
3. **¡IMPORTANTE!** Click en "RESTRICT KEY"
4. Configurar restricciones:
   - **Application restrictions**: HTTP referrers
   - **Add an item**: 
     - `https://bingomusicalgratis.es/*`
     - `http://localhost:*` (para desarrollo)
   - **API restrictions**: 
     - Select "Restrict key"
     - Check "YouTube Data API v3"
5. Click "SAVE"
6. **Copiar la API Key** → La necesitarás en Paso 2

**📊 Cuota diaria**: 10,000 unidades/día = ~1,000-5,000 playlists

---

## Paso 2: Desplegar Worker en Cloudflare (10 min)

### 2.1 Crear cuenta Cloudflare
Visita: https://dash.cloudflare.com/sign-up

**Plan**: FREE (100,000 requests/día)

### 2.2 Crear Worker

#### Opción A: Dashboard Web (Más fácil)

1. En dashboard → Click "Workers & Pages"
2. Click "Create application"
3. Click "Create Worker"
4. Nombre del worker: `youtube-proxy`
5. Click "Deploy" (despliega el template por defecto)

#### Opción B: CLI con Wrangler (Más rápido)

```powershell
# Instalar Wrangler CLI
npm install -g wrangler

# Autenticar
wrangler login

# Crear worker
wrangler init youtube-proxy

# Copiar el código
# (copiar contenido de cloudflare-worker/youtube-proxy.js)

# Desplegar
wrangler deploy
```

### 2.3 Subir código del worker

1. Click en tu worker `youtube-proxy`
2. Click "Quick Edit" (arriba a la derecha)
3. **Borrar** todo el código existente
4. **Copiar y pegar** el contenido de `cloudflare-worker/youtube-proxy.js`
5. Click "Save and Deploy"

### 2.4 Configurar API Key (CRÍTICO - Seguridad)

1. En la página del worker → Click pestaña "Settings"
2. Scroll a sección "Environment Variables"
3. Click "Add variable"
4. Configurar:
   - **Variable name**: `YOUTUBE_API_KEY`
   - **Value**: (pega tu API key de Google)
   - **Type**: Secret (checkbox marcado - oculta el valor)
5. Click "Save"

### 2.5 Obtener URL del worker

Después de desplegar, verás la URL:
```
https://youtube-proxy.TU-SUBDOMINIO.workers.dev
```

**Ejemplo**:
```
https://youtube-proxy.chechu.workers.dev
```

**⚠️ IMPORTANTE**: Copia esta URL, la necesitas para el frontend.

---

## Paso 3: Actualizar Frontend (Ya lo hago yo)

Te enviaré el código actualizado con:
- Campo de entrada para URL de YouTube
- Botón "Importar desde YouTube"
- Código para llamar a tu worker
- Validación y feedback

Solo necesitarás **pegar la URL de tu worker** en una constante que te indicaré.

---

## 🧪 Paso 4: Probar

### Test 1: Verificar worker directamente
Abre en navegador:
```
https://youtube-proxy.TU-SUBDOMINIO.workers.dev?id=PLI_7Mg2Z_-4LTyVIe8k6VWFmpZKaBV171
```

**Respuesta esperada**:
```json
{
  "success": true,
  "count": 20,
  "songs": [
    {"name": "Song Title", "artist": "Artist Name"},
    ...
  ]
}
```

### Test 2: Probar desde tu web
1. Ir a `generador.html`
2. Pegar URL de playlist de YouTube
3. Click "Importar desde YouTube"
4. Ver canciones importadas en textarea

---

## 🔒 Seguridad

✅ **API Key oculta** - No aparece en código frontend  
✅ **Environment Variable** - Encriptada en Cloudflare  
✅ **CORS configurado** - Solo tu dominio puede llamar al worker  
✅ **Rate limiting** - Cloudflare maneja automáticamente  
✅ **Validación** - Playlist ID validado antes de llamar a YouTube  

---

## 💰 Costos

**TODO GRATIS**:
- ✅ YouTube API: 10,000 unidades/día (cuota gratuita de Google)
- ✅ Cloudflare Workers: 100,000 requests/día (plan FREE)
- ✅ Dominio bingomusicalgratis.es: Ya lo tienes

**Límites prácticos**:
- ~1,000-5,000 imports de playlists/día (dependiendo tamaño)
- Suficiente para varios años de uso real

---

## 🐛 Troubleshooting

### Error: "Server configuration error: Missing API key"
**Solución**: Verifica que añadiste la variable `YOUTUBE_API_KEY` en Settings → Environment Variables

### Error: "Playlist no encontrada"
**Causas posibles**:
1. Playlist es privada (debe ser pública)
2. ID incorrecto (verificar URL)

### Error: "Error de permisos"
**Solución**: En YouTube → Configuración de playlist → Cambiar a "Pública" o "No listada"

### Error: CORS
**Solución**: Verifica que la URL del worker es correcta en el frontend

---

## 📝 Mantenimiento

**Ninguno requerido** 🎉

- Worker se mantiene solo
- API Key no caduca (a menos que la borres)
- Cloudflare actualiza infraestructura automáticamente
- Sin servidor que mantener

---

## 🔄 Actualizar código del worker

Si necesitas modificar el worker en el futuro:

1. Editar `cloudflare-worker/youtube-proxy.js`
2. Dashboard → Workers → `youtube-proxy` → Quick Edit
3. Copiar y pegar código actualizado
4. Save and Deploy

---

## 📞 Soporte

**Si algo falla**, estas son las URLs oficiales:

- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **YouTube API Docs**: https://developers.google.com/youtube/v3
- **Dashboard Cloudflare**: https://dash.cloudflare.com
- **Google Cloud Console**: https://console.cloud.google.com

---

¡Listo! Una vez desplegado, avísame tu URL del worker y actualizo el frontend 🚀
