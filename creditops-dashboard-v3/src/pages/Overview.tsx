import { DollarSign, Users, MapPin, FileText, CheckCircle, TrendingUp, BarChart2, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { KPICard, KPIStatus } from '../components/shared/KPICard';
import { FunnelOperacional, EvolucaoDiaria, RankingOperadores, RankingFornecedores, RecuperacaoPorCarteira } from '../components/charts/Charts';
import { useSheetData } from '../hooks/useSheetData';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function Overview() {
  const { data, loading, error, lastUpdated, refresh } = useSheetData();

  if (loading) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:12 }}>
      <RefreshCw size={24} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>
      <span>Carregando dados da planilha...</span>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:12, color:'var(--d-danger)' }}>
      <AlertCircle size={24}/>
      <span>{error}</span>
      <button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.4rem 1rem', cursor:'pointer', fontSize:'0.8rem' }}>Tentar novamente</button>
    </div>
  );

  const kpi = data!.kpis;
  const totalValor     = kpi.carteiraTotalValor;
  const totalClientes  = kpi.carteiraTotalClientes;
  const localizados    = kpi.clientesLocalizados;
  const locPct         = kpi.clientesLocalizadosPct;
  const depositos      = kpi.depositosCompletos;
  const depPct         = kpi.depositosCompletosPct;
  const valorRec       = kpi.valorRecuperado;
  const ticketMedio    = depositos > 0 ? Math.round(valorRec / depositos) : 0;
  const taxaConversao  = totalClientes > 0 ? ((depositos / totalClientes) * 100) : 0;

  const locStatus  = locPct  >= 80 ? 'success' : locPct  >= 60 ? 'warning' : 'danger';
  const depStatus  = depPct  >= 25 ? 'success' : depPct  >= 15 ? 'warning' : 'danger';
  const recStatus  = valorRec >= 15000000 ? 'success' : valorRec >= 10000000 ? 'warning' : 'danger';

  const kpis = [
    { label:'Carteira Total',         value:formatCurrency(totalValor,true),    subValue:`${formatNumber(totalClientes)} clientes`,   icon:<DollarSign size={14}/>, status:'neutral' as KPIStatus },
    { label:'Clientes Trabalhados',   value:formatNumber(totalClientes),         subValue:'100% da carteira',                          icon:<Users size={14}/>,      status:'neutral' as KPIStatus },
    { label:'Clientes Localizados',   value:formatNumber(localizados),           subValue:`${locPct}% de localização`,                 icon:<MapPin size={14}/>,     status:locStatus  as KPIStatus, meta:'80%',  realizado:`${locPct}%`,       progress:(locPct/80)*100 },
    { label:'Promessas Vigentes',     value:formatNumber(kpi.promessasVigentes), subValue:'Promessas ativas',                          icon:<FileText size={14}/>,   status:'neutral'  as KPIStatus },
    { label:'Depósitos Completos',    value:formatNumber(depositos),             subValue:`${depPct.toFixed(1)}% de conversão`,        icon:<CheckCircle size={14}/>, status:depStatus  as KPIStatus, meta:'25%',  realizado:`${depPct.toFixed(1)}%`, progress:(depPct/25)*100 },
    { label:'Taxa de Conversão',      value:`${taxaConversao.toFixed(1)}%`,      subValue:'Depósitos / Carteira',                      icon:<TrendingUp size={14}/>, status:depStatus  as KPIStatus },
    { label:'Ticket Médio',           value:formatCurrency(ticketMedio,true),    subValue:'Por depósito completo',                     icon:<BarChart2 size={14}/>,  status:'neutral'  as KPIStatus },
    { label:'Recuperação Financeira', value:formatCurrency(valorRec,true),       subValue:'Depósitos completos',                       icon:<Target size={14}/>,     status:recStatus  as KPIStatus, meta:formatCurrency(15000000,true), realizado:formatCurrency(valorRec,true), progress:(valorRec/15000000)*100 },
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
        <FunnelOperacional localizados={localizados} promessas={kpi.promessasVigentes} depositos={depositos} totalClientes={totalClientes}/>
        <EvolucaoDiaria/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <RankingOperadores/><RankingFornecedores/>
      </div>
      <RecuperacaoPorCarteira/>
    </div>
  );
}
