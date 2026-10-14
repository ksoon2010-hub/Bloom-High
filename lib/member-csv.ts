import type {Member} from './local-storage.ts';
import {MEMBER_STATUSES} from './member-stats.ts';
import {normalizeMemberName} from './member-names.ts';
export type CsvRow={month:string;name:string;status:string;tenureOverride:number|null};
export function parseMemberCsv(text:string):CsvRow[]{
 const grid:string[][]=[];let row:string[]=[],field='',quoted=false,closed=false;
 const input=text.replace(/^\uFEFF/,'');
 for(let i=0;i<input.length;i++){
  const c=input[i];
  if(quoted){if(c==='"'){if(input[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
  if(c==='"'){if(field||closed)throw new Error('CSV 따옴표 형식이 올바르지 않아요.');quoted=true;}
  else if(c===','||c==='\n'||c==='\r'){row.push(field);field='';closed=false;if(c!==','){if(c==='\r'&&input[i+1]==='\n')i++;grid.push(row);row=[];}}
  else{if(closed)throw new Error('CSV 따옴표 뒤에 잘못된 문자가 있어요.');field+=c;}
 }
 if(quoted)throw new Error('CSV 따옴표가 닫히지 않았어요.');
 if(field||row.length||closed){row.push(field);grid.push(row);}
 const header=grid.shift()?.map(s=>s.trim());const expected=['기준 월','회원 이름','상태','유지 개월'];
 if(!header||header.length!==4||!expected.every(h=>header.includes(h))||new Set(header).size!==4)throw new Error('열은 기준 월, 회원 이름, 상태, 유지 개월이어야 합니다.');
 const result:CsvRow[]=[];
 for(const [index,values] of grid.entries()){
  if(values.every(v=>!v.trim()))continue;
  const get=(key:string)=>values[header.indexOf(key)]?.trim()??'';
  const month=get('기준 월'),name=get('회원 이름'),status=get('상태'),tenure=get('유지 개월');
  const match=tenure.match(/^(\d+)\s*(?:개월)?$/);const n=match?Number(match[1]):null;
  if(values.length!==4||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||!name||name.length>60||!MEMBER_STATUSES.includes(status)||(!['','—'].includes(tenure)&&(!match||n===null||n>1200)))throw new Error(`${index+2}행의 월·이름·상태·유지 개월을 확인해 주세요. 파일은 저장하지 않았습니다.`);
  result.push({month,name,status,tenureOverride:n});
 }
 if(!result.length)throw new Error('가져올 회원 기록이 없어요.');
 if(result.length>500)throw new Error('한 번에 500건까지 가져올 수 있어요.');
 return result;
}
export function csvDuplicates(rows:CsvRow[],existing:Member[]):boolean[]{
 const seen=new Set(existing.map(r=>r.month+'|'+normalizeMemberName(r.name)));
 return rows.map(r=>{const key=r.month+'|'+normalizeMemberName(r.name);const duplicate=seen.has(key);seen.add(key);return duplicate;});
}
export function prepareCsvImport(rows:CsvRow[],existing:Member[],includeDuplicates:Set<number>):Member[]{
 const duplicates=csvDuplicates(rows,existing);
 return rows.flatMap((r,i)=>duplicates[i]&&!includeDuplicates.has(i)?[]:[{...r,id:crypto.randomUUID(),memberId:crypto.randomUUID(),note:'',hope:''}]);
}
