import { TrendingDown, BarChart2, DollarSign, CheckCircle, AlertTriangle, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../lib/shadcn/tabs';
import { KPICard } from '../components/shared/KPICard';
import { OperationalTable } from '../components/shared/OperationalTable';
import { ChartCard } from '../components/charts/Charts';
import { useSheetData, BaixasRow } from '../hooks/useSheetData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import type { OpTable } from '../utils/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const TT = { background:'#201b36', border:'1px solid #3a2d55', borderRadius:6, fontSize:12, color:'#e8e4f0' };

function toBaixasOpTable(title: string, rows: BaixasRow[], currency: boolean, hasRep: boolean): OpTable {
  const COLS = ['Assignado','Solicitados','Confirmado','Retido','Pendente','Baixa Prevista','% Baixas','% Retido'];
  if (hasRep) COLS.push('Rep.');
  const fmt = (v: number) => currency ? formatCurrency(v, true) : formatNumber(Math.round(v));
  return {
    title, columns: COLS,
    rows: rows.map(r => ({
      label: r.label,
      type: r.isTotal ? 'total' : 'data',
      values: [
        fmt(r.assignado), fmt(r.solicitados), fmt(r.confirmado), fmt(r.retido),
        fmt(r.pendente), fmt(r.baixaPrevista),
        `${r.pctBaixas.toFixed(1)}%`, `${r.pctRetido.toFixed(1)}%`,
        ...(hasRep ? [r.rep !== undefined ? `${r.rep.toFixed(1)}%` : '—'] : []),
      ],
    })),
  };
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid rgba(58,45,85,0.3)' }}>
      <span style={{ fontSize:'0.75rem', color:'var(--d-text-muted)' }}>{label}</span>
      <span style={{ fontSize:'0.82rem', fontWeight:700, color: accent ? 'var(--d-accent-light)' : 'var(--d-text)' }}>{value}</span>
    </div>
  );
}

function ReativCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dash-card" style={{ padding:'0.9rem 1rem' }}>
      <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--d-accent-light)', marginBottom:10 }}>{label}</div>
      {children}
    </div>
  );
}

