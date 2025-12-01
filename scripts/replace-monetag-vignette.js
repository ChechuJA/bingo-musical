/**
 * 🎯 REPLACE MONETAG WITH VIGNETTE - Todas las páginas
 * 
 * Reemplaza Monetag Native Banners con Vignette Banners en todas las páginas
 */

const fs = require('fs');
const path = require('path');

// Código viejo de Monetag
const monetagCode = `<!-- 📢 SIDEBAR ADS SCRIPT -->
<script src="/assets/js/sidebar-ads.js"></script>
<script>
  // Cargar ads de Monetag en los sidebars
  if (document.getElementById('sidebar-left-ad')) {
    SidebarAds.loadMonetagNative('sidebar-left-ad', '8655548');
  }
  
  if (document.getElementById('sidebar-right-ad')) {
    SidebarAds.loadMonetagNative('sidebar-right-ad', '8655550');
  }
</script>`;

// Código nuevo de Vignette
const vignetteCode = `<!-- 📢 SIDEBAR ADS SCRIPT -->
<script src="/assets/js/sidebar-ads.js"></script>
<script>
  // Cargar Vignette Banner en los sidebars
  // Zone ID: 10264374
  SidebarAds.loadVignetteBanner('sidebar-left', '10264374');
  SidebarAds.loadVignetteBanner('sidebar-right', '10264374');
</script>`;

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

console.log('🎨 Reemplazando Monetag con Vignette en todas las páginas...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Verificar si tiene el código de Monetag
    if (content.includes(monetagCode)) {
      content = content.replace(monetagCode, vignetteCode);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${file} - Vignette integrado`);
      updated++;
    } else if (content.includes('SidebarAds.loadMonetagNative')) {
      // Si tiene una variante de Monetag, reemplazarla
      content = content.replace(
        /<!-- 📢 SIDEBAR ADS SCRIPT -->[\s\S]*?<\/script>/,
        vignetteCode
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${file} - Vignette integrado (variante)`);
      updated++;
    } else if (content.includes('sidebar-ad-container')) {
      console.log(`ℹ️  ${file} - Ya tiene sidebars pero sin Monetag (saltado)`);
    } else {
      console.log(`⚠️  ${file} - No tiene sidebars ads`);
    }
    
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
    errors++;
  }
});

console.log(`\n✨ RESUMEN:`);
console.log(`✅ Actualizados: ${updated} archivos`);
console.log(`❌ Errores: ${errors} archivos`);
console.log(`\n🎨 Vignette Banner Zone ID: 10264374`);
