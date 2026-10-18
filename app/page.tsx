import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
import { AlsoBuilt } from "@/components/sections/AlsoBuilt";
import { Services } from "@/components/sections/Services";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Loader } from "@/components/ui/Loader";

export default function Home() {
  return (
    <>
      {/* Home only: a client arriving at a case study from a proposal link
          should see the work immediately. */}
      <Loader />
      <Nav />
      <main id="main">
        <Hero />
        <Showcase />
        <AlsoBuilt />
        <Services />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
