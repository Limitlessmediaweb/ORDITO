import Intro from "@/components/home/Intro";
import Hero from "@/components/home/Hero";
import Esploso from "@/components/home/Esploso";
import Maglietta from "@/components/home/Maglietta";

export default function Home() {
  return (
    <main id="contenuto">
      <Intro />
      <Hero />
      <Esploso />
      <Maglietta />
      <section className="h-[150vh]" />
    </main>
  );
}
