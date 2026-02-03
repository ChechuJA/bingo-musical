/**
 * 🎵 BINGO BOT - Motor de Respuestas Inteligente
 * 
 * Bot conversacional nativo para Bingo Musical Gratis
 * Sin necesidad de servicios externos, 100% integrado
 */

// Base de conocimiento del bot
const BingoBotKnowledge = {
  // Categorías disponibles
  categories: [
    {
      name: 'Navidad',
      emoji: '🎄',
      songs: 20,
      cards: 90,
      sizes: 3,
      description: 'villancicos clásicos',
      perfect: 'fiestas familiares navideñas, eventos escolares diciembre',
      url: '/pages/categories/navidad.html',
      keywords: ['navidad', 'villancicos', 'navideño', 'diciembre', 'papa noel', 'reyes']
    },
    {
      name: 'Clásicos del Pop',
      emoji: '🎸',
      songs: 25,
      cards: 90,
      sizes: 3,
      description: 'hits pop 70s-90s',
      perfect: 'fiestas de adultos, reuniones nostálgicas, eventos corporativos',
      url: '/pages/categories/clasicos-pop.html',
      keywords: ['pop', 'clasicos', 'adultos', '80', '90', 'nostalgia']
    },
    {
      name: 'Pop Latino',
      emoji: '💃',
      songs: 20,
      cards: 90,
      sizes: 3,
      description: 'éxitos latinos y españoles',
      perfect: 'fiestas latinas, bodas, eventos multiculturales',
      url: '/pages/categories/pop-latino.html',
      keywords: ['latino', 'español', 'reggaeton', 'salsa', 'boda', 'fiesta']
    },
    {
      name: 'Rock',
      emoji: '🎸',
      songs: 25,
      cards: 90,
      sizes: 3,
      description: 'himnos del rock',
      perfect: 'fiestas rockeras, eventos temáticos, público adulto',
      url: '/pages/categories/rock.html',
      keywords: ['rock', 'rockero', 'metal', 'guitarra']
    },
    {
      name: 'Música en Español',
      emoji: '🇪🇸',
      songs: 25,
      cards: 90,
      sizes: 3,
      description: 'canciones variadas en español',
      perfect: 'público hispanohablante, eventos familiares',
      url: '/pages/categories/musica-espanol.html',
      keywords: ['español', 'castellano', 'hispanohablante']
    },
    {
      name: 'Música en Inglés',
      emoji: '🇬🇧',
      songs: 25,
      cards: 90,
      sizes: 3,
      description: 'hits internacionales',
      perfect: 'público joven, eventos internacionales',
      url: '/pages/categories/musica-ingles.html',
      keywords: ['ingles', 'english', 'internacional', 'joven']
    },
    {
      name: 'Otoño',
      emoji: '🍂',
      songs: 15,
      cards: 50,
      sizes: 2,
      description: 'canciones otoñales',
      perfect: 'eventos de otoño, fiestas temáticas estacionales',
      url: '/pages/categories/otono.html',
      keywords: ['otoño', 'otono', 'autumn', 'fall', 'estacional']
    },
    {
      name: 'Cumpleaños',
      emoji: '🎂',
      songs: 15,
      cards: 50,
      sizes: 2,
      description: 'canciones de fiesta y celebración',
      perfect: 'cumpleaños infantiles y adultos, fiestas privadas',
      url: '/pages/categories/cumpleanos.html',
      keywords: ['cumpleaños', 'cumpleanos', 'birthday', 'celebracion', 'fiesta', 'niños']
    },
    {
      name: 'Mix Musical',
      emoji: '🎶',
      songs: 49,
      cards: 150,
      sizes: 'variado',
      description: 'todos los géneros mezclados',
      perfect: 'eventos grandes, variedad de gustos musicales',
      url: '/pages/categories/mix.html',
      keywords: ['mix', 'mezcla', 'variado', 'todos', 'grande']
    },
    {
      name: 'Disney',
      emoji: '🏰',
      songs: 20,
      cards: 50,
      sizes: 'pequeños',
      description: 'canciones de películas Disney',
      perfect: 'fiestas infantiles, cumpleaños, fans de Disney',
      url: '/pages/cartones-listos.html#disney',
      keywords: ['disney', 'mickey', 'princesas', 'pixar', 'niños', 'películas', 'animación']
    },
    {
      name: 'Infantil',
      emoji: '🎈',
      songs: 12,
      cards: 60,
      sizes: 'especial',
      description: 'canciones populares infantiles',
      perfect: 'guarderías, cumpleaños de peques, fiestas infantiles',
      url: '/pages/cartones-listos.html#infantil',
      keywords: ['infantil', 'niños', 'peques', 'vaca lola', 'baby shark', 'bartolito', 'guarderia']
    },
    {
      name: 'Villancicos Infantil',
      emoji: '🎅',
      songs: 15,
      cards: 40,
      sizes: 'especial',
      description: 'villancicos para niños',
      perfect: 'navidad con niños, colegios, fiestas infantiles navideñas',
      url: '/pages/cartones-listos.html#villancicos-infantil',
      keywords: ['villancicos niños', 'navidad infantil', 'reyes magos', 'papa noel niños', 'navidad cole']
    }
  ],
  
  // Respuestas rápidas comunes
  quickResponses: {
    greeting: [
      '¡Hola! 🎵 ¿Qué tipo de evento estás organizando?\n\n*Prueba: "Disney", "Cumpleaños infantil" o "Música rock"*',
      '¡Bienvenido! 🎶 ¿En qué puedo ayudarte hoy?\n\n*Prueba: "Cartones de Navidad", "Rock para adultos" o "Generador"*',
      '¡Hola! 🎵 Cuéntame sobre tu fiesta y te recomiendo los mejores cartones.\n\n*Ejemplo: "Quiero música para niños" o "Fiesta de los 80"*'
    ],
    
    gratis: [
      '¡Sí! 🎉 Todo es **100% gratis**:\n• Descargas ilimitadas\n• Todas las categorías\n• Generador personalizado\n• Sin registro necesario',
      '¡Completamente gratis! 🎁 Descarga todos los cartones que necesites, sin límites ni costes.'
    ],
    
    comoJugar: `¡Es muy fácil! 🎵

**PREPARACIÓN**:
1. Imprime cartones (1 por jugador)
2. Prepara playlist de Spotify
3. Ten marcadores (bolígrafos, fichas)

**JUGAR**:
1. Reproduce canciones
2. Cada jugador marca las que escucha
3. Primero en completar LÍNEA → ¡LÍNEA!
4. Primero en completar todo → ¡BINGO!

[📖 Guía completa](/blog/como-organizar-bingo-musical.html)`,
    
    descarga: `Pasos para descargar 🔧:

1️⃣ Acepta las cookies (banner superior)
2️⃣ Haz clic en botón de descarga
3️⃣ Espera 5 segundos
4️⃣ Clic en "Descargar ZIP"
5️⃣ Descomprime y abre con Bloc de Notas

¿En qué paso tienes problemas?`,
    
    generador: `¡Crea tus propios cartones! 🎨

**Generador Personalizado**:
✅ Añade tus canciones o importa de YouTube
✅ Elige 3-50 canciones por cartón
✅ Genera hasta 200 cartones únicos
✅ Descarga en TXT

[🎨 Ir al Generador](/pages/tools/generador.html)`,
    
    formatos: `📁 **Formatos disponibles**:

• **Markdown (.md)**: Bloc de Notas → Word
• **Text (.txt)**: Directo para imprimir
• **PDF** (Mix): Listo para imprimir
• **PowerPoint** (Mix): Editable

💡 Recomendación: Abre con Bloc de Notas, copia a Word y formatea.`,
    
    spotify: `🎵 **Playlists de Spotify**:

Cada categoría tiene 3 playlists curadas.

**Cómo verlas**:
1. Entra a la categoría
2. Clic en "🎵 Ver Playlists Spotify"
3. Elige y reproduce

O busca las canciones en Spotify manualmente.`,
    
    tamaños: `📏 **Tamaños de cartones**:

• **Pequeños** (8 canciones) → 15-20 min
• **Medianos** (12 canciones) → 30-40 min
• **Grandes** (20 canciones) → 60+ min

¿Cuánto quieres que dure tu evento?`,
    
    ninos: `👶 **Para niños** recomiendo:

🎂 **Cumpleaños** → Canciones infantiles
🎄 **Navidad** → Villancicos conocidos
🎨 **Generador** → Canciones Disney, Pixar

¿Qué edad tienen los niños?`,
    
    noEntiendo: `No entendí bien 😅

¿Necesitas ayuda con:
• 📦 Encontrar cartones
• 🎵 Cómo jugar
• 🔧 Problemas descarga
• 🎨 Generador personalizado
• 💡 Ideas y recomendaciones

Dime con otras palabras.`,
    
    contacto: `📧 **Contacto**:

Email: contacto@bingomusicalgratis.es
[📱 Formulario](/pages/legal/contacto.html)

Respuesta en 24-48h.`,

    juegos: `🎮 **Juegos Musicales Online**

¡Diversión extra para los peques! (y no tan peques)
Tenemos una sección de juegos interactivos:

• 🎵 Adivina la canción
• 🎹 Trivial musical
• 🎼 Memory musical

[🎮 Jugar Ahora](https://juegos.bingomusicalgratis.es)`
  }
};

