(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('is-active', position === heroIndex);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('is-active', position === heroIndex);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    showHero(0);
    startHero();
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        startHero();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        showHero(position);
        startHero();
      });
    });
  }

  document.querySelectorAll('[data-scroll-wrap]').forEach(function (wrap) {
    const rail = wrap.querySelector('[data-scroll-rail]');
    const left = wrap.querySelector('[data-scroll-left]');
    const right = wrap.querySelector('[data-scroll-right]');
    if (!rail) {
      return;
    }
    if (left) {
      left.addEventListener('click', function () {
        rail.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }
    if (right) {
      right.addEventListener('click', function () {
        rail.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  const catalogInput = document.querySelector('[data-catalog-search]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const emptyState = document.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  function textValue(value) {
    return String(value || '').toLowerCase();
  }

  function cardText(card) {
    return textValue([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.category
    ].join(' '));
  }

  function applyCatalog() {
    if (!cards.length) {
      return;
    }
    const query = textValue(catalogInput ? catalogInput.value.trim() : '');
    const filter = textValue(activeFilter);
    let visible = 0;
    cards.forEach(function (card) {
      const content = cardText(card);
      const matchesQuery = !query || content.indexOf(query) !== -1;
      const matchesFilter = filter === 'all' || content.indexOf(filter) !== -1;
      const ok = matchesQuery && matchesFilter;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (catalogInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      catalogInput.value = query;
    }
    catalogInput.addEventListener('input', applyCatalog);
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyCatalog();
      });
    });
    applyCatalog();
  }
})();
