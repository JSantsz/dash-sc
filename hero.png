import type { ReactNode } from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, Cell } from 'recharts';
import { dailyData, operatorRanking, supplierRanking, recoveryByCarteira } from '../../utils/mockData';
import { formatCurrency } from '../../utils/formatters';

interface ChartCardProps { title:string; children:ReactNode; height?:number; subtitle?:string; }
export function ChartCard({ title, children, height=260, subtitle }:ChartCardProps) {
  return (
    <div className="dash-card" style={{ padding:'1rem' }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--d-text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:'0.7rem', color:'var(--d-text-muted)', marginTop:2 }}>{subtitle}</div>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

interface FunnelProps { totalClientes?:number; localizados?:number; promessas?:number; depositos?:number; }
export function FunnelOperacional({ totalClientes, localizados, promessas, depositos }:FunnelProps) {
  const data = [
    { name:'Carteira',    value: totalClientes ?? 2684, fill:'#8062de' },
    { name:'Localizados', value: localizados   ?? 2010, fill:'#aa97ef' },
    { name:'Depósitos',   value: depositos     ?? 537,  fill:'#21ade0' },
    { name:'Promessas',   value: promessas     ?? 663,  fill:'#aa6cc9' },
  ];
  return (
    <ChartCard title="Funil Operacional" subtitle="Carteira → Localizados → Depósitos → Promessas">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip contentStyle={TT} formatter={(v) => [(Number(v)).toLocaleString('pt-BR'), 'Clientes']} />
          <Funnel dataKey="value" data={data} isAnimationActive>
            {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
            <LabelList position="right" fill="var(--d-text)" stroke="none" dataKey="name" style={{ fontSize:12 }} />
            <LabelList position="center" fill="#fff" stroke="none" dataKey="value" formatter={(v:unknown) => Number(v).toLocaleString('pt-BR')} style={{ fontSize:11, fontWeight:700 }} />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function EvolucaoDiaria() {
  return (
    <ChartCard title="Evolução Diária" subtitle="Últimos 30 dias" height={260}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dailyData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" />
          <XAxis dataKey="dia" tick={{ fill:'#9991b8', fontSize:10 }} interval={4} tickLine={false} axisLine={{ stroke:'#3a2d55' }} />
          <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TT} />
          <Legend wrapperStyle={{ fontSize:11, color:'#9991b8', paddingTop:8 }} />
          <Line type="monotone" dataKey="localizados" name="Localizados" stroke="#8062de" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="promessas"   name="Promessas"   stroke="#21ade0" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="depositos"   name="Depósitos"   stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RankingOperadores() {
  return (
    <ChartCard title="Ranking de Operadores" subtitle="Por depósitos confirmados" height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={operatorRanking} margin={{ top:4, right:12, left:-10, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false} />
          <XAxis dataKey="nome" tick={{ fill:'#9991b8', fontSize:10 }} tickFormatter={(v:string) => v.split(' ')[0]??v} tickLine={false} axisLine={{ stroke:'#3a2d55' }} />
          <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TT} formatter={(v) => [Number(v), 'Depósitos']} />
          <Bar dataKey="depositos" name="Depósitos" radius={[3,3,0,0]}>
            {operatorRanking.map((_,i) => <Cell key={i} fill={i===0?'#aa97ef':'#8062de'} opacity={1-i*0.07} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RankingFornecedores() {
  return (
    <ChartCard title="Ranking de Fornecedores" subtitle="Por valor recuperado" height={200}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={supplierRanking} layout="vertical" margin={{ top:4, right:12, left:10, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" horizontal={false} />
          <XAxis type="number" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:number) => `${(v/1e6).toFixed(1)}M`} />
          <YAxis type="category" dataKey="fornecedor" tick={{ fill:'#9991b8', fontSize:11 }} tickLine={false} axisLine={false} width={90} />
          <Tooltip contentStyle={TT} formatter={(v) => [formatCurrency(Number(v),true), 'Recuperado']} />
          <Bar dataKey="valor" name="Valor" radius={[0,3,3,0]}>
            {supplierRanking.map((_,i) => <Cell key={i} fill={(['#21ade0','#17789c','#aa6cc9','#8062de'] as string[])[i]??'#8062de'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RecuperacaoPorCarteira() {
  return (
    <ChartCard title="Recuperação por Carteira" subtitle="Realizado vs Meta" height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={recoveryByCarteira} margin={{ top:4, right:12, left:-10, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false} />
          <XAxis dataKey="carteira" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} />
          <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:number) => `${(v/1e6).toFixed(1)}M`} />
          <Tooltip contentStyle={TT} formatter={(v,name) => [formatCurrency(Number(v),true), name==='valor'?'Realizado':'Meta']} />
          <Legend wrapperStyle={{ fontSize:11, color:'#9991b8', paddingTop:8 }} />
          <Bar dataKey="meta"  name="Meta"      fill="rgba(128,98,222,0.25)" radius={[3,3,0,0]} />
          <Bar dataKey="valor" name="Realizado" fill="#8062de" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface SimpleBarProps { data:{name:string;value:number}[]; title:string; color?:string; valueFormatter?:(v:number)=>string; }
export function SimpleBarChart({ data, title, color='#8062de', valueFormatter }:SimpleBarProps) {
  return (
    <ChartCard title={title} height={220}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top:4, right:12, left:-10, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.6)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} />
          <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={valueFormatter?(v:unknown)=>valueFormatter(Number(v)):(v:unknown)=>String(v)} />
          <Tooltip contentStyle={TT} formatter={(v) => [valueFormatter?valueFormatter(Number(v)):Number(v), 'Valor']} />
          <Bar dataKey="value" fill={color} radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
