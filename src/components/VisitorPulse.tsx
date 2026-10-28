"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
export default function VisitorPulse(){
 const path=usePathname();
 useEffect(()=>{
   if(!path||typeof window==="undefined")return;
   if(navigator.doNotTrack==="1")return;
   const now=Date.now(),key="bss-site-visit-30m";
   try{const last=Number(sessionStorage.getItem(key)||0);if(now-last<30*60*1000)return;sessionStorage.setItem(key,String(now));}catch{return;}
   fetch("/api/analytics/visit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path}),keepalive:true}).catch(()=>{});
 },[path]);
 return null;
}
