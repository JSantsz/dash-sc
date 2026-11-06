export const PRIMARY_COLS = ['Total','Novatos','2dos','Sin seg.','3ros','4tos','5tos','Regular','2xC','Estruturado','Atenção','Rec>35<60','Rec>60<90','Rec>90','Crédito'];
export const SECONDARY_COLS = ['Total','Novatos','2dos','Sin seg.','3ros','4tos','5tos','Regular 1','Regular 2','Regular 3','2xC','Estruturado','Atenção','Pronto socorro','UTI','Crédito'];

export type RowType = 'data' | 'pct' | 'total' | 'total-pct' | 'section';
export interface OpRow { label: string; values: string[]; type: RowType; }
export interface OpTable { title: string; columns: string[]; rows: OpRow[]; }

export const primaryAssignado = {
  clientes: [2684,98,259,63,192,170,111,893,140,260,86,108,126,276,709],
  divida:   [123968455,3813749,12009815,2994412,11028675,8796611,5015569,38708390,5884212,15994671,4957337,4898119,4903907,8776737,41787573],
};

export const primaryLocalizados: OpTable[] = [
  { title:'Clientes', columns:PRIMARY_COLS, rows:[
    { label:'Whatsapp',  type:'data',      values:['1.103','21','72','20','63','70','51','440','18','155','45','59','33','77','514'] },
    { label:'Whatsapp%', type:'pct',       values:['41%','21%','28%','32%','33%','41%','46%','49%','13%','60%','52%','55%','26%','28%','72%'] },
    { label:'Telefone',  type:'data',      values:['907','72','152','12','97','78','45','318','10','73','24','28','38','32','36'] },
    { label:'Telefone%', type:'pct',       values:['34%','73%','59%','19%','51%','46%','41%','36%','7%','28%','28%','26%','30%','12%','5%'] },
    { label:'Total',     type:'total',     values:['2.010','93','224','32','160','148','96','758','28','228','69','87','71','109','550'] },
    { label:'Total%',    type:'total-pct', values:['75%','95%','86%','51%','83%','87%','86%','85%','20%','88%','80%','81%','56%','39%','78%'] },
  ]},
  { title:'Dívida', columns:PRIMARY_COLS, rows:[
    { label:'Whatsapp',  type:'data',      values:['49.226.724','778.402','3.106.004','739.126','2.910.970','3.575.497','2.416.707','17.479.026','868.384','9.251.865','2.288.009','2.087.830','1.398.264','3.105.040','31.227.315'] },
    { label:'Whatsapp%', type:'pct',       values:['40%','20%','26%','25%','26%','41%','48%','45%','15%','58%','46%','43%','29%','35%','75%'] },
    { label:'Telefone',  type:'data',      values:['49.775.266','2.907.447','7.006.767','881.125','6.900.316','4.664.828','2.022.615','16.564.840','486.090','4.840.319','1.937.352','1.598.324','1.813.382','1.059.309','2.416.194'] },
    { label:'Telefone%', type:'pct',       values:['40%','76%','58%','29%','63%','53%','40%','43%','8%','30%','39%','33%','37%','12%','6%'] },
    { label:'Total',     type:'total',     values:['99.001.990','3.685.849','10.112.771','1.620.252','9.811.286','8.240.325','4.439.322','34.043.866','1.354.475','14.092.183','4.225.361','3.686.154','3.211.646','4.164.349','33.643.509'] },
    { label:'Total%',    type:'total-pct', values:['80%','97%','84%','54%','89%','94%','89%','88%','23%','88%','85%','75%','65%','47%','81%'] },
  ]},
];

