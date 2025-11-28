/**
 * 🔄 Restaura Lucky Tag (Hot Tag - zona 10241767) a páginas internas
 * 
 * SOLO añade Lucky Tag a páginas internas donde se permite monetización agresiva.
 * NO modifica index.html (homepage debe permanecer limpia).
 * 
 * El Lucky Tag es el script Monetag más invasivo (abre popups), pero genera más ingresos.
 * Usuario confirmó que está OK en páginas internas: "cuando entras dentro no me importa que este eso mas agresivo"
 */

const fs = require('fs');
const path = require('path');

// Lucky Tag para restaurar (Hot Tag - zona 10241767)
const luckyTagScript = `  <!-- Monetag: Lucky Tag (Hot Tag - zona 10241767) -->
  <script>(function(s){s.dataset.zone='10241767',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
  
`;

// Archivos donde RESTAURAR Lucky Tag (páginas internas)
const filesToRestore = [
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
  
  // Legal (6 páginas)
  'pages/legal/about.html',
  'pages/legal/contacto.html',
  'pages/legal/cookies.html',
  'pages/legal/faq.html',
  'pages/legal/legal.html',
  'pages/legal/privacy.html',
  
  // Blog (6 artículos)
  'blog/como-organizar-bingo-musical.html',
  'blog/guia-categorias-bingo-musical.html',
  'blog/historia-bingo-musical.html',
  'blog/ideas-creativas-bingo-musical.html',
  'blog/playlist-navidad-villancicos.html',
  'blog/proximamente-novedades-bingo-musical.html',
  
  // Página de descarga intermedia (máxima monetización)
  'pages/download.html'
];

console.log('🔄 Restaurando Lucky Tag a páginas internas...\n');

let totalRestored = 0;

filesToRestore.forEach(file => {
  const filePath = path.join(process.cwd(), '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - No encontrado`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar si ya tiene Lucky Tag
  if (content.includes("s.dataset.zone='10241767'")) {
    console.log(`ℹ️  ${file} - Ya tiene Lucky Tag`);
    return;
  }
  
  // Buscar el bloque de Monetag Scripts y añadir Lucky Tag al principio
  const monetagScriptsPattern = /(\s*<!-- Monetag Scripts -->\s*\n)/;
  
  if (content.match(monetagScriptsPattern)) {
    // Insertar Lucky Tag después del comentario "<!-- Monetag Scripts -->"
    content = content.replace(
      monetagScriptsPattern,
      `$1${luckyTagScript}`
    );
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file} - Lucky Tag restaurado`);
    totalRestored++;
  } else {
    console.log(`⚠️  ${file} - No tiene bloque Monetag Scripts`);
  }
});

console.log(`\n✅ Lucky Tag restaurado en ${totalRestored} archivos`);
console.log(`\n📌 IMPORTANTE: index.html NO fue modificado (permanece sin Lucky Tag para UX limpia)`);
