export function normalizeActionTextSize(value){
  const size=Number(value);
  if(value==null||value===''||!Number.isFinite(size))return 100;
  return Math.min(150,Math.max(80,Math.round(size/5)*5));
}
