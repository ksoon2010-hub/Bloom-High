import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';
import {checkCenterAccess} from '../lib/center-access';
import Home from './page';

type Status='checking'|'login'|'allowed'|'denied'|'error';
export function AuthGate(){
 const [status,setStatus]=useState<Status>('checking'),[session,setSession]=useState<Session|null>(null);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
 const generation=useRef(0);
 useEffect(()=>{
  if(status!=='allowed'||!session?.expires_at)return;
  const timer=setTimeout(()=>{setStatus('checking');setRetry(n=>n+1);},Math.max(0,session.expires_at*1000-Date.now()));
  return()=>clearTimeout(timer);
 },[status,session]);
 useEffect(()=>{
  let active=true;
  let controller:AbortController|undefined;
  const apply=(next:Session|null)=>{
   const ticket=++generation.current;
   controller?.abort();
   setSession(next);setMessage('');setStatus(next?'checking':'login');
   if(!next)return;
   // Defer database work until the auth callback has released its lock.
   setTimeout(async()=>{
    if(!active||ticket!==generation.current)return;
    controller=new AbortController();
    const timeout=setTimeout(()=>controller?.abort(),15000);
    try{
     const allowed=await checkCenterAccess(supabase,controller.signal);
     if(active&&ticket===generation.current)setStatus(allowed?'allowed':'denied');
    }catch{
     if(active&&ticket===generation.current){setMessage('센터 권한을 확인하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.');setStatus('error');}
    }finally{clearTimeout(timeout);}
   },0);
  };
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{if(active)apply(next);});
  const initial=generation.current;
  supabase.auth.getSession().then(({data,error})=>{
   if(!active||generation.current!==initial)return;
   if(error){setMessage('로그인 상태를 확인하지 못했어요. 다시 시도해 주세요.');setStatus('error');}
   else apply(data.session);
  }).catch(()=>{if(active&&generation.current===initial){setMessage('로그인 서버에 연결하지 못했어요. 다시 시도해 주세요.');setStatus('error');}});
  return()=>{active=false;++generation.current;controller?.abort();subscription.unsubscribe();};
 },[retry]);
 async function login(event:FormEvent){
  event.preventDefault();setBusy(true);setMessage('');
  try{
   const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
   if(error)setMessage(error.status===400||error.status===401||error.status===422?'이메일 또는 비밀번호를 확인해 주세요.':'로그인하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.');
  }catch{setMessage('로그인 서버에 연결하지 못했어요. 다시 시도해 주세요.');}
  finally{setPassword('');setBusy(false);}
 }
 async function logout(){
  ++generation.current;setStatus('checking');setBusy(true);setMessage('');
  try{
   const {error}=await supabase.auth.signOut({scope:'local'});
   if(error)throw error;
   setSession(null);setStatus('login');setPassword('');
  }catch{setMessage('로그아웃하지 못했어요. 연결을 확인하고 다시 시도해 주세요.');setStatus('error');}
  finally{setBusy(false);}
 }
 if(status==='allowed')return <><div className="auth-account"><span>{session?.user.email}</span><button onClick={logout} disabled={busy}>로그아웃</button></div><Home key={session?.user.id}/></>;
 return <main className="auth-shell"><section className="auth-card" aria-labelledby="auth-title">
  <img src="./public/bloom-high-summit.png" alt=""/><p className="eyebrow">BLOOM HIGH</p>
  <h1 id="auth-title">{status==='login'?'센터 관리자 로그인':status==='checking'?'접근 권한 확인 중':status==='denied'?'센터 접근 권한이 없어요':'연결을 확인해 주세요'}</h1>
  {status==='checking'&&<p role="status">로그인 상태와 센터 권한을 확인하고 있어요.</p>}
  {status==='login'&&<form onSubmit={login}><label className="field">이메일<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label><label className="field">비밀번호<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/></label><button className="primary" disabled={busy}>{busy?'로그인 중…':'로그인'}</button></form>}
  {status==='denied'&&<p>이 계정으로 접근할 수 있는 센터가 없거나 센터를 찾을 수 없어요. 관리자에게 확인해 주세요.</p>}
  {message&&<p role="alert" className="form-error">{message}</p>}
  {(status==='error'||status==='denied')&&<div className="auth-actions"><button className="primary" disabled={busy} onClick={()=>{setStatus('checking');setRetry(n=>n+1)}}>다시 확인</button>{session&&<button disabled={busy} onClick={logout}>로그아웃</button>}</div>}
  <p className="auth-note">회원 기록은 이 브라우저에 보관됩니다.</p>
 </section></main>;
}
