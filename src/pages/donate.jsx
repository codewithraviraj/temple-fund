import React from "react";
import DonationExperience from "../components/donation-experience";
import { PageShell } from "../components/ui";

export default function Donate() {
  return (
    <PageShell
      title="Offer your seva"
      subtitle="Choose UPI/QR for a direct payment flow, or use the configured Stripe hosted checkout link for cards."
    >
      <div className="max-w-3xl rounded-[2rem] border border-[#eadfcf] bg-white p-8">
        <DonationExperience />
      </div>
    </PageShell>
  );
}
