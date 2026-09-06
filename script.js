/* ==========================================================================
   NOƆTRA — interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initLightbox();
  initParticles();
  Player.init();
});

/* --------------------------------------------------------------------------
   Mobile menu
   -------------------------------------------------------------------------- */
function initMenu() {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.getElementById('menu-principal');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   Gallery lightbox
   -------------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const bg = item.style.backgroundImage.slice(5, -2);
      img.src = bg;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    img.src = '';
  };

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* --------------------------------------------------------------------------
   Ambient starfield behind the hero player
   -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.2,
      s: Math.random() * 0.35 + 0.05,
      a: Math.random() * 0.6 + 0.2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#9b7bff';
    stars.forEach(star => {
      star.y -= star.s;
      if (star.y < 0) star.y = h;
      ctx.globalAlpha = star.a;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('resize', resize);
  resize();
  if (!prefersReducedMotion) draw(); else draw();
}

/* --------------------------------------------------------------------------
   Music player — one YouTube IFrame player, visible in the hero frame,
   driven by both the hero controls and the fixed bottom bar.
   -------------------------------------------------------------------------- */

const Player = {
  yt: null,
  ready: false,
  tracks: [],
  index: 0,
  shuffled: false,
  pollId: null,
  initialized: false,

  els: {},

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.tracks = Array.from(document.querySelectorAll('.music-card')).map(card => ({
      id: card.dataset.yt,
      title: card.dataset.title,
      art: card.querySelector('.album-art').style.backgroundImage,
      card
    }));

    this.els = {
      heroPlay: document.getElementById('heroPlay'),
      heroMute: document.getElementById('heroMute'),
      heroTime: document.getElementById('heroTime'),
      heroProgress: document.getElementById('heroProgress'),
      heroProgressFill: document.getElementById('heroProgressFill'),
      heroCollapse: document.getElementById('heroCollapse'),
      playerFrame: document.getElementById('playerFrame'),
      npPlay: document.getElementById('npPlay'),
      npPrev: document.getElementById('npPrev'),
      npNext: document.getElementById('npNext'),
      npShuffle: document.getElementById('npShuffle'),
      npTitle: document.getElementById('npTitle'),
      npArt: document.getElementById('npArt'),
      npTime: document.getElementById('npTime'),
      npProgress: document.getElementById('npProgress'),
      npProgressFill: document.getElementById('npProgressFill')
    };

    this.bindUI();
  },

  bindUI() {
    this.tracks.forEach((track, i) => {
      const btn = track.card.querySelector('.play-btn');
      btn.addEventListener('click', () => this.playIndex(i));
      track.card.querySelector('.album-art').addEventListener('click', () => this.playIndex(i));
    });

    this.els.heroPlay.addEventListener('click', () => this.toggle());
    this.els.npPlay.addEventListener('click', () => this.toggle());
    this.els.npNext.addEventListener('click', () => this.next());
    this.els.npPrev.addEventListener('click', () => this.prev());
    this.els.npShuffle.addEventListener('click', () => this.toggleShuffle());
    this.els.heroMute.addEventListener('click', () => this.toggleMute());

    this.els.heroCollapse.addEventListener('click', () => {
      this.els.playerFrame.classList.toggle('is-collapsed');
    });

    [this.els.heroProgress, this.els.npProgress].forEach(bar => {
      bar.addEventListener('click', e => this.seek(e, bar));
    });
  },

  ensureYT() {
    if (this.yt || !window.YT || !window.YT.Player) return;
    this.yt = new YT.Player('ytPlayer', {
      height: '100%',
      width: '100%',
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => { this.ready = true; },
        onStateChange: (e) => this.onStateChange(e)
      }
    });
  },

  playIndex(i) {
    this.index = i;
    const track = this.tracks[i];
    this.ensureYT();

    document.querySelectorAll('.music-card').forEach(c => c.classList.remove('is-active'));
    track.card.classList.add('is-active');

    this.els.npTitle.textContent = track.title;
    this.els.npArt.style.backgroundImage = track.art;

    const start = () => {
      if (!this.yt || !this.ready) return;
      this.yt.loadVideoById(track.id);
      this.yt.playVideo();
    };
    if (this.ready) start();
    else if (this.yt) setTimeout(start, 400);

    this.startPolling();
  },

  toggle() {
    if (!this.yt) { if (this.tracks.length) this.playIndex(this.index); return; }
    const state = this.yt.getPlayerState();
    if (state === YT.PlayerState.PLAYING) this.yt.pauseVideo();
    else this.yt.playVideo();
  },

  next() {
    if (!this.tracks.length) return;
    this.index = this.shuffled
      ? Math.floor(Math.random() * this.tracks.length)
      : (this.index + 1) % this.tracks.length;
    this.playIndex(this.index);
  },

  prev() {
    if (!this.tracks.length) return;
    this.index = (this.index - 1 + this.tracks.length) % this.tracks.length;
    this.playIndex(this.index);
  },

  toggleShuffle() {
    this.shuffled = !this.shuffled;
    this.els.npShuffle.style.color = this.shuffled ? 'var(--accent)' : '';
    this.els.npShuffle.style.borderColor = this.shuffled ? 'var(--accent)' : '';
  },

  toggleMute() {
    if (!this.yt) return;
    if (this.yt.isMuted()) { this.yt.unMute(); this.els.heroMute.textContent = '🔊'; }
    else { this.yt.mute(); this.els.heroMute.textContent = '🔇'; }
  },

  seek(e, bar) {
    if (!this.yt) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const duration = this.yt.getDuration();
    if (duration) this.yt.seekTo(duration * ratio, true);
  },

  onStateChange(e) {
    const playing = e.data === YT.PlayerState.PLAYING;
    this.els.heroPlay.textContent = playing ? '❚❚' : '▶';
    this.els.npPlay.textContent = playing ? '❚❚' : '▶';
    if (e.data === YT.PlayerState.ENDED) this.next();
  },

  startPolling() {
    if (this.pollId) return;
    this.pollId = setInterval(() => {
      if (!this.yt || !this.yt.getCurrentTime) return;
      const cur = this.yt.getCurrentTime() || 0;
      const dur = this.yt.getDuration() || 0;
      const ratio = dur ? (cur / dur) * 100 : 0;

      this.els.heroProgressFill.style.width = ratio + '%';
      this.els.npProgressFill.style.width = ratio + '%';

      const label = `${fmt(cur)} / ${fmt(dur)}`;
      this.els.heroTime.textContent = label;
      this.els.npTime.textContent = label;
    }, 500);
  }
};

function fmt(sec) {
  sec = Math.floor(sec || 0);
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// YouTube IFrame API calls this global once its script has loaded.
function onYouTubeIframeAPIReady() {
  Player.init();
  Player.ensureYT();
  window.__noctraPlayer = Player;
}

// If the API script already loaded before this file ran, init immediately.
if (window.YT && window.YT.Player) {
  onYouTubeIframeAPIReady();
}
