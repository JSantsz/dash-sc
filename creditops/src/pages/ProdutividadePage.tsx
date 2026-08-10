import { useMemo, useState } from 'react';
import { User, RefreshCw, AlertCircle, TrendingUp, Phone, DollarSign, Target } from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };
const HORAS = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h'];

function shortName(email: string) {
  return email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function KPIBlock({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="dash-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--d-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</span>
        {icon && <span style={{ color: color ?? 'var(--d-accent-light)', opacity: 0.7 }}>{icon}</span>}
      </div>
      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: color ?? 'var(--d-text)', lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: '0.7rem', color: 'var(--d-text-dim)' }}>{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--d-accent)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--d-text)' }}>{children}</span>
    </div>
  );
}

export default function ProdutividadePage() {
  const { data, loading, error, refresh } = useSheetData();
  const [selectedEmail, setSelectedEmail] = useState<string>('');

  const execRows = useMemo(() => data?.executivoRows ?? [], [data]);
  const ligacoes = useMemo(() => data?.ligacoes ?? [], [data]);

  // Operadores únicos
  const operadores = useMemo(() => {
    const map = new Map<string, string>();
    execRows.forEach(r => map.set(r.email, shortName(r.email)));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [execRows]);

  const emailFiltro = selectedEmail || operadores[0]?.[0] || '';
  const nomeOp = shortName(emailFiltro);

  // Linhas do executivo selecionado (pode ter múltiplas carteiras)
  const linhasOp = useMemo(() => execRows.filter(r => r.email === emailFiltro), [execRows, emailFiltro]);

  // Totais agregados por executivo
  const totais = useMemo(() => {
    if (linhasOp.length === 0) return null;
    return linhasOp.reduce((acc, r) => ({
      assignado:    acc.assignado    + r.assignado,
      completo:     acc.completo     + r.completo,
      parcial:      acc.parcial      + r.parcial,
      depositoTotal:acc.depositoTotal+ r.depositoTotal,
      wpp:          acc.wpp          + r.wpp,
      wppMeetTel:   acc.wppMeetTel   + r.wppMeetTel,
      montoBaixas:  acc.montoBaixas  + r.montoBaixas,
      atingimento:  acc.atingimento  + r.atingimento,
    }), { assignado:0, completo:0, parcial:0, depositoTotal:0, wpp:0, wppMeetTel:0, montoBaixas:0, atingimento:0 });
  }, [linhasOp]);

  const atingMedio   = linhasOp.length > 0 ? (totais?.atingimento ?? 0) / linhasOp.length : 0;
  const pctCompleto  = totais && totais.assignado > 0 ? (totais.completo / totais.assignado) * 100 : 0;
  const txConversao  = pctCompleto; // % do assignado que virou depósito completo

  // Dados de ligações do operador — última data disponível
  const datasLig = useMemo(() => {
    const set = new Set(ligacoes.filter(r => r.agent === emailFiltro).map(r => r.data));
    return Array.from(set).sort((a, b) => a.split('/').reverse().join('').localeCompare(b.split('/').reverse().join('')));
  }, [ligacoes, emailFiltro]);

  const [dataLig, setDataLig] = useState<string>('all');

  const datasExibidas = dataLig === 'all' ? datasLig : datasLig.filter(d => d === dataLig);
  // 'all' = mês inteiro, ou uma data específica

  const ligHoras = useMemo(() => {
    return HORAS.map(h => {
      const rows = ligacoes.filter(r =>
        r.agent === emailFiltro &&
        (dataLig === 'all' || r.data === dataLig) &&
        r.hora === h
      );
      return {
        hora: h,
        tentativas: rows.reduce((s, r) => s + r.tentativas, 0),
        efetivas:   rows.reduce((s, r) => s + r.efetivas, 0),
      };
    });
  }, [ligacoes, emailFiltro, dataLig]);
  const totalTent = ligHoras.reduce((s, r) => s + r.tentativas, 0);
  const totalEfet = ligHoras.reduce((s, r) => s + r.efetivas, 0);
  const txLig     = totalTent > 0 ? (totalEfet / totalTent) * 100 : 0;
  const horaPico  = ligHoras.reduce((best, r) => r.tentativas > best.tentativas ? r : best, ligHoras[0]);

  // Funil
  const funnelData = [
    { name: 'Assignado',  value: totais?.assignado    ?? 0, fill: '#8062de' },
    { name: 'Localizados',value: (totais?.wpp ?? 0) + (totais?.wppMeetTel ?? 0), fill: '#aa97ef' },
    { name: 'Depósitos',  value: totais?.completo     ?? 0, fill: '#5ecada' },
    { name: 'Promessas',  value: totais?.parcial      ?? 0, fill: '#aa6cc9' },
  ];

  // Comparativo por carteira
  const carteiraData = linhasOp.map(r => ({
    name:     r.carteira.length > 18 ? r.carteira.substring(0, 16) + '…' : r.carteira,
    completo: r.completo,
    parcial:  r.parcial,
    ating:    r.atingimento,
  }));

  if (loading) return (
    <div className="dash-loading">
      <RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (error) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}>
      <AlertCircle size={20}/>{error}
      <button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header + filtro */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'rgba(128,98,222,0.15)', borderRadius:8, padding:7, display:'flex', alignItems:'center', color:'var(--d-accent-light)' }}>
            <User size={18}/>
          </div>
          <div>
            <h1 className="page-title">Produtividade Individual</h1>
            <p className="page-subtitle">Visão consolidada por operador — ligações, depósitos e metas</p>
          </div>
        </div>

        {/* Seletor de operador */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:8, padding:'6px 14px' }}>
          <User size={14} style={{ color:'var(--d-text-dim)' }}/>
          <select value={emailFiltro} onChange={e => { setSelectedEmail(e.target.value); setDataLig('all'); }}
            style={{ background:'transparent', border:'none', outline:'none', color:'var(--d-text)', fontSize:'0.88rem', fontWeight:700, cursor:'pointer', padding:'0 4px', appearance:'auto' }}>
            {operadores.map(([email, nome]) => (
              <option key={email} value={email} style={{ background:'#201b36', color:'#e8e4f0' }}>{nome}</option>
            ))}
          </select>
        </div>
      </div>

      {totais && (
        <>
          {/* ── KPIs principais ── */}
          <div>
            <SectionTitle>Resultado Geral</SectionTitle>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10, marginTop:8 }}>
              <KPIBlock label="Total Assignado"  value={formatCurrency(totais.assignado,true)}    icon={<DollarSign size={14}/>} />
              <KPIBlock label="Dep. Completo"    value={formatCurrency(totais.completo,true)}     color="var(--d-success)" icon={<TrendingUp size={14}/>} />
              <KPIBlock label="Dep. Parcial"     value={formatCurrency(totais.parcial,true)}      color={totais.parcial>0?'var(--d-warning)':undefined} />
              <KPIBlock label="Dep. Total"       value={formatCurrency(totais.depositoTotal,true)} color="var(--d-accent-light)" icon={<DollarSign size={14}/>} />
              <KPIBlock label="% Completo"       value={`${pctCompleto.toFixed(1)}%`}             color={pctCompleto>=25?'var(--d-success)':pctCompleto>=15?'var(--d-warning)':'var(--d-danger)'} />
              <KPIBlock label="Atingimento Médio" value={`${atingMedio.toFixed(1)}%`}             color={atingMedio>=100?'var(--d-success)':atingMedio>=70?'var(--d-warning)':'var(--d-danger)'} icon={<Target size={14}/>}/>
              <KPIBlock label="Localizados"      value={formatNumber(totais.wpp+totais.wppMeetTel)} icon={<Phone size={14}/>} />
              <KPIBlock label="Tx. Conversão"    value={`${txConversao.toFixed(1)}%`}             color={txConversao>=25?'var(--d-success)':txConversao>=15?'var(--d-warning)':'var(--d-danger)'} sub="Completo / Assignado" />
            </div>
          </div>

          {/* ── Funil + Carteiras ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <SectionTitle>Funil Operacional</SectionTitle>
              <div className="dash-card" style={{ padding:'0.75rem 1rem', marginTop:8 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={funnelData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" vertical={false}/>
                    <XAxis dataKey="name" tick={{ fill:'#e8e4f0', fontSize:11, fontWeight:600 }} tickLine={false} axisLine={false}/>
                    <YAxis tick={{ fill:'#c4bedd', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>formatCurrency(Number(v),true)}/>
                    <Tooltip contentStyle={TT} labelStyle={{ color:'#e8e4f0', fontWeight:700 }} itemStyle={{ color:'#c4bedd' }} formatter={(v:unknown)=>[formatCurrency(Number(v),true),'']}/>
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {funnelData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <SectionTitle>Depósitos por Carteira</SectionTitle>
              <div className="dash-card" style={{ padding:'0.75rem 1rem', marginTop:8 }}>
                {carteiraData.length === 0 ? (
                  <div style={{ textAlign:'center', color:'var(--d-text-dim)', fontSize:'0.8rem', padding:'2rem 0' }}>Sem dados de carteira</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={carteiraData} margin={{ top:4, right:12, left:-10, bottom:40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" vertical={false}/>
                      <XAxis dataKey="name" tick={{ fill:'#c4bedd', fontSize:9 }} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={50}/>
                      <YAxis tick={{ fill:'#c4bedd', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>formatCurrency(Number(v),true)}/>
                      <Tooltip contentStyle={TT} formatter={(v:unknown,n:unknown)=>[formatCurrency(Number(v),true),String(n)]}/>
                      <Legend wrapperStyle={{ fontSize:11, color:'#9991b8' }}/>
                      <Bar dataKey="completo" name="Completo" fill="#5ecada" radius={[2,2,0,0]}/>
                      <Bar dataKey="parcial"  name="Parcial"  fill="#aa6cc9" radius={[2,2,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ── Tabela de carteiras ── */}
          <div>
            <SectionTitle>Detalhe por Carteira</SectionTitle>
            <div className="dash-card" style={{ overflow:'hidden', marginTop:8 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                <thead>
                  <tr style={{ background:'rgba(0,0,0,0.2)' }}>
                    {['Carteira','Assignado','Completo','Parcial','Dep. Total','% Completo','Atingimento','Meta'].map((h,i) => (
                      <th key={h} style={{ padding:'8px 12px', textAlign:i===0?'left':'right', fontSize:'0.68rem', fontWeight:700, color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--d-border)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhasOp.map((r, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid rgba(58,45,85,0.3)', background: i%2===0?'transparent':'rgba(0,0,0,0.08)' }}>
                      <td style={{ padding:'7px 12px', fontWeight:600 }}>
                        <span style={{ background:'var(--d-accent-muted)', color:'var(--d-accent-light)', borderRadius:4, padding:'2px 8px', fontSize:'0.72rem' }}>{r.carteira}</span>
                      </td>
                      <td style={{ padding:'7px 12px', textAlign:'right' }}>{formatCurrency(r.assignado,true)}</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', color:'var(--d-success)' }}>{formatCurrency(r.completo,true)}</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', color:r.parcial>0?'var(--d-warning)':'var(--d-text-dim)' }}>{formatCurrency(r.parcial,true)}</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700 }}>{formatCurrency(r.depositoTotal,true)}</td>
                      <td style={{ padding:'7px 12px', textAlign:'right' }}>{r.pctCompleto.toFixed(1)}%</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:r.atingimento>=100?'var(--d-success)':r.atingimento>=70?'var(--d-warning)':'var(--d-danger)' }}>{r.atingimento.toFixed(1)}%</td>
                      <td style={{ padding:'7px 12px', textAlign:'right', color:'var(--d-text-dim)' }}>{r.metaDeposito}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Ligações ── */}
          <div>
            <SectionTitle>Produtividade — Ligações</SectionTitle>

            {datasLig.length === 0 ? (
              <div className="dash-card" style={{ padding:'1.5rem', textAlign:'center', color:'var(--d-text-dim)', fontSize:'0.82rem', marginTop:8 }}>
                Nenhum dado de ligação encontrado para {nomeOp}.
              </div>
            ) : (
              <>
                {/* KPIs + filtro de dia */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, margin:'8px 0 12px', flexWrap:'wrap' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10, flex:1 }}>
                    <KPIBlock label="Tentativas"   value={String(totalTent)} color="var(--d-accent-light)" icon={<Phone size={14}/>}/>
                    <KPIBlock label="Efetivas"     value={String(totalEfet)} color="var(--d-success)"/>
                    <KPIBlock label="Taxa Conv."   value={`${txLig.toFixed(1)}%`} color={txLig>=50?'var(--d-success)':txLig>=30?'var(--d-warning)':'var(--d-danger)'}/>
                    <KPIBlock label="Hora de Pico" value={horaPico?.hora ?? '---'} sub={`${horaPico?.tentativas ?? 0} tent.`} color="var(--d-blue)"/>
                  </div>
                  {/* Filtro de dia */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:8, padding:'6px 12px', flexShrink:0 }}>
                    <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--d-text-dim)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>Dia</span>
                    <select value={dataLig} onChange={e => setDataLig(e.target.value)}
                      style={{ background:'transparent', border:'none', outline:'none', color:'var(--d-text)', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>
                      <option value="all" style={{ background:'#252257' }}>Todos</option>
                      {datasLig.map(d => <option key={d} value={d} style={{ background:'#252257' }}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {(['tentativas','efetivas'] as const).map(tipo => {
                  const accentColor = tipo === 'efetivas' ? 'var(--d-success)' : 'var(--d-accent)';
                  const titulo = tipo === 'tentativas' ? 'Tentativas de Ligação' : 'Ligações Efetivas';
                  return (
                    <div key={tipo} className="dash-card" style={{ overflow:'hidden', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.6rem 1rem', borderBottom:'1px solid var(--d-border)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:3, height:16, borderRadius:2, background:accentColor }}/>
                          <span style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--d-text)' }}>{titulo}</span>
                        </div>
                        <span style={{ fontSize:'0.7rem', color:accentColor, padding:'2px 10px', borderRadius:20, fontWeight:700, background:`color-mix(in srgb, ${accentColor} 12%, transparent)` }}>
                          {ligacoes.filter(r => r.agent === emailFiltro).reduce((s, r) => s + r[tipo], 0)} total
                        </span>
                      </div>
                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900, fontSize:'0.75rem' }}>
                          <thead>
                            <tr style={{ background:'rgba(0,0,0,0.2)' }}>
                              <th style={{ padding:'6px 12px', textAlign:'left', fontSize:'0.68rem', fontWeight:700, color:'var(--d-text-dim)', textTransform:'uppercase', borderBottom:'1px solid var(--d-border)', minWidth:110, whiteSpace:'nowrap' }}>Dia</th>
                              {HORAS.map(h => (
                                <th key={h} style={{ padding:'6px 8px', textAlign:'center', fontSize:'0.68rem', fontWeight:700, color:'var(--d-text-dim)', textTransform:'uppercase', borderBottom:'1px solid var(--d-border)', minWidth:44, whiteSpace:'nowrap' }}>{h}</th>
                              ))}
                              <th style={{ padding:'6px 10px', textAlign:'center', fontSize:'0.68rem', fontWeight:700, color:'var(--d-text)', textTransform:'uppercase', borderBottom:'1px solid var(--d-border)', minWidth:52, borderLeft:'1px solid var(--d-border)', whiteSpace:'nowrap' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datasExibidas.map((dia, i) => {
                              const total = HORAS.reduce((s, h) => {
                                const row = ligacoes.find(r => r.agent === emailFiltro && r.data === dia && r.hora === h);
                                return s + (row?.[tipo] ?? 0);
                              }, 0);
                              return (
                                <tr key={dia} style={{ background:i%2===0?'transparent':'rgba(0,0,0,0.1)', transition:'background 0.15s' }}
                                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(128,98,222,0.07)')}
                                  onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'transparent':'rgba(0,0,0,0.1)')}>
                                  <td style={{ padding:'5px 12px', fontWeight:600, color:'var(--d-text-dim)', borderBottom:'1px solid rgba(58,45,85,0.3)', whiteSpace:'nowrap' }}>{dia}</td>
                                  {HORAS.map(h => {
                                    const row = ligacoes.find(r => r.agent === emailFiltro && r.data === dia && r.hora === h);
                                    const val = row?.[tipo] ?? 0;
                                    return (
                                      <td key={h} style={{ padding:'5px 8px', textAlign:'center', borderBottom:'1px solid rgba(58,45,85,0.3)' }}>
                                        {val > 0 ? <span style={{ color:accentColor, fontWeight:600 }}>{val}</span> : <span style={{ color:'var(--d-text-dim)', opacity:0.3 }}>--</span>}
                                      </td>
                                    );
                                  })}
                                  <td style={{ padding:'5px 10px', textAlign:'center', fontWeight:700, color:total>0?accentColor:'var(--d-text-dim)', borderBottom:'1px solid rgba(58,45,85,0.3)', borderLeft:'1px solid var(--d-border)' }}>
                                    {total || '--'}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr style={{ background:'rgba(128,98,222,0.08)', borderTop:'2px solid var(--d-border)' }}>
                              <td style={{ padding:'6px 12px', fontWeight:800, fontSize:'0.72rem', textTransform:'uppercase', color:'var(--d-text)' }}>Total</td>
                              {HORAS.map(h => {
                                const val = datasExibidas.reduce((s, dia) => {
                                  const row = ligacoes.find(r => r.agent === emailFiltro && r.data === dia && r.hora === h);
                                  return s + (row?.[tipo] ?? 0);
                                }, 0);
                                return <td key={h} style={{ padding:'6px 8px', textAlign:'center', fontWeight:700 }}>{val > 0 ? <span style={{ color:accentColor }}>{val}</span> : <span style={{ color:'var(--d-text-dim)', opacity:0.3 }}>--</span>}</td>;
                              })}
                              <td style={{ padding:'6px 10px', textAlign:'center', fontWeight:800, color:accentColor, borderLeft:'1px solid var(--d-border)' }}>
                                {datasExibidas.reduce((s, dia) => s + HORAS.reduce((ss, h) => { const row = ligacoes.find(r => r.agent === emailFiltro && r.data === dia && r.hora === h); return ss + (row?.[tipo] ?? 0); }, 0), 0) || '--'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
