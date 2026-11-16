// Disponibilidade e preços informados diretamente pelo usuário em 09/11/2026.
// A unidade 1100 da imagem recebida foi excluída por orientação expressa.
export const availableUnits = [
  {unit:'600',area:'296,61',suites:3,vagas:3,price:3114405,image:'plan-296-61.webp',description:'Três suítes e ambientes avarandados para viver com amplitude, preservando os espaços de convivência e a intimidade da família.'},
  {unit:'500',area:'304,95',suites:3,vagas:4,price:3201975,image:'plan-304-95.webp',description:'Três suítes, quatro vagas e espaço para receber. Uma planta ampla para acompanhar seus encontros e sua rotina.'},
  {unit:'200',area:'452,08',suites:4,vagas:4,price:4746840,image:'plan-452-08.webp',description:'Quatro suítes e 452,08 m² para acomodar diferentes momentos da vida. Amplitude para conviver, receber e ter o seu próprio espaço.'},
];
const lowest = availableUnits.reduce((a,b)=>a.price<b.price?a:b);
export const commercial = {approved:true,startingPriceBRL:lowest.price,referenceUnit:lowest.unit,confirmedOn:'2026-11-09',validUntil:''};
export const formatPrice = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
export function getStartingPrice(config, today = new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'})) {
  if(!config.approved || !Number.isFinite(config.startingPriceBRL) || config.startingPriceBRL<=0 || !config.referenceUnit?.trim()) return null;
  // Não inventar vencimento quando a tabela fornecida não o informa.
  if(config.validUntil && (!/^\d{4}-\d{2}-\d{2}$/.test(config.validUntil) || config.validUntil<today)) return null;
  return formatPrice(config.startingPriceBRL);
}
