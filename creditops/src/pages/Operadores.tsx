import { useMemo, useState } from 'react';
import { Users, Trophy, TrendingUp, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { ChartCard } from '../components/charts/Charts';
import { KPICard } from '../components/shared/KPICard';
import { useSheetData } from '../hooks/useSheetData';
import { useFilters } from '../context/FilterContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {name:string; value:number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, padding:'8px 12px' }}>
      <div style={{ color:'#e8e4f0', fontWeight:600, fontSize:12, marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:'#aa97ef', fontSize:12 }}>
          {p.name}: <span style={{ color:'#e8e4f0', fontWeight:700 }}>
            {typeof p.value === 'number' && p.value > 10000
              ? p.value.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 })
              : typeof p.value === 'number' && p.name?.includes('%')
              ? `${p.value.toFixed(1)}%`
              : p.value?.toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
    </div>
  );
}

function shortName(email: string) {
  const p = email.split('@')[0] ?? email;
  return p.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function RankingCard({ rank, nome, pctCompleto, atingimento }: {
  rank: number; nome: string; pctCompleto: number; atingimento: number;
}) {
  const medal = rank===1?'#eab308':rank===2?'#9991b8':rank===3?'#cd7c2f':'var(--d-accent)';
  const atColor = atingimento>=100?'var(--d-success)':atingimento>=70?'var(--d-warning)':'var(--d-danger)';
  return (
    <div className="dash-card" style={{ padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:12, borderLeft:`3px solid ${medal}` }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background:`${medal}22`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.85rem', color:medal, flexShrink:0 }}>{rank}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--d-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nome}</div>
        <div style={{ fontSize:'0.68rem', color:'var(--d-text-muted)' }}>{pctCompleto.toFixed(1)}% completo</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontWeight:700, fontSize:'0.88rem', color:atColor }}>{atingimento.toFixed(1)}%</div>
        <div style={{ fontSize:'0.65rem', color:'var(--d-text-dim)' }}>atingimento</div>
      </div>
    </div>
  );
}

