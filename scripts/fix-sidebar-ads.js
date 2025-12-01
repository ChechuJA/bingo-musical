/**
 * 🎯 FIX SIDEBAR ADS - Arregla el código de Monetag en todas las páginas
 */

const fs = require('fs');
const path = require('path');

// Código correcto a buscar y reemplazar
const oldCode = `<!-- 📢 SIDEBAR ADS SCRIPT -->
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

const newCode = `<!-- 📢 SIDEBAR ADS SCRIPT -->
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

const files = [
  'index.html',
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

let fixed = 0;
let notFound = 0;

console.log('🔧 Arreglando Monetag en todas las páginas...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Buscar y reemplazar código antiguo
    if (content.includes(oldCode)) {
      content = content.replace(oldCode, newCode);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${file} - Monetag actualizado`);
      fixed++;
    } else {
      console.log(`ℹ️  ${file} - No necesita actualización`);
      notFound++;
    }
    
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Arreglados: ${fixed} archivos`);
console.log(`ℹ️  Sin cambios: ${notFound} archivos`);
