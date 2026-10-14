import {useState} from 'react';
import {CalendarDays,ArrowUpRight} from 'lucide-react';
import type {Member} from '../lib/local-storage';
import {retentionAnalysis,type AnalysisKind} from '../lib/retention-analysis';
const format=(m:string)=>m.replace('-','년 ')+'월';
export function RetentionAnalysis({data,initialMonth,currentMonth,loading,error}:{data:Member[];initialMonth:string;currentMonth:string;loading:boolean;error:string}){
 const [month,setMonth]=useState(initialMonth),[kind,setKind]=useState<AnalysisKind>('new'),[selected,setSelected]=useState(2),[list,setList]=useState('kept');
 const results=retentionAnalysis(data,month,kind,currentMonth),detail=results.find(r=>r.period===selected)!;
 const label=(state:string)=>state==='pending'?'집계 대기':state==='insufficient'?'데이터 부족':'대상 없음';
 const names=[['kept','유지 회원'],['stopped','중단·전출 회원'],['unknown','확인 필요'],['pending','집계 대기']];
 const visible=detail.people.filter(p=>p.outcome===list);
 return <>
 <div className="heading"><div><div className="eyebrow">GROWTH OVER TIME</div><h1>유지율 분석</h1><div className="bloom-line">Stay and grow.</div><p>기준 월에 함께한 회원의 2·4·7·13개월 유지율을 살펴보세요.</p></div></div>
 <div className="month-row"><div className="month-control"><label><CalendarDays size={18}/><input type="month" aria-label="유지율 분석 기준 연도와 월" value={month} onChange={e=>{if(e.target.value){setMonth(e.target.value);setList('kept')}}}/></label></div><div className="tabs stopped-tabs" aria-label="분석 대상"><button aria-pressed={kind==='new'} className={kind==='new'?'selected':''} onClick={()=>{setKind('new');setList('kept')}}>신규 회원 유지율</button><button aria-pressed={kind==='all'} className={kind==='all'?'selected':''} onClick={()=>{setKind('all');setList('kept')}}>전체 회원 유지율</button></div></div>
 <p className="tenure-hint">{kind==='new'?'기준 월에 ‘신규’로 등록된 회원을 대상으로 해요.':'기준 월의 활동 회원(유지·신규·전입)을 대상으로 해요. 등록월과 관계없이 기준 월부터 계산합니다.'} 기준 월을 1개월째로 계산하며, 이후 들어온 회원은 대상에 추가하지 않아요.</p>
 {error?<div className="alert" role="alert">{error}</div>:loading?<p className="monthly-empty">기록을 불러오는 중이에요.</p>:<>
 <section className="analysis-grid" aria-label="기간별 유지율">{results.map(r=><button key={r.period} className={`analysis-card ${selected===r.period?'selected':''}`} aria-pressed={selected===r.period} aria-label={`${r.period}개월 유지율 상세`} onClick={()=>{setSelected(r.period);setList(r.state==='pending'?'pending':'kept')}}><span className="analysis-card-title">{r.period}개월 <ArrowUpRight size={18}/></span><span className="analysis-target">목표 월 · {format(r.targetMonth)}</span><strong className="analysis-value">{r.rate===null?label(r.state):`${r.rate}%`}</strong><span>대상 {r.total}명{r.state!=='pending'&&` · 유지 ${r.kept}명`}</span><small>{r.reason}</small></button>)}</section>
 <section className="members analysis-detail" aria-labelledby="analysis-detail-title"><div className="list-heading"><div><h2 id="analysis-detail-title">{kind==='new'?'신규':'전체'} 회원 · {selected}개월 상세 <span>{detail.total}</span></h2><p>{format(month)} 기준 → {format(detail.targetMonth)} · {detail.rate===null?label(detail.state):`유지 ${detail.kept} ÷ 대상 ${detail.total} × 100 = ${detail.rate}%`}</p></div></div>
 <div className="tabs">{names.map(([value,title])=><button key={value} className={list===value?'selected':''} aria-pressed={list===value} onClick={()=>setList(value)}>{title} <span>{detail.people.filter(p=>p.outcome===value).length}</span></button>)}</div>
 <div className="table-wrap"><table><thead><tr><th>회원 이름</th><th>등록월</th><th>기준 월 상태</th><th>확인 결과</th></tr></thead><tbody>{visible.map(p=><tr key={p.record.memberId}><td><div className="member-name"><span className="avatar">{p.record.name.slice(0,1)}</span><strong>{p.record.name}</strong></div></td><td>{p.registeredMonth?format(p.registeredMonth):'등록 기록 없음'}</td><td>{p.record.status}</td><td>{p.endedMonth&&`${format(p.endedMonth)} · `}{p.reason}</td></tr>)}</tbody></table></div>
 {!visible.length&&<p className="monthly-empty">이 목록에 표시할 회원이 없어요.</p>}
 <p className="tenure-hint">{detail.reason} 기록이 부족하면 일부 확인된 명단만 표시하고 유지율은 계산하지 않아요. 월별 기록은 회원 ID로 연결하며, 동명 회원을 자동으로 연결하지 않습니다.</p><div className="list-footer"><span>중단·전출 후 재등록은 이전 이력의 유지로 계산하지 않아요.</span><span>분석은 기존 기록을 변경하지 않아요.</span></div></section>
 <p className="tenure-hint">중단·전출 전까지 매달 활동 기록이 있어야 확인할 수 있어요. 전출은 이 센터의 유지 회원에서 제외되며 고정된 분모에는 남습니다. 기존 ‘이번 달 유지율’ 계산은 그대로예요.</p>
 </>}
 </>;
}
