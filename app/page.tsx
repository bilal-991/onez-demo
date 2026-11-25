import Hero from "@/components/Hero";
import Catalog from "@/components/Catalog";
import { Tape, Manifesto, Anatomy, Turntable, Process, Order } from "@/components/Sections";

export default function Page() {
  return (
    <main>
      <Hero />
      <Tape />
      <Manifesto />
      <Anatomy />
      <Turntable />
      <Catalog />
      <Process />
      <Order />
    </main>
  );
}
