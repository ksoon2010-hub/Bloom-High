import {useState} from 'react';
import {CalendarDays,Users} from 'lucide-react';
import type {Member} from '../lib/local-storage';
import {stoppedMembers} from '../lib/member-stopped';
export function StoppedMembers({data,initialMonth,loading,error}:{data:Member[];initialMonth:string;loading:boolean;error:string}){
 const [mode,setMode]=useState('monthly'),[selected,setSelected]=useState(initialMonth);
 const history=stoppedMembers(data);
 const visible=history.filter(r=>mode==='all'||r.record.month===selected);
 const format=(m:string)=>m.replace('-','년 ')+'월';
 return <>
 <div className="heading"><div><div className="eyebrow">EVERY JOURNEY MATTERS</div><h1>중단 회원</h1><div className="bloom-line">Every step stays.</div><p>함께했던 회원의 중단 기록을 보관하고 살펴보세요.</p></div></div>
 <div className="month-row"><div className="tabs stopped-tabs"><button className={mode==='monthly'?'selected':''} aria-pressed={mode==='monthly'} onClick={()=>setMode('monthly')}>월별 보기</button><button className={mode==='all'?'selected':''} aria-pressed={mode==='all'} onClick={()=>setMode('all')}>전체 보기</button></div>{mode==='monthly'&&<div className="month-control"><label><CalendarDays size={18}/><input aria-label="중단 회원 조회 연도와 월" type="month" value={selected} onChange={e=>e.target.value&&setSelected(e.target.value)}/></label></div>}</div>
 <section className="members"><div className="list-heading"><div><h2>{mode==='all'?'전체 중단 기록':format(selected)+' 중단 기록'} <span>{visible.length}</span></h2><p>등록월과 중단월을 모두 포함한 개월 수입니다.</p></div></div>
 {error?<div className="alert" role="alert">{error}</div>:loading?<p className="monthly-empty">기록을 불러오는 중이에요.</p>:<><div className="table-wrap"><table><thead><tr><th>회원 이름 · 개월 수</th><th>등록월</th><th>중단월</th></tr></thead><tbody>{visible.map(({record,registeredMonth,months})=><tr key={record.id}><td><div className="member-name"><span className="avatar">{record.name.slice(0,1)}</span><strong>{record.name}</strong><span className="tenure-badge" title="등록월부터 중단월까지 포함한 개월 수">{months??'—'}</span></div></td><td>{registeredMonth?format(registeredMonth):'등록 기록 없음'}</td><td>{format(record.month)}</td></tr>)}</tbody></table></div>{!visible.length&&<div className="empty"><span><Users size={30}/></span><h3>중단 회원 기록이 없어요</h3><p>{mode==='all'?'중단으로 기록한 회원이 여기에 표시됩니다.':'다른 연도와 월을 선택해 보세요.'}</p></div>}</>}
 <p className="tenure-hint">등록한 달을 1로 계산합니다. 예: 10월 등록 후 12월 중단 → 3. ‘신규’ 등록 기록이 없으면 등록월과 개월 수는 추정하지 않습니다. 재등록한 회원은 가장 최근 신규 등록월부터 계산합니다.</p><div className="list-footer"><span>재등록 전의 중단 기록도 함께 표시합니다.</span><span>중단 기록은 삭제하지 않고 보관합니다.</span></div></section>
 </>;
}
