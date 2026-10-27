"use client";
import {useEffect,useMemo,useState} from "react";
type Q={id:string;type?:string;text?:string;required?:string;options?:string;order?:string};
type Definition={formId:string;questions:Record<string,Q>};
const allowed=new Set(["control_fullname","control_email","control_phone","control_address","control_textbox","control_textarea","control_radio","control_checkbox","control_dropdown","control_datetime","control_number"]);
const narrative=new Set(["control_text","control_head","control_paragraph"]);
export default function AlmostDoneNative({firstName}:{firstName:string}){
 const [items,setItems]=useState<Q[]>([]),[formId,setFormId]=useState(""),[values,setValues]=useState<Record<string,string|string[]>>({});
 const [page,setPage]=useState(0),[error,setError]=useState(""),[loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false);
 const [signature,setSignature]=useState(""),[signed,setSigned]=useState(false);
 useEffect(()=>{fetch("/api/portal/almost-done/questions").then(async r=>{const d=await r.json() as Definition & {error?:string};if(!r.ok||!d.questions)throw new Error(d.error||"Consent unavailable");setFormId(d.formId);setItems(Object.entries(d.questions).map(([id,q])=>({...q,id})).sort((a,b)=>Number(a.order||0)-Number(b.order||0)));}).catch(e=>setError(e instanceof Error?e.message:"Unable to load consent")).finally(()=>setLoading(false));},[]);
 const pages=useMemo(()=>{const groups:Q[][]=[[]];for(const q of items){if(q.type==="control_pagebreak"){if(groups[groups.length-1].length)groups.push([]);}else if(allowed.has(q.type||"")||narrative.has(q.type||""))groups[groups.length-1].push(q);}return groups.filter(g=>g.length);},[items]);
 const current=pages[page]||[];
 function change(id:string,v:string|string[]){setValues(prev=>({...prev,[id]:v}));}
 function continuePage(){
  setError("");
  for(const q of current){if(q.required!=="Yes")continue;const v=values[q.id];if(!v||(Array.isArray(v)?!v.length:!v.trim())){setError("Please complete every required question.");return;}}
  if(page<pages.length-1){setPage(page+1);window.scrollTo(0,0);}else send();
 }
 async function send(){if(!signature.trim()||!signed){setError("Please sign and consent electronically.");return;}setSubmitting(true);setError("");
  try{const r=await fetch("/api/portal/almost-done",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({formId,answers:values,signature,consent:signed})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to submit");window.location.assign("/portal/dashboard");}catch(e){setError(e instanceof Error?e.message:"Submission failed");setSubmitting(false);}
 }
 if(loading)return <section className="onb-card"><h1>Almost Done™</h1><p>Loading your medical consent…</p></section>;
 return <section className="onb-card" style={{textAlign:"left",maxWidth:800}}>
 <p className="onb-eyebrow">body shaper system™ · private consent</p><h1 className="onb-title">Almost Done™</h1><p className="onb-sub">Medical Consent &amp; Treatment Waiver</p>
 {error&&<p role="alert" style={{color:"#9d3434",margin:"18px 0"}}>{error}</p>}
 {!pages.length?<p>We could not verify the original medical waiver. Your portal remains securely locked. Please contact your specialist.</p>:<>
 <p className="onb-progress-label">Step {page+1} of {pages.length}</p><div className="onb-progress-track"><div className="onb-progress-fill" style={{width:((page+1)/pages.length*100)+"%"}}/></div>
 {current.map(q=>{const t=q.type||"";const choices=(q.options||"").split("|").filter(Boolean);const v=values[q.id]||(t==="control_checkbox"?[]:"");if(narrative.has(t))return <div key={q.id} style={{margin:"24px 0",whiteSpace:"pre-wrap",lineHeight:1.65}}>{q.text}</div>;
 if(!allowed.has(t))return null;
 return <div key={q.id} style={{margin:"25px 0"}}><label style={{display:"block",fontWeight:600,marginBottom:10}}>{q.text||"Question"}{q.required==="Yes"?" *":""}</label>
 {t==="control_radio"||t==="control_checkbox"||t==="control_dropdown"?
 <div style={{display:"grid",gap:8}}>{choices.map(option=>{const checked=Array.isArray(v)?v.includes(option):v===option;return <label key={option} style={{display:"flex",gap:10,border:"1px solid #d7c8b6",padding:12,borderRadius:10}}><input name={q.id} type={t==="control_checkbox"?"checkbox":"radio"} checked={checked} onChange={()=>change(q.id,t==="control_checkbox"?(checked?(v as string[]).filter(x=>x!==option):[...(v as string[]),option]):option)}/>{option}</label>;})}</div>:
 t==="control_textarea"?<textarea rows={4} value={String(v)} onChange={e=>change(q.id,e.target.value)} style={{width:"100%",padding:14}}/>:
 <input type={t==="control_email"?"email":t==="control_datetime"?"date":t==="control_phone"?"tel":t==="control_number"?"number":"text"} value={String(v)} onChange={e=>change(q.id,e.target.value)} style={{width:"100%",padding:14}}/>}
 </div>})}
 {page===pages.length-1&&<div style={{padding:"20px 0",borderTop:"1px solid #ddd"}}>
 <h2>Electronic Signature</h2><p>By signing, you confirm you have reviewed the complete consent above. Your signature, date, and a copy of these responses will be stored in your private account.</p>
 <label>Legal name<input value={signature} onChange={e=>setSignature(e.target.value)} style={{width:"100%",padding:12,marginTop:8}}/></label>
 <label style={{display:"flex",gap:10,marginTop:16}}><input type="checkbox" checked={signed} onChange={e=>setSigned(e.target.checked)}/>I agree to use an electronic signature for this document.</label>
 </div>}
 <div style={{display:"flex",justifyContent:"space-between",gap:15,marginTop:25}}>{page>0&&<button className="onb-cta" type="button" onClick={()=>{setPage(page-1);setError("");}}>Back</button>}<button className="onb-cta" type="button" onClick={continuePage} disabled={submitting} style={{marginLeft:"auto"}}>{submitting?"Saving…":page===pages.length-1?"Sign & Complete":"Continue →"}</button></div>
 </>}
 </section>;
}
