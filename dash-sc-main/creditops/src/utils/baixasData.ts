import type { OpTable, OpRow, RowType } from './mockData';
import { formatNumber, formatCurrency } from './formatters';

export interface BaixasSegment {
  label:string; assignado:number; solicitados:number; confirmado:number; retido:number;
  pendente:number; baixaPrevista:number; pctBaixas:number; pctRetido:number; rep?:number; isTotal?:boolean;
}

const COLS = ['Assignado','Solicitados','Confirmado','Retido','Pendente','Baixa Prevista','% Baixas','% Retido'];
const COLS_REP = [...COLS,'Rep.'];

function segToRow(seg: BaixasSegment, currency: boolean, hasRep: boolean): OpRow {
  const fmt = (v:number) => currency ? formatCurrency(v,true) : formatNumber(Math.round(v));
  const type: RowType = seg.isTotal ? 'total' : 'data';
  const vals: string[] = [fmt(seg.assignado),fmt(seg.solicitados),fmt(seg.confirmado),fmt(seg.retido),
    seg.pendente===0?'0':fmt(seg.pendente),fmt(seg.baixaPrevista),`${seg.pctBaixas.toFixed(1)}%`,`${seg.pctRetido.toFixed(1)}%`];
  if (hasRep) vals.push(seg.rep!==undefined?`${seg.rep.toFixed(1)}%`:'—');
  return { label:seg.label, values:vals, type };
}

export function toBaixasTable(title:string, segs:BaixasSegment[], currency=false, hasRep=false): OpTable {
  return { title, columns:hasRep?COLS_REP:COLS, rows:segs.map(s=>segToRow(s,currency,hasRep)) };
}

export const primariaClientes: BaixasSegment[] = [
  { label:'Total',        isTotal:true, assignado:3489, solicitados:312, confirmado:275, retido:37, pendente:0, baixaPrevista:275, pctBaixas:7.9,  pctRetido:92.1 },
  { label:'Novatos',                    assignado:98,   solicitados:10,  confirmado:8,   retido:2,  pendente:0, baixaPrevista:8,   pctBaixas:8.2,  pctRetido:91.8 },
  { label:'2dos',                       assignado:257,  solicitados:27,  confirmado:21,  retido:6,  pendente:0, baixaPrevista:21,  pctBaixas:8.2,  pctRetido:91.8 },
  { label:'Sin segundos',               assignado:63,   solicitados:4,   confirmado:3,   retido:1,  pendente:0, baixaPrevista:3,   pctBaixas:4.8,  pctRetido:95.2 },
  { label:'3ros',                       assignado:192,  solicitados:13,  confirmado:10,  retido:3,  pendente:0, baixaPrevista:10,  pctBaixas:5.2,  pctRetido:94.8 },
  { label:'4tos',                       assignado:170,  solicitados:8,   confirmado:7,   retido:1,  pendente:0, baixaPrevista:7,   pctBaixas:4.1,  pctRetido:95.9 },
  { label:'5tos',                       assignado:111,  solicitados:9,   confirmado:9,   retido:0,  pendente:0, baixaPrevista:9,   pctBaixas:8.1,  pctRetido:91.9 },
  { label:'Regular',                    assignado:893,  solicitados:50,  confirmado:40,  retido:10, pendente:0, baixaPrevista:40,  pctBaixas:4.5,  pctRetido:95.5 },
  { label:'Crédito',                    assignado:709,  solicitados:9,   confirmado:7,   retido:2,  pendente:0, baixaPrevista:7,   pctBaixas:1.0,  pctRetido:99.0 },
  { label:'Estruturado',                assignado:260,  solicitados:8,   confirmado:4,   retido:4,  pendente:0, baixaPrevista:4,   pctBaixas:1.5,  pctRetido:98.5 },
  { label:'Atenção',                    assignado:86,   solicitados:7,   confirmado:6,   retido:1,  pendente:0, baixaPrevista:6,   pctBaixas:7.0,  pctRetido:93.0 },
  { label:'Rec >35<60',                 assignado:108,  solicitados:8,   confirmado:4,   retido:4,  pendente:0, baixaPrevista:4,   pctBaixas:3.7,  pctRetido:96.3 },
  { label:'Rec >60<90',                 assignado:126,  solicitados:12,  confirmado:9,   retido:3,  pendente:0, baixaPrevista:9,   pctBaixas:7.1,  pctRetido:92.9 },
  { label:'Rec >90',                    assignado:276,  solicitados:11,  confirmado:11,  retido:0,  pendente:0, baixaPrevista:11,  pctBaixas:4.0,  pctRetido:96.0 },
  { label:'2xC',                        assignado:140,  solicitados:136, confirmado:136, retido:0,  pendente:0, baixaPrevista:136, pctBaixas:97.1, pctRetido:2.9  },
];

