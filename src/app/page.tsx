import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

/**
 * Root entry. Sends everyone to the dashboard; the middleware then routes
 * unauthenticated visitors to the login screen.
 */
export default function RootPage() {
  redirect(siteConfig.homeUrl);
}
