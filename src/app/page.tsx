"use client";

import { useUser } from "@clerk/nextjs";
import { useSources } from "@/hooks/useSources";
import { Dashboard } from "@/components/Dashboard";

// Landing Page Components
import { HeroSection } from "@/components/landing/HeroSection";
import { TheoreticalGrounding } from "@/components/landing/TheoreticalGrounding";
import { TechStack } from "@/components/landing/TechStack";
import { Methodology } from "@/components/landing/Methodology";
import { Visualization } from "@/components/landing/Visualization";
import { Community } from "@/components/landing/Community";
import { TrustEthics } from "@/components/landing/TrustEthics";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ContactSection } from "@/components/landing/ContactSection";

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeroSection />
      <TheoreticalGrounding />
      <TechStack />
      <Methodology />
      <Visualization />
      <Community />
      <TrustEthics />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const { sources } = useSources();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <Dashboard sources={sources} />;
}