export const primaryPromessas: OpTable[] = [
  { title:'Clientes', columns:PRIMARY_COLS, rows:[
    { label:'Não pagará',       type:'data',  values:['120','1','23','6','11','9','2','30','6','7','2','8','9','7','1'] },
    { label:'Não pagará%',      type:'pct',   values:['4%','1%','9%','10%','6%','5%','2%','3%','4%','3%','2%','7%','7%','3%','0%'] },
    { label:'Sem promessa',     type:'data',  values:['1.636','71','90','48','86','81','70','580','114','107','58','68','93','241','683'] },
    { label:'Sem promessa%',    type:'pct',   values:['61%','72%','35%','76%','45%','48%','63%','65%','81%','41%','67%','63%','74%','87%','96%'] },
    { label:'Vencida',          type:'data',  values:['421','0','59','3','39','30','10','140','2','93','6','15','8','16','0'] },
    { label:'Vencida%',         type:'pct',   values:['16%','0%','23%','5%','20%','18%','9%','16%','1%','36%','7%','14%','6%','6%','0%'] },
    { label:'Promessa parcial', type:'data',  values:['89','0','22','1','13','15','7','14','1','6','5','3','2','0','0'] },
    { label:'Prom. parcial%',   type:'pct',   values:['3%','0%','8%','2%','7%','9%','6%','2%','1%','2%','6%','3%','2%','0%','0%'] },
    { label:'Prom. completa',   type:'data',  values:['74','0','17','0','11','9','5','13','0','13','3','1','2','0','0'] },
    { label:'Prom. completa%',  type:'pct',   values:['3%','0%','7%','0%','6%','5%','5%','1%','0%','5%','3%','1%','2%','0%','0%'] },
    { label:'Vigente',          type:'data',  values:['79','0','5','0','4','2','4','39','0','14','4','3','2','2','0'] },
    { label:'Vigente%',         type:'pct',   values:['3%','0%','2%','0%','2%','1%','4%','4%','0%','5%','5%','3%','2%','1%','0%'] },
  ]},
  { title:'Dívida', columns:PRIMARY_COLS, rows:[
    { label:'Não pagará',       type:'data',  values:['7.867.629','29.983','1.043.451','139.547','672.981','1.100.679','104.532','1.462.460','427.833','669.729','459.809','613.670','403.519','242.789','496.647'] },
    { label:'Não pagará%',      type:'pct',   values:['6%','1%','9%','5%','6%','13%','2%','4%','7%','4%','9%','13%','8%','3%','1%'] },
    { label:'Sem promessa',     type:'data',  values:['110.011.116','3.092.343','3.753.555','2.353.930','4.113.415','3.802.333','3.273.313','22.394.521','4.892.671','5.226.644','2.714.338','2.935.275','3.248.609','7.809.906','40.400.264'] },
    { label:'Sem promessa%',    type:'pct',   values:['89%','81%','31%','79%','37%','43%','65%','58%','83%','33%','55%','60%','66%','89%','97%'] },
    { label:'Vencida',          type:'data',  values:['22.350.460','0','2.726.782','54.485','2.465.153','1.537.748','455.313','8.126.918','47.490','4.905.152','509.314','538.005','494.550','489.550','0'] },
    { label:'Vencida%',         type:'pct',   values:['18%','0%','23%','2%','22%','17%','9%','21%','1%','31%','10%','11%','10%','6%','0%'] },
    { label:'Promessa parcial', type:'data',  values:['8.967.169','0','1.595.021','332.407','1.972.033','826.368','449.414','1.224.929','15.793','1.820.647','426.482','234.906','69.169','0','0'] },
    { label:'Prom. parcial%',   type:'pct',   values:['7%','0%','13%','11%','18%','9%','9%','3%','0%','11%','9%','5%','1%','0%','0%'] },
    { label:'Prom. completa',   type:'data',  values:['2.890.545','0','439.885','0','546.375','220.967','112.594','443.382','0','849.237','150.422','15.706','111.978','0','0'] },
    { label:'Prom. completa%',  type:'pct',   values:['2%','0%','4%','0%','5%','3%','2%','1%','0%','5%','3%','0%','2%','0%','0%'] },
    { label:'Vigente',          type:'data',  values:['5.189.672','0','561.312','0','390.936','476.337','86.228','1.873.951','0','1.266.746','344.655','82.583','76.514','30.410','0'] },
    { label:'Vigente%',         type:'pct',   values:['4%','0%','5%','0%','4%','5%','2%','5%','0%','8%','7%','2%','2%','0%','0%'] },
  ]},
];

