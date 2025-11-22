
/* app.js - Bingo Musical (Cartoon style) */
/* Basic client logic: load playlists, render UI, generate bingo cards, cookie consent, offline banner, downloadable cards, Spotify integration */
const sanitize = s => (typeof s === 'string') ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : '';

let spotifyData = {};

  document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  setupMenu();
  setupCookie();
  setupOfflineBanner();
  setupSpotifyModal();
  setupChristmasPopup();

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

  // Load Spotify playlists data
  try {
    const spotifyResp = await fetch('/data/spotify-playlists.json');
    spotifyData = await spotifyResp.json();
  } catch (e) {
    console.warn('No se cargó spotify-playlists.json', e);
  }

  renderSections(playlists);
  populateSelect(playlists);
  await renderDownloadableCards();
  await renderFeaturedCards();

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

async function renderDownloadableCards(){
  const container = document.getElementById('downloadable-cards');
  if(!container) return;
  
  container.innerHTML = '<p style="text-align:center;color:var(--muted);">Cargando cartones...</p>';

  try {
    const resp = await fetch('/data/downloadable-cards.json');
    const data = await resp.json();
    container.innerHTML = '';

    Object.entries(data).forEach(([key, category]) => {
      // Skip if no files and no subcategories
      if((!category.archivos || category.archivos.length === 0) && !category.subcategorias){
        return;
      }

      const section = document.createElement('div');
      section.className = 'downloadable-category';

      const header = document.createElement('div');
      header.className = 'category-header';
      const h3 = document.createElement('h3');
      h3.textContent = category.nombre;
      const desc = document.createElement('p');
      desc.textContent = category.descripcion;
      desc.className = 'category-desc';
      header.appendChild(h3);
      header.appendChild(desc);
      section.appendChild(header);

      // Render main category files
      if(category.archivos && category.archivos.length > 0){
        const filesGrid = document.createElement('div');
        filesGrid.className = 'files-grid';
        category.archivos.forEach(file => {
          filesGrid.appendChild(createDownloadCard(file, key));
        });
        section.appendChild(filesGrid);
      }

      // Render subcategories
      if(category.subcategorias){
        Object.entries(category.subcategorias).forEach(([subKey, subCat]) => {
          if(!subCat.archivos || subCat.archivos.length === 0) return;

          const subHeader = document.createElement('h4');
          subHeader.textContent = subCat.nombre;
          subHeader.className = 'subcategory-title';
          section.appendChild(subHeader);

          const subDesc = document.createElement('p');
          subDesc.textContent = subCat.descripcion;
          subDesc.className = 'category-desc';
          section.appendChild(subDesc);

          const filesGrid = document.createElement('div');
          filesGrid.className = 'files-grid';
          subCat.archivos.forEach(file => {
            filesGrid.appendChild(createDownloadCard(file, key));
          });
          section.appendChild(filesGrid);
        });
      }

      container.appendChild(section);
    });

    if(container.children.length === 0){
      container.innerHTML = '<p style="text-align:center;color:var(--muted);">No hay cartones disponibles aún. ¡Vuelve pronto!</p>';
    }

  } catch (e) {
    console.error('Error cargando cartones descargables:', e);
    container.innerHTML = '<p style="text-align:center;color:var(--muted);">Error al cargar los cartones. Por favor, intenta más tarde.</p>';
  }
}

function createDownloadCard(file, categoryKey){
  const card = document.createElement('div');
  card.className = 'download-card card';

  const title = document.createElement('h4');
  title.textContent = sanitize(file.nombre);
  
  const info = document.createElement('p');
  info.className = 'card-info';
  if(file.canciones > 0){
    info.textContent = `${file.canciones} canciones`;
  } else {
    info.textContent = 'En preparación';
    info.style.color = 'var(--muted)';
    info.style.fontStyle = 'italic';
  }

  const btnContainer = document.createElement('div');
  btnContainer.className = 'card-actions';

  // Only show download button if file has valid path
  if(file.ruta && file.ruta !== '#'){
    const downloadBtn = document.createElement('a');
    downloadBtn.href = `/${file.ruta}`;
    downloadBtn.download = file.ruta.split('/').pop();
    downloadBtn.className = 'btn primary';
    downloadBtn.textContent = 'Descargar';
    downloadBtn.setAttribute('aria-label', `Descargar ${file.nombre}`);
    btnContainer.appendChild(downloadBtn);
  }

  // Add Spotify button only if explicitly enabled in file config
  if(file.spotify === true && categoryKey && spotifyData[categoryKey]){
    const spotifyBtn = document.createElement('button');
    spotifyBtn.className = 'btn ghost spotify-btn';
    spotifyBtn.innerHTML = '🎵 Playlist';
    spotifyBtn.setAttribute('aria-label', 'Ver playlist en Spotify');
    spotifyBtn.addEventListener('click', () => openSpotifyModal(categoryKey));
    btnContainer.appendChild(spotifyBtn);
  }

  // Add request button if explicitly enabled in file config
  if(file.solicitar === true){
    const requestBtn = document.createElement('a');
    requestBtn.href = '#about';
    requestBtn.className = 'btn ghost';
    requestBtn.innerHTML = '📧 Solicitar cartones';
    requestBtn.setAttribute('aria-label', 'Solicitar estos cartones al administrador');
    requestBtn.title = 'Estos cartones están en preparación. Contáctanos para recibirlos.';
    btnContainer.appendChild(requestBtn);
  }

  card.appendChild(title);
  card.appendChild(info);
  card.appendChild(btnContainer);

  return card;
}

