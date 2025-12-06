/**
 * Bingo Musical Interactivo
 * Juego de bingo musical en solitario/grupo sin backend
 * Utiliza cartones pre-generados desde archivos markdown
 */

// Game State
let gameState = {
  category: null,
  size: null,
  allSongs: [],
  bingoCard: [],
  cardNumber: null,
  currentSong: null,
  songsPlayed: [],
  markedCells: new Set(),
  hasWonLine: false,
  hasWonBingo: false
};

// Category themes with emojis
const categoryThemes = {
  'Navidad': { emoji: '🎄', color: '#c41e3a' },
  'Música de Otoño': { emoji: '🍂', color: '#d4a574' },
  'Cumpleaños': { emoji: '🎂', color: '#ffd93d' },
  'Clásicos del Pop': { emoji: '🎸', color: '#ff6b9d' },
  'Pop Latino y Español': { emoji: '💃', color: '#ff8c42' },
  'Rock': { emoji: '🤘', color: '#8b0000' },
  'Rock Clásico': { emoji: '🎸', color: '#8b0000' },
  'Música en Español': { emoji: '🔥', color: '#ff4500' },
  'Música en Inglés': { emoji: '🇬🇧', color: '#1e90ff' }
};

// Load generated cards index
async function loadGeneratedCardsIndex() {
  try {
    const response = await fetch('../../data/generated-cards-index.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading generated cards index:', error);
    return {};
  }
}

// Load playlists data (for all songs list)
async function loadPlaylists() {
  try {
    const response = await fetch('../../data/playlists.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading playlists:', error);
    return {};
  }
}

