import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
const hex=(b:ArrayBuffer)=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function sign(secret:string,payload:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(payload)))}
Deno.serve(async(req)=>{
  try{
    const url=Deno.env.get('SUPABASE_URL')!,serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anonKey=Deno.env.get('SUPABASE_ANON_KEY')!;
    const token=req.headers.get('Authorization')?.replace('Bearer ','');if(!token)return new Response('Unauthorized',{status:401});
    const db=createClient(url,serviceKey,{auth:{persistSession:false}});
    if(token!==serviceKey){const userClient=createClient(url,anonKey,{global:{headers:{Authorization:`Bearer ${token}`}}});const {data:{user},error}=await userClient.auth.getUser(token);if(error||!user)return new Response('Unauthorized',{status:401});const {data:roles}=await db.from('platform_user_roles').select('role:roles(code)').eq('user_id',user.id);if(!(roles||[]).some((x:any)=>['super_admin','platform_admin'].includes(x.role?.code)))return new Response('Forbidden',{status:403});}
    const {data:events,error}=await db.from('outbox_events').select('*').eq('status','pending').lte('available_at',new Date().toISOString()).limit(30);if(error)throw error;let delivered=0,failed=0;
    for(const event of events||[]){await db.from('outbox_events').update({status:'processing',attempt_count:event.attempt_count+1}).eq('id',event.id);const {data:endpoints}=await db.from('webhook_endpoints').select('*').eq('status','active').contains('event_types',[event.event_type]).or(`school_id.is.null,school_id.eq.${event.school_id}`);let eventFailed=false;
      for(const ep of endpoints||[]){const body=JSON.stringify({id:event.id,type:event.event_type,school_id:event.school_id,created_at:event.created_at,data:event.payload});const secret=ep.secret_reference?Deno.env.get(ep.secret_reference)||'':'';try{const response=await fetch(ep.url,{method:'POST',headers:{'Content-Type':'application/json','X-SchoolDB-Event':event.event_type,'X-SchoolDB-Signature':secret?await sign(secret,body):''},body});await db.from('webhook_deliveries').insert({school_id:event.school_id,webhook_endpoint_id:ep.id,outbox_event_id:event.id,status:response.ok?'delivered':'failed',attempt_count:1,response_status:response.status,response_body:(await response.text()).slice(0,4000),delivered_at:response.ok?new Date().toISOString():null});if(!response.ok)eventFailed=true;}catch(e){eventFailed=true;await db.from('webhook_deliveries').insert({school_id:event.school_id,webhook_endpoint_id:ep.id,outbox_event_id:event.id,status:'failed',attempt_count:1,error_message:e instanceof Error?e.message:String(e)});}}
      await db.from('outbox_events').update({status:eventFailed?'failed':'processed',processed_at:eventFailed?null:new Date().toISOString(),last_error:eventFailed?'One or more webhook deliveries failed':null}).eq('id',event.id);eventFailed?failed++:delivered++;}
    return Response.json({events:(events||[]).length,delivered,failed});
  }catch(e){console.error(e);return Response.json({error:e instanceof Error?e.message:String(e)},{status:500})}
});