function CarteiraTable({ rawRows }: { rawRows: NonNullable<ReturnType<typeof useSheetData>['data']>['executivoRows'] }) {
  const carteiras = useMemo(() => {
    const seen = new Set<string>();
    return rawRows.map(r => r.carteira).filter(c => { if (seen.has(c)) return false; seen.add(c); return true; });
  }, [rawRows]);

  const [selected, setSelected] = useState<string>(carteiras[0] ?? '');
  const currentCarteira = selected || carteiras[0] || '';
  const rows = rawRows.filter(r => r.carteira === currentCarteira);

  return (
    <div className="dash-card" style={{ overflow: 'hidden' }}>
      {/* Header + botões */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--d-accent-light)', display: 'block', marginBottom: '0.6rem' }}>
          Detalhamento por Carteira
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {carteiras.map(c => (
            <button key={c} onClick={() => setSelected(c)} style={{
              padding: '4px 14px', fontSize: '0.72rem', fontWeight: 600,
              borderRadius: 20, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              borderColor: c === currentCarteira ? 'var(--d-accent)' : 'var(--d-border)',
              background: c === currentCarteira ? 'var(--d-accent)' : 'transparent',
              color: c === currentCarteira ? '#fff' : 'var(--d-text-dim)',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Cards por executivo */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => {
          const nome      = shortName(r.email);
          const pctBaixas = r.assignado > 0 ? (r.montoBaixas / r.assignado) * 100 : 0;
          const totalLoc  = r.wpp + r.wppMeetTel;
          const atColor   = r.atingimento >= 100 ? 'var(--d-success)' : r.atingimento >= 70 ? 'var(--d-warning)' : 'var(--d-danger)';
          const equipeColor = r.equipe === 'Antonio' ? 'var(--d-purple-mid)' : 'var(--d-blue)';
          const equipeBg    = r.equipe === 'Antonio' ? 'rgba(170,108,201,0.15)' : 'rgba(33,173,224,0.15)';

          return (
            <div key={i} style={{
              background: 'var(--d-surface)', borderRadius: 10,
              border: '1px solid var(--d-border)', padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              {/* Nome + equipe */}
              <div style={{ minWidth: 160, flex: '0 0 160px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--d-text)', marginBottom: 4 }}>{nome}</div>
                <span style={{ background: equipeBg, color: equipeColor, borderRadius: 4, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600 }}>
                  {r.equipe}
                </span>
              </div>

              {/* Divisor */}
              <div style={{ width: 1, height: 40, background: 'var(--d-border)', flexShrink: 0 }} />

              {/* Métricas */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1 }}>
                <Metric label="Assignado"   value={formatCurrency(r.assignado, true)} />
                <Metric label="Completo"    value={formatCurrency(r.completo, true)}    color="var(--d-success)" />
                <Metric label="Parcial"     value={formatCurrency(r.parcial, true)}     color={r.parcial > 0 ? 'var(--d-warning)' : undefined} />
                <Metric label="Dep. Total"  value={formatCurrency(r.depositoTotal, true)} bold />
                <Metric label="% Completo"  value={`${r.pctCompleto.toFixed(1)}%`} />
                <Metric label="Atingimento" value={`${r.atingimento.toFixed(1)}%`} color={atColor} bold />
                <Metric label="Localizados" value={formatNumber(totalLoc)} />
                <Metric label="% Baixas"    value={`${pctBaixas.toFixed(1)}%`} color={pctBaixas <= 5 ? 'var(--d-success)' : pctBaixas <= 10 ? 'var(--d-warning)' : 'var(--d-danger)'} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.68rem', color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: '0.95rem', fontWeight: bold ? 700 : 600, color: color ?? 'var(--d-text)', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

export default function Operadores() {
  const { data, loading, error, refresh } = useSheetData();
  const { filters } = useFilters();
  const [timeFiltro, setTimeFiltro] = useState<'all'|'Antonio'|'Ana'>('all');

  // Agrega por executivo (soma carteiras)
  const executivos = useMemo(() => {
    if (!data?.executivoRows) return [];
    let rows = data.executivoRows;
    if (filters.operador !== 'all') rows = rows.filter(r => r.email === filters.operador);
    if (filters.carteira !== 'all') rows = rows.filter(r => r.carteira === filters.carteira);
    if (timeFiltro !== 'all')       rows = rows.filter(r => r.equipe === timeFiltro);
    const map = new Map<string, {
      nome: string; email: string; equipe: string;
      assignado: number; completo: number; parcial: number; depositoTotal: number;
      pctCompleto: number; atingimento: number;
      wpp: number; wppMeetTel: number; totalLoc: number;
      montoBaixas: number; pctBaixas: number;
      carteiras: string[];
    }>();
    for (const r of rows) {
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
    return Array.from(map.values()).sort((a,b) => b.atingimento - a.atingimento);
  }, [data, filters.operador, filters.carteira, timeFiltro]);

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error)   return <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}><AlertCircle size={20}/>{error}<button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button></div>;

  const totalDeposito  = executivos.reduce((s,e) => s+e.depositoTotal, 0);
  const totalAssignado = executivos.reduce((s,e) => s+e.assignado, 0);
  const totalLoc       = executivos.reduce((s,e) => s+e.totalLoc, 0);
  const avgAting       = executivos.length > 0 ? executivos.reduce((s,e)=>s+e.atingimento,0)/executivos.length : 0;
  const avgPct         = totalAssignado > 0 ? (executivos.reduce((s,e)=>s+e.completo,0)/totalAssignado)*100 : 0;
  const topExec = executivos[0]; // já ordenado por atingimento

  const barData = [...executivos].sort((a,b) => b.atingimento - a.atingimento).map(e => ({ name: e.nome.split(' ')[0]??e.nome, deposito: e.depositoTotal, ating: e.atingimento, loc: e.totalLoc }));
  const locData = [...executivos].sort((a,b)=>b.totalLoc-a.totalLoc).map(e => ({ name: e.nome.split(' ')[0]??e.nome, value: e.totalLoc }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'var(--d-accent-muted)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'var(--d-accent-light)' }}><Users size={18}/></div>
          <div><h1 className="page-title">Operadores</h1><p className="page-subtitle">Ranking e performance individual — dados do Resumo Executivo</p></div>
        </div>

        {/* Filtro de time */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'0.7rem', color:'var(--d-text-dim)', fontWeight:600 }}>Time:</span>
          <div style={{ display:'flex', background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:8, padding:3, gap:3 }}>
            {([['all','Todos'],['Antonio','Time Douglas'],['Ana','Time Ana']] as const).map(([v,l]) => (
              <button key={v} onClick={()=>setTimeFiltro(v)} style={{
                padding:'4px 12px', fontSize:'0.72rem', fontWeight:700, borderRadius:6,
                cursor:'pointer', border:'none', transition:'all 0.15s',
                background: timeFiltro===v ? 'var(--d-accent)' : 'transparent',
                color:      timeFiltro===v ? '#fff' : 'var(--d-text-dim)',
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
        <KPICard label="Total Recuperado"  value={formatCurrency(totalDeposito,true)}  icon={<DollarSign size={14}/>} status="success"/>
        <KPICard label="% Dep. Completo"   value={`${avgPct.toFixed(1)}%`}             icon={<Trophy size={14}/>}    status="warning"/>
        <KPICard label="Atingimento Médio" value={`${avgAting.toFixed(1)}%`}           icon={<TrendingUp size={14}/>} status={avgAting>=100?'success':avgAting>=70?'warning':'danger'}/>
        <KPICard label="Total Localizados" value={formatNumber(totalLoc)}              icon={<Users size={14}/>}     status="neutral"/>
        {topExec && <KPICard label="Top Executivo" value={topExec.nome.split(' ')[0]!} icon={<Trophy size={14}/>} status="success" subValue={`${formatCurrency(topExec.depositoTotal,true)} · ${topExec.atingimento.toFixed(1)}% ating.`}/>}
      </div>

      {/* Cards por carteira + Ranking */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
        <CarteiraTable rawRows={(data?.executivoRows ?? []).filter(r =>
        (filters.operador === 'all' || r.email === filters.operador) &&
        (filters.carteira === 'all' || r.carteira === filters.carteira) &&
        (timeFiltro === 'all' || r.equipe === timeFiltro)
      )} />

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--d-text)', marginBottom:4 }}>🏆 Ranking Executivos</div>
          {executivos.slice(0,6).map((e,i) => (
            <RankingCard key={e.email} rank={i+1} nome={e.nome} pctCompleto={e.pctCompleto} atingimento={e.atingimento}/>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <ChartCard title="Depósito Total por Executivo" subtitle="Valor recuperado" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top:4, right:12, left:-10, bottom:40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} angle={-30} textAnchor="end" height={50}/>
              <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>formatCurrency(Number(v),true)}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="deposito" name="Dep. Total" radius={[3,3,0,0]}>
                {barData.map((_,i)=><Cell key={i} fill={i===0?'#aa97ef':'#8062de'} opacity={1-i*0.07}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Localização por Executivo" subtitle="WPP + Telefone/Meet" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locData} margin={{ top:4, right:12, left:-10, bottom:40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} angle={-30} textAnchor="end" height={50}/>
              <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="value" name="Localizados" radius={[3,3,0,0]}>
                {locData.map((_,i)=><Cell key={i} fill='#17789c' opacity={1-i*0.07}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
