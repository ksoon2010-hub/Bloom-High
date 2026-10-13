export function monthlySummary(records: {month:string;status:string}[]) {
  const months = new Map<string,{month:string;activeCount:number;keptCount:number;newCount:number;stoppedCount:number;transferredInCount:number;transferredOutCount:number}>();
  for (const record of records) {
    const row = months.get(record.month) ?? {month:record.month,activeCount:0,keptCount:0,newCount:0,stoppedCount:0,transferredInCount:0,transferredOutCount:0};
    if (['유지','신규','전입'].includes(record.status)) row.activeCount++;
    if (record.status==='유지') row.keptCount++;
    if (record.status==='신규') row.newCount++;
    if (record.status==='중단') row.stoppedCount++;
    if (record.status==='전입') row.transferredInCount++;
    if (record.status==='전출') row.transferredOutCount++;
    months.set(record.month,row);
  }
  return [...months.values()].sort((a,b)=>b.month.localeCompare(a.month));
}
