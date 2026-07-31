const STORAGE_KEY = 'family-office-nunez-v2';
const SCHEMA_VERSION = 6;
const ACTIVE_STATUSES = new Set(['active', 'watch']);
const ANALYSIS_PROMPT_PATH = './chatgpt-analysis-prompt.md';
const DEFAULT_ANALYSIS_PROMPT = [
  '# Analisis patrimonial para ChatGPT',
  '',
  'Actua como un analista patrimonial senior especializado en family offices, dividend growth, asignacion de capital y seguimiento de independencia financiera.',
  '',
  'Devuelve un analisis accionable, comparativo y priorizado. No inventes datos si faltan.',
  '',
  'Estructura obligatoria:',
  '1. Resumen ejecutivo.',
  '2. Puntuacion global 0-100.',
  '3. Semaforo de concentracion por empresa, pais y sector.',
  '4. Analisis de dividendos.',
  '5. Analisis de liquidez y deuda.',
  '6. Progreso hacia independencia financiera.',
  '7. Riesgos principales.',
  '8. Oportunidades principales.',
  '9. Acciones recomendadas a 30 dias.',
  '10. Acciones recomendadas a 90 dias.',
  '11. Errores a evitar.',
  '12. Preguntas criticas pendientes.',
  '',
  '{{PORTFOLIO_DATA}}'
].join('\n');
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
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const state = loadState();
let pendingImport = null;
let pendingTransactionImport = null;
let confirmAction = null;
let editingPositionId = null;
let deferredWorker = null;
let analysisPromptCache = null;
const historyFilterState = { preset: 'all', fromYear: '', toYear: '' };
let newWorker = null;

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    portfolio: [],
    transactions: [],
    history: [],
    backups: [],
    assets: [],
    liabilities: [],
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
    settings: { ...DEFAULT_SETTINGS },
    tableSorts: defaultTableSorts(),
    lastImport: null,
    lastTransactionsImport: null,
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
        id: 'ES0167050915', isin: 'ES0167050915', symbol: 'ACS', name: 'ACS Actividades de Construccion y Servicios SA',
        quantity: 500, averagePrice: 31.24, totalCost: 15620, currentPrice: 46.1, marketValue: 23050, gain: 7430, gainPercent: 0.4757,
        currency: 'EUR', allocation: 0.183, dividendYield: 0.022, yieldOnCost: 0.0324, annualDividend: 507.1, dividendPerShare: 1.014,
        dividendFrequency: 'semiannual', dividendCagr: 0.06, sector: 'Industriales', country: 'Espana', transactions: 6,
        exDate: '2026-07-04', payDate: '2026-08-10', taxRate: 0.19, notes: 'Posicion demo.', thesis: 'Negocio internacional y caja robusta.',
        targetPrice: 50, status: 'active', unreliableMatch: false, fallbackKey: 'ACS|ACS ACTIVIDADES DE CONSTRUCCION Y SERVICIOS SA',
        createdAt: '2026-07-31T09:00:00.000Z', updatedAt: '2026-07-31T09:00:00.000Z', archivedAt: null, importMeta: { source: 'demo', importedAt: '2026-07-31T09:00:00.000Z', rowNumber: 1 }, raw: {}
      },
      {
        id: 'US00287Y1091', isin: 'US00287Y1091', symbol: 'ABBV', name: 'AbbVie Inc',
        quantity: 110, averagePrice: 121.4, totalCost: 13354, currentPrice: 171.3, marketValue: 18843, gain: 5489, gainPercent: 0.411,
        currency: 'USD', allocation: 0.149, dividendYield: 0.0492, yieldOnCost: 0.0694, annualDividend: 925.9, dividendPerShare: 8.417,
        dividendFrequency: 'quarterly', dividendCagr: 0.07, sector: 'Salud', country: 'Estados Unidos', transactions: 5,
        exDate: '2026-07-14', payDate: '2026-08-16', taxRate: 0.15, notes: 'Posicion core de dividend growth.', thesis: 'Pipeline resiliente.',
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
        dividendFrequency: 'annual', dividendCagr: 0.18, sector: 'Tecnologia', country: 'Paises Bajos', transactions: 4,
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
      { id: 'opt-demo-1', underlying: 'AbbVie Inc', ticker: 'ABBV', isin: 'US00287Y1091', optionType: 'put', strategy: 'cash-secured-put', objective: 'acquire', openedAt: '2026-06-12', expiration: '2026-09-18', strike: 155, contracts: 1, multiplier: 100, premiumPerShare: 4.25, fees: 1.8, collateral: 15500, status: 'open', thesis: 'Entrada deseada a precio mas prudente tras rally.', createdAt: '2026-06-12T10:00:00.000Z', updatedAt: '2026-07-28T18:00:00.000Z' },
      { id: 'opt-demo-2', underlying: 'ASML Holding NV', ticker: 'ASML', isin: 'NL0010273215', optionType: 'put', strategy: 'cash-secured-put', objective: 'income', openedAt: '2026-07-03', expiration: '2026-08-21', strike: 680, contracts: 1, multiplier: 100, premiumPerShare: 9.6, fees: 2.1, collateral: 68000, status: 'open', thesis: 'Prima atractiva, pero con riesgo real de tensionar liquidez si coincide con compra de vivienda.', createdAt: '2026-07-03T09:30:00.000Z', updatedAt: '2026-07-29T18:00:00.000Z' },
      { id: 'opt-demo-3', underlying: 'ACS Actividades de Construccion y Servicios SA', ticker: 'ACS', isin: 'ES0167050915', optionType: 'put', strategy: 'cash-secured-put', objective: 'acquire', openedAt: '2026-05-09', expiration: '2026-07-19', strike: 41, contracts: 1, multiplier: 100, premiumPerShare: 1.7, fees: 1.3, collateral: 4100, status: 'expired', thesis: 'Operacion defensiva para mejorar precio de entrada.', createdAt: '2026-05-09T09:30:00.000Z', updatedAt: '2026-07-19T18:00:00.000Z' }
    ],
    recommendations: [
      { id: 'liq-buffer', kind: 'alert', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', action: 'Suspender compras discrecionales hasta reconstruir al menos seis meses de gasto mas el colchon para la segunda residencia.', urgency: 'Alta', explanation: 'La caja util queda por debajo del umbral prudente al descontar garantias de puts y preparacion de hipoteca.', justification: 'La combinacion de liquidez disponible y capital comprometido deja poco margen de maniobra.', impact: 'Alto', risk: 'Alto', reviewDate: '2026-08-31', status: 'accepted', reason: 'Se prioriza liquidez antes de asumir nueva deuda.', createdAt: '2026-07-01T08:00:00.000Z', updatedAt: '2026-07-18T08:00:00.000Z', decidedAt: '2026-07-18T08:00:00.000Z' },
      { id: 'international-balance', kind: 'recommendation', title: 'Dirigir nuevas aportaciones a paises o sectores infraponderados', category: 'Asignacion', action: 'Las siguientes compras deben salir del sesgo Espana/UK y reforzar calidad internacional.', urgency: 'Media', explanation: 'La cartera sigue concentrando demasiado peso en Espana y en negocios maduros de alto dividendo.', justification: 'La exposicion geografica dominante limita la resiliencia del flujo futuro.', impact: 'Medio', risk: 'Medio', reviewDate: '2026-10-15', status: 'pending', reason: '', createdAt: '2026-07-05T08:00:00.000Z', updatedAt: '2026-07-05T08:00:00.000Z', decidedAt: null },
      { id: 'options-cash-check', kind: 'alert', title: 'Revisar si todas las puts abiertas serian asumibles si se asignaran hoy', category: 'Opciones', action: 'Reducir o rolar la put mas exigente en caja si compromete la comodidad patrimonial.', urgency: 'Alta', explanation: 'La put sobre ASML concentra demasiado capital comprometido frente a la liquidez disponible.', justification: 'Una asignacion simultanea alteraria liquidez y concentracion de forma brusca.', impact: 'Alto', risk: 'Alto', reviewDate: '2026-08-14', status: 'pending', reason: '', createdAt: '2026-07-08T08:00:00.000Z', updatedAt: '2026-07-08T08:00:00.000Z', decidedAt: null }
    ],
    decisionReviews: [
      { id: 'decision-demo-1', recommendationId: 'liq-buffer', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', phase: '3m', phaseLabel: 'Revision 3 meses', actionLabel: 'Aceptada', status: 'pending', statusLabel: 'Pendiente', reason: 'Se prioriza caja hasta firma hipotecaria.', expectedOutcome: 'Proteger flexibilidad y evitar ventas forzadas.', actualOutcome: '', lesson: '', createdAt: '2026-07-01T08:00:00.000Z', decidedAt: '2026-07-18T08:00:00.000Z', reviewDate: '2026-10-18', reviewedAt: '' },
      { id: 'decision-demo-2', recommendationId: 'acs-freeze-q1', title: 'No ampliar ACS durante el primer trimestre', category: 'Concentracion', phase: '6m', phaseLabel: 'Revision 6 meses', actionLabel: 'Ejecutada', status: 'reviewing', statusLabel: 'En revision', reason: 'Se evitó seguir cargando una posicion ya dominante.', expectedOutcome: 'Reducir sesgo en empresa y pais.', actualOutcome: 'La concentracion bajo ligeramente y se desplegó capital en Visa y ASML.', lesson: 'La disciplina de no comprar tambien es una decision rentable en riesgo.', createdAt: '2026-01-12T08:00:00.000Z', decidedAt: '2026-01-15T08:00:00.000Z', reviewDate: '2026-07-15', reviewedAt: '2026-07-30T19:00:00.000Z' },
      { id: 'decision-demo-3', recommendationId: 'eng-review-2025', title: 'Reducir el peso de Enagas y revisar tesis de dividendo', category: 'Dividendos', phase: '12m', phaseLabel: 'Revision 12 meses', actionLabel: 'Ejecutada', status: 'closed', statusLabel: 'Cerrada', reason: 'Se detectó deterioro regulatorio y menor calidad de crecimiento.', expectedOutcome: 'Reducir riesgo de trampa de yield.', actualOutcome: 'Se recortó exposicion y el capital se reasignó a negocios de mayor calidad.', lesson: 'El yield alto no compensaba el menor crecimiento y la dependencia regulatoria.', createdAt: '2025-07-20T08:00:00.000Z', decidedAt: '2025-07-24T08:00:00.000Z', reviewDate: '2026-07-24', reviewedAt: '2026-07-29T18:30:00.000Z' },
      { id: 'decision-demo-4', recommendationId: 'cash-floor-2025', title: 'Mantener un suelo minimo de liquidez durante la compra de vivienda', category: 'Liquidez', phase: '12m', phaseLabel: 'Revision 12 meses', actionLabel: 'Ejecutada', status: 'closed', statusLabel: 'Cerrada', reason: 'La prioridad patrimonial era no comprometer la compra ni asumir ventas forzadas.', expectedOutcome: 'Llegar a la firma con margen de seguridad.', actualOutcome: 'Se mantuvo flexibilidad, pero la venta de puts agresivas recortó parte del beneficio de la decision.', lesson: 'La politica de liquidez debe incluir tambien el capital comprometido en opciones, no solo la caja visible.', createdAt: '2025-08-10T08:00:00.000Z', decidedAt: '2025-08-12T08:00:00.000Z', reviewDate: '2026-08-12', reviewedAt: '2026-07-30T18:40:00.000Z' }
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
    country: cleanText(position.country) || 'Sin pais',
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
  const normalized = Number(text.replace(/^\(|\)$/g, '').replace(/\s/g, '').replace(/[â‚¬$Â£]/g, '').replace(/%/g, '').replace(/\./g, '').replace(',', '.'));
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
function dateEs(value) { if (!value) return '-'; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.valueOf()) ? '-' : new Intl.DateTimeFormat('es-ES').format(date); }
function formatPercent(value) { return value === null || value === undefined ? '-' : pct.format(value); }
function formatCurrency(value, currency = 'EUR') { if (value === null || value === undefined) return '-'; return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value); }
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
  const topCountry = groupByValue(portfolio, 'country', metrics.value)[0] || { name: 'Sin dato', weight: 0 };
  const topSector = groupByValue(portfolio, 'sector', metrics.value)[0] || { name: 'Sin dato', weight: 0 };
  const signals = [
    { title: 'Empresa', name: topPosition?.name || 'Sin dato', weight: topPosition ? (topPosition.marketValue || 0) / metrics.value : 0, ...concentrationState(topPosition ? (topPosition.marketValue || 0) / metrics.value : 0, 0.12, 0.2) },
    { title: 'Pais', name: topCountry.name, weight: topCountry.weight, ...concentrationState(topCountry.weight, 0.25, 0.4) },
    { title: 'Sector', name: topSector.name, weight: topSector.weight, ...concentrationState(topSector.weight, 0.2, 0.35) }
  ];
  return signals;
}
function portfolioScore(portfolio = activePortfolio()) {
  if (!portfolio.length) return { value: 0, label: 'Sin datos', detail: 'Importa una cartera para calcular la puntuacion.', concentrationLabel: 'Sin datos' };
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
  return { value: score, label, detail: `${positions} posiciones, ${sectors.length} sectores y ${countries.length} paises representados.`, concentrationLabel: worstTone };
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
      eta: years === null ? 'Mas de 40 anos' : `${new Date().getFullYear() + years}`,
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
  $('#kpiGain').textContent = `Plusvalia: ${eur.format(metrics.gain)}`;
  $('#kpiDividends').textContent = eur.format(metrics.dividends);
  $('#kpiYield').textContent = `Yield: ${pct.format(metrics.yield)}`;
  $('#kpiYoc').textContent = pct.format(metrics.yoc);
  $('#kpiMonthly').textContent = `Media mensual: ${eur.format(metrics.dividends / 12)}`;
  $('#lastUpdated').textContent = state.lastImport ? `Ultima importacion: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(state.lastImport))}` : 'Importa el CSV de DivvyDiary para comenzar.';
  $('#netWorthValue').textContent = eur.format(metrics.netWorth);
  $('#netWorthMeta').textContent = metrics.netWorthGoalProgress === null ? 'Configura un objetivo de patrimonio neto.' : `Progreso: ${pct.format(Math.min(metrics.netWorthGoalProgress, 9.99))}`;
  $('#liquidityValue').textContent = eur.format(metrics.liquidity);
  $('#liquidityMeta').textContent = `Otros activos: ${eur.format(metrics.otherAssets)}`;
  $('#debtValue').textContent = eur.format(metrics.liabilities);
  $('#debtMeta').textContent = lastSnapshot ? `Ultimo cierre: ${eur.format(lastSnapshot.debt || 0)}` : 'Sin cierre mensual todavia.';
  $('#goalValue').textContent = metrics.dividendGoalProgress === null ? '--' : pct.format(Math.min(metrics.dividendGoalProgress, 9.99));
  $('#goalMeta').textContent = state.settings.targetAnnualDividends ? `Objetivo: ${eur.format(state.settings.targetAnnualDividends)}` : 'Configura un objetivo anual de dividendos.';
  $('#snapshotDelta').textContent = lastSnapshot && previousSnapshot ? `Variacion vs. cierre anterior: ${formatPercent(relativeDelta(lastSnapshot.netWorth || 0, previousSnapshot.netWorth || 0))}` : 'Necesitas al menos dos cierres para ver variaciones.';
  $('#latestSnapshot').textContent = lastSnapshot ? `Ultimo cierre: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(lastSnapshot.date))} | Patrimonio neto ${eur.format(lastSnapshot.netWorth || 0)}` : 'Todavia no hay cierres mensuales.';
  $('#portfolioScore').textContent = String(score.value);
  $('#portfolioScoreLabel').textContent = `${score.label} | ${score.value}/100`;
  $('#portfolioScoreMeta').textContent = score.label === 'Sin datos' ? score.detail : `${score.detail} Concentracion ${score.concentrationLabel.toLowerCase()}.`;
  $('#concentrationRows').className = signals.length ? 'signal-list' : 'signal-list empty-state';
  $('#concentrationRows').innerHTML = signals.length ? signals.map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${signal.title}</strong><span>${escapeHtml(signal.name)}</span><small>${formatPercent(signal.weight)} | ${signal.label}</small></div>`).join('') : 'Sin datos';
  $('#fiGoalStatus').textContent = scenarios ? `Objetivo anual: ${eur.format(scenarios[0].target)} | progreso actual ${pct.format(Math.min(scenarios[0].progress, 9.99))}` : 'Configura tu gasto mensual para ver escenarios.';
  $('#fiGoalMeta').textContent = scenarios ? `Aportacion mensual considerada: ${state.settings.monthlyContribution === null ? eur.format(0) : eur.format(state.settings.monthlyContribution)}` : 'Se calcula con dividendos actuales, aportacion mensual y tres supuestos de crecimiento.';
  const fiRows = $('#fiRows');
  if (!scenarios) { fiRows.className = 'scenario-list empty-state'; fiRows.textContent = 'Sin datos'; }
  else { fiRows.className = 'scenario-list'; fiRows.innerHTML = scenarios.map(s => `<div class="scenario-card"><strong>${s.label}</strong><span>${s.status}</span><small>${s.years === null ? 'Mas de 40 anos' : `${s.years} anos`}</small><small>Meta estimada: ${s.eta}</small></div>`).join(''); }
  renderBars('#sectorChart', groupByValue(portfolio, 'sector', metrics.value).slice(0, 8));
  renderBars('#countryChart', groupByValue(portfolio, 'country', metrics.value).slice(0, 8));
  const top = sortRows(sortedPortfolio(portfolio).slice(0, 7), 'topPositions');
  $('#topPositions').innerHTML = top.length ? top.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} | ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td>${eur.format(position.marketValue || 0)}</td><td>${formatPercent(position.allocation ?? (metrics.value ? (position.marketValue || 0) / metrics.value : 0))}</td><td>${eur.format(position.annualDividend || 0)}</td><td>${formatPercent(position.dividendYield)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavia no hay posiciones.</td></tr>';
}
function renderBars(selector, data) { const element = $(selector); if (!data.length) { element.className = 'bar-chart empty-state'; element.textContent = 'Sin datos'; return; } const max = data[0].value || 1; element.className = 'bar-chart'; element.innerHTML = data.map(item => `<div class="bar-row"><span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (item.value / max) * 100)}%"></div></div><span class="bar-value">${pct.format(item.weight)}</span></div>`).join(''); }
function portfolioFilters() { return { query: ($('#searchInput')?.value || '').toLowerCase(), sector: $('#sectorFilter')?.value || '', country: $('#countryFilter')?.value || '', currency: $('#currencyFilter')?.value || '', status: $('#statusFilter')?.value || 'active' }; }
function filteredPortfolio() { const { query, sector, country, currency, status } = portfolioFilters(); const rows = state.portfolio.filter(position => { const haystack = `${position.name} ${position.symbol} ${position.isin}`.toLowerCase(); const positionStatus = normalizeStatus(position.status); const statusOk = status === 'all' ? true : positionStatus === status; return (!query || haystack.includes(query)) && (!sector || position.sector === sector) && (!country || position.country === country) && (!currency || position.currency === currency) && statusOk; }); return sortRows(rows, 'portfolio'); }
function renderPortfolio() { const list = filteredPortfolio(); $('#portfolioRows').innerHTML = list.length ? list.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} | ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td>${position.quantity === null ? '-' : num.format(position.quantity)}</td><td>${formatCurrency(position.averagePrice, position.currency)}</td><td>${formatCurrency(position.currentPrice, position.currency)}</td><td>${formatCurrency(position.marketValue, position.currency)}</td><td class="${(position.gain || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(position.gain, position.currency)}<br><small>${formatPercent(position.gainPercent)}</small></td><td>${formatPercent(position.allocation)}</td><td>${formatCurrency(position.annualDividend, position.currency)}</td><td>${formatPercent(position.dividendYield)}</td><td>${formatPercent(position.yieldOnCost)}</td><td>${dateEs(position.payDate)}</td><td><wa-button size="small" appearance="plain" data-edit-position="${position.id}"><wa-icon name="pen-to-square"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="12" class="empty-cell">No hay resultados.</td></tr>'; }
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
  return `<div class="chart-shell"><div class="chart-stage"><svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(options.ariaLabel || 'Grafico historico')}"><defs><linearGradient id="historyAreaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="${series[0].color}"></stop><stop offset="100%" stop-color="${series[0].color}" stop-opacity="0"></stop></linearGradient></defs>${gridLines}${lines}</svg></div><div class="chart-legend">${legend}</div><div class="chart-axis">${axis}</div></div>`;
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
  if (rate >= inflation + 0.7 && spread > 0) return { title: 'Desinflacion favorable', detail: 'La inflacion cae mientras los tipos siguen por encima: el ciclo sigue restrictivo, pero la cartera esta absorbiendolo bien.' };
  if (rate >= inflation + 0.7) return { title: 'Politica aun restrictiva', detail: 'Los tipos siguen por encima del IPC. Conviene vigilar deuda, liquidez y calidad de beneficios.' };
  if (inflation > 3) return { title: 'Inflacion persistente', detail: 'El IPC sigue alto. Las rentas reales y los margenes merecen seguimiento.' };
  return { title: 'Normalizacion monetaria', detail: 'IPC y tipos se moderan. El foco pasa a crecimiento real, valoraciones y disciplina de aportaciones.' };
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
  const years = [...new Set((state.history || []).map(snapshot => new Date(snapshot.date).getFullYear()).filter(Number.isFinite))].sort((a, b) => a - b);
  return years;
}
function renderHistoryFilterOptions() {
  const years = historyYearOptions();
  [['#historyFromYear', historyFilterState.fromYear], ['#historyToYear', historyFilterState.toYear]].forEach(([selector, current]) => {
    const element = $(selector);
    if (!element) return;
    element.innerHTML = `<wa-option value="">Sin limite</wa-option>` + years.map(year => `<wa-option value="${year}">${year}</wa-option>`).join('');
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
  const rows = sortRows(state.history, 'history');
  $('#historyRows').innerHTML = rows.length ? rows.map(snapshot => `<tr><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(snapshot.date))}</td><td>${eur.format(snapshot.value)}</td><td>${eur.format(snapshot.netWorth || 0)}</td><td>${eur.format(snapshot.liquidity || 0)}</td><td>${eur.format(snapshot.debt || 0)}</td><td>${eur.format(snapshot.dividends)}</td><td>${snapshot.count}</td><td><wa-button size="small" appearance="plain" data-delete-snapshot="${snapshot.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="8" class="empty-cell">No hay cierres guardados.</td></tr>';
  renderHistoryFilterOptions();
  const chronological = [...state.history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const filteredChronological = applyHistoryFilters(chronological);
  const chart = $('#historyChart');
  const benchmarkChart = $('#benchmarkChart');
  const macroSummary = $('#macroSummary');
  const macroChips = $('#macroChips');
  if (!chronological.length) {
    chart.className = 'history-chart empty-state';
    chart.textContent = 'Sin cierres mensuales';
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
  ], trendLabels, { ariaLabel: 'Evolucion patrimonial' });
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
function renderAssets() { const rows = sortRows(state.assets, 'assets'); $('#assetRows').innerHTML = rows.length ? rows.map(asset => `<tr><td>${escapeHtml(asset.name)}</td><td>${escapeHtml(asset.type)}</td><td>${eur.format(asset.value || 0)}</td><td>${escapeHtml(asset.notes || '-')}</td><td><wa-button size="small" appearance="plain" data-delete-asset="${asset.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">No hay activos adicionales.</td></tr>'; }
function renderLiabilities() { const rows = sortRows(state.liabilities, 'liabilities'); $('#liabilityRows').innerHTML = rows.length ? rows.map(liability => `<tr><td>${escapeHtml(liability.name)}</td><td>${escapeHtml(liability.type)}</td><td>${eur.format(liability.value || 0)}</td><td>${escapeHtml(liability.notes || '-')}</td><td><wa-button size="small" appearance="plain" data-delete-liability="${liability.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">No hay deudas registradas.</td></tr>'; }
function renderSettings() { $('#monthlyExpenseInput').value = state.settings.monthlyExpense ?? ''; $('#targetDividendInput').value = state.settings.targetAnnualDividends ?? ''; $('#targetNetWorthInput').value = state.settings.targetNetWorth ?? ''; $('#monthlyContributionInput').value = state.settings.monthlyContribution ?? ''; }
function renderUndoState() { const hasUndo = Boolean(state.lastImportUndo?.snapshot); ['#undoImportBtn', '#undoImportSettingsBtn'].forEach(selector => { const button = $(selector); if (!button) return; if (selector === '#undoImportBtn') button.hidden = !hasUndo; button.disabled = !hasUndo; }); $('#undoHelpText').textContent = hasUndo ? `Disponible la copia previa creada el ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastImportUndo.createdAt))}.` : 'No hay ninguna importacion reciente para revertir.'; }
function renderBackupStatus() { $('#backupStatus').textContent = state.lastBackupAt ? `Ultima copia automatica: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastBackupAt))}.` : 'Todavia no se ha generado ninguna copia automatica previa a importacion.'; }
function renderReportHistory() { const rows = sortRows(reportHistoryRows(), 'reports'); $('#reportRows').innerHTML = rows.length ? rows.map(row => `<tr><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.createdAt))}</td><td>${row.score === null ? '-' : `${row.score}/100`}</td><td>${row.netWorth === null ? '-' : eur.format(row.netWorth)}</td><td>${row.dividends === null ? '-' : eur.format(row.dividends)}</td><td>${escapeHtml(row.concentrationLabel || '-')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavia no hay informes generados.</td></tr>'; }
function showNotice(message) { const notice = $('#notice'); notice.textContent = message; notice.classList.add('show'); clearTimeout(notice._timer); notice._timer = setTimeout(() => notice.classList.remove('show'), 3500); }
function switchView(id) { $$('.view').forEach(view => view.classList.toggle('active', view.id === id)); $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === id)); scrollTo({ top: 0, behavior: 'smooth' }); }
function openImport() { pendingImport = null; $('#csvFile').value = ''; $('#importMode').value = 'update'; $('#importStepSelect').hidden = false; $('#importStepPreview').hidden = true; $('#confirmImportBtn').hidden = true; $('#importWarnings').hidden = true; $('#importDialog').open = true; }
function sanitizeRow(row) { return Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [cleanText(key).replace(/^\uFEFF/, ''), value])); }
function normalizeCsvRow(row, index) { const cleanRow = sanitizeRow(row); const symbol = cleanText(cleanRow.symbol).toUpperCase(); const name = cleanText(cleanRow.name || symbol || `Fila ${index + 2}`); const isin = normalizeIsin(cleanRow.isin); const totalCost = parseLocaleNumber(cleanRow.buyinTotal); const marketValue = parseLocaleNumber(cleanRow.value); const annualDividend = parseLocaleNumber(cleanRow.totalDividendRate); const gain = parseLocaleNumber(cleanRow.gain) ?? (marketValue !== null && totalCost !== null ? marketValue - totalCost : null); const position = { id: isin, isin, symbol, name, quantity: parseLocaleNumber(cleanRow.quantity), averagePrice: parseLocaleNumber(cleanRow.buyin), totalCost, currentPrice: parseLocaleNumber(cleanRow.price), marketValue, gain, gainPercent: parsePercent(cleanRow.gainRel) ?? (gain !== null && totalCost ? gain / totalCost : null), currency: normalizeCurrency(cleanRow.currency), allocation: parsePercent(cleanRow.allocation), dividendYield: parsePercent(cleanRow.dividendYield), yieldOnCost: parsePercent(cleanRow.dividendYieldOnBuyin) ?? (annualDividend !== null && totalCost ? annualDividend / totalCost : null), annualDividend, dividendPerShare: parseLocaleNumber(cleanRow.dividendRate), dividendFrequency: normalizeFrequency(cleanRow.dividendFrequency), dividendCagr: parsePercent(cleanRow.dividendCagr), sector: cleanText(cleanRow.sector) || 'Sin clasificar', country: cleanText(cleanRow.country) || 'Sin pais', transactions: parseLocaleNumber(cleanRow.transactions), exDate: normalizeDate(cleanRow.exDate), payDate: normalizeDate(cleanRow.payDate), taxRate: parsePercent(cleanRow.taxRate), notes: '', thesis: '', targetPrice: null, status: 'active', unreliableMatch: !isin, fallbackKey: buildFallbackKey(symbol, name), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archivedAt: null, importMeta: { source: 'divvydiary', importedAt: new Date().toISOString(), rowNumber: index + 2 }, raw: cleanRow }; const issues = []; if (!isin) issues.push('Posicion sin ISIN valido. No se sincroniza automaticamente.'); if (marketValue === null) issues.push('Falta el valor de mercado.'); if (position.quantity === null) issues.push('Falta la cantidad.'); return { rowNumber: index + 2, position, issues }; }
function materialDiff(existing, incoming) { const fields = [['name', 'Nombre'], ['symbol', 'Ticker'], ['quantity', 'Cantidad'], ['averagePrice', 'Precio medio'], ['totalCost', 'Coste'], ['currentPrice', 'Precio actual'], ['marketValue', 'Valor'], ['gain', 'Ganancia'], ['gainPercent', 'Ganancia %'], ['currency', 'Divisa'], ['allocation', 'Peso'], ['dividendYield', 'Yield'], ['yieldOnCost', 'Yield on cost'], ['annualDividend', 'Dividendo anual'], ['dividendPerShare', 'Dividendo por accion'], ['dividendFrequency', 'Frecuencia'], ['dividendCagr', 'CAGR dividendo'], ['sector', 'Sector'], ['country', 'Pais'], ['exDate', 'Ex-date'], ['payDate', 'Pay-date'], ['taxRate', 'Retencion']]; const changed = []; fields.forEach(([field, label]) => { const left = existing[field]; const right = incoming[field]; if (typeof left === 'number' || typeof right === 'number') { const l = left ?? null; const r = right ?? null; if (l === null && r === null) return; if (l === null || r === null || Math.abs(l - r) > 0.0001) changed.push(label); return; } if ((left || '') !== (right || '')) changed.push(label); }); return changed; }
function buildImportPreview(file, rows) { const existingByIsin = new Map(activePortfolio().filter(position => position.isin).map(position => [position.isin, position])); const seenIsins = new Set(); const preview = { file, rows, validEntries: [], skippedRows: [], newItems: [], updatedItems: [], removedItems: [], issues: [], totals: null }; rows.forEach(item => { const { position, issues, rowNumber } = item; if (issues.length) preview.issues.push(...issues.map(message => ({ rowNumber, message, label: `${position.name} | ${position.symbol}` }))); if (!position.isin) { preview.skippedRows.push({ rowNumber, position, reason: 'Sin ISIN valido' }); return; } if (seenIsins.has(position.isin)) { preview.issues.push({ rowNumber, message: `ISIN duplicado en el CSV: ${position.isin}`, label: position.name }); preview.skippedRows.push({ rowNumber, position, reason: 'ISIN duplicado en el CSV' }); return; } seenIsins.add(position.isin); const existing = existingByIsin.get(position.isin); if (!existing) { preview.newItems.push({ rowNumber, position }); preview.validEntries.push({ rowNumber, type: 'new', position, existing: null, changedFields: [] }); return; } const changedFields = materialDiff(existing, position); const entry = { rowNumber, type: changedFields.length ? 'updated' : 'unchanged', position, existing, changedFields }; preview.validEntries.push(entry); if (changedFields.length) preview.updatedItems.push(entry); }); const importedIsins = new Set(preview.validEntries.map(entry => entry.position.isin)); preview.removedItems = activePortfolio().filter(position => position.isin && !importedIsins.has(position.isin)).map(position => ({ position })); preview.totals = totals(preview.validEntries.map(entry => entry.position)); return preview; }
function parseCsv(file) { if (!window.Papa) { showNotice('No se ha cargado el lector CSV. Comprueba la conexion.'); return; } Papa.parse(file, { header: true, skipEmptyLines: true, delimiter: ';', encoding: 'UTF-8', complete: result => { const fields = (result.meta.fields || []).map(field => cleanText(field).replace(/^\uFEFF/, '')); const required = ['isin', 'name', 'quantity', 'value']; const missing = required.filter(field => !fields.includes(field)); if (missing.length) { showNotice(`CSV no reconocido. Faltan: ${missing.join(', ')}`); return; } const rows = result.data.map((row, index) => normalizeCsvRow(row, index)).filter(item => item.position.symbol || item.position.name || item.position.isin); if (!rows.length) { showNotice('El CSV no contiene posiciones validas.'); return; } pendingImport = buildImportPreview(file, rows); renderImportPreview(); }, error: error => showNotice(`Error al leer el CSV: ${error.message}`) }); }
function renderPreviewList(selector, items, formatter) { const element = $(selector); element.innerHTML = items.length ? items.map(formatter).join('') : '<li>Sin cambios</li>'; }
function renderImportPreview() { if (!pendingImport) return; const preview = pendingImport; $('#importFilename').textContent = preview.file.name; $('#importSummary').textContent = `${preview.validEntries.length} posiciones listas para importar y ${preview.skippedRows.length} filas omitidas por seguridad.`; $('#previewCount').textContent = preview.totals.count; $('#previewValue').textContent = eur.format(preview.totals.value); $('#previewCost').textContent = eur.format(preview.totals.cost); $('#previewGain').textContent = eur.format(preview.totals.gain); $('#previewDividends').textContent = eur.format(preview.totals.dividends); $('#previewNew').textContent = `${preview.newItems.length} nuevas`; $('#previewUpdated').textContent = `${preview.updatedItems.length} actualizadas`; $('#previewRemoved').textContent = `${preview.removedItems.length} ausentes`; $('#previewErrors').textContent = `${preview.issues.length} incidencias`; renderPreviewList('#previewNewList', preview.newItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.position.isin)}</small></li>`); renderPreviewList('#previewUpdatedList', preview.updatedItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.changedFields.join(', '))}</small></li>`); renderPreviewList('#previewRemovedList', preview.removedItems, item => `<li>${escapeHtml(item.position.name)}<small>${escapeHtml(item.position.isin)}</small></li>`); const issues = [...preview.skippedRows.map(item => ({ rowNumber: item.rowNumber, text: `${item.position.name} | ${item.reason}` })), ...preview.issues.map(issue => ({ rowNumber: issue.rowNumber, text: `${issue.label} | ${issue.message}` }))]; renderPreviewList('#previewIssueList', issues, issue => `<li>Fila ${issue.rowNumber}: ${escapeHtml(issue.text)}</li>`); $('#importStepSelect').hidden = true; $('#importStepPreview').hidden = false; $('#confirmImportBtn').hidden = false; updateImportWarnings(); }
function updateImportWarnings() { const warning = $('#importWarnings'); if (!pendingImport) { warning.hidden = true; return; } const mode = $('#importMode').value || 'update'; const messages = []; if (pendingImport.skippedRows.length) messages.push(`Se omitiran ${pendingImport.skippedRows.length} filas sin ISIN valido o con ISIN duplicado.`); if (mode === 'replace' && pendingImport.removedItems.length) messages.push(`Las ${pendingImport.removedItems.length} posiciones ausentes se archivaran, no se borraran.`); if (!messages.length) { warning.hidden = true; warning.innerHTML = ''; return; } warning.hidden = false; warning.innerHTML = messages.map(message => `<div>${escapeHtml(message)}</div>`).join(''); }
function cloneSnapshot() { return JSON.parse(JSON.stringify({ portfolio: state.portfolio, history: state.history, assets: state.assets, liabilities: state.liabilities, reportHistory: state.reportHistory, settings: state.settings, lastImport: state.lastImport, lastBackupAt: state.lastBackupAt })); }
function saveImportBackup(sourceName) { const snapshot = cloneSnapshot(); const backup = { id: crypto.randomUUID?.() || `backup-${Date.now()}`, createdAt: new Date().toISOString(), reason: 'before-import', source: sourceName, snapshot }; state.lastImportUndo = backup; state.lastBackupAt = backup.createdAt; state.backups = [backup, ...state.backups].slice(0, 10); }
function mergeImportedPosition(existing, incoming) { const now = new Date().toISOString(); return { ...existing, ...incoming, id: existing.id || incoming.id, isin: incoming.isin || existing.isin, notes: existing.notes || '', thesis: existing.thesis || '', targetPrice: existing.targetPrice ?? null, status: existing.status === 'watch' ? 'watch' : 'active', unreliableMatch: false, fallbackKey: incoming.fallbackKey || existing.fallbackKey, createdAt: existing.createdAt || now, updatedAt: now, archivedAt: null }; }
function createImportedPosition(incoming) { const now = new Date().toISOString(); return { ...incoming, id: incoming.isin || incoming.id || `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, notes: incoming.notes || '', thesis: incoming.thesis || '', targetPrice: incoming.targetPrice ?? null, status: 'active', createdAt: now, updatedAt: now, archivedAt: null }; }
function confirmImport() { if (!pendingImport) return; const mode = $('#importMode').value || 'update'; saveImportBackup(pendingImport.file.name); const next = new Map(); if (mode === 'update') { state.portfolio.forEach(position => next.set(position.id, { ...position })); pendingImport.validEntries.forEach(entry => { const record = entry.existing ? mergeImportedPosition(entry.existing, entry.position) : createImportedPosition(entry.position); next.set(record.id, record); }); } else { state.portfolio.filter(position => !position.isin).forEach(position => next.set(position.id, { ...position })); pendingImport.validEntries.forEach(entry => { const record = entry.existing ? mergeImportedPosition(entry.existing, entry.position) : createImportedPosition(entry.position); next.set(record.id, record); }); const importedIsins = new Set(pendingImport.validEntries.map(entry => entry.position.isin)); state.portfolio.forEach(position => { if (position.isin && !importedIsins.has(position.isin)) next.set(position.id, { ...position, status: 'archived', archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); }); } state.portfolio = [...next.values()]; state.lastImport = new Date().toISOString(); saveState(); render(); $('#importDialog').open = false; showNotice(`Importacion completada: ${pendingImport.validEntries.length} posiciones sincronizadas.`); pendingImport = null; }
function undoLastImport() { if (!state.lastImportUndo?.snapshot) { showNotice('No hay ninguna importacion que deshacer.'); return; } const snapshot = state.lastImportUndo.snapshot; state.portfolio = snapshot.portfolio.map(migratePosition).filter(Boolean); state.history = snapshot.history.map(migrateSnapshot).filter(Boolean); state.assets = snapshot.assets.map(migrateAsset).filter(Boolean); state.liabilities = snapshot.liabilities.map(migrateLiability).filter(Boolean); state.reportHistory = snapshot.reportHistory.map(migrateReportEntry).filter(Boolean); state.settings = migrateSettings(snapshot.settings); state.lastImport = snapshot.lastImport || null; state.lastBackupAt = snapshot.lastBackupAt || null; state.lastImportUndo = null; saveState(); render(); showNotice('Se ha restaurado la copia previa a la ultima importacion.'); }
function buildMonthlySnapshot() { const portfolio = activePortfolio(); const metrics = fullMetrics(portfolio); return { id: crypto.randomUUID?.() || String(Date.now()), month: new Date().toISOString().slice(0, 7), date: new Date().toISOString(), value: metrics.value, cost: metrics.cost, gain: metrics.gain, dividends: metrics.dividends, count: metrics.count, liquidity: metrics.liquidity, otherAssets: metrics.otherAssets, debt: metrics.liabilities, netWorth: metrics.netWorth, monthlyContribution: state.settings.monthlyContribution, notes: '', positions: sortedPortfolio(portfolio).slice(0, 10).map(position => ({ isin: position.isin, symbol: position.symbol, name: position.name, value: position.marketValue, weight: position.allocation })) }; }
function saveSnapshot() { const portfolio = activePortfolio(); if (!portfolio.length) { showNotice('Importa primero una cartera.'); return; } const snapshot = buildMonthlySnapshot(); const existingIndex = state.history.findIndex(item => item.month === snapshot.month); if (existingIndex >= 0) { snapshot.id = state.history[existingIndex].id; snapshot.notes = state.history[existingIndex].notes || ''; state.history[existingIndex] = snapshot; } else state.history.push(snapshot); saveState(); renderHistory(); renderDashboard(); showNotice('Cierre mensual guardado.'); }
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
  if (!latest) return ['- Todavia no hay cierres mensuales guardados.'];
  if (!previous) return [`- Ultimo cierre guardado: ${dateEs(String(latest.date).slice(0, 10))}.`];
  return [
    `- Ultimo cierre: ${dateEs(String(latest.date).slice(0, 10))}.`,
    `- Variacion cartera: ${formatPercent(relativeDelta(latest.value || 0, previous.value || 0))}.`,
    `- Variacion patrimonio neto: ${formatPercent(relativeDelta(latest.netWorth || 0, previous.netWorth || 0))}.`,
    `- Variacion liquidez: ${formatPercent(relativeDelta(latest.liquidity || 0, previous.liquidity || 0))}.`,
    `- Variacion deuda: ${formatPercent(relativeDelta(latest.debt || 0, previous.debt || 0))}.`
  ];
}
function recentReportSummary() {
  const reports = reportHistoryRows().slice(0, 3);
  if (!reports.length) return ['- No hay informes anteriores registrados.'];
  return reports.map(report => `- ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.createdAt))}: score ${report.score ?? '-'} | patrimonio ${report.netWorth === null ? '-' : eur.format(report.netWorth)} | dividendos ${report.dividends === null ? '-' : eur.format(report.dividends)} | concentracion ${report.concentrationLabel || '-'}.`);
}
function buildPortfolioDataMarkdown() {
  const portfolio = sortedPortfolio(activePortfolio());
  const metrics = fullMetrics(portfolio);
  const sector = groupByValue(portfolio, 'sector', metrics.value);
  const country = groupByValue(portfolio, 'country', metrics.value);
  const score = portfolioScore(portfolio);
  const signals = concentrationSignals(portfolio);
  const scenarios = independenceScenarios(metrics);
  const transactions = transactionRowsData();
  const txAnalytics = transactionAnalytics(transactions);
  return [
    '# Datos patrimoniales exportados',
    '',
    `Fecha del informe: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date())}`,
    '',
    '## Resumen patrimonial',
    `- Valor de cartera: ${eur.format(metrics.value)}`,
    `- Coste invertido: ${eur.format(metrics.cost)}`,
    `- Plusvalia: ${eur.format(metrics.gain)}`,
    `- Dividendos anuales estimados: ${eur.format(metrics.dividends)}`,
    `- Liquidez registrada: ${eur.format(metrics.liquidity)}`,
    `- Otros activos: ${eur.format(metrics.otherAssets)}`,
    `- Deuda total: ${eur.format(metrics.liabilities)}`,
    `- Patrimonio neto: ${eur.format(metrics.netWorth)}`,
    '',
    '## Salud de la cartera',
    `- Puntuacion global: ${score.value}/100 (${score.label})`,
    ...signals.map(signal => `- Concentracion ${signal.title.toLowerCase()}: ${signal.name} con ${pct.format(signal.weight)} (${signal.label})`),
    '',
    '## Objetivos financieros',
    `- Gasto mensual objetivo: ${state.settings.monthlyExpense === null ? 'No configurado' : eur.format(state.settings.monthlyExpense)}`,
    `- Objetivo anual de dividendos: ${state.settings.targetAnnualDividends === null ? 'No configurado' : eur.format(state.settings.targetAnnualDividends)}`,
    `- Objetivo de patrimonio neto: ${state.settings.targetNetWorth === null ? 'No configurado' : eur.format(state.settings.targetNetWorth)}`,
    `- Aportacion mensual prevista: ${state.settings.monthlyContribution === null ? 'No configurada' : eur.format(state.settings.monthlyContribution)}`,
    '',
    '## Escenarios de independencia financiera',
    ...(scenarios ? scenarios.map(s => `- ${s.label}: ${s.years === null ? 'mas de 40 anos' : `${s.years} anos`} | meta estimada ${s.eta}`) : ['- Configura el gasto mensual para obtener escenarios.']),
    '',
    '## Cambios frente al cierre anterior',
    ...reportDeltaSection(),
    '',
    '## Actividad de capital y transacciones',
    `- Operaciones importadas: ${transactions.length}`,
    `- Compras netas 12m: ${eur.format(txAnalytics.lastTwelveMonths.netAmount)}`,
    `- Comisiones e impuestos acumulados: ${eur.format(txAnalytics.allTotals.costs)}`,
    `- Plusvalia realizada estimada: ${eur.format(txAnalytics.realized)}`,
    `- Ritmo medio de compras 6m: ${eur.format(txAnalytics.monthlyBuys)}`,
    '',
    '## Cartera',
    '| Empresa | Ticker | ISIN | Valor | Peso | Dividendo anual | Yield | YOC | Estado |',
    '|---|---|---|---:|---:|---:|---:|---:|---|',
    ...portfolio.map(position => `| ${position.name.replaceAll('|', '/')} | ${position.symbol} | ${position.isin} | ${eur.format(position.marketValue || 0)} | ${formatPercent(position.allocation)} | ${eur.format(position.annualDividend || 0)} | ${formatPercent(position.dividendYield)} | ${formatPercent(position.yieldOnCost)} | ${position.status} |`),
    '',
    '## Distribucion por sectores',
    ...sector.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`),
    '',
    '## Distribucion geografica',
    ...country.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`),
    '',
    '## Liquidez, activos y deuda',
    ...state.assets.map(asset => `- Activo ${asset.name} (${asset.type}): ${eur.format(asset.value || 0)}`),
    ...state.liabilities.map(liability => `- Deuda ${liability.name} (${liability.type}): ${eur.format(liability.value || 0)}`),
    '',
    '## Historico de informes registrados',
    ...recentReportSummary(),
    '',
    '## Comentarios personales',
    '- Exportado desde la aplicacion local-first. Los datos permanecen en el dispositivo.'
  ].join('\n');
}
function mergePromptWithData(template, dataBlock) {
  const normalizedTemplate = cleanText(template) ? template : DEFAULT_ANALYSIS_PROMPT;
  return normalizedTemplate.includes('{{PORTFOLIO_DATA}}') ? normalizedTemplate.replace('{{PORTFOLIO_DATA}}', dataBlock) : `${normalizedTemplate.trim()}\n\n---\n\n${dataBlock}`;
}
async function markdown() {
  const portfolio = sortedPortfolio(activePortfolio());
  const metrics = fullMetrics(portfolio);
  const score = portfolioScore(portfolio);
  const filename = `informe-family-office-${new Date().toISOString().slice(0, 10)}.md`;
  const promptTemplate = await loadAnalysisPromptTemplate();
  const dataBlock = buildPortfolioDataMarkdown();
  const finalDocument = mergePromptWithData(promptTemplate, dataBlock);
  download(filename, finalDocument, 'text/markdown');
  saveReportHistoryEntry({ ...defaultReportEntry(), createdAt: new Date().toISOString(), score: score.value, netWorth: metrics.netWorth, dividends: metrics.dividends, concentrationLabel: score.concentrationLabel, filename });
  saveState();
  renderReportHistory();
  showNotice('Informe generado con prompt editable y registrado en el historico.');
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
  $('#positionDialogTitle').textContent = position.name || position.symbol || 'Posicion';
  $('#positionSummary').textContent = `${position.symbol || 'Sin ticker'} | ${position.isin || 'Sin ISIN'} | Valor ${formatCurrency(position.marketValue, position.currency)} | Dividendo ${formatCurrency(position.annualDividend, position.currency)}`;
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
  showNotice('Posicion actualizada.');
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
  showNotice('Activo anadido.');
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
  showNotice('Deuda anadida.');
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
$('#markdownBtn')?.addEventListener('click', () => { markdown().catch(error => { console.error(error); showNotice(`No se pudo generar el informe: ${error.message}`); }); });
$('#clearBtn')?.addEventListener('click', () => {
  askConfirm('Se borraran cartera, cierres, activos, deudas, informes y configuracion local. Esta accion no se puede deshacer.', () => {
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
['#historyRangePreset', '#historyFromYear', '#historyToYear'].forEach(selector => {
  $(selector)?.addEventListener('change', event => {
    if (selector === '#historyRangePreset') historyFilterState.preset = event.target.value || 'all';
    if (selector === '#historyFromYear') historyFilterState.fromYear = event.target.value || '';
    if (selector === '#historyToYear') historyFilterState.toYear = event.target.value || '';
    renderHistory();
  });
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
    askConfirm('Eliminar este cierre mensual del historico.', () => {
      state.history = state.history.filter(item => item.id !== snapshotId);
      saveState();
      render();
      showNotice('Cierre mensual eliminado.');
    });
  }
});
registerServiceWorker();
render();






const DEMO_TRANSACTIONS = [
  { id: 'tx-demo-1', datetime: '2025-08-14T10:00:00.000Z', type: 'BUY', isin: 'NL0010273215', symbol: 'ASML', name: 'ASML Holding NV', quantity: 4, price: 612, amount: 2448, currency: 'EUR', fees: 2.5, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-2', datetime: '2025-09-18T10:00:00.000Z', type: 'BUY', isin: 'US00287Y1091', symbol: 'ABBV', name: 'AbbVie Inc', quantity: 20, price: 148.7, amount: 2974, currency: 'EUR', fees: 3, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-3', datetime: '2025-10-31T10:00:00.000Z', type: 'BUY', isin: 'ES0167050915', symbol: 'ACS', name: 'ACS Actividades de Construccion y Servicios SA', quantity: 90, price: 35.2, amount: 3168, currency: 'EUR', fees: 2.8, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-4', datetime: '2025-12-12T10:00:00.000Z', type: 'BUY', isin: 'ES0130960018', symbol: 'ENG', name: 'Enagas SA', quantity: 160, price: 14.3, amount: 2288, currency: 'EUR', fees: 2.2, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-5', datetime: '2026-01-16T10:00:00.000Z', type: 'BUY', isin: 'US92826C8394', symbol: 'V', name: 'Visa Inc', quantity: 12, price: 248, amount: 2976, currency: 'EUR', fees: 3.5, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-6', datetime: '2026-02-27T10:00:00.000Z', type: 'BUY', isin: 'GB0002875804', symbol: 'BATS', name: 'British American Tobacco PLC', quantity: 120, price: 31.1, amount: 3732, currency: 'EUR', fees: 3.1, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-7', datetime: '2026-04-24T10:00:00.000Z', type: 'SELL', isin: 'GB0002875804', symbol: 'BATS', name: 'British American Tobacco PLC', quantity: 40, price: 33.2, amount: 1328, currency: 'EUR', fees: 2.4, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-8', datetime: '2026-05-28T10:00:00.000Z', type: 'BUY', isin: 'US00287Y1091', symbol: 'ABBV', name: 'AbbVie Inc', quantity: 15, price: 163.2, amount: 2448, currency: 'EUR', fees: 3, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-9', datetime: '2026-06-26T10:00:00.000Z', type: 'BUY', isin: 'ES0167050915', symbol: 'ACS', name: 'ACS Actividades de Construccion y Servicios SA', quantity: 70, price: 42.8, amount: 2996, currency: 'EUR', fees: 2.8, taxes: 0, portfolio: 'Demo' },
  { id: 'tx-demo-10', datetime: '2026-07-19T10:00:00.000Z', type: 'SELL', isin: 'ES0130960018', symbol: 'ENG', name: 'Enagas SA', quantity: 60, price: 12.9, amount: 774, currency: 'EUR', fees: 2, taxes: 0, portfolio: 'Demo' }
];
function defaultTransaction() {
  return { id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, datetime: new Date().toISOString(), date: new Date().toISOString().slice(0, 10), month: new Date().toISOString().slice(0, 7), type: 'BUY', isin: '', symbol: '', name: '', quantity: null, price: null, amount: null, currency: 'EUR', fees: 0, taxes: 0, costs: 0, portfolio: '', totalCash: null, importMeta: null, raw: null, dedupeKey: '' };
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
  return { ...defaultTransaction(), ...entry, id: cleanText(entry.id) || dedupeKey, datetime, date: String(datetime).slice(0, 10), month: String(datetime).slice(0, 7), type, isin: normalizeIsin(entry.isin), symbol: cleanText(entry.symbol).toUpperCase(), name: cleanText(entry.name || entry.symbol || 'Operacion sin nombre'), quantity, price: toNum(entry.price, null), amount, currency: normalizeCurrency(entry.currency), fees, taxes, costs: fees + taxes, portfolio: cleanText(entry.portfolio), totalCash: toNum(entry.totalCash, amount === null ? null : (type === 'BUY' ? amount + fees + taxes : amount - fees - taxes)), importMeta: entry.importMeta && typeof entry.importMeta === 'object' ? entry.importMeta : null, raw: entry.raw && typeof entry.raw === 'object' ? entry.raw : null, dedupeKey };
}
function defaultState() {
  return { schemaVersion: SCHEMA_VERSION, portfolio: [], transactions: [], history: [], backups: [], assets: [], liabilities: [], reportHistory: [
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
    settings: migrateSettings(raw.settings),
    tableSorts: migrateTableSorts(raw.tableSorts),
    lastImportUndo: raw.lastImportUndo ? migrateBackup(raw.lastImportUndo) : null,
    lastTransactionsImport: raw.lastTransactionsImport || null,
    theme: raw.theme === 'dark' ? 'dark' : 'light'
  };
}
function cloneSnapshot() {
  return JSON.parse(JSON.stringify({ portfolio: state.portfolio, transactions: state.transactions, options: state.options, recommendations: state.recommendations, decisionReviews: state.decisionReviews, advisor: state.advisor, history: state.history, assets: state.assets, liabilities: state.liabilities, reportHistory: state.reportHistory, settings: state.settings, lastImport: state.lastImport, lastTransactionsImport: state.lastTransactionsImport, lastBackupAt: state.lastBackupAt }));
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
function optionsSummary() {
  const open = state.options.filter(option => ['open', 'rolled'].includes(option.status));
  const totalCollateral = open.reduce((sum, option) => sum + optionDerived(option).capitalCommitted, 0);
  const totalPremium = state.options.reduce((sum, option) => sum + optionDerived(option).netPremium, 0);
  const openPremium = open.reduce((sum, option) => sum + optionDerived(option).netPremium, 0);
  const expiringSoon = open.filter(option => option.expiration && (new Date(option.expiration) - new Date()) / 86400000 <= 45).sort((a, b) => new Date(a.expiration) - new Date(b.expiration));
  const assignedPotential = open.filter(option => option.optionType === 'put').reduce((sum, option) => sum + ((option.strike || 0) * (option.contracts || 0) * (option.multiplier || 100)), 0);
  return { open, totalCollateral, totalPremium, openPremium, expiringSoon, assignedPotential };
}
function computeDividendTrend() {
  const chronological = [...state.history].sort((a, b) => new Date(a.date) - new Date(b.date));
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
    { id: 'liquidity', title: 'Liquidez', name: eur.format(liquidityAvailable), detail: `Objetivo dinamico ${eur.format(requiredLiquidity)} tras descontar garantias.`, tone: liquidityAvailable >= requiredLiquidity ? 'good' : liquidityAvailable >= requiredLiquidity * 0.75 ? 'warn' : 'risk' },
    { id: 'debt', title: 'Deuda', name: `${num.format(debtRatio * 100)} %`, detail: `Incluye deuda actual y futura prevista por ${eur.format(state.advisor.upcomingDebt)}.`, tone: debtRatio < 0.35 ? 'good' : debtRatio < 0.55 ? 'warn' : 'risk' },
    { id: 'savings', title: 'Capacidad de ahorro', name: eur.format(state.advisor.savingsCapacity), detail: savingsRatio === null ? 'Sin gasto mensual configurado.' : `Equivale al ${num.format(savingsRatio * 100)} % del gasto mensual.`, tone: savingsRatio === null ? 'warn' : savingsRatio >= 0.35 ? 'good' : savingsRatio >= 0.15 ? 'warn' : 'risk' },
    { id: 'company', title: 'Concentracion empresa', name: concentration[0]?.name || 'Sin dato', detail: concentration[0] ? `${formatPercent(concentration[0].weight)} del patrimonio invertido.` : 'Sin datos.', tone: concentration[0]?.tone || 'warn' },
    { id: 'country', title: 'Concentracion pais', name: concentration[1]?.name || 'Sin dato', detail: concentration[1] ? `${formatPercent(concentration[1].weight)} de la cartera.` : 'Sin datos.', tone: concentration[1]?.tone || 'warn' },
    { id: 'sector', title: 'Concentracion sector', name: concentration[2]?.name || 'Sin dato', detail: concentration[2] ? `${formatPercent(concentration[2].weight)} de la cartera.` : 'Sin datos.', tone: concentration[2]?.tone || 'warn' },
    { id: 'dividends', title: 'Sostenibilidad del dividendo', name: dividendTrend.growth12m === null ? eur.format(dividendTrend.latest) : formatPercent(dividendTrend.growth12m), detail: dividendTrend.growth12m === null ? 'Faltan cierres para medir el crecimiento interanual.' : 'Crecimiento del dividendo frente a 12 meses.', tone: dividendTrend.growth12m === null ? 'warn' : dividendTrend.growth12m > 0.05 ? 'good' : dividendTrend.growth12m > 0 ? 'warn' : 'risk' },
    { id: 'options', title: 'Opciones', name: eur.format(options.totalCollateral), detail: metrics.liquidity ? `${formatPercent(committedLiquidityRatio)} de la liquidez comprometida en garantias.` : 'Sin liquidez registrada.', tone: committedLiquidityRatio < 0.25 ? 'good' : committedLiquidityRatio < 0.45 ? 'warn' : 'risk' }
  ];
  return { signals, liquidityAvailable, requiredLiquidity, debtRatio, options, dividendTrend };
}
function buildRecommendations() {
  const { signals, liquidityAvailable, requiredLiquidity, debtRatio, options, dividendTrend } = advisorSignals();
  const topPositions = sortedPortfolio().slice(0, 5);
  const generated = [];
  if (liquidityAvailable < requiredLiquidity) generated.push({ id: 'liq-buffer', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', urgency: 'Alta', explanation: 'La liquidez disponible tras descontar garantias queda por debajo del objetivo dinamico.', justification: `${eur.format(liquidityAvailable)} disponibles frente a un objetivo de ${eur.format(requiredLiquidity)}.`, impact: 'Reduce el riesgo de tension de caja durante la compra de vivienda y ante asignaciones de puts.', risk: 'Tener que frenar inversiones de forma forzada o asumir deuda menos favorable.', horizon: '1-3 meses', reviewDate: new Date(Date.now() + 30 * 86400000).toISOString() });
  if (state.advisor.upcomingDebt > 0 && state.advisor.upcomingDebtMonths <= 12) generated.push({ id: 'mortgage-priority', title: 'Priorizar liquidez y capacidad de ahorro antes de formalizar la hipoteca', category: 'Deuda futura', urgency: state.advisor.upcomingDebtMonths <= 6 ? 'Alta' : 'Media', explanation: 'La nueva deuda futura cambia el nivel prudente de caja y la tolerancia al riesgo.', justification: `Hipoteca o deuda prevista de ${eur.format(state.advisor.upcomingDebt)} en ${state.advisor.upcomingDebtMonths} meses.`, impact: 'Mejora la flexibilidad para absorber gastos de formalizacion y reduce riesgo de vender activos.', risk: 'Asumir la deuda sin colchon suficiente y deteriorar la disciplina de inversion.', horizon: 'Hasta formalizacion', reviewDate: new Date(Date.now() + 45 * 86400000).toISOString() });
  if (signals.find(item => item.id === 'company')?.tone === 'risk') generated.push({ id: 'top-position-freeze', title: 'Evitar ampliar las mayores posiciones hasta rebajar la concentracion', category: 'Concentracion', urgency: 'Alta', explanation: 'La posicion principal ya pesa demasiado dentro de la cartera.', justification: topPositions[0] ? `${topPositions[0].name} pesa ${formatPercent(topPositions[0].allocation || 0)}.` : 'Sin posicion principal disponible.', impact: 'Reduce el riesgo de que una sola empresa condicione el resultado del patrimonio.', risk: 'Mayor volatilidad y dependencia de pocos generadores de renta.', horizon: '3 meses', reviewDate: new Date(Date.now() + 90 * 86400000).toISOString() });
  if (signals.find(item => item.id === 'country')?.tone !== 'good') generated.push({ id: 'international-balance', title: 'Dirigir nuevas aportaciones a paises o sectores infraponderados', category: 'Asignacion', urgency: 'Media', explanation: 'La cartera puede diversificarse mejor sin necesidad de vender posiciones existentes.', justification: `La mayor exposicion geografica sigue concentrada en ${signals.find(item => item.id === 'country')?.name || 'una zona dominante'}.`, impact: 'Mejora el equilibrio entre renta, divisa y riesgo regulatorio.', risk: 'Seguir acumulando sesgo local y dependencia de un mismo ciclo economico.', horizon: '3-6 meses', reviewDate: new Date(Date.now() + 120 * 86400000).toISOString() });
  if (options.totalCollateral > 0) generated.push({ id: 'options-cash-check', title: 'Revisar si todas las puts abiertas serian asumibles si se asignaran hoy', category: 'Opciones', urgency: options.expiringSoon.length ? 'Alta' : 'Media', explanation: 'Las opciones abiertas consumen liquidez real y pueden aumentar la concentracion de forma brusca.', justification: `${eur.format(options.totalCollateral)} comprometidos y ${options.expiringSoon.length} vencimientos proximos.`, impact: 'Evita asignaciones incomodas o ventas forzadas de otros activos.', risk: 'Quedarte sin caja o sobreponderar empresas ya relevantes.', horizon: 'Inmediato', reviewDate: new Date(Date.now() + 21 * 86400000).toISOString() });
  if (dividendTrend.growth12m !== null && dividendTrend.growth12m <= 0) generated.push({ id: 'dividend-review', title: 'Revisar si el crecimiento del dividendo se ha estancado frente al ultimo ano', category: 'Dividendos', urgency: 'Media', explanation: 'La renta recurrente no esta mejorando al ritmo esperado.', justification: `Crecimiento interanual estimado: ${formatPercent(dividendTrend.growth12m)}.`, impact: 'Ayuda a proteger el objetivo de independencia financiera y la calidad de la renta.', risk: 'Confiar en un progreso nominal que en realidad se esta frenando.', horizon: '1-2 meses', reviewDate: new Date(Date.now() + 60 * 86400000).toISOString() });
  if (debtRatio > 0.5) generated.push({ id: 'leverage-discipline', title: 'Reducir el ritmo de riesgo hasta estabilizar la deuda total', category: 'Riesgo financiero', urgency: 'Alta', explanation: 'La deuda total prevista pesa demasiado sobre el patrimonio consolidado.', justification: `Ratio estimado de deuda ampliada: ${num.format(debtRatio * 100)} %.`, impact: 'Disminuye la vulnerabilidad del patrimonio a tipos, imprevistos y caidas de mercado.', risk: 'Entrar en una fase de escasa maniobrabilidad financiera.', horizon: '6-12 meses', reviewDate: new Date(Date.now() + 120 * 86400000).toISOString() });
  const existingById = new Map((state.recommendations || []).map(item => [item.id, item]));
  return generated.slice(0, 6).map(item => {
    const existing = existingById.get(item.id);
    return { ...item, status: existing?.status || 'pending', reason: existing?.reason || '', createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), decidedAt: existing?.decidedAt || null };
  });
}
function executiveDiagnosis(recommendations) {
  const metrics = fullMetrics();
  const { liquidityAvailable, requiredLiquidity, options } = advisorSignals();
  const lines = [];
  if (liquidityAvailable < requiredLiquidity) lines.push(`La liquidez util (${eur.format(liquidityAvailable)}) sigue por debajo del umbral prudente (${eur.format(requiredLiquidity)}).`);
  else lines.push(`La liquidez util cubre el nivel prudente de caja (${eur.format(requiredLiquidity)}), lo que permite absorber imprevistos sin tension inmediata.`);
  if (state.advisor.upcomingDebt > 0) lines.push(`La futura deuda prevista por ${eur.format(state.advisor.upcomingDebt)} obliga a priorizar caja y disciplina de aportaciones en los proximos ${state.advisor.upcomingDebtMonths} meses.`);
  if (options.totalCollateral > 0) lines.push(`Las opciones abiertas comprometen ${eur.format(options.totalCollateral)} de liquidez y deben tratarse como capital no disponible para nuevas compras.`);
  if (recommendations.some(item => item.id === 'top-position-freeze')) lines.push('La cartera mantiene una concentracion relevante en algunas posiciones, por lo que conviene evitar ampliar las mas pesadas.');
  lines.push(`El patrimonio neto estimado es de ${eur.format(metrics.netWorth)} y los dividendos anuales de ${eur.format(metrics.dividends)}; la prioridad no es maximizar yield, sino preservar flexibilidad y calidad de decisiones.`);
  return lines;
}
function renderAdvisorCenter() {
  ensureAdvisoryState();
  const recommendationRows = $('#recommendationRows');
  const decisionRows = $('#decisionRows');
  const diagnosis = $('#advisorDiagnosis');
  const priorities = $('#advisorPriorities');
  const signalsNode = $('#advisorSignals');
  const optionsSummaryNode = $('#advisorOptionsSummary');
  const optionsAlertsNode = $('#advisorOptionsAlerts');
  if (!diagnosis) return;
  $('#advisorMinLiquidity').value = state.advisor.minimumLiquidityTarget ?? '';
  $('#advisorUpcomingDebt').value = state.advisor.upcomingDebt ?? '';
  $('#advisorUpcomingDebtMonths').value = state.advisor.upcomingDebtMonths ?? '';
  $('#advisorSavingsCapacity').value = state.advisor.savingsCapacity ?? '';
  $('#advisorEmergencyFund').value = state.advisor.emergencyFundTarget ?? '';
  state.recommendations = buildRecommendations();
  const { signals } = advisorSignals();
  const options = optionsSummary();
  diagnosis.className = 'summary-stack';
  diagnosis.innerHTML = executiveDiagnosis(state.recommendations).map(line => `<small>${escapeHtml(line)}</small>`).join('');
  priorities.className = state.recommendations.length ? 'scenario-list' : 'scenario-list empty-state';
  priorities.innerHTML = state.recommendations.slice(0, 3).map(item => `<article class="priority-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.urgency)}</span><small>${escapeHtml(item.explanation)}</small><small>Revision: ${dateEs(String(item.reviewDate).slice(0, 10))}</small></article>`).join('') || 'Sin datos';
  signalsNode.className = 'signal-list';
  signalsNode.innerHTML = signals.map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${escapeHtml(signal.title)}</strong><span>${escapeHtml(signal.name)}</span><small>${escapeHtml(signal.detail)}</small></div>`).join('');
  optionsSummaryNode.className = 'summary-stack';
  optionsSummaryNode.innerHTML = options.open.length ? [`<strong>${options.open.length} posiciones abiertas</strong>`, `<small>Garantias reservadas: ${eur.format(options.totalCollateral)}</small>`, `<small>Primas netas acumuladas: ${eur.format(options.totalPremium)}</small>`, `<small>Exposicion potencial por asignacion: ${eur.format(options.assignedPotential)}</small>`].join('') : '<small>No hay opciones abiertas registradas.</small>';
  optionsAlertsNode.className = 'signal-list';
  const optionAlertCards = [];
  if (options.expiringSoon.length) optionAlertCards.push({ tone: 'warn', title: 'Vencimientos proximos', detail: `${options.expiringSoon.length} posiciones vencen en los proximos 45 dias.` });
  if (options.totalCollateral > fullMetrics().liquidity * 0.4 && fullMetrics().liquidity > 0) optionAlertCards.push({ tone: 'risk', title: 'Liquidez comprometida', detail: 'Las garantias absorben una parte demasiado alta de la caja disponible.' });
  if (!optionAlertCards.length) optionAlertCards.push({ tone: 'good', title: 'Opciones bajo control', detail: 'No hay alertas criticas en las posiciones registradas.' });
  optionsAlertsNode.innerHTML = optionAlertCards.map(item => `<div class="signal-row signal-${item.tone}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join('');
  recommendationRows.innerHTML = state.recommendations.length ? state.recommendations.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.category)}</small></td><td>${escapeHtml(item.urgency)}</td><td>${escapeHtml(item.impact)}</td><td>${escapeHtml(item.risk)}</td><td>${dateEs(String(item.reviewDate).slice(0, 10))}</td><td>${escapeHtml(item.status)}</td><td><div class="recommendation-actions"><wa-button size="small" appearance="plain" data-rec-action="accept" data-rec-id="${item.id}">Aceptar</wa-button><wa-button size="small" appearance="plain" data-rec-action="execute" data-rec-id="${item.id}">Ejecutada</wa-button><wa-button size="small" appearance="plain" data-rec-action="postpone" data-rec-id="${item.id}">Posponer</wa-button><wa-button size="small" appearance="plain" data-rec-action="discard" data-rec-id="${item.id}">Descartar</wa-button></div></td></tr>`).join('') : '<tr><td colspan="7" class="empty-cell">Sin recomendaciones todavia.</td></tr>';
  const reviews = (state.decisionReviews || []).slice().sort((a, b) => new Date(b.decidedAt || b.createdAt) - new Date(a.decidedAt || a.createdAt));
  decisionRows.innerHTML = reviews.length ? reviews.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.actionLabel)}</small></td><td>${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.decidedAt || item.createdAt))}</td><td>${dateEs(String(item.reviewDate || '').slice(0, 10))}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.reason || 'Sin nota registrada')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Aun no hay decisiones registradas.</td></tr>';
}
function renderOptionsModule() {
  const summaryNode = $('#optionSummary');
  const rowsNode = $('#optionRows');
  if (!summaryNode || !rowsNode) return;
  const summary = optionsSummary();
  summaryNode.className = 'summary-stack';
  summaryNode.innerHTML = summary.open.length ? [`<strong>${summary.open.length} posiciones abiertas</strong>`, `<small>Garantias reservadas: ${eur.format(summary.totalCollateral)}</small>`, `<small>Primas abiertas: ${eur.format(summary.openPremium)}</small>`, `<small>Primas historicas netas: ${eur.format(summary.totalPremium)}</small>`, `<small>Vencimientos proximos: ${summary.expiringSoon.length}</small>`].join('') : '<small>Sin operaciones registradas.</small>';
  rowsNode.innerHTML = state.options.length ? state.options.map(option => {
    const derived = optionDerived(option);
    return `<tr><td class="company-cell"><strong>${escapeHtml(option.underlying || option.ticker || 'Sin subyacente')}</strong><small>${escapeHtml(option.ticker || '-')} | ${escapeHtml(option.isin || 'Sin ISIN')}</small></td><td>${option.optionType === 'put' ? 'Put' : 'Call'}<br><small>${escapeHtml(option.strategy)}</small></td><td>${escapeHtml(option.objective === 'income' ? 'Prima' : 'Comprar acciones')}</td><td>${dateEs(option.expiration)}</td><td>${eur.format(derived.netPremium)}</td><td>${eur.format(derived.capitalCommitted)}</td><td>${escapeHtml(option.status)}</td><td><wa-button size="small" appearance="plain" data-delete-option="${option.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`;
  }).join('') : '<tr><td colspan="8" class="empty-cell">No hay posiciones en opciones.</td></tr>';
}
function addOptionPosition(event) {
  event.preventDefault();
  const underlying = $('#optionUnderlying').value.trim();
  const strike = parseLocaleNumber($('#optionStrike').value);
  const premiumPerShare = parseLocaleNumber($('#optionPremiumPerShare').value);
  if (!underlying || strike === null || premiumPerShare === null) { showNotice('Completa al menos subyacente, strike y prima por accion.'); return; }
  state.options.unshift(migrateOptionPosition({
    ...defaultOptionPosition(),
    underlying,
    ticker: $('#optionTicker').value.trim(),
    isin: $('#optionIsin').value.trim(),
    optionType: $('#optionType').value || 'put',
    strategy: $('#optionStrategy').value || 'cash-secured-put',
    objective: $('#optionObjective').value || 'acquire',
    openedAt: $('#optionOpenedAt').value || new Date().toISOString().slice(0, 10),
    expiration: $('#optionExpiration').value || '',
    strike,
    contracts: Number($('#optionContracts').value || 1),
    multiplier: Number($('#optionMultiplier').value || 100),
    premiumPerShare,
    fees: parseLocaleNumber($('#optionFees').value) || 0,
    collateral: parseLocaleNumber($('#optionCollateral').value),
    status: $('#optionStatus').value || 'open',
    thesis: $('#optionThesis').value.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  saveState();
  renderOptionsModule();
  renderAdvisorCenter();
  $('#optionForm').reset();
  $('#optionType').value = 'put';
  $('#optionStrategy').value = 'cash-secured-put';
  $('#optionObjective').value = 'acquire';
  $('#optionStatus').value = 'open';
  showNotice('Operacion de opciones registrada.');
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
function handleRecommendationAction(action, recommendationId) {
  const index = state.recommendations.findIndex(item => item.id === recommendationId);
  if (index < 0) return;
  const recommendation = state.recommendations[index];
  const promptReason = window.prompt(`Motivo para marcar la recomendacion como ${recommendationActionLabel(action).toLowerCase()}:`, recommendation.reason || '');
  const reason = promptReason ?? recommendation.reason ?? '';
  state.recommendations[index] = { ...recommendation, status: action === 'accept' ? 'accepted' : action === 'execute' ? 'executed' : action === 'postpone' ? 'postponed' : 'discarded', reason, decidedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  state.decisionReviews.unshift({ id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recommendationId, title: recommendation.title, actionLabel: recommendationActionLabel(action), status: state.recommendations[index].status, reason, createdAt: recommendation.createdAt, decidedAt: state.recommendations[index].decidedAt, reviewDate: new Date(Date.now() + (action === 'execute' ? 90 : 30) * 86400000).toISOString() });
  saveState();
  renderAdvisorCenter();
  showNotice(`Recomendacion ${recommendationActionLabel(action).toLowerCase()}.`);
}
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
  $('#kpiGain').textContent = `Plusvalia: ${eur.format(metrics.gain)}`;
  $('#kpiDividends').textContent = eur.format(metrics.dividends);
  $('#kpiYield').textContent = `Yield: ${pct.format(metrics.yield)}`;
  $('#kpiYoc').textContent = pct.format(metrics.yoc);
  $('#kpiMonthly').textContent = `Media mensual: ${eur.format(metrics.dividends / 12)}`;
  $('#lastUpdated').textContent = state.lastImport ? `Ultima importacion: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(state.lastImport))}` : 'Importa el CSV de DivvyDiary para comenzar.';
  $('#netWorthValue').textContent = eur.format(metrics.netWorth);
  $('#netWorthMeta').textContent = metrics.netWorthGoalProgress === null ? 'Configura un objetivo de patrimonio neto.' : `Progreso: ${pct.format(Math.min(metrics.netWorthGoalProgress, 9.99))}`;
  $('#liquidityValue').textContent = eur.format(metrics.liquidity);
  $('#liquidityMeta').textContent = `Otros activos: ${eur.format(metrics.otherAssets)}`;
  $('#debtValue').textContent = eur.format(metrics.liabilities);
  $('#debtMeta').textContent = lastSnapshot ? `Ultimo cierre: ${eur.format(lastSnapshot.debt || 0)}` : 'Sin cierre mensual todavia.';
  $('#goalValue').textContent = metrics.dividendGoalProgress === null ? '--' : pct.format(Math.min(metrics.dividendGoalProgress, 9.99));
  $('#goalMeta').textContent = state.settings.targetAnnualDividends ? `Objetivo: ${eur.format(state.settings.targetAnnualDividends)}` : 'Configura un objetivo anual de dividendos.';
  $('#snapshotDelta').textContent = lastSnapshot && previousSnapshot ? `Variacion vs. cierre anterior: ${formatPercent(relativeDelta(lastSnapshot.netWorth || 0, previousSnapshot.netWorth || 0))}` : 'Necesitas al menos dos cierres para ver variaciones.';
  $('#latestSnapshot').textContent = lastSnapshot ? `Ultimo cierre: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(lastSnapshot.date))} | Patrimonio neto ${eur.format(lastSnapshot.netWorth || 0)}` : 'Todavia no hay cierres mensuales.';
  $('#portfolioScore').textContent = String(score.value);
  $('#portfolioScoreLabel').textContent = `${score.label} | ${score.value}/100`;
  $('#portfolioScoreMeta').textContent = score.label === 'Sin datos' ? score.detail : `${score.detail} Concentracion ${score.concentrationLabel.toLowerCase()}.`;
  $('#concentrationRows').className = signals.length ? 'signal-list' : 'signal-list empty-state';
  $('#concentrationRows').innerHTML = signals.length ? signals.map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${signal.title}</strong><span>${escapeHtml(signal.name)}</span><small>${formatPercent(signal.weight)} | ${signal.label}</small></div>`).join('') : 'Sin datos';
  $('#fiGoalStatus').textContent = scenarios ? `Objetivo anual: ${eur.format(scenarios[0].target)} | progreso actual ${pct.format(Math.min(scenarios[0].progress, 9.99))}` : 'Configura tu gasto mensual para ver escenarios.';
  $('#fiGoalMeta').textContent = scenarios ? `Aportacion mensual considerada: ${state.settings.monthlyContribution === null ? eur.format(0) : eur.format(state.settings.monthlyContribution)}` : 'Se calcula con dividendos actuales, aportacion mensual y tres supuestos de crecimiento.';
  const fiRows = $('#fiRows');
  if (!scenarios) { fiRows.className = 'scenario-list empty-state'; fiRows.textContent = 'Sin datos'; }
  else { fiRows.className = 'scenario-list'; fiRows.innerHTML = scenarios.map(s => `<div class="scenario-card"><strong>${s.label}</strong><span>${s.status}</span><small>${s.years === null ? 'Mas de 40 anos' : `${s.years} anos`}</small><small>Meta estimada: ${s.eta}</small></div>`).join(''); }
  renderBars('#sectorChart', groupByValue(portfolio, 'sector', metrics.value).slice(0, 8));
  renderBars('#countryChart', groupByValue(portfolio, 'country', metrics.value).slice(0, 8));
  const top = sortRows(sortedPortfolio(portfolio).slice(0, 7), 'topPositions');
  $('#topPositions').innerHTML = top.length ? top.map(position => `<tr><td class="company-cell"><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} | ${escapeHtml(position.isin || 'Sin ISIN')}</small></td><td>${eur.format(position.marketValue || 0)}</td><td>${formatPercent(position.allocation ?? (metrics.value ? (position.marketValue || 0) / metrics.value : 0))}</td><td>${eur.format(position.annualDividend || 0)}</td><td>${formatPercent(position.dividendYield)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Todavia no hay posiciones.</td></tr>';
}
function render() {
  applyTheme();
  renderDashboard();
  renderAdvisorCenter();
  renderPortfolio();
  renderTransactions();
  renderOptionsModule();
  renderHistory();
  renderPlan();
  renderFilters();
  renderAssets();
  renderLiabilities();
  renderSettings();
  renderUndoState();
  renderBackupStatus();
  renderReportHistory();
  renderSortableHeaders();
}
ensureAdvisoryState();
$('#optionForm')?.addEventListener('submit', addOptionPosition);
['#advisorMinLiquidity', '#advisorUpcomingDebt', '#advisorUpcomingDebtMonths', '#advisorSavingsCapacity', '#advisorEmergencyFund'].forEach(selector => {
  $(selector)?.addEventListener('change', updateAdvisorSettings);
});
document.addEventListener('click', event => {
  const recButton = event.target.closest('[data-rec-action]');
  if (recButton) { handleRecommendationAction(recButton.dataset.recAction, recButton.dataset.recId); return; }
  const optionDelete = event.target.closest('[data-delete-option]');
  if (optionDelete) {
    const optionId = optionDelete.dataset.deleteOption;
    askConfirm('Eliminar esta operacion de opciones del registro.', () => {
      state.options = state.options.filter(item => item.id !== optionId);
      saveState();
      render();
      showNotice('Operacion de opciones eliminada.');
    });
  }
});
saveState();
render();

const ADVISORY_STATUS_LABELS = { pending: 'Pendiente', accepted: 'Aceptada', executed: 'Ejecutada', discarded: 'Descartada', postponed: 'Pospuesta', reviewing: 'En revision', closed: 'Cerrada' };
const ADVISORY_KIND_LABELS = { fact: 'Hecho objetivo', alert: 'Alerta automatica', estimate: 'Estimacion', recommendation: 'Recomendacion', opinion: 'Revision humana' };
const REVIEW_PHASE_LABELS = { '3m': 'Revision 3 meses', '6m': 'Revision 6 meses', '12m': 'Revision 12 meses' };
DEFAULT_TABLE_SORTS.options = { key: 'expiration', dir: 'asc' };
DEFAULT_TABLE_SORTS.recommendations = { key: 'urgencyRank', dir: 'asc' };
DEFAULT_TABLE_SORTS.decisionReviews = { key: 'reviewDate', dir: 'asc' };
SORTABLE_TABLES.options = { selector: '#optionRows', columns: [{ key: 'underlying', label: 'Subyacente', type: 'string' }, { key: 'optionType', label: 'Tipo', type: 'string' }, { key: 'objective', label: 'Objetivo', type: 'string' }, { key: 'expiration', label: 'Vencimiento', type: 'date' }, { key: 'netPremium', label: 'Prima neta', type: 'number' }, { key: 'capitalCommitted', label: 'Capital comprometido', type: 'number' }, { key: 'status', label: 'Estado', type: 'string' }, { key: null, label: '' }] };
SORTABLE_TABLES.recommendations = { selector: '#recommendationRows', columns: [{ key: 'title', label: 'Titulo', type: 'string' }, { key: 'urgencyRank', label: 'Urgencia', type: 'number' }, { key: 'impactRank', label: 'Impacto', type: 'number' }, { key: 'riskRank', label: 'Riesgo de no actuar', type: 'number' }, { key: 'reviewDate', label: 'Revision', type: 'date' }, { key: 'statusLabel', label: 'Estado', type: 'string' }, { key: null, label: '' }] };
SORTABLE_TABLES.decisionReviews = { selector: '#decisionRows', columns: [{ key: 'title', label: 'Decision', type: 'string' }, { key: 'decidedAt', label: 'Fecha', type: 'date' }, { key: 'reviewDate', label: 'Revision', type: 'date' }, { key: 'statusLabel', label: 'Estado', type: 'string' }, { key: 'lesson', label: 'Aprendizaje', type: 'string' }] };
function urgencyRank(value) { return ({ Alta: 1, Media: 2, Baja: 3 }[cleanText(value)] || 9); }
function impactRank(value) { return ({ Alto: 1, Media: 2, Medio: 2, Bajo: 3 }[cleanText(value)] || 9); }
function riskRank(value) { return ({ Alto: 1, Media: 2, Medio: 2, Bajo: 3 }[cleanText(value)] || 9); }
function advisoryKindLabel(value) { return ADVISORY_KIND_LABELS[cleanText(value).toLowerCase()] || 'Recomendacion'; }
function recommendationStatusLabel(value) { return ADVISORY_STATUS_LABELS[cleanText(value).toLowerCase()] || 'Pendiente'; }
function reviewPhaseLabel(value) { return REVIEW_PHASE_LABELS[cleanText(value).toLowerCase()] || 'Revision'; }
function defaultAdvisorState(settings = DEFAULT_SETTINGS) { const monthlyExpense = toNum(settings?.monthlyExpense, null); const monthlyContribution = toNum(settings?.monthlyContribution, null); return { minimumLiquidityTarget: monthlyExpense ? monthlyExpense * 6 : 15000, upcomingDebt: 0, upcomingDebtMonths: 12, savingsCapacity: monthlyContribution ?? 1000, emergencyFundTarget: monthlyExpense ? monthlyExpense * 6 : 12000 }; }
function defaultDecisionReview() { return { id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recommendationId: '', title: '', category: '', phase: '3m', phaseLabel: 'Revision 3 meses', actionLabel: '', status: 'pending', statusLabel: 'Pendiente', reason: '', expectedOutcome: '', actualOutcome: '', lesson: '', createdAt: new Date().toISOString(), decidedAt: '', reviewDate: '', reviewedAt: '' }; }
function migrateRecommendation(entry) { if (!entry || typeof entry !== 'object') return null; const urgency = cleanText(entry.urgency) || 'Media'; const impact = cleanText(entry.impact) || 'Medio'; const risk = cleanText(entry.risk) || 'Medio'; const status = cleanText(entry.status).toLowerCase() || 'pending'; return { ...entry, id: cleanText(entry.id) || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: cleanText(entry.title) || 'Recomendacion', category: cleanText(entry.category) || 'General', kind: cleanText(entry.kind).toLowerCase() || 'recommendation', action: cleanText(entry.action), explanation: cleanText(entry.explanation), justification: cleanText(entry.justification), impact, risk, urgency, reviewDate: normalizeDate(entry.reviewDate) || new Date().toISOString().slice(0, 10), status, statusLabel: recommendationStatusLabel(status), urgencyRank: urgencyRank(urgency), impactRank: impactRank(impact), riskRank: riskRank(risk), createdAt: entry.createdAt || new Date().toISOString(), updatedAt: entry.updatedAt || new Date().toISOString(), decidedAt: entry.decidedAt || null, reason: cleanText(entry.reason) }; }
function migrateDecisionReview(entry) { if (!entry || typeof entry !== 'object') return null; const phase = cleanText(entry.phase).toLowerCase() || '3m'; const status = cleanText(entry.status).toLowerCase() || 'pending'; return { ...defaultDecisionReview(), ...entry, id: cleanText(entry.id) || `decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recommendationId: cleanText(entry.recommendationId), title: cleanText(entry.title) || 'Decision', category: cleanText(entry.category), phase, phaseLabel: reviewPhaseLabel(phase), actionLabel: cleanText(entry.actionLabel) || 'Decision registrada', status, statusLabel: cleanText(entry.statusLabel) || recommendationStatusLabel(status), reason: cleanText(entry.reason), expectedOutcome: cleanText(entry.expectedOutcome), actualOutcome: cleanText(entry.actualOutcome), lesson: cleanText(entry.lesson), createdAt: entry.createdAt || new Date().toISOString(), decidedAt: entry.decidedAt || '', reviewDate: normalizeDate(entry.reviewDate) || '', reviewedAt: entry.reviewedAt || '' }; }
function migrateBackup(backup) { if (!backup || typeof backup !== 'object' || !backup.snapshot) return null; return { id: backup.id || `backup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: backup.createdAt || new Date().toISOString(), reason: backup.reason || 'import', source: backup.source || null, snapshot: { portfolio: Array.isArray(backup.snapshot.portfolio) ? backup.snapshot.portfolio.map(migratePosition).filter(Boolean) : [], transactions: Array.isArray(backup.snapshot.transactions) ? backup.snapshot.transactions.map(migrateTransaction).filter(Boolean) : [], options: Array.isArray(backup.snapshot.options) ? backup.snapshot.options.map(migrateOptionPosition).filter(Boolean) : [], recommendations: Array.isArray(backup.snapshot.recommendations) ? backup.snapshot.recommendations.map(migrateRecommendation).filter(Boolean) : [], decisionReviews: Array.isArray(backup.snapshot.decisionReviews) ? backup.snapshot.decisionReviews.map(migrateDecisionReview).filter(Boolean) : [], advisor: backup.snapshot.advisor && typeof backup.snapshot.advisor === 'object' ? { ...backup.snapshot.advisor } : null, history: Array.isArray(backup.snapshot.history) ? backup.snapshot.history.map(migrateSnapshot).filter(Boolean) : [], assets: Array.isArray(backup.snapshot.assets) ? backup.snapshot.assets.map(migrateAsset).filter(Boolean) : [], liabilities: Array.isArray(backup.snapshot.liabilities) ? backup.snapshot.liabilities.map(migrateLiability).filter(Boolean) : [], reportHistory: Array.isArray(backup.snapshot.reportHistory) ? backup.snapshot.reportHistory.map(migrateReportEntry).filter(Boolean) : [], settings: migrateSettings(backup.snapshot.settings), lastImport: backup.snapshot.lastImport || null, lastTransactionsImport: backup.snapshot.lastTransactionsImport || null, lastBackupAt: backup.snapshot.lastBackupAt || null } }; }
function ensureAdvisoryState() { const defaults = defaultAdvisorState(state.settings); state.advisor = { ...defaults, ...(state.advisor && typeof state.advisor === 'object' ? state.advisor : {}) }; state.advisor.minimumLiquidityTarget = toNum(state.advisor.minimumLiquidityTarget, defaults.minimumLiquidityTarget) || 0; state.advisor.upcomingDebt = toNum(state.advisor.upcomingDebt, 0) || 0; state.advisor.upcomingDebtMonths = Math.max(0, Math.round(toNum(state.advisor.upcomingDebtMonths, 12) || 12)); state.advisor.savingsCapacity = toNum(state.advisor.savingsCapacity, state.settings?.monthlyContribution ?? defaults.savingsCapacity) || 0; state.advisor.emergencyFundTarget = toNum(state.advisor.emergencyFundTarget, defaults.emergencyFundTarget) || 0; state.options = Array.isArray(state.options) ? state.options.map(migrateOptionPosition).filter(Boolean) : []; state.recommendations = Array.isArray(state.recommendations) ? state.recommendations.map(migrateRecommendation).filter(Boolean) : []; state.decisionReviews = Array.isArray(state.decisionReviews) ? state.decisionReviews.map(migrateDecisionReview).filter(Boolean) : []; }
function defaultState() { return { schemaVersion: SCHEMA_VERSION, portfolio: [], transactions: [], options: [], recommendations: [], decisionReviews: [], advisor: { ...defaultAdvisorState(DEFAULT_SETTINGS) }, history: [], backups: [], assets: [], liabilities: [], reportHistory: [], settings: { ...DEFAULT_SETTINGS }, tableSorts: defaultTableSorts(), lastImport: null, lastTransactionsImport: null, lastBackupAt: null, lastImportUndo: null, theme: 'light' }; }
function migrateState(raw) { const base = defaultState(); if (!raw || typeof raw !== 'object') return base; const settings = migrateSettings(raw.settings); return { ...base, ...raw, schemaVersion: SCHEMA_VERSION, portfolio: Array.isArray(raw.portfolio) ? raw.portfolio.map(migratePosition).filter(Boolean) : [], transactions: Array.isArray(raw.transactions) ? raw.transactions.map(migrateTransaction).filter(Boolean) : [], options: Array.isArray(raw.options) ? raw.options.map(migrateOptionPosition).filter(Boolean) : [], recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.map(migrateRecommendation).filter(Boolean) : [], decisionReviews: Array.isArray(raw.decisionReviews) ? raw.decisionReviews.map(migrateDecisionReview).filter(Boolean) : [], advisor: { ...defaultAdvisorState(settings), ...(raw.advisor && typeof raw.advisor === 'object' ? raw.advisor : {}) }, history: Array.isArray(raw.history) ? raw.history.map(migrateSnapshot).filter(Boolean) : [], backups: Array.isArray(raw.backups) ? raw.backups.map(migrateBackup).filter(Boolean).slice(0, 10) : [], assets: Array.isArray(raw.assets) ? raw.assets.map(migrateAsset).filter(Boolean) : [], liabilities: Array.isArray(raw.liabilities) ? raw.liabilities.map(migrateLiability).filter(Boolean) : [], reportHistory: Array.isArray(raw.reportHistory) ? raw.reportHistory.map(migrateReportEntry).filter(Boolean).slice(0, 24) : [], settings, tableSorts: migrateTableSorts(raw.tableSorts), lastImportUndo: raw.lastImportUndo ? migrateBackup(raw.lastImportUndo) : null, lastTransactionsImport: raw.lastTransactionsImport || null, theme: raw.theme === 'dark' ? 'dark' : 'light' }; }
function cloneSnapshot() { return JSON.parse(JSON.stringify({ portfolio: state.portfolio, transactions: state.transactions, options: state.options, recommendations: state.recommendations, decisionReviews: state.decisionReviews, advisor: state.advisor, history: state.history, assets: state.assets, liabilities: state.liabilities, reportHistory: state.reportHistory, settings: state.settings, lastImport: state.lastImport, lastTransactionsImport: state.lastTransactionsImport, lastBackupAt: state.lastBackupAt })); }
function decisionReviewsRows() { return sortRows((state.decisionReviews || []).map(migrateDecisionReview).filter(Boolean), 'decisionReviews'); }
function dueReviewCount() { const today = new Date().toISOString().slice(0, 10); return decisionReviewsRows().filter(item => item.reviewDate && item.reviewDate <= today && ['pending', 'reviewing'].includes(item.status)).length; }
function buildRecommendations() { const { signals, liquidityAvailable, requiredLiquidity, debtRatio, options, dividendTrend } = advisorSignals(); const topPositions = sortedPortfolio().slice(0, 5); const generated = []; if (liquidityAvailable < requiredLiquidity) generated.push({ id: 'liq-buffer', kind: 'alert', title: 'Reforzar la reserva de liquidez antes de nuevas compras', category: 'Liquidez', action: 'Reducir temporalmente la inversion y reservar caja hasta recuperar el umbral prudente.', urgency: 'Alta', explanation: 'La liquidez disponible tras descontar garantias queda por debajo del objetivo dinamico.', justification: `${eur.format(liquidityAvailable)} disponibles frente a un objetivo de ${eur.format(requiredLiquidity)}.`, impact: 'Alto', risk: 'Alto', horizon: '1-3 meses', reviewDate: new Date(Date.now() + 30 * 86400000).toISOString() }); if (state.advisor.upcomingDebt > 0 && state.advisor.upcomingDebtMonths <= 12) generated.push({ id: 'mortgage-priority', kind: 'estimate', title: 'Priorizar liquidez y capacidad de ahorro antes de formalizar la hipoteca', category: 'Deuda futura', action: 'Fijar un objetivo de caja previo a la firma y revisar aportaciones mensuales hasta alcanzarlo.', urgency: state.advisor.upcomingDebtMonths <= 6 ? 'Alta' : 'Media', explanation: 'La nueva deuda futura cambia el nivel prudente de caja y la tolerancia al riesgo.', justification: `Hipoteca o deuda prevista de ${eur.format(state.advisor.upcomingDebt)} en ${state.advisor.upcomingDebtMonths} meses.`, impact: 'Alto', risk: 'Alto', horizon: 'Hasta formalizacion', reviewDate: new Date(Date.now() + 45 * 86400000).toISOString() }); if (signals.find(item => item.id === 'company')?.tone === 'risk') generated.push({ id: 'top-position-freeze', kind: 'alert', title: 'Evitar ampliar las mayores posiciones hasta rebajar la concentracion', category: 'Concentracion', action: 'Congelar compras en las posiciones principales y dirigir nuevas entradas a zonas menos representadas.', urgency: 'Alta', explanation: 'La posicion principal ya pesa demasiado dentro de la cartera.', justification: topPositions[0] ? `${topPositions[0].name} pesa ${formatPercent(topPositions[0].allocation || 0)}.` : 'Sin posicion principal disponible.', impact: 'Alto', risk: 'Alto', horizon: '3 meses', reviewDate: new Date(Date.now() + 90 * 86400000).toISOString() }); if (signals.find(item => item.id === 'country')?.tone !== 'good') generated.push({ id: 'international-balance', kind: 'recommendation', title: 'Dirigir nuevas aportaciones a paises o sectores infraponderados', category: 'Asignacion', action: 'Priorizar las proximas compras fuera del sesgo geografico dominante.', urgency: 'Media', explanation: 'La cartera puede diversificarse mejor sin necesidad de vender posiciones existentes.', justification: `La mayor exposicion geografica sigue concentrada en ${signals.find(item => item.id === 'country')?.name || 'una zona dominante'}.`, impact: 'Medio', risk: 'Medio', horizon: '3-6 meses', reviewDate: new Date(Date.now() + 120 * 86400000).toISOString() }); if (options.totalCollateral > 0) generated.push({ id: 'options-cash-check', kind: 'alert', title: 'Revisar si todas las puts abiertas serian asumibles si se asignaran hoy', category: 'Opciones', action: 'Simular asignacion simultanea y reservar caja real para no depender de ventas forzadas.', urgency: options.expiringSoon.length ? 'Alta' : 'Media', explanation: 'Las opciones abiertas consumen liquidez real y pueden aumentar la concentracion de forma brusca.', justification: `${eur.format(options.totalCollateral)} comprometidos y ${options.expiringSoon.length} vencimientos proximos.`, impact: 'Alto', risk: 'Alto', horizon: 'Inmediato', reviewDate: new Date(Date.now() + 21 * 86400000).toISOString() }); if (dividendTrend.growth12m !== null && dividendTrend.growth12m <= 0) generated.push({ id: 'dividend-review', kind: 'estimate', title: 'Revisar si el crecimiento del dividendo se ha estancado frente al ultimo ano', category: 'Dividendos', action: 'Analizar si el frenazo viene de recortes, divisa, rotacion o exceso de concentracion en pagadores maduros.', urgency: 'Media', explanation: 'La renta recurrente no esta mejorando al ritmo esperado.', justification: `Crecimiento interanual estimado: ${formatPercent(dividendTrend.growth12m)}.`, impact: 'Medio', risk: 'Medio', horizon: '1-2 meses', reviewDate: new Date(Date.now() + 60 * 86400000).toISOString() }); if (debtRatio > 0.5) generated.push({ id: 'leverage-discipline', kind: 'alert', title: 'Reducir el ritmo de riesgo hasta estabilizar la deuda total', category: 'Riesgo financiero', action: 'Aplazar decisiones de riesgo incremental hasta aclarar el mapa de deuda y caja futura.', urgency: 'Alta', explanation: 'La deuda total prevista pesa demasiado sobre el patrimonio consolidado.', justification: `Ratio estimado de deuda ampliada: ${num.format(debtRatio * 100)} %.`, impact: 'Alto', risk: 'Alto', horizon: '6-12 meses', reviewDate: new Date(Date.now() + 120 * 86400000).toISOString() }); if (dueReviewCount() > 0) generated.push({ id: 'review-pending', kind: 'fact', title: 'Revisar decisiones pasadas ya vencidas', category: 'Aprendizaje', action: 'Cerrar las revisiones pendientes para saber que decisiones mejoraron realmente tu situacion.', urgency: 'Media', explanation: 'Hay decisiones con fecha de revision ya alcanzada.', justification: `${dueReviewCount()} revisiones ya deberian haberse evaluado.`, impact: 'Medio', risk: 'Medio', horizon: 'Este mes', reviewDate: new Date().toISOString() }); const existingById = new Map((state.recommendations || []).map(item => [item.id, item])); return generated.slice(0, 6).map(item => { const existing = existingById.get(item.id); return migrateRecommendation({ ...item, status: existing?.status || 'pending', reason: existing?.reason || '', createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), decidedAt: existing?.decidedAt || null }); }); }
function renderAdvisorCenter() { ensureAdvisoryState(); const recommendationRows = $('#recommendationRows'); const decisionRows = $('#decisionRows'); const diagnosis = $('#advisorDiagnosis'); const priorities = $('#advisorPriorities'); const signalsNode = $('#advisorSignals'); const optionsSummaryNode = $('#advisorOptionsSummary'); const optionsAlertsNode = $('#advisorOptionsAlerts'); if (!diagnosis) return; $('#advisorMinLiquidity').value = state.advisor.minimumLiquidityTarget ?? ''; $('#advisorUpcomingDebt').value = state.advisor.upcomingDebt ?? ''; $('#advisorUpcomingDebtMonths').value = state.advisor.upcomingDebtMonths ?? ''; $('#advisorSavingsCapacity').value = state.advisor.savingsCapacity ?? ''; $('#advisorEmergencyFund').value = state.advisor.emergencyFundTarget ?? ''; state.recommendations = buildRecommendations(); const sortedRecommendations = sortRows(state.recommendations, 'recommendations'); const { signals } = advisorSignals(); const options = optionsSummary(); diagnosis.className = 'summary-stack'; diagnosis.innerHTML = executiveDiagnosis(state.recommendations).map(line => `<small>${escapeHtml(line)}</small>`).join(''); priorities.className = sortedRecommendations.length ? 'scenario-list' : 'scenario-list empty-state'; priorities.innerHTML = sortedRecommendations.slice(0, 3).map(item => `<article class="priority-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.urgency)}</span><small>${escapeHtml(item.explanation)}</small><small>Accion: ${escapeHtml(item.action || 'Pendiente de concretar')}</small><small>Revision: ${dateEs(String(item.reviewDate).slice(0, 10))}</small></article>`).join('') || 'Sin datos'; signalsNode.className = 'signal-list'; signalsNode.innerHTML = signals.map(signal => `<div class="signal-row signal-${signal.tone}"><strong>${escapeHtml(signal.title)}</strong><span>${escapeHtml(signal.name)}</span><small>${escapeHtml(signal.detail)}</small></div>`).join(''); optionsSummaryNode.className = 'summary-stack'; optionsSummaryNode.innerHTML = options.open.length ? [`<strong>${options.open.length} posiciones abiertas</strong>`, `<small>Garantias reservadas: ${eur.format(options.totalCollateral)}</small>`, `<small>Primas netas acumuladas: ${eur.format(options.totalPremium)}</small>`, `<small>Exposicion potencial por asignacion: ${eur.format(options.assignedPotential)}</small>`].join('') : '<small>No hay opciones abiertas registradas.</small>'; optionsAlertsNode.className = 'signal-list'; const optionAlertCards = []; if (options.expiringSoon.length) optionAlertCards.push({ tone: 'warn', title: 'Vencimientos proximos', detail: `${options.expiringSoon.length} posiciones vencen en los proximos 45 dias.` }); if (options.totalCollateral > fullMetrics().liquidity * 0.4 && fullMetrics().liquidity > 0) optionAlertCards.push({ tone: 'risk', title: 'Liquidez comprometida', detail: 'Las garantias absorben una parte demasiado alta de la caja disponible.' }); if (!optionAlertCards.length) optionAlertCards.push({ tone: 'good', title: 'Opciones bajo control', detail: 'No hay alertas criticas en las posiciones registradas.' }); optionsAlertsNode.innerHTML = optionAlertCards.map(item => `<div class="signal-row signal-${item.tone}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join(''); recommendationRows.innerHTML = sortedRecommendations.length ? sortedRecommendations.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.category)} | ${escapeHtml(advisoryKindLabel(item.kind))}</small><br><small>${escapeHtml(item.action || item.explanation)}</small></td><td>${escapeHtml(item.urgency)}</td><td>${escapeHtml(item.impact)}</td><td>${escapeHtml(item.risk)}</td><td>${dateEs(String(item.reviewDate).slice(0, 10))}</td><td>${escapeHtml(item.statusLabel || recommendationStatusLabel(item.status))}</td><td><div class="recommendation-actions"><wa-button size="small" appearance="plain" data-rec-action="accept" data-rec-id="${item.id}">Aceptar</wa-button><wa-button size="small" appearance="plain" data-rec-action="execute" data-rec-id="${item.id}">Ejecutada</wa-button><wa-button size="small" appearance="plain" data-rec-action="postpone" data-rec-id="${item.id}">Posponer</wa-button><wa-button size="small" appearance="plain" data-rec-action="discard" data-rec-id="${item.id}">Descartar</wa-button></div></td></tr>`).join('') : '<tr><td colspan="7" class="empty-cell">Sin recomendaciones todavia.</td></tr>'; const reviews = decisionReviewsRows(); decisionRows.innerHTML = reviews.length ? reviews.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.phaseLabel)} | ${escapeHtml(item.actionLabel)}</small></td><td>${item.decidedAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.decidedAt)) : '-'}</td><td>${dateEs(String(item.reviewDate || '').slice(0, 10))}</td><td>${escapeHtml(item.statusLabel)}</td><td>${escapeHtml(item.lesson || item.reason || item.expectedOutcome || 'Sin aprendizaje registrado')}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-cell">Aun no hay decisiones registradas.</td></tr>'; }
function renderOptionsModule() { const summaryNode = $('#optionSummary'); const rowsNode = $('#optionRows'); if (!summaryNode || !rowsNode) return; const summary = optionsSummary(); summaryNode.className = 'summary-stack'; summaryNode.innerHTML = summary.open.length ? [`<strong>${summary.open.length} posiciones abiertas</strong>`, `<small>Garantias reservadas: ${eur.format(summary.totalCollateral)}</small>`, `<small>Primas abiertas: ${eur.format(summary.openPremium)}</small>`, `<small>Primas historicas netas: ${eur.format(summary.totalPremium)}</small>`, `<small>Vencimientos proximos: ${summary.expiringSoon.length}</small>`].join('') : '<small>Sin operaciones registradas.</small>'; const rows = sortRows(state.options.map(option => { const derived = optionDerived(option); return { ...option, netPremium: derived.netPremium, capitalCommitted: derived.capitalCommitted }; }), 'options'); rowsNode.innerHTML = rows.length ? rows.map(option => { const derived = optionDerived(option); return `<tr><td class="company-cell"><strong>${escapeHtml(option.underlying || option.ticker || 'Sin subyacente')}</strong><small>${escapeHtml(option.ticker || '-')} | ${escapeHtml(option.isin || 'Sin ISIN')}</small></td><td>${option.optionType === 'put' ? 'Put' : 'Call'}<br><small>${escapeHtml(option.strategy)}</small></td><td>${escapeHtml(option.objective === 'income' ? 'Prima' : 'Comprar acciones')}<br><small>Entrada efectiva ${derived.effectiveEntry === null ? '-' : eur.format(derived.effectiveEntry)}</small></td><td>${dateEs(option.expiration)}</td><td>${eur.format(derived.netPremium)}</td><td>${eur.format(derived.capitalCommitted)}</td><td>${escapeHtml(option.status)}</td><td><wa-button size="small" appearance="plain" data-delete-option="${option.id}"><wa-icon name="trash"></wa-icon></wa-button></td></tr>`; }).join('') : '<tr><td colspan="8" class="empty-cell">No hay posiciones en opciones.</td></tr>'; }
function reviewCheckpointsForRecommendation(recommendation, actionLabel, status, reason) { const decidedAt = new Date().toISOString(); return [{ phase: '3m', days: 90 }, { phase: '6m', days: 180 }, { phase: '12m', days: 365 }].map(checkpoint => migrateDecisionReview({ recommendationId: recommendation.id, title: recommendation.title, category: recommendation.category, phase: checkpoint.phase, actionLabel, status: ['accepted', 'executed'].includes(status) ? 'pending' : status, reason, expectedOutcome: recommendation.action || recommendation.impact, lesson: '', createdAt: recommendation.createdAt || decidedAt, decidedAt, reviewDate: new Date(Date.now() + checkpoint.days * 86400000).toISOString() })); }
function handleRecommendationAction(action, recommendationId) { const index = state.recommendations.findIndex(item => item.id === recommendationId); if (index < 0) return; const recommendation = state.recommendations[index]; const promptReason = window.prompt(`Motivo para marcar la recomendacion como ${recommendationActionLabel(action).toLowerCase()}:`, recommendation.reason || ''); const reason = promptReason ?? recommendation.reason ?? ''; const nextStatus = action === 'accept' ? 'accepted' : action === 'execute' ? 'executed' : action === 'postpone' ? 'postponed' : 'discarded'; state.recommendations[index] = migrateRecommendation({ ...recommendation, status: nextStatus, reason, decidedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); state.decisionReviews = [...reviewCheckpointsForRecommendation(recommendation, recommendationActionLabel(action), nextStatus, reason), ...(state.decisionReviews || []).filter(item => item.recommendationId !== recommendationId)].map(migrateDecisionReview); saveState(); renderAdvisorCenter(); renderSortableHeaders(); showNotice(`Recomendacion ${recommendationActionLabel(action).toLowerCase()}.`); }
function undoLastImportLatest() { if (!state.lastImportUndo?.snapshot) { showNotice('No hay ninguna importacion que deshacer.'); return; } const snapshot = state.lastImportUndo.snapshot; state.portfolio = (snapshot.portfolio || []).map(migratePosition).filter(Boolean); state.transactions = (snapshot.transactions || []).map(migrateTransaction).filter(Boolean); state.options = (snapshot.options || []).map(migrateOptionPosition).filter(Boolean); state.recommendations = (snapshot.recommendations || []).map(migrateRecommendation).filter(Boolean); state.decisionReviews = (snapshot.decisionReviews || []).map(migrateDecisionReview).filter(Boolean); state.advisor = { ...defaultAdvisorState(snapshot.settings || DEFAULT_SETTINGS), ...(snapshot.advisor || {}) }; state.history = (snapshot.history || []).map(migrateSnapshot).filter(Boolean); state.assets = (snapshot.assets || []).map(migrateAsset).filter(Boolean); state.liabilities = (snapshot.liabilities || []).map(migrateLiability).filter(Boolean); state.reportHistory = (snapshot.reportHistory || []).map(migrateReportEntry).filter(Boolean); state.settings = migrateSettings(snapshot.settings); state.lastImport = snapshot.lastImport || null; state.lastTransactionsImport = snapshot.lastTransactionsImport || null; state.lastBackupAt = snapshot.lastBackupAt || null; state.lastImportUndo = null; saveState(); render(); showNotice('Se ha restaurado la copia previa a la ultima importacion.'); }
function buildPortfolioDataMarkdown() { const portfolio = sortedPortfolio(activePortfolio()); const metrics = fullMetrics(portfolio); const sector = groupByValue(portfolio, 'sector', metrics.value); const country = groupByValue(portfolio, 'country', metrics.value); const score = portfolioScore(portfolio); const signals = concentrationSignals(portfolio); const scenarios = independenceScenarios(metrics); const transactions = transactionRowsData(); const txAnalytics = transactionAnalytics(transactions); const options = optionsSummary(); const recommendations = buildRecommendations(); const reviews = decisionReviewsRows(); return ['# Datos patrimoniales exportados', '', `Fecha del informe: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date())}`, '', '## Resumen patrimonial', `- Valor de cartera: ${eur.format(metrics.value)}`, `- Coste invertido: ${eur.format(metrics.cost)}`, `- Plusvalia: ${eur.format(metrics.gain)}`, `- Dividendos anuales estimados: ${eur.format(metrics.dividends)}`, `- Liquidez registrada: ${eur.format(metrics.liquidity)}`, `- Liquidez util tras garantias: ${eur.format(Math.max(0, metrics.liquidity - options.totalCollateral))}`, `- Otros activos: ${eur.format(metrics.otherAssets)}`, `- Deuda total: ${eur.format(metrics.liabilities)}`, `- Patrimonio neto: ${eur.format(metrics.netWorth)}`, '', '## Salud de la cartera', `- Puntuacion global: ${score.value}/100 (${score.label})`, ...signals.map(signal => `- Concentracion ${signal.title.toLowerCase()}: ${signal.name} con ${pct.format(signal.weight)} (${signal.label})`), '', '## Objetivos financieros', `- Gasto mensual objetivo: ${state.settings.monthlyExpense === null ? 'No configurado' : eur.format(state.settings.monthlyExpense)}`, `- Objetivo anual de dividendos: ${state.settings.targetAnnualDividends === null ? 'No configurado' : eur.format(state.settings.targetAnnualDividends)}`, `- Objetivo de patrimonio neto: ${state.settings.targetNetWorth === null ? 'No configurado' : eur.format(state.settings.targetNetWorth)}`, `- Aportacion mensual prevista: ${state.settings.monthlyContribution === null ? 'No configurada' : eur.format(state.settings.monthlyContribution)}`, '', '## Escenarios de independencia financiera', ...(scenarios ? scenarios.map(s => `- ${s.label}: ${s.years === null ? 'mas de 40 anos' : `${s.years} anos`} | meta estimada ${s.eta}`) : ['- Configura el gasto mensual para obtener escenarios.']), '', '## Cambios frente al cierre anterior', ...reportDeltaSection(), '', '## Actividad de capital y transacciones', `- Operaciones importadas: ${transactions.length}`, `- Compras netas 12m: ${eur.format(txAnalytics.lastTwelveMonths.netAmount)}`, `- Comisiones e impuestos acumulados: ${eur.format(txAnalytics.allTotals.costs)}`, `- Plusvalia realizada estimada: ${eur.format(txAnalytics.realized)}`, `- Ritmo medio de compras 6m: ${eur.format(txAnalytics.monthlyBuys)}`, '', '## Operativa con opciones', `- Posiciones abiertas: ${options.open.length}`, `- Garantias reservadas: ${eur.format(options.totalCollateral)}`, `- Primas netas acumuladas: ${eur.format(options.totalPremium)}`, `- Exposicion potencial por asignacion: ${eur.format(options.assignedPotential)}`, `- Vencimientos proximos: ${options.expiringSoon.length}`, ...options.open.slice(0, 10).map(option => { const derived = optionDerived(option); return `- ${option.underlying || option.ticker}: ${option.optionType} ${dateEs(option.expiration)} | prima ${eur.format(derived.netPremium)} | capital ${eur.format(derived.capitalCommitted)} | entrada efectiva ${derived.effectiveEntry === null ? '-' : eur.format(derived.effectiveEntry)}`; }), '', '## Recomendaciones priorizadas', ...(recommendations.length ? recommendations.map(item => `- [${advisoryKindLabel(item.kind)}] ${item.title} | urgencia ${item.urgency} | impacto ${item.impact} | revisar ${dateEs(String(item.reviewDate).slice(0, 10))} | accion: ${item.action}`) : ['- No hay recomendaciones activas.']), '', '## Seguimiento de decisiones', ...(reviews.length ? reviews.slice(0, 12).map(item => `- ${item.phaseLabel} | ${item.title} | estado ${item.statusLabel} | revision ${dateEs(String(item.reviewDate || '').slice(0, 10))} | esperado: ${item.expectedOutcome || '-'} | observado: ${item.actualOutcome || '-'} | aprendizaje: ${item.lesson || '-'}`) : ['- No hay revisiones registradas.']), '', '## Cartera', '| Empresa | Ticker | ISIN | Valor | Peso | Dividendo anual | Yield | YOC | Estado |', '|---|---|---|---:|---:|---:|---:|---:|---|', ...portfolio.map(position => `| ${position.name.replaceAll('|', '/')} | ${position.symbol} | ${position.isin} | ${eur.format(position.marketValue || 0)} | ${formatPercent(position.allocation)} | ${eur.format(position.annualDividend || 0)} | ${formatPercent(position.dividendYield)} | ${formatPercent(position.yieldOnCost)} | ${position.status} |`), '', '## Distribucion por sectores', ...sector.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Distribucion geografica', ...country.slice(0, 8).map(item => `- ${item.name}: ${pct.format(item.weight)}`), '', '## Liquidez, activos y deuda', ...state.assets.map(asset => `- Activo ${asset.name} (${asset.type}): ${eur.format(asset.value || 0)}`), ...state.liabilities.map(liability => `- Deuda ${liability.name} (${liability.type}): ${eur.format(liability.value || 0)}`), '', '## Historico de informes registrados', ...recentReportSummary(), '', '## Comentarios personales', '- Exportado desde la aplicacion local-first. Los datos permanecen en el dispositivo.'].join('\n'); }
async function markdown() { const portfolio = sortedPortfolio(activePortfolio()); const metrics = fullMetrics(portfolio); const score = portfolioScore(portfolio); const filename = `comite-inversion-family-office-${new Date().toISOString().slice(0, 10)}.md`; const promptTemplate = await loadAnalysisPromptTemplate(); const dataBlock = buildPortfolioDataMarkdown(); const finalDocument = mergePromptWithData(promptTemplate, dataBlock); download(filename, finalDocument, 'text/markdown'); saveReportHistoryEntry({ ...defaultReportEntry(), createdAt: new Date().toISOString(), score: score.value, netWorth: metrics.netWorth, dividends: metrics.dividends, concentrationLabel: score.concentrationLabel, filename }); saveState(); renderReportHistory(); showNotice('Informe generado con prompt editable y registrado en el historico.'); }
ensureAdvisoryState();
saveState();
render();


function loadGuidedDemo() {
  askConfirm('Se sustituiran los datos locales actuales por la demo anual de ejemplo. Puedes exportar una copia JSON antes si quieres conservarlos.', () => {
    const currentTheme = state.theme === 'dark' ? 'dark' : 'light';
    const demo = createDemoState();
    Object.assign(state, defaultState(), demo, { theme: currentTheme, lastImportUndo: null, backups: [] });
    saveState();
    render();
    showNotice('Demo anual cargada en la aplicacion.');
  });
}
$('#loadDemoBtn')?.addEventListener('click', loadGuidedDemo);
