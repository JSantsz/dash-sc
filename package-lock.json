import { useMemo, useState } from 'react';
import { Phone, RefreshCw, AlertCircle } from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';

const HORAS = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h'];

function nomeAgente(email: string): string {
  return email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function CellValue({ val, tipo }: { val: number; tipo: 'tentativas' | 'efetivas' }) {
  if (val === 0) return <span style={{ color: 'var(--d-text-dim)', opacity: 0.3 }}>—</span>;
  const color = tipo === 'efetivas' ? 'var(--d-success)' : 'var(--d-accent-light)';
  return <span style={{ color, fontWeight: 600 }}>{val}</span>;
}

export default function LigacoesPage() {
  const { data, loading, error, refresh } = useSheetData();
  const ligacoes = data?.ligacoes ?? [];

  const datas = useMemo(() => {
    const set = new Set(ligacoes.map(r => r.data));
    return Array.from(set).sort((a, b) => {
      const parse = (d: string) => d.split('/').reverse().join('');
      return parse(b).localeCompare(parse(a));
    });
  }, [ligacoes]);

  const [dataSelecionada, setDataSelecionada] = useState<string>('');
  const dataFiltro = dataSelecionada || datas[0] || '';

  const agentes = useMemo(() => {
    const set = new Set(ligacoes.filter(r => r.data === dataFiltro).map(r => r.agent));
    return Array.from(set).sort();
  }, [ligacoes, dataFiltro]);

  const lookup = useMemo(() => {
    const map: Record<string, { tentativas: number; efetivas: number }> = {};
    ligacoes.filter(r => r.data === dataFiltro).forEach(r => {
      map[`${r.agent}|${r.hora}`] = { tentativas: r.tentativas, efetivas: r.efetivas };
    });
    return map;
  }, [ligacoes, dataFiltro]);

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
    const totalGeral = HORAS.reduce((acc, h) => acc + (totaisPorHora[h]?.[tipo] || 0), 0);

    return (
      <div className="dash-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
        {/* Cabeçalho da tabela */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 3, height: 18, borderRadius: 2,
              background: accentColor, flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--d-text)',
            }}>
              {titulo}
            </span>
          </div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: accentColor, background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            padding: '2px 10px', borderRadius: 20,
          }}>
            Total: {totalGeral}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th style={{
                  padding: '7px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700,
                  color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--d-border)', minWidth: 160, whiteSpace: 'nowrap',
                }}>
                  Executivo
                </th>
                {HORAS.map(h => (
                  <th key={h} style={{
                    padding: '7px 8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700,
                    color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--d-border)', minWidth: 48, whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
                <th style={{
                  padding: '7px 12px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700,
                  color: 'var(--d-text)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--d-border)', minWidth: 56, whiteSpace: 'nowrap',
                  borderLeft: '1px solid var(--d-border)',
                }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {agentes.map((agent, i) => {
                const total = HORAS.reduce((acc, h) => acc + (lookup[`${agent}|${h}`]?.[tipo] || 0), 0);
                return (
                  <tr
                    key={agent}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.12)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,98,222,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.12)')}
                  >
                    <td style={{
                      padding: '6px 14px', fontSize: '0.78rem', fontWeight: 500,
                      color: 'var(--d-text)', borderBottom: '1px solid rgba(58,45,85,0.3)',
                      whiteSpace: 'nowrap',
                    }}>
                      {nomeAgente(agent)}
                    </td>
                    {HORAS.map(h => {
                      const val = lookup[`${agent}|${h}`]?.[tipo] || 0;
                      return (
                        <td key={h} style={{
                          padding: '6px 8px', textAlign: 'center', fontSize: '0.78rem',
                          borderBottom: '1px solid rgba(58,45,85,0.3)',
                        }}>
                          <CellValue val={val} tipo={tipo} />
                        </td>
                      );
                    })}
                    <td style={{
                      padding: '6px 12px', textAlign: 'center', fontSize: '0.8rem',
                      fontWeight: 700, borderBottom: '1px solid rgba(58,45,85,0.3)',
                      borderLeft: '1px solid var(--d-border)',
                      color: total > 0 ? accentColor : 'var(--d-text-dim)',
                    }}>
                      {total || '—'}
                    </td>
                  </tr>
                );
              })}

              {/* Linha de totais */}
              <tr style={{ background: 'rgba(128,98,222,0.08)', borderTop: '2px solid var(--d-border)' }}>
                <td style={{
                  padding: '7px 14px', fontSize: '0.75rem', fontWeight: 800,
                  color: 'var(--d-text)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  Total
                </td>
                {HORAS.map(h => {
                  const val = totaisPorHora[h]?.[tipo] || 0;
                  return (
                    <td key={h} style={{ padding: '7px 8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                      <CellValue val={val} tipo={tipo} />
                    </td>
                  );
                })}
                <td style={{
                  padding: '7px 12px', textAlign: 'center', fontSize: '0.85rem',
                  fontWeight: 800, color: accentColor,
                  borderLeft: '1px solid var(--d-border)',
                }}>
                  {totalGeral || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'rgba(128,98,222,0.15)', borderRadius: 8, padding: 7,
            display: 'flex', alignItems: 'center', color: 'var(--d-accent-light)',
          }}>
            <Phone size={18} />
          </div>
          <div>
            <h1 className="page-title">Ligações</h1>
            <p className="page-subtitle">Tentativas e ligações efetivas por executivo e hora do dia</p>
          </div>
        </div>

        {/* Seletor de data destacado */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--d-card)', border: '1px solid var(--d-border)',
          borderRadius: 8, padding: '6px 12px',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            Data
          </span>
          <select
            value={dataFiltro}
            onChange={e => setDataSelecionada(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--d-text)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0 4px',
              appearance: 'auto',
            }}
          >
            {datas.map(d => (
              <option key={d} value={d} style={{ background: '#201b36', color: '#e8e4f0' }}>{d}</option>
            ))}
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
    </div>
  );
}
