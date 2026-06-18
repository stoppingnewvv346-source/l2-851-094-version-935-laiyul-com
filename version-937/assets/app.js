
(function () {
  const svgCache = new Map();

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function svgDataUri(title, meta, accent, accent2) {
    const key = `${title}|${meta}|${accent}|${accent2}`;
    if (svgCache.has(key)) return svgCache.get(key);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${accent}"/>
            <stop offset="100%" stop-color="${accent2}"/>
          </linearGradient>
          <radialGradient id="r" cx="30%" cy="20%" r="80%">
            <stop offset="0%" stop-color="rgba(255,255,255,.20)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="720" height="1080" fill="#0f172a"/>
        <rect width="720" height="1080" fill="url(#g)" opacity=".95"/>
        <circle cx="575" cy="130" r="260" fill="url(#r)"/>
        <circle cx="120" cy="915" r="240" fill="rgba(15,23,42,.26)"/>
        <rect x="48" y="70" width="118" height="42" rx="21" fill="rgba(15,23,42,.32)"/>
        <text x="66" y="98" fill="#fff7ed" font-size="22" font-family="Arial, sans-serif">精选</text>
        <text x="56" y="610" fill="#fff" font-size="52" font-weight="700" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif">${escapeHtml(title).replace(/&lt;br&gt;/g,' ')}</text>
        <text x="56" y="680" fill="#ffedd5" font-size="28" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif">${escapeHtml(meta)}</text>
        <text x="56" y="820" fill="#fff7ed" font-size="18" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" opacity=".9">亚洲热门电影</text>
      </svg>`;
    const uri = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.replace(/\n\s+/g, ' '));
    svgCache.set(key, uri);
    return uri;
  }

  function fillFallbackImage(img) {
    if (!img || img.dataset.fallbackReady === '1') return;
    img.dataset.fallbackReady = '1';
    const title = img.dataset.title || img.alt || '影片海报';
    const meta = img.dataset.meta || '';
    const a = img.dataset.accent || '#f59e0b';
    const b = img.dataset.accent2 || '#2563eb';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = svgDataUri(title, meta, a, b);
    });
  }

  function initFallbackImages(scope) {
    (scope || document).querySelectorAll('img.poster-fallback').forEach(fillFallbackImage);
  }

  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      const hidden = panel.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!hidden));
    });
  }

  function initHeroCarousel() {
    const stage = document.querySelector('[data-hero-carousel]');
    if (!stage) return;
    const slides = [...stage.querySelectorAll('.hero-slide')];
    const dots = [...stage.querySelectorAll('[data-dot]')];
    const prev = stage.querySelector('[data-prev]');
    const next = stage.querySelector('[data-next]');
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((el, n) => el.classList.toggle('active', n === index));
      dots.forEach((el, n) => el.classList.toggle('active', n === index));
    }

    function play() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    }
    function stop() { if (timer) window.clearInterval(timer); timer = null; }
    if (prev) prev.addEventListener('click', () => { show(index - 1); play(); });
    if (next) next.addEventListener('click', () => { show(index + 1); play(); });
    dots.forEach((btn, i) => btn.addEventListener('click', () => { show(i); play(); }));
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);
    show(0); play();
  }

  function initSearchPage() {
    const root = document.querySelector('[data-search-page]');
    if (!root || !window.MOVIE_LIBRARY) return;
    const qInput = root.querySelector('[data-search-input]');
    const typeSelect = root.querySelector('[data-search-type]');
    const regionSelect = root.querySelector('[data-search-region]');
    const yearSelect = root.querySelector('[data-search-year]');
    const resultBox = root.querySelector('[data-search-results]');
    const countNode = root.querySelector('[data-search-count]');
    const hotBox = root.querySelector('[data-hot-box]');
    const params = new URLSearchParams(location.search);
    const initial = (params.get('q') || '').trim();
    if (qInput && initial) qInput.value = initial;

    function match(item) {
      const q = (qInput?.value || '').trim().toLowerCase();
      const type = typeSelect?.value || '';
      const region = regionSelect?.value || '';
      const year = yearSelect?.value || '';
      if (type && item.type !== type) return false;
      if (region && item.region !== region) return false;
      if (year && item.year !== year) return false;
      if (!q) return true;
      const pool = [item.title, item.type, item.region, item.genre, item.summary, ...(item.tags || [])].join(' ').toLowerCase();
      return pool.includes(q);
    }

    function card(item) {
      const tags = (item.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
      return `
        <a class="movie-card" href="${item.url}">
          <div class="movie-poster">
            <img class="poster-fallback" src="${item.cover}" alt="${escapeHtml(item.title)}" data-title="${escapeHtml(item.title)}" data-meta="${escapeHtml(item.region)} · ${escapeHtml(item.year)}" />
          </div>
          <div class="movie-meta">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="line"><span>${escapeHtml(item.year)}</span><span>${escapeHtml(item.type)}</span><span>${escapeHtml(item.region)}</span></div>
            <p>${escapeHtml(item.summary || '')}</p>
            <div class="chips" style="margin-top:12px">${tags}</div>
          </div>
        </a>`;
    }

    function render() {
      const items = window.MOVIE_LIBRARY.filter(match).slice(0, 240);
      if (countNode) countNode.textContent = String(items.length);
      if (resultBox) {
        if (!items.length) {
          resultBox.innerHTML = '<div class="search-empty">没有找到符合条件的影片。</div>';
        } else {
          resultBox.innerHTML = items.map(card).join('');
          initFallbackImages(resultBox);
        }
      }
    }

    if (hotBox) {
      hotBox.innerHTML = window.MOVIE_LIBRARY.slice(0, 20).map(item => `<a class="chip" href="${item.url}">${escapeHtml(item.title)}</a>`).join('');
    }
    [qInput, typeSelect, regionSelect, yearSelect].forEach(el => el && el.addEventListener('input', render));
    [typeSelect, regionSelect, yearSelect].forEach(el => el && el.addEventListener('change', render));
    render();
  }

  function initPlayer() {
    const box = document.querySelector('[data-player-box]');
    if (!box) return;
    const video = box.querySelector('video');
    const cover = box.querySelector('[data-player-cover]');
    const playBtn = box.querySelector('[data-player-play]');
    const source = box.dataset.source;
    if (!video || !source) return;
    let hls = null;
    let started = false;

    function begin() {
      if (started) return;
      started = true;
      if (cover) cover.classList.add('hidden');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 30 });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function onMeta() {
          video.removeEventListener('loadedmetadata', onMeta);
          video.play().catch(() => {});
        });
      } else {
        video.src = source;
        video.play().catch(() => {});
      }
    }

    if (cover) cover.addEventListener('click', begin);
    if (playBtn) playBtn.addEventListener('click', begin);
    video.addEventListener('click', begin);
    video.addEventListener('play', () => { if (cover) cover.classList.add('hidden'); });
  }

  function initDynamicRecommendations() {
    const block = document.querySelector('[data-home-recommend]');
    if (!block || !window.HOME_RECOMMENDS) return;
    const list = block.querySelector('[data-home-recommend-list]');
    if (!list) return;
    list.innerHTML = window.HOME_RECOMMENDS.map(item => `
      <a class="small-card" href="${item.url}">
        <img class="poster-fallback" src="${item.cover}" alt="${escapeHtml(item.title)}" data-title="${escapeHtml(item.title)}" data-meta="${escapeHtml(item.region)} · ${escapeHtml(item.year)}" />
        <div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.summary || '')}</p>
          <div class="tags">${(item.tags || []).slice(0,2).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        </div>
      </a>`).join('');
    initFallbackImages(list);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFallbackImages(document);
    initMobileMenu();
    initHeroCarousel();
    initSearchPage();
    initPlayer();
    initDynamicRecommendations();
  });
})();
