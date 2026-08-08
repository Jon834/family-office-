const STORAGE_KEY = 'family-office-nunez-v2';
const SCHEMA_VERSION = 6;
const ACTIVE_STATUSES = new Set(['active', 'watch']);
const ADVISORY_STATUS_LABELS = { pending: 'Pendiente', accepted: 'Aceptada', executed: 'Ejecutada', discarded: 'Descartada', postponed: 'Pospuesta', reviewing: 'En revisión', closed: 'Cerrada' };
const ADVISORY_KIND_LABELS = { fact: 'Hecho objetivo', alert: 'Alerta automática', estimate: 'Estimación', recommendation: 'Recomendación', opinion: 'Revisión humana' };
const RECOMMENDATION_PRIORITY_WEIGHTS = { 'liq-buffer': 1, 'mortgage-priority': 2, 'options-cash-check': 3, 'leverage-discipline': 4, 'top-position-freeze': 5, 'dividend-review': 6, 'international-balance': 7, 'review-pending': 8 };
const REVIEW_PHASE_LABELS = { '3m': 'Revisión 3 meses', '6m': 'Revisión 6 meses', '12m': 'Revisión 12 meses' };
const OPTION_STATUSES = ['proposal', 'open', 'closed', 'expired', 'assigned', 'exercised', 'rolled', 'cancelled'];
const OPTION_OBJECTIVES = ['buy_lower', 'income', 'protect', 'speculate_up', 'speculate_down', 'reduce_risk', 'other'];
const OPTION_STATUS_LABELS = { proposal: 'Propuesta', open: 'Abierta', closed: 'Cerrada', expired: 'Vencida sin valor', assigned: 'Asignada', exercised: 'Ejercida', rolled: 'Rolada', cancelled: 'Cancelada' };
const OWNER_IDS = ['owner-1', 'owner-2', 'owner-family'];
const DEFAULT_OWNER_NAMES = { 'owner-1': 'Yo', 'owner-2': 'Mi pareja', 'owner-family': 'Familiar conjunto' };
const ENTRY_OWNER_SELECT_IDS = ['assetOwner', 'liabilityOwner', 'accountOwner', 'projectOwner', 'anOwner'];
const ACCOUNT_TYPES = ['broker', 'bank', 'fund_platform', 'pension', 'joint_account', 'child_portfolio', 'other'];
const ACCOUNT_TYPE_LABELS = { broker: 'Bróker', bank: 'Banco', fund_platform: 'Plataforma de fondos', pension: 'Plan de pensiones', joint_account: 'Cuenta conjunta', child_portfolio: 'Cartera de hijos', other: 'Otra' };
const ACCOUNT_PURPOSES = ['long_term_income', 'options', 'liquidity', 'emergency', 'children', 'retirement', 'project', 'mixed'];
const ACCOUNT_PURPOSE_LABELS = { long_term_income: 'Renta a largo plazo', options: 'Opciones', liquidity: 'Liquidez', emergency: 'Emergencia', children: 'Hijos', retirement: 'Jubilación', project: 'Proyecto', mixed: 'Mixta' };
const UNASSIGNED_ACCOUNT_ID = 'unassigned';
const POSITION_ROLES = ['core', 'income', 'growth', 'satellite', 'hedge', 'liquidity'];
const POSITION_ROLE_LABELS = { core: 'Core', income: 'Renta', growth: 'Crecimiento', satellite: 'Satélite', hedge: 'Cobertura', liquidity: 'Liquidez' };
const PROJECT_TYPES = ['property_purchase', 'children_portfolio', 'fi', 'future_purchase', 'education', 'other'];
const PROJECT_TYPE_LABELS = { property_purchase: 'Compra de inmueble', children_portfolio: 'Cartera de hijos', fi: 'Independencia financiera', future_purchase: 'Compra futura', education: 'Educación', other: 'Otro' };
const DEFAULT_COUNTRY_WITHHOLDING = { 'España': 0.19, 'Estados Unidos': 0.15, 'Reino Unido': 0, 'Países Bajos': 0.15, 'Francia': 0.128, 'Alemania': 0.26375, 'Suiza': 0.35, 'Irlanda': 0.25, 'Bélgica': 0.30, 'Italia': 0.26, 'Canadá': 0.15, 'Japón': 0.15125 };
const REGULATORY_STATUSES = ['watching', 'confirmed', 'applied', 'discarded'];
const REGULATORY_STATUS_LABELS = { watching: 'En seguimiento', confirmed: 'Confirmado', applied: 'Aplicado', discarded: 'Descartado' };
const ANALYSIS_PROMPT_PATH = './chatgpt-analysis-prompt.md';
const DEFAULT_ANALYSIS_PROMPT = [
  '# Análisis patrimonial para ChatGPT',
  '',
  'Actúa como un analista patrimonial senior especializado en family offices, dividend growth, asignación de capital y seguimiento de independencia financiera.',
  '',
  'Devuelve un análisis accionable, comparativo y priorizado. No inventes datos si faltan.',
  '',
  'Estructura obligatoria:',
  '1. Resumen ejecutivo.',
  '2. Puntuación global 0-100.',
  '3. Semáforo de concentración por empresa, país y sector.',
  '4. Análisis de dividendos.',
  '5. Análisis de liquidez y deuda.',
  '6. Progreso hacia independencia financiera.',
  '7. Riesgos principales.',
  '8. Oportunidades principales.',
  '9. Acciones recomendadas a 30 días.',
  '10. Acciones recomendadas a 90 días.',
  '11. Errores a evitar.',
  '12. Preguntas críticas pendientes.',
  '',
  '{{PORTFOLIO_DATA}}'
].join('\n');
const DEFAULT_SETTINGS = {
  monthlyExpense: null,
  targetAnnualDividends: null,
  targetNetWorth: null,
  monthlyContribution: null,
  targetMonthlyIncome: null,
  incomeTaxRateEstimate: null,
  optionsBenchmarkRate: null
};
const DEFAULT_TABLE_SORTS = {
  topPositions: { key: 'allocation', dir: 'desc' },
  portfolio: { key: 'marketValue', dir: 'desc' },
  history: { key: 'date', dir: 'desc' },
  assets: { key: 'value', dir: 'desc' },
  liabilities: { key: 'value', dir: 'desc' },
  reports: { key: 'createdAt', dir: 'desc' },
  transactions: { key: 'datetime', dir: 'desc' }
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
      { key: 'payDate', label: 'Próximo pago', type: 'date' },
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
    { key: 'concentrationLabel', label: 'Concentración', type: 'string' }
  ]
};
SORTABLE_TABLES.transactions = {
  selector: '#transactionRows',
  columns: [
    { key: 'datetime', label: 'Fecha', type: 'date' },
    { key: 'type', label: 'Tipo', type: 'string' },
    { key: 'name', label: 'Empresa', type: 'string' },
    { key: 'quantity', label: 'Cantidad', type: 'number' },
    { key: 'price', label: 'Precio', type: 'number' },
    { key: 'amount', label: 'Importe', type: 'number' },
    { key: 'costs', label: 'Costes', type: 'number' },
    { key: 'portfolio', label: 'Cartera', type: 'string' }
  ]
};


const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, useGrouping: 'always' });
const num = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2, useGrouping: 'always' });
const pct = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' });

const state = loadState();
let pendingImport = null;
let pendingTransactionImport = null;
let confirmAction = null;
let editingPositionId = null;
let editingAccountId = null;
let editingProjectId = null;
let capitalAllocatorProposal = null;
let deferredWorker = null;
let analysisPromptCache = null;
const historyFilterState = { preset: 'all', fromYear: '', toYear: '' };
let newWorker = null;

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

function defaultAccount() {
  return {
    id: `account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    ownerId: 'owner-1',
    type: 'broker',
    currency: 'EUR',
    purpose: 'mixed',
    active: true,
    notes: '',
    quarterlyRule: { active: false, frequencyMonths: 3, minOps: 1, startDate: null, conditionText: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function defaultProject() {
  return {
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    type: 'future_purchase',
    ownership: defaultOwnership(),
    deliveryDate: null,
    mortgageExpected: null,
    contributions: [],
    obligations: [],
    notes: '',
    createdAt: new Date().toISOString(),
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

function hasStoredData(snapshot) {
  return Boolean(
    snapshot && (
      snapshot.portfolio?.length ||
      snapshot.history?.length ||
      snapshot.assets?.length ||
      snapshot.liabilities?.length ||
      snapshot.reportHistory?.length ||
      snapshot.transactions?.length ||
      snapshot.lastImport ||
      snapshot.lastTransactionsImport
    )
  );
}

function createDemoState() {
  return migrateState({
    schemaVersion: SCHEMA_VERSION,
    portfolio: [
      {
        id: 'ES0167050915', isin: 'ES0167050915', symbol: 'ACS', name: 'ACS Actividades de Construcción y Servicios SA',
        quantity: 500, averagePrice: 31.24, totalCost: 15620, currentPrice: 46.1, marketValue: 23050, gain: 7430, gainPercent: 0.4757,
        currency: 'EUR', allocation: 0.183, dividendYield: 0.022, yieldOnCost: 0.0324, annualDividend: 507.1, dividendPerShare: 1.014,
        dividendFrequency: 'semiannual', dividendCagr: 0.06, sector: 'Industriales', country: 'Espana', transactions: 6,
        exDate: '2026-07-04', payDate: '2026-08-10', taxRate: 0.19, notes: 'Posición demo.', thesis: 'Negocio internacional y caja robusta.',
        targetPrice: 50, status: 'active', unreliableMatch: false, fallbackKey: 'ACS|ACS ACTIVIDADES DE CONSTRUCCION Y SERVICIOS SA',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 1 }, raw: {}
      },
      {
        id: 'US00287Y1091', isin: 'US00287Y1091', symbol: 'ABBV', name: 'AbbVie Inc',
        quantity: 110, averagePrice: 121.4, totalCost: 13354, currentPrice: 171.3, marketValue: 18843, gain: 5489, gainPercent: 0.411,
        currency: 'USD', allocation: 0.149, dividendYield: 0.0492, yieldOnCost: 0.0694, annualDividend: 925.9, dividendPerShare: 8.417,
        dividendFrequency: 'quarterly', dividendCagr: 0.07, sector: 'Salud', country: 'Estados Unidos', transactions: 5,
        exDate: '2026-07-14', payDate: '2026-08-16', taxRate: 0.15, notes: 'Posición core de dividend growth.', thesis: 'Pipeline resiliente.',
        targetPrice: 185, status: 'active', unreliableMatch: false, fallbackKey: 'ABBV|ABBVIE INC',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 2 }, raw: {}
      },
      {
        id: 'GB0002875804', isin: 'GB0002875804', symbol: 'BATS', name: 'British American Tobacco PLC',
        quantity: 430, averagePrice: 28.2, totalCost: 12126, currentPrice: 33.7, marketValue: 14491, gain: 2365, gainPercent: 0.195,
        currency: 'GBP', allocation: 0.115, dividendYield: 0.0535, yieldOnCost: 0.0639, annualDividend: 775, dividendPerShare: 1.802,
        dividendFrequency: 'quarterly', dividendCagr: 0.02, sector: 'Consumo defensivo', country: 'Reino Unido', transactions: 4,
        exDate: '2026-07-05', payDate: '2026-08-01', taxRate: 0, notes: 'Renta alta con peso controlado.', thesis: 'Flujo de caja elevado.',
        targetPrice: 36, status: 'active', unreliableMatch: false, fallbackKey: 'BATS|BRITISH AMERICAN TOBACCO PLC',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 3 }, raw: {}
      },
      {
        id: 'US92826C8394', isin: 'US92826C8394', symbol: 'V', name: 'Visa Inc',
        quantity: 52, averagePrice: 219.5, totalCost: 11414, currentPrice: 276.8, marketValue: 14393.6, gain: 2979.6, gainPercent: 0.261,
        currency: 'USD', allocation: 0.114, dividendYield: 0.0076, yieldOnCost: 0.0096, annualDividend: 109.2, dividendPerShare: 2.1,
        dividendFrequency: 'quarterly', dividendCagr: 0.15, sector: 'Financieras', country: 'Estados Unidos', transactions: 3,
        exDate: '2026-08-08', payDate: '2026-09-03', taxRate: 0.15, notes: 'Calidad y crecimiento.', thesis: 'Red global con pricing power.',
        targetPrice: 300, status: 'active', unreliableMatch: false, fallbackKey: 'V|VISA INC',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 4 }, raw: {}
      },
      {
        id: 'NL0010273215', isin: 'NL0010273215', symbol: 'ASML', name: 'ASML Holding NV',
        quantity: 18, averagePrice: 598, totalCost: 10764, currentPrice: 742.5, marketValue: 13365, gain: 2601, gainPercent: 0.2417,
        currency: 'EUR', allocation: 0.106, dividendYield: 0.0106, yieldOnCost: 0.0131, annualDividend: 141.9, dividendPerShare: 7.88,
        dividendFrequency: 'annual', dividendCagr: 0.18, sector: 'Tecnologia', country: 'Países Bajos', transactions: 4,
        exDate: '2026-04-25', payDate: '2026-05-07', taxRate: 0.15, notes: 'Moat en litografia EUV.', thesis: 'Proveedor critico de semis.',
        targetPrice: 820, status: 'active', unreliableMatch: false, fallbackKey: 'ASML|ASML HOLDING NV',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 5 }, raw: {}
      },
      {
        id: 'ES0130960018', isin: 'ES0130960018', symbol: 'ENG', name: 'Enagas SA',
        quantity: 860, averagePrice: 15.1, totalCost: 12986, currentPrice: 12.39, marketValue: 10655.4, gain: -2330.6, gainPercent: -0.1795,
        currency: 'EUR', allocation: 0.085, dividendYield: 0.0588, yieldOnCost: 0.0482, annualDividend: 627.8, dividendPerShare: 0.73,
        dividendFrequency: 'annual', dividendCagr: -0.01, sector: 'Utilities', country: 'Espana', transactions: 8,
        exDate: '2026-06-30', payDate: '2026-07-18', taxRate: 0.19, notes: 'Renta defensiva.', thesis: 'Caja recurrente con riesgo regulatorio.',
        targetPrice: 14, status: 'watch', unreliableMatch: false, fallbackKey: 'ENG|ENAGAS SA',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 6 }, raw: {}
      }
    ],
    history: [
      { id: 'snap-2025-08', month: '2025-08', date: '2025-08-31T18:00:00.000Z', value: 80450, cost: 75800, gain: 4650, dividends: 2190, count: 5, liquidity: 6100, otherAssets: 16400, debt: 101800, netWorth: 1150, monthlyContribution: 1200, notes: '', positions: [] },
      { id: 'snap-2025-09', month: '2025-09', date: '2025-09-30T18:00:00.000Z', value: 84220, cost: 77940, gain: 6280, dividends: 2335, count: 5, liquidity: 6900, otherAssets: 16800, debt: 101100, netWorth: 6820, monthlyContribution: 1200, notes: '', positions: [] },
      { id: 'snap-2025-10', month: '2025-10', date: '2025-10-31T18:00:00.000Z', value: 87980, cost: 80540, gain: 7440, dividends: 2475, count: 5, liquidity: 7600, otherAssets: 17150, debt: 100350, netWorth: 12380, monthlyContribution: 1200, notes: '', positions: [] },
      { id: 'snap-2025-11', month: '2025-11', date: '2025-11-30T18:00:00.000Z', value: 92110, cost: 83200, gain: 8910, dividends: 2610, count: 5, liquidity: 8350, otherAssets: 17500, debt: 99650, netWorth: 18310, monthlyContribution: 1300, notes: '', positions: [] },
      { id: 'snap-2025-12', month: '2025-12', date: '2025-12-31T18:00:00.000Z', value: 96840, cost: 86110, gain: 10730, dividends: 2765, count: 6, liquidity: 9100, otherAssets: 18100, debt: 98920, netWorth: 26020, monthlyContribution: 1300, notes: '', positions: [] },
      { id: 'snap-2026-01', month: '2026-01', date: '2026-01-31T18:00:00.000Z', value: 99720, cost: 88720, gain: 11000, dividends: 2875, count: 6, liquidity: 9800, otherAssets: 18800, debt: 98150, netWorth: 30370, monthlyContribution: 1400, notes: '', positions: [] },
      { id: 'snap-2026-02', month: '2026-02', date: '2026-02-28T18:00:00.000Z', value: 102400, cost: 91350, gain: 11050, dividends: 2980, count: 6, liquidity: 9500, otherAssets: 20200, debt: 96300, netWorth: 35800, monthlyContribution: 1500, notes: '', positions: [] },
      { id: 'snap-2026-03', month: '2026-03', date: '2026-03-31T18:00:00.000Z', value: 107900, cost: 93100, gain: 14800, dividends: 3140, count: 6, liquidity: 10800, otherAssets: 20400, debt: 95600, netWorth: 43500, monthlyContribution: 1500, notes: '', positions: [] },
      { id: 'snap-2026-04', month: '2026-04', date: '2026-04-30T18:00:00.000Z', value: 112700, cost: 94950, gain: 17750, dividends: 3290, count: 6, liquidity: 12100, otherAssets: 20800, debt: 94900, netWorth: 50700, monthlyContribution: 1500, notes: '', positions: [] },
      { id: 'snap-2026-05', month: '2026-05', date: '2026-05-31T18:00:00.000Z', value: 117600, cost: 96850, gain: 20750, dividends: 3470, count: 6, liquidity: 13350, otherAssets: 21400, debt: 94150, netWorth: 58200, monthlyContribution: 1500, notes: '', positions: [] },
      { id: 'snap-2026-06', month: '2026-06', date: '2026-06-30T18:00:00.000Z', value: 121850, cost: 98580, gain: 23270, dividends: 3605, count: 6, liquidity: 14120, otherAssets: 21950, debt: 93420, netWorth: 64500, monthlyContribution: 1500, notes: '', positions: [] },
      { id: 'snap-2026-07', month: '2026-07', date: '2026-07-31T18:00:00.000Z', value: 125918, cost: 100074.4, gain: 25843.6, dividends: 3656, count: 6, liquidity: 15240, otherAssets: 22600, debt: 92800, netWorth: 70958, monthlyContribution: 1500, notes: '', positions: [] }
    ],
    options: [
      { id: 'opt-demo-1', underlying: 'AbbVie Inc', ticker: 'ABBV', isin: 'US00287Y1091', optionType: 'put', strategy: 'cash-secured-put', objective: 'acquire', openedAt: '2026-06-12', expiration: '2026-09-18', strike: 155, contracts: 1, multiplier: 100, premiumPerShare: 4.25, fees: 1.8, collateral: 15500, status: 'open', thesis: 'Entrada deseada a precio más prudente tras rally.', createdAt: '2026-06-12T10:00:00.000Z', updatedAt: '2026-07-28T18:00:00.000Z' },
      { id: 'opt-demo-2', underlying: 'ASML Holding NV', ticker: 'ASML', isin: 'NL0010273215', optionType: 'put', strategy: 'cash-secured-put', objective: 'income', openedAt: '2026-07-03', expiration: '2026-08-21', strike: 680, contracts: 1, multiplier: 100, premiumPerShare: 9.6, fees: 2.1, collateral: 68000, status: 'open', thesis: 'Prima atractiva, pero con riesgo real de tensionar liquidez si coincide con compra de vivienda.', createdAt: '2026-07-03T09:30:00.000Z', updatedAt: '2026-07-29T18:00:00.000Z' },
      { id: 'opt-demo-3', underlying: 'ACS Actividades de Construcción y Servicios SA', ticker: 'ACS', isin: 'ES0167050915', optionType: 'put', strategy: 'cash-secured-put', objective: 'acquire', openedAt: '2026-05-09', expiration: '2026-07-19', strike: 41, contracts: 1, multiplier: 100, premiumPerShare: 1.7, fees: 1.3, collateral: 4100, status: 'expired', thesis: 'Operación defensiva para mejorar precio de entrada.', createdAt: '2026-05-09T09:30:00.000Z', updatedAt: '2026-07-19T18:00:00.000Z' }
    ],
    recommendations: [
      { id: 'liq-buffer', kind: 'alert', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', action: 'Suspender compras discrecionales hasta reconstruir al menos seis meses de gasto más el colchón para la segunda residencia.', urgency: 'Alta', explanation: 'La caja útil queda por debajo del umbral prudente al descontar garantías de puts y preparación de hipoteca.', justification: 'La combinación de liquidez disponible y capital comprometido deja poco margen de maniobra.', impact: 'Alto', risk: 'Alto', reviewDate: '2026-08-31', status: 'accepted', reason: 'Se prioriza liquidez antes de asumir nueva deuda.', createdAt: '2026-07-01T08:00:00.000Z', updatedAt: '2026-07-18T08:00:00.000Z', decidedAt: '2026-07-18T08:00:00.000Z' },
      { id: 'international-balance', kind: 'recommendation', title: 'Dirigir nuevas aportaciones a países o sectores infraponderados', category: 'Asignación', action: 'Las siguientes compras deben salir del sesgo Espana/UK y reforzar calidad internacional.', urgency: 'Media', explanation: 'La cartera sigue concentrando demasiado peso en Espana y en negocios maduros de alto dividendo.', justification: 'La exposición geográfica dominante limita la resiliencia del flujo futuro.', impact: 'Medio', risk: 'Medio', reviewDate: '2026-10-15', status: 'pending', reason: '', createdAt: '2026-07-05T08:00:00.000Z', updatedAt: '2026-07-05T08:00:00.000Z', decidedAt: null },
      { id: 'options-cash-check', kind: 'alert', title: 'Revisar si todas las puts abiertas serían asumibles si se asignaran hoy', category: 'Opciones', action: 'Reducir o rolar la put más exigente en caja si compromete la comodidad patrimonial.', urgency: 'Alta', explanation: 'La put sobre ASML concentra demasiado capital comprometido frente a la liquidez disponible.', justification: 'Una asignación simultánea alteraría liquidez y concentración de forma brusca.', impact: 'Alto', risk: 'Alto', reviewDate: '2026-08-14', status: 'pending', reason: '', createdAt: '2026-07-08T08:00:00.000Z', updatedAt: '2026-07-08T08:00:00.000Z', decidedAt: null }
    ],
    decisionReviews: [
      { id: 'decision-demo-1', recommendationId: 'liq-buffer', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', phase: '3m', phaseLabel: 'Revisión 3 meses', actionLabel: 'Aceptada', status: 'pending', statusLabel: 'Pendiente', reason: 'Se prioriza caja hasta firma hipotecaria.', expectedOutcome: 'Proteger flexibilidad y evitar ventas forzadas.', actualOutcome: '', lesson: '', createdAt: '2026-07-01T08:00:00.000Z', decidedAt: '2026-07-18T08:00:00.000Z', reviewDate: '2026-10-18', reviewedAt: '' },
            { id: 'decision-demo-2', recommendationId: 'acs-freeze-q1', title: 'No ampliar ACS durante el primer trimestre', category: 'Concentración', phase: '6m', phaseLabel: 'Revisión 6 meses', actionLabel: 'Ejecutada', status: 'reviewing', statusLabel: 'En revisión', reason: 'Se evit\u00f3 seguir cargando una posición ya dominante.', expectedOutcome: 'Reducir sesgo en empresa y país.', actualOutcome: 'La concentración bajo ligeramente y se despleg\u00f3 capital en Visa y ASML.', lesson: 'La disciplina de no comprar también es una decisión rentable en riesgo.', createdAt: '2026-01-12T08:00:00.000Z', decidedAt: '2026-01-15T08:00:00.000Z', reviewDate: '2026-07-15', reviewedAt: '2026-07-30T19:00:00.000Z' },
            { id: 'decision-demo-3', recommendationId: 'eng-review-2025', title: 'Reducir el peso de Enagas y revisar tesis de dividendo', category: 'Dividendos', phase: '12m', phaseLabel: 'Revisión 12 meses', actionLabel: 'Ejecutada', status: 'closed', statusLabel: 'Cerrada', reason: 'Se detect\u00f3 deterioro regulatorio y menor calidad de crecimiento.', expectedOutcome: 'Reducir riesgo de trampa de yield.', actualOutcome: 'Se recort\u00f3 exposición y el capital se reasign\u00f3 a negocios de mayor calidad.', lesson: 'El yield alto no compensaba el menor crecimiento y la dependencia regulatoria.', createdAt: '2025-07-20T08:00:00.000Z', decidedAt: '2025-07-24T08:00:00.000Z', reviewDate: '2026-07-24', reviewedAt: '2026-07-29T18:30:00.000Z' },
            { id: 'decision-demo-4', recommendationId: 'cash-floor-2025', title: 'Mantener un suelo mínimo de liquidez durante la compra de vivienda', category: 'Liquidez', phase: '12m', phaseLabel: 'Revisión 12 meses', actionLabel: 'Ejecutada', status: 'closed', statusLabel: 'Cerrada', reason: 'La prioridad patrimonial era no comprometer la compra ni asumir ventas forzadas.', expectedOutcome: 'Llegar a la firma con margen de seguridad.', actualOutcome: 'Se mantuvo flexibilidad, pero la venta de puts agresivas recort\u00f3 parte del beneficio de la decisión.', lesson: 'La política de liquidez debe incluir también el capital comprometido en opciones, no solo la caja visible.', createdAt: '2025-08-10T08:00:00.000Z', decidedAt: '2025-08-12T08:00:00.000Z', reviewDate: '2026-08-12', reviewedAt: '2026-07-30T18:40:00.000Z' }
    ],
    advisor: { minimumLiquidityTarget: 30000, upcomingDebt: 270000, upcomingDebtMonths: 8, savingsCapacity: 1500, emergencyFundTarget: 18000 },
    backups: [],
    assets: [
      { id: 'asset-demo-1', name: 'Cuenta remunerada', type: 'cash', value: 15240, notes: 'Fondo de oportunidad', updatedAt: '2026-07-31T09:00:00.000Z' },
      { id: 'asset-demo-2', name: 'Letras del Tesoro', type: 'treasury', value: 12400, notes: 'Vencimiento a 9 meses', updatedAt: '2026-07-31T09:00:00.000Z' },
      { id: 'asset-demo-3', name: 'Plaza de garaje', type: 'property', value: 10200, notes: 'Valor neto conservador', updatedAt: '2026-07-31T09:00:00.000Z' }
    ],
    liabilities: [
      { id: 'liab-demo-1', name: 'Hipoteca vivienda', type: 'mortgage', value: 92800, notes: 'Tipo fijo 1,35%', updatedAt: '2026-07-31T09:00:00.000Z' }
    ],
    reportHistory: [
      { id: 'report-demo-1', createdAt: '2025-08-31T20:00:00.000Z', score: 58, netWorth: 1150, dividends: 2190, concentrationLabel: 'Alta', filename: 'comite-inversion-family-office-2025-08-31.md' },
      { id: 'report-demo-2', createdAt: '2025-09-30T20:00:00.000Z', score: 60, netWorth: 6820, dividends: 2335, concentrationLabel: 'Alta', filename: 'comite-inversion-family-office-2025-09-30.md' },
      { id: 'report-demo-3', createdAt: '2025-10-31T20:00:00.000Z', score: 63, netWorth: 12380, dividends: 2475, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2025-10-31.md' },
      { id: 'report-demo-4', createdAt: '2025-11-30T20:00:00.000Z', score: 65, netWorth: 18310, dividends: 2610, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2025-11-30.md' },
      { id: 'report-demo-5', createdAt: '2025-12-31T20:00:00.000Z', score: 67, netWorth: 26020, dividends: 2765, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2025-12-31.md' },
      { id: 'report-demo-6', createdAt: '2026-01-31T20:00:00.000Z', score: 68, netWorth: 30370, dividends: 2875, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-01-31.md' },
      { id: 'report-demo-7', createdAt: '2026-02-28T20:00:00.000Z', score: 70, netWorth: 35800, dividends: 2980, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-02-28.md' },
      { id: 'report-demo-8', createdAt: '2026-03-31T20:00:00.000Z', score: 72, netWorth: 43500, dividends: 3140, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-03-31.md' },
      { id: 'report-demo-9', createdAt: '2026-04-30T20:00:00.000Z', score: 73, netWorth: 50700, dividends: 3290, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-04-30.md' },
      { id: 'report-demo-10', createdAt: '2026-05-31T20:00:00.000Z', score: 74, netWorth: 58200, dividends: 3470, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-05-31.md' },
      { id: 'report-demo-11', createdAt: '2026-06-30T20:00:00.000Z', score: 75, netWorth: 64500, dividends: 3605, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-06-30.md' },
      { id: 'report-demo-12', createdAt: '2026-07-31T17:00:00.000Z', score: 77, netWorth: 70958, dividends: 3656, concentrationLabel: 'Media', filename: 'comite-inversion-family-office-2026-07-31.md' }
    ],
    settings: { monthlyExpense: 2200, targetAnnualDividends: 12000, targetNetWorth: 450000, monthlyContribution: 1500 },
    tableSorts: defaultTableSorts(),
    lastImport: '2026-07-30T17:12:00.000Z',
    lastTransactionsImport: '2026-07-31T11:19:27.000Z',
    lastBackupAt: '2026-07-30T17:00:00.000Z',
    lastImportUndo: null,
    theme: 'light'
  });
}

function withDemoState(snapshot) {
  return hasStoredData(snapshot) ? snapshot : createDemoState();
}
function loadState() {
  try {
    return withDemoState(migrateState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')));
  } catch {
    return withDemoState(defaultState());
  }
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
  next.targetMonthlyIncome = toNum(next.targetMonthlyIncome, null);
  next.incomeTaxRateEstimate = normalizePercentLike(next.incomeTaxRateEstimate, null);
  next.optionsBenchmarkRate = normalizePercentLike(next.optionsBenchmarkRate, null);
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
    ownership: migrateOwnership(asset.ownership),
    accountId: cleanText(asset.accountId) || UNASSIGNED_ACCOUNT_ID,
    expectedIncome: toNum(asset.expectedIncome, null),
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
    ownership: migrateOwnership(liability.ownership),
    accountId: cleanText(liability.accountId) || UNASSIGNED_ACCOUNT_ID,
    updatedAt: liability.updatedAt || new Date().toISOString()
  };
}

function migrateQuarterlyRule(raw) {
  const base = { active: false, frequencyMonths: 3, minOps: 1, startDate: null, conditionText: '' };
  if (!raw || typeof raw !== 'object') return base;
  return {
    active: Boolean(raw.active),
    frequencyMonths: toNum(raw.frequencyMonths, 3) || 3,
    minOps: toNum(raw.minOps, 1) || 1,
    startDate: normalizeDate(raw.startDate) || null,
    conditionText: cleanText(raw.conditionText)
  };
}

function migrateAccount(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id || defaultAccount().id,
    name: cleanText(raw.name) || 'Cuenta sin nombre',
    ownerId: OWNER_IDS.includes(raw.ownerId) ? raw.ownerId : 'owner-1',
    type: ACCOUNT_TYPES.includes(raw.type) ? raw.type : 'broker',
    currency: normalizeCurrency(raw.currency),
    purpose: ACCOUNT_PURPOSES.includes(raw.purpose) ? raw.purpose : 'mixed',
    active: raw.active !== false,
    notes: cleanText(raw.notes),
    quarterlyRule: migrateQuarterlyRule(raw.quarterlyRule),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

function migrateProjectContribution(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const amount = toNum(raw.amount, null);
  if (amount === null) return null;
  return { id: raw.id || `contribution-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, amount, date: normalizeDate(raw.date) || null, notes: cleanText(raw.notes) };
}

function migrateProjectObligation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const amount = toNum(raw.amount, null);
  if (amount === null) return null;
  return { id: raw.id || `obligation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, amount, dueDate: normalizeDate(raw.dueDate) || null, notes: cleanText(raw.notes), paid: Boolean(raw.paid) };
}

function migrateProject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id || defaultProject().id,
    name: cleanText(raw.name) || 'Proyecto sin nombre',
    type: PROJECT_TYPES.includes(raw.type) ? raw.type : 'other',
    ownership: migrateOwnership(raw.ownership),
    deliveryDate: normalizeDate(raw.deliveryDate) || null,
    mortgageExpected: toNum(raw.mortgageExpected, null),
    contributions: Array.isArray(raw.contributions) ? raw.contributions.map(migrateProjectContribution).filter(Boolean) : [],
    obligations: Array.isArray(raw.obligations) ? raw.obligations.map(migrateProjectObligation).filter(Boolean) : [],
    notes: cleanText(raw.notes),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
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
    ownership: migrateOwnership(position.ownership),
    accountId: cleanText(position.accountId) || UNASSIGNED_ACCOUNT_ID,
    role: POSITION_ROLES.includes(position.role) ? position.role : null,
    strategic: migrateStrategicTarget(position.strategic),
    createdAt,
    updatedAt,
    archivedAt: position.archivedAt || null,
    importMeta: position.importMeta && typeof position.importMeta === 'object' ? position.importMeta : null,
    raw: position.raw && typeof position.raw === 'object' ? position.raw : null
  };
}

function migrateSnapshotOwnerMetrics(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    value: toNum(raw.value, 0) || 0,
    cost: toNum(raw.cost, 0) || 0,
    gain: toNum(raw.gain, 0) || 0,
    dividends: toNum(raw.dividends, 0) || 0,
    count: Number.isFinite(raw.count) ? raw.count : 0,
    liquidity: toNum(raw.liquidity, 0) || 0,
    otherAssets: toNum(raw.otherAssets, 0) || 0,
    debt: toNum(raw.debt, 0) || 0,
    netWorth: toNum(raw.netWorth, 0) || 0
  };
}
function migrateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }
  const consolidatedFallback = migrateSnapshotOwnerMetrics(snapshot);
  const rawByOwner = snapshot.byOwner && typeof snapshot.byOwner === 'object' ? snapshot.byOwner : null;
  const byOwner = { all: migrateSnapshotOwnerMetrics(rawByOwner?.all) || consolidatedFallback };
  OWNER_IDS.forEach(id => { byOwner[id] = migrateSnapshotOwnerMetrics(rawByOwner?.[id]); });
  return {
    id: snapshot.id || `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    month: snapshot.month || String(snapshot.date || '').slice(0, 7),
    date: snapshot.date || new Date().toISOString(),
    ...byOwner.all,
    byOwner,
    monthlyContribution: toNum(snapshot.monthlyContribution, null),
    notes: cleanText(snapshot.notes),
    positions: Array.isArray(snapshot.positions) ? snapshot.positions : []
  };
}
function snapshotMetricsForOwner(snapshot, ownerId = state.viewOwnerId) {
  const key = OWNER_IDS.includes(ownerId) ? ownerId : 'all';
  return snapshot.byOwner ? snapshot.byOwner[key] : null;
}
function ownerHistory(ownerId = state.viewOwnerId) {
  return state.history
    .map(snapshot => {
      const metrics = snapshotMetricsForOwner(snapshot, ownerId);
      return metrics ? { ...snapshot, ...metrics } : null;
    })
    .filter(Boolean);
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
  const normalized = Number(text.replace(/^\(|\)$/g, '').replace(/\s/g, '').replace(/[€$£]/g, '').replace(/%/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(normalized) ? (negative ? -normalized : normalized) : null;
}

function formatInputNumber(value) {
  return value === null || value === undefined || value === '' ? '' : num.format(value);
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
function dateEs(value) { if (!value) return '-'; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.valueOf()) ? '-' : new Intl.DateTimeFormat('es-ES').format(date); }
function formatPercent(value) { return value === null || value === undefined ? '-' : pct.format(value); }
function formatCurrency(value, currency = 'EUR') { if (value === null || value === undefined) return '-'; return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2, useGrouping: 'always' }).format(value); }
function relativeDelta(current, previous) { if (!previous) return null; return (current - previous) / previous; }
function activePortfolio(list = state.portfolio) { return ownerFilteredList(list).filter(position => ACTIVE_STATUSES.has(normalizeStatus(position.status))); }
function sortedPortfolio(list = activePortfolio()) { return [...list].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)); }
function sumValues(list) { return list.reduce((sum, item) => sum + (item.value || 0), 0); }
function ownerScaleFn(ownerId) { return record => (ownerId && ownerId !== 'all') ? ownerShareOf(record, ownerId) : 1; }
function totals(list = activePortfolio(), ownerId = state.viewOwnerId) { const scale = ownerScaleFn(ownerId); const value = list.reduce((sum, position) => sum + (position.marketValue || 0) * scale(position), 0); const cost = list.reduce((sum, position) => sum + (position.totalCost || 0) * scale(position), 0); const dividends = list.reduce((sum, position) => sum + (position.annualDividend || 0) * scale(position), 0); const gain = value - cost; return { value, cost, dividends, gain, yield: value ? dividends / value : 0, yoc: cost ? dividends / cost : 0, count: list.length }; }
function assetTotals(ownerId = state.viewOwnerId) { const scale = ownerScaleFn(ownerId); const ownedAssets = ownerFilteredList(state.assets, ownerId); const ownedLiabilities = ownerFilteredList(state.liabilities, ownerId); const assets = ownedAssets.reduce((sum, asset) => sum + (asset.value || 0) * scale(asset), 0); const liabilities = ownedLiabilities.reduce((sum, liability) => sum + (liability.value || 0) * scale(liability), 0); const liquidity = ownedAssets.filter(asset => ['cash', 'money-market', 'treasury'].includes(asset.type)).reduce((sum, asset) => sum + (asset.value || 0) * scale(asset), 0); return { assets, liabilities, liquidity, otherAssets: assets - liquidity }; }
function fullMetrics(portfolio = activePortfolio()) { const portfolioTotals = totals(portfolio); const estimate = portfolioEstimateContribution(); const value = portfolioTotals.value + estimate.value; const cost = portfolioTotals.cost + estimate.cost; const dividends = portfolioTotals.dividends + estimate.dividends; const gain = value - cost; const other = assetTotals(); const netWorth = value + other.assets - other.liabilities; const dividendGoal = state.settings.targetAnnualDividends || null; const netWorthGoal = state.settings.targetNetWorth || null; return { ...portfolioTotals, value, cost, dividends, gain, yield: value ? dividends / value : 0, yoc: cost ? dividends / cost : 0, liquidity: other.liquidity, otherAssets: other.otherAssets, liabilities: other.liabilities, netWorth, estimateContribution: estimate, hasEstimate: estimate.owners.length > 0, dividendGoalProgress: dividendGoal ? dividends / dividendGoal : null, netWorthGoalProgress: netWorthGoal ? netWorth / netWorthGoal : null }; }
function fullMetricsForOwner(ownerId) {
  const previous = state.viewOwnerId;
  state.viewOwnerId = ownerId;
  const metrics = fullMetrics();
  state.viewOwnerId = previous;
  return metrics;
}
function groupByValue(list, field, totalValue) { const map = {}; list.forEach(position => { const key = position[field] || 'Sin clasificar'; map[key] = (map[key] || 0) + (position.marketValue || 0); }); return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, weight: totalValue ? value / totalValue : 0 })); }
function concentrationState(weight, green, amber) { if (weight < green) return { tone: 'good', label: 'Controlada' }; if (weight < amber) return { tone: 'warn', label: 'Vigilar' }; return { tone: 'risk', label: 'Alta' }; }
function concentrationSignals(portfolio = activePortfolio()) {
  const metrics = totals(portfolio);
  if (!metrics.value || !portfolio.length) return [];
  const topPosition = sortedPortfolio(portfolio)[0];
  const topCountry = groupByValue(portfolio, 'country', metrics.value)[0] || { name: 'Sin dato', weight: 0 };
  const topSector = groupByValue(portfolio, 'sector', metrics.value)[0] || { name: 'Sin dato', weight: 0 };
  const signals = [
    { title: 'Empresa', name: topPosition?.name || 'Sin dato', weight: topPosition ? (topPosition.marketValue || 0) / metrics.value : 0, ...concentrationState(topPosition ? (topPosition.marketValue || 0) / metrics.value : 0, 0.12, 0.2) },
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
  const label = score >= 80 ? 'Solida' : score >= 65 ? 'Buena' : score >= 50 ? 'Mejorable' : 'Debil';
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
function ensurePlanState() { state.plan = migratePlanState(state.plan); }
function planScenarioDefs() {
  return [
    { id: 'prudente', label: 'Prudente', growth: 0.02, marketReturn: 0.04, color: 'var(--chart-portfolio)' },
    { id: 'central', label: 'Central', growth: 0.04, marketReturn: 0.06, color: 'var(--chart-networth)' },
    { id: 'favorable', label: 'Favorable', growth: 0.06, marketReturn: 0.08, color: 'var(--chart-dow)' }
  ];
}
function projectPlanScenario(def, metrics, targetType, targetValue, monthlyContribution, horizonYears) {
  const annualContribution = (monthlyContribution || 0) * 12;
  const baseYield = metrics.yield || 0.035;
  let portfolioValue = metrics.value;
  let dividends = metrics.dividends;
  let years = null;
  const maxYears = Math.max(horizonYears || 0, 40);
  const progressSeries = [];
  for (let year = 1; year <= maxYears; year += 1) {
    portfolioValue = (portfolioValue + annualContribution) * (1 + def.marketReturn);
    const generatedIncome = (annualContribution * baseYield) + (portfolioValue * baseYield * 0.18);
    dividends = Math.max(dividends * (1 + def.growth), dividends + generatedIncome);
    const netWorth = metrics.netWorth + (portfolioValue - metrics.value);
    const currentValue = targetType === 'networth' ? netWorth : dividends;
    if (year <= (horizonYears || maxYears)) progressSeries.push(targetValue ? currentValue / targetValue : 0);
    if (years === null && targetValue && currentValue >= targetValue) years = year;
  }
  return { ...def, years, eta: years === null ? 'Más de 40 años' : `${new Date().getFullYear() + years}`, progressSeries };
}
const PLAN_TARGET_RESOLVERS = {
  fi: { fallback: (settings, monthlyExpense) => monthlyExpense ? monthlyExpense * 12 : null, current: metrics => metrics.dividends },
  networth: { fallback: settings => settings.targetNetWorth, current: metrics => metrics.netWorth },
  dividends: { fallback: settings => settings.targetAnnualDividends, current: metrics => metrics.dividends },
  monthlyIncome: { fallback: settings => settings.targetMonthlyIncome ? settings.targetMonthlyIncome * 12 : null, current: () => rentasSummary().netAnnual }
};
function resolvePlanFallback(targetType, monthlyExpense) {
  const resolver = PLAN_TARGET_RESOLVERS[targetType] || PLAN_TARGET_RESOLVERS.fi;
  return resolver.fallback(state.settings, monthlyExpense);
}
function resolvePlanCurrentValue(targetType, metrics) {
  const resolver = PLAN_TARGET_RESOLVERS[targetType] || PLAN_TARGET_RESOLVERS.fi;
  return resolver.current(metrics);
}
function computePlan() {
  ensurePlanState();
  const metrics = fullMetrics();
  const plan = state.plan;
  const targetType = plan.targetType;
  const fallbackTarget = resolvePlanFallback(targetType, state.settings.monthlyExpense);
  const targetValue = plan.targetValue ?? fallbackTarget;
  const monthlyContribution = plan.monthlyContribution ?? state.settings.monthlyContribution;
  const monthlyExpense = plan.monthlyExpense ?? state.settings.monthlyExpense;
  const horizonYears = plan.horizonYears || 15;
  const currentValue = resolvePlanCurrentValue(targetType, metrics);
  const gap = targetValue === null || targetValue === undefined ? null : Math.max(0, targetValue - currentValue);
  const projectionMetrics = targetType === 'monthlyIncome' ? { ...metrics, dividends: currentValue } : metrics;
  const defs = planScenarioDefs();
  const scenarios = defs.map(def => projectPlanScenario(def, projectionMetrics, targetType, targetValue, monthlyContribution, horizonYears));
  const central = scenarios.find(s => s.id === 'central');
  const levers = targetValue === null || targetValue === undefined ? [] : [
    { id: 'contribution-plus', label: '+150 EUR/mes de aportación', years: projectPlanScenario(defs[1], projectionMetrics, targetType, targetValue, (monthlyContribution || 0) + 150, horizonYears).years },
    { id: 'contribution-plus10', label: '+10% de aportación mensual', years: projectPlanScenario(defs[1], projectionMetrics, targetType, targetValue, (monthlyContribution || 0) * 1.1, horizonYears).years },
    { id: 'expense-minus10', label: '-10% de gasto mensual', years: targetType === 'fi' && monthlyExpense ? projectPlanScenario(defs[1], projectionMetrics, targetType, monthlyExpense * 0.9 * 12, monthlyContribution, horizonYears).years : central.years }
  ];
  const bestLever = levers.filter(item => item.years !== null).sort((a, b) => a.years - b.years)[0] || null;
  const feasibility = targetValue === null || targetValue === undefined ? null : central.years === null ? 'poco-realista' : central.years <= horizonYears ? 'alcanzable' : central.years <= horizonYears * 1.5 ? 'ajustado' : 'poco-realista';
  return { targetType, targetValue: targetValue ?? null, monthlyContribution, monthlyExpense, horizonYears, currentValue, gap, scenarios, central, levers, bestLever, feasibility, metrics };
}
const PLAN_TARGET_TYPES = [
  { id: 'fi', label: 'Independencia financiera' },
  { id: 'networth', label: 'Patrimonio neto' },
  { id: 'dividends', label: 'Dividendos anuales' },
  { id: 'monthlyIncome', label: 'Renta mensual neta' }
];
function planDisplayAmount(targetType, annualValue) {
  if (annualValue === null || annualValue === undefined) return annualValue;
  return targetType === 'monthlyIncome' ? annualValue / 12 : annualValue;
}
function monthlyIncomeMilestones(currentMonthlyNet) {
  return [500, 1000, 1500, 2000, 2500].map((level, index) => ({
    level,
    label: `Nivel ${index + 1} · ${level} €/mes`,
    reached: currentMonthlyNet >= level,
    pct: Math.max(0, Math.min(1, currentMonthlyNet / level))
  }));
}
function renderPlanTeaser() {
  const card = $('#planTeaserCard');
  const gapNode = $('#planTeaserGap');
  const etaNode = $('#planTeaserEta');
  const metaNode = $('#planTeaserMeta');
  if (!card || !gapNode || !etaNode || !metaNode) return;
  const plan = computePlan();
  const hasTarget = plan.targetValue !== null;
  if (!hasTarget) {
    gapNode.textContent = '--';
    etaNode.textContent = '--';
    metaNode.textContent = 'Configura una meta en Plan para ver tu previsión aquí.';
    return;
  }
  const targetLabel = PLAN_TARGET_TYPES.find(type => type.id === plan.targetType)?.label || 'tu meta';
  gapNode.textContent = plan.gap <= 0 ? 'Cubierto' : eur.format(planDisplayAmount(plan.targetType, plan.gap));
  etaNode.textContent = plan.central.years !== null ? `${plan.central.years} años (${plan.central.eta})` : 'Más de 40 años';
  metaNode.textContent = plan.gap <= 0 ? `Objetivo de ${targetLabel.toLowerCase()} ya cubierto con los datos actuales.` : `Escenario central hacia ${targetLabel.toLowerCase()}.`;
}
function computePlanForType(targetType, metrics, monthlyContribution, monthlyExpense, horizonYears) {
  const targetValue = resolvePlanFallback(targetType, monthlyExpense);
  const currentValue = resolvePlanCurrentValue(targetType, metrics);
  const gap = targetValue === null || targetValue === undefined ? null : Math.max(0, targetValue - currentValue);
  const projectionMetrics = targetType === 'monthlyIncome' ? { ...metrics, dividends: currentValue } : metrics;
  const central = projectPlanScenario(planScenarioDefs()[1], projectionMetrics, targetType, targetValue, monthlyContribution, horizonYears);
  const feasibility = targetValue === null || targetValue === undefined ? null : central.years === null ? 'poco-realista' : central.years <= horizonYears ? 'alcanzable' : central.years <= horizonYears * 1.5 ? 'ajustado' : 'poco-realista';
  return { targetType, targetValue: targetValue ?? null, gap, central, feasibility };
}
function planComparisonRows() {
  ensurePlanState();
  const metrics = fullMetrics();
  const monthlyContribution = state.plan.monthlyContribution ?? state.settings.monthlyContribution;
  const monthlyExpense = state.plan.monthlyExpense ?? state.settings.monthlyExpense;
  const horizonYears = state.plan.horizonYears || 15;
  return PLAN_TARGET_TYPES.map(type => ({ ...type, ...computePlanForType(type.id, metrics, monthlyContribution, monthlyExpense, horizonYears) }));
}
function renderPlan() {
  const narrativeNode = $('#planNarrative');
  if (!narrativeNode) return;
  ensurePlanState();
  const typeSelect = $('#planTargetType');
  if (typeSelect) typeSelect.value = state.plan.targetType;
  const valueInput = $('#planTargetValue');
  if (valueInput) {
    valueInput.value = formatInputNumber(planDisplayAmount(state.plan.targetType, state.plan.targetValue));
    const monthlyExpenseForFallback = state.plan.monthlyExpense ?? state.settings.monthlyExpense;
    const fallbackByType = {
      fi: monthlyExpenseForFallback ? monthlyExpenseForFallback * 12 : null,
      networth: state.settings.targetNetWorth,
      dividends: state.settings.targetAnnualDividends,
      monthlyIncome: state.settings.targetMonthlyIncome ? state.settings.targetMonthlyIncome * 12 : null
    };
    const fallback = fallbackByType[state.plan.targetType];
    const labelByType = { fi: 'Valor objetivo — gasto anual a cubrir (EUR/año)', networth: 'Valor objetivo — patrimonio neto (EUR totales)', dividends: 'Valor objetivo — dividendos anuales (EUR/año)', monthlyIncome: 'Valor objetivo — renta neta mensual (EUR/mes)' };
    const hintByType = {
      fi: fallback !== null ? `Vacío = automático: ${eur.format(fallback)} (12 × tu gasto mensual).` : 'Gasto anual a cubrir con dividendos. Configura tu gasto mensual para calcularlo automáticamente.',
      networth: fallback !== null ? `Vacío = usa tu objetivo guardado en Datos: ${eur.format(fallback)}.` : 'Patrimonio neto total a alcanzar (EUR totales, no mensual).',
      dividends: fallback !== null ? `Vacío = usa tu objetivo guardado en Datos: ${eur.format(fallback)}.` : 'Dividendos brutos anuales objetivo (EUR/año).',
      monthlyIncome: fallback !== null ? `Vacío = usa tu objetivo guardado en Datos: ${eur.format(fallback / 12)}/mes.` : 'Renta neta mensual objetivo, sumando dividendos, opciones, intereses y alquiler.'
    };
    valueInput.setAttribute('label', labelByType[state.plan.targetType] || labelByType.fi);
    valueInput.setAttribute('hint', hintByType[state.plan.targetType] || hintByType.fi);
    valueInput.setAttribute('placeholder', fallback !== null ? `Automático: ${eur.format(planDisplayAmount(state.plan.targetType, fallback))}` : 'Sin automático disponible');
  }
  const contributionInput = $('#planMonthlyContribution');
  if (contributionInput) { contributionInput.value = formatInputNumber(state.plan.monthlyContribution); contributionInput.setAttribute('hint', 'Lo que aportas cada mes a la cartera (EUR/mes). Vacío = tu aportación configurada en Datos.'); }
  const expenseInput = $('#planMonthlyExpense');
  if (expenseInput) { expenseInput.value = formatInputNumber(state.plan.monthlyExpense); expenseInput.setAttribute('hint', 'Gasto familiar mensual (EUR/mes), usado para el objetivo de independencia financiera.'); }
  const horizonInput = $('#planHorizonYears');
  if (horizonInput) { horizonInput.value = state.plan.horizonYears ?? ''; horizonInput.setAttribute('hint', 'Plazo máximo en años que consideras razonable para lograr la meta.'); }
  const plan = computePlan();
  const comparisonNode = $('#planComparisonRows');
  if (comparisonNode) {
    const comparison = planComparisonRows();
    const feasibilityLabelsShort = { alcanzable: 'Alcanzable', ajustado: 'Ajustado', 'poco-realista': 'Poco realista' };
    comparisonNode.className = 'scenario-list';
    comparisonNode.innerHTML = comparison.map(item => `<div class="scenario-card${item.targetType === plan.targetType ? ' active' : ''}"><strong>${escapeHtml(item.label)}</strong><span>${item.targetValue === null ? 'Sin objetivo configurado' : eur.format(planDisplayAmount(item.targetType, item.targetValue))}</span><small>${item.targetValue === null ? 'Configuralo en Datos u objetivo especifico.' : `Brecha: ${eur.format(planDisplayAmount(item.targetType, item.gap))}`}</small><small>${item.central.years === null ? 'Más de 40 años' : `${item.central.years} años (${item.central.eta})`} | ${item.feasibility ? feasibilityLabelsShort[item.feasibility] : 'Sin datos'}</small></div>`).join('');
  }
  const targetLabel = plan.targetType === 'networth' ? 'patrimonio neto' : plan.targetType === 'dividends' ? 'dividendos anuales' : plan.targetType === 'monthlyIncome' ? 'renta mensual neta' : 'independencia financiera (dividendos vs. gasto)';
  const hasTarget = plan.targetValue !== null;
  $('#planGapValue').textContent = hasTarget ? eur.format(planDisplayAmount(plan.targetType, plan.gap)) : '0 EUR';
  $('#planGapMeta').textContent = hasTarget ? `Objetivo de ${targetLabel}: ${eur.format(planDisplayAmount(plan.targetType, plan.targetValue))}.` : 'Configura una meta para estimar la distancia.';
  const milestoneCard = $('#planMilestoneCard');
  if (milestoneCard) {
    milestoneCard.hidden = plan.targetType !== 'monthlyIncome';
    if (plan.targetType === 'monthlyIncome') {
      const currentMonthly = planDisplayAmount('monthlyIncome', plan.currentValue);
      const milestones = monthlyIncomeMilestones(currentMonthly);
      $('#planMilestoneRows').className = 'milestone-list';
      $('#planMilestoneRows').innerHTML = milestones.map(m => `<div class="milestone-row${m.reached ? ' reached' : ''}"><strong>${m.reached ? '✅' : ''} ${escapeHtml(m.label)}</strong><span class="progress-bar"><span class="progress-bar-fill" style="width:${Math.round(m.pct * 100)}%"></span></span><small>${formatPercent(m.pct)}</small></div>`).join('');
    }
  }
  $('#planCentralEta').textContent = hasTarget && plan.central.years !== null ? plan.central.eta : '--';
  $('#planCentralMeta').textContent = hasTarget && plan.central.years !== null ? `${plan.central.years} años con el escenario central.` : 'Sin proyección.';
  $('#planBestLeverValue').textContent = plan.bestLever ? plan.bestLever.label : '--';
  $('#planBestLeverMeta').textContent = plan.bestLever ? `Reduce el plazo a ${plan.bestLever.years} años.` : 'Sin comparativa.';
  const feasibilityLabels = { alcanzable: 'Alcanzable', ajustado: 'Ajustado', 'poco-realista': 'Poco realista' };
  $('#planFeasibilityValue').textContent = plan.feasibility ? feasibilityLabels[plan.feasibility] : '--';
  $('#planFeasibilityMeta').textContent = hasTarget ? `Horizonte configurado: ${plan.horizonYears} años.` : 'Importa datos y define objetivos.';
  const scenarioRows = $('#planScenarioRows');
  scenarioRows.className = hasTarget ? 'scenario-list' : 'scenario-list empty-state';
  scenarioRows.innerHTML = hasTarget ? plan.scenarios.map(s => `<div class="scenario-card"><strong>${s.label}</strong><span>${s.years === null ? 'Más de 40 años' : `${s.years} años`}</span><small>Meta estimada: ${s.eta}</small></div>`).join('') : 'Sin datos';
  const leverRows = $('#planLeverRows');
  leverRows.className = plan.levers.length ? 'signal-list' : 'signal-list empty-state';
  leverRows.innerHTML = plan.levers.length ? plan.levers.map(lever => `<div class="signal-row signal-${lever.years !== null && plan.central.years !== null && lever.years < plan.central.years ? 'good' : 'warn'}"><strong>${escapeHtml(lever.label)}</strong><span>${lever.years === null ? 'Sin impacto estimable' : `${lever.years} años`}</span></div>`).join('') : 'Sin datos';
  const chart = $('#planProjectionChart');
  if (!hasTarget || !plan.scenarios[0].progressSeries.length) {
    chart.className = 'history-chart empty-state';
    chart.textContent = 'Sin datos';
  } else {
    chart.className = 'history-chart';
    const labels = plan.scenarios[0].progressSeries.map((item, index) => `Año ${index + 1}`);
    chart.innerHTML = buildLineChart(plan.scenarios.map(s => ({ label: s.label, color: s.color, values: s.progressSeries.map(value => Math.round(value * 100)) })), labels, { ariaLabel: 'Progreso proyectado hacia la meta' });
  }
  const narrative = [];
  if (!hasTarget) narrative.push('Configura un objetivo y una meta en EUR para ver la simulación completa.');
  else {
    narrative.push(plan.gap <= 0 ? 'El objetivo ya está cubierto con los datos actuales.' : `Faltan ${eur.format(planDisplayAmount(plan.targetType, plan.gap))} para alcanzar el objetivo de ${targetLabel}.`);
    narrative.push(plan.central.years === null ? 'En el escenario central no se alcanza la meta dentro de 40 años con los supuestos actuales.' : `En el escenario central se alcanzaría en ${plan.central.years} años (${plan.central.eta}).`);
    if (plan.bestLever && plan.central.years !== null && plan.bestLever.years < plan.central.years) narrative.push(`La palanca con mayor impacto es "${plan.bestLever.label}", que adelantaría la meta a ${plan.bestLever.years} años.`);
  }
  narrativeNode.className = 'summary-stack';
  narrativeNode.innerHTML = narrative.map(line => `<small>${escapeHtml(line)}</small>`).join('');
  const assumptionsNode = $('#planAssumptions');
  const assumptions = [
    { title: 'Aportación mensual', detail: eur.format(plan.monthlyContribution || 0) },
    { title: 'Yield de partida', detail: formatPercent(plan.metrics.yield) },
    { title: 'Crecimiento de dividendo', detail: 'Prudente 2% | Central 4% | Favorable 6% anual' },
    { title: 'Revalorización de mercado', detail: 'Prudente 4% | Central 6% | Favorable 8% anual' }
  ];
  assumptionsNode.className = 'signal-list';
  assumptionsNode.innerHTML = assumptions.map(item => `<div class="signal-row signal-good"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join('');
  renderMacroScenario();
}
const MACRO_SCENARIOS = [
  { id: 'base', label: 'Escenario base', equityDropPct: 0, dividendCutPct: 0, recoveryYears: 0 },
  { id: 'crisis-ia', label: 'Crisis IA', equityDropPct: 0.30, dividendCutPct: 0.08, recoveryYears: 3 },
  { id: 'estanflacion', label: 'Estanflación', equityDropPct: 0.10, dividendCutPct: 0.05, recoveryYears: 5 },
  { id: 'crisis-global', label: 'Crisis global', equityDropPct: 0.40, dividendCutPct: 0.20, recoveryYears: 4 }
];
function applyMacroScenario(scenarioId) {
  const scenario = MACRO_SCENARIOS.find(s => s.id === scenarioId) || MACRO_SCENARIOS[0];
  const metrics = fullMetrics();
  const stressedValue = metrics.value * (1 - scenario.equityDropPct);
  const stressedNetWorth = metrics.netWorth - (metrics.value - stressedValue);
  const stressedMonthlyIncome = rentasSummary().monthlyNet * (1 - scenario.dividendCutPct);
  ensurePlanState();
  const plan = state.plan;
  const targetType = plan.targetType;
  const stressedDividends = metrics.dividends * (1 - scenario.dividendCutPct);
  const projectionMetrics = { ...metrics, value: stressedValue, netWorth: stressedNetWorth, dividends: targetType === 'monthlyIncome' ? stressedMonthlyIncome * 12 : stressedDividends };
  const monthlyContribution = plan.monthlyContribution ?? state.settings.monthlyContribution;
  const horizonYears = plan.horizonYears || 15;
  const targetValue = plan.targetValue ?? resolvePlanFallback(targetType, plan.monthlyExpense ?? state.settings.monthlyExpense);
  const central = targetValue ? projectPlanScenario(planScenarioDefs()[1], projectionMetrics, targetType, targetValue, monthlyContribution, horizonYears) : null;
  return { scenario, netWorth: stressedNetWorth, monthlyIncome: stressedMonthlyIncome, fiEta: central && central.years !== null ? `${central.years} años (${central.eta})` : 'Sin proyección', maxDrop: scenario.equityDropPct };
}
function renderMacroScenario() {
  const select = $('#macroScenarioSelect');
  if (!select) return;
  const result = applyMacroScenario(select.value);
  $('#macroNetWorth').textContent = eur.format(result.netWorth);
  $('#macroMonthlyIncome').textContent = eur.format(result.monthlyIncome);
  $('#macroFiDate').textContent = result.fiEta;
  $('#macroMaxDrop').textContent = result.maxDrop ? `-${Math.round(result.maxDrop * 100)} %` : '0 %';
  const assumptionsNode = $('#macroAssumptions');
  assumptionsNode.className = 'signal-list';
  assumptionsNode.innerHTML = `<div class="signal-row"><strong>Caída de renta variable</strong><span>-${Math.round(result.scenario.equityDropPct * 100)} %</span></div><div class="signal-row"><strong>Recorte de renta (dividendos/opciones)</strong><span>-${Math.round(result.scenario.dividendCutPct * 100)} %</span></div><div class="signal-row"><strong>Años estimados de recuperación</strong><span>${result.scenario.recoveryYears}</span></div>`;
}
function reportHistoryRows() { return [...state.reportHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
function saveReportHistoryEntry(entry) { state.reportHistory = [entry, ...state.reportHistory].slice(0, 24); }
function applyTheme() { document.body.classList.toggle('dark', state.theme === 'dark'); $('#themeBtn wa-icon')?.setAttribute('name', state.theme === 'dark' ? 'sun' : 'moon'); }
function ownerPillHtml(record) {
  const ownership = record?.ownership || defaultOwnership();
  if (ownership.length === 1 && ownership[0].pct >= 0.999) {
    const id = ownership[0].ownerId;
    return `<span class="owner-pill owner-pill-${id}">${escapeHtml(ownerName(id))}</span>`;
  }
  return `<span class="owner-tag">${escapeHtml(ownerLabel(record))}</span>`;
}
function applyOwnerAccentClass(select, ownerId) {
  if (!select) return;
  select.classList.remove('owner-accent-owner-1', 'owner-accent-owner-2', 'owner-accent-owner-family');
  if (OWNER_IDS.includes(ownerId)) select.classList.add(`owner-accent-${ownerId}`);
}
function applyOwnerView() {
  const select = $('#ownerViewSelect');
  if (!select) return;
  const labels = { all: 'Consolidado', 'owner-1': ownerName('owner-1'), 'owner-2': ownerName('owner-2'), 'owner-family': ownerName('owner-family') };
  $$('#ownerViewSelect wa-option').forEach(option => { const key = option.value; if (labels[key]) option.textContent = labels[key]; });
  select.value = state.viewOwnerId || 'all';
  applyOwnerAccentClass(select, state.viewOwnerId);
}
function renderBars(selector, data) { const element = $(selector); if (!data.length) { element.className = 'bar-chart empty-state'; element.textContent = 'Sin datos'; return; } const max = data[0].value || 1; element.className = 'bar-chart'; element.innerHTML = data.map(item => `<div class="bar-row"><span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (item.value / max) * 100)}%"></div></div><span class="bar-value">${pct.format(item.weight)}</span></div>`).join(''); }
function portfolioFilters() { return { query: ($('#searchInput')?.value || '').toLowerCase(), sector: $('#sectorFilter')?.value || '', country: $('#countryFilter')?.value || '', currency: $('#currencyFilter')?.value || '', status: $('#statusFilter')?.value || 'active' }; }
function filteredPortfolio() { const { query, sector, country, currency, status } = portfolioFilters(); const rows = ownerFilteredList(state.portfolio).filter(position => { const haystack = `${position.name} ${position.symbol} ${position.isin}`.toLowerCase(); const positionStatus = normalizeStatus(position.status); const statusOk = status === 'all' ? true : positionStatus === status; return (!query || haystack.includes(query)) && (!sector || position.sector === sector) && (!country || position.country === country) && (!currency || position.currency === currency) && statusOk; }); return sortRows(rows, 'portfolio'); }
function renderPortfolio() { const list = filteredPortfolio(); $('#portfolioRows').innerHTML = list.length ? list.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} | ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td data-label="Cantidad">${position.quantity === null ? '-' : num.format(position.quantity)}</td><td data-label="Precio medio">${formatCurrency(position.averagePrice, position.currency)}</td><td data-label="Precio">${formatCurrency(position.currentPrice, position.currency)}</td><td data-label="Valor">${formatCurrency(position.marketValue, position.currency)}</td><td data-label="Ganancia" class="${(position.gain || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(position.gain, position.currency)}<br><small>${formatPercent(position.gainPercent)}</small></td><td data-label="Peso">${formatPercent(position.allocation)}</td><td data-label="Div. anual">${formatCurrency(position.annualDividend, position.currency)}</td><td data-label="Yield">${formatPercent(position.dividendYield)}</td><td data-label="YOC">${formatPercent(position.yieldOnCost)}</td><td data-label="Próximo pago">${dateEs(position.payDate)}</td><td class="row-actions"><wa-button size="small" appearance="plain" data-edit-position="${position.id}"><wa-icon name="pen-to-square"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="12" class="empty-cell">No hay resultados.</td></tr>'; renderCurrencyExposure(); }
function renderCurrencyExposure() {
  const node = $('#currencyExposureChart');
  if (!node) return;
  const portfolio = activePortfolio();
  const metrics = totals(portfolio);
  renderBars('#currencyExposureChart', groupByValue(portfolio, 'currency', metrics.value));
}
function renderFilters() { [['#sectorFilter', 'sector', 'Todos'], ['#countryFilter', 'country', 'Todos'], ['#currencyFilter', 'currency', 'Todas']].forEach(([selector, field, label]) => { const element = $(selector); if (!element) return; const current = element.value || ''; const values = [...new Set(state.portfolio.map(position => position[field]).filter(Boolean))].sort(); element.innerHTML = `<wa-option value="">${label}</wa-option>` + values.map(value => `<wa-option value="${escapeHtml(value)}">${escapeHtml(value)}</wa-option>`).join(''); element.value = values.includes(current) ? current : ''; }); }
const BENCHMARK_STEPS = {
  ibex: [0.024, 0.011, -0.016, 0.019, 0.013, 0.01, 0.022, 0.018, 0.015, 0.014, 0.011],
  dow: [0.018, 0.009, 0.012, 0.01, 0.016, -0.005, 0.021, 0.017, 0.013, 0.012, 0.014],
  euronext: [0.02, 0.008, -0.004, 0.014, 0.012, 0.009, 0.016, 0.015, 0.012, 0.011, 0.01]
};
const MACRO_REFERENCE = {
  inflation: [3.4, 3.3, 3.1, 3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2],
  rate: [4.0, 4.0, 3.9, 3.8, 3.7, 3.5, 3.4, 3.3, 3.15, 3.0, 2.9, 2.75]
};
function formatMonthTick(value) { return new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(new Date(value)); }
function referenceWindow(values, length) {
  if (!length) return [];
  if (values.length >= length) return values.slice(values.length - length);
  const result = [...values];
  while (result.length < length) result.unshift(result[0]);
  return result;
}
function buildReferenceIndex(length, steps) {
  if (!length) return [];
  const values = [100];
  for (let index = 1; index < length; index += 1) values.push(Number((values[index - 1] * (1 + steps[(index - 1) % steps.length])).toFixed(2)));
  return values;
}
function normalizeHistorySeries(history, field) {
  const base = history[0]?.[field] || 1;
  return history.map(snapshot => Number((((snapshot[field] || 0) / base) * 100).toFixed(2)));
}
function polylinePoints(values, min, max, width, height, padding) {
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = padding + ((width - padding * 2) * (values.length === 1 ? 0.5 : index / (values.length - 1)));
    const y = height - padding - (((value - min) / range) * (height - padding * 2));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
function areaPoints(values, min, max, width, height, padding) {
  const line = polylinePoints(values, min, max, width, height, padding);
  if (!line) return '';
  const firstX = padding + ((width - padding * 2) * (values.length === 1 ? 0.5 : 0));
  const lastX = padding + ((width - padding * 2) * (values.length === 1 ? 0.5 : 1));
  const baseline = height - padding;
  return `${firstX},${baseline} ${line} ${lastX},${baseline}`;
}
function pointNodes(values, min, max, width, height, padding, color) {
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = padding + ((width - padding * 2) * (values.length === 1 ? 0.5 : index / (values.length - 1)));
    const y = height - padding - (((value - min) / range) * (height - padding * 2));
    return `<circle class="chart-point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${color}"></circle>`;
  }).join('');
}
function buildLineChart(series, labels, options = {}) {
  if (!series.length || !labels.length) return '<div class="empty-state">Sin datos</div>';
  const width = 640;
  const height = 240;
  const padding = 18;
  const mergedValues = series.flatMap(item => item.values);
  if (!mergedValues.length) return '<div class="empty-state">Sin datos</div>';
  const min = Math.min(...mergedValues);
  const max = Math.max(...mergedValues);
  const yMarks = [0, 1, 2].map(step => min + (((max - min) || 1) * step / 2));
  const axis = labels.map(label => `<span>${escapeHtml(label)}</span>`).join('');
  const legend = series.map(item => `<span><i class="legend-dot" style="background:${item.color}"></i>${escapeHtml(item.label)}</span>`).join('');
  const lines = series.map((item, index) => {
    const area = index === 0 ? `<polygon class="chart-area" points="${areaPoints(item.values, min, max, width, height, padding)}"></polygon>` : '';
    return `${area}<polyline class="chart-line${item.dashed ? ' secondary' : ''}" stroke="${item.color}" points="${polylinePoints(item.values, min, max, width, height, padding)}"></polyline>${pointNodes(item.values, min, max, width, height, padding, item.color)}`;
  }).join('');
  const gridLines = yMarks.map(value => {
    const y = height - padding - ((((value - min) / ((max - min) || 1))) * (height - padding * 2));
    return `<line class="chart-grid-line" x1="${padding}" y1="${y.toFixed(1)}" x2="${width - padding}" y2="${y.toFixed(1)}"></line>`;
  }).join('');
  return `<div class="chart-shell"><div class="chart-stage"><svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(options.ariaLabel || 'Gráfico histórico')}"><defs><linearGradient id="historyAreaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="${series[0].color}"></stop><stop offset="100%" stop-color="${series[0].color}" stop-opacity="0"></stop></linearGradient></defs>${gridLines}${lines}</svg></div><div class="chart-legend">${legend}</div><div class="chart-axis">${axis}</div></div>`;
}
function buildBenchmarkModel(history) {
  const labels = history.map(snapshot => formatMonthTick(snapshot.date));
  const portfolioSeries = normalizeHistorySeries(history, 'value');
  const inflationInput = referenceWindow(MACRO_REFERENCE.inflation, history.length);
  const inflationLevels = inflationInput.reduce((acc, value, index) => {
    if (!index) return [100];
    const previous = acc[index - 1];
    acc.push(Number((previous * (1 + (value / 100 / 12))).toFixed(2)));
    return acc;
  }, []);
  return {
    labels,
    series: [
      { label: 'Cartera', color: 'var(--chart-portfolio)', values: portfolioSeries },
      { label: 'IBEX 35', color: 'var(--chart-ibex)', values: buildReferenceIndex(history.length, BENCHMARK_STEPS.ibex) },
      { label: 'Dow Jones', color: 'var(--chart-dow)', values: buildReferenceIndex(history.length, BENCHMARK_STEPS.dow) },
      { label: 'Euronext 100', color: 'var(--chart-euronext)', values: buildReferenceIndex(history.length, BENCHMARK_STEPS.euronext) },
      { label: 'IPC acumulado', color: 'var(--chart-inflation)', values: inflationLevels, dashed: true }
    ]
  };
}
function detectMacroCycle(inflation, rate, spread) {
  if (rate >= inflation + 0.7 && spread > 0) return { title: 'Desinflación favorable', detail: 'La inflación cae mientras los tipos siguen por encima: el ciclo sigue restrictivo, pero la cartera está absorbiéndolo bien.' };
  if (rate >= inflation + 0.7) return { title: 'Política aún restrictiva', detail: 'Los tipos siguen por encima del IPC. Conviene vigilar deuda, liquidez y calidad de beneficios.' };
  if (inflation > 3) return { title: 'Inflación persistente', detail: 'El IPC sigue alto. Las rentas reales y los margenes merecen seguimiento.' };
  return { title: 'Normalización monetaria', detail: 'IPC y tipos se moderan. El foco pasa a crecimiento real, valoraciones y disciplina de aportaciones.' };
}
function buildMacroCards(history, benchmark) {
  const inflation = referenceWindow(MACRO_REFERENCE.inflation, history.length);
  const rates = referenceWindow(MACRO_REFERENCE.rate, history.length);
  const latestInflation = inflation.at(-1) || 0;
  const latestRate = rates.at(-1) || 0;
  const portfolioBase = benchmark.series[0].values.at(-1) || 100;
  const ibexBase = benchmark.series[1].values.at(-1) || 100;
  const dowBase = benchmark.series[2].values.at(-1) || 100;
  const euronextBase = benchmark.series[3].values.at(-1) || 100;
  const inflationBase = benchmark.series[4].values.at(-1) || 100;
  const cycle = detectMacroCycle(latestInflation, latestRate, portfolioBase - ibexBase);
  return {
    summary: `<strong>${escapeHtml(cycle.title)}</strong><small>${escapeHtml(cycle.detail)}</small>`,
    chips: [
      { title: 'IPC interanual', value: `${num.format(latestInflation)} %`, note: 'Trayectoria desinflacionista en la serie demo.' },
      { title: 'Precio del dinero', value: `${num.format(latestRate)} %`, note: 'Tipo de referencia usado para lectura de ciclo.' },
      { title: 'Cartera vs IBEX', value: `${num.format(portfolioBase - ibexBase)} pts`, note: `Base 100: cartera ${num.format(portfolioBase)} vs IBEX ${num.format(ibexBase)}.` },
      { title: 'Cartera vs IPC', value: `${num.format(portfolioBase - inflationBase)} pts`, note: `Rendimiento real orientativo frente a una base IPC ${num.format(inflationBase)}.`, emphasis: true },
      { title: 'Cartera vs Dow', value: `${num.format(portfolioBase - dowBase)} pts`, note: `Comparativa con Dow Jones en base 100 (${num.format(dowBase)}).` },
      { title: 'Cartera vs Euronext', value: `${num.format(portfolioBase - euronextBase)} pts`, note: `Comparativa con Euronext 100 en base 100 (${num.format(euronextBase)}).` }
    ]
  };
}
function historyYearOptions() {
  const years = [...new Set(ownerHistory().map(snapshot => new Date(snapshot.date).getFullYear()).filter(Number.isFinite))].sort((a, b) => a - b);
  return years;
}
function renderHistoryFilterOptions() {
  const years = historyYearOptions();
  [['#historyFromYear', historyFilterState.fromYear], ['#historyToYear', historyFilterState.toYear]].forEach(([selector, current]) => {
    const element = $(selector);
    if (!element) return;
    element.innerHTML = `<wa-option value="">Sin límite</wa-option>` + years.map(year => `<wa-option value="${year}">${year}</wa-option>`).join('');
    element.value = years.map(String).includes(String(current)) ? String(current) : '';
  });
  if ($('#historyRangePreset')) $('#historyRangePreset').value = historyFilterState.preset || 'all';
}
function applyHistoryFilters(history) {
  const chronological = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!chronological.length) return [];
  let filtered = [...chronological];
  const preset = historyFilterState.preset || 'all';
  if (preset === 'ytd') {
    const latestYear = new Date(chronological.at(-1).date).getFullYear();
    filtered = filtered.filter(snapshot => new Date(snapshot.date).getFullYear() === latestYear);
  } else if (/^\d+m$/.test(preset)) {
    const months = Number.parseInt(preset, 10);
    const latestDate = new Date(chronological.at(-1).date);
    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - (months - 1));
    startDate.setDate(1);
    filtered = filtered.filter(snapshot => new Date(snapshot.date) >= startDate);
  }
  const fromYear = Number.parseInt(historyFilterState.fromYear, 10);
  const toYear = Number.parseInt(historyFilterState.toYear, 10);
  if (Number.isFinite(fromYear)) filtered = filtered.filter(snapshot => new Date(snapshot.date).getFullYear() >= fromYear);
  if (Number.isFinite(toYear)) filtered = filtered.filter(snapshot => new Date(snapshot.date).getFullYear() <= toYear);
  return filtered;
}
function renderHistory() {
  const ownerId = state.viewOwnerId || 'all';
  const history = ownerHistory(ownerId);
  const noBreakdownYet = ownerId !== 'all' && !history.length && state.history.length > 0;
  const rows = sortRows(history, 'history');
  $('#historyRows').innerHTML = rows.length ? rows.map(snapshot => `<tr><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(snapshot.date))}</td><td>${eur.format(snapshot.value)}</td><td>${eur.format(snapshot.netWorth || 0)}</td><td>${eur.format(snapshot.liquidity || 0)}</td><td>${eur.format(snapshot.debt || 0)}</td><td>${eur.format(snapshot.dividends)}</td><td>${snapshot.count}</td><td><wa-button size="small" appearance="plain" data-delete-snapshot="${snapshot.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : `<tr><td colspan="8" class="empty-cell">${noBreakdownYet ? 'Los cierres guardados no tienen desglose para este propietario todavía. Se registrará en el próximo cierre mensual.' : 'No hay cierres guardados.'}</td></tr>`;
  renderHistoryFilterOptions();
  const chronological = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const filteredChronological = applyHistoryFilters(chronological);
  const chart = $('#historyChart');
  const benchmarkChart = $('#benchmarkChart');
  const macroSummary = $('#macroSummary');
  const macroChips = $('#macroChips');
  if (!chronological.length) {
    chart.className = 'history-chart empty-state';
    chart.textContent = noBreakdownYet ? 'Los cierres guardados no tienen desglose para este propietario todavía.' : 'Sin cierres mensuales';
    if (benchmarkChart) {
      benchmarkChart.className = 'history-chart empty-state';
      benchmarkChart.textContent = 'Sin datos comparables';
    }
    if (macroSummary) {
      macroSummary.className = 'summary-stack history-summary empty-state';
      macroSummary.textContent = 'Sin datos macro';
    }
    if (macroChips) {
      macroChips.className = 'macro-grid empty-state';
      macroChips.textContent = 'Sin datos';
    }
    return;
  }
  if (!filteredChronological.length) {
    chart.className = 'history-chart empty-state';
    chart.textContent = 'No hay cierres dentro del filtro seleccionado';
    if (benchmarkChart) {
      benchmarkChart.className = 'history-chart empty-state';
      benchmarkChart.textContent = 'No hay datos comparables en este rango';
    }
    if (macroSummary) {
      macroSummary.className = 'summary-stack history-summary empty-state';
      macroSummary.textContent = 'Sin datos macro en este rango';
    }
    if (macroChips) {
      macroChips.className = 'macro-grid empty-state';
      macroChips.textContent = 'Sin datos';
    }
    return;
  }
  const trendLabels = filteredChronological.map(snapshot => formatMonthTick(snapshot.date));
  chart.className = 'history-chart';
  chart.innerHTML = buildLineChart([
    { label: 'Cartera', color: 'var(--chart-portfolio)', values: filteredChronological.map(snapshot => snapshot.value || 0) },
    { label: 'Patrimonio neto', color: 'var(--chart-networth)', values: filteredChronological.map(snapshot => snapshot.netWorth || 0), dashed: true }
  ], trendLabels, { ariaLabel: 'Evolución patrimonial' });
  const benchmark = buildBenchmarkModel(filteredChronological);
  if (benchmarkChart) {
    benchmarkChart.className = 'history-chart';
    benchmarkChart.innerHTML = buildLineChart(benchmark.series, benchmark.labels, { ariaLabel: 'Benchmark de cartera en base 100' });
  }
  if (macroSummary && macroChips) {
    const macro = buildMacroCards(filteredChronological, benchmark);
    macroSummary.className = 'summary-stack history-summary';
    macroSummary.innerHTML = macro.summary;
    macroChips.className = 'macro-grid';
    macroChips.innerHTML = macro.chips.map(chip => `<article class="macro-chip${chip.emphasis ? ' emphasis' : ''}"><strong>${escapeHtml(chip.title)}</strong><span>${escapeHtml(chip.value)}</span><small>${escapeHtml(chip.note)}</small></article>`).join('');
  }
}
function renderAssets() { const rows = sortRows(visibleAssets(), 'assets'); $('#assetRows').innerHTML = rows.length ? rows.map(asset => `<tr><td>${escapeHtml(asset.name)}<br>${ownerPillHtml(asset)}</td><td>${escapeHtml(asset.type)}</td><td>${eur.format(asset.value || 0)}</td><td>${escapeHtml(asset.notes || '-')}</td><td><wa-button size="small" appearance="plain" data-delete-asset="${asset.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">No hay activos adicionales.</td></tr>'; }
function renderLiabilities() { const rows = sortRows(visibleLiabilities(), 'liabilities'); $('#liabilityRows').innerHTML = rows.length ? rows.map(liability => `<tr><td>${escapeHtml(liability.name)}<br>${ownerPillHtml(liability)}</td><td>${escapeHtml(liability.type)}</td><td>${eur.format(liability.value || 0)}</td><td>${escapeHtml(liability.notes || '-')}</td><td><wa-button size="small" appearance="plain" data-delete-liability="${liability.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">No hay deudas registradas.</td></tr>'; }
function renderSettings() { $('#monthlyExpenseInput').value = formatInputNumber(state.settings.monthlyExpense); $('#targetDividendInput').value = formatInputNumber(state.settings.targetAnnualDividends); $('#targetNetWorthInput').value = formatInputNumber(state.settings.targetNetWorth); $('#monthlyContributionInput').value = formatInputNumber(state.settings.monthlyContribution); if ($('#targetMonthlyIncomeInput')) $('#targetMonthlyIncomeInput').value = formatInputNumber(state.settings.targetMonthlyIncome); if ($('#ownerName1')) { $('#ownerName1').value = ownerName('owner-1'); $('#ownerName2').value = ownerName('owner-2'); $('#ownerNameFamily').value = ownerName('owner-family'); } renderPortfolioEstimateRows(); }
function saveOwnerNames(event) {
  event.preventDefault();
  state.ownerNames = migrateOwnerNames({
    'owner-1': $('#ownerName1').value.trim() || DEFAULT_OWNER_NAMES['owner-1'],
    'owner-2': $('#ownerName2').value.trim() || DEFAULT_OWNER_NAMES['owner-2'],
    'owner-family': $('#ownerNameFamily').value.trim() || DEFAULT_OWNER_NAMES['owner-family']
  });
  saveState();
  render();
  showNotice('Nombres de propietarios guardados.');
}
function renderPortfolioEstimateRows() {
  const rows = $('#portfolioEstimateRows');
  if (!rows) return;
  const ids = ['owner-2', 'owner-family'].filter(id => state.portfolioEstimates[id]);
  rows.innerHTML = ids.length ? ids.map(id => {
    const est = state.portfolioEstimates[id];
    const active = ownerEstimateInUse(id);
    return `<tr><td>${escapeHtml(ownerName(id))}</td><td>${eur.format(est.value || 0)}</td><td>${eur.format(est.cost || 0)}</td><td>${formatPercent(est.dividendYield || 0)}</td><td>${active ? 'Activa (sin cartera real)' : 'Inactiva (ya hay cartera real importada)'}</td><td><wa-button size="small" appearance="plain" data-delete-estimate="${id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`;
  }).join('') : '<tr><td colspan="6" class="empty-cell">Sin estimaciones guardadas.</td></tr>';
}
function savePortfolioEstimate(event) {
  event.preventDefault();
  const ownerId = $('#estimateOwner')?.value || 'owner-2';
  const value = parseLocaleNumber($('#estimateValue')?.value);
  if (!value || value <= 0) { showNotice('Indica un valor de cartera válido.'); return; }
  const cost = parseLocaleNumber($('#estimateCost')?.value);
  const dividendYield = parsePercent($('#estimateYield')?.value);
  state.portfolioEstimates[ownerId] = migratePortfolioEstimate({ value, cost, dividendYield, updatedAt: new Date().toISOString() });
  saveState();
  $('#estimateValue').value = '';
  $('#estimateCost').value = '';
  $('#estimateYield').value = '';
  render();
  showNotice('Estimación de cartera guardada.');
}
function renderUndoState() { const hasUndo = Boolean(state.lastImportUndo?.snapshot); ['#undoImportBtn', '#undoImportSettingsBtn'].forEach(selector => { const button = $(selector); if (!button) return; if (selector === '#undoImportBtn') button.hidden = !hasUndo; button.disabled = !hasUndo; }); $('#undoHelpText').textContent = hasUndo ? `Disponible la copia previa creada el ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastImportUndo.createdAt))}.` : 'No hay ninguna importación reciente para revertir.'; }
function renderBackupStatus() { $('#backupStatus').textContent = state.lastBackupAt ? `Última copia automática: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastBackupAt))}.` : 'Todavía no se ha generado ninguna copia automática previa a importación.'; }
function renderReportHistory() { const rows = sortRows(reportHistoryRows(), 'reports'); $('#reportRows').innerHTML = rows.length ? rows.map(row => `<tr><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.createdAt))}</td><td>${row.score === null ? '-' : `${row.score}/100`}</td><td>${row.netWorth === null ? '-' : eur.format(row.netWorth)}</td><td>${row.dividends === null ? '-' : eur.format(row.dividends)}</td><td>${escapeHtml(row.concentrationLabel || '-')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavía no hay informes generados.</td></tr>'; }
function showNotice(message) { const notice = $('#notice'); notice.textContent = message; notice.classList.add('show'); clearTimeout(notice._timer); notice._timer = setTimeout(() => notice.classList.remove('show'), 3500); }
function switchView(id) { $$('.view').forEach(view => view.classList.toggle('active', view.id === id)); $$('.nav-item[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === id)); scrollTo({ top: 0, behavior: 'smooth' }); }
function switchOptionsSubview(id) { $$('.option-subview').forEach(view => view.classList.toggle('active', view.id === id)); $$('.sub-nav-item').forEach(button => button.classList.toggle('active', button.dataset.subview === id)); }
function openImport() { pendingImport = null; $('#csvFile').value = ''; $('#importMode').value = 'update'; $('#importStepSelect').hidden = false; $('#importStepPreview').hidden = true; $('#confirmImportBtn').hidden = true; $('#importWarnings').hidden = true; $('#importDialog').open = true; }
function sanitizeRow(row) { return Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [cleanText(key).replace(/^\uFEFF/, ''), value])); }
function normalizeCsvRow(row, index) { const cleanRow = sanitizeRow(row); const symbol = cleanText(cleanRow.symbol).toUpperCase(); const name = cleanText(cleanRow.name || symbol || `Fila ${index + 2}`); const isin = normalizeIsin(cleanRow.isin); const totalCost = parseLocaleNumber(cleanRow.buyinTotal); const marketValue = parseLocaleNumber(cleanRow.value); const annualDividend = parseLocaleNumber(cleanRow.totalDividendRate); const gain = parseLocaleNumber(cleanRow.gain) ?? (marketValue !== null && totalCost !== null ? marketValue - totalCost : null); const position = { id: isin, isin, symbol, name, quantity: parseLocaleNumber(cleanRow.quantity), averagePrice: parseLocaleNumber(cleanRow.buyin), totalCost, currentPrice: parseLocaleNumber(cleanRow.price), marketValue, gain, gainPercent: parsePercent(cleanRow.gainRel) ?? (gain !== null && totalCost ? gain / totalCost : null), currency: normalizeCurrency(cleanRow.currency), allocation: parsePercent(cleanRow.allocation), dividendYield: parsePercent(cleanRow.dividendYield), yieldOnCost: parsePercent(cleanRow.dividendYieldOnBuyin) ?? (annualDividend !== null && totalCost ? annualDividend / totalCost : null), annualDividend, dividendPerShare: parseLocaleNumber(cleanRow.dividendRate), dividendFrequency: normalizeFrequency(cleanRow.dividendFrequency), dividendCagr: parsePercent(cleanRow.dividendCagr), sector: cleanText(cleanRow.sector) || 'Sin clasificar', country: cleanText(cleanRow.country) || 'Sin país', transactions: parseLocaleNumber(cleanRow.transactions), exDate: normalizeDate(cleanRow.exDate), payDate: normalizeDate(cleanRow.payDate), taxRate: parsePercent(cleanRow.taxRate), notes: '', thesis: '', targetPrice: null, status: 'active', unreliableMatch: !isin, fallbackKey: buildFallbackKey(symbol, name), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archivedAt: null, importMeta: { source: 'divvydiary', importedAt: new Date().toISOString(), rowNumber: index + 2 }, raw: cleanRow }; const issues = []; if (!isin) issues.push('Posición sin ISIN valido. No se sincroniza automáticamente.'); if (marketValue === null) issues.push('Falta el valor de mercado.'); if (position.quantity === null) issues.push('Falta la cantidad.'); return { rowNumber: index + 2, position, issues }; }
function materialDiff(existing, incoming) { const fields = [['name', 'Nombre'], ['symbol', 'Ticker'], ['quantity', 'Cantidad'], ['averagePrice', 'Precio medio'], ['totalCost', 'Coste'], ['currentPrice', 'Precio actual'], ['marketValue', 'Valor'], ['gain', 'Ganancia'], ['gainPercent', 'Ganancia %'], ['currency', 'Divisa'], ['allocation', 'Peso'], ['dividendYield', 'Yield'], ['yieldOnCost', 'Yield on cost'], ['annualDividend', 'Dividendo anual'], ['dividendPerShare', 'Dividendo por acción'], ['dividendFrequency', 'Frecuencia'], ['dividendCagr', 'CAGR dividendo'], ['sector', 'Sector'], ['country', 'País'], ['exDate', 'Ex-date'], ['payDate', 'Pay-date'], ['taxRate', 'Retención']]; const changed = []; fields.forEach(([field, label]) => { const left = existing[field]; const right = incoming[field]; if (typeof left === 'number' || typeof right === 'number') { const l = left ?? null; const r = right ?? null; if (l === null && r === null) return; if (l === null || r === null || Math.abs(l - r) > 0.0001) changed.push(label); return; } if ((left || '') !== (right || '')) changed.push(label); }); return changed; }
function buildImportPreview(file, rows) { const existingByIsin = new Map(activePortfolio().filter(position => position.isin).map(position => [position.isin, position])); const seenIsins = new Set(); const preview = { file, rows, validEntries: [], skippedRows: [], newItems: [], updatedItems: [], removedItems: [], issues: [], totals: null }; rows.forEach(item => { const { position, issues, rowNumber } = item; if (issues.length) preview.issues.push(...issues.map(message => ({ rowNumber, message, label: `${position.name} | ${position.symbol}` }))); if (!position.isin) { preview.skippedRows.push({ rowNumber, position, reason: 'Sin ISIN valido' }); return; } if (seenIsins.has(position.isin)) { preview.issues.push({ rowNumber, message: `ISIN duplicado en el CSV: ${position.isin}`, label: position.name }); preview.skippedRows.push({ rowNumber, position, reason: 'ISIN duplicado en el CSV' }); return; } seenIsins.add(position.isin); const existing = existingByIsin.get(position.isin); if (!existing) { preview.newItems.push({ rowNumber, position }); preview.validEntries.push({ rowNumber, type: 'new', position, existing: null, changedFields: [] }); return; } const changedFields = materialDiff(existing, position); const entry = { rowNumber, type: changedFields.length ? 'updated' : 'unchanged', position, existing, changedFields }; preview.validEntries.push(entry); if (changedFields.length) preview.updatedItems.push(entry); }); const importedIsins = new Set(preview.validEntries.map(entry => entry.position.isin)); preview.removedItems = activePortfolio().filter(position => position.isin && !importedIsins.has(position.isin)).map(position => ({ position })); preview.totals = totals(preview.validEntries.map(entry => entry.position)); return preview; }
function parseCsv(file) { if (!window.Papa) { showNotice('No se ha cargado el lector CSV. Comprueba la conexión.'); return; } Papa.parse(file, { header: true, skipEmptyLines: true, delimiter: ';', encoding: 'UTF-8', complete: result => { const fields = (result.meta.fields || []).map(field => cleanText(field).replace(/^\uFEFF/, '')); const required = ['isin', 'name', 'quantity', 'value']; const missing = required.filter(field => !fields.includes(field)); if (missing.length) { showNotice(`CSV no reconocido. Faltan: ${missing.join(', ')}`); return; } const rows = result.data.map((row, index) => normalizeCsvRow(row, index)).filter(item => item.position.symbol || item.position.name || item.position.isin); if (!rows.length) { showNotice('El CSV no contiene posiciones validas.'); return; } pendingImport = buildImportPreview(file, rows); renderImportPreview(); }, error: error => showNotice(`Error al leer el CSV: ${error.message}`) }); }
function renderPreviewList(selector, items, formatter) { const element = $(selector); element.innerHTML = items.length ? items.map(formatter).join('') : '<li>Sin cambios</li>'; }
function renderImportPreview() { if (!pendingImport) return; const preview = pendingImport; $('#importFilename').textContent = preview.file.name; $('#importSummary').textContent = `${preview.validEntries.length} posiciones listas para importar y ${preview.skippedRows.length} filas omitidas por seguridad.`; $('#previewCount').textContent = preview.totals.count; $('#previewValue').textContent = eur.format(preview.totals.value); $('#previewCost').textContent = eur.format(preview.totals.cost); $('#previewGain').textContent = eur.format(preview.totals.gain); $('#previewDividends').textContent = eur.format(preview.totals.dividends); $('#previewNew').textContent = `${preview.newItems.length} nuevas`; $('#previewUpdated').textContent = `${preview.updatedItems.length} actualizadas`; $('#previewRemoved').textContent = `${preview.removedItems.length} ausentes`; $('#previewErrors').textContent = `${preview.issues.length} incidencias`; renderPreviewList('#previewNewList', preview.newItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.position.isin)}</small></li>`); renderPreviewList('#previewUpdatedList', preview.updatedItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.changedFields.join(', '))}</small></li>`); renderPreviewList('#previewRemovedList', preview.removedItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.position.isin)}</small></li>`); const issues = [...preview.skippedRows.map(item => ({ rowNumber: item.rowNumber, text: `${item.position.name} | ${item.reason}` })), ...preview.issues.map(issue => ({ rowNumber: issue.rowNumber, text: `${issue.label} | ${issue.message}` }))]; renderPreviewList('#previewIssueList', issues, issue => `<li>Fila ${issue.rowNumber}: ${escapeHtml(issue.text)}</li>`); $('#importStepSelect').hidden = true; $('#importStepPreview').hidden = false; $('#confirmImportBtn').hidden = false; updateImportWarnings(); }
function updateImportWarnings() { const warning = $('#importWarnings'); if (!pendingImport) { warning.hidden = true; return; } const mode = $('#importMode').value || 'update'; const messages = []; if (pendingImport.skippedRows.length) messages.push(`Se omitiran ${pendingImport.skippedRows.length} filas sin ISIN valido o con ISIN duplicado.`); if (mode === 'replace' && pendingImport.removedItems.length) messages.push(`Las ${pendingImport.removedItems.length} posiciones ausentes se archivaran, no se borraran.`); if (!messages.length) { warning.hidden = true; warning.innerHTML = ''; return; } warning.hidden = false; warning.innerHTML = messages.map(message => `<div>${escapeHtml(message)}</div>`).join(''); }
function saveImportBackup(sourceName) { const snapshot = cloneSnapshot(); const backup = { id: crypto.randomUUID?.() || `backup-${Date.now()}`, createdAt: new Date().toISOString(), reason: 'before-import', source: sourceName, snapshot }; state.lastImportUndo = backup; state.lastBackupAt = backup.createdAt; state.backups = [backup, ...state.backups].slice(0, 10); }
function mergeImportedPosition(existing, incoming) { const now = new Date().toISOString(); return { ...existing, ...incoming, id: existing.id || incoming.id, isin: incoming.isin || existing.isin, notes: existing.notes || '', thesis: existing.thesis || '', targetPrice: existing.targetPrice ?? null, status: existing.status === 'watch' ? 'watch' : 'active', unreliableMatch: false, fallbackKey: incoming.fallbackKey || existing.fallbackKey, ownership: existing.ownership || defaultOwnership(), createdAt: existing.createdAt || now, updatedAt: now, archivedAt: null }; }
function createImportedPosition(incoming) { const now = new Date().toISOString(); const defaultOwnerId = OWNER_IDS.includes(state.viewOwnerId) ? state.viewOwnerId : 'owner-1'; return { ...incoming, id: incoming.isin || incoming.id || `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, notes: incoming.notes || '', thesis: incoming.thesis || '', targetPrice: incoming.targetPrice ?? null, status: 'active', ownership: [{ ownerId: defaultOwnerId, pct: 1 }], createdAt: now, updatedAt: now, archivedAt: null }; }
function confirmImport() { if (!pendingImport) return; const mode = $('#importMode').value || 'update'; saveImportBackup(pendingImport.file.name); const next = new Map(); if (mode === 'update') { state.portfolio.forEach(position => next.set(position.id, { ...position })); pendingImport.validEntries.forEach(entry => { const record = entry.existing ? mergeImportedPosition(entry.existing, entry.position) : createImportedPosition(entry.position); next.set(record.id, record); }); } else { state.portfolio.filter(position => !position.isin).forEach(position => next.set(position.id, { ...position })); pendingImport.validEntries.forEach(entry => { const record = entry.existing ? mergeImportedPosition(entry.existing, entry.position) : createImportedPosition(entry.position); next.set(record.id, record); }); const importedIsins = new Set(pendingImport.validEntries.map(entry => entry.position.isin)); state.portfolio.forEach(position => { if (position.isin && !importedIsins.has(position.isin)) next.set(position.id, { ...position, status: 'archived', archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); }); } state.portfolio = [...next.values()]; state.lastImport = new Date().toISOString(); saveState(); render(); $('#importDialog').open = false; showNotice(`Importación completada: ${pendingImport.validEntries.length} posiciones sincronizadas.`); pendingImport = null; }
function openTransactionsImport() { pendingTransactionImport = null; $('#transactionsCsvFile').value = ''; $('#transactionsStepSelect').hidden = false; $('#transactionsStepPreview').hidden = true; $('#confirmTransactionsBtn').hidden = true; $('#transactionsWarnings').hidden = true; $('#transactionsDialog').open = true; }
function normalizeTransactionCsvRow(row, index) {
  const cleanRow = sanitizeRow(row);
  const pick = (...keys) => { for (const key of keys) { if (cleanRow[key] !== undefined && cleanRow[key] !== '') return cleanRow[key]; } return undefined; };
  const typeRaw = cleanText(pick('type', 'transactionType', 'direction', 'orderType')).toLowerCase();
  const type = /sell|venta|vend/.test(typeRaw) ? 'SELL' : 'BUY';
  const isin = normalizeIsin(pick('isin'));
  const symbol = cleanText(pick('symbol', 'ticker', 'wkn')).toUpperCase();
  const name = cleanText(pick('name') || symbol || `Fila ${index + 2}`);
  const quantity = parseLocaleNumber(pick('shares', 'quantity', 'units'));
  let price = parseLocaleNumber(pick('price', 'pricePerShare', 'sharePrice'));
  let amount = parseLocaleNumber(pick('amount', 'total', 'value', 'netAmount'));
  if (amount === null && price !== null && quantity !== null) amount = Math.abs(price * quantity);
  if (price === null && amount !== null && quantity) price = Math.abs(amount / quantity);
  const fees = parseLocaleNumber(pick('fee', 'fees', 'commission')) || 0;
  const taxes = parseLocaleNumber(pick('tax', 'taxes')) || 0;
  const rawDate = pick('date', 'datetime', 'day', 'bookingDate');
  const datetime = normalizeDate(rawDate) || cleanText(rawDate);
  const portfolio = cleanText(pick('portfolio', 'depot', 'account'));
  const transaction = migrateTransaction({ datetime: datetime || new Date().toISOString(), type, isin, symbol, name, quantity, price, amount, currency: pick('currency'), fees, taxes, portfolio, importMeta: { source: 'divvydiary-transactions', importedAt: new Date().toISOString(), rowNumber: index + 2 }, raw: cleanRow });
  const issues = [];
  if (!isin && !symbol) issues.push('Operación sin ISIN ni ticker identificable.');
  if (quantity === null) issues.push('Falta la cantidad.');
  if (amount === null) issues.push('Falta el importe (o precio) de la operación.');
  if (!datetime) issues.push('Falta la fecha de la operación.');
  return { rowNumber: index + 2, transaction, issues };
}
function buildTransactionsImportPreview(file, rows) {
  const existingKeys = new Set(state.transactions.map(tx => tx.dedupeKey));
  const seenInFile = new Set();
  const preview = { file, rows, validEntries: [], newItems: [], duplicateItems: [], issues: [], totals: null };
  rows.forEach(item => {
    const { transaction, issues, rowNumber } = item;
    if (issues.length) preview.issues.push(...issues.map(message => ({ rowNumber, message })));
    if (seenInFile.has(transaction.dedupeKey)) return;
    seenInFile.add(transaction.dedupeKey);
    if (existingKeys.has(transaction.dedupeKey)) { preview.duplicateItems.push({ rowNumber, transaction }); return; }
    preview.validEntries.push({ rowNumber, transaction });
    preview.newItems.push({ rowNumber, transaction });
  });
  const buys = preview.newItems.filter(item => item.transaction.type === 'BUY').length;
  const sells = preview.newItems.length - buys;
  const netAmount = preview.newItems.reduce((sum, item) => sum + (item.transaction.type === 'SELL' ? -(item.transaction.amount || 0) : (item.transaction.amount || 0)), 0);
  const fees = preview.newItems.reduce((sum, item) => sum + (item.transaction.costs || 0), 0);
  preview.totals = { count: preview.newItems.length, buys, sells, netAmount, fees };
  return preview;
}
function parseTransactionsCsv(file) { if (!window.Papa) { showNotice('No se ha cargado el lector CSV. Comprueba la conexión.'); return; } Papa.parse(file, { header: true, skipEmptyLines: true, delimiter: ';', encoding: 'UTF-8', complete: result => { const rows = result.data.map((row, index) => normalizeTransactionCsvRow(row, index)).filter(item => item.transaction.isin || item.transaction.symbol); if (!rows.length) { showNotice('El CSV no contiene operaciones reconocibles.'); return; } pendingTransactionImport = buildTransactionsImportPreview(file, rows); renderTransactionsImportPreview(); }, error: error => showNotice(`Error al leer el CSV: ${error.message}`) }); }
function renderTransactionsImportPreview() {
  if (!pendingTransactionImport) return;
  const preview = pendingTransactionImport;
  $('#transactionsFilename').textContent = preview.file.name;
  $('#transactionsSummary').textContent = `${preview.totals.count} operaciones nuevas y ${preview.duplicateItems.length} ya importadas anteriormente.`;
  $('#transactionsCount').textContent = preview.totals.count;
  $('#transactionsBuyCount').textContent = preview.totals.buys;
  $('#transactionsSellCount').textContent = preview.totals.sells;
  $('#transactionsNetAmount').textContent = eur.format(preview.totals.netAmount);
  $('#transactionsFees').textContent = eur.format(preview.totals.fees);
  $('#transactionsNew').textContent = `${preview.newItems.length} nuevas`;
  $('#transactionsUpdated').textContent = `${preview.duplicateItems.length} duplicadas`;
  $('#transactionsErrors').textContent = `${preview.issues.length} incidencias`;
  renderPreviewList('#transactionsNewList', preview.newItems, item => `<li>${escapeHtml(item.transaction.name)}<small>${dateEs(item.transaction.date)} | ${formatCurrency(item.transaction.amount, item.transaction.currency)}</small></li>`);
  renderPreviewList('#transactionsDuplicateList', preview.duplicateItems, item => `<li>${escapeHtml(item.transaction.name)}<small>${dateEs(item.transaction.date)}</small></li>`);
  renderPreviewList('#transactionsIssueList', preview.issues, issue => `<li>Fila ${issue.rowNumber}: ${escapeHtml(issue.message)}</li>`);
  const warning = $('#transactionsWarnings');
  if (preview.duplicateItems.length) { warning.hidden = false; warning.textContent = `Se omitiran ${preview.duplicateItems.length} operaciones ya importadas previamente.`; }
  else { warning.hidden = true; warning.textContent = ''; }
  $('#transactionsStepSelect').hidden = true;
  $('#transactionsStepPreview').hidden = false;
  $('#confirmTransactionsBtn').hidden = false;
}
function confirmTransactionsImport() {
  if (!pendingTransactionImport) return;
  const additions = pendingTransactionImport.validEntries.map(entry => migrateTransaction({ ...entry.transaction, id: entry.transaction.dedupeKey }));
  state.transactions = [...additions, ...state.transactions];
  state.lastTransactionsImport = new Date().toISOString();
  saveState();
  render();
  $('#transactionsDialog').open = false;
  showNotice(`Importación completada: ${additions.length} operaciones nuevas.`);
  pendingTransactionImport = null;
}
function buildMonthlySnapshot(overrides = {}) {
  const portfolio = activePortfolio();
  const byOwner = {};
  ['all', ...OWNER_IDS].forEach(ownerId => {
    const m = fullMetricsForOwner(ownerId);
    byOwner[ownerId] = { value: m.value, cost: m.cost, gain: m.gain, dividends: m.dividends, count: m.count, liquidity: m.liquidity, otherAssets: m.otherAssets, debt: m.liabilities, netWorth: m.netWorth };
  });
  return { id: crypto.randomUUID?.() || String(Date.now()), month: new Date().toISOString().slice(0, 7), date: new Date().toISOString(), ...byOwner.all, byOwner, monthlyContribution: overrides.monthlyContribution ?? state.settings.monthlyContribution, notes: overrides.notes || '', positions: sortedPortfolio(portfolio).slice(0, 10).map(position => ({ isin: position.isin, symbol: position.symbol, name: position.name, value: position.marketValue, weight: position.allocation })) };
}
function currentMonthKey() { return new Date().toISOString().slice(0, 7); }
function existingSnapshotForMonth(month = currentMonthKey()) { return state.history.find(item => item.month === month) || null; }
function updateMonthlyClosePreview() {
  const metrics = fullMetrics();
  $('#monthlyClosePreviewValue').textContent = eur.format(metrics.value);
  $('#monthlyClosePreviewNetWorth').textContent = eur.format(metrics.netWorth);
  $('#monthlyClosePreviewLiquidity').textContent = eur.format(metrics.liquidity);
  $('#monthlyClosePreviewDebt').textContent = eur.format(metrics.liabilities);
  $('#monthlyClosePreviewDividends').textContent = eur.format(metrics.dividends);
  const previousSnapshots = [...state.history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const previous = previousSnapshots.length ? previousSnapshots[previousSnapshots.length - 1] : null;
  const narrativeNode = $('#monthlyCloseResultNarrative');
  if (!narrativeNode) return;
  const lines = [];
  if (previous) {
    const netWorthDelta = relativeDelta(metrics.netWorth, previous.netWorth);
    lines.push(`Patrimonio neto: ${netWorthDelta === null ? eur.format(metrics.netWorth) : formatPercent(netWorthDelta)} frente al cierre anterior.`);
    const dividendsDelta = relativeDelta(metrics.dividends, previous.dividends);
    lines.push(`Dividendos anuales: ${dividendsDelta === null ? eur.format(metrics.dividends) : formatPercent(dividendsDelta)} frente al cierre anterior.`);
  } else {
    lines.push('Este es tu primer cierre mensual: no hay comparación previa todavía.');
  }
  const plan = computePlan();
  if (plan.targetValue !== null) lines.push(`Progreso hacia tu objetivo: ${plan.gap <= 0 ? 'cubierto' : `${eur.format(planDisplayAmount(plan.targetType, plan.gap))} de brecha restante`}.`);
  const topSignal = advisorSignals().signals.find(s => s.tone === 'risk') || advisorSignals().signals.find(s => s.tone === 'warn');
  lines.push(topSignal ? `Principal riesgo a vigilar: ${topSignal.title} (${topSignal.name}).` : 'Sin riesgos destacados este mes.');
  narrativeNode.className = 'summary-stack';
  narrativeNode.innerHTML = lines.map(line => `<small>${escapeHtml(line)}</small>`).join('');
}
const MONTHLY_CLOSE_STEPS = ['monthlyCloseStep1', 'monthlyCloseStep2', 'monthlyCloseStep3', 'monthlyCloseStep4', 'monthlyCloseStep5'];
let monthlyCloseStepIndex = 0;
function goToMonthlyCloseStep(index) {
  monthlyCloseStepIndex = Math.max(0, Math.min(MONTHLY_CLOSE_STEPS.length - 1, index));
  MONTHLY_CLOSE_STEPS.forEach((id, i) => { const node = $(`#${id}`); if (node) node.hidden = i !== monthlyCloseStepIndex; });
  $$('.wizard-step').forEach(dot => {
    const dotIndex = Number(dot.dataset.stepDot) - 1;
    dot.classList.toggle('active', dotIndex === monthlyCloseStepIndex);
    dot.classList.toggle('done', dotIndex < monthlyCloseStepIndex);
  });
  $('#monthlyCloseBackBtn').hidden = monthlyCloseStepIndex === 0;
  const isLast = monthlyCloseStepIndex === MONTHLY_CLOSE_STEPS.length - 1;
  $('#monthlyCloseNextBtn').hidden = isLast;
  $('#confirmMonthlyCloseBtn').hidden = !isLast;
  if (monthlyCloseStepIndex === 2) {
    const summary = rentasSummary();
    const node = $('#monthlyCloseIncomeSummary');
    node.className = 'summary-stack';
    node.innerHTML = `<strong>Renta neta mensual estimada: ${eur.format(summary.monthlyNet)}</strong><small>Dividendos: ${eur.format(summary.dividends)}/año | Opciones: ${eur.format(summary.optionsPremium)}/año | Intereses y alquiler: ${eur.format(summary.interestIncome + summary.rentIncome)}/año</small>`;
  }
  if (monthlyCloseStepIndex === 4) updateMonthlyClosePreview();
}
function openMonthlyClose() {
  const already = existingSnapshotForMonth();
  const alreadyNode = $('#monthlyCloseAlready');
  const emptyNode = $('#monthlyCloseEmpty');
  const formNode = $('#monthlyCloseForm');
  const confirmBtn = $('#confirmMonthlyCloseBtn');
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date());
  if (already) {
    alreadyNode.hidden = false;
    emptyNode.hidden = true;
    formNode.hidden = true;
    confirmBtn.hidden = true;
    $('#monthlyCloseAlreadyTitle').textContent = `Ya existe un cierre para ${monthLabel}`;
    $('#monthlyCloseAlreadyText').textContent = `Se registro el ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(already.date))}. Solo se permite un cierre por mes: eliminalo desde el Histórico si necesitas corregirlo.`;
  } else if (!activePortfolio().length) {
    alreadyNode.hidden = true;
    emptyNode.hidden = false;
    formNode.hidden = true;
    confirmBtn.hidden = true;
  } else {
    alreadyNode.hidden = true;
    emptyNode.hidden = true;
    formNode.hidden = false;
    $('#monthlyClosePortfolioStatus').textContent = state.lastImport ? `Última importación de cartera: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastImport))}.` : 'Todavía no has importado ninguna cartera de DivvyDiary.';
    $('#monthlyCloseTxStatus').textContent = state.lastTransactionsImport ? `Última importación de transacciones: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastTransactionsImport))}.` : 'Todavía no has importado transacciones (opcional).';
    const assets = assetTotals();
    $('#monthlyCloseAssetsStatus').textContent = `Liquidez: ${eur.format(assets.liquidity)} | Otros activos: ${eur.format(assets.otherAssets)} | Deuda: ${eur.format(assets.liabilities)}.`;
    $('#monthlyCloseContribution').value = formatInputNumber(state.settings.monthlyContribution);
    $('#monthlyCloseNotes').value = '';
    $('#monthlyCloseNoChanges').checked = false;
    $('#monthlyCloseDecision').value = '';
    goToMonthlyCloseStep(0);
  }
  $('#monthlyCloseDialog').open = true;
}
function confirmMonthlyClose() {
  if (existingSnapshotForMonth()) { showNotice('Ya existe un cierre para este mes.'); return; }
  const portfolio = activePortfolio();
  if (!portfolio.length) { showNotice('Importa primero una cartera.'); return; }
  const snapshot = buildMonthlySnapshot({ monthlyContribution: parseLocaleNumber($('#monthlyCloseContribution').value), notes: $('#monthlyCloseNotes').value.trim() });
  state.history.push(snapshot);
  const decisionText = cleanText($('#monthlyCloseDecision').value);
  if (decisionText) {
    const decidedAt = new Date().toISOString();
    state.decisionReviews = [migrateDecisionReview({
      title: `Decisión del mes: ${new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date())}`,
      category: 'Cierre mensual', phase: '3m', status: 'pending', reason: decisionText,
      createdAt: decidedAt, decidedAt, reviewDate: new Date(Date.now() + 90 * 86400000).toISOString()
    }), ...state.decisionReviews];
  }
  saveState();
  renderHistory();
  renderDashboard();
  $('#monthlyCloseDialog').open = false;
  showNotice('Cierre mensual guardado.');
}
function download(name, content, type) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
function exportJson() { download(`family-office-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), 'application/json'); }
function restoreJson(file) { const reader = new FileReader(); reader.onload = () => { try { const migrated = migrateState(JSON.parse(reader.result)); Object.assign(state, defaultState(), migrated); saveState(); render(); showNotice('Copia restaurada correctamente.'); } catch (error) { showNotice(`No se pudo restaurar: ${error.message}`); } }; reader.readAsText(file); }
async function loadAnalysisPromptTemplate() {
  if (analysisPromptCache) return analysisPromptCache;
  try {
    const response = await fetch(ANALYSIS_PROMPT_PATH, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Prompt no disponible: ${response.status}`);
    analysisPromptCache = await response.text();
  } catch (error) {
    console.warn('Falling back to embedded analysis prompt', error);
    analysisPromptCache = DEFAULT_ANALYSIS_PROMPT;
  }
  return analysisPromptCache;
}
function reportDeltaSection() {
  const chronological = [...state.history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = chronological.at(-1);
  const previous = chronological.at(-2);
  if (!latest) return ['- Todavía no hay cierres mensuales guardados.'];
  if (!previous) return [`- Último cierre guardado: ${dateEs(String(latest.date).slice(0, 10))}.`];
  return [
    `- Último cierre: ${dateEs(String(latest.date).slice(0, 10))}.`,
    `- Variación cartera: ${formatPercent(relativeDelta(latest.value || 0, previous.value || 0))}.`,
    `- Variación patrimonio neto: ${formatPercent(relativeDelta(latest.netWorth || 0, previous.netWorth || 0))}.`,
    `- Variación liquidez: ${formatPercent(relativeDelta(latest.liquidity || 0, previous.liquidity || 0))}.`,
    `- Variación deuda: ${formatPercent(relativeDelta(latest.debt || 0, previous.debt || 0))}.`
  ];
}
function recentReportSummary() {
  const reports = reportHistoryRows().slice(0, 3);
  if (!reports.length) return ['- No hay informes anteriores registrados.'];
  return reports.map(report => `- ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.createdAt))}: score ${report.score ?? '-'} | patrimonio ${report.netWorth === null ? '-' : eur.format(report.netWorth)} | dividendos ${report.dividends === null ? '-' : eur.format(report.dividends)} | concentración ${report.concentrationLabel || '-'}.`);
}
function mergePromptWithData(template, dataBlock) {
  const normalizedTemplate = cleanText(template) ? template : DEFAULT_ANALYSIS_PROMPT;
  return normalizedTemplate.includes('{{PORTFOLIO_DATA}}') ? normalizedTemplate.replace('{{PORTFOLIO_DATA}}', dataBlock) : `${normalizedTemplate.trim()}\n\n---\n\n${dataBlock}`;
}
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
  $('#positionSummary').textContent = `${position.symbol || 'Sin ticker'} | ${position.isin || 'Sin ISIN'} | Valor ${formatCurrency(position.marketValue, position.currency)} | Dividendo ${formatCurrency(position.annualDividend, position.currency)}`;
  $('#positionNotes').value = position.notes || '';
  $('#positionThesis').value = position.thesis || '';
  $('#positionTargetPrice').value = formatInputNumber(position.targetPrice);
  $('#positionStatus').value = normalizeStatus(position.status);
  populateAccountOptions($('#positionAccount'));
  $('#positionAccount').value = position.accountId || UNASSIGNED_ACCOUNT_ID;
  $('#positionRole').value = position.role || '';
  updatePositionStrategicBlock(position);
  $('#positionDialog').open = true;
}
function updatePositionStrategicBlock(position) {
  const role = $('#positionRole')?.value || '';
  const block = $('#positionStrategicBlock');
  if (!block) return;
  block.hidden = !role;
  if (!role) return;
  const strategic = position.strategic || {};
  $('#positionTargetWeight').value = formatInputNumber(strategic.targetWeight !== null && strategic.targetWeight !== undefined ? strategic.targetWeight * 100 : null);
  $('#positionTargetAmount').value = formatInputNumber(strategic.targetAmount);
  $('#positionTargetContribution').value = formatInputNumber(strategic.targetContribution);
  $('#positionHorizon').value = strategic.horizon || '';
  $('#positionStrategicThesis').value = strategic.thesis || '';
  const progress = strategicProgress(position);
  const progressNode = $('#positionStrategicProgress');
  if (progress && progress.targetWeight) {
    progressNode.className = 'summary-stack';
    progressNode.innerHTML = `<strong>Peso actual ${formatPercent(progress.currentWeight)} de ${formatPercent(progress.targetWeight)}</strong><span class="progress-bar"><span class="progress-bar-fill" style="width:${Math.round((progress.progressPct || 0) * 100)}%"></span></span><small>Progreso: ${formatPercent(progress.progressPct || 0)}${progress.suggestedNextContribution ? ` | Próxima aportación orientativa: ${eur.format(progress.suggestedNextContribution)}` : ''}</small>`;
  } else {
    progressNode.className = 'summary-stack empty-state';
    progressNode.innerHTML = 'Sin objetivo configurado';
  }
}
function savePositionDetails() {
  if (!editingPositionId) return;
  const index = state.portfolio.findIndex(item => item.id === editingPositionId);
  if (index < 0) return;
  const position = state.portfolio[index];
  const role = $('#positionRole').value || null;
  const targetWeight = parseLocaleNumber($('#positionTargetWeight').value);
  state.portfolio[index] = {
    ...position,
    notes: $('#positionNotes').value.trim(),
    thesis: $('#positionThesis').value.trim(),
    targetPrice: parseLocaleNumber($('#positionTargetPrice').value),
    status: normalizeStatus($('#positionStatus').value),
    archivedAt: normalizeStatus($('#positionStatus').value) === 'archived' ? (position.archivedAt || new Date().toISOString()) : null,
    accountId: $('#positionAccount').value || UNASSIGNED_ACCOUNT_ID,
    role,
    strategic: role ? { targetWeight: targetWeight !== null ? targetWeight / 100 : null, targetAmount: parseLocaleNumber($('#positionTargetAmount').value), targetContribution: parseLocaleNumber($('#positionTargetContribution').value), horizon: $('#positionHorizon').value.trim(), thesis: $('#positionStrategicThesis').value.trim() } : null,
    updatedAt: new Date().toISOString()
  };
  saveState();
  render();
  $('#positionDialog').open = false;
  editingPositionId = null;
  showNotice('Posición actualizada.');
}
function readOwnershipControl(prefix) {
  const owner = $(`#${prefix}Owner`)?.value || 'owner-1';
  if (owner !== 'shared') return [{ ownerId: owner, pct: 1 }];
  const ownerA = $(`#${prefix}OwnerA`)?.value || 'owner-1';
  const ownerB = $(`#${prefix}OwnerB`)?.value || 'owner-2';
  const pctA = Math.max(0, toNum($(`#${prefix}OwnerAPct`)?.value, 50) || 0);
  const pctB = Math.max(0, toNum($(`#${prefix}OwnerBPct`)?.value, 50) || 0);
  if (ownerA === ownerB || (pctA + pctB) <= 0) return [{ ownerId: ownerA, pct: 1 }];
  return migrateOwnership([{ ownerId: ownerA, pct: pctA }, { ownerId: ownerB, pct: pctB }]);
}
function bindOwnershipToggle(prefix) {
  const select = $(`#${prefix}Owner`);
  const splitBlock = $(`#${prefix}SharedSplit`);
  if (!select || !splitBlock) return;
  select.addEventListener('change', () => { splitBlock.hidden = select.value !== 'shared'; });
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
    ownership: readOwnershipControl('asset'),
    accountId: $('#assetAccount')?.value || UNASSIGNED_ACCOUNT_ID,
    expectedIncome: parseLocaleNumber($('#assetExpectedIncome')?.value),
    updatedAt: new Date().toISOString()
  });
  saveState();
  render();
  $('#assetForm').reset();
  $('#assetType').value = 'cash';
  $('#assetOwner').value = defaultOwnerForEntry();
  $('#assetSharedSplit').hidden = true;
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
    ownership: readOwnershipControl('liability'),
    accountId: $('#liabilityAccount')?.value || UNASSIGNED_ACCOUNT_ID,
    updatedAt: new Date().toISOString()
  });
  saveState();
  render();
  $('#liabilityForm').reset();
  $('#liabilityType').value = 'mortgage';
  $('#liabilityOwner').value = defaultOwnerForEntry();
  $('#liabilitySharedSplit').hidden = true;
  showNotice('Deuda añadida.');
}
function populateAccountOptions(select) {
  if (!select) return;
  const current = select.value;
  const options = ['<wa-option value="unassigned">Sin asignar</wa-option>'].concat(state.accounts.map(a => `<wa-option value="${escapeHtml(a.id)}">${escapeHtml(a.name)} (${escapeHtml(ownerName(a.ownerId))})</wa-option>`));
  select.innerHTML = options.join('');
  const validValues = new Set(['unassigned', ...state.accounts.map(a => a.id)]);
  select.value = validValues.has(current) ? current : 'unassigned';
}
function accountSummary(account) {
  const positions = state.portfolio.filter(p => (p.accountId || UNASSIGNED_ACCOUNT_ID) === account.id && ACTIVE_STATUSES.has(normalizeStatus(p.status)));
  const value = positions.reduce((sum, p) => sum + (p.marketValue || 0), 0);
  const dividends = positions.reduce((sum, p) => sum + (p.annualDividend || 0), 0);
  const assets = state.assets.filter(a => (a.accountId || UNASSIGNED_ACCOUNT_ID) === account.id);
  const assetsValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  return { value: value + assetsValue, dividends, positionsCount: positions.length, assetsCount: assets.length };
}
function renderAccounts() {
  populateAccountOptions($('#assetAccount'));
  populateAccountOptions($('#liabilityAccount'));
  populateAccountOptions($('#positionAccount'));
  populateAccountOptions($('#anAccount'));
  const grid = $('#accountGrid');
  if (!grid) return;
  const accounts = state.accounts;
  grid.className = accounts.length ? 'account-grid' : 'account-grid empty-state';
  grid.innerHTML = accounts.length ? accounts.map(account => {
    const summary = accountSummary(account);
    return `<article class="account-card" data-open-account="${account.id}"><strong>${escapeHtml(account.name)}</strong><span class="account-badge">${escapeHtml(ACCOUNT_TYPE_LABELS[account.type] || account.type)}</span><span class="owner-pill owner-pill-${account.ownerId}">${escapeHtml(ownerName(account.ownerId))}</span><span>${eur.format(summary.value)}</span><small>Dividendos: ${eur.format(summary.dividends)} | ${summary.positionsCount} posiciones</small></article>`;
  }).join('') : 'Sin cuentas todavía.';
  renderProjects();
}
function addAccount(event) {
  event.preventDefault();
  const name = cleanText($('#accountName').value);
  if (!name) { showNotice('Indica un nombre para la cuenta.'); return; }
  state.accounts.unshift({
    ...defaultAccount(),
    id: crypto.randomUUID?.() || `account-${Date.now()}`,
    name,
    ownerId: $('#accountOwner').value || 'owner-1',
    type: $('#accountType').value || 'broker',
    purpose: $('#accountPurpose').value || 'mixed',
    currency: $('#accountCurrency').value || 'EUR',
    notes: cleanText($('#accountNotes').value)
  });
  saveState();
  render();
  $('#accountForm').reset();
  $('#accountOwner').value = defaultOwnerForEntry();
  $('#accountType').value = 'broker';
  $('#accountPurpose').value = 'mixed';
  $('#accountCurrency').value = 'EUR';
  showNotice('Cuenta añadida.');
}
function currentQuarterRange(date = new Date()) {
  const quarter = Math.floor(date.getMonth() / 3);
  const start = new Date(date.getFullYear(), quarter * 3, 1);
  const end = new Date(date.getFullYear(), quarter * 3 + 3, 0);
  return { start, end, quarter: quarter + 1, year: date.getFullYear() };
}
function quarterlyRuleStatus(account) {
  const rule = account.quarterlyRule;
  if (!rule || !rule.active) return null;
  const { start, end, quarter, year } = currentQuarterRange();
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const qualifyingOps = state.transactions.filter(tx => tx.accountId === account.id && tx.date >= startStr && tx.date <= endStr).length;
  const qualifies = qualifyingOps >= (rule.minOps || 1);
  const daysRemaining = Math.max(0, Math.round((end - new Date()) / 86400000));
  return {
    qualifies,
    daysRemaining,
    tone: qualifies ? 'good' : (daysRemaining <= 14 ? 'risk' : 'warn'),
    label: `Q${quarter} ${year}`,
    detail: qualifies ? `${qualifyingOps} operación(es) registrada(s) este trimestre.` : (rule.conditionText ? rule.conditionText : `Quedan ${daysRemaining} días para el cierre del trimestre.`)
  };
}
function openAccountDetail(id) {
  const account = state.accounts.find(a => a.id === id);
  if (!account) return;
  editingAccountId = id;
  $('#accountDetailTitle').textContent = account.name;
  const summary = accountSummary(account);
  const summaryNode = $('#accountDetailSummary');
  summaryNode.className = 'summary-stack';
  summaryNode.innerHTML = `<strong>${eur.format(summary.value)}</strong><small>Dividendos anuales: ${eur.format(summary.dividends)}</small><small>${escapeHtml(ownerName(account.ownerId))} · ${escapeHtml(ACCOUNT_TYPE_LABELS[account.type] || account.type)} · ${escapeHtml(ACCOUNT_PURPOSE_LABELS[account.purpose] || account.purpose)}</small>`;
  $('#accountRuleActive').checked = account.quarterlyRule.active;
  $('#accountRuleMinOps').value = account.quarterlyRule.minOps;
  $('#accountRuleCondition').value = account.quarterlyRule.conditionText;
  const statusNode = $('#accountQuarterlyStatus');
  const status = quarterlyRuleStatus(account);
  if (status) {
    statusNode.hidden = false;
    statusNode.className = 'signal-list';
    statusNode.innerHTML = `<div class="rule-status-card rule-status-${status.qualifies ? 'ok' : 'warn'}"><strong>${status.qualifies ? '✅ Operación realizada' : '⚠️ Operación pendiente'}</strong><span>${escapeHtml(status.label)}</span><small>${escapeHtml(status.detail)}</small></div>`;
  } else {
    statusNode.hidden = true;
  }
  const rows = [
    ...state.portfolio.filter(p => (p.accountId || UNASSIGNED_ACCOUNT_ID) === id).map(p => ({ name: p.name, type: 'Posición', value: eur.format(p.marketValue || 0) })),
    ...state.assets.filter(a => (a.accountId || UNASSIGNED_ACCOUNT_ID) === id).map(a => ({ name: a.name, type: 'Activo', value: eur.format(a.value || 0) })),
    ...state.liabilities.filter(l => (l.accountId || UNASSIGNED_ACCOUNT_ID) === id).map(l => ({ name: l.name, type: 'Deuda', value: eur.format(l.value || 0) })),
    ...state.options.filter(o => (o.accountId || UNASSIGNED_ACCOUNT_ID) === id).map(o => ({ name: `${o.underlying || 'Opción'} ${o.optionType}`, type: 'Opción', value: OPTION_STATUS_LABELS[o.status] || o.status }))
  ];
  $('#accountDetailBody').innerHTML = rows.length ? rows.map(r => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.type)}</td><td>${escapeHtml(String(r.value))}</td></tr>`).join('') : '<tr><td colspan="3" class="empty-cell">Sin elementos asociados.</td></tr>';
  $('#accountDetailDialog').open = true;
}
function saveAccountDetail() {
  const account = state.accounts.find(a => a.id === editingAccountId);
  if (!account) return;
  account.quarterlyRule.active = $('#accountRuleActive').checked;
  account.quarterlyRule.minOps = toNum($('#accountRuleMinOps').value, 1) || 1;
  account.quarterlyRule.conditionText = cleanText($('#accountRuleCondition').value);
  account.updatedAt = new Date().toISOString();
  saveState();
  render();
  $('#accountDetailDialog').open = false;
  showNotice('Cuenta actualizada.');
}
function projectTotals(project) {
  const paid = (project.contributions || []).reduce((sum, c) => sum + (c.amount || 0), 0);
  const pending = (project.obligations || []).filter(o => !o.paid).reduce((sum, o) => sum + (o.amount || 0), 0);
  return { paid, pending };
}
function nextCommitment(project) {
  const today = new Date().toISOString().slice(0, 10);
  const pending = (project.obligations || []).filter(o => !o.paid && o.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return pending.find(o => o.dueDate >= today) || pending[0] || null;
}
function renderProjects() {
  const list = $('#projectList');
  if (!list) return;
  const projects = state.projects;
  list.className = projects.length ? 'scenario-list' : 'scenario-list empty-state';
  list.innerHTML = projects.length ? projects.map(project => {
    const totals = projectTotals(project);
    const next = nextCommitment(project);
    return `<div class="scenario-card" data-open-project="${project.id}"><strong>${escapeHtml(project.name)}</strong><span>${project.deliveryDate ? dateEs(project.deliveryDate) : 'Sin fecha'}</span><small>${ownerPillHtml(project)} · ${escapeHtml(PROJECT_TYPE_LABELS[project.type] || project.type)}</small><small>Pagado: ${eur.format(totals.paid)} | Pendiente: ${eur.format(totals.pending)}</small>${next ? `<small>Próximo compromiso: ${eur.format(next.amount)} · ${dateEs(next.dueDate)}</small>` : ''}</div>`;
  }).join('') : 'Sin proyectos todavía.';
}
function addProject(event) {
  event.preventDefault();
  const name = cleanText($('#projectName').value);
  if (!name) { showNotice('Indica un nombre para el proyecto.'); return; }
  state.projects.unshift({
    ...defaultProject(),
    id: crypto.randomUUID?.() || `project-${Date.now()}`,
    name,
    type: $('#projectType').value || 'future_purchase',
    ownership: readOwnershipControl('project'),
    deliveryDate: $('#projectDeliveryDate').value || null,
    mortgageExpected: parseLocaleNumber($('#projectMortgageExpected').value),
    notes: cleanText($('#projectNotes').value)
  });
  saveState();
  render();
  $('#projectForm').reset();
  $('#projectOwner').value = defaultOwnerForEntry();
  $('#projectSharedSplit').hidden = true;
  showNotice('Proyecto añadido.');
}
function renderProjectTimeline(project) {
  const node = $('#projectTimelineView');
  if (!node) return;
  const events = [];
  (project.contributions || []).forEach(c => events.push({ date: c.date, label: `Aportación ${eur.format(c.amount)}`, kind: 'contribution' }));
  (project.obligations || []).forEach(o => events.push({ date: o.dueDate, label: `${o.paid ? 'Pagado' : 'Pendiente'} ${eur.format(o.amount)}`, kind: 'obligation' }));
  if (project.deliveryDate) events.push({ date: project.deliveryDate, label: 'Entrega prevista', kind: 'delivery' });
  const withDates = events.filter(e => e.date).sort((a, b) => a.date.localeCompare(b.date));
  node.className = withDates.length ? 'project-timeline' : 'project-timeline empty-state';
  node.innerHTML = withDates.length ? withDates.map(e => `<div class="project-timeline-year"><div class="project-timeline-marker ${e.kind === 'delivery' ? 'delivery' : ''}"></div>${dateEs(e.date)}<br><small>${escapeHtml(e.label)}</small></div>`).join('') : 'Sin fechas registradas.';
}
function renderProjectContributions(project) {
  const node = $('#projectContributionRows');
  const rows = project.contributions || [];
  node.className = rows.length ? 'scenario-list' : 'scenario-list empty-state';
  node.innerHTML = rows.length ? rows.map(c => `<div class="scenario-card"><strong>${eur.format(c.amount)}</strong><span>${c.date ? dateEs(c.date) : '-'}</span><small>${escapeHtml(c.notes || '')}</small></div>`).join('') : 'Sin aportaciones.';
}
function renderProjectObligations(project) {
  const node = $('#projectObligationRows');
  const rows = project.obligations || [];
  node.className = rows.length ? 'scenario-list' : 'scenario-list empty-state';
  node.innerHTML = rows.length ? rows.map(o => `<div class="scenario-card${o.paid ? ' active' : ''}"><strong>${eur.format(o.amount)}</strong><span>${o.dueDate ? dateEs(o.dueDate) : '-'}</span><small>${o.paid ? 'Pagado' : 'Pendiente'}${o.notes ? ' · ' + escapeHtml(o.notes) : ''}</small><wa-button size="small" appearance="plain" data-toggle-obligation="${o.id}">${o.paid ? 'Marcar pendiente' : 'Marcar pagado'}</wa-button></div>`).join('') : 'Sin compromisos.';
}
function openProjectDetail(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return;
  editingProjectId = id;
  $('#projectDetailTitle').textContent = project.name;
  const totals = projectTotals(project);
  const summaryNode = $('#projectDetailSummary');
  summaryNode.className = 'summary-stack';
  summaryNode.innerHTML = `<strong>Pagado: ${eur.format(totals.paid)}</strong><small>Pendiente: ${eur.format(totals.pending)}</small><small>Hipoteca prevista: ${project.mortgageExpected ? eur.format(project.mortgageExpected) : 'Sin definir'}</small><small>${escapeHtml(ownerLabel(project))}</small>`;
  renderProjectTimeline(project);
  renderProjectContributions(project);
  renderProjectObligations(project);
  $('#projectMortgageTable').className = 'table-wrap empty-state';
  $('#projectMortgageTable').innerHTML = 'Sin cálculo todavía.';
  $('#projectMortgageImpact').className = 'summary-stack empty-state';
  $('#projectMortgageImpact').innerHTML = '';
  $('#projectDetailDialog').open = true;
}
function addProjectContribution() {
  const project = state.projects.find(p => p.id === editingProjectId);
  if (!project) return;
  const amount = parseLocaleNumber($('#projectContributionAmount').value);
  if (!amount) { showNotice('Indica un importe válido.'); return; }
  project.contributions.push({ id: crypto.randomUUID?.() || `contribution-${Date.now()}`, amount, date: $('#projectContributionDate').value || null, notes: cleanText($('#projectContributionNotes').value) });
  project.updatedAt = new Date().toISOString();
  saveState();
  renderProjects();
  openProjectDetail(editingProjectId);
  $('#projectContributionAmount').value = '';
  $('#projectContributionDate').value = '';
  $('#projectContributionNotes').value = '';
  showNotice('Aportación registrada.');
}
function addProjectObligation() {
  const project = state.projects.find(p => p.id === editingProjectId);
  if (!project) return;
  const amount = parseLocaleNumber($('#projectObligationAmount').value);
  if (!amount) { showNotice('Indica un importe válido.'); return; }
  project.obligations.push({ id: crypto.randomUUID?.() || `obligation-${Date.now()}`, amount, dueDate: $('#projectObligationDate').value || null, notes: cleanText($('#projectObligationNotes').value), paid: false });
  project.updatedAt = new Date().toISOString();
  saveState();
  renderProjects();
  openProjectDetail(editingProjectId);
  $('#projectObligationAmount').value = '';
  $('#projectObligationDate').value = '';
  $('#projectObligationNotes').value = '';
  showNotice('Compromiso registrado.');
}
function mortgagePayment(principal, annualRatePct, termYears) {
  const monthlyRate = (annualRatePct / 100) / 12;
  const months = termYears * 12;
  if (!principal || !months) return 0;
  if (!monthlyRate) return principal / months;
  return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}
function mortgageAmortizationTotals(principal, annualRatePct, termYears) {
  const monthlyPayment = mortgagePayment(principal, annualRatePct, termYears);
  const totalPaid = monthlyPayment * termYears * 12;
  const totalInterest = totalPaid - (principal || 0);
  return { monthlyPayment, totalInterest, totalPaid };
}
function mortgageRateScenarios(principal, termYears, rates = [2, 3, 4, 5]) {
  return rates.map(rate => ({ rate, ...mortgageAmortizationTotals(principal, rate, termYears) }));
}
function investmentCapacityImpact(monthlyPayment) {
  const before = state.advisor.savingsCapacity || state.settings.monthlyContribution || 0;
  const after = Math.max(0, before - monthlyPayment);
  return { before, after, delta: after - before };
}
function calcProjectMortgage() {
  const project = state.projects.find(p => p.id === editingProjectId);
  if (!project || !project.mortgageExpected) { showNotice('Indica primero la hipoteca prevista del proyecto.'); return; }
  const term = toNum($('#projectMortgageTerm').value, 25) || 25;
  const scenarios = mortgageRateScenarios(project.mortgageExpected, term);
  const table = $('#projectMortgageTable');
  table.className = 'table-wrap';
  table.innerHTML = `<table><thead><tr><th>Tasa</th><th>Cuota mensual</th><th>Intereses totales</th><th>Total pagado</th></tr></thead><tbody>${scenarios.map(s => `<tr><td>${s.rate} %</td><td>${eur.format(s.monthlyPayment)}</td><td>${eur.format(s.totalInterest)}</td><td>${eur.format(s.totalPaid)}</td></tr>`).join('')}</tbody></table>`;
  const central = scenarios[1] || scenarios[0];
  const impact = investmentCapacityImpact(central.monthlyPayment);
  const impactNode = $('#projectMortgageImpact');
  impactNode.className = 'summary-stack';
  impactNode.innerHTML = `<strong>Impacto sobre capacidad de inversión (a ${central.rate} %)</strong><small>Antes de la hipoteca: ${eur.format(impact.before)}/mes</small><small>Después de la hipoteca: ${eur.format(impact.after)}/mes</small>`;
}
function strategicProgress(position) {
  if (!position.strategic) return null;
  const currentWeight = position.allocation || 0;
  const targetWeight = position.strategic.targetWeight;
  const progressPct = targetWeight ? Math.min(1, currentWeight / targetWeight) : null;
  const targetAmount = position.strategic.targetAmount;
  const suggestedNextContribution = targetAmount ? Math.max(0, targetAmount - (position.marketValue || 0)) : null;
  return { currentWeight, targetWeight, progressPct, suggestedNextContribution };
}
function countryWithholdingRate(country) {
  if (state.taxOverrides && state.taxOverrides[country] !== undefined) return state.taxOverrides[country];
  return DEFAULT_COUNTRY_WITHHOLDING[country] ?? 0;
}
function fiscalSummary() {
  const destinationRate = state.settings.incomeTaxRateEstimate || 0;
  const options = optionsSummary();
  const interestGross = state.assets.filter(a => ['cash', 'money-market', 'treasury'].includes(a.type)).reduce((sum, a) => sum + (a.expectedIncome || 0), 0);
  const rentGross = state.assets.filter(a => !['cash', 'money-market', 'treasury'].includes(a.type)).reduce((sum, a) => sum + (a.expectedIncome || 0), 0);
  const optionsGross = Math.max(0, options.totalPremium);
  const scale = ownerScaleFn(state.viewOwnerId);
  let dividendsGross = 0;
  let dividendsOriginWithheld = 0;
  activePortfolio().forEach(position => {
    const gross = (position.annualDividend || 0) * scale(position);
    dividendsGross += gross;
    dividendsOriginWithheld += gross * countryWithholdingRate(position.country);
  });
  const dividendsAfterOrigin = Math.max(0, dividendsGross - dividendsOriginWithheld);
  const dividendsDestinationWithheld = dividendsAfterOrigin * destinationRate;
  const dividendsNet = dividendsAfterOrigin - dividendsDestinationWithheld;
  const optionsNet = optionsGross * (1 - destinationRate);
  const interestNet = interestGross * (1 - destinationRate);
  const rentNet = rentGross * (1 - destinationRate);
  return {
    destinationRate,
    dividends: { gross: dividendsGross, originWithheld: dividendsOriginWithheld, destinationWithheld: dividendsDestinationWithheld, net: dividendsNet },
    options: { gross: optionsGross, net: optionsNet },
    interest: { gross: interestGross, net: interestNet },
    rent: { gross: rentGross, net: rentNet },
    grossTotal: dividendsGross + optionsGross + interestGross + rentGross,
    netTotal: dividendsNet + optionsNet + interestNet + rentNet
  };
}
function rentasSummary() {
  const fiscal = fiscalSummary();
  const grossAnnual = fiscal.grossTotal;
  const netAnnual = fiscal.netTotal;
  const monthlyNet = netAnnual / 12;
  const targetMonthly = state.settings.targetMonthlyIncome;
  const coverage = targetMonthly ? monthlyNet / targetMonthly : null;
  const composition = [
    { name: 'Dividendos', value: fiscal.dividends.gross },
    { name: 'Opciones', value: fiscal.options.gross },
    { name: 'Intereses y monetarios', value: fiscal.interest.gross },
    { name: 'Alquiler y otros', value: fiscal.rent.gross }
  ].filter(item => item.value > 0);
  const totalComposition = composition.reduce((sum, item) => sum + item.value, 0) || 1;
  composition.forEach(item => { item.weight = item.value / totalComposition; });
  return { grossAnnual, netAnnual, monthlyNet, targetMonthly, coverage, dividends: fiscal.dividends.gross, optionsPremium: fiscal.options.gross, interestIncome: fiscal.interest.gross, rentIncome: fiscal.rent.gross, composition, fiscal };
}
function renderRentas() {
  const summary = rentasSummary();
  if (!$('#rentasGross')) return;
  $('#rentasGross').textContent = eur.format(summary.grossAnnual);
  $('#rentasGrossMeta').textContent = summary.grossAnnual ? 'Dividendos + opciones + intereses + alquiler.' : 'Sin datos';
  $('#rentasNet').textContent = eur.format(summary.netAnnual);
  $('#rentasNetMeta').textContent = state.settings.incomeTaxRateEstimate ? `Tasa estimada aplicada: ${formatPercent(state.settings.incomeTaxRateEstimate)}.` : 'Sin tasa fiscal configurada (0% aplicado).';
  $('#rentasMonthly').textContent = eur.format(summary.monthlyNet);
  $('#rentasMonthlyMeta').textContent = 'Renta neta anual dividida entre 12.';
  $('#rentasGoal').textContent = summary.targetMonthly ? eur.format(summary.targetMonthly) : '--';
  $('#rentasGoalMeta').textContent = summary.targetMonthly ? 'Configurado en Plan.' : 'Configura un objetivo de renta mensual en Plan.';
  $('#rentasCoverage').textContent = summary.coverage !== null ? formatPercent(summary.coverage) : '--';
  $('#rentasCoverageMeta').textContent = summary.coverage !== null ? 'Renta neta mensual sobre el objetivo.' : 'Sin objetivo configurado.';
  renderBars('#rentasComposition', summary.composition);
  const options = optionsSummary();
  const optionsNode = $('#rentasOptions');
  optionsNode.className = 'summary-stack';
  optionsNode.innerHTML = `<strong>Primas netas acumuladas: ${eur.format(options.totalPremium)}</strong><small>Primas de posiciones abiertas: ${eur.format(options.openPremium)}</small><small>Capital comprometido en garantías: ${eur.format(options.totalCollateral)}</small><small>Renta normalizada usada arriba: ${eur.format(summary.optionsPremium)} (no incluye primas negativas)</small>`;
  const rateInput = $('#rentasTaxRate');
  if (rateInput && document.activeElement !== rateInput) rateInput.value = state.settings.incomeTaxRateEstimate !== null ? num.format(state.settings.incomeTaxRateEstimate * 100) : '';
  renderFiscalBreakdown(summary.fiscal);
  renderTaxOverrides();
  renderIncomeGrowthRanking();
}
function renderFiscalBreakdown(fiscal) {
  const node = $('#fiscalBreakdownRows');
  if (!node) return;
  const rows = [
    { label: 'Dividendos', gross: fiscal.dividends.gross, origin: fiscal.dividends.originWithheld, destination: fiscal.dividends.destinationWithheld, net: fiscal.dividends.net },
    { label: 'Opciones', gross: fiscal.options.gross, origin: 0, destination: fiscal.options.gross - fiscal.options.net, net: fiscal.options.net },
    { label: 'Intereses y monetarios', gross: fiscal.interest.gross, origin: 0, destination: fiscal.interest.gross - fiscal.interest.net, net: fiscal.interest.net },
    { label: 'Alquiler y otros', gross: fiscal.rent.gross, origin: 0, destination: fiscal.rent.gross - fiscal.rent.net, net: fiscal.rent.net }
  ].filter(row => row.gross > 0);
  node.innerHTML = rows.length ? rows.map(row => `<tr><td>${escapeHtml(row.label)}</td><td>${eur.format(row.gross)}</td><td>${eur.format(row.origin)}</td><td>${eur.format(row.destination)}</td><td>${eur.format(row.net)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Sin datos</td></tr>';
}
function renderTaxOverrides() {
  const node = $('#taxOverrideRows');
  if (!node) return;
  const countries = [...new Set([...Object.keys(DEFAULT_COUNTRY_WITHHOLDING), ...Object.keys(state.taxOverrides)])].sort();
  const used = countries.filter(country => activePortfolio().some(p => (p.country || '') === country) || state.taxOverrides[country] !== undefined);
  node.innerHTML = used.length ? used.map(country => {
    const isOverride = state.taxOverrides[country] !== undefined;
    const rate = countryWithholdingRate(country);
    return `<tr><td>${escapeHtml(country)}</td><td>${formatPercent(rate)}</td><td>${isOverride ? 'Personalizado' : 'Por defecto'}</td><td>${isOverride ? `<wa-button size="small" appearance="plain" data-delete-tax-override="${escapeHtml(country)}"><wa-icon name="trash"></wa-icon></wa-button>` : ''}</td></tr>`;
  }).join('') : '<tr><td colspan="4" class="empty-cell">Sin datos</td></tr>';
}
function incomeGrowthRanking() {
  const positions = activePortfolio().filter(p => (p.annualDividend || 0) > 0 && p.dividendCagr !== null && p.dividendCagr !== undefined);
  const growing = [...positions].filter(p => p.dividendCagr > 0).sort((a, b) => b.dividendCagr - a.dividendCagr).slice(0, 5);
  const stagnant = [...positions].filter(p => p.dividendCagr <= 0).sort((a, b) => a.dividendCagr - b.dividendCagr).slice(0, 5);
  return { growing, stagnant, withDataCount: positions.length, totalCount: activePortfolio().filter(p => (p.annualDividend || 0) > 0).length };
}
function renderIncomeGrowthRanking() {
  const node = $('#incomeGrowthRanking');
  if (!node) return;
  const ranking = incomeGrowthRanking();
  const renderList = list => list.length ? list.map(p => `<div class="scenario-card"><strong>${escapeHtml(p.name)}</strong><span>${formatPercent(p.dividendCagr)}</span><small>Yield actual: ${formatPercent(p.dividendYield || 0)} | YOC: ${formatPercent(p.yieldOnCost || 0)}</small></div>`).join('') : '<div class="empty-cell">Sin datos</div>';
  if (!ranking.withDataCount) {
    node.className = 'scenario-list empty-state';
    node.innerHTML = 'Ninguna posición importada trae CAGR de dividendo desde DivvyDiary todavía.';
    return;
  }
  node.className = 'dashboard-grid';
  node.innerHTML = `<div><h3>Mayor crecimiento</h3><div class="scenario-list">${renderList(ranking.growing)}</div></div><div><h3>Estancada o decreciente</h3><div class="scenario-list">${renderList(ranking.stagnant)}</div></div>`;
}
function saveTaxOverride(event) {
  event.preventDefault();
  const country = cleanText($('#taxOverrideCountry').value);
  const rate = normalizePercentLike($('#taxOverrideRate').value, null);
  if (!country || rate === null) { showNotice('Indica un país y una retención válida.'); return; }
  state.taxOverrides[country] = rate;
  saveState();
  render();
  $('#taxOverrideForm').reset();
  showNotice('Retención guardada.');
}
function notificationItems() {
  const items = [];
  const today = new Date();
  state.accounts.filter(a => a.quarterlyRule.active).forEach(account => {
    const status = quarterlyRuleStatus(account);
    if (status && !status.qualifies) items.push({ id: `rule-${account.id}`, title: `${account.name}: operación trimestral pendiente`, detail: status.detail, tone: status.tone, go: 'accounts' });
  });
  state.projects.forEach(project => {
    const next = nextCommitment(project);
    if (next && next.dueDate) {
      const daysLeft = Math.round((new Date(next.dueDate) - today) / 86400000);
      items.push({ id: `project-${project.id}-${next.id}`, title: `${project.name}: ${eur.format(next.amount)}`, detail: `Vence en ${daysLeft} días (${dateEs(next.dueDate)})`, tone: daysLeft <= 14 ? 'risk' : 'warn', go: 'accounts' });
    }
  });
  optionsSummary().expiringSoon.forEach(option => {
    const daysLeft = Math.round((new Date(option.expiration) - today) / 86400000);
    items.push({ id: `option-${option.id}`, title: `${option.underlying || option.ticker}: vencimiento de opción`, detail: `Vence en ${daysLeft} días (${dateEs(option.expiration)})`, tone: daysLeft <= 7 ? 'risk' : 'warn', go: 'options' });
  });
  decisionReviewsRows().filter(item => item.reviewDate && item.reviewDate <= today.toISOString().slice(0, 10) && ['pending', 'reviewing'].includes(item.status)).forEach(item => {
    items.push({ id: `review-${item.id}`, title: `Revisión pendiente: ${item.title}`, detail: `Prevista para ${dateEs(item.reviewDate)}`, tone: 'warn', go: 'dashboard' });
  });
  if (activePortfolio().length && !existingSnapshotForMonth()) items.push({ id: 'monthly-close', title: 'Cierre mensual pendiente', detail: 'Guarda el cierre de este mes para alimentar el histórico.', tone: 'warn', go: 'dashboard' });
  const toneRank = { risk: 0, warn: 1, good: 2 };
  return items.sort((a, b) => (toneRank[a.tone] ?? 1) - (toneRank[b.tone] ?? 1));
}
function renderNotifications() {
  const badge = $('#notificationsBadge');
  if (!badge) return;
  const items = notificationItems();
  badge.hidden = !items.length;
  badge.textContent = items.length;
  const node = $('#notificationsResults');
  if (node) {
    node.className = items.length ? 'scenario-list' : 'scenario-list empty-state';
    node.innerHTML = items.length ? items.map((item, i) => `<div class="signal-row signal-${item.tone}" data-notification-item="${i}"><strong>${escapeHtml(item.title)}</strong><span></span><small>${escapeHtml(item.detail)}</small></div>`).join('') : 'Sin pendientes ahora mismo.';
    node._items = items;
  }
}
function globalSearch(query) {
  const q = cleanText(query).toLowerCase();
  if (!q) return [];
  const results = [];
  state.portfolio.forEach(p => { if ([p.name, p.symbol, p.isin].some(v => (v || '').toLowerCase().includes(q))) results.push({ label: p.name, meta: `Posición · ${p.symbol || ''} ${p.isin || ''}`, go: 'portfolio' }); });
  state.accounts.forEach(a => { if (a.name.toLowerCase().includes(q)) results.push({ label: a.name, meta: `Cuenta · ${ACCOUNT_TYPE_LABELS[a.type] || a.type}`, go: 'accounts' }); });
  state.projects.forEach(p => { if (p.name.toLowerCase().includes(q)) results.push({ label: p.name, meta: 'Proyecto', go: 'accounts' }); });
  state.assets.forEach(a => { if (a.name.toLowerCase().includes(q)) results.push({ label: a.name, meta: 'Activo adicional', go: 'settings' }); });
  state.liabilities.forEach(l => { if (l.name.toLowerCase().includes(q)) results.push({ label: l.name, meta: 'Deuda', go: 'settings' }); });
  state.options.forEach(o => { if ([o.underlying, o.ticker].some(v => (v || '').toLowerCase().includes(q))) results.push({ label: o.underlying || o.ticker, meta: `Opción · ${OPTION_STATUS_LABELS[o.status] || o.status}`, go: 'options' }); });
  state.transactions.forEach(t => { if ([t.name, t.symbol, t.isin].some(v => (v || '').toLowerCase().includes(q))) results.push({ label: t.name, meta: `Operación · ${t.type} · ${t.date}`, go: 'portfolio' }); });
  state.recommendations.forEach(r => { if ((r.title || '').toLowerCase().includes(q)) results.push({ label: r.title, meta: 'Recomendación', go: 'dashboard' }); });
  return results.slice(0, 30);
}
function renderGlobalSearchResults(query) {
  const node = $('#globalSearchResults');
  if (!node) return;
  if (!cleanText(query)) { node.className = 'scenario-list empty-state'; node.innerHTML = 'Escribe para buscar en toda la app.'; return; }
  const results = globalSearch(query);
  node.className = results.length ? 'scenario-list' : 'scenario-list empty-state';
  node.innerHTML = results.length ? results.map((r, i) => `<div class="scenario-card" data-search-result="${i}"><strong>${escapeHtml(r.label)}</strong><small>${escapeHtml(r.meta)}</small></div>`).join('') : 'Sin resultados.';
  node._results = results;
}
const ONBOARDING_STEPS =['onboardingStep1', 'onboardingStep2', 'onboardingStep3', 'onboardingStep4', 'onboardingStep5', 'onboardingStep6'];
function goToOnboardingStep(index) {
  const step = Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, index));
  state.onboarding.step = step;
  saveState();
  ONBOARDING_STEPS.forEach((id, i) => { const node = $(`#${id}`); if (node) node.hidden = i !== step; });
  $$('#onboardingDialog .wizard-step').forEach(dot => {
    const dotIndex = Number(dot.dataset.onboardingDot) - 1;
    dot.classList.toggle('active', dotIndex === step);
    dot.classList.toggle('done', dotIndex < step);
  });
  $('#onboardingBackBtn').hidden = step === 0;
  const isLast = step === ONBOARDING_STEPS.length - 1;
  $('#onboardingNextBtn').hidden = isLast;
  $('#onboardingFinishBtn').hidden = !isLast;
}
function openOnboarding() {
  $('#onboardingOwner1').value = ownerName('owner-1');
  $('#onboardingOwner2').value = ownerName('owner-2');
  $('#onboardingOwnerFamily').value = ownerName('owner-family');
  goToOnboardingStep(state.onboarding.step || 0);
  $('#onboardingDialog').open = true;
}
function saveOnboardingOwnerNames() {
  state.ownerNames = migrateOwnerNames({
    'owner-1': $('#onboardingOwner1').value.trim() || DEFAULT_OWNER_NAMES['owner-1'],
    'owner-2': $('#onboardingOwner2').value.trim() || DEFAULT_OWNER_NAMES['owner-2'],
    'owner-family': $('#onboardingOwnerFamily').value.trim() || DEFAULT_OWNER_NAMES['owner-family']
  });
}
function finishOnboarding(skipped) {
  saveOnboardingOwnerNames();
  state.onboarding.completed = !skipped;
  state.onboarding.skipped = skipped;
  saveState();
  render();
  $('#onboardingDialog').open = false;
  if (!skipped) switchView('dashboard');
  showNotice(skipped ? 'Onboarding omitido. Puedes retomarlo cuando quieras desde Datos.' : '¡Listo! Tu Family Office está configurado.');
}
function renderRegulatoryWatch() {
  const node = $('#regulatoryRows');
  if (!node) return;
  const rows = [...state.regulatoryWatch].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  node.className = rows.length ? 'scenario-list' : 'scenario-list empty-state';
  node.innerHTML = rows.length ? rows.map(entry => `<div class="scenario-card"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(REGULATORY_STATUS_LABELS[entry.status] || entry.status)}</span><small>${entry.date ? dateEs(entry.date) : 'Sin fecha'}${entry.impact ? ` · ${escapeHtml(entry.impact)}` : ''}</small>${entry.notes ? `<small>${escapeHtml(entry.notes)}</small>` : ''}${entry.link ? `<small><a href="${escapeHtml(entry.link)}" target="_blank" rel="noopener">Ver enlace</a></small>` : ''}<wa-button size="small" appearance="plain" data-delete-regulatory="${entry.id}"><wa-icon name="trash"></wa-icon></wa-button></div>`).join('') : 'Sin entradas todavía.';
}
function addRegulatoryEntry(event) {
  event.preventDefault();
  const title = cleanText($('#regulatoryTitle').value);
  if (!title) { showNotice('Indica un título.'); return; }
  state.regulatoryWatch.unshift(migrateRegulatoryEntry({
    title,
    date: $('#regulatoryDate').value || null,
    status: $('#regulatoryStatus').value || 'watching',
    impact: $('#regulatoryImpact').value,
    notes: $('#regulatoryNotes').value,
    link: $('#regulatoryLink').value
  }));
  saveState();
  render();
  $('#regulatoryForm').reset();
  $('#regulatoryStatus').value = 'watching';
  showNotice('Seguimiento normativo añadido.');
}
function saveRentasTax(event) {
  event.preventDefault();
  state.settings.incomeTaxRateEstimate = normalizePercentLike($('#rentasTaxRate').value, null);
  saveState();
  render();
  showNotice('Tasa fiscal estimada guardada.');
}
function buildCapitalAllocationProposal(availableCapital) {
  if (!availableCapital || availableCapital <= 0) return { confident: false, reason: 'Indica un importe de capital disponible mayor que cero.' };
  const { liquidityAvailable, requiredLiquidity } = advisorSignals();
  let remaining = availableCapital;
  const allocations = [];
  if (liquidityAvailable < requiredLiquidity) {
    const need = Math.min(remaining, requiredLiquidity - liquidityAvailable);
    if (need > 0) {
      allocations.push({ destination: 'Reserva de liquidez', amount: need, motivo: 'La liquidez disponible tras descontar garantías está por debajo del umbral prudente.', impacto: `Acerca la liquidez al objetivo dinámico de ${eur.format(requiredLiquidity)}.` });
      remaining -= need;
    }
  }
  const strategicPositions = state.portfolio
    .filter(p => p.role === 'core' && p.strategic && p.strategic.targetAmount && ACTIVE_STATUSES.has(normalizeStatus(p.status)))
    .map(p => ({ position: p, progress: strategicProgress(p) }))
    .filter(x => x.progress && x.progress.suggestedNextContribution > 0)
    .sort((a, b) => (b.progress.targetWeight - b.progress.currentWeight) - (a.progress.targetWeight - a.progress.currentWeight));
  if (remaining > 0 && strategicPositions.length) {
    const top = strategicPositions[0];
    const cap = top.position.strategic.targetContribution || top.progress.suggestedNextContribution;
    const amount = Math.min(remaining, top.progress.suggestedNextContribution, cap);
    if (amount > 0) {
      allocations.push({ destination: `${top.position.name} (ETF Core)`, amount, motivo: `El peso de ${top.position.name} está por debajo del objetivo (${formatPercent(top.progress.currentWeight)} de ${formatPercent(top.progress.targetWeight)}).`, impacto: 'Mejora la diversificación y reduce la concentración relativa.' });
      remaining -= amount;
    }
  }
  if (!allocations.length) return { confident: false, reason: 'No se puede determinar una compra concreta con suficiente confianza. Añade posiciones marcadas como ETF Core con un objetivo, o revisa tu liquidez mínima en Asesor.' };
  if (remaining > 0.01) allocations.push({ destination: 'Liquidez / próxima decisión', amount: remaining, motivo: 'El resto no tiene un destino claro con los datos actuales.', impacto: 'Mantiene flexibilidad hasta la próxima revisión.' });
  return { confident: true, availableCapital, allocations };
}
function renderCapitalAllocatorResult() {
  const node = $('#capitalAllocatorResult');
  if (!node) return;
  if (!capitalAllocatorProposal) { node.className = 'scenario-list empty-state'; node.innerHTML = 'Indica el capital disponible y pulsa "Proponer asignación".'; return; }
  if (!capitalAllocatorProposal.confident) { node.className = 'scenario-list empty-state'; node.innerHTML = escapeHtml(capitalAllocatorProposal.reason); return; }
  node.className = 'scenario-list';
  node.innerHTML = capitalAllocatorProposal.allocations.map((a, i) => `<div class="scenario-card"><strong>${escapeHtml(a.destination)}</strong><span>${eur.format(a.amount)}</span><small>Motivo: ${escapeHtml(a.motivo)}</small><small>Impacto: ${escapeHtml(a.impacto)}</small><div class="recommendation-actions"><wa-button size="small" appearance="plain" data-allocator-action="accept" data-allocator-index="${i}">Aceptar</wa-button><wa-button size="small" appearance="plain" data-allocator-action="postpone" data-allocator-index="${i}">Posponer</wa-button><wa-button size="small" appearance="plain" data-allocator-action="reject" data-allocator-index="${i}">Rechazar</wa-button></div></div>`).join('');
}
function runCapitalAllocator() {
  const amount = parseLocaleNumber($('#capitalAllocatorAmount').value);
  capitalAllocatorProposal = buildCapitalAllocationProposal(amount);
  renderCapitalAllocatorResult();
}
function resolveCapitalAllocation(index, action) {
  if (!capitalAllocatorProposal || !capitalAllocatorProposal.confident) return;
  const allocation = capitalAllocatorProposal.allocations[index];
  if (!allocation) return;
  if (action === 'reject') { showNotice('Propuesta descartada.'); allocation.resolved = true; renderCapitalAllocatorResult(); return; }
  if (action === 'postpone') { showNotice('Propuesta pospuesta.'); return; }
  const decidedAt = new Date().toISOString();
  const review = migrateDecisionReview({
    title: `Asignación de capital: ${allocation.destination}`,
    category: 'Asignación de capital',
    phase: '3m',
    actionLabel: eur.format(allocation.amount),
    status: 'pending',
    reason: allocation.motivo,
    expectedOutcome: allocation.impacto,
    createdAt: decidedAt,
    decidedAt,
    reviewDate: new Date(Date.now() + 90 * 86400000).toISOString()
  });
  state.decisionReviews = [review, ...state.decisionReviews];
  saveState();
  render();
  showNotice('Decisión registrada en el seguimiento.');
}
function saveFinancialSettings(event) {
  event.preventDefault();
  state.settings = {
    ...state.settings,
    monthlyExpense: parseLocaleNumber($('#monthlyExpenseInput').value),
    targetAnnualDividends: parseLocaleNumber($('#targetDividendInput').value),
    targetNetWorth: parseLocaleNumber($('#targetNetWorthInput').value),
    monthlyContribution: parseLocaleNumber($('#monthlyContributionInput').value),
    targetMonthlyIncome: parseLocaleNumber($('#targetMonthlyIncomeInput').value)
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
      registration.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      });
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
$('#ownerViewSelect')?.addEventListener('change', event => {
  const value = event.target.value;
  state.viewOwnerId = value === 'all' || OWNER_IDS.includes(value) ? value : 'all';
  saveState();
  render();
  applyDefaultOwnerToEntryForms();
});
ENTRY_OWNER_SELECT_IDS.forEach(id => {
  $(`#${id}`)?.addEventListener('change', event => applyOwnerAccentClass(event.target, event.target.value));
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
$('#transactionsImportBtn')?.addEventListener('click', openTransactionsImport);
$('#chooseTransactionsBtn')?.addEventListener('click', () => $('#transactionsCsvFile').click());
$('#cancelTransactionsBtn')?.addEventListener('click', () => { $('#transactionsDialog').open = false; pendingTransactionImport = null; });
$('#confirmTransactionsBtn')?.addEventListener('click', confirmTransactionsImport);
$('#transactionsCsvFile')?.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (file) parseTransactionsCsv(file);
});
const transactionsDropZone = $('#transactionsDropZone');
if (transactionsDropZone) {
  ['dragenter', 'dragover'].forEach(type => transactionsDropZone.addEventListener(type, event => {
    event.preventDefault();
    transactionsDropZone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(type => transactionsDropZone.addEventListener(type, event => {
    event.preventDefault();
    transactionsDropZone.classList.remove('dragover');
  }));
  transactionsDropZone.addEventListener('drop', event => {
    const file = event.dataTransfer?.files?.[0];
    if (file) parseTransactionsCsv(file);
  });
}
$('#undoImportBtn')?.addEventListener('click', undoLastImport);
$('#undoImportSettingsBtn')?.addEventListener('click', undoLastImport);
$('#snapshotBtn')?.addEventListener('click', openMonthlyClose);
$('#historySnapshotBtn')?.addEventListener('click', openMonthlyClose);
$('#cancelMonthlyCloseBtn')?.addEventListener('click', () => { $('#monthlyCloseDialog').open = false; });
$('#confirmMonthlyCloseBtn')?.addEventListener('click', confirmMonthlyClose);
$('#monthlyCloseNextBtn')?.addEventListener('click', () => goToMonthlyCloseStep(monthlyCloseStepIndex + 1));
$('#monthlyCloseBackBtn')?.addEventListener('click', () => goToMonthlyCloseStep(monthlyCloseStepIndex - 1));
$('#startOnboardingBtn')?.addEventListener('click', openOnboarding);
$('#onboardingSkipBtn')?.addEventListener('click', () => finishOnboarding(true));
$('#onboardingFinishBtn')?.addEventListener('click', () => finishOnboarding(false));
$('#onboardingNextBtn')?.addEventListener('click', () => { saveOnboardingOwnerNames(); goToOnboardingStep(state.onboarding.step + 1); });
$('#onboardingBackBtn')?.addEventListener('click', () => goToOnboardingStep(state.onboarding.step - 1));
$('#onboardingImportBtn')?.addEventListener('click', () => { $('#onboardingDialog').open = false; openImport(); });
$$('[data-onboarding-go]').forEach(button => button.addEventListener('click', () => { $('#onboardingDialog').open = false; switchView(button.dataset.onboardingGo); }));
$('#quickActionsFab')?.addEventListener('click', event => { event.stopPropagation(); const menu = $('#quickActionsMenu'); menu.hidden = !menu.hidden; });
$('#globalSearchBtn')?.addEventListener('click', () => { $('#globalSearchInput').value = ''; renderGlobalSearchResults(''); $('#globalSearchDialog').open = true; setTimeout(() => $('#globalSearchInput')?.focus(), 50); });
$('#globalSearchCloseBtn')?.addEventListener('click', () => { $('#globalSearchDialog').open = false; });
$('#globalSearchInput')?.addEventListener('input', event => renderGlobalSearchResults(event.target.value));
$('#notificationsBtn')?.addEventListener('click', () => { renderNotifications(); $('#notificationsDialog').open = true; });
$('#notificationsCloseBtn')?.addEventListener('click', () => { $('#notificationsDialog').open = false; });
$('#monthlyCloseImportPortfolioBtn')?.addEventListener('click', () => { $('#monthlyCloseDialog').open = false; openImport(); });
$('#monthlyCloseImportTxBtn')?.addEventListener('click', () => { $('#monthlyCloseDialog').open = false; openTransactionsImport(); });
$('#monthlyCloseGoAssetsBtn')?.addEventListener('click', () => { $('#monthlyCloseDialog').open = false; switchView('settings'); });
$('#optionActionType')?.addEventListener('change', updateOptionActionFieldsVisibility);
['#optionActionPremium', '#optionActionFees', '#rollPremiumPerShare', '#rollContracts', '#rollFees'].forEach(selector => {
  $(selector)?.addEventListener('input', () => { if ($('#optionActionType')?.value === 'roll') updateRollPreview(); });
});
$('#cancelOptionActionBtn')?.addEventListener('click', () => { $('#optionActionDialog').open = false; managingOptionId = null; });
$('#confirmOptionActionBtn')?.addEventListener('click', applyOptionAction);
document.addEventListener('click', event => {
  const manageBtn = event.target.closest('[data-manage-option]');
  if (manageBtn) openOptionActionDialog(manageBtn.dataset.manageOption);
});
$('#assetForm')?.addEventListener('submit', addAsset);
$('#liabilityForm')?.addEventListener('submit', addLiability);
bindOwnershipToggle('asset');
bindOwnershipToggle('liability');
$('#settingsForm')?.addEventListener('submit', saveFinancialSettings);
$('#ownersForm')?.addEventListener('submit', saveOwnerNames);
$('#portfolioEstimateForm')?.addEventListener('submit', savePortfolioEstimate);
$('#exportJsonBtn')?.addEventListener('click', exportJson);
$('#restoreJsonBtn')?.addEventListener('click', () => $('#jsonFile').click());
$('#jsonFile')?.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (file) restoreJson(file);
  event.target.value = '';
});
$('#markdownBtn')?.addEventListener('click', () => { markdown().catch(error => { console.error(error); showNotice(`No se pudo generar el informe: ${error.message}`); }); });
$('#clearBtn')?.addEventListener('click', () => {
  askConfirm('Se borraran cartera, cierres, activos, deudas, informes y configuración local. Esta acción no se puede deshacer.', () => {
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
$('#positionRole')?.addEventListener('change', () => { const position = state.portfolio.find(item => item.id === editingPositionId); if (position) updatePositionStrategicBlock(position); });
$('#accountForm')?.addEventListener('submit', addAccount);
$('#rentasTaxForm')?.addEventListener('submit', saveRentasTax);
$('#taxOverrideForm')?.addEventListener('submit', saveTaxOverride);
$('#optionsBenchmarkForm')?.addEventListener('submit', saveOptionsBenchmarkRate);
$('#regulatoryForm')?.addEventListener('submit', addRegulatoryEntry);
$('#projectForm')?.addEventListener('submit', addProject);
bindOwnershipToggle('project');
$('#accountDetailSaveBtn')?.addEventListener('click', saveAccountDetail);
$('#accountDetailDeleteBtn')?.addEventListener('click', () => {
  if (!editingAccountId) return;
  const account = state.accounts.find(a => a.id === editingAccountId);
  if (!account) return;
  askConfirm(`Eliminar la cuenta ${account.name}. Los elementos asociados pasarán a "Sin asignar".`, () => {
    state.accounts = state.accounts.filter(a => a.id !== editingAccountId);
    [state.portfolio, state.options, state.assets, state.liabilities, state.transactions].forEach(list => list.forEach(record => { if (record.accountId === editingAccountId) record.accountId = UNASSIGNED_ACCOUNT_ID; }));
    saveState();
    render();
    $('#accountDetailDialog').open = false;
    editingAccountId = null;
    showNotice('Cuenta eliminada.');
  });
});
$('#projectDetailCloseBtn')?.addEventListener('click', () => { $('#projectDetailDialog').open = false; editingProjectId = null; });
$('#projectDetailDeleteBtn')?.addEventListener('click', () => {
  if (!editingProjectId) return;
  const project = state.projects.find(p => p.id === editingProjectId);
  if (!project) return;
  askConfirm(`Eliminar el proyecto ${project.name}.`, () => {
    state.projects = state.projects.filter(p => p.id !== editingProjectId);
    saveState();
    render();
    $('#projectDetailDialog').open = false;
    editingProjectId = null;
    showNotice('Proyecto eliminado.');
  });
});
$('#projectAddContributionBtn')?.addEventListener('click', addProjectContribution);
$('#projectAddObligationBtn')?.addEventListener('click', addProjectObligation);
$('#projectMortgageCalcBtn')?.addEventListener('click', calcProjectMortgage);
$$('.account-sub-nav-item').forEach(button => button.addEventListener('click', () => {
  $$('.account-subview').forEach(view => view.classList.toggle('active', view.id === button.dataset.accountSubview));
  $$('.account-sub-nav-item').forEach(btn => btn.classList.toggle('active', btn === button));
}));
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
$$('.nav-item[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
document.addEventListener('click', event => {
  const goButton = event.target.closest('[data-go]');
  if (goButton) { switchView(goButton.dataset.go); return; }
  const closeMonthButton = event.target.closest('[data-checklist-action="close-month"]');
  if (closeMonthButton) { openMonthlyClose(); return; }
  const openAccountButton = event.target.closest('[data-open-account]');
  if (openAccountButton) { openAccountDetail(openAccountButton.dataset.openAccount); return; }
  const openProjectButton = event.target.closest('[data-open-project]');
  if (openProjectButton) { openProjectDetail(openProjectButton.dataset.openProject); return; }
  const allocatorButton = event.target.closest('[data-allocator-action]');
  if (allocatorButton) { resolveCapitalAllocation(Number(allocatorButton.dataset.allocatorIndex), allocatorButton.dataset.allocatorAction); return; }
  const deleteTaxOverrideButton = event.target.closest('[data-delete-tax-override]');
  if (deleteTaxOverrideButton) {
    delete state.taxOverrides[deleteTaxOverrideButton.dataset.deleteTaxOverride];
    saveState();
    render();
    return;
  }
  const deleteRegulatoryButton = event.target.closest('[data-delete-regulatory]');
  if (deleteRegulatoryButton) {
    state.regulatoryWatch = state.regulatoryWatch.filter(entry => entry.id !== deleteRegulatoryButton.dataset.deleteRegulatory);
    saveState();
    render();
    return;
  }
  const quickActionButton = event.target.closest('[data-quick-action]');
  if (quickActionButton) {
    $('#quickActionsMenu').hidden = true;
    const action = quickActionButton.dataset.quickAction;
    if (action === 'income') { switchView('settings'); $('#assetExpectedIncome')?.focus(); }
    else if (action === 'asset') { switchView('settings'); $('#assetName')?.focus(); }
    else if (action === 'liability') { switchView('settings'); $('#liabilityName')?.focus(); }
    else if (action === 'transaction') { openTransactionsImport(); }
    else if (action === 'option') { switchView('options'); switchOptionsSubview('optionsAnalyzer'); }
    else if (action === 'commitment') { switchView('accounts'); $('[data-account-subview="accountsProyectos"]')?.click(); }
    else if (action === 'close') { openMonthlyClose(); }
    return;
  }
  const notificationItem = event.target.closest('[data-notification-item]');
  if (notificationItem) {
    const items = $('#notificationsResults')._items || [];
    const item = items[Number(notificationItem.dataset.notificationItem)];
    if (item) { $('#notificationsDialog').open = false; switchView(item.go); }
    return;
  }
  const searchResultCard = event.target.closest('[data-search-result]');
  if (searchResultCard) {
    const results = $('#globalSearchResults')._results || [];
    const result = results[Number(searchResultCard.dataset.searchResult)];
    if (result) { $('#globalSearchDialog').open = false; switchView(result.go); }
    return;
  }
  const quickActionsWrap = event.target.closest('.quick-actions-wrap');
  const quickActionsMenu = $('#quickActionsMenu');
  if (!quickActionsWrap && quickActionsMenu && !quickActionsMenu.hidden) quickActionsMenu.hidden = true;
  const toggleObligationButton = event.target.closest('[data-toggle-obligation]');
  if (toggleObligationButton) {
    const project = state.projects.find(p => p.id === editingProjectId);
    const obligation = project?.obligations.find(o => o.id === toggleObligationButton.dataset.toggleObligation);
    if (obligation) {
      obligation.paid = !obligation.paid;
      project.updatedAt = new Date().toISOString();
      saveState();
      renderProjects();
      openProjectDetail(editingProjectId);
    }
  }
});
$$('.sub-nav-item').forEach(button => button.addEventListener('click', () => switchOptionsSubview(button.dataset.subview)));
['#searchInput', '#sectorFilter', '#countryFilter', '#currencyFilter', '#statusFilter'].forEach(selector => {
  $(selector)?.addEventListener('input', renderPortfolio);
  $(selector)?.addEventListener('change', renderPortfolio);
});
['#historyRangePreset', '#historyFromYear', '#historyToYear'].forEach(selector => {
  $(selector)?.addEventListener('change', event => {
    if (selector === '#historyRangePreset') historyFilterState.preset = event.target.value || 'all';
    if (selector === '#historyFromYear') historyFilterState.fromYear = event.target.value || '';
    if (selector === '#historyToYear') historyFilterState.toYear = event.target.value || '';
    renderHistory();
  });
});
function applyPlanFormValues() {
  ensurePlanState();
  const targetType = ['fi', 'networth', 'dividends', 'monthlyIncome'].includes($('#planTargetType')?.value) ? $('#planTargetType').value : state.plan.targetType;
  const enteredValue = parseLocaleNumber($('#planTargetValue')?.value);
  state.plan = {
    targetType,
    targetValue: enteredValue === null ? null : (targetType === 'monthlyIncome' ? enteredValue * 12 : enteredValue),
    monthlyContribution: parseLocaleNumber($('#planMonthlyContribution')?.value),
    monthlyExpense: parseLocaleNumber($('#planMonthlyExpense')?.value),
    horizonYears: toNum($('#planHorizonYears')?.value, state.plan.horizonYears) || state.plan.horizonYears
  };
  saveState();
  renderPlan();
  showNotice('Previsión actualizada.');
}
['#planTargetType', '#planTargetValue', '#planMonthlyContribution', '#planMonthlyExpense', '#planHorizonYears'].forEach(selector => {
  $(selector)?.addEventListener('change', applyPlanFormValues);
});
$('#planSimulateBtn')?.addEventListener('click', applyPlanFormValues);
$('#macroScenarioSelect')?.addEventListener('change', renderMacroScenario);
$('#macroToggleAssumptionsBtn')?.addEventListener('click', () => { const node = $('#macroAssumptions'); node.hidden = !node.hidden; });
$('#openCapitalAllocatorBtn')?.addEventListener('click', () => { capitalAllocatorProposal = null; $('#capitalAllocatorAmount').value = ''; renderCapitalAllocatorResult(); $('#capitalAllocatorDialog').open = true; });
$('#capitalAllocatorCloseBtn')?.addEventListener('click', () => { $('#capitalAllocatorDialog').open = false; });
$('#capitalAllocatorRunBtn')?.addEventListener('click', runCapitalAllocator);
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
  const deleteEstimateButton = event.target.closest('[data-delete-estimate]');
  if (deleteEstimateButton) {
    const ownerId = deleteEstimateButton.dataset.deleteEstimate;
    if (!state.portfolioEstimates[ownerId]) return;
    askConfirm(`Eliminar la estimación de cartera de ${ownerName(ownerId)}.`, () => {
      delete state.portfolioEstimates[ownerId];
      saveState();
      render();
      showNotice('Estimación eliminada.');
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






const DEMO_TRANSACTIONS = [
  { id: 'tx-demo-1', datetime: '2025-08-14T10:00:00.000Z', type: 'BUY', isin: 'NL0010273215', symbol: 'ASML', name: 'ASML Holding NV', quantity: 4, price: 612, amount: 2448, currency: 'EUR', fees: 2.5, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-2', datetime: '2025-09-18T10:00:00.000Z', type: 'BUY', isin: 'US00287Y1091', symbol: 'ABBV', name: 'AbbVie Inc', quantity: 20, price: 148.7, amount: 2974, currency: 'EUR', fees: 3, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-3', datetime: '2025-10-31T10:00:00.000Z', type: 'BUY', isin: 'ES0167050915', symbol: 'ACS', name: 'ACS Actividades de Construcción y Servicios SA', quantity: 90, price: 35.2, amount: 3168, currency: 'EUR', fees: 2.8, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-4', datetime: '2025-12-12T10:00:00.000Z', type: 'BUY', isin: 'ES0130960018', symbol: 'ENG', name: 'Enagas SA', quantity: 160, price: 14.3, amount: 2288, currency: 'EUR', fees: 2.2, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-5', datetime: '2026-01-16T10:00:00.000Z', type: 'BUY', isin: 'US92826C8394', symbol: 'V', name: 'Visa Inc', quantity: 12, price: 248, amount: 2976, currency: 'EUR', fees: 3.5, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-6', datetime: '2026-02-27T10:00:00.000Z', type: 'BUY', isin: 'GB0002875804', symbol: 'BATS', name: 'British American Tobacco PLC', quantity: 120, price: 31.1, amount: 3732, currency: 'EUR', fees: 3.1, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-7', datetime: '2026-04-24T10:00:00.000Z', type: 'SELL', isin: 'GB0002875804', symbol: 'BATS', name: 'British American Tobacco PLC', quantity: 40, price: 33.2, amount: 1328, currency: 'EUR', fees: 2.4, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-8', datetime: '2026-05-28T10:00:00.000Z', type: 'BUY', isin: 'US00287Y1091', symbol: 'ABBV', name: 'AbbVie Inc', quantity: 15, price: 163.2, amount: 2448, currency: 'EUR', fees: 3, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-9', datetime: '2026-06-26T10:00:00.000Z', type: 'BUY', isin: 'ES0167050915', symbol: 'ACS', name: 'ACS Actividades de Construcción y Servicios SA', quantity: 70, price: 42.8, amount: 2996, currency: 'EUR', fees: 2.8, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-10', datetime: '2026-07-19T10:00:00.000Z', type: 'SELL', isin: 'ES0130960018', symbol: 'ENG', name: 'Enagas SA', quantity: 60, price: 12.9, amount: 774, currency: 'EUR', fees: 2, taxes: 0, portfolio: 'Demo' }
];
function defaultTransaction() {
  return { id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, datetime: new Date().toISOString(), date: new Date().toISOString().slice(0, 10), month: new Date().toISOString().slice(0, 7), type: 'BUY', isin: '', symbol: '', name: '', quantity: null, price: null, amount: null, currency: 'EUR', fees: 0, taxes: 0, costs: 0, portfolio: '', accountId: '', totalCash: null, importMeta: null, raw: null, dedupeKey: '' };
}
function migrateTransaction(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const datetime = entry.datetime || entry.date || new Date().toISOString();
  const quantity = toNum(entry.quantity, null);
  const amount = toNum(entry.amount, null);
  const fees = toNum(entry.fees, 0) || 0;
  const taxes = toNum(entry.taxes, 0) || 0;
  const type = cleanText(entry.type).toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
  const dedupeKey = cleanText(entry.dedupeKey) || cleanText(entry.id) || `${datetime}|${normalizeIsin(entry.isin)}|${type}|${quantity ?? ''}|${amount ?? ''}`;
  return { ...defaultTransaction(), ...entry, id: cleanText(entry.id) || dedupeKey, datetime, date: String(datetime).slice(0, 10), month: String(datetime).slice(0, 7), type, isin: normalizeIsin(entry.isin), symbol: cleanText(entry.symbol).toUpperCase(), name: cleanText(entry.name || entry.symbol || 'Operación sin nombre'), quantity, price: toNum(entry.price, null), amount, currency: normalizeCurrency(entry.currency), fees, taxes, costs: fees + taxes, portfolio: cleanText(entry.portfolio), accountId: cleanText(entry.accountId) || UNASSIGNED_ACCOUNT_ID, totalCash: toNum(entry.totalCash, amount === null ? null : (type === 'BUY' ? amount + fees + taxes : amount - fees - taxes)), importMeta: entry.importMeta && typeof entry.importMeta === 'object' ? entry.importMeta : null, raw: entry.raw && typeof entry.raw === 'object' ? entry.raw : null, dedupeKey };
}
function defaultOptionPosition() {
  const now = new Date().toISOString();
  return {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    underlying: '', ticker: '', isin: '',
    optionType: 'put', side: 'sell', strategy: 'cash-secured-put', objective: 'income',
    openedAt: now.slice(0, 10), expiration: '',
    strike: null, contracts: 1, multiplier: 100, premiumPerShare: null, fees: 0, collateral: null,
    currency: 'EUR', fxRateToEur: 1,
    underlyingPriceAtOpen: null, impliedVolatility: null, delta: null,
    earningsDate: '', exDividendDate: '', expectedDividendPerShare: null,
    sharesInPortfolio: null, avgCostBasis: null, sector: '', country: '',
    limitPrice: null, plannedOpenDate: '',
    marginRequired: null, acceptsUncoveredRisk: false,
    status: 'open',
    thesis: '', risks: '', exitPlan: '', assignmentAccepted: true,
    linkedPositionId: '', rollFromId: '', rolledToId: '',
    closedAt: '', closePremiumPerShare: null, closeFees: 0, closeReason: '', realizedResult: null,
    lastScore: null, lastScoreBreakdown: null,
    notes: '', ownership: defaultOwnership(), accountId: UNASSIGNED_ACCOUNT_ID,
    createdAt: now, updatedAt: now
  };
}
function migrateOptionPosition(option) {
  if (!option || typeof option !== 'object') return null;
  const base = defaultOptionPosition();
  const optionType = cleanText(option.optionType).toLowerCase() === 'call' ? 'call' : 'put';
  const side = cleanText(option.side).toLowerCase() === 'buy' ? 'buy' : 'sell';
  const statusValue = cleanText(option.status).toLowerCase();
  const status = OPTION_STATUSES.includes(statusValue) ? statusValue : 'open';
  const objective = OPTION_OBJECTIVES.includes(cleanText(option.objective)) ? cleanText(option.objective) : (cleanText(option.objective) === 'acquire' ? 'buy_lower' : base.objective);
  return {
    ...base, ...option,
    id: cleanText(option.id) || base.id,
    underlying: cleanText(option.underlying), ticker: cleanText(option.ticker).toUpperCase(), isin: normalizeIsin(option.isin) || cleanText(option.isin).toUpperCase(),
    optionType, side, strategy: cleanText(option.strategy) || base.strategy, objective,
    openedAt: normalizeDate(option.openedAt) || cleanText(option.openedAt) || base.openedAt,
    expiration: normalizeDate(option.expiration) || cleanText(option.expiration),
    strike: toNum(option.strike, null), contracts: toNum(option.contracts, 1) || 1, multiplier: toNum(option.multiplier, 100) || 100,
    premiumPerShare: toNum(option.premiumPerShare, null), fees: toNum(option.fees, 0) || 0, collateral: toNum(option.collateral, null),
    currency: normalizeCurrency(option.currency), fxRateToEur: toNum(option.fxRateToEur, 1) || 1,
    underlyingPriceAtOpen: toNum(option.underlyingPriceAtOpen, null), impliedVolatility: toNum(option.impliedVolatility, null), delta: toNum(option.delta, null),
    earningsDate: normalizeDate(option.earningsDate), exDividendDate: normalizeDate(option.exDividendDate), expectedDividendPerShare: toNum(option.expectedDividendPerShare, null),
    sharesInPortfolio: toNum(option.sharesInPortfolio, null), avgCostBasis: toNum(option.avgCostBasis, null), sector: cleanText(option.sector), country: cleanText(option.country),
    limitPrice: toNum(option.limitPrice, null), plannedOpenDate: normalizeDate(option.plannedOpenDate),
    marginRequired: toNum(option.marginRequired, null), acceptsUncoveredRisk: Boolean(option.acceptsUncoveredRisk),
    status,
    thesis: cleanText(option.thesis), risks: cleanText(option.risks), exitPlan: cleanText(option.exitPlan), assignmentAccepted: option.assignmentAccepted !== false,
    linkedPositionId: cleanText(option.linkedPositionId), rollFromId: cleanText(option.rollFromId), rolledToId: cleanText(option.rolledToId),
    closedAt: normalizeDate(option.closedAt), closePremiumPerShare: toNum(option.closePremiumPerShare, null), closeFees: toNum(option.closeFees, 0) || 0, closeReason: cleanText(option.closeReason), realizedResult: toNum(option.realizedResult, null),
    lastScore: toNum(option.lastScore, null), lastScoreBreakdown: Array.isArray(option.lastScoreBreakdown) ? option.lastScoreBreakdown : null,
    notes: cleanText(option.notes), ownership: migrateOwnership(option.ownership),
    accountId: cleanText(option.accountId) || UNASSIGNED_ACCOUNT_ID,
    createdAt: option.createdAt || base.createdAt, updatedAt: option.updatedAt || base.updatedAt
  };
}
function optionDerived(option) {
  const contracts = option.contracts || 0;
  const multiplier = option.multiplier || 100;
  const grossPremium = (option.premiumPerShare || 0) * contracts * multiplier;
  const netPremium = grossPremium - (option.fees || 0);
  const capitalCommitted = option.collateral !== null && option.collateral !== undefined ? option.collateral : (option.strike || 0) * contracts * multiplier;
  const effectiveEntry = option.optionType === 'put' && contracts * multiplier ? (option.strike || 0) - (netPremium / (contracts * multiplier)) : null;
  return { grossPremium, netPremium, capitalCommitted, effectiveEntry };
}
function optionDaysToExpiration(option, fromDate = new Date()) {
  if (!option.expiration) return null;
  return Math.ceil((new Date(`${option.expiration}T00:00:00`) - fromDate) / 86400000);
}
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
function normalCdf(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function blackScholesItmProbability(optionType, spot, strike, days, iv, riskFreeRate = 0) {
  if (!spot || !strike || !days || days <= 0 || !iv || iv <= 0) return null;
  const t = days / 365;
  const d1 = (Math.log(spot / strike) + (riskFreeRate + (iv * iv) / 2) * t) / (iv * Math.sqrt(t));
  const d2 = d1 - iv * Math.sqrt(t);
  return optionType === 'call' ? normalCdf(d2) : normalCdf(-d2);
}
function findLinkedPortfolioPosition(option) {
  if (option.isin) { const byIsin = state.portfolio.find(position => position.isin === option.isin); if (byIsin) return byIsin; }
  if (option.ticker) { const byTicker = state.portfolio.find(position => position.symbol === option.ticker); if (byTicker) return byTicker; }
  return null;
}
function optionAssignmentSharesInfo(option) {
  const linked = findLinkedPortfolioPosition(option);
  if (linked) return { shares: linked.quantity || 0, avgCost: linked.averagePrice || 0, linked };
  return { shares: toNum(option.sharesInPortfolio, 0) || 0, avgCost: toNum(option.avgCostBasis, 0) || 0, linked: null };
}
function computeOptionAnalysis(option) {
  const contracts = option.contracts || 0;
  const multiplier = option.multiplier || 100;
  const shares = contracts * multiplier;
  const premiumPerShare = option.premiumPerShare || 0;
  const grossPremium = premiumPerShare * shares;
  const netPremium = grossPremium - (option.fees || 0);
  const netPremiumPerShare = shares ? netPremium / shares : 0;
  const strike = option.strike || 0;
  const spot = option.underlyingPriceAtOpen || null;
  const days = optionDaysToExpiration(option);
  const isPut = option.optionType === 'put';
  const isCall = option.optionType === 'call';
  const isSell = option.side === 'sell';
  const isBuy = option.side === 'buy';
  const covered = option.strategy === 'covered-call';
  const analysis = { shares, grossPremium, netPremium, netPremiumPerShare, days };

  if (spot && strike) {
    const itm = isPut ? spot < strike : spot > strike;
    const atm = Math.abs(spot - strike) / spot < 0.005;
    analysis.moneyness = atm ? 'ATM' : (itm ? 'ITM' : 'OTM');
    analysis.distanceToStrike = (spot - strike) / spot;
  }

  if (option.delta !== null && option.delta !== undefined) {
    analysis.probability = { value: Math.min(1, Math.abs(option.delta)), method: 'delta', label: 'Aproximada a partir del delta' };
  } else {
    const bs = blackScholesItmProbability(option.optionType, spot, strike, days, option.impliedVolatility);
    analysis.probability = bs === null ? null : { value: bs, method: 'black-scholes', label: 'Estimación teórica (Black-Scholes)' };
  }

  if (isPut && isSell) {
    const capitalCommittedGross = strike * shares;
    const capitalCommittedNet = capitalCommittedGross - netPremium;
    const effectiveEntry = shares ? strike - netPremiumPerShare : null;
    analysis.capitalCommittedGross = capitalCommittedGross;
    analysis.capitalCommittedNet = capitalCommittedNet;
    analysis.effectiveEntry = effectiveEntry;
    analysis.breakeven = effectiveEntry;
    if (spot) analysis.discountVsCurrent = (spot - effectiveEntry) / spot;
    analysis.premiumReturnGross = capitalCommittedGross ? netPremium / capitalCommittedGross : null;
    analysis.premiumReturnNet = capitalCommittedNet ? netPremium / capitalCommittedNet : null;
    if (days && days > 0) {
      analysis.annualizedReturnGross = analysis.premiumReturnGross === null ? null : analysis.premiumReturnGross * 365 / days;
      analysis.annualizedReturnNet = analysis.premiumReturnNet === null ? null : analysis.premiumReturnNet * 365 / days;
    }
    const { shares: existingShares, avgCost } = optionAssignmentSharesInfo(option);
    const metrics = fullMetrics();
    const newShares = existingShares + shares;
    const referencePrice = spot || strike;
    const newAvgCost = newShares ? ((existingShares * avgCost) + (strike * shares)) / newShares : strike;
    const newPositionValue = newShares * referencePrice;
    const priorPositionValue = existingShares * referencePrice;
    const newPortfolioValue = metrics.value - priorPositionValue + newPositionValue;
    analysis.assignment = {
      sharesAssignable: shares,
      totalCost: strike * shares,
      newShares, newAvgCost, newPositionValue,
      newWeight: newPortfolioValue ? newPositionValue / newPortfolioValue : null,
      priorWeight: metrics.value ? priorPositionValue / metrics.value : null,
      liquidityConsumedPct: metrics.liquidity ? capitalCommittedGross / metrics.liquidity : null,
      liquidityRemaining: metrics.liquidity - capitalCommittedGross
    };
    const { liquidityAvailable } = advisorSignals();
    analysis.coverage = {
      requiredLiquidity: capitalCommittedGross,
      availableLiquidity: liquidityAvailable,
      coveragePct: capitalCommittedGross ? Math.min(1, liquidityAvailable / capitalCommittedGross) : null,
      deficit: Math.max(0, capitalCommittedGross - liquidityAvailable)
    };
  }

  if (isCall && isSell && covered) {
    const { shares: existingShares, avgCost } = optionAssignmentSharesInfo(option);
    const coveredShares = Math.min(shares, existingShares);
    const uncoveredShares = Math.max(0, shares - existingShares);
    analysis.sharesCovered = shares;
    analysis.uncoveredShares = uncoveredShares;
    analysis.pctPositionCovered = existingShares ? Math.min(1, shares / existingShares) : null;
    analysis.effectiveSalePrice = strike + netPremiumPerShare;
    analysis.capitalGainPotential = (strike - avgCost) * coveredShares;
    analysis.totalPotentialGain = analysis.capitalGainPotential + netPremium;
    const costBasis = avgCost * coveredShares;
    analysis.maxReturnOnCost = costBasis ? analysis.totalPotentialGain / costBasis : null;
    analysis.annualizedPremiumReturn = (days && days > 0 && costBasis) ? (netPremium / costBasis) * 365 / days : null;
    if (spot) analysis.upsideGivenUpPct = spot < strike ? null : (spot - strike) / spot;
    if (option.exDividendDate && option.expiration) {
      analysis.dividendAtRisk = option.exDividendDate <= option.expiration && (spot ? spot >= strike : false);
    }
    const intrinsic = spot ? Math.max(0, spot - strike) : null;
    const timeValue = intrinsic !== null ? premiumPerShare - intrinsic : null;
    analysis.intrinsicValue = intrinsic;
    analysis.timeValue = timeValue;
    analysis.earlyExerciseAlert = Boolean(analysis.dividendAtRisk && timeValue !== null && timeValue < premiumPerShare * 0.15);
  }

  if (isCall && isSell && !covered) {
    analysis.maxLossLabel = 'Teóricamente ilimitada';
    analysis.notionalExposure = (spot || strike) * shares;
    const base = spot || strike;
    analysis.stressTests = [0.1, 0.2, 0.3, 0.5].map(pct => {
      const stressPrice = base * (1 + pct);
      const loss = ((stressPrice - strike) * shares) - netPremium;
      return { pct, stressPrice, loss: Math.max(loss, -netPremium) };
    });
  }

  if (isCall && isBuy) {
    const totalPremiumPaid = grossPremium + (option.fees || 0);
    analysis.totalPremiumPaid = totalPremiumPaid;
    analysis.maxLoss = totalPremiumPaid;
    const breakevenPerShare = shares ? strike + (totalPremiumPaid / shares) : null;
    analysis.breakeven = breakevenPerShare;
    const intrinsic = spot ? Math.max(0, spot - strike) * shares : null;
    analysis.intrinsicValue = intrinsic;
    analysis.timeValue = intrinsic !== null ? totalPremiumPaid - intrinsic : null;
    if (spot && breakevenPerShare) analysis.pctMoveNeeded = (breakevenPerShare - spot) / spot;
    if (spot && premiumPerShare) analysis.leverageApprox = spot / premiumPerShare;
    analysis.scenarios = buildOptionScenarios(option, analysis, 'call-buy');
  }

  if (isPut && isBuy) {
    const totalPremiumPaid = grossPremium + (option.fees || 0);
    analysis.totalPremiumPaid = totalPremiumPaid;
    analysis.maxLoss = totalPremiumPaid;
    const breakevenPerShare = shares ? strike - (totalPremiumPaid / shares) : null;
    analysis.breakeven = breakevenPerShare;
    const intrinsic = spot ? Math.max(0, strike - spot) * shares : null;
    analysis.intrinsicValue = intrinsic;
    analysis.timeValue = intrinsic !== null ? totalPremiumPaid - intrinsic : null;
    if (spot && breakevenPerShare) analysis.pctMoveNeeded = (spot - breakevenPerShare) / spot;
    const { shares: existingShares } = optionAssignmentSharesInfo(option);
    const protectedShares = Math.min(existingShares, shares);
    analysis.protectionValue = protectedShares * strike;
    const metrics = fullMetrics();
    analysis.pctPortfolioProtected = metrics.value ? (protectedShares * (spot || strike)) / metrics.value : null;
    analysis.annualizedHedgeCost = (days && days > 0 && analysis.protectionValue) ? (totalPremiumPaid / analysis.protectionValue) * 365 / days : null;
    analysis.scenarios = buildOptionScenarios(option, analysis, 'put-buy');
  }

  return analysis;
}
function buildOptionScenarios(option, analysis, kind) {
  const spot = option.underlyingPriceAtOpen;
  if (!spot) return [];
  const shares = analysis.shares;
  const premiumPaid = analysis.totalPremiumPaid || 0;
  return [-0.2, -0.1, 0, 0.1, 0.2].map(pct => {
    const price = spot * (1 + pct);
    const pnl = kind === 'call-buy'
      ? (Math.max(0, price - option.strike) * shares) - premiumPaid
      : (Math.max(0, option.strike - price) * shares) - premiumPaid;
    return { pct, price, pnl };
  });
}
function optionPayoffAtPrice(option, price) {
  const shares = (option.contracts || 0) * (option.multiplier || 100);
  const strike = option.strike || 0;
  const grossPremium = (option.premiumPerShare || 0) * shares;
  const fees = option.fees || 0;
  if (option.optionType === 'put' && option.side === 'sell') return (grossPremium - fees) - (Math.max(0, strike - price) * shares);
  if (option.optionType === 'put' && option.side === 'buy') return (Math.max(0, strike - price) * shares) - (grossPremium + fees);
  if (option.optionType === 'call' && option.side === 'sell') return (grossPremium - fees) - (Math.max(0, price - strike) * shares);
  if (option.optionType === 'call' && option.side === 'buy') return (Math.max(0, price - strike) * shares) - (grossPremium + fees);
  return 0;
}
function buildOptionPayoffChart(option, analysis) {
  const spot = option.underlyingPriceAtOpen;
  const strike = option.strike || 0;
  const center = spot || strike;
  if (!center) return '<div class="empty-state">Introduce el precio actual o el strike para ver el payoff.</div>';
  const spread = Math.max(center * 0.35, 1);
  const minPrice = Math.max(0, center - spread);
  const maxPrice = center + spread;
  const steps = 60;
  const series = [];
  for (let i = 0; i <= steps; i += 1) {
    const price = minPrice + ((maxPrice - minPrice) * i / steps);
    series.push({ price, pnl: optionPayoffAtPrice(option, price) });
  }
  const pnlValues = series.map(item => item.pnl);
  const minPnl = Math.min(...pnlValues, 0);
  const maxPnl = Math.max(...pnlValues, 0);
  const width = 640, height = 240, padding = 26;
  const xScale = price => padding + ((price - minPrice) / ((maxPrice - minPrice) || 1)) * (width - padding * 2);
  const yRange = (maxPnl - minPnl) || 1;
  const yScale = pnl => height - padding - ((pnl - minPnl) / yRange) * (height - padding * 2);
  const linePoints = series.map(item => `${xScale(item.price).toFixed(1)},${yScale(item.pnl).toFixed(1)}`).join(' ');
  const zeroY = yScale(0).toFixed(1);
  const markers = [`<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" class="chart-grid-line"></line>`];
  if (spot) markers.push(`<line x1="${xScale(spot).toFixed(1)}" y1="${padding}" x2="${xScale(spot).toFixed(1)}" y2="${height - padding}" stroke="var(--muted)" stroke-dasharray="4 3"></line>`);
  if (strike) markers.push(`<line x1="${xScale(strike).toFixed(1)}" y1="${padding}" x2="${xScale(strike).toFixed(1)}" y2="${height - padding}" stroke="var(--orange)" stroke-dasharray="2 2"></line>`);
  if (analysis.breakeven !== undefined && analysis.breakeven !== null && analysis.breakeven > 0) markers.push(`<circle cx="${xScale(analysis.breakeven).toFixed(1)}" cy="${zeroY}" r="4" fill="var(--slate-deep)"></circle>`);
  return `<div class="chart-shell"><div class="chart-stage"><svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Payoff de la operación">${markers.join('')}<polyline class="chart-line" stroke="var(--chart-portfolio)" points="${linePoints}"></polyline></svg></div><div class="chart-axis"><span>${eur.format(minPrice)}</span><span>Actual/Strike</span><span>${eur.format(maxPrice)}</span></div></div>`;
}
function computeOptionScore(option, analysis) {
  const components = [];
  let liquidezScore = 5;
  if (analysis.coverage) liquidezScore = analysis.coverage.coveragePct === null ? 5 : Math.round(Math.min(1, analysis.coverage.coveragePct) * 10);
  components.push({ id: 'liquidez', label: 'Liquidez suficiente', score: liquidezScore, weight: 20 });

  let margenScore = 5;
  if (analysis.discountVsCurrent !== undefined && analysis.discountVsCurrent !== null) margenScore = Math.max(0, Math.min(10, Math.round(analysis.discountVsCurrent * 100)));
  else if (analysis.distanceToStrike !== undefined && analysis.distanceToStrike !== null) margenScore = Math.max(0, Math.min(10, Math.round(Math.abs(analysis.distanceToStrike) * 50)));
  components.push({ id: 'margen', label: 'Margen de seguridad', score: margenScore, weight: 15 });

  let concentracionScore = 7;
  if (analysis.assignment && analysis.assignment.newWeight !== null && analysis.assignment.newWeight !== undefined) {
    const weight = analysis.assignment.newWeight;
    concentracionScore = weight < 0.1 ? 10 : weight < 0.15 ? 7 : weight < 0.22 ? 4 : 1;
  }
  components.push({ id: 'concentracion', label: 'Concentración potencial', score: concentracionScore, weight: 15 });

  const linked = findLinkedPortfolioPosition(option);
  components.push({ id: 'coherencia', label: 'Coherencia con cartera', score: linked ? 9 : (option.objective === 'income' ? 6 : 5), weight: 10 });

  let rentabilidadScore = 5;
  const annualized = analysis.annualizedReturnNet ?? analysis.annualizedPremiumReturn;
  if (annualized !== undefined && annualized !== null) rentabilidadScore = Math.max(0, Math.min(10, Math.round(annualized * 20)));
  components.push({ id: 'rentabilidad', label: 'Rentabilidad de la prima', score: rentabilidadScore, weight: 15 });

  let riesgoEventoScore = 8;
  if (option.earningsDate && option.expiration && option.earningsDate <= option.expiration) riesgoEventoScore = 3;
  components.push({ id: 'evento', label: 'Riesgo de evento (resultados)', score: riesgoEventoScore, weight: 10 });

  components.push({ id: 'tesis', label: 'Tesis registrada', score: option.thesis ? 10 : 2, weight: 8 });
  components.push({ id: 'salida', label: 'Plan de salida definido', score: option.exitPlan ? 10 : 3, weight: 7 });

  const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
  const total = Math.round(components.reduce((sum, item) => sum + (item.score / 10) * item.weight, 0) / totalWeight * 100);
  return { total, components };
}
function optionRiskTrafficLight(option, analysis) {
  const reasons = [];
  let tone = 'good';
  const isUncoveredCall = option.optionType === 'call' && option.side === 'sell' && option.strategy !== 'covered-call';
  if (isUncoveredCall) {
    if (!option.acceptsUncoveredRisk) { tone = 'risk'; reasons.push('Call vendida sin cobertura: riesgo teóricamente ilimitado sin aceptación explícita.'); }
    else { tone = 'risk'; reasons.push('Riesgo teóricamente ilimitado asumido explícitamente.'); }
  }
  if (analysis.coverage && analysis.coverage.deficit > 0) { tone = 'risk'; reasons.push(`Faltan ${eur.format(analysis.coverage.deficit)} de liquidez para cubrir una asignación.`); }
  if (analysis.uncoveredShares > 0) { tone = 'risk'; reasons.push(`Solo tienes acciones para cubrir parte del contrato: ${analysis.uncoveredShares} acciones quedarían al descubierto.`); }
  if (analysis.assignment && analysis.assignment.newWeight !== null && analysis.assignment.newWeight > 0.22) { if (tone !== 'risk') tone = 'warn'; reasons.push('La asignación dejaría una concentración excesiva en esta empresa.'); }
  if (!option.thesis) { if (tone !== 'risk') tone = 'warn'; reasons.push('La operación no tiene tesis registrada.'); }
  if (!option.exitPlan) { if (tone !== 'risk') tone = 'warn'; reasons.push('No hay plan de salida definido.'); }
  if (option.earningsDate && option.expiration && option.earningsDate <= option.expiration) { if (tone !== 'risk') tone = 'warn'; reasons.push('Hay resultados empresariales antes del vencimiento.'); }
  if (analysis.earlyExerciseAlert) { tone = 'warn'; reasons.push('Riesgo de ejercicio anticipado por dividendo próximo.'); }
  if (!reasons.length) reasons.push('Sin alertas relevantes con los datos disponibles.');
  return { tone, reasons };
}
function optionRecommendationText(option, analysis, score, trafficLight) {
  const lines = [];
  const underlyingLabel = option.underlying || option.ticker || 'el subyacente';
  if (option.optionType === 'put' && option.side === 'sell') {
    const returnLabel = analysis.premiumReturnGross !== null && analysis.premiumReturnGross !== undefined ? formatPercent(analysis.premiumReturnGross) : 'no calculable';
    const discountLabel = analysis.discountVsCurrent !== null && analysis.discountVsCurrent !== undefined ? `${formatPercent(Math.abs(analysis.discountVsCurrent))} ${analysis.discountVsCurrent >= 0 ? 'inferior' : 'superior'} al precio actual` : 'sin precio actual introducido';
    lines.push(`La put vendida sobre ${underlyingLabel} tiene una rentabilidad de prima del ${returnLabel} y un precio efectivo de entrada ${discountLabel}.`);
    if (analysis.assignment) lines.push(`Si se asigna, consumiría ${analysis.assignment.liquidityConsumedPct !== null ? formatPercent(analysis.assignment.liquidityConsumedPct) : 'una parte no calculable'} de la liquidez disponible${analysis.assignment.newWeight !== null ? ` y elevaría el peso de la posición al ${formatPercent(analysis.assignment.newWeight)}` : ''}.`);
  } else if (option.optionType === 'call' && option.side === 'sell' && option.strategy === 'covered-call') {
    lines.push(`La covered call sobre ${underlyingLabel} da un precio efectivo de venta de ${analysis.effectiveSalePrice !== undefined ? eur.format(analysis.effectiveSalePrice) : '-'} si se ejerce, cediendo la revalorización por encima del strike a cambio de la prima.`);
  } else if (option.optionType === 'call' && option.side === 'sell') {
    lines.push('Esta call vendida sin cobertura tiene pérdida potencial ilimitada; solo es defendible si aceptas expresamente ese riesgo y dispones de margen suficiente.');
  } else if (option.side === 'buy') {
    lines.push(`Esta compra de ${option.optionType === 'call' ? 'call' : 'put'} arriesga como máximo la prima pagada (${eur.format(analysis.totalPremiumPaid || 0)}) y necesita un movimiento del ${analysis.pctMoveNeeded !== undefined && analysis.pctMoveNeeded !== null ? formatPercent(Math.abs(analysis.pctMoveNeeded)) : 'no calculable'} para alcanzar el breakeven.`);
  }
  lines.push(`Puntuación interna: ${score.total}/100. Semáforo: ${trafficLight.tone === 'good' ? 'verde' : trafficLight.tone === 'warn' ? 'amarillo' : 'rojo'}.`);
  lines.push('Esto no es una recomendación de compra o venta: la operación solo es coherente si encaja con tu tesis y tu tolerancia real de liquidez y concentración.');
  return lines;
}
let comparatorRows = [];
let lastAnalyzerOption = null;
let lastAnalyzerResult = null;
function readAnalyzerForm() {
  return migrateOptionPosition({
    underlying: cleanText($('#anUnderlying')?.value),
    ticker: cleanText($('#anTicker')?.value),
    isin: cleanText($('#anIsin')?.value),
    sector: cleanText($('#anSector')?.value),
    country: cleanText($('#anCountry')?.value),
    underlyingPriceAtOpen: parseLocaleNumber($('#anUnderlyingPrice')?.value),
    currency: $('#anCurrency')?.value || 'EUR',
    fxRateToEur: parseLocaleNumber($('#anFxRate')?.value) || 1,
    impliedVolatility: parseLocaleNumber($('#anImpliedVol')?.value),
    earningsDate: $('#anEarningsDate')?.value || '',
    exDividendDate: $('#anExDivDate')?.value || '',
    expectedDividendPerShare: parseLocaleNumber($('#anExpectedDividend')?.value),
    sharesInPortfolio: parseLocaleNumber($('#anSharesOwned')?.value),
    avgCostBasis: parseLocaleNumber($('#anAvgCost')?.value),
    optionType: $('#anOptionType')?.value || 'put',
    side: $('#anSide')?.value || 'sell',
    strategy: $('#anStrategy')?.value || 'cash-secured-put',
    strike: parseLocaleNumber($('#anStrike')?.value),
    expiration: $('#anExpiration')?.value || '',
    openedAt: $('#anOpenedAt')?.value || new Date().toISOString().slice(0, 10),
    premiumPerShare: parseLocaleNumber($('#anPremiumPerShare')?.value),
    contracts: Number($('#anContracts')?.value || 1),
    multiplier: Number($('#anMultiplier')?.value || 100),
    fees: parseLocaleNumber($('#anFees')?.value) || 0,
    collateral: parseLocaleNumber($('#anCollateral')?.value),
    limitPrice: parseLocaleNumber($('#anLimitPrice')?.value),
    delta: parseLocaleNumber($('#anDelta')?.value),
    marginRequired: parseLocaleNumber($('#anMarginRequired')?.value),
    acceptsUncoveredRisk: Boolean($('#anAcceptsUncoveredRisk')?.checked),
    objective: $('#anObjective')?.value || 'income',
    assignmentAccepted: $('#anAssignmentAccepted') ? Boolean($('#anAssignmentAccepted').checked) : true,
    thesis: cleanText($('#anThesis')?.value),
    risks: cleanText($('#anRisks')?.value),
    exitPlan: cleanText($('#anExitPlan')?.value),
    ownership: readOwnershipControl('an'),
    status: 'proposal'
  });
}
function updateAnalyzerLinkedInfo() {
  const infoNode = $('#anLinkedInfo');
  if (!infoNode) return;
  const linked = findLinkedPortfolioPosition({ isin: normalizeIsin($('#anIsin')?.value), ticker: cleanText($('#anTicker')?.value).toUpperCase() });
  infoNode.textContent = linked ? `Detectado en cartera: ${num.format(linked.quantity || 0)} acciones a precio medio ${formatCurrency(linked.averagePrice, linked.currency)}.` : 'No se ha detectado una posición existente con ese ISIN o ticker. Usa los campos manuales si ya tienes acciones.';
}
function renderAnalyzerResults(option) {
  const analysis = computeOptionAnalysis(option);
  const score = computeOptionScore(option, analysis);
  const trafficLight = optionRiskTrafficLight(option, analysis);
  const recommendation = optionRecommendationText(option, analysis, score, trafficLight);
  lastAnalyzerOption = option;
  lastAnalyzerResult = { analysis, score, trafficLight };

  const card = $('#anResultsCard');
  card.hidden = false;
  $('#anResultsSubtitle').textContent = `${option.optionType === 'put' ? 'Put' : 'Call'} ${option.side === 'sell' ? 'vendida' : 'comprada'} sobre ${option.underlying || option.ticker || 'el subyacente'} | Estrategia: ${option.strategy}`;

  const items = [];
  items.push(['Prima neta', eur.format(analysis.netPremium)]);
  if (analysis.breakeven !== undefined && analysis.breakeven !== null) items.push(['Breakeven', eur.format(analysis.breakeven)]);
  if (analysis.capitalCommittedGross !== undefined) items.push(['Capital comprometido', eur.format(analysis.capitalCommittedGross)]);
  if (analysis.capitalCommittedNet !== undefined) items.push(['Capital neto', eur.format(analysis.capitalCommittedNet)]);
  if (analysis.discountVsCurrent !== undefined && analysis.discountVsCurrent !== null) items.push(['Descuento vs. actual', formatPercent(analysis.discountVsCurrent)]);
  if (analysis.premiumReturnGross !== undefined && analysis.premiumReturnGross !== null) items.push(['Rentabilidad prima', formatPercent(analysis.premiumReturnGross)]);
  if (analysis.annualizedReturnGross !== undefined && analysis.annualizedReturnGross !== null) items.push(['Anualizada', formatPercent(analysis.annualizedReturnGross)]);
  if (analysis.totalPremiumPaid !== undefined) items.push(['Prima pagada', eur.format(analysis.totalPremiumPaid)]);
  if (analysis.maxLoss !== undefined) items.push(['Pérdida máxima', eur.format(analysis.maxLoss)]);
  if (analysis.maxLossLabel) items.push(['Pérdida máxima', analysis.maxLossLabel]);
  if (analysis.effectiveSalePrice !== undefined) items.push(['Precio venta efectivo', eur.format(analysis.effectiveSalePrice)]);
  if (analysis.totalPotentialGain !== undefined) items.push(['Ganancia potencial total', eur.format(analysis.totalPotentialGain)]);
  if (analysis.protectionValue !== undefined) items.push(['Valor protegido', eur.format(analysis.protectionValue)]);
  if (analysis.days !== null && analysis.days !== undefined) items.push(['Días a vencimiento', String(analysis.days)]);
  if (analysis.moneyness) items.push(['Moneyness', analysis.moneyness]);
  $('#anResultsSummary').innerHTML = items.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join('');

  const probNode = $('#anProbability');
  probNode.innerHTML = analysis.probability
    ? `<small>Probabilidad aproximada de terminar ITM: <strong>${formatPercent(analysis.probability.value)}</strong> (${escapeHtml(analysis.probability.label)}). No es una probabilidad garantizada.</small>`
    : '<small>Introduce delta, o precio actual + volatilidad implícita + vencimiento, para estimar una probabilidad.</small>';

  const chartNode = $('#anPayoffChart');
  chartNode.className = 'history-chart';
  chartNode.innerHTML = buildOptionPayoffChart(option, analysis);

  $('#anScoreTotal').textContent = String(score.total);
  $('#anScoreBreakdown').innerHTML = score.components.map(item => `<div class="score-row"><span class="score-label">${escapeHtml(item.label)}</span><span class="score-bar"><span style="width:${item.score * 10}%"></span></span><span class="score-value">${item.score}/10</span></div>`).join('');

  $('#anTrafficLight').innerHTML = `<div class="signal-row signal-${trafficLight.tone}"><strong>${trafficLight.tone === 'good' ? 'Verde' : trafficLight.tone === 'warn' ? 'Amarillo' : 'Rojo'}</strong><span>${trafficLight.reasons.map(escapeHtml).join(' · ')}</span></div>`;
  $('#anRecommendation').innerHTML = recommendation.map(line => `<small>${escapeHtml(line)}</small>`).join('');
}
function saveAnalyzerAsOption(status) {
  if (!lastAnalyzerOption) { showNotice('Analiza la operación antes de guardarla.'); return; }
  const option = migrateOptionPosition({ ...lastAnalyzerOption, status, lastScore: lastAnalyzerResult?.score?.total ?? null, lastScoreBreakdown: lastAnalyzerResult?.score?.components ?? null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  state.options.unshift(option);
  saveState();
  render();
  showNotice(status === 'proposal' ? 'Propuesta guardada.' : 'Operación registrada como abierta.');
  if (status !== 'proposal') switchOptionsSubview('optionsOpenPositions');
}
function addComparatorRow() {
  comparatorRows.push({ id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, strike: null, premium: null, expiration: '' });
  renderComparator();
}
function renderComparator() {
  const tbody = $('#comparatorRows');
  if (!tbody) return;
  if (!comparatorRows.length) { tbody.innerHTML = '<tr><td colspan="10" class="empty-cell">Añade filas para comparar strikes.</td></tr>'; return; }
  const base = readAnalyzerForm();
  const sortMode = $('#comparatorSort')?.value || '';
  const computed = comparatorRows.map(row => {
    const option = migrateOptionPosition({ ...base, strike: row.strike, premiumPerShare: row.premium, expiration: row.expiration || base.expiration, status: 'proposal' });
    return { row, analysis: computeOptionAnalysis(option) };
  });
  const sorted = [...computed].sort((a, b) => {
    if (sortMode === 'discount') return (b.analysis.discountVsCurrent ?? -Infinity) - (a.analysis.discountVsCurrent ?? -Infinity);
    if (sortMode === 'premium') return (b.analysis.netPremium ?? -Infinity) - (a.analysis.netPremium ?? -Infinity);
    if (sortMode === 'return') return (b.analysis.premiumReturnGross ?? -Infinity) - (a.analysis.premiumReturnGross ?? -Infinity);
    if (sortMode === 'probability') return (a.analysis.probability?.value ?? Infinity) - (b.analysis.probability?.value ?? Infinity);
    return 0;
  });
  tbody.innerHTML = sorted.map(({ row, analysis }) => `<tr>
    <td><input type="text" inputmode="decimal" data-cmp-field="strike" data-cmp-id="${row.id}" value="${row.strike ?? ''}"></td>
    <td><input type="text" inputmode="decimal" data-cmp-field="premium" data-cmp-id="${row.id}" value="${row.premium ?? ''}"></td>
    <td><input type="date" data-cmp-field="expiration" data-cmp-id="${row.id}" value="${row.expiration || ''}"></td>
    <td>${analysis.breakeven !== undefined && analysis.breakeven !== null ? eur.format(analysis.breakeven) : '-'}</td>
    <td>${analysis.discountVsCurrent !== undefined && analysis.discountVsCurrent !== null ? formatPercent(analysis.discountVsCurrent) : '-'}</td>
    <td>${analysis.premiumReturnGross !== undefined && analysis.premiumReturnGross !== null ? formatPercent(analysis.premiumReturnGross) : '-'}</td>
    <td>${analysis.annualizedReturnGross !== undefined && analysis.annualizedReturnGross !== null ? formatPercent(analysis.annualizedReturnGross) : '-'}</td>
    <td>${analysis.capitalCommittedGross !== undefined ? eur.format(analysis.capitalCommittedGross) : '-'}</td>
    <td>${analysis.probability ? formatPercent(analysis.probability.value) : '-'}</td>
    <td><wa-button size="small" appearance="plain" data-cmp-remove="${row.id}"><wa-icon name="trash"></wa-icon></wa-button></td>
  </tr>`).join('');
}
function optionsSummary() {
  const scopedOptions = visibleOptions();
  const open = scopedOptions.filter(option => ['open', 'rolled'].includes(option.status));
  const totalCollateral = open.reduce((sum, option) => sum + optionDerived(option).capitalCommitted, 0);
  const totalPremium = scopedOptions.reduce((sum, option) => sum + optionDerived(option).netPremium, 0);
  const openPremium = open.reduce((sum, option) => sum + optionDerived(option).netPremium, 0);
  const expiringSoon = open.filter(option => option.expiration && (new Date(option.expiration) - new Date()) / 86400000 <= 45).sort((a, b) => new Date(a.expiration) - new Date(b.expiration));
  const assignedPotential = open.filter(option => option.optionType === 'put').reduce((sum, option) => sum + ((option.strike || 0) * (option.contracts || 0) * (option.multiplier || 100)), 0);
  return { open, totalCollateral, totalPremium, openPremium, expiringSoon, assignedPotential };
}
function transactionRowsData() {
  return sortRows(state.transactions, 'transactions');
}
function transactionAnalytics(transactions) {
  const now = Date.now();
  const yearAgo = now - 365 * 86400000;
  const sixMonthsAgo = now - 182 * 86400000;
  const sumSide = (list, side) => list.filter(tx => tx.type === side).reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const sumCosts = list => list.reduce((sum, tx) => sum + (tx.costs || 0), 0);
  const buildTotals = list => { const buyAmount = sumSide(list, 'BUY'); const sellAmount = sumSide(list, 'SELL'); return { buyAmount, sellAmount, costs: sumCosts(list), netAmount: buyAmount - sellAmount }; };
  const last12 = transactions.filter(tx => new Date(tx.datetime).getTime() >= yearAgo);
  const last6 = transactions.filter(tx => new Date(tx.datetime).getTime() >= sixMonthsAgo);
  const chronological = [...transactions].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const lots = new Map();
  let realized = 0;
  chronological.forEach(tx => {
    const key = tx.isin || tx.symbol;
    if (!key || !tx.quantity) return;
    const lot = lots.get(key) || { quantity: 0, cost: 0 };
    if (tx.type === 'BUY') {
      lot.quantity += tx.quantity;
      lot.cost += (tx.amount || 0) + (tx.costs || 0);
    } else {
      const avgCost = lot.quantity > 0 ? lot.cost / lot.quantity : 0;
      const soldQuantity = Math.min(tx.quantity, lot.quantity);
      realized += ((tx.amount || 0) - (tx.costs || 0)) - (avgCost * soldQuantity);
      lot.cost = Math.max(0, lot.cost - (avgCost * soldQuantity));
      lot.quantity = Math.max(0, lot.quantity - soldQuantity);
    }
    lots.set(key, lot);
  });
  return { allTotals: buildTotals(transactions), lastTwelveMonths: buildTotals(last12), monthlyBuys: sumSide(last6, 'BUY') / 6, realized };
}
function transactionHighlights(transactions) {
  const byKey = new Map();
  transactions.forEach(tx => {
    const key = tx.isin || tx.symbol;
    if (!key) return;
    const entry = byKey.get(key) || { name: tx.name || tx.symbol, buyAmount: 0, sellAmount: 0, count: 0 };
    if (tx.type === 'SELL') entry.sellAmount += tx.amount || 0; else entry.buyAmount += tx.amount || 0;
    entry.count += 1;
    byKey.set(key, entry);
  });
  const rows = [...byKey.values()].map(entry => ({ ...entry, net: entry.buyAmount - entry.sellAmount }));
  const topBuys = rows.filter(r => r.net > 0).sort((a, b) => b.net - a.net).slice(0, 3);
  const topReductions = rows.filter(r => r.net < 0).sort((a, b) => a.net - b.net).slice(0, 3);
  return { topBuys, topReductions };
}
function renderTransactions() {
  const rowsNode = $('#transactionRows');
  if (!rowsNode) return;
  const transactions = transactionRowsData();
  rowsNode.innerHTML = transactions.length ? transactions.map(tx => `<tr><td>${dateEs(tx.date)}</td><td>${tx.type === 'SELL' ? 'Venta' : 'Compra'}</td><td class="company-cell"><strong>${escapeHtml(tx.name)}</strong><small>${escapeHtml(tx.symbol)} | ${escapeHtml(tx.isin || 'Sin ISIN')}</small></td><td>${tx.quantity === null ? '-' : num.format(tx.quantity)}</td><td>${formatCurrency(tx.price, tx.currency)}</td><td>${formatCurrency(tx.amount, tx.currency)}</td><td>${formatCurrency(tx.costs, tx.currency)}</td><td>${escapeHtml(tx.portfolio || '-')}</td></tr>`).join('') : '<tr><td colspan="8" class="empty-cell">Importa el CSV de transacciones.</td></tr>';
  const analytics = transactionAnalytics(transactions);
  const netCapitalNode = $('#txNetCapital');
  if (netCapitalNode) {
    netCapitalNode.textContent = eur.format(analytics.lastTwelveMonths.netAmount);
    $('#txCapitalMeta').textContent = transactions.length ? `Ritmo medio de compra 6m: ${eur.format(analytics.monthlyBuys)}/mes` : 'Sin operaciones importadas.';
    $('#txFriction').textContent = eur.format(analytics.allTotals.costs);
    $('#txFrictionMeta').textContent = `Sobre ${transactions.length} operaciones importadas.`;
    $('#txRealized').textContent = eur.format(analytics.realized);
    $('#txRealizedMeta').textContent = analytics.realized >= 0 ? 'Ventas con plusvalía neta estimada.' : 'Ventas con minusvalia neta estimada.';
  }
  const highlights = transactionHighlights(transactions);
  const decisionNode = $('#txDecisionRows');
  if (decisionNode) {
    const rows = [];
    if (highlights.topBuys[0]) rows.push({ tone: 'good', title: 'Mayor convicción', detail: `${highlights.topBuys[0].name}: ${eur.format(highlights.topBuys[0].net)} netos comprados.` });
    if (highlights.topReductions[0]) rows.push({ tone: 'warn', title: 'Mayor reducción', detail: `${highlights.topReductions[0].name}: ${eur.format(Math.abs(highlights.topReductions[0].net))} netos vendidos.` });
    if (transactions.length) rows.push({ tone: 'good', title: 'Cadencia', detail: `${transactions.length} operaciones importadas, ${eur.format(analytics.allTotals.costs)} en costes acumulados.` });
    decisionNode.className = rows.length ? 'signal-list' : 'signal-list empty-state';
    decisionNode.innerHTML = rows.length ? rows.map(row => `<div class="signal-row signal-${row.tone}"><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.detail)}</span></div>`).join('') : 'Importa transacciones para ver patrones de decisión.';
  }
  const highlightsNode = $('#txHighlights');
  if (highlightsNode) {
    const lines = [];
    if (highlights.topBuys.length) lines.push('<strong>Top compras netas</strong>', ...highlights.topBuys.map(item => `<small>${escapeHtml(item.name)}: ${eur.format(item.net)}</small>`));
    if (highlights.topReductions.length) lines.push('<strong>Top reducciones</strong>', ...highlights.topReductions.map(item => `<small>${escapeHtml(item.name)}: ${eur.format(Math.abs(item.net))}</small>`));
    highlightsNode.className = lines.length ? 'summary-stack' : 'summary-stack empty-state';
    highlightsNode.innerHTML = lines.length ? lines.join('') : 'Sin transacciones importadas.';
  }
}
function computeDividendTrend() {
  const chronological = [...ownerHistory()].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!chronological.length) return { growth12m: null, latest: fullMetrics().dividends };
  const latest = chronological.at(-1).dividends || fullMetrics().dividends;
  const yearAgo = chronological.find(snapshot => snapshot.date >= `${new Date().getFullYear() - 1}-01-01`) || chronological[0];
  const base = yearAgo?.dividends || 0;
  return { growth12m: base ? (latest - base) / base : null, latest };
}
function advisorSignals() {
  ensureAdvisoryState();
  const metrics = fullMetrics();
  const options = optionsSummary();
  const concentration = concentrationSignals();
  const dividendTrend = computeDividendTrend();
  const liquidityAvailable = Math.max(0, metrics.liquidity - options.totalCollateral);
  const baselineReserve = Math.max(state.advisor.minimumLiquidityTarget || 0, state.advisor.emergencyFundTarget || 0, (state.settings.monthlyExpense || 0) * 6);
  const mortgageOverlay = state.advisor.upcomingDebtMonths <= 12 ? Math.min(state.advisor.upcomingDebt * 0.08, 60000) : 0;
  const requiredLiquidity = baselineReserve + mortgageOverlay;
  const debtRatio = metrics.netWorth > 0 ? (metrics.liabilities + state.advisor.upcomingDebt) / (metrics.netWorth + metrics.liabilities + state.advisor.upcomingDebt) : 0;
  const committedLiquidityRatio = metrics.liquidity > 0 ? options.totalCollateral / metrics.liquidity : 0;
  const savingsRatio = state.settings.monthlyExpense ? state.advisor.savingsCapacity / state.settings.monthlyExpense : null;
  const signals = [
    { id: 'liquidity', title: 'Liquidez', name: eur.format(liquidityAvailable), detail: `Objetivo dinámico ${eur.format(requiredLiquidity)} tras descontar garantías.`, tone: liquidityAvailable >= requiredLiquidity ? 'good' : liquidityAvailable >= requiredLiquidity * 0.75 ? 'warn' : 'risk' },
    { id: 'debt', title: 'Deuda', name: `${num.format(debtRatio * 100)} %`, detail: `Incluye deuda actual y futura prevista por ${eur.format(state.advisor.upcomingDebt)}.`, tone: debtRatio < 0.35 ? 'good' : debtRatio < 0.55 ? 'warn' : 'risk' },
    { id: 'savings', title: 'Capacidad de ahorro', name: eur.format(state.advisor.savingsCapacity), detail: savingsRatio === null ? 'Sin gasto mensual configurado.' : `Equivale al ${num.format(savingsRatio * 100)} % del gasto mensual.`, tone: savingsRatio === null ? 'warn' : savingsRatio >= 0.35 ? 'good' : savingsRatio >= 0.15 ? 'warn' : 'risk' },
    { id: 'company', title: 'Concentración empresa', name: concentration[0]?.name || 'Sin dato', detail: concentration[0] ? `${formatPercent(concentration[0].weight)} del patrimonio invertido.` : 'Sin datos.', tone: concentration[0]?.tone || 'warn' },
    { id: 'country', title: 'Concentración país', name: concentration[1]?.name || 'Sin dato', detail: concentration[1] ? `${formatPercent(concentration[1].weight)} de la cartera.` : 'Sin datos.', tone: concentration[1]?.tone || 'warn' },
    { id: 'sector', title: 'Concentración sector', name: concentration[2]?.name || 'Sin dato', detail: concentration[2] ? `${formatPercent(concentration[2].weight)} de la cartera.` : 'Sin datos.', tone: concentration[2]?.tone || 'warn' },
    { id: 'dividends', title: 'Sostenibilidad del dividendo', name: dividendTrend.growth12m === null ? eur.format(dividendTrend.latest) : formatPercent(dividendTrend.growth12m), detail: dividendTrend.growth12m === null ? 'Faltan cierres para medir el crecimiento interanual.' : 'Crecimiento del dividendo frente a 12 meses.', tone: dividendTrend.growth12m === null ? 'warn' : dividendTrend.growth12m > 0.05 ? 'good' : dividendTrend.growth12m > 0 ? 'warn' : 'risk' },
    { id: 'options', title: 'Opciones', name: eur.format(options.totalCollateral), detail: metrics.liquidity ? `${formatPercent(committedLiquidityRatio)} de la liquidez comprometida en garantías.` : 'Sin liquidez registrada.', tone: committedLiquidityRatio < 0.25 ? 'good' : committedLiquidityRatio < 0.45 ? 'warn' : 'risk' },
    ...optionAlertSignal(options)
  ];
  return { signals, liquidityAvailable, requiredLiquidity, debtRatio, options, dividendTrend };
}
function optionAlertSignal(options = optionsSummary()) {
  const open = options.open || [];
  if (!open.length) return [];
  const alerts = [];
  open.forEach(option => {
    const spot = option.underlyingPriceAtOpen;
    const strike = option.strike || 0;
    const itm = spot && strike ? (option.optionType === 'put' ? spot < strike : spot > strike) : false;
    if (itm) alerts.push(`${option.underlying || option.ticker} está ITM`);
    if (!option.thesis) alerts.push(`${option.underlying || option.ticker} sin tesis`);
    if (!option.exitPlan) alerts.push(`${option.underlying || option.ticker} sin plan de salida`);
    const days = optionDaysToExpiration(option);
    if (days !== null && days <= 7) alerts.push(`${option.underlying || option.ticker} vence en ${days} días`);
  });
  if (!alerts.length) return [{ id: 'options-alerts', title: 'Alertas de opciones', name: 'Sin alertas', detail: `${open.length} posiciones abiertas sin incidencias relevantes.`, tone: 'good' }];
  return [{ id: 'options-alerts', title: 'Alertas de opciones', name: `${alerts.length} alertas`, detail: alerts.slice(0, 4).join(' · '), tone: alerts.length > 2 ? 'risk' : 'warn' }];
}
function executiveVerdict(recommendations) {
  const score = portfolioScore();
  const { liquidityAvailable, requiredLiquidity, signals, dividendTrend } = advisorSignals();
  const overallLabel = score.value >= 70 ? 'sólida' : score.value >= 50 ? 'mejorable' : 'frágil';
  const liquidityTight = liquidityAvailable < requiredLiquidity;
  const upcomingMortgage = state.advisor.upcomingDebt > 0 && state.advisor.upcomingDebtMonths <= 12;
  const worstConcentration = signals.filter(signal => ['company', 'country', 'sector'].includes(signal.id) && signal.tone !== 'good').sort((a, b) => (a.tone === 'risk' ? 0 : 1) - (b.tone === 'risk' ? 0 : 1))[0];
  let focus;
  if (liquidityTight && upcomingMortgage) focus = `priorizar la liquidez durante los próximos ${state.advisor.upcomingDebtMonths} meses por la formalización de la hipoteca, aplazando nuevas compras discrecionales`;
  else if (liquidityTight) focus = 'reconstruir el colchón de liquidez antes de asumir nuevo riesgo o nuevas compras';
  else if (upcomingMortgage) focus = `mantener disciplina de caja de cara a la hipoteca prevista dentro de ${state.advisor.upcomingDebtMonths} meses`;
  else if (recommendations.some(item => item.id === 'options-cash-check')) focus = 'revisar el capital comprometido en opciones antes de asumir más riesgo';
  else if (worstConcentration) focus = `reducir la concentración en ${worstConcentration.name}`;
  else if (dividendTrend.growth12m !== null && dividendTrend.growth12m <= 0) focus = 'revisar por que el crecimiento del dividendo se ha frenado';
  else focus = 'mantener el ritmo de aportaciones y la disciplina de diversificación actual';
  return `La situación patrimonial es ${overallLabel} (${score.value}/100), pero ahora mismo la prioridad es ${focus}.`;
}
function buildOnboardingChecklist() {
  const items = [];
  if (!state.portfolio.length) {
    items.push({ id: 'import', text: 'Importa tu cartera real desde DivvyDiary para empezar a ver KPIs y recomendaciones.', actionLabel: 'Ir a Cartera', go: 'portfolio' });
  }
  const hasGoal = Boolean(state.settings.targetAnnualDividends || state.settings.targetNetWorth || state.settings.monthlyExpense);
  if (!hasGoal) {
    items.push({ id: 'goal', text: 'Define al menos un objetivo financiero para ver tu progreso y previsión.', actionLabel: 'Ir a Datos', go: 'settings' });
  }
  ['owner-2', 'owner-family'].forEach(id => {
    if (!ownerHasRealPortfolio(id) && !state.portfolioEstimates[id]) {
      items.push({ id: `estimate-${id}`, text: `Añade una estimación de cartera para ${ownerName(id)} si no vas a importar sus datos reales.`, actionLabel: 'Ir a Datos', go: 'settings' });
    }
  });
  if (state.portfolio.length && !existingSnapshotForMonth()) {
    items.push({ id: 'close', text: 'Guarda el cierre del mes actual para alimentar el histórico y las previsiones.', actionLabel: 'Guardar cierre', closeMonth: true });
  }
  return items;
}
function renderOnboardingChecklist() {
  const card = $('#onboardingCard');
  const rows = $('#onboardingRows');
  if (!card || !rows) return;
  const items = buildOnboardingChecklist();
  card.hidden = !items.length;
  if (!items.length) return;
  rows.className = 'signal-list';
  rows.innerHTML = items.map(item => `<div class="signal-row signal-warn"><strong>${escapeHtml(item.text)}</strong><span>${item.closeMonth ? `<wa-button size="small" appearance="plain" data-checklist-action="close-month">${escapeHtml(item.actionLabel)}</wa-button>` : `<wa-button size="small" appearance="plain" data-go="${item.go}">${escapeHtml(item.actionLabel)}</wa-button>`}</span></div>`).join('');
}
function executiveDiagnosis(recommendations) {
  const metrics = fullMetrics();
  const { liquidityAvailable, requiredLiquidity, options } = advisorSignals();
  const lines = [executiveVerdict(recommendations)];
  if (liquidityAvailable < requiredLiquidity) lines.push(`La liquidez útil (${eur.format(liquidityAvailable)}) sigue por debajo del umbral prudente (${eur.format(requiredLiquidity)}).`);
  else lines.push(`La liquidez útil cubre el nivel prudente de caja (${eur.format(requiredLiquidity)}), lo que permite absorber imprevistos sin tensión inmediata.`);
  if (state.advisor.upcomingDebt > 0) lines.push(`La futura deuda prevista por ${eur.format(state.advisor.upcomingDebt)} obliga a priorizar caja y disciplina de aportaciones en los próximos ${state.advisor.upcomingDebtMonths} meses.`);
  if (options.totalCollateral > 0) lines.push(`Las opciones abiertas comprometen ${eur.format(options.totalCollateral)} de liquidez y deben tratarse como capital no disponible para nuevas compras.`);
  if (recommendations.some(item => item.id === 'top-position-freeze')) lines.push('La cartera mantiene una concentración relevante en algunas posiciones, por lo que conviene evitar ampliar las más pesadas.');
  lines.push(`El patrimonio neto estimado es de ${eur.format(metrics.netWorth)} y los dividendos anuales de ${eur.format(metrics.dividends)}; la prioridad no es maximizar yield, sino preservar flexibilidad y calidad de decisiones.`);
  return lines;
}
function updateAdvisorSettings() {
  ensureAdvisoryState();
  state.advisor.minimumLiquidityTarget = parseLocaleNumber($('#advisorMinLiquidity').value) || 0;
  state.advisor.upcomingDebt = parseLocaleNumber($('#advisorUpcomingDebt').value) || 0;
  state.advisor.upcomingDebtMonths = Math.max(0, Number($('#advisorUpcomingDebtMonths').value || 0));
  state.advisor.savingsCapacity = parseLocaleNumber($('#advisorSavingsCapacity').value) || 0;
  state.advisor.emergencyFundTarget = parseLocaleNumber($('#advisorEmergencyFund').value) || 0;
  saveState();
  renderAdvisorCenter();
}
function recommendationActionLabel(action) {
  return action === 'accept' ? 'Aceptada' : action === 'execute' ? 'Ejecutada' : action === 'postpone' ? 'Pospuesta' : 'Descartada';
}
function computeOwnerBreakdown() {
  return OWNER_IDS.map(ownerId => {
    const positions = ownerFilteredList(state.portfolio, ownerId).filter(position => ACTIVE_STATUSES.has(normalizeStatus(position.status)));
    const portfolioTotals = totals(positions, ownerId);
    const estimate = portfolioEstimateContribution(ownerId);
    const portfolioValue = portfolioTotals.value + estimate.value;
    const dividends = portfolioTotals.dividends + estimate.dividends;
    const other = assetTotals(ownerId);
    const netWorth = portfolioValue + other.assets - other.liabilities;
    return { ownerId, name: ownerName(ownerId), portfolioValue, dividends, assets: other.assets, liabilities: other.liabilities, netWorth, isEstimate: estimate.owners.length > 0 };
  });
}
function renderOwnerBreakdown() {
  const card = $('#ownerBreakdownCard');
  const rows = $('#ownerBreakdownRows');
  if (!card || !rows) return;
  const isConsolidated = (state.viewOwnerId || 'all') === 'all';
  card.hidden = !isConsolidated;
  if (!isConsolidated) return;
  const breakdown = computeOwnerBreakdown();
  rows.className = 'scenario-list';
  rows.innerHTML = breakdown.map(item => `<div class="scenario-card"><strong>${escapeHtml(item.name)}</strong><span>${eur.format(item.netWorth)}</span><small>Cartera: ${eur.format(item.portfolioValue)}${item.isEstimate ? ' (estimado)' : ''} | Dividendos: ${eur.format(item.dividends)}</small><small>Otros activos: ${eur.format(item.assets)} | Deuda: ${eur.format(item.liabilities)}</small>${item.isEstimate ? '<small class="owner-tag">Cartera estimada, sin importación real</small>' : ''}</div>`).join('');
}
function renderDashboard() {
  const portfolio = activePortfolio();
  const metrics = fullMetrics(portfolio);
  const snapshots = [...ownerHistory()].sort((a, b) => new Date(b.date) - new Date(a.date));
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
  $('#goalValue').textContent = metrics.dividendGoalProgress === null ? '--' : pct.format(Math.min(metrics.dividendGoalProgress, 9.99));
  $('#goalMeta').textContent = state.settings.targetAnnualDividends ? `Objetivo: ${eur.format(state.settings.targetAnnualDividends)}` : 'Configura un objetivo anual de dividendos.';
  $('#snapshotDelta').textContent = lastSnapshot && previousSnapshot ? `Variación vs. cierre anterior: ${formatPercent(relativeDelta(lastSnapshot.netWorth || 0, previousSnapshot.netWorth || 0))}` : 'Necesitas al menos dos cierres para ver variaciones.';
  $('#latestSnapshot').textContent = lastSnapshot ? `Último cierre: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(lastSnapshot.date))} | Patrimonio neto ${eur.format(lastSnapshot.netWorth || 0)}` : 'Todavía no hay cierres mensuales.';
  $('#portfolioScore').textContent = String(score.value);
  $('#portfolioScoreLabel').textContent = `${score.label} | ${score.value}/100`;
  $('#portfolioScoreMeta').textContent = score.label === 'Sin datos' ? score.detail : `${score.detail} Concentración ${score.concentrationLabel.toLowerCase()}.`;
  $('#concentrationRows').className = signals.length ? 'signal-list' : 'signal-list empty-state';
  $('#concentrationRows').innerHTML = signals.length ? signals.map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${signal.title}</strong><span>${escapeHtml(signal.name)}</span><small>${formatPercent(signal.weight)} | ${signal.label}</small></div>`).join('') : 'Sin datos';
  $('#fiGoalStatus').textContent = scenarios ? `Objetivo anual: ${eur.format(scenarios[0].target)} | progreso actual ${pct.format(Math.min(scenarios[0].progress, 9.99))}` : 'Configura tu gasto mensual para ver escenarios.';
  $('#fiGoalMeta').textContent = scenarios ? `Aportación mensual considerada: ${state.settings.monthlyContribution === null ? eur.format(0) : eur.format(state.settings.monthlyContribution)}` : 'Se calcula con dividendos actuales, aportación mensual y tres supuestos de crecimiento.';
  const fiRows = $('#fiRows');
  if (!scenarios) { fiRows.className = 'scenario-list empty-state'; fiRows.textContent = 'Sin datos'; }
  else { fiRows.className = 'scenario-list'; fiRows.innerHTML = scenarios.map(s => `<div class="scenario-card"><strong>${s.label}</strong><span>${s.status}</span><small>${s.years === null ? 'Más de 40 años' : `${s.years} años`}</small><small>Meta estimada: ${s.eta}</small></div>`).join(''); }
  renderBars('#sectorChart', groupByValue(portfolio, 'sector', metrics.value).slice(0, 8));
  renderBars('#countryChart', groupByValue(portfolio, 'country', metrics.value).slice(0, 8));
  const top = sortRows(sortedPortfolio(portfolio).slice(0, 7), 'topPositions');
  $('#topPositions').innerHTML = top.length ? top.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} | ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td>${eur.format(position.marketValue || 0)}</td><td>${formatPercent(position.allocation ?? (metrics.value ? (position.marketValue || 0) / metrics.value : 0))}</td><td>${eur.format(position.annualDividend || 0)}</td><td>${formatPercent(position.dividendYield)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavía no hay posiciones.</td></tr>';
}
function render() {
  applyTheme();
  applyOwnerView();
  renderDashboard();
  renderOwnerBreakdown();
  renderOnboardingChecklist();
  renderPlanTeaser();
  renderAdvisorCenter();
  renderPortfolio();
  renderTransactions();
  renderOptionsModule();
  renderOptionHistory();
  renderOptionsCalendar();
  renderOptionsStats();
  renderOptionsBenchmark();
  renderHistory();
  renderPlan();
  renderFilters();
  renderAssets();
  renderLiabilities();
  renderAccounts();
  renderRentas();
  renderRegulatoryWatch();
  renderNotifications();
  renderSettings();
  renderUndoState();
  renderBackupStatus();
  renderReportHistory();
  renderSortableHeaders();
}
ensureAdvisoryState();
['#advisorMinLiquidity', '#advisorUpcomingDebt', '#advisorUpcomingDebtMonths', '#advisorSavingsCapacity', '#advisorEmergencyFund'].forEach(selector => {
  $(selector)?.addEventListener('change', updateAdvisorSettings);
});
bindOwnershipToggle('an');
$('#anAnalyzeBtn')?.addEventListener('click', () => {
  const option = readAnalyzerForm();
  if (!option.underlying && !option.ticker) { showNotice('Indica al menos el subyacente o el ticker.'); return; }
  if (option.strike === null || option.premiumPerShare === null) { showNotice('Indica al menos el strike y la prima por acción.'); return; }
  if (!option.expiration) { showNotice('Indica la fecha de vencimiento.'); return; }
  renderAnalyzerResults(option);
});
['#anTicker', '#anIsin'].forEach(selector => $(selector)?.addEventListener('change', updateAnalyzerLinkedInfo));
$('#anSaveProposalBtn')?.addEventListener('click', () => saveAnalyzerAsOption('proposal'));
$('#anSaveOpenBtn')?.addEventListener('click', () => saveAnalyzerAsOption('open'));
$('#comparatorAddRowBtn')?.addEventListener('click', addComparatorRow);
$('#comparatorSort')?.addEventListener('change', renderComparator);
document.addEventListener('click', event => {
  const removeBtn = event.target.closest('[data-cmp-remove]');
  if (removeBtn) { comparatorRows = comparatorRows.filter(row => row.id !== removeBtn.dataset.cmpRemove); renderComparator(); }
});
document.addEventListener('change', event => {
  const field = event.target.closest('[data-cmp-field]');
  if (!field) return;
  const row = comparatorRows.find(item => item.id === field.dataset.cmpId);
  if (!row) return;
  row[field.dataset.cmpField] = field.dataset.cmpField === 'expiration' ? field.value : parseLocaleNumber(field.value);
  renderComparator();
});
document.addEventListener('click', event => {
  const recButton = event.target.closest('[data-rec-action]');
  if (recButton) { handleRecommendationAction(recButton.dataset.recAction, recButton.dataset.recId); return; }
  const optionDelete = event.target.closest('[data-delete-option]');
  if (optionDelete) {
    const optionId = optionDelete.dataset.deleteOption;
    askConfirm('Eliminar esta operación de opciones del registro.', () => {
      state.options = state.options.filter(item => item.id !== optionId);
      saveState();
      render();
      showNotice('Operación de opciones eliminada.');
    });
  }
});

DEFAULT_TABLE_SORTS.options = { key: 'expiration', dir: 'asc' };
DEFAULT_TABLE_SORTS.recommendations = { key: 'urgencyRank', dir: 'asc' };
DEFAULT_TABLE_SORTS.decisionReviews = { key: 'reviewDate', dir: 'asc' };
SORTABLE_TABLES.options = { selector: '#optionRows', columns: [{ key: 'underlying', label: 'Subyacente', type: 'string' }, { key: 'optionType', label: 'Tipo', type: 'string' }, { key: 'objective', label: 'Objetivo', type: 'string' }, { key: 'expiration', label: 'Vencimiento', type: 'date' }, { key: 'netPremium', label: 'Prima neta', type: 'number' }, { key: 'capitalCommitted', label: 'Capital comprometido', type: 'number' }, { key: 'status', label: 'Estado', type: 'string' }, { key: null, label: '' }] };
SORTABLE_TABLES.recommendations = { selector: '#recommendationRows', columns: [{ key: 'title', label: 'Título', type: 'string' }, { key: 'urgencyRank', label: 'Urgencia', type: 'number' }, { key: 'impactRank', label: 'Impacto', type: 'number' }, { key: 'riskRank', label: 'Riesgo de no actuar', type: 'number' }, { key: 'reviewDate', label: 'Revisión', type: 'date' }, { key: 'statusLabel', label: 'Estado', type: 'string' }, { key: null, label: '' }] };
SORTABLE_TABLES.decisionReviews = { selector: '#decisionRows', columns: [{ key: 'title', label: 'Decisión', type: 'string' }, { key: 'decidedAt', label: 'Fecha', type: 'date' }, { key: 'reviewDate', label: 'Revisión', type: 'date' }, { key: 'statusLabel', label: 'Estado', type: 'string' }, { key: 'lesson', label: 'Aprendizaje', type: 'string' }] };
function urgencyRank(value) { return ({ Alta: 1, Media: 2, Baja: 3 }[cleanText(value)] || 9); }
function impactRank(value) { return ({ Alto: 1, Media: 2, Medio: 2, Bajo: 3 }[cleanText(value)] || 9); }
function riskRank(value) { return ({ Alto: 1, Media: 2, Medio: 2, Bajo: 3 }[cleanText(value)] || 9); }
function advisoryKindLabel(value) { return ADVISORY_KIND_LABELS[cleanText(value).toLowerCase()] || 'Recomendación'; }
function recommendationStatusLabel(value) { return ADVISORY_STATUS_LABELS[cleanText(value).toLowerCase()] || 'Pendiente'; }
function reviewPhaseLabel(value) { return REVIEW_PHASE_LABELS[cleanText(value).toLowerCase()] || 'Revisión'; }
function defaultAdvisorState(settings = DEFAULT_SETTINGS) { const monthlyExpense = toNum(settings?.monthlyExpense, null); const monthlyContribution = toNum(settings?.monthlyContribution, null); return { minimumLiquidityTarget: monthlyExpense ? monthlyExpense * 6 : 15000, upcomingDebt: 0, upcomingDebtMonths: 12, savingsCapacity: monthlyContribution ?? 1000, emergencyFundTarget: monthlyExpense ? monthlyExpense * 6 : 12000 }; }
function defaultPlanState() { return { targetType: 'fi', targetValue: null, monthlyContribution: null, monthlyExpense: null, horizonYears: 15 }; }
function migratePlanState(raw) { const next = defaultPlanState(); if (!raw || typeof raw !== 'object') return next; return { targetType: ['fi', 'networth', 'dividends', 'monthlyIncome'].includes(raw.targetType) ? raw.targetType : next.targetType, targetValue: toNum(raw.targetValue, null), monthlyContribution: toNum(raw.monthlyContribution, null), monthlyExpense: toNum(raw.monthlyExpense, null), horizonYears: toNum(raw.horizonYears, next.horizonYears) || next.horizonYears }; }
function defaultDecisionReview() { return { id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recommendationId: '', title: '', category: '', phase: '3m', phaseLabel: 'Revisión 3 meses', actionLabel: '', status: 'pending', statusLabel: 'Pendiente', reason: '', expectedOutcome: '', actualOutcome: '', lesson: '', createdAt: new Date().toISOString(), decidedAt: '', reviewDate: '', reviewedAt: '' }; }
function migrateRecommendation(entry) { if (!entry || typeof entry !== 'object') return null; const urgency = cleanText(entry.urgency) || 'Media'; const impact = cleanText(entry.impact) || 'Medio'; const risk = cleanText(entry.risk) || 'Medio'; const status = cleanText(entry.status).toLowerCase() || 'pending'; return { ...entry, id: cleanText(entry.id) || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: cleanText(entry.title) || 'Recomendación', category: cleanText(entry.category) || 'General', kind: cleanText(entry.kind).toLowerCase() || 'recommendation', action: cleanText(entry.action), explanation: cleanText(entry.explanation), justification: cleanText(entry.justification), impact, risk, urgency, reviewDate: normalizeDate(entry.reviewDate) || new Date().toISOString().slice(0, 10), status, statusLabel: recommendationStatusLabel(status), urgencyRank: urgencyRank(urgency), impactRank: impactRank(impact), riskRank: riskRank(risk), createdAt: entry.createdAt || new Date().toISOString(), updatedAt: entry.updatedAt || new Date().toISOString(), decidedAt: entry.decidedAt || null, reason: cleanText(entry.reason) }; }
function migrateDecisionReview(entry) { if (!entry || typeof entry !== 'object') return null; const phase = cleanText(entry.phase).toLowerCase() || '3m'; const status = cleanText(entry.status).toLowerCase() || 'pending'; return { ...defaultDecisionReview(), ...entry, id: cleanText(entry.id) || `decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recommendationId: cleanText(entry.recommendationId), title: cleanText(entry.title) || 'Decisión', category: cleanText(entry.category), phase, phaseLabel: reviewPhaseLabel(phase), actionLabel: cleanText(entry.actionLabel) || 'Decisión registrada', status, statusLabel: cleanText(entry.statusLabel) || recommendationStatusLabel(status), reason: cleanText(entry.reason), expectedOutcome: cleanText(entry.expectedOutcome), actualOutcome: cleanText(entry.actualOutcome), lesson: cleanText(entry.lesson), createdAt: entry.createdAt || new Date().toISOString(), decidedAt: entry.decidedAt || '', reviewDate: normalizeDate(entry.reviewDate) || '', reviewedAt: entry.reviewedAt || '' }; }
function migrateBackup(backup) { if (!backup || typeof backup !== 'object' || !backup.snapshot) return null; return { id: backup.id || `backup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: backup.createdAt || new Date().toISOString(), reason: backup.reason || 'import', source: backup.source || null, snapshot: { portfolio: Array.isArray(backup.snapshot.portfolio) ? backup.snapshot.portfolio.map(migratePosition).filter(Boolean) : [], transactions: Array.isArray(backup.snapshot.transactions) ? backup.snapshot.transactions.map(migrateTransaction).filter(Boolean) : [], options: Array.isArray(backup.snapshot.options) ? backup.snapshot.options.map(migrateOptionPosition).filter(Boolean) : [], recommendations: Array.isArray(backup.snapshot.recommendations) ? backup.snapshot.recommendations.map(migrateRecommendation).filter(Boolean) : [], decisionReviews: Array.isArray(backup.snapshot.decisionReviews) ? backup.snapshot.decisionReviews.map(migrateDecisionReview).filter(Boolean) : [], advisor: backup.snapshot.advisor && typeof backup.snapshot.advisor === 'object' ? { ...backup.snapshot.advisor } : null, history: Array.isArray(backup.snapshot.history) ? backup.snapshot.history.map(migrateSnapshot).filter(Boolean) : [], assets: Array.isArray(backup.snapshot.assets) ? backup.snapshot.assets.map(migrateAsset).filter(Boolean) : [], liabilities: Array.isArray(backup.snapshot.liabilities) ? backup.snapshot.liabilities.map(migrateLiability).filter(Boolean) : [], reportHistory: Array.isArray(backup.snapshot.reportHistory) ? backup.snapshot.reportHistory.map(migrateReportEntry).filter(Boolean) : [], settings: migrateSettings(backup.snapshot.settings), lastImport: backup.snapshot.lastImport || null, lastTransactionsImport: backup.snapshot.lastTransactionsImport || null, lastBackupAt: backup.snapshot.lastBackupAt || null } }; }
function ensureAdvisoryState() { const defaults = defaultAdvisorState(state.settings); state.advisor = { ...defaults, ...(state.advisor && typeof state.advisor === 'object' ? state.advisor : {}) }; state.advisor.minimumLiquidityTarget = toNum(state.advisor.minimumLiquidityTarget, defaults.minimumLiquidityTarget) || 0; state.advisor.upcomingDebt = toNum(state.advisor.upcomingDebt, 0) || 0; state.advisor.upcomingDebtMonths = Math.max(0, Math.round(toNum(state.advisor.upcomingDebtMonths, 12) || 12)); state.advisor.savingsCapacity = toNum(state.advisor.savingsCapacity, state.settings?.monthlyContribution ?? defaults.savingsCapacity) || 0; state.advisor.emergencyFundTarget = toNum(state.advisor.emergencyFundTarget, defaults.emergencyFundTarget) || 0; state.options = Array.isArray(state.options) ? state.options.map(migrateOptionPosition).filter(Boolean) : []; state.recommendations = Array.isArray(state.recommendations) ? state.recommendations.map(migrateRecommendation).filter(Boolean) : []; state.decisionReviews = Array.isArray(state.decisionReviews) ? state.decisionReviews.map(migrateDecisionReview).filter(Boolean) : []; }
function defaultOwnerNames() { return { ...DEFAULT_OWNER_NAMES }; }
function migrateOwnerNames(raw) {
  const next = defaultOwnerNames();
  if (raw && typeof raw === 'object') OWNER_IDS.forEach(id => { if (cleanText(raw[id])) next[id] = cleanText(raw[id]); });
  return next;
}
function defaultOwnership() { return [{ ownerId: 'owner-1', pct: 1 }]; }
function migrateOwnership(raw) {
  if (!Array.isArray(raw) || !raw.length) return defaultOwnership();
  const cleaned = raw
    .map(entry => ({ ownerId: OWNER_IDS.includes(entry?.ownerId) ? entry.ownerId : null, pct: toNum(entry?.pct, 0) || 0 }))
    .filter(entry => entry.ownerId && entry.pct > 0);
  if (!cleaned.length) return defaultOwnership();
  const total = cleaned.reduce((sum, entry) => sum + entry.pct, 0);
  return total > 0 ? cleaned.map(entry => ({ ownerId: entry.ownerId, pct: entry.pct / total })) : defaultOwnership();
}
function ownerName(ownerId) {
  if (ownerId === 'all') return 'Consolidado';
  return (state.ownerNames && state.ownerNames[ownerId]) || DEFAULT_OWNER_NAMES[ownerId] || ownerId;
}
function defaultOwnerForEntry() {
  return OWNER_IDS.includes(state.viewOwnerId) ? state.viewOwnerId : 'owner-1';
}
function applyDefaultOwnerToEntryForms() {
  const target = defaultOwnerForEntry();
  ENTRY_OWNER_SELECT_IDS.forEach(id => {
    const select = $(`#${id}`);
    if (!select) return;
    const form = select.closest('form') || select.closest('.inline-form') || select;
    if (form.contains(document.activeElement) && document.activeElement !== document.body) return;
    select.value = target;
    applyOwnerAccentClass(select, target);
  });
}
function migrateStrategicTarget(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const hasAny = raw.targetWeight !== undefined || raw.targetAmount !== undefined || raw.targetContribution !== undefined || raw.horizon !== undefined || cleanText(raw.thesis);
  if (!hasAny) return null;
  return {
    targetWeight: normalizePercentLike(raw.targetWeight, null),
    targetAmount: toNum(raw.targetAmount, null),
    targetContribution: toNum(raw.targetContribution, null),
    horizon: cleanText(raw.horizon),
    thesis: cleanText(raw.thesis)
  };
}
function findAccount(accountId) {
  if (!accountId || accountId === UNASSIGNED_ACCOUNT_ID) return null;
  return state.accounts.find(account => account.id === accountId) || null;
}
function accountName(accountId) {
  if (!accountId || accountId === UNASSIGNED_ACCOUNT_ID) return 'Sin asignar';
  const account = findAccount(accountId);
  return account ? account.name : 'Sin asignar';
}
function accountFilteredList(list, accountId) {
  if (!Array.isArray(list)) return [];
  if (!accountId || accountId === 'all') return list;
  return list.filter(record => (record.accountId || UNASSIGNED_ACCOUNT_ID) === accountId);
}
function ownerShareOf(record, ownerId) {
  if (ownerId === 'all') return 1;
  const entry = (record?.ownership || []).find(item => item.ownerId === ownerId);
  return entry ? entry.pct : 0;
}
function ownerFilteredList(list, ownerId = state.viewOwnerId) {
  if (!Array.isArray(list)) return [];
  if (!ownerId || ownerId === 'all') return list;
  return list.filter(record => ownerShareOf(record, ownerId) > 0);
}
function visibleAssets() { return ownerFilteredList(state.assets); }
function visibleLiabilities() { return ownerFilteredList(state.liabilities); }
function visibleOptions() { return ownerFilteredList(state.options); }
function ownerLabel(record) {
  const ownership = record?.ownership || defaultOwnership();
  if (ownership.length === 1 && ownership[0].pct >= 0.999) return ownerName(ownership[0].ownerId);
  return ownership.map(entry => `${ownerName(entry.ownerId)} ${Math.round(entry.pct * 100)}%`).join(' · ');
}
function defaultPortfolioEstimate() { return { value: null, cost: null, dividendYield: null, updatedAt: null }; }
function migratePortfolioEstimate(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const value = toNum(raw.value, null);
  if (value === null) return null;
  return { value, cost: toNum(raw.cost, null), dividendYield: toNum(raw.dividendYield, null), updatedAt: raw.updatedAt || new Date().toISOString() };
}
function migratePortfolioEstimates(raw) {
  const next = {};
  if (raw && typeof raw === 'object') OWNER_IDS.forEach(id => { const migrated = migratePortfolioEstimate(raw[id]); if (migrated) next[id] = migrated; });
  return next;
}
function ownerHasRealPortfolio(ownerId) {
  return state.portfolio.some(position => ownerShareOf(position, ownerId) > 0 && ACTIVE_STATUSES.has(normalizeStatus(position.status)));
}
function ownerEstimateInUse(ownerId) {
  return Boolean(state.portfolioEstimates[ownerId]) && !ownerHasRealPortfolio(ownerId);
}
function portfolioEstimateContribution(ownerId = state.viewOwnerId) {
  const empty = { value: 0, cost: 0, dividends: 0, owners: [] };
  if (!ownerId) return empty;
  const ids = ownerId === 'all' ? OWNER_IDS : [ownerId];
  return ids.reduce((sum, id) => {
    if (!ownerEstimateInUse(id)) return sum;
    const est = state.portfolioEstimates[id];
    sum.value += est.value;
    sum.cost += est.cost || 0;
    sum.dividends += est.value * (est.dividendYield || 0);
    sum.owners.push(id);
    return sum;
  }, { value: 0, cost: 0, dividends: 0, owners: [] });
}
function autoMatchTransactionAccounts(transactions, accounts) {
  if (!accounts.length) return transactions;
  return transactions.map(tx => {
    if (tx.accountId !== UNASSIGNED_ACCOUNT_ID) return tx;
    const label = cleanText(tx.portfolio).toLowerCase();
    if (!label) return tx;
    const match = accounts.find(account => cleanText(account.name).toLowerCase() === label);
    return match ? { ...tx, accountId: match.id } : tx;
  });
}
function migrateTaxOverrides(raw) {
  const next = {};
  if (raw && typeof raw === 'object') Object.entries(raw).forEach(([country, rate]) => { const value = normalizePercentLike(rate, null); if (value !== null) next[country] = value; });
  return next;
}
function defaultRegulatoryEntry() { return { id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: '', date: null, status: 'watching', impact: '', notes: '', link: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
function migrateRegulatoryEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = cleanText(raw.title);
  if (!title) return null;
  return { id: raw.id || defaultRegulatoryEntry().id, title, date: normalizeDate(raw.date) || null, status: REGULATORY_STATUSES.includes(raw.status) ? raw.status : 'watching', impact: cleanText(raw.impact), notes: cleanText(raw.notes), link: cleanText(raw.link), createdAt: raw.createdAt || new Date().toISOString(), updatedAt: raw.updatedAt || new Date().toISOString() };
}
function defaultOnboardingState() { return { completed: false, skipped: false, step: 0 }; }
function migrateOnboardingState(raw) {
  const next = defaultOnboardingState();
  if (!raw || typeof raw !== 'object') return next;
  return { completed: Boolean(raw.completed), skipped: Boolean(raw.skipped), step: toNum(raw.step, 0) || 0 };
}
function defaultState() { return { schemaVersion: SCHEMA_VERSION, portfolio: [], transactions: [], options: [], recommendations: [], decisionReviews: [], advisor: { ...defaultAdvisorState(DEFAULT_SETTINGS) }, plan: defaultPlanState(), history: [], backups: [], assets: [], liabilities: [], accounts: [], projects: [], reportHistory: [], settings: { ...DEFAULT_SETTINGS }, tableSorts: defaultTableSorts(), ownerNames: defaultOwnerNames(), viewOwnerId: 'all', portfolioEstimates: {}, taxOverrides: {}, regulatoryWatch: [], onboarding: defaultOnboardingState(), lastImport: null, lastTransactionsImport: null, lastBackupAt: null, lastImportUndo: null, theme: 'light' }; }
function migrateState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const settings = migrateSettings(raw.settings);
  const accounts = Array.isArray(raw.accounts) ? raw.accounts.map(migrateAccount).filter(Boolean) : [];
  const transactions = autoMatchTransactionAccounts(Array.isArray(raw.transactions) ? raw.transactions.map(migrateTransaction).filter(Boolean) : [], accounts);
  return { ...base, ...raw, schemaVersion: SCHEMA_VERSION, portfolio: Array.isArray(raw.portfolio) ? raw.portfolio.map(migratePosition).filter(Boolean) : [], transactions, options: Array.isArray(raw.options) ? raw.options.map(migrateOptionPosition).filter(Boolean) : [], recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.map(migrateRecommendation).filter(Boolean) : [], decisionReviews: Array.isArray(raw.decisionReviews) ? raw.decisionReviews.map(migrateDecisionReview).filter(Boolean) : [], advisor: { ...defaultAdvisorState(settings), ...(raw.advisor && typeof raw.advisor === 'object' ? raw.advisor : {}) }, plan: migratePlanState(raw.plan), history: Array.isArray(raw.history) ? raw.history.map(migrateSnapshot).filter(Boolean) : [], backups: Array.isArray(raw.backups) ? raw.backups.map(migrateBackup).filter(Boolean).slice(0, 10) : [], assets: Array.isArray(raw.assets) ? raw.assets.map(migrateAsset).filter(Boolean) : [], liabilities: Array.isArray(raw.liabilities) ? raw.liabilities.map(migrateLiability).filter(Boolean) : [], accounts, projects: Array.isArray(raw.projects) ? raw.projects.map(migrateProject).filter(Boolean) : [], reportHistory: Array.isArray(raw.reportHistory) ? raw.reportHistory.map(migrateReportEntry).filter(Boolean).slice(0, 24) : [], settings, tableSorts: migrateTableSorts(raw.tableSorts), ownerNames: migrateOwnerNames(raw.ownerNames), viewOwnerId: OWNER_IDS.includes(raw.viewOwnerId) || raw.viewOwnerId === 'all' ? raw.viewOwnerId : 'all', portfolioEstimates: migratePortfolioEstimates(raw.portfolioEstimates), taxOverrides: migrateTaxOverrides(raw.taxOverrides), regulatoryWatch: Array.isArray(raw.regulatoryWatch) ? raw.regulatoryWatch.map(migrateRegulatoryEntry).filter(Boolean) : [], onboarding: migrateOnboardingState(raw.onboarding), lastImportUndo: raw.lastImportUndo ? migrateBackup(raw.lastImportUndo) : null, lastTransactionsImport: raw.lastTransactionsImport || null, theme: raw.theme === 'dark' ? 'dark' : 'light' };
}
// Deliberately excludes accounts/projects: this snapshot only backs the pre-CSV-import undo,
// which never touches accounts/projects, so they don't need to be rolled back with it.
function cloneSnapshot() { return JSON.parse(JSON.stringify({ portfolio: state.portfolio, transactions: state.transactions, options: state.options, recommendations: state.recommendations, decisionReviews: state.decisionReviews, advisor: state.advisor, history: state.history, assets: state.assets, liabilities: state.liabilities, reportHistory: state.reportHistory, settings: state.settings, lastImport: state.lastImport, lastTransactionsImport: state.lastTransactionsImport, lastBackupAt: state.lastBackupAt })); }
function decisionReviewsRows() { return sortRows((state.decisionReviews || []).map(migrateDecisionReview).filter(Boolean), 'decisionReviews'); }
function dueReviewCount() { const today = new Date().toISOString().slice(0, 10); return decisionReviewsRows().filter(item => item.reviewDate && item.reviewDate <= today && ['pending', 'reviewing'].includes(item.status)).length; }
function buildRecommendations() { const { signals, liquidityAvailable, requiredLiquidity, debtRatio, options, dividendTrend } = advisorSignals(); const topPositions = sortedPortfolio().slice(0, 5); const generated = []; if (liquidityAvailable < requiredLiquidity) generated.push({ id: 'liq-buffer', kind: 'alert', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', action: 'Reducir temporalmente la inversión y reservar caja hasta recuperar el umbral prudente.', urgency: 'Alta', explanation: 'La liquidez disponible tras descontar garantías queda por debajo del objetivo dinámico.', justification: `${eur.format(liquidityAvailable)} disponibles frente a un objetivo de ${eur.format(requiredLiquidity)}.`, impact: 'Alto', risk: 'Alto', horizon: '1-3 meses', reviewDate: new Date(Date.now() + 30 * 86400000).toISOString() }); if (state.advisor.upcomingDebt > 0 && state.advisor.upcomingDebtMonths <= 12) generated.push({ id: 'mortgage-priority', kind: 'estimate', title: 'Priorizar liquidez y capacidad de ahorro antes de formalizar la hipoteca', category: 'Deuda futura', action: 'Fijar un objetivo de caja previo a la firma y revisar aportaciones mensuales hasta alcanzarlo.', urgency: state.advisor.upcomingDebtMonths <= 6 ? 'Alta' : 'Media', explanation: 'La nueva deuda futura cambia el nivel prudente de caja y la tolerancia al riesgo.', justification: `Hipoteca o deuda prevista de ${eur.format(state.advisor.upcomingDebt)} en ${state.advisor.upcomingDebtMonths} meses.`, impact: 'Alto', risk: 'Alto', horizon: 'Hasta formalización', reviewDate: new Date(Date.now() + 45 * 86400000).toISOString() }); if (signals.find(item => item.id === 'company')?.tone === 'risk') generated.push({ id: 'top-position-freeze', kind: 'alert', title: 'Evitar ampliar las mayores posiciones hasta rebajar la concentración', category: 'Concentración', action: 'Congelar compras en las posiciones principales y dirigir nuevas entradas a zonas menos representadas.', urgency: 'Alta', explanation: 'La posición principal ya pesa demasiado dentro de la cartera.', justification: topPositions[0] ? `${topPositions[0].name} pesa ${formatPercent(topPositions[0].allocation || 0)}.` : 'Sin posición principal disponible.', impact: 'Alto', risk: 'Alto', horizon: '3 meses', reviewDate: new Date(Date.now() + 90 * 86400000).toISOString() }); if (signals.find(item => item.id === 'country')?.tone !== 'good') generated.push({ id: 'international-balance', kind: 'recommendation', title: 'Dirigir nuevas aportaciones a países o sectores infraponderados', category: 'Asignación', action: 'Priorizar las próximas compras fuera del sesgo geográfico dominante.', urgency: 'Media', explanation: 'La cartera puede diversificarse mejor sin necesidad de vender posiciones existentes.', justification: `La mayor exposición geográfica sigue concentrada en ${signals.find(item => item.id === 'country')?.name || 'una zona dominante'}.`, impact: 'Medio', risk: 'Medio', horizon: '3-6 meses', reviewDate: new Date(Date.now() + 120 * 86400000).toISOString() }); if (options.totalCollateral > 0) generated.push({ id: 'options-cash-check', kind: 'alert', title: 'Revisar si todas las puts abiertas serían asumibles si se asignaran hoy', category: 'Opciones', action: 'Simular asignación simultánea y reservar caja real para no depender de ventas forzadas.', urgency: options.expiringSoon.length ? 'Alta' : 'Media', explanation: 'Las opciones abiertas consumen liquidez real y pueden aumentar la concentración de forma brusca.', justification: `${eur.format(options.totalCollateral)} comprometidos y ${options.expiringSoon.length} vencimientos próximos.`, impact: 'Alto', risk: 'Alto', horizon: 'Inmediato', reviewDate: new Date(Date.now() + 21 * 86400000).toISOString() }); if (dividendTrend.growth12m !== null && dividendTrend.growth12m <= 0) generated.push({ id: 'dividend-review', kind: 'estimate', title: 'Revisar si el crecimiento del dividendo se ha estancado frente al último año', category: 'Dividendos', action: 'Analizar si el frenazo viene de recortes, divisa, rotación o exceso de concentración en pagadores maduros.', urgency: 'Media', explanation: 'La renta recurrente no está mejorando al ritmo esperado.', justification: `Crecimiento interanual estimado: ${formatPercent(dividendTrend.growth12m)}.`, impact: 'Medio', risk: 'Medio', horizon: '1-2 meses', reviewDate: new Date(Date.now() + 60 * 86400000).toISOString() }); if (debtRatio > 0.5) generated.push({ id: 'leverage-discipline', kind: 'alert', title: 'Reducir el ritmo de riesgo hasta estabilizar la deuda total', category: 'Riesgo financiero', action: 'Aplazar decisiones de riesgo incremental hasta aclarar el mapa de deuda y caja futura.', urgency: 'Alta', explanation: 'La deuda total prevista pesa demasiado sobre el patrimonio consolidado.', justification: `Ratio estimado de deuda ampliada: ${num.format(debtRatio * 100)} %.`, impact: 'Alto', risk: 'Alto', horizon: '6-12 meses', reviewDate: new Date(Date.now() + 120 * 86400000).toISOString() }); if (dueReviewCount() > 0) generated.push({ id: 'review-pending', kind: 'fact', title: 'Revisar decisiones pasadas ya vencidas', category: 'Aprendizaje', action: 'Cerrar las revisiones pendientes para saber que decisiones mejoraron realmente tu situación.', urgency: 'Media', explanation: 'Hay decisiones con fecha de revisión ya alcanzada.', justification: `${dueReviewCount()} revisiones ya deberían haberse evaluado.`, impact: 'Medio', risk: 'Medio', horizon: 'Este mes', reviewDate: new Date().toISOString() }); const existingById = new Map((state.recommendations || []).map(item => [item.id, item])); const ranked = [...generated].sort((a, b) => (urgencyRank(a.urgency) - urgencyRank(b.urgency)) || ((RECOMMENDATION_PRIORITY_WEIGHTS[a.id] || 99) - (RECOMMENDATION_PRIORITY_WEIGHTS[b.id] || 99))); return ranked.slice(0, 6).map(item => { const existing = existingById.get(item.id); return migrateRecommendation({ ...item, status: existing?.status || 'pending', reason: existing?.reason || '', createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), decidedAt: existing?.decidedAt || null }); }); }
function renderAdvisorCenter() { ensureAdvisoryState(); const recommendationRows = $('#recommendationRows'); const decisionRows = $('#decisionRows'); const diagnosis = $('#advisorDiagnosis'); const priorities = $('#advisorPriorities'); const signalsNode = $('#advisorSignals'); const optionsSummaryNode = $('#advisorOptionsSummary'); const optionsAlertsNode = $('#advisorOptionsAlerts'); if (!diagnosis) return; $('#advisorMinLiquidity').value = formatInputNumber(state.advisor.minimumLiquidityTarget); $('#advisorUpcomingDebt').value = formatInputNumber(state.advisor.upcomingDebt); $('#advisorUpcomingDebtMonths').value = state.advisor.upcomingDebtMonths ?? ''; $('#advisorSavingsCapacity').value = formatInputNumber(state.advisor.savingsCapacity); $('#advisorEmergencyFund').value = formatInputNumber(state.advisor.emergencyFundTarget); state.recommendations = buildRecommendations(); const sortedRecommendations = sortRows(state.recommendations, 'recommendations'); const { signals } = advisorSignals(); const options = optionsSummary(); diagnosis.className = 'summary-stack'; diagnosis.innerHTML = executiveDiagnosis(state.recommendations).map((line, index) => index === 0 ? `<strong>${escapeHtml(line)}</strong>` : `<small>${escapeHtml(line)}</small>`).join(''); priorities.className = state.recommendations.length ? 'scenario-list' : 'scenario-list empty-state'; priorities.innerHTML = state.recommendations.slice(0, 3).map(item => `<article class="priority-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.urgency)}</span><small>${escapeHtml(item.explanation)}</small><small>Acción: ${escapeHtml(item.action || 'Pendiente de concretar')}</small><small>Revisión: ${dateEs(String(item.reviewDate).slice(0, 10))}</small></article>`).join('') || 'Sin datos'; signalsNode.className = 'signal-list'; signalsNode.innerHTML = signals.slice(0, 5).map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${escapeHtml(signal.title)}</strong><span>${escapeHtml(signal.name)}</span><small>${escapeHtml(signal.detail)}</small></div>`).join(''); optionsSummaryNode.className = 'summary-stack'; optionsSummaryNode.innerHTML = options.open.length ? [`<strong>${options.open.length} posiciones abiertas</strong>`, `<small>Garantías reservadas: ${eur.format(options.totalCollateral)}</small>`, `<small>Primas netas acumuladas: ${eur.format(options.totalPremium)}</small>`, `<small>Exposición potencial por asignación: ${eur.format(options.assignedPotential)}</small>`].join('') : '<small>No hay opciones abiertas registradas.</small>'; optionsAlertsNode.className = 'signal-list'; const optionAlertCards = []; if (options.expiringSoon.length) optionAlertCards.push({ tone: 'warn', title: 'Vencimientos próximos', detail: `${options.expiringSoon.length} posiciones vencen en los próximos 45 días.` }); if (options.totalCollateral > fullMetrics().liquidity * 0.4 && fullMetrics().liquidity > 0) optionAlertCards.push({ tone: 'risk', title: 'Liquidez comprometida', detail: 'Las garantías absorben una parte demasiado alta de la caja disponible.' }); if (!optionAlertCards.length) optionAlertCards.push({ tone: 'good', title: 'Opciones bajo control', detail: 'No hay alertas críticas en las posiciones registradas.' }); optionsAlertsNode.innerHTML = optionAlertCards.map(item => `<div class="signal-row signal-${item.tone}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join(''); recommendationRows.innerHTML = sortedRecommendations.length ? sortedRecommendations.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.category)} | ${escapeHtml(advisoryKindLabel(item.kind))}</small><br><small>${escapeHtml(item.action || item.explanation)}</small></td><td>${escapeHtml(item.urgency)}</td><td>${escapeHtml(item.impact)}</td><td>${escapeHtml(item.risk)}</td><td>${dateEs(String(item.reviewDate).slice(0, 10))}</td><td>${escapeHtml(item.statusLabel || recommendationStatusLabel(item.status))}</td><td><div class="recommendation-actions"><wa-button size="small" appearance="plain" data-rec-action="accept" data-rec-id="${item.id}">Aceptar</wa-button><wa-button size="small" appearance="plain" data-rec-action="execute" data-rec-id="${item.id}">Ejecutada</wa-button><wa-button size="small" appearance="plain" data-rec-action="postpone" data-rec-id="${item.id}">Posponer</wa-button><wa-button size="small" appearance="plain" data-rec-action="discard" data-rec-id="${item.id}">Descartar</wa-button></div></td></tr>`).join('') : '<tr><td colspan="7" class="empty-cell">Sin recomendaciones todavía.</td></tr>'; const reviews = decisionReviewsRows(); decisionRows.innerHTML = reviews.length ? reviews.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.phaseLabel)} | ${escapeHtml(item.actionLabel)}</small></td><td>${item.decidedAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.decidedAt)) : '-'}</td><td>${dateEs(String(item.reviewDate || '').slice(0, 10))}</td><td>${escapeHtml(item.statusLabel)}</td><td>${escapeHtml(item.lesson || item.reason || item.expectedOutcome || 'Sin aprendizaje registrado')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Aún no hay decisiones registradas.</td></tr>'; renderAdvisorMonthlyIncome(); renderAdvisorCommitments(); renderAdvisorEvolutionChart(); }
function renderAdvisorMonthlyIncome() {
  const valueNode = $('#advisorMonthlyIncome');
  if (!valueNode) return;
  const summary = rentasSummary();
  valueNode.textContent = eur.format(summary.monthlyNet);
  $('#advisorMonthlyIncomeMeta').textContent = `Bruta: ${eur.format(summary.grossAnnual / 12)}/mes`;
  const coverageNode = $('#advisorIncomeCoverage');
  coverageNode.textContent = summary.coverage !== null ? formatPercent(summary.coverage) : '--';
  $('#advisorIncomeCoverageMeta').textContent = summary.coverage !== null ? `Objetivo: ${eur.format(summary.targetMonthly)}/mes` : 'Configura un objetivo de renta mensual en Plan.';
}
function renderAdvisorCommitments() {
  const node = $('#advisorCommitments');
  if (!node) return;
  const items = [];
  state.accounts.filter(a => a.quarterlyRule.active).forEach(account => {
    const status = quarterlyRuleStatus(account);
    if (status && !status.qualifies) items.push({ date: null, sortKey: status.daysRemaining, tone: status.tone, title: `${account.name}: regla trimestral pendiente`, detail: status.detail });
  });
  state.projects.forEach(project => {
    const next = nextCommitment(project);
    if (next) items.push({ date: next.dueDate, sortKey: next.dueDate || '9999', tone: 'warn', title: `${project.name}: ${eur.format(next.amount)}`, detail: next.dueDate ? `Vence el ${dateEs(next.dueDate)}` : 'Sin fecha' });
  });
  optionsSummary().expiringSoon.forEach(option => {
    items.push({ date: option.expiration, sortKey: option.expiration || '9999', tone: 'warn', title: `${option.underlying || option.ticker}: vencimiento de opción`, detail: `Vence el ${dateEs(option.expiration)}` });
  });
  items.sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)));
  node.className = items.length ? 'signal-list' : 'signal-list empty-state';
  node.innerHTML = items.length ? items.slice(0, 8).map(item => `<div class="signal-row signal-${item.tone}"><strong>${escapeHtml(item.title)}</strong><span></span><small>${escapeHtml(item.detail)}</small></div>`).join('') : 'Sin compromisos próximos.';
}
function renderAdvisorEvolutionChart() {
  const chart = $('#advisorEvolutionChart');
  if (!chart) return;
  const chronological = [...state.history].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!chronological.length) { chart.className = 'history-chart empty-state'; chart.textContent = 'Sin datos'; return; }
  const labels = chronological.map(snapshot => formatMonthTick(snapshot.date));
  chart.className = 'history-chart';
  chart.innerHTML = buildLineChart([
    { label: 'Patrimonio neto', color: 'var(--chart-networth)', values: chronological.map(snapshot => snapshot.netWorth || 0) },
    { label: 'Dividendos', color: 'var(--chart-portfolio)', values: chronological.map(snapshot => snapshot.dividends || 0), dashed: true }
  ], labels, { ariaLabel: 'Evolución de patrimonio y renta' });
}
function optionStressScenario() {
  const openPuts = visibleOptions().filter(option => option.status === 'open' && option.optionType === 'put' && option.side === 'sell');
  const metrics = fullMetrics();
  const totalAssignmentCost = openPuts.reduce((sum, option) => sum + (option.strike || 0) * (option.contracts || 0) * (option.multiplier || 100), 0);
  return { positions: openPuts.length, totalAssignmentCost, liquidityAfter: metrics.liquidity - totalAssignmentCost, stillComfortable: (metrics.liquidity - totalAssignmentCost) >= 0 };
}
function renderOptionsLiquidityBreakdown() {
  const node = $('#optionsLiquidityBreakdown');
  if (!node) return;
  const metrics = fullMetrics();
  const summary = optionsSummary();
  const stress = optionStressScenario();
  const items = [
    ['Liquidez bruta', eur.format(metrics.liquidity)],
    ['Capital comprometido (puts abiertas)', eur.format(summary.totalCollateral)],
    ['Liquidez libre', eur.format(metrics.liquidity - summary.totalCollateral)],
    ['% de liquidez comprometida', metrics.liquidity ? formatPercent(Math.min(1, summary.totalCollateral / metrics.liquidity)) : '-'],
    ['Si todas las puts se asignan hoy', eur.format(stress.liquidityAfter)],
    ['¿Sigue siendo cómodo?', stress.stillComfortable ? 'Sí' : 'No: faltaría liquidez']
  ];
  node.innerHTML = items.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join('');
}
function renderOptionsModule() {
  const portfolioSummaryNode = $('#portfolioOptionsSummary');
  const rowsNode = $('#optionRows');
  renderOptionsLiquidityBreakdown();
  if (portfolioSummaryNode) {
    const summary = optionsSummary();
    portfolioSummaryNode.className = summary.open.length ? 'summary-stack' : 'summary-stack empty-state';
    portfolioSummaryNode.innerHTML = summary.open.length ? [`<strong>${summary.open.length} posiciones abiertas</strong>`, `<small>Garantías reservadas: ${eur.format(summary.totalCollateral)}</small>`, `<small>Primas abiertas: ${eur.format(summary.openPremium)}</small>`, `<small>Vencimientos próximos: ${summary.expiringSoon.length}</small>`].join('') : 'Sin operaciones registradas.';
  }
  if (!rowsNode) return;
  const visible = visibleOptions().filter(option => ['proposal', 'open', 'rolled'].includes(option.status));
  const rows = sortRows(visible, 'options');
  rowsNode.innerHTML = rows.length ? rows.map(option => {
    const derived = optionDerived(option);
    return `<tr><td class="company-cell"><strong>${escapeHtml(option.underlying || option.ticker || 'Sin subyacente')}</strong><small>${escapeHtml(option.ticker || '-')} | ${escapeHtml(option.isin || 'Sin ISIN')}</small></td><td>${option.optionType === 'put' ? 'Put' : 'Call'} ${option.side === 'sell' ? 'vendida' : 'comprada'}</td><td>${escapeHtml(option.strategy)}</td><td>${dateEs(option.expiration)}</td><td>${eur.format(derived.netPremium)}</td><td>${eur.format(derived.capitalCommitted)}</td><td>${escapeHtml(OPTION_STATUS_LABELS[option.status] || option.status)}</td><td><div class="recommendation-actions"><wa-button size="small" appearance="plain" data-manage-option="${option.id}"><wa-icon name="gear"></wa-icon></wa-button><wa-button size="small" appearance="plain" data-delete-option="${option.id}"><wa-icon name="trash"></wa-icon></wa-button></div></td></tr>`;
  }).join('') : '<tr><td colspan="8" class="empty-cell">No hay posiciones en opciones.</td></tr>';
}
let managingOptionId = null;
function openOptionActionDialog(optionId) {
  const option = state.options.find(item => item.id === optionId);
  if (!option) return;
  managingOptionId = optionId;
  $('#optionActionSummary').textContent = `${option.underlying || option.ticker || 'Sin subyacente'} | ${option.optionType === 'put' ? 'Put' : 'Call'} ${option.side === 'sell' ? 'vendida' : 'comprada'} | Strike ${eur.format(option.strike || 0)} | Vence ${dateEs(option.expiration)}`;
  const typeSelect = $('#optionActionType');
  const isPutSell = option.optionType === 'put' && option.side === 'sell';
  const isCoveredCall = option.optionType === 'call' && option.side === 'sell' && option.strategy === 'covered-call';
  [...typeSelect.querySelectorAll('wa-option')].forEach(opt => {
    if (opt.value === 'assigned') opt.hidden = !isPutSell;
    if (opt.value === 'exercised') opt.hidden = !isCoveredCall;
    if (opt.value === 'cancelled') opt.hidden = option.status !== 'proposal';
  });
  typeSelect.value = option.status === 'proposal' ? 'cancelled' : 'close';
  $('#optionActionDate').value = new Date().toISOString().slice(0, 10);
  $('#optionActionPremium').value = '';
  $('#optionActionFees').value = '';
  $('#optionActionReason').value = '';
  $('#rollStrike').value = '';
  $('#rollExpiration').value = '';
  $('#rollPremiumPerShare').value = '';
  $('#rollContracts').value = String(option.contracts || 1);
  $('#rollFees').value = '';
  updateOptionActionFieldsVisibility();
  $('#optionActionDialog').open = true;
}
function updateOptionActionFieldsVisibility() {
  const action = $('#optionActionType')?.value;
  const closeFields = $('#optionActionCloseFields');
  const rollFields = $('#optionActionRollFields');
  const netResult = $('#optionActionNetResult');
  if (!closeFields || !rollFields || !netResult) return;
  closeFields.hidden = !['close', 'expired', 'assigned', 'exercised', 'roll'].includes(action);
  rollFields.hidden = action !== 'roll';
  netResult.hidden = action !== 'roll';
  if (action === 'roll') updateRollPreview();
}
function optionLegCashFlow(side, premiumPerShare, shares, fees, isOpening) {
  const gross = (premiumPerShare || 0) * shares;
  if (isOpening) return side === 'sell' ? (gross - fees) : -(gross + fees);
  return side === 'sell' ? -(gross + fees) : (gross - fees);
}
function updateRollPreview() {
  const option = state.options.find(item => item.id === managingOptionId);
  if (!option) return;
  const shares = (option.contracts || 0) * (option.multiplier || 100);
  const closeCashFlow = optionLegCashFlow(option.side, parseLocaleNumber($('#optionActionPremium').value) || 0, shares, parseLocaleNumber($('#optionActionFees').value) || 0, false);
  const rollContracts = Number($('#rollContracts').value || option.contracts || 1);
  const rollShares = rollContracts * (option.multiplier || 100);
  const openCashFlow = optionLegCashFlow(option.side, parseLocaleNumber($('#rollPremiumPerShare').value) || 0, rollShares, parseLocaleNumber($('#rollFees').value) || 0, true);
  const net = closeCashFlow + openCashFlow;
  const node = $('#optionActionNetResult');
  node.hidden = false;
  node.textContent = `${net >= 0 ? 'Crédito neto' : 'Débito neto'} del roll: ${eur.format(Math.abs(net))}.`;
}
function applyPutAssignment(option) {
  const shares = (option.contracts || 0) * (option.multiplier || 100);
  const linked = findLinkedPortfolioPosition(option);
  const now = new Date().toISOString();
  if (linked) {
    const newQuantity = (linked.quantity || 0) + shares;
    const newTotalCost = (linked.totalCost || 0) + (option.strike || 0) * shares;
    state.portfolio = state.portfolio.map(position => position.id === linked.id ? { ...position, quantity: newQuantity, totalCost: newTotalCost, averagePrice: newQuantity ? newTotalCost / newQuantity : position.averagePrice, updatedAt: now } : position);
  } else {
    state.portfolio.push(migratePosition({
      isin: option.isin || '', symbol: option.ticker, name: option.underlying || option.ticker,
      quantity: shares, averagePrice: option.strike, totalCost: (option.strike || 0) * shares,
      currentPrice: option.underlyingPriceAtOpen || option.strike, marketValue: (option.underlyingPriceAtOpen || option.strike || 0) * shares,
      currency: option.currency, sector: option.sector || 'Sin clasificar', country: option.country || 'Sin país',
      status: 'active', notes: `Creada por asignación de la opción ${option.id}.`,
      createdAt: now, updatedAt: now, importMeta: { source: 'option-assignment', importedAt: now }
    }));
  }
}
function applyCoveredCallExercise(option) {
  const linked = findLinkedPortfolioPosition(option);
  if (!linked) return 0;
  const shares = (option.contracts || 0) * (option.multiplier || 100);
  const now = new Date().toISOString();
  const sellShares = Math.min(linked.quantity || 0, shares);
  const remainingQuantity = Math.max(0, (linked.quantity || 0) - sellShares);
  const proportionalCost = (linked.quantity || 0) ? (linked.totalCost || 0) * (sellShares / linked.quantity) : 0;
  const remainingTotalCost = (linked.totalCost || 0) - proportionalCost;
  state.portfolio = state.portfolio.map(position => position.id === linked.id ? { ...position, quantity: remainingQuantity, totalCost: remainingTotalCost, status: remainingQuantity > 0 ? position.status : 'archived', archivedAt: remainingQuantity > 0 ? null : now, updatedAt: now } : position);
  return ((option.strike || 0) * sellShares) - proportionalCost;
}
function scheduleOptionDecisionReviews(option) {
  const decidedAt = option.closedAt ? `${option.closedAt}T12:00:00.000Z` : new Date().toISOString();
  const label = `${option.underlying || option.ticker || 'Opción'} (${OPTION_STATUS_LABELS[option.status] || option.status})`;
  const checkpoints = [{ phase: '3m', days: 90 }, { phase: '6m', days: 180 }, { phase: '12m', days: 365 }];
  const existingPhases = new Set((state.decisionReviews || []).filter(item => item.recommendationId === option.id).map(item => item.phase));
  const additions = checkpoints.filter(checkpoint => !existingPhases.has(checkpoint.phase)).map(checkpoint => migrateDecisionReview({
    recommendationId: option.id, title: label, category: 'Opciones', phase: checkpoint.phase,
    actionLabel: OPTION_STATUS_LABELS[option.status] || option.status, status: 'pending',
    reason: option.closeReason || '', expectedOutcome: option.thesis || option.exitPlan || '',
    createdAt: option.createdAt || decidedAt, decidedAt,
    reviewDate: new Date(new Date(decidedAt).getTime() + checkpoint.days * 86400000).toISOString()
  }));
  if (additions.length) state.decisionReviews = [...additions, ...(state.decisionReviews || [])];
}
function applyOptionAction() {
  const option = state.options.find(item => item.id === managingOptionId);
  if (!option) return;
  const action = $('#optionActionType').value;
  const date = $('#optionActionDate').value || new Date().toISOString().slice(0, 10);
  const closePremium = parseLocaleNumber($('#optionActionPremium').value);
  const closeFees = parseLocaleNumber($('#optionActionFees').value) || 0;
  const reason = cleanText($('#optionActionReason').value);
  const shares = (option.contracts || 0) * (option.multiplier || 100);
  const now = new Date().toISOString();
  const openCashFlow = optionLegCashFlow(option.side, option.premiumPerShare, shares, option.fees || 0, true);
  let updated = { ...option, updatedAt: now };
  let extraNotice = '';

  if (action === 'close') {
    const closeCashFlow = optionLegCashFlow(option.side, closePremium, shares, closeFees, false);
    updated = { ...updated, status: 'closed', closedAt: date, closePremiumPerShare: closePremium, closeFees, closeReason: reason, realizedResult: openCashFlow + closeCashFlow };
  } else if (action === 'expired') {
    updated = { ...updated, status: 'expired', closedAt: date, closePremiumPerShare: 0, closeFees: 0, closeReason: reason || 'Vencida sin valor.', realizedResult: openCashFlow };
  } else if (action === 'assigned') {
    applyPutAssignment(option);
    updated = { ...updated, status: 'assigned', closedAt: date, closeReason: reason || 'Asignada: acciones incorporadas a la cartera. La prima queda incorporada al precio de coste, no se contabiliza aparte.', realizedResult: null };
    extraNotice = ' La cartera se ha actualizado con las acciones asignadas.';
  } else if (action === 'exercised') {
    const capitalGain = applyCoveredCallExercise(option);
    updated = { ...updated, status: 'exercised', closedAt: date, closeReason: reason || 'Ejercida: acciones vendidas al strike.', realizedResult: openCashFlow + capitalGain };
    extraNotice = ' La cartera se ha actualizado reduciendo las acciones cubiertas.';
  } else if (action === 'cancelled') {
    updated = { ...updated, status: 'cancelled', closedAt: date, closeReason: reason || 'Propuesta cancelada.' };
  } else if (action === 'roll') {
    const closeCashFlow = optionLegCashFlow(option.side, closePremium, shares, closeFees, false);
    const newOption = migrateOptionPosition({
      ...option, id: undefined,
      strike: parseLocaleNumber($('#rollStrike').value) ?? option.strike,
      expiration: $('#rollExpiration').value || option.expiration,
      premiumPerShare: parseLocaleNumber($('#rollPremiumPerShare').value),
      contracts: Number($('#rollContracts').value || option.contracts),
      fees: parseLocaleNumber($('#rollFees').value) || 0,
      status: 'open', rollFromId: option.id, rolledToId: '', openedAt: date,
      closedAt: '', closePremiumPerShare: null, closeFees: 0, closeReason: '', realizedResult: null,
      createdAt: now, updatedAt: now
    });
    updated = { ...updated, status: 'rolled', closedAt: date, closePremiumPerShare: closePremium, closeFees, closeReason: reason || 'Rolada a nuevo contrato.', realizedResult: openCashFlow + closeCashFlow, rolledToId: newOption.id };
    state.options.unshift(newOption);
    extraNotice = ' Se ha creado el nuevo contrato vinculado.';
  }

  const migratedUpdate = migrateOptionPosition(updated);
  state.options = state.options.map(item => item.id === option.id ? migratedUpdate : item);
  if (['closed', 'expired', 'assigned', 'exercised', 'rolled'].includes(migratedUpdate.status)) scheduleOptionDecisionReviews(migratedUpdate);
  saveState();
  render();
  $('#optionActionDialog').open = false;
  showNotice(`Operación actualizada: ${OPTION_STATUS_LABELS[migratedUpdate.status] || migratedUpdate.status}.${extraNotice}`);
}
function renderOptionHistory() {
  const rowsNode = $('#optionHistoryRows');
  const decisionRowsNode = $('#optionDecisionRows');
  if (!rowsNode) return;
  const closed = sortRows(visibleOptions().filter(option => ['closed', 'expired', 'assigned', 'exercised', 'rolled', 'cancelled'].includes(option.status)), 'options');
  rowsNode.innerHTML = closed.length ? closed.map(option => `<tr><td class="company-cell"><strong>${escapeHtml(option.underlying || option.ticker || 'Sin subyacente')}</strong><small>${escapeHtml(option.ticker || '-')}</small></td><td>${escapeHtml(option.strategy)}</td><td>${escapeHtml(OPTION_STATUS_LABELS[option.status] || option.status)}</td><td>${dateEs(option.openedAt)}</td><td>${dateEs(option.closedAt)}</td><td class="${(option.realizedResult || 0) >= 0 ? 'positive' : 'negative'}">${option.realizedResult === null || option.realizedResult === undefined ? '-' : eur.format(option.realizedResult)}</td><td><wa-button size="small" appearance="plain" data-delete-option="${option.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-cell">Sin operaciones cerradas todavía.</td></tr>';
  if (!decisionRowsNode) return;
  const reviews = decisionReviewsRows().filter(item => item.category === 'Opciones');
  decisionRowsNode.innerHTML = reviews.length ? reviews.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.actionLabel)}</small></td><td>${escapeHtml(item.phaseLabel)}</td><td>${dateEs(String(item.reviewDate || '').slice(0, 10))}</td><td>${escapeHtml(item.statusLabel)}</td><td>${escapeHtml(item.lesson || item.reason || item.expectedOutcome || 'Sin aprendizaje registrado')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Sin revisiones todavía.</td></tr>';
}
function renderOptionsCalendar() {
  const node = $('#optionsCalendarRows');
  if (!node) return;
  const events = [];
  visibleOptions().filter(option => ['open', 'proposal', 'rolled'].includes(option.status)).forEach(option => {
    const label = option.underlying || option.ticker || 'Opción';
    if (option.expiration) events.push({ date: option.expiration, tone: optionDaysToExpiration(option) <= 7 ? 'risk' : optionDaysToExpiration(option) <= 30 ? 'warn' : 'good', title: 'Vencimiento', detail: `${label} | ${option.strategy}` });
    if (option.earningsDate) events.push({ date: option.earningsDate, tone: 'warn', title: 'Resultados', detail: label });
    if (option.exDividendDate) events.push({ date: option.exDividendDate, tone: 'warn', title: 'Ex-dividendo', detail: label });
  });
  decisionReviewsRows().filter(item => item.category === 'Opciones' && ['pending', 'reviewing'].includes(item.status)).forEach(item => {
    if (item.reviewDate) events.push({ date: item.reviewDate, tone: 'good', title: 'Revisión de decisión', detail: item.title });
  });
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  node.className = events.length ? 'signal-list' : 'signal-list empty-state';
  node.innerHTML = events.length ? events.map(event => `<div class="signal-row signal-${event.tone}"><strong>${dateEs(String(event.date).slice(0, 10))}</strong><span>${escapeHtml(event.title)}</span><small>${escapeHtml(event.detail)}</small></div>`).join('') : 'Sin eventos próximos.';
}
function optionsPerformanceStats() {
  const all = visibleOptions();
  const terminal = all.filter(option => ['closed', 'expired', 'assigned', 'exercised', 'rolled'].includes(option.status));
  const grossPremium = all.reduce((sum, option) => sum + optionDerived(option).grossPremium, 0);
  const netPremium = all.reduce((sum, option) => sum + optionDerived(option).netPremium, 0);
  const withResult = terminal.filter(option => option.realizedResult !== null && option.realizedResult !== undefined);
  const realized = withResult.reduce((sum, option) => sum + option.realizedResult, 0);
  const winners = withResult.filter(option => option.realizedResult > 0).length;
  const losers = withResult.filter(option => option.realizedResult < 0).length;
  const winRate = withResult.length ? winners / withResult.length : null;
  const capitalValues = all.map(option => optionDerived(option).capitalCommitted).filter(value => value > 0);
  const avgCapital = capitalValues.length ? capitalValues.reduce((sum, value) => sum + value, 0) / capitalValues.length : 0;
  const daysValues = terminal.filter(option => option.openedAt && option.closedAt).map(option => Math.max(0, (new Date(option.closedAt) - new Date(option.openedAt)) / 86400000));
  const avgDays = daysValues.length ? Math.round(daysValues.reduce((sum, value) => sum + value, 0) / daysValues.length) : 0;
  return { all, terminal, grossPremium, netPremium, withResult, realized, winners, losers, winRate, avgCapital, avgDays };
}
function optionsBenchmark() {
  const stats = optionsPerformanceStats();
  const benchmarkRate = state.settings.optionsBenchmarkRate ?? 0.08;
  const drawdowns = [];
  let running = 0;
  let peak = 0;
  [...stats.withResult].sort((a, b) => (a.closedAt || '').localeCompare(b.closedAt || '')).forEach(option => {
    running += option.realizedResult || 0;
    peak = Math.max(peak, running);
    drawdowns.push(peak - running);
  });
  const maxDrawdown = drawdowns.length ? Math.max(...drawdowns) : 0;
  const returnOnCapital = stats.avgCapital ? stats.realized / stats.avgCapital : null;
  const annualizedReturn = returnOnCapital !== null && stats.avgDays ? returnOnCapital * (365 / Math.max(1, stats.avgDays)) : returnOnCapital;
  const valueAdded = annualizedReturn !== null ? annualizedReturn - benchmarkRate : null;
  return { ...stats, benchmarkRate, returnOnCapital, annualizedReturn, valueAdded, maxDrawdown };
}
function renderOptionsBenchmark() {
  const node = $('#optionsBenchmark');
  if (!node) return;
  const b = optionsBenchmark();
  const rateInput = $('#optionsBenchmarkRateInput');
  if (rateInput && document.activeElement !== rateInput) rateInput.value = num.format(b.benchmarkRate * 100);
  if (!b.withResult.length) { node.className = 'summary-stack empty-state'; node.innerHTML = 'Sin operaciones cerradas todavía para comparar.'; return; }
  node.className = 'summary-stack';
  node.innerHTML = `<strong>Resultado neto: ${eur.format(b.realized)}</strong><small>Capital medio comprometido: ${eur.format(b.avgCapital)}</small><small>Rentabilidad sobre capital: ${b.returnOnCapital !== null ? formatPercent(b.returnOnCapital) : '--'} (${b.avgDays} días medios)</small><small>Rentabilidad anualizada estimada: ${b.annualizedReturn !== null ? formatPercent(b.annualizedReturn) : '--'}</small><small>Benchmark (${formatPercent(b.benchmarkRate)} anual): valor añadido ${b.valueAdded !== null ? formatPercent(b.valueAdded) : '--'}</small><small>Drawdown máximo acumulado: ${eur.format(b.maxDrawdown)}</small><small>Operaciones: ${b.winners} ganadoras / ${b.losers} perdedoras</small>`;
}
function saveOptionsBenchmarkRate(event) {
  event.preventDefault();
  const rate = normalizePercentLike($('#optionsBenchmarkRateInput').value, 0.08);
  state.settings.optionsBenchmarkRate = rate;
  saveState();
  renderOptionsBenchmark();
  showNotice('Benchmark de opciones actualizado.');
}
function renderOptionsStats() {
  if (!$('#statPremiumNet')) return;
  const { grossPremium, netPremium, withResult, realized, winners, losers, winRate, avgCapital, avgDays } = optionsPerformanceStats();
  $('#statPremiumNet').textContent = eur.format(netPremium);
  $('#statPremiumGross').textContent = `Brutas: ${eur.format(grossPremium)}`;
  $('#statRealized').textContent = eur.format(realized);
  $('#statRealizedMeta').textContent = `${winners} ganadoras | ${losers} perdedoras`;
  $('#statWinRate').textContent = winRate === null ? '--' : formatPercent(winRate);
  $('#statAvgCapital').textContent = eur.format(avgCapital);
  $('#statAvgDays').textContent = `Días medios por operación: ${avgDays}`;
  const groupBy = (list, keyFn) => { const map = new Map(); list.forEach(option => { const key = keyFn(option) || 'Sin clasificar'; const entry = map.get(key) || { count: 0, result: 0 }; entry.count += 1; entry.result += option.realizedResult || 0; map.set(key, entry); }); return [...map.entries()].sort((a, b) => b[1].result - a[1].result); };
  const renderGroup = (nodeId, groups) => { const node = $(nodeId); if (!node) return; node.className = groups.length ? 'signal-list' : 'signal-list empty-state'; node.innerHTML = groups.length ? groups.map(([key, entry]) => `<div class="signal-row signal-${entry.result >= 0 ? 'good' : 'risk'}"><strong>${escapeHtml(key)}</strong><span>${eur.format(entry.result)}</span><small>${entry.count} operación${entry.count === 1 ? '' : 'es'}</small></div>`).join('') : 'Sin datos'; };
  renderGroup('#statByStrategy', groupBy(withResult, option => option.strategy));
  renderGroup('#statByUnderlying', groupBy(withResult, option => option.underlying || option.ticker));
  renderGroup('#statByYear', groupBy(withResult, option => option.closedAt ? option.closedAt.slice(0, 4) : null));
  renderGroup('#statByCurrency', groupBy(withResult, option => option.currency));
}
function reviewCheckpointsForRecommendation(recommendation, actionLabel, status, reason) { const decidedAt = new Date().toISOString(); return [{ phase: '3m', days: 90 }, { phase: '6m', days: 180 }, { phase: '12m', days: 365 }].map(checkpoint => migrateDecisionReview({ recommendationId: recommendation.id, title: recommendation.title, category: recommendation.category, phase: checkpoint.phase, actionLabel, status: ['accepted', 'executed'].includes(status) ? 'pending' : status, reason, expectedOutcome: recommendation.action || recommendation.impact, lesson: '', createdAt: recommendation.createdAt || decidedAt, decidedAt, reviewDate: new Date(Date.now() + checkpoint.days * 86400000).toISOString() })); }
function handleRecommendationAction(action, recommendationId) { const index = state.recommendations.findIndex(item => item.id === recommendationId); if (index < 0) return; const recommendation = state.recommendations[index]; const promptReason = window.prompt(`Motivo para marcar la recomendación como ${recommendationActionLabel(action).toLowerCase()}:`, recommendation.reason || ''); const reason = promptReason ?? recommendation.reason ?? ''; const nextStatus = action === 'accept' ? 'accepted' : action === 'execute' ? 'executed' : action === 'postpone' ? 'postponed' : 'discarded'; state.recommendations[index] = migrateRecommendation({ ...recommendation, status: nextStatus, reason, decidedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); state.decisionReviews = [...reviewCheckpointsForRecommendation(recommendation, recommendationActionLabel(action), nextStatus, reason), ...(state.decisionReviews || []).filter(item => item.recommendationId !== recommendationId)].map(migrateDecisionReview); saveState(); renderAdvisorCenter(); renderSortableHeaders(); showNotice(`Recomendación ${recommendationActionLabel(action).toLowerCase()}.`); }
function undoLastImport() { if (!state.lastImportUndo?.snapshot) { showNotice('No hay ninguna importación que deshacer.'); return; } const snapshot = state.lastImportUndo.snapshot; state.portfolio = (snapshot.portfolio || []).map(migratePosition).filter(Boolean); state.transactions = (snapshot.transactions || []).map(migrateTransaction).filter(Boolean); state.options = (snapshot.options || []).map(migrateOptionPosition).filter(Boolean); state.recommendations = (snapshot.recommendations || []).map(migrateRecommendation).filter(Boolean); state.decisionReviews = (snapshot.decisionReviews || []).map(migrateDecisionReview).filter(Boolean); state.advisor = { ...defaultAdvisorState(snapshot.settings || DEFAULT_SETTINGS), ...(snapshot.advisor || {}) }; state.history = (snapshot.history || []).map(migrateSnapshot).filter(Boolean); state.assets = (snapshot.assets || []).map(migrateAsset).filter(Boolean); state.liabilities = (snapshot.liabilities || []).map(migrateLiability).filter(Boolean); state.reportHistory = (snapshot.reportHistory || []).map(migrateReportEntry).filter(Boolean); state.settings = migrateSettings(snapshot.settings); state.lastImport = snapshot.lastImport || null; state.lastTransactionsImport = snapshot.lastTransactionsImport || null; state.lastBackupAt = snapshot.lastBackupAt || null; state.lastImportUndo = null; saveState(); render(); showNotice('Se ha restaurado la copia previa a la última importación.'); }
function optionsOpenRiskLines() {
  const open = visibleOptions().filter(option => ['open', 'rolled'].includes(option.status));
  if (!open.length) return ['- Sin posiciones abiertas.'];
  const lines = [];
  open.forEach(option => {
    const analysis = computeOptionAnalysis(option);
    const trafficLight = optionRiskTrafficLight(option, analysis);
    if (trafficLight.tone !== 'good') lines.push(`- ${option.underlying || option.ticker}: ${trafficLight.reasons.join(' ')}`);
  });
  return lines.length ? lines : ['- Sin alertas relevantes en las posiciones abiertas.'];
}
function optionsClosedThisMonthLines() {
  const monthKey = currentMonthKey();
  const closed = visibleOptions().filter(option => option.closedAt && option.closedAt.slice(0, 7) === monthKey);
  if (!closed.length) return ['- Sin operaciones cerradas este mes.'];
  return closed.map(option => `- ${option.underlying || option.ticker}: ${OPTION_STATUS_LABELS[option.status] || option.status} el ${dateEs(option.closedAt)} | resultado ${option.realizedResult === null || option.realizedResult === undefined ? 'incorporado a cartera' : eur.format(option.realizedResult)}`);
}
function optionsPendingReviewLines() {
  const pending = decisionReviewsRows().filter(item => item.category === 'Opciones' && ['pending', 'reviewing'].includes(item.status));
  if (!pending.length) return ['- Sin decisiones de opciones pendientes de revisión.'];
  return pending.slice(0, 10).map(item => `- ${item.title} | ${item.phaseLabel} | revisar ${dateEs(String(item.reviewDate || '').slice(0, 10))}`);
}
function optionsStressScenarioLines() {
  const stress = optionStressScenario();
  return [
    `- Puts abiertas consideradas: ${stress.positions}`,
    `- Coste total si se asignan todas hoy: ${eur.format(stress.totalAssignmentCost)}`,
    `- Liquidez restante tras la asignación total: ${eur.format(stress.liquidityAfter)}`,
    `- ¿Seguiría siendo cómoda la situación patrimonial? ${stress.stillComfortable ? 'Sí' : 'No: haría falta liquidez adicional o vender otros activos.'}`
  ];
}
function buildPortfolioDataMarkdown() { const portfolio = sortedPortfolio(activePortfolio()); const metrics = fullMetrics(portfolio); const sector = groupByValue(portfolio, 'sector', metrics.value); const country = groupByValue(portfolio, 'country', metrics.value); const score = portfolioScore(portfolio); const signals = concentrationSignals(portfolio); const scenarios = independenceScenarios(metrics); const transactions = transactionRowsData(); const txAnalytics = transactionAnalytics(transactions); const options = optionsSummary(); const recommendations = buildRecommendations(); const reviews = decisionReviewsRows();
  const rentas = rentasSummary(); const fiscal = rentas.fiscal; const currencyExposure = groupByValue(portfolio, 'currency', metrics.value);
  const accountLines = state.accounts.length ? state.accounts.map(account => { const summary = accountSummary(account); const rule = quarterlyRuleStatus(account); return `- ${account.name} (${ACCOUNT_TYPE_LABELS[account.type]}, ${ownerName(account.ownerId)}): ${eur.format(summary.value)} | ${summary.positionsCount} posiciones${rule ? ` | Regla trimestral: ${rule.qualifies ? 'cumplida' : 'pendiente'}` : ''}`; }) : ['- No hay cuentas registradas.'];
  const projectLines = state.projects.length ? state.projects.map(project => { const totals = projectTotals(project); const next = nextCommitment(project); return `- ${project.name} (${PROJECT_TYPE_LABELS[project.type]}): pagado ${eur.format(totals.paid)} | pendiente ${eur.format(totals.pending)}${project.mortgageExpected ? ` | hipoteca prevista ${eur.format(project.mortgageExpected)}` : ''}${next ? ` | próximo compromiso ${eur.format(next.amount)} el ${dateEs(next.dueDate)}` : ''}`; }) : ['- No hay proyectos registrados.'];
  const macroLines = MACRO_SCENARIOS.map(scenario => { const result = applyMacroScenario(scenario.id); return `- ${scenario.label}: patrimonio ${eur.format(result.netWorth)} | renta mensual ${eur.format(result.monthlyIncome)} | caída máxima ${Math.round(result.maxDrop * 100)}% | horizonte objetivo ${result.fiEta}`; });
  const regulatoryLines = state.regulatoryWatch.length ? state.regulatoryWatch.map(entry => `- [${REGULATORY_STATUS_LABELS[entry.status]}] ${entry.title}${entry.date ? ` (${dateEs(entry.date)})` : ''}${entry.impact ? ` | Impacto: ${entry.impact}` : ''}`) : ['- No hay entradas de seguimiento normativo.'];
  return ['# Datos patrimoniales exportados', '', `Fecha del informe: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date())}`, '', '## Diagnóstico ejecutivo', executiveVerdict(recommendations), '', '## Resumen patrimonial', `- Valor de cartera: ${eur.format(metrics.value)}`, `- Coste invertido: ${eur.format(metrics.cost)}`, `- Plusvalía: ${eur.format(metrics.gain)}`, `- Dividendos anuales estimados: ${eur.format(metrics.dividends)}`, `- Liquidez registrada: ${eur.format(metrics.liquidity)}`, `- Liquidez útil tras garantías: ${eur.format(Math.max(0, metrics.liquidity - options.totalCollateral))}`, `- Otros activos: ${eur.format(metrics.otherAssets)}`, `- Deuda total: ${eur.format(metrics.liabilities)}`, `- Patrimonio neto: ${eur.format(metrics.netWorth)}`, '', '## Salud de la cartera', `- Puntuación global: ${score.value}/100 (${score.label})`, ...signals.map(signal => `- Concentración ${signal.title.toLowerCase()}: ${signal.name} con ${pct.format(signal.weight)} (${signal.label})`), '', '## Objetivos financieros', `- Gasto mensual objetivo: ${state.settings.monthlyExpense === null ? 'No configurado' : eur.format(state.settings.monthlyExpense)}`, `- Objetivo anual de dividendos: ${state.settings.targetAnnualDividends === null ? 'No configurado' : eur.format(state.settings.targetAnnualDividends)}`, `- Objetivo de patrimonio neto: ${state.settings.targetNetWorth === null ? 'No configurado' : eur.format(state.settings.targetNetWorth)}`, `- Aportación mensual prevista: ${state.settings.monthlyContribution === null ? 'No configurada' : eur.format(state.settings.monthlyContribution)}`, '', '## Escenarios de independencia financiera', ...(scenarios ? scenarios.map(s => `- ${s.label}: ${s.years === null ? 'más de 40 años' : `${s.years} años`} | meta estimada ${s.eta}`) : ['- Configura el gasto mensual para obtener escenarios.']), '', '## Cambios frente al cierre anterior', ...reportDeltaSection(), '', '## Actividad de capital y transacciones', `- Operaciones importadas: ${transactions.length}`, `- Compras netas 12m: ${eur.format(txAnalytics.lastTwelveMonths.netAmount)}`, `- Comisiones e impuestos acumulados: ${eur.format(txAnalytics.allTotals.costs)}`, `- Plusvalía realizada estimada: ${eur.format(txAnalytics.realized)}`, `- Ritmo medio de compras 6m: ${eur.format(txAnalytics.monthlyBuys)}`, '', '## Opciones', '', '### Resumen', `- Posiciones abiertas: ${options.open.length}`, `- Prima neta acumulada: ${eur.format(options.totalPremium)}`, `- Capital comprometido: ${eur.format(options.totalCollateral)}`, `- Liquidez libre tras opciones: ${eur.format(Math.max(0, metrics.liquidity - options.totalCollateral))}`, `- Próximos vencimientos (45 días): ${options.expiringSoon.length}`, `- Exposición potencial por asignación: ${eur.format(options.assignedPotential)}`, '', '### Posiciones abiertas', '| Subyacente | Estrategia | Strike | Vencimiento | Prima | Breakeven | Capital comprometido | Estado |', '|---|---|---:|---|---:|---:|---:|---|', ...(options.open.length ? options.open.map(option => { const derived = optionDerived(option); return `| ${(option.underlying || option.ticker || '-').replaceAll('|', '/')} | ${option.strategy} | ${eur.format(option.strike || 0)} | ${dateEs(option.expiration)} | ${eur.format(derived.netPremium)} | ${derived.effectiveEntry === null ? '-' : eur.format(derived.effectiveEntry)} | ${eur.format(derived.capitalCommitted)} | ${OPTION_STATUS_LABELS[option.status] || option.status} |`; }) : ['| - | - | - | - | - | - | - | - |']), '', '### Riesgos', ...(optionsOpenRiskLines()), '', '### Operaciones cerradas del mes', ...optionsClosedThisMonthLines(), '', '### Decisiones pendientes', ...optionsPendingReviewLines(), '', '### Escenario de asignación total', ...optionsStressScenarioLines(), '', '### Preguntas para ChatGPT', '- ¿Qué put o covered call actuales tienen peor relación riesgo/prima?', '- Si todas las puts abiertas se asignaran hoy, ¿qué cambiaría en la concentración de la cartera?', '- ¿Alguna operación debería cerrarse o rolarse antes de vencimiento?', '', '## Recomendaciones priorizadas', ...(recommendations.length ? recommendations.map(item => `- [${advisoryKindLabel(item.kind)}] ${item.title} | urgencia ${item.urgency} | impacto ${item.impact} | revisar ${dateEs(String(item.reviewDate).slice(0, 10))} | acción: ${item.action}`) : ['- No hay recomendaciones activas.']), '', '## Seguimiento de decisiones', ...(reviews.length ? reviews.slice(0, 12).map(item => `- ${item.phaseLabel} | ${item.title} | estado ${item.statusLabel} | revisión ${dateEs(String(item.reviewDate || '').slice(0, 10))} | esperado: ${item.expectedOutcome || '-'} | observado: ${item.actualOutcome || '-'} | aprendizaje: ${item.lesson || '-'}`) : ['- No hay revisiones registradas.']), '', '## Cartera', '| Empresa | Ticker | ISIN | Valor | Peso | Dividendo anual | Yield | YOC | Estado |', '|---|---|---|---:|---:|---:|---:|---:|---|', ...portfolio.map(position => `| ${position.name.replaceAll('|', '/')} | ${position.symbol} | ${position.isin} | ${eur.format(position.marketValue || 0)} | ${formatPercent(position.allocation)} | ${eur.format(position.annualDividend || 0)} | ${formatPercent(position.dividendYield)} | ${formatPercent(position.yieldOnCost)} | ${position.status} |`), '', '## Distribución por sectores', ...sector.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Distribución geográfica', ...country.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Exposición por divisa', '(Divisa de negociación, no exposición económica real de cada empresa)', ...currencyExposure.map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Cuentas y brokers', ...accountLines, '', '## Proyectos', ...projectLines, '', '## Fiscalidad estimada', `- Renta bruta anual: ${eur.format(rentas.grossAnnual)}`, `- Renta neta anual estimada: ${eur.format(rentas.netAnnual)}`, `- Dividendos: bruto ${eur.format(fiscal.dividends.gross)} | retención origen ${eur.format(fiscal.dividends.originWithheld)} | retención destino ${eur.format(fiscal.dividends.destinationWithheld)} | neto ${eur.format(fiscal.dividends.net)}`, `- Opciones: bruto ${eur.format(fiscal.options.gross)} | neto ${eur.format(fiscal.options.net)}`, `- Intereses: bruto ${eur.format(fiscal.interest.gross)} | neto ${eur.format(fiscal.interest.net)}`, `- Alquiler y otros: bruto ${eur.format(fiscal.rent.gross)} | neto ${eur.format(fiscal.rent.net)}`, '(Estimación orientativa, no sustituye una declaración real ni a un asesor fiscal)', '', '## Escenarios macro', ...macroLines, '', '## Regulatory Watch', ...regulatoryLines, '', '## Liquidez, activos y deuda', ...state.assets.map(asset => `- Activo ${asset.name} (${asset.type}): ${eur.format(asset.value || 0)}`), ...state.liabilities.map(liability => `- Deuda ${liability.name} (${liability.type}): ${eur.format(liability.value || 0)}`), '', '## Histórico de informes registrados', ...recentReportSummary(), '', '## Comentarios personales', '- Exportado desde la aplicación local-first. Los datos permanecen en el dispositivo.'].join('\n'); }
async function markdown() { const portfolio = sortedPortfolio(activePortfolio()); const metrics = fullMetrics(portfolio); const score = portfolioScore(portfolio); const filename = `comite-inversion-family-office-${new Date().toISOString().slice(0, 10)}.md`; const promptTemplate = await loadAnalysisPromptTemplate(); const dataBlock = buildPortfolioDataMarkdown(); const finalDocument = mergePromptWithData(promptTemplate, dataBlock); download(filename, finalDocument, 'text/markdown'); saveReportHistoryEntry({ ...defaultReportEntry(), createdAt: new Date().toISOString(), score: score.value, netWorth: metrics.netWorth, dividends: metrics.dividends, concentrationLabel: score.concentrationLabel, filename }); saveState(); renderReportHistory(); showNotice('Informe generado con prompt editable y registrado en el histórico.'); }
ensureAdvisoryState();
saveState();
render();
applyDefaultOwnerToEntryForms();


function loadGuidedDemo() {
  askConfirm('Se sustituiran los datos locales actuales por la demo anual de ejemplo. Puedes exportar una copia JSON antes si quieres conservarlos.', () => {
    const currentTheme = state.theme === 'dark' ? 'dark' : 'light';
    const demo = migrateState({
      ...createDemoState(),
      transactions: DEMO_TRANSACTIONS.map(migrateTransaction),
      tableSorts: defaultTableSorts(),
      lastImportUndo: null,
      backups: [],
      theme: currentTheme
    });
    Object.assign(state, defaultState(), demo, { theme: currentTheme, lastImportUndo: null, backups: [] });
    ensureAdvisoryState();
    saveState();
    render();
    showNotice('Demo anual cargada en la aplicación.');
  });
}
$('#loadDemoBtn')?.addEventListener('click', loadGuidedDemo);
