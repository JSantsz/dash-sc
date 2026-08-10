import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
export type KPIStatus = 'success' | 'warning' | 'danger' | 'neutral';
interface KPICardProps {
  label:string; value:string; subValue?:string; icon?:ReactNode; status?:KPIStatus;
  meta?:string; realizado?:string; trend?:number; progress?:number;
}
const statusColors: Record<KPIStatus,string> = { success:'#22c55e', warning:'#eab308', danger:'#ef4444', neutral:'#9991b8' };
const statusBg: Record<KPIStatus,string> = { success:'rgba(34,197,94,0.12)', warning:'rgba(234,179,8,0.12)', danger:'rgba(239,68,68,0.12)', neutral:'rgba(153,145,184,0.12)' };
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
