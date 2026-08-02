import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
const ALLOWED:Record<string,string>={students:'students',employees:'employees',invoices:'invoices',payments:'payments',attendance:'student_attendance_records',results:'subject_results',library:'library_loans',inventory:'inventory_items'};
const csv=(rows:any[])=>{if(!rows.length)return'';const keys=[...new Set(rows.flatMap(Object.keys))];const q=(v:any)=>`"${String(typeof v==='object'?JSON.stringify(v):v??'').replaceAll('"','""')}"`;return [keys.map(q).join(','),...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\n')};
Deno.serve(async(req)=>{
  try{
    const url=Deno.env.get('SUPABASE_URL')!,serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anonKey=Deno.env.get('SUPABASE_ANON_KEY')!;
    const token=req.headers.get('Authorization')?.replace('Bearer ','');if(!token)return new Response('Unauthorized',{status:401});
    const db=createClient(url,serviceKey,{auth:{persistSession:false}});let callerId:string|null=null;let platformAdmin=token===serviceKey;
    if(!platformAdmin){const userClient=createClient(url,anonKey,{global:{headers:{Authorization:`Bearer ${token}`}}});const {data:{user},error}=await userClient.auth.getUser(token);if(error||!user)return new Response('Unauthorized',{status:401});callerId=user.id;const {data:roles}=await db.from('platform_user_roles').select('role:roles(code)').eq('user_id',user.id);platformAdmin=(roles||[]).some((x:any)=>['super_admin','platform_admin'].includes(x.role?.code));}
    const {jobId}=await req.json();const {data:job,error}=await db.from('export_jobs').select('*').eq('id',jobId).single();if(error)throw error;if(!platformAdmin&&job.requested_by!==callerId)return new Response('Forbidden',{status:403});
    const table=ALLOWED[job.export_type];if(!table)throw new Error('Unsupported export type');await db.from('export_jobs').update({status:'processing',started_at:new Date().toISOString()}).eq('id',job.id);const {data,error:queryError}=await db.from(table).select('*').eq('school_id',job.school_id).limit(100000);if(queryError)throw queryError;const content=csv(data||[]);const path=`${job.school_id}/${job.id}.csv`;const {error:uploadError}=await db.storage.from('exports').upload(path,new Blob([content],{type:'text/csv'}),{upsert:true});if(uploadError)throw uploadError;await db.from('export_jobs').update({status:'completed',completed_at:new Date().toISOString(),file_path:path,row_count:(data||[]).length}).eq('id',job.id);return Response.json({jobId:job.id,path,rows:(data||[]).length});
  }catch(e){console.error(e);return Response.json({error:e instanceof Error?e.message:String(e)},{status:500})}
});
