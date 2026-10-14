import {readMembers,valid,STORAGE_KEY,type Member} from './local-storage.ts';
type StorageLike={getItem(key:string):string|null;setItem(key:string,value:string):void};
export const BACKUP_FORMAT='bloom-high-backup';
export const MAX_BACKUP_BYTES=20*1024*1024;
function checkedRecords(value:unknown):Member[]{
 if(!Array.isArray(value)||!value.every(valid))throw new Error('회원 기록 형식이 잘못됐거나 파일이 손상됐어요.');
 const ids=new Set<string>();
 for(const row of value){if(!row.id.trim()||!row.memberId.trim()||ids.has(row.id))throw new Error('회원 기록 ID가 없거나 중복됐어요.');ids.add(row.id);}
 return value;
}
async function checksum(records:Member[]){const bytes=new TextEncoder().encode(JSON.stringify(records));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');}
export function backupDate(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function backupFilename(now=new Date(),beforeRestore=false){return `bloom-high-${beforeRestore?'before-restore-':''}backup-${backupDate(now)}.json`;}
export function backupSummary(records:Member[]){const months=new Map<string,number>();for(const row of records)months.set(row.month,(months.get(row.month)||0)+1);return {members:new Set(records.map(r=>r.memberId)).size,records:records.length,months:[...months].sort(([a],[b])=>a.localeCompare(b)).map(([month,count])=>({month,count}))};}
export async function createBackup(records:Member[],now=new Date()){
 // Clone first so a caller cannot change records while the checksum is calculated.
 checkedRecords(records);
 const snapshot=checkedRecords(JSON.parse(JSON.stringify(records)));
 return JSON.stringify({format:BACKUP_FORMAT,version:1,storageKey:STORAGE_KEY,createdAt:now.toISOString(),checksum:await checksum(snapshot),records:snapshot},null,2);
}
export async function parseBackup(text:string):Promise<Member[]>{
 if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('20MB 이하의 백업 파일을 선택해 주세요.');
 let value;try{value=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('올바른 JSON 파일이 아니거나 파일이 손상됐어요.');}
 if(!value||value.format!==BACKUP_FORMAT||value.version!==1||value.storageKey!==STORAGE_KEY||typeof value.createdAt!=='string'||!Number.isFinite(Date.parse(value.createdAt))||typeof value.checksum!=='string'||!/^[a-f0-9]{64}$/.test(value.checksum))throw new Error('지원하는 Bloom High 백업 파일이 아니에요.');
 const records=checkedRecords(value.records);
 if(await checksum(records)!==value.checksum)throw new Error('백업 내용이 변경됐거나 손상됐어요. 기존 기록은 그대로 유지됩니다.');
 return records;
}
export async function restoreBackup(storage:StorageLike,text:string,expectedRaw:string|null){
 const records=await parseBackup(text);
 let latest;try{latest=storage.getItem(STORAGE_KEY);}catch{throw new Error('브라우저 저장소를 사용할 수 없어요.');}
 if(latest!==expectedRaw)throw new Error('미리 보기 이후 기존 기록이 변경됐어요. 파일을 다시 선택하고 확인해 주세요.');
 // One atomic localStorage write preserves every record ID and historical row.
 try{storage.setItem(STORAGE_KEY,JSON.stringify(records));}catch{throw new Error('복원하지 못했어요. 기존 기록은 그대로입니다. 브라우저 저장 공간과 저장 허용 설정을 확인해 주세요.');}
 return records;
}
export async function backupCurrent(storage:StorageLike,now=new Date()){return createBackup(readMembers(storage),now);}
