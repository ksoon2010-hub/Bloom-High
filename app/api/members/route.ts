import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { members } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';
import {MEMBER_STATUSES} from '../../../lib/member-stats';
export async function GET() {
 const u=await getChatGPTUser(); if(!u) return Response.json({error:'로그인이 필요합니다.'},{status:401});
 return Response.json(await getDb().select().from(members).where(eq(members.owner,`email:${u.email}`)),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request) {
 const u=await getChatGPTUser(); if(!u) return Response.json({error:'로그인이 필요합니다.'},{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin) return Response.json({error:'잘못된 요청입니다.'},{status:403});
 let body: any; try {body=await req.json();} catch {return Response.json({error:'입력을 확인해 주세요.'},{status:400});}
 if(!body || typeof body!=='object') return Response.json({error:'입력을 확인해 주세요.'},{status:400});
 const {action,rows,id}=body;
 const db=getDb();
 if(action==='delete' && typeof id==='string') {await db.delete(members).where(and(eq(members.id,id),eq(members.owner,`email:${u.email}`)));return Response.json({ok:true});}
 if(!Array.isArray(rows)||!rows.length||rows.length>500) return Response.json({error:'입력을 확인해 주세요.'},{status:400});
 for(const r of rows) if(!r || typeof r.id!=='string'||typeof r.memberId!=='string'||typeof r.name!=='string'||!r.name.trim()||r.name.length>60||!/^\d{4}-(0[1-9]|1[0-2])$/.test(r.month)||!MEMBER_STATUSES.includes(r.status)||typeof r.note!=='string'||r.note.length>500||(r.tenureOverride!=null&&(!Number.isInteger(r.tenureOverride)||r.tenureOverride<0||r.tenureOverride>1200))||typeof r.hope!=='string'||r.hope.length>1000) return Response.json({error:'입력을 확인해 주세요.'},{status:400});
 // Check ownership before any update; row IDs remain stable within this user's data.
 const owned=await db.select().from(members).where(eq(members.owner,`email:${u.email}`));
 for(const r of rows) {
  const existing=await db.select().from(members).where(eq(members.id,r.id));
  if(existing.length && !owned.some(x=>x.id===r.id)) return Response.json({error:'접근할 수 없습니다.'},{status:403});
 }
 const queries=rows.map(r=>db.insert(members).values({...r,name:r.name.trim(),owner:`email:${u.email}`}).onConflictDoUpdate({target:members.id,set:{name:r.name.trim(),status:r.status,note:r.note,hope:r.hope,tenureOverride:r.tenureOverride??null},setWhere:eq(members.owner,`email:${u.email}`)}));
 await db.batch(queries as any); return Response.json({ok:true});
}
