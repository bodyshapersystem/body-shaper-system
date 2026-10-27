import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata:Metadata=buildMetadata({
 title:"Skin Firming & Body Contouring After Weight Loss or GLP-1 | Miami",
 description:"Miami in-home body contouring support after significant weight loss or while using clinician-prescribed GLP-1 medication. Learn about skin firmness, EMS, Exilis and personalized consultations.",
 path:"/after-weight-loss"
});
const faqs=[
 {q:"Can I receive body contouring treatments while taking a GLP-1 medication?",a:"Possibly, but eligibility depends on your health, medications, goals and treatment type. Tell your treating clinician and your Body Shaper System specialist about all medications and recent changes. A consultation and medical screening are required before treatment."},
 {q:"Can non-invasive treatments remove excess skin after major weight loss?",a:"Non-invasive treatments cannot remove substantial excess skin or replicate surgery. Certain technologies may help with the appearance of skin firmness in suitable candidates, but results vary and evidence differs by device and indication."},
 {q:"Is GLP-1 Reshape a weight-loss program or medication service?",a:"No. Body Shaper System does not prescribe GLP-1 medicines through this service, replace your prescribing clinician, or promise weight loss. GLP-1 Reshape is an optional, personalized aesthetic and body-contouring service."},
 {q:"Which treatments may be considered after weight loss?",a:"Depending on screening and goals, a specialist may discuss radiofrequency-based skin treatments, EMS-supported muscle conditioning or lymphatic-focused care. These services have distinct purposes and are not suitable for everyone."},
 {q:"Are sessions offered at home in Miami?",a:"Yes. Body Shaper System offers mobile appointments in eligible areas of Miami-Dade, Broward and Palm Beach counties. Location, suitability and scheduling are confirmed during your Body Blueprint evaluation."}
];
const schema={"@context":"https://schema.org","@type":"Service","@id":"https://www.bodyshapersystem.com/after-weight-loss#service",name:"Post-Weight-Loss Body Contouring & GLP-1 Reshape™ Consultation",serviceType:"In-home non-invasive aesthetic body contouring",areaServed:[{ "@type":"AdministrativeArea",name:"Miami-Dade County" },{ "@type":"AdministrativeArea",name:"Broward County" },{ "@type":"AdministrativeArea",name:"Palm Beach County" }],provider:{"@type":"HealthAndBeautyBusiness",name:"Body Shaper System™",url:"https://www.bodyshapersystem.com"},url:"https://www.bodyshapersystem.com/after-weight-loss",description:"Personalized aesthetic support after weight loss or alongside clinician-supervised GLP-1 therapy, subject to assessment and medical screening."};
export default function AfterWeightLossPage(){
 return <main style={{background:"#F5EEE4",color:"#332d29"}}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
  <section className="section" style={{maxWidth:1180,margin:"0 auto",paddingTop:155,paddingBottom:90}}>
   <span className="eyebrow">GLP-1 Reshape™ · Miami In-Home Experience</span>
   <h1 style={{fontFamily:"var(--serif)",fontWeight:400,fontSize:"clamp(38px,5vw,78px)",lineHeight:1.1,maxWidth:1050,margin:"20px 0 30px"}}>Your body after weight loss deserves a <em>personalized next chapter.</em></h1>
   <p style={{fontSize:"clamp(17px,1.3vw,21px)",lineHeight:1.75,maxWidth:830}}>Whether you have lost weight through lifestyle changes, bariatric care, or clinician-prescribed GLP-1 medication, your goals may shift toward the appearance of skin firmness, muscle definition and body confidence. Our non-surgical body contouring plans in Miami begin with understanding your body—not selling you a one-size-fits-all treatment.</p>
   <div style={{display:"flex",gap:18,flexWrap:"wrap",marginTop:32}}><Link className="btn btn-primary" href="/body-blueprint">Build Your Body Blueprint™</Link><Link className="btn btn-dark-outline" href="/systems">Explore Our Systems</Link></div>
  </section>
  <div className="wave-divider"><svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg></div>
  <section className="section" style={{maxWidth:1180,margin:"0 auto"}}>
   <span className="eyebrow">What changes after weight loss?</span><h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(31px,3.8vw,54px)",fontWeight:400,margin:"20px 0 28px"}}>Different goals. Different tools.</h2>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:35}}>
    <article><h3>Skin firmness</h3><p>Skin can look different after a significant change in body size. For appropriate candidates, your specialist may discuss Exilis® radiofrequency-based treatments for aesthetic skin-firming goals. Significant redundant skin may require a surgical consultation instead.</p></article>
    <article><h3>Muscle appearance</h3><p>Resistance exercise and adequate nutrition remain foundational. EMS® may be considered as a complementary aesthetic service for some clients; it is not a substitute for physical activity or medically supervised rehabilitation.</p></article>
    <article><h3>Comfort &amp; body confidence</h3><p>Lymphatic-focused or massage-based care may support comfort for selected clients. We do not claim these services cause fat loss, remove excess skin, or treat medical swelling.</p></article>
   </div>
  </section>
  <section className="section" style={{background:"#e9ded3"}}>
   <div style={{maxWidth:1060,margin:"0 auto"}}><span className="eyebrow">During GLP-1 treatment</span><h2 style={{fontFamily:"var(--serif)",fontWeight:400,fontSize:"clamp(32px,3.7vw,54px)",margin:"20px 0"}}>Your medical treatment stays with your clinician.</h2>
   <p style={{maxWidth:800,lineHeight:1.8,fontSize:18}}>Body Shaper System offers aesthetic services, not medication management. If you currently use semaglutide, tirzepatide, or another prescribed weight-management medicine, continue following your prescribing clinician's advice. Share relevant health information during our private screening and obtain clearance when indicated. We will never recommend stopping or changing medication to receive a treatment.</p>
   <p style={{maxWidth:800,lineHeight:1.8,fontSize:16}}>Treatment suitability, contraindications, scheduling and potential outcomes depend on the technology and your individual assessment. No device or protocol guarantees skin tightening, fat loss, or a particular result.</p></div>
  </section>
  <section className="section" style={{maxWidth:1060,margin:"0 auto"}}>
    <span className="eyebrow">Frequently asked questions</span><h2 style={{fontFamily:"var(--serif)",fontWeight:400,fontSize:"clamp(32px,3.7vw,52px)",margin:"20px 0"}}>After weight loss: what to know</h2>
    {faqs.map(f=><article key={f.q} style={{padding:"25px 0",borderBottom:"1px solid #cfc3b6"}}><h3 style={{fontFamily:"var(--serif)",fontWeight:500,fontSize:"clamp(22px,2vw,29px)"}}>{f.q}</h3><p style={{maxWidth:900,lineHeight:1.8}}>{f.a}</p></article>)}
  </section>
  <section className="section" style={{textAlign:"center",background:"#e9ded3"}}><h2 style={{fontFamily:"var(--serif)",fontWeight:400,fontSize:"clamp(30px,4vw,55px)",marginBottom:20}}>Start with your Body Blueprint™.</h2><p style={{maxWidth:650,margin:"0 auto 30px",lineHeight:1.75}}>Tell us your goals and receive a personalized recommendation after a suitability review.</p><Link href="/body-blueprint" className="btn btn-primary">Begin Your Blueprint™</Link></section>
 </main>;
}
