import { redirect } from "next/navigation";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";
type JotformQuestion = { qid?:string; type?:string; text?:string; name?:string; required?:string; options?:string; subLabel?:string; [key:string]:unknown };
const forms = [
 {title:"Prepare Your Experience™", id:"261860243106046"},
 {title:"Prepare Your Experience™ — Ambassador", id:"262157878805066"},
 {title:"Almost Ready™ — Medical Waiver", id:"261875936820064", url:"https://form.jotform.com/beautyboxmia/waiver---release-form"},
 {title:"Content Release Agreement", id:"262001828942051"}
];
async function readQuestions(formId:string):Promise<{questions:JotformQuestion[];error?:string}> {
 const key=process.env.JOTFORM_API_KEY;
 if(!key)return {questions:[],error:"JOTFORM_API_KEY is not configured."};
 try {
  const response=await fetch(`https://api.jotform.com/form/${formId}/questions`,{headers:{APIKEY:key},cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(!response.ok)return {questions:[],error:`Unable to fetch form definition (HTTP ${response.status}).`};
  const json=await response.json() as {content?:Record<string,JotformQuestion>;responseCode?:number};
  return {questions:Object.entries(json.content||{}).sort(([a],[b])=>Number(a)-Number(b)).map(([id,q])=>({...q,qid:id}))};
 }catch{return {questions:[],error:"Unable to contact Jotform API."};}
}
export default async function FormsMigrationInventory() {
 const user=await getCurrentHubUser();
 if(!user||!hasPermission(user,"documents.view"))redirect("/hub/dashboard");
 const items=await Promise.all(forms.map(async f=>({...f,...await readQuestions(f.id)})));
 return <main className="cat-body portal-page" style={{maxWidth:1100}}>
  <div className="portal-page-head"><p className="portal-eyebrow">Owner Hub · Migration Audit</p><h1>Original Jotform Question Inventory</h1></div>
  <p style={{maxWidth:760,marginBottom:24}}>Owner-only reference for migrating the original language and conditional questions into Body Shaper System™. Jotform remains the signing system until a verified electronic-signature workflow is implemented. This page never exposes Jotform credentials or customer submissions.</p>
  {items.map(f=><section key={f.id} style={{padding:24,marginBottom:24,border:"1px solid #bcae9e",borderRadius:12}}>
   <h2>{f.title}</h2><p style={{fontSize:13,opacity:.75}}>Form ID: {f.id} · {f.questions.length} fields/questions</p>
   {f.error&&<p role="alert">{f.error}</p>}
   {f.questions.map(q=><div key={q.qid} style={{padding:"14px 0",borderBottom:"1px solid #ddd"}}>
     <b>{q.text||q.name||"Untitled field"}</b><div style={{fontSize:12,opacity:.7}}>ID: {q.qid} · Type: {q.type} · Required: {q.required==="Yes"?"Yes":"No"}</div>
     {q.options&&<p style={{fontSize:13,whiteSpace:"pre-line"}}>{q.options}</p>}
    </div>)}
  </section>)}
 </main>;
}
