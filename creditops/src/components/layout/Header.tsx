import { RefreshCw, Clock } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { formatDateTime } from '../../utils/formatters';
const CARTEIRAS=['Todas','Primária','Secundária'];
const SEGMENTOS=['Todos','Novatos','2dos','3ros','Regular','Estruturado','Atenção','Crédito'];
const OPERADORES=['Todos','Ana Silva','João Santos','Maria Oliveira','Carlos Lima','Paula Mendes','Roberto Alves','Fernanda Costa','Lucas Ferreira'];
const FORNECEDORES=['Todos','Fornecedor A','Fornecedor B','Fornecedor C','Fornecedor D'];
const PRODUTOS=['Todos','Cartão','Empréstimo','Financiamento','Crédito Pessoal'];
function FilterSelect({ label, value, options, onChange }: { label:string; value:string; options:string[]; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
      <span style={{ fontSize:'0.6rem', color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
      <select className="dash-select" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=><option key={o} value={o==='Todos'||o==='Todas'?'all':o}>{o}</option>)}
      </select>
    </div>
  );
}
function DateInput({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
      <span style={{ fontSize:'0.6rem', color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
      <input type="date" className="dash-select" style={{ colorScheme:'dark', minWidth:120 }} value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
export function Header() {
  const { filters, setFilter, refresh, lastUpdated, isLoading } = useFilters();
  return (
    <header className="dash-header">
      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexWrap:'wrap' }}>
        <DateInput label="Data Inicial" value={filters.dataInicial} onChange={v=>setFilter('dataInicial',v)} />
        <DateInput label="Data Final"   value={filters.dataFinal}   onChange={v=>setFilter('dataFinal',v)} />
        <div style={{ width:1, height:32, background:'var(--d-border)', flexShrink:0 }} />
        <FilterSelect label="Carteira"   value={filters.carteira}   options={CARTEIRAS}    onChange={v=>setFilter('carteira',v)} />
        <FilterSelect label="Segmento"   value={filters.segmento}   options={SEGMENTOS}    onChange={v=>setFilter('segmento',v)} />
        <FilterSelect label="Operador"   value={filters.operador}   options={OPERADORES}   onChange={v=>setFilter('operador',v)} />
        <FilterSelect label="Fornecedor" value={filters.fornecedor} options={FORNECEDORES} onChange={v=>setFilter('fornecedor',v)} />
        <FilterSelect label="Produto"    value={filters.produto}    options={PRODUTOS}     onChange={v=>setFilter('produto',v)} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.68rem', color:'var(--d-text-dim)' }}>
          <Clock size={11} />{formatDateTime(lastUpdated)}
        </div>
        <button onClick={refresh} disabled={isLoading} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.75rem', fontSize:'0.75rem', fontWeight:600, cursor:isLoading?'not-allowed':'pointer', opacity:isLoading?0.6:1, transition:'all 0.15s ease' }}>
          <RefreshCw size={13} style={{ animation:isLoading?'spin 1s linear infinite':'none' }} />
          {isLoading?'Atualizando...':'Atualizar'}
        </button>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </header>
  );
}
