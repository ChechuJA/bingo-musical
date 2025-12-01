/**
 * Script para añadir enlaces a juegos.bingomusicalgratis.es en todas las páginas
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
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

console.log('🎮 Añadiendo enlaces a juegos.bingomusicalgratis.es...\n');

let successCount = 0;
let errorCount = 0;

filesToUpdate.forEach(file => {
  try {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} - No encontrado`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changes = 0;
    
    // 1. Añadir en navegación (después de Categorías, antes de Blog)
    const navPattern1 = /(<li><a href="[^"]*#categorias"[^>]*>📚 Categorías<\/a><\/li>)\s*(<li><a href="[^"]*blog\.html">📝 Blog<\/a><\/li>)/;
    if (navPattern1.test(content)) {
      content = content.replace(
        navPattern1,
        '$1\n            <li><a href="https://juegos.bingomusicalgratis.es" target="_blank" rel="noopener noreferrer" style="color: #e74c3c; font-weight: 700;">🎮 Juegos Online</a></li>\n            $2'
      );
      changes++;
    }
    
    // 2. Añadir en footer (después de Contacto, antes de Aviso Legal)
    const footerPattern = /(<a href="[^"]*contacto\.html">Contacto<\/a>)\s*(<a href="[^"]*legal\.html">Aviso Legal<\/a>)/;
    if (footerPattern.test(content)) {
      content = content.replace(
        footerPattern,
        '$1\n          <a href="https://juegos.bingomusicalgratis.es" target="_blank" rel="noopener noreferrer" style="color: #e74c3c; font-weight: 600;">🎮 Juegos Online</a>\n          $2'
      );
      changes++;
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - ${changes} enlace(s) añadido(s)`);
      successCount++;
    } else {
      console.log(`ℹ️  ${file} - Sin cambios (ya tiene enlaces o estructura diferente)`);
    }
    
  } catch (error) {
    console.error(`❌ ${file} - Error: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n✨ RESUMEN:`);
console.log(`✅ Actualizados: ${successCount} archivos`);
console.log(`❌ Errores: ${errorCount} archivos`);
console.log('\n🎮 Enlaces a juegos.bingomusicalgratis.es añadidos en navegación y footer');
