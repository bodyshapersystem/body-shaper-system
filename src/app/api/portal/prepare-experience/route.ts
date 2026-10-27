import {NextRequest,NextResponse} from "next/server";
import {getCurrentPortalClient} from "@/lib/permissions";
import {prisma} from "@/lib/prisma";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {buildSignedIntakePdf} from "@/lib/prepare-intake-pdf";
import {createNotification} from "@/lib/notifications";
import {sendPrepareExperienceNotifications} from "@/lib/email/service";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const client=await getCurrentPortalClient();
 if(!client)return NextResponse.json({error:"Please sign in to your Client Portal."},{status:401});
 if(client.clientType==="AMBASSADOR")return NextResponse.json({error:"Ambassadors must use their program-specific agreement."},{status:400});
 let payload:{values?:Record<string,unknown>;signature?:string;agree?:boolean;formVersion?:string};
 try{payload=await request.json();}catch{return NextResponse.json({error:"Invalid submission."},{status:400});}
 if(!payload.agree||!payload.signature?.trim()||payload.signature.length>150||payload.formVersion!=="261860243106046")return NextResponse.json({error:"Electronic signature and consent are required."},{status:400});
 const value=payload.values;
 if(!value||typeof value!=="object"||Array.isArray(value))return NextResponse.json({error:"Answers missing."},{status:400});
 const apiKey=process.env.JOTFORM_API_KEY;
 if(!apiKey)return NextResponse.json({error:"Original form definition unavailable."},{status:503});
 try{
  const response=await fetch("https://api.jotform.com/form/261860243106046/questions",{headers:{APIKEY:apiKey},cache:"no-store",signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error("Unable to validate original form");
  const definition=await response.json() as {content?:Record<string,{type?:string;text?:string;required?:string;options?:string;order?:string}>};
  const all=Object.entries(definition.content||{}).sort((a,b)=>Number(a[1].order)-Number(b[1].order));
  const fields:{label:string;value:string}[]=[];
  const supported=new Set(["control_fullname","control_email","control_datetime","control_phone","control_address","control_textbox","control_radio","control_checkbox","control_textarea"]);
  for(const [id,q] of all){
   if(!q.type||!supported.has(q.type))continue;
   const v=value[id];
   if(v!==undefined&&typeof v!=="string"&&!(Array.isArray(v)&&v.every(x=>typeof x==="string")))return NextResponse.json({error:"Invalid field type."},{status:400});
   const answer=Array.isArray(v)?v.join(", "):v||"";
   if(typeof answer!=="string"||answer.length>3500)return NextResponse.json({error:"Answer exceeds the allowed length."},{status:400});
   // Match conditional question visibility from the original treatment questionnaire.
   const conditional:Record<string,boolean>={
    "104":Array.isArray(value["103"])&&value["103"].includes("Postpartum"),
    "105":value["94"]==="Yes","96":value["94"]==="Yes",
    "98":value["97"]==="Yes",
    "100":!!value["99"]&&value["99"]!=="No.",
    "101":!!value["99"]&&value["99"]!=="No.",
    "102":!!value["99"]&&value["99"]!=="No."
   };
   if(id in conditional&&!conditional[id])continue;
   if(q.required==="Yes"&&!answer.trim())return NextResponse.json({error:"Please complete all required fields."},{status:400});
   if((q.type==="control_radio"||q.type==="control_checkbox")&&answer){
    const options=q.options?.split("|")||[];
    const items=Array.isArray(v)?v:[v];
    if(items.some(x=>!options.includes(x as string)))return NextResponse.json({error:"Invalid selected option."},{status:400});
   }
   fields.push({label:q.text||id,value:answer});
  }
  const email=String(value["4"]||"").trim().toLowerCase();
  if(email!==client.email.toLowerCase())return NextResponse.json({error:"Use the email address associated with your client portal."},{status:400});
  const now=new Date();
  const ip=(request.headers.get("x-forwarded-for")||"").split(",")[0].trim().slice(0,50);
  const userAgent=(request.headers.get("user-agent")||"").slice(0,400);
  const {bytes,digest}=buildSignedIntakePdf({clientName:client.firstName+" "+client.lastName,fields,signedName:payload.signature.trim(),signedAt:now.toISOString(),ip,userAgent,version:"Jotform 261860243106046 / Native V1"});
  const path=`${client.id}/prepare-experience-${Date.now()}-${digest.slice(0,12)}.pdf`;
  const storage=createSupabaseAdminClient();
  const upload=await storage.storage.from("client-documents").upload(path,bytes,{contentType:"application/pdf",upsert:false});
  if(upload.error)throw upload.error;
  let saved;
  try{
   saved=await prisma.$transaction(async tx=>{
    const form=await tx.formSubmission.create({data:{clientId:client.id,formType:"PREPARE_FOR_YOUR_EXPERIENCE",status:"COMPLETED",completedAt:now,rawData:{source:"native",formVersion:"261860243106046",answers:fields,signedName:payload.signature!.trim(),signedAt:now.toISOString(),ip,userAgent,digest}}});
    const document=await tx.document.create({data:{clientId:client.id,title:"Prepare Your Experience - Signed Evaluation.pdf",category:"POLICIES_APPOINTMENTS",visibility:"CLIENT_VISIBLE",storagePath:path,fileType:"application/pdf",sizeBytes:bytes.byteLength}});
    return {form,document};
   });
  }catch(e){await storage.storage.from("client-documents").remove([path]);throw e;}
  await createNotification({clientId:client.id,category:"FORMS",description:`${client.firstName} ${client.lastName} completed Prepare Your Experience™`,linkUrl:`/hub/clients/${client.id}?tab=documents`});
  await Promise.allSettled([sendPrepareExperienceNotifications({clientId:client.id,firstName:client.firstName,lastName:client.lastName,email:client.email})]);
  return NextResponse.json({success:true,documentId:saved.document.id});
 }catch(e){console.error("Prepare Experience submit failed",e);return NextResponse.json({error:"We couldn't save your evaluation. Please try again."},{status:500});}
}
