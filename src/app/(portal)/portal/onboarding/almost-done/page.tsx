import {redirect} from "next/navigation";
import {getCurrentPortalClient} from "@/lib/permissions";
import {getOnboardingStatus} from "@/lib/onboarding";
import AlmostDoneNative from "./AlmostDoneNative";
export const dynamic="force-dynamic";
export default async function AlmostDonePage(){
 const client=await getCurrentPortalClient();
 if(!client)redirect("/portal/login");
 const status=await getOnboardingStatus(client.id);
 if(status.isComplete)redirect("/portal/dashboard");
 if(!status.agreementComplete)redirect("/portal/onboarding/prepare");
 return <div className="onb-shell"><AlmostDoneNative firstName={client.firstName}/></div>;
}