
(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const page = document.body.dataset.page || '';

  function setupFilters(root = document) {
    const search = root.querySelector('[data-filter-search]');
    const cards = Array.from(root.querySelectorAll('[data-title]'));
    const genre = root.querySelector('[data-filter-genre]');
    const region = root.querySelector('[data-filter-region]');
    const type = root.querySelector('[data-filter-type]');
    const year = root.querySelector('[data-filter-year]');
    const count = root.querySelector('[data-filter-count]');
    const chips = Array.from(root.querySelectorAll('[data-chip]'));

    function applyFilters() {
      const q = (search && search.value || '').trim().toLowerCase();
      const g = genre && genre.value || '';
      const r = region && region.value || '';
      const t = type && type.value || '';
      const y = year && year.value || '';
      let visible = 0;

      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const cg = card.dataset.genre || '';
        const cr = card.dataset.region || '';
        const ct = card.dataset.type || '';
        const cy = card.dataset.year || '';
        const match = (!q || title.includes(q) || tags.includes(q)) && (!g || cg === g) && (!r || cr === r) && (!t || ct === t) && (!y || cy === y);
        card.classList.toggle('hidden', !match);
        if (match) visible += 1;
      });

      if (count) count.textContent = '已显示 ' + visible + ' / ' + cards.length + ' 部';
    }

    if (search) search.addEventListener('input', applyFilters);
    [genre, region, type, year].forEach(el => el && el.addEventListener('change', applyFilters));
    chips.forEach(chip => chip.addEventListener('click', () => {
      const field = chip.dataset.field;
      const value = chip.dataset.value || '';
      const target = root.querySelector('[data-filter-' + field + ']');
      if (target) {
        target.value = value;
        applyFilters();
      }
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    }));

    const clear = root.querySelector('[data-filter-clear]');
    if (clear) clear.addEventListener('click', () => {
      if (search) search.value = '';
      if (genre) genre.value = '';
      if (region) region.value = '';
      if (type) type.value = '';
      if (year) year.value = '';
      chips.forEach(c => c.classList.remove('active'));
      applyFilters();
    });

    applyFilters();
  }

  function setupPlayer() {
    const wrapper = document.querySelector('[data-player]');
    if (!wrapper) return;
    const video = wrapper.querySelector('video');
    const source = wrapper.dataset.src;
    const overlay = wrapper.querySelector('[data-play-overlay]');
    if (!video || !source) return;

    let loaded = false;
    let hls = null;

    function loadSource() {
      if (loaded) return;
      loaded = true;
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    async function startPlay() {
      loadSource();
      try {
        await video.play();
        if (overlay) overlay.classList.add('hidden');
      } catch (err) {
        if (overlay) overlay.classList.remove('hidden');
      }
    }

    if (overlay) overlay.addEventListener('click', startPlay);
    video.addEventListener('click', () => {
      if (video.paused) startPlay();
      else video.pause();
    });
    video.addEventListener('play', () => overlay && overlay.classList.add('hidden'));
    video.addEventListener('pause', () => overlay && overlay.classList.remove('hidden'));

    // preload gently after first paint
    setTimeout(loadSource, 350);
  }

  if (document.querySelector('[data-filter-search]')) setupFilters();
  setupPlayer();
})();
