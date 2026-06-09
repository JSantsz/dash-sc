import { useState, useEffect, useCallback } from 'react';
import { fetchSheet, parseCSV, cleanNumber, cleanPct, SHEET_URLS } from '../utils/sheetsData';
import type { OpTable, OpRow, RowType } from '../utils/mockData';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface SheetKPIs {
  carteiraTotalClientes: number;
  carteiraTotalValor: number;
  clientesLocalizados: number;
  clientesLocalizadosPct: number;
  promessasVigentes: number;
  promessasVigentesPct: number;
  depositosCompletos: number;
  depositosCompletosPct: number;
  valorRecuperado: number;
}

export interface SheetData {
  kpis: SheetKPIs;
  primaryLocalizados: OpTable[];
  primaryPromessas: OpTable[];
  primaryDepositos: OpTable[];
  secondaryLocalizados: OpTable[];
  secondaryPromessas: OpTable[];
  secondaryDepositos: OpTable[];
  executivoRows: ExecRow[];
  equipe1Total: ExecTotal;
  equipe2Total: ExecTotal;
  grandTotal: ExecTotal;
  baixasPrimClientes: BaixasRow[];
  baixasPrimDivida: BaixasRow[];
  baixasSecClientes: BaixasRow[];
  baixasSecDivida: BaixasRow[];
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findRowIndex(rows: string[][], label: string): number {
  return rows.findIndex(r => r[0]?.trim().toLowerCase() === label.toLowerCase());
}

function makeOpTable(title: string, columns: string[], rows: OpRow[]): OpTable {
  return { title, columns, rows };
}

function rowType(label: string): RowType {
  const l = label.toLowerCase();
  if (l.endsWith('%')) return 'pct';
  if (l === 'total') return 'total';
  if (l === 'total %' || l === 'total%') return 'total-pct';
  return 'data';
}

// ─── Parser Resumo Depósitos ─────────────────────────────────────────────────

function parseDepositosSheet(rows: string[][]): Partial<SheetData> {
  // Acha seções por marcadores
  let primStart = -1, secStart = -1;
  for (let i = 0; i < rows.length; i++) {
    const first = rows[i]?.[0]?.trim() ?? '';
    if (first === 'Carteira Primária' && primStart === -1) primStart = i;
    if (first === 'Carteira Secundária') secStart = i;
  }

  const primRows = primStart >= 0 ? rows.slice(primStart, secStart >= 0 ? secStart : undefined) : rows;
  const secRows  = secStart  >= 0 ? rows.slice(secStart) : [];

  function extractSection(sectionRows: string[][], startLabel: string, endLabels: string[]): string[][] {
    const start = sectionRows.findIndex(r => r[0]?.trim() === startLabel);
    if (start < 0) return [];
    let end = sectionRows.length;
    for (const el of endLabels) {
      const idx = sectionRows.findIndex((r, i) => i > start && r[0]?.trim() === el);
      if (idx > 0 && idx < end) end = idx;
    }
    return sectionRows.slice(start, end);
  }

  function buildLocalizadosTable(srows: string[][], cols: string[]): OpTable[] {
    const locRows = extractSection(srows, 'Localizados', ['Promessas', 'Depósito', 'Carteira Secundária']);
    const clienteRows: OpRow[] = [];
    const dividaRows: OpRow[] = [];
    let inDivida = false;
    for (const r of locRows) {
      const label = r[0]?.trim() ?? '';
      if (!label || label === 'Localizados') continue;
      if (label === 'Dívida') { inDivida = true; continue; }
      if (label === 'Clientes') { inDivida = false; continue; }
      const values = r.slice(1, cols.length + 1).map(v => v || '0');
      const row: OpRow = { label, values, type: rowType(label) };
      if (inDivida) dividaRows.push(row); else clienteRows.push(row);
    }
    return [
      makeOpTable('Clientes', cols, clienteRows),
      makeOpTable('Dívida',   cols, dividaRows),
    ];
  }

  function buildPromessasTable(srows: string[][], cols: string[]): OpTable[] {
    const promRows = extractSection(srows, 'Promessas', ['Depósito', 'Carteira Secundária']);
    const clienteRows: OpRow[] = [];
    const dividaRows: OpRow[] = [];
    let inDivida = false;
    for (const r of promRows) {
      const label = r[0]?.trim() ?? '';
      if (!label || label === 'Promessas') continue;
      if (label === 'Dívida') { inDivida = true; continue; }
      if (label === 'Clientes') { inDivida = false; continue; }
      const values = r.slice(1, cols.length + 1).map(v => v || '0');
      const row: OpRow = { label, values, type: rowType(label) };
      if (inDivida) dividaRows.push(row); else clienteRows.push(row);
    }
    return [
      makeOpTable('Clientes', cols, clienteRows),
      makeOpTable('Dívida',   cols, dividaRows),
    ];
  }

  function buildDepositosTable(srows: string[][], cols: string[]): OpTable[] {
    const depRows = extractSection(srows, 'Depósito', ['Carteira Secundária', 'Resumo Executivo']);
    const clienteRows: OpRow[] = [];
    const dividaRows: OpRow[] = [];
    let inDivida = false;
    for (const r of depRows) {
      const label = r[0]?.trim() ?? '';
      if (!label || label === 'Depósito') continue;
      if (label === 'Dívida') { inDivida = true; continue; }
      if (label === 'Cliente' || label === 'Clientes') { inDivida = false; continue; }
      const values = r.slice(1, cols.length + 1).map(v => v || '0');
      const row: OpRow = { label, values, type: rowType(label) };
      if (inDivida) dividaRows.push(row); else clienteRows.push(row);
    }
    return [
      makeOpTable('Clientes', cols, clienteRows),
      makeOpTable('Dívida',   cols, dividaRows),
    ];
  }

  // Colunas primária e secundária
  const PRIMARY_COLS   = ['Total','Novatos','2dos','Sin segundos','3ros','4tos','5tos','Regular','2xC','Estruturado','Atenção','Rec >35<60','Rec >60<90','Rec >90','Crédito'];
  const SECONDARY_COLS = ['Total','Novatos','2dos','Sin segundos','3ros','4tos','5tos','Regular 1','Regular 2','Regular 3','2xC','Estruturado','Atenção','Pronto socorro','UTI','Crédito'];

  // KPIs da carteira primária
  const assignadoRow = primRows.find(r => r[0]?.trim() === 'Clientes');
  const depositoRow  = primRows.find(r => r[0]?.trim() === 'Completo');
  const depositoPct  = primRows.find(r => r[0]?.trim() === 'Completo %');
  const locRow       = primRows.find(r => r[0]?.trim() === 'Total' && r[1] && cleanNumber(r[1]) > 100 && cleanNumber(r[1]) < 5000);
  const dividaRow    = primRows.find(r => r[0]?.trim() === 'Dívida');

  const totalClientes    = cleanNumber(assignadoRow?.[1] ?? '0');
  const totalDivida      = cleanNumber(dividaRow?.[1] ?? '0');
  const depositoCompleto = cleanNumber(depositoRow?.[1] ?? '0');
  const depositoPctVal   = cleanNumber(depositoPct?.[1] ?? '0');
  const localizados      = cleanNumber(locRow?.[1] ?? '0');

  const kpis: SheetKPIs = {
    carteiraTotalClientes: totalClientes,
    carteiraTotalValor: totalDivida,
    clientesLocalizados: localizados,
    clientesLocalizadosPct: totalClientes > 0 ? Math.round((localizados / totalClientes) * 100) : 0,
    promessasVigentes: 0,
    promessasVigentesPct: 0,
    depositosCompletos: depositoCompleto,
    depositosCompletosPct: depositoPctVal,
    valorRecuperado: cleanNumber(primRows.find(r => r[0]?.trim() === 'Completo' && r[1] && cleanNumber(r[1]) > 100000)?.[1] ?? '0'),
  };

  return {
    kpis,
    primaryLocalizados:   buildLocalizadosTable(primRows, PRIMARY_COLS),
    primaryPromessas:     buildPromessasTable(primRows, PRIMARY_COLS),
    primaryDepositos:     buildDepositosTable(primRows, PRIMARY_COLS),
    secondaryLocalizados: buildLocalizadosTable(secRows, SECONDARY_COLS),
    secondaryPromessas:   buildPromessasTable(secRows, SECONDARY_COLS),
    secondaryDepositos:   buildDepositosTable(secRows, SECONDARY_COLS),
  };
}

// ─── Parser Resumo Executivo ─────────────────────────────────────────────────

function parseExecutivoSheet(rows: string[][]): Partial<SheetData> {
  const execRows: ExecRow[] = [];
  let currentEquipe: 'Antonio' | 'Ana' = 'Antonio';
  let equipe1Rows: ExecRow[] = [];
  let equipe2Rows: ExecRow[] = [];
  let foundTotal1 = false;

  for (const r of rows) {
    const col0 = r[0]?.trim() ?? '';
    const col1 = r[1]?.trim() ?? '';
    const col2 = r[2]?.trim() ?? '';

    // Detecta linha de total de equipe em qualquer coluna
    const isTotal = col0 === 'Total Equipe' ||
                    col1 === 'Total Equipe' ||
                    col2 === 'Total Equipe';
    if (isTotal) {
      if (!foundTotal1) { foundTotal1 = true; currentEquipe = 'Ana'; }
      continue;
    }

    // Ignora cabeçalhos e linhas sem email
    const skipLabels = ['Executivo','Executivos / Carteiras','Antonio','Ana','Total'];
    if (!col0 || skipLabels.includes(col0)) continue;
    if (!r[1]?.includes('@')) continue;

    const row: ExecRow = {
      executivo:   col0,
      email:       r[1]?.trim() ?? '',
      carteira:    r[2]?.trim() ?? '',
      assignado:   cleanNumber(r[3] ?? '0'),
      completo:    cleanNumber(r[4] ?? '0'),
      parcial:     cleanNumber(r[5] ?? '0'),
      depositoTotal: cleanNumber(r[6] ?? '0'),
      pctCompleto: cleanNumber(r[7] ?? '0'),
      atingimento: cleanNumber(r[8] ?? '0'),
      metaDeposito: cleanNumber(r[9] ?? '0'),
      wpp:         cleanNumber(r[10] ?? '0'),
      wppMeetTel:  cleanNumber(r[11] ?? '0'),
      pctContato:  cleanNumber(r[12] ?? '0'),
      montoBaixas: cleanNumber(r[13] ?? '0'),
      pctBaixas:   cleanNumber(r[14] ?? '0'),
      metaBaixas:  cleanNumber(r[15] ?? '0'),
      equipe:      currentEquipe,
    };
    execRows.push(row);
    if (currentEquipe === 'Antonio') equipe1Rows.push(row);
    else equipe2Rows.push(row);
  }

  function sumTeam(teamRows: ExecRow[], nome: string): ExecTotal {
    const a = teamRows.reduce((s, r) => s + r.assignado, 0);
    const c = teamRows.reduce((s, r) => s + r.completo, 0);
    const p = teamRows.reduce((s, r) => s + r.parcial, 0);
    const d = teamRows.reduce((s, r) => s + r.depositoTotal, 0);
    const w = teamRows.reduce((s, r) => s + r.wpp, 0);
    const t = teamRows.reduce((s, r) => s + r.wppMeetTel, 0);
    const m = teamRows.reduce((s, r) => s + r.montoBaixas, 0);
    return { nome, assignado: a, completo: c, parcial: p, depositoTotal: d,
      pctCompleto: a > 0 ? (c / a) * 100 : 0, wpp: w, wppMeetTel: t,
      pctContato: teamRows.length > 0 ? teamRows.reduce((s, r) => s + r.pctContato, 0) / teamRows.length : 0,
      montoBaixas: m, pctBaixas: a > 0 ? (m / a) * 100 : 0 };
  }

  const equipe1Total = sumTeam(equipe1Rows, 'Antonio');
  const equipe2Total = sumTeam(equipe2Rows, 'Ana');
  const grandTotal: ExecTotal = {
    nome: 'Total Geral',
    assignado: equipe1Total.assignado + equipe2Total.assignado,
    completo:  equipe1Total.completo  + equipe2Total.completo,
    parcial:   equipe1Total.parcial   + equipe2Total.parcial,
    depositoTotal: equipe1Total.depositoTotal + equipe2Total.depositoTotal,
    pctCompleto: 0, wpp: equipe1Total.wpp + equipe2Total.wpp,
    wppMeetTel: equipe1Total.wppMeetTel + equipe2Total.wppMeetTel,
    pctContato: 0, montoBaixas: equipe1Total.montoBaixas + equipe2Total.montoBaixas, pctBaixas: 0,
  };
  const gt = grandTotal;
  gt.pctCompleto = gt.assignado > 0 ? (gt.completo / gt.assignado) * 100 : 0;
  gt.pctBaixas   = gt.assignado > 0 ? (gt.montoBaixas / gt.assignado) * 100 : 0;

  return { executivoRows: execRows, equipe1Total, equipe2Total, grandTotal };
}

// ─── Parser Resumo Baixas ────────────────────────────────────────────────────

function parseBaixasSheet(rows: string[][]): Partial<SheetData> {
  function parseSection(srows: string[][], startLabel: string, endLabel?: string): BaixasRow[] {
    const start = srows.findIndex(r => r[0]?.trim() === startLabel);
    if (start < 0) return [];
    const end = endLabel ? srows.findIndex((r, i) => i > start && r[0]?.trim() === endLabel) : srows.length;
    const section = srows.slice(start + 1, end > 0 ? end : srows.length);
    const result: BaixasRow[] = [];
    for (const r of section) {
      const label = r[0]?.trim() ?? '';
      if (!label || label === 'Clientes' || label === 'Monto' || label === 'Dívida') continue;
      if (!r[1] && !r[2]) continue;
      result.push({
        label,
        isTotal: label === 'Total',
        assignado:    cleanNumber(r[1] ?? '0'),
        solicitados:  cleanNumber(r[2] ?? '0'),
        confirmado:   cleanNumber(r[3] ?? '0'),
        retido:       cleanNumber(r[4] ?? '0'),
        pendente:     cleanNumber(r[5] ?? '0'),
        baixaPrevista: cleanNumber(r[6] ?? '0'),
        pctBaixas:    cleanNumber(r[7] ?? '0'),
        pctRetido:    cleanNumber(r[8] ?? '0'),
        rep:          r[9] ? cleanNumber(r[9]) : undefined,
      });
    }
    return result;
  }

  const primClientes = parseSection(rows, 'Carteira Primária', 'Monto');
  const primDivida   = parseSection(rows, 'Monto', 'Carteira Secundária');
  const secClientes  = parseSection(rows, 'Carteira Secundária', 'Dívida');
  const secDivida    = parseSection(rows, 'Dívida', 'Mês atual');

  return {
    baixasPrimClientes: primClientes,
    baixasPrimDivida:   primDivida,
    baixasSecClientes:  secClientes,
    baixasSecDivida:    secDivida,
  };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useSheetData() {
  const [data, setData]       = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [depRows, execRows, baixasRows] = await Promise.all([
        fetchSheet(SHEET_URLS.resumoDepositos),
        fetchSheet(SHEET_URLS.resumoExecutivo),
        fetchSheet(SHEET_URLS.resumoBaixas),
      ]);

      const dep    = parseDepositosSheet(depRows);
      const exec   = parseExecutivoSheet(execRows);
      const baixas = parseBaixasSheet(baixasRows);

      setData({ ...dep, ...exec, ...baixas } as SheetData);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
      console.error('Erro ao carregar planilha:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh a cada 5 min
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, lastUpdated, refresh: load };
}
