import { useParams } from 'react-router-dom';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { MultiOperationalTable } from '../components/shared/OperationalTable';
import { useSheetData } from '../hooks/useSheetData';

function SummaryItem({ label, value, highlight }: { label:string; value:string; highlight?:boolean }) {
  return (
    <div>
      <div style={{ fontSize:'0.68rem', color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontSize:'0.95rem', fontWeight:700, color:highlight?'var(--d-accent-light)':'var(--d-text)', marginTop:2 }}>{value}</div>
    </div>
  );
}

export default function LocalizadosPage() {
  const { carteira } = useParams<{ carteira:string }>();
  const { data, loading, error, refresh } = useSheetData();
  const isPrimaria = carteira === 'primaria';
  const carteiraLabel = isPrimaria ? 'Carteira Primária' : 'Carteira Secundária';

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error)   return <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}><AlertCircle size={20}/>{error}<button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button></div>;

  const tables = isPrimaria ? data!.primaryLocalizados : data!.secondaryLocalizados;
  const totalRow = tables[0]?.rows.find(r => r.label === 'Total');
  const totalPct = tables[0]?.rows.find(r => r.label === 'Total %' || r.label === 'Total%');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'var(--d-accent-muted)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'var(--d-accent-light)' }}><MapPin size={18}/></div>
        <div><h1 className="page-title">Localizados — {carteiraLabel}</h1><p className="page-subtitle">Indicadores de localização por canal e segmento</p></div>
      </div>
      <div className="dash-card" style={{ padding:'0.75rem 1rem', display:'flex', gap:24, flexWrap:'wrap' }}>
        <SummaryItem label="Total Localizados"     value={totalRow?.values[0] ?? '—'}/>
        <SummaryItem label="% Localização (Total)" value={totalPct?.values[0] ?? '—'} highlight/>
      </div>
      <MultiOperationalTable tables={tables}/>
    </div>
  );
}
