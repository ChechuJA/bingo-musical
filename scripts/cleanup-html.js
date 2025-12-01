/**
 * 🧹 CLEANUP HTML - Limpia y formaliza el cierre de todos los archivos HTML
 */

const fs = require('fs');
const path = require('path');

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

let cleaned = 0;

console.log('🧹 Limpiando y finalizando archivos HTML...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Asegurar que termina con </html>
    content = content.trim();
    if (!content.endsWith('</html>')) {
      if (content.includes('</body>')) {
        content = content.replace('</body>', '</body>\n</html>');
      } else {
        content += '\n</body>\n</html>';
      }
    }
    
    // 2. Arreglar scripts sin cierre
    content = content.replace(/<script([^>]*)>\s*$/gm, '<script$1>\n</script>');
    
    // 3. Eliminar espacios múltiples antes de </body>
    content = content.replace(/\n\n+(\s*<\/body>)/g, '\n\n$1');
    
    // 4. Asegurar que los scripts de Monetag están bien cerrados
    // Buscar scripts incompletos de sidebar ads
    const botoScriptMatch = content.match(/<!-- 📢 SIDEBAR ADS SCRIPT -->[\s\S]*?(?=<\/body>)/);
    if (botoScriptMatch) {
      let botScript = botoScriptMatch[0];
      
      // Verificar si tiene cierre de script
      if (!botScript.includes('</script>')) {
        // Contar cuantos <script> tiene sin cierre
        const scriptOpens = (botScript.match(/<script/g) || []).length;
        const scriptCloses = (botScript.match(/<\/script>/g) || []).length;
        
        if (scriptOpens > scriptCloses) {
          const diff = scriptOpens - scriptCloses;
          botScript += '</script>'.repeat(diff);
          content = content.replace(botoScriptMatch[0], botScript);
        }
      }
    }
    
    // 5. Guardar archivo arreglado
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file}`);
    cleaned++;
    
  } catch (error) {
    console.log(`❌ ${file} - ${error.message}`);
  }
});

console.log(`\n✨ ${cleaned}/${files.length} archivos limpiados y formalizados`);
