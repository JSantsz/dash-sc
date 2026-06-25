import { useState } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';

const DASHBOARD_UUID = 'c7c9d2f5-6dff-4d0c-8cc2-2d7181a03b12';
const BASE_URL = `https://metabase.resuelve.io/public/dashboard/${DASHBOARD_UUID}`;

const DATE_OPTIONS = [
  { label: 'Ontem',          value: 'past1days'  },
  { label: 'Últimos 7 dias', value: 'past7days'  },
  { label: 'Últimos 30 dias',value: 'past30days' },
  { label: 'Este mês',       value: 'thismonth'  },
  { label: 'Mês passado',    value: 'pastmonth'  },
];

const EXECUTIVO_OPTIONS = [
  'Geral',
  'dayane.dossantos',
  'emily.freitas',
  'flavia.freitas',
  'graziella.dovale',
  'jessica.pereira',
  'kerollyn.pereira',
  'maria.ferreira',
  'mirelle.nunes',
];

export default function AtendimentoSC() {
  const [dateRange,  setDateRange]  = useState('past1days');
  const [executivo,  setExecutivo]  = useState('Geral');
  const [darkMode,   setDarkMode]   = useState(true);
  const [key,        setKey]        = useState(0);

  const iframeUrl = BASE_URL;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'rgba(128,98,222,0.15)', borderRadius:8, padding:7, display:'flex', alignItems:'center', color:'var(--d-accent-light)' }}>
            <MessageSquare size={18}/>
          </div>
          <div>
            <h1 className="page-title">Dash Olimpo</h1>
            <p className="page-subtitle">Dashboard de atendimento Olimpo & Nexus — SLA e tempo de resposta</p>
          </div>
        </div>

        {/* Controles */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setDarkMode(d => !d)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, cursor:'pointer',
            border:'1px solid var(--d-border)', background: darkMode ? 'var(--d-accent-muted)' : 'var(--d-card)',
            color: darkMode ? 'var(--d-accent-light)' : 'var(--d-text-dim)', fontSize:'0.75rem', fontWeight:600,
          }}>
            {darkMode ? '🌙 Escuro' : '☀️ Claro'}
          </button>
          <button onClick={() => setKey(k => k+1)} style={{
            display:'flex', alignItems:'center', gap:5, background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)',
            color:'var(--d-accent-light)', borderRadius:8, padding:'6px 14px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer',
          }}>
            <RefreshCw size={13}/> Atualizar
          </button>
        </div>
      </div>

      {/* Iframe container */}
      <div style={{
        flex:1, borderRadius:12, overflow:'hidden',
        border:'1px solid var(--d-border)',
        boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
        background: darkMode ? '#1a1035' : '#f5f5f5',
        minHeight: 'calc(100vh - 160px)',
        position:'relative',
      }}>
        {/* Dark mode CSS trick via filter */}
        <style>{`
          .sc-iframe-wrap iframe {
            ${darkMode ? `
              filter: invert(1) hue-rotate(180deg) brightness(0.92) saturate(1.1);
            ` : ''}
            width: 100%;
            height: 100%;
            border: none;
            display: block;
          }
          /* Re-invert images/charts so they don't get inverted */
          .sc-iframe-wrap iframe img,
          .sc-iframe-wrap iframe svg image,
          .sc-iframe-wrap iframe canvas {
            ${darkMode ? 'filter: invert(1) hue-rotate(180deg);' : ''}
          }
        `}</style>

        <div className="sc-iframe-wrap" style={{ width:'100%', height:'100%', position:'relative' }}>
          <iframe
            key={key}
            src={iframeUrl}
            title="Dash Olimpo — Olimpo & Nexus"
            style={{ width:'100%', height:'100%', minHeight:'calc(100vh - 180px)', border:'none' }}
            allowFullScreen
          />
        </div>

        {/* Badge overlay */}
        <div style={{
          position:'absolute', bottom:12, right:12,
          background:'rgba(128,98,222,0.2)', border:'1px solid var(--d-accent)',
          borderRadius:6, padding:'3px 10px', fontSize:'0.65rem', fontWeight:600,
          color:'var(--d-accent-light)', backdropFilter:'blur(4px)', pointerEvents:'none',
        }}>
          via Metabase
        </div>
      </div>
    </div>
  );
}