// Parse markdown card file to extract individual cards
function parseCardFile(markdownText) {
  const cards = [];
  const cardSections = markdownText.split(/^## Cartón \d+$/m).filter(s => s.trim());
  
  cardSections.forEach(section => {
    const lines = section.trim().split('\n');
    const songs = lines
      .filter(line => line.match(/^\d+\.\s/))
      .map(line => line.replace(/^\d+\.\s/, '').trim());
    
    if (songs.length > 0) {
      cards.push(songs);
    }
  });
  
  return cards;
}

// Load a random pre-generated card
async function loadPreGeneratedCard(category, size) {
  try {
    const cardsIndex = await loadGeneratedCardsIndex();
    const categoryData = cardsIndex[category];
    
    if (!categoryData || !categoryData[size]) {
      console.error(`No cards found for ${category} - ${size}`);
      return null;
    }
    
    const cardPath = categoryData[size].cartones;
    const response = await fetch('../../' + cardPath);
    const markdownText = await response.text();
    
    const allCards = parseCardFile(markdownText);
    
    if (allCards.length === 0) {
      console.error('No cards parsed from file');
      return null;
    }
    
    // Pick a random card
    const randomIndex = Math.floor(Math.random() * allCards.length);
    return {
      songs: allCards[randomIndex],
      cardNumber: randomIndex + 1,
      totalCards: allCards.length
    };
  } catch (error) {
    console.error('Error loading pre-generated card:', error);
    return null;
  }
}

// Initialize category and size selector
async function initCategorySelector() {
  const cardsIndex = await loadGeneratedCardsIndex();
  const playlists = await loadPlaylists();
  const categorySelector = document.getElementById('category-selector');
  const sizeSelector = document.getElementById('size-selector');
  
  // Create category options
  Object.keys(cardsIndex).forEach(categoryName => {
    const theme = categoryThemes[categoryName] || { emoji: '🎵', color: '#9b59b6' };
    const categoryData = cardsIndex[categoryName];
    const sizes = Object.keys(categoryData);
    
    const option = document.createElement('div');
    option.className = 'category-option';
    option.innerHTML = `
      <span class="emoji">${theme.emoji}</span>
      <div style="font-size:0.9rem;font-weight:600;">${categoryName}</div>
      <div style="font-size:0.75rem;color:#999;margin-top:0.25rem;">${sizes.length} tamaños</div>
    `;
    
    option.addEventListener('click', () => {
      document.querySelectorAll('.category-option').forEach(el => el.classList.remove('selected'));
      option.classList.add('selected');
      gameState.category = categoryName;
      gameState.allSongs = playlists[categoryName] || [];
      
      // Update size selector
      updateSizeSelector(categoryName, cardsIndex);
      checkStartButton();
    });
    
    categorySelector.appendChild(option);
  });
}

// Update size selector based on category
function updateSizeSelector(categoryName, cardsIndex) {
  const sizeSelector = document.getElementById('size-selector');
  sizeSelector.innerHTML = '';
  
  const categoryData = cardsIndex[categoryName];
  if (!categoryData) return;
  
  const sizeLabels = {
    'pequeños': '8 canciones',
    'medianos': '12 canciones',
    'grandes': '20 canciones'
  };
  
  Object.keys(categoryData).forEach(size => {
    const data = categoryData[size];
    const option = document.createElement('div');
    option.className = 'size-option';
    option.innerHTML = `
      <div style="font-size:1rem;font-weight:600;text-transform:capitalize;">${size}</div>
      <div style="font-size:0.75rem;color:#999;margin-top:0.25rem;">${sizeLabels[size] || data.cancionesPorCarton + ' canciones'}</div>
      <div style="font-size:0.7rem;color:#999;">${data.numCartones} cartones disponibles</div>
    `;
    
    option.addEventListener('click', () => {
      document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
      option.classList.add('selected');
      gameState.size = size;
      checkStartButton();
    });
    
    sizeSelector.appendChild(option);
  });
  
  document.getElementById('size-selection-container').hidden = false;
}

// Check if start button should be enabled
function checkStartButton() {
  const startBtn = document.getElementById('btn-start-game');
  if (gameState.category && gameState.size) {
    startBtn.disabled = false;
  } else {
    startBtn.disabled = true;
  }
}

// Generate bingo card from pre-generated data
function generateBingoCardFromPreGenerated(songs) {
  const card = [];
  
  // Calculate grid dimensions based on number of songs
  const songCount = songs.length;
  let gridSize;
  
  if (songCount === 8) {
    gridSize = 9; // 3x3 grid with 1 wildcard
  } else if (songCount === 12) {
    gridSize = 16; // 4x4 grid with 4 wildcards
  } else if (songCount === 20) {
    gridSize = 25; // 5x5 grid with 5 wildcards
  } else {
    // Default fallback for other sizes
    gridSize = 16;
  }
  
  const cols = Math.sqrt(gridSize);
  const rows = cols;
  const wildcardCount = gridSize - songCount;
  
  // Create array with songs and wildcards
  const allCells = [...songs.map(song => ({ type: 'song', song }))];
  
  // Add wildcards evenly distributed
  for (let i = 0; i < wildcardCount; i++) {
    allCells.push({ type: 'wildcard', song: null, emoji: categoryThemes[gameState.category]?.emoji || '⭐' });
  }
  
  // Shuffle to distribute wildcards
  for (let i = allCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
  }
  
  return { cells: allCells, gridSize: cols };
}

// Render bingo grid with dynamic sizing
function renderBingoGrid() {
  const grid = document.getElementById('bingo-grid');
  grid.innerHTML = '';
  
  const cols = gameState.gridSize || 4;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  
  gameState.bingoCard.forEach((cell, index) => {
    const cellEl = document.createElement('div');
    cellEl.className = 'bingo-cell';
    cellEl.dataset.index = index;
    
    if (cell.type === 'wildcard') {
      cellEl.classList.add('wildcard');
      cellEl.textContent = cell.emoji;
      cellEl.title = 'Comodín - Se puede marcar en cualquier momento';
    } else {
      cellEl.textContent = cell.song;
      cellEl.title = cell.song;
    }
    
    if (gameState.markedCells.has(index)) {
      cellEl.classList.add('marked');
    }
    
    cellEl.addEventListener('click', () => markCell(index));
    grid.appendChild(cellEl);
  });
  
  // Save state to localStorage
  saveGameState();
}

// Save game state to localStorage
function saveGameState() {
  const state = {
    category: gameState.category,
    size: gameState.size,
    cardNumber: gameState.cardNumber,
    markedCells: Array.from(gameState.markedCells),
    songsPlayed: gameState.songsPlayed,
    bingoCard: gameState.bingoCard,
    gridSize: gameState.gridSize,
    hasWonLine: gameState.hasWonLine,
    hasWonBingo: gameState.hasWonBingo
  };
  
  try {
    localStorage.setItem('bingoGameState', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving game state:', e);
    // Show user-friendly message only on first failure
    if (!window.bingoStorageWarningShown) {
      window.bingoStorageWarningShown = true;
      console.warn('No se pudo guardar el progreso. El juego funcionará pero no se guardará al recargar.');
    }
  }
}

// Load game state from localStorage
function loadGameState() {
  try {
    const saved = localStorage.getItem('bingoGameState');
    if (saved) {
      const state = JSON.parse(saved);
      return state;
    }
  } catch (e) {
    console.error('Error loading game state:', e);
  }
  return null;
}

// Restore game from saved state
async function restoreGame(savedState) {
  gameState.category = savedState.category;
  gameState.size = savedState.size;
  gameState.cardNumber = savedState.cardNumber;
  gameState.bingoCard = savedState.bingoCard;
  gameState.gridSize = savedState.gridSize;
  gameState.markedCells = new Set(savedState.markedCells);
  gameState.songsPlayed = savedState.songsPlayed || [];
  gameState.hasWonLine = savedState.hasWonLine || false;
  gameState.hasWonBingo = savedState.hasWonBingo || false;
  
  // Load all songs for the category
  const playlists = await loadPlaylists();
  gameState.allSongs = playlists[gameState.category] || [];
  
  // Show game screen
  document.getElementById('setup-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;
  
  renderBingoGrid();
  updateStats();
  
  // Show info banner about restored game
  const display = document.getElementById('current-song-display');
  display.innerHTML = `
    <p style="opacity:0.8;margin-bottom:0.5rem;">✅ Partida restaurada</p>
    <h3 style="margin:0;">${gameState.category} - Cartón #${gameState.cardNumber}</h3>
  `;
}

// Mark cell
function markCell(index) {
  if (gameState.markedCells.has(index)) {
    // Unmark
    gameState.markedCells.delete(index);
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  } else {
    // Mark
    gameState.markedCells.add(index);
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }
  
  updateStats();
  renderBingoGrid();
  checkVictoryConditions();
}

// Play next song
function playNextSong() {
  const availableSongs = gameState.allSongs.filter(song => !gameState.songsPlayed.includes(song));
  
  if (availableSongs.length === 0) {
    alert('¡Ya han sonado todas las canciones de esta categoría!');
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * availableSongs.length);
  const song = availableSongs[randomIndex];
  
  gameState.currentSong = song;
  gameState.songsPlayed.push(song);
  
  // Display current song
  const display = document.getElementById('current-song-display');
  display.innerHTML = `
    <p style="opacity:0.8;margin-bottom:0.5rem;">🎵 Canción #${gameState.songsPlayed.length}</p>
    <h3 style="margin:0;">${song}</h3>
  `;
  
  // Highlight matching cells
  document.querySelectorAll('.bingo-cell').forEach((cell, index) => {
    cell.classList.remove('current-song');
    const cardCell = gameState.bingoCard[index];
    if (cardCell.type === 'song' && cardCell.song === song) {
      cell.classList.add('current-song');
    }
  });
  
  updateStats();
}

// Check victory conditions (dynamic based on grid size)
function checkVictoryConditions() {
  const marked = Array.from(gameState.markedCells);
  const gridSize = gameState.gridSize || 4;
  const totalCells = gridSize * gridSize;
  
  // Generate lines based on grid size
  const lines = [];
  
  // Horizontal lines
  for (let row = 0; row < gridSize; row++) {
    const line = [];
    for (let col = 0; col < gridSize; col++) {
      line.push(row * gridSize + col);
    }
    lines.push(line);
  }
  
  // Vertical lines
  for (let col = 0; col < gridSize; col++) {
    const line = [];
    for (let row = 0; row < gridSize; row++) {
      line.push(row * gridSize + col);
    }
    lines.push(line);
  }
  
  // Diagonal lines (top-left to bottom-right and top-right to bottom-left)
  const diagonal1 = [];
  const diagonal2 = [];
  for (let i = 0; i < gridSize; i++) {
    diagonal1.push(i * gridSize + i);
    diagonal2.push(i * gridSize + (gridSize - 1 - i));
  }
  lines.push(diagonal1);
  lines.push(diagonal2);
  
  const hasLine = lines.some(line => line.every(index => marked.includes(index)));
  
  if (hasLine && !gameState.hasWonLine) {
    gameState.hasWonLine = true;
    setTimeout(() => showVictory('¡LÍNEA!', '¡Has completado una línea! 🎉'), 300);
  }
  
  // Check bingo (all cells)
  if (marked.length === totalCells && !gameState.hasWonBingo) {
    gameState.hasWonBingo = true;
    setTimeout(() => showVictory('¡BINGO!', '¡Has completado todo el cartón! 🏆'), 300);
  }
}

// Show victory modal
function showVictory(title, message) {
  const modal = document.getElementById('victory-modal');
  document.getElementById('victory-title').textContent = title;
  document.getElementById('victory-message').textContent = message;
  document.getElementById('victory-count').textContent = gameState.markedCells.size;
  
  modal.hidden = false;
  createConfetti();
  
  // Play celebration sound (optional - browser APIs)
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGmi77eefTRAMUKnj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF607uuoVRQKRp/g8r5sIQUrg870');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore if autoplay blocked
  } catch (e) {}
}

// Create confetti effect
function createConfetti() {
  const colors = ['#9b59b6', '#3498db', '#e74c3c', '#f39c12', '#27ae60'];
  const modal = document.querySelector('.victory-content');
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    modal.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
  }
}

// Update stats
function updateStats() {
  const totalCells = gameState.bingoCard.length;
  document.getElementById('stat-marked').textContent = gameState.markedCells.size;
  document.getElementById('stat-songs').textContent = gameState.songsPlayed.length;
  document.getElementById('stat-remaining').textContent = totalCells - gameState.markedCells.size;
}

// Start game
async function startGame() {
  if (!gameState.category || !gameState.size) {
    alert('Por favor, selecciona una categoría y un tamaño');
    return;
  }
  
  // Load pre-generated card
  const cardData = await loadPreGeneratedCard(gameState.category, gameState.size);
  
  if (!cardData) {
    alert('Error al cargar el cartón. Por favor, intenta de nuevo.');
    return;
  }
  
  // Generate card layout
  const cardLayout = generateBingoCardFromPreGenerated(cardData.songs);
  gameState.bingoCard = cardLayout.cells;
  gameState.gridSize = cardLayout.gridSize;
  gameState.cardNumber = cardData.cardNumber;
  gameState.songsPlayed = [];
  gameState.markedCells = new Set();
  gameState.currentSong = null;
  gameState.hasWonLine = false;
  gameState.hasWonBingo = false;
  
  // Show game screen
  document.getElementById('setup-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;
  
  renderBingoGrid();
  updateStats();
  
  // Display card info
  const display = document.getElementById('current-song-display');
  display.innerHTML = `
    <p style="opacity:0.8;margin-bottom:0.5rem;">🎲 Cartón generado</p>
    <h3 style="margin:0;">${gameState.category} - Cartón #${gameState.cardNumber}</h3>
    <p style="font-size:0.9rem;opacity:0.7;margin-top:0.5rem;">Pulsa "Sonar Canción" para empezar</p>
  `;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Save initial state
  saveGameState();
}

// New game
function newGame() {
  // Clear localStorage
  localStorage.removeItem('bingoGameState');
  
  document.getElementById('game-screen').hidden = true;
  document.getElementById('setup-screen').hidden = false;
  document.getElementById('victory-modal').hidden = true;
  
  // Reset category and size selection
  document.querySelectorAll('.category-option').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('btn-start-game').disabled = true;
  document.getElementById('size-selection-container').hidden = true;
  
  gameState = {
    category: null,
    size: null,
    allSongs: [],
    bingoCard: [],
    cardNumber: null,
    currentSong: null,
    songsPlayed: [],
    markedCells: new Set(),
    hasWonLine: false,
    hasWonBingo: false
  };
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset current game (keep same card, clear marks)
function resetGame() {
  gameState.markedCells = new Set();
  gameState.songsPlayed = [];
  gameState.currentSong = null;
  gameState.hasWonLine = false;
  gameState.hasWonBingo = false;
  
  renderBingoGrid();
  updateStats();
  
  const display = document.getElementById('current-song-display');
  display.innerHTML = `
    <p style="opacity:0.8;margin-bottom:0.5rem;">🔄 Cartón reiniciado</p>
    <h3 style="margin:0;">${gameState.category} - Cartón #${gameState.cardNumber}</h3>
    <p style="font-size:0.9rem;opacity:0.7;margin-top:0.5rem;">Pulsa "Sonar Canción" para empezar</p>
  `;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
  await initCategorySelector();
  
  // Check if there's a saved game
  const savedState = loadGameState();
  if (savedState) {
    // Ask user if they want to restore
    const restore = confirm('¿Quieres continuar con tu partida guardada?');
    if (restore) {
      await restoreGame(savedState);
    } else {
      localStorage.removeItem('bingoGameState');
    }
  }
  
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-next-song').addEventListener('click', playNextSong);
  document.getElementById('btn-new-game').addEventListener('click', newGame);
  document.getElementById('btn-play-again').addEventListener('click', newGame);
  
  // Add reset button if it exists
  const resetBtn = document.getElementById('btn-reset-game');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }
  
  // Add fullscreen button if it exists
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }
});

// Toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log('Error attempting to enable fullscreen:', err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
