import { getSettings } from "@/lib/settings-service";
import HomeClient from "./HomeClient";

// Cache at Edge CDN for 60s — re-fetches settings from origin every minute.
// Replaces force-dynamic to eliminate excessive Fast Origin Transfer costs.
export const revalidate = 60;

export default async function Page() {
  const settings = await getSettings();
  
  return <HomeClient initialSettings={settings} />;
}
