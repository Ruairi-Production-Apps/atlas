import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { APP_CONFIG, isInstance, isHub } from '@/lib/config/app-config'
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from 'nextjs-toploader';
import { AuthErrorHandler } from "@/components/auth/auth-error-handler";
import { Suspense } from "react";
import { getSiteSettings, getHomeOrgConfig } from "@/lib/supabase/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const homeOrg = isInstance() ? await getHomeOrgConfig() : null;
  let siteTitle = isHub() ? "Atlas Hub - National Scouting Directory" : "Atlas - Scouting Management";
  let description = "A platform for Scouters to plan and manage their activities across Ireland.";
  let logoUrl: string | null = null;

  if (homeOrg) {
    siteTitle = homeOrg.site_title;
    const settings = await getSiteSettings(homeOrg.type, homeOrg.id);
    if (settings?.site_title) description = `Payment platform for ${settings.site_title} membership fees`;
    logoUrl = settings?.logo_url || null;
  }

  const iconUrl = logoUrl || '/images/favicons/favicon.ico';
  const ogImage = logoUrl || '/images/atlas/AtlasLogo.png';

  return {
    title: siteTitle,
    description,
    icons: {
      icon: iconUrl,
      apple: logoUrl || '/images/favicons/apple-touch-icon.png',
    },
    openGraph: {
      title: siteTitle,
      description,
      images: [{ url: ogImage }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const homeOrg = isInstance() ? await getHomeOrgConfig() : null;
  let settings = null;

  if (homeOrg) {
    settings = await getSiteSettings(homeOrg.type, homeOrg.id);
  }

  // Fallback to Ireland Scouting Green
  const primaryColor = settings?.primary_color || '#006d2c';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        style={{ '--primary': primaryColor } as React.CSSProperties}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color={primaryColor} showSpinner={false} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
