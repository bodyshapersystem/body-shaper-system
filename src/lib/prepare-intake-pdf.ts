import "server-only";
import {createHash} from "node:crypto";
/** Immutable audit copy: multi-page PDF with the full question/answer record, optional drawn signature (JPEG) and audit trail. */
function ascii(s:string){return s.normalize("NFKD").replace(/[™®]/g,m=>m==="™"?"(TM)":"(R)").replace(/[–—]/g,"-").replace(/[•]/g,"-").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[^\x20-\x7E]/g,"?");}
function escape(s:string){return ascii(s).replace(/[\\()]/g,"\\$&");}
function wrap(s:string,n=90){const out:string[]=[];for(const para of s.split(/\n/)){const words=ascii(para).split(/\s+/).filter(Boolean);let line="";for(const w of words){if((line+" "+w).length>n){if(line)out.push(line);line=w;}else line=line?line+" "+w:w;}out.push(line);}return out;}

/** Reads width/height from a baseline/progressive JPEG (SOFn marker). */
export function jpegSize(buf:Buffer):{width:number;height:number}|null{
 if(buf.length<4||buf[0]!==0xff||buf[1]!==0xd8)return null;
 let i=2;
 while(i+9<buf.length){
  if(buf[i]!==0xff){i++;continue;}
  const m=buf[i+1];
  if(m===0xd8||m===0x01||(m>=0xd0&&m<=0xd7)){i+=2;continue;}
  const len=buf.readUInt16BE(i+2);
  if(m>=0xc0&&m<=0xcf&&m!==0xc4&&m!==0xc8&&m!==0xcc)return {height:buf.readUInt16BE(i+5),width:buf.readUInt16BE(i+7)};
  i+=2+len;
 }
 return null;
}

export function buildSignedIntakePdf(data:{clientName:string;fields:{label:string;value:string}[];signedName:string;signedAt:string;ip:string;userAgent:string;version:string;title?:string[];signatureJpeg?:Buffer}){
 const {signatureJpeg,...rest}=data;
 const signatureHash=signatureJpeg?createHash("sha256").update(signatureJpeg).digest("hex"):"";
 const digest=createHash("sha256").update(JSON.stringify({...rest,signatureHash})).digest("hex");
 const title=data.title??["BODY SHAPER SYSTEM - PREPARE YOUR EXPERIENCE","BODY BLUEPRINT PRE-TREATMENT EVALUATION"];
 const lines=[...title,"Form version: "+data.version,"Client: "+data.clientName,"","QUESTION AND ANSWER RECORD",""];
 for(const {label,value} of data.fields){lines.push(...wrap(label,90),...wrap("ANSWER: "+value,90),"");}
 const sig=signatureJpeg?jpegSize(signatureJpeg):null;
 lines.push("ELECTRONIC SIGNATURE AND AUDIT RECORD","Signer (typed legal name): "+data.signedName);
 if(sig)lines.push("Drawn signature:","","","","","","");
 lines.push("Signed at UTC: "+data.signedAt,"IP: "+data.ip,"User Agent: "+data.userAgent.slice(0,95),"Electronic signature consent: YES");
 if(signatureHash)lines.push("Signature image SHA-256: "+signatureHash);
 lines.push("SHA-256 audit digest: "+digest);
 const PER=50;
 const pages:string[][]=[];for(let i=0;i<lines.length;i+=PER)pages.push(lines.slice(i,i+PER));
 const sigLine=sig?lines.indexOf("Drawn signature:"):-1;
 const objects:(string|Buffer)[]=[];const add=(s:string|Buffer)=>{objects.push(s);return objects.length;};
 const catalog=add("");const rootPages=add("");const font=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
 let img=0;
 if(sig&&signatureJpeg){
  img=add(Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${sig.width} /Height ${sig.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${signatureJpeg.length} >>\nstream\n`,"latin1"),signatureJpeg,Buffer.from("\nendstream","latin1")]));
 }
 const pageIds:number[]=[];
 pages.forEach((pageLines,p)=>{
  let commands=pageLines.map((l,i)=>`BT /F1 9 Tf 40 ${790-i*14} Td (${escape(l)}) Tj ET`).join("\n");
  let xo="";
  if(img&&sigLine>=p*PER&&sigLine<(p+1)*PER){
   const row=sigLine-p*PER;
   const h=80,w=Math.round(h*sig!.width/sig!.height);
   const y=790-row*14-14-h+8;
   commands+=`\nq ${Math.min(w,400)} 0 0 ${h} 40 ${y} cm /Sig Do Q`;
   xo=` /XObject << /Sig ${img} 0 R >>`;
  }
  const stream=add(`<< /Length ${Buffer.byteLength(commands)} >>\nstream\n${commands}\nendstream`);
  pageIds.push(add(`<< /Type /Page /Parent ${rootPages} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${font} 0 R >>${xo} >> /Contents ${stream} 0 R >>`));
 });
 objects[rootPages-1]=`<< /Type /Pages /Kids [${pageIds.map(i=>i+" 0 R").join(" ")}] /Count ${pageIds.length} >>`;
 objects[catalog-1]=`<< /Type /Catalog /Pages ${rootPages} 0 R >>`;
 const chunks:Buffer[]=[Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n","latin1")];let size=chunks[0].length;const offsets:number[]=[];
 objects.forEach((obj,i)=>{offsets.push(size);const b=Buffer.concat([Buffer.from(`${i+1} 0 obj\n`,"latin1"),typeof obj==="string"?Buffer.from(obj,"latin1"):obj,Buffer.from("\nendobj\n","latin1")]);chunks.push(b);size+=b.length;});
 let tail=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
 for(const o of offsets)tail+=String(o).padStart(10,"0")+" 00000 n \n";
 tail+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${size}\n%%EOF`;
 chunks.push(Buffer.from(tail,"latin1"));
 return {bytes:Buffer.concat(chunks),digest};
}
