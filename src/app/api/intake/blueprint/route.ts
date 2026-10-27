import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrUpdateDraftAssessment } from "@/lib/blueprint-assessments";
import { createNotification } from "@/lib/notifications";
import { sendBlueprintReceivedEmail, sendBlueprintOwnerAlerts } from "@/lib/email/service";
import { blueprintSections } from "@/app/(site)/body-blueprint/blueprint-fields";
import type { Prisma } from "@prisma/client";
export const runtime="nodejs";
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
  const results=await Promise.allSettled([
   sendBlueprintReceivedEmail({leadId:lead.id,firstName,email}),
   sendBlueprintOwnerAlerts({leadId:lead.id,firstName,lastName,email,phone:String(clean.phone||""),city:String(clean.city||"")})
  ]);
  for(const item of results){
   if(item.status==="rejected")console.error("Blueprint notification failed",item.reason);
   else if(Array.isArray(item.value)){
    for(const result of item.value)if(!result.success)console.error("Blueprint owner alert failed",result.error);
   }else if(!item.value.success)console.error("Blueprint client confirmation failed",item.value.error);
  }
  return NextResponse.json({success:true});
 }catch(err){console.error("Native Blueprint submission failed",err);return NextResponse.json({error:"We couldn't save your Blueprint. Please try again."},{status:500});}
}
