// ====================== STEVE'S AWESOME WORLD — SCRIPT ======================

/* ---------- Small storage helpers ---------- */
function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

/* ---------- Greeting ---------- */
(function greet() {
  const el = document.getElementById('greeting');
  if (!el) return;
  const hour = new Date().getHours();
  let msg = 'Good evening, Steve! 🌙';
  if (hour < 12) msg = 'Good morning, Steve! ☀️';
  else if (hour < 18) msg = 'Good afternoon, Steve! 🌤️';
  el.textContent = msg;
})();

/* ---------- Mobile nav toggle ---------- */
(function nav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- Reduce motion toggle ---------- */
(function motion() {
  const btn = document.getElementById('motionToggle');
  if (!btn) return;

  function apply(isReduced) {
    document.body.classList.toggle('reduced-motion', isReduced);
    btn.setAttribute('aria-pressed', String(isReduced));
    btn.textContent = isReduced ? '▶️ Restore motion' : '⏸️ Reduce motion';
  }

  btn.addEventListener('click', () => {
    const isReduced = !document.body.classList.contains('reduced-motion');
    apply(isReduced);
    localStorage.setItem('reducedMotion', isReduced ? '1' : '0');
  });

  apply(localStorage.getItem('reducedMotion') === '1');
})();

/* ---------- Stats (jokes read / games launched) ---------- */
const stats = getJSON('steveStats', { jokes: 0, games: 0 });
function renderStats() {
  const jokesEl = document.getElementById('statJokes');
  const gamesEl = document.getElementById('statGames');
  if (jokesEl) jokesEl.textContent = stats.jokes;
  if (gamesEl) gamesEl.textContent = stats.games;
}
function bumpStat(key) {
  stats[key] = (stats[key] || 0) + 1;
  setJSON('steveStats', stats);
  renderStats();
}
renderStats();

/* ---------- Super power button + confetti ---------- */
(function superPower() {
  const btn = document.getElementById('superPowerBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    launchConfetti();
  });
})();

function launchConfetti() {
  if (document.body.classList.contains('reduced-motion')) return;
  const colors = ['#ff6b35', '#ffd23f', '#00e5ff', '#ff4d6d', '#e9edff'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';
    piece.style.opacity = String(0.7 + Math.random() * 0.3);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

/* ---------- Games: data-driven grid with search, filter, favorites ---------- */
const games = [
  { name: 'Minecraft Classic', emoji: '⛏️', desc: 'Free browser build mode', url: 'https://www.minecraft.net/en-us/play', tags: ['building'] },
  { name: 'CrazyGames Kids', emoji: '🏎️', desc: 'Racing, action & more', url: 'https://kids.crazygames.com/', tags: ['action', 'racing'] },
  { name: 'Poki Kids', emoji: '🚀', desc: 'Huge collection', url: 'https://kids.poki.com/', tags: ['action', 'building'] },
  { name: 'Coolmath Games', emoji: '🧠', desc: 'Strategy + fun', url: 'https://www.coolmathgames.com/', tags: ['learning'] },
  { name: 'Safe Kid Games', emoji: '🛡️', desc: 'All safe & clean', url: 'https://www.safekidgames.com/', tags: ['action'] },
  { name: 'Nickelodeon Games', emoji: '🧽', desc: 'SpongeBob, Loud House...', url: 'https://www.nick.com/games/all-games', tags: ['action'] },
  { name: 'Google Interland', emoji: '🌐', desc: 'Fun + learn internet safety', url: 'https://beinternetawesome.withgoogle.com/en_us/interland', tags: ['learning'] },
  { name: 'Nat Geo Kids Games', emoji: '🌍', desc: 'Adventure & animals', url: 'https://kids.nationalgeographic.com/games', tags: ['learning', 'action'] },
  { name: 'Funbrain Games', emoji: '📚', desc: 'Math, reading & more', url: 'https://www.funbrain.com/games', tags: ['learning'] },
];

const favKey = 'steveFavGames';
let favorites = new Set(getJSON(favKey, []));

function saveFavorites() {
  setJSON(favKey, Array.from(favorites));
}

function renderGames() {
  const grid = document.getElementById('gameGrid');
  if (!grid) return;
  const query = (document.getElementById('gameSearch')?.value || '').trim().toLowerCase();
  const activeFilter = document.querySelector('.filter-chip[aria-pressed="true"]')?.dataset.filter || 'all';

  const filtered = games.filter(g => {
    const matchesQuery = !query || g.name.toLowerCase().includes(query) || g.desc.toLowerCase().includes(query);
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'favorites' && favorites.has(g.name)) ||
      g.tags.includes(activeFilter);
    return matchesQuery && matchesFilter;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-msg';
    p.textContent = 'No games match that search yet — try another word! 🔭';
    grid.appendChild(p);
    return;
  }

  filtered.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';

    const isFav = favorites.has(g.name);
    const star = document.createElement('button');
    star.className = 'fav-star';
    star.type = 'button';
    star.setAttribute('aria-pressed', String(isFav));
    star.setAttribute('aria-label', (isFav ? 'Remove ' : 'Add ') + g.name + (isFav ? ' from favorites' : ' to favorites'));
    star.textContent = isFav ? '⭐' : '☆';
    star.addEventListener('click', () => {
      if (favorites.has(g.name)) favorites.delete(g.name);
      else favorites.add(g.name);
      saveFavorites();
      renderGames();
    });

    const link = document.createElement('a');
    link.className = 'game-btn';
    link.href = g.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.addEventListener('click', () => bumpStat('games'));
    link.innerHTML = `${g.emoji} ${g.name} <span class="game-desc">${g.desc}</span>`;

    card.appendChild(star);
    card.appendChild(link);
    grid.appendChild(card);
  });
}

