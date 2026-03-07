import { auth } from "@clerk/nextjs/server";
import { Dashboard } from "@/components/Dashboard";

// Landing Page Components
import { HeroSection } from "@/components/landing/HeroSection";
import { TheoreticalGrounding } from "@/components/landing/TheoreticalGrounding";
import { StepByStep } from "@/components/landing/StepByStep";
import { Methodology } from "@/components/landing/Methodology";
import { Visualization } from "@/components/landing/Visualization";
import { Community } from "@/components/landing/Community";
import { TrustEthics } from "@/components/landing/TrustEthics";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ContactSection } from "@/components/landing/ContactSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Suspense } from "react";

// This is a Server Component now
function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 -m-4 -mt-20 md:-m-8 md:-mt-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] overflow-x-hidden">
      <Suspense fallback={<div className="h-16 w-full bg-transparent fixed top-0 z-50 pointer-events-none" />}>
        <LandingNavbar />
      </Suspense>
      <HeroSection />

      <StepByStep />
      <TheoreticalGrounding />
      {/* <TechStack /> - Removed to de-emphasize tech stack */}
      <Methodology />
      <Visualization />
      <Community />
      <PricingSection />
      <TrustEthics />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}

// Server Component Entry Point
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  const params = await searchParams; // Await params in newer Next.js versions
  const showLanding = params?.view === "landing";

  // If user is authenticated and NOT specifically requesting the landing page, show Dashboard
  if (userId && !showLanding) {
    return <Dashboard />;
  }

  // Otherwise, render the server-side Landing Page (SEO Friendly)
  return <LandingPage />;
}