// Motor de procesamiento de lenguaje natural (simple pero efectivo)
class BingoBotEngine {
  constructor() {
    this.knowledge = BingoBotKnowledge;
    this.conversationHistory = [];
  }
  
  // Analizar mensaje del usuario
  analyzeMessage(message) {
    const msg = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Detectar intención
    const intent = this.detectIntent(msg);
    const entities = this.extractEntities(msg);
    
    return { intent, entities, originalMessage: message };
  }
  
  // Detectar intención del usuario
  detectIntent(msg) {
    // Saludos
    if (/^(hola|buenos|buenas|hey|hi|hello|saludos)/.test(msg)) {
      return 'greeting';
    }
    
    // Precio / Gratis
    if (/(gratis|precio|costo|coste|pagar|cuanto|euros|dolares|dinero)/.test(msg)) {
      return 'pricing';
    }
    
    // Cómo jugar
    if (/(como|que|instrucciones|reglas|jugar|juego|funciona)/.test(msg) && 
        /(jugar|juego|bingo|funciona)/.test(msg)) {
      return 'howToPlay';
    }
    
    // Problemas descarga
    if (/(problema|error|no puedo|ayuda|descarga|descargar|download)/.test(msg) &&
        /(descarga|descargar|download|archivo|zip)/.test(msg)) {
      return 'downloadIssue';
    }
    
    // Generador personalizado
    if (/(generador|personalizado|propio|mis|crear|custom|generar)/.test(msg) &&
        /(canciones|cartones|playlist)/.test(msg)) {
      return 'generator';
    }
    
    // Formatos
    if (/(formato|extension|tipo|archivo|pdf|txt|markdown|word|excel|pptx)/.test(msg)) {
      return 'formats';
    }
    
    // Spotify
    if (/(spotify|playlist|reproducir|musica|canciones)/.test(msg) &&
        /(spotify|playlist)/.test(msg)) {
      return 'spotify';
    }
    
    // Tamaños
    if (/(tamaño|tamaños|pequeño|mediano|grande|cuantas|duracion|tiempo)/.test(msg) &&
        /(canciones|cartones|tiempo|duracion)/.test(msg)) {
      return 'sizes';
    }
    
    // Niños
    if (/(niño|niños|infantil|niñas|peque|bebe|hijo|hija|kid)/.test(msg)) {
      return 'kids';
    }
    
    // Imprimir
    if (/(imprimir|impresion|print|papel)/.test(msg)) {
      return 'printing';
    }

    // Juegos Online
    if (/(juego|jugar|online|divertido|entretenimiento|minijuego|adivina|trivial)/.test(msg) &&
        /(online|linea|web|niños|peques|gratis)/.test(msg)) {
      return 'games';
    }
    
    // Buscar categoría por evento
    if (/(evento|fiesta|celebracion|party|reunion)/.test(msg) ||
        /(cumpleaños|boda|navidad|empresa|corporativo)/.test(msg)) {
      return 'findCategory';
    }
    
    // Buscar categoría por keyword
    for (const cat of this.knowledge.categories) {
      for (const keyword of cat.keywords) {
        if (msg.includes(keyword)) {
          return 'categoryInfo';
        }
      }
    }
    
    // Contacto
    if (/(contacto|email|soporte|ayuda|hablar|escribir)/.test(msg)) {
      return 'contact';
    }
    
    return 'unknown';
  }
  
