import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';

export function publicDefines() {
 let local={};
 try {local=parseEnv(readFileSync(new URL('../.env.local',import.meta.url),'utf8'));}
 catch(e) {if(e.code!=='ENOENT')throw new Error('공개 연결 설정 파일을 읽을 수 없습니다.');}
 const url=process.env.SUPABASE_URL||local.SUPABASE_URL;
 const key=process.env.SUPABASE_PUBLISHABLE_KEY||local.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error('SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY 설정이 필요합니다.');
 // Only publishable keys or legacy JWTs explicitly bearing the anon role may ship.
 let allowed=key.startsWith('sb_publishable_');
 if(!allowed){try{allowed=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon';}catch{}}
 if(!allowed)throw new Error('anon 또는 publishable key만 사용할 수 있습니다.');
 if(url!=='https://dmehctjwutquccrdamqe.supabase.co')throw new Error('Supabase 프로젝트 URL을 확인해 주세요.');
 return {'process.env.NODE_ENV':'"production"','__SUPABASE_URL__':JSON.stringify(url),'__SUPABASE_PUBLIC_KEY__':JSON.stringify(key)};
}
