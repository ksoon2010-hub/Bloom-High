import assert from 'node:assert/strict';
import {readApiResponse,ApiResponseError} from '../lib/api-response.ts';
assert.deepEqual(await readApiResponse(Response.json([])),[]);
await assert.rejects(readApiResponse(new Response('<!DOCTYPE html><html>Login</html>',{headers:{'content-type':'text/html'}})),e=>e instanceof ApiResponseError&&!e.message.includes('Unexpected token'));
await assert.rejects(readApiResponse(Response.json({error:'expired'},{status:401})),e=>e.requiresSignIn===true);
const redirected=new Response('<!DOCTYPE html>',{headers:{'content-type':'text/html'}});Object.defineProperty(redirected,'redirected',{value:true});
await assert.rejects(readApiResponse(redirected),e=>e.requiresSignIn===true);
await assert.rejects(readApiResponse(new Response('bad',{headers:{'content-type':'application/json'}})),e=>e instanceof ApiResponseError);
console.log('API response checks passed: JSON, HTML, expired login, redirect, malformed response.');