export const primaryDepositos: OpTable[] = [
  { title:'Clientes', columns:PRIMARY_COLS, rows:[
    { label:'Sem Depósito',  type:'data',      values:['1.898','46','129','42','99','84','54','689','108','202','59','84','93','255','654'] },
    { label:'Sem Depósito%', type:'pct',       values:['71%','47%','50%','67%','52%','49%','49%','77%','77%','78%','69%','78%','74%','92%','92%'] },
    { label:'Parcial',       type:'data',      values:['249','22','39','11','35','32','21','46','14','10','11','8','16','6','27'] },
    { label:'Parcial%',      type:'pct',       values:['9%','22%','15%','17%','18%','19%','19%','5%','10%','4%','13%','7%','13%','2%','4%'] },
    { label:'Completo',      type:'total',     values:['537','30','91','10','58','54','36','158','18','48','16','16','17','15','28'] },
    { label:'Completo%',     type:'total-pct', values:['20,01%','30,61%','35,14%','15,87%','30,21%','31,76%','32,43%','17,69%','12,86%','18,46%','18,60%','14,81%','13,49%','5,43%','3,95%'] },
  ]},
  { title:'Dívida', columns:PRIMARY_COLS, rows:[
    { label:'Sem Depósito',  type:'data',      values:['83.910.768','1.995.381','6.027.081','1.897.918','5.286.661','4.531.784','2.696.789','29.500.425','4.648.957','10.793.691','3.396.989','3.711.472','3.155.929','8.263.072','38.035.983'] },
    { label:'Sem Depósito%', type:'pct',       values:['68%','52%','50%','63%','48%','52%','54%','76%','79%','67%','69%','76%','64%','94%','91%'] },
    { label:'Parcial',       type:'data',      values:['19.939.216','1.029.485','2.726.664','866.182','3.653.257','2.680.994','1.166.285','3.494.937','674.585','2.107.550','782.323','612.496','1.031.781','142.163','2.789.395'] },
    { label:'Parcial%',      type:'pct',       values:['16%','27%','23%','29%','33%','30%','23%','9%','11%','13%','16%','13%','21%','2%','7%'] },
    { label:'Completo',      type:'total',     values:['19.502.830','788.883','2.640.429','230.311','2.088.757','1.583.833','1.152.496','5.713.028','560.670','3.093.430','778.025','574.152','716.197','371.502','962.195'] },
    { label:'Completo%',     type:'total-pct', values:['15,73%','20,69%','21,99%','7,69%','18,94%','18,01%','22,98%','14,76%','9,53%','19,34%','15,69%','11,72%','14,60%','4,23%','2,30%'] },
  ]},
];

export const secondaryLocalizados: OpTable[] = [
  { title:'Clientes', columns:SECONDARY_COLS, rows:[
    { label:'Whatsapp',  type:'data',      values:['1.103','21','72','20','63','70','51','291','123','26','18','155','45','86','83','514'] },
    { label:'Whatsapp%', type:'pct',       values:['41%','21%','28%','32%','33%','41%','46%','49%','52%','43%','13%','60%','52%','30%','37%','72%'] },
    { label:'Telefone',  type:'data',      values:['907','72','152','12','97','78','45','220','82','16','10','73','24','68','30','36'] },
    { label:'Telefone%', type:'pct',       values:['34%','73%','59%','19%','51%','46%','41%','37%','35%','27%','7%','28%','28%','24%','13%','5%'] },
    { label:'Total',     type:'total',     values:['2.015','93','224','32','160','148','96','511','206','42','28','229','70','154','113','551'] },
    { label:'Total%',    type:'total-pct', values:['75%','95%','87%','51%','84%','87%','87%','86%','87%','71%','20%','88%','81%','54%','50%','78%'] },
  ]},
  { title:'Dívida', columns:SECONDARY_COLS, rows:[
    { label:'Whatsapp',  type:'data',      values:['0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'] },
    { label:'Whatsapp%', type:'pct',       values:['0%','0%','0%','0%','0%','0%','0%','0%','0%','0%','0%','0%','0%','0%','0%','0%'] },
    { label:'Telefone',  type:'data',      values:['29.732.721','2.803.387','2.611.478','1.175.820','2.216.587','3.103.646','692.116','5.659.650','1.161.437','739.249','2.592.337','2.587.291','867.734','3.084.238','3.241.138','7.198.473'] },
    { label:'Telefone%', type:'pct',       values:['24%','74%','22%','39%','20%','35%','14%','21%','13%','30%','44%','16%','18%','36%','32%','17%'] },
    { label:'Total',     type:'total',     values:['29.732.721','2.803.387','2.611.478','1.175.820','2.216.587','3.103.646','692.116','5.659.650','1.161.437','739.249','2.592.337','2.587.291','867.734','3.084.238','3.241.138','7.198.473'] },
    { label:'Total%',    type:'total-pct', values:['24%','74%','22%','39%','20%','35%','14%','21%','13%','30%','44%','16%','18%','36%','32%','17%'] },
  ]},
];

