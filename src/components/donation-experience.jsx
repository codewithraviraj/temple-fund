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

const DONOR_DETAILS_THRESHOLD = 2000;

export default function DonationExperience() {
  const [donationType, setDonationType] = useState("money");

  const [amount, setAmount] = useState(
    CONFIG.suggestedAmounts[1] || 1001
  );

  const [custom, setCustom] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [copied, setCopied] = useState(false);

  const [showMaterialSummary, setShowMaterialSummary] =
    useState(true);

  const [donor, setDonor] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [emailStatus, setEmailStatus] = useState("idle");

  const [materialQuantities, setMaterialQuantities] = useState(
    () =>
      (CONFIG.constructionMaterials || []).reduce(
        (acc, material) => {
          acc[material.id] = 0;
          return acc;
        },
        {}
      )
  );

  // ---------------------------------------------
  // MONEY TOTAL
  // ---------------------------------------------

  const moneyAmount = useMemo(() => {
    if (custom !== "") {
      return Number(custom) || 0;
    }

    return Number(amount) || 0;
  }, [amount, custom]);

  // ---------------------------------------------
  // MATERIAL TOTAL
  // ---------------------------------------------

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

  // ---------------------------------------------
  // FINAL DONATION TOTAL
  // ---------------------------------------------

  const finalAmount =
    donationType === "money"
      ? moneyAmount
      : materialTotal;

  // Applies to BOTH money + material donations
  const requiresDonorDetails =
    finalAmount > DONOR_DETAILS_THRESHOLD;

  // ---------------------------------------------
  // MOBILE
  // ---------------------------------------------

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  // ---------------------------------------------
  // UPI PAYMENT URL
  // ---------------------------------------------

  const upiUrl = useMemo(() => {
    const safeAmount = Number(finalAmount) || 0;

    return [
      "upi://pay",
      `pa=${encodeURIComponent(CONFIG.upiId)}`,
      `pn=${encodeURIComponent(CONFIG.accountName)}`,
      `am=${encodeURIComponent(
        safeAmount.toFixed(2)
      )}`,
      "cu=INR",
      `tn=${encodeURIComponent(
        donationType === "money"
          ? "Temple Seva Donation"
          : "Temple Construction Material Seva"
      )}`,
    ].join("&");
  }, [finalAmount, donationType]);

  // ---------------------------------------------
  // STRIPE
  // ---------------------------------------------

  const stripe =
    CONFIG.stripePaymentLinks?.[finalAmount] ||
    CONFIG.stripePaymentLinks?.default;

  const canStripe = Boolean(
    stripe && !stripe.includes("REPLACE_WITH_")
  );

  // ---------------------------------------------
  // MATERIAL QUANTITY
  // ---------------------------------------------

  const updateMaterialQuantity = (
    materialId,
    change
  ) => {
    setMaterialQuantities((current) => ({
      ...current,
      [materialId]: Math.max(
        0,
        Number(current[materialId] || 0) + change
      ),
    }));

    setEmailStatus("idle");
  };

  const changeMaterialQuantity = (
    materialId,
    value
  ) => {
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

  // ---------------------------------------------
  // MONEY
  // ---------------------------------------------

  const selectAmount = (value) => {
    setAmount(value);
    setCustom("");
    setEmailStatus("idle");
  };

  // ---------------------------------------------
  // DONOR DETAILS
  // ---------------------------------------------

  const updateDonor = (field, value) => {
    setDonor((current) => ({
      ...current,
      [field]: value,
    }));

    setEmailStatus("idle");
  };

  // ---------------------------------------------
  // COPY UPI
  // ---------------------------------------------

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(
        CONFIG.upiId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard errors.
    }
  };

  // ---------------------------------------------
  // MATERIAL EMAIL SUMMARY
  // ---------------------------------------------

  const materialSummary = useMemo(() => {
    if (donationType !== "materials") {
      return "Financial donation";
    }

    const selected = (
      CONFIG.constructionMaterials || []
    )
      .filter(
        (material) =>
          Number(
            materialQuantities[material.id] || 0
          ) > 0
      )
      .map((material) => {
        const quantity = Number(
          materialQuantities[material.id] || 0
        );

        const total =
          quantity * Number(material.price || 0);

        return `${quantity} x ${material.name} = ${formatINR(
          total
        )}`;
      });

    return selected.length > 0
      ? selected.join("\n")
      : "Construction material seva";
  }, [
    donationType,
    materialQuantities,
  ]);

  // ---------------------------------------------
  // VALIDATE DONOR DETAILS
  // ---------------------------------------------

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

  // ---------------------------------------------
  // SEND EMAIL
  // ---------------------------------------------

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
          publicKey: CONFIG.email.publicKey,
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

  // ---------------------------------------------
  // OPEN UPI APP
  // ---------------------------------------------

  const openUpiApp = async () => {
    if (finalAmount <= 0) {
      return;
    }

    if (requiresDonorDetails) {
      const emailSent =
        await sendDonationEmail();

      if (!emailSent) {
        return;
      }
    }

    window.location.href = upiUrl;
  };

  // ---------------------------------------------
  // OPEN STRIPE
  // ---------------------------------------------

  const openStripe = async () => {
    if (finalAmount <= 0) {
      return;
    }

    if (!canStripe) {
      alert(
        "Stripe payment link is not configured for this amount."
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

  // ---------------------------------------------
  // PAYMENT OPTIONS
  // ---------------------------------------------

  const paymentOptions = [
    {
      id: "upi",
      title: "UPI App",
      subtitle:
        "Google Pay, PhonePe, Paytm",
      icon: Smartphone,
    },
    {
      id: "qr",
      title: "Scan QR",
      subtitle:
        "Scan using any UPI app",
      icon: QrCode,
    },
    {
      id: "stripe",
      title: "Card / Stripe",
      subtitle:
        "Secure hosted checkout",
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
            Donate Money
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
            Sponsor Materials
          </button>
        </div>
      </div>

      {/* =====================================================
          MONEY DONATION
      ====================================================== */}

      {donationType === "money" && (
        <div className="mt-7">
          <label className="block text-sm font-bold text-[#35291f]">
            Choose donation amount
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
              Or enter a custom amount
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
                onChange={(event) =>
                  setCustom(
                    event.target.value.replace(
                      /[^0-9]/g,
                      ""
                    )
                  )
                }
                placeholder="Enter amount"
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
                Sponsor temple construction materials
              </label>

              <p className="mt-1 text-sm leading-6 text-[#806c5c]">
                Select one or more materials and the
                quantity you would like to sponsor.
              </p>
            </div>
          </div>

          {/* MATERIAL GRID */}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {(CONFIG.constructionMaterials || []).map(
              (material) => {
                const quantity = Number(
                  materialQuantities[
                    material.id
                  ] || 0
                );

                const itemTotal =
                  quantity *
                  Number(
                    material.price || 0
                  );

                return (
                  <div
                    key={material.id}
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
                        alt={material.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        loading="lazy"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            "/images/materials/material-placeholder.jpg";
                        }}
                      />

                      {/* IMAGE OVERLAY */}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-4 pt-14">
                        <h3 className="text-xl font-bold text-white">
                          {material.name}
                        </h3>
                      </div>
                    </div>

                    {/* CARD CONTENT */}

                    <div className="p-5">
                      <p className="min-h-[48px] text-sm leading-6 text-[#806c5c]">
                        {material.description}
                      </p>

                      {/* PRICE */}

                      <div className="mt-3">
                        <span className="text-xl font-bold text-[#9c3b0d]">
                          {formatINR(
                            material.price
                          )}
                        </span>

                        <span className="ml-1 text-sm text-[#806c5c]">
                          / {material.unit}
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
                            <Minus size={15} />
                          </button>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={quantity}
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
                            <Plus size={15} />
                          </button>
                        </div>

                        {/* ITEM TOTAL */}

                        <div className="text-right">
                          <div className="text-xs text-[#8e7b69]">
                            Item total
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

          {materialTotal > 0 && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-[#eadfcf] bg-[#fffaf2]">
              <button
                type="button"
                onClick={() =>
                  setShowMaterialSummary(
                    (current) => !current
                  )
                }
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#a06a35]">
                    Your construction seva
                  </div>

                  <div className="mt-1 text-xl font-bold text-[#35291f]">
                    {formatINR(
                      materialTotal
                    )}
                  </div>
                </div>

                {showMaterialSummary ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
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
                      .map((material) => {
                        const quantity =
                          Number(
                            materialQuantities[
                              material.id
                            ] || 0
                          );

                        return (
                          <div
                            key={material.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-[#705e50]">
                              {quantity} ×{" "}
                              {material.name}
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
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* THRESHOLD NOTICE */}

          {materialTotal > DONOR_DETAILS_THRESHOLD && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Donor details required
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Your material sponsorship is above{" "}
                    {formatINR(
                      DONOR_DETAILS_THRESHOLD
                    )}. Please provide your name and email below so
                    we can send your acknowledgement.
                  </p>
                </div>
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
              {donationType === "money"
                ? "Your donation"
                : "Material seva total"}
            </div>

            <div className="mt-1 font-serif text-3xl font-semibold">
              {formatINR(
                finalAmount || 0
              )}
            </div>

            {requiresDonorDetails && (
              <div className="mt-3 inline-flex rounded-full bg-[#7e300d] px-3 py-1 text-xs font-bold">
                Donor details required above{" "}
                {formatINR(
                  DONOR_DETAILS_THRESHOLD
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#f9dcc1]">
            <Heart
              size={17}
              className="fill-current text-[#f1a05b]"
            />
            Every seva supports the temple.
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
              Donor details
            </div>

            <h3 className="mt-2 font-serif text-2xl font-semibold text-[#35291f]">
              Thank-you email details
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#705e50]">
              Because this contribution is above{" "}
              {formatINR(
                DONOR_DETAILS_THRESHOLD
              )}
              , please provide your details so we can
              send your donation acknowledgement.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* NAME */}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#806c5c]">
                <User size={14} />
                Full Name *
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
                placeholder="Your full name"
                className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 outline-none focus:border-[#a45416]"
              />

              {emailStatus ===
                "name-error" && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Please enter your name.
                </p>
              )}
            </div>

            {/* EMAIL */}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#806c5c]">
                <Mail size={14} />
                Email *
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
                className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 outline-none focus:border-[#a45416]"
              />

              {emailStatus ===
                "email-error" && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* PHONE */}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#806c5c]">
                <Phone size={14} />
                Phone
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
                className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 outline-none focus:border-[#a45416]"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PAYMENT METHOD
      ====================================================== */}

      <div className="mt-7">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
          Choose payment method
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
                      <Icon size={18} />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[#35291f]">
                        {option.title}
                      </div>

                      <div className="mt-0.5 text-xs text-[#806c5c]">
                        {option.subtitle}
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
        {/* UPI */}

        {paymentMethod ===
          "upi" && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              Direct UPI payment
            </div>

            <h3 className="mt-2 font-serif text-3xl font-semibold text-[#35291f]">
              Pay{" "}
              {formatINR(
                finalAmount || 0
              )}{" "}
              via UPI
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#705e50]">
              {isMobile
                ? "Tap below to open your installed UPI app. The amount and temple UPI ID are pre-filled."
                : "On desktop, scan the QR code using your phone. On mobile, the button can open your UPI app."}
            </p>

            <div className="mt-4 rounded-xl bg-white px-4 py-3">
              <div className="text-xs text-[#8c7b6a]">
                Temple UPI ID
              </div>

              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="break-all font-mono text-sm font-bold text-[#35291f]">
                  {CONFIG.upiId}
                </span>

                <button
                  type="button"
                  onClick={copy}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfd0be] px-2.5 py-2 text-xs font-bold hover:bg-[#f7efe5]"
                >
                  {copied ? (
                    <>
                      <Check
                        size={14}
                        className="text-green-600"
                      />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={openUpiApp}
              disabled={
                finalAmount <= 0 ||
                emailStatus ===
                  "sending"
              }
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#9c3b0d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7e300d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {emailStatus ===
              "sending"
                ? "Preparing..."
                : "Open UPI App"}

              <ExternalLink
                size={15}
              />
            </button>

            {emailStatus ===
              "error" && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                We couldn't send the donor
                email. Please check the
                details above and try again.
              </p>
            )}

            {emailStatus ===
              "sent" && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                <Check size={15} />
                Thank-you email sent to{" "}
                {donor.email}
              </p>
            )}

            <p className="mt-4 text-xs leading-5 text-[#806c5c]">
              UPI app support depends on
              the device and installed UPI
              applications. On desktop,
              use the QR option.
            </p>
          </div>
        )}

        {/* QR */}

        {paymentMethod ===
          "qr" && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              UPI QR payment
            </div>

            <div className="mt-5 grid gap-7 md:grid-cols-[auto_1fr] md:items-center">
              <div className="mx-auto rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeCanvas
                  value={upiUrl}
                  size={210}
                  includeMargin
                />
              </div>

              <div>
                <h3 className="font-serif text-3xl font-semibold text-[#35291f]">
                  Scan{" "}
                  {formatINR(
                    finalAmount || 0
                  )}
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#705e50]">
                  Scan this QR code using
                  Google Pay, PhonePe, Paytm,
                  BHIM or another UPI app.
                </p>

                <div className="mt-4 rounded-xl bg-white px-4 py-3">
                  <div className="text-xs text-[#8c7b6a]">
                    Temple UPI ID
                  </div>

                  <div className="mt-1 font-mono text-sm font-bold text-[#35291f]">
                    {CONFIG.upiId}
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
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#9c3b0d] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailStatus ===
                    "sending"
                      ? "Sending..."
                      : emailStatus ===
                        "sent"
                      ? "Email Sent"
                      : "Send Donation Details"}

                    <Mail size={15} />
                  </button>
                )}

                {emailStatus ===
                  "sent" && (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                    <Check size={15} />
                    Thank-you email sent to{" "}
                    {donor.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STRIPE */}

        {paymentMethod ===
          "stripe" && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
              Hosted card checkout
            </div>

            <h3 className="mt-2 font-serif text-3xl font-semibold text-[#35291f]">
              Pay{" "}
              {formatINR(
                finalAmount || 0
              )}{" "}
              with Stripe
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#705e50]">
              Continue to Stripe-hosted
              checkout for card and other
              supported payment methods.
            </p>

            {canStripe ? (
              <button
                type="button"
                onClick={
                  openStripe
                }
                disabled={
                  finalAmount <= 0 ||
                  emailStatus ===
                    "sending"
                }
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#9c3b0d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7e300d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailStatus ===
                "sending"
                  ? "Preparing..."
                  : "Continue to Stripe"}

                <ArrowRight
                  size={15}
                />
              </button>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Stripe payment link is not
                configured for this amount yet.
              </div>
            )}

            {emailStatus ===
              "error" && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                We couldn't send the donor
                email. Please check the
                donor details and try again.
              </p>
            )}

            {emailStatus ===
              "sent" && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                <Check size={15} />
                Thank-you email sent to{" "}
                {donor.email}
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