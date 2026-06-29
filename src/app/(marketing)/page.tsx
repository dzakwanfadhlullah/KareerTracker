import { Navbar } from "@/components/navbar";
import {
  EarlyAccessSection,
  EcosystemSection,
  FAQSection,
  FeatureCardsSection,
  FinalCTASection,
  Footer,
  FreeResourcesSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
  ProductPreviewSection,
  WhoItIsForSection,
  WhyItWorksSection,
} from "@/components/landing-sections";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <ProductPreviewSection />
        <HowItWorksSection />
        <FeatureCardsSection />
        <WhyItWorksSection />
        <WhoItIsForSection />
        <EcosystemSection />
        <EarlyAccessSection />
        <FreeResourcesSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
