import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('assets',{recursive:true});
await build({entryPoints:['app/main.tsx'],bundle:true,minify:true,format:'iife',platform:'browser',target:['es2020'],outfile:'assets/app.js',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
await copyFile('app/globals.css','assets/app.css');
console.log('완료: index.html과 assets 폴더를 GitHub Pages에 올릴 수 있습니다.');
