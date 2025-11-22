# Google Consent Mode v2 - CMP Implementation Guide

## 📋 Resumen

Se ha implementado una **Plataforma de Gestión del Consentimiento (CMP)** certificada por Google utilizando **Google Consent Mode v2**. Esto es obligatorio para cumplir con GDPR/RGPD y maximizar ingresos de AdSense en el Espacio Económico Europeo (EEE), Reino Unido y Suiza.

## ✅ ¿Qué se ha implementado?

### 1. **Google Funding Choices (CMP Certificada)**

Scripts oficiales de Google integrados en el `<head>`:

```html
<!-- Google Funding Choices (CMP Certified) -->
<script async src="https://fundingchoicesmessages.google.com/i/pub-9476968656644151?ers=1"></script>
<script>(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();</script>

<!-- Google AdSense Script -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9476968656644151" crossorigin="anonymous"></script>
```

**Importante**: El script de Funding Choices DEBE cargarse ANTES del script de AdSense para funcionar correctamente.

### 2. **Google Consent Mode v2** (`assets/js/consent.js`)

Características principales:
- ✅ Implementación completa de `gtag('consent')` API
- ✅ Estado por defecto: **DENIED** para todas las cookies publicitarias/analíticas
- ✅ Estado actualizado según elección del usuario
- ✅ Almacenamiento persistente en `localStorage` (clave: `google_consent_v2`)
- ✅ Espera de 500ms antes de cargar ads (`wait_for_update: 500`)

### 2. **Banner de Consentimiento con 2 Opciones**

Dos botones obligatorios según normativa:
1. **"Consentir"** - Acepta todas las cookies (ad_storage, analytics, personalización)
2. **"Gestionar opciones"** - Abre modal de gestión detallada

### 3. **Modal de Gestión Detallada**

Muestra 4 categorías de cookies:
- 🔒 **Esenciales** (siempre activas) - funcionalidad y seguridad
- 📊 **Análisis y Rendimiento** - Google Analytics
- 🎯 **Publicidad Personalizada** - Google AdSense
- 👤 **Personalización** - preferencias del usuario

Opciones en modal:
- **"Aceptar Todo"** - Igual que "Consentir"
- **"Solo Esenciales"** - Rechaza todas menos las esenciales

### 4. **Link en Footer**

Añadido enlace "⚙️ Configuración de Cookies" en el footer que permite al usuario cambiar sus preferencias en cualquier momento (requisito GDPR).

## 🎨 Diseño

### Banner (inferior de la página)
- Posición: Fixed bottom
- Fondo: Blanco con borde superior color accent
- Box shadow elevado (z-index: 9999)
- Responsive: Botones full-width en móvil

### Modal
- Overlay oscuro semi-transparente
- Contenido centrado con scroll
- Botón de cierre (✕) en esquina superior derecha
- Diseño limpio con opciones claramente diferenciadas

## 🔧 Cómo Funciona

### Flujo de Usuario

```
Usuario visita sitio
    ↓
¿Consentimiento almacenado?
    ├─ Sí → Aplica preferencias guardadas
    └─ No → Muestra banner CMP
         ↓
    Usuario hace clic
         ├─ "Consentir" → Acepta todo + Oculta banner
         ├─ "Gestionar opciones" → Abre modal
         │       ↓
         │   En modal:
         │       ├─ "Aceptar Todo" → Acepta todo + Cierra modal
         │       └─ "Solo Esenciales" → Solo cookies necesarias + Cierra modal
         └─ Preferencia guardada en localStorage
```

### Estados de Consentimiento

#### Estado Inicial (Default)
```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',           // ❌ Sin cookies de ads
  'ad_user_data': 'denied',         // ❌ Sin datos de usuario para ads
  'ad_personalization': 'denied',   // ❌ Sin personalización de ads
  'analytics_storage': 'denied',    // ❌ Sin analytics
  'functionality_storage': 'granted', // ✅ Funcionalidad OK
  'personalization_storage': 'denied', // ❌ Sin preferencias
  'security_storage': 'granted'      // ✅ Seguridad OK
});
```

#### Si Usuario Acepta Todo
```javascript
gtag('consent', 'update', {
  'ad_storage': 'granted',          // ✅ Cookies de ads permitidas
  'ad_user_data': 'granted',        // ✅ Datos de usuario OK
  'ad_personalization': 'granted',  // ✅ Personalización OK
  'analytics_storage': 'granted',   // ✅ Analytics OK
  'personalization_storage': 'granted' // ✅ Preferencias OK
});
```

