import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
const allowed=new Set(["/","/body-blueprint","/systems","/in-home-experience","/transformations","/about","/after-weight-loss","/tech-talks","/reviews","/faq","/policies","/book-appointment"]);
export async function POST(req:NextRequest){
 const origin=req.headers.get("origin");
 const host=req.headers.get("host");
 if(origin&&host&&new URL(origin).host!==host)return NextResponse.json({ok:false},{status:403});
 let path:string;
 try{const data=await req.json();path=String(data.path||"");}catch{return NextResponse.json({ok:false},{status:400});}
 if(!allowed.has(path))return NextResponse.json({ok:false},{status:400});
 try{await prisma.$executeRaw`INSERT INTO public.site_visit_events (path) VALUES (${path})`;}
 catch(err){console.error("Visitor event save failed",err);return NextResponse.json({ok:false},{status:503});}
 return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
