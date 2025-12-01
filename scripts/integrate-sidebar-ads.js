/**
 * 🎯 SCRIPT DE INTEGRACIÓN MASIVA - SIDEBAR ADS
 * 
 * Integra anuncios laterales en todas las páginas HTML del proyecto.
 */

const fs = require('fs');
const path = require('path');

// Código HTML para los sidebars
const sidebarHTML = `
  <!-- 📢 SIDEBAR ADS - Anuncios laterales fijos -->
  
  <!-- Ad izquierdo (160x600 Skyscraper) -->
  <div class="sidebar-ad-container sidebar-ad-left">
    <div class="sidebar-ad-slot ad-format-skyscraper">
      <span class="sidebar-ad-label">Publicidad</span>
      <div id="sidebar-left-ad"></div>
    </div>
  </div>
  
  <!-- Ad derecho (160x600 Skyscraper) -->
  <div class="sidebar-ad-container sidebar-ad-right">
    <div class="sidebar-ad-slot ad-format-skyscraper">
      <span class="sidebar-ad-label">Publicidad</span>
      <div id="sidebar-right-ad"></div>
    </div>
  </div>
  
`;

// Scripts para inicializar los ads
const sidebarScripts = `
<!-- 📢 SIDEBAR ADS SCRIPT -->
<script src="/assets/js/sidebar-ads.js"><\/script>
<script>
  // Cargar ads de Monetag en los sidebars
  if (document.getElementById('sidebar-left-ad')) {
    SidebarAds.loadMonetagNative('sidebar-left-ad', '8655548');
  }
  
  if (document.getElementById('sidebar-right-ad')) {
    SidebarAds.loadMonetagNative('sidebar-right-ad', '8655550');
  }
<\/script>

`;

// Lista de archivos a actualizar
const files = [
  'pages/categories/navidad.html',
  'pages/categories/clasicos-pop.html',
  'pages/categories/pop-latino.html',
  'pages/categories/mix.html',
  'pages/categories/rock.html',
  'pages/categories/musica-espanol.html',
  'pages/categories/musica-ingles.html',
  'pages/categories/otono.html',
  'pages/categories/cumpleanos.html',
  'pages/tools/generador.html',
  'pages/tools/jugar.html',
  'pages/tools/online.html',
  'blog.html',
  'blog/como-organizar-bingo-musical.html',
  'blog/guia-categorias-bingo-musical.html',
  'blog/historia-bingo-musical.html',
  'blog/ideas-creativas-bingo-musical.html',
  'blog/playlist-navidad-villancicos.html',
  'blog/proximamente-novedades-bingo-musical.html'
];

let updated = 0;
let errors = 0;
let skipped = 0;

console.log('🔄 Integrando Sidebar Ads en todas las páginas...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Verificar si ya tiene sidebar ads
    if (content.includes('sidebar-ad-container')) {
      console.log(`ℹ️  ${file} - Ya tiene sidebar ads`);
      skipped++;
      return;
    }
    
    // 1. Añadir CSS en <head> si no está
    if (!content.includes('sidebar-ads.css')) {
      const cssLink = '  <link rel="stylesheet" href="/assets/css/sidebar-ads.css">';
      
      // Buscar después de styles.css
      const stylesIndex = content.indexOf('assets/css/styles.css');
      if (stylesIndex !== -1) {
        const lineEnd = content.indexOf('\n', stylesIndex);
        content = content.slice(0, lineEnd + 1) + cssLink + '\n' + content.slice(lineEnd + 1);
      }
    }
    
    // 2. Añadir contenedores después de <body>
    const bodyIndex = content.indexOf('<body>');
    if (bodyIndex !== -1) {
      const bodyEnd = content.indexOf('\n', bodyIndex);
      content = content.slice(0, bodyEnd + 1) + sidebarHTML + content.slice(bodyEnd + 1);
    } else {
      console.log(`⚠️  ${file} - No se encontró <body>`);
      errors++;
      return;
    }
    
    // 3. Añadir scripts antes de </body>
    const closingBodyIndex = content.lastIndexOf('</body>');
    if (closingBodyIndex !== -1) {
      content = content.slice(0, closingBodyIndex) + sidebarScripts + content.slice(closingBodyIndex);
    } else {
      console.log(`⚠️  ${file} - No se encontró </body>`);
      errors++;
      return;
    }
    
    // Guardar archivo
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file} - Sidebar ads integrados`);
    updated++;
    
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
    errors++;
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Actualizados: ${updated} archivos`);
console.log(`ℹ️  Ya tenían: ${skipped} archivos`);
console.log(`❌ Errores: ${errors} archivos`);
console.log(`\n🎯 Total procesado: ${files.length} archivos`);
