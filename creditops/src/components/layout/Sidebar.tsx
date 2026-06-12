import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ChevronDown, ChevronRight, Inbox, Building2, CreditCard, Award, TrendingDown, Phone, BarChart2 } from 'lucide-react';
interface NavLeaf { label:string; to:string; }
const RESUMO_SUBGROUPS = [
  { label:'Carteira Primária',   icon:<CreditCard size={13}/>, children:[{label:'Localizados',to:'/resumo/primaria/localizados'},{label:'Promessas',to:'/resumo/primaria/promessas'},{label:'Depósitos',to:'/resumo/primaria/depositos'}] },
  { label:'Carteira Secundária', icon:<Building2 size={13}/>,  children:[{label:'Localizados',to:'/resumo/secundaria/localizados'},{label:'Promessas',to:'/resumo/secundaria/promessas'},{label:'Depósitos',to:'/resumo/secundaria/depositos'}] },
];
function SubGroup({ label, icon, items, initialOpen=false }: { label:string; icon:ReactNode; items:NavLeaf[]; initialOpen?:boolean }) {
  const location = useLocation();
  const isActive = items.some(c=>location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(initialOpen||isActive);
  return (
    <div>
      <button className={`nav-item ${isActive?'active':''}`} onClick={()=>setOpen(o=>!o)} style={{ paddingLeft:28, gap:6, justifyContent:'space-between' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ color:isActive?'var(--d-accent-light)':'var(--d-text-dim)' }}>{icon}</span>{label}</span>
        {open?<ChevronDown size={12}/>:<ChevronRight size={12}/>}
      </button>
      {open&&<div style={{ paddingLeft:14 }}>{items.map(c=><NavLink key={c.to} to={c.to} className={({isActive:a})=>`nav-item${a?' active':''}`}><span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', opacity:0.6, flexShrink:0 }}/>{c.label}</NavLink>)}</div>}
    </div>
  );
}
export function Sidebar() {
  const location = useLocation();
  const resumoActive = location.pathname.startsWith('/resumo');
  const [resumoOpen, setResumoOpen] = useState(resumoActive);
  return (
    <nav className="dash-sidebar">
      <div style={{ padding:'1rem 1rem 0.75rem', borderBottom:'1px solid var(--d-border)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#8062de,#21ade0)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <LayoutDashboard size={16} color="#fff"/>
        </div>
        <div>
          <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--d-text)' }}>Gerencial</div>
          <div style={{ fontSize:'0.65rem', color:'var(--d-text-dim)' }}>Serviço ao Cliente</div>
        </div>
      </div>
      <div style={{ padding:'0.5rem 0.5rem', flex:1 }}>
        <div className="nav-section-label" style={{ marginTop:4 }}>Menu Principal</div>
        <NavLink to="/" end className={({isActive:a})=>`nav-item top-level${a?' active':''}`}><LayoutDashboard size={15}/>Visão Geral</NavLink>
        <button className={`nav-item top-level${resumoActive?' active':''}`} onClick={()=>setResumoOpen(o=>!o)} style={{ justifyContent:'space-between' }}>
          <span style={{ display:'flex', alignItems:'center', gap:8 }}><Inbox size={15}/>Resumo Depósitos</span>
          {resumoOpen?<ChevronDown size={13}/>:<ChevronRight size={13}/>}
        </button>
        {resumoOpen&&<div style={{ marginLeft:8 }}>{RESUMO_SUBGROUPS.map(sg=><SubGroup key={sg.label} label={sg.label} icon={sg.icon} items={sg.children}/>)}</div>}
        <div className="dash-divider" style={{ margin:'0.5rem 0.25rem' }}/>
        <NavLink to="/operadores" className={({isActive:a})=>`nav-item top-level${a?' active':''}`}><Users size={15}/>Operadores</NavLink>
        <div className="dash-divider" style={{ margin:'0.5rem 0.25rem' }}/>
        <NavLink to="/resumo-executivo" className={({isActive:a})=>`nav-item top-level${a?' active':''}`}><Award size={15}/>Resumo Executivo</NavLink>
        <div className="dash-divider" style={{ margin:'0.5rem 0.25rem' }}/>
        <NavLink to="/resumo-baixas" className={({isActive:a})=>`nav-item top-level${a?' active':''}`}><TrendingDown size={15}/>Resumo Baixas</NavLink>
        <div className="dash-divider" style={{ margin:'0.5rem 0.25rem' }}/>
        <NavLink to="/ligacoes" className={({isActive:a})=>`nav-item top-level${a?' active':''}`}><Phone size={15}/>Ligações</NavLink>
        <NavLink to="/produtividade" className={({isActive:a})=>`nav-item top-level${a?' active':''}`}><BarChart2 size={15}/>Produtividade</NavLink>
      </div>
      <div style={{ borderTop:'1px solid var(--d-border)', padding:'0.75rem 1rem', fontSize:'0.65rem', color:'var(--d-text-dim)', textAlign:'center' }}>v1.0 · Serviço ao Cliente</div>
    </nav>
  );
}
