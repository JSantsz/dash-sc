const SHEET_ID = '1xUbHus1U7PPBI022Nd0CSEaF5pNt56XIH0HdHcQ9MbQ';

function sheetUrl(gid: string): string {
  return `/api/sheets?id=${SHEET_ID}&gid=${gid}`;
}

export const SHEET_URLS = {
  resumoDepositos: sheetUrl('0'),
  resumoExecutivo: sheetUrl('342317287'),
  resumoBaixas:    sheetUrl('765687724'),
  resumoLigacoes:  sheetUrl('798854187'),
};

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

export function cleanNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val
    .replace(/R\$\s*/g, '').replace(/\$\s*/g, '')
    .replace(/\./g, '').replace(',', '.')
    .replace('%', '').trim();
  return parseFloat(cleaned) || 0;
}

export function cleanPct(val: string): string {
  return val?.replace(/"/g, '').trim() ?? '0%';
}

const cache: Record<string, { data: string[][], ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchSheet(url: string): Promise<string[][]> {
  const now = Date.now();
  if (cache[url] && now - cache[url]!.ts < CACHE_TTL) return cache[url]!.data;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar planilha: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const data = parseCSV(text);
  cache[url] = { data, ts: now };
  return data;
}
