# 📢 Guía de Implementación - Anuncios Laterales (Sidebar Ads)

## 🎯 Objetivo

Implementar anuncios laterales fijos (similares a Speedtest.net) que permanecen visibles mientras el usuario navega por la web, maximizando las impresiones publicitarias sin ser invasivos.

## ✅ Implementado en

- ✅ `index.html` (homepage)
- ⏳ Pendiente: páginas de categorías, tools, blog

## 📐 Formatos de Anuncios Soportados

### Sidebar (Vertical)
- **160x600** - Skyscraper (estándar, más común)
- **300x600** - Half Page (pantallas grandes >1600px)
- **300x250** - Medium Rectangle (stacked, se pueden poner varios)

### Top Banner (Horizontal)
- **728x90** - Leaderboard (tablets y desktop)
- **970x90** - Super Leaderboard (pantallas grandes)
- **320x100** - Mobile Banner (móviles)

## 🎨 Diseño Responsive

### Desktop Grande (>1600px)
- ✅ Sidebars izquierdo y derecho visibles (300x600)
- ✅ Contenido centrado con padding lateral

### Desktop Mediano (1200px - 1600px)
- ✅ Ambos sidebars visibles (160x600)
- ✅ Contenido ajustado

### Desktop Pequeño (900px - 1200px)
- ✅ Solo sidebar derecho visible
- ❌ Sidebar izquierdo oculto

### Tablet/Móvil (<900px)
- ❌ Sidebars ocultos
- ✅ Banners horizontales entre secciones

## 🛠️ Archivos Creados

### CSS
**`assets/css/sidebar-ads.css`** (270 líneas)
- Estilos para contenedores fijos
- Formatos de ad (skyscraper, half-page, leaderboard)
- Responsive breakpoints
- Animaciones de entrada
- Modo oscuro

### JavaScript
**`assets/js/sidebar-ads.js`** (200 líneas)
- Comportamiento sticky inteligente
- Detección de scroll y footer
- Integración con AdSense
- Integración con Monetag
- API pública `window.SidebarAds`

## 📝 Integración en Otras Páginas

### Paso 1: Añadir CSS en `<head>`

```html
<head>
  ...
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="stylesheet" href="/assets/css/sidebar-ads.css">
  ...
</head>
```

### Paso 2: Añadir Contenedores después de `<body>`

```html
<body>
  <!-- Sidebar izquierdo -->
  <div class="sidebar-ad-container sidebar-ad-left">
    <div class="sidebar-ad-slot ad-format-skyscraper">
      <span class="sidebar-ad-label">Publicidad</span>
      <div id="sidebar-left-ad"></div>
    </div>
  </div>
  
  <!-- Sidebar derecho -->
  <div class="sidebar-ad-container sidebar-ad-right">
    <div class="sidebar-ad-slot ad-format-skyscraper">
      <span class="sidebar-ad-label">Publicidad</span>
      <div id="sidebar-right-ad"></div>
    </div>
  </div>
  
  <!-- Tu contenido normal -->
  <div id="app">...</div>
```

### Paso 3: Añadir Scripts antes de `</body>`

```html
  <!-- Cargar script de sidebar ads -->
  <script src="/assets/js/sidebar-ads.js"></script>
  
  <script>
    // Opción A: Monetag Native Banners
    SidebarAds.loadMonetagNative('sidebar-left-ad', '8655548');
    SidebarAds.loadMonetagNative('sidebar-right-ad', '8655550');
    
    // Opción B: Google AdSense (comentado, usar si prefieres AdSense)
    // SidebarAds.loadAdSense('sidebar-left-ad', 'ca-pub-9476968656644151', 'SLOT_ID_1', 'vertical');
    // SidebarAds.loadAdSense('sidebar-right-ad', 'ca-pub-9476968656644151', 'SLOT_ID_2', 'vertical');
  </script>
</body>
```

## 🎯 Configuración de Zone IDs

### Monetag - Native Banners

Necesitas crear **2 Native Banners** en Monetag:

1. **Panel Monetag** → Zones → Create New Zone
2. **Format**: Native Banner
3. **Size**: 
   - Desktop: 160x600 (Skyscraper)
   - Large screens: 300x600 (Half Page)
4. **Position**: Sidebar
5. **Copy Zone ID** y reemplázalo en el código

**Zonas actuales** (ejemplo, reemplaza con las tuyas):
- Sidebar izquierdo: `8655548`
- Sidebar derecho: `8655550`

### AdSense - Display Ads (Alternativa)

Si prefieres usar AdSense:

1. **Google AdSense** → Anuncios → Por unidad de anuncio
2. **Crear**: Anuncio gráfico
3. **Tamaño**: Responsive o Fixed (160x600)
4. **Nombre**: "Sidebar Left" / "Sidebar Right"
5. **Copiar código** y extraer `data-ad-slot`

## 🎨 Personalización

### Cambiar Posición Vertical

Edita en `sidebar-ads.css`:

```css
.sidebar-ad-container {
  top: 120px; /* Cambiar offset desde arriba */
}
```

### Mostrar Solo Después de Scroll

Edita en `sidebar-ads.js`:

```javascript
const CONFIG = {
  showAdsAfterScroll: 200, // Mostrar después de 200px de scroll
  ...
}
```

### Habilitar Botón de Cierre

