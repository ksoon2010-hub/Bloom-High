export const MEMBER_STATUSES = ['유지','신규','중단','전입','전출'];
export const ACTIVE_STATUSES = ['유지','신규','전입'];
export function membershipStats(records: {status:string}[]) {
 const count=(status:string)=>records.filter(r=>r.status===status).length;
 const kept=count('유지'),fresh=count('신규'),stopped=count('중단'),transferredIn=count('전입'),transferredOut=count('전출');
 const base=kept+stopped;
 return {kept,fresh,stopped,transferredIn,transferredOut,base,active:kept+fresh+transferredIn,rate:base?Math.round(kept/base*1000)/10:null};
}
