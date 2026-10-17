import type {SupabaseClient} from '@supabase/supabase-js';
export const CENTER_ID='b1000000-0000-4000-8000-000000000001';
export async function checkCenterAccess(client:SupabaseClient,signal:AbortSignal) {
 const {data,error}=await client.from('bloom_high_centers').select('id').eq('id',CENTER_ID).abortSignal(signal).maybeSingle();
 if(error)throw new Error('센터 권한을 확인하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');
 return data?.id===CENTER_ID;
}
