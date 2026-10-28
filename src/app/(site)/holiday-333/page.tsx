import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import HolidayCheckout from "@/components/HolidayCheckout";

export const metadata: Metadata = buildMetadata({title:"333 Holiday Sculpt Ritual | Body Shaper System Miami",description:"3 Exilis, 3 Endospheres and 3 EMS treatments. Exclusive holiday package $1,290. Pay in full or two installments. Mobile body contouring in Miami.",path:"/holiday-333"});

const weeks=[["WEEK 01","Exilis Ultra · Endospheres · EMS"],["WEEK 02","Exilis Ultra · EMS"],["WEEK 03","Exilis Ultra · Endospheres · EMS"],["WEEK 04","Endospheres"]];

export default function Holiday333Page(){return <main style={{background:"#f5ede6",color:"#3b2025",minHeight:"100vh"}}>
<section style={{background:"radial-gradient(ellipse at 70% 20%,#873b4a 0%,#4a1728 55%,#2b0d1b 100%)",color:"#f7e7d2",textAlign:"center",padding:"110px 20px 95px"}}>
<div style={{fontSize:13,letterSpacing:5,color:"#dfbf93"}}>BODY SHAPER SYSTEM™ · HOLIDAY EDITION</div>
<div style={{fontSize:74,margin:"26px 0 0",lineHeight:1}}>✦ 333 ✦</div>
<h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,6vw,76px)",fontWeight:400,margin:"20px auto",maxWidth:950}}>The Holiday Sculpt Ritual</h1>
<p style={{letterSpacing:3,textTransform:"uppercase",fontSize:13}}>3 Technologies · 9 Treatments · 4 Weeks</p>
<p style={{fontFamily:"Georgia,serif",fontSize:26,marginTop:32}}>Your body. Your ritual. Your season.</p>
<a href="#reserve" style={{display:"inline-block",background:"#d7b588",color:"#381525",padding:"17px 35px",marginTop:25,letterSpacing:2,fontWeight:700}}>SECURE YOUR RITUAL — $1,290</a>
</section>
<section style={{maxWidth:1040,margin:"auto",padding:"76px 22px",textAlign:"center"}}>
<p style={{letterSpacing:3,fontSize:12}}>THE EXPERIENCE</p><h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(30px,4vw,48px)",fontWeight:400}}>Three technologies. One personalized strategy.</h2>
<p style={{maxWidth:690,margin:"20px auto",lineHeight:1.9}}>A curated combination of Exilis Ultra, Endospheres and EMS, delivered in the comfort of your home in our Miami service area. Includes a personalized Body Blueprint™ and suitability assessment.</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18,marginTop:38}}>{[["03","EXILIS ULTRA"],["03","ENDOSPHERES"],["03","EMS"]].map(([n,label])=><div key={label} style={{border:"1px solid #cdb69f",padding:30}}><div style={{fontFamily:"Georgia,serif",fontSize:60,color:"#792e42"}}>{n}</div><div style={{letterSpacing:2,fontSize:12}}>{label}</div></div>)}</div>
</section>
<section style={{background:"#e9dcd2",padding:"70px 22px"}}><div style={{maxWidth:850,margin:"auto"}}><p style={{letterSpacing:3,fontSize:12,textAlign:"center"}}>YOUR FOUR-WEEK RITUAL</p><h2 style={{fontFamily:"Georgia,serif",fontSize:42,textAlign:"center",fontWeight:400,marginBottom:35}}>A thoughtful rhythm.</h2>{weeks.map(([w,t])=><div key={w} style={{display:"flex",flexWrap:"wrap",gap:25,padding:"22px 10px",borderBottom:"1px solid #c5ac9f"}}><strong style={{minWidth:120,color:"#792e42",letterSpacing:2}}>{w}</strong><span>{t}</span></div>)}</div></section>
<section id="reserve" style={{maxWidth:760,margin:"auto",padding:"90px 22px",textAlign:"center"}}><p style={{letterSpacing:3,fontSize:12}}>EXCLUSIVE HOLIDAY OFFER</p><h2 style={{fontFamily:"Georgia,serif",fontSize:48,fontWeight:400}}>Your 333 Ritual Awaits</h2><p style={{textDecoration:"line-through",opacity:.65}}>Regular $1,575</p><p style={{fontFamily:"Georgia,serif",fontSize:64,color:"#762c40",margin:"8px 0"}}>$1,290</p><p>Save $285 · Approximately 18% off</p><HolidayCheckout/><div style={{marginTop:36,textAlign:"left",fontSize:13,lineHeight:1.9,background:"#fff9f5",padding:26,border:"1px solid #d8c3b7"}}><strong>HOLIDAY OFFER TERMS</strong><p>A minimum of 3 of the 9 treatments must be completed before January 27, 2027. The remaining sessions may be completed afterward according to your personalized schedule. The program is designed for approximately four weeks from the first session.</p><p>For the two-payment option, $645 is due today and the remaining $645 is due during the second week of your treatment program. We will coordinate the second payment when your treatment start date is scheduled. No additional installment fees.</p><p>Appointments are subject to availability, service area, and individual treatment suitability. Treatment outcomes vary. Any legally applicable consumer rights remain unaffected.</p></div><p style={{marginTop:28,fontSize:13}}>Questions? <Link href="/body-blueprint" style={{textDecoration:"underline"}}>Explore your Body Blueprint™</Link></p></section>
</main>}