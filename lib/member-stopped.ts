import type {Member} from './local-storage.ts';
// A new registration starts a new episode. Missing registrations remain unknown.
export function stoppedMembers(records:Member[]){
 const groups=new Map<string,Member[]>();
 for(const row of records){const group=groups.get(row.memberId)||[];group.push(row);groups.set(row.memberId,group);}
 const result:{record:Member;registeredMonth:string|null;months:number|null}[]=[];
 for(const group of groups.values()){
  let registration:string|null=null;
  for(const row of [...group].sort((a,b)=>a.month.localeCompare(b.month))){
   if(row.status==='신규')registration=row.month;
   if(row.status==='중단'){
    const number=(m:string)=>{const [y,n]=m.split('-').map(Number);return y*12+n;};
    result.push({record:row,registeredMonth:registration,months:registration?number(row.month)-number(registration)+1:null});
   }
  }
 }
 return result.sort((a,b)=>b.record.month.localeCompare(a.record.month)||a.record.name.localeCompare(b.record.name,'ko'));
}
