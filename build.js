/**
 * PowerStorage.cn — Build Script (SEO-enhanced)
 * Generates individual HTML pages for each article from markdown content,
 * plus sitemap.xml, robots.txt, llms.txt and rss.xml for search/LLM indexing.
 * All pages use root-relative paths (/css/style.css, /js/app.js, /articles/...).
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ breaks: true, gfm: true });

// ============ Site config (edit here) ============
const SITE_URL = 'https://powerstorage.cn';
const SITE_NAME = 'PowerStorage.cn';
const SITE_AUTHOR = 'PowerStorage 编辑部';
const SITE_DESC = 'PowerStorage.cn 聚焦全球储能技术进展，追踪锂电、固态、铁-空气、液流、钠电、压缩空气、构网型、安全消防等前沿储能技术，解析国内外政策与万亿级市场趋势。内容由 AI 辅助定期更新。';
const OG_IMAGE = '/assets/og-default.svg';

// ============ Article Manifest ============
const ARTICLE_MANIFEST = [
  { path: 'technologies/overview', title: '储能技术全景图', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-28', keywords: '储能技术,技术全景,储能路线,新型储能', excerpt: '2026年，全球储能产业正经历从"锂电独大"到"多元共生"的历史性转变。梳理主流及前沿储能技术的成熟度、应用场景与发展趋势。', stats: [{ value: '450+', label: '2026 全球储能装机预期 (GWh)', cls: 'accent' }, { value: '50GW+', label: '中国十五五规划储能目标', cls: 'green' }, { value: '10+', label: '活跃储能技术路线', cls: 'purple' }] },
{ path: 'market/price-trend', title: '储能系统价格行情追踪（8—9月）', category: 'market', categoryLabel: '项目与市场', date: '2026-09-30', keywords: '储能价格,储能中标,储能系统报价,4小时储能,电芯价格,储能EPC,价格战', excerpt: '8月采招落地20.27GW/94.94GWh（环比+109.6%）；9月第三周4小时系统均价跌至0.5176元/Wh，较2025年同期降超20%。同期电芯加权均价却同比涨38.3%——市场开始为"时长"定价。', stats: [{ value: '0.5176', label: '9月 4h 系统均价 (元/Wh)', cls: 'accent' }, { value: '+38.3%', label: '9月电芯加权均价同比', cls: 'green' }, { value: '94.94GWh', label: '8月采招落地规模', cls: 'purple' }] },
{ path: 'market/h1-review', title: '2026上半年储能市场回顾：首次负增长', category: 'market', categoryLabel: '项目与市场', date: '2026-09-26', keywords: '储能市场回顾,2026上半年,新型储能装机,CNESA,独立储能,价值重构', excerpt: '2026H1新增投运21.81GW/58.60GWh，功率与能量同比降18%/16%——"十四五"以来首次半年下滑。但集采招标+95%、EPC中标+112%、海外订单+83%、电芯出货+94.76%。这是换挡，不是失速。', stats: [{ value: '-18%', label: 'H1 新增投运功率同比', cls: 'accent' }, { value: '+95%', label: '系统集采/框采同比', cls: 'green' }, { value: '+83%', label: '海外储能订单同比', cls: 'purple' }] },
{ path: 'policies/capacity-price', title: '容量电价机制：从政策驱动到市场驱动', category: 'policies', categoryLabel: '政策研究', date: '2026-09-22', keywords: '容量电价,114号文,独立储能,放电时长,容量补偿,电力市场', excerpt: '2026年1月30日容量电价机制首次将电网侧独立储能纳入补偿。容量电价与放电时长直接挂钩：新疆基准下4小时电站110元/千瓦·年、2小时仅55元。这重写了储能项目的收益结构。', stats: [{ value: '110元', label: '4h 独立储能容量电价 (/kW·年)', cls: 'accent' }, { value: '55元', label: '2h 独立储能容量电价 (/kW·年)', cls: 'green' }, { value: '10+省', label: '已出台细则省份', cls: 'purple' }] },
{ path: 'technologies/sodium-industrial', title: '钠离子电池：从样品验证到 GWh 级交付', category: 'technologies', categoryLabel: '技术路线', date: '2026-09-18', keywords: '钠电产业化,钠离子电池,N785Ah,4MWh系统,海辰储能,宁德时代钠电,硬碳负极', excerpt: '海辰N785Ah（20000次循环）+4MWh系统、宁德时代产线9月投产并交付首批系统。60GWh长协锁定需求、2027年量产时点明确。制约已从技术路线转向硬碳成本与量产良率。', stats: [{ value: '20000次', label: 'N785Ah 原生长循环', cls: 'accent' }, { value: '60GWh', label: '宁德×海博思创长协', cls: 'green' }, { value: '1.035元/Wh', label: '任丘项目钠电中标价', cls: 'purple' }] },
{ path: 'market/aidc-storage', title: 'AIDC 储能：算力基建重塑储能需求曲线', category: 'market', categoryLabel: '项目与市场', date: '2026-09-15', keywords: 'AIDC储能,AI数据中心,算电协同,亿纬锂能,Fluence,构网型,7x24供电', excerpt: '亿纬锂能与Fluence签2027—2031年206GWh供货框架（2027年16GWh）。AIDC是储能行业第一个由企业自有资本支付、而非依赖政策机制的需求增量。', stats: [{ value: '206GWh', label: '亿纬×Fluence 供货框架', cls: 'accent' }, { value: '16GWh', label: '2027年承诺交付量', cls: 'green' }, { value: '99.5%', label: '能源大模型物理一致性', cls: 'purple' }] },
{ path: 'technologies/lithium-ion', title: '锂离子电池储能', category: 'technologies', categoryLabel: '技术路线', date: '2026-09-12', keywords: '锂离子电池,锂电储能,314Ah,电芯价格,碳酸锂,循环寿命', excerpt: '锂电仍是储能绝对主力（8月采招容量占比91.1%）。9月电芯加权均价0.3814元/Wh、同比涨38.3%，而4小时系统均价跌至0.5176元/Wh——电芯涨、系统跌的背离标志市场价值锚点转向时长。', stats: [{ value: '0.3814', label: '9月电芯加权均价 (元/Wh)', cls: 'accent' }, { value: '+38.3%', label: '电芯均价同比涨幅', cls: 'green' }, { value: '91.1%', label: '8月采招中锂电容量占比', cls: 'purple' }] },
{ path: 'market/trends-2026', title: '储能市场趋势与展望', category: 'market', categoryLabel: '项目与市场', date: '2026-09-10', keywords: '储能市场,市场趋势,新型储能装机,虚拟电厂,2026展望,4小时系统', excerpt: '2026上半年装机首次半年负增长（-18%），但集采招标+95%、海外订单+83%。4小时系统中标均价同比涨21.1%，市场首次为"时长"单独定价。行业进入价值重构阶段。', stats: [{ value: '-18%', label: 'H1 新增投运同比', cls: 'accent' }, { value: '+21.1%', label: '4h 系统均价同比', cls: 'green' }, { value: '1026GWh', label: '2026 全球电芯出货预测', cls: 'purple' }] },
{ path: 'technologies/grid-forming', title: '构网型储能技术', category: 'technologies', categoryLabel: '技术路线', date: '2026-09-08', keywords: '构网型储能,Grid Forming,惯量支撑,黑启动,GW级构网型,弱电网', excerpt: '9月比亚迪发布GW级构网型储能方案2.0：单Block 62MWh、10MW单元功率、99.50%峰值效率、3倍过载10秒、分钟级黑启动、7×24不间断供电。构网型从"可选功能"变为"整站设计前提"。', stats: [{ value: '62MWh', label: 'GC Block 标准单元容量', cls: 'accent' }, { value: '99.50%', label: 'PCS 峰值转换效率', cls: 'green' }, { value: '10MW', label: '单单元功率（20尺箱）', cls: 'purple' }] },
{ path: 'market/ci-storage', title: '工商业储能：用户侧的确定性增长', category: 'market', categoryLabel: '项目与市场', date: '2026-09-05', keywords: '工商业储能,用户侧储能,两充两放,EMC,需量管理,峰谷价差', excerpt: '9月第一周用户侧项目合计145MW/580MWh，已超2025年同期单周规模。在电芯涨价13—20%的背景下反而增多，源于峰谷价差扩大、容量电价落地与Q4出口抢装三重驱动。', stats: [{ value: '580MWh', label: '9月首周用户侧项目规模', cls: 'accent' }, { value: '0.8-1.1', label: '浙粤峰谷价差 (元/kWh)', cls: 'green' }, { value: '1.8-2.2年', label: '典型静态回收期', cls: 'purple' }] },
{ path: 'policies/china-national', title: '中国储能政策全景（2026）', category: 'policies', categoryLabel: '政策研究', date: '2026-09-02', keywords: '储能政策,十五五规划,新型电池产业规划,项目库整顿,新兴支柱产业', excerpt: '9月28日七部门发布《新型电池产业发展"十五五"规划》，将长寿命高安全储能电池列为核心攻关方向，部署智算中心与工业绿色微电网新场景。叠加1月容量电价机制与9月多省项目库整顿，政策体系闭环形成。', stats: [{ value: '七部门', label: '9/28 联合发布单位数', cls: 'accent' }, { value: '3亿千瓦', label: '2030 新型储能装机目标', cls: 'green' }, { value: '8000万kW', label: '"十五五"电网侧独立储能', cls: 'purple' }] },
{ path: 'policies/china-local', title: '地方储能政策与"十五五"规划', category: 'policies', categoryLabel: '政策研究', date: '2026-08-28', keywords: '地方储能政策,项目库整顿,6个月开工,容量电价细则,山西,河南,乌鲁木齐', excerpt: '河北延期69个/990.5万千瓦、取消16个/175万千瓦；山西9月起入库项目须6个月开工12个月并网，河南逾期移出清单不再享受容量电价。地方政策进入"准入门槛+收益兑现"双向收紧阶段。', stats: [{ value: '990.5万kW', label: '河北延期开工项目规模', cls: 'accent' }, { value: '6个月', label: '山西/河南开工时限', cls: 'green' }, { value: '700MW', label: '乌鲁木齐第二批优选上限', cls: 'purple' }] },
{ path: 'market/global-expansion', title: '中国储能企业出海', category: 'market', categoryLabel: '项目与市场', date: '2026-08-25', keywords: '储能出海,中国储能出口,本地制造,亿纬锂能,Fluence,阳光电源,逆变器出口', excerpt: '2026H1中国企业海外储能订单298GWh、同比+83%，电芯海外出货占比首次超过国内。9月亿纬签Fluence 206GWh五年长协，天合、阳光电源、隆基合计落地超2GWh，逆变器1—8月出口526亿元。', stats: [{ value: '298GWh', label: 'H1 海外订单 (+83%)', cls: 'accent' }, { value: '206GWh', label: '亿纬×Fluence 长协', cls: 'green' }, { value: '526亿元', label: '1—8月逆变器出口额 (+22%)', cls: 'purple' }] },
{ path: 'market/investment-financing', title: '储能投融资趋势', category: 'market', categoryLabel: '项目与市场', date: '2026-08-20', keywords: '储能融资,储能投资,钠电融资,长时储能,一级市场,产能错位', excerpt: '2026H1全球一级市场融资约$85亿、同比+35%。国内运营储能电芯产能809.5GWh但314Ah/587Ah/790Ah仍"一芯难求"——矛盾不在总量过剩，而在名义产能与有效产能错位。', stats: [{ value: '$85亿', label: 'H1 一级市场融资额', cls: 'accent' }, { value: '+35%', label: '一级市场融资同比增长', cls: 'green' }, { value: '809.5GWh', label: '国内运营电芯产能', cls: 'purple' }] },
{ path: 'technologies/battery-safety', title: '储能安全与消防技术', category: 'technologies', categoryLabel: '技术路线', date: '2026-08-15', keywords: '储能安全,储能消防,热失控,全氟己酮,GB44240,无损检测,电池安全', excerpt: '2026年6月底中国已投运新型储能153GW/396GWh（同比+61%）。9月七部门规划把"高安全储能电池"列为核心攻关方向，全球首个新能源第三方无损检测超级实验室（大CT+AI）落地。', stats: [{ value: '153GW', label: '中国已投运新型储能', cls: 'accent' }, { value: '396GWh', label: '对应能量规模', cls: 'green' }, { value: '+61%', label: '累计装机同比', cls: 'purple' }] },
{ path: 'projects/china-pilot', title: '中国储能示范项目巡礼', category: 'projects', categoryLabel: '项目与市场', date: '2026-07-18', keywords: '中国储能示范项目,钠锂混合,西藏储能,山东储能,盐穴储能,中广核', excerpt: '从内蒙古钠锂混合到西藏构网型储能，从盐穴压缩空气到中广核呼和浩特350MW/1400MWh独立储能——这些示范项目不仅是技术验证，更是商业模式探索的先驱。', stats: [{ value: '500MW', label: '蒙西钠锂混合储能规模', cls: 'accent' }, { value: '4300m', label: '最高海拔构网型储能', cls: 'green' }, { value: '¥1350万', label: '东营电站单月综合收入', cls: 'purple' }] },
{ path: 'projects/global-mega-projects', title: '全球储能重大项目追踪', category: 'projects', categoryLabel: '项目与市场', date: '2026-06-15', keywords: '全球储能项目,大型储能,BESS,储能电站,项目地图', excerpt: '7.8GWh全球单体最大BESS并网运行，全球储能项目管道超1.28万亿美元，6600+项目遍布各大洲——重大项目全景扫描。', stats: [{ value: '7.8GWh', label: '全球单体最大并网 BESS', cls: 'accent' }, { value: '1.28万亿', label: '全球储能项目管道 (美元)', cls: 'green' }, { value: '6600+', label: '全球储能项目数量', cls: 'purple' }] },
{ path: 'technologies/compressed-air', title: '压缩空气储能 (CAES)', category: 'technologies', categoryLabel: '技术路线', date: '2026-06-15', keywords: '压缩空气储能,CAES,能建,中电建,盐穴储能', excerpt: '中国领跑全球A-CAES：能建数科300MW电站投运、中电建肥城5GW基地规划、系统效率70%+全球最高。从盐穴到人工硐室，CAES正成为长时储能重要选择。', stats: [{ value: '300MW', label: '能建应城电站单机容量', cls: 'accent' }, { value: '5GW', label: '中电建肥城基地总规划', cls: 'green' }, { value: '70%+', label: 'A-CAES 系统效率（全球最高）', cls: 'purple' }] },
{ path: 'policies/overseas-policies', title: '海外储能政策对比', category: 'policies', categoryLabel: '政策研究', date: '2026-06-20', keywords: '海外储能政策,美国IRA,欧盟净零工业法案,日本储能,出海合规', excerpt: '美国IRA执行细则落地推高本土制造壁垒，欧盟《净零工业法案》强化储能本土化率要求，日韩聚焦长时储能战略。中国储能企业出海面临政策红利窗口与合规风险并存的新局面。', stats: [{ value: '30%', label: '美国独立储能 ITC 抵免率', cls: 'accent' }, { value: '40%', label: '欧盟 2030 本土制造目标', cls: 'green' }, { value: '¥4200亿', label: '日本储能产业补贴预算', cls: 'purple' }] },
{ path: 'technologies/overview', title: '储能技术全景图', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-28', keywords: '储能技术,技术全景,储能路线,新型储能', excerpt: '2026年，全球储能产业正经历从"锂电独大"到"多元共生"的历史性转变。梳理主流及前沿储能技术的成熟度、应用场景与发展趋势。', stats: [{ value: '450+', label: '2026 全球储能装机预期 (GWh)', cls: 'accent' }, { value: '50GW+', label: '中国十五五规划储能目标', cls: 'green' }, { value: '10+', label: '活跃储能技术路线', cls: 'purple' }] },
{ path: 'technologies/solid-state', title: '固态电池储能', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-22', keywords: '固态电池,半固态电池,587Ah,能量密度,下一代储能', excerpt: '固态电池以高安全性、高能量密度成为下一代储能技术的重要方向。587Ah半固态储能电芯已亮相，产业化进程加速。', stats: [{ value: '587Ah', label: '最大半固态储能电芯', cls: 'accent' }, { value: '400Wh/kg', label: '量产级能量密度', cls: 'green' }, { value: '900Wh/L', label: '固态电池能量密度目标', cls: 'purple' }] },
{ path: 'technologies/iron-air', title: '铁-空气电池储能', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-20', keywords: '铁空气电池,长时储能,Form Energy,低成本储能', excerpt: '100小时+持续放电时长，铁-空气电池正从概念走向商业部署。Form Energy引领长时储能革命，Google签约30GWh储能容量。', stats: [{ value: '100h+', label: '持续放电时长', cls: 'accent' }, { value: '30GWh', label: 'Google 签约储能容量', cls: 'green' }, { value: '$6/kW', label: '度电成本目标', cls: 'purple' }] },
{ path: 'technologies/flow-battery', title: '液流电池储能', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-18', keywords: '液流电池,全钒液流,锌基液流,长寿命储能', excerpt: '液流电池以20000+次循环寿命和安全优势脱颖而出。锌基技术突破和全钒液流电池推动成本下降，EOS Energy 8GWh产能目标在望。', stats: [{ value: '20000+', label: '液流电池循环寿命 (次)', cls: 'accent' }, { value: '8GWh', label: 'EOS Energy 产能目标', cls: 'green' }, { value: '$218', label: '目标度电成本 (/kWh)', cls: 'purple' }] },
{ path: 'technologies/hydrogen', title: '氢储能技术', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-10', keywords: '氢储能,绿氢,电解水,SOEC,跨季节储能', excerpt: '氢储能是唯一可实现跨季节储能的方案。120MJ/kg的液氢能量密度、SOEC电解效率突破90%，绿色氢能经济正在成型。', stats: [{ value: '跨季节', label: '唯一跨季储能方案', cls: 'accent' }, { value: '120MJ', label: '液氢能量密度 (/kg)', cls: 'green' }, { value: '90%+', label: 'SOEC 电解效率目标', cls: 'purple' }] },
{ path: 'technologies/flywheel-emerging', title: '飞轮与新兴储能技术', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-08', keywords: '飞轮储能,重力储能,热化学储能,新兴储能', excerpt: '飞轮储能响应时间小于5ms，循环寿命达100万次。热化学储能、重力储能等新兴技术以极低成本崭露头角。', stats: [{ value: '<5ms', label: '飞轮响应时间', cls: 'accent' }, { value: '100万', label: '飞轮循环寿命 (次)', cls: 'green' }, { value: '$5-10', label: '热化学储电成本 (/kWh)', cls: 'purple' }] },
{ path: 'technologies/quantum-battery', title: '量子电池技术前沿', category: 'technologies', categoryLabel: '技术路线', date: '2026-05-05', keywords: '量子电池,量子充电,量子纠缠,前沿储能', excerpt: '量子电池利用量子纠缠和相干性实现超快充电，功率可达经典方案的2倍。2026年首次实验验证成功，储能与充电时间比达百万倍。', stats: [{ value: '2×', label: '量子充电功率优势', cls: 'accent' }, { value: '百万倍', label: '储能/充电时间比', cls: 'green' }, { value: '20%', label: '量子电池市场 CAGR', cls: 'purple' }] }
];

// ============ Output directory ============
const PUBLIC_DIR = path.join(__dirname, 'public');
const OUT_DIR = path.join(PUBLIC_DIR, 'articles');
const ASSET_DIR = path.join(PUBLIC_DIR, 'assets');

// Clean and recreate public/
if (fs.existsSync(PUBLIC_DIR)) fs.rmSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(ASSET_DIR, { recursive: true });

// ============ Helpers ============
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function absUrl(p) { return SITE_URL + (p.startsWith('/') ? '' : '/') + p; }
function todayISO() { return new Date().toISOString().slice(0, 10); }

// ============ Shared UI components (root-relative paths) ============
function header() {
  return `<header class="topbar" id="topbar">
  <div class="topbar-inner">
    <a href="/" class="logo">
      <svg class="logo-svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="8" width="8" height="16" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="12" y="4" width="8" height="20" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="22" y="10" width="4" height="14" rx="1" fill="currentColor"/>
      </svg>
      <span class="logo-text">PowerStorage</span>
      <span class="logo-domain">.cn</span>
    </a>
    <nav class="topbar-nav">
      <div class="nav-dropdown">
        <button class="nav-dropdown-btn">技术路线 <span class="arrow">▾</span></button>
        <div class="nav-dropdown-panel">
          <a href="/articles/technologies/overview.html">技术全景图</a>
          <a href="/articles/technologies/lithium-ion.html">锂离子电池</a>
          <a href="/articles/technologies/solid-state.html">固态电池</a>
          <a href="/articles/technologies/iron-air.html">铁-空气电池</a>
          <a href="/articles/technologies/flow-battery.html">液流电池</a>
          <a href="/articles/technologies/sodium-ion.html">钠离子电池</a>
          <a href="/articles/technologies/compressed-air.html">压缩空气储能</a>
          <a href="/articles/technologies/hydrogen.html">氢储能</a>
          <a href="/articles/technologies/flywheel-emerging.html">飞轮与新兴技术</a>
          <a href="/articles/technologies/quantum-battery.html">量子电池</a>
          <a href="/articles/technologies/grid-forming.html">构网型储能</a>
          <a href="/articles/technologies/battery-safety.html">安全与消防</a>
          <a href="/articles/technologies/sodium-industrial.html">钠电产业化</a>
        </div>
      </div>
      <div class="nav-dropdown">
        <button class="nav-dropdown-btn">政策研究 <span class="arrow">▾</span></button>
        <div class="nav-dropdown-panel">
          <a href="/articles/policies/china-national.html">国家政策</a>
          <a href="/articles/policies/capacity-price.html">容量电价机制</a>
          <a href="/articles/policies/china-local.html">地方规划</a>
          <a href="/articles/policies/overseas-policies.html">海外对比</a>
        </div>
      </div>
      <div class="nav-dropdown">
        <button class="nav-dropdown-btn">项目与市场 <span class="arrow">▾</span></button>
        <div class="nav-dropdown-panel">
          <a href="/articles/projects/global-mega-projects.html">全球重大项目</a>
          <a href="/articles/projects/china-pilot.html">中国示范项目</a>
          <a href="/articles/market/trends-2026.html">市场与趋势</a>
          <a href="/articles/market/h1-review.html">上半年市场回顾</a>
          <a href="/articles/market/price-trend.html">价格行情追踪</a>
          <a href="/articles/market/investment-financing.html">投融资趋势</a>
          <a href="/articles/market/ci-storage.html">工商业储能</a>
          <a href="/articles/market/aidc-storage.html">AIDC 储能</a>
          <a href="/articles/market/global-expansion.html">企业出海</a>
        </div>
      </div>
    </nav>
    <div class="topbar-right">
      <button class="theme-toggle" id="themeToggle" aria-label="切换主题">
        <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="菜单"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-drawer" id="mobileDrawer">
  <div class="mobile-drawer-inner">
    <div class="mobile-nav-section"><h3>技术路线</h3>
      <a href="/articles/technologies/overview.html">技术全景图</a>
      <a href="/articles/technologies/lithium-ion.html">锂离子电池</a>
      <a href="/articles/technologies/solid-state.html">固态电池</a>
      <a href="/articles/technologies/iron-air.html">铁-空气电池</a>
      <a href="/articles/technologies/flow-battery.html">液流电池</a>
      <a href="/articles/technologies/sodium-ion.html">钠离子电池</a>
      <a href="/articles/technologies/compressed-air.html">压缩空气储能</a>
      <a href="/articles/technologies/hydrogen.html">氢储能</a>
      <a href="/articles/technologies/flywheel-emerging.html">飞轮与新兴技术</a>
      <a href="/articles/technologies/quantum-battery.html">量子电池</a>
      <a href="/articles/technologies/grid-forming.html">构网型储能</a>
      <a href="/articles/technologies/battery-safety.html">安全与消防</a>
      <a href="/articles/technologies/sodium-industrial.html">钠电产业化</a>
    </div>
    <div class="mobile-nav-section"><h3>政策研究</h3>
      <a href="/articles/policies/china-national.html">国家政策</a>
      <a href="/articles/policies/capacity-price.html">容量电价机制</a>
      <a href="/articles/policies/china-local.html">地方规划</a>
      <a href="/articles/policies/overseas-policies.html">海外对比</a>
    </div>
    <div class="mobile-nav-section"><h3>项目与市场</h3>
      <a href="/articles/projects/global-mega-projects.html">全球重大项目</a>
      <a href="/articles/projects/china-pilot.html">中国示范项目</a>
      <a href="/articles/market/trends-2026.html">市场与趋势</a>
      <a href="/articles/market/h1-review.html">上半年市场回顾</a>
      <a href="/articles/market/price-trend.html">价格行情追踪</a>
      <a href="/articles/market/investment-financing.html">投融资趋势</a>
      <a href="/articles/market/ci-storage.html">工商业储能</a>
      <a href="/articles/market/aidc-storage.html">AIDC 储能</a>
      <a href="/articles/market/global-expansion.html">企业出海</a>
    </div>
  </div>
</div>
<div class="mobile-drawer-overlay" id="mobileOverlay"></div>`;
}

function footer() {
  return `<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="footer-logo"><span class="gradient">PowerStorage</span>.cn</span>
      <p>AI 驱动 · 定期检索更新 · 储能技术前沿洞察</p>
    </div>
    <div class="footer-meta">
      <span>数据更新：2026年9月</span>
      <span class="footer-dot"></span>
      <span>内容由 AI 辅助生成</span>
    </div>
  </div>
</footer>`;
}

function breadcrumbs(article) {
  return `<div class="breadcrumbs">
    <a href="/">首页</a><span class="sep">/</span>
    <a href="/#${article.category}">${article.categoryLabel}</a><span class="sep">/</span>
    <span class="current">${article.title}</span>
  </div>`;
}

function statsBanner(stats) {
  if (!stats || stats.length === 0) return '';
  return `<div class="stats-banner">${stats.map(s =>
    `<div class="stat-card ${s.cls}"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`
  ).join('')}</div>`;
}

function relatedArticles(currentPath) {
  const current = ARTICLE_MANIFEST.find(a => a.path === currentPath);
  if (!current) return '';
  const sameCat = ARTICLE_MANIFEST.filter(a => a.path !== currentPath && a.category === current.category);
  const pool = sameCat.length >= 3 ? sameCat : ARTICLE_MANIFEST.filter(a => a.path !== currentPath);
  const items = pool.slice(0, 3);
  if (items.length === 0) return '';
  return `<div class="related-articles">
    <h3>相关文章</h3>
    <div class="related-grid">${items.map(a =>
      `<a href="/articles/${a.path}.html" class="related-card"><div class="related-card-category">${a.categoryLabel}</div><div class="related-card-title">${a.title}</div></a>`
    ).join('')}</div>
  </div>`;
}

// ============ SEO helpers ============
function seoHead(meta) {
  const canonical = meta.canonical || absUrl('/');
  const jsonLd = meta.jsonLd
    ? meta.jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ')
    : '';
  return `<meta name="description" content="${esc(meta.description)}">
  ${meta.keywords ? `<meta name="keywords" content="${esc(meta.keywords)}">` : ''}
  <meta name="author" content="${esc(SITE_AUTHOR)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta name="theme-color" content="#0a0e1a">
  <meta property="og:type" content="${meta.ogType || 'website'}">
  <meta property="og:site_name" content="${esc(SITE_NAME)}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${absUrl(OG_IMAGE)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(meta.title)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${absUrl(OG_IMAGE)}">
  ${jsonLd}`;
}

// ============ Page shell ============
function wrapPage(meta, body) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(meta.title)}</title>
  ${seoHead(meta)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
${body}
<script src="/js/app.js"></script>
</body>
</html>`;
}

// ============ Structured data builders ============
function articleJsonLd(article) {
  const url = absUrl('/articles/' + article.path + '.html');
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: { '@type': 'Organization', name: SITE_AUTHOR },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absUrl('/assets/og-default.svg') }
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: article.categoryLabel,
    keywords: (article.keywords || '').split(',').filter(Boolean),
    inLanguage: 'zh-CN',
    url: url
  };
}
function breadcrumbJsonLd(article) {
  const url = absUrl('/articles/' + article.path + '.html');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: absUrl('/') },
      { '@type': 'ListItem', position: 2, name: article.categoryLabel, item: absUrl('/') },
      { '@type': 'ListItem', position: 3, name: article.title, item: url }
    ]
  };
}

// ============ Generate single article ============
function generateArticle(article) {
  const mdPath = path.join(__dirname, 'content', article.path + '.md');
  if (!fs.existsSync(mdPath)) { console.warn(`  ⚠ Missing: ${mdPath}`); return false; }

  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  let htmlContent = marked.parse(mdContent);

  // Insert stats after first blockquote
  const sb = statsBanner(article.stats);
  if (sb) {
    const bqEnd = htmlContent.indexOf('</blockquote>');
    if (bqEnd !== -1) htmlContent = htmlContent.slice(0, bqEnd + 13) + '\n' + sb + '\n' + htmlContent.slice(bqEnd + 13);
  }

  const dateFormatted = article.date.replace(/-/g, '/');

  const body = header() + `
<main class="main">
  ${breadcrumbs(article)}
  <article class="article-page">
    <h1 class="article-title">${esc(article.title)}</h1>
    <div class="content">${htmlContent}</div>
    <div class="article-footer"><hr>
      <div class="article-meta-grid">
        <div class="article-meta-item"><span class="article-meta-label">发布日期</span><time datetime="${article.date}">${dateFormatted}</time></div>
        <div class="article-meta-item"><span class="article-meta-label">分类</span><span>${article.categoryLabel}</span></div>
        <div class="article-meta-item"><span class="article-meta-label">作者</span><span>${SITE_AUTHOR}</span></div>
      </div>
      <a href="/" class="back-link">← 返回首页</a>
    </div>
  </article>
  ${relatedArticles(article.path)}
</main>` + footer();

  const meta = {
    title: article.title + ' — PowerStorage',
    description: article.excerpt,
    keywords: article.keywords,
    canonical: '/articles/' + article.path + '.html',
    ogType: 'article',
    jsonLd: [articleJsonLd(article), breadcrumbJsonLd(article)]
  };

  const outPath = path.join(OUT_DIR, article.path + '.html');
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, wrapPage(meta, body), 'utf-8');
  return true;
}

// ============ Homepage generation ============
const CAT_ORDER = ['technologies', 'policies', 'projects', 'market'];
const CAT_NAMES = { technologies: '技术路线', policies: '政策研究', projects: '项目与市场', market: '项目与市场' };
const CAT_ICONS = { technologies: '🔋', policies: '📋', projects: '🌍', market: '📈' };

function renderArticleCard(a) {
  const dateStr = a.date.replace(/-/g, '/');
  return `<a href="/articles/${a.path}.html" class="article-card">
    <div class="article-card-category">${CAT_NAMES[a.category]}</div>
    <h2 class="article-card-title">${esc(a.title)}</h2>
    <p class="article-card-excerpt">${esc(a.excerpt)}</p>
    <div class="article-card-meta">
      <time datetime="${a.date}">${dateStr}</time>
      <span class="article-card-read">阅读 →</span>
    </div>
  </a>`;
}

function renderSectionHeader(cat) {
  return `<section class="section-header" id="${cat}-section">
    <span class="section-label">${CAT_ICONS[cat]} ${CAT_NAMES[cat]}</span>
    <h2>${CAT_NAMES[cat]}</h2>
  </section>`;
}

// Pre-render the full article list statically so crawlers see content without JS
function prerenderArticles() {
  const sorted = ARTICLE_MANIFEST.slice().sort((a, b) => b.date.localeCompare(a.date));
  let html = '';
  CAT_ORDER.forEach(cat => {
    const items = sorted.filter(a => a.category === cat);
    if (items.length === 0) return;
    html += renderSectionHeader(cat);
    html += '<div class="article-grid">' + items.map(renderArticleCard).join('') + '</div>';
  });
  return html;
}

function homepageJsonLd() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PowerStorage.cn 文章列表',
    itemListElement: ARTICLE_MANIFEST.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl('/articles/' + a.path + '.html'),
      name: a.title
    }))
  };
  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: absUrl('/#articles-container'),
      'query-input': 'required name=search'
    }
  };
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC
  };
  return [webSite, org, itemList].map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ');
}

function generateHomepage() {
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  html = html.replace('<!-- ARTICLES_PLACEHOLDER -->', prerenderArticles());
  html = html.replace('<!-- HOMEPAGE_JSONLD -->', homepageJsonLd());
  // Inject canonical + og base into homepage head dynamically
  const homeMeta = seoHead({
    title: 'PowerStorage — 储能技术前沿洞察',
    description: SITE_DESC,
    keywords: '储能技术,新型储能,锂离子电池,固态电池,长时储能,构网型,储能政策,储能市场',
    canonical: '/',
    ogType: 'website',
    jsonLd: [] // already injected via placeholder
  });
  // Replace the static SEO meta block (delimited) with full meta
  html = html.replace('<!-- STATIC_SEO -->', homeMeta);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), html, 'utf-8');
}

// ============ Sitemap / robots / llms.txt / RSS ============
function generateSitemap() {
  const urls = [];
  urls.push({ loc: absUrl('/'), lastmod: todayISO(), changefreq: 'daily', priority: '1.0' });
  ARTICLE_MANIFEST.forEach(a => {
    urls.push({
      loc: absUrl('/articles/' + a.path + '.html'),
      lastmod: a.date,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
}

function generateRobots() {
  const txt = `User-agent: *
Allow: /

# LLM / AI crawlers welcome
User-agent: GPTBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${absUrl('/sitemap.xml')}
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), txt, 'utf-8');
}

function generateLlms() {
  const sorted = ARTICLE_MANIFEST.slice().sort((a, b) => b.date.localeCompare(a.date));
  const groups = {};
  CAT_ORDER.forEach(c => groups[c] = sorted.filter(a => a.category === c));
  let md = `# ${SITE_NAME}\n\n`;
  md += `> ${SITE_DESC}\n\n`;
  md += `本站点提供储能技术、政策、项目与市场的深度分析文章，内容由 AI 辅助定期更新（最近更新 2026 年 9 月）。\n`;
  md += `站点地图：${absUrl('/sitemap.xml')}　RSS 订阅：${absUrl('/rss.xml')}\n\n`;
  CAT_ORDER.forEach(cat => {
    const items = groups[cat];
    if (!items || items.length === 0) return;
    md += `## ${CAT_NAMES[cat]}\n\n`;
    items.forEach(a => {
      md += `- [${a.title}](${absUrl('/articles/' + a.path + '.html')}): ${a.excerpt}\n`;
    });
    md += '\n';
  });
  md += `---\n\n如需引用本站内容，请标注来源：PowerStorage.cn (${SITE_URL})。\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), md, 'utf-8');
}

function generateRss() {
  const sorted = ARTICLE_MANIFEST.slice().sort((a, b) => b.date.localeCompare(a.date));
  const items = sorted.map(a => `    <item>
      <title>${esc(a.title)}</title>
      <link>${esc(absUrl('/articles/' + a.path + '.html'))}</link>
      <guid isPermaLink="true">${esc(absUrl('/articles/' + a.path + '.html'))}</guid>
      <pubDate>${new Date(a.date + 'T08:00:00+08:00').toUTCString()}</pubDate>
      <category>${esc(a.categoryLabel)}</category>
      <description>${esc(a.excerpt)}</description>
    </item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(SITE_URL)}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${esc(absUrl('/rss.xml'))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), xml, 'utf-8');
}

// ============ OG image (branded SVG) ============
function generateOgImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#070b14"/>
      <stop offset="1" stop-color="#0e1a30"/>
    </linearGradient>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#grad)"/>
  <text x="80" y="250" font-family="Inter, sans-serif" font-size="72" font-weight="800" fill="#ffffff">PowerStorage.cn</text>
  <text x="80" y="340" font-family="Inter, sans-serif" font-size="44" font-weight="600" fill="#22d3ee">储能技术前沿洞察</text>
  <text x="80" y="410" font-family="Inter, sans-serif" font-size="30" font-weight="400" fill="#9fb3c8">锂电 · 固态 · 液流 · 钠电 · 压缩空气 · 构网型 · 安全消防</text>
  <text x="80" y="560" font-family="Inter, sans-serif" font-size="26" font-weight="400" fill="#64748b">聚焦全球储能技术进展 · ${ARTICLE_MANIFEST.length} 篇深度分析</text>
</svg>`;
  fs.writeFileSync(path.join(ASSET_DIR, 'og-default.svg'), svg, 'utf-8');
}

// ============ Copy static assets ============
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(entry => {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  });
}

// ============ Main ============
console.log('\n🔋 PowerStorage.cn — Build (SEO mode)\n====================================\n');

generateOgImage();
console.log('  ✓ assets/og-default.svg');

generateHomepage();
console.log('  ✓ index.html (with pre-rendered articles + JSON-LD)');

copyDir(path.join(__dirname, 'css'), path.join(PUBLIC_DIR, 'css'));
console.log('  ✓ css/');
copyDir(path.join(__dirname, 'js'), path.join(PUBLIC_DIR, 'js'));
console.log('  ✓ js/');
copyDir(path.join(__dirname, 'assets'), path.join(PUBLIC_DIR, 'assets'));
console.log('  ✓ assets/ (incl. generated infographics)');

let ok = 0, fail = 0;
console.log('\nGenerating article pages...');
ARTICLE_MANIFEST.forEach(a => { if (generateArticle(a)) ok++; else fail++; });
console.log(`  ${ok} article pages, ${fail} failed`);

generateSitemap();
console.log('  ✓ sitemap.xml');
generateRobots();
console.log('  ✓ robots.txt');
generateLlms();
console.log('  ✓ llms.txt');
generateRss();
console.log('  ✓ rss.xml');

fs.writeFileSync(
  path.join(PUBLIC_DIR, 'js', 'manifest.json'),
  JSON.stringify(ARTICLE_MANIFEST, null, 2),
  'utf-8'
);
console.log('  ✓ js/manifest.json');
console.log(`\nDone! Output → ${path.relative(__dirname, PUBLIC_DIR)}/\n`);
