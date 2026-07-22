import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { getCurrentProfile } from "@/lib/auth/guards";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved once per request on the server. Client components read it through
  // context rather than fetching or persisting a session of their own.
  const profile = await getCurrentProfile();

  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <Providers profile={profile}>{children}</Providers>
      </body>
    </html>
  );
}
