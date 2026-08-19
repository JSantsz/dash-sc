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

// Paleta Bravo homologada (sem semânticas de verde/vermelho) — progressão
// Light-Pur → Amethyst → Viking → Jacarta, do menor pro maior engajamento.
const SEGMENTO_COR: Record<string, string> = {
  'Nunca acessou o app':                       '#aa97ef', // Light-Pur
  'Tem login, mas nunca usou o app':           '#aa6cc9', // Amethyst
  'Já usou o app, mas não nos últimos 30 dias':'#5ecada', // Viking
  'Ativo no app (últimos 30 dias)':            '#8062de', // Jacarta
};

// Converte a string vinda da planilha (timestamp do BigQuery) pra Date. Retorna
// null se vier vazio ou num formato que o JS não reconheça.
function parseDataSafe(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Considera "depósito recente" quando cai dentro dos últimos 30 dias — mesma
// janela usada no resto da página (login/cliques/dias ativos).
function depositoRecente(value: string): boolean {
  const d = parseDataSafe(value);
  if (!d) return false;
  const limite = new Date();
  limite.setDate(limite.getDate() - 30);
  return d >= limite;
}

function formatUltimoDeposito(value: string): string {
  const d = parseDataSafe(value);
  return d ? d.toLocaleDateString('pt-BR') : '—';
}

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
  { header: 'Último Depósito',        accessorKey: 'ultimoDeposito', cell: info => formatUltimoDeposito(info.getValue() as string) },
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
    const comLogin = filtradas.filter(r => r.temLogin === 'Sí').length;
    // Taxa de Utilização do App = clientes que já abriram o app pelo menos uma vez
    // (ativos nos últimos 30d + já usaram antes disso), sobre a carteira total —
    // mostra a usabilidade real do app, diferente do "Ativos no App (30d)" que só
    // olha uso recente.
    const jaUsouAlgumaVez = filtradas.filter(r =>
      r.segmentoEngajamento === 'Ativo no app (últimos 30 dias)' ||
      r.segmentoEngajamento === 'Já usou o app, mas não nos últimos 30 dias'
    ).length;
    const diasAtivosMedia = total > 0
      ? filtradas.reduce((acc, r) => acc + r.diasAtivosUltimos30d, 0) / total
      : 0;
    return {
      total,
      pctAtivos30d: total > 0 ? (ativos30d / total) * 100 : 0,
      pctNuncaAcessou: total > 0 ? (nuncaAcessou / total) * 100 : 0,
      pctComLogin: total > 0 ? (comLogin / total) * 100 : 0,
      pctUtilizacao: total > 0 ? (jaUsouAlgumaVez / total) * 100 : 0,
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

  // % de clientes com depósito nos últimos 30 dias, por segmento de engajamento —
  // usa a nova coluna "Último Depósito" vinda do BigQuery (campo last_deposit_date
  // de credit_repairs).
  const depositoData = useMemo(
    () => SEGMENTOS_ORDEM.map(segmento => {
      const doSegmento = filtradas.filter(r => r.segmentoEngajamento === segmento);
      const comDeposito = doSegmento.filter(r => depositoRecente(r.ultimoDeposito)).length;
      return {
        name: segmento,
        pct: doSegmento.length > 0 ? (comDeposito / doSegmento.length) * 100 : 0,
        comDeposito,
        total: doSegmento.length,
      };
    }),
    [filtradas]
  );

  // Ranking de funcionalidades mais usadas — conta, entre os clientes filtrados,
  // quantos têm cada funcionalidade como a mais usada no app (campo já vem
  // calculado do BigQuery via APPROX_TOP_COUNT por cliente). % é sobre o total de
  // clientes com alguma funcionalidade registrada (ou seja, que já usaram o app).
  const funcionalidadesRanking = useMemo(() => {
    const counts = new Map<string, number>();
    filtradas.forEach(r => {
      const f = (r.funcionalidadeMaisUsada || '').trim();
      if (!f) return;
      counts.set(f, (counts.get(f) ?? 0) + 1);
    });
    const totalComFuncionalidade = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    return Array.from(counts.entries())
      .map(([nome, qtd]) => ({ nome, qtd, pct: totalComFuncionalidade > 0 ? (qtd / totalComFuncionalidade) * 100 : 0 }))
      .sort((a, b) => b.qtd - a.qtd);
  }, [filtradas]);

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
        <KPICard label="Taxa de Utilização do App" value={`${kpis.pctUtilizacao.toFixed(1)}%`} status="success" icon={<Smartphone size={13}/>}/>
        <KPICard label="Com Login Habilitado" value={`${kpis.pctComLogin.toFixed(1)}%`} status="neutral" icon={<LogIn size={13}/>}/>
        <KPICard label="Ativos no App (30d)" value={`${kpis.pctAtivos30d.toFixed(1)}%`} status="success" icon={<Activity size={13}/>}/>
        <KPICard label="Nunca Acessaram o App" value={`${kpis.pctNuncaAcessou.toFixed(1)}%`} status="danger" icon={<LogIn size={13}/>}/>
        <KPICard label="Dias Ativos Médios (30d)" value={kpis.diasAtivosMedia.toFixed(1)} status="neutral"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <ChartCard title="Funil de Engajamento" subtitle="Distribuição dos clientes por nível de uso do app" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funilData} layout="vertical" margin={{ top:0, right:60, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" horizontal={false}/>
              <XAxis type="number" tick={{ fill:'#c8bff3', fontSize:10 }} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={190}/>
              <Tooltip contentStyle={TT} labelStyle={{ color:'#e8e4f0', fontWeight:700 }} itemStyle={{ color:'#c8bff3' }} formatter={(v:unknown) => {
                const value = Number(v);
                const pct = filtradas.length > 0 ? ((value / filtradas.length) * 100).toFixed(1) : '0';
                return [`${value.toLocaleString('pt-BR')} (${pct}%)`, 'Clientes'];
              }}/>
              <Bar dataKey="value" radius={[0,3,3,0]}>
                {funilData.map((e, i) => <Cell key={i} fill={SEGMENTO_COR[e.name] ?? '#8062de'} />)}
                <LabelList dataKey="value" position="right" fill="#c8bff3" style={{ fontSize:10 }}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="% com Depósito por Segmento" subtitle="Clientes com depósito nos últimos 30 dias, por nível de uso do app" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depositoData} layout="vertical" margin={{ top:0, right:60, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" horizontal={false}/>
              <XAxis type="number" tick={{ fill:'#c8bff3', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown) => `${v}%`}/>
              <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={190}/>
              <Tooltip contentStyle={TT} labelStyle={{ color:'#e8e4f0', fontWeight:700 }} itemStyle={{ color:'#c8bff3' }} formatter={(v:unknown, _name, props) => {
                const comDeposito = (props?.payload as { comDeposito?: number })?.comDeposito ?? 0;
                const total = (props?.payload as { total?: number })?.total ?? 0;
                return [`${Number(v).toFixed(1)}% (${comDeposito} de ${total})`, 'Com depósito'];
              }}/>
              <Bar dataKey="pct" radius={[0,3,3,0]}>
                {depositoData.map((e, i) => <Cell key={i} fill={SEGMENTO_COR[e.name] ?? '#8062de'} />)}
                <LabelList dataKey="pct" position="right" fill="#c8bff3" style={{ fontSize:10 }} formatter={(v:unknown) => `${Number(v).toFixed(1)}%`}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>Funcionalidades Mais Usadas</div>
        <div className="dash-card" style={{ padding:0, overflow:'hidden' }}>
          {funcionalidadesRanking.length === 0 ? (
            <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--d-text-dim)', fontSize:'0.82rem' }}>
              Nenhum cliente com uso do app registrado para este filtro.
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding:'8px 14px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--d-border)', whiteSpace:'nowrap' }}>Funcionalidade</th>
                  <th style={{ padding:'8px 14px', borderBottom:'1px solid var(--d-border)', width:'40%' }}/>
                  <th style={{ padding:'8px 14px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--d-border)', whiteSpace:'nowrap' }}>Clientes</th>
                  <th style={{ padding:'8px 14px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--d-border)', whiteSpace:'nowrap' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {funcionalidadesRanking.map((f, i) => (
                  <tr key={f.nome} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.12)' }}>
                    <td style={{ padding:'7px 14px', fontSize:'0.8rem', fontWeight:600, color:'var(--d-text)', borderBottom:'1px solid rgba(58,45,85,0.3)', whiteSpace:'nowrap' }}>{f.nome}</td>
                    <td style={{ padding:'7px 14px', borderBottom:'1px solid rgba(58,45,85,0.3)' }}>
                      <div style={{ background:'rgba(58,45,85,0.5)', borderRadius:4, height:7 }}>
                        <div style={{ width:`${f.pct}%`, height:'100%', borderRadius:4, background:'var(--d-accent)' }}/>
                      </div>
                    </td>
                    <td style={{ padding:'7px 14px', textAlign:'right', fontSize:'0.8rem', fontWeight:700, color:'var(--d-accent-light)', borderBottom:'1px solid rgba(58,45,85,0.3)' }}>{f.qtd.toLocaleString('pt-BR')}</td>
                    <td style={{ padding:'7px 14px', textAlign:'right', fontSize:'0.78rem', color:'var(--d-text-dim)', borderBottom:'1px solid rgba(58,45,85,0.3)' }}>{f.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>Detalhamento por Cliente</div>
      <DataTable columns={columns} data={filtradas} exportFilename="utilizacao-app" />
    </div>
  );
}