function setupSpotifyModal(){
  const modal = document.getElementById('spotify-modal');
  if(!modal){
    console.error('Modal de Spotify no encontrado en el DOM');
    return;
  }

  const closeBtn = modal.querySelector('.modal-close');
  if(!closeBtn){
    console.error('Botón de cierre no encontrado en el modal');
    return;
  }
  
  // Close button click
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.hidden = true;
    console.log('Modal cerrado por botón X');
  });

  // Close on overlay click (clicking outside the modal content)
  modal.addEventListener('click', (e) => {
    if(e.target === modal){
      modal.hidden = true;
      console.log('Modal cerrado por click en overlay');
    }
  });

  // Close on Esc key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && !modal.hidden){
      modal.hidden = true;
      console.log('Modal cerrado por tecla Escape');
    }
  });
}

function setupChristmasPopup(){
  const popup = document.getElementById('christmas-popup');
  if (!popup) return;

  const closeBtn = popup.querySelector('.christmas-popup-close');
  const dismissBtn = document.getElementById('christmas-popup-dismiss');
  
  // Check if popup should be shown
  const lastShown = localStorage.getItem('christmas_popup_last_shown');
  const today = new Date().toDateString();
  
  // Show popup once per day
  if (lastShown !== today) {
    // Delay popup appearance for better UX (2 seconds after page load)
    setTimeout(() => {
      popup.hidden = false;
      localStorage.setItem('christmas_popup_last_shown', today);
    }, 2000);
  }
  
  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      popup.hidden = true;
    });
  }
  
  // Dismiss button click
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      popup.hidden = true;
    });
  }
  
  // Close on overlay click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.hidden = true;
    }
  });
  
  // Close on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popup.hidden) {
      popup.hidden = true;
    }
  });
}

function openSpotifyModal(categoryKey){
  console.log('Abriendo modal para categoría:', categoryKey);
  console.log('Datos disponibles:', Object.keys(spotifyData));
  
  const modal = document.getElementById('spotify-modal');
  if(!modal){
    console.error('Modal no encontrado');
    return;
  }

  const data = spotifyData[categoryKey];
  
  if(!data || !data.playlists || data.playlists.length === 0){
    console.warn('No hay playlists para:', categoryKey);
    alert('No hay playlists disponibles para esta categoría.');
    return;
  }

  // Update modal content
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const playlistsContainer = document.getElementById('modal-playlists');

  if(modalTitle) modalTitle.textContent = data.nombre || 'Playlists en Spotify';
  if(modalDesc) modalDesc.textContent = data.descripcion || '';
  if(playlistsContainer) playlistsContainer.innerHTML = '';

  // Render playlists
  data.playlists.forEach(playlist => {
    const item = document.createElement('a');
    item.href = playlist.url;
    item.target = '_blank';
    item.rel = 'noopener noreferrer';
    item.className = 'playlist-item';

    const icon = document.createElement('span');
    icon.className = 'playlist-icon';
    icon.textContent = '🎵';

    const content = document.createElement('div');
    content.className = 'playlist-content';

    const name = document.createElement('strong');
    name.textContent = sanitize(playlist.nombre);

    const desc = document.createElement('small');
    desc.textContent = sanitize(playlist.descripcion);

    content.appendChild(name);
    content.appendChild(desc);

    item.appendChild(icon);
    item.appendChild(content);

    if(playlistsContainer) playlistsContainer.appendChild(item);
  });

  // Show modal
  modal.hidden = false;
  console.log('Modal mostrado correctamente');
}

async function renderFeaturedCards(){
  const container = document.getElementById('featured-cards');
  if(!container) return;

  try {
    const resp = await fetch('/data/downloadable-cards.json');
    const data = await resp.json();

    // Top 9: 3 grandes (20+ canciones), 3 medianos (12-15), 3 pequeños (<10)
    const featured = [
      // 3 GRANDES (20 canciones)
      { category: 'Navidad', fileIndex: 3 },          // Grandes 20 canciones
      { category: 'Clásicos Pop', fileIndex: 3 },     // Grandes 20 canciones  
      { category: 'Pop Latino', fileIndex: 3 },       // Grandes 20 canciones
      
      // 3 MEDIANOS (12 canciones)
      { category: 'Navidad', fileIndex: 2 },          // Medianos 12 canciones
      { category: 'Clásicos Pop', fileIndex: 2 },     // Medianos 12 canciones
      { category: 'Mix', subcategory: 'Mix 1', fileIndex: 1 }, // Mix MD 12 canciones
      
      // 3 PEQUEÑOS (8 canciones)
      { category: 'Otoño', fileIndex: 1 },            // Pequeños 8 canciones
      { category: 'Cumpleaños', fileIndex: 1 },       // Pequeños 8 canciones
      { category: 'Pop Latino', fileIndex: 1 }        // Pequeños 8 canciones
    ];

    featured.forEach(({ category, subcategory, fileIndex }) => {
      const cat = data[category];
      if(!cat) return;

      let file;
      if(subcategory && cat.subcategorias && cat.subcategorias[subcategory]){
        file = cat.subcategorias[subcategory].archivos[fileIndex];
      } else if(cat.archivos) {
        file = cat.archivos[fileIndex];
      }

      if(file){
        container.appendChild(createDownloadCard(file, category));
      }
    });

    if(container.children.length === 0){
      container.innerHTML = '<p style="text-align:center;color:var(--muted);">Próximamente cartones destacados.</p>';
    }

  } catch (e) {
    console.error('Error cargando cartones destacados:', e);
    container.innerHTML = '<p style="text-align:center;color:var(--muted);">Error al cargar cartones destacados.</p>';
  }
}

