import { useState, useEffect, useCallback } from 'react';
import { fetchSheet, SHEET_URLS, clearSheetCache } from '../utils/sheetsData';
import type { OpTable, OpRow, RowType } from '../utils/mockData';

export interface SheetKPIs {
  carteiraTotalClientes: number; carteiraTotalValor: number;
  clientesLocalizados: number; clientesLocalizadosPct: number; localizadosDividaTotal: number;
  promessasVigentes: number; promessasDividaTotal: number;
  depositosCompletos: number;
  depositosCompletosPct: number; valorRecuperado: number;
}

export interface ExecRow {
  executivo: string; email: string; carteira: string;
  assignado: number; completo: number; parcial: number; depositoTotal: number;
  pctCompleto: number; atingimento: number; metaDeposito: number;
  wpp: number; wppMeetTel: number; pctContato: number;
  montoBaixas: number; pctBaixas: number; metaBaixas: number;
  equipe: 'Antonio' | 'Ana';
}

export interface ExecTotal {
  nome: string; assignado: number; completo: number; parcial: number;
  depositoTotal: number; pctCompleto: number; wpp: number; wppMeetTel: number;
  pctContato: number; montoBaixas: number; pctBaixas: number;
}

export interface BaixasRow {
  label: string; assignado: number; solicitados: number; confirmado: number;
  retido: number; pendente: number; baixaPrevista: number;
  pctBaixas: number; pctRetido: number; rep?: number; isTotal?: boolean;
}

export interface LigacaoRow {
  data:       string; // "02/06/2026"
  agent:      string; // "lauryn.aguiar@gobravo.com.br"
  hora:       string; // "09h"
  tentativas: number;
  efetivas:   number;
}

