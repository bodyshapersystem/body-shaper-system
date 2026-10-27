import "server-only";
import {createHash} from "node:crypto";
/** Immutable audit copy; basic multi-page PDF for typed e-signature records. */
function ascii(s:string){return s.normalize("NFKD").replace(/[^\x20-\x7E]/g,"?");}
function escape(s:string){return ascii(s).replace(/[\\()]/g,"\\$&");}
function wrap(s:string,n=90){const words=ascii(s).split(/\s+/);const lines:string[]=[];let line="";for(const w of words){if((line+" "+w).length>n){if(line)lines.push(line);line=w;}else line=line?line+" "+w:w;}if(line)lines.push(line);return lines;}
export function buildSignedIntakePdf(data:{clientName:string;fields:{label:string;value:string}[];signedName:string;signedAt:string;ip:string;userAgent:string;version:string}){
 const evidence=JSON.stringify(data);
 const digest=createHash("sha256").update(evidence).digest("hex");
 const lines=["BODY SHAPER SYSTEM - PREPARE YOUR EXPERIENCE","BODY BLUEPRINT PRE-TREATMENT EVALUATION","Form version: "+data.version,"Client: "+data.clientName,"","ORIGINAL QUESTION AND ANSWER RECORD",""];
 for(const {label,value} of data.fields){lines.push(...wrap(label,90),...wrap("ANSWER: "+value,90),"");}
 lines.push("ELECTRONIC SIGNATURE AND AUDIT RECORD","Signer: "+data.signedName,"Signed at UTC: "+data.signedAt,"IP: "+data.ip,"User Agent: "+data.userAgent.slice(0,95),"Electronic signature consent: YES","SHA-256 audit digest: "+digest);
 const pages:string[][]=[];for(let i=0;i<lines.length;i+=50)pages.push(lines.slice(i,i+50));
 const objects:string[]=[];const add=(s:string)=>{objects.push(s);return objects.length;};
 const catalog=add("");const rootPages=add("");const font=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
 const pageIds:number[]=[];
 for(const pageLines of pages){
  const commands=pageLines.map((l,i)=>`BT /F1 9 Tf 40 ${790-i*14} Td (${escape(l)}) Tj ET`).join("\n");
  const stream=add(`<< /Length ${Buffer.byteLength(commands)} >>\nstream\n${commands}\nendstream`);
  const page=add(`<< /Type /Page /Parent ${rootPages} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${stream} 0 R >>`);
  pageIds.push(page);
 }
 objects[rootPages-1]=`<< /Type /Pages /Kids [${pageIds.map(i=>i+" 0 R").join(" ")}] /Count ${pageIds.length} >>`;
 objects[catalog-1]=`<< /Type /Catalog /Pages ${rootPages} 0 R >>`;
 let output="%PDF-1.4\n";const offsets=[0];
 objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(output));output+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
 const xrefOffset=Buffer.byteLength(output);
 output+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
 for(const o of offsets.slice(1))output+=String(o).padStart(10,"0")+" 00000 n \n";
 output+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
 return {bytes:Buffer.from(output,"ascii"),digest};
}