export const secondaryPromessas: OpTable[] = [
  { title:'Clientes', columns:SECONDARY_COLS, rows:[
    { label:'Não pagará',      type:'data', values:['120','1','23','6','11','9','2','19','7','4','6','7','2','14','10','1'] },
    { label:'Não pagará%',     type:'pct',  values:['4%','1%','9%','10%','6%','5%','2%','3%','3%','7%','4%','3%','2%','5%','4%','0%'] },
    { label:'Sem promessa',    type:'data', values:['1.636','71','90','48','86','81','70','377','162','41','114','107','58','218','184','683'] },
    { label:'Sem promessa%',   type:'pct',  values:['61%','72%','35%','76%','45%','48%','63%','63%','68%','68%','81%','41%','67%','77%','81%','96%'] },
    { label:'Vencida',         type:'data', values:['421','0','59','3','39','30','10','95','35','10','2','93','6','28','11','0'] },
    { label:'Vencida%',        type:'pct',  values:['16%','0%','23%','5%','20%','18%','9%','16%','15%','17%','1%','36%','7%','10%','5%','0%'] },
    { label:'Prom. parcial',   type:'data', values:['89','0','22','1','13','15','7','12','2','0','1','6','5','3','2','0'] },
    { label:'Prom. parcial%',  type:'pct',  values:['3%','0%','8%','2%','7%','9%','6%','2%','1%','0%','1%','2%','6%','1%','1%','0%'] },
    { label:'Prom. completa',  type:'data', values:['74','0','17','0','11','9','5','10','3','0','0','13','3','1','2','0'] },
    { label:'Prom. completa%', type:'pct',  values:['3%','0%','7%','0%','6%','5%','5%','2%','1%','0%','0%','5%','3%','0%','1%','0%'] },
    { label:'Vigente',         type:'data', values:['79','0','5','0','4','2','4','28','9','2','0','14','4','6','1','0'] },
    { label:'Vigente%',        type:'pct',  values:['3%','0%','2%','0%','2%','1%','4%','5%','4%','3%','0%','5%','5%','2%','0%','0%'] },
  ]},
  { title:'Dívida', columns:SECONDARY_COLS, rows:[
    { label:'Não pagará',      type:'data', values:['7.340.999','29.983','1.043.451','139.547','672.981','1.100.679','104.532','933.016','282.094','247.350','427.833','669.729','459.809','755.259','504.719','496.647'] },
    { label:'Não pagará%',     type:'pct',  values:['6%','1%','9%','5%','6%','13%','2%','3%','3%','10%','7%','4%','9%','9%','5%','1%'] },
    { label:'Sem promessa',    type:'data', values:['66.518.509','3.092.343','3.753.555','2.353.930','4.113.415','3.802.333','3.273.313','15.680.853','5.314.318','1.399.351','4.892.671','5.226.644','2.714.338','6.085.691','7.908.099','40.400.264'] },
    { label:'Sem promessa%',   type:'pct',  values:['54%','81%','31%','79%','37%','43%','65%','57%','60%','56%','83%','33%','55%','71%','79%','97%'] },
    { label:'Vencida',         type:'data', values:['22.350.460','0','2.726.782','54.485','2.465.153','1.537.748','455.313','5.426.908','2.272.691','427.318','47.490','4.905.152','509.314','1.024.668','497.437','0'] },
    { label:'Vencida%',        type:'pct',  values:['18%','0%','23%','2%','22%','17%','9%','20%','26%','17%','1%','31%','10%','12%','5%','0%'] },
    { label:'Prom. parcial',   type:'data', values:['8.967.169','0','1.595.021','332.407','1.972.033','826.368','449.414','1.134.642','90.287','0','15.793','1.820.647','426.482','134.069','170.005','0'] },
    { label:'Prom. parcial%',  type:'pct',  values:['7%','0%','13%','11%','18%','9%','9%','4%','1%','0%','0%','11%','9%','2%','2%','0%'] },
    { label:'Prom. completa',  type:'data', values:['2.890.545','0','439.885','0','546.375','220.967','112.594','288.759','154.622','0','0','849.237','150.422','15.927','111.757','0'] },
    { label:'Prom. completa%', type:'pct',  values:['2%','0%','4%','0%','5%','3%','2%','1%','2%','0%','0%','5%','3%','0%','1%','0%'] },
    { label:'Vigente',         type:'data', values:['5.189.672','0','561.312','0','390.936','476.337','86.228','1.451.033','375.138','47.780','0','1.266.746','344.655','167.797','21.710','0'] },
    { label:'Vigente%',        type:'pct',  values:['4%','0%','5%','0%','4%','5%','2%','5%','4%','2%','0%','8%','7%','2%','0%','0%'] },
  ]},
];