  // Extraer entidades (categorías, eventos, etc)
  extractEntities(msg) {
    const entities = {
      categories: [],
      eventType: null,
      age: null
    };
    
    // Detectar categorías mencionadas
    for (const cat of this.knowledge.categories) {
      for (const keyword of cat.keywords) {
        if (msg.includes(keyword)) {
          entities.categories.push(cat);
          break;
        }
      }
    }
    
    // Detectar tipo de evento
    if (/(cumpleaños|cumpleanos|birthday)/.test(msg)) entities.eventType = 'cumpleaños';
    else if (/(boda|wedding|casamiento)/.test(msg)) entities.eventType = 'boda';
    else if (/(navidad|christmas|noel)/.test(msg)) entities.eventType = 'navidad';
    else if (/(empresa|corporativo|trabajo|office)/.test(msg)) entities.eventType = 'corporativo';
    else if (/(familia|familiar|casa|reunion)/.test(msg)) entities.eventType = 'familiar';
    
    // Detectar edad
    if (/(niño|niños|infantil|kid|pequeño|disney|pixar)/.test(msg)) entities.age = 'niños';
    else if (/(adolescente|teen|joven)/.test(msg)) entities.age = 'adolescentes';
    else if (/(adulto|mayor|grande)/.test(msg)) entities.age = 'adultos';
    
    // Inferencia: Si se menciona una categoría infantil, asumir edad niños
    if (entities.categories.some(c => ['Disney', 'Infantil', 'Villancicos Infantil'].includes(c.name))) {
      entities.age = 'niños';
    }
    
    return entities;
  }
  
