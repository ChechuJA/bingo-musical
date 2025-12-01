/**
 * 🔄 Actualiza widget a Bot Nativo
 * 
 * Reemplaza el widget de Copilot Studio (requiere premium)
 * por el bot nativo 100% JavaScript sin dependencias externas
 */

const fs = require('fs');
const path = require('path');

// Leer el nuevo widget nativo
const newWidgetPath = path.join(process.cwd(), '..', 'assets', 'js', 'bingo-bot-widget.html');
const newWidgetCode = fs.readFileSync(newWidgetPath, 'utf-8');

// Archivos donde reemplazar el widget
const filesToUpdate = [
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

console.log('🔄 Reemplazando widget Copilot Studio por Bot Nativo...\n');

let totalUpdated = 0;
let totalFailed = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - No encontrado`);
    totalFailed++;
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Buscar y reemplazar el widget antiguo
  const widgetStartPattern = /<!-- \n {2}🎵 COPILOT STUDIO - BINGO BOT WIDGET/;
  const widgetEndPattern = /<\/script>\n<\/body>/;
  
  if (content.match(widgetStartPattern)) {
    // Encontrar inicio del widget
    const startIndex = content.search(widgetStartPattern);
    
    if (startIndex !== -1) {
      // Encontrar final del widget (antes de </body>)
      const bodyEndIndex = content.lastIndexOf('</body>');
      
      if (bodyEndIndex !== -1) {
        // Reemplazar todo el widget
        const beforeWidget = content.substring(0, startIndex);
        const afterBody = content.substring(bodyEndIndex);
        
        content = beforeWidget + '\n' + newWidgetCode + '\n' + afterBody;
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${file} - Widget actualizado a bot nativo`);
        totalUpdated++;
      } else {
        console.log(`❌ ${file} - No se encontró </body>`);
        totalFailed++;
      }
    } else {
      console.log(`ℹ️  ${file} - No tiene widget antiguo`);
      totalFailed++;
    }
  } else {
    console.log(`ℹ️  ${file} - No tiene widget antiguo`);
    totalFailed++;
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Actualizados: ${totalUpdated} archivos`);
console.log(`❌ Fallidos/Omitidos: ${totalFailed} archivos`);
console.log(`\n🎯 Bot nativo instalado:`);
console.log(`• 100% JavaScript, sin servicios externos`);
console.log(`• Motor de IA con 9 categorías + 50+ respuestas`);
console.log(`• Responsive: Desktop, Tablet, Mobile`);
console.log(`• Triggers proactivos: pulso, exit intent, scroll`);
console.log(`• Conversaciones naturales en español`);
console.log(`\n✨ ¡Listo para usar sin configuración adicional!`);