export const secondaryDepositos: OpTable[] = [
  { title:'Clientes', columns:SECONDARY_COLS, rows:[
    { label:'Sem Depósito',  type:'data',      values:['1.898','46','129','42','99','84','54','450','182','57','108','202','59','254','178','654'] },
    { label:'Sem Depósito%', type:'pct',       values:['71%','47%','50%','67%','52%','49%','49%','76%','77%','95%','77%','78%','69%','89%','79%','92%'] },
    { label:'Parcial',       type:'data',      values:['249','22','39','11','35','32','21','34','12','0','14','10','11','8','22','27'] },
    { label:'Parcial%',      type:'pct',       values:['9%','22%','15%','17%','18%','19%','19%','6%','5%','0%','10%','4%','13%','3%','10%','4%'] },
    { label:'Completo',      type:'total',     values:['537','30','91','10','58','54','36','112','43','3','18','48','16','22','26','28'] },
    { label:'Completo%',     type:'total-pct', values:['20,01%','30,61%','35,14%','15,87%','30,21%','31,76%','32,43%','18,79%','18,14%','5,00%','12,86%','18,46%','18,60%','7,75%','11,50%','3,95%'] },
  ]},
  { title:'Dívida', columns:SECONDARY_COLS, rows:[
    { label:'Sem Depósito',  type:'data',      values:['79.261.811','1.995.381','6.027.081','1.897.918','5.286.661','4.531.784','2.696.789','20.194.015','7.184.612','2.121.799','0','10.793.691','3.396.989','7.727.218','7.403.256','38.035.983'] },
    { label:'Sem Depósito%', type:'pct',       values:['64%','52%','50%','63%','48%','52%','54%','74%','81%','85%','0%','67%','69%','90%','74%','91%'] },
    { label:'Parcial',       type:'data',      values:['19.939.216','1.029.485','2.726.664','866.182','3.653.257','2.680.994','1.166.285','2.976.662','518.275','0','674.585','2.107.550','782.323','257.368','1.529.071','2.789.395'] },
    { label:'Parcial%',      type:'pct',       values:['16%','27%','23%','29%','33%','30%','23%','11%','6%','0%','11%','13%','16%','3%','15%','7%'] },
    { label:'Completo',      type:'total',     values:['19.502.830','788.883','2.640.429','230.311','2.088.757','1.583.833','1.152.496','4.153.875','1.193.561','365.592','560.670','3.093.430','778.025','609.050','1.052.801','962.195'] },
    { label:'Completo%',     type:'total-pct', values:['15,73%','20,69%','21,99%','7,69%','18,94%','18,01%','22,98%','15,20%','13,42%','14,70%','9,53%','19,34%','15,69%','7,09%','10,54%','2,30%'] },
  ]},
];

export const overviewKPIs = {
  carteiraTotalValor: 123968455, carteiraTotalClientes: 2684,
  clientesLocalizados: 2010, clientesLocalizadosPct: 75,
  promessasGeradas: 663, promessasGeradasPct: 33,
  depositosConfirmados: 537, depositosConfirmadosPct: 20,
  taxaConversao: 20.01, ticketMedio: 36319, recuperacaoFinanceira: 19502830,
  meta: { localizados: 80, promessas: 40, depositos: 25, recuperacao: 25000000 },
};

export const funnelData = [
  { name:'Carteira', value:2684, fill:'#8062de' },
  { name:'Localizados', value:2010, fill:'#aa97ef' },
  { name:'Promessas', value:663, fill:'#aa6cc9' },
  { name:'Depósitos', value:537, fill:'#21ade0' },
];