  // Generar respuesta basada en intent y entities
  generateResponse(analysis) {
    const { intent, entities } = analysis;
    
    switch (intent) {
      case 'greeting':
        return this.randomChoice(this.knowledge.quickResponses.greeting);
      
      case 'pricing':
        return this.randomChoice(this.knowledge.quickResponses.gratis);
      
      case 'howToPlay':
        return this.knowledge.quickResponses.comoJugar;
      
      case 'downloadIssue':
        return this.knowledge.quickResponses.descarga;
      
      case 'generator':
        return this.knowledge.quickResponses.generador;
      
      case 'formats':
        return this.knowledge.quickResponses.formatos;
      
      case 'spotify':
        return this.knowledge.quickResponses.spotify;
      
      case 'sizes':
        return this.knowledge.quickResponses.tamaños;
      
      case 'kids':
        return this.recommendCategory({ age: 'niños' });
      
      case 'printing':
        return this.knowledge.quickResponses.formatos;
      
      case 'contact':
        return this.knowledge.quickResponses.contacto;

      case 'games':
        return this.knowledge.quickResponses.juegos;
      
      case 'findCategory':
        return this.recommendCategory(entities);
      
      case 'categoryInfo':
        return this.provideCategoryInfo(entities.categories);
      
      case 'unknown':
      default:
        return this.knowledge.quickResponses.noEntiendo;
    }
  }
  
