/**
 * Bingo Musical Interactivo
 * Juego de bingo musical en solitario/grupo sin backend
 */

// Game State
let gameState = {
  category: null,
  allSongs: [],
  bingoCard: [],
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
  'Música en Español': { emoji: '🔥', color: '#ff4500' },
  'Música en Inglés': { emoji: '🇬🇧', color: '#1e90ff' }
};

// Load playlists data
async function loadPlaylists() {
  try {
    const response = await fetch('data/playlists.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading playlists:', error);
    return {};
  }
}

// Initialize category selector
async function initCategorySelector() {
  const playlists = await loadPlaylists();
  const selector = document.getElementById('category-selector');
  
  Object.keys(playlists).forEach(categoryName => {
    const theme = categoryThemes[categoryName] || { emoji: '🎵', color: '#9b59b6' };
    const option = document.createElement('div');
    option.className = 'category-option';
    option.innerHTML = `
      <span class="emoji">${theme.emoji}</span>
      <div style="font-size:0.9rem;font-weight:600;">${categoryName}</div>
      <div style="font-size:0.75rem;color:#999;margin-top:0.25rem;">${playlists[categoryName].length} canciones</div>
    `;
    
    option.addEventListener('click', () => {
      document.querySelectorAll('.category-option').forEach(el => el.classList.remove('selected'));
      option.classList.add('selected');
      gameState.category = categoryName;
      gameState.allSongs = [...playlists[categoryName]];
      document.getElementById('btn-start-game').disabled = false;
    });
    
    selector.appendChild(option);
  });
}

// Generate random bingo card (4x4: 12 songs + 4 wildcards)
function generateBingoCard() {
  const shuffled = [...gameState.allSongs].sort(() => Math.random() - 0.5);
  const songs = shuffled.slice(0, 12);
  const card = [];
  
  // Create 4x4 grid with wildcards in middle of each row
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (col === 1 || col === 2) { // Middle columns for wildcards
        if (row % 2 === 0 && col === 1) {
          card.push({ type: 'wildcard', song: null, emoji: categoryThemes[gameState.category]?.emoji || '⭐' });
        } else if (row % 2 === 1 && col === 2) {
          card.push({ type: 'wildcard', song: null, emoji: categoryThemes[gameState.category]?.emoji || '⭐' });
        } else {
          card.push({ type: 'song', song: songs.pop() });
        }
      } else {
        card.push({ type: 'song', song: songs.pop() });
      }
    }
  }
  
  return card;
}

// Render bingo grid
function renderBingoGrid() {
  const grid = document.getElementById('bingo-grid');
  grid.innerHTML = '';
  
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
}

// Mark cell
function markCell(index) {
  if (gameState.markedCells.has(index)) {
    // Unmark
    gameState.markedCells.delete(index);
  } else {
    // Mark
    gameState.markedCells.add(index);
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

// Check victory conditions
function checkVictoryConditions() {
  const marked = Array.from(gameState.markedCells);
  
  // Check lines (horizontal, vertical, diagonal)
  const lines = [
    // Horizontal
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    // Vertical
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    // Diagonal
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ];
  
  const hasLine = lines.some(line => line.every(index => marked.includes(index)));
  
  if (hasLine && !gameState.hasWonLine) {
    gameState.hasWonLine = true;
    setTimeout(() => showVictory('¡LÍNEA!', '¡Has completado una línea! 🎉'), 300);
  }
  
  // Check bingo (all 16 cells)
  if (marked.length === 16 && !gameState.hasWonBingo) {
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
  document.getElementById('stat-marked').textContent = gameState.markedCells.size;
  document.getElementById('stat-songs').textContent = gameState.songsPlayed.length;
  document.getElementById('stat-remaining').textContent = 16 - gameState.markedCells.size;
}

// Start game
function startGame() {
  if (!gameState.category) {
    alert('Por favor, selecciona una categoría');
    return;
  }
  
  // Generate card
  gameState.bingoCard = generateBingoCard();
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
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// New game
function newGame() {
  document.getElementById('game-screen').hidden = true;
  document.getElementById('setup-screen').hidden = false;
  document.getElementById('victory-modal').hidden = true;
  
  // Reset category selection
  document.querySelectorAll('.category-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('btn-start-game').disabled = true;
  
  gameState = {
    category: null,
    allSongs: [],
    bingoCard: [],
    currentSong: null,
    songsPlayed: [],
    markedCells: new Set(),
    hasWonLine: false,
    hasWonBingo: false
  };
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initCategorySelector();
  
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-next-song').addEventListener('click', playNextSong);
  document.getElementById('btn-new-game').addEventListener('click', newGame);
  document.getElementById('btn-play-again').addEventListener('click', newGame);
});
