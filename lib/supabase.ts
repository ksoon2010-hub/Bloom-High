import {createClient} from '@supabase/supabase-js';
declare const __SUPABASE_URL__:string;
declare const __SUPABASE_PUBLIC_KEY__:string;
export const supabase=createClient(__SUPABASE_URL__,__SUPABASE_PUBLIC_KEY__,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'bloom-high-auth-v1'},
 global:{fetch:(input,init)=>fetch(input,{...init,signal:init?.signal?AbortSignal.any([init.signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)})},
});
