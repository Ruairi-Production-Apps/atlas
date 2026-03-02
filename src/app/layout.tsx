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
import { getSiteSettings } from "@/lib/supabase/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const isInstanceApp = isInstance();
  const homeOrgId = APP_CONFIG.homeOrgId;
  const homeOrgType = APP_CONFIG.homeOrgType;

  let siteTitle = isHub() ? "Atlas Hub - National Scouting Directory" : "Atlas - Scouting Management";

  if (isInstanceApp && homeOrgId && homeOrgType) {
    const settings = await getSiteSettings(homeOrgType, homeOrgId);
    if (settings?.site_title) {
      siteTitle = settings.site_title;
    }
  }

  return {
    title: siteTitle,
    description: "A platform for Scouters to plan and manage their activities across Ireland.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isInstanceApp = isInstance();
  const homeOrgId = APP_CONFIG.homeOrgId;
  const homeOrgType = APP_CONFIG.homeOrgType;
  let settings = null;

  if (isInstanceApp && homeOrgId && homeOrgType) {
    settings = await getSiteSettings(homeOrgType, homeOrgId);
  }

  const primaryColor = settings?.primary_color || '#005596';

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
          <HeaderWrapper />
          <main className="flex-grow flex flex-col items-center justify-start w-full">
            <Suspense>
              <AuthErrorHandler />
            </Suspense>
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
