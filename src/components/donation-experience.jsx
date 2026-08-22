import React, { useMemo, useState } from "react";
import emailjs from "@emailjs/browser";

import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  ExternalLink,
  Heart,
  IndianRupee,
  Mail,
  Minus,
  Package,
  Phone,
  Plus,
  QrCode,
  Smartphone,
  User,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";
import { CONFIG, formatINR } from "../data/config";
import { TrustNotice } from "./ui";
import { useLanguage } from "../context/language-context";

const DONOR_DETAILS_THRESHOLD = 2000;

export default function DonationExperience() {
  const { language, t } = useLanguage();

  // =========================================================
  // DONATION TYPE
  // =========================================================

  const [donationType, setDonationType] = useState("money");

  // money | materials

  // =========================================================
  // MONEY DONATION
  // =========================================================

  const [amount, setAmount] = useState(
    CONFIG.suggestedAmounts[1] || 1001
  );

  const [custom, setCustom] = useState("");

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  const [paymentMethod, setPaymentMethod] = useState("upi");

  // upi | qr | stripe

  // =========================================================
  // COPY STATE
  // =========================================================

  const [copied, setCopied] = useState(false);

  // =========================================================
  // MATERIAL SUMMARY
  // =========================================================

  const [showMaterialSummary, setShowMaterialSummary] =
    useState(true);

  // =========================================================
  // DONOR
  // =========================================================

  const [donor, setDonor] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [emailStatus, setEmailStatus] = useState("idle");

  // =========================================================
  // MATERIAL QUANTITIES
  // =========================================================

  const [materialQuantities, setMaterialQuantities] = useState(() =>
    (CONFIG.constructionMaterials || []).reduce(
      (acc, material) => {
        acc[material.id] = 0;
        return acc;
      },
      {}
    )
  );

  // =========================================================
  // MONEY TOTAL
  // =========================================================

  const moneyAmount = useMemo(() => {
    if (custom !== "") {
      return Number(custom) || 0;
    }

    return Number(amount) || 0;
  }, [amount, custom]);

  // =========================================================
  // MATERIAL TOTAL
  // =========================================================

  const materialTotal = useMemo(() => {
    return (CONFIG.constructionMaterials || []).reduce(
      (total, material) => {
        const quantity = Number(
          materialQuantities[material.id] || 0
        );

        return (
          total +
          quantity * Number(material.price || 0)
        );
      },
      0
    );
  }, [materialQuantities]);

  // =========================================================
  // FINAL AMOUNT
  // =========================================================

  const finalAmount =
    donationType === "money"
      ? moneyAmount
      : materialTotal;

  // =========================================================
  // DONOR DETAILS REQUIRED ABOVE ₹2,000
  // Applies to money AND materials.
  // =========================================================

  const requiresDonorDetails =
    finalAmount > DONOR_DETAILS_THRESHOLD;

  // =========================================================
  // MOBILE DETECTION
  // =========================================================

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // =========================================================
  // STANDARD UPI URL
  //
  // This is intentionally a standard upi://pay intent.
  // The phone/browser decides which installed UPI apps
  // are available to handle the payment.
  // =========================================================

  const upiUrl = useMemo(() => {
    const safeAmount = Number(finalAmount) || 0;

    const transactionNote =
      donationType === "money"
        ? "Temple Seva Donation"
        : "Temple Construction Material Seva";

    return [
      "upi://pay",
      `pa=${encodeURIComponent(CONFIG.upiId)}`,
      `pn=${encodeURIComponent(CONFIG.accountName)}`,
      `am=${encodeURIComponent(safeAmount.toFixed(2))}`,
      "cu=INR",
      `tn=${encodeURIComponent(transactionNote)}`,
    ].join("&");
  }, [finalAmount, donationType]);

  // =========================================================
  // STRIPE
  // =========================================================

  const stripe =
    CONFIG.stripePaymentLinks?.[finalAmount] ||
    CONFIG.stripePaymentLinks?.default;

  const canStripe = Boolean(
    stripe && !stripe.includes("REPLACE_WITH_")
  );

  // =========================================================
  // SELECT MONEY AMOUNT
  // =========================================================

  const selectAmount = (value) => {
    setAmount(value);
    setCustom("");
    setEmailStatus("idle");
  };

  // =========================================================
  // MATERIAL QUANTITY
  // =========================================================

  const updateMaterialQuantity = (materialId, change) => {
    setMaterialQuantities((current) => ({
      ...current,

      [materialId]: Math.max(
        0,
        Number(current[materialId] || 0) + change
      ),
    }));

    setEmailStatus("idle");
  };

  const changeMaterialQuantity = (materialId, value) => {
    const quantity = Number(value);

    setMaterialQuantities((current) => ({
      ...current,

      [materialId]: Math.max(
        0,
        Number.isFinite(quantity) ? quantity : 0
      ),
    }));

    setEmailStatus("idle");
  };

  // =========================================================
  // DONOR DETAILS
  // =========================================================

  const updateDonor = (field, value) => {
    setDonor((current) => ({
      ...current,
      [field]: value,
    }));

    setEmailStatus("idle");
  };

  // =========================================================
  // COPY UPI ID
  // =========================================================

  const copyUpi = async () => {
    try {
      await navigator.clipboard?.writeText(CONFIG.upiId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard errors.
    }
  };

  // =========================================================
  // MATERIAL EMAIL SUMMARY
  // =========================================================

  const materialSummary = useMemo(() => {
    if (donationType !== "materials") {
      return "Financial donation";
    }

    const selected = (CONFIG.constructionMaterials || [])
      .filter(
        (material) =>
          Number(materialQuantities[material.id] || 0) > 0
      )
      .map((material) => {
        const quantity = Number(
          materialQuantities[material.id] || 0
        );

        const total =
          quantity * Number(material.price || 0);

        const materialName =
          material.name?.[language] ||
          material.name ||
          "";

        return `${quantity} x ${materialName} = ${formatINR(
          total
        )}`;
      });

    return selected.length > 0
      ? selected.join("\n")
      : "Construction material seva";
  }, [donationType, materialQuantities, language]);

  // =========================================================
  // VALIDATE DONOR
  // =========================================================

  const validateDonorDetails = () => {
    if (!requiresDonorDetails) {
      return true;
    }

    if (!donor.name.trim()) {
      setEmailStatus("name-error");
      return false;
    }

    if (!donor.email.trim()) {
      setEmailStatus("email-error");
      return false;
    }

    const emailValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        donor.email
      );

    if (!emailValid) {
      setEmailStatus("email-error");
      return false;
    }

    return true;
  };

  // =========================================================
  // SEND DONATION EMAIL
  // =========================================================

  const sendDonationEmail = async () => {
    if (!requiresDonorDetails) {
      return true;
    }

    if (!CONFIG.email?.enabled) {
      return true;
    }

    if (!validateDonorDetails()) {
      return false;
    }

    setEmailStatus("sending");

    try {
      await emailjs.send(
        CONFIG.email.serviceId,
        CONFIG.email.templateId,
        {
          to_name: donor.name,
          to_email: donor.email,

          donor_name: donor.name,
          donor_email: donor.email,
          donor_phone:
            donor.phone || "Not provided",

          temple_name: CONFIG.templeName,
          temple_location: CONFIG.location,

          donation_type:
            donationType === "money"
              ? "Money Donation"
              : "Temple Construction Material Seva",

          donation_amount:
            formatINR(finalAmount),

          payment_method:
            paymentMethod === "upi"
              ? "UPI App"
              : paymentMethod === "qr"
              ? "UPI QR Code"
              : "Stripe",

          material_summary:
            materialSummary,
        },
        {
          publicKey:
            CONFIG.email.publicKey,
        }
      );

      setEmailStatus("sent");

      return true;
    } catch (error) {
      console.error(
        "Donation email failed:",
        error
      );

      setEmailStatus("error");

      return false;
    }
  };

  // =========================================================
  // OPEN ANY UPI APP
  //
  // IMPORTANT:
  // We intentionally use the standard UPI intent.
  // Do NOT use tez://, phonepe:// or paytmmp:// here.
  // =========================================================

  const openUpiApp = async () => {
    if (finalAmount <= 0) {
      return;
    }

    // Donations above ₹2,000 require donor details.
    if (requiresDonorDetails) {
      const emailSent =
        await sendDonationEmail();

      if (!emailSent) {
        return;
      }
    }

    // Standard UPI payment intent.
    //
    // On a supported mobile device, the operating system
    // should determine which installed UPI application
    // can handle this payment.
    window.location.href = upiUrl;
  };

  // =========================================================
  // OPEN STRIPE
  // =========================================================

  const openStripe = async () => {
    if (finalAmount <= 0) {
      return;
    }

    if (!canStripe) {
      alert(
        t.donate.stripeNotConfigured
      );

      return;
    }

    if (requiresDonorDetails) {
      const emailSent =
        await sendDonationEmail();

      if (!emailSent) {
        return;
      }
    }

    window.open(
      stripe,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // PAYMENT OPTIONS
  // =========================================================

  const paymentOptions = [
    {
      id: "upi",
      title: t.donate.upi,
      subtitle:
        t.donate.upiDescription,
      icon: Smartphone,
    },

    {
      id: "qr",
      title: t.donate.qr,
      subtitle:
        t.donate.qrDescription,
      icon: QrCode,
    },

    {
      id: "stripe",
      title: t.donate.stripe,
      subtitle:
        t.donate.stripeDescription,
      icon: CreditCard,
    },
  ];

  return (
    <div>
      {/* =====================================================
          DONATION TYPE
      ====================================================== */}

      <div className="rounded-2xl bg-[#f7efe5] p-1">
        <div className="grid gap-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setDonationType("money");
              setPaymentMethod("upi");
              setEmailStatus("idle");
            }}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${
              donationType === "money"
                ? "bg-white text-[#8f2d0c] shadow-sm"
                : "text-[#725c4a] hover:text-[#8f2d0c]"
            }`}
          >
            <IndianRupee size={17} />

            {t.donate.donateMoney}
          </button>

          <button
            type="button"
            onClick={() => {
              setDonationType("materials");
              setPaymentMethod("upi");
              setEmailStatus("idle");
            }}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${
              donationType === "materials"
                ? "bg-white text-[#8f2d0c] shadow-sm"
                : "text-[#725c4a] hover:text-[#8f2d0c]"
            }`}
          >
            <Building2 size={17} />

            {t.donate.sponsorMaterials}
          </button>
        </div>
      </div>

      {/* =====================================================
          MONEY
      ====================================================== */}

      {donationType === "money" && (
        <div className="mt-7">
          <label className="block text-sm font-bold text-[#35291f]">
            {t.donate.chooseAmount}
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CONFIG.suggestedAmounts.map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    selectAmount(value)
                  }
                  className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    !custom &&
                    amount === value
                      ? "border-[#a45416] bg-[#fff1da] text-[#7e300d]"
                      : "border-[#e6d8c7] bg-white text-[#5f5147] hover:border-[#b9743e]"
                  }`}
                >
                  {formatINR(value)}
                </button>
              )
            )}
          </div>

          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#806c5c]">
              {t.donate.customAmount}
            </label>

            <div className="relative mt-2">
              <IndianRupee
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9f8c78]"
              />

              <input
                type="text"
                inputMode="numeric"
                value={custom}
                onChange={(event) => {
                  setCustom(
                    event.target.value.replace(
                      /[^0-9]/g,
                      ""
                    )
                  );

                  setEmailStatus("idle");
                }}
                placeholder={
                  t.donate.enterAmount
                }
                className="w-full rounded-2xl border border-[#ddcfbd] bg-[#fffdf9] py-3.5 pl-11 pr-4 outline-none transition focus:border-[#a45416] focus:ring-2 focus:ring-[#a45416]/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MATERIALS
      ====================================================== */}

      {donationType === "materials" && (
        <div className="mt-7">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#fff1da] p-2.5">
              <Package className="h-5 w-5 text-[#9c3b0d]" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#35291f]">
                {t.donate.sponsorTitle}
              </label>

              <p className="mt-1 text-sm leading-6 text-[#806c5c]">
                {t.donate.sponsorDescription}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {(CONFIG.constructionMaterials || []).map(
              (material) => {
                const quantity =
                  Number(
                    materialQuantities[
                      material.id
                    ] || 0
                  );

                const itemTotal =
                  quantity *
                  Number(
                    material.price || 0
                  );

                const materialName =
                  material.name?.[
                    language
                  ] ||
                  material.name;

                const materialDescription =
                  material.description?.[
                    language
                  ] ||
                  material.description;

                const materialUnit =
                  material.unit?.[
                    language
                  ] ||
                  material.unit;

                return (
                  <div
                    key={
                      material.id
                    }
                    className={`overflow-hidden rounded-3xl border bg-white transition-all duration-300 ${
                      quantity > 0
                        ? "border-[#b9743e] shadow-lg"
                        : "border-[#eadfcf] hover:-translate-y-1 hover:border-[#d8b18d] hover:shadow-lg"
                    }`}
                  >
                    {/* IMAGE */}

                    <div className="relative h-52 overflow-hidden bg-[#f7efe5]">
                      <img
                        src={
                          material.image ||
                          "/images/materials/material-placeholder.jpg"
                        }
                        alt={
                          materialName
                        }
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        loading="lazy"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            "/images/materials/material-placeholder.jpg";
                        }}
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-4 pt-14">
                        <h3 className="text-xl font-bold text-white">
                          {
                            materialName
                          }
                        </h3>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <p className="min-h-[48px] text-sm leading-6 text-[#806c5c]">
                        {
                          materialDescription
                        }
                      </p>

                      <div className="mt-3">
                        <span className="text-xl font-bold text-[#9c3b0d]">
                          {formatINR(
                            material.price
                          )}
                        </span>

                        <span className="ml-1 text-sm text-[#806c5c]">
                          /{" "}
                          {
                            materialUnit
                          }
                        </span>
                      </div>

                      {/* QUANTITY */}

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateMaterialQuantity(
                                material.id,
                                -1
                              )
                            }
                            disabled={
                              quantity === 0
                            }
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#dfd0be] bg-white transition hover:bg-[#f7efe5] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus
                              size={15}
                            />
                          </button>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              quantity
                            }
                            onChange={(
                              event
                            ) =>
                              changeMaterialQuantity(
                                material.id,
                                event.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                )
                              )
                            }
                            className="h-10 w-16 rounded-xl border border-[#dfd0be] bg-white text-center text-sm font-bold text-[#35291f] outline-none focus:border-[#a45416] focus:ring-2 focus:ring-[#a45416]/10"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              updateMaterialQuantity(
                                material.id,
                                1
                              )
                            }
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#9c3b0d] text-white transition hover:bg-[#7e300d]"
                          >
                            <Plus
                              size={15}
                            />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-[#8e7b69]">
                            {
                              t.donate
                                .itemTotal
                            }
                          </div>

                          <div className="text-lg font-bold text-[#35291f]">
                            {formatINR(
                              itemTotal
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* MATERIAL SUMMARY */}

          {materialTotal >
            0 && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-[#eadfcf] bg-[#fffaf2]">
              <button
                type="button"
                onClick={() =>
                  setShowMaterialSummary(
                    (current) =>
                      !current
                  )
                }
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#a06a35]">
                    {
                      t.donate
                        .constructionTotal
                    }
                  </div>

                  <div className="mt-1 text-xl font-bold text-[#35291f]">
                    {formatINR(
                      materialTotal
                    )}
                  </div>
                </div>

                {showMaterialSummary ? (
                  <ChevronUp
                    size={18}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                  />
                )}
              </button>

              {showMaterialSummary && (
                <div className="border-t border-[#eadfcf] px-5 py-4">
                  <div className="space-y-2">
                    {(
                      CONFIG.constructionMaterials ||
                      []
                    )
                      .filter(
                        (material) =>
                          Number(
                            materialQuantities[
                              material.id
                            ] || 0
                          ) > 0
                      )
                      .map(
                        (material) => {
                          const quantity =
                            Number(
                              materialQuantities[
                                material.id
                              ] || 0
                            );

                          const materialName =
                            material.name?.[
                              language
                            ] ||
                            material.name;

                          return (
                            <div
                              key={
                                material.id
                              }
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-[#705e50]">
                                {
                                  quantity
                                }{" "}
                                ×{" "}
                                {
                                  materialName
                                }
                              </span>

                              <span className="font-bold text-[#35291f]">
                                {formatINR(
                                  quantity *
                                    Number(
                                      material.price ||
                                        0
                                    )
                                )}
                              </span>
                            </div>
                          );
                        }
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MATERIAL THRESHOLD */}

          {materialTotal >
            DONOR_DETAILS_THRESHOLD && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <p className="text-sm leading-6 text-amber-900">
                  {
                    t.donate
                      .donorThresholdMaterial
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          TOTAL
      ====================================================== */}

      <div className="mt-7 rounded-[1.6rem] bg-[#4f1e0d] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4c28b]">
              {donationType ===
              "money"
                ? t.donate
                    .yourDonation
                : t.donate
                    .materialSevaTotal}
            </div>

            <div className="mt-1 font-serif text-3xl font-semibold">
              {formatINR(
                finalAmount || 0
              )}
            </div>

            {requiresDonorDetails && (
              <div className="mt-3 inline-flex rounded-full bg-[#7e300d] px-3 py-1 text-xs font-bold">
                {
                  t.donate
                    .donorThreshold
                }
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#f9dcc1]">
            <Heart
              size={17}
              className="fill-current text-[#f1a05b]"
            />

            {t.donate.everySeva}
          </div>
        </div>
      </div>

      {/* =====================================================
          DONOR DETAILS
      ====================================================== */}

      {requiresDonorDetails && (
        <div className="mt-7 rounded-[1.6rem] border border-[#eadfcf] bg-[#fffaf2] p-6">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              {t.donate.donorDetails}
            </div>

            <h3 className="mt-2 font-serif text-2xl font-semibold text-[#35291f]">
              {t.donate.donorDetails}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#705e50]">
              {
                t.donate
                  .donorDetailsDescription
              }
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* NAME */}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#806c5c]">
                <User size={14} />

                {t.donate.fullName} *
              </label>

              <input
                type="text"
                value={donor.name}
                onChange={(event) =>
                  updateDonor(
                    "name",
                    event.target.value
                  )
                }
                placeholder={
                  t.donate.fullName
                }
                className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 outline-none transition focus:border-[#a45416] focus:ring-2 focus:ring-[#a45416]/10"
              />

              {emailStatus ===
                "name-error" && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {
                    t.donate
                      .nameRequired
                  }
                </p>
              )}
            </div>

            {/* EMAIL */}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#806c5c]">
                <Mail size={14} />

                {t.donate.email} *
              </label>

              <input
                type="email"
                value={donor.email}
                onChange={(event) =>
                  updateDonor(
                    "email",
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 outline-none transition focus:border-[#a45416] focus:ring-2 focus:ring-[#a45416]/10"
              />

              {emailStatus ===
                "email-error" && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {
                    t.donate
                      .emailRequired
                  }
                </p>
              )}
            </div>

            {/* PHONE */}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#806c5c]">
                <Phone size={14} />

                {t.donate.phone}
              </label>

              <input
                type="tel"
                value={donor.phone}
                onChange={(event) =>
                  updateDonor(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+91"
                className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 outline-none transition focus:border-[#a45416] focus:ring-2 focus:ring-[#a45416]/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PAYMENT METHODS
      ====================================================== */}

      <div className="mt-7">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
          {t.donate.paymentMethod}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {paymentOptions.map(
            (option) => {
              const Icon =
                option.icon;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      option.id
                    )
                  }
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    paymentMethod ===
                    option.id
                      ? "border-[#a45416] bg-[#fff1da] shadow-sm"
                      : "border-[#e6d8c7] bg-white hover:border-[#b9743e]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-2 ${
                        paymentMethod ===
                        option.id
                          ? "bg-white text-[#9c3b0d]"
                          : "bg-[#f7efe5] text-[#725c4a]"
                      }`}
                    >
                      <Icon
                        size={18}
                      />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[#35291f]">
                        {
                          option.title
                        }
                      </div>

                      <div className="mt-0.5 text-xs text-[#806c5c]">
                        {
                          option.subtitle
                        }
                      </div>
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================================
          PAYMENT CONTENT
      ====================================================== */}

      <div className="mt-5 rounded-[1.6rem] border border-[#eadfcf] bg-[#fffaf2] p-6">
        {/* ==================================================
            UPI APP
        =================================================== */}

        {paymentMethod ===
          "upi" && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              {t.donate.directUpi}
            </div>

            <h3 className="mt-2 font-serif text-3xl font-semibold text-[#35291f]">
              {t.donate.payViaUpi}{" "}
              {formatINR(
                finalAmount || 0
              )}
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#705e50]">
              {isMobile
                ? t.donate.mobileUpi
                : t.donate.desktopUpi}
            </p>

            {/* UPI ID */}

            <div className="mt-4 rounded-xl bg-white px-4 py-3">
              <div className="text-xs text-[#8c7b6a]">
                {t.donate.templeUpi}
              </div>

              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="break-all font-mono text-sm font-bold text-[#35291f]">
                  {CONFIG.upiId}
                </span>

                <button
                  type="button"
                  onClick={
                    copyUpi
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfd0be] px-2.5 py-2 text-xs font-bold transition hover:bg-[#f7efe5]"
                >
                  {copied ? (
                    <>
                      <Check
                        size={14}
                        className="text-green-600"
                      />

                      {
                        t.buttons
                          .copied
                      }
                    </>
                  ) : (
                    <>
                      <Copy
                        size={14}
                      />

                      {
                        t.buttons
                          .copy
                      }
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* UNIVERSAL UPI BUTTON */}

            <div className="mt-5">
              <button
                type="button"
                onClick={
                  openUpiApp
                }
                disabled={
                  finalAmount <=
                    0 ||
                  emailStatus ===
                    "sending"
                }
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#9c3b0d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#7e300d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailStatus ===
                "sending"
                  ? t.donate
                      .preparing
                  : t.buttons
                      .openUpi}

                <ExternalLink
                  size={16}
                />
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-[#806c5c]">
                {language === "hi"
                  ? "आपके फोन पर उपलब्ध UPI ऐप चुनें और भुगतान पूरा करें।"
                  : "Your phone will let you choose an available UPI app to complete the payment."}
              </p>
            </div>

            {/* QR FALLBACK MESSAGE */}

            <div className="mt-5 rounded-2xl bg-[#f7efe5] p-4">
              <div className="flex items-start gap-3">
                <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#9c3b0d]" />

                <div>
                  <p className="text-sm font-bold text-[#35291f]">
                    {language ===
                    "hi"
                      ? "UPI ऐप नहीं खुल रहा?"
                      : "UPI app not opening?"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#806c5c]">
                    {language ===
                    "hi"
                      ? "ऊपर Scan QR विकल्प चुनें और अपने फोन में किसी भी UPI ऐप से QR स्कैन करें।"
                      : "Choose Scan QR above and scan the code with any UPI app on your phone."}
                  </p>
                </div>
              </div>
            </div>

            {emailStatus ===
              "error" && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {
                  t.donate
                    .emailFailed
                }
              </p>
            )}

            {emailStatus ===
              "sent" && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                <Check
                  size={15}
                />

                {
                  t.donate
                    .emailSent
                }{" "}
                {donor.email}
              </p>
            )}
          </div>
        )}

        {/* ==================================================
            QR
        =================================================== */}

        {paymentMethod ===
          "qr" && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              {t.donate.qr}
            </div>

            <div className="mt-5 grid gap-7 md:grid-cols-[auto_1fr] md:items-center">
              <div className="mx-auto rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeCanvas
                  value={
                    upiUrl
                  }
                  size={220}
                  includeMargin
                />
              </div>

              <div>
                <h3 className="font-serif text-3xl font-semibold text-[#35291f]">
                  {language ===
                  "hi"
                    ? "स्कैन करके भुगतान करें"
                    : "Scan to Pay"}
                </h3>

                <div className="mt-2 text-2xl font-bold text-[#9c3b0d]">
                  {formatINR(
                    finalAmount ||
                      0
                  )}
                </div>

                <p className="mt-2 text-sm leading-7 text-[#705e50]">
                  {
                    t.donate
                      .qrDescriptionFull
                  }
                </p>

                <div className="mt-4 rounded-xl bg-white px-4 py-3">
                  <div className="text-xs text-[#8c7b6a]">
                    {
                      t.donate
                        .templeUpi
                    }
                  </div>

                  <div className="mt-1 font-mono text-sm font-bold text-[#35291f]">
                    {
                      CONFIG.upiId
                    }
                  </div>
                </div>

                {requiresDonorDetails && (
                  <button
                    type="button"
                    onClick={
                      sendDonationEmail
                    }
                    disabled={
                      emailStatus ===
                      "sending"
                    }
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#9c3b0d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7e300d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailStatus ===
                    "sending"
                      ? t.donate
                          .sending
                      : emailStatus ===
                        "sent"
                      ? language ===
                        "hi"
                        ? "ईमेल भेज दिया गया"
                        : "Email Sent"
                      : language ===
                        "hi"
                      ? "दाता विवरण भेजें"
                      : "Send Donation Details"}

                    <Mail
                      size={15}
                    />
                  </button>
                )}

                {emailStatus ===
                  "sent" && (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                    <Check
                      size={15}
                    />

                    {
                      t.donate
                        .emailSent
                    }{" "}
                    {
                      donor.email
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            STRIPE
        =================================================== */}

        {paymentMethod ===
          "stripe" && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              {
                t.donate
                  .stripe
              }
            </div>

            <h3 className="mt-2 font-serif text-3xl font-semibold text-[#35291f]">
              {language ===
              "hi"
                ? "Stripe से भुगतान करें"
                : "Pay with Stripe"}
            </h3>

            <div className="mt-2 text-2xl font-bold text-[#9c3b0d]">
              {formatINR(
                finalAmount || 0
              )}
            </div>

            <p className="mt-2 text-sm leading-7 text-[#705e50]">
              {
                t.donate
                  .stripeDescriptionFull
              }
            </p>

            {canStripe ? (
              <button
                type="button"
                onClick={
                  openStripe
                }
                disabled={
                  finalAmount <=
                    0 ||
                  emailStatus ===
                    "sending"
                }
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#9c3b0d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7e300d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailStatus ===
                "sending"
                  ? t.donate
                      .preparing
                  : t.buttons
                      .continueStripe}

                <ArrowRight
                  size={15}
                />
              </button>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {
                  t.donate
                    .stripeNotConfigured
                }
              </div>
            )}

            {emailStatus ===
              "error" && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {
                  t.donate
                    .emailFailed
                }
              </p>
            )}

            {emailStatus ===
              "sent" && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                <Check
                  size={15}
                />

                {
                  t.donate
                    .emailSent
                }{" "}
                {
                  donor.email
                }
              </p>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          TRUST NOTICE
      ====================================================== */}

      <div className="mt-5">
        <TrustNotice />
      </div>
    </div>
  );
}