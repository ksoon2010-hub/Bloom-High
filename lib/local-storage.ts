import {MEMBER_STATUSES} from './member-stats.ts';
export type Member={id:string;memberId:string;month:string;name:string;status:string;note:string;hope:string;tenureOverride?:number|null};
export const STORAGE_KEY='bloom-members-v1';
type StorageLike={getItem(key:string):string|null;setItem(key:string,value:string):void};
export function valid(r:unknown):r is Member {
 if(!r||typeof r!=='object')return false;
 const v=r as Member;
 return typeof v.id==='string'&&typeof v.memberId==='string'&&typeof v.name==='string'&&!!v.name.trim()&&v.name.length<=60&&typeof v.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v.month)&&MEMBER_STATUSES.includes(v.status)&&typeof v.note==='string'&&v.note.length<=500&&typeof v.hope==='string'&&v.hope.length<=1000&&(v.tenureOverride==null||(Number.isInteger(v.tenureOverride)&&v.tenureOverride>=0&&v.tenureOverride<=1200));
}
export function readMembers(storage:StorageLike):Member[]{
 let raw:string|null;
 try{raw=storage.getItem(STORAGE_KEY);}catch{throw new Error('브라우저 저장소를 사용할 수 없어요. 브라우저의 저장 허용 설정을 확인해 주세요.');}
 if(raw===null)return [];
 try{const rows:unknown=JSON.parse(raw);if(!Array.isArray(rows)||!rows.every(valid))throw new Error();return rows;}catch{throw new Error('저장된 기록을 읽을 수 없어요. 기존 데이터는 덮어쓰지 않았습니다.');}
}
export function updateMembers(storage:StorageLike,body:unknown):Member[]{
 const current=readMembers(storage);
 if(!body||typeof body!=='object')throw new Error('입력을 확인해 주세요.');
 const input=body as {action?:string;id?:string;rows?:unknown};
 let next:Member[];
 if(input.action==='delete'&&typeof input.id==='string'){
  if(current.some(r=>r.id===input.id&&r.status==='중단'))throw new Error('중단 회원 기록은 삭제하지 않고 보관합니다.');
  next=current.filter(r=>r.id!==input.id);
 }
 else{
  if(!Array.isArray(input.rows)||!input.rows.length||input.rows.length>500||!input.rows.every(valid))throw new Error('입력을 확인해 주세요.');
  const map=new Map(current.map(r=>[r.id,r]));
  for(const r of input.rows)map.set(r.id,{...r,name:r.name.trim()});
  next=[...map.values()];
 }
 try{storage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{throw new Error('저장하지 못했어요. 브라우저 저장 공간이나 저장 허용 설정을 확인해 주세요.');}
 return next;
}
