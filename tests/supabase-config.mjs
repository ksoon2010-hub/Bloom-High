import assert from 'node:assert/strict';
import {publicDefines} from '../scripts/supabase-config.mjs';
const previousUrl=process.env.SUPABASE_URL,previousKey=process.env.SUPABASE_PUBLISHABLE_KEY;
try{
 process.env.SUPABASE_URL='https://dmehctjwutquccrdamqe.supabase.co';
 process.env.SUPABASE_PUBLISHABLE_KEY='sb_publishable_test_only';
 assert.deepEqual(Object.keys(publicDefines()).sort(),['__SUPABASE_PUBLIC_KEY__','__SUPABASE_URL__','process.env.NODE_ENV']);
 process.env.SUPABASE_PUBLISHABLE_KEY='sb_secret_test_only';assert.throws(publicDefines,/anon 또는 publishable/);
 process.env.SUPABASE_PUBLISHABLE_KEY=`test.${Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')}.test`;assert.throws(publicDefines,/anon 또는 publishable/);
 process.env.SUPABASE_PUBLISHABLE_KEY=`test.${Buffer.from(JSON.stringify({role:'anon'})).toString('base64url')}.test`;assert.doesNotThrow(publicDefines);
 process.env.SUPABASE_URL='https://other-project.invalid';assert.throws(publicDefines,/프로젝트 URL/);
}finally{
 if(previousUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previousUrl;
 if(previousKey===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=previousKey;
}
console.log('Public config passed: only two public values, secret/service_role rejection, project URL validation.');
