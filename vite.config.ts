import { useMemo } from 'react';
import { Award, RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../lib/shadcn/tabs';
import { KPICard } from '../components/shared/KPICard';
import { ChartCard } from '../components/charts/Charts';
import { useSheetData, ExecRow, ExecTotal } from '../hooks/useSheetData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };
function shortName(email:string) { const p=email.split('@')[0]??email; return p.split('.').map((s:string)=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '); }
function statusColor(a:number) { return a>=100?'var(--d-success)':a>=70?'var(--d-warning)':'var(--d-danger)'; }
function statusKpi(a:number): 'success'|'warning'|'danger' { return a>=100?'success':a>=70?'warning':'danger'; }

function TotalRow({ total, label }:{ total:ExecTotal; label:string }) {
  return (
    <tr style={{ borderTop:'2px solid var(--d-border)', background:'var(--d-surface)' }}>
      <td colSpan={3} style={{ padding:'0.45rem 0.6rem', fontWeight:700, color:'var(--d-accent-light)', whiteSpace:'nowrap', position:'sticky', left:0, background:'var(--d-surface)', zIndex:5 }}>{label}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{formatCurrency(total.assignado,true)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap', color:'var(--d-success)' }}>{formatCurrency(total.completo,true)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap', color:'var(--d-warning)' }}>{formatCurrency(total.parcial,true)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{formatCurrency(total.depositoTotal,true)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{total.pctCompleto.toFixed(1)}%</td>
      <td colSpan={2} style={{ padding:'0.45rem 0.6rem', textAlign:'right', color:'var(--d-text-muted)' }}>—</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{formatNumber(total.wpp)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{formatNumber(total.wppMeetTel)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{formatNumber(total.wpp+total.wppMeetTel)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{total.pctContato.toFixed(1)}%</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap', color:'var(--d-danger)' }}>{formatCurrency(total.montoBaixas,true)}</td>
      <td style={{ padding:'0.45rem 0.6rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{total.pctBaixas.toFixed(1)}%</td>
      <td style={{ padding:'0.45rem 0.6rem', textAlign:'right', color:'var(--d-text-muted)' }}>—</td>
    </tr>
  );
}

function ExecTable({ rows, t1, t2, grand }:{ rows:ExecRow[]; t1:ExecTotal; t2:ExecTotal; grand:ExecTotal }) {
  const antonio = rows.filter(r=>r.equipe==='Antonio'), ana = rows.filter(r=>r.equipe==='Ana');
  const renderRow = (row:ExecRow, i:number) => (
    <tr key={`${row.executivo}-${i}`} style={{ borderBottom:'1px solid rgba(58,45,85,0.4)' }}>
      <td style={{ padding:'0.42rem 0.6rem', fontWeight:600, whiteSpace:'nowrap', position:'sticky', left:0, background:'var(--d-card)', zIndex:5, minWidth:120 }}>{shortName(row.executivo)}</td>
      <td style={{ padding:'0.42rem 0.6rem', color:'var(--d-text-muted)', fontSize:'0.72rem', whiteSpace:'nowrap' }}>{row.email}</td>
      <td style={{ padding:'0.42rem 0.6rem' }}><span style={{ background:'var(--d-accent-muted)', color:'var(--d-accent-light)', borderRadius:4, padding:'2px 7px', fontSize:'0.7rem' }}>{row.carteira}</span></td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{formatCurrency(row.assignado,true)}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-success)' }}>{formatCurrency(row.completo,true)}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:row.parcial>0?'var(--d-warning)':'var(--d-text-muted)' }}>{formatCurrency(row.parcial,true)}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', fontWeight:600 }}>{formatCurrency(row.depositoTotal,true)}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.pctCompleto.toFixed(1)}%</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', fontWeight:700, color:statusColor(row.atingimento) }}>{row.atingimento.toFixed(1)}%</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-text-muted)' }}>{row.metaDeposito}%</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.wpp}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.wppMeetTel}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', fontWeight:600 }}>{row.wpp+row.wppMeetTel}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.pctContato.toFixed(1)}%</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-danger)' }}>{formatCurrency(row.montoBaixas,true)}</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap' }}>{row.pctBaixas.toFixed(2)}%</td>
      <td style={{ padding:'0.42rem 0.6rem', textAlign:'right', whiteSpace:'nowrap', color:'var(--d-text-muted)' }}>{row.metaBaixas > 0 ? `${row.metaBaixas}%` : '—'}</td>
    </tr>
  );
  const headers = ['Executivo','E-mail','Carteira','Assignado','Completo','Parcial','Dep. Total','% Completo','Atingimento','Meta','WPP','WPP+Tel','Total','% Contato','Monto','% Baixas','Meta'];
  return (
    <div className="dash-card" style={{ overflow:'hidden' }}>
      <div className="op-table-wrapper" style={{ borderRadius:0, border:'none' }}>
        <table style={{ borderCollapse:'collapse', minWidth:'100%', fontSize:'0.78rem' }}>
          <thead>
            <tr>{headers.map((h,i)=><th key={i} style={{ background:'var(--d-surface)', color:'var(--d-text-muted)', fontWeight:600, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.04em', padding:'0.45rem 0.6rem', textAlign:i<3?'left':'right', borderBottom:'1px solid var(--d-border)', whiteSpace:'nowrap', position:i===0?'sticky':undefined, left:i===0?0:undefined, zIndex:i===0?10:undefined }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            <tr style={{ background:'var(--d-surface)' }}><td colSpan={17} style={{ padding:'0.3rem 0.8rem', fontWeight:700, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--d-purple-mid)' }}>Equipe Antonio</td></tr>
            {antonio.map(renderRow)}
            <TotalRow total={t1} label="Total Equipe Antonio"/>
            <tr style={{ background:'var(--d-surface)' }}><td colSpan={17} style={{ padding:'0.3rem 0.8rem', fontWeight:700, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--d-blue)' }}>Equipe Ana</td></tr>
            {ana.map(renderRow)}
            <TotalRow total={t2} label="Total Equipe Ana"/>
            <TotalRow total={grand} label="Total Geral"/>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ResumoExecutivo() {
  // ── TODOS os hooks ANTES de qualquer early return ──────────────────────────
  const { data, loading, error, refresh } = useSheetData();

  const executivoRows = useMemo(() => data?.executivoRows ?? [], [data]);
  const equipe1Total  = data?.equipe1Total;
  const equipe2Total  = data?.equipe2Total;
  const grandTotal    = data?.grandTotal;

  const avgAting = useMemo(() =>
    executivoRows.length > 0
      ? executivoRows.reduce((s,r) => s+r.atingimento, 0) / executivoRows.length
      : 0,
  [executivoRows]);

  const agg = useMemo(() => {
    const map = new Map<string,{name:string;deposito:number;pct:number;ating:number;loc:number;baixas:number}>();
    for (const r of executivoRows) {
      const ex = map.get(r.executivo);
      if (ex) {
        ex.deposito += r.depositoTotal; ex.loc += r.wpp+r.wppMeetTel;
        ex.baixas   += r.montoBaixas;   ex.ating = (ex.ating+r.atingimento)/2;
        ex.pct = (ex.pct+r.pctCompleto)/2;
      } else {
        map.set(r.executivo, { name:shortName(r.executivo), deposito:r.depositoTotal,
          pct:r.pctCompleto, ating:r.atingimento, loc:r.wpp+r.wppMeetTel, baixas:r.montoBaixas });
      }
    }
    return Array.from(map.values());
  }, [executivoRows]);
  // ──────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:12 }}>
      <RefreshCw size={24} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>
      <span>Carregando...</span>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}>
      <AlertCircle size={20}/>{error}
      <button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button>
    </div>
  );

  const gt = grandTotal!;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'rgba(170,108,201,0.15)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'var(--d-purple-mid)' }}><Award size={18}/></div>
        <div><h1 className="page-title">Resumo Executivo</h1><p className="page-subtitle">Performance por executivo e carteira — dados em tempo real</p></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:12 }}>
        <KPICard label="Total Assignado"   value={formatCurrency(gt.assignado,true)}     status="neutral"/>
        <KPICard label="Depósito Completo" value={formatCurrency(gt.completo,true)}      status="success" progress={gt.assignado>0?(gt.completo/gt.assignado)*100:0} meta="100%" realizado={`${gt.pctCompleto.toFixed(1)}%`}/>
        <KPICard label="Depósito Parcial"  value={formatCurrency(gt.parcial,true)}       status="warning"/>
        <KPICard label="Depósito Total"    value={formatCurrency(gt.depositoTotal,true)} status="success"/>
        <KPICard label="% Dep. Completo"   value={`${gt.pctCompleto.toFixed(1)}%`}       status="warning"/>
        <KPICard label="Total Baixas"      value={formatCurrency(gt.montoBaixas,true)}   status="danger"/>
        <KPICard label="% Baixas"          value={`${gt.pctBaixas.toFixed(1)}%`}         status={gt.pctBaixas<=5?'success':gt.pctBaixas<=10?'warning':'danger'}/>
        <KPICard label="Atingimento Médio" value={`${avgAting.toFixed(1)}%`}             status={statusKpi(avgAting)}/>
      </div>
      <Tabs defaultValue="tabela">
        <TabsList className="tabs-list-override">
          {[['tabela','Tabela'],['ranking','Ranking']].map(([v,l])=>(
            <TabsTrigger key={v} value={v!} style={{ fontSize:'0.78rem', borderRadius:6, padding:'0.3rem 0.85rem' }}>{l}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tabela" style={{ marginTop:12 }}>
          <ExecTable rows={executivoRows} t1={equipe1Total!} t2={equipe2Total!} grand={gt}/>
        </TabsContent>
        <TabsContent value="ranking" style={{ marginTop:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {([
              { title:'Maior Depósito Total', key:'deposito' as const, color:'#8062de', fmt:(v:number)=>formatCurrency(v,true) },
              { title:'Maior % Completo',     key:'pct'      as const, color:'#aa97ef', fmt:(v:number)=>`${v.toFixed(1)}%` },
              { title:'Maior Atingimento',    key:'ating'    as const, color:'#21ade0', fmt:(v:number)=>`${v.toFixed(1)}%` },
              { title:'Maior Localização',    key:'loc'      as const, color:'#17789c', fmt:(v:number)=>formatNumber(v) },
            ] as const).map(({ title, key, color, fmt }) => {
              const sorted = [...agg].sort((a,b)=>b[key]-a[key]);
              return (
                <ChartCard key={title} title={title} height={Math.max(160, sorted.length*36)}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sorted} layout="vertical" margin={{ top:0, right:60, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" horizontal={false}/>
                      <XAxis type="number" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>fmt(Number(v))}/>
                      <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={100}/>
                      <Tooltip contentStyle={TT} formatter={(v:unknown)=>[fmt(Number(v)),'']}/>
                      <Bar dataKey={key} fill={color} radius={[0,3,3,0]}>
                        {sorted.map((_,i)=><Cell key={i} fill={color} opacity={1-i*0.07}/>)}
                        <LabelList dataKey={key} position="right" fill="#9991b8" style={{ fontSize:10 }} formatter={(v:unknown)=>fmt(Number(v))}/>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
