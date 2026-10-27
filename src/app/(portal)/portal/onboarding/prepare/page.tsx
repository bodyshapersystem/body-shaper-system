import {redirect} from "next/navigation";
import {getCurrentPortalClient} from "@/lib/permissions";
import {getOnboardingStatus} from "@/lib/onboarding";
import PrepareExperienceNative from "./PrepareExperienceNative";
export const dynamic="force-dynamic";
export default async function PreparePage(){
 const client=await getCurrentPortalClient();
 if(!client)redirect("/portal/login");
 if(client.clientType==="AMBASSADOR")redirect("/portal/onboarding");
 const status=await getOnboardingStatus(client.id);
 if(status.agreementComplete)redirect("/portal/onboarding");
 return <div className="onb-shell"><PrepareExperienceNative firstName={client.firstName}/></div>;
}
