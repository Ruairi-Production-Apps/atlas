import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from 'nextjs-toploader';
import { AuthErrorHandler } from "@/components/auth/auth-error-handler";
import { Suspense } from "react";
import { getGroupById } from "@/lib/supabase/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const isInstance = process.env.NEXT_PUBLIC_APP_ROLE === 'instance';
  const homeOrgId = process.env.NEXT_PUBLIC_HOME_ORG_ID;

  let siteTitle = "Atlas - News and Events for Scouters";

  if (isInstance && homeOrgId) {
    const groupData = await getGroupById(homeOrgId);
    if (groupData?.site_title) {
      siteTitle = groupData.site_title;
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
  const isInstance = process.env.NEXT_PUBLIC_APP_ROLE === 'instance';
  const homeOrgId = process.env.NEXT_PUBLIC_HOME_ORG_ID;
  let groupData = null;

  if (isInstance && homeOrgId) {
    groupData = await getGroupById(homeOrgId);
  }

  const primaryColor = groupData?.primary_color || '#005596';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        style={{ "--primary": primaryColor } as React.CSSProperties}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color={primaryColor} showSpinner={false} />
          <Suspense fallback={null}>
            <AuthErrorHandler />
          </Suspense>
          <HeaderWrapper />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
