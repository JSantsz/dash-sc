export interface ExecutivoRow {
  executivo:string; email:string; carteira:string;
  assignado:number; completo:number; parcial:number; depositoTotal:number;
  pctCompleto:number; atingimento:number; metaDeposito:number;
  wpp:number; wppMeetTel:number; pctContato:number;
  montoBaixas:number; pctBaixas:number; metaBaixas:number;
  equipe:'Antonio'|'Ana';
}

export const executivoRows: ExecutivoRow[] = [
  { equipe:'Antonio', executivo:'graziella.dovale',  email:'graziella.dovale@gobravo.com.br',  carteira:'Regular*',              assignado:14589904, completo:1977213, parcial:195054, depositoTotal:2172267,  pctCompleto:13.6, atingimento:15.6, metaDeposito:87, wpp:0,   wppMeetTel:115, pctContato:33.4,  montoBaixas:1080593, pctBaixas:7.41,  metaBaixas:3.0 },
  { equipe:'Antonio', executivo:'natally.moraes',    email:'natally.moraes@gobravo.com.br',    carteira:'2xC',                   assignado:5884212,  completo:0,       parcial:0,      depositoTotal:0,        pctCompleto:0.0,  atingimento:0.0,  metaDeposito:10, wpp:0,   wppMeetTel:10,  pctContato:7.1,   montoBaixas:5805390, pctBaixas:98.66, metaBaixas:0   },
  { equipe:'Antonio', executivo:'jessica.pereira',   email:'jessica.pereira@gobravo.com.br',   carteira:'Estruturado',           assignado:15994671, completo:3024023, parcial:21571,  depositoTotal:3045594,  pctCompleto:18.9, atingimento:21.7, metaDeposito:87, wpp:117, wppMeetTel:74,  pctContato:28.5,  montoBaixas:238465,  pctBaixas:1.49,  metaBaixas:3.0 },
  { equipe:'Antonio', executivo:'lauryn.aguiar',     email:'lauryn.aguiar@gobravo.com.br',     carteira:'Regular*',              assignado:14379510, completo:2306737, parcial:0,      depositoTotal:2306737,  pctCompleto:16.0, atingimento:18.4, metaDeposito:87, wpp:0,   wppMeetTel:113, pctContato:33.7,  montoBaixas:437471,  pctBaixas:3.04,  metaBaixas:3.0 },
  { equipe:'Antonio', executivo:'gabriela.santana',  email:'gabriela.santana@gobravo.com.br',  carteira:'Pronto Socorro >35<60', assignado:2121756,  completo:49359,   parcial:0,      depositoTotal:49359,    pctCompleto:2.3,  atingimento:4.7,  metaDeposito:50, wpp:0,   wppMeetTel:68,  pctContato:89.5,  montoBaixas:55522,   pctBaixas:2.62,  metaBaixas:5.0 },
  { equipe:'Antonio', executivo:'gabriela.santana',  email:'gabriela.santana@gobravo.com.br',  carteira:'Pronto Socorro >60<90', assignado:1997313,  completo:45347,   parcial:0,      depositoTotal:45347,    pctCompleto:2.3,  atingimento:9.1,  metaDeposito:25, wpp:0,   wppMeetTel:68,  pctContato:101.5, montoBaixas:200757,  pctBaixas:10.05, metaBaixas:7.0 },
  { equipe:'Antonio', executivo:'gabriela.santana',  email:'gabriela.santana@gobravo.com.br',  carteira:'Pronto Socorro >90',    assignado:4474567,  completo:164567,  parcial:0,      depositoTotal:164567,   pctCompleto:3.7,  atingimento:36.8, metaDeposito:10, wpp:0,   wppMeetTel:68,  pctContato:42.5,  montoBaixas:151314,  pctBaixas:3.38,  metaBaixas:8.0 },
  { equipe:'Antonio', executivo:'mariaclara.mello',  email:'mariaclara.mello@gobravo.com.br',  carteira:'UTI',                   assignado:9985128,  completo:220416,  parcial:0,      depositoTotal:220416,   pctCompleto:2.2,  atingimento:10.0, metaDeposito:22, wpp:78,  wppMeetTel:66,  pctContato:29.2,  montoBaixas:588840,  pctBaixas:5.90,  metaBaixas:6.0 },
  { equipe:'Antonio', executivo:'mariaclara.mello',  email:'mariaclara.mello@gobravo.com.br',  carteira:'Sin Segundos',          assignado:2994412,  completo:18773,   parcial:0,      depositoTotal:18773,    pctCompleto:0.6,  atingimento:3.1,  metaDeposito:20, wpp:18,  wppMeetTel:66,  pctContato:104.8, montoBaixas:184149,  pctBaixas:6.15,  metaBaixas:10.0},
  { equipe:'Antonio', executivo:'mariaclara.mello',  email:'mariaclara.mello@gobravo.com.br',  carteira:'Atenção',               assignado:4957337,  completo:547893,  parcial:77697,  depositoTotal:625590,   pctCompleto:11.1, atingimento:16.3, metaDeposito:68, wpp:36,  wppMeetTel:66,  pctContato:76.7,  montoBaixas:450931,  pctBaixas:9.10,  metaBaixas:3.0 },
  { equipe:'Ana', executivo:'geovanna.alves',    email:'geovanna.alves@gobravo.com.br',    carteira:'Novatos', assignado:1845145,  completo:0,       parcial:0,      depositoTotal:0,       pctCompleto:0.0,  atingimento:0.0,  metaDeposito:20, wpp:7,  wppMeetTel:31,  pctContato:70.5, montoBaixas:195444, pctBaixas:10.6, metaBaixas:4.0 },
  { equipe:'Ana', executivo:'geovanna.alves',    email:'geovanna.alves@gobravo.com.br',    carteira:'2dos',    assignado:6175943,  completo:1429959, parcial:0,      depositoTotal:1429959, pctCompleto:23.2, atingimento:28.9, metaDeposito:80, wpp:29, wppMeetTel:76,  pctContato:56.3, montoBaixas:142709, pctBaixas:2.3,  metaBaixas:5.5 },
  { equipe:'Ana', executivo:'maria.ferreira',    email:'maria.ferreira@gobravo.com.br',    carteira:'2dos',    assignado:5161441,  completo:559646,  parcial:38028,  depositoTotal:597674,  pctCompleto:10.8, atingimento:13.6, metaDeposito:80, wpp:20, wppMeetTel:79,  pctContato:64.8, montoBaixas:508078, pctBaixas:9.8,  metaBaixas:5.5 },
  { equipe:'Ana', executivo:'maria.ferreira',    email:'maria.ferreira@gobravo.com.br',    carteira:'Novatos', assignado:1968604,  completo:76860,   parcial:0,      depositoTotal:76860,   pctCompleto:3.9,  atingimento:19.5, metaDeposito:20, wpp:12, wppMeetTel:41,  pctContato:75.9, montoBaixas:156918, pctBaixas:8.0,  metaBaixas:4.0 },
  { equipe:'Ana', executivo:'dayane.dossantos',  email:'dayane.dossantos@gobravo.com.br',  carteira:'3ros',    assignado:11028675, completo:1120641, parcial:0,      depositoTotal:1120641, pctCompleto:10.2, atingimento:12.2, metaDeposito:83, wpp:50, wppMeetTel:103, pctContato:53.6, montoBaixas:296216, pctBaixas:2.7,  metaBaixas:5.5 },
  { equipe:'Ana', executivo:'dayane.dossantos',  email:'dayane.dossantos@gobravo.com.br',  carteira:'4tos',    assignado:8796611,  completo:963145,  parcial:32459,  depositoTotal:995604,  pctCompleto:10.9, atingimento:13.0, metaDeposito:84, wpp:45, wppMeetTel:96,  pctContato:56.5, montoBaixas:847594, pctBaixas:9.6,  metaBaixas:4.0 },
  { equipe:'Ana', executivo:'nathalia.tancredo', email:'nathalia.tancredo@gobravo.com.br', carteira:'5tos',    assignado:5015569,  completo:611482,  parcial:0,      depositoTotal:611482,  pctCompleto:12.2, atingimento:14.3, metaDeposito:85, wpp:36, wppMeetTel:45,  pctContato:40.5, montoBaixas:424089, pctBaixas:8.5,  metaBaixas:4.0 },
  { equipe:'Ana', executivo:'nathalia.tancredo', email:'nathalia.tancredo@gobravo.com.br', carteira:'Regular*',assignado:9738977,  completo:1120182, parcial:0,      depositoTotal:1120182, pctCompleto:11.5, atingimento:13.2, metaDeposito:87, wpp:66, wppMeetTel:100, pctContato:46.7, montoBaixas:890151, pctBaixas:9.1,  metaBaixas:4.0 },
];

