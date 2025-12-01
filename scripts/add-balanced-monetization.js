/**
 * 🎯 Añade Monetización EQUILIBRADA a todos los HTML
 * 
 * ESTRATEGIA OPCIÓN 2 - EQUILIBRADA:
 * 
 * INDEX.HTML (Homepage):
 * - Mantener 3 bloques AdSense actuales
 * - Añadir Monetag Balanced Stack (In-Page + Vignette) - SUTIL
 * - NO Lucky Tag, NO Standard Tag, NO Perfect Tag
 * 
 * PÁGINAS INTERNAS (categorías, tools, blog, legal):
 * - AdSense cada 2-3 secciones
 * - Monetag Standard Tag (zona 188362) en <head> - menos invasivo
 * - Monetag Balanced Stack completo (In-Page + Vignette + OnClick)
 * - NO Lucky Tag (sin popups automáticos)
 * 
 * DOWNLOAD.HTML:
 * - Ya tiene máxima monetización (no modificar)
 */

const fs = require('fs');
const path = require('path');

// Monetag Standard Tag para páginas internas (menos invasivo que Lucky Tag)
const standardTagHead = `  <!-- Monetag Scripts -->
  <!-- Monetag: Standard Tag (zona 188362) - Menos invasivo -->
  <script src="https://quge5.com/88/tag.min.js" data-zone="188362" async data-cfasync="false"></script>
  
`;

// Monetag Balanced Stack - SUTIL (notificación + overlay suave)
const balancedStackScript = `
  <!-- Monetag Balanced Stack (Sutil - In-Page + Vignette + OnClick) -->
  <script>
    // Cargar scripts Monetag solo si hay consentimiento de cookies
    if (typeof registerAdProvider === 'function') {
      // In-Page Push (zona 10241769) - Notificación abajo-derecha
      registerAdProvider({
        id: 'monetag-inpage',
        src: 'https://niphaumeenses.net/act/files/tag.min.js?z=10241769',
        onLoad: () => console.log('✅ Monetag In-Page Push')
      });
      
      // Vignette Banner (zona 10241771) - Overlay suave
      registerAdProvider({
        id: 'monetag-vignette',
        src: 'https://niphaumeenses.net/act/files/tag.min.js?z=10241771',
        onLoad: () => console.log('✅ Monetag Vignette')
      });
      
      // OnClick Popunder (zona 10241768) - Solo en páginas internas
      registerAdProvider({
        id: 'monetag-onclick',
        src: 'https://niphaumeenses.net/pfe/current/tag.min.js?z=10241768',
        onLoad: () => console.log('✅ Monetag OnClick')
      });
    }
  </script>
`;

// Balanced Stack para index.html (SIN OnClick)
const balancedStackIndexOnly = `
  <!-- Monetag Balanced Stack (Sutil - Solo In-Page + Vignette) -->
  <script>
    // Cargar scripts Monetag solo si hay consentimiento de cookies
    if (typeof registerAdProvider === 'function') {
      // In-Page Push (zona 10241769) - Notificación abajo-derecha
      registerAdProvider({
        id: 'monetag-inpage',
        src: 'https://niphaumeenses.net/act/files/tag.min.js?z=10241769',
        onLoad: () => console.log('✅ Monetag In-Page Push')
      });
      
      // Vignette Banner (zona 10241771) - Overlay suave
      registerAdProvider({
        id: 'monetag-vignette',
        src: 'https://niphaumeenses.net/act/files/tag.min.js?z=10241771',
        onLoad: () => console.log('✅ Monetag Vignette')
      });
    }
  </script>
`;

// Bloque AdSense responsivo (para intercalar en contenido)
const adsenseBlock = `
      <!-- Google AdSense - Espacio publicitario -->
      <section class="ad-space" aria-label="Espacio publicitario">
        <div class="ad-placeholder">
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-9476968656644151"
               data-ad-slot="6455423240"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
               (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </section>
`;

console.log('🎯 Implementando Monetización EQUILIBRADA...\n');

// 1. INDEX.HTML - Solo Balanced Stack (ya tiene 3 AdSense)
const indexPath = path.join(process.cwd(), '..', 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf-8');
  
  // Añadir Balanced Stack antes de </body>
  if (!content.includes('monetag-inpage')) {
    content = content.replace('</body>', `${balancedStackIndexOnly}\n</body>`);
    fs.writeFileSync(indexPath, content, 'utf-8');
    console.log('✅ index.html - Balanced Stack añadido (sin OnClick)');
  } else {
    console.log('ℹ️  index.html - Ya tiene Monetag');
  }
}

// 2. PÁGINAS INTERNAS - Standard Tag + Balanced Stack + AdSense extra
const internalPages = [
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
  
  // Blog landing
  'blog.html',
  
  // Blog artículos (6 páginas)
  'blog/como-organizar-bingo-musical.html',
  'blog/guia-categorias-bingo-musical.html',
  'blog/historia-bingo-musical.html',
  'blog/ideas-creativas-bingo-musical.html',
  'blog/playlist-navidad-villancicos.html',
  'blog/proximamente-novedades-bingo-musical.html'
];

let totalProcessed = 0;

internalPages.forEach(file => {
  const filePath = path.join(process.cwd(), '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - No encontrado`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // A. Añadir Standard Tag en <head> si no existe
  if (!content.includes('data-zone="188362"') && !content.includes('<!-- Monetag Scripts -->')) {
    // Buscar después de <head> o después de meta charset
    const headPattern = /(<head>\s*\n)/;
    if (content.match(headPattern)) {
      content = content.replace(headPattern, `$1${standardTagHead}`);
      modified = true;
    }
  }
  
  // B. Añadir Balanced Stack antes de </body> si no existe
  if (!content.includes('monetag-inpage')) {
    content = content.replace('</body>', `${balancedStackScript}\n</body>`);
    modified = true;
  }
  
  // C. Añadir bloques AdSense extra en páginas de categorías y blog (cada ~200-300 líneas)
  if ((file.includes('categories/') || file.includes('blog/')) && !content.includes('ad-space')) {
    // Buscar sección intermedia (después de descripción, antes de descargas o contenido)
    const patterns = [
      /(<\/p>\s*\n\s*<h2)/,  // Entre párrafo y siguiente h2
      /(<\/section>\s*\n\s*<section)/,  // Entre secciones
      /(<\/ul>\s*\n\s*<h3)/  // Entre lista y h3
    ];
    
    for (const pattern of patterns) {
      if (content.match(pattern) && !modified) {
        content = content.replace(pattern, `</p>\n${adsenseBlock}\n      <h2`);
        modified = true;
        break;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file} - Monetización equilibrada añadida`);
    totalProcessed++;
  } else {
    console.log(`ℹ️  ${file} - Sin cambios necesarios`);
  }
});

console.log(`\n✅ Procesados ${totalProcessed} archivos`);
console.log('\n📊 RESUMEN OPCIÓN 2 - EQUILIBRADA:');
console.log('- index.html: 3 AdSense + Balanced Stack (In-Page + Vignette)');
console.log('- Páginas internas: Standard Tag + Balanced Stack + AdSense extra');
console.log('- NO Lucky Tag (sin popups invasivos)');
console.log('- Revenue esperado: MEDIO-ALTO ($5-10 CPM)');
console.log('- UX: Limpia con monetización sutil');
