/**
 * PowerStorage.cn — 储能技术前沿
 */

(function () {
  'use strict';

  // ============ DOM refs ============
  const mainContent = document.getElementById('mainContent');
  const topbar = document.getElementById('topbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const themeToggle = document.getElementById('themeToggle');

  // ============ State ============
  let currentPage = null;

  // ============ Theme ============
  const THEME_KEY = 'powerstorage-theme';

  function getTheme() {
    const stored = localStorage.getItem(THEME_KEY);
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
    const current = document.documentElement.hasAttribute('data-theme') ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', toggleTheme);

  // Follow system theme changes (only when user hasn't set a manual preference)
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // ============ Marked config ============
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
  }

  // ============ Navigation ============
  function navigateTo(pagePath) {
    if (pagePath === currentPage) return;
    currentPage = pagePath;
    updateActiveLinks(pagePath);
    loadContent(pagePath);
    closeMobileDrawer();
  }

  function updateActiveLinks(pagePath) {
    document.querySelectorAll('.nav-dropdown-panel a, .mobile-nav-section a, .logo').forEach(el => {
      if (el.classList.contains('logo')) return;
      el.classList.toggle('active', el.dataset.page === pagePath);
    });
  }

  // Bind all nav links
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  // ============ Stats Config ============
  const pageStats = {
    'technologies/overview': [
      { value: '450+', label: '2026 全球储能装机预期 (GWh)', cls: 'accent' },
      { value: '50GW+', label: '中国十五五规划储能目标', cls: 'green' },
      { value: '10+', label: '活跃储能技术路线', cls: 'purple' },
    ],
    'technologies/lithium-ion': [
      { value: '15000', label: '最新电芯循环寿命 (次)', cls: 'accent' },
      { value: '144.7', label: '中国新型储能累计装机 (GW)', cls: 'green' },
      { value: '<0.6', label: '储能系统价格 (元/Wh)', cls: 'purple' },
    ],
    'technologies/iron-air': [
      { value: '100h+', label: '持续放电时长', cls: 'accent' },
      { value: '30GWh', label: 'Google 签约储能容量', cls: 'green' },
      { value: '$6/kW', label: '度电成本目标', cls: 'purple' },
    ],
    'technologies/solid-state': [
      { value: '587Ah', label: '最大半固态储能电芯', cls: 'accent' },
      { value: '2×', label: '量子充电功率超越经典', cls: 'green' },
      { value: '900Wh/L', label: '固态电池能量密度目标', cls: 'purple' },
    ],
    'technologies/flow-battery': [
      { value: '20000+', label: '液流电池循环寿命 (次)', cls: 'accent' },
      { value: '8GWh', label: 'EOS Energy 产能目标', cls: 'green' },
      { value: '$218', label: '目标度电成本 (/kWh)', cls: 'purple' },
    ],
    'technologies/sodium-ion': [
      { value: '2.75%', label: '钠元素地壳含量', cls: 'accent' },
      { value: '¥2000', label: '碳酸钠价格 (元/吨)', cls: 'green' },
      { value: '2GWh', label: '最大钠锂混合储能项目', cls: 'purple' },
    ],
    'technologies/compressed-air': [
      { value: '50年+', label: 'CAES 电站运营寿命', cls: 'accent' },
      { value: '500MW', label: 'Willow Rock 项目功率', cls: 'green' },
      { value: '80%', label: '美国地质适用比例', cls: 'purple' },
    ],
    'technologies/hydrogen': [
      { value: '跨季节', label: '唯一跨季储能方案', cls: 'accent' },
      { value: '120MJ', label: '液氢能量密度 (/kg)', cls: 'green' },
      { value: '90%+', label: 'SOEC 电解效率目标', cls: 'purple' },
    ],
    'technologies/flywheel-emerging': [
      { value: '<5ms', label: '飞轮响应时间', cls: 'accent' },
      { value: '100万', label: '飞轮循环寿命 (次)', cls: 'green' },
      { value: '$5-10', label: '热化学储电成本 (/kWh)', cls: 'purple' },
    ],
    'technologies/quantum-battery': [
      { value: '2×', label: '量子充电功率优势', cls: 'accent' },
      { value: '百万倍', label: '储能/充电时间比', cls: 'green' },
      { value: '20%', label: '量子电池市场 CAGR', cls: 'purple' },
    ],
    'policies/china-national': [
      { value: '88项', label: '4月储能相关政策数量', cls: 'accent' },
      { value: '三元', label: '容量补偿+套利+服务收益', cls: 'green' },
      { value: '29项', label: 'AI+能源行动方案任务', cls: 'purple' },
    ],
    'policies/china-local': [
      { value: '14GW', label: '山西新型储能装机目标', cls: 'accent' },
      { value: '350元', label: '四川调峰补偿 (元/MWh)', cls: 'green' },
      { value: '500万', label: '上海先进储能补贴上限', cls: 'purple' },
    ],
    'projects/global-mega-projects': [
      { value: '7.8GWh', label: '全球单体最大并网 BESS', cls: 'accent' },
      { value: '1.28万亿', label: '全球储能项目管道 (美元)', cls: 'green' },
      { value: '6600+', label: '全球储能项目数量', cls: 'purple' },
    ],
    'market/trends-2026': [
      { value: '+40%', label: '2026 全球装机同比增长', cls: 'accent' },
      { value: '1TWh', label: '2030 全球年装机预测', cls: 'green' },
      { value: '470个', label: '全国虚拟电厂项目数', cls: 'purple' },
    ],
  };

  function buildStatsBanner(stats) {
    return `
      <div class="stats-banner">
        ${stats.map(s => `
          <div class="stat-card ${s.cls}">
            <div class="stat-value">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('')}
      </div>`;
  }

  // ============ Content Loading ============
  async function loadContent(pagePath) {
    mainContent.innerHTML = `
      <div class="loading-state">
        <div class="loading-ring"></div>
        <span>加载中</span>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const resp = await fetch(`content/${pagePath}.md`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const md = await resp.text();
      const html = marked.parse(md);
      const stats = pageStats[pagePath];
      const statsHtml = stats ? buildStatsBanner(stats) : '';

      // Insert stats after first blockquote or after h1
      let finalHtml = html;
      if (statsHtml) {
        // Insert stats after the first closing blockquote tag
        const bqEnd = finalHtml.indexOf('</blockquote>');
        if (bqEnd !== -1) {
          finalHtml = finalHtml.slice(0, bqEnd + 13) + statsHtml + finalHtml.slice(bqEnd + 13);
        } else {
          // If no blockquote, insert after first </h1>
          const h1End = finalHtml.indexOf('</h1>');
          if (h1End !== -1) {
            finalHtml = finalHtml.slice(0, h1End + 5) + statsHtml + finalHtml.slice(h1End + 5);
          } else {
            finalHtml = statsHtml + finalHtml;
          }
        }
      }

      mainContent.innerHTML = `<div class="content">${finalHtml}</div>`;

      // Wrap tables for horizontal scroll
      mainContent.querySelectorAll('table').forEach(table => {
        if (table.parentElement.classList.contains('table-wrap')) return;
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
      });
    } catch (err) {
      mainContent.innerHTML = `
        <div class="content">
          <h1>加载失败</h1>
          <p>无法加载页面：${err.message}</p>
          <p>请检查网络连接后重试。</p>
        </div>`;
    }
  }

  // ============ Mobile Drawer ============
  function openMobileDrawer() {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileMenuBtn.addEventListener('click', openMobileDrawer);
  mobileOverlay.addEventListener('click', closeMobileDrawer);

  // ============ Keyboard ============
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileDrawer();
  });

  // ============ Topbar scroll effect ============
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 100 && y > lastScroll) {
      topbar.style.transform = 'translateY(-100%)';
    } else {
      topbar.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  }, { passive: true });

  // ============ Init ============
  function init() {
    applyTheme(getTheme());
    const defaultPage = 'technologies/overview';
    navigateTo(defaultPage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
