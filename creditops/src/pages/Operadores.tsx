import { useMemo } from 'react';
import { Users, Trophy, TrendingUp, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { ChartCard } from '../components/charts/Charts';
import { KPICard } from '../components/shared/KPICard';
import { useSheetData } from '../hooks/useSheetData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

function shortName(email: string) {
  const p = email.split('@')[0] ?? email;
  return p.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function RankingCard({ rank, nome, depositoTotal, pctCompleto, atingimento }: {
  rank: number; nome: string; depositoTotal: number; pctCompleto: number; atingimento: number;
}) {
  const medal = rank===1?'#eab308':rank===2?'#9991b8':rank===3?'#cd7c2f':'var(--d-accent)';
  return (
    <div className="dash-card" style={{ padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:12, borderLeft:`3px solid ${medal}` }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background:`${medal}22`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.85rem', color:medal, flexShrink:0 }}>{rank}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--d-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nome}</div>
        <div style={{ fontSize:'0.68rem', color:'var(--d-text-muted)' }}>{pctCompleto.toFixed(1)}% completo · {atingimento.toFixed(1)}% ating.</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontWeight:700, fontSize:'0.82rem', color:'var(--d-success)' }}>{formatCurrency(depositoTotal,true)}</div>
        <div style={{ fontSize:'0.65rem', color:'var(--d-text-dim)' }}>dep. total</div>
      </div>
    </div>
  );
}

export default function Operadores() {
  const { data, loading, error, refresh } = useSheetData();

  // Agrega por executivo (soma carteiras)
  const executivos = useMemo(() => {
    if (!data?.executivoRows) return [];
    const map = new Map<string, {
      nome: string; email: string; equipe: string;
      assignado: number; completo: number; parcial: number; depositoTotal: number;
      pctCompleto: number; atingimento: number;
      wpp: number; wppMeetTel: number; totalLoc: number;
      montoBaixas: number; pctBaixas: number;
      carteiras: string[];
    }>();
    for (const r of data.executivoRows) {
      const nome = shortName(r.email);
      const ex = map.get(r.executivo);
      if (ex) {
        ex.assignado    += r.assignado;
        ex.completo     += r.completo;
        ex.parcial      += r.parcial;
        ex.depositoTotal+= r.depositoTotal;
        ex.wpp          += r.wpp;
        ex.wppMeetTel   += r.wppMeetTel;
        ex.totalLoc     += r.wpp + r.wppMeetTel;
        ex.montoBaixas  += r.montoBaixas;
        ex.atingimento   = (ex.atingimento + r.atingimento) / 2;
        ex.carteiras.push(r.carteira);
      } else {
        map.set(r.executivo, {
          nome, email: r.email, equipe: r.equipe,
          assignado: r.assignado, completo: r.completo, parcial: r.parcial,
          depositoTotal: r.depositoTotal, pctCompleto: r.pctCompleto,
          atingimento: r.atingimento, wpp: r.wpp, wppMeetTel: r.wppMeetTel,
          totalLoc: r.wpp + r.wppMeetTel,
          montoBaixas: r.montoBaixas, pctBaixas: r.pctBaixas,
          carteiras: [r.carteira],
        });
      }
    }
    // Recalcula pctCompleto com soma
    for (const ex of map.values()) {
      ex.pctCompleto = ex.assignado > 0 ? (ex.completo / ex.assignado) * 100 : 0;
      ex.pctBaixas   = ex.assignado > 0 ? (ex.montoBaixas / ex.assignado) * 100 : 0;
    }
    return Array.from(map.values()).sort((a,b) => b.depositoTotal - a.depositoTotal);
  }, [data]);

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error)   return <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}><AlertCircle size={20}/>{error}<button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button></div>;

  const totalDeposito  = executivos.reduce((s,e) => s+e.depositoTotal, 0);
  const totalAssignado = executivos.reduce((s,e) => s+e.assignado, 0);
  const totalLoc       = executivos.reduce((s,e) => s+e.totalLoc, 0);
  const avgAting       = executivos.length > 0 ? executivos.reduce((s,e)=>s+e.atingimento,0)/executivos.length : 0;
  const avgPct         = totalAssignado > 0 ? (executivos.reduce((s,e)=>s+e.completo,0)/totalAssignado)*100 : 0;
  const topExec        = executivos[0];

  const barData = executivos.map(e => ({ name: e.nome.split(' ')[0]??e.nome, deposito: e.depositoTotal, ating: e.atingimento, loc: e.totalLoc }));
  const locData = [...executivos].sort((a,b)=>b.totalLoc-a.totalLoc).map(e => ({ name: e.nome.split(' ')[0]??e.nome, value: e.totalLoc }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'var(--d-accent-muted)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'var(--d-accent-light)' }}><Users size={18}/></div>
        <div><h1 className="page-title">Operadores</h1><p className="page-subtitle">Ranking e performance individual — dados do Resumo Executivo</p></div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
        <KPICard label="Total Recuperado"  value={formatCurrency(totalDeposito,true)}  icon={<DollarSign size={14}/>} status="success"/>
        <KPICard label="% Dep. Completo"   value={`${avgPct.toFixed(1)}%`}             icon={<Trophy size={14}/>}    status="warning"/>
        <KPICard label="Atingimento Médio" value={`${avgAting.toFixed(1)}%`}           icon={<TrendingUp size={14}/>} status={avgAting>=100?'success':avgAting>=70?'warning':'danger'}/>
        <KPICard label="Total Localizados" value={formatNumber(totalLoc)}              icon={<Users size={14}/>}     status="neutral"/>
        {topExec && <KPICard label="Top Executivo" value={topExec.nome.split(' ')[0]!} icon={<Trophy size={14}/>} status="success" subValue={`${formatCurrency(topExec.depositoTotal,true)} · ${topExec.atingimento.toFixed(1)}% ating.`}/>}
      </div>

      {/* Gráficos + Ranking */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
        <ChartCard title="Depósito Total por Executivo" subtitle="Valor recuperado" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top:4, right:12, left:-10, bottom:40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} angle={-30} textAnchor="end" height={50}/>
              <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>formatCurrency(Number(v),true)}/>
              <Tooltip contentStyle={TT} formatter={(v:unknown)=>[formatCurrency(Number(v),true),'Dep. Total']}/>
              <Bar dataKey="deposito" name="Dep. Total" radius={[3,3,0,0]}>
                {barData.map((_,i)=><Cell key={i} fill={i===0?'#aa97ef':'#8062de'} opacity={1-i*0.07}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--d-text)', marginBottom:4 }}>🏆 Ranking Executivos</div>
          {executivos.slice(0,6).map((e,i) => (
            <RankingCard key={e.email} rank={i+1} nome={e.nome} depositoTotal={e.depositoTotal} pctCompleto={e.pctCompleto} atingimento={e.atingimento}/>
          ))}
        </div>
      </div>

      {/* Gráfico localização */}
      <ChartCard title="Localização por Executivo" subtitle="WPP + Telefone/Meet" height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={locData} margin={{ top:4, right:12, left:-10, bottom:40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false}/>
            <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} angle={-30} textAnchor="end" height={50}/>
            <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={TT} formatter={(v:unknown)=>[formatNumber(Number(v)),'Localizados']}/>
            <Bar dataKey="value" name="Localizados" radius={[3,3,0,0]}>
              {locData.map((_,i)=><Cell key={i} fill='#17789c' opacity={1-i*0.07}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Tabela detalhada */}
      <div className="dash-card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'0.6rem 1rem', borderBottom:'1px solid var(--d-border)', fontSize:'0.78rem', fontWeight:700, color:'var(--d-accent-light)' }}>Detalhamento por Executivo</div>
        <div className="gen-table-wrapper" style={{ borderRadius:0, border:'none' }}>
          <table className="gen-table">
            <thead>
              <tr>
                {['Executivo','Equipe','Carteiras','Assignado','Completo','Parcial','Dep. Total','% Completo','Atingimento','Localizados','% Baixas'].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {executivos.map((e,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{e.nome}</td>
                  <td><span style={{ background:e.equipe==='Antonio'?'rgba(170,108,201,0.15)':'rgba(33,173,224,0.15)', color:e.equipe==='Antonio'?'var(--d-purple-mid)':'var(--d-blue)', borderRadius:4, padding:'2px 7px', fontSize:'0.7rem' }}>{e.equipe}</span></td>
                  <td style={{ color:'var(--d-text-muted)', fontSize:'0.72rem' }}>{e.carteiras.join(', ')}</td>
                  <td style={{ textAlign:'right' }}>{formatCurrency(e.assignado,true)}</td>
                  <td style={{ textAlign:'right', color:'var(--d-success)' }}>{formatCurrency(e.completo,true)}</td>
                  <td style={{ textAlign:'right', color:e.parcial>0?'var(--d-warning)':'var(--d-text-muted)' }}>{formatCurrency(e.parcial,true)}</td>
                  <td style={{ textAlign:'right', fontWeight:600 }}>{formatCurrency(e.depositoTotal,true)}</td>
                  <td style={{ textAlign:'right' }}>{e.pctCompleto.toFixed(1)}%</td>
                  <td style={{ textAlign:'right', fontWeight:700, color:e.atingimento>=100?'var(--d-success)':e.atingimento>=70?'var(--d-warning)':'var(--d-danger)' }}>{e.atingimento.toFixed(1)}%</td>
                  <td style={{ textAlign:'right' }}>{formatNumber(e.totalLoc)}</td>
                  <td style={{ textAlign:'right', color:e.pctBaixas<=5?'var(--d-success)':e.pctBaixas<=10?'var(--d-warning)':'var(--d-danger)' }}>{e.pctBaixas.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
