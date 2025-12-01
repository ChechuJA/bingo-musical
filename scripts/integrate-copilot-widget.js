/**
 * 🤖 Integra Copilot Widget en todos los HTML
 * 
 * Este script inserta el código del widget de Bingo Bot antes de </body>
 * en todas las páginas principales (excepto legales y offline).
 * 
 * El widget es completamente responsivo:
 * - Desktop: 64x64px botón, 380x600px chat
 * - Mobile: 56x56px botón, fullscreen chat
 * - position: fixed - siempre visible abajo-derecha
 */

const fs = require('fs');
const path = require('path');

// Leer el código del widget
const widgetPath = path.join(process.cwd(), '..', 'assets', 'js', 'copilot-widget.html');
const widgetCode = fs.readFileSync(widgetPath, 'utf-8');

// Archivos donde integrar el widget
const filesToIntegrate = [
  // Homepage
  'index.html',
  
  // Categorías (9 páginas)
  'pages/categories/navidad.html',
  'pages/categories/clasicos-pop.html',
  'pages/categories/pop-latino.html',
  'pages/categories/mix.html',
  'pages/categories/rock.html',
  'pages/categories/musica-espanol.html',
  'pages/categories/musica-ingles.html',
  'pages/categories/otono.html',
  'pages/categories/cumpleanos.html',
  
  // Herramientas (3 páginas)
  'pages/tools/generador.html',
  'pages/tools/jugar.html',
  'pages/tools/online.html',
  
  // Blog (7 páginas)
  'blog.html',
  'blog/como-organizar-bingo-musical.html',
  'blog/guia-categorias-bingo-musical.html',
  'blog/historia-bingo-musical.html',
  'blog/ideas-creativas-bingo-musical.html',
  'blog/playlist-navidad-villancicos.html',
  'blog/proximamente-novedades-bingo-musical.html'
];

console.log('🤖 Integrando Copilot Widget en todos los HTML...\n');

let totalIntegrated = 0;
let totalSkipped = 0;

filesToIntegrate.forEach(file => {
  const filePath = path.join(process.cwd(), '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - No encontrado`);
    totalSkipped++;
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar si ya tiene el widget
  if (content.includes('copilot-widget') || content.includes('Bingo Bot')) {
    console.log(`ℹ️  ${file} - Ya tiene el widget`);
    totalSkipped++;
    return;
  }
  
  // Insertar el widget antes de </body>
  const bodyClosePattern = /(<\/body>)/;
  
  if (content.match(bodyClosePattern)) {
    content = content.replace(bodyClosePattern, `\n${widgetCode}\n$1`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file} - Widget integrado`);
    totalIntegrated++;
  } else {
    console.log(`❌ ${file} - No tiene etiqueta </body>`);
    totalSkipped++;
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Integrados: ${totalIntegrated} archivos`);
console.log(`ℹ️  Omitidos: ${totalSkipped} archivos`);
console.log(`\n🎯 El widget ahora está en todas las páginas principales`);
console.log(`📱 Completamente responsivo: Desktop, Tablet, Mobile`);
console.log(`🔧 Posición: fixed bottom-right, siempre visible`);
console.log(`\n⚙️  PRÓXIMO PASO: Configurar Bot ID y Direct Line Secret en el widget`);
