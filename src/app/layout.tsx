import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://instanttea.com"),
  title: "InstantTea | Easy Team Tool for Mapping Policy and Governance",
  description: "InstantTea is an open-source tool designed for teams like policy experts and researchers who need to understand complex systems quickly. Create clear maps in seconds.",
  keywords: ["Team Collaboration", "Policy Mapping", "Governance Tools", "AI Governance", "Actor-Network Theory", "ANT", "Assemblage Theory", "Socio-Technical Systems", "Policy Analysis", "Digital Sociology", "STS", "Instant TEA"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "InstantTea | Easy Team Tool for Mapping Policy and Governance",
    description: "InstantTea is a simple tool made for teams like policy experts and researchers who need to understand complicated systems fast.",
    url: "https://instanttea.com",
    siteName: "InstantTea",
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
          suppressHydrationWarning
        >
          <WorkspaceProvider>
            <div className="flex h-screen overflow-hidden bg-slate-50 flex-col md:flex-row">
              <Sidebar />
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
