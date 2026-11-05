import React, { useMemo, useState } from "react";
import {
  Building2,
  Check,
  Heart,
  IndianRupee,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { CONFIG, formatINR } from "../data/config";
import { useLanguage } from "../context/language-context";

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay checkout did not load."));
    document.body.appendChild(script);
  });

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const readApiResponse = async (response) => {
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "The donation API is unavailable in this preview. Run the app with Vercel CLI or use the deployed site.",
    );
  }
  return response.json();
};

export default function DonationExperience() {
  const { language, t } = useLanguage();
  const [donationType, setDonationType] = useState("money");
  const [amount, setAmount] = useState(CONFIG.suggestedAmounts[1] || 1001);
  const [customAmount, setCustomAmount] = useState("");
  const [quantities, setQuantities] = useState(() =>
    CONFIG.constructionMaterials.reduce((values, material) => {
      values[material.id] = 0;
      return values;
    }, {}),
  );
  const [donor, setDonor] = useState({
    name: "",
    email: "",
    phone: "",
    publicOptIn: false,
    displayName: "",
  });
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [thankYou, setThankYou] = useState(null);

  const materialTotal = useMemo(
    () =>
      CONFIG.constructionMaterials.reduce(
        (total, material) =>
          total + (Number(quantities[material.id]) || 0) * material.price,
        0,
      ),
    [quantities],
  );
  const donationAmount =
    donationType === "money"
      ? Number(customAmount || amount) || 0
      : materialTotal;
  const materialSummary =
    donationType === "materials"
      ? CONFIG.constructionMaterials
          .filter((material) => Number(quantities[material.id]) > 0)
          .map(
            (material) =>
              `${quantities[material.id]} x ${material.name.en}`,
          )
          .join(", ")
      : "Financial donation";
  const isHindi = language === "hi";

  const updateQuantity = (id, value) => {
    const nextQuantity = Math.max(0, Math.floor(Number(value) || 0));
    setQuantities((current) => ({ ...current, [id]: nextQuantity }));
  };

  const updateDonor = (field, value) => {
    setDonor((current) => ({ ...current, [field]: value }));
  };

  const checkPaymentStatus = async (currentOrderId) => {
    const response = await fetch(
      `/api/donations/status?orderId=${encodeURIComponent(currentOrderId)}`,
    );
    const result = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(result.error || "Could not check the payment status.");
    }

    if (result.status === "paid") {
      setThankYou({
        email: donor.email,
        emailSent: result.emailSent,
        amount: donationAmount,
      });
      setCheckoutStatus("paid");
      return true;
    }

    setCheckoutStatus("pending");
    return false;
  };

  const verifyPayment = async (paymentResponse, currentOrderId) => {
    setCheckoutStatus("verifying");

    const response = await fetch("/api/donations/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentResponse),
    });
    const result = await readApiResponse(response);

    if (!response.ok && response.status !== 202) {
      throw new Error(result.error || "Payment verification failed.");
    }

    if (result.status === "paid") {
      setThankYou({
        email: donor.email,
        emailSent: result.emailSent,
        amount: donationAmount,
      });
      setCheckoutStatus("paid");
      return;
    }

    setCheckoutStatus("pending");
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await wait(1500);
      if (await checkPaymentStatus(currentOrderId)) return;
    }
  };

  const startCheckout = async () => {
    setErrorMessage("");

    if (!donor.name.trim()) {
      setErrorMessage(
        isHindi ? "कृपया अपना नाम दर्ज करें।" : "Please enter your name.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor.email.trim())) {
      setErrorMessage(
        isHindi
          ? "कृपया मान्य ईमेल पता दर्ज करें।"
          : "Please enter a valid email address.",
      );
      return;
    }

    if (!Number.isSafeInteger(donationAmount) || donationAmount < 1) {
      setErrorMessage(
        isHindi
          ? "कृपया दान की मान्य राशि चुनें।"
          : "Please choose a valid donation amount.",
      );
      return;
    }

    setCheckoutStatus("creating");

    try {
      await loadRazorpay();
      const response = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: donationAmount,
          donor: {
            name: donor.name.trim(),
            email: donor.email.trim(),
            phone: donor.phone.trim(),
            publicOptIn: donor.publicOptIn,
            displayName: donor.publicOptIn
              ? donor.displayName.trim() || donor.name.trim()
              : "",
          },
          donationType,
          itemSummary: materialSummary,
        }),
      });
      const order = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(order.error || "Could not start checkout.");
      }

      setOrderId(order.orderId);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: CONFIG.templeName,
        description:
          donationType === "money"
            ? "Temple donation"
            : "Temple construction seva",
        order_id: order.orderId,
        prefill: {
          name: donor.name.trim(),
          email: donor.email.trim(),
          contact: donor.phone.trim(),
        },
        theme: { color: "#9c3b0d" },
        modal: {
          ondismiss: () => setCheckoutStatus("idle"),
        },
        handler: (paymentResponse) => {
          verifyPayment(paymentResponse, order.orderId).catch((error) => {
            console.error("Donation verification failed:", error);
            setErrorMessage(
              isHindi
                ? "भुगतान की पुष्टि अभी लंबित है। कृपया दोबारा भुगतान न करें; नीचे स्थिति जांचें।"
                : "Payment confirmation is still pending. Please do not pay again; check the status below.",
            );
            setCheckoutStatus("pending");
          });
        },
      });

      checkout.on("payment.failed", (event) => {
        setErrorMessage(
          event.error?.description ||
            (isHindi ? "भुगतान पूरा नहीं हुआ।" : "Payment was not completed."),
        );
        setCheckoutStatus("idle");
      });
      checkout.open();
    } catch (error) {
      console.error("Unable to start donation checkout:", error);
      setErrorMessage(
        error.message ||
          (isHindi
            ? "भुगतान शुरू नहीं हो सका। कृपया फिर से प्रयास करें।"
            : "Could not start payment. Please try again."),
      );
      setCheckoutStatus("idle");
    }
  };

  const refreshPaymentStatus = async () => {
    if (!orderId) return;
    setErrorMessage("");
    setCheckoutStatus("verifying");
    try {
      await checkPaymentStatus(orderId);
    } catch (error) {
      console.error("Could not check donation status:", error);
      setErrorMessage(
        error.message ||
          (isHindi
            ? "भुगतान की स्थिति जांची नहीं जा सकी।"
            : "Could not check the payment status."),
      );
      setCheckoutStatus("pending");
    }
  };

  const busy = ["creating", "verifying"].includes(checkoutStatus);

  return (
    <div>
      <div className="rounded-2xl bg-[#f7efe5] p-1">
        <div className="grid gap-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDonationType("money")}
            className={`rounded-xl py-3.5 text-sm font-bold ${
              donationType === "money"
                ? "bg-white text-[#8f2d0c] shadow-sm"
                : "text-[#725c4a]"
            }`}
          >
            <IndianRupee className="mr-2 inline" size={17} />
            {t.donate.donateMoney}
          </button>
          <button
            type="button"
            onClick={() => setDonationType("materials")}
            className={`rounded-xl py-3.5 text-sm font-bold ${
              donationType === "materials"
                ? "bg-white text-[#8f2d0c] shadow-sm"
                : "text-[#725c4a]"
            }`}
          >
            <Building2 className="mr-2 inline" size={17} />
            {t.donate.sponsorMaterials}
          </button>
        </div>
      </div>

      {donationType === "money" ? (
        <section className="mt-7">
          <label className="block text-sm font-bold">
            {t.donate.chooseAmount}
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CONFIG.suggestedAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAmount(value);
                  setCustomAmount("");
                }}
                className={`rounded-2xl border px-3 py-3 text-sm font-bold ${
                  !customAmount && amount === value
                    ? "border-[#a45416] bg-[#fff1da] text-[#7e300d]"
                    : "border-[#e6d8c7] bg-white"
                }`}
              >
                {formatINR(value)}
              </button>
            ))}
          </div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#806c5c]">
            {t.donate.customAmount}
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder={t.donate.enterAmount}
              className="mt-2 w-full rounded-xl border border-[#dfd0be] bg-white px-4 py-3 text-base normal-case outline-none focus:border-[#a45416]"
            />
          </label>
        </section>
      ) : (
        <section className="mt-7">
          <h3 className="text-sm font-bold">{t.donate.sponsorTitle}</h3>
          <p className="mt-1 text-sm leading-6 text-[#806c5c]">
            {t.donate.sponsorDescription}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CONFIG.constructionMaterials.map((material) => (
              <article
                key={material.id}
                className="overflow-hidden rounded-2xl border border-[#eadfcf] bg-white"
              >
                <img
                  src={material.image}
                  alt={material.name[language] || material.name.en}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h4 className="font-bold">
                    {material.name[language] || material.name.en}
                  </h4>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-[#806c5c]">
                    {material.description[language] ||
                      material.description.en}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#9c3b0d]">
                      {formatINR(material.price)} /{" "}
                      {material.unit[language] || material.unit.en}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quantities[material.id]}
                      onChange={(event) =>
                        updateQuantity(material.id, event.target.value)
                      }
                      className="w-20 rounded-lg border border-[#dfd0be] px-3 py-2 text-center"
                      aria-label={`${material.name.en} quantity`}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-7 rounded-[1.6rem] bg-[#4f1e0d] p-6 text-white">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4c28b]">
          {t.donate.yourDonation}
        </div>
        <div className="mt-1 font-serif text-3xl font-semibold">
          {formatINR(donationAmount)}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-[#f9dcc1]">
          <Heart size={17} className="fill-current text-[#f1a05b]" />
          {t.donate.everySeva}
        </div>
      </section>

      <section className="mt-7 rounded-[1.6rem] border border-[#eadfcf] bg-[#fffaf2] p-6">
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06a35]">
            {t.donate.donorDetails}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#705e50]">
            {isHindi
              ? "भुगतान की पुष्टि के बाद धन्यवाद संदेश और दान की जानकारी ईमेल से भेजने के लिए विवरण दें।"
              : "Enter your details so we can email your donation acknowledgement after payment is verified."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#806c5c]">
            <User className="mr-2 inline" size={14} />
            {t.donate.fullName} *
            <input
              required
              autoComplete="name"
              value={donor.name}
              onChange={(event) => updateDonor("name", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 text-sm normal-case outline-none focus:border-[#a45416]"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-widest text-[#806c5c]">
            <Mail className="mr-2 inline" size={14} />
            {t.donate.email} *
            <input
              required
              type="email"
              autoComplete="email"
              value={donor.email}
              onChange={(event) => updateDonor("email", event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 text-sm normal-case outline-none focus:border-[#a45416]"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-widest text-[#806c5c]">
            <Phone className="mr-2 inline" size={14} />
            {t.donate.phone}
            <input
              type="tel"
              autoComplete="tel"
              value={donor.phone}
              onChange={(event) => updateDonor("phone", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 text-sm normal-case outline-none focus:border-[#a45416]"
            />
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#5f5147]">
          <input
            type="checkbox"
            checked={donor.publicOptIn}
            onChange={(event) =>
              updateDonor("publicOptIn", event.target.checked)
            }
            className="mt-1 h-4 w-4 shrink-0 accent-[#a45416]"
          />
          <span>
            {isHindi
              ? "मेरा नाम और दान राशि सार्वजनिक दाता सूची में दिखाएं। सहमति न देने पर केवल कुल राशि में योगदान शामिल होगा।"
              : "I agree to show my name and donation amount in the public donor list. If unchecked, only anonymous totals will include my donation."}
          </span>
        </label>
        {donor.publicOptIn && (
          <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-[#806c5c]">
            {isHindi ? "सार्वजनिक नाम (वैकल्पिक)" : "Display name (optional)"}
            <input
              value={donor.displayName}
              maxLength={80}
              onChange={(event) =>
                updateDonor("displayName", event.target.value)
              }
              placeholder={donor.name || (isHindi ? "आपका नाम" : "Your name")}
              className="mt-2 w-full rounded-xl border border-[#ddcfbd] bg-white px-4 py-3 text-sm normal-case outline-none focus:border-[#a45416]"
            />
          </label>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        {isHindi
          ? "अभी ट्रस्ट को 80G अनुमोदन प्राप्त नहीं है। फिलहाल दान पर 80G कर कटौती या 80G रसीद उपलब्ध नहीं है।"
          : "The trust does not currently have 80G approval. No 80G tax deduction or 80G receipt can be offered at this time."}
      </section>

      <section className="mt-5 rounded-[1.6rem] border border-[#eadfcf] bg-[#fffaf2] p-6">
        <h3 className="font-serif text-2xl font-semibold text-[#35291f]">
          {isHindi ? "सुरक्षित भुगतान" : "Secure payment"}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[#705e50]">
          {isHindi
            ? "Razorpay Checkout में उपलब्ध UPI, कार्ड और अन्य भुगतान विकल्पों से भुगतान करें। धन्यवाद संदेश केवल भुगतान की पुष्टि के बाद दिखेगा।"
            : "Pay using UPI, cards, and other methods enabled in Razorpay Checkout. We show the thank-you confirmation only after payment is verified."}
        </p>
        <button
          type="button"
          onClick={startCheckout}
          disabled={busy || checkoutStatus === "paid" || donationAmount < 1}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9c3b0d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#7e300d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkoutStatus === "creating"
            ? isHindi
              ? "भुगतान तैयार हो रहा है..."
              : "Preparing payment..."
            : checkoutStatus === "verifying"
              ? isHindi
                ? "भुगतान की पुष्टि हो रही है..."
                : "Verifying payment..."
              : isHindi
                ? `${formatINR(donationAmount)} दान करें`
                : `Donate ${formatINR(donationAmount)}`}
          {checkoutStatus === "paid" && <Check size={18} />}
        </button>
        {errorMessage && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}
        {checkoutStatus === "pending" && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
            <p>
              {isHindi
                ? "भुगतान की पुष्टि अभी प्राप्त नहीं हुई है। कृपया दोबारा भुगतान न करें।"
                : "Payment confirmation has not arrived yet. Please do not pay again."}
            </p>
            <button
              type="button"
              onClick={refreshPaymentStatus}
              className="mt-2 font-bold underline"
            >
              {isHindi ? "स्थिति जांचें" : "Check payment status"}
            </button>
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-[#806c5c]">
          {isHindi
            ? "आपकी भुगतान और निजी संपर्क जानकारी दाता सूची में प्रकाशित नहीं होगी।"
            : "Your payment details and private contact information are not published in the donor list."}
        </p>
      </section>

      {thankYou && (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-thanks-title"
        >
          <div className="w-full max-w-md rounded-4xl bg-[#fbf7ef] p-7 text-center shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-700">
              <Check size={28} />
            </div>
            <h2
              id="donation-thanks-title"
              className="mt-4 font-serif text-3xl font-semibold text-[#4b2416]"
            >
              {isHindi ? "दान के लिए धन्यवाद!" : "Thank you for your donation!"}
            </h2>
            <p className="mt-3 text-[#705e50]">
              {isHindi
                ? `${formatINR(thankYou.amount)} का आपका दान सफलतापूर्वक सत्यापित हो गया है।`
                : `Your donation of ${formatINR(thankYou.amount)} has been verified.`}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#705e50]">
              {thankYou.emailSent
                ? isHindi
                  ? `दान की जानकारी ${thankYou.email} पर भेज दी गई है।`
                  : `Donation details have been emailed to ${thankYou.email}.`
                : isHindi
                  ? "भुगतान सफल है, लेकिन ईमेल अभी नहीं भेजा जा सका। कृपया ट्रस्ट से संपर्क करें।"
                  : "Payment succeeded, but the email could not be sent yet. Please contact the trust."}
            </p>
            <button
              type="button"
              onClick={() => setThankYou(null)}
              className="mt-6 rounded-full bg-[#9c3b0d] px-6 py-3 text-sm font-bold text-white"
            >
              {isHindi ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
