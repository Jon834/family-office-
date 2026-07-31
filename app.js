const STORAGE_KEY = 'family-office-nunez-v2';
const SCHEMA_VERSION = 5;
const ACTIVE_STATUSES = new Set(['active', 'watch']);
const DEFAULT_SETTINGS = {
  monthlyExpense: null,
  targetAnnualDividends: null,
  targetNetWorth: null,
  monthlyContribution: null
};
const DEFAULT_TABLE_SORTS = {
  topPositions: { key: 'allocation', dir: 'desc' },
  portfolio: { key: 'marketValue', dir: 'desc' },
  history: { key: 'date', dir: 'desc' },
  assets: { key: 'value', dir: 'desc' },
  liabilities: { key: 'value', dir: 'desc' },
  reports: { key: 'createdAt', dir: 'desc' }
};
const SORTABLE_TABLES = {
  topPositions: {
    selector: '#dashboard table thead tr',
    columns: [
      { key: 'name', label: 'Empresa', type: 'string' },
      { key: 'marketValue', label: 'Valor', type: 'number' },
      { key: 'allocation', label: 'Peso', type: 'number' },
      { key: 'annualDividend', label: 'Dividendo anual', type: 'number' },
      { key: 'dividendYield', label: 'Yield', type: 'number' }
    ]
  },
  portfolio: {
    selector: '.portfolio-table thead tr',
    columns: [
      { key: 'name', label: 'Empresa', type: 'string' },
      { key: 'quantity', label: 'Cantidad', type: 'number' },
      { key: 'averagePrice', label: 'Precio medio', type: 'number' },
      { key: 'currentPrice', label: 'Precio', type: 'number' },
      { key: 'marketValue', label: 'Valor', type: 'number' },
      { key: 'gain', label: 'Ganancia', type: 'number' },
      { key: 'allocation', label: 'Peso', type: 'number' },
      { key: 'annualDividend', label: 'Div. anual', type: 'number' },
      { key: 'dividendYield', label: 'Yield', type: 'number' },
      { key: 'yieldOnCost', label: 'YOC', type: 'number' },
      { key: 'payDate', label: 'Proximo pago', type: 'date' },
      { key: null, label: '' }
    ]
  },
  history: {
    selector: '#history table thead tr',
    columns: [
      { key: 'date', label: 'Fecha', type: 'date' },
      { key: 'value', label: 'Cartera', type: 'number' },
      { key: 'netWorth', label: 'Patrimonio neto', type: 'number' },
      { key: 'liquidity', label: 'Liquidez', type: 'number' },
      { key: 'debt', label: 'Deuda', type: 'number' },
      { key: 'dividends', label: 'Dividendos', type: 'number' },
      { key: 'count', label: 'Posiciones', type: 'number' },
      { key: null, label: '' }
    ]
  },
  assets: {
    selector: '#assetRows'.replace('tbody','')
  },
  liabilities: {
    selector: '#liabilityRows'.replace('tbody','')
  },
  reports: {
    selector: '#reportRows'.replace('tbody','')
  }
};
SORTABLE_TABLES.assets = {
  selector: '#assetRows',
  columns: [
    { key: 'name', label: 'Nombre', type: 'string' },
    { key: 'type', label: 'Tipo', type: 'string' },
    { key: 'value', label: 'Valor', type: 'number' },
    { key: 'notes', label: 'Notas', type: 'string' },
    { key: null, label: '' }
  ]
};
SORTABLE_TABLES.liabilities = {
  selector: '#liabilityRows',
  columns: [
    { key: 'name', label: 'Nombre', type: 'string' },
    { key: 'type', label: 'Tipo', type: 'string' },
    { key: 'value', label: 'Saldo', type: 'number' },
    { key: 'notes', label: 'Notas', type: 'string' },
    { key: null, label: '' }
  ]
};
SORTABLE_TABLES.reports = {
  selector: '#reportRows',
  columns: [
    { key: 'createdAt', label: 'Fecha', type: 'date' },
    { key: 'score', label: 'Score', type: 'number' },
    { key: 'netWorth', label: 'Patrimonio neto', type: 'number' },
    { key: 'dividends', label: 'Dividendos', type: 'number' },
    { key: 'concentrationLabel', label: 'Concentracion', type: 'string' }
  ]
};


const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const state = loadState();
let pendingImport = null;
let confirmAction = null;
let editingPositionId = null;
let deferredWorker = null;
let newWorker = null;

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    portfolio: [],
    history: [],
    backups: [],
    assets: [],
    liabilities: [],
    reportHistory: [],
    settings: { ...DEFAULT_SETTINGS },
    tableSorts: defaultTableSorts(),
    lastImport: null,
    lastBackupAt: null,
    lastImportUndo: null,
    theme: 'light'
  };
}

function defaultAsset() {
  return {
    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    type: 'cash',
    value: null,
    notes: '',
    updatedAt: new Date().toISOString()
  };
}

