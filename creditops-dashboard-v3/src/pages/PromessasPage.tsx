import { useParams } from 'react-router-dom';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { OperationalTable } from '../components/shared/OperationalTable';
import { useSheetData } from '../hooks/useSheetData';

function SummaryItem({ label, value, highlight }:{ label:string; value:string; highlight?:boolean }) {
  return (
    <div>
      <div style={{ fontSize:'0.68rem', color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontSize:'0.95rem', fontWeight:700, color:highlight?'var(--d-accent-light)':'var(--d-text)', marginTop:2 }}>{value}</div>
    </div>
  );
}
function StatusBadge({ label, color, value }:{ label:string; color:string; value:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:`${color}18`, borderRadius:6, padding:'4px 10px', border:`1px solid ${color}40` }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }}/>
      <div><div style={{ fontSize:'0.62rem', color:'var(--d-text-dim)' }}>{label}</div><div style={{ fontSize:'0.85rem', fontWeight:700, color }}>{value}</div></div>
    </div>
  );
}

export default function PromessasPage() {
  const { carteira } = useParams<{ carteira:string }>();
  const { data, loading, error, refresh } = useSheetData();
  const isPrimaria = carteira === 'primaria';
  const carteiraLabel = isPrimaria ? 'Carteira Primária' : 'Carteira Secundária';

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error)   return <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}><AlertCircle size={20}/>{error}<button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button></div>;

  const tables = isPrimaria ? data!.primaryPromessas : data!.secondaryPromessas;
  const clientesTable = tables[0];
  const dividaTable   = tables[1];
  const vencida   = clientesTable?.rows.find(r => r.label === 'Vencida');
  const vigente   = clientesTable?.rows.find(r => r.label === 'Vigente');
  const vigentePct= clientesTable?.rows.find(r => r.label === 'Vigente %' || r.label === 'Vigente%');
  const naoPag    = clientesTable?.rows.find(r => r.label === 'Não pagará');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'var(--d-accent-muted)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'var(--d-accent-light)' }}><FileText size={18}/></div>
        <div><h1 className="page-title">Promessas — {carteiraLabel}</h1><p className="page-subtitle">Status de promessas de pagamento por segmento</p></div>
      </div>
      <div className="dash-card" style={{ padding:'0.75rem 1rem', display:'flex', gap:24, flexWrap:'wrap' }}>
        <SummaryItem label="Vencidas"       value={vencida?.values[0] ?? '—'}/>
        <SummaryItem label="Vigentes"       value={vigente?.values[0] ?? '—'} highlight/>
        <SummaryItem label="% Vigentes"     value={vigentePct?.values[0] ?? '—'} highlight/>
        <div style={{ marginLeft:'auto', display:'flex', gap:12, flexWrap:'wrap' }}>
          <StatusBadge label="Não pagará" color="var(--d-danger)"  value={naoPag?.values[0] ?? '0'}/>
          <StatusBadge label="Vencida"    color="var(--d-warning)" value={vencida?.values[0] ?? '0'}/>
          <StatusBadge label="Vigente"    color="var(--d-success)" value={vigente?.values[0] ?? '0'}/>
        </div>
      </div>
      {clientesTable && <OperationalTable table={clientesTable}/>}
      {dividaTable   && <OperationalTable table={dividaTable}/>}
    </div>
  );
}
