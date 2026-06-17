import { useMemo, useState } from 'react';
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
  const [visao, setVisao] = useState<'divida'|'cliente'>('divida');

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

  // ── Valores base ──────────────────────────────────────────────────────────
  const totalValor       = isFiltered ? filteredRows.reduce((s,r) => s+r.assignado, 0)         : kpi.carteiraTotalValor;
  const totalClientes    = isFiltered ? filteredRows.length                                     : kpi.carteiraTotalClientes;
  const localizadosCli   = isFiltered ? filteredRows.reduce((s,r) => s+r.wpp+r.wppMeetTel, 0) : kpi.clientesLocalizados;
  const localizadosVal   = isFiltered ? filteredRows.reduce((s,r) => s+r.assignado*(r.wpp+r.wppMeetTel>0?1:0), 0) : kpi.localizadosDividaTotal;
  const locPct           = isFiltered ? (totalClientes>0 ? Math.round((localizadosCli/totalClientes)*100) : 0) : kpi.clientesLocalizadosPct;
  const promessasCli     = isFiltered ? filteredRows.reduce((s,r) => s+r.parcial, 0)           : kpi.promessasVigentes;
  const promessasVal     = isFiltered ? filteredRows.reduce((s,r) => s+r.parcial, 0)           : kpi.promessasDividaTotal;
  const promSubValue     = 'Não pagará + Sem promessa + Vencida + Parcial + Completa + Vigente';
  const depositosCli     = isFiltered ? filteredRows.reduce((s,r) => s+r.completo, 0)          : kpi.depositosCompletos;
  const depositosVal     = isFiltered ? filteredRows.reduce((s,r) => s+r.depositoTotal, 0)     : kpi.valorRecuperado;
  const depPct           = totalValor>0 ? (depositosVal/totalValor)*100 : kpi.depositosCompletosPct;
  const taxaConversao    = totalValor>0 ? (depositosVal/totalValor)*100 : 0;
  const ticketMedio      = depositosCli>0 ? Math.round(depositosVal/depositosCli) : 0;

  const locStatus = locPct>=80?'success':locPct>=60?'warning':'danger';
  const depStatus = depPct>=25?'success':depPct>=15?'warning':'danger';
  const recStatus = depositosVal>=15000000?'success':depositosVal>=10000000?'warning':'danger';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p className="page-subtitle">Indicadores consolidados — atualizado em {lastUpdated.toLocaleTimeString('pt-BR')}</p>
        </div>
        {/* Toggle Dívida / Cliente */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'0.7rem', color:'var(--d-text-dim)', fontWeight:600 }}>Visão:</span>
          <div style={{ display:'flex', background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:8, padding:3, gap:3 }}>
            {(['divida','cliente'] as const).map(v => (
              <button key={v} onClick={()=>setVisao(v)} style={{
                padding:'4px 14px', fontSize:'0.72rem', fontWeight:700, borderRadius:6, cursor:'pointer', border:'none',
                background: visao===v ? 'var(--d-accent)' : 'transparent',
                color:      visao===v ? '#fff' : 'var(--d-text-dim)',
                transition: 'all 0.15s',
              }}>
                {v === 'divida' ? 'Dívida' : 'Cliente'}
              </button>
            ))}
          </div>
          <button onClick={refresh} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.75rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
            <RefreshCw size={13}/> Atualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12 }}>
        {visao === 'divida' ? (
          <>
            <KPICard label="Carteira Total (R$)"    value={formatCurrency(totalValor,true)}     subValue={`${formatNumber(totalClientes)} clientes`}             icon={<DollarSign size={14}/>} status="neutral"/>
            <KPICard label="Localizados (R$)"       value={formatCurrency(localizadosVal,true)}  subValue={`${locPct}% de localização`}                           icon={<MapPin size={14}/>}     status={locStatus as KPIStatus}/>
            <KPICard label="Promessas (R$)"         value={formatCurrency(promessasVal,true)}    subValue={promSubValue}  icon={<FileText size={14}/>}   status="neutral"/>
            <KPICard label="Depósitos Completos (R$)" value={formatCurrency(depositosVal,true)} subValue={`${depPct.toFixed(1)}% do assignado`}                  icon={<CheckCircle size={14}/>} status={depStatus as KPIStatus}/>
            <KPICard label="Taxa de Conversão"      value={`${taxaConversao.toFixed(1)}%`}       subValue="Dep. Total / Carteira"                                  icon={<TrendingUp size={14}/>}  status={depStatus as KPIStatus}/>
            <KPICard label="Ticket Médio"           value={formatCurrency(ticketMedio,true)}     subValue="Por depósito completo"                                  icon={<BarChart2 size={14}/>}   status="neutral"/>
            <KPICard label="Recuperação Financeira" value={formatCurrency(depositosVal,true)}    subValue="Depósitos completos" icon={<Target size={14}/>} status={recStatus as KPIStatus} meta={formatCurrency(15000000,true)} realizado={formatCurrency(depositosVal,true)} progress={(depositosVal/15000000)*100}/>
          </>
        ) : (
          <>
            <KPICard label="Carteira Total (Cli.)"  value={formatNumber(totalClientes)}          subValue={formatCurrency(totalValor,true)}                        icon={<Users size={14}/>}      status="neutral"/>
            <KPICard label="Localizados"            value={formatNumber(localizadosCli)}          subValue={`${locPct}% de localização`}                           icon={<MapPin size={14}/>}     status={locStatus as KPIStatus} meta="80%" realizado={`${locPct}%`} progress={(locPct/80)*100}/>
            <KPICard label="Promessas (Clientes)"   value={formatNumber(promessasCli)}            subValue={promSubValue}  icon={<FileText size={14}/>}   status="neutral"/>
            <KPICard label="Depósitos Completos"    value={formatNumber(depositosCli)}            subValue={`${depPct.toFixed(1)}% de conversão`}                  icon={<CheckCircle size={14}/>} status={depStatus as KPIStatus} meta="25%" realizado={`${depPct.toFixed(1)}%`} progress={(depPct/25)*100}/>
            <KPICard label="Taxa de Conversão"      value={`${taxaConversao.toFixed(1)}%`}        subValue="Dep. Total / Carteira"                                  icon={<TrendingUp size={14}/>}  status={depStatus as KPIStatus}/>
            <KPICard label="Ticket Médio"           value={formatCurrency(ticketMedio,true)}      subValue="Por depósito completo"                                  icon={<BarChart2 size={14}/>}   status="neutral"/>
            <KPICard label="Recuperação Financeira" value={formatCurrency(depositosVal,true)}     subValue="Depósitos completos" icon={<Target size={14}/>} status={recStatus as KPIStatus} meta={formatCurrency(15000000,true)} realizado={formatCurrency(depositosVal,true)} progress={(depositosVal/15000000)*100}/>
          </>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
        <FunnelOperacional
          totalClientes={visao === 'divida' ? totalValor     : totalClientes}
          localizados={  visao === 'divida' ? localizadosVal : localizadosCli}
          depositos={    visao === 'divida' ? depositosVal   : depositosCli}
          promessas={    visao === 'divida' ? promessasVal   : promessasCli}
        />
        <EvolucaoDiaria/>
      </div>


    </div>
  );
}