function genDailyData() {
  const out = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const lk = [90,85,92,88,95,80,86,94,91,87,93,90,88,95,82,91,88,94,90,86,93,87,91,88,95,90,83,92,89,96];
  const pr = [22,18,25,20,28,19,23,27,24,20,26,23,21,28,17,25,22,27,24,20,26,21,25,22,29,24,18,26,23,30];
  const dp = [14,11,16,12,18,10,14,17,15,12,16,14,13,18,10,16,13,17,15,11,16,13,16,14,18,15,10,17,14,19];
  for (let i = 0; i < today; i++) {
    const d = new Date(year, month, i + 1);
    out.push({ dia:`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`, localizados:lk[i]??90, promessas:pr[i]??22, depositos:dp[i]??14 });
  }
  return out;
}
export const dailyData = genDailyData();

export const operatorRanking = [
  { nome:'Ana Silva',      depositos:45, recuperado:2100000, conversao:31 },
  { nome:'João Santos',    depositos:38, recuperado:1840000, conversao:28 },
  { nome:'Maria Oliveira', depositos:35, recuperado:1650000, conversao:26 },
  { nome:'Carlos Lima',    depositos:31, recuperado:1480000, conversao:24 },
  { nome:'Paula Mendes',   depositos:28, recuperado:1320000, conversao:22 },
  { nome:'Roberto Alves',  depositos:25, recuperado:1180000, conversao:20 },
  { nome:'Fernanda Costa', depositos:22, recuperado:1050000, conversao:18 },
  { nome:'Lucas Ferreira', depositos:18, recuperado:870000,  conversao:15 },
];

export const supplierRanking = [
  { fornecedor:'Fornecedor A', valor:8200000, clientes:520 },
  { fornecedor:'Fornecedor B', valor:5600000, clientes:380 },
  { fornecedor:'Fornecedor C', valor:3900000, clientes:260 },
  { fornecedor:'Fornecedor D', valor:1800000, clientes:140 },
];

export const recoveryByCarteira = [
  { carteira:'Novatos',     valor:788883,  meta:1000000 },
  { carteira:'2dos',        valor:2640429, meta:3000000 },
  { carteira:'3ros',        valor:2088757, meta:2500000 },
  { carteira:'Regular',     valor:5713028, meta:6000000 },
  { carteira:'Estruturado', valor:3093430, meta:3500000 },
  { carteira:'Atenção',     valor:778025,  meta:1200000 },
  { carteira:'Crédito',     valor:962195,  meta:1500000 },
];

const OPERADORES = ['Ana Silva','João Santos','Maria Oliveira','Carlos Lima','Paula Mendes','Roberto Alves','Fernanda Costa','Lucas Ferreira'];
const CARTEIRAS  = ['Primária','Secundária'];
const PRODUTOS   = ['Cartão','Empréstimo','Financiamento','Crédito Pessoal'];
const FORNECEDORES = ['Fornecedor A','Fornecedor B','Fornecedor C','Fornecedor D'];

export interface OperatorRow {
  id:number; data:string; carteira:string; produto:string; operador:string; fornecedor:string;
  clientes:number; localizados:number; promessas:number; depositos:number; valorRecuperado:number; conversao:number;
}

function rnd(min:number, max:number) { return Math.floor(Math.random()*(max-min+1))+min; }

export const operatorTableData: OperatorRow[] = Array.from({length:80},(_,i)=>{
  const clientes=rnd(30,120), localizados=rnd(Math.floor(clientes*0.5),clientes);
  const promessas=rnd(Math.floor(localizados*0.15),Math.floor(localizados*0.35));
  const depositos=rnd(Math.floor(promessas*0.5),promessas);
  const d=new Date(2025,0,1); d.setDate(d.getDate()+(i%30));
  return {
    id:i+1, data:`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/2025`,
    carteira:CARTEIRAS[i%2]!, produto:PRODUTOS[i%4]!, operador:OPERADORES[i%8]!, fornecedor:FORNECEDORES[i%4]!,
    clientes, localizados, promessas, depositos, valorRecuperado:depositos*rnd(8000,45000),
    conversao:Math.round((depositos/clientes)*100),
  };
});
