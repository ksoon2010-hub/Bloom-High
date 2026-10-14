import {useRef,useState} from 'react';
import {Download,X} from 'lucide-react';
import {parseMemberCsv,csvDuplicates,prepareCsvImport,type CsvRow} from '../lib/member-csv';
import {readMembers,updateMembers,type Member} from '../lib/local-storage';
export function CsvImport({disabled,onImported}:{disabled:boolean;onImported:(rows:Member[],month:string,count:number)=>void}){
 const fileInput=useRef<HTMLInputElement>(null);
 const [rows,setRows]=useState<CsvRow[]|null>(null),[existing,setExisting]=useState<Member[]>([]),[include,setInclude]=useState<Set<number>>(new Set()),[error,setError]=useState(''),[filename,setFilename]=useState(''),[saving,setSaving]=useState(false);
 const duplicates=rows?csvDuplicates(rows,existing):[];
 const count=rows?rows.filter((_,i)=>!duplicates[i]||include.has(i)).length:0;
 async function select(file:File){setError('');setRows(null);setInclude(new Set());try{if(file.size>5*1024*1024)throw new Error('5MB 이하의 CSV 파일을 선택해 주세요.');const parsed=parseMemberCsv(await file.text());setExisting(readMembers(localStorage));setFilename(file.name);setRows(parsed);}catch(e){setError((e as Error).message);}}
 function commit(){if(!rows)return;setSaving(true);setError('');try{
  const latest=readMembers(localStorage);
  if(JSON.stringify(latest)!==JSON.stringify(existing)){setExisting(latest);setInclude(new Set());throw new Error('기존 기록이 변경됐어요. 최신 중복 표시를 다시 확인해 주세요.');}
  if(include.size&&!confirm('선택한 중복 기록을 별도 회원으로 추가할까요? 기존 기록은 유지됩니다.'))return;
  const incoming=prepareCsvImport(rows,latest,include);if(!incoming.length)throw new Error('추가할 기록이 없어요.');
  const next=updateMembers(localStorage,{rows:incoming});onImported(next,incoming[0].month,incoming.length);setRows(null);
 }catch(e){setError((e as Error).message);}finally{setSaving(false);}}
 return <><button disabled={disabled} onClick={()=>{setError('');fileInput.current?.click();}}><Download size={16}/>CSV 파일 가져오기</button><input ref={fileInput} hidden type="file" accept=".csv,text/csv" aria-label="회원 CSV 파일 선택" onChange={e=>{const file=e.target.files?.[0];if(file)void select(file);e.target.value='';}}/>{error&&!rows&&<span className="form-error" role="alert">{error}</span>}
 {rows&&<div className="modal-backdrop"><section className="modal csv-modal" role="dialog" aria-modal="true" aria-labelledby="csv-title" onKeyDown={e=>{if(e.key==='Escape'&&!saving)setRows(null);}}><div className="modal-head"><div><div className="eyebrow">IMPORT PREVIEW</div><h2 id="csv-title">CSV 회원 가져오기 미리 보기</h2></div><button aria-label="가져오기 닫기" onClick={()=>setRows(null)} disabled={saving}><X size={21}/></button></div><p>{filename} · 총 {rows.length}건 · 중복 확인 {duplicates.filter(Boolean).length}건 · 추가 예정 {count}건</p><p className="field-hint">중복은 같은 월과 이름을 기준으로 확인합니다. 중복 기록은 기본적으로 건너뜁니다. 다른 월의 동명 회원은 자동 연결하지 않고 별도 회원으로 추가합니다.</p><div className="csv-preview"><table><thead><tr><th>회원 이름</th><th>기준 월</th><th>상태</th><th>유지 개월</th><th>처리</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.month}</td><td>{r.status}</td><td>{r.tenureOverride??'—'}</td><td>{duplicates[i]?<label className="csv-choice"><input type="checkbox" checked={include.has(i)} onChange={e=>setInclude(old=>{const next=new Set(old);if(e.target.checked)next.add(i);else next.delete(i);return next;})}/>중복 · 별도 회원으로 추가</label>:'새 기록 추가'}</td></tr>)}</tbody></table></div><p className="field-hint">기존 기록은 삭제하거나 덮어쓰지 않습니다. CSV는 서버에 전송하지 않고 이 브라우저에만 저장합니다.</p>{error&&<p className="form-error" role="alert">{error}</p>}<div className="modal-buttons"><button onClick={()=>setRows(null)} disabled={saving}>취소</button><button className="primary" onClick={commit} disabled={saving||!count}>{count}건 가져오기</button></div></section></div>}</>;
}
