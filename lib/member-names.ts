export function normalizeMemberName(name: string) { return name.replace(/\s+/g,'').toLocaleLowerCase('ko'); }
export function duplicateMembers<T extends {id:string;month:string;name:string}>(records:T[],name:string,month:string,excludeId?:string) {
 const normalized=normalizeMemberName(name);
 if(!normalized) return [];
 return records.filter(r=>r.id!==excludeId&&r.month===month&&normalizeMemberName(r.name)===normalized);
}
export function memberSuggestions<T extends {id:string;memberId:string;month:string;name:string}>(records:T[],query:string,preferredMonth:string) {
 const normalized=normalizeMemberName(query);
 if(!normalized) return [];
 const latest=new Map<string,T>();
 for(const record of records) {
  const existing=latest.get(record.memberId);
  if(!existing || (record.month===preferredMonth&&existing.month!==preferredMonth) || (existing.month!==preferredMonth&&record.month>existing.month)) latest.set(record.memberId,record);
 }
 return [...latest.values()].filter(r=>normalizeMemberName(r.name).includes(normalized)).sort((a,b)=>a.name.localeCompare(b.name,'ko')).slice(0,10);
}
