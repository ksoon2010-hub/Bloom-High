import {context} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
import {watch} from 'node:fs';
await mkdir('assets',{recursive:true});
await copyFile('app/globals.css','assets/app.css');
watch('app/globals.css',()=>{copyFile('app/globals.css','assets/app.css').catch(console.error);});
const ctx=await context({entryPoints:['app/main.tsx'],bundle:true,minify:true,format:'iife',platform:'browser',target:['es2020'],outfile:'assets/app.js',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
await ctx.watch();
const server=await ctx.serve({servedir:'.',host:'127.0.0.1',port:Number(process.env.PORT)||5174});
console.log(`Bloom High 개발 서버: http://127.0.0.1:${server.port}/`);
console.log('코드 변경은 자동으로 빌드됩니다. 브라우저를 새로고침하면 반영됩니다.');

