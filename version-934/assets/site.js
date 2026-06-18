(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var activate = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        var next = function () {
            activate(current + 1);
        };
        var prev = function () {
            activate(current - 1);
        };
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        if (nextButton) {
            nextButton.addEventListener('click', next);
        }
        if (prevButton) {
            prevButton.addEventListener('click', prev);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                activate(i);
            });
        });
        setInterval(next, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    if (filterList && (filterInput || yearFilter)) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
        var applyFilter = function () {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.textContent].join(' ').toLowerCase();
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !year || card.dataset.year === year;
                card.classList.toggle('hidden', !(matchesKeyword && matchesYear));
            });
        };
        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
    }

    var searchInput = document.querySelector('[data-search-page-input]');
    var searchOutput = document.querySelector('[data-search-output]');
    if (searchInput && searchOutput && window.MOVIE_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        searchInput.value = query;
        if (query.trim()) {
            var needle = query.trim().toLowerCase();
            var results = window.MOVIE_INDEX.filter(function (item) {
                return [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(needle) !== -1;
            }).slice(0, 80);
            var html = '<div class="section-heading"><div><h2>搜索结果</h2><p>与“' + escapeHtml(query) + '”相关的片库内容</p></div></div>';
            if (results.length) {
                html += '<div class="movie-grid">' + results.map(renderSearchCard).join('') + '</div>';
            } else {
                html += '<div class="page-hero slim"><h2>暂无匹配内容</h2><p>可以换一个关键词继续搜索。</p></div>';
            }
            searchOutput.innerHTML = html;
        }
    }
})();

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch];
    });
}

function renderSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card compact">' +
        '<a class="poster-link" href="./' + item.file + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
}

function setupPlayer(videoId, src) {
    var video = document.getElementById(videoId);
    if (!video || !src) {
        return;
    }
    var shell = video.closest('[data-player]');
    var button = shell ? shell.querySelector('.play-overlay') : null;
    var loaded = false;
    var load = function () {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    };
    var start = function () {
        load();
        if (button) {
            button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };
    if (button) {
        button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });
    video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
            button.classList.remove('is-hidden');
        }
    });
}