⚠️ **No recomendado** (reduce impresiones), pero disponible:

```javascript
const CONFIG = {
  enableCloseButton: true,
  ...
}
```

Y añade botón en HTML:

```html
<div class="sidebar-ad-slot">
  <button class="sidebar-ad-close">✕</button>
  <span class="sidebar-ad-label">Publicidad</span>
  <div id="sidebar-left-ad"></div>
</div>
```

### Cambiar Formato (300x600 en vez de 160x600)

Edita clase del slot:

```html
<!-- De: -->
<div class="sidebar-ad-slot ad-format-skyscraper">

<!-- A: -->
<div class="sidebar-ad-slot ad-format-half-page">
```

Y ajusta breakpoints en CSS si es necesario.

## 📊 Estrategia de Monetización

### Combinación Recomendada

1. **Homepage (index.html)**:
   - Sidebars: Monetag Native Banners (160x600)
   - Top: AdSense horizontal (728x90)
   - Mid-content: AdSense responsive
   - Footer: Balanced Stack (In-Page + Vignette)

2. **Páginas de Categorías**:
   - Sidebars: Monetag Native Banners
   - Entre secciones: AdSense
   - Al final: Balanced Stack

3. **Blog**:
   - Sidebars: AdSense (mejor CTR en contenido editorial)
   - In-content: AdSense responsive cada 3 párrafos

4. **Páginas de Herramientas**:
   - Sidebars: Monetag
   - Sin ads en área de interacción (generador)

### Ingresos Esperados

**Sidebar Ads** (impresiones constantes):
- **CPM Monetag Native**: $1.50 - $4.00
- **CPM AdSense Display**: $2.00 - $8.00
- **Impresiones**: 100% mientras el usuario está en la página

**Comparativa**:
- Pop-unders: Alta conversión pero 1 impresión por sesión
- Sidebars: Baja conversión pero impresión continua
- **Resultado**: Complementarios, no excluyentes

## 🧪 Testing

### Verificar Implementación

1. **Abrir página en navegador**
2. **Revisar consola** (F12):
   ```
   ✅ Sidebar ads inicializados
   ```
3. **Verificar elementos**:
   - Sidebars visibles en desktop (>1200px)
   - Ocultos en móvil (<900px)
   - Ads cargados en los divs
4. **Hacer scroll**:
   - Sidebars permanecen fijos
   - Se detienen al llegar al footer
5. **Redimensionar ventana**:
   - Responsive funciona correctamente

### Debugging

Si los ads no cargan:

```javascript
// Verificar si el script cargó
console.log(window.SidebarAds); // Debe mostrar el objeto

// Verificar elementos DOM
console.log(document.querySelector('.sidebar-ad-left')); // Debe existir
console.log(document.getElementById('sidebar-left-ad')); // Debe existir

// Cargar ad manualmente
SidebarAds.loadMonetagNative('sidebar-left-ad', '8655548');
```

## 📱 Compatibilidad Móvil

Los sidebars se **ocultan automáticamente** en móviles (<900px) para no molestar la experiencia del usuario.

En su lugar, puedes añadir banners horizontales entre secciones:

```html
<div class="top-banner-container">
  <div class="top-banner-slot ad-format-leaderboard">
    <span class="sidebar-ad-label">Publicidad</span>
    <div id="mobile-banner-1"></div>
  </div>
</div>
```

## 🚀 Próximos Pasos

### Inmediato
1. ✅ Crear Native Banners en Monetag (2 zonas)
2. ✅ Copiar Zone IDs reales
3. ✅ Reemplazar en `index.html` y otras páginas
4. ✅ Desplegar y verificar que cargan correctamente

### Corto Plazo (1-2 días)
1. ⏳ Integrar sidebars en páginas de categorías (9 páginas)
2. ⏳ Integrar en páginas de tools (3 páginas)
3. ⏳ Integrar en blog (6 páginas)
4. ⏳ A/B test: Monetag vs AdSense en sidebars

### Medio Plazo (1 semana)
1. ⏳ Analizar CPM y CTR de sidebars
2. ⏳ Optimizar posicionamiento (top offset)
3. ⏳ Añadir banners horizontales en móvil
4. ⏳ Crear más Native Banners para rotación

## 📈 Métricas a Trackear

- **Impresiones por sesión** (sidebars vs otros formatos)
- **CPM promedio** (Monetag Native Banners)
- **Viewability rate** (% visible en viewport)
- **Bounce rate** (verificar que no aumenta)
- **Session duration** (debe mantenerse o aumentar)

## 🎓 Recursos

- [Monetag Native Banner Docs](https://monetag.com/native-banner/)
- [AdSense Display Ads Best Practices](https://support.google.com/adsense/answer/9261805)
- [IAB Standard Ad Unit Portfolio](https://www.iab.com/newadportfolio/)

## 💡 Tips

1. **No sobrecargar**: 2 sidebars + 2-3 banners = suficiente
2. **Priorizar UX**: Si el bounce rate aumenta >10%, reducir ads
3. **A/B testing**: Probar diferentes posiciones y formatos
4. **Viewability**: Asegurar que ads estén al menos 50% visibles
5. **Mobile-first**: Verificar experiencia móvil siempre

---

**Creado**: 2025-12-01  
**Autor**: Bingo Musical Team  
**Versión**: 1.0
