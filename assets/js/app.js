
/* app.js - Bingo Musical (Cartoon style) */
/* Basic client logic: load playlists, render UI, generate bingo cards, cookie consent, offline banner */
const sanitize = s => (typeof s === 'string') ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : '';

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  setupMenu();
  setupCookie();
  setupOfflineBanner();

  let playlists = {};
  try {
    const resp = await fetch('/data/playlists.json');
    playlists = await resp.json();
  } catch (e) {
    console.warn('No se cargó data/playlists.json, usando datos por defecto.', e);
    playlists = {
      "Música de Otoño": ["Leaves - Ben&Ben","Autumn Leaves - Eva Cassidy","Harvest Moon - Neil Young"],
      "Cumpleaños": ["Happy - Pharrell Williams","Birthday - The Beatles","Celebration - Kool & The Gang"],
      "Navidad": ["All I Want For Christmas Is You - Mariah Carey","Last Christmas - Wham!","Feliz Navidad - José Feliciano"]
    };
  }

  renderSections(playlists);
  populateSelect(playlists);

  document.getElementById('generateBtn').addEventListener('click', () => generateBingo(playlists));
});

function setupMenu(){
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('main-menu');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('show');
  });
}

function setupCookie(){
  const consent = localStorage.getItem('cookie_consent');
  const bar = document.getElementById('cookie-consent');
  if(consent === 'accepted') { bar.style.display='none'; return; }
  document.getElementById('accept-cookies').addEventListener('click', () => {
    localStorage.setItem('cookie_consent','accepted'); bar.style.display='none';
  });
  document.getElementById('decline-cookies').addEventListener('click', () => {
    localStorage.setItem('cookie_consent','declined'); bar.style.display='none';
  });
}

function setupOfflineBanner(){
  function updateOnlineStatus(){
    const banner = document.getElementById('offline-banner');
    if(navigator.onLine) banner.hidden = true;
    else banner.hidden = false;
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

function renderSections(playlists){
  const container = document.getElementById('secciones');
  container.innerHTML = '';
  Object.entries(playlists).forEach(([title, tracks]) => {
    const div = document.createElement('section');
    div.className = 'card';
    const h = document.createElement('h3');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = `${tracks.length} canciones`;
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.textContent = 'Usar en Bingo';
    btn.addEventListener('click', () => {
      sessionStorage.setItem('bingoSongs', JSON.stringify(tracks));
      alert('Lista copiada al generador de Bingo.');
      window.location.hash = '#bingo';
    });
    div.appendChild(h);
    div.appendChild(p);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

function populateSelect(playlists){
  const sel = document.getElementById('selectPlaylist');
  sel.innerHTML = '';
  Object.keys(playlists).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    sel.appendChild(opt);
  });
}

function generateBingo(playlists){
  const sel = document.getElementById('selectPlaylist').value;
  let songs = playlists[sel] || [];
  const stored = sessionStorage.getItem('bingoSongs');
  if(stored) songs = JSON.parse(stored);

  if(!songs || songs.length === 0){
    alert('No hay canciones disponibles en la lista seleccionada.');
    return;
  }

  const numSongs = Math.max(3, Math.min(50, Number(document.getElementById('numSongs').value) || 12));
  const numCards = Math.max(1, Math.min(200, Number(document.getElementById('numCards').value) || 4));
  const output = document.getElementById('bingo-output');
  output.innerHTML = '';

  for(let c=0;c<numCards;c++){
    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('h4');
    title.textContent = `Cartón ${c+1}`;
    card.appendChild(title);

    const pool = [...songs];
    const chosen = [];
    for(let i=0;i<numSongs;i++){
      if(pool.length === 0) break;
      const idx = Math.floor(Math.random()*pool.length);
      chosen.push(pool.splice(idx,1)[0]);
    }

    const ol = document.createElement('ol');
    chosen.forEach(s => {
      const li = document.createElement('li');
      li.textContent = sanitize(s);
      ol.appendChild(li);
    });

    // download button
    const dl = document.createElement('button');
    dl.className = 'btn ghost';
    dl.textContent = 'Descargar';
    dl.addEventListener('click', () => downloadCard(chosen, c+1));

    card.appendChild(ol);
    card.appendChild(dl);
    output.appendChild(card);
  }
}

function downloadCard(lines, index){
  const text = `Cartón ${index}\n\n` + lines.map((l,i)=>`${i+1}. ${l}`).join('\n');
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carton-${index}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
