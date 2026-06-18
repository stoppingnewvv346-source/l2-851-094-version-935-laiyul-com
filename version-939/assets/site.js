
(function(){
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  if(navToggle && navLinks){
    navToggle.addEventListener('click', ()=>{
      navLinks.classList.toggle('open');
    });
  }

  const searchForms = document.querySelectorAll('[data-site-search]');
  searchForms.forEach(form => {
    const input = form.querySelector('input');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const q = (input?.value || '').trim();
      const target = form.getAttribute('data-target') || 'search.html';
      const url = q ? `${target}?q=${encodeURIComponent(q)}` : target;
      window.location.href = url;
    });
  });

  const slider = document.querySelector('[data-hero-slider]');
  if(slider){
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    if(slides.length > 1){
      let idx = 0;
      const activate = (n)=>{
        slides.forEach((s,i)=>s.classList.toggle('active', i===n));
        const dots = slider.parentElement.querySelectorAll('[data-hero-dot]');
        dots.forEach((d,i)=>d.classList.toggle('active', i===n));
      };
      const next = ()=>{ idx = (idx + 1) % slides.length; activate(idx); };
      activate(0);
      let timer = setInterval(next, 5000);
      slider.addEventListener('mouseenter', ()=>clearInterval(timer));
      slider.addEventListener('mouseleave', ()=>{ timer = setInterval(next, 5000); });
      slider.parentElement.querySelectorAll('[data-hero-dot]').forEach(dot=>{
        dot.addEventListener('click', ()=>{
          idx = Number(dot.getAttribute('data-index')) || 0;
          activate(idx);
        });
      });
    }
  }

  const filters = document.querySelectorAll('[data-filter-input]');
  filters.forEach(input => {
    const targetSel = input.getAttribute('data-filter-target');
    const cards = targetSel ? document.querySelectorAll(targetSel) : [];
    input.addEventListener('input', ()=>{
      const q = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
      const empty = document.querySelector('[data-empty-state]');
      if(empty){
        const visible = Array.from(cards).some(c => c.style.display !== 'none');
        empty.hidden = visible;
      }
    });
  });

  const sorters = document.querySelectorAll('[data-sort-target]');
  sorters.forEach(select => {
    const targetSel = select.getAttribute('data-sort-target');
    const container = targetSel ? document.querySelector(targetSel) : null;
    if(!container) return;
    const cards = Array.from(container.children);
    const score = (el)=> parseFloat(el.getAttribute('data-score') || '0');
    const year = (el)=> parseInt(el.getAttribute('data-year') || '0', 10);
    select.addEventListener('change', ()=>{
      const v = select.value;
      const sorted = [...cards].sort((a,b)=>{
        if(v === 'year-desc') return year(b)-year(a) || score(b)-score(a);
        if(v === 'year-asc') return year(a)-year(b) || score(b)-score(a);
        if(v === 'score-asc') return score(a)-score(b);
        return score(b)-score(a);
      });
      sorted.forEach(node => container.appendChild(node));
    });
  });

  const player = document.querySelector('[data-player]');
  const playOverlay = document.querySelector('[data-play-overlay]');
  const playBtn = document.querySelector('[data-play-button]');
  if(player && playBtn){
    const source = player.getAttribute('data-src');
    let started = false;
    const startPlay = () => {
      if(started) return;
      started = true;
      const overlay = document.querySelector('[data-play-overlay]');
      if(overlay) overlay.classList.add('hidden');
      const video = player;
      const boot = () => video.play().catch(()=>{});
      if(window.Hls && Hls.isSupported()){
        const hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, boot);
      }else if(video.canPlayType('application/vnd.apple.mpegurl')){
        video.src = source;
        video.addEventListener('loadedmetadata', boot, {once:true});
      }else{
        video.src = source;
        boot();
      }
      setTimeout(boot, 300);
    };
    playBtn.addEventListener('click', startPlay);
    if(playOverlay) playOverlay.addEventListener('click', startPlay);
    player.addEventListener('click', startPlay);
  }
})();
