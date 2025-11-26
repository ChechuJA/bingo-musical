# Monetag Setup Guide - Bingo Musical

**Guía para activar Monetag como proveedor de publicidad complementario mientras esperas la aprobación de Google AdSense.**

---

## ¿Por qué Monetag?

- **Aprobación rápida**: No requiere tráfico previo ni aprobación lenta como AdSense
- **Monetización inmediata**: Empieza a generar ingresos desde el día 1
- **Complementario**: Funciona junto a AdSense (o como fallback si AdSense no se aprueba)
- **GDPR-compliant**: Se carga solo tras consentimiento del usuario (implementado en `consent.js`)

---

## ⚠️ Recomendaciones

### ✅ Hacer:
- Usa **solo formatos de banner** (728x90, 300x250, etc.) para mantener la experiencia limpia
- Coloca anuncios en los espacios ya previstos (AD SPACE #1-#4 en categorías)
- Monitorea el rendimiento con Lighthouse (LCP < 2.5s)
- Actualiza `cookies.html` y `privacy.html` con la política de Monetag

### ❌ Evitar:
- Popunders o formatos intrusivos (reducen la calidad percibida del sitio)
- Más de 2-3 anuncios por página (impacta SEO y experiencia)
- Cargar Monetag sin consentimiento del usuario (viola GDPR)

---

## 🚀 Pasos de Integración

### 1. Crear cuenta en Monetag

1. Ve a [Monetag.com](https://monetag.com) (o el portal de registro correspondiente)
2. Regístrate con tu email y dominio `bingomusicalgratis.es`
3. Verifica tu email y completa el perfil
4. Añade tu sitio web (dominio completo)

### 2. Obtener tu script tag

1. Accede al panel de Monetag
2. Ve a **"Zones"** o **"Tags"**
3. Crea una nueva zona (tipo: Banner 728x90 o 300x250)
4. Copia el script tag que Monetag genera, algo como:

```html
<script src="https://example-cdn.monetag.com/tag.js" data-zone="123456"></script>
```

### 3. Activar en Bingo Musical

#### Opción A: Editar `index.html` (y otras páginas)

Busca el bloque comentado al final de `index.html` (antes de `</body>`):

```html
<!-- External Ad Provider: Monetag (optional, commented out by default)
     Uncomment and configure with your Monetag script URL when ready.
     This script loads ONLY when user grants ads consent (GDPR-compliant).
<script>
  // Register Monetag ad provider (deferred + consent-gated)
  registerAdProvider({
    id: 'monetag',
    src: 'https://example-cdn.monetag.com/tag.js', // Replace with your Monetag script URL
    attrs: { 'data-zone': 'YOUR_ZONE_ID' }, // Add any required attributes
    onLoad: function() {
      console.log('Monetag loaded under ads consent');
      // Optional: Initialize Monetag after load if needed
    }
  });
  
  // If consent was already granted, load immediately
  if (typeof loadAdProvidersIfConsented === 'function') {
    loadAdProvidersIfConsented();
  }
</script>
-->
```

**Descomenta el bloque** y reemplaza:
- `src`: URL del script de Monetag (del paso 2)
- `data-zone`: Tu Zone ID de Monetag
- Añade cualquier otro atributo requerido en `attrs: {}`

#### Opción B: Crear snippet reutilizable

Crea `assets/js/monetag-init.js`:

```javascript
// Monetag initialization (loaded only after ads consent)
if (typeof registerAdProvider === 'function') {
  registerAdProvider({
    id: 'monetag',
    src: 'https://YOUR-MONETAG-CDN-URL.com/tag.js',
    attrs: { 'data-zone': 'YOUR_ZONE_ID' },
    onLoad: function() {
      console.log('Monetag loaded');
      // Optional init logic
    }
  });
  
  // Trigger load if consent already exists
  if (typeof loadAdProvidersIfConsented === 'function') {
    loadAdProvidersIfConsented();
  }
}
```

Luego incluye en cada página (después de `consent.js`):

```html
<script src="assets/js/monetag-init.js" defer></script>
```

### 4. Añadir placeholders de anuncios

En las páginas donde quieras mostrar anuncios de Monetag, añade divs con IDs específicos:

```html
<!-- Ejemplo en navidad.html -->
<div id="monetag-banner-1" style="margin: 2rem auto; text-align: center;">
  <!-- Monetag banner se insertará aquí tras consentimiento -->
</div>
```

Si Monetag requiere un script específico por zona, añádelo dentro del callback `onLoad`:

```javascript
onLoad: function() {
  // Ejemplo: inyectar código específico de Monetag por zona
  const container = document.getElementById('monetag-banner-1');
  if (container && typeof MonetizationTag !== 'undefined') {
    MonetizationTag.render(container, { zoneId: 'YOUR_ZONE_ID' });
  }
}
```

### 5. Actualizar políticas legales

Ya hecho en `cookies.html` y `privacy.html`, pero verifica:

- **cookies.html**: Menciona "proveedores externos" en la sección de cookies publicitarias
- **privacy.html**: Incluye nota sobre "proveedores adicionales" con enlace a sus políticas
- Añade enlace directo a la política de privacidad de Monetag si disponible

### 6. Probar en local

1. Abre `index.html` en el navegador
2. Abre DevTools → Console
3. Acepta cookies de publicidad en el banner
4. Verifica en la consola: `"Monetag loaded under ads consent"`
5. Comprueba en Network tab que el script de Monetag se cargó
6. Verifica que el anuncio se muestra correctamente

### 7. Desplegar a producción

```bash
git add .
git commit -m "feat(monetization): add Monetag as secondary ad provider"
git push origin main
```

GitHub Pages desplegará automáticamente en minutos.

---

## 📊 Monitoreo y Optimización

### Métricas clave (Panel de Monetag):
- **CPM**: Ingresos por 1,000 impresiones (espera 0.5-2€ inicialmente)
- **Fill Rate**: % de veces que se sirve un anuncio (objetivo: >80%)
- **CTR**: Click-through rate (no manipular, solo monitorear)

### Optimización:
1. **Ubica anuncios visibles**: Above the fold en páginas de alto tráfico
2. **Test A/B**: Prueba diferentes tamaños (300x250 suele rendir mejor que 728x90)
3. **Evita sobresaturación**: Máximo 3 anuncios por página
4. **Monitorea Core Web Vitals**: Si LCP > 2.5s, retrasa la carga de Monetag con `setTimeout`

### Migración a AdSense (cuando se apruebe):
1. Reduce gradualmente las zonas de Monetag
2. Reemplaza con AdSense Auto Ads en las mismas ubicaciones
3. Mantén Monetag como fallback en caso de que AdSense no llene el espacio (opcional)

---

## 🔧 Troubleshooting

### Monetag no carga:
- Verifica en Console que `registerAdProvider is a function`
- Confirma que `consent.js` se carga ANTES de tu script de Monetag
- Comprueba que aceptaste cookies de ads en el banner

### Anuncios no se muestran:
- Revisa el panel de Monetag: ¿la zona está activa?
- Inspecciona el div contenedor: ¿tiene dimensiones visibles?
- Verifica en Network tab: ¿se descargó el script correctamente?

### Impacto en performance:
- Usa Lighthouse: `Performance > Diagnostics > Defer offscreen images`
- Si LCP > 3s, añade `loading="lazy"` a imágenes o retrasa Monetag:

```javascript
onLoad: function() {
  setTimeout(() => {
    // Inicializar Monetag después de 2s
  }, 2000);
}
```

### GDPR compliance:
- El sistema actual carga Monetag solo tras consentimiento → ✅ OK
- Si recibes queja de usuario, verifica que el banner CMP se muestra correctamente
- Log de prueba: `console.log(localStorage.getItem('google_consent_v2'))`

---

## 🎯 Estrategia Recomendada

### Fase 1: Solo Monetag (ahora)
- Activa Monetag en 3-4 páginas clave (index, navidad, rock, generador)
- Usa solo banners (728x90 top, 300x250 sidebar si añades)
- Objetivo: 50-100€/mes con 5,000 visitas/mes

### Fase 2: AdSense aprobado (1-3 semanas)
- Reemplaza Monetag con AdSense Auto Ads
- Mantén Monetag en 1-2 posiciones como backup
- Objetivo: 200-500€/mes con 20,000 visitas/mes

### Fase 3: Optimización mixta (3-6 meses)
- Header Bidding con Prebid.js (avanzado)
- Monetag solo para tráfico no-EEA (menor CPM de AdSense)
- Afiliación Amazon (micrófonos karaoke, altavoces) en blog

---

## 📚 Recursos Adicionales

- [Monetag Documentation](https://monetag.com/docs) (si disponible)
- [Google Consent Mode v2](./GOOGLE-CMP-GUIDE.md)
- [AdSense Best Practices](https://support.google.com/adsense/answer/1346295)

---

**Última actualización**: 2025-11-27  
**Autor**: Bingo Musical Team  
**Contacto**: contacto@bingomusicalgratis.es