export const primariaDivida: BaixasSegment[] = [
  { label:'Total',       isTotal:true, assignado:168897346, solicitados:15388999, confirmado:12996866, retido:2392132, pendente:0, baixaPrevista:12996866, pctBaixas:7.7,  pctRetido:92.3 },
  { label:'Novatos',                   assignado:3813749,   solicitados:571575,   confirmado:352362,   retido:219213,  pendente:0, baixaPrevista:352362,   pctBaixas:9.2,  pctRetido:90.8 },
  { label:'2dos',                      assignado:11337384,  solicitados:864426,   confirmado:650786,   retido:213640,  pendente:0, baixaPrevista:650786,   pctBaixas:5.7,  pctRetido:94.3 },
  { label:'Regular',                   assignado:38708390,  solicitados:2917507,  confirmado:2408214,  retido:509292,  pendente:0, baixaPrevista:2408214,  pctBaixas:6.2,  pctRetido:93.8 },
  { label:'Crédito',                   assignado:41787572,  solicitados:384229,   confirmado:316954,   retido:67274,   pendente:0, baixaPrevista:316954,   pctBaixas:0.8,  pctRetido:99.2 },
  { label:'Estruturado',               assignado:15994670,  solicitados:661894,   confirmado:238464,   retido:423429,  pendente:0, baixaPrevista:238464,   pctBaixas:1.5,  pctRetido:98.5 },
  { label:'Atenção',                   assignado:4957336,   solicitados:475926,   confirmado:450930,   retido:24995,   pendente:0, baixaPrevista:450930,   pctBaixas:9.1,  pctRetido:90.9 },
  { label:'2xC',                       assignado:5884212,   solicitados:5805390,  confirmado:5805390,  retido:0,       pendente:0, baixaPrevista:5805390,  pctBaixas:98.7, pctRetido:1.3  },
];

export const secundariaClientes: BaixasSegment[] = [
  { label:'Total',       isTotal:true, assignado:3489, solicitados:312, confirmado:275, retido:37, pendente:0, baixaPrevista:275, pctBaixas:7.9, pctRetido:92.1 },
  { label:'Novatos',                   assignado:98,   solicitados:10,  confirmado:8,   retido:2,  pendente:0, baixaPrevista:8,   pctBaixas:8.2, pctRetido:91.8, rep:0.2 },
  { label:'2dos',                      assignado:257,  solicitados:27,  confirmado:21,  retido:6,  pendente:0, baixaPrevista:21,  pctBaixas:8.2, pctRetido:91.8, rep:0.6 },
  { label:'Regular 1',                 assignado:596,  solicitados:34,  confirmado:28,  retido:6,  pendente:0, baixaPrevista:28,  pctBaixas:4.7, pctRetido:95.3, rep:0.8 },
  { label:'Crédito',                   assignado:709,  solicitados:9,   confirmado:7,   retido:2,  pendente:0, baixaPrevista:7,   pctBaixas:1.0, pctRetido:99.0, rep:0.2 },
  { label:'2xC',                       assignado:140,  solicitados:136, confirmado:136, retido:0,  pendente:0, baixaPrevista:136, pctBaixas:97.1,pctRetido:2.9,  rep:3.9 },
];

