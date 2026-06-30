/**
 * PowerStorage.cn — App
 * Theme toggle, mobile menu, scroll effects, pagination
 */
(function () {
  'use strict';

  var PER_PAGE = 9;

  // ============ DOM ============
  var topbar = document.getElementById('topbar');
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var mobileDrawer = document.getElementById('mobileDrawer');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var themeToggle = document.getElementById('themeToggle');
  var articlesContainer = document.getElementById('articles-container');
  var filterBar = document.getElementById('filter-bar');
  var paginationEl = document.getElementById('pagination');

  // ============ State ============
  var articles = [];
  var currentPage = 1;
  var currentFilter = 'all';

  // ============ Theme ============
  var THEME_KEY = 'powerstorage-theme';

  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    var current = document.documentElement.hasAttribute('data-theme') ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'light' : 'dark');
  });

  // ============ Mobile ============
  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobileDrawer(); });

  // ============ Topbar scroll ============
  var lastScroll = 0, scrollTimeout;
  window.addEventListener('scroll', function () {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(function () {
      scrollTimeout = null;
      var y = window.scrollY;
      if (y > 120 && y > lastScroll && topbar) topbar.style.transform = 'translateY(-100%)';
      else if (topbar) topbar.style.transform = 'translateY(0)';
      lastScroll = y;
    }, 50);
  }, { passive: true });

  // ============ Smooth scroll for anchor links ============
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileDrawer();
      history.pushState(null, null, link.getAttribute('href'));
    }
  });

  // ============ Highlight active nav ============
  function highlightCurrentArticle() {
    var path = window.location.pathname;
    var links = document.querySelectorAll('.nav-dropdown-panel a, .mobile-nav-section a');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.indexOf('articles') !== -1) {
        var slug = href.replace('/articles/', '').replace('.html', '');
        if (path.indexOf(slug) !== -1) link.classList.add('active');
      }
    });
  }

  // ============ Article Rendering ============
  var CAT_ICONS = {
    technologies: '🔋',
    policies: '📋',
    projects: '🌍',
    market: '📈'
  };
  var CAT_COLORS = {
    technologies: '',
    policies: 'policies',
    projects: 'projects',
    market: 'market'
  };
  var CAT_NAMES = {
    technologies: '技术路线',
    policies: '政策研究',
    projects: '项目与市场',
    market: '项目与市场'
  };
  var CAT_ORDER = ['technologies', 'policies', 'projects', 'market'];

  function renderArticleCard(a) {
    var catClass = CAT_COLORS[a.category] || '';
    var dateStr = a.date.replace(/-/g, '/');
    return '<a href="articles/' + a.path + '.html" class="article-card">' +
      '<div class="article-card-category ' + catClass + '">' + CAT_NAMES[a.category] + '</div>' +
      '<h2 class="article-card-title">' + escapeHTML(a.title) + '</h2>' +
      '<p class="article-card-excerpt">' + escapeHTML(a.excerpt) + '</p>' +
      '<div class="article-card-meta">' +
        '<time datetime="' + a.date + '">' + dateStr + '</time>' +
        '<span class="article-card-read">阅读 →</span>' +
      '</div>' +
    '</a>';
  }

  function renderSectionHeader(cat) {
    var name = CAT_NAMES[cat];
    var icon = CAT_ICONS[cat] || '';
    var id = cat + '-section';
    return '<section class="section-header" id="' + id + '">' +
      '<span class="section-label">' + icon + ' ' + name + '</span>' +
      '<h2>' + name + '</h2>' +
    '</section>';
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderArticles(filtered, page) {
    var total = filtered.length;
    var totalPages = Math.ceil(total / PER_PAGE);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    var start = (page - 1) * PER_PAGE;
    var end = Math.min(start + PER_PAGE, total);
    var pageItems = filtered.slice(start, end);

    var html = '';

    // When showing all categories, group by category
    if (currentFilter === 'all') {
      // Group page items by category
      var groups = {};
      pageItems.forEach(function (a) {
        if (!groups[a.category]) groups[a.category] = [];
        groups[a.category].push(a);
      });

      CAT_ORDER.forEach(function (cat) {
        var items = groups[cat];
        if (!items || items.length === 0) return;
        html += renderSectionHeader(cat);
        html += '<div class="article-grid">' + items.map(renderArticleCard).join('') + '</div>';
      });
    } else {
      // Single category - no section header needed (already filtered)
      html += '<div class="article-grid">' + pageItems.map(renderArticleCard).join('') + '</div>';
    }

    if (articlesContainer) articlesContainer.innerHTML = html;

    // Render pagination
    renderPagination(totalPages, page, total);
    if (paginationEl) paginationEl.style.display = totalPages <= 1 ? 'none' : 'flex';
  }

  function renderPagination(totalPages, page, total) {
    if (!paginationEl || totalPages <= 1) {
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    var html = '';

    // Prev button
    html += '<button class="pagination-btn" ' + (page <= 1 ? 'disabled' : '') + ' data-page="' + (page - 1) + '">← 上一页</button>';

    // Page buttons
    var pages = [];
    if (totalPages <= 7) {
      for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      var s = Math.max(2, page - 1);
      var e = Math.min(totalPages - 1, page + 1);
      for (var j = s; j <= e; j++) pages.push(j);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    pages.forEach(function (p) {
      if (p === '...') {
        html += '<span class="pagination-ellipsis">…</span>';
      } else {
        html += '<button class="pagination-btn' + (p === page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
      }
    });

    // Next button
    html += '<button class="pagination-btn" ' + (page >= totalPages ? 'disabled' : '') + ' data-page="' + (page + 1) + '">下一页 →</button>';

    // Info
    html += '<span class="pagination-info">共 ' + total + ' 篇</span>';

    paginationEl.innerHTML = html;

    // Bind click events
    paginationEl.querySelectorAll('.pagination-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = parseInt(this.getAttribute('data-page'));
        if (p && p !== currentPage) {
          currentPage = p;
          var filtered = getFilteredArticles();
          renderArticles(filtered, currentPage);
          articlesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function getFilteredArticles() {
    if (currentFilter === 'all') return articles;
    return articles.filter(function (a) { return a.category === currentFilter; });
  }

  function renderFilterBar() {
    if (!filterBar) return;
    var counts = { all: articles.length };
    articles.forEach(function (a) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    var buttons = [
      { key: 'all', label: '全部', icon: '📰' }
    ];
    CAT_ORDER.forEach(function (cat) {
      if (counts[cat]) {
        buttons.push({ key: cat, label: CAT_NAMES[cat], icon: CAT_ICONS[cat] || '' });
      }
    });

    filterBar.innerHTML = buttons.map(function (b) {
      var active = currentFilter === b.key ? ' active' : '';
      return '<button class="filter-btn' + active + '" data-filter="' + b.key + '">' +
        b.icon + ' ' + b.label + ' (' + (counts[b.key] || 0) + ')</button>';
    }).join('');

    filterBar.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentFilter = this.getAttribute('data-filter');
        currentPage = 1;
        renderFilterBar();
        renderArticles(getFilteredArticles(), currentPage);
        articlesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function loadArticles() {
    if (!articlesContainer) return;

    fetch('js/manifest.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        articles = data.sort(function (a, b) { return b.date.localeCompare(a.date); });
        currentPage = 1;
        currentFilter = 'all';
        renderFilterBar();
        renderArticles(articles, currentPage);
      })
      .catch(function () {
        // Fallback: show static article cards if they exist
        console.warn('Failed to load manifest, using static content');
      });
  }

  // ============ Init ============
  function init() {
    applyTheme(getTheme());
    highlightCurrentArticle();
    loadArticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
