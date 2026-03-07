import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://policyprism.io"),
  title: "Policy Prism | Mapping the Invisible Forces of Policy and Governance",
  description: "Policy Prism is a premium structural analysis platform for researchers and policy experts. Synthesize complex networks, trace terminology diffusion, and map institutional infrastructures.",
  keywords: ["Structural Analysis", "Policy Mapping", "Translational Stratification Theory", "AI Governance", "Actor-Network Theory", "ANT", "Assemblage Theory", "Socio-Technical Systems", "Policy Analysis", "Digital Sociology", "STS", "Policy Prism Synthesis"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Policy Prism | Mapping the Invisible Forces of Policy and Governance",
    description: "Policy Prism is a premium structural analysis platform for researchers and policy experts. Synthesize complex networks, trace terminology diffusion, and map institutional infrastructures.",
    url: "https://policyprism.io",
    siteName: "Policy Prism",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

import { ResearchWorkflowGuide } from "@/components/ResearchWorkflowGuide";
import { Toaster } from "sonner";
import { DemoModeAlert } from "@/components/DemoModeAlert";
import { CookieConsent } from "@/components/privacy/CookieConsent";

import { WorkspaceProvider } from "@/providers/WorkspaceProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "G-X5H4YK2J0G"} />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
          suppressHydrationWarning
        >
          <WorkspaceProvider>
            <div className="flex h-screen overflow-hidden bg-slate-50 flex-col md:flex-row">
              <Suspense fallback={<div className="w-64 bg-slate-950 hidden md:block"></div>}>
                <Sidebar />
              </Suspense>
              <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8 md:pt-8">
                {children}
              </main>
            </div>
            <ResearchWorkflowGuide />
            <DemoModeAlert />
            <Toaster />
            <CookieConsent />
          </WorkspaceProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
