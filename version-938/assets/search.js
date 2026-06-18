(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var input = document.getElementById('searchInput');
  var title = document.getElementById('searchTitle');
  var hint = document.getElementById('searchHint');
  var results = document.getElementById('searchResults');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="play-hover">▶</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-meta">' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
          '</div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  if (input) {
    input.value = query;
  }

  if (!results) {
    return;
  }

  var q = normalize(query);
  var movies = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
  var matched = q ? movies.filter(function (movie) {
    var text = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' '));
    return text.indexOf(q) !== -1;
  }) : movies.slice(0, 24);

  if (title) {
    title.textContent = q ? '关键词：' + query : '热门精选';
  }
  if (hint) {
    hint.textContent = q ? '匹配结果如下，可直接进入详情页观看。' : '输入关键词可搜索片名、标签、地区、年份和题材。';
  }

  results.innerHTML = matched.slice(0, 200).map(card).join('');
}());
