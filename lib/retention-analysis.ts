import type {Member} from './local-storage.ts';
import {ACTIVE_STATUSES} from './member-stats.ts';
export const RETENTION_PERIODS=[2,4,7,13] as const;
export type AnalysisKind='new'|'all';
export type AnalysisPerson={record:Member;registeredMonth:string|null;outcome:'kept'|'stopped'|'unknown'|'pending';reason:string;endedMonth?:string};
export type AnalysisResult={period:number;targetMonth:string;state:'ready'|'pending'|'insufficient'|'empty';rate:number|null;people:AnalysisPerson[];total:number;kept:number;stopped:number;unknown:number;reason:string};
export function shiftMonth(month:string,offset:number){const [y,m]=month.split('-').map(Number);const value=y*12+m-1+offset;return `${Math.floor(value/12).toString().padStart(4,'0')}-${(value%12+1).toString().padStart(2,'0')}`;}
// Read-only cohorts: identity comes from memberId, never a guessed name or tenure.
export function retentionAnalysis(records:Member[],baseMonth:string,kind:AnalysisKind,currentMonth:string):AnalysisResult[]{
 const groups=new Map<string,Member[]>();
 for(const record of records){const group=groups.get(record.memberId)||[];group.push(record);groups.set(record.memberId,group);}
 const baseRows=records.filter(r=>r.month===baseMonth&&(kind==='new'?r.status==='신규':ACTIVE_STATUSES.includes(r.status)));
 const cohort=[...new Map(baseRows.map(r=>[r.memberId,r])).values()];
 const monthExists=(month:string)=>records.some(r=>r.month===month);
 return RETENTION_PERIODS.map(period=>{
  const targetMonth=shiftMonth(baseMonth,period-1),pending=targetMonth>currentMonth;
  const people:AnalysisPerson[]=cohort.map(record=>{
   const history=groups.get(record.memberId)!;
   let registeredMonth:string|null=null;
   const past=history.filter(r=>r.month<=baseMonth).sort((a,b)=>a.month.localeCompare(b.month));
   for(const r of past){if(r.status==='신규')registeredMonth=r.month;else if(r.status==='중단'||r.status==='전출')registeredMonth=null;}
   const person:AnalysisPerson={record,registeredMonth,outcome:pending?'pending':'kept',reason:pending?'목표 월이 아직 오지 않았어요.':'목표 월까지 활동 기록 확인'};
   if(pending)return person;
   if(history.filter(r=>r.month===baseMonth).length!==1)return {...person,outcome:'unknown',reason:'기준 월에 같은 회원 ID의 기록이 여러 개 있어요.'};
   for(let step=1;step<period;step++){
    const month=shiftMonth(baseMonth,step),rows=history.filter(r=>r.month===month);
    if(rows.length!==1)return {...person,outcome:'unknown',reason:rows.length?`${month}에 같은 회원 ID의 기록이 여러 개 있어요.`:`${month} 회원 기록 없음`};
    const row=rows[0];
    if(row.status==='중단'||row.status==='전출')return {...person,outcome:'stopped',endedMonth:month,reason:row.status==='중단'?'중단':'전출'};
    if(row.status==='신규'||row.status==='전입')return {...person,outcome:'stopped',endedMonth:month,reason:'재등록·재전입: 기준 월의 활동 이력과 구분'};
   }
   return person;
  });
  const kept=people.filter(p=>p.outcome==='kept').length,stopped=people.filter(p=>p.outcome==='stopped').length,unknown=people.filter(p=>p.outcome==='unknown').length;
  const missingBase=!monthExists(baseMonth),missingTarget=!monthExists(targetMonth);
  const state=pending?'pending':missingBase||missingTarget||unknown?'insufficient':!cohort.length?'empty':'ready';
  const reason=state==='pending'?'목표 월이 아직 오지 않았어요.':missingBase?'기준 월 기록이 없어요.':missingTarget?'목표 월 기록이 없어요.':unknown?'일부 대상 회원의 월별 기록을 확인할 수 없어요.':state==='empty'?'기준 월에 대상 회원이 없어요.':'기준 월의 대상 명단을 분모로 계산해요.';
  return {period,targetMonth,state,rate:state==='ready'?Math.round(kept/cohort.length*1000)/10:null,people,total:cohort.length,kept,stopped,unknown,reason};
 });
}