export interface SheetData {
  kpis: SheetKPIs;
  primaryLocalizados: OpTable[]; primaryPromessas: OpTable[]; primaryDepositos: OpTable[];
  secondaryLocalizados: OpTable[]; secondaryPromessas: OpTable[]; secondaryDepositos: OpTable[];
  executivoRows: ExecRow[]; equipe1Total: ExecTotal; equipe2Total: ExecTotal; grandTotal: ExecTotal;
  baixasPrimClientes: BaixasRow[]; baixasPrimDivida: BaixasRow[];
  baixasSecClientes: BaixasRow[]; baixasSecDivida: BaixasRow[];
  ligacoes: LigacaoRow[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function cleanNum(v: string): number {
  if (!v) return 0;
  const s = v.replace(/R\$\s*/g,'').replace(/\$\s*/g,'').replace(/\./g,'').replace(',','.').replace('%','').trim();
  return parseFloat(s) || 0;
}

function rowType(label: string): RowType {
  const l = label.toLowerCase().trim();
  if (l.endsWith('%') || l.includes(' %')) return 'pct';
  if (l === 'total') return 'total';
  return 'data';
}

function isEmpty(r: string[]): boolean {
  return r.every(c => !c || !c.trim());
}

// Encontra o índice da primeira linha cujo col0 === label (case-insensitive)
function findRow(rows: string[][], label: string, from = 0): number {
  const l = label.toLowerCase();
  for (let i = from; i < rows.length; i++) {
    if ((rows[i]?.[0] ?? '').trim().toLowerCase() === l) return i;
  }
  return -1;
}

// Extrai um bloco entre dois marcadores de label
function sliceBetween(rows: string[][], startLabel: string, endLabels: string[], from = 0): string[][] {
  const start = findRow(rows, startLabel, from);
  if (start < 0) return [];
  let end = rows.length;
  for (const el of endLabels) {
    const idx = findRow(rows, el, start + 1);
    if (idx > 0 && idx < end) end = idx;
  }
  return rows.slice(start, end);
}

// Constrói OpTable a partir de linhas brutas (ignora linhas vazias e cabeçalhos de seção)
function buildTable(title: string, cols: string[], rawRows: string[][], skipLabels: string[]): OpTable {
  const skip = new Set(skipLabels.map(s => s.toLowerCase()));
  const opRows: OpRow[] = [];
  for (const r of rawRows) {
    const label = (r[0] ?? '').trim();
    if (!label || isEmpty(r) || skip.has(label.toLowerCase())) continue;
    const values = r.slice(1, cols.length + 1).map(v => v?.trim() || '0');
    opRows.push({ label, values, type: rowType(label) });
  }
  return { title, columns: cols, rows: opRows };
}

// ── Parser Resumo Depósitos ───────────────────────────────────────────────────

export function parseDepositos(rows: string[][]): Partial<SheetData> {
  // Encontra separação Primária / Secundária
  const secIdx = findRow(rows, 'Carteira Secundária');
  const primRows = rows.slice(0, secIdx > 0 ? secIdx : rows.length);
  const secRows  = secIdx > 0 ? rows.slice(secIdx) : [];

  const PRIMARY_COLS   = ['Total','Novatos','2dos','Sin segundos','3ros','4tos','5tos','Regular','2xC','Estruturado','Atenção','Rec >35<60','Rec >60<90','Rec >90','Crédito'];
  const SECONDARY_COLS = ['Total','Novatos','2dos','Sin segundos','3ros','4tos','5tos','Regular 1','Regular 2','Regular 3','2xC','Estruturado','Atenção','Pronto socorro','UTI','Crédito'];

  function parseSec(srows: string[][], cols: string[]) {
    const SKIP = ['Clientes','Dívida','Cliente','Localizados','Promessas','Depósito','Carteira','Assignado','Carteira Primária','Carteira Secundária'];

    const locClientes = sliceBetween(srows, 'Localizados', ['Promessas','Depósito','Carteira Secundária']);
    const locDivida   = locClientes.filter(r => (r[0]??'').trim().toLowerCase() === 'dívida' ||
      locClientes.indexOf(r) > locClientes.findIndex(x => (x[0]??'').trim().toLowerCase() === 'dívida') && (x => x > 0)(locClientes.findIndex(x => (x[0]??'').trim().toLowerCase() === 'dívida')));

    // Simpler approach: find sections by header within slice
    function extractSubTable(sectionRows: string[][], headerLabel: string, stopLabels: string[]): string[][] {
      const hi = findRow(sectionRows, headerLabel);
      if (hi < 0) return [];
      let end = sectionRows.length;
      for (const sl of stopLabels) {
        const si = findRow(sectionRows, sl, hi + 1);
        if (si > 0 && si < end) end = si;
      }
      return sectionRows.slice(hi + 1, end).filter(r => !isEmpty(r));
    }

    const locBlock   = sliceBetween(srows, 'Localizados', ['Promessas','Depósito','Carteira Secundária']);
    const promBlock  = sliceBetween(srows, 'Promessas',   ['Depósito','Carteira Secundária']);
    const depBlock   = sliceBetween(srows, 'Depósito',    ['Carteira Secundária','Carteira Primária']);

    const locCli  = extractSubTable(locBlock,  'Clientes', ['Dívida']);
    const locDiv  = extractSubTable(locBlock,  'Dívida',   []);
    const promCli = extractSubTable(promBlock, 'Clientes', ['Dívida']);
    const promDiv = extractSubTable(promBlock, 'Dívida',   []);
    const depCli  = extractSubTable(depBlock,  'Cliente',  ['Dívida']).concat(extractSubTable(depBlock,'Clientes',['Dívida']));
    const depDiv  = extractSubTable(depBlock,  'Dívida',   []);

    return {
      loc:  [buildTable('Clientes', cols, locCli,  SKIP), buildTable('Dívida', cols, locDiv,  SKIP)],
      prom: [buildTable('Clientes', cols, promCli, SKIP), buildTable('Dívida', cols, promDiv, SKIP)],
      dep:  [buildTable('Clientes', cols, depCli,  SKIP), buildTable('Dívida', cols, depDiv,  SKIP)],
    };
  }

  const prim = parseSec(primRows, PRIMARY_COLS);
  const sec  = parseSec(secRows,  SECONDARY_COLS);

  // KPIs
  const assignRow  = primRows.find(r => (r[0]??'').trim() === 'Clientes' && r[1] && cleanNum(r[1]) > 100);
  const dividaRow  = primRows.find(r => (r[0]??'').trim() === 'Dívida'   && r[1] && cleanNum(r[1]) > 1000000);
  const totalLoc   = primRows.find(r => (r[0]??'').trim() === 'Total'    && r[1] && cleanNum(r[1]) > 100 && cleanNum(r[1]) < 10000);
  // Localizados Dívida — Total da seção Dívida do bloco Localizados
  const locDivBlock = sliceBetween(primRows, 'Localizados', ['Promessas','Depósito','Carteira Secundária']);
  const locDivSection = sliceBetween(locDivBlock, 'Dívida', ['Promessas','Depósito']);
  const locDivTotalRow = locDivSection.find(r => (r[0]??'').trim() === 'Total' && cleanNum(r[1]??'0') > 10000);
  const localizadosDivida = cleanNum(locDivTotalRow?.[1] ?? '0');
  const completoC  = primRows.find(r => (r[0]??'').trim() === 'Completo' && r[1] && cleanNum(r[1]) > 0 && cleanNum(r[1]) < 10000);
  const completoD  = primRows.find(r => (r[0]??'').trim() === 'Completo' && r[1] && cleanNum(r[1]) > 1000000);
  const completoPct= primRows.find(r => (r[0]??'').trim() === 'Completo %');

  // Promessas — soma todas as linhas de cada seção (Clientes e Dívida)
  const promBlock   = sliceBetween(primRows, 'Promessas', ['Depósito', 'Carteira Secundária']);
  const PROM_LABELS = ['vigente'];

  function sumSection(rows: string[][], headerLabel: string, stopLabel: string): number {
    const hi = findRow(rows, headerLabel);
    if (hi < 0) return 0;
    const stopIdx = findRow(rows, stopLabel, hi + 1);
    const end = stopIdx > 0 ? stopIdx : rows.length;
    return rows.slice(hi + 1, end)
      .filter(r => PROM_LABELS.includes((r[0]??'').trim().toLowerCase()))
      .reduce((s, r) => s + cleanNum(r[1] ?? '0'), 0);
  }

  const promCli = sumSection(promBlock, 'Clientes', 'Dívida');
  const promDiv = sumSection(promBlock, 'Dívida', '');

  const totalClientes   = cleanNum(assignRow?.[1]  ?? '0');
  const totalDivida     = cleanNum(dividaRow?.[1]  ?? '0');
  const localizados     = cleanNum(totalLoc?.[1]   ?? '0');
  const depositos       = cleanNum(completoC?.[1]  ?? '0');
  const valorRecuperado = cleanNum(completoD?.[1]  ?? '0');
  const depPct          = cleanNum(completoPct?.[1]?? '0');
  const promessas       = promCli;
  const promessasDivida = promDiv;

  const kpis: SheetKPIs = {
    carteiraTotalClientes: totalClientes,
    carteiraTotalValor:    totalDivida,
    clientesLocalizados:   localizados,
    clientesLocalizadosPct: totalClientes > 0 ? Math.round((localizados/totalClientes)*100) : 0,
    localizadosDividaTotal: localizadosDivida,
    promessasVigentes:     promessas,
    promessasDividaTotal:  promessasDivida,
    depositosCompletos:    depositos,
    depositosCompletosPct: depPct,
    valorRecuperado,
  };

  return {
    kpis,
    primaryLocalizados:   prim.loc,
    primaryPromessas:     prim.prom,
    primaryDepositos:     prim.dep,
    secondaryLocalizados: sec.loc,
    secondaryPromessas:   sec.prom,
    secondaryDepositos:   sec.dep,
  };
}

// ── Parser Resumo Executivo ───────────────────────────────────────────────────

export function parseExecutivo(rows: string[][]): Partial<SheetData> {
  const execRows: ExecRow[] = [];
  let equipe: 'Antonio' | 'Ana' = 'Antonio';
  let team1: ExecRow[] = [], team2: ExecRow[] = [];
  let foundTotal1 = false;
  let inTotalSection = false;
  let grandTotalRow: string[] | null = null;
  let team1TotalRow: string[] | null = null;
  let team2TotalRow: string[] | null = null;

  for (const r of rows) {
    const c0 = (r[0]??'').trim(), c1 = (r[1]??'').trim(), c2 = (r[2]??'').trim();

    // Detecta início da seção "Total Equipe"
    if (c0 === 'Total Equipe' || c1 === 'Total Equipe' || c2 === 'Total Equipe') {
      if (!foundTotal1) { foundTotal1 = true; equipe = 'Ana'; }
      inTotalSection = true;
      continue;
    }

    // Dentro da seção Total Equipe: labels estão em r[3], valores em r[4]+
    if (inTotalSection) {
      const c3 = (r[3]??'').trim();
      if ((c0 === 'Antonio' || c3 === 'Antonio') && cleanNum(r[c3==='Antonio'?4:3] ?? '0') > 0) {
        team1TotalRow = c3 === 'Antonio' ? ['','','',r[3]??'', r[4]??'', r[5]??'', r[6]??'', r[7]??'', r[8]??'', r[9]??'', r[10]??'', r[11]??'', r[12]??'', r[13]??'', r[14]??'', r[15]??''] : r;
        continue;
      }
      if ((c0 === 'Ana' || c3 === 'Ana') && cleanNum(r[c3==='Ana'?4:3] ?? '0') > 0) {
        team2TotalRow = c3 === 'Ana' ? ['','','',r[3]??'', r[4]??'', r[5]??'', r[6]??'', r[7]??'', r[8]??'', r[9]??'', r[10]??'', r[11]??'', r[12]??'', r[13]??'', r[14]??'', r[15]??''] : r;
        continue;
      }
      if ((c0 === 'Total' || c3 === 'Total') && cleanNum(r[c3==='Total'?4:3] ?? '0') > 0) {
        // Normaliza para offset padrão (assignado em r[3])
        if (c3 === 'Total') {
          grandTotalRow = ['','','', r[4]??'', r[5]??'', r[6]??'', r[7]??'', r[8]??'', r[9]??'', r[10]??'', r[11]??'', r[12]??'', r[13]??'', r[14]??'', r[15]??'', r[16]??''];
        } else {
          grandTotalRow = r;
        }
        inTotalSection = false; continue;
      }
      if (!c1.includes('@')) continue;
    }

    const skip = ['Executivo','Executivos / Carteiras','Antonio','Ana','Total','Total Equipe',''];
    if (skip.includes(c0)) continue;
    if (!c1.includes('@')) continue;

    const row: ExecRow = {
      executivo: c0, email: c1, carteira: c2,
      assignado:    cleanNum(r[3]  ?? '0'),
      completo:     cleanNum(r[4]  ?? '0'),
      parcial:      cleanNum(r[5]  ?? '0'),
      depositoTotal:cleanNum(r[6]  ?? '0'),
      pctCompleto:  cleanNum(r[7]  ?? '0'),
      atingimento:  cleanNum(r[8]  ?? '0'),
      metaDeposito: cleanNum(r[9]  ?? '0'),
      wpp:          cleanNum(r[10] ?? '0'),
      wppMeetTel:   cleanNum(r[11] ?? '0'),
      pctContato:   cleanNum(r[12] ?? '0'),
      montoBaixas:  cleanNum(r[13] ?? '0'),
      pctBaixas:    cleanNum(r[14] ?? '0'),
      metaBaixas:   cleanNum(r[15] ?? '0'),
      equipe,
    };
    execRows.push(row);
    if (equipe === 'Antonio') team1.push(row); else team2.push(row);
  }

  // Lê total direto de uma linha da planilha
  function rowToTotal(r: string[], nome: string): ExecTotal {
    const a=cleanNum(r[3]??'0'), c=cleanNum(r[4]??'0'), p=cleanNum(r[5]??'0');
    const d=cleanNum(r[6]??'0'), w=cleanNum(r[10]??'0'), t=cleanNum(r[11]??'0');
    const m=cleanNum(r[13]??'0');
    return { nome, assignado:a, completo:c, parcial:p, depositoTotal:d,
      pctCompleto:a>0?(c/a)*100:0, wpp:w, wppMeetTel:t, pctContato:0,
      montoBaixas:m, pctBaixas:a>0?(m/a)*100:0 };
  }

  function sumTeam(teamRows: ExecRow[], nome: string): ExecTotal {
    const a=teamRows.reduce((s,r)=>s+r.assignado,0), c=teamRows.reduce((s,r)=>s+r.completo,0);
    const p=teamRows.reduce((s,r)=>s+r.parcial,0),   d=teamRows.reduce((s,r)=>s+r.depositoTotal,0);
    const w=teamRows.reduce((s,r)=>s+r.wpp,0),       t=teamRows.reduce((s,r)=>s+r.wppMeetTel,0);
    const m=teamRows.reduce((s,r)=>s+r.montoBaixas,0);
    return { nome, assignado:a, completo:c, parcial:p, depositoTotal:d,
      pctCompleto: a>0?(c/a)*100:0, wpp:w, wppMeetTel:t,
      pctContato: teamRows.length>0?teamRows.reduce((s,r)=>s+r.pctContato,0)/teamRows.length:0,
      montoBaixas:m, pctBaixas:a>0?(m/a)*100:0 };
  }

  const equipe1Total = team1TotalRow ? rowToTotal(team1TotalRow, 'Antonio') : sumTeam(team1, 'Antonio');
  const equipe2Total = team2TotalRow ? rowToTotal(team2TotalRow, 'Ana')     : sumTeam(team2, 'Ana');

  // Grand total: usa linha "Total" da planilha se encontrada, senão soma equipes
  const grandTotalFromRow = grandTotalRow ? rowToTotal(grandTotalRow, 'Total Geral') : null;
  const gt: ExecTotal = grandTotalFromRow ?? {
    nome:'Total Geral',
    assignado:    equipe1Total.assignado    + equipe2Total.assignado,
    completo:     equipe1Total.completo     + equipe2Total.completo,
    parcial:      equipe1Total.parcial      + equipe2Total.parcial,
    depositoTotal:equipe1Total.depositoTotal+ equipe2Total.depositoTotal,
    pctCompleto:0, wpp:equipe1Total.wpp+equipe2Total.wpp,
    wppMeetTel:equipe1Total.wppMeetTel+equipe2Total.wppMeetTel,
    pctContato:0, montoBaixas:equipe1Total.montoBaixas+equipe2Total.montoBaixas, pctBaixas:0,
  };
  gt.pctCompleto = gt.assignado>0?(gt.completo/gt.assignado)*100:0;
  gt.pctBaixas   = gt.assignado>0?(gt.montoBaixas/gt.assignado)*100:0;

  return { executivoRows:execRows, equipe1Total, equipe2Total, grandTotal:gt };
}

// ── Parser Resumo Baixas ──────────────────────────────────────────────────────

export function parseBaixas(rows: string[][]): Partial<SheetData> {
  function parseSection(startLabel: string, endLabel: string, hasRep: boolean): BaixasRow[] {
    const start = findRow(rows, startLabel);
    if (start < 0) return [];
    const end = endLabel ? findRow(rows, endLabel, start+1) : rows.length;
    const section = rows.slice(start, end > 0 ? end : rows.length);
    const result: BaixasRow[] = [];
    for (const r of section) {
      const label = (r[0]??'').trim();
      if (!label || isEmpty(r)) continue;
      if (['Clientes','Monto','Dívida','Carteira Primária','Carteira Secundária',
           'Assignado','Solicitados','Mês atual'].includes(label)) continue;
      result.push({
        label, isTotal: label === 'Total',
        assignado:    cleanNum(r[1]??'0'),
        solicitados:  cleanNum(r[2]??'0'),
        confirmado:   cleanNum(r[3]??'0'),
        retido:       cleanNum(r[4]??'0'),
        pendente:     cleanNum(r[5]??'0'),
        baixaPrevista:cleanNum(r[6]??'0'),
        pctBaixas:    cleanNum(r[7]??'0'),
        pctRetido:    cleanNum(r[8]??'0'),
        rep: hasRep && r[9] ? cleanNum(r[9]) : undefined,
      });
    }
    return result;
  }

  return {
    baixasPrimClientes: parseSection('Clientes',           'Monto',              false),
    baixasPrimDivida:   parseSection('Monto',              'Carteira Secundária', false),
    baixasSecClientes:  parseSection('Carteira Secundária','Dívida',              true),
    baixasSecDivida:    parseSection('Dívida',             'Mês atual',           true),
  };
}

// ── Parser Resumo Ligações ────────────────────────────────────────────────────

export function parseLigacoes(rows: string[][]): LigacaoRow[] {
  if (rows.length < 2) return [];
  // Pula header
  return rows.slice(1)
    .filter(r => r[0] && r[1] && r[2])
    .map(r => ({
      data:       r[0].trim(),
      agent:      r[1].trim(),
      hora:       r[2].trim(),
      tentativas: Number(r[3]) || 0,
      efetivas:   Number(r[4]) || 0,
    }));
}

// ── Hook principal ────────────────────────────────────────────────────────────

// ── Module-level shared cache ─────────────────────────────────────────────────
// Todas as instâncias de useSheetData compartilham o mesmo dado.
// Isso evita múltiplas chamadas à API e garante consistência entre componentes.

type Listener = () => void;
let _data: SheetData | null = null;
let _loading = true;
let _error: string | null = null;
let _lastUpdated: Date = new Date();
let _fetchPromise: Promise<void> | null = null;
const _listeners = new Set<Listener>();

function notifyAll() { _listeners.forEach(fn => fn()); }

async function loadData() {
  if (_fetchPromise) return _fetchPromise;
  _loading = true; _error = null; notifyAll();
  _fetchPromise = (async () => {
    try {
      const [depRows, execRows, baixasRows, ligacoesRows] = await Promise.all([
        fetchSheet(SHEET_URLS.resumoDepositos),
        fetchSheet(SHEET_URLS.resumoExecutivo),
        fetchSheet(SHEET_URLS.resumoBaixas),
        fetchSheet(SHEET_URLS.resumoLigacoes),
      ]);
      const dep      = parseDepositos(depRows);
      const exec     = parseExecutivo(execRows);
      const baixas   = parseBaixas(baixasRows);
      const ligacoes = parseLigacoes(ligacoesRows);
      _data = { ...dep, ...exec, ...baixas, ligacoes } as SheetData;
      _lastUpdated = new Date();
    } catch (e) {
      _error = e instanceof Error ? e.message : 'Erro ao carregar dados';
    } finally {
      _loading = false;
      _fetchPromise = null;
      notifyAll();
    }
  })();
  return _fetchPromise;
}

export function useSheetData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick(n => n + 1);
    _listeners.add(rerender);
    if (!_data && !_fetchPromise) loadData();
    const interval = setInterval(() => { _fetchPromise = null; loadData(); }, 5 * 60 * 1000);
    return () => {
      _listeners.delete(rerender);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: _data,
    loading: _loading,
    error: _error,
    lastUpdated: _lastUpdated,
    refresh: () => { clearSheetCache(); _fetchPromise = null; loadData(); },
  };
}
