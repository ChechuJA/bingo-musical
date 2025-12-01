/**
 * 🎵 SCRIPT DE INTEGRACIÓN - BINGO BOT NATIVO
 * 
 * Este script elimina el widget de Copilot Studio e integra el bot nativo
 * en todos los archivos HTML del proyecto.
 */

const fs = require('fs');
const path = require('path');

// Leer el widget nativo completo
const widgetPath = path.join(__dirname, '../assets/js/bingo-bot-widget.html');
const newWidget = fs.readFileSync(widgetPath, 'utf-8');

// Lista de archivos a actualizar
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

let updated = 0;
let errors = 0;

console.log('🔄 Eliminando widget Copilot Studio e integrando Bot Nativo...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Buscar el inicio del widget antiguo (comentario característico)
    const widgetStart = content.indexOf('🎵 COPILOT STUDIO - BINGO BOT WIDGET');
    
    if (widgetStart === -1) {
      console.log(`ℹ️  ${file} - No tiene widget antiguo`);
      return;
    }
    
    // Encontrar el inicio del comentario
    const commentStart = content.lastIndexOf('<!--', widgetStart);
    
    // Encontrar </body> para reemplazar hasta ahí
    const bodyEnd = content.indexOf('</body>', widgetStart);
    
    if (commentStart === -1 || bodyEnd === -1) {
      console.log(`❌ ${file} - No se pudo localizar el bloque completo`);
      errors++;
      return;
    }
    
    // Construir nuevo contenido
    const before = content.substring(0, commentStart);
    const after = content.substring(bodyEnd);
    
    const newContent = before + newWidget + '\n\n' + after;
    
    // Guardar archivo
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ ${file} - Actualizado`);
    updated++;
    
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
    errors++;
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Actualizados: ${updated} archivos`);
console.log(`❌ Errores: ${errors} archivos`);
console.log(`ℹ️  Sin widget: ${files.length - updated - errors} archivos`);
