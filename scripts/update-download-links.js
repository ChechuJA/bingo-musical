const fs = require('fs');
const path = require('path');

// Configuración de categorías
const categories = {
  'clasicos-pop': { name: 'Clásicos Pop', folder: 'clasicos-pop' },
  'pop-latino': { name: 'Pop Latino', folder: 'pop-latino' },
  'rock': { name: 'Rock', folder: 'rock' },
  'musica-espanol': { name: 'Música Español', folder: 'espanol' },
  'musica-ingles': { name: 'Música Inglés', folder: 'ingles' },
  'otono': { name: 'Otoño', folder: 'otono' },
  'cumpleanos': { name: 'Cumpleaños', folder: 'cumpleanos' },
  'mix': { name: 'Mix Musical', folder: 'mix' }
};

// Tamaños estándar
const sizes = {
  'pequeños': { label: 'Pequeños', count: '20', size: '0.64 MB' },
  'medianos': { label: 'Medianos', count: '30', size: '1.30 MB' },
  'grandes': { label: 'Grandes', count: '40', size: '2.01 MB' },
  'todos': { label: 'Pack Completo', count: '90', size: '3.90 MB' }
};

console.log('🔄 Actualizando enlaces de descarga...\n');

// Procesar cada categoría
Object.keys(categories).forEach(catKey => {
  const catInfo = categories[catKey];
  const filePath = path.join(__dirname, '..', 'pages', 'categories', `${catKey}.html`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${catKey}.html`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Buscar y reemplazar cada enlace de descarga
  Object.keys(sizes).forEach(sizeKey => {
    const sizeInfo = sizes[sizeKey];
    const oldPattern = new RegExp(
      `href="cartones-descargables/${catInfo.folder}/${catInfo.folder}-${sizeKey}\\.zip"[^>]*download`,
      'g'
    );
    
    const newLink = `href="../download.html?file=cartones-descargables/${catInfo.folder}/${catInfo.folder}-${sizeKey}.zip&category=${encodeURIComponent(catInfo.name)}&size=${encodeURIComponent(sizeInfo.label)}&count=${sizeInfo.count}&fileSize=${encodeURIComponent(sizeInfo.size)}" target="_blank"`;
    
    if (content.match(oldPattern)) {
      content = content.replace(oldPattern, newLink);
      changes++;
    }
  });
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${catKey}.html - ${changes} enlaces actualizados`);
  } else {
    console.log(`ℹ️  ${catKey}.html - Sin cambios necesarios`);
  }
});

console.log('\n✅ Actualización completada!');
