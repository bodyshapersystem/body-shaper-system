"use client";
import {useEffect,useMemo,useState} from "react";
type Question={id:string;type:string;text?:string;required?:string;options?:string;order?:string};
type Values=Record<string,string|string[]>;
const sections=["Your Details","Lifestyle","Health & Safety","Treatment History","Appointments","Acknowledgements & Signature"];
const supported=["control_fullname","control_email","control_datetime","control_phone","control_address","control_textbox","control_radio","control_checkbox","control_textarea"];
function sectionFor(q:Question){const order=Number(q.order);return order<12?0:order<20?1:order<33?2:order<35?3:order<39?4:5;}
export default function PrepareExperienceNative({firstName}:{firstName:string}){
 const [questions,setQuestions]=useState<Question[]>([]);
 const [values,setValues]=useState<Values>({});
 const [signature,setSignature]=useState("");
 const [agree,setAgree]=useState(false);
 const [page,setPage]=useState(0);
 const [loading,setLoading]=useState(true);
 const [sending,setSending]=useState(false);
 const [error,setError]=useState("");
 const [done,setDone]=useState(false);
 useEffect(()=>{fetch("/api/public/prepare-form-definition").then(r=>r.json()).then(j=>{if(!Array.isArray(j.questions))throw new Error("Questions unavailable");setQuestions(j.questions);}).catch(()=>setError("Unable to load the original questions right now.")).finally(()=>setLoading(false));},[]);
 const current=useMemo(()=>questions.filter(q=>supported.includes(q.type)&&sectionFor(q)===page),[questions,page]);
 function update(id:string,v:string|string[]){setValues(a=>({...a,[id]:v}));}
 function visible(q:Question){const v=values;switch(q.id){
  case "104":return Array.isArray(v["103"])&&v["103"].includes("Postpartum");
  case "105":case "96":return v["94"]==="Yes";
  case "98":return v["97"]==="Yes";
  case "100":case "101":case "102":return !!v["99"]&&v["99"]!=="No.";
  default:return true;
 }}
 function advance(){
  setError("");
  for(const q of current){if(!visible(q)||q.required!=="Yes")continue;const v=values[q.id];if(!v||(Array.isArray(v)?v.length===0:!v.trim())){setError("Please complete all required questions.");return;}}
  if(page<5){setPage(p=>p+1);window.scrollTo({top:0,behavior:"smooth"});}else submit();
 }
 async function submit(){if(!signature.trim()||!agree){setError("Please type your legal name and agree to sign electronically.");return;}setSending(true);setError("");
  try{const r=await fetch("/api/portal/prepare-experience",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({values,signature,agree,formVersion:"261860243106046"})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Submission failed");setDone(true);}catch(e){setError(e instanceof Error?e.message:"Unable to save your form.");}finally{setSending(false);}
 }
 if(loading)return <div className="onb-card">Preparing your experience…</div>;
 if(done)return <div className="onb-card"><h1>Thank you, {firstName} ✨</h1><p>Your evaluation has been received and saved to your private client record.</p><a className="onb-cta" href="/portal/onboarding">Continue onboarding →</a></div>;
 return <main className="onb-card" style={{maxWidth:850,textAlign:"left"}}>
 <p className="onb-eyebrow">body shaper system™</p><h1 className="onb-title">Prepare Your Experience™</h1><p className="onb-sub">Body Blueprint™ Pre-Treatment Evaluation — before your first appointment.</p>
 <p className="onb-progress-label">Step {page+1} of 6 · {sections[page]}</p><div className="onb-progress-track"><div className="onb-progress-fill" style={{width:`${(page+1)/6*100}%`}}/></div>
 {error&&<p role="alert" style={{color:"#9d3434",marginTop:16}}>{error}</p>}
 {current.map(q=>{if(!visible(q))return null;const value=values[q.id]??(q.type==="control_checkbox"?[]:"");const options=q.options?.split("|")??[];
 return <div key={q.id} style={{margin:"26px 0",textAlign:"left"}}>
 <label style={{display:"block",fontWeight:600,marginBottom:10}}>{q.text}{q.required==="Yes"?" *":""}</label>
 {q.type==="control_textarea"?<textarea rows={3} value={String(value)} onChange={e=>update(q.id,e.target.value)} style={{width:"100%",padding:12}}/>:
 q.type==="control_radio"||q.type==="control_checkbox"?<div style={{display:"grid",gap:8}}>{options.map(o=>{const checked=Array.isArray(value)?value.includes(o):value===o;return <label key={o} style={{border:"1px solid #c1ad99",padding:12,borderRadius:9,display:"flex",gap:8}}><input type={q.type==="control_checkbox"?"checkbox":"radio"} name={q.id} checked={checked} onChange={()=>update(q.id,q.type==="control_checkbox"?(checked?(value as string[]).filter(x=>x!==o):[...(value as string[]),o]):o)}/><span>{o}</span></label>})}</div>:
 <input type={q.type==="control_email"?"email":q.type==="control_datetime"?"date":q.type==="control_phone"?"tel":"text"} value={String(value)} onChange={e=>update(q.id,e.target.value)} style={{width:"100%",padding:12}} placeholder={q.type==="control_address"?"Street address, unit, city, state, ZIP":""}/>}
 </div>})}
 {page===5&&<div style={{borderTop:"1px solid #c5b49c",paddingTop:25}}>
 <h3>Electronic signature</h3><p>Please read your acknowledgements above. By typing your name you agree to use an electronic signature for this evaluation. A time-stamped copy will be kept in your private client record.</p>
 <label style={{display:"block",marginTop:16}}>Full legal name<input type="text" value={signature} onChange={e=>setSignature(e.target.value)} style={{width:"100%",padding:12,marginTop:8}}/></label>
 <label style={{display:"flex",gap:10,marginTop:16}}><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/><span>I consent to sign this evaluation electronically and acknowledge my answers are accurate.</span></label>
 </div>}
 <div style={{display:"flex",gap:12,justifyContent:"space-between",marginTop:30}}>{page>0&&<button type="button" className="onb-cta" onClick={()=>setPage(p=>p-1)}>Back</button>}<button type="button" className="onb-cta" disabled={sending||loading||questions.length===0} onClick={advance} style={{marginLeft:"auto"}}>{sending?"Submitting…":page===5?"Complete evaluation →":"Continue →"}</button></div>
 </main>;
}