function defaultLiability() {
  return {
    id: `liability-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    type: 'mortgage',
    value: null,
    notes: '',
    updatedAt: new Date().toISOString()
  };
}

function defaultReportEntry() {
  return {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    score: null,
    netWorth: null,
    dividends: null,
    concentrationLabel: '',
    filename: ''
  };
}

function loadState() {
  try {
    return withDemoState(migrateState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')));
  } catch {
    return withDemoState(defaultState());
  }
}

function migrateState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') {
    return base;
  }

  return {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    portfolio: Array.isArray(raw.portfolio) ? raw.portfolio.map(migratePosition).filter(Boolean) : [],
    history: Array.isArray(raw.history) ? raw.history.map(migrateSnapshot).filter(Boolean) : [],
    backups: Array.isArray(raw.backups) ? raw.backups.map(migrateBackup).filter(Boolean).slice(0, 10) : [],
    assets: Array.isArray(raw.assets) ? raw.assets.map(migrateAsset).filter(Boolean) : [],
    liabilities: Array.isArray(raw.liabilities) ? raw.liabilities.map(migrateLiability).filter(Boolean) : [],
    reportHistory: Array.isArray(raw.reportHistory) ? raw.reportHistory.map(migrateReportEntry).filter(Boolean).slice(0, 24) : [],
    settings: migrateSettings(raw.settings),
    tableSorts: migrateTableSorts(raw.tableSorts),
    lastImportUndo: raw.lastImportUndo ? migrateBackup(raw.lastImportUndo) : null,
    theme: raw.theme === 'dark' ? 'dark' : 'light'
  };
}

function defaultTableSorts() {
  return JSON.parse(JSON.stringify(DEFAULT_TABLE_SORTS));
}
function migrateTableSorts(raw) {
  const next = defaultTableSorts();
  if (!raw || typeof raw !== 'object') return next;
  Object.entries(DEFAULT_TABLE_SORTS).forEach(([tableId, fallback]) => {
    const current = raw[tableId];
    if (!current || typeof current !== 'object') return;
    next[tableId] = {
      key: typeof current.key === 'string' ? current.key : fallback.key,
      dir: current.dir === 'asc' ? 'asc' : 'desc'
    };
  });
  return next;
}
function getTableSort(tableId) {
  return state.tableSorts?.[tableId] || defaultTableSorts()[tableId] || { key: '', dir: 'desc' };
}
function normalizeSortValue(value, type) {
  if (value === null || value === undefined || value === '') return null;
  if (type === 'date') {
    const stamp = new Date(value).getTime();
    return Number.isFinite(stamp) ? stamp : null;
  }
  if (type === 'number') return typeof value === 'number' ? value : parseLocaleNumber(String(value));
  return String(value).toLocaleLowerCase('es-ES');
}
function compareByType(left, right, type, dir) {
  const leftValue = normalizeSortValue(left, type);
  const rightValue = normalizeSortValue(right, type);
  if (leftValue === null && rightValue === null) return 0;
  if (leftValue === null) return 1;
  if (rightValue === null) return -1;
  if (type === 'string') {
    const result = leftValue.localeCompare(rightValue, 'es');
    return dir === 'asc' ? result : -result;
  }
  const result = leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
  return dir === 'asc' ? result : -result;
}
function sortRows(rows, tableId) {
  const config = SORTABLE_TABLES[tableId];
  const sort = getTableSort(tableId);
  const column = config?.columns?.find(item => item.key === sort.key);
  if (!column || !sort.key) return [...rows];
  return [...rows].sort((a, b) => compareByType(a[sort.key], b[sort.key], column.type, sort.dir));
}
function toggleTableSort(tableId, key) {
  if (!key) return;
  const current = getTableSort(tableId);
  state.tableSorts = state.tableSorts || defaultTableSorts();
  state.tableSorts[tableId] = {
    key,
    dir: current.key === key && current.dir === 'desc' ? 'asc' : 'desc'
  };
  saveState();
  render();
}
function renderSortableHeaders() {
  Object.entries(SORTABLE_TABLES).forEach(([tableId, config]) => {
    const row = config.selector.includes('Rows')
      ? document.querySelector(config.selector)?.closest('table')?.querySelector('thead tr')
      : document.querySelector(config.selector);
    if (!row) return;
    const sort = getTableSort(tableId);
    row.innerHTML = config.columns.map(column => {
      if (!column.key) return '<th></th>';
      const active = sort.key === column.key;
      const arrow = !active ? '<>' : sort.dir === 'desc' ? 'v' : '^';
      return `<th><button type="button" class="sort-button${active ? ' active' : ''}" data-sort-table="${tableId}" data-sort-key="${column.key}"><span>${column.label}</span><small>${arrow}</small></button></th>`;
    }).join('');
  });
}
function migrateSettings(settings) {
  const next = { ...DEFAULT_SETTINGS, ...(settings && typeof settings === 'object' ? settings : {}) };
  next.monthlyExpense = toNum(next.monthlyExpense, null);
  next.targetAnnualDividends = toNum(next.targetAnnualDividends, null);
  next.targetNetWorth = toNum(next.targetNetWorth, null);
  next.monthlyContribution = toNum(next.monthlyContribution, null);
  return next;
}

function migrateAsset(asset) {
  if (!asset || typeof asset !== 'object') {
    return null;
  }
  return {
    id: asset.id || defaultAsset().id,
    name: cleanText(asset.name) || 'Activo sin nombre',
    type: cleanText(asset.type) || 'other',
    value: toNum(asset.value, null),
    notes: cleanText(asset.notes),
    updatedAt: asset.updatedAt || new Date().toISOString()
  };
}

function migrateLiability(liability) {
  if (!liability || typeof liability !== 'object') {
    return null;
  }
  return {
    id: liability.id || defaultLiability().id,
    name: cleanText(liability.name) || 'Deuda sin nombre',
    type: cleanText(liability.type) || 'loan',
    value: toNum(liability.value, null),
    notes: cleanText(liability.notes),
    updatedAt: liability.updatedAt || new Date().toISOString()
  };
}

function migrateReportEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  return {
    id: entry.id || defaultReportEntry().id,
    createdAt: entry.createdAt || new Date().toISOString(),
    score: toNum(entry.score, null),
    netWorth: toNum(entry.netWorth, null),
    dividends: toNum(entry.dividends, null),
    concentrationLabel: cleanText(entry.concentrationLabel),
    filename: cleanText(entry.filename)
  };
}

function migratePosition(position) {
  if (!position || typeof position !== 'object') {
    return null;
  }
  const isin = normalizeIsin(position.isin);
  const symbol = cleanText(position.symbol).toUpperCase();
  const name = cleanText(position.name || symbol || 'Sin nombre');
  const marketValue = toNum(position.marketValue ?? position.value, null);
  const totalCost = toNum(position.totalCost ?? position.buyinTotal, null);
  const annualDividend = toNum(position.annualDividend ?? position.totalDividendRate, null);
  const gain = toNum(position.gain, marketValue !== null && totalCost !== null ? marketValue - totalCost : null);
  const createdAt = position.createdAt || new Date().toISOString();
  const updatedAt = position.updatedAt || createdAt;

  return {
    id: isin || cleanText(position.id) || buildFallbackKey(symbol, name) || `legacy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isin,
    symbol,
    name,
    quantity: toNum(position.quantity, null),
    averagePrice: toNum(position.averagePrice ?? position.buyin, null),
    totalCost,
    currentPrice: toNum(position.currentPrice ?? position.price, null),
    marketValue,
    gain,
    gainPercent: normalizePercentLike(position.gainPercent ?? position.gainRel, gain !== null && totalCost ? gain / totalCost : null),
    currency: normalizeCurrency(position.currency),
    allocation: normalizePercentLike(position.allocation, null),
    dividendYield: normalizePercentLike(position.dividendYield, null),
    yieldOnCost: normalizePercentLike(position.yieldOnCost ?? position.dividendYieldOnBuyin, annualDividend !== null && totalCost ? annualDividend / totalCost : null),
    annualDividend,
    dividendPerShare: toNum(position.dividendPerShare ?? position.dividendRate, null),
    dividendFrequency: normalizeFrequency(position.dividendFrequency),
    dividendCagr: normalizePercentLike(position.dividendCagr, null),
    sector: cleanText(position.sector) || 'Sin clasificar',
    country: cleanText(position.country) || 'Sin país',
    transactions: toNum(position.transactions, null),
    exDate: normalizeDate(position.exDate),
    payDate: normalizeDate(position.payDate),
    taxRate: normalizePercentLike(position.taxRate, null),
    notes: cleanText(position.notes ?? position.note),
    thesis: cleanText(position.thesis),
    targetPrice: toNum(position.targetPrice, null),
    status: normalizeStatus(position.status),
    unreliableMatch: !isin,
    fallbackKey: buildFallbackKey(symbol, name),
    createdAt,
    updatedAt,
    archivedAt: position.archivedAt || null,
    importMeta: position.importMeta && typeof position.importMeta === 'object' ? position.importMeta : null,
    raw: position.raw && typeof position.raw === 'object' ? position.raw : null
  };
}

function migrateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }
  return {
    id: snapshot.id || `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    month: snapshot.month || String(snapshot.date || '').slice(0, 7),
    date: snapshot.date || new Date().toISOString(),
    value: toNum(snapshot.value, 0) || 0,
    cost: toNum(snapshot.cost, 0) || 0,
    gain: toNum(snapshot.gain, 0) || 0,
    dividends: toNum(snapshot.dividends, 0) || 0,
    count: Number.isFinite(snapshot.count) ? snapshot.count : 0,
    liquidity: toNum(snapshot.liquidity, 0) || 0,
    otherAssets: toNum(snapshot.otherAssets, 0) || 0,
    debt: toNum(snapshot.debt, 0) || 0,
    netWorth: toNum(snapshot.netWorth, 0) || 0,
    monthlyContribution: toNum(snapshot.monthlyContribution, null),
    notes: cleanText(snapshot.notes),
    positions: Array.isArray(snapshot.positions) ? snapshot.positions : []
  };
}

function migrateBackup(backup) {
  if (!backup || typeof backup !== 'object' || !backup.snapshot) {
    return null;
  }
  return {
    id: backup.id || `backup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: backup.createdAt || new Date().toISOString(),
    reason: backup.reason || 'import',
    source: backup.source || null,
    snapshot: {
      portfolio: Array.isArray(backup.snapshot.portfolio) ? backup.snapshot.portfolio.map(migratePosition).filter(Boolean) : [],
      history: Array.isArray(backup.snapshot.history) ? backup.snapshot.history.map(migrateSnapshot).filter(Boolean) : [],
      assets: Array.isArray(backup.snapshot.assets) ? backup.snapshot.assets.map(migrateAsset).filter(Boolean) : [],
      liabilities: Array.isArray(backup.snapshot.liabilities) ? backup.snapshot.liabilities.map(migrateLiability).filter(Boolean) : [],
      reportHistory: Array.isArray(backup.snapshot.reportHistory) ? backup.snapshot.reportHistory.map(migrateReportEntry).filter(Boolean) : [],
      settings: migrateSettings(backup.snapshot.settings),
      lastImport: backup.snapshot.lastImport || null,
      lastBackupAt: backup.snapshot.lastBackupAt || null
    }
  };
}

