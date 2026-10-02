import Intro from "@/components/home/Intro";
import Hero from "@/components/home/Hero";
import Esploso from "@/components/home/Esploso";
import Maglietta from "@/components/home/Maglietta";
import Materia from "@/components/home/Materia";
import Collezione from "@/components/home/Collezione";
import LookbookManifesto from "@/components/home/LookbookManifesto";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="contenuto">
      <Intro />
      <Hero />
      <Esploso />
      <Maglietta />
      <Materia />
      <Collezione />
      <LookbookManifesto />
      <Footer />
    </main>
  );
}
