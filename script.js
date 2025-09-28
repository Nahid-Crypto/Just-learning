// Basic demo data & behavior for the static prototype

const sample = [
  { id: 'm1', title: 'Phantom Blade', type: 'manga', tags: ['action','fantasy'], cover: 'https://picsum.photos/seed/p1/600/800', pages: [
    'https://picsum.photos/seed/p1a/1200/1800',
    'https://picsum.photos/seed/p1b/1200/1800',
    'https://picsum.photos/seed/p1c/1200/1800'
  ] },
  { id: 'a1', title: 'Star Drift', type: 'anime', tags: ['sci-fi'], cover: 'https://picsum.photos/seed/a1/600/800', trailer: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'm2', title: 'City of Threads', type: 'manga', tags: ['slice'], cover: 'https://picsum.photos/seed/p2/600/800', pages: [
    'https://picsum.photos/seed/p2a/1200/1800',
    'https://picsum.photos/seed/p2b/1200/1800'
  ]},
  { id: 'a2', title: 'Love & Lattes', type: 'anime', tags: ['romance'], cover: 'https://picsum.photos/seed/a2/600/800', trailer: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];

document.addEventListener('DOMContentLoaded', ()=> {
  document.getElementById('year').textContent = new Date().getFullYear();
  renderCards(sample);

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.documentElement;
  // default dark
  body.setAttribute('data-theme','dark');
  themeToggle.addEventListener('click', ()=>{
    const cur = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', cur);
    themeToggle.textContent = cur === 'light' ? 'Light' : 'Dark';
  });

  // search
  const search = document.getElementById('search');
  search.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase().trim();
    const filtered = sample.filter(s => s.title.toLowerCase().includes(q) || s.tags.join(' ').includes(q));
    renderCards(filtered);
  });

  // chips filter
  document.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const f = btn.dataset.filter;
      const filtered = (f === 'all') ? sample : sample.filter(s => s.tags.includes(f) || s.type === f);
      renderCards(filtered);
    });
  });

  // discover / latest buttons (demo)
  document.getElementById('openDiscover').addEventListener('click', ()=> { window.scrollTo({top:800,behavior:'smooth'}); });
  document.getElementById('openLatest').addEventListener('click', ()=> { window.scrollTo({top:1200,behavior:'smooth'}); });

  // global modal handlers
  document.body.addEventListener('click', (e)=>{
    // watch
    const watchBtn = e.target.closest('[data-watch]');
    if (watchBtn){
      const src = watchBtn.dataset.src;
      openVideo(src);
    }
    // read
    const readBtn = e.target.closest('[data-read]');
    if (readBtn){
      const id = readBtn.dataset.id;
      openReader(id);
    }
    // card buttons that have same attributes
    const cardWatch = e.target.closest('[data-watch]');
    if (cardWatch) openVideo(cardWatch.dataset.src);
  });

  // close modals
  document.querySelectorAll('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      closeModal(btn.closest('.overlay'));
    });
  });

  // overlay background click to close
  document.querySelectorAll('.overlay').forEach(ov=>{
    ov.addEventListener('click', (e)=>{
      if (e.target === ov) closeModal(ov);
    });
  });

  // reader controls
  window.readerState = { idx: 0, pages: [] };
  document.getElementById('prevPage').addEventListener('click', ()=> changePage(-1));
  document.getElementById('nextPage').addEventListener('click', ()=> changePage(1));
  document.getElementById('zoomRange').addEventListener('input', (e)=> {
    const imgs = document.querySelectorAll('#readerViewport img');
    imgs.forEach(img => img.style.transform = `scale(${e.target.value/100})`);
  });

  // video modal close stops playback
  const player = document.getElementById('player');
  document.getElementById('videoModal').addEventListener('click', (e)=>{
    // handled by overlay close
  });

});

/* ---------- render cards ---------- */
function renderCards(list){
  const container = document.getElementById('cards');
  container.innerHTML = '';
  if (!list.length){
    container.innerHTML = '<p style="color:var(--muted)">No results found</p>'; return;
  }
  for (const item of list){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy" />
      <div class="title">${escapeHtml(item.title)}</div>
      <div class="sub">${item.type === 'manga' ? 'Manga' : 'Anime'} • ${item.tags.join(', ')}</div>
      <div class="actions">
        ${item.type === 'manga' ? `<button class="btn small outline" data-read="true" data-id="${item.id}">Read</button>` : ''}
        ${item.trailer ? `<button class="btn small" data-watch="true" data-src="${item.trailer}">Watch</button>` : ''}
        <button class="btn small" onclick="toast('Added to Library')">Save</button>
      </div>
    `;
    container.appendChild(card);
  }
}

/* ---------- reader modal ---------- */
function openReader(id){
  const entry = sample.find(s=>s.id===id);
  if (!entry || !entry.pages) return alert('No pages available for this sample (demo).');

  const overlay = document.getElementById('readerModal');
  const viewport = document.getElementById('readerViewport');
  viewport.innerHTML = '';
  window.readerState.pages = entry.pages.slice();
  window.readerState.idx = 0;

  // add page images
  entry.pages.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = entry.title;
    viewport.appendChild(img);
  });

  updatePageIndicator();
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
}

function changePage(delta){
  const idx = window.readerState.idx + delta;
  if (idx < 0 || idx >= window.readerState.pages.length) return;
  window.readerState.idx = idx;
  // scroll image into view
  const imgs = document.querySelectorAll('#readerViewport img');
  const cur = imgs[window.readerState.idx];
  if (cur) cur.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  updatePageIndicator();
}

function updatePageIndicator(){
  const t = document.getElementById('pageIndicator');
  t.textContent = `${window.readerState.idx + 1} / ${window.readerState.pages.length}`;
}

/* ---------- video modal ---------- */
function openVideo(src){
  const overlay = document.getElementById('videoModal');
  const player = document.getElementById('player');
  player.src = src;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
  player.play().catch(()=>{ /* autoplay might be blocked */ });
}

function closeModal(overlay){
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
  // stop video if present
  const player = overlay.querySelector('video');
  if (player){
    player.pause();
    player.removeAttribute('src');
    try { player.load(); } catch {}
  }
}

/* ---------- small utilities ---------- */
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

function toast(msg){
  // tiny ephemeral message
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
    background:'var(--card)', color:'var(--text)', padding:'10px 14px', borderRadius:'10px', zIndex:200
  });
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', 1600);
  setTimeout(()=> t.remove(), 2200);
}
