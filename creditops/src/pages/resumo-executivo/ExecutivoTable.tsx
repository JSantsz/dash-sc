import type { CSSProperties } from 'react';
import { ExecutivoRow, EquipeTotal } from '../../utils/executiveData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

function atingColor(a:number) { return a>=100?'var(--d-success)':a>=70?'var(--d-warning)':'var(--d-danger)'; }
function baixasColor(pct:number,meta:number) { if(meta===0)return 'var(--d-text-muted)'; if(pct<=meta)return 'var(--d-success)'; if(pct<=meta*1.5)return 'var(--d-warning)'; return 'var(--d-danger)'; }
function shortName(email:string) { const p=email.split('@')[0]??email; return p.split('.').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '); }
function Num({ v }:{ v:number }) { return <>{formatNumber(Math.round(v))}</>; }
function Cur({ v }:{ v:number }) { return <>{formatCurrency(v,true)}</>; }
function Pct({ v,color }:{ v:number;color?:string }) { return <span style={{ color:color??'inherit' }}>{v.toFixed(1)}%</span>; }

const groupTh: CSSProperties = { background:'var(--d-surface)', color:'var(--d-accent-light)', fontWeight:700, fontSize:'0.65rem', textTransform:'uppercase' as const, letterSpacing:'0.07em', padding:'0.35rem 0.6rem', textAlign:'center' as const, borderBottom:'1px solid var(--d-border)', borderRight:'1px solid var(--d-border-light)', whiteSpace:'nowrap' as const };

function TotalRow({ total, label }:{ total:EquipeTotal; label:string }) {
  return (
    <tr style={{ borderTop:'2px solid var(--d-border)', background:'var(--d-surface)' }}>
      <td colSpan={3} style={{ padding:'0.45rem 0.6rem', fontWeight:700, color:'var(--d-accent-light)', whiteSpace:'nowrap', position:'sticky', left:0, background:'var(--d-surface)', zIndex:5 }}>{label}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Cur v={total.assignado}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap', color:'var(--d-success)' }}><Cur v={total.completo}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap', color:'var(--d-warning)' }}><Cur v={total.parcial}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Cur v={total.depositoTotal}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Pct v={total.pctCompleto}/></td>
      <td colSpan={2} style={{ padding:'0.45rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-text-muted)' }}>—</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Num v={total.wpp}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Num v={total.wppMeetTel}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Num v={total.wpp+total.wppMeetTel}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Pct v={total.pctContato}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap', color:'var(--d-danger)' }}><Cur v={total.montoBaixas}/></td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}><Pct v={total.pctBaixas}/></td>
      <td style={{ padding:'0.45rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-text-muted)' }}>—</td>
    </tr>
  );
}

interface Props { rows:ExecutivoRow[]; total1:EquipeTotal; total2:EquipeTotal; grand:EquipeTotal; }
export function ExecutivoTable({ rows, total1, total2, grand }: Props) {
  const antonio=rows.filter(r=>r.equipe==='Antonio'), ana=rows.filter(r=>r.equipe==='Ana');
  const renderRow=(row:ExecutivoRow,i:number)=>(
    <tr key={`${row.executivo}-${i}`} style={{ borderBottom:'1px solid rgba(58,45,85,0.4)' }}
      onMouseEnter={e=>(e.currentTarget.style.background='rgba(128,98,222,0.06)')}
      onMouseLeave={e=>(e.currentTarget.style.background='')}>
      <td style={{ padding:'0.42rem 0.6rem', fontWeight:600, whiteSpace:'nowrap', position:'sticky', left:0, background:'var(--d-card)', zIndex:5, minWidth:130 }}>{shortName(row.executivo)}</td>
      <td style={{ padding:'0.42rem 0.6rem', color:'var(--d-text-muted)', fontSize:'0.72rem', whiteSpace:'nowrap', minWidth:190 }}>{row.email}</td>
      <td style={{ padding:'0.42rem 0.6rem', whiteSpace:'nowrap' }}><span style={{ background:'var(--d-accent-muted)', color:'var(--d-accent-light)', borderRadius:4, padding:'2px 7px', fontSize:'0.7rem', fontWeight:600 }}>{row.carteira}</span></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}><Cur v={row.assignado}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-success)' }}><Cur v={row.completo}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:row.parcial>0?'var(--d-warning)':'var(--d-text-muted)' }}><Cur v={row.parcial}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', fontWeight:600 }}><Cur v={row.depositoTotal}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}><Pct v={row.pctCompleto}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}><span style={{ color:atingColor(row.atingimento), fontWeight:700 }}>{row.atingimento.toFixed(1)}%</span></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-text-muted)' }}>{row.metaDeposito}%</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.wpp}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.wppMeetTel}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', fontWeight:600 }}>{row.wpp+row.wppMeetTel}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}><Pct v={row.pctContato}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-danger)' }}><Cur v={row.montoBaixas}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}><Pct v={row.pctBaixas} color={baixasColor(row.pctBaixas,row.metaBaixas)}/></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-text-muted)' }}>{row.metaBaixas>0?`${row.metaBaixas}%`:'—'}</td>
    </tr>
  );
  return (
    <div className="dash-card" style={{ overflow:'hidden' }}>
      <div className="op-table-wrapper" style={{ borderRadius:0, border:'none' }}>
        <table style={{ borderCollapse:'collapse', minWidth:'100%', fontSize:'0.78rem' }}>
          <thead>
            <tr>
              <th colSpan={3} style={groupTh}>Informações</th>
              <th colSpan={1} style={groupTh}>Infos</th>
              <th colSpan={4} style={{ ...groupTh, borderLeft:'1px solid var(--d-border-light)' }}>Depósito</th>
              <th colSpan={2} style={{ ...groupTh, borderLeft:'1px solid var(--d-border-light)' }}>% Depósito</th>
              <th colSpan={4} style={{ ...groupTh, borderLeft:'1px solid var(--d-border-light)' }}>Localizados</th>
              <th colSpan={3} style={{ ...groupTh, borderLeft:'1px solid var(--d-border-light)' }}>Baixas</th>
            </tr>
            <tr>{['Executivo','E-mail','Carteira','Assignado','Completo','Parcial','Dep. Total','% Completo','Atingimento','Meta','WPP','WPP+Tel','Total','% Contato','Monto','% Baixas','Meta'].map((h,i)=>(
              <th key={i} style={{ background:'var(--d-surface)', color:'var(--d-text-muted)', fontWeight:600, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.04em', padding:'0.45rem 0.6rem', textAlign:i<3?'left':'right', borderBottom:'1px solid var(--d-border)', whiteSpace:'nowrap', position:i===0?'sticky':undefined, left:i===0?0:undefined, zIndex:i===0?10:undefined }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            <tr style={{ background:'var(--d-surface)' }}><td colSpan={17} style={{ padding:'0.3rem 0.8rem', fontWeight:700, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--d-purple-mid)' }}>Equipe Antonio</td></tr>
            {antonio.map(renderRow)}
            <TotalRow total={total1} label="Total Equipe Antonio"/>
            <tr style={{ background:'var(--d-surface)' }}><td colSpan={17} style={{ padding:'0.3rem 0.8rem', fontWeight:700, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--d-blue)' }}>Equipe Ana</td></tr>
            {ana.map(renderRow)}
            <TotalRow total={total2} label="Total Equipe Ana"/>
            <TotalRow total={grand} label="Total Geral"/>
          </tbody>
        </table>
      </div>
    </div>
  );
}