  // Recomendar categoría según el evento
  recommendCategory(entities) {
    let recommendations = [];
    
    // Por tipo de evento
    if (entities.eventType === 'cumpleaños') {
      recommendations = entities.age === 'niños' 
        ? [
            this.knowledge.categories.find(c => c.name === 'Cumpleaños'),
            this.knowledge.categories.find(c => c.name === 'Disney'),
            this.knowledge.categories.find(c => c.name === 'Infantil')
          ]
        : [this.knowledge.categories.find(c => c.name === 'Cumpleaños'),
           this.knowledge.categories.find(c => c.name === 'Pop Latino')];
    } else if (entities.eventType === 'navidad') {
      if (entities.age === 'niños') {
        recommendations = [
            this.knowledge.categories.find(c => c.name === 'Navidad'),
            this.knowledge.categories.find(c => c.name === 'Villancicos Infantil')
        ];
      } else {
        recommendations = [this.knowledge.categories.find(c => c.name === 'Navidad')];
      }
    } else if (entities.eventType === 'boda') {
      recommendations = [
        this.knowledge.categories.find(c => c.name === 'Pop Latino'),
        this.knowledge.categories.find(c => c.name === 'Clásicos del Pop')
      ];
    } else if (entities.eventType === 'corporativo') {
      recommendations = [
        this.knowledge.categories.find(c => c.name === 'Clásicos del Pop'),
        this.knowledge.categories.find(c => c.name === 'Mix Musical')
      ];
    } else {
      // Por edad
      if (entities.age === 'niños') {
        recommendations = [
          this.knowledge.categories.find(c => c.name === 'Infantil'),
          this.knowledge.categories.find(c => c.name === 'Disney'),
          this.knowledge.categories.find(c => c.name === 'Cumpleaños'),
          this.knowledge.categories.find(c => c.name === 'Villancicos Infantil')
        ];
      } else if (entities.age === 'adolescentes') {
        recommendations = [
          this.knowledge.categories.find(c => c.name === 'Música en Inglés'),
          this.knowledge.categories.find(c => c.name === 'Pop Latino')
        ];
      } else {
        // Default: Mix o Clásicos
        recommendations = [
          this.knowledge.categories.find(c => c.name === 'Mix Musical'),
          this.knowledge.categories.find(c => c.name === 'Clásicos del Pop')
        ];
      }
    }
    
    // Construir respuesta
    if (recommendations.length === 0) {
      return '¿Qué tipo de evento vas a organizar? Te ayudo a elegir la mejor categoría. 🎵';
    }
    
    let response = `Para tu evento te recomiendo:\n\n`;
    recommendations.filter(Boolean).forEach(cat => {
      response += `${cat.emoji} **${cat.name}**\n`;
      response += `• ${cat.songs} canciones, ${cat.cards} cartones\n`;
      response += `• Perfecto para: ${cat.perfect}\n`;
      response += `[Ver cartones](${cat.url})\n\n`;
    });
    
    return response;
  }
  
  // Proveer info de categorías específicas
  provideCategoryInfo(categories) {
    if (categories.length === 0) {
      return '¿Qué categoría te interesa? Tenemos Navidad, Pop, Rock, Latino y más. 🎵';
    }
    
    const cat = categories[0];
    const sizesText = isNaN(cat.sizes) ? cat.sizes : `${cat.sizes} tamaños`;
    
    return `${cat.emoji} **${cat.name}**

📦 **Incluye**:
• ${cat.songs} canciones (${cat.description})
• ${cat.cards} cartones (${sizesText})
• Playlists de Spotify curadas

✨ **Perfecto para**: ${cat.perfect}

[📥 Ver y descargar cartones](${cat.url})`;
  }
  
  // Utilidad: elección aleatoria
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Procesar mensaje completo
  processMessage(userMessage) {
    const analysis = this.analyzeMessage(userMessage);
    const response = this.generateResponse(analysis);
    
    // Guardar en historial
    this.conversationHistory.push({
      user: userMessage,
      bot: response,
      timestamp: new Date(),
      intent: analysis.intent
    });
    
    return response;
  }
}

// Exportar para uso en widget
window.BingoBotEngine = BingoBotEngine;
