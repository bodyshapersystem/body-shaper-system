import {NextRequest,NextResponse} from "next/server";
import {getCurrentPortalClient} from "@/lib/permissions";
import {getOnboardingStatus} from "@/lib/onboarding";
import {prisma} from "@/lib/prisma";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {buildSignedIntakePdf} from "@/lib/prepare-intake-pdf";
import {createNotification} from "@/lib/notifications";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const client=await getCurrentPortalClient();
 if(!client)return NextResponse.json({error:"Please log in."},{status:401});
 const status=await getOnboardingStatus(client.id);
 if(!status.agreementComplete)return NextResponse.json({error:"Complete Prepare Your Experience™ first."},{status:403});
 if(status.consentComplete)return NextResponse.json({error:"Your medical consent has already been completed."},{status:409});
 let data:{formId?:string;answers?:Record<string,unknown>;signature?:string;consent?:boolean};
 try{data=await req.json();}catch{return NextResponse.json({error:"Invalid submission."},{status:400});}
 if(!data.consent||!data.signature?.trim()||data.signature.length>150||!data.answers||typeof data.answers!=="object"||Array.isArray(data.answers))return NextResponse.json({error:"Electronic signature, consent, and answers are required."},{status:400});
 const key=process.env.JOTFORM_API_KEY;
 if(!key)return NextResponse.json({error:"Medical waiver source unavailable."},{status:503});
 try{
  const l=await fetch("https://api.jotform.com/user/forms?limit=500",{headers:{APIKEY:key},cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(!l.ok)throw new Error("Medical waiver listing unavailable");
  const listing=await l.json() as {content?:{id:string;title?:string;url?:string}[]};
  const found=(listing.content||[]).find(x=>(x.url||"").includes("waiver---release-form"));
  if(!found||found.id!==data.formId)return NextResponse.json({error:"Unable to validate the official waiver version."},{status:400});
  const resp=await fetch("https://api.jotform.com/form/"+found.id+"/questions",{headers:{APIKEY:key},cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(!resp.ok)throw new Error("Cannot verify medical consent language");
  const d=await resp.json() as {content?:Record<string,{type?:string;text?:string;required?:string;options?:string;order?:string}>};
  const allowed=new Set(["control_fullname","control_email","control_phone","control_address","control_textbox","control_textarea","control_radio","control_checkbox","control_dropdown","control_datetime","control_number"]);
  const informational=new Set(["control_text","control_head","control_paragraph","control_pagebreak","control_button"]);
  const fields:{label:string;value:string}[]=[];
  const originalTexts:string[]=[];
  for(const [id,q] of Object.entries(d.content||{}).sort((a,b)=>Number(a[1].order||0)-Number(b[1].order||0))){
   if(informational.has(q.type||"")){if(q.text&&q.type!=="control_pagebreak")originalTexts.push(q.text);continue;}
   if(!allowed.has(q.type||""))return NextResponse.json({error:"The original waiver includes an unsupported field. Please contact your specialist so no consent is omitted."},{status:422});
   const v=data.answers[id];if(v!==undefined&&typeof v!=="string"&&!(Array.isArray(v)&&v.every(x=>typeof x==="string")))return NextResponse.json({error:"Invalid answer type."},{status:400});
   const options=q.options?.split("|").filter(Boolean)||[];
   const answer=Array.isArray(v)?v.join(", "):typeof v==="string"?v:"";
   if(answer.length>3000)return NextResponse.json({error:"An answer is too long."},{status:400});
   if(q.required==="Yes"&&!answer.trim())return NextResponse.json({error:"Complete all required consent fields."},{status:400});
   if(options.length&&answer){const selected=Array.isArray(v)?v:[v];if(selected.some(x=>!options.includes(String(x))))return NextResponse.json({error:"Invalid selection."},{status:400});}
   fields.push({label:q.text||id,value:answer});
  }
  const now=new Date(),ip=(req.headers.get("x-forwarded-for")||"").split(",")[0].slice(0,50),userAgent=(req.headers.get("user-agent")||"").slice(0,400);
  const {bytes,digest}=buildSignedIntakePdf({clientName:client.firstName+" "+client.lastName,fields:[...originalTexts.map(t=>({label:"ORIGINAL CONSENT TEXT",value:t})),...fields],signedName:data.signature.trim(),signedAt:now.toISOString(),ip,userAgent,version:found.id+" native v1"});
  const path=client.id+"/almost-done-"+Date.now()+"-"+digest.slice(0,10)+".pdf";
  const storage=createSupabaseAdminClient();
  const uploaded=await storage.storage.from("client-documents").upload(path,bytes,{contentType:"application/pdf",upsert:false});
  if(uploaded.error)throw uploaded.error;
  let doc;
  try{doc=await prisma.$transaction(async tx=>{
    await tx.formSubmission.create({data:{clientId:client.id,formType:"TREATMENT_WAIVER",status:"COMPLETED",completedAt:now,rawData:{source:"native",originalFormId:found.id,questions:fields,originalConsentTexts:originalTexts,signedName:data.signature!.trim(),signedAt:now.toISOString(),ip,userAgent,digest}}});
    return tx.document.create({data:{clientId:client.id,title:"Almost Done - Signed Medical Consent.pdf",category:"CONSENT_TREATMENT",visibility:"CLIENT_VISIBLE",storagePath:path,fileType:"application/pdf",sizeBytes:bytes.byteLength}});
  });}catch(err){await storage.storage.from("client-documents").remove([path]);throw err;}
  await createNotification({clientId:client.id,category:"FORMS",description:client.firstName+" "+client.lastName+" completed Almost Done™ Medical Consent",linkUrl:"/hub/clients/"+client.id+"?tab=documents"});
  return NextResponse.json({success:true,documentId:doc.id});
 }catch(err){console.error("Almost Done submission failed",err);return NextResponse.json({error:"Unable to securely save this medical consent. Please try again."},{status:500});}
}
