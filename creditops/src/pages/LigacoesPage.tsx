import { useMemo, useState } from 'react';
import { useSheetData } from '../hooks/useSheetData';

const HORAS = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h'];

const thStyle = (align: 'left' | 'center'): React.CSSProperties => ({
  padding: '6px 10px',
  textAlign: align,
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'var(--d-text-dim)',
  background: 'var(--d-bg)',
  borderBottom: '1px solid var(--d-border)',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

const tdStyle = (align: 'left' | 'center'): React.CSSProperties => ({
  padding: '5px 10px',
  textAlign: align,
  fontSize: '0.78rem',
  color: 'var(--d-text)',
  borderBottom: '1px solid var(--d-border)',
  whiteSpace: 'nowrap',
});

function nomeAgente(email: string): string {
  return email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function CellValue({ val, tipo }: { val: number; tipo: 'tentativas' | 'efetivas' }) {
  if (val === 0) return <span style={{ color: 'var(--d-text-dim)', opacity: 0.4 }}>—</span>;
  const color = tipo === 'efetivas' ? 'var(--success)' : 'var(--accent)';
  return <span style={{ color, fontWeight: 600 }}>{val}</span>;
}

export default function LigacoesPage() {
  const { data, loading, error } = useSheetData();
  const ligacoes = data?.ligacoes ?? [];

  // Datas disponíveis ordenadas desc
  const datas = useMemo(() => {
    const set = new Set(ligacoes.map(r => r.data));
    return Array.from(set).sort((a, b) => {
      const parse = (d: string) => d.split('/').reverse().join('');
      return parse(b).localeCompare(parse(a));
    });
  }, [ligacoes]);

  const [dataSelecionada, setDataSelecionada] = useState<string>('');
  const dataFiltro = dataSelecionada || datas[0] || '';

  // Agentes únicos do dia filtrado
  const agentes = useMemo(() => {
    const set = new Set(
      ligacoes.filter(r => r.data === dataFiltro).map(r => r.agent)
    );
    return Array.from(set).sort();
  }, [ligacoes, dataFiltro]);

  // Lookup rápido agent+hora → valores
  const lookup = useMemo(() => {
    const map: Record<string, { tentativas: number; efetivas: number }> = {};
    ligacoes
      .filter(r => r.data === dataFiltro)
      .forEach(r => {
        map[`${r.agent}|${r.hora}`] = { tentativas: r.tentativas, efetivas: r.efetivas };
      });
    return map;
  }, [ligacoes, dataFiltro]);

  // Total por hora (para linha de rodapé)
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
    <div className="dash-main">
      <p style={{ color: 'var(--d-text-dim)', padding: '2rem' }}>Carregando...</p>
    </div>
  );
  if (error) return (
    <div className="dash-main">
      <p style={{ color: 'var(--danger)', padding: '2rem' }}>{error}</p>
    </div>
  );

  const TabelaLigacoes = ({ tipo, titulo }: { tipo: 'tentativas' | 'efetivas'; titulo: string }) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{
        fontSize: '0.85rem', fontWeight: 700, color: 'var(--d-text)',
        marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
        borderLeft: `3px solid ${tipo === 'efetivas' ? 'var(--success)' : 'var(--accent)'}`,
        paddingLeft: '0.6rem',
      }}>
        {titulo}
      </h3>
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--d-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle('left'), minWidth: 160 }}>EXECUTIVO</th>
              {HORAS.map(h => <th key={h} style={{ ...thStyle('center'), minWidth: 52 }}>{h}</th>)}
              <th style={{ ...thStyle('center'), minWidth: 60, color: 'var(--d-text)' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {agentes.map((agent, i) => {
              const total = HORAS.reduce((acc, h) => acc + (lookup[`${agent}|${h}`]?.[tipo] || 0), 0);
              return (
                <tr key={agent} style={{ background: i % 2 === 0 ? 'var(--card)' : 'var(--surface)' }}>
                  <td style={{ ...tdStyle('left'), fontWeight: 500 }}>{nomeAgente(agent)}</td>
                  {HORAS.map(h => {
                    const val = lookup[`${agent}|${h}`]?.[tipo] || 0;
                    return (
                      <td key={h} style={tdStyle('center')}>
                        <CellValue val={val} tipo={tipo} />
                      </td>
                    );
                  })}
                  <td style={{
                    ...tdStyle('center'),
                    fontWeight: 700,
                    color: total > 0
                      ? (tipo === 'efetivas' ? 'var(--success)' : 'var(--accent)')
                      : 'var(--d-text-dim)',
                  }}>
                    {total || '—'}
                  </td>
                </tr>
              );
            })}
            {/* Linha total */}
            <tr style={{ background: 'var(--d-bg)', borderTop: '2px solid var(--d-border)' }}>
              <td style={{ ...tdStyle('left'), fontWeight: 700, color: 'var(--d-text)' }}>TOTAL</td>
              {HORAS.map(h => {
                const val = totaisPorHora[h]?.[tipo] || 0;
                return (
                  <td key={h} style={{ ...tdStyle('center'), fontWeight: 700 }}>
                    <CellValue val={val} tipo={tipo} />
                  </td>
                );
              })}
              <td style={{
                ...tdStyle('center'), fontWeight: 800,
                color: tipo === 'efetivas' ? 'var(--success)' : 'var(--accent)',
              }}>
                {HORAS.reduce((acc, h) => acc + (totaisPorHora[h]?.[tipo] || 0), 0) || '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="dash-main">
      {/* Header da página */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>
            Tentativas de Ligação
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-dim)', margin: '2px 0 0' }}>
            Ligações por executivo e hora do dia
          </p>
        </div>

        {/* Seletor de data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--d-text-dim)', whiteSpace: 'nowrap' }}>
            Data:
          </label>
          <select
            value={dataFiltro}
            onChange={e => setDataSelecionada(e.target.value)}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--d-border)',
              borderRadius: 6,
              color: 'var(--d-text)',
              padding: '4px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {datas.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {agentes.length === 0 ? (
        <div style={{
          background: 'var(--card)', borderRadius: 10, padding: '2rem',
          textAlign: 'center', color: 'var(--d-text-dim)', fontSize: '0.85rem',
        }}>
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
