import { RefreshCw, Clock } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { useSheetData } from '../../hooks/useSheetData';
import { formatDateTime } from '../../utils/formatters';

const SEGMENTOS = ['Todos','Novatos','2dos','Sin Segundos','3ros','4tos','5tos','Regular','2xC','Estruturado','Atenção','Rec >35<60','Rec >60<90','Rec >90','Crédito'];
const PRODUTOS   = ['Todos','Cartão','Empréstimo','Financiamento','Crédito Pessoal'];

function shortName(email: string) {
  return email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
      <span style={{ fontSize:'0.6rem', color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
      <select className="dash-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Header() {
  const { filters, setFilter, refresh, lastUpdated, isLoading } = useFilters();
  const { data } = useSheetData();

  // Carteiras reais dos dados
  const carteiraOptions = [
    { label: 'Todas', value: 'all' },
    ...Array.from(new Set((data?.executivoRows ?? []).map(r => r.carteira)))
      .sort()
      .map(c => ({ label: c, value: c })),
  ];

  // Operadores reais dos dados
  const operadorOptions = [
    { label: 'Todos', value: 'all' },
    ...Array.from(new Map((data?.executivoRows ?? []).map(r => [r.email, shortName(r.email)])).entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([email, nome]) => ({ label: nome, value: email })),
  ];

  const segmentoOptions = SEGMENTOS.map(s => ({ label: s, value: s === 'Todos' ? 'all' : s }));
  const produtoOptions  = PRODUTOS.map(p  => ({ label: p, value: p === 'Todos' ? 'all' : p }));

  return (
    <header className="dash-header">
      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexWrap:'wrap' }}>
        <FilterSelect label="Carteira" value={filters.carteira} options={carteiraOptions} onChange={v => setFilter('carteira', v)} />
        <FilterSelect label="Segmento" value={filters.segmento} options={segmentoOptions} onChange={v => setFilter('segmento', v)} />
        <FilterSelect label="Operador" value={filters.operador} options={operadorOptions} onChange={v => setFilter('operador', v)} />
        <FilterSelect label="Produto"  value={filters.produto}  options={produtoOptions}  onChange={v => setFilter('produto', v)} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.68rem', color:'var(--d-text-dim)' }}>
          <Clock size={11} />{formatDateTime(lastUpdated)}
        </div>
        <button
          onClick={refresh} disabled={isLoading}
          style={{ display:'flex', alignItems:'center', gap:5, background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.75rem', fontSize:'0.75rem', fontWeight:600, cursor:isLoading?'not-allowed':'pointer', opacity:isLoading?0.6:1, transition:'all 0.15s ease' }}
        >
          <RefreshCw size={13} style={{ animation:isLoading?'spin 1s linear infinite':'none' }} />
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </header>
  );
}
