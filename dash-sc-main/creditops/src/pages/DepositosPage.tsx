import { useParams } from 'react-router-dom';
import { Inbox, CheckCircle, Clock, Percent, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { OperationalTable } from '../components/shared/OperationalTable';
import { KPICard } from '../components/shared/KPICard';
import { useSheetData } from '../hooks/useSheetData';
import { formatCurrency } from '../utils/formatters';

export default function DepositosPage() {
  const { carteira } = useParams<{ carteira:string }>();
  const { data, loading, error, refresh } = useSheetData();
  const isPrimaria = carteira === 'primaria';
  const carteiraLabel = isPrimaria ? 'Carteira Primária' : 'Carteira Secundária';

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error)   return <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}><AlertCircle size={20}/>{error}<button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button></div>;

  const tables        = isPrimaria ? data!.primaryDepositos : data!.secondaryDepositos;
  const clientesTable = tables[0];
  const dividaTable   = tables[1];

  // Clientes
  const completoRow = clientesTable?.rows.find(r => r.label.trim().toLowerCase() === 'completo');
  const completoPct = clientesTable?.rows.find(r => r.label.trim().toLowerCase().startsWith('completo %') || r.label.trim().toLowerCase() === 'completo%');
  const parcialRow  = clientesTable?.rows.find(r => r.label.trim().toLowerCase() === 'parcial');
  const semDepRow   = clientesTable?.rows.find(r => r.label.trim().toLowerCase() === 'sem depósito' || r.label.trim().toLowerCase() === 'sem deposito');
  const pctVal      = parseFloat((completoPct?.values[0] ?? '0').replace('%','').replace(',','.')) || 0;

  // Dívida
  const divCompletoRow = dividaTable?.rows.find(r => r.label.trim().toLowerCase() === 'completo');
  const divParcialRow  = dividaTable?.rows.find(r => r.label.trim().toLowerCase() === 'parcial');
  const divSemDepRow   = dividaTable?.rows.find(r => r.label.trim().toLowerCase() === 'sem depósito' || r.label.trim().toLowerCase() === 'sem deposito');

  const parseDivida = (val?: string) =>
    formatCurrency(parseFloat((val ?? '0').replace(/\./g,'').replace(',','.')) || 0, true);

  const labelStyle = {
    fontSize: '0.7rem', fontWeight: 700 as const,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    color: 'var(--d-text-dim)', marginBottom: 8, display: 'block',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'rgba(94,202,218,0.15)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'#5ecada' }}><Inbox size={18}/></div>
        <div><h1 className="page-title">Depósitos — {carteiraLabel}</h1><p className="page-subtitle">Visão operacional de depósitos por segmento</p></div>
      </div>

      {/* Clientes */}
      <div>
        <span style={labelStyle}>Clientes</span>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
          <KPICard label="Depósitos Completos" value={completoRow?.values[0] ?? '—'} subValue="Acordos liquidados"     icon={<CheckCircle size={14}/>} status="success" progress={pctVal} meta="25%" realizado={completoPct?.values[0] ?? '—'}/>
          <KPICard label="Depósitos Parciais"  value={parcialRow?.values[0]  ?? '—'} subValue="Acordos em andamento"  icon={<Clock size={14}/>}       status="warning"/>
          <KPICard label="Sem Depósito"        value={semDepRow?.values[0]   ?? '—'} subValue="Sem acordo registrado" icon={<TrendingUp size={14}/>}  status="danger"/>
          <KPICard label="Taxa Conversão"      value={completoPct?.values[0] ?? '—'} subValue="Completos / Carteira"  icon={<Percent size={14}/>}     status="warning" progress={(pctVal/25)*100} meta="25%" realizado={completoPct?.values[0] ?? '—'}/>
        </div>
      </div>

      {/* Dívida */}
      <div>
        <span style={labelStyle}>Dívida</span>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
          <KPICard label="Dívida Recuperada"   value={parseDivida(divCompletoRow?.values[0])} subValue="Depósitos completos"    icon={<CheckCircle size={14}/>} status="success"/>
          <KPICard label="Dívida Parcial"      value={parseDivida(divParcialRow?.values[0])}  subValue="Acordos em andamento"   icon={<Clock size={14}/>}       status="warning"/>
          <KPICard label="Sem Depósito"        value={parseDivida(divSemDepRow?.values[0])}   subValue="Sem acordo registrado"  icon={<TrendingUp size={14}/>}  status="danger"/>
        </div>
      </div>

      {clientesTable && <OperationalTable table={clientesTable}/>}
      {dividaTable   && <OperationalTable table={dividaTable}/>}
    </div>
  );
}