export interface EquipeTotal {
  nome:string; assignado:number; completo:number; parcial:number; depositoTotal:number;
  pctCompleto:number; wpp:number; wppMeetTel:number; pctContato:number; montoBaixas:number; pctBaixas:number;
}

function sumEquipe(equipe:'Antonio'|'Ana'): EquipeTotal {
  const rows = executivoRows.filter(r => r.equipe === equipe);
  const assignado=rows.reduce((s,r)=>s+r.assignado,0), completo=rows.reduce((s,r)=>s+r.completo,0);
  const parcial=rows.reduce((s,r)=>s+r.parcial,0), depositoTotal=rows.reduce((s,r)=>s+r.depositoTotal,0);
  const wpp=rows.reduce((s,r)=>s+r.wpp,0), wppMeetTel=rows.reduce((s,r)=>s+r.wppMeetTel,0);
  const montoBaixas=rows.reduce((s,r)=>s+r.montoBaixas,0);
  return { nome:equipe, assignado, completo, parcial, depositoTotal,
    pctCompleto: assignado>0?(completo/assignado)*100:0, wpp, wppMeetTel,
    pctContato: equipe==='Antonio'?40.6:59.4, montoBaixas,
    pctBaixas: assignado>0?(montoBaixas/assignado)*100:0 };
}

