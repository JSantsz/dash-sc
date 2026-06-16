import { useMemo, useState } from 'react';
import { Phone, RefreshCw, AlertCircle, X } from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';
import { useFilters } from '../context/FilterContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const HORAS = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h'];
const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

function nomeAgente(email: string): string {
  return email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function CellValue({ val, tipo }: { val: number; tipo: 'tentativas' | 'efetivas' }) {
  if (val === 0) return <span style={{ color: 'var(--d-text-dim)', opacity: 0.3 }}>—</span>;
  const color = tipo === 'efetivas' ? 'var(--d-success)' : 'var(--d-accent-light)';
  return <span style={{ color, fontWeight: 600 }}>{val}</span>;
}

function KPIStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--d-card)', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid var(--d-border)', flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: color ?? 'var(--d-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.68rem', color: 'var(--d-text-dim)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Modal de Produtividade ────────────────────────────────────────────────────
function ProdutividadeModal({
  agent, dataFiltro, lookup, agentes, totaisPorHora, onClose,
}: {
  agent: string;
  dataFiltro: string;
  lookup: Record<string, { tentativas: number; efetivas: number }>;
  agentes: string[];
  totaisPorHora: Record<string, { tentativas: number; efetivas: number }>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'individual' | 'equipe'>('individual');

  const totalTent   = HORAS.reduce((a, h) => a + (lookup[`${agent}|${h}`]?.tentativas || 0), 0);
  const totalEfet   = HORAS.reduce((a, h) => a + (lookup[`${agent}|${h}`]?.efetivas   || 0), 0);
  const txConv      = totalTent > 0 ? (totalEfet / totalTent) * 100 : 0;
  const horaPico    = HORAS.reduce((best, h) => {
    const v = lookup[`${agent}|${h}`]?.tentativas || 0;
    return v > (lookup[`${best}|${best}`]?.tentativas || 0) ? h : best;
  }, HORAS[0]);
  const horaPicoVal = Math.max(...HORAS.map(h => lookup[`${agent}|${h}`]?.tentativas || 0));

  // Dados por hora para o gráfico individual
  const horaData = HORAS.map(h => ({
    hora: h,
    tentativas: lookup[`${agent}|${h}`]?.tentativas || 0,
    efetivas:   lookup[`${agent}|${h}`]?.efetivas   || 0,
  }));

  // Médias da equipe por hora
  const mediaEquipe = HORAS.map(h => {
    const outros = agentes.filter(a => a !== agent);
    const avgTent = outros.length > 0 ? outros.reduce((s, a) => s + (lookup[`${a}|${h}`]?.tentativas || 0), 0) / outros.length : 0;
    const avgEfet = outros.length > 0 ? outros.reduce((s, a) => s + (lookup[`${a}|${h}`]?.efetivas   || 0), 0) / outros.length : 0;
    return { hora: h, agente: lookup[`${agent}|${h}`]?.tentativas || 0, media: parseFloat(avgTent.toFixed(1)), agenteEfet: lookup[`${agent}|${h}`]?.efetivas || 0, mediaEfet: parseFloat(avgEfet.toFixed(1)) };
  });

  // Comparativo geral vs equipe
  const mediaTentEquipe = agentes.filter(a => a !== agent).map(a => HORAS.reduce((s, h) => s + (lookup[`${a}|${h}`]?.tentativas || 0), 0));
  const mediaGeralTent  = mediaTentEquipe.length > 0 ? mediaTentEquipe.reduce((a, b) => a + b, 0) / mediaTentEquipe.length : 0;
  const mediaEfetEquipe = agentes.filter(a => a !== agent).map(a => HORAS.reduce((s, h) => s + (lookup[`${a}|${h}`]?.efetivas || 0), 0));
  const mediaGeralEfet  = mediaEfetEquipe.length > 0 ? mediaEfetEquipe.reduce((a, b) => a + b, 0) / mediaEfetEquipe.length : 0;
  const mediaConvEquipe = mediaGeralTent > 0 ? (mediaGeralEfet / mediaGeralTent) * 100 : 0;

  const ranking = [...agentes]
    .map(a => ({ agent: a, total: HORAS.reduce((s, h) => s + (lookup[`${a}|${h}`]?.tentativas || 0), 0) }))
    .sort((a, b) => b.total - a.total);
  const posicao = ranking.findIndex(r => r.agent === agent) + 1;

  const tabBtn = (key: 'individual' | 'equipe', label: string) => (
    <button onClick={() => setTab(key)} style={{
      padding: '6px 18px', fontSize: '0.78rem', fontWeight: 700, borderRadius: 6, cursor: 'pointer',
      border: '1px solid', transition: 'all 0.15s',
      borderColor: tab === key ? 'var(--d-accent)' : 'var(--d-border)',
      background:  tab === key ? 'var(--d-accent)' : 'transparent',
      color:       tab === key ? '#fff' : 'var(--d-text-dim)',
    }}>{label}</button>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--d-surface)', borderRadius: 14, border: '1px solid var(--d-border)',
        width: '100%', maxWidth: 780, maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(128,98,222,0.15)', borderRadius: 8, padding: 7, color: 'var(--d-accent-light)', display: 'flex' }}>
              <Phone size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--d-text)' }}>{nomeAgente(agent)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-dim)' }}>{dataFiltro} · Análise de Produtividade</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {tabBtn('individual', 'Individual')}
              {tabBtn('equipe', 'vs. Equipe')}
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--d-text-dim)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'individual' ? (
            <>
              {/* KPIs individuais */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <KPIStat label="Total Tentativas" value={String(totalTent)} color="var(--d-accent-light)" />
                <KPIStat label="Ligações Efetivas" value={String(totalEfet)} color="var(--d-success)" />
                <KPIStat label="Taxa Conversão" value={`${txConv.toFixed(1)}%`} color={txConv >= 50 ? 'var(--d-success)' : txConv >= 30 ? 'var(--d-warning)' : 'var(--d-danger)'} />
                <KPIStat label="Hora de Pico" value={horaPico} sub={`${horaPicoVal} tentativas`} color="var(--d-blue)" />
                <KPIStat label="Ranking" value={`#${posicao}`} sub={`de ${agentes.length} agentes`} color={posicao <= 3 ? '#eab308' : 'var(--d-text)'} />
              </div>

              {/* Gráfico evolução por hora */}
              <div className="dash-card" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-dim)', marginBottom: 10 }}>
                  Evolução por Hora
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={horaData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" vertical={false} />
                    <XAxis dataKey="hora" tick={{ fill: '#9991b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#9991b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TT} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9991b8' }} />
                    <Bar dataKey="tentativas" name="Tentativas" fill="#8062de" radius={[2,2,0,0]}>
                      {horaData.map((d, i) => <Cell key={i} fill={d.tentativas === horaPicoVal && horaPicoVal > 0 ? '#aa6cc9' : '#8062de'} />)}
                    </Bar>
                    <Bar dataKey="efetivas" name="Efetivas" fill="#22c55e" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              {/* KPIs comparativos */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <KPIStat label="Tentativas (agente)" value={String(totalTent)} color="var(--d-accent-light)" />
                <KPIStat label="Média da Equipe" value={mediaGeralTent.toFixed(0)} color="var(--d-text-dim)" />
                <KPIStat label="Efetivas (agente)" value={String(totalEfet)} color="var(--d-success)" />
                <KPIStat label="Média Efetivas" value={mediaGeralEfet.toFixed(0)} color="var(--d-text-dim)" />
                <KPIStat
                  label="Conv. vs Equipe"
                  value={`${(txConv - mediaConvEquipe).toFixed(1)}%`}
                  sub={`Equipe: ${mediaConvEquipe.toFixed(1)}%`}
                  color={txConv >= mediaConvEquipe ? 'var(--d-success)' : 'var(--d-danger)'}
                />
              </div>

              {/* Gráfico comparativo por hora */}
              <div className="dash-card" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-dim)', marginBottom: 10 }}>
                  Tentativas: Agente vs Média da Equipe
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mediaEquipe} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" vertical={false} />
                    <XAxis dataKey="hora" tick={{ fill: '#9991b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#9991b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TT} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9991b8' }} />
                    <Bar dataKey="agente" name={nomeAgente(agent)} fill="#8062de" radius={[2,2,0,0]} />
                    <Bar dataKey="media"  name="Média Equipe"       fill="#3a2d55" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Ranking geral */}
              <div className="dash-card" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-dim)', marginBottom: 10 }}>
                  Ranking Geral — Tentativas
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ranking.map((r, i) => {
                    const isAgent = r.agent === agent;
                    const pct = ranking[0].total > 0 ? (r.total / ranking[0].total) * 100 : 0;
                    return (
                      <div key={r.agent} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 20, textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: i < 3 ? '#eab308' : 'var(--d-text-dim)', flexShrink: 0 }}>#{i+1}</span>
                        <span style={{ fontSize: '0.78rem', width: 130, flexShrink: 0, fontWeight: isAgent ? 700 : 400, color: isAgent ? 'var(--d-accent-light)' : 'var(--d-text)' }}>{nomeAgente(r.agent)}</span>
                        <div style={{ flex: 1, background: 'rgba(58,45,85,0.5)', borderRadius: 4, height: 8 }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: isAgent ? 'var(--d-accent)' : 'rgba(128,98,222,0.4)', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: isAgent ? 700 : 400, color: isAgent ? 'var(--d-accent-light)' : 'var(--d-text-dim)', width: 32, textAlign: 'right', flexShrink: 0 }}>{r.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function LigacoesPage() {
  const { data, loading, error, refresh } = useSheetData();
  const { filters } = useFilters();
  const ligacoes = data?.ligacoes ?? [];
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const datas = useMemo(() => {
    const set = new Set(ligacoes.map(r => r.data));
    return Array.from(set).sort((a, b) => {
      const parse = (d: string) => d.split('/').reverse().join('');
      return parse(a).localeCompare(parse(b)); // crescente
    });
  }, [ligacoes]);

  const [dataSelecionada, setDataSelecionada] = useState<string>('');
  const dataFiltro = dataSelecionada || datas[datas.length - 1] || '';
  const viewMes    = false;

  const agentes = useMemo(() => {
    const set = new Set(ligacoes.filter(r => viewMes || r.data === dataFiltro).map(r => r.agent));
    let list = Array.from(set).sort();
    if (filters.operador !== 'all') list = list.filter(a => a === filters.operador);
    return list;
  }, [ligacoes, dataFiltro, viewMes, filters.operador]);

  const lookup = useMemo(() => {
    const map: Record<string, { tentativas: number; efetivas: number }> = {};
    ligacoes.filter(r => viewMes || r.data === dataFiltro).forEach(r => {
      const key = `${r.agent}|${r.hora}`;
      if (!map[key]) map[key] = { tentativas: 0, efetivas: 0 };
      map[key].tentativas += r.tentativas;
      map[key].efetivas   += r.efetivas;
    });
    return map;
  }, [ligacoes, dataFiltro, viewMes]);

  const totaisPorHora = useMemo(() => {
    const t: Record<string, { tentativas: number; efetivas: number }> = {};
    HORAS.forEach(h => {
      t[h] = agentes.reduce(
        (acc, agent) => ({
          tentativas: acc.tentativas + (lookup[`${agent}|${h}`]?.tentativas || 0),
          efetivas:   acc.efetivas   + (lookup[`${agent}|${h}`]?.efetivas   || 0),
        }),
        { tentativas: 0, efetivas: 0 }
      );
    });
    return t;
  }, [agentes, lookup]);

  if (loading) return (
    <div className="dash-loading">
      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--d-accent)' }} />
      &nbsp;Carregando...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (error) return (
    <div className="dash-loading" style={{ flexDirection: 'column', gap: 8, color: 'var(--d-danger)' }}>
      <AlertCircle size={20} />{error}
      <button onClick={refresh} style={{ background: 'var(--d-accent-muted)', border: '1px solid var(--d-accent)', color: 'var(--d-accent-light)', borderRadius: 6, padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.78rem' }}>
        Tentar novamente
      </button>
    </div>
  );

  const TabelaLigacoes = ({ tipo, titulo }: { tipo: 'tentativas' | 'efetivas'; titulo: string }) => {
    const accentColor = tipo === 'efetivas' ? 'var(--d-success)' : 'var(--d-accent)';
    const totalGeral  = HORAS.reduce((acc, h) => acc + (totaisPorHora[h]?.[tipo] || 0), 0);
    return (
      <div className="dash-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--d-text)' }}>{titulo}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--d-text-dim)' }}>Clique no nome para análise detalhada</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accentColor, background: `color-mix(in srgb, ${accentColor} 12%, transparent)`, padding: '2px 10px', borderRadius: 20 }}>
              Total: {totalGeral}
            </span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '7px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--d-border)', minWidth: 160, whiteSpace: 'nowrap' }}>Executivo</th>
                {HORAS.map(h => (
                  <th key={h} style={{ padding: '7px 8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--d-border)', minWidth: 48, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--d-text)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--d-border)', minWidth: 56, whiteSpace: 'nowrap', borderLeft: '1px solid var(--d-border)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {agentes.map((agent, i) => {
                const total = HORAS.reduce((acc, h) => acc + (lookup[`${agent}|${h}`]?.[tipo] || 0), 0);
                return (
                  <tr key={agent} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.12)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,98,222,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.12)')}>
                    <td style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--d-accent-light)', borderBottom: '1px solid rgba(58,45,85,0.3)', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(128,98,222,0.4)' }}
                      onClick={() => setSelectedAgent(agent)}>
                      {nomeAgente(agent)}
                    </td>
                    {HORAS.map(h => {
                      const val = lookup[`${agent}|${h}`]?.[tipo] || 0;
                      return (
                        <td key={h} style={{ padding: '6px 8px', textAlign: 'center', fontSize: '0.78rem', borderBottom: '1px solid rgba(58,45,85,0.3)' }}>
                          <CellValue val={val} tipo={tipo} />
                        </td>
                      );
                    })}
                    <td style={{ padding: '6px 12px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(58,45,85,0.3)', borderLeft: '1px solid var(--d-border)', color: total > 0 ? accentColor : 'var(--d-text-dim)' }}>
                      {total || '—'}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: 'rgba(128,98,222,0.08)', borderTop: '2px solid var(--d-border)' }}>
                <td style={{ padding: '7px 14px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--d-text)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Total</td>
                {HORAS.map(h => {
                  const val = totaisPorHora[h]?.[tipo] || 0;
                  return <td key={h} style={{ padding: '7px 8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700 }}><CellValue val={val} tipo={tipo} /></td>;
                })}
                <td style={{ padding: '7px 12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: accentColor, borderLeft: '1px solid var(--d-border)' }}>{totalGeral || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'rgba(128,98,222,0.15)', borderRadius: 8, padding: 7, display: 'flex', alignItems: 'center', color: 'var(--d-accent-light)' }}>
            <Phone size={18} />
          </div>
          <div>
            <h1 className="page-title">Ligações</h1>
            <p className="page-subtitle">Tentativas e ligações efetivas por executivo e hora do dia</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--d-card)', border: '1px solid var(--d-border)', borderRadius: 8, padding: '6px 12px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Data</span>
          <select value={dataSelecionada || dataFiltro} onChange={e => setDataSelecionada(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--d-text)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: '0 4px', appearance: 'auto' }}>
            {datas.map(d => <option key={d} value={d} style={{ background: '#201b36', color: '#e8e4f0' }}>{d}</option>)}
          </select>
        </div>
      </div>

      {agentes.length === 0 ? (
        <div className="dash-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--d-text-dim)', fontSize: '0.85rem' }}>
          Nenhum dado de ligação para a data selecionada.
        </div>
      ) : (
        <>
          <TabelaLigacoes tipo="tentativas" titulo="Tentativa de Ligação" />
          <TabelaLigacoes tipo="efetivas"   titulo="Ligação Efetiva" />
        </>
      )}

      {selectedAgent && (
        <ProdutividadeModal
          agent={selectedAgent}
          dataFiltro={dataFiltro}
          lookup={lookup}
          agentes={agentes}
          totaisPorHora={totaisPorHora}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
