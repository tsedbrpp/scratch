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
  title: "Decolonial AI Governance Research",
  description: "A comparative algorithmic assemblage analysis tool",
};

import { ResearchWorkflowGuide } from "@/components/ResearchWorkflowGuide";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
          suppressHydrationWarning
        >
          <div className="flex h-screen overflow-hidden bg-slate-50 flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
            </main>
          </div>
          <ResearchWorkflowGuide />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
