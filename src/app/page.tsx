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
import { SocialProof } from "@/components/landing/SocialProof";

// This is a Server Component now
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
