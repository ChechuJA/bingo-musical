const fs = require('fs');
const path = require('path');

const files = [
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

console.log('🧹 Eliminando scripts Monetag intrusivos...\n');

let totalRemoved = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // SOLO eliminar scripts INVASIVOS del <head> (Lucky Tag + Perfect Tag)
  // MANTENER el Balanced Stack del final (es menos invasivo)
  const headMonetag = /\s*<!-- Monetag Scripts -->.*?<!-- Monetag: Perfect Tag \(zona 188361\) -->.*?<script src="https:\/\/quge5\.com\/88\/tag\.min\.js" data-zone="188361" async data-cfasync="false"><\/script>\s*/gs;
  if (content.match(headMonetag)) {
    content = content.replace(headMonetag, '\n  ');
    modified = true;
  }
  
  // NO eliminar Balanced Stack - es menos invasivo y efectivo
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}`);
    totalRemoved++;
  } else {
    console.log(`ℹ️  ${file} - Sin Monetag Stack`);
  }
});

console.log(`\n✅ Proceso completado: ${totalRemoved} archivos limpiados`);
