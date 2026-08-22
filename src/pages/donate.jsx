import React from "react";
import DonationExperience from "../components/donation-experience";
import { PageShell } from "../components/ui";
import { useLanguage } from "../context/language-context";

export default function Donate() {
  const { t } = useLanguage();

  return (
    <PageShell
      title={t.donate.title}
      subtitle={t.donate.subtitle}
    >
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#eadfcf] bg-white p-5 sm:p-8">
        <DonationExperience />
      </div>
    </PageShell>
  );
}