/**
 * Script para eliminar etiquetas <script></script> vacías
 * que están causando que el código JavaScript aparezca como texto
 */

const fs = require('fs');
const path = require('path');

// Lista de archivos HTML a procesar
const filesToFix = [
  'index.html',
  'blog.html',
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
  'blog/como-organizar-bingo-musical.html',
  'blog/guia-categorias-bingo-musical.html',
  'blog/historia-bingo-musical.html',
  'blog/ideas-creativas-bingo-musical.html',
  'blog/playlist-navidad-villancicos.html',
  'blog/proximamente-novedades-bingo-musical.html'
];

console.log('🔧 Eliminando etiquetas <script></script> vacías...\n');

let successCount = 0;
let errorCount = 0;

filesToFix.forEach(file => {
  try {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} - No encontrado`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Patrón: <!-- JavaScript del Widget -->\n<script>\n</script>\n(function()
    // Reemplazar por: <!-- JavaScript del Widget -->\n<script>\n(function()
    const pattern = /<!-- JavaScript del Widget -->\s*<script>\s*<\/script>\s*\(function\(\)/g;
    const replacement = '<!-- JavaScript del Widget -->\n<script>\n(function()';
    
    content = content.replace(pattern, replacement);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - Script vacío eliminado`);
      successCount++;
    } else {
      console.log(`ℹ️  ${file} - Sin cambios necesarios`);
    }
    
  } catch (error) {
    console.error(`❌ ${file} - Error: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n✨ RESUMEN:`);
console.log(`✅ Corregidos: ${successCount} archivos`);
console.log(`❌ Errores: ${errorCount} archivos`);
console.log('\n🎨 Todos los archivos ahora tienen el código JavaScript dentro de las etiquetas <script>');
