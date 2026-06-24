import { getSettings } from "@/lib/settings-service";
import HomeClient from "./HomeClient";

// Force dynamic execution so settings updates are fetched instantly on every refresh
export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getSettings();
  
  return <HomeClient initialSettings={settings} />;
}
