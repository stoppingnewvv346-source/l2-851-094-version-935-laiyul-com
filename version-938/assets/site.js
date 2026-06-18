(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      toggle.textContent = expanded ? '☰' : '×';
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (form) {
    var scopeId = form.getAttribute('data-filter-scope');
    var scope = document.getElementById(scopeId);
    var input = form.querySelector('[data-filter-input]');
    var select = form.querySelector('[data-sort-select]');

    if (!scope) {
      return;
    }

    var originalItems = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var items = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));

      items.forEach(function (item) {
        var text = normalize(item.getAttribute('data-search-text'));
        item.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
      });
    }

    function applySort() {
      var mode = select ? select.value : 'default';
      var items = originalItems.slice();

      if (mode === 'year-desc') {
        items.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (mode === 'year-asc') {
        items.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }
      if (mode === 'title-asc') {
        items.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }

      items.forEach(function (item) {
        scope.appendChild(item);
      });
      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applySort);
    }
  });
}());
