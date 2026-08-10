import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Smartphone, RefreshCw, AlertCircle, LogIn, Activity, Users } from 'lucide-react';
import { KPICard } from '../components/shared/KPICard';
import { DataTable } from '../components/shared/DataTable';
import { ChartCard } from '../components/charts/Charts';
import { useSheetData } from '../hooks/useSheetData';
import type { UtilizacaoAppRow } from '../hooks/useSheetData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

const SEGMENTOS_ORDEM = [
  'Nunca acessou o app',
  'Tem login, mas nunca usou o app',
  'Já usou o app, mas não nos últimos 30 dias',
  'Ativo no app (últimos 30 dias)',
];

const SEGMENTO_COR: Record<string, string> = {
  'Nunca acessou o app':                       '#ef4444',
  'Tem login, mas nunca usou o app':           '#eab308',
  'Já usou o app, mas não nos últimos 30 dias':'#21ade0',
  'Ativo no app (últimos 30 dias)':            '#22c55e',
};

const columns: ColumnDef<UtilizacaoAppRow>[] = [
  { header: 'BR',                     accessorKey: 'br' },
  { header: 'Nome',                   accessorKey: 'nome' },
  { header: 'Executivo',              accessorKey: 'executivo' },
  { header: 'Carteira',               accessorKey: 'carteiraPrimaria' },
  { header: 'Tem Login',              accessorKey: 'temLogin' },
  { header: 'Dias Ativos (30d)',      accessorKey: 'diasAtivosUltimos30d' },
  { header: 'Cliques (30d)',          accessorKey: 'cliquesUltimos30d' },
  { header: 'Última Atividade',       accessorKey: 'ultimaAtividadeApp' },
  { header: 'Funcionalidade + Usada', accessorKey: 'funcionalidadeMaisUsada' },
  { header: 'Segmento',               accessorKey: 'segmentoEngajamento' },
];

export default function UtilizacaoAppPage() {
  const { data, loading, error, refresh } = useSheetData();
  const [executivoFiltro, setExecutivoFiltro] = useState('all');

  // IMPORTANTE: os hooks abaixo (useMemo) precisam ser chamados sempre, na mesma
  // ordem, em todo render — por isso `rows` cai pra [] com segurança em vez de usar
  // `data!` e ficar condicionado ao loading/error. Os returns de loading/erro vêm
  // DEPOIS de todos os hooks, nunca antes (Rules of Hooks).
  const rows = useMemo(() => data?.utilizacaoApp ?? [], [data]);

  const executivos = useMemo(
    () => Array.from(new Set(rows.map(r => r.executivo).filter(Boolean))).sort(),
    [rows]
  );

  const filtradas = useMemo(
    () => executivoFiltro === 'all' ? rows : rows.filter(r => r.executivo === executivoFiltro),
    [rows, executivoFiltro]
  );

  const kpis = useMemo(() => {
    const total = filtradas.length;
    const ativos30d = filtradas.filter(r => r.segmentoEngajamento === 'Ativo no app (últimos 30 dias)').length;
    const nuncaAcessou = filtradas.filter(r => r.segmentoEngajamento === 'Nunca acessou o app').length;
    const diasAtivosMedia = total > 0
      ? filtradas.reduce((acc, r) => acc + r.diasAtivosUltimos30d, 0) / total
      : 0;
    return {
      total,
      pctAtivos30d: total > 0 ? (ativos30d / total) * 100 : 0,
      pctNuncaAcessou: total > 0 ? (nuncaAcessou / total) * 100 : 0,
      diasAtivosMedia,
    };
  }, [filtradas]);

  const funilData = useMemo(
    () => SEGMENTOS_ORDEM.map(segmento => ({
      name: segmento,
      value: filtradas.filter(r => r.segmentoEngajamento === segmento).length,
    })),
    [filtradas]
  );

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}>
      <AlertCircle size={20}/>{error}
      <button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'rgba(94,202,218,0.12)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'#5ecada' }}><Smartphone size={18}/></div>
          <div><h1 className="page-title">Utilização do App</h1><p className="page-subtitle">Carteira ativa do mês × utilização do app pelo cliente</p></div>
        </div>
        <select
          className="dash-select"
          value={executivoFiltro}
          onChange={e => setExecutivoFiltro(e.target.value)}
        >
          <option value="all">Todos os executivos</option>
          {executivos.map(exec => <option key={exec} value={exec}>{exec}</option>)}
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:10 }}>
        <KPICard label="Clientes na Carteira" value={kpis.total.toLocaleString('pt-BR')} status="neutral" icon={<Users size={13}/>}/>
        <KPICard label="Ativos no App (30d)" value={`${kpis.pctAtivos30d.toFixed(1)}%`} status="success" icon={<Activity size={13}/>}/>
        <KPICard label="Nunca Acessaram o App" value={`${kpis.pctNuncaAcessou.toFixed(1)}%`} status="danger" icon={<LogIn size={13}/>}/>
        <KPICard label="Dias Ativos Médios (30d)" value={kpis.diasAtivosMedia.toFixed(1)} status="neutral"/>
      </div>

      <ChartCard title="Funil de Engajamento" subtitle="Distribuição dos clientes por nível de uso do app" height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funilData} layout="vertical" margin={{ top:0, right:60, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" horizontal={false}/>
            <XAxis type="number" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false}/>
            <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={190}/>
            <Tooltip contentStyle={TT} formatter={(v:unknown) => [Number(v).toLocaleString('pt-BR'), 'Clientes']}/>
            <Bar dataKey="value" radius={[0,3,3,0]}>
              {funilData.map((e, i) => <Cell key={i} fill={SEGMENTO_COR[e.name] ?? '#8062de'} />)}
              <LabelList dataKey="value" position="right" fill="#9991b8" style={{ fontSize:10 }}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>Detalhamento por Cliente</div>
      <DataTable columns={columns} data={filtradas} exportFilename="utilizacao-app" />
    </div>
  );
}
