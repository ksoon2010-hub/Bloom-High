type Record = {id:string;memberId:string;month:string;status:string;tenureOverride?:number|null};
const active=(s:string)=>['유지','신규','전입'].includes(s);
const index=(m:string)=>{const [y,n]=m.split('-').map(Number);return y*12+n;};
// Only newly registered members from October 2026 have an automatic starting point.
// A manual number anchors subsequent continuous months, including existing members.
export function memberTenures(records:Record[]) {
 const result=new Map<string,number|null>();
 const groups=new Map<string,Record[]>();
 for(const r of records){const list=groups.get(r.memberId)||[];list.push(r);groups.set(r.memberId,list);}
 for(const list of groups.values()){
  let previous:Record|undefined,count:number|null=null;
  for(const r of list.sort((a,b)=>a.month.localeCompare(b.month))){
   const continuous=previous&&index(r.month)===index(previous.month)+1&&active(previous.status);
   const manual=r.tenureOverride;
   if(manual!=null) count=manual;
   else if(r.status==='신규'&&r.month>='2026-10') count=1;
   else if(r.status==='신규'||r.status==='전입') count=null;
   else if(continuous&&count!==null) count=active(r.status)?count+1:count;
   else count=null;
   result.set(r.id,count);previous=r;
  }
 }
 return result;
}
