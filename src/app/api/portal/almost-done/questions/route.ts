import {NextResponse} from "next/server";
import {getCurrentPortalClient} from "@/lib/permissions";
export const dynamic="force-dynamic";
export async function GET(){
 const client=await getCurrentPortalClient();
 if(!client)return NextResponse.json({error:"Login required"},{status:401});
 const key=process.env.JOTFORM_API_KEY;
 if(!key)return NextResponse.json({error:"Source unavailable"},{status:503});
 const resp=await fetch("https://api.jotform.com/user/forms?limit=500",{headers:{APIKEY:key},cache:"no-store"});
 if(!resp.ok)return NextResponse.json({error:"Source request failed"},{status:502});
 const data=await resp.json() as {content?:{id:string;title?:string;url?:string}[]};
 const candidates=(data.content||[]).filter(x=>(x.url||"").includes("waiver---release-form")||/almost ready|almost done|waiver.*release/i.test(x.title||""));
 const target=candidates.length===1?candidates[0]:candidates.find(x=>(x.url||"").includes("waiver---release-form"));
 if(!target)return NextResponse.json({error:"Original waiver not found"},{status:404});
 const qresp=await fetch("https://api.jotform.com/form/"+target.id+"/questions",{headers:{APIKEY:key},cache:"no-store"});
 if(!qresp.ok)return NextResponse.json({error:"Original questions unavailable"},{status:502});
 const questions=await qresp.json();
 return NextResponse.json({formId:target.id,questions:questions.content},{headers:{"Cache-Control":"private, no-store"}});
}
