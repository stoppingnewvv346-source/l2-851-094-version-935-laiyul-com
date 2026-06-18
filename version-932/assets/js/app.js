(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileLinks = document.querySelector('.mobile-links');

  if (menuButton && mobileLinks) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileLinks.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(nextSlide, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
      startHero();
    });
  });

  var prevButton = document.querySelector('.hero-prev');
  var nextButton = document.querySelector('.hero-next');

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startHero();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startHero();
    });
  }

  showSlide(0);
  startHero();

  var searchInput = document.querySelector('.js-search');
  var clearButton = document.querySelector('.clear-search');
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!searchInput) {
      return;
    }
    var query = normalize(searchInput.value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      filterCards();
      searchInput.focus();
    });
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var status = player.querySelector('.player-status');
    var stream = player.getAttribute('data-stream');
    var prepared = false;
    var hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function prepare() {
      if (prepared || !video || !stream) {
        return;
      }
      prepared = true;
      setStatus('正在加载');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          capLevelToPlayerSize: true,
          maxBufferLength: 30
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('准备播放');
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus('播放失败，请稍后重试');
        });
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          setStatus('准备播放');
        }, { once: true });
      }
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('点击视频继续播放');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('playing');
        setStatus('播放中');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停');
        }
      });
      video.addEventListener('ended', function () {
        setStatus('播放结束');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
})();
