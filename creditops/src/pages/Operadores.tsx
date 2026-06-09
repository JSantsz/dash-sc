import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Users, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { DataTable } from '../components/shared/DataTable';
import { ChartCard } from '../components/charts/Charts';
import { KPICard } from '../components/shared/KPICard';
import { operatorRanking, operatorTableData, OperatorRow } from '../utils/mockData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };
function RankingCard({ rank, nome, depositos, recuperado, conversao }: { rank:number; nome:string; depositos:number; recuperado:number; conversao:number }) {
  const medal = rank===1?'#eab308':rank===2?'#9991b8':rank===3?'#cd7c2f':'var(--d-accent)';
  return (
    <div className="dash-card" style={{ padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:12, borderLeft:`3px solid ${medal}` }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background:`${medal}22`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.85rem', color:medal, flexShrink:0 }}>{rank}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--d-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nome}</div>
        <div style={{ fontSize:'0.68rem', color:'var(--d-text-muted)' }}>{depositos} dep · {conversao}% conv</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontWeight:700, fontSize:'0.82rem', color:'var(--d-success)' }}>{formatCurrency(recuperado,true)}</div>
        <div style={{ fontSize:'0.65rem', color:'var(--d-text-dim)' }}>recuperado</div>
      </div>
    </div>
  );
}
export default function Operadores() {
  const totalDepositos  = operatorRanking.reduce((s,o)=>s+o.depositos,0);
  const totalRecuperado = operatorRanking.reduce((s,o)=>s+o.recuperado,0);
  const avgConversao    = Math.round(operatorRanking.reduce((s,o)=>s+o.conversao,0)/operatorRanking.length);
  const topOperador     = operatorRanking[0]!;
  const columns = useMemo<ColumnDef<OperatorRow>[]>(()=>[
    { accessorKey:'data',           header:'Data',           size:90 },
    { accessorKey:'carteira',       header:'Carteira',       size:90 },
    { accessorKey:'produto',        header:'Produto',        size:120 },
    { accessorKey:'operador',       header:'Operador',       size:130 },
    { accessorKey:'fornecedor',     header:'Fornecedor',     size:120 },
    { accessorKey:'clientes',       header:'Clientes',       size:80,  cell:({getValue})=>formatNumber(getValue<number>()) },
    { accessorKey:'localizados',    header:'Localizados',    size:90,  cell:({getValue})=>formatNumber(getValue<number>()) },
    { accessorKey:'promessas',      header:'Promessas',      size:90,  cell:({getValue})=>formatNumber(getValue<number>()) },
    { accessorKey:'depositos',      header:'Depósitos',      size:90,  cell:({getValue})=>formatNumber(getValue<number>()) },
    { accessorKey:'valorRecuperado',header:'Valor Recuperado',size:130,cell:({getValue})=><span style={{ color:'var(--d-success)', fontWeight:600 }}>{formatCurrency(getValue<number>(),true)}</span> },
    { accessorKey:'conversao',      header:'Conversão %',   size:90,  cell:({getValue})=>{ const v=getValue<number>(); const c=v>=25?'var(--d-success)':v>=18?'var(--d-warning)':'var(--d-danger)'; return <span style={{ color:c, fontWeight:600 }}>{v}%</span>; } },
  ],[]);
  const conversionData = operatorRanking.map(o=>({ name:o.nome.split(' ')[0]??o.nome, conversao:o.conversao, recuperado:o.recuperado }));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'var(--d-accent-muted)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--d-accent-light)' }}><Users size={18}/></div>
        <div><h1 className="page-title">Operadores</h1><p className="page-subtitle">Ranking, produção, conversão e recuperação financeira individual</p></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
        <KPICard label="Total Depósitos"  value={formatNumber(totalDepositos)}          icon={<Trophy size={14}/>}    status="success"/>
        <KPICard label="Total Recuperado" value={formatCurrency(totalRecuperado,true)}  icon={<DollarSign size={14}/>} status="success"/>
        <KPICard label="Conversão Média"  value={`${avgConversao}%`}                    icon={<TrendingUp size={14}/>} status="warning"/>
        <KPICard label="Top Operador"     value={topOperador.nome.split(' ')[0]!}        icon={<Users size={14}/>}     status="success" subValue={`${topOperador.depositos} dep · ${formatCurrency(topOperador.recuperado,true)}`}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
        <ChartCard title="Recuperação vs Conversão" subtitle="Por operador" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conversionData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false} yAxisId="left"/>
              <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }}/>
              <YAxis yAxisId="left"  tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>`R${(Number(v)/1e6).toFixed(1)}M`}/>
              <YAxis yAxisId="right" orientation="right" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>`${Number(v)}%`}/>
              <Tooltip contentStyle={TT} formatter={(v:unknown,name:unknown)=>name==='conversao'?[`${Number(v)}%`,'Conversão']:[formatCurrency(Number(v),true),'Recuperado']}/>
              <Bar yAxisId="left"  dataKey="recuperado" name="Recuperado" fill="#8062de" radius={[3,3,0,0]}>{conversionData.map((_,i)=><Cell key={i} fill={i===0?'#aa97ef':'#8062de'} opacity={1-i*0.06}/>)}</Bar>
              <Bar yAxisId="right" dataKey="conversao"  name="Conversão"  fill="#21ade0" radius={[3,3,0,0]} opacity={0.7}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--d-text)', marginBottom:4 }}>🏆 Ranking Operadores</div>
          {operatorRanking.slice(0,6).map((o,i)=><RankingCard key={i} rank={i+1} {...o}/>)}
        </div>
      </div>
      <div>
        <h2 style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', marginBottom:10 }}>Detalhamento por Registro</h2>
        <DataTable columns={columns} data={operatorTableData} pageSize={15} exportFilename="operadores"/>
      </div>
    </div>
  );
}
