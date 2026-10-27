import fs from "node:fs";
import path from "node:path";

// Compose an actual single image asset, not CSS layout layers.
// Existing photos are read byte-for-byte and EMBEDDED without editing.
const root=process.cwd(), out=path.join(root,"public/images");
const W=2800,H=1537;
function drawWaves(side,a,b,y0,y1){
 let result="";
 for(let n=0;n<10;n++){
  const gap=n*13;
  const d=side==="left"
    ?`M ${a-30} ${y1+gap} C ${a+260} ${y1-30+gap}, ${b-290} ${y0-130+gap}, ${b+1} ${y0+gap}`
    :`M ${a-1} ${y0+gap} C ${a+300} ${y0+5+gap}, ${b-270} ${y1-180+gap}, ${b+30} ${y1+gap}`;
  result+=`<path d="${d}" stroke="#a88e7d" stroke-opacity=".43" stroke-width="1.5" fill="none"/>`;
 }return result;
}
function build(source,destination,{x,hero=false,description}){
 const encoded=fs.readFileSync(path.join(out,source)).toString("base64");
 const pw=source==="home-hero.webp"?1023:1024;const right=x+pw;
 const editorial=hero?`<line x1="1970" x2="1970" y1="275" y2="803" stroke="#b59a86" stroke-width="2" opacity=".6"/>
 <text x="2018" y="312" font-family="Arial,Helvetica,sans-serif" font-size="23" letter-spacing="6" fill="#6b584a">PERSONALIZED STRATEGY</text>
 <g font-family="Georgia,Times New Roman,serif" fill="#332b28" font-weight="normal">
 <text x="2018" y="442" font-size="88">Build Your</text>
 <text x="2018" y="547" font-size="83">Body <tspan font-style="italic" fill="#876753">Blueprint</tspan></text>
 </g>
 <text x="2018" y="645" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="#64534a">A customized plan based on your goals,</text>
 <text x="2018" y="689" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="#64534a">your body and our advanced technology.</text>
 <text x="2018" y="829" font-family="Arial,Helvetica,sans-serif" font-size="25" letter-spacing="3" fill="#44352b">CREATE YOUR BLUEPRINT</text>
 <path d="M 2018 856 L 2684 856 M 2610 811 L 2684 811 L 2659 790 M 2684 811 L 2659 833" fill="none" stroke="#655244" stroke-width="2"/>
 <rect x="85" y="1330" rx="32" width="450" height="68" fill="#4D413A"/>
 <circle cx="126" cy="1364" r="16" fill="none" stroke="#fff" stroke-width="2"/>
 <text x="165" y="1372" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="21" font-weight="bold" letter-spacing="1.2">CHAT WITH A SPECIALIST</text>`:"";
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
 <title>${description}</title>
 <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f2ece5"/><stop offset="1" stop-color="#e9dfd4"/></linearGradient></defs>
 <path fill="url(#bg)" d="M0 0H${W}V${H}H0Z"/>
 ${drawWaves("left",0,x,1050,760)}
 ${drawWaves("right",right,W,1320,850)}
 <image href="data:image/webp;base64,${encoded}" x="${x}" y="0" width="${pw}" height="${H}" preserveAspectRatio="none"/>
 ${editorial}
 </svg>`;
 fs.writeFileSync(path.join(out,destination),svg,"utf8");
 console.log(`Prepared ${destination} (${Math.round(svg.length/1024)} KiB); original photograph embedded without pixel changes.`);
}
build("home-hero.webp","home-hero-editorial.svg",{x:770,hero:true,description:"Body Shaper System signature homepage editorial illustration"});
build("systems-hero-banner.webp","systems-hero-editorial.svg",{x:850,description:"Body Shaper System Systems editorial hero"});
build("inhome-hero-banner.webp","experience-hero-editorial.svg",{x:850,description:"Body Shaper System In-Home Experience editorial hero"});
