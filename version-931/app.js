(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('.js-hero').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;
      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('.js-search-area').forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      var filters = Array.prototype.slice.call(area.querySelectorAll('[data-filter]'));
      var scope = area.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('[data-empty-message]');
      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }
      function apply() {
        var query = normalize(input ? input.value : '');
        var active = {};
        filters.forEach(function (select) {
          active[select.getAttribute('data-filter')] = normalize(select.value);
        });
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category,
            card.dataset.tags
          ].join(' '));
          var ok = !query || haystack.indexOf(query) !== -1;
          Object.keys(active).forEach(function (key) {
            if (active[key] && normalize(card.dataset[key]) !== active[key]) {
              ok = false;
            }
          });
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      filters.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  });
})();

function initPlayer(videoId, url) {
  var video = document.getElementById(videoId);
  var overlay = document.querySelector('[data-player-trigger="' + videoId + '"]');
  var started = false;
  var hlsInstance = null;
  if (!video) {
    return;
  }
  function requestPlay() {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }
  function begin() {
    if (!started) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
      } else {
        video.src = url;
      }
      started = true;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    requestPlay();
  }
  if (overlay) {
    overlay.addEventListener('click', begin);
  }
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      begin();
    } else {
      video.pause();
    }
  });
  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
