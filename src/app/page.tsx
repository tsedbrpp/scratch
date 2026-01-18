"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useSources } from "@/hooks/useSources";
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
import { SocialProof } from "@/components/landing/SocialProof";

import { Suspense } from "react";

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeroSection />
      <SocialProof />
      <StepByStep />
      <TheoreticalGrounding />
      {/* <TechStack /> - Removed to de-emphasize tech stack */}
      <Methodology />
      <Visualization />
      <Community />
      <TrustEthics />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}

function MainContent() {
  const { isLoaded, isSignedIn } = useUser();
  const { sources } = useSources();
  const searchParams = useSearchParams();
  const showLanding = searchParams.get("view") === "landing";

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show Landing Page if not signed in OR if explicitly requested via query param
  if (!isSignedIn || showLanding) {
    return <LandingPage />;
  }

  return <Dashboard sources={sources} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <MainContent />
    </Suspense>
  );
}
