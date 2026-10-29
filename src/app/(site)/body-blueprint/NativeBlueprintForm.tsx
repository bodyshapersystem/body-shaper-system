"use client";
import { useState } from "react";
import { blueprintSections } from "./blueprint-fields";

type Answers = Record<string,string|string[]>;
export default function NativeBlueprintForm(){
 const [answers,setAnswers]=useState<Answers>({});
 const [step,setStep]=useState(0);
 const [sending,setSending]=useState(false);
 const [error,setError]=useState("");
 const [finished,setFinished]=useState(false);
 const section=blueprintSections[step];
 const autocomplete:Record<string,string>={firstName:"given-name",lastName:"family-name",email:"email",phone:"tel",city:"address-level2"};
 function visible(f: (typeof blueprintSections)[number]["fields"][number]){return !("showWhen" in f && f.showWhen && answers[f.showWhen.id]!==f.showWhen.value);}
 function update(id:string,value:string|string[]){setError("");setAnswers(a=>({...a,[id]:value}));}
 function ready(){return section.fields.every(f=>{const answer=answers[f.id];return !visible(f)||!("required" in f && f.required)||(Array.isArray(answer)?answer.length>0:typeof answer==="string"&&answer.trim().length>0);});}
 async function next(){
  setError("");
  if(!ready()){setError("Please complete all required questions.");return;}
  if(step===0&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(answers.email||""))){setError("Please enter a valid email address.");return;}
  if(step===0&&String(answers.phone||"").replace(/\D/g,"").length<10){setError("Please enter a valid phone number.");return;}
  if(step<blueprintSections.length-1){setStep(s=>s+1);document.getElementById("native-blueprint")?.scrollIntoView({behavior:"smooth"});return;}
  if(sending)return;setSending(true);
  try{
   const response=await fetch("/api/intake/blueprint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...answers,website:""})});
   const json=await response.json();
   if(!response.ok)throw new Error(json.error||"Unable to submit. Please try again.");
   if (typeof window !== "undefined") window.gtag?.("event","generate_lead",{event_category:"conversion",form_name:"native_body_blueprint"});
   setFinished(true);
  }catch(e){setError(e instanceof Error?e.message:"Unable to submit.");}finally{setSending(false);}
 }
 if(finished)return <div className="bp-native-card"><h3>You're all set! ✨</h3><p>We've received your Blueprint™. Our team will review your answers and reach out to you soon.</p></div>;
 return <div id="native-blueprint" className="bp-native-card" style={{maxWidth:740,margin:"32px auto",padding:"clamp(22px,5vw,48px)",background:"#F5EEE4",color:"#332920",borderRadius:16,textAlign:"left"}}>
  <div style={{fontSize:12,letterSpacing:2,textTransform:"uppercase"}}>Let's Build Your Blueprint™ · {step+1} / {blueprintSections.length}</div>
  <div role="progressbar" aria-label="Blueprint completion progress" aria-valuenow={step+1} aria-valuemin={0} aria-valuemax={blueprintSections.length} style={{height:4,background:"#ddd0c1",margin:"15px 0 30px"}}><div style={{height:"100%",width:`${(step+1)/blueprintSections.length*100}%`,background:"#A58A62"}}/></div>
  <h3 style={{fontSize:32,marginBottom:12}}>{section.title}</h3>
  {step===0&&<p>Every body is unique. Answer a few quick questions so we can recommend the Body Shaper System™ that best fits your body, your goals and your timeline.</p>}
  {section.fields.map(f=>{if(!visible(f))return null;const value=answers[f.id]??(f.type==="multiple"?[]:"");
    return <div key={f.id} style={{margin:"24px 0"}}>
      <label style={{display:"block",fontWeight:600,marginBottom:9}} htmlFor={f.id}>{f.label}{"required" in f&&f.required?" *":""}</label>
      {f.type==="textarea"?<textarea id={f.id} value={String(value)} onChange={e=>update(f.id,e.target.value)} rows={3} style={{width:"100%",padding:12,border:"1px solid #c8bba9",borderRadius:6}}/>:
       f.type==="text"||f.type==="email"||f.type==="tel"||f.type==="date"?<input id={f.id} type={f.type} value={String(value)} autoComplete={autocomplete[f.id]} required={"required" in f&&f.required===true} maxLength={f.type==="email"?254: f.type==="tel"?32:150} onChange={e=>update(f.id,e.target.value)} style={{width:"100%",padding:12,border:"1px solid #c8bba9",borderRadius:6}}/>:
       f.type==="select"?<select id={f.id} required={"required" in f&&f.required===true} value={String(value)} onChange={e=>update(f.id,e.target.value)} style={{width:"100%",padding:12,border:"1px solid #c8bba9",borderRadius:6}}><option value="">Choose an option</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>:
       <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{f.options.map(o=>{const selected=f.type==="multiple"?(value as string[]).includes(o):value===o;return <label key={o} style={{padding:"10px 13px",border:"1px solid #baa994",borderRadius:8,background:selected?"#d7c5a8":"white",cursor:"pointer"}}><input type={f.type==="multiple"?"checkbox":"radio"} name={f.id} checked={selected} onChange={()=>update(f.id,f.type==="multiple"?(selected?(value as string[]).filter(x=>x!==o):[...(value as string[]),o]):o)} style={{marginRight:7}}/>{o}</label>})}</div>}
    </div>;
   })}
  {step===0&&<p style={{fontSize:12}}>Valet or paid parking fees, when applicable, are not included in your treatment price and will be the client's responsibility. Locations outside our standard service area may incur a travel fee, confirmed before booking.</p>}
  {error&&<p role="alert" style={{color:"#a23a3a"}}>{error}</p>}
  <div style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:28}}>{step>0&&<button type="button" onClick={()=>setStep(s=>s-1)} className="btn btn-dark-outline">Back</button>}<button type="button" onClick={next} disabled={sending||!ready()} className="btn btn-primary" style={{marginLeft:"auto"}}>{sending?"Submitting…":step===blueprintSections.length-1?"Build My Blueprint ✨":"Continue →"}</button></div>
 </div>;
}
