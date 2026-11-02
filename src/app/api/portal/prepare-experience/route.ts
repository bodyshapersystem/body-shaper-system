import {NextRequest,NextResponse} from "next/server";
import {getCurrentPortalClient} from "@/lib/permissions";
import {getOnboardingStatus} from "@/lib/onboarding";
import {prisma} from "@/lib/prisma";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {buildSignedIntakePdf} from "@/lib/prepare-intake-pdf";
import {createNotification} from "@/lib/notifications";
import {sendPrepareExperienceNotifications} from "@/lib/email/service";
import {PREPARE_VERSION,validatePrepare,prepareRecord,type Answers} from "@/lib/forms/onboarding-forms";
import {parseDrawnSignature,requestAudit} from "@/lib/forms/signature";
export const runtime="nodejs";

/** Prepare Your Experience™ — native BSS form (no third-party form provider). */
export async function POST(request:NextRequest){
 const client=await getCurrentPortalClient();
 if(!client)return NextResponse.json({error:"Please sign in to your Client Portal."},{status:401});
 if(client.clientType==="AMBASSADOR")return NextResponse.json({error:"Ambassadors must use their program-specific agreement."},{status:400});
 const status=await getOnboardingStatus(client.id);
 if(status.agreementComplete)return NextResponse.json({error:"Your evaluation has already been completed."},{status:409});
 let payload:{answers?:unknown;signedName?:unknown;signature?:unknown;agree?:unknown};
 try{payload=await request.json();}catch{return NextResponse.json({error:"Invalid submission."},{status:400});}
 const a=payload.answers;
 if(!a||typeof a!=="object"||Array.isArray(a))return NextResponse.json({error:"Answers missing."},{status:400});
 const answers=a as Answers;
 const signedName=typeof payload.signedName==="string"?payload.signedName.trim():"";
 if(payload.agree!==true||signedName.length<3||signedName.length>150)return NextResponse.json({error:"Please type your full legal name and accept the electronic signature."},{status:400});
 const sig=parseDrawnSignature(payload.signature);
 if(!sig.ok)return NextResponse.json({error:sig.error},{status:400});
 const invalid=validatePrepare(answers);
 if(invalid)return NextResponse.json({error:invalid},{status:400});
 if(String(answers["4"]).trim().toLowerCase()!==client.email.toLowerCase())return NextResponse.json({error:"Use the email address associated with your client portal."},{status:400});
 try{
  const fields=prepareRecord(answers);
  const now=new Date();
  const {ip,userAgent}=requestAudit(request.headers);
  const {bytes,digest}=buildSignedIntakePdf({clientName:client.firstName+" "+client.lastName,fields,signedName,signedAt:now.toISOString(),ip,userAgent,version:PREPARE_VERSION,signatureJpeg:sig.jpeg});
  const path=`${client.id}/prepare-experience-${Date.now()}-${digest.slice(0,12)}.pdf`;
  const storage=createSupabaseAdminClient();
  const upload=await storage.storage.from("client-documents").upload(path,bytes,{contentType:"application/pdf",upsert:false});
  if(upload.error)throw upload.error;
  let saved;
  try{
   saved=await prisma.$transaction(async tx=>{
    const form=await tx.formSubmission.create({data:{clientId:client.id,formType:"PREPARE_FOR_YOUR_EXPERIENCE",status:"COMPLETED",completedAt:now,rawData:{source:"native",formVersion:PREPARE_VERSION,answersById:answers,answers:fields,signedName,signedAt:now.toISOString(),ip,userAgent,digest}}});
    // fill blank profile fields only — never overwrite what the team already has
    const dob=/^\d{4}-\d{2}-\d{2}$/.test(String(answers["7"]))?new Date(String(answers["7"])+"T12:00:00Z"):null;
    const address=[answers["9_street"],answers["9_unit"],answers["9_city"],"FL",answers["9_zip"]].filter(x=>typeof x==="string"&&x.trim()).join(", ");
    await tx.client.update({where:{id:client.id},data:{...(!client.birthday&&dob&&!isNaN(dob.getTime())?{birthday:dob}:{}),...(!client.address&&address?{address}:{}),...(!client.phone?{phone:String(answers["8"])}:{})}});
    const document=await tx.document.create({data:{clientId:client.id,title:"Prepare Your Experience - Signed Evaluation.pdf",category:"POLICIES_APPOINTMENTS",visibility:"CLIENT_VISIBLE",storagePath:path,fileType:"application/pdf",sizeBytes:bytes.byteLength}});
    return {form,document};
   });
  }catch(e){await storage.storage.from("client-documents").remove([path]);throw e;}
  await createNotification({clientId:client.id,category:"FORMS",description:`${client.firstName} ${client.lastName} completed Prepare Your Experience™`,linkUrl:`/hub/clients/${client.id}?tab=documents`}).catch(e=>console.error("prepare notification",e));
  await Promise.allSettled([sendPrepareExperienceNotifications({clientId:client.id,firstName:client.firstName,lastName:client.lastName,email:client.email})]);
  return NextResponse.json({success:true,documentId:saved.document.id});
 }catch(e){console.error("Prepare Experience submit failed",e);return NextResponse.json({error:"We couldn't save your evaluation. Please try again."},{status:500});}
}
