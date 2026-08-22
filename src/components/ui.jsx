import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Landmark,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import { CONFIG, formatINR } from "../data/config";

export function DonateButton({ onClick, full = false }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full cursor-pointer" : "cursor-pointer"} rounded-full bg-[#9c3b0d] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(156,59,13,.22)] transition hover:-translate-y-0.5 hover:bg-[#7f2f09]`}
    >
      Donate with Shraddha
    </button>
  );
}

export function SectionIntro({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b5d25]">
        {eyebrow}
      </div>
      <h2 className="mt-3 font-serif text-4xl font-semibold text-[#4b2416] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-[#746255]">{copy}</p>
    </div>
  );
}

export function PageShell({ title, subtitle, children }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b5d25]">
          {CONFIG.shortName}
        </div>
        <h1 className="mt-3 font-serif text-5xl font-semibold text-[#4b2416]">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#746255]">{subtitle}</p>
      </div>
      {children}
    </main>
  );
}

export function TrustPill({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#eadcca] bg-white px-3 py-2">
      {icon}
      {text}
    </span>
  );
}

export function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-[#ebdfd0] bg-white p-5">
      <div className="font-serif text-3xl font-semibold text-[#7b2d0a]">
        {value}
      </div>
      <div className="mt-1 text-sm text-[#756154]">{label}</div>
    </div>
  );
}

export function ImpactCard({ icon, title, amount, description }) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfcf] bg-white p-7 shadow-[0_14px_45px_rgba(75,36,22,.06)]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff1da] text-[#a45416]">
        {icon}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <h3 className="font-serif text-2xl font-semibold">{title}</h3>
        <span className="rounded-full bg-[#f8ead7] px-3 py-1 text-sm font-bold text-[#7e300d]">
          {amount}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[#705e50]">{description}</p>
    </article>
  );
}

export function ContactCard({ icon, title, children }) {
  return (
    <div className="rounded-[1.5rem] border border-[#eadfcf] bg-white p-7">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff1da] text-[#a45416]">
        {icon}
      </div>
      <h3 className="mt-5 font-serif text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#705e50]">{children}</p>
    </div>
  );
}

export function TestimonialStrip() {
  return (
    <section className="bg-[#f1e7d8] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="From devotees"
          title="Giving should feel human."
          copy="Simple, respectful, and transparent — exactly how a digital act of seva should feel."
        />
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {CONFIG.testimonials.map((t) => (
            <div key={t.name} className="rounded-[1.5rem] bg-white p-6">
              <div className="flex gap-1 text-[#c7892d]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#705e50]">
                “{t.quote}”
              </p>
              <div className="mt-5 text-sm font-bold">{t.name}</div>
              <div className="mt-1 text-xs text-[#8a7869]">{t.city}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImpactDefaults() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <ImpactCard
        icon={<Landmark />}
        title="Temple restoration"
        amount={formatINR(540000)}
        description="Roof repairs, stonework, rain protection and sacred-space upkeep."
      />
      <ImpactCard
        icon={<Utensils />}
        title="Annadanam"
        amount={formatINR(180000)}
        description="Simple, nourishing meals served during daily and festival seva."
      />
      <ImpactCard
        icon={<BookOpen />}
        title="Veda Pathashala"
        amount={formatINR(110000)}
        description="Support learning materials, teachers and student essentials."
      />
    </div>
  );
}

export function CampaignCallout({ onDonate }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-[#4b1b0d] px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/70">
            Ready for a small act of seva?
          </div>
          <h2 className="mt-2 max-w-2xl font-serif text-4xl font-semibold">
            Even ₹501 can become part of something that lasts.
          </h2>
        </div>
        <div>
          <DonateButton onClick={onDonate} />
        </div>
      </div>
    </section>
  );
}

export function ExploreLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 font-semibold text-[#8f2d0c] hover:gap-3 transition-all"
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

export function TrustNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#eadfcf] bg-white p-4 text-xs leading-6 text-[#766456]">
      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#8f2d0c]" />
      <span>
        This frontend records no card details and does not claim payment
        success. Final confirmation and receipts come from your payment
        provider.
      </span>
    </div>
  );
}

export { Sparkles };
