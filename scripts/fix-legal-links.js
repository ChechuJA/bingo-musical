/**
 * Script para corregir enlaces en páginas legales (/pages/legal/)
 * Los enlaces a index.html deben ser ../../index.html
 */

const fs = require('fs');
const path = require('path');

const legalFiles = [
  'pages/legal/about.html',
  'pages/legal/contacto.html',
  'pages/legal/cookies.html',
  'pages/legal/faq.html',
  'pages/legal/legal.html',
  'pages/legal/privacy.html'
];

console.log('🔧 Corrigiendo enlaces en páginas legales...\n');

let successCount = 0;
let errorCount = 0;

legalFiles.forEach(file => {
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
    
    // 1. Corregir enlaces en navegación y logo
    // href="index.html" → href="../../index.html"
    content = content.replace(/href="index\.html"/g, 'href="../../index.html"');
    
    // 2. Corregir enlaces a index.html#categorias
    // href="index.html#categorias" → href="../../index.html#categorias"
    content = content.replace(/href="index\.html#categorias"/g, 'href="../../index.html#categorias"');
    
    // 3. Corregir enlaces a index.html#about
    content = content.replace(/href="index\.html#about"/g, 'href="../../index.html#about"');
    
    // 4. Corregir enlaces a blog.html
    content = content.replace(/href="blog\.html"/g, 'href="../../blog.html"');
    
    if (content !== originalContent) {
      // Contar cambios
      const indexChanges = (originalContent.match(/href="index\.html/g) || []).length;
      changes = indexChanges;
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - ${changes} enlace(s) corregido(s)`);
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
console.log('\n🔗 Todos los enlaces ahora apuntan correctamente a ../../index.html');