function saveState() {
  state.schemaVersion = SCHEMA_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function parseLocaleNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const negative = /^\(.*\)$/.test(text);
  const normalized = Number(text.replace(/^\(|\)$/g, '').replace(/\s/g, '').replace(/€/g, '').replace(/%/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(normalized) ? (negative ? -normalized : normalized) : null;
}

function parsePercent(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  const parsed = parseLocaleNumber(text);
  if (parsed === null) return null;
  return text.includes('%') || Math.abs(parsed) > 1 ? parsed / 100 : parsed;
}

function toNum(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePercentLike(value, fallback = null) {
  if (value !== null && value !== undefined && value !== '') return parsePercent(value);
  return fallback;
}

function normalizeCurrency(value) { return cleanText(value).toUpperCase() || 'EUR'; }
function normalizeStatus(value) { const text = cleanText(value).toLowerCase(); if (['sold', 'vendida', 'closed', 'archived', 'cerrada'].includes(text)) return 'archived'; if (['watch', 'seguimiento'].includes(text)) return 'watch'; return 'active'; }
function normalizeFrequency(value) { if (value === null || value === undefined || value === '') return null; const text = cleanText(value).toLowerCase(); if (/^\d+$/.test(text)) return Number(text); return ({ annual: 1, yearly: 1, semiannual: 2, quarterly: 4, monthly: 12 }[text]) || cleanText(value); }
function normalizeDate(value) { const text = cleanText(value); if (!text) return ''; if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text; const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/); if (match) { const [, day, month, year] = match; const fullYear = year.length === 2 ? `20${year}` : year; return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; } const date = new Date(text); return Number.isNaN(date.valueOf()) ? '' : date.toISOString().slice(0, 10); }
function normalizeIsin(value) { const text = cleanText(value).toUpperCase().replace(/\s/g, ''); return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(text) ? text : ''; }
function buildFallbackKey(symbol, name) { const s = cleanText(symbol).toUpperCase(); const n = cleanText(name).toLowerCase(); return s || n ? `${s}|${n}` : ''; }
function dateEs(value) { if (!value) return '—'; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.valueOf()) ? '—' : new Intl.DateTimeFormat('es-ES').format(date); }
function formatPercent(value) { return value === null || value === undefined ? '—' : pct.format(value); }
function formatCurrency(value, currency = 'EUR') { if (value === null || value === undefined) return '—'; return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value); }
function relativeDelta(current, previous) { if (!previous) return null; return (current - previous) / previous; }
function activePortfolio(list = state.portfolio) { return list.filter(position => ACTIVE_STATUSES.has(normalizeStatus(position.status))); }
function sortedPortfolio(list = activePortfolio()) { return [...list].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)); }
function sumValues(list) { return list.reduce((sum, item) => sum + (item.value || 0), 0); }
function totals(list = activePortfolio()) { const value = list.reduce((sum, position) => sum + (position.marketValue || 0), 0); const cost = list.reduce((sum, position) => sum + (position.totalCost || 0), 0); const dividends = list.reduce((sum, position) => sum + (position.annualDividend || 0), 0); const gain = value - cost; return { value, cost, dividends, gain, yield: value ? dividends / value : 0, yoc: cost ? dividends / cost : 0, count: list.length }; }
function assetTotals() { const assets = sumValues(state.assets); const liabilities = sumValues(state.liabilities); const liquidity = sumValues(state.assets.filter(asset => ['cash', 'money-market', 'treasury'].includes(asset.type))); return { assets, liabilities, liquidity, otherAssets: assets - liquidity }; }
function fullMetrics(portfolio = activePortfolio()) { const portfolioTotals = totals(portfolio); const other = assetTotals(); const netWorth = portfolioTotals.value + other.assets - other.liabilities; const dividendGoal = state.settings.targetAnnualDividends || null; const netWorthGoal = state.settings.targetNetWorth || null; return { ...portfolioTotals, liquidity: other.liquidity, otherAssets: other.otherAssets, liabilities: other.liabilities, netWorth, dividendGoalProgress: dividendGoal ? portfolioTotals.dividends / dividendGoal : null, netWorthGoalProgress: netWorthGoal ? netWorth / netWorthGoal : null }; }
function groupByValue(list, field, totalValue) { const map = {}; list.forEach(position => { const key = position[field] || 'Sin clasificar'; map[key] = (map[key] || 0) + (position.marketValue || 0); }); return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, weight: totalValue ? value / totalValue : 0 })); }
function concentrationState(weight, green, amber) { if (weight < green) return { tone: 'good', label: 'Controlada' }; if (weight < amber) return { tone: 'warn', label: 'Vigilar' }; return { tone: 'risk', label: 'Alta' }; }
function concentrationSignals(portfolio = activePortfolio()) {
  const metrics = totals(portfolio);
  if (!metrics.value || !portfolio.length) return [];
  const topPosition = sortedPortfolio(portfolio)[0];
  const topCountry = groupByValue(portfolio, 'country', metrics.value)[0] || { name: '—', weight: 0 };
  const topSector = groupByValue(portfolio, 'sector', metrics.value)[0] || { name: '—', weight: 0 };
  const signals = [
    { title: 'Empresa', name: topPosition?.name || '—', weight: topPosition ? (topPosition.marketValue || 0) / metrics.value : 0, ...concentrationState(topPosition ? (topPosition.marketValue || 0) / metrics.value : 0, 0.12, 0.2) },
    { title: 'País', name: topCountry.name, weight: topCountry.weight, ...concentrationState(topCountry.weight, 0.25, 0.4) },
    { title: 'Sector', name: topSector.name, weight: topSector.weight, ...concentrationState(topSector.weight, 0.2, 0.35) }
  ];
  return signals;
}
function portfolioScore(portfolio = activePortfolio()) {
  if (!portfolio.length) return { value: 0, label: 'Sin datos', detail: 'Importa una cartera para calcular la puntuación.', concentrationLabel: 'Sin datos' };
  const metrics = totals(portfolio);
  const positions = portfolio.length;
  const sectors = groupByValue(portfolio, 'sector', metrics.value);
  const countries = groupByValue(portfolio, 'country', metrics.value);
  const signals = concentrationSignals(portfolio);
  const maxCompany = signals[0]?.weight || 0;
  const maxCountry = signals[1]?.weight || 0;
  const maxSector = signals[2]?.weight || 0;
  const debtRatio = metrics.value + assetTotals().assets > 0 ? assetTotals().liabilities / (metrics.value + assetTotals().assets) : 0;
  let score = 100;
  score -= Math.max(0, (maxCompany - 0.1) * 180);
  score -= Math.max(0, (maxSector - 0.18) * 120);
  score -= Math.max(0, (maxCountry - 0.22) * 90);
  score -= Math.max(0, 14 - positions) * 2.2;
  score -= Math.max(0, 6 - sectors.length) * 4.5;
  score -= Math.max(0, 4 - countries.length) * 3.5;
  score -= Math.max(0, debtRatio - 0.2) * 45;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 80 ? 'Sólida' : score >= 65 ? 'Buena' : score >= 50 ? 'Mejorable' : 'Débil';
  const worstTone = signals.some(signal => signal.tone === 'risk') ? 'Alta' : signals.some(signal => signal.tone === 'warn') ? 'Media' : 'Baja';
  return { value: score, label, detail: `${positions} posiciones, ${sectors.length} sectores y ${countries.length} países representados.`, concentrationLabel: worstTone };
}
function independenceScenarios(metrics = fullMetrics()) {
  const annualTarget = state.settings.monthlyExpense ? state.settings.monthlyExpense * 12 : null;
  if (!annualTarget) return null;
  const baseYield = metrics.yield || 0.035;
  const annualContribution = (state.settings.monthlyContribution || 0) * 12;
  const scenarioDefs = [
    { id: 'prudente', label: 'Prudente', growth: 0.02, marketReturn: 0.04 },
    { id: 'central', label: 'Central', growth: 0.04, marketReturn: 0.06 },
    { id: 'favorable', label: 'Favorable', growth: 0.06, marketReturn: 0.08 }
  ];
  return scenarioDefs.map(def => {
    let portfolioValue = metrics.value;
    let dividends = metrics.dividends;
    let years = null;
    for (let year = 1; year <= 40; year += 1) {
      portfolioValue = (portfolioValue + annualContribution) * (1 + def.marketReturn);
      const generatedIncome = (annualContribution * baseYield) + (portfolioValue * baseYield * 0.18);
      dividends = Math.max(dividends * (1 + def.growth), dividends + generatedIncome);
      if (dividends >= annualTarget) { years = year; break; }
    }
    return {
      ...def,
      target: annualTarget,
      progress: metrics.dividends / annualTarget,
      years,
      eta: years === null ? 'Más de 40 años' : `${new Date().getFullYear() + years}`,
      status: years === null ? 'Largo plazo' : years <= 10 ? 'Cerca' : years <= 20 ? 'En curso' : 'Largo plazo'
    };
  });
}
function reportHistoryRows() { return [...state.reportHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
function saveReportHistoryEntry(entry) { state.reportHistory = [entry, ...state.reportHistory].slice(0, 24); }
function render() { applyTheme(); renderDashboard(); renderPortfolio(); renderHistory(); renderFilters(); renderAssets(); renderLiabilities(); renderSettings(); renderUndoState(); renderBackupStatus(); renderReportHistory(); renderSortableHeaders(); }
function applyTheme() { document.body.classList.toggle('dark', state.theme === 'dark'); $('#themeBtn wa-icon')?.setAttribute('name', state.theme === 'dark' ? 'sun' : 'moon'); }
function renderDashboard() {
  const portfolio = activePortfolio();
  const metrics = fullMetrics(portfolio);
  const snapshots = [...state.history].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastSnapshot = snapshots[0] || null;
  const previousSnapshot = snapshots[1] || null;
  const score = portfolioScore(portfolio);
  const signals = concentrationSignals(portfolio);
  const scenarios = independenceScenarios(metrics);
  $('#kpiValue').textContent = eur.format(metrics.value);
  $('#kpiPositions').textContent = `${metrics.count} posiciones`;
  $('#kpiCost').textContent = eur.format(metrics.cost);
  $('#kpiGain').textContent = `Plusvalía: ${eur.format(metrics.gain)}`;
  $('#kpiDividends').textContent = eur.format(metrics.dividends);
  $('#kpiYield').textContent = `Yield: ${pct.format(metrics.yield)}`;
  $('#kpiYoc').textContent = pct.format(metrics.yoc);
  $('#kpiMonthly').textContent = `Media mensual: ${eur.format(metrics.dividends / 12)}`;
  $('#lastUpdated').textContent = state.lastImport ? `Última importación: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(state.lastImport))}` : 'Importa el CSV de DivvyDiary para comenzar.';
  $('#netWorthValue').textContent = eur.format(metrics.netWorth);
  $('#netWorthMeta').textContent = metrics.netWorthGoalProgress === null ? 'Configura un objetivo de patrimonio neto.' : `Progreso: ${pct.format(Math.min(metrics.netWorthGoalProgress, 9.99))}`;
  $('#liquidityValue').textContent = eur.format(metrics.liquidity);
  $('#liquidityMeta').textContent = `Otros activos: ${eur.format(metrics.otherAssets)}`;
  $('#debtValue').textContent = eur.format(metrics.liabilities);
  $('#debtMeta').textContent = lastSnapshot ? `Último cierre: ${eur.format(lastSnapshot.debt || 0)}` : 'Sin cierre mensual todavía.';
  $('#goalValue').textContent = metrics.dividendGoalProgress === null ? '—' : pct.format(Math.min(metrics.dividendGoalProgress, 9.99));
  $('#goalMeta').textContent = state.settings.targetAnnualDividends ? `Objetivo: ${eur.format(state.settings.targetAnnualDividends)}` : 'Configura un objetivo anual de dividendos.';
  $('#snapshotDelta').textContent = lastSnapshot && previousSnapshot ? `Variación vs. cierre anterior: ${formatPercent(relativeDelta(lastSnapshot.netWorth || 0, previousSnapshot.netWorth || 0))}` : 'Necesitas al menos dos cierres para ver variaciones.';
  $('#latestSnapshot').textContent = lastSnapshot ? `Último cierre: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(lastSnapshot.date))} · Patrimonio neto ${eur.format(lastSnapshot.netWorth || 0)}` : 'Todavía no hay cierres mensuales.';
  $('#portfolioScore').textContent = String(score.value);
  $('#portfolioScoreLabel').textContent = `${score.label} · ${score.value}/100`;
  $('#portfolioScoreMeta').textContent = score.label === 'Sin datos' ? score.detail : `${score.detail} Concentración ${score.concentrationLabel.toLowerCase()}.`;
  $('#concentrationRows').className = signals.length ? 'signal-list' : 'signal-list empty-state';
  $('#concentrationRows').innerHTML = signals.length ? signals.map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${signal.title}</strong><span>${escapeHtml(signal.name)}</span><small>${formatPercent(signal.weight)} · ${signal.label}</small></div>`).join('') : 'Sin datos';
  $('#fiGoalStatus').textContent = scenarios ? `Objetivo anual: ${eur.format(scenarios[0].target)} · progreso actual ${pct.format(Math.min(scenarios[0].progress, 9.99))}` : 'Configura tu gasto mensual para ver escenarios.';
  $('#fiGoalMeta').textContent = scenarios ? `Aportación mensual considerada: ${state.settings.monthlyContribution === null ? '0 €' : eur.format(state.settings.monthlyContribution)}` : 'Se calcula con dividendos actuales, aportación mensual y tres supuestos de crecimiento.';
  const fiRows = $('#fiRows');
  if (!scenarios) { fiRows.className = 'scenario-list empty-state'; fiRows.textContent = 'Sin datos'; }
  else { fiRows.className = 'scenario-list'; fiRows.innerHTML = scenarios.map(s => `<div class="scenario-card"><strong>${s.label}</strong><span>${s.status}</span><small>${s.years === null ? 'Más de 40 años' : `${s.years} años`}</small><small>Meta estimada: ${s.eta}</small></div>`).join(''); }
  renderBars('#sectorChart', groupByValue(portfolio, 'sector', metrics.value).slice(0, 8));
  renderBars('#countryChart', groupByValue(portfolio, 'country', metrics.value).slice(0, 8));
  const top = sortRows(sortedPortfolio(portfolio).slice(0, 7), 'topPositions');
  $('#topPositions').innerHTML = top.length ? top.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} · ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td>${eur.format(position.marketValue || 0)}</td><td>${formatPercent(position.allocation ?? (metrics.value ? (position.marketValue || 0) / metrics.value : 0))}</td><td>${eur.format(position.annualDividend || 0)}</td><td>${formatPercent(position.dividendYield)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavía no hay posiciones.</td></tr>';
}
function renderBars(selector, data) { const element = $(selector); if (!data.length) { element.className = 'bar-chart empty-state'; element.textContent = 'Sin datos'; return; } const max = data[0].value || 1; element.className = 'bar-chart'; element.innerHTML = data.map(item => `<div class="bar-row"><span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (item.value / max) * 100)}%"></div></div><span class="bar-value">${pct.format(item.weight)}</span></div>`).join(''); }
function portfolioFilters() { return { query: ($('#searchInput')?.value || '').toLowerCase(), sector: $('#sectorFilter')?.value || '', country: $('#countryFilter')?.value || '', currency: $('#currencyFilter')?.value || '', status: $('#statusFilter')?.value || 'active' }; }
function filteredPortfolio() { const { query, sector, country, currency, status } = portfolioFilters(); const rows = state.portfolio.filter(position => { const haystack = `${position.name} ${position.symbol} ${position.isin}`.toLowerCase(); const positionStatus = normalizeStatus(position.status); const statusOk = status === 'all' ? true : positionStatus === status; return (!query || haystack.includes(query)) && (!sector || position.sector === sector) && (!country || position.country === country) && (!currency || position.currency === currency) && statusOk; }); return sortRows(rows, 'portfolio'); }
function renderPortfolio() { const list = filteredPortfolio(); $('#portfolioRows').innerHTML = list.length ? list.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} · ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td>${position.quantity === null ? '—' : num.format(position.quantity)}</td><td>${formatCurrency(position.averagePrice, position.currency)}</td><td>${formatCurrency(position.currentPrice, position.currency)}</td><td>${formatCurrency(position.marketValue, position.currency)}</td><td class="${(position.gain || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(position.gain, position.currency)}<br><small>${formatPercent(position.gainPercent)}</small></td><td>${formatPercent(position.allocation)}</td><td>${formatCurrency(position.annualDividend, position.currency)}</td><td>${formatPercent(position.dividendYield)}</td><td>${formatPercent(position.yieldOnCost)}</td><td>${dateEs(position.payDate)}</td><td><wa-button size="small" appearance="plain" data-edit-position="${position.id}"><wa-icon name="pen-to-square"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="12" class="empty-cell">No hay resultados.</td></tr>'; }
function renderFilters() { [['#sectorFilter', 'sector', 'Todos'], ['#countryFilter', 'country', 'Todos'], ['#currencyFilter', 'currency', 'Todas']].forEach(([selector, field, label]) => { const element = $(selector); if (!element) return; const current = element.value || ''; const values = [...new Set(state.portfolio.map(position => position[field]).filter(Boolean))].sort(); element.innerHTML = `<wa-option value="">${label}</wa-option>` + values.map(value => `<wa-option value="${escapeHtml(value)}">${escapeHtml(value)}</wa-option>`).join(''); element.value = values.includes(current) ? current : ''; }); }
function renderHistory() { const rows = sortRows(state.history, 'history'); $('#historyRows').innerHTML = rows.length ? rows.map(snapshot => `<tr><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(snapshot.date))}</td><td>${eur.format(snapshot.value)}</td><td>${eur.format(snapshot.netWorth || 0)}</td><td>${eur.format(snapshot.liquidity || 0)}</td><td>${eur.format(snapshot.debt || 0)}</td><td>${eur.format(snapshot.dividends)}</td><td>${snapshot.count}</td><td><wa-button size="small" appearance="plain" data-delete-snapshot="${snapshot.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="8" class="empty-cell">No hay cierres guardados.</td></tr>'; const chronological = [...state.history].sort((a, b) => new Date(a.date) - new Date(b.date)); const chart = $('#historyChart'); if (!chronological.length) { chart.className = 'history-chart empty-state'; chart.textContent = 'Sin cierres mensuales'; return; } const max = Math.max(...chronological.map(snapshot => snapshot.netWorth || snapshot.value), 1); chart.className = 'history-chart'; chart.innerHTML = `<div class="history-bars">${chronological.map(snapshot => `<div class="history-col"><div class="history-bar" style="height:${Math.max(3, ((snapshot.netWorth || snapshot.value) / max) * 100)}%" data-value="${eur.format(snapshot.netWorth || snapshot.value)}"></div><small>${new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(new Date(snapshot.date))}</small></div>`).join('')}</div>`; }
function renderAssets() { const rows = sortRows(state.assets, 'assets'); $('#assetRows').innerHTML = rows.length ? rows.map(asset => `<tr><td>${escapeHtml(asset.name)}</td><td>${escapeHtml(asset.type)}</td><td>${eur.format(asset.value || 0)}</td><td>${escapeHtml(asset.notes || '—')}</td><td><wa-button size="small" appearance="plain" data-delete-asset="${asset.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">No hay activos adicionales.</td></tr>'; }
function renderLiabilities() { const rows = sortRows(state.liabilities, 'liabilities'); $('#liabilityRows').innerHTML = rows.length ? rows.map(liability => `<tr><td>${escapeHtml(liability.name)}</td><td>${escapeHtml(liability.type)}</td><td>${eur.format(liability.value || 0)}</td><td>${escapeHtml(liability.notes || '—')}</td><td><wa-button size="small" appearance="plain" data-delete-liability="${liability.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">No hay deudas registradas.</td></tr>'; }
function renderSettings() { $('#monthlyExpenseInput').value = state.settings.monthlyExpense ?? ''; $('#targetDividendInput').value = state.settings.targetAnnualDividends ?? ''; $('#targetNetWorthInput').value = state.settings.targetNetWorth ?? ''; $('#monthlyContributionInput').value = state.settings.monthlyContribution ?? ''; }
function renderUndoState() { const hasUndo = Boolean(state.lastImportUndo?.snapshot); ['#undoImportBtn', '#undoImportSettingsBtn'].forEach(selector => { const button = $(selector); if (!button) return; if (selector === '#undoImportBtn') button.hidden = !hasUndo; button.disabled = !hasUndo; }); $('#undoHelpText').textContent = hasUndo ? `Disponible la copia previa creada el ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastImportUndo.createdAt))}.` : 'No hay ninguna importación reciente para revertir.'; }
function renderBackupStatus() { $('#backupStatus').textContent = state.lastBackupAt ? `Última copia automática: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastBackupAt))}.` : 'Todavía no se ha generado ninguna copia automática previa a importación.'; }
function renderReportHistory() { const rows = sortRows(reportHistoryRows(), 'reports'); $('#reportRows').innerHTML = rows.length ? rows.map(row => `<tr><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.createdAt))}</td><td>${row.score === null ? '—' : `${row.score}/100`}</td><td>${row.netWorth === null ? '—' : eur.format(row.netWorth)}</td><td>${row.dividends === null ? '—' : eur.format(row.dividends)}</td><td>${escapeHtml(row.concentrationLabel || '—')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavía no hay informes generados.</td></tr>'; }
function showNotice(message) { const notice = $('#notice'); notice.textContent = message; notice.classList.add('show'); clearTimeout(notice._timer); notice._timer = setTimeout(() => notice.classList.remove('show'), 3500); }
function switchView(id) { $$('.view').forEach(view => view.classList.toggle('active', view.id === id)); $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === id)); scrollTo({ top: 0, behavior: 'smooth' }); }
function openImport() { pendingImport = null; $('#csvFile').value = ''; $('#importMode').value = 'update'; $('#importStepSelect').hidden = false; $('#importStepPreview').hidden = true; $('#confirmImportBtn').hidden = true; $('#importWarnings').hidden = true; $('#importDialog').open = true; }
function sanitizeRow(row) { return Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [cleanText(key).replace(/^\uFEFF/, ''), value])); }
function normalizeCsvRow(row, index) { const cleanRow = sanitizeRow(row); const symbol = cleanText(cleanRow.symbol).toUpperCase(); const name = cleanText(cleanRow.name || symbol || `Fila ${index + 2}`); const isin = normalizeIsin(cleanRow.isin); const totalCost = parseLocaleNumber(cleanRow.buyinTotal); const marketValue = parseLocaleNumber(cleanRow.value); const annualDividend = parseLocaleNumber(cleanRow.totalDividendRate); const gain = parseLocaleNumber(cleanRow.gain) ?? (marketValue !== null && totalCost !== null ? marketValue - totalCost : null); const position = { id: isin, isin, symbol, name, quantity: parseLocaleNumber(cleanRow.quantity), averagePrice: parseLocaleNumber(cleanRow.buyin), totalCost, currentPrice: parseLocaleNumber(cleanRow.price), marketValue, gain, gainPercent: parsePercent(cleanRow.gainRel) ?? (gain !== null && totalCost ? gain / totalCost : null), currency: normalizeCurrency(cleanRow.currency), allocation: parsePercent(cleanRow.allocation), dividendYield: parsePercent(cleanRow.dividendYield), yieldOnCost: parsePercent(cleanRow.dividendYieldOnBuyin) ?? (annualDividend !== null && totalCost ? annualDividend / totalCost : null), annualDividend, dividendPerShare: parseLocaleNumber(cleanRow.dividendRate), dividendFrequency: normalizeFrequency(cleanRow.dividendFrequency), dividendCagr: parsePercent(cleanRow.dividendCagr), sector: cleanText(cleanRow.sector) || 'Sin clasificar', country: cleanText(cleanRow.country) || 'Sin país', transactions: parseLocaleNumber(cleanRow.transactions), exDate: normalizeDate(cleanRow.exDate), payDate: normalizeDate(cleanRow.payDate), taxRate: parsePercent(cleanRow.taxRate), notes: '', thesis: '', targetPrice: null, status: 'active', unreliableMatch: !isin, fallbackKey: buildFallbackKey(symbol, name), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archivedAt: null, importMeta: { source: 'divvydiary', importedAt: new Date().toISOString(), rowNumber: index + 2 }, raw: cleanRow }; const issues = []; if (!isin) issues.push('Posición sin ISIN válido. No se sincroniza automáticamente.'); if (marketValue === null) issues.push('Falta el valor de mercado.'); if (position.quantity === null) issues.push('Falta la cantidad.'); return { rowNumber: index + 2, position, issues }; }
function materialDiff(existing, incoming) { const fields = [['name', 'Nombre'], ['symbol', 'Ticker'], ['quantity', 'Cantidad'], ['averagePrice', 'Precio medio'], ['totalCost', 'Coste'], ['currentPrice', 'Precio actual'], ['marketValue', 'Valor'], ['gain', 'Ganancia'], ['gainPercent', 'Ganancia %'], ['currency', 'Divisa'], ['allocation', 'Peso'], ['dividendYield', 'Yield'], ['yieldOnCost', 'Yield on cost'], ['annualDividend', 'Dividendo anual'], ['dividendPerShare', 'Dividendo por acción'], ['dividendFrequency', 'Frecuencia'], ['dividendCagr', 'CAGR dividendo'], ['sector', 'Sector'], ['country', 'País'], ['exDate', 'Ex-date'], ['payDate', 'Pay-date'], ['taxRate', 'Retención']]; const changed = []; fields.forEach(([field, label]) => { const left = existing[field]; const right = incoming[field]; if (typeof left === 'number' || typeof right === 'number') { const l = left ?? null; const r = right ?? null; if (l === null && r === null) return; if (l === null || r === null || Math.abs(l - r) > 0.0001) changed.push(label); return; } if ((left || '') !== (right || '')) changed.push(label); }); return changed; }
function buildImportPreview(file, rows) { const existingByIsin = new Map(activePortfolio().filter(position => position.isin).map(position => [position.isin, position])); const seenIsins = new Set(); const preview = { file, rows, validEntries: [], skippedRows: [], newItems: [], updatedItems: [], removedItems: [], issues: [], totals: null }; rows.forEach(item => { const { position, issues, rowNumber } = item; if (issues.length) preview.issues.push(...issues.map(message => ({ rowNumber, message, label: `${position.name} · ${position.symbol}` }))); if (!position.isin) { preview.skippedRows.push({ rowNumber, position, reason: 'Sin ISIN válido' }); return; } if (seenIsins.has(position.isin)) { preview.issues.push({ rowNumber, message: `ISIN duplicado en el CSV: ${position.isin}`, label: position.name }); preview.skippedRows.push({ rowNumber, position, reason: 'ISIN duplicado en el CSV' }); return; } seenIsins.add(position.isin); const existing = existingByIsin.get(position.isin); if (!existing) { preview.newItems.push({ rowNumber, position }); preview.validEntries.push({ rowNumber, type: 'new', position, existing: null, changedFields: [] }); return; } const changedFields = materialDiff(existing, position); const entry = { rowNumber, type: changedFields.length ? 'updated' : 'unchanged', position, existing, changedFields }; preview.validEntries.push(entry); if (changedFields.length) preview.updatedItems.push(entry); }); const importedIsins = new Set(preview.validEntries.map(entry => entry.position.isin)); preview.removedItems = activePortfolio().filter(position => position.isin && !importedIsins.has(position.isin)).map(position => ({ position })); preview.totals = totals(preview.validEntries.map(entry => entry.position)); return preview; }
function parseCsv(file) { if (!window.Papa) { showNotice('No se ha cargado el lector CSV. Comprueba la conexión.'); return; } Papa.parse(file, { header: true, skipEmptyLines: true, delimiter: ';', encoding: 'UTF-8', complete: result => { const fields = (result.meta.fields || []).map(field => cleanText(field).replace(/^\uFEFF/, '')); const required = ['isin', 'name', 'quantity', 'value']; const missing = required.filter(field => !fields.includes(field)); if (missing.length) { showNotice(`CSV no reconocido. Faltan: ${missing.join(', ')}`); return; } const rows = result.data.map((row, index) => normalizeCsvRow(row, index)).filter(item => item.position.symbol || item.position.name || item.position.isin); if (!rows.length) { showNotice('El CSV no contiene posiciones válidas.'); return; } pendingImport = buildImportPreview(file, rows); renderImportPreview(); }, error: error => showNotice(`Error al leer el CSV: ${error.message}`) }); }
function renderPreviewList(selector, items, formatter) { const element = $(selector); element.innerHTML = items.length ? items.map(formatter).join('') : '<li>Sin cambios</li>'; }
function renderImportPreview() { if (!pendingImport) return; const preview = pendingImport; $('#importFilename').textContent = preview.file.name; $('#importSummary').textContent = `${preview.validEntries.length} posiciones listas para importar y ${preview.skippedRows.length} filas omitidas por seguridad.`; $('#previewCount').textContent = preview.totals.count; $('#previewValue').textContent = eur.format(preview.totals.value); $('#previewCost').textContent = eur.format(preview.totals.cost); $('#previewGain').textContent = eur.format(preview.totals.gain); $('#previewDividends').textContent = eur.format(preview.totals.dividends); $('#previewNew').textContent = `${preview.newItems.length} nuevas`; $('#previewUpdated').textContent = `${preview.updatedItems.length} actualizadas`; $('#previewRemoved').textContent = `${preview.removedItems.length} ausentes`; $('#previewErrors').textContent = `${preview.issues.length} incidencias`; renderPreviewList('#previewNewList', preview.newItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.position.isin)}</small></li>`); renderPreviewList('#previewUpdatedList', preview.updatedItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.changedFields.join(', '))}</small></li>`); renderPreviewList('#previewRemovedList', preview.removedItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.position.isin)}</small></li>`); const issues = [...preview.skippedRows.map(item => ({ rowNumber: item.rowNumber, text: `${item.position.name} — ${item.reason}` })), ...preview.issues.map(issue => ({ rowNumber: issue.rowNumber, text: `${issue.label} — ${issue.message}` }))]; renderPreviewList('#previewIssueList', issues, issue => `<li>Fila ${issue.rowNumber}: ${escapeHtml(issue.text)}</li>`); $('#importStepSelect').hidden = true; $('#importStepPreview').hidden = false; $('#confirmImportBtn').hidden = false; updateImportWarnings(); }
function updateImportWarnings() { const warning = $('#importWarnings'); if (!pendingImport) { warning.hidden = true; return; } const mode = $('#importMode').value || 'update'; const messages = []; if (pendingImport.skippedRows.length) messages.push(`Se omitirán ${pendingImport.skippedRows.length} filas sin ISIN válido o con ISIN duplicado.`); if (mode === 'replace' && pendingImport.removedItems.length) messages.push(`Las ${pendingImport.removedItems.length} posiciones ausentes se archivarán, no se borrarán.`); if (!messages.length) { warning.hidden = true; warning.innerHTML = ''; return; } warning.hidden = false; warning.innerHTML = messages.map(message => `<div>${escapeHtml(message)}</div>`).join(''); }
function cloneSnapshot() { return JSON.parse(JSON.stringify({ portfolio: state.portfolio, history: state.history, assets: state.assets, liabilities: state.liabilities, reportHistory: state.reportHistory, settings: state.settings, lastImport: state.lastImport, lastBackupAt: state.lastBackupAt })); }
function saveImportBackup(sourceName) { const snapshot = cloneSnapshot(); const backup = { id: crypto.randomUUID?.() || `backup-${Date.now()}`, createdAt: new Date().toISOString(), reason: 'before-import', source: sourceName, snapshot }; state.lastImportUndo = backup; state.lastBackupAt = backup.createdAt; state.backups = [backup, ...state.backups].slice(0, 10); }
function mergeImportedPosition(existing, incoming) { const now = new Date().toISOString(); return { ...existing, ...incoming, id: existing.id || incoming.id, isin: incoming.isin || existing.isin, notes: existing.notes || '', thesis: existing.thesis || '', targetPrice: existing.targetPrice ?? null, status: existing.status === 'watch' ? 'watch' : 'active', unreliableMatch: false, fallbackKey: incoming.fallbackKey || existing.fallbackKey, createdAt: existing.createdAt || now, updatedAt: now, archivedAt: null }; }
function createImportedPosition(incoming) { const now = new Date().toISOString(); return { ...incoming, id: incoming.isin || incoming.id || `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, notes: incoming.notes || '', thesis: incoming.thesis || '', targetPrice: incoming.targetPrice ?? null, status: 'active', createdAt: now, updatedAt: now, archivedAt: null }; }
function confirmImport() { if (!pendingImport) return; const mode = $('#importMode').value || 'update'; saveImportBackup(pendingImport.file.name); const next = new Map(); if (mode === 'update') { state.portfolio.forEach(position => next.set(position.id, { ...position })); pendingImport.validEntries.forEach(entry => { const record = entry.existing ? mergeImportedPosition(entry.existing, entry.position) : createImportedPosition(entry.position); next.set(record.id, record); }); } else { state.portfolio.filter(position => !position.isin).forEach(position => next.set(position.id, { ...position })); pendingImport.validEntries.forEach(entry => { const record = entry.existing ? mergeImportedPosition(entry.existing, entry.position) : createImportedPosition(entry.position); next.set(record.id, record); }); const importedIsins = new Set(pendingImport.validEntries.map(entry => entry.position.isin)); state.portfolio.forEach(position => { if (position.isin && !importedIsins.has(position.isin)) next.set(position.id, { ...position, status: 'archived', archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); }); } state.portfolio = [...next.values()]; state.lastImport = new Date().toISOString(); saveState(); render(); $('#importDialog').open = false; showNotice(`Importación completada: ${pendingImport.validEntries.length} posiciones sincronizadas.`); pendingImport = null; }
function undoLastImport() { if (!state.lastImportUndo?.snapshot) { showNotice('No hay ninguna importación que deshacer.'); return; } const snapshot = state.lastImportUndo.snapshot; state.portfolio = snapshot.portfolio.map(migratePosition).filter(Boolean); state.history = snapshot.history.map(migrateSnapshot).filter(Boolean); state.assets = snapshot.assets.map(migrateAsset).filter(Boolean); state.liabilities = snapshot.liabilities.map(migrateLiability).filter(Boolean); state.reportHistory = snapshot.reportHistory.map(migrateReportEntry).filter(Boolean); state.settings = migrateSettings(snapshot.settings); state.lastImport = snapshot.lastImport || null; state.lastBackupAt = snapshot.lastBackupAt || null; state.lastImportUndo = null; saveState(); render(); showNotice('Se ha restaurado la copia previa a la última importación.'); }
function buildMonthlySnapshot() { const portfolio = activePortfolio(); const metrics = fullMetrics(portfolio); return { id: crypto.randomUUID?.() || String(Date.now()), month: new Date().toISOString().slice(0, 7), date: new Date().toISOString(), value: metrics.value, cost: metrics.cost, gain: metrics.gain, dividends: metrics.dividends, count: metrics.count, liquidity: metrics.liquidity, otherAssets: metrics.otherAssets, debt: metrics.liabilities, netWorth: metrics.netWorth, monthlyContribution: state.settings.monthlyContribution, notes: '', positions: sortedPortfolio(portfolio).slice(0, 10).map(position => ({ isin: position.isin, symbol: position.symbol, name: position.name, value: position.marketValue, weight: position.allocation })) }; }
function saveSnapshot() { const portfolio = activePortfolio(); if (!portfolio.length) { showNotice('Importa primero una cartera.'); return; } const snapshot = buildMonthlySnapshot(); const existingIndex = state.history.findIndex(item => item.month === snapshot.month); if (existingIndex >= 0) { snapshot.id = state.history[existingIndex].id; snapshot.notes = state.history[existingIndex].notes || ''; state.history[existingIndex] = snapshot; } else state.history.push(snapshot); saveState(); renderHistory(); renderDashboard(); showNotice('Cierre mensual guardado.'); }
function download(name, content, type) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
function exportJson() { download(`family-office-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), 'application/json'); }
function restoreJson(file) { const reader = new FileReader(); reader.onload = () => { try { const migrated = migrateState(JSON.parse(reader.result)); Object.assign(state, defaultState(), migrated); saveState(); render(); showNotice('Copia restaurada correctamente.'); } catch (error) { showNotice(`No se pudo restaurar: ${error.message}`); } }; reader.readAsText(file); }
function markdown() { const portfolio = sortedPortfolio(activePortfolio()); const metrics = fullMetrics(portfolio); const sector = groupByValue(portfolio, 'sector', metrics.value); const country = groupByValue(portfolio, 'country', metrics.value); const score = portfolioScore(portfolio); const signals = concentrationSignals(portfolio); const scenarios = independenceScenarios(metrics); const lines = ['# Informe mensual Family Office Núñez', '', `Fecha del informe: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date())}`, '', '## Resumen patrimonial', `- Valor de cartera: ${eur.format(metrics.value)}`, `- Coste invertido: ${eur.format(metrics.cost)}`, `- Plusvalía: ${eur.format(metrics.gain)}`, `- Dividendos anuales estimados: ${eur.format(metrics.dividends)}`, `- Liquidez registrada: ${eur.format(metrics.liquidity)}`, `- Otros activos: ${eur.format(metrics.otherAssets)}`, `- Deuda total: ${eur.format(metrics.liabilities)}`, `- Patrimonio neto: ${eur.format(metrics.netWorth)}`, '', '## Salud de la cartera', `- Puntuación global: ${score.value}/100 (${score.label})`, ...signals.map(signal => `- Concentración ${signal.title.toLowerCase()}: ${signal.name} con ${pct.format(signal.weight)} (${signal.label})`), '', '## Objetivos financieros', `- Gasto mensual objetivo: ${state.settings.monthlyExpense === null ? 'No configurado' : eur.format(state.settings.monthlyExpense)}`, `- Objetivo anual de dividendos: ${state.settings.targetAnnualDividends === null ? 'No configurado' : eur.format(state.settings.targetAnnualDividends)}`, `- Objetivo de patrimonio neto: ${state.settings.targetNetWorth === null ? 'No configurado' : eur.format(state.settings.targetNetWorth)}`, '', '## Escenarios de independencia financiera', ...(scenarios ? scenarios.map(s => `- ${s.label}: ${s.years === null ? 'más de 40 años' : `${s.years} años`} · meta estimada ${s.eta}`) : ['- Configura el gasto mensual para obtener escenarios.']), '', '## Cartera', '| Empresa | Ticker | ISIN | Valor | Peso | Dividendo anual | Yield | YOC | Estado |', '|---|---|---|---:|---:|---:|---:|---:|---|', ...portfolio.map(position => `| ${position.name.replaceAll('|', '/')} | ${position.symbol} | ${position.isin} | ${eur.format(position.marketValue || 0)} | ${formatPercent(position.allocation)} | ${eur.format(position.annualDividend || 0)} | ${formatPercent(position.dividendYield)} | ${formatPercent(position.yieldOnCost)} | ${position.status} |`), '', '## Distribución por sectores', ...sector.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Distribución geográfica', ...country.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Liquidez, activos y deuda', ...state.assets.map(asset => `- Activo ${asset.name} (${asset.type}): ${eur.format(asset.value || 0)}`), ...state.liabilities.map(liability => `- Deuda ${liability.name} (${liability.type}): ${eur.format(liability.value || 0)}`), '', '## Comentarios personales', '- Exportado desde la aplicación local-first. Los datos permanecen en el dispositivo.']; const filename = `informe-family-office-${new Date().toISOString().slice(0, 10)}.md`; download(filename, lines.join('\n'), 'text/markdown'); saveReportHistoryEntry({ ...defaultReportEntry(), createdAt: new Date().toISOString(), score: score.value, netWorth: metrics.netWorth, dividends: metrics.dividends, concentrationLabel: score.concentrationLabel, filename }); saveState(); renderReportHistory(); showNotice('Informe generado y registrado en el histórico.'); }
function askConfirm(message, onConfirm) {
  confirmAction = typeof onConfirm === 'function' ? onConfirm : null;
  $('#confirmText').textContent = message;
  $('#confirmDialog').open = true;
}
function openPositionDialog(positionId) {
  const position = state.portfolio.find(item => item.id === positionId);
  if (!position) return;
  editingPositionId = position.id;
  $('#positionDialogTitle').textContent = position.name || position.symbol || 'Posición';
  $('#positionSummary').textContent = `${position.symbol || 'Sin ticker'} · ${position.isin || 'Sin ISIN'} · Valor ${formatCurrency(position.marketValue, position.currency)} · Dividendo ${formatCurrency(position.annualDividend, position.currency)}`;
  $('#positionNotes').value = position.notes || '';
  $('#positionThesis').value = position.thesis || '';
  $('#positionTargetPrice').value = position.targetPrice ?? '';
  $('#positionStatus').value = normalizeStatus(position.status);
  $('#positionDialog').open = true;
}
function savePositionDetails() {
  if (!editingPositionId) return;
  const index = state.portfolio.findIndex(item => item.id === editingPositionId);
  if (index < 0) return;
  const position = state.portfolio[index];
  state.portfolio[index] = {
    ...position,
    notes: $('#positionNotes').value.trim(),
    thesis: $('#positionThesis').value.trim(),
    targetPrice: parseLocaleNumber($('#positionTargetPrice').value),
    status: normalizeStatus($('#positionStatus').value),
    archivedAt: normalizeStatus($('#positionStatus').value) === 'archived' ? (position.archivedAt || new Date().toISOString()) : null,
    updatedAt: new Date().toISOString()
  };
  saveState();
  render();
  $('#positionDialog').open = false;
  editingPositionId = null;
  showNotice('Posición actualizada.');
}
function addAsset(event) {
  event.preventDefault();
  const name = $('#assetName').value.trim();
  const value = parseLocaleNumber($('#assetValue').value);
  if (!name || value === null) { showNotice('Completa nombre y valor del activo.'); return; }
  state.assets.unshift({
    ...defaultAsset(),
    id: crypto.randomUUID?.() || `asset-${Date.now()}`,
    name,
    type: $('#assetType').value || 'other',
    value,
    notes: $('#assetNotes').value.trim(),
    updatedAt: new Date().toISOString()
  });
  saveState();
  render();
  $('#assetForm').reset();
  $('#assetType').value = 'cash';
  showNotice('Activo añadido.');
}
function addLiability(event) {
  event.preventDefault();
  const name = $('#liabilityName').value.trim();
  const value = parseLocaleNumber($('#liabilityValue').value);
  if (!name || value === null) { showNotice('Completa nombre y saldo de la deuda.'); return; }
  state.liabilities.unshift({
    ...defaultLiability(),
    id: crypto.randomUUID?.() || `liability-${Date.now()}`,
    name,
    type: $('#liabilityType').value || 'other',
    value,
    notes: $('#liabilityNotes').value.trim(),
    updatedAt: new Date().toISOString()
  });
  saveState();
  render();
  $('#liabilityForm').reset();
  $('#liabilityType').value = 'mortgage';
  showNotice('Deuda añadida.');
}
function saveFinancialSettings(event) {
  event.preventDefault();
  state.settings = {
    ...state.settings,
    monthlyExpense: parseLocaleNumber($('#monthlyExpenseInput').value),
    targetAnnualDividends: parseLocaleNumber($('#targetDividendInput').value),
    targetNetWorth: parseLocaleNumber($('#targetNetWorthInput').value),
    monthlyContribution: parseLocaleNumber($('#monthlyContributionInput').value)
  };
  saveState();
  renderDashboard();
  renderSettings();
  showNotice('Objetivos guardados.');
}
function showUpdateNotice(worker) {
  deferredWorker = worker || null;
  $('#updateBanner').hidden = false;
}
function hideUpdateNotice() {
  $('#updateBanner').hidden = true;
}
function bindWorkerLifecycle(registration) {
  if (!registration) return;
  if (registration.waiting) showUpdateNotice(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;
    newWorker = installing;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) showUpdateNotice(installing);
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (newWorker) window.location.reload();
  });
}
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      bindWorkerLifecycle(registration);
    } catch (error) {
      console.error('SW registration failed', error);
    }
  });
}
$('#themeBtn')?.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveState();
  applyTheme();
});
['#importBtn', '#portfolioImportBtn'].forEach(selector => $(selector)?.addEventListener('click', openImport));
$('#chooseCsvBtn')?.addEventListener('click', () => $('#csvFile').click());
$('#cancelImportBtn')?.addEventListener('click', () => { $('#importDialog').open = false; pendingImport = null; });
$('#confirmImportBtn')?.addEventListener('click', confirmImport);
$('#csvFile')?.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (file) parseCsv(file);
});
$('#importMode')?.addEventListener('input', updateImportWarnings);
const dropZone = $('#dropZone');
if (dropZone) {
  ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
  }));
  dropZone.addEventListener('drop', event => {
    const file = event.dataTransfer?.files?.[0];
    if (file) parseCsv(file);
  });
}
$('#undoImportBtn')?.addEventListener('click', undoLastImport);
$('#undoImportSettingsBtn')?.addEventListener('click', undoLastImport);
$('#snapshotBtn')?.addEventListener('click', saveSnapshot);
$('#historySnapshotBtn')?.addEventListener('click', saveSnapshot);
$('#assetForm')?.addEventListener('submit', addAsset);
$('#liabilityForm')?.addEventListener('submit', addLiability);
$('#settingsForm')?.addEventListener('submit', saveFinancialSettings);
$('#exportJsonBtn')?.addEventListener('click', exportJson);
$('#restoreJsonBtn')?.addEventListener('click', () => $('#jsonFile').click());
$('#jsonFile')?.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (file) restoreJson(file);
  event.target.value = '';
});
$('#markdownBtn')?.addEventListener('click', markdown);
$('#clearBtn')?.addEventListener('click', () => {
  askConfirm('Se borrarán cartera, cierres, activos, deudas, informes y configuración local. Esta acción no se puede deshacer.', () => {
    Object.assign(state, defaultState());
    saveState();
    render();
    showNotice('Datos locales eliminados.');
  });
});
$('#positionCancelBtn')?.addEventListener('click', () => {
  editingPositionId = null;
  $('#positionDialog').open = false;
});
$('#positionSaveBtn')?.addEventListener('click', savePositionDetails);
$('#dismissUpdateBtn')?.addEventListener('click', hideUpdateNotice);
$('#updateBtn')?.addEventListener('click', () => {
  const worker = deferredWorker || newWorker;
  if (!worker) { hideUpdateNotice(); return; }
  worker.postMessage({ type: 'SKIP_WAITING' });
});
$('#confirmCancel')?.addEventListener('click', () => {
  confirmAction = null;
  $('#confirmDialog').open = false;
});
$('#confirmOk')?.addEventListener('click', () => {
  const action = confirmAction;
  confirmAction = null;
  $('#confirmDialog').open = false;
  if (action) action();
});
$$('.nav-item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
$$('[data-go]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.go)));
['#searchInput', '#sectorFilter', '#countryFilter', '#currencyFilter', '#statusFilter'].forEach(selector => {
  $(selector)?.addEventListener('input', renderPortfolio);
  $(selector)?.addEventListener('change', renderPortfolio);
});
document.addEventListener('click', event => {
  const sortButton = event.target.closest('[data-sort-table]');
  if (sortButton) { toggleTableSort(sortButton.dataset.sortTable, sortButton.dataset.sortKey); return; }
  const positionButton = event.target.closest('[data-edit-position]');
  if (positionButton) { openPositionDialog(positionButton.dataset.editPosition); return; }
  const deleteAssetButton = event.target.closest('[data-delete-asset]');
  if (deleteAssetButton) {
    const assetId = deleteAssetButton.dataset.deleteAsset;
    const asset = state.assets.find(item => item.id === assetId);
    if (!asset) return;
    askConfirm(`Eliminar el activo ${asset.name}.`, () => {
      state.assets = state.assets.filter(item => item.id !== assetId);
      saveState();
      render();
      showNotice('Activo eliminado.');
    });
    return;
  }
  const deleteLiabilityButton = event.target.closest('[data-delete-liability]');
  if (deleteLiabilityButton) {
    const liabilityId = deleteLiabilityButton.dataset.deleteLiability;
    const liability = state.liabilities.find(item => item.id === liabilityId);
    if (!liability) return;
    askConfirm(`Eliminar la deuda ${liability.name}.`, () => {
      state.liabilities = state.liabilities.filter(item => item.id !== liabilityId);
      saveState();
      render();
      showNotice('Deuda eliminada.');
    });
    return;
  }
  const deleteSnapshotButton = event.target.closest('[data-delete-snapshot]');
  if (deleteSnapshotButton) {
    const snapshotId = deleteSnapshotButton.dataset.deleteSnapshot;
    askConfirm('Eliminar este cierre mensual del histórico.', () => {
      state.history = state.history.filter(item => item.id !== snapshotId);
      saveState();
      render();
      showNotice('Cierre mensual eliminado.');
    });
  }
});
registerServiceWorker();
render();