(function gameControls() {
  const search = document.getElementById('gameSearch');
  const chips = document.querySelectorAll('.filter-chip');
  if (search) search.addEventListener('input', renderGames);
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      renderGames();
    });
  });
  renderGames();
})();

/* ---------- Jokes: no immediate repeats + counter ---------- */
const jokes = [
  "Why don't skeletons fight each other? They don't have the guts! 💀",
  "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks! 🦖",
  "Why was the math book sad? It had too many problems! 📚",
  "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
  "What do you call fake spaghetti? An impasta! 🍝",
  "Why can't you give Elsa a balloon? Because she'll let it go! ❄️",
  "Why did the astronaut break up with his girlfriend? He needed space! 🚀",
  "What do you call a fish with no eyes? A fsh! 🐟",
  "Why did the bicycle fall over? It was two-tired! 🚲",
  "What did one wall say to the other? I'll meet you at the corner! 🧱",
];

let jokeBag = [];
function refillBag() {
  jokeBag = jokes.map((_, i) => i);
  for (let i = jokeBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jokeBag[i], jokeBag[j]] = [jokeBag[j], jokeBag[i]];
  }
}

function newJoke() {
  if (jokeBag.length === 0) refillBag();
  const idx = jokeBag.pop();
  const el = document.getElementById('joke');
  if (el) el.textContent = jokes[idx];
  bumpStat('jokes');
  const meta = document.getElementById('jokeMeta');
  if (meta) meta.textContent = `Joke #${stats.jokes} · ${jokes.length} in the vault`;
}

document.getElementById('newJokeBtn')?.addEventListener('click', newJoke);

/* ---------- Fun facts / mission log ---------- */
const facts = [
  "🌕 The Moon is slowly drifting away from Earth — about 3.8 cm every year.",
  "🪐 Saturn would float in water if you had a bathtub big enough!",
  "☄️ A day on Venus is longer than its year.",
  "🌌 There are more stars in the universe than grains of sand on every beach on Earth.",
  "🚀 The Apollo 11 guidance computer had less processing power than a modern calculator.",
  "🌠 Neutron stars are so dense a teaspoon would weigh about a billion tons.",
];
let factIndex = 0;
function showFact() {
  const el = document.getElementById('factText');
  if (!el) return;
  el.textContent = facts[factIndex % facts.length];
  factIndex++;
}
document.getElementById('nextFactBtn')?.addEventListener('click', showFact);
showFact();

/* ---------- Gallery lightbox ---------- */
(function lightbox() {
  const box = document.getElementById('lightbox');
  const boxImg = document.getElementById('lightboxImg');
  const boxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  if (!box || !boxImg || !closeBtn) return;

  let lastFocused = null;

  function open(imgEl, caption) {
    lastFocused = document.activeElement;
    boxImg.src = imgEl.src;
    boxImg.alt = imgEl.alt;
    if (boxCaption) boxCaption.textContent = caption;
    box.classList.add('open');
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    box.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    if (lastFocused) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  document.querySelectorAll('.photo-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const img = card.querySelector('img');
    const caption = card.querySelector('p')?.textContent || '';
    const activate = () => open(img, caption);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  closeBtn.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
})();

/* ---------- Back to top ---------- */
(function backToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  });
})();
