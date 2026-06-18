(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setSlide(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  });

  document.querySelectorAll('[data-search]').forEach(function (input) {
    var selector = input.getAttribute('data-target');
    var target = selector ? document.querySelector(selector) : null;
    var cards = target ? Array.prototype.slice.call(target.querySelectorAll('[data-card]')) : [];

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    });
  });

  document.querySelectorAll('[data-filter-row]').forEach(function (row) {
    var section = row.closest('.section');
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-card]')) : [];
    var chips = Array.prototype.slice.call(row.querySelectorAll('[data-chip]'));

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-chip');
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
          var show = value === 'all' || text.indexOf(value.toLowerCase()) !== -1;
          card.classList.toggle('is-filtered-out', !show);
        });
      });
    });
  });

  document.querySelectorAll('video[data-stream]').forEach(function (video) {
    var stream = video.getAttribute('data-stream');
    var box = video.closest('.player-card');
    var overlay = box ? box.querySelector('.player-overlay') : null;
    var ready = false;
    var hls = null;

    function bindStream() {
      if (ready || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegURL')) {
        video.src = stream;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
        return;
      }

      video.src = stream;
      ready = true;
    }

    function startVideo() {
      bindStream();
      var playTask = video.play();
      if (playTask && typeof playTask.then === 'function') {
        playTask.then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        }).catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      } else if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    bindStream();

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
