import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

Deno.serve(async(req)=>{
  try{
    const url=Deno.env.get('SUPABASE_URL')!;
    const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey=Deno.env.get('SUPABASE_ANON_KEY')!;
    const token=req.headers.get('Authorization')?.replace('Bearer ','');
    if(!token)return new Response('Unauthorized',{status:401});
    const service=createClient(url,serviceKey,{auth:{persistSession:false}});
    if(token!==serviceKey){
      const userClient=createClient(url,anonKey,{global:{headers:{Authorization:`Bearer ${token}`}}});
      const {data:{user},error}=await userClient.auth.getUser(token);if(error||!user)return new Response('Unauthorized',{status:401});
      const {data:roles}=await service.from('platform_user_roles').select('role:roles(code)').eq('user_id',user.id);
      if(!(roles||[]).some((x:any)=>['super_admin','platform_admin'].includes(x.role?.code)))return new Response('Forbidden',{status:403});
    }
    const now=new Date().toISOString();
    const {data:jobs,error}=await service.from('notification_deliveries').select('*').in('status',['queued','retry']).or(`last_attempt_at.is.null,last_attempt_at.lte.${now}`).limit(50);if(error)throw error;
    const endpoint=Deno.env.get('NOTIFICATION_PROVIDER_URL');const apiKey=Deno.env.get('NOTIFICATION_PROVIDER_KEY');let delivered=0,failed=0;
    for(const job of jobs||[]){try{await service.from('notification_deliveries').update({status:'processing',attempt_count:job.attempt_count+1,last_attempt_at:new Date().toISOString()}).eq('id',job.id);if(job.channel==='in_app'){await service.from('notification_deliveries').update({status:'delivered',delivered_at:new Date().toISOString()}).eq('id',job.id);delivered++;continue;}if(!endpoint)throw new Error('Notification provider not configured');const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(apiKey?{'Authorization':`Bearer ${apiKey}`}:{})},body:JSON.stringify(job)});if(!response.ok)throw new Error(`Provider HTTP ${response.status}`);const result=await response.json().catch(()=>({}));await service.from('notification_deliveries').update({status:'delivered',delivered_at:new Date().toISOString(),provider_message_id:result.id||null}).eq('id',job.id);delivered++;}catch(e){failed++;await service.from('notification_deliveries').update({status:'failed',failed_at:new Date().toISOString(),error_message:e instanceof Error?e.message:String(e)}).eq('id',job.id);}}
    return Response.json({processed:(jobs||[]).length,delivered,failed});
  }catch(e){console.error(e);return Response.json({error:e instanceof Error?e.message:String(e)},{status:500})}
});
