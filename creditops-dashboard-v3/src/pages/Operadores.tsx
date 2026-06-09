import { useMemo } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Users, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { DataTable } from '../components/shared/DataTable';
import { ChartCard } from '../components/charts/Charts';
import { KPICard } from '../components/shared/KPICard';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSheetData } from '../hooks/useSheetData';
const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };
function RankingCard({ rank, nome, depositos, recuperado, conversao }: any) {
 const medal = rank===1?'#eab308':rank===2?'#9991b8':rank===3?'#cd7c2f':'var(--d-accent)';
 return <div className="dash-card" style={{ padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:12, borderLeft:`3px solid ${medal}` }}><div style={{ width:32,height:32,borderRadius:'50%',background:`${medal}22`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:medal }}>{rank}</div><div style={{flex:1}}><div>{nome}</div><div style={{fontSize:'0.68rem'}}>{depositos} dep · {conversao}% contato</div></div><div><div style={{color:'var(--d-success)'}}>{formatCurrency(recuperado,true)}</div></div></div>
}
export default function Operadores(){
 const {executivoRows}=useSheetData();
 const operatorRanking=useMemo(()=>executivoRows.map(r=>({nome:r.executivo,depositos:r.completo,recuperado:r.depositoTotal,conversao:r.pctContato,carteira:r.carteira})).sort((a,b)=>b.conversao-a.conversao),[executivoRows]);
 const totalDepositos=operatorRanking.reduce((s,o)=>s+o.depositos,0);
 const totalRecuperado=operatorRanking.reduce((s,o)=>s+o.recuperado,0);
 const avgConversao=operatorRanking.length?Math.round(operatorRanking.reduce((s,o)=>s+o.conversao,0)/operatorRanking.length):0;
 const topOperador=operatorRanking[0]||{nome:'-',depositos:0,recuperado:0,conversao:0};
 const tableData=executivoRows.map((r,i)=>({data:'Atual',carteira:r.carteira,operador:r.executivo,localizados:r.wppMeetTel,promessas:r.wpp,depositos:r.completo,valorRecuperado:r.depositoTotal,conversao:r.pctContato,id:i}));
 const columns=useMemo<ColumnDef<any>[]>(()=>[
 {accessorKey:'data',header:'Data'},
 {accessorKey:'carteira',header:'Carteira'},
 {accessorKey:'operador',header:'Operador'},
 {accessorKey:'localizados',header:'Localizados'},
 {accessorKey:'promessas',header:'Promessas'},
 {accessorKey:'depositos',header:'Depósitos'},
 {accessorKey:'valorRecuperado',header:'Valor Recuperado',cell:({getValue})=><span style={{color:'var(--d-success)'}}>{formatCurrency(getValue() as number,true)}</span>},
 {accessorKey:'conversao',header:'% Contato'}],[]);
 const conversionData=operatorRanking.map(o=>({name:o.nome.split(' ')[0],conversao:o.conversao,recuperado:o.recuperado}));
 return <div style={{display:'flex',flexDirection:'column',gap:16}}><div><h1 className="page-title">Operadores</h1><p className="page-subtitle">Ranking por % de contato, produção e recuperação financeira</p></div><div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}><KPICard label="Total Depósitos" value={formatNumber(totalDepositos)} icon={<Trophy size={14}/>} status="success"/><KPICard label="Total Recuperado" value={formatCurrency(totalRecuperado,true)} icon={<DollarSign size={14}/>} status="success"/><KPICard label="% Contato Médio" value={`${avgConversao}%`} icon={<TrendingUp size={14}/>} status="warning"/><KPICard label="Top Operador" value={topOperador.nome} icon={<Users size={14}/>} status="success"/></div><div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}><ChartCard title="Recuperação vs % Contato" subtitle="Por operador" height={240}><ResponsiveContainer width="100%" height="100%"><BarChart data={conversionData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis yAxisId="left"/><YAxis yAxisId="right" orientation="right"/><Tooltip contentStyle={TT}/><Bar yAxisId="left" dataKey="recuperado" fill="#8062de">{conversionData.map((_,i)=><Cell key={i}/> )}</Bar><Bar yAxisId="right" dataKey="conversao" fill="#21ade0"/></BarChart></ResponsiveContainer></ChartCard><div>{operatorRanking.slice(0,6).map((o,i)=><RankingCard key={i} rank={i+1} {...o}/>)}</div></div><DataTable columns={columns} data={tableData} pageSize={15}/></div>
}