export const equipe1Total = sumEquipe('Antonio');
export const equipe2Total = sumEquipe('Ana');
export const grandTotal: EquipeTotal = {
  nome:'Total Geral',
  assignado:equipe1Total.assignado+equipe2Total.assignado,
  completo:equipe1Total.completo+equipe2Total.completo,
  parcial:equipe1Total.parcial+equipe2Total.parcial,
  depositoTotal:equipe1Total.depositoTotal+equipe2Total.depositoTotal,
  pctCompleto:0, wpp:equipe1Total.wpp+equipe2Total.wpp,
  wppMeetTel:equipe1Total.wppMeetTel+equipe2Total.wppMeetTel,
  pctContato:0, montoBaixas:equipe1Total.montoBaixas+equipe2Total.montoBaixas, pctBaixas:0,
};
grandTotal.pctCompleto = grandTotal.assignado>0?(grandTotal.completo/grandTotal.assignado)*100:0;
grandTotal.pctBaixas   = grandTotal.assignado>0?(grandTotal.montoBaixas/grandTotal.assignado)*100:0;

export interface ExecutivoAgregado {
  nome:string; email:string; assignado:number; completo:number; depositoTotal:number;
  pctCompleto:number; atingimento:number; wpp:number; wppMeetTel:number; totalLoc:number;
  pctContato:number; montoBaixas:number; pctBaixas:number; equipe:'Antonio'|'Ana';
}

export function aggregateByExecutivo(): ExecutivoAgregado[] {
  const map = new Map<string,ExecutivoAgregado>();
  for (const row of executivoRows) {
    const ex = map.get(row.executivo);
    if (ex) {
      ex.assignado+=row.assignado; ex.completo+=row.completo; ex.depositoTotal+=row.depositoTotal;
      ex.wpp+=row.wpp; ex.wppMeetTel+=row.wppMeetTel; ex.totalLoc+=row.wpp+row.wppMeetTel;
      ex.montoBaixas+=row.montoBaixas; ex.atingimento=(ex.atingimento+row.atingimento)/2;
    } else {
      map.set(row.executivo,{nome:row.executivo,email:row.email,assignado:row.assignado,completo:row.completo,
        depositoTotal:row.depositoTotal,pctCompleto:row.pctCompleto,atingimento:row.atingimento,
        wpp:row.wpp,wppMeetTel:row.wppMeetTel,totalLoc:row.wpp+row.wppMeetTel,
        pctContato:row.pctContato,montoBaixas:row.montoBaixas,pctBaixas:row.pctBaixas,equipe:row.equipe});
    }
  }
  for (const agg of map.values()) {
    agg.pctCompleto=agg.assignado>0?(agg.completo/agg.assignado)*100:0;
    agg.pctBaixas=agg.assignado>0?(agg.montoBaixas/agg.assignado)*100:0;
  }
  return Array.from(map.values());
}
