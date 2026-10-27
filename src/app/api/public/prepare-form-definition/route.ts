import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 const apiKey=process.env.JOTFORM_API_KEY;
 if(!apiKey)return NextResponse.json({error:"Form definition temporarily unavailable"},{status:503});
 try{
  const r=await fetch("https://api.jotform.com/form/261860243106046/questions",{headers:{APIKEY:apiKey},cache:"no-store",signal:AbortSignal.timeout(10000)});
  if(!r.ok)return NextResponse.json({error:"Question import unavailable"},{status:502});
  const json=await r.json() as {content?:Record<string,Record<string,unknown>>};
  const questions=Object.entries(json.content||{}).map(([id,v])=>({id,type:v.type,text:v.text,name:v.name,required:v.required,options:v.options,properties:v.properties,subLabel:v.subLabel,order:v.order,validation:v.validation,readonly:v.readonly,hidden:v.hidden})).sort((a,b)=>Number(a.order??a.id)-Number(b.order??b.id));
  return NextResponse.json({questions},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Question import temporarily unavailable"},{status:503});}
}