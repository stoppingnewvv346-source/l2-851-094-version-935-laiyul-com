(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
    selectAll("a", panel).forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      });
    });
  }

  function setupForms() {
    selectAll(".search-form, .search-page-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
        dot.setAttribute("aria-current", current === index ? "true" : "false");
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    selectAll("[data-filter-area]").forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var cards = selectAll("[data-filter-card]", area);
      if (!input || !cards.length) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-card") || "").toLowerCase();
          card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      if (!video) {
        return;
      }
      var source = video.querySelector("source");
      var sourceUrl = source ? source.getAttribute("src") : video.getAttribute("src");
      var ready = false;
      var hls = null;
      function prepare() {
        if (ready || !sourceUrl) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          video.__hls = hls;
        } else {
          video.src = sourceUrl;
        }
        ready = true;
      }
      function play() {
        prepare();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }
      video.addEventListener("pointerdown", prepare);
      video.addEventListener("play", function () {
        prepare();
        player.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  function setupSearchPage() {
    var mount = document.querySelector("[data-search-results]");
    if (!mount || !window.SiteMovies) {
      return;
    }
    var summary = document.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector(".search-page-form input[name='q']");
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var results = window.SiteMovies.filter(function (item) {
      if (!normalized) {
        return false;
      }
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category]
        .join(" ")
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (summary) {
      summary.textContent = query ? "搜索：“" + query + "”" : "输入关键词搜索片名、类型、年份或地区";
    }
    if (!query) {
      mount.innerHTML = '<div class="empty-state">请输入关键词开始搜索</div>';
      return;
    }
    if (!results.length) {
      mount.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
      return;
    }
    mount.innerHTML = results.map(function (item) {
      return [
        '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
        '  <div class="poster-frame">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <div class="poster-fade"></div>',
        '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '    <span class="play-badge"><span>▶</span></span>',
        '  </div>',
        '  <div class="card-body">',
        '    <h3 class="card-title">' + escapeHtml(item.title) + '</h3>',
        '    <div class="card-meta"><span class="region">' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
        '  </div>',
        '</a>'
      ].join("");
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupForms();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