#### Si Usuario Rechaza (Solo Esenciales)
```javascript
// Mantiene estado 'denied' → Solo cookies esenciales
```

## 📁 Archivos Modificados/Creados

### Nuevos Archivos
- **`assets/js/consent.js`** (219 líneas)
  - Lógica completa del CMP
  - Integración con Google Consent Mode v2
  - Gestión de eventos y almacenamiento

### Archivos Modificados
- **`assets/css/styles.css`**
  - Estilos para `.google-cmp-banner`
  - Estilos para `.consent-modal`
  - Media queries responsive
  
- **`index.html`**
  - Banner CMP HTML
  - Modal de gestión HTML
  - Link en footer para configuración
  - Carga de `consent.js` ANTES de `app.js`

## 🚀 Próximos Pasos

### 1. **Aplicar a Todas las Páginas**

Necesitas añadir el mismo código a TODAS tus páginas HTML:
- `jugar.html`
- `generador.html`
- `navidad.html`, `rock.html`, etc. (todas las categorías)
- `faq.html`, `legal.html`, `privacy.html`, `cookies.html`
- `blog.html` y posts del blog

**Componentes a añadir:**
1. Cargar `<script src="assets/js/consent.js"></script>` (antes de otros scripts)
2. Añadir HTML del banner CMP (antes del cierre de `</body>`)
3. Añadir HTML del modal
4. Añadir link en footer

### 2. **Actualizar Política de Cookies** (`cookies.html`)

Añade información sobre:
- Google Consent Mode v2
- Tipos de cookies que usas (esenciales, analytics, ads, personalización)
- Cómo gestionar preferencias (link al modal)
- Lista de partners (Google AdSense)
- Duración de las cookies

### 3. **Actualizar Política de Privacidad** (`privacy.html`)

Menciona:
- Uso de Google AdSense y sus cookies
- Google Consent Mode v2 para gestión de consentimiento
- Derechos del usuario (acceso, rectificación, supresión, portabilidad)
- Contacto: contacto@bingomusicalgratis.es

### 4. **Verificar en Google AdSense**

Una vez desplegado:
1. Ve a tu cuenta de AdSense
2. Navega a **"Privacidad y mensajería"**
3. Verifica que detecta el CMP correctamente
4. Comprueba que el estado de consentimiento se actualiza

### 5. **Probar en Diferentes Regiones**

Prueba el comportamiento en:
- ✅ EEA/UE (debe mostrar banner)
- ✅ Reino Unido (debe mostrar banner)
- ✅ Suiza (debe mostrar banner)
- ⚠️ Resto del mundo (opcional, actualmente muestra para todos)

## 🔍 Detección de Región

**IMPORTANTE:** Actualmente la función `isEEAUser()` retorna `true` para todos los usuarios (enfoque seguro).

Para implementar detección real:

### Opción 1: Geolocalización JavaScript
```javascript
function isEEAUser() {
  // Usar API de geolocalización
  const eeaCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 
    'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 
    'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'IS', 'LI', 'NO'];
  
  // Detectar via IP o Intl API
  const userCountry = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // ... lógica de detección
}
```

### Opción 2: Servidor (Recomendado)
```javascript
// En tu servidor (GitHub Pages no soporta esto, necesitarías Cloudflare Workers)
function isEEAUser() {
  // Detectar país via headers de IP
  const country = request.headers['cf-ipcountry']; // Cloudflare
  return EEA_COUNTRIES.includes(country);
}
```

### Opción 3: Servicio de Terceros
Usar servicios como:
- **ipapi.co** (gratis hasta 30k req/mes)
- **ipgeolocation.io**
- **Cloudflare Workers** (detecta automáticamente)

## 🧪 Testing Local

Para probar localmente:

```bash
# Opción 1: Live Server (VS Code)
# Right-click en index.html → "Open with Live Server"

# Opción 2: Python HTTP Server
python -m http.server 8000

# Opción 3: Node http-server
npx http-server -p 8000
```

Luego abre: `http://localhost:8000/index.html`

### Cosas a probar:
1. ✅ Banner aparece en primera visita
2. ✅ Clic en "Consentir" → Banner desaparece, preferencia guardada
3. ✅ Clic en "Gestionar opciones" → Modal se abre
4. ✅ En modal: "Aceptar Todo" funciona
5. ✅ En modal: "Solo Esenciales" funciona
6. ✅ Recarga página → Preferencia persiste (no vuelve a mostrar banner)
7. ✅ Footer link → Reabre modal
8. ✅ Responsive en móvil (botones full-width)