export default function ResumoBaixas() {
  const { data, loading, error, refresh } = useSheetData();

  if (loading) return <div className="dash-loading"><RefreshCw size={20} style={{ animation:'spin 1s linear infinite', color:'var(--d-accent)' }}/>&nbsp;Carregando...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
  if (error) return (
    <div className="dash-loading" style={{ flexDirection:'column', gap:8, color:'var(--d-danger)' }}>
      <AlertCircle size={20}/>{error}
      <button onClick={refresh} style={{ background:'var(--d-accent-muted)', border:'1px solid var(--d-accent)', color:'var(--d-accent-light)', borderRadius:6, padding:'0.3rem 0.8rem', cursor:'pointer', fontSize:'0.78rem' }}>Tentar novamente</button>
    </div>
  );

  const { baixasPrimClientes, baixasPrimDivida, baixasSecClientes, baixasSecDivida } = data!;

  const totalC = baixasPrimClientes.find(r => r.isTotal);
  const totalD = baixasPrimDivida.find(r => r.isTotal);

  const tblPC = toBaixasOpTable('Clientes',    baixasPrimClientes, false, false);
  const tblPD = toBaixasOpTable('Dívida (R$)', baixasPrimDivida,   true,  false);
  const tblSC = toBaixasOpTable('Clientes',    baixasSecClientes,  false, true);
  const tblSD = toBaixasOpTable('Dívida (R$)', baixasSecDivida,    true,  true);

  // Dados para gráficos — exclui total e 2xC
  const semTotal = baixasPrimClientes.filter(r => !r.isTotal && r.label !== '2xC');
  const pctBaixasChart = semTotal.map(r => ({ name: r.label, value: r.pctBaixas }));
  const pctRetidoChart = semTotal.map(r => ({ name: r.label, value: r.pctRetido }));
  const confRetChart   = semTotal.map(r => ({ name: r.label, conf: r.confirmado, ret: r.retido }));
  const dividaChart    = baixasPrimDivida.filter(r => !r.isTotal && r.label !== '2xC').map(r => ({ name: r.label, confirmado: r.confirmado, retido: r.retido }));

  // Rankings
  const rankMaiorPct    = [...baixasPrimClientes.filter(r => !r.isTotal)].sort((a,b) => b.pctBaixas - a.pctBaixas).map(r => ({ name: r.label, value: r.pctBaixas }));
  const rankMenorRetenc = [...baixasPrimClientes.filter(r => !r.isTotal)].sort((a,b) => a.pctRetido - b.pctRetido).map(r => ({ name: r.label, value: r.pctRetido }));
  const rankMaiorConf   = [...baixasPrimDivida.filter(r => !r.isTotal)].sort((a,b) => b.confirmado - a.confirmado).map(r => ({ name: r.label, value: r.confirmado }));
  const rankMaiorBaixa  = [...baixasPrimDivida.filter(r => !r.isTotal)].sort((a,b) => b.baixaPrevista - a.baixaPrevista).map(r => ({ name: r.label, value: r.baixaPrevista }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ background:'rgba(239,68,68,0.12)', borderRadius:8, padding:'7px', display:'flex', alignItems:'center', color:'var(--d-danger)' }}><TrendingDown size={18}/></div>
        <div><h1 className="page-title">Resumo Baixas</h1><p className="page-subtitle">Esteira: Assignado → Solicitação → Confirmado → Retido → Baixa Prevista</p></div>
      </div>

      {/* KPIs Dívida no topo */}
      {totalD && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:10 }}>
          <KPICard label="Total (R$)"      value={formatCurrency(totalD.assignado,true)}     status="neutral" icon={<DollarSign size={13}/>}/>
          <KPICard label="% Baixas"        value={`${totalD.pctBaixas.toFixed(1)}%`}         status="warning" progress={totalD.pctBaixas} meta="10%" realizado={`${totalD.pctBaixas.toFixed(1)}%`}/>
          <KPICard label="% Retido"        value={`${totalD.pctRetido.toFixed(1)}%`}         status="success" icon={<TrendingUp size={13}/>}/>
        </div>
      )}

      <Tabs defaultValue="primaria">
        <TabsList style={{ background:'var(--d-card)', border:'1px solid var(--d-border)', borderRadius:8, padding:4, display:'flex', flexWrap:'wrap', gap:2 }}>
          {[['primaria','Cart. Primária'],['secundaria','Cart. Secundária'],['consolidado','Consolidado'],['indicadores','Indicadores'],['ranking','Ranking']].map(([v,l]) => (
            <TabsTrigger key={v} value={v!} style={{ fontSize:'0.76rem', borderRadius:6, padding:'0.28rem 0.8rem' }}>{l}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── Cart. Primária ── */}
        <TabsContent value="primaria" style={{ marginTop:12, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>Carteira Primária</div>
          <OperationalTable table={tblPC}/>
          <OperationalTable table={tblPD}/>
        </TabsContent>

        {/* ── Cart. Secundária ── */}
        <TabsContent value="secundaria" style={{ marginTop:12, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>Carteira Secundária</div>
          <OperationalTable table={tblSC}/>
          <OperationalTable table={tblSD}/>
        </TabsContent>

        {/* ── Consolidado ── */}
        <TabsContent value="consolidado" style={{ marginTop:12, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--d-text)', borderBottom:'1px solid var(--d-border)', paddingBottom:8 }}>Resumo Consolidado</div>
          {totalC && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
              <KPICard label="Total Assignado"  value={formatNumber(totalC.assignado)}     status="neutral"/>
              <KPICard label="Total Solicitado" value={formatNumber(totalC.solicitados)}   status="neutral"/>
              <KPICard label="Total Confirmado" value={formatNumber(totalC.confirmado)}    status="success" icon={<CheckCircle size={13}/>}/>
              <KPICard label="Total Retido"     value={formatNumber(totalC.retido)}        status="warning" icon={<AlertTriangle size={13}/>}/>
              <KPICard label="Total Pendente"   value={formatNumber(totalC.pendente)}      status="neutral"/>
              <KPICard label="Total Baixa Prev." value={formatNumber(totalC.baixaPrevista)} status="success"/>
              <KPICard label="% Baixas Geral"   value={`${totalC.pctBaixas.toFixed(1)}%`} status="warning" progress={totalC.pctBaixas} meta="10%" realizado={`${totalC.pctBaixas.toFixed(1)}%`}/>
              <KPICard label="% Retenção Geral" value={`${totalC.pctRetido.toFixed(1)}%`} status="success"/>
            </div>
          )}
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--d-text)', marginTop:4 }}>Mês Atual</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <ReativCard label="Clientes — Mês Atual">
              <StatRow label="Assignado" value="3"/>
              <StatRow label="Baixas"    value="23"/>
              <StatRow label="Retido"    value="16"/>
              <StatRow label="% Baixas"  value="766.7%" accent/>
              <StatRow label="% Retido"  value="41.03%"/>
            </ReativCard>
            <ReativCard label="Dívida — Mês Atual">
              <StatRow label="Baixas Conf." value={formatCurrency(567029, true)}/>
              <StatRow label="Retido"       value={formatCurrency(692099, true)}/>
              <StatRow label="% Baixas"     value="0.0%"/>
              <StatRow label="% Retido"     value="41.03%" accent/>
            </ReativCard>
          </div>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--d-text)', marginTop:4 }}>Reativações</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
            <ReativCard label="Clientes">
              <StatRow label="Reativações" value="0"/>
              <StatRow label="Global"      value="62" accent/>
            </ReativCard>
            <ReativCard label="Monto (R$)">
              <StatRow label="Reativações" value={formatCurrency(0,true)}/>
              <StatRow label="Global"      value={formatCurrency(4122511,true)} accent/>
            </ReativCard>
            <ReativCard label="Sin × Con Parciales">
              <StatRow label="Sin — Assignado" value={formatCurrency(121934683,true)}/>
              <StatRow label="Sin — Baixas"    value={formatCurrency(4100575,true)} accent/>
              <StatRow label="Con — Baixas"    value={formatCurrency(4122511,true)}/>
            </ReativCard>
          </div>
        </TabsContent>

        {/* ── Indicadores ── */}
        <TabsContent value="indicadores" style={{ marginTop:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <ChartCard title="% Baixas por Segmento (Clientes)" subtitle="Excl. 2xC" height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pctBaixasChart} layout="vertical" margin={{ top:0, right:50, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" horizontal={false}/>
                  <XAxis type="number" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>`${Number(v)}%`}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={85}/>
                  <Tooltip contentStyle={TT} formatter={(v:unknown)=>[`${Number(v).toFixed(1)}%`,'% Baixas']}/>
                  <Bar dataKey="value" radius={[0,3,3,0]}>
                    {pctBaixasChart.map((e,i)=><Cell key={i} fill={e.value>=7?'#ef4444':e.value>=5?'#eab308':'#22c55e'}/>)}
                    <LabelList dataKey="value" position="right" fill="#9991b8" style={{ fontSize:10 }} formatter={(v:unknown)=>`${Number(v).toFixed(1)}%`}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="% Retido por Segmento" subtitle="Maior = melhor retenção" height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pctRetidoChart} layout="vertical" margin={{ top:0, right:50, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" horizontal={false}/>
                  <XAxis type="number" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>`${Number(v)}%`} domain={[80,100]}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={85}/>
                  <Tooltip contentStyle={TT} formatter={(v:unknown)=>[`${Number(v).toFixed(1)}%`,'% Retido']}/>
                  <Bar dataKey="value" radius={[0,3,3,0]}>
                    {pctRetidoChart.map((e,i)=><Cell key={i} fill={e.value>=95?'#22c55e':e.value>=90?'#eab308':'#ef4444'}/>)}
                    <LabelList dataKey="value" position="right" fill="#9991b8" style={{ fontSize:10 }} formatter={(v:unknown)=>`${Number(v).toFixed(1)}%`}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Confirmado × Retido por Segmento" subtitle="Clientes — Carteira Primária" height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confRetChart} margin={{ top:4, right:12, left:-10, bottom:40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:9 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} angle={-35} textAnchor="end" height={50}/>
                  <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={TT}/>
                  <Bar dataKey="conf" name="Confirmado" fill="#22c55e" radius={[2,2,0,0]}/>
                  <Bar dataKey="ret"  name="Retido"     fill="#ef4444" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Dívida Confirmada × Retida" subtitle="Carteira Primária (R$)" height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividaChart} margin={{ top:4, right:12, left:-10, bottom:40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:'#9991b8', fontSize:9 }} tickLine={false} axisLine={{ stroke:'#3a2d55' }} angle={-35} textAnchor="end" height={50}/>
                  <YAxis tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>`${(Number(v)/1e6).toFixed(1)}M`}/>
                  <Tooltip contentStyle={TT} formatter={(v:unknown,n:unknown)=>[formatCurrency(Number(v),true),String(n)]}/>
                  <Bar dataKey="confirmado" name="Confirmado" fill="#8062de" radius={[2,2,0,0]}/>
                  <Bar dataKey="retido"     name="Retido"     fill="#ef4444" radius={[2,2,0,0]} opacity={0.75}/>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* ── Ranking ── */}
        <TabsContent value="ranking" style={{ marginTop:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { title:'Maior % Baixas',         data:rankMaiorPct,    color:'#ef4444', fmt:(v:number)=>`${v.toFixed(1)}%` },
              { title:'Menor % Retenção',        data:rankMenorRetenc, color:'#eab308', fmt:(v:number)=>`${v.toFixed(1)}%` },
              { title:'Maior Valor Confirmado',  data:rankMaiorConf,   color:'#8062de', fmt:(v:number)=>formatCurrency(v,true) },
              { title:'Maior Baixa Prevista',    data:rankMaiorBaixa,  color:'#22c55e', fmt:(v:number)=>formatCurrency(v,true) },
            ].map(({ title, data: chartData, color, fmt }) => (
              <ChartCard key={title} title={title} height={Math.max(200, chartData.length * 32)}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top:0, right:70, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,45,85,0.5)" horizontal={false}/>
                    <XAxis type="number" tick={{ fill:'#9991b8', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={(v:unknown)=>fmt(Number(v))}/>
                    <YAxis type="category" dataKey="name" tick={{ fill:'#e8e4f0', fontSize:10 }} tickLine={false} axisLine={false} width={90}/>
                    <Tooltip contentStyle={TT} formatter={(v:unknown)=>[fmt(Number(v)),'']}/>
                    <Bar dataKey="value" fill={color} radius={[0,3,3,0]}>
                      {chartData.map((_,i)=><Cell key={i} fill={color} opacity={1-i*0.06}/>)}
                      <LabelList dataKey="value" position="right" fill="#9991b8" style={{ fontSize:10 }} formatter={(v:unknown)=>fmt(Number(v))}/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
