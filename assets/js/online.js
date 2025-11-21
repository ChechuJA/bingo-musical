/* online.js - Online Multiplayer Bingo Logic */
/* Uses Firebase Realtime Database for real-time synchronization */

// Firebase Configuration (placeholder - needs to be replaced with actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDEMO_PLACEHOLDER_KEY",
  authDomain: "bingo-musical-demo.firebaseapp.com",
  databaseURL: "https://bingo-musical-demo-default-rtdb.firebaseio.com",
  projectId: "bingo-musical-demo",
  storageBucket: "bingo-musical-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase (only if not already initialized)
let database;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  database = firebase.database();
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fall back to demo mode if Firebase is not configured
  showDemoModeMessage();
}

// State management
const state = {
  roomCode: null,
  isHost: false,
  playerId: null,
  playerName: null,
  currentRoom: null,
  selectedCategory: null,
  playerCard: null,
  markedSongs: []
};

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Generate room code (6 characters)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get random player avatar emoji
function getRandomAvatar() {
  const avatars = ['😀', '😎', '🤩', '😊', '🥳', '🤗', '😺', '🦁', '🐶', '🐼', '🦊', '🐯'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// Sanitization function
const sanitize = s => (typeof s === 'string') ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : '';

// Load playlists data
async function loadPlaylists() {
  try {
    const response = await fetch('/data/playlists.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading playlists:', error);
    return {
      "Navidad": ["All I Want For Christmas - Mariah Carey", "Last Christmas - Wham!", "Jingle Bells - Traditional"],
      "Cumpleaños": ["Happy - Pharrell Williams", "Birthday - The Beatles", "Celebration - Kool & The Gang"]
    };
  }
}

// Generate unique bingo card for a player
function generateBingoCard(songs, cardSize = 12) {
  const shuffled = [...songs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(cardSize, songs.length));
}

// Check if card is complete
function checkBingo(markedSongs, playerCard) {
  return playerCard.every(song => markedSongs.includes(song));
}

// Show demo mode message
function showDemoModeMessage() {
  const message = document.createElement('div');
  message.className = 'error-message';
  message.style.position = 'fixed';
  message.style.top = '80px';
  message.style.left = '50%';
  message.style.transform = 'translateX(-50%)';
  message.style.maxWidth = '600px';
  message.style.zIndex = '1000';
  message.innerHTML = `
    <strong>⚠️ Modo Demo</strong><br>
    La funcionalidad online requiere configuración de Firebase. 
    Contacta con el administrador para habilitar el juego multijugador real.
  `;
  document.body.appendChild(message);
  
  setTimeout(() => message.remove(), 10000);
}

// Create new game room
async function createRoom() {
  if (!database) {
    showDemoModeMessage();
    return;
  }

  const roomCode = generateRoomCode();
  const playlists = await loadPlaylists();
  
  // Show room creation dialog
  showCategorySelectionDialog(playlists, async (selectedCategory) => {
    const songs = playlists[selectedCategory];
    
    const roomData = {
      code: roomCode,
      hostId: state.playerId,
      category: selectedCategory,
      songs: songs,
      players: {},
      markedSongs: [],
      gameStarted: false,
      gameEnded: false,
      winner: null,
      createdAt: Date.now()
    };

    try {
      await database.ref(`rooms/${roomCode}`).set(roomData);
      state.roomCode = roomCode;
      state.isHost = true;
      state.selectedCategory = selectedCategory;
      
      showHostView(roomCode, roomData);
      listenToRoomUpdates(roomCode);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error al crear la sala. Por favor, intenta de nuevo.');
    }
  });
}

// Join existing room
async function joinRoom(roomCode) {
  if (!database) {
    showDemoModeMessage();
    return;
  }

  if (!roomCode || roomCode.length < 4) {
    alert('Por favor, introduce un código válido');
    return;
  }

  roomCode = roomCode.toUpperCase().trim();

  try {
    const roomSnapshot = await database.ref(`rooms/${roomCode}`).once('value');
    const roomData = roomSnapshot.val();

    if (!roomData) {
      alert('Sala no encontrada. Verifica el código e intenta de nuevo.');
      return;
    }

    if (roomData.gameEnded) {
      alert('Esta partida ya ha finalizado.');
      return;
    }

    // Prompt for player name
    const playerName = prompt('Introduce tu nombre (opcional):') || `Jugador ${generateId().substring(0, 4)}`;
    
    state.roomCode = roomCode;
    state.isHost = false;
    state.playerName = sanitize(playerName);
    state.playerId = generateId();

    // Generate unique card for this player
    const playerCard = generateBingoCard(roomData.songs, 12);
    state.playerCard = playerCard;

    // Add player to room
    const playerData = {
      id: state.playerId,
      name: state.playerName,
      avatar: getRandomAvatar(),
      card: playerCard,
      markedSongs: [],
      hasBingo: false,
      joinedAt: Date.now()
    };

    await database.ref(`rooms/${roomCode}/players/${state.playerId}`).set(playerData);

    showPlayerView(roomCode, roomData, playerCard);
    listenToRoomUpdates(roomCode);

  } catch (error) {
    console.error('Error joining room:', error);
    alert('Error al unirse a la sala. Por favor, intenta de nuevo.');
  }
}

// Show category selection dialog
function showCategorySelectionDialog(playlists, onSelect) {
  const dialog = document.createElement('div');
  dialog.className = 'winner-modal';
  dialog.innerHTML = `
    <div class="winner-content" style="max-width: 600px;">
      <h2 style="color: var(--accent); margin-bottom: 1rem;">Selecciona una Categoría</h2>
      <div class="category-selector">
        <select id="category-select" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 8px; border: 2px solid #ddd;">
          ${Object.keys(playlists).map(cat => 
            `<option value="${sanitize(cat)}">${sanitize(cat)} (${playlists[cat].length} canciones)</option>`
          ).join('')}
        </select>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
        <button class="btn primary" id="confirm-category">Crear Sala</button>
        <button class="btn ghost" id="cancel-category">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById('confirm-category').addEventListener('click', () => {
    const selected = document.getElementById('category-select').value;
    dialog.remove();
    onSelect(selected);
  });

  document.getElementById('cancel-category').addEventListener('click', () => {
    dialog.remove();
  });
}

// Show host view
function showHostView(roomCode, roomData) {
  const container = document.querySelector('.container');
  container.innerHTML = `
    <div class="host-room-container">
      <div class="room-header">
        <h1>🎯 Sala de Juego</h1>
        <div class="room-code-display">${roomCode}</div>
        <p style="margin: 0.5rem 0 0;">Comparte este código con los jugadores</p>
        <button class="copy-button" id="copy-code-btn">📋 Copiar Código</button>
      </div>

      <div class="ad-space">
        <div class="ad-placeholder" style="background: var(--glass); min-height: 90px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <span style="color: var(--muted); font-size: 0.9rem;">📢 Espacio publicitario</span>
        </div>
      </div>

      <div class="players-section">
        <h3>👥 Jugadores (<span id="player-count">0</span>)</h3>
        <div class="players-grid" id="players-list"></div>
      </div>

      <div class="game-controls">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="margin: 0;">🎵 Categoría: ${sanitize(roomData.category)}</h3>
          <button class="btn primary" id="start-game-btn">▶️ Comenzar Juego</button>
        </div>
        <div id="game-content"></div>
      </div>

      <div class="ad-space">
        <div class="ad-placeholder" style="background: var(--glass); min-height: 90px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <span style="color: var(--muted); font-size: 0.9rem;">📢 Espacio publicitario</span>
        </div>
      </div>
    </div>
  `;

  // Copy code functionality
  document.getElementById('copy-code-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      const btn = document.getElementById('copy-code-btn');
      btn.textContent = '✅ Copiado';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '📋 Copiar Código';
        btn.classList.remove('copied');
      }, 2000);
    });
  });

  // Start game button
  document.getElementById('start-game-btn').addEventListener('click', () => {
    startGame(roomCode);
  });
}

// Start game
async function startGame(roomCode) {
  if (!database) return;

  try {
    await database.ref(`rooms/${roomCode}/gameStarted`).set(true);
    showGameStartedForHost();
  } catch (error) {
    console.error('Error starting game:', error);
  }
}

// Show game interface for host
function showGameStartedForHost() {
  const gameContent = document.getElementById('game-content');
  gameContent.innerHTML = `
    <div class="song-selection" id="songs-list"></div>
    <div style="margin-top: 1rem; text-align: center;">
      <button class="btn" style="background: #dc3545; color: white;" id="end-game-btn">⏹️ Finalizar Juego</button>
    </div>
  `;

  document.getElementById('end-game-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres finalizar el juego?')) {
      endGame();
    }
  });

  // Hide start button
  document.getElementById('start-game-btn').style.display = 'none';
}

// End game
async function endGame() {
  if (!database || !state.roomCode) return;

  try {
    await database.ref(`rooms/${state.roomCode}/gameEnded`).set(true);
    alert('Juego finalizado. Gracias por jugar!');
    setTimeout(() => window.location.href = 'online.html', 2000);
  } catch (error) {
    console.error('Error ending game:', error);
  }
}

// Show player view
function showPlayerView(roomCode, roomData, playerCard) {
  const container = document.querySelector('.container');
  
  if (!roomData.gameStarted) {
    // Waiting room
    container.innerHTML = `
      <div class="player-card-container">
        <div class="waiting-room">
          <div class="waiting-animation">⏳</div>
          <h2>Esperando al Host...</h2>
          <p>El juego comenzará pronto</p>
          
          <div class="share-section">
            <p>Código de Sala:</p>
            <div class="share-code">${roomCode}</div>
          </div>

          <div class="ad-space">
            <div class="ad-placeholder" style="background: var(--glass); min-height: 250px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
              <span style="color: var(--muted); font-size: 0.9rem;">📢 Espacio publicitario</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Show bingo card
    showBingoCard(playerCard);
  }
}

// Show bingo card for player
function showBingoCard(playerCard) {
  const container = document.querySelector('.container');
  container.innerHTML = `
    <div class="player-card-container">
      <div class="bingo-card">
        <div class="bingo-card-header">
          <h2>🎵 Tu Cartón de Bingo</h2>
          <p style="color: var(--muted);">Marca las canciones cuando las escuches</p>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
        </div>

        <div class="bingo-grid" id="bingo-grid">
          ${playerCard.map((song, index) => `
            <div class="bingo-cell" data-song="${sanitize(song)}" data-index="${index}">
              <span class="song-title">${sanitize(song)}</span>
            </div>
          `).join('')}
        </div>

        <div class="bingo-button-container">
          <button class="bingo-button" id="bingo-btn" disabled>¡BINGO!</button>
        </div>
      </div>

      <div class="ad-space" style="margin-top: 2rem;">
        <div class="ad-placeholder" style="background: var(--glass); min-height: 90px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <span style="color: var(--muted); font-size: 0.9rem;">📢 Espacio publicitario</span>
        </div>
      </div>
    </div>
  `;

  // Add click handlers to cells
  document.querySelectorAll('.bingo-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const song = cell.dataset.song;
      toggleSongMark(song, cell);
    });
  });

  // Bingo button
  document.getElementById('bingo-btn').addEventListener('click', () => {
    claimBingo();
  });
}

