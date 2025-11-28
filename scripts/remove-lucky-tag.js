const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'blog.html',
  'pages/categories/navidad.html',
  'pages/categories/clasicos-pop.html',
  'pages/categories/pop-latino.html',
  'pages/categories/rock.html',
  'pages/categories/musica-espanol.html',
  'pages/categories/musica-ingles.html',
  'pages/categories/otono.html',
  'pages/categories/cumpleanos.html',
  'pages/categories/mix.html',
  'pages/tools/generador.html',
  'pages/tools/jugar.html',
  'pages/tools/online.html',
  'pages/legal/about.html',
  'pages/legal/contacto.html',
  'pages/legal/cookies.html',
  'pages/legal/faq.html',
  'pages/legal/legal.html',
  'pages/legal/privacy.html',
  'blog/como-organizar-bingo-musical.html',
  'blog/guia-categorias-bingo-musical.html',
  'blog/historia-bingo-musical.html',
  'blog/ideas-creativas-bingo-musical.html',
  'blog/playlist-navidad-villancicos.html',
  'blog/proximamente-novedades-bingo-musical.html'
];

console.log('🧹 Eliminando Lucky Tag (Hot Tag) - el más invasivo...\n');

let totalRemoved = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Eliminar SOLO Lucky Tag (Hot Tag - zona 10241767)
  const luckyTagPattern = /\s*<!-- Monetag: Lucky Tag \(Hot Tag - zona 10241767\) -->\s*<script>\(function\(s\)\{s\.dataset\.zone='10241767',s\.src='https:\/\/al5sm\.com\/tag\.min\.js'\}\)\(\[document\.documentElement, document\.body\]\.filter\(Boolean\)\.pop\(\)\.appendChild\(document\.createElement\('script'\)\)\)<\/script>\s*/g;
  
  if (content.match(luckyTagPattern)) {
    content = content.replace(luckyTagPattern, '\n  ');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}`);
    totalRemoved++;
  } else {
    console.log(`ℹ️  ${file} - Sin Lucky Tag`);
  }
});

console.log(`\n✅ Eliminado Lucky Tag de ${totalRemoved} archivos`);
console.log('✅ Mantenidos: Standard Tag, Perfect Tag, Balanced Stack');
