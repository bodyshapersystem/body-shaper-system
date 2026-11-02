import {NextRequest,NextResponse} from "next/server";
import {getCurrentPortalClient} from "@/lib/permissions";
import {getOnboardingStatus} from "@/lib/onboarding";
import {prisma} from "@/lib/prisma";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {buildSignedIntakePdf} from "@/lib/prepare-intake-pdf";
import {createNotification} from "@/lib/notifications";
import {sendWaiverNotifications} from "@/lib/email/service";
import {WAIVER_VERSION,WAIVER_TITLE,validateWaiver,waiverRecord,type Answers} from "@/lib/forms/onboarding-forms";
import {parseDrawnSignature,requestAudit} from "@/lib/forms/signature";
export const runtime="nodejs";

/** Almost Ready™ — Client Agreement / Waiver. Native BSS form, verbatim legal text, drawn signature. */
export async function POST(req:NextRequest){
 const client=await getCurrentPortalClient();
 if(!client)return NextResponse.json({error:"Please log in."},{status:401});
 const status=await getOnboardingStatus(client.id);
 if(!status.agreementComplete)return NextResponse.json({error:"Complete Prepare Your Experience™ first."},{status:403});
 if(status.consentComplete)return NextResponse.json({error:"Your agreement has already been signed."},{status:409});
 let data:{answers?:unknown;firstName?:unknown;lastName?:unknown;signature?:unknown;agree?:unknown};
 try{data=await req.json();}catch{return NextResponse.json({error:"Invalid submission."},{status:400});}
 if(!data.answers||typeof data.answers!=="object"||Array.isArray(data.answers))return NextResponse.json({error:"Answers missing."},{status:400});
 const answers=data.answers as Answers;
 const first=typeof data.firstName==="string"?data.firstName.trim():"";
 const last=typeof data.lastName==="string"?data.lastName.trim():"";
 if(data.agree!==true||!first||!last||first.length>80||last.length>80)return NextResponse.json({error:"Please enter your name and accept the electronic signature."},{status:400});
 const sig=parseDrawnSignature(data.signature);
 if(!sig.ok)return NextResponse.json({error:sig.error},{status:400});
 const invalid=validateWaiver(answers);
 if(invalid)return NextResponse.json({error:invalid},{status:400});
 try{
  const now=new Date();
  const today=now.toLocaleDateString("en-US",{timeZone:"America/New_York",month:"2-digit",day:"2-digit",year:"numeric"});
  const fields=[{label:"Email",value:client.email},...waiverRecord(answers),{label:"Client Name",value:`${first} ${last}`},{label:"Today's Date",value:today}];
  const {ip,userAgent}=requestAudit(req.headers);
  const signedName=`${first} ${last}`;
  const {bytes,digest}=buildSignedIntakePdf({title:["BODY SHAPER SYSTEM - ALMOST READY","CLIENT AGREEMENT - WAIVER - RELEASE OF LIABILITY - ASSUMPTION OF RISK - INFORMED CONSENT"],clientName:client.firstName+" "+client.lastName,fields,signedName,signedAt:now.toISOString(),ip,userAgent,version:WAIVER_VERSION,signatureJpeg:sig.jpeg});
  const path=client.id+"/almost-done-"+Date.now()+"-"+digest.slice(0,10)+".pdf";
  const storage=createSupabaseAdminClient();
  const uploaded=await storage.storage.from("client-documents").upload(path,bytes,{contentType:"application/pdf",upsert:false});
  if(uploaded.error)throw uploaded.error;
  let doc;
  try{doc=await prisma.$transaction(async tx=>{
    await tx.formSubmission.create({data:{clientId:client.id,formType:"TREATMENT_WAIVER",status:"COMPLETED",completedAt:now,rawData:{source:"native",formVersion:WAIVER_VERSION,title:WAIVER_TITLE,answersById:answers,questions:fields,marketingConsent:String(answers["s5_marketing"]),signedName,signedAt:now.toISOString(),ip,userAgent,digest}}});
    return tx.document.create({data:{clientId:client.id,title:"Almost Done - Signed Medical Consent.pdf",category:"CONSENT_TREATMENT",visibility:"CLIENT_VISIBLE",storagePath:path,fileType:"application/pdf",sizeBytes:bytes.byteLength}});
  });}catch(err){await storage.storage.from("client-documents").remove([path]);throw err;}
  await createNotification({clientId:client.id,category:"FORMS",description:client.firstName+" "+client.lastName+" signed Almost Ready™ Client Agreement",linkUrl:"/hub/clients/"+client.id+"?tab=documents"}).catch(e=>console.error("waiver notification",e));
  await Promise.allSettled([sendWaiverNotifications({clientId:client.id,firstName:client.firstName,lastName:client.lastName,email:client.email,marketing:String(answers["s5_marketing"])})]);
  return NextResponse.json({success:true,documentId:doc.id});
 }catch(err){console.error("Almost Ready submission failed",err);return NextResponse.json({error:"Unable to securely save your agreement. Please try again."},{status:500});}
}
