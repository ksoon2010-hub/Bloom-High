import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
import React from 'react';
import {create,act} from 'react-test-renderer';
import {checkCenterAccess,CENTER_ID} from '../lib/center-access.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const calls=[];
let listener,queryResult,queryPromise,loginError=null,logoutError=null,currentSession=null;
const session={user:{id:'test-user',email:'example@example.invalid'},expires_at:Math.floor(Date.now()/1000)+3600};
const client={
 from(table){calls.push(['from',table]);return {
  select(columns){calls.push(['select',columns]);return this;},
  eq(column,value){calls.push(['eq',column,value]);return this;},
  abortSignal(){return this;},
  maybeSingle(){return queryPromise||Promise.resolve(queryResult);},
 };},
 auth:{
  onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){listener=null;}}}};},
  async getSession(){return {data:{session:currentSession},error:null};},
  async signInWithPassword(){if(!loginError){currentSession=session;listener('SIGNED_IN',session);}return {error:loginError};},
  async signOut(options){assert.deepEqual(options,{scope:'local'});if(!logoutError){currentSession=null;listener('SIGNED_OUT',null);}return {error:logoutError};},
 },
};
globalThis.__bloomTestClient=client;
const storage=new Map([['bloom-members-v1','existing-member-data-sentinel']]);
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem(){throw Error('Unexpected storage write');},removeItem(){throw Error('Unexpected storage delete');},clear(){throw Error('Unexpected storage clear');}};
queryResult={data:{id:CENTER_ID},error:null};
assert.equal(await checkCenterAccess(client,new AbortController().signal),true);
assert.deepEqual(calls.splice(0),[['from','bloom_high_centers'],['select','id'],['eq','id',CENTER_ID]]);
queryResult={data:null,error:null};assert.equal(await checkCenterAccess(client,new AbortController().signal),false);
queryResult={data:null,error:{message:'failure'}};await assert.rejects(checkCenterAccess(client,new AbortController().signal));

await mkdir('work',{recursive:true});
const output=await build({entryPoints:['app/auth-gate.tsx'],bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external',external:['react','react/*'],write:false,plugins:[{
 name:'mock-auth-and-members',setup(builder){
  builder.onResolve({filter:/lib\/supabase$/},()=>({path:'supabase',namespace:'mock'}));
  builder.onResolve({filter:/^\.\/page$/},()=>({path:'home',namespace:'mock'}));
  builder.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:args.path==='supabase'?'export const supabase=globalThis.__bloomTestClient;':'import React from "react"; export default function Home(){return React.createElement("div",null,"MEMBER_SCREEN");}'}));
 }
}]});
await writeFile('work/auth-test.mjs',output.outputFiles[0].text);
const {AuthGate}=await import('../work/auth-test.mjs');
const tick=()=>new Promise(resolve=>setTimeout(resolve,30));
let root;
const text=()=>JSON.stringify(root.toJSON());
const event=async(next)=>{currentSession=next;await act(async()=>{listener(next?'SIGNED_IN':'SIGNED_OUT',next);await tick();});};
const click=async(label)=>{await act(async()=>{const button=root.root.findAllByType('button').find(b=>b.children.join('')===label);assert.ok(button,label);await button.props.onClick();await tick();});await act(tick);};
await act(async()=>{root=create(React.createElement(AuthGate));await tick();});
assert.match(text(),/센터 관리자 로그인/);assert.doesNotMatch(text(),/MEMBER_SCREEN/);
await act(async()=>{root.root.findByProps({type:'email'}).props.onChange({target:{value:'example@example.invalid'}});root.root.findByProps({type:'password'}).props.onChange({target:{value:'fake-password'}});});
loginError={status:400};
await act(async()=>{await root.root.findByType('form').props.onSubmit({preventDefault(){}});});
assert.match(text(),/이메일 또는 비밀번호/);assert.equal(root.root.findByProps({type:'password'}).props.value,'');
loginError=null;queryResult={data:{id:CENTER_ID},error:null};
await act(async()=>{await root.root.findByType('form').props.onSubmit({preventDefault(){}});await tick();});
assert.match(text(),/MEMBER_SCREEN/);
await click('로그아웃');assert.match(text(),/센터 관리자 로그인/);assert.doesNotMatch(text(),/MEMBER_SCREEN/);
queryResult={data:null,error:null};await event(session);assert.match(text(),/센터 접근 권한이 없어요/);assert.doesNotMatch(text(),/MEMBER_SCREEN/);
queryResult={data:null,error:{message:'network'}};await click('다시 확인');assert.match(text(),/연결을 확인해 주세요/);assert.doesNotMatch(text(),/MEMBER_SCREEN/);
queryResult={data:{id:CENTER_ID},error:null};await click('다시 확인');assert.match(text(),/MEMBER_SCREEN/);
logoutError={message:'offline'};await click('로그아웃');assert.match(text(),/로그아웃하지 못했어요/);assert.doesNotMatch(text(),/MEMBER_SCREEN/);logoutError=null;await click('로그아웃');
let resolveQuery;queryPromise=new Promise(resolve=>{resolveQuery=resolve;});await event(session);assert.doesNotMatch(text(),/MEMBER_SCREEN/);await event(null);
await act(async()=>{resolveQuery({data:{id:CENTER_ID},error:null});await tick();});assert.match(text(),/센터 관리자 로그인/);assert.doesNotMatch(text(),/MEMBER_SCREEN/);queryPromise=null;
await act(async()=>root.unmount());
client.auth.getSession=async()=>({data:{session},error:null});
await act(async()=>{root=create(React.createElement(AuthGate));await tick();});await act(tick);assert.match(text(),/MEMBER_SCREEN/);
await event({...session,expires_at:Math.floor(Date.now()/1000)+1});
client.auth.getSession=async()=>({data:{session:null},error:null});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,1100));});await act(tick);assert.match(text(),/센터 관리자 로그인/);
await act(async()=>root.unmount());
assert.equal(storage.get('bloom-members-v1'),'existing-member-data-sentinel');
assert.ok(calls.every(([operation,target])=>operation!=='from'||target==='bloom_high_centers'));
console.log('Auth passed: login failure/success, restore, expiry, RLS denial, network error, retry, logout, stale response, unchanged member storage.');
