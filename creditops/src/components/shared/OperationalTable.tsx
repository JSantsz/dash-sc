import type { CSSProperties } from 'react';
import { OpTable, RowType } from '../../utils/mockData';
interface OperationalTableProps { table: OpTable; className?: string; }
function rowClass(type: RowType): string {
  switch(type) { case 'pct': return 'row-pct'; case 'total': return 'row-total'; case 'total-pct': return 'row-pct row-total'; case 'section': return 'row-section-header'; default: return ''; }
}
function cellStyle(type: RowType, isFirst: boolean): CSSProperties {
  if (type==='total'||type==='total-pct') return isFirst?{color:'var(--d-accent-light)',fontWeight:700}:{fontWeight:700};
  if (type==='pct') return {color:'var(--d-text-muted)',fontStyle:'italic'};
  return {};
}
export function OperationalTable({ table, className='' }: OperationalTableProps) {
  return (
    <div className={`dash-card ${className}`} style={{ overflow:'hidden' }}>
      <div style={{ padding:'0.6rem 1rem', borderBottom:'1px solid var(--d-border)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--d-accent-light)' }}>{table.title}</span>
        <span style={{ fontSize:'0.68rem', color:'var(--d-text-dim)' }}>({table.columns.length} segmentos)</span>
      </div>
      <div className="op-table-wrapper" style={{ borderRadius:0, border:'none' }}>
        <table className="op-table">
          <thead><tr><th style={{ textAlign:'left' }}>Indicador</th>{table.columns.map(col=><th key={col}>{col}</th>)}</tr></thead>
          <tbody>
            {table.rows.map((row,ri)=>(
              <tr key={`${row.label}-${ri}`} className={rowClass(row.type)}>
                <td style={cellStyle(row.type,true)}>{row.label}</td>
                {row.values.map((val,ci)=><td key={ci} style={cellStyle(row.type,false)}>{val}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
interface MultiTableProps { tables: OpTable[]; title?: string; }
export function MultiOperationalTable({ tables, title }: MultiTableProps) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {title && <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>{title}</h2>}
      {tables.map((t,i) => <OperationalTable key={i} table={t} />)}
    </div>
  );
}
