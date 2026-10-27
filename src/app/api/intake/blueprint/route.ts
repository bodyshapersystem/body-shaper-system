import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrUpdateDraftAssessment } from "@/lib/blueprint-assessments";
import { createNotification } from "@/lib/notifications";
import { sendBlueprintReceivedEmail } from "@/lib/email/service";
import { getResendClient, SENDERS } from "@/lib/email/resend";
import { blueprintSections } from "@/app/(site)/body-blueprint/blueprint-fields";
import type { Prisma } from "@prisma/client";
export const runtime="nodejs";
const DESTINATIONS=["beautyboxmia@gmail.com","bodyshapersystem@gmail.com"];
export async function POST(req:NextRequest){
 let data:Record<string,unknown>;
 try{data=await req.json();}catch{return NextResponse.json({error:"Invalid form data."},{status:400});}
 if(data.website)return NextResponse.json({success:true});
 const validIds=new Set<string>(blueprintSections.flatMap(s=>s.fields.map(f=>f.id)));
 const clean:Record<string,string|string[]>={};
 for(const [k,v] of Object.entries(data)){
  if(!validIds.has(k))continue;
  if(typeof v==="string")clean[k]=v.trim().slice(0,3000);
  if(Array.isArray(v)&&v.every(x=>typeof x==="string"))clean[k]=v.slice(0,30).map(x=>x.slice(0,200));
 }
 for(const s of blueprintSections)for(const f of s.fields){
  if("required" in f&&f.required){
   const val=clean[f.id];
   if(!val||(Array.isArray(val)?val.length===0:!val.trim()))return NextResponse.json({error:"Please complete all required fields."},{status:400});
  }
 }
 const firstName=String(clean.firstName||""),lastName=String(clean.lastName||""),email=String(clean.email||"").toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||firstName.length>150||lastName.length>150)return NextResponse.json({error:"Please enter a valid name and email address."},{status:400});
 try{
  const existing=await prisma.lead.findFirst({where:{email:{equals:email,mode:"insensitive"},archivedAt:null},orderBy:{createdAt:"desc"}});
  const goals=Array.isArray(clean.goals)?clean.goals.join(", "):undefined;
  const lead=existing?await prisma.lead.update({where:{id:existing.id},data:{firstName,lastName,phone:String(clean.phone||""),city:String(clean.city||""),goals,status:"BLUEPRINT_COMPLETED"}}):await prisma.lead.create({data:{firstName,lastName,email,phone:String(clean.phone||""),city:String(clean.city||""),goals,status:"BLUEPRINT_COMPLETED",source:"website:native-blueprint"}});
  await createOrUpdateDraftAssessment(lead.id,{jotformRawData:{source:"native-blueprint",version:1,answers:clean} as Prisma.InputJsonValue,goals,treatmentInterests:Array.isArray(clean.areas)?clean.areas.join(", "):undefined});
  await prisma.leadStatusHistory.create({data:{leadId:lead.id,fromStatus:existing?.status,toStatus:"BLUEPRINT_COMPLETED",note:"Native Blueprint submission from website"}});
  await createNotification({category:"FORMS",description:`New Blueprint submitted by ${firstName} ${lastName}`,linkUrl:`/hub/leads/${lead.id}`});
  const results=await Promise.allSettled([sendBlueprintReceivedEmail({leadId:lead.id,firstName,email}),...DESTINATIONS.map(to=>getResendClient().emails.send({from:SENDERS.owner,to,subject:`New Body Blueprint™ lead: ${firstName} ${lastName}`,html:`<h2>New Body Blueprint™ submission</h2><p><b>Name:</b> ${escapeHtml(firstName+" "+lastName)}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Phone:</b> ${escapeHtml(String(clean.phone||""))}</p><p><b>Location:</b> ${escapeHtml(String(clean.city||""))}</p><p>For the full answers, open the protected <a href="https://www.bodyshapersystem.com/hub/leads/${encodeURIComponent(lead.id)}">Owner Hub lead profile</a>.</p>`}))]);
  results.forEach((r,i)=>{if(r.status==="rejected"||(r.status==="fulfilled"&&r.value&&"error" in r.value&&r.value.error))console.error("Blueprint email delivery issue",i);});
  return NextResponse.json({success:true});
 }catch(err){console.error("Native Blueprint submission failed",err);return NextResponse.json({error:"We couldn't save your Blueprint. Please try again."},{status:500});}
}
function escapeHtml(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
