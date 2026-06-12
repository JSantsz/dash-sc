import { useMemo } from 'react';
import { DollarSign, Users, MapPin, FileText, CheckCircle, TrendingUp, BarChart2, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { KPICard, KPIStatus } from '../components/shared/KPICard';
import { FunnelOperacional, EvolucaoDiaria, RecuperacaoPorCarteira, ChartCard } from '../components/charts/Charts';
import { useSheetData } from '../hooks/useSheetData';
import { useFilters } from '../context/FilterContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

function RankTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { nome: string } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]!;
  return (
    <div style={{ background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, padding:'8px 12px' }}>
      <div style={{ color:'#e8e4f0', fontWeight:600, fontSize:12, marginBottom:4 }}>{p.payload.nome}</div>
      <div style={{ color:'#aa97ef', fontSize:12 }}>Atingimento: <span style={{ color:'#e8e4f0', fontWeight:700 }}>{Number(p.value).toFixed(1)}%</span></div>
    </div>
  );
}

function shortName(email: string) {
  const p = email.split('@')[0] ?? email;
  return p.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export default function Overview() {
  const { data, loading, error, lastUpdated, refresh } = useSheetData();
  const { filters } = useFilters();

  // ── Todos os hooks ANTES dos early returns ──
  const rankingOperadores = useMemo(() => {
    if (!data?.executivoRows) return [];
    let rows = data.executivoRows;
    if (filters.operador !== 'all') rows = rows.filter(r => r.email === filters.operador);
    if (filters.carteira !== 'all') rows = rows.filter(r => r.carteira === filters.carteira);
    const map = new Map<string, { nome: string; deposito: number; atingimento: number; }>();
    for (const r of rows) {
      const nome = shortName(r.email);
      const ex = map.get(r.executivo);
      if (ex) {
        ex.deposito    += r.depositoTotal;
        ex.atingimento  = (ex.atingimento + r.atingimento) / 2;
      } else {
        map.set(r.executivo, { nome, deposito: r.depositoTotal, atingimento: r.atingimento });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.atingimento - a.atingimento)
      .slice(0, 8);
  }, [data, filters.operador, filters.carteira]);

  const filteredRows = useMemo(() => {
    let rows = data?.executivoRows ?? [];
    if (filters.operador !== 'all') rows = rows.filter(r => r.email === filters.operador);
    if (filters.carteira !== 'all') rows = rows.filter(r => r.carteira === filters.carteira);
    return rows;
  }, [data, filters.operador, filters.carteira]);
  // ───────────────────────────────────────────

  if (loading) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:12 }}>
      <RefreshCw size={24} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>
      <span>Carregando dados da planilha...</span>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:12, color:'var(--d-danger)' }}>
      <AlertCircle size={24}/><span>{error}</span>
      <button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.4rem 1rem', cursor:'pointer', fontSize:'0.8rem' }}>Tentar novamente</button>
    </div>
  );

  const kpi = data!.kpis;

  const isFiltered = filters.operador !== 'all' || filters.carteira !== 'all';

  // KPIs calculados das linhas filtradas (quando filtros ativos) ou dados gerais
  const totalValor    = isFiltered ? filteredRows.reduce((s, r) => s + r.assignado, 0)    : kpi.carteiraTotalValor;
  const totalClientes = isFiltered ? filteredRows.length                                   : kpi.carteiraTotalClientes;
  const localizados   = isFiltered ? filteredRows.reduce((s, r) => s + r.wpp + r.wppMeetTel, 0) : kpi.clientesLocalizados;
  const locPct        = isFiltered ? (totalValor > 0 ? Math.round((localizados / filteredRows.length) * 100) : 0) : kpi.clientesLocalizadosPct;
  const depositos     = isFiltered ? filteredRows.reduce((s, r) => s + r.completo, 0)     : kpi.valorRecuperado; // valor em R$
  const depPct        = isFiltered ? (totalValor > 0 ? (depositos / totalValor) * 100 : 0) : kpi.depositosCompletosPct;
  const valorRec      = isFiltered ? filteredRows.reduce((s, r) => s + r.depositoTotal, 0): kpi.valorRecuperado;
  const promessas     = isFiltered ? filteredRows.reduce((s, r) => s + r.parcial, 0)      : kpi.promessasVigentes;
  const ticketMedio   = filteredRows.length > 0 ? Math.round(valorRec / filteredRows.length) : (valorRec > 0 ? Math.round(valorRec / (kpi.depositosCompletos || 1)) : 0);
  const taxaConversao = totalValor > 0 ? (valorRec / totalValor) * 100 : 0;

  const locStatus = locPct >= 80 ? 'success' : locPct >= 60 ? 'warning' : 'danger';
  const depStatus = depPct >= 25 ? 'success' : depPct >= 15 ? 'warning' : 'danger';
  const recStatus = valorRec >= 15000000 ? 'success' : valorRec >= 10000000 ? 'warning' : 'danger';

  const kpis = [
    { label:'Carteira Total',         value:formatCurrency(totalValor,true),    subValue: isFiltered ? `${filteredRows.length} carteiras` : `${formatNumber(kpi.carteiraTotalClientes)} clientes`, icon:<DollarSign size={14}/>, status:'neutral' as KPIStatus },
    { label:'Localizados',            value: isFiltered ? formatNumber(localizados) : formatNumber(kpi.clientesLocalizados), subValue:`${locPct}% de localização`, icon:<MapPin size={14}/>, status:locStatus as KPIStatus },
    { label: isFiltered ? 'Dep. Completo (R$)' : 'Promessas Vigentes', value: isFiltered ? formatCurrency(promessas,true) : formatNumber(kpi.promessasVigentes), subValue: isFiltered ? 'Valor parcial' : 'Promessas ativas', icon:<FileText size={14}/>, status:'neutral' as KPIStatus },
    { label: isFiltered ? 'Dep. Total (R$)' : 'Depósitos Completos', value: isFiltered ? formatCurrency(depositos,true) : formatNumber(kpi.depositosCompletos), subValue: isFiltered ? `${depPct.toFixed(1)}% do assignado` : `${depPct.toFixed(1)}% de conversão`, icon:<CheckCircle size={14}/>, status:depStatus as KPIStatus },
    { label:'Taxa de Conversão',      value:`${taxaConversao.toFixed(1)}%`,      subValue:'Dep. Total / Carteira',                        icon:<TrendingUp size={14}/>, status:depStatus as KPIStatus },
    { label:'Ticket Médio',           value:formatCurrency(ticketMedio,true),    subValue: isFiltered ? 'Por executivo' : 'Por depósito', icon:<BarChart2 size={14}/>,  status:'neutral' as KPIStatus },
    { label:'Recuperação Financeira', value:formatCurrency(valorRec,true),       subValue:'Depósitos completos',                          icon:<Target size={14}/>,     status:recStatus as KPIStatus, meta:formatCurrency(15000000,true), realizado:formatCurrency(valorRec,true), progress:(valorRec/15000000)*100 },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p className="page-subtitle">Indicadores consolidados — atualizado em {lastUpdated.toLocaleTimeString('pt-BR')}</p>
        </div>
        <button onClick={refresh} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.75rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
          <RefreshCw size={13}/> Atualizar
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12 }}>
        {kpis.map((k,i) => <KPICard key={i} {...k}/>)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
        <FunnelOperacional localizados={localizados} promessas={isFiltered ? promessas : kpi.promessasVigentes} depositos={isFiltered ? depositos : kpi.depositosCompletos} totalClientes={isFiltered ? filteredRows.length : totalClientes}/>
        <EvolucaoDiaria/>
      </div>

      {/* Ranking de Operadores com dados reais — ocupa largura total */}
      <ChartCard title="Ranking de Operadores" subtitle="Por atingimento de meta (%)" height={240}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rankingOperadores} margin={{ top:4, right:12, left:-10, bottom:40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false}/>
            <XAxis dataKey="nome" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false}
              axisLine={{ stroke:'#3a2d55' }} angle={-25} textAnchor="end" height={55}
              tickFormatter={(v:string) => v.split(' ')[0] ?? v}/>
            <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false}
              tickFormatter={(v:unknown) => `${Number(v).toFixed(0)}%`}/>
            <Tooltip content={<RankTooltip/>}/>
            <Bar dataKey="atingimento" name="Atingimento %" radius={[3,3,0,0]}>
              {rankingOperadores.map((_,i) => <Cell key={i} fill={i===0?'#aa97ef':'#8062de'} opacity={1-i*0.08}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <RecuperacaoPorCarteira/>
    </div>
  );
}
