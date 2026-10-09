/**
 * PowerStorage.cn — SVG Infographic Generator
 * Generates branded, dark-theme SVG charts into assets/img/.
 * All charts are original, data-driven, scalable (SEO/LLM friendly).
 * Usage: node charts.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'assets', 'img');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ---- Palette (matches css/style.css) ----
const C = {
  bg: '#0a0f1c', panel: '#111a2e', panel2: '#0d1424', stroke: '#1e2a44',
  text: '#e2e8f0', label: '#9fb3c8', muted: '#64748b',
  c1: '#22d3ee', c2: '#3b82f6', c3: '#34d399', c4: '#a78bfa', c5: '#f59e0b', grey: '#475569'
};
const FONT = "'Inter','Noto Sans SC',system-ui,sans-serif";

// ---- SVG helpers ----
function defs() {
  return `<defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.c1}"/><stop offset="1" stop-color="${C.c2}"/></linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.c3}"/><stop offset="1" stop-color="${C.c2}"/></linearGradient>
    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.c1}"/><stop offset="1" stop-color="${C.c1}" stop-opacity="0"/></linearGradient>
  </defs>`;
}
function rr(x, y, w, h, r, style) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" ${style}/>`; }
function frame(w, h, body, title, sub) {
  const t = `<text x="60" y="52" font-family="${FONT}" font-size="30" font-weight="800" fill="${C.text}">${title}</text>`;
  const s = sub ? `<text x="60" y="80" font-family="${FONT}" font-size="18" fill="${C.muted}">${sub}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${FONT}">
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <rect x="0" y="0" width="${w}" height="6" fill="url(#g1)"/>
  ${defs()}
  ${t}${s}
  ${body}
</svg>`;
}

// ---- 1. Horizontal bar (single series) ----
function hbar(title, sub, rows, unit) {
  const top = 110, rowH = 46, h = top + rows.length * rowH + 30;
  const x0 = 250, x1 = 1150, maxW = x1 - x0 - 90;
  let body = rows.map((r, i) => {
    const y = top + i * rowH, w = Math.max(6, (r.v / 100) * maxW);
    return `<text x="${x0 - 16}" y="${y + 24}" text-anchor="end" font-size="17" fill="${C.label}">${r.n}</text>`
      + rr(x0, y + 6, maxW, 28, 6, `fill="${C.panel}" stroke="${C.stroke}"`)
      + `<rect x="${x0}" y="${y + 6}" width="${w}" height="28" rx="6" fill="url(#g1)"/>`
      + `<text x="${x0 + w + 12}" y="${y + 25}" font-size="16" font-weight="700" fill="${C.text}">${r.v}${unit || ''}</text>`;
  }).join('');
  return frame(1200, h, body, title, sub);
}

// ---- 2. Grouped horizontal bar ----
function groupedHBar(title, sub, rows, legendA, legendB) {
  const top = 120, rowH = 70, h = top + rows.length * rowH + 24;
  const x0 = 230, x1 = 1150, maxW = x1 - x0 - 20;
  let body = `<rect x="${x0}" y="${top - 40}" width="14" height="14" rx="3" fill="${C.grey}"/><text x="${x0 + 22}" y="${top - 28}" font-size="15" fill="${C.muted}">${legendA || '跟网型'}</text>`
    + `<rect x="${x0 + 110}" y="${top - 40}" width="14" height="14" rx="3" fill="url(#g1)"/><text x="${x0 + 132}" y="${top - 28}" font-size="15" fill="${C.muted}">${legendB || '构网型'}</text>`;
  body += rows.map((r, i) => {
    const y = top + i * rowH, wg = Math.max(4, (Math.abs(r.g) / 100) * maxW), wc = Math.max(4, (Math.abs(r.c) / 100) * maxW);
    return `<text x="${x0 - 14}" y="${y + 42}" text-anchor="end" font-size="16" fill="${C.label}">${r.n}</text>`
      + `<rect x="${x0}" y="${y + 14}" width="${wg}" height="22" rx="5" fill="${C.grey}"/>`
      + `<rect x="${x0}" y="${y + 40}" width="${wc}" height="22" rx="5" fill="url(#g1)"/>`
      + `<text x="${x0 + Math.max(wg, wc) + 10}" y="${y + 57}" font-size="14" font-weight="700" fill="${C.c1}">${r.c > 0 ? '+' : ''}${r.c}%</text>`;
  }).join('');
  return frame(1200, h, body, title, sub);
}

// ---- 3. Line + area ----
function lineArea(title, sub, pts, yMax, yFmt) {
  const W = 1200, H = 600, pl = 80, pr = 40, pt = 120, pb = 70;
  const iw = W - pl - pr, ih = H - pt - pb;
  const xs = i => pl + (i / (pts.length - 1)) * iw;
  const ys = v => pt + ih - (v / yMax) * ih;
  let area = `M ${xs(0)} ${ys(pts[0].v)}`;
  for (let i = 1; i < pts.length; i++) area += ` L ${xs(i)} ${ys(pts[i].v)}`;
  area += ` L ${xs(pts.length - 1)} ${pt + ih} L ${xs(0)} ${pt + ih} Z`;
  let grid = '', dots = '', xlab = '';
  pts.forEach((p, i) => {
    grid += `<line x1="${pl}" y1="${ys(p.v)}" x2="${W - pr}" y2="${ys(p.v)}" stroke="${C.stroke}" stroke-dasharray="3 5"/>`
      + `<text x="${pl - 12}" y="${ys(p.v) + 5}" text-anchor="end" font-size="13" fill="${C.muted}">${yFmt(p.v)}</text>`;
    dots += `<circle cx="${xs(i)}" cy="${ys(p.v)}" r="5" fill="${C.c1}" stroke="${C.bg}" stroke-width="2"/>`
      + `<text x="${xs(i)}" y="${ys(p.v) - 14}" text-anchor="middle" font-size="14" font-weight="700" fill="${C.text}">${yFmt(p.v)}</text>`;
    xlab += `<text x="${xs(i)}" y="${H - 36}" text-anchor="middle" font-size="14" fill="${C.label}">${p.x}</text>`;
  });
  return frame(W, H,
    `<path d="${area}" fill="url(#ga)" opacity="0.35"/>${grid}`
    + `<path d="${area.replace(' Z', '')}" fill="none" stroke="url(#g1)" stroke-width="3"/>${dots}${xlab}`,
    title, sub);
}

// ---- 4. Donut ----
function donut(title, sub, segs) {
  const cx = 380, cy = 340, R = 170, sw = 64;
  const total = segs.reduce((a, s) => a + s.v, 0);
  const colors = [C.c1, C.c2, C.c3, C.c4, C.c5, C.grey];
  let ang = -Math.PI / 2, arcs = '';
  segs.forEach((s, i) => {
    const a2 = ang + (s.v / total) * Math.PI * 2;
    const large = (s.v / total) > 0.5 ? 1 : 0;
    const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    arcs += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${sw}" stroke-linecap="butt"/>`;
    ang = a2;
  });
  let ly = cy - segs.length * 22 + 10, leg = '';
  segs.forEach((s, i) => {
    const pct = Math.round((s.v / total) * 100);
    leg += `<rect x="700" y="${ly - 14}" width="16" height="16" rx="4" fill="${colors[i % colors.length]}"/>`
      + `<text x="726" y="${ly - 1}" font-size="17" fill="${C.label}">${s.n}</text>`
      + `<text x="1140" y="${ly - 1}" text-anchor="end" font-size="17" font-weight="700" fill="${C.text}">${pct}%</text>`;
    ly += 44;
  });
  return frame(1200, 600,
    `${arcs}<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="15" fill="${C.muted}">合计</text><text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="30" font-weight="800" fill="${C.text}">${total}%</text>${leg}`,
    title, sub);
}

// ---- 5. Vertical process steps ----
function steps(title, sub, items) {
  const top = 120, rowH = 96, W = 1200, H = top + items.length * rowH + 20;
  let body = items.map((it, i) => {
    const y = top + i * rowH;
    return rr(120, y, W - 200, 76, 12, `fill="${C.panel}" stroke="${C.stroke}"`)
      + `<circle cx="160" cy="${y + 38}" r="22" fill="url(#g1)"/><text x="160" y="${y + 46}" text-anchor="middle" font-size="20" font-weight="800" fill="#06121f">${i + 1}</text>`
      + `<text x="210" y="${y + 34}" font-size="20" font-weight="700" fill="${C.text}">${it.t}</text>`
      + `<text x="210" y="${y + 60}" font-size="15" fill="${C.muted}">${it.d}</text>`
      + (i < items.length - 1 ? `<text x="60" y="${y + rowH - 6}" text-anchor="middle" font-size="22" fill="${C.c1}">&#8595;</text>` : '');
  }).join('');
  return frame(W, H, body, title, sub);
}

// ---- 6. Layered stack (inside-out) ----
function layers(title, sub, items) {
  const W = 1200, top = 120, rowH = 84, H = top + items.length * rowH + 20;
  const cols = [C.c1, C.c2, C.c3, C.c4, C.c5];
  let body = items.map((it, i) => {
    const y = top + i * rowH, col = cols[i % 5];
    return rr(80, y, W - 160, rowH - 14, 12, `fill="${C.panel}" stroke="${C.stroke}"`)
      + `<rect x="80" y="${y}" width="8" height="${rowH - 14}" rx="4" fill="${col}"/>`
      + `<text x="110" y="${y + 30}" font-size="13" font-weight="700" fill="${col}">L${i + 1}</text>`
      + `<text x="150" y="${y + 32}" font-size="19" font-weight="700" fill="${C.text}">${it.t}</text>`
      + `<text x="150" y="${y + 58}" font-size="15" fill="${C.muted}">${it.d}</text>`
      + (i < items.length - 1 ? `<text x="${W / 2}" y="${y + rowH - 2}" text-anchor="middle" font-size="18" fill="${C.muted}">&#9650;</text>` : '');
  }).join('');
  return frame(W, H, body, title, sub);
}

// ---- 7. Card grid (2 cols) ----
function cards(title, sub, items) {
  const W = 1200, cols = 2, pad = 36, top = 120;
  const cw = (W - pad * (cols + 1)) / cols, ch = 170, rows = Math.ceil(items.length / cols);
  const H = top + rows * (ch + pad);
  const colsC = [C.c1, C.c2, C.c3, C.c4];
  let body = items.map((it, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = pad + c * (cw + pad), y = top + r * (ch + pad), col = colsC[i % 4];
    return rr(x, y, cw, ch, 14, `fill="${C.panel}" stroke="${C.stroke}"`)
      + `<rect x="${x}" y="${y}" width="${cw}" height="6" rx="3" fill="${col}"/>`
      + `<text x="${x + 26}" y="${y + 44}" font-size="22" font-weight="800" fill="${C.text}">${it.t}</text>`
      + `<text x="${x + 26}" y="${y + 84}" font-size="26" font-weight="800" fill="${col}">${it.m}</text>`
      + `<text x="${x + 26}" y="${y + 120}" font-size="15" fill="${C.muted}">${it.d}</text>`
      + `<text x="${x + 26}" y="${y + 148}" font-size="13" fill="${C.label}">${it.tag || ''}</text>`;
  }).join('');
  return frame(W, H, body, title, sub);
}

// ===================== Chart specs =====================
const charts = {
  'overview-maturity.svg': hbar('储能技术路线产业化成熟度', '综合评估（经济性 / 寿命 / 安全 / 工程化）· 满分 100', [
    { n: '锂离子电池', v: 95 }, { n: '构网型储能', v: 80 }, { n: '压缩空气储能', v: 75 },
    { n: '液流电池', v: 70 }, { n: '钠离子电池', v: 65 }, { n: '飞轮储能', v: 60 },
    { n: '固态电池', v: 55 }, { n: '氢储能', v: 50 }, { n: '铁-空气电池', v: 45 }, { n: '量子电池', v: 30 }
  ]),
  'lithium-cost.svg': lineArea('储能系统价格走势', '单位：元/Wh · 2020—2026（2026 年碳酸锂反弹带动价格回升）', [
    { x: '2020', v: 1.50 }, { x: '2021', v: 1.30 }, { x: '2022', v: 1.00 },
    { x: '2023', v: 0.80 }, { x: '2024', v: 0.60 }, { x: '2025', v: 0.55 }, { x: '2026E', v: 0.62 }
  ], 1.6, v => v.toFixed(2)),
  'caes-projects.svg': cards('中国压缩空气储能重大项目', '能建 · 中电建 · 中盐等领跑全球 A-CAES', [
    { t: '能建·湖北应城', m: '300MW/1500MWh', d: '全球首套 300MW 级 A-CAES 投运', tag: '系统效率 70%+（全球最高）' },
    { t: '中电建·山东肥城', m: '5GW 基地', d: '盐穴储能基地规划，单机 350MW 示范在建', tag: '长时储能基地' },
    { t: '中盐·金坛', m: '60MW/300MWh', d: '国内首个盐穴压缩空气商业项目', tag: '已商业运行' },
    { t: '泰安·肥城', m: '10MW 示范', d: '压缩空气 + 飞轮混合储能验证', tag: '混合储能' }
  ]),
  'market-growth.svg': lineArea('全球储能年新增装机', '单位：GWh · 2022—2030E（数据源：BNEF / 行业预测）', [
    { x: '2022', v: 95 }, { x: '2023', v: 165 }, { x: '2024', v: 280 }, { x: '2025', v: 307 },
    { x: '2026E', v: 459 }, { x: '2027E', v: 600 }, { x: '2028E', v: 780 }, { x: '2030E', v: 1000 }
  ], 1100, v => v),
  'ci-revenue.svg': steps('工商业储能四重收益模型', '从单一套利到多元收益叠加，优质项目 IRR 可达 12%—18%', [
    { t: '峰谷套利', d: '两充两放，粤浙苏峰谷价差约 0.9 元/kWh' },
    { t: '需量管理', d: '削减高峰用电，降低基本电费支出' },
    { t: '需求响应', d: '参与电网邀约削峰，获取单次补贴' },
    { t: 'EMS 智能调度', d: 'AI 优化充放电策略，提升 IRR 2—3pct' }
  ]),
  'safety-layers.svg': layers('储能安全五层防御体系', '从电池本体到物理隔离，构建主动安全闭环', [
    { t: '电池本体安全', d: '本征安全材料 / 热失控抑制设计' },
    { t: 'BMS 电池管理', d: '单体级监测，μs 级故障隔离' },
    { t: 'PACK 级消防', d: '全氟己酮 + 细水雾复合抑制' },
    { t: 'AI 预警平台', d: '热滥用早期预警，提前 30min+' },
    { t: '物理隔离与泄爆', d: '舱级防火间距 + 定向泄爆' }
  ]),
  'global-region.svg': cards('中国储能企业出海区域战略', '从产品出口到本地制造的深水区', [
    { t: '欧洲', m: '高壁垒·高价值', d: '碳关税 + 本土化率要求，系统单价 1.5—2×', tag: '本地建厂趋势' },
    { t: '北美', m: '红利+壁垒', d: 'IRA 税收抵免 30%，UFLPA 溯源严格', tag: '合规是关键' },
    { t: '中东', m: '蓝海市场', d: '沙特 7.8GWh 并网，戈壁大基地激增', tag: '增速最快' },
    { t: '亚太', m: '快速增长', d: '澳大利亚 / 东南亚加速，本地制造兴起', tag: '潜力巨大' }
  ]),
  'financing-donut.svg': donut('2026 H1 储能一级市场融资分布', '按技术方向 · 全球一级市场约 $85 亿', [
    { n: '钠离子电池', v: 35 }, { n: '固态 / 半固态', v: 25 }, { n: '长时储能 LDES', v: 20 },
    { n: '液流电池', v: 10 }, { n: '其他', v: 10 }
  ]),
  'grid-forming.svg': groupedHBar('构网型 vs 跟网型能力对比', '构网型在电网支撑维度全面领先（评分 0—100）', [
    { n: '惯量支撑', g: 20, c: 95 }, { n: '短路容量支撑', g: 30, c: 90 },
    { n: '黑启动', g: 10, c: 95 }, { n: '宽频振荡抑制', g: 40, c: 85 }, { n: '弱电网适配', g: 25, c: 90 }
  ]),
  'sodium-advantage.svg': hbar('钠离子电池核心优势', '对比锂离子电池的关键指标（相对值）', [
    { n: '原材料成本指数', v: 35 }, { n: '低温可用 (-40℃)', v: 90 },
    { n: '本征安全性', v: 85 }, { n: '地壳丰度 (相对锂)', v: 100 }, { n: '循环寿命 (成熟度)', v: 60 }
  ]),
  'flow-battery.svg': hbar('液流电池循环寿命领先', '主流长时储能技术循环寿命对比（次，满分 100）', [
    { n: '液流电池', v: 100 }, { n: '锂离子电池', v: 75 }, { n: '压缩空气储能', v: 60 },
    { n: '钠离子电池', v: 40 }, { n: '铁-空气电池', v: 35 }
  ]),
  // ---- 2026年8—9月新增 ----
  'price-trend.svg': groupedHBar('8—9月储能价格：系统下行、电芯上行', '2h / 4h 系统均价与电芯加权均价同比变化（%）', [
    { n: '2h 储能系统', g: 8.3, c: 1.0 }, { n: '4h 储能系统', g: 21.1, c: -20.0 },
    { n: '储能电芯 (314Ah)', g: 18.0, c: 38.3 }, { n: '碳酸锂价格', g: 67.0, c: -40.0 }
  ], '2025 同期', '2026 变化'),
  'h1-review.svg': groupedHBar('2026H1：装机下滑，招标翻倍', '国内新型储能关键指标同比变化（%）', [
    { n: '新增投运（能量）', g: 170, c: -16 }, { n: '新增投运（功率）', g: 170, c: -18 },
    { n: '项目数量', g: 100, c: -51 }, { n: '系统集采/框采', g: 100, c: 95 },
    { n: 'EPC 中标', g: 100, c: 112 }, { n: '电芯全球出货', g: 100, c: 94.76 },
    { n: '海外储能订单', g: 100, c: 83 }
  ], '2025 同期', '2026 变化'),
  'capacity-price.svg': hbar('容量电价：放电时长直接定价', '新疆基准 165 元/千瓦·年（峰值时长暂定 6 小时）折算，元/千瓦·年', [
    { n: '2 小时独立储能', v: 55 }, { n: '4 小时独立储能', v: 110 }, { n: '6 小时及以上', v: 165 }
  ]),
  'sodium-scale.svg': steps('钠电产业化四道关口', '2026年关键进展与待突破环节', [
    { t: '订单锁定', d: '2026年4月宁德时代 × 海博思创签署 60GWh 三年钠电长协，全球钠电订单纪录' },
    { t: '产线就绪', d: '宁德时代钠电专用产线建成投产；亿纬惠州 2GWh 备料；国轩 Q4 规模化量产' },
    { t: '产品交付', d: '9月海辰发布 N785Ah 电芯 + 4MWh 系统；宁德时代首批钠电系统交付，全年 GWh 级出货' },
    { t: '成本攻关（未完成）', d: '目标碳酸锂 15 万元/吨时与锂电持平；当前硬碳负极成本偏高、量产良率不足' }
  ]),
  'aidc-storage.svg': groupedHBar('三类储能场景的负荷特性对比', '相对适配度评分（0—100）', [
    { n: '负荷连续性要求', g: 10, c: 95 }, { n: '功率密度要求', g: 30, c: 90 },
    { n: '电能质量敏感度', g: 25, c: 95 }, { n: '备电/黑启动需求', g: 15, c: 90 },
    { n: '支付能力（不依赖机制）', g: 15, c: 85 }, { n: '峰谷价差依赖度', g: 95, c: 30 }
  ])
};

// ===================== Render =====================
let n = 0;
for (const [file, svg] of Object.entries(charts)) {
  fs.writeFileSync(path.join(OUT, file), svg, 'utf-8');
  n++;
}
console.log(`  ✓ ${n} infographics → assets/img/`);