### Debug en consola:
```javascript
// Ver consentimiento almacenado
localStorage.getItem('google_consent_v2')

// Ver dataLayer (Google Consent Mode)
window.dataLayer

// Resetear consentimiento (para re-probar)
window.googleCMP.reset()

// Abrir modal manualmente
window.googleCMP.manage()
```

## 📊 Monitoreo de Consentimiento

Una vez en producción, puedes ver en Google AdSense:
- **Tasa de consentimiento**: % de usuarios que aceptan ads
- **Ingresos con vs sin consentimiento**: Comparativa de CPM
- **Regiones problemáticas**: Países con baja tasa de consentimiento

**Objetivo:** Tasa de consentimiento > 70% en EEA

## ⚠️ Advertencias Importantes

### 1. **No Bloquear AdSense Script**
El script de AdSense DEBE cargarse incluso sin consentimiento:
```html
<!-- SÍ - Correcto -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9476968656644151"></script>

<!-- NO - Incorrecto (no bloquear con if/consent) -->
```

Google Consent Mode se encarga de controlar QUÉ datos se envían, pero el script debe estar presente.

### 2. **Orden de Carga**
```html
<!-- 1. Primero: Consent Mode (consent.js) -->
<script src="assets/js/consent.js"></script>

<!-- 2. Después: AdSense -->
<script async src="...adsbygoogle.js..."></script>

<!-- 3. Último: App logic -->
<script src="assets/js/app.js"></script>
```

### 2. **Orden de Carga**
```html
<!-- 1. Primero: Meta tag AdSense -->
<meta name="google-adsense-account" content="ca-pub-9476968656644151">

<!-- 2. Segundo: Google Funding Choices (CMP) -->
<script async src="https://fundingchoicesmessages.google.com/i/pub-9476968656644151?ers=1"></script>
<script>(function() {/* signal googlefc Present */})();</script>

<!-- 3. Tercero: AdSense Script -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9476968656644151" crossorigin="anonymous"></script>

<!-- 4. Después del body: Consent Mode -->
<script src="assets/js/consent.js"></script>

<!-- 5. Último: App logic -->
<script src="assets/js/app.js"></script>
```

### 3. **No Usar `defer` en consent.js**
El script de consentimiento NO debe tener `defer` ni `async` para que se ejecute inmediatamente.

### 4. **Compatibilidad con TCF 2.0**
Si en el futuro quieres usar IAB TCF 2.0 (Transparency & Consent Framework), esta implementación es compatible y se puede ampliar.

## 🆘 Troubleshooting

### Banner no aparece
- ✅ Verifica que `consent.js` se carga correctamente (consola de red)
- ✅ Comprueba que `hidden` se quita en `showConsentBanner()`
- ✅ Revisa consola JavaScript por errores

### Consentimiento no persiste
- ✅ Verifica que localStorage no está bloqueado
- ✅ Comprueba que `saveConsent()` se llama
- ✅ Inspecciona localStorage en DevTools

### Ads no se muestran tras consentir
- ✅ Espera unos segundos (ads tardan en cargar)
- ✅ Verifica que `gtag('consent', 'update')` se llamó
- ✅ Revisa AdSense dashboard (puede tardar 24h en activarse)

### Modal no se cierra
- ✅ Verifica event listeners en botones
- ✅ Comprueba que `hideManageOptions()` funciona
- ✅ Revisa z-index de modal vs banner

## 📞 Soporte

Si tienes dudas:
1. Revisa la documentación de Google: [Consent Mode v2](https://support.google.com/analytics/answer/9976101)
2. Consulta AdSense Help: [Mensaje de consentimiento](https://support.google.com/adsense/answer/10863423)
3. Contacta con soporte de AdSense

## ✨ Beneficios de Esta Implementación

✅ **Cumplimiento Legal**: GDPR/RGPD Article 6 & 7
✅ **Máximos Ingresos**: No pierdes revenue en EEA
✅ **Experiencia Usuario**: UI clara y profesional
✅ **Flexibilidad**: Usuario puede cambiar preferencias cuando quiera
✅ **Escalable**: Fácil de aplicar a futuras páginas
✅ **Sin Dependencias**: No requiere librerías externas
✅ **Lightweight**: Menos de 10KB de código adicional

---

**Autor**: Bingo Musical Team
**Fecha**: Noviembre 2025
**Versión**: 1.0.0