// Toggle song mark
function toggleSongMark(song, cell) {
  if (cell.classList.contains('marked')) {
    cell.classList.remove('marked');
    state.markedSongs = state.markedSongs.filter(s => s !== song);
  } else {
    cell.classList.add('marked');
    state.markedSongs.push(song);
  }

  updateProgress();
  checkIfCanClaimBingo();
}

// Update progress bar
function updateProgress() {
  const progress = (state.markedSongs.length / state.playerCard.length) * 100;
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }
}

// Check if player can claim bingo
function checkIfCanClaimBingo() {
  const canClaim = checkBingo(state.markedSongs, state.playerCard);
  const bingoBtn = document.getElementById('bingo-btn');
  if (bingoBtn) {
    bingoBtn.disabled = !canClaim;
  }
}

// Claim bingo
async function claimBingo() {
  if (!database || !state.roomCode || !state.playerId) return;

  try {
    await database.ref(`rooms/${state.roomCode}/players/${state.playerId}/hasBingo`).set(true);
    await database.ref(`rooms/${state.roomCode}/players/${state.playerId}/bingoTime`).set(Date.now());
    
    showWinnerModal();
  } catch (error) {
    console.error('Error claiming bingo:', error);
  }
}

// Show winner modal
function showWinnerModal() {
  const modal = document.createElement('div');
  modal.className = 'winner-modal';
  modal.innerHTML = `
    <div class="winner-content">
      <div class="winner-emoji">🎉</div>
      <h2>¡BINGO!</h2>
      <p style="font-size: 1.2rem; color: var(--muted);">¡Has completado tu cartón!</p>
      <p style="font-size: 0.9rem; color: var(--muted); margin-top: 1rem;">
        Esperando validación del host...
      </p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Listen to room updates
function listenToRoomUpdates(roomCode) {
  if (!database) return;

  const roomRef = database.ref(`rooms/${roomCode}`);

  // Listen to players
  roomRef.child('players').on('value', (snapshot) => {
    const players = snapshot.val() || {};
    updatePlayersList(players);
  });

  // Listen to marked songs (for host)
  if (state.isHost) {
    roomRef.child('markedSongs').on('value', (snapshot) => {
      const markedSongs = snapshot.val() || [];
      updateMarkedSongs(markedSongs);
    });

    roomRef.child('songs').once('value', (snapshot) => {
      const songs = snapshot.val() || [];
      renderSongsList(songs);
    });
  }

  // Listen to game start (for players)
  if (!state.isHost) {
    roomRef.child('gameStarted').on('value', (snapshot) => {
      if (snapshot.val() === true && state.playerCard) {
        showBingoCard(state.playerCard);
      }
    });

    // Listen to marked songs to highlight them
    roomRef.child('markedSongs').on('value', (snapshot) => {
      const markedSongs = snapshot.val() || [];
      highlightMarkedSongs(markedSongs);
    });
  }

  // Listen to game end
  roomRef.child('gameEnded').on('value', (snapshot) => {
    if (snapshot.val() === true) {
      alert('El juego ha finalizado. Gracias por jugar!');
      setTimeout(() => window.location.href = 'online.html', 2000);
    }
  });
}

// Update players list
function updatePlayersList(players) {
  const playersList = document.getElementById('players-list');
  if (!playersList) return;

  const playersArray = Object.values(players);
  const playerCount = document.getElementById('player-count');
  if (playerCount) {
    playerCount.textContent = playersArray.length;
  }

  playersList.innerHTML = playersArray.map(player => `
    <div class="player-card ${player.hasBingo ? 'winner' : ''}">
      <div class="player-info">
        <div class="player-avatar">${sanitize(player.avatar)}</div>
        <div>
          <div style="font-weight: 600;">${sanitize(player.name)}</div>
          <div style="font-size: 0.85rem; color: var(--muted);">
            ${player.markedSongs ? player.markedSongs.length : 0}/${player.card ? player.card.length : 0} marcadas
          </div>
        </div>
      </div>
      <div class="player-status">
        ${player.hasBingo ? '🎉' : '⏳'}
      </div>
    </div>
  `).join('');
}

// Render songs list for host
function renderSongsList(songs) {
  const songsList = document.getElementById('songs-list');
  if (!songsList) return;

  songsList.innerHTML = songs.map((song, index) => `
    <div class="song-item" data-song="${sanitize(song)}" data-index="${index}">
      <input type="checkbox" id="song-${index}" />
      <label for="song-${index}" style="cursor: pointer; flex: 1;">${sanitize(song)}</label>
    </div>
  `).join('');

  // Add event listeners
  songsList.querySelectorAll('.song-item').forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async (e) => {
      const song = item.dataset.song;
      await toggleMarkedSong(song, e.target.checked);
      
      if (e.target.checked) {
        item.classList.add('marked');
      } else {
        item.classList.remove('marked');
      }
    });
  });
}

// Toggle marked song (host only)
async function toggleMarkedSong(song, isMarked) {
  if (!database || !state.roomCode) return;

  try {
    const markedSongsRef = database.ref(`rooms/${state.roomCode}/markedSongs`);
    const snapshot = await markedSongsRef.once('value');
    let markedSongs = snapshot.val() || [];

    if (isMarked && !markedSongs.includes(song)) {
      markedSongs.push(song);
    } else if (!isMarked) {
      markedSongs = markedSongs.filter(s => s !== song);
    }

    await markedSongsRef.set(markedSongs);
  } catch (error) {
    console.error('Error toggling marked song:', error);
  }
}

// Update marked songs display
function updateMarkedSongs(markedSongs) {
  const songsList = document.getElementById('songs-list');
  if (!songsList) return;

  songsList.querySelectorAll('.song-item').forEach(item => {
    const song = item.dataset.song;
    const checkbox = item.querySelector('input[type="checkbox"]');
    
    if (markedSongs.includes(song)) {
      checkbox.checked = true;
      item.classList.add('marked');
    } else {
      checkbox.checked = false;
      item.classList.remove('marked');
    }
  });
}

// Highlight marked songs for players
function highlightMarkedSongs(markedSongs) {
  const cells = document.querySelectorAll('.bingo-cell');
  cells.forEach(cell => {
    const song = cell.dataset.song;
    if (markedSongs.includes(song)) {
      cell.classList.add('active');
    }
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Generate player ID
  state.playerId = generateId();

  // Create room button
  const createRoomBtn = document.getElementById('create-room-btn');
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', createRoom);
  }

  // Join room button
  const joinRoomBtn = document.getElementById('join-room-btn');
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
      const roomCode = document.getElementById('room-code-input').value;
      joinRoom(roomCode);
    });
  }

  // Allow enter key to join room
  const roomCodeInput = document.getElementById('room-code-input');
  if (roomCodeInput) {
    roomCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const roomCode = roomCodeInput.value;
        joinRoom(roomCode);
      }
    });
  }
});
