import { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, ColumnDef, SortingState } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportCSV } from '../../utils/formatters';

interface DataTableProps<T extends object = Record<string, unknown>> {
  columns: ColumnDef<T>[]; data: T[]; pageSize?: number; exportFilename?: string;
}

export function DataTable<T extends object = Record<string, unknown>>({ columns, data, pageSize=15, exportFilename='export' }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const table = useReactTable({ data, columns, state:{sorting,globalFilter}, onSortingChange:setSorting, onGlobalFilterChange:setGlobalFilter,
    getCoreRowModel:getCoreRowModel(), getSortedRowModel:getSortedRowModel(), getFilteredRowModel:getFilteredRowModel(),
    getPaginationRowModel:getPaginationRowModel(), initialState:{ pagination:{ pageSize } } });
  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const exportData = useMemo(() => data.map(row => Object.fromEntries(
    columns.map(c => { const key=(c as {accessorKey?:string}).accessorKey ?? String(c.id??''); return [key,(row as Record<string,unknown>)[key]]; })
  )), [data,columns]);
  return (
    <div className="dash-card" style={{ overflow:'hidden' }}>
      <div style={{ padding:'0.7rem 1rem', borderBottom:'1px solid var(--d-border)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--d-text-dim)' }} />
          <input className="dash-input" style={{ paddingLeft:26 }} placeholder="Buscar..." value={globalFilter} onChange={e=>setGlobalFilter(e.target.value)} />
        </div>
        <span style={{ fontSize:'0.72rem', color:'var(--d-text-dim)', whiteSpace:'nowrap' }}>{table.getFilteredRowModel().rows.length} registros</span>
        <button onClick={()=>exportCSV(exportData,exportFilename)} style={{ display:'flex', alignItems:'center', gap:4, background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.28rem 0.7rem', fontSize:'0.72rem', cursor:'pointer', whiteSpace:'nowrap' }}>
          <Download size={12} /> CSV
        </button>
      </div>
      <div className="gen-table-wrapper" style={{ borderRadius:0, border:'none' }}>
        <table className="gen-table">
          <thead>{table.getHeaderGroups().map(hg=>(
            <tr key={hg.id}>{hg.headers.map(header=>{
              const sorted=header.column.getIsSorted();
              return <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor:header.column.getCanSort()?'pointer':'default' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {flexRender(header.column.columnDef.header,header.getContext())}
                  {header.column.getCanSort()&&(sorted==='asc'?<ChevronUp size={11} style={{ color:'var(--d-accent-light)' }}/>:sorted==='desc'?<ChevronDown size={11} style={{ color:'var(--d-accent-light)' }}/>:<ChevronsUpDown size={11} style={{ opacity:0.4 }}/>)}
                </div>
              </th>;
            })}</tr>
          ))}</thead>
          <tbody>{rows.length===0?(<tr><td colSpan={columns.length} style={{ textAlign:'center', color:'var(--d-text-muted)', padding:'2rem' }}>Nenhum registro encontrado</td></tr>):rows.map(row=>(<tr key={row.id}>{row.getVisibleCells().map(cell=>(<td key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>))}</tr>))}</tbody>
        </table>
      </div>
      <div style={{ padding:'0.6rem 1rem', borderTop:'1px solid var(--d-border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'0.72rem', color:'var(--d-text-muted)' }}>Linhas por página:</span>
          <select className="dash-select" style={{ minWidth:60 }} value={table.getState().pagination.pageSize} onChange={e=>table.setPageSize(Number(e.target.value))}>
            {[10,15,25,50].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'0.72rem', color:'var(--d-text-muted)' }}>Pág. {pageIndex+1} de {Math.max(pageCount,1)}</span>
          <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:4, padding:'3px 7px', cursor:'pointer', color:table.getCanPreviousPage()?'var(--d-text)':'var(--d-text-dim)', display:'flex', alignItems:'center' }}><ChevronLeft size={14}/></button>
          <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()} style={{ background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:4, padding:'3px 7px', cursor:'pointer', color:table.getCanNextPage()?'var(--d-text)':'var(--d-text-dim)', display:'flex', alignItems:'center' }}><ChevronRight size={14}/></button>
        </div>
      </div>
    </div>
  );
}
