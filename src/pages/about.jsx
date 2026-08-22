import React from "react";
import { Landmark, Heart, BookOpen } from "lucide-react";
import { CONFIG } from "../data/config";
import { PageShell, SectionIntro, Stat } from "../components/ui";

export default function About() {
  return (
    <PageShell
      title="Our Temple"
      subtitle="A living place of prayer, learning, community and heritage — carried forward through everyday acts of seva."
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        <div className="overflow-hidden rounded-[2rem] bg-[#3f1b10]">
          <img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=90"
            alt="Temple courtyard"
            className="h-[520px] w-full object-cover"
          />
        </div>
        <div>
          <SectionIntro
            eyebrow="A living tradition"
            title="Built for worship. Sustained by community."
            copy={`${CONFIG.templeName} serves devotees across ${CONFIG.location}. The trust keeps the sacred spaces cared for, makes daily annadanam possible, and supports the next generation through Vedic learning.`}
          />
          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-5">
              <div className="flex items-center gap-3">
                <Landmark className="text-[#9b5d25]" />
                <div className="font-semibold">Heritage stewardship</div>
              </div>
              <p className="mt-2 text-sm leading-7 text-[#756154]">
                Preserve the roof, prayer hall, stonework and ritual spaces with
                care rather than compromise.
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-5">
              <div className="flex items-center gap-3">
                <Heart className="text-[#9b5d25]" />
                <div className="font-semibold">Community care</div>
              </div>
              <p className="mt-2 text-sm leading-7 text-[#756154]">
                Offer practical support through annadanam and shared festival
                seva.
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-5">
              <div className="flex items-center gap-3">
                <BookOpen className="text-[#9b5d25]" />
                <div className="font-semibold">Learning & continuity</div>
              </div>
              <p className="mt-2 text-sm leading-7 text-[#756154]">
                Support the teachers, students and materials that keep
                traditional learning accessible.
              </p>
            </div>
          </div>
        </div>
      </div>
      <section className="mt-14 grid gap-5 md:grid-cols-3">
        <Stat value="1978" label="Illustrative founding year" />
        <Stat value="3 generations" label="Of family seva represented" />
        <Stat value="7 days" label="A week of daily temple rhythms" />
      </section>
    </PageShell>
  );
}
