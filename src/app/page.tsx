import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/Categories";
import { WhyUs } from "@/components/landing/WhyUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { VendorCta } from "@/components/landing/VendorCta";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <WhyUs />
        <HowItWorks />
        <Testimonials />
        <VendorCta />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