export const secundariaDivida: BaixasSegment[] = [
  { label:'Total',       isTotal:true, assignado:168897346, solicitados:15388999, confirmado:12996866, retido:2392132, pendente:0, baixaPrevista:12996866, pctBaixas:7.7, pctRetido:92.3 },
  { label:'Novatos',                   assignado:3813749,   solicitados:571575,   confirmado:352362,   retido:219213,  pendente:0, baixaPrevista:352362,   pctBaixas:9.2, pctRetido:90.8, rep:0.2 },
  { label:'Regular 1',                 assignado:27324551,  solicitados:2197373,  confirmado:1895613,  retido:301760,  pendente:0, baixaPrevista:1895613,  pctBaixas:6.9, pctRetido:93.1, rep:1.1 },
  { label:'Crédito',                   assignado:41787572,  solicitados:384229,   confirmado:316954,   retido:67274,   pendente:0, baixaPrevista:316954,   pctBaixas:0.8, pctRetido:99.2, rep:0.2 },
  { label:'2xC',                       assignado:5884212,   solicitados:5805390,  confirmado:5805390,  retido:0,       pendente:0, baixaPrevista:5805390,  pctBaixas:98.7,pctRetido:1.3,  rep:3.4 },
];

export const tblPrimariaClientes   = toBaixasTable('Clientes',    primariaClientes,  false, false);
export const tblPrimariaDivida     = toBaixasTable('Dívida (R$)', primariaDivida,    true,  false);
export const tblSecundariaClientes = toBaixasTable('Clientes',    secundariaClientes,false, true);
export const tblSecundariaDivida   = toBaixasTable('Dívida (R$)', secundariaDivida,  true,  true);

export const baixasKPIs = {
  clientes: { assignado:3489, solicitados:312, confirmado:275, retido:37, pendente:0, baixaPrevista:275, pctBaixas:7.9, pctRetido:92.1 },
  divida:   { assignado:168897346, solicitados:15388999, confirmado:12996866, retido:2392132, pendente:0, baixaPrevista:12996866, pctBaixas:7.7, pctRetido:92.3 },
};

export const reativacoesData = {
  clientes: { count:3, global:139 }, monto: { value:164398, global:7191476 },
  pctBaixasReativ: { clientes:7.80, monto:7.60 }, pctBaixasSolic: { clientes:3.98, monto:4.26 },
  mesAtual: { clientesAssign:3, clientesBaja:23, clientesRetido:16, pctBaixas:766.7, pctRetido:41.03,
              dividaAssign:0, dividaBaja:567029.92, dividaRetido:692099.03, pctBaixasDivida:0.0 },
  sinParciales: { assignado:121225561.60, total:127109773.91, baixas:6710123.16, pct:4.57 },
  conParciales: { assignado:168897346.42, total:168897346.42, baixas:7027077.94, pct:3.44 },
};

const _noTotal = (segs:BaixasSegment[]) => segs.filter(s => !s.isTotal);
export const rankMaiorPctBaixas  = _noTotal(primariaClientes).sort((a,b)=>b.pctBaixas-a.pctBaixas).map(s=>({name:s.label,value:s.pctBaixas}));
export const rankMenorRetencao   = _noTotal(primariaClientes).sort((a,b)=>a.pctRetido-b.pctRetido).map(s=>({name:s.label,value:s.pctRetido}));
export const rankMaiorConfirmado = _noTotal(primariaDivida).sort((a,b)=>b.confirmado-a.confirmado).map(s=>({name:s.label,value:s.confirmado}));
export const rankMaiorRecuperado = _noTotal(primariaDivida).sort((a,b)=>b.baixaPrevista-a.baixaPrevista).map(s=>({name:s.label,value:s.baixaPrevista}));
