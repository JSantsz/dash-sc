import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
export type KPIStatus = 'success' | 'warning' | 'danger' | 'neutral';
interface KPICardProps {
  label:string; value:string; subValue?:string; icon?:ReactNode; status?:KPIStatus;
  meta?:string; realizado?:string; trend?:number; progress?:number;
}
// Paleta Bravo homologada (sem verde/amarelo/vermelho) — Viking / Light-Pur / Amethyst / Lilás suave.
const statusColors: Record<KPIStatus,string> = { success:'#5ecada', warning:'#aa97ef', danger:'#aa6cc9', neutral:'#c8bff3' };
const statusBg: Record<KPIStatus,string> = { success:'rgba(94,202,218,0.12)', warning:'rgba(170,151,239,0.12)', danger:'rgba(170,108,201,0.12)', neutral:'rgba(200,191,243,0.12)' };
export function KPICard({ label, value, subValue, icon, status='neutral', meta, realizado, trend, progress }: KPICardProps) {
  const color = statusColors[status];
  const TrendIcon = trend===undefined ? Minus : trend>0 ? TrendingUp : TrendingDown;
  return (
    <div className="kpi-card" style={{ borderLeft:`3px solid ${color}`, display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span className="kpi-label" style={{ fontSize:'0.72rem' }}>{label}</span>
        {icon && <div style={{ background:statusBg[status], borderRadius:6, padding:'5px', display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
        <span className="kpi-value">{value}</span>
        {trend!==undefined && <span style={{ color, display:'flex', alignItems:'center', gap:2, fontSize:'0.72rem', marginBottom:2 }}><TrendIcon size={12} />{Math.abs(trend)}%</span>}
      </div>
      {subValue && <span style={{ color:'var(--d-text-muted)', fontSize:'0.72rem' }}>{subValue}</span>}
      {progress!==undefined && (
        <div>
          <div className="dash-progress-bg"><div className={`dash-progress-fill ${status}`} style={{ width:`${Math.min(progress,100)}%` }} /></div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:'0.65rem', color:'var(--d-text-dim)' }}>
            {meta && <span>Meta: {meta}</span>}
            {realizado && <span style={{ color }}>{realizado}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
