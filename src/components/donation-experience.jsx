import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { CONFIG, formatINR } from "../data/config";
import { TrustNotice } from "./ui";

export default function DonationExperience() {
  const [amount, setAmount] = useState(1001);
  const [custom, setCustom] = useState("");
  const [mode, setMode] = useState("upi");
  const [copied, setCopied] = useState(false);
  const finalAmount = custom ? Number(custom) || 0 : amount;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(CONFIG.upiId)}&pn=${encodeURIComponent(CONFIG.accountName)}&am=${finalAmount || 0}&cu=INR&tn=${encodeURIComponent("Temple Seva Donation")}`;
  const stripe =
    CONFIG.stripePaymentLinks[finalAmount] || CONFIG.stripePaymentLinks.default;
  const canStripe = Boolean(stripe && !stripe.includes("REPLACE_WITH_"));
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(CONFIG.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div>
      <div className="flex gap-2 rounded-2xl bg-[#f7efe5] p-1">
        <button
          onClick={() => setMode("upi")}
          className={`flex-1 rounded-xl py-3 text-sm font-bold ${mode === "upi" ? "bg-white shadow-sm text-[#8f2d0c]" : "text-[#725c4a]"}`}
        >
          UPI / QR
        </button>
        <button
          onClick={() => setMode("stripe")}
          className={`flex-1 rounded-xl py-3 text-sm font-bold ${mode === "stripe" ? "bg-white shadow-sm text-[#8f2d0c]" : "text-[#725c4a]"}`}
        >
          Card / Stripe
        </button>
      </div>
      <label className="mt-7 block text-sm font-bold">Choose amount</label>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CONFIG.suggestedAmounts.map((v) => (
          <button
            key={v}
            onClick={() => {
              setAmount(v);
              setCustom("");
            }}
            className={`rounded-2xl border px-4 py-3 text-sm font-bold ${!custom && amount === v ? "border-[#a45416] bg-[#fff1da] text-[#7e300d]" : "border-[#e6d8c7] bg-white"}`}
          >
            {formatINR(v)}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#806c5c]">
          Or enter a custom amount
        </label>
        <input
          inputMode="numeric"
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="₹ amount"
          className="mt-2 w-full rounded-2xl border border-[#ddcfbd] bg-[#fffdf9] px-4 py-3 outline-none focus:border-[#a45416]"
        />
      </div>
      <div className="mt-7 rounded-[1.6rem] border border-[#eadfcf] bg-[#fffaf2] p-6">
        {mode === "upi" ? (
          <div className="grid gap-7 md:grid-cols-[auto_1fr] md:items-center">
            <div className="mx-auto rounded-2xl bg-white p-4 shadow-sm">
              <QRCodeCanvas value={upiUrl} size={190} includeMargin />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
                Pay securely via UPI
              </div>
              <h3 className="mt-2 font-serif text-3xl font-semibold">
                Scan {formatINR(finalAmount || 0)}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#705e50]">
                Use any UPI app. Your amount and temple UPI ID are pre-filled in
                the payment intent.
              </p>
              <div className="mt-4 rounded-xl bg-white px-4 py-3 font-mono text-sm">
                {CONFIG.upiId}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={upiUrl}
                  className="inline-flex items-center gap-2 rounded-full bg-[#9c3b0d] px-4 py-2.5 text-sm font-bold text-white"
                >
                  Open UPI app <ExternalLink size={15} />
                </a>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dfd0be] bg-white px-4 py-2.5 text-sm font-bold"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
                  {copied ? "Copied" : "Copy UPI ID"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              Hosted card checkout
            </div>
            <h3 className="mt-2 font-serif text-3xl font-semibold">
              Pay {formatINR(finalAmount || 0)} with Stripe
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#705e50]">
              The browser leaves your site for Stripe-hosted checkout. No Stripe
              secret key is stored in this app.
            </p>
            {canStripe ? (
              <a
                href={stripe}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#9c3b0d] px-5 py-3 text-sm font-bold text-white"
              >
                Continue to Stripe <ExternalLink size={15} />
              </a>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                 <code>Coming soon.</code>{" "}
               
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-5">
        <TrustNotice />
      </div>
    </div>
  );
}
