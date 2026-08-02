"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
export async function changePasswordAction(formData: FormData) { const parsed=z.object({password:z.string().min(10),confirm:z.string()}).refine((v:{password:string;confirm:string})=>v.password===v.confirm,{message:"Passwords do not match"}).safeParse(Object.fromEntries(formData)); if(!parsed.success) redirect(`/change-password?error=${encodeURIComponent(parsed.error.issues[0]?.message??"Invalid password")}`); const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login"); const {error}=await supabase.auth.updateUser({password:parsed.data.password}); if(error) redirect(`/change-password?error=${encodeURIComponent(error.message)}`); await (supabase.from("profiles") as any).update({must_change_password:false,updated_at:new Date().toISOString()}).eq("id",user.id); redirect("/app"); }
