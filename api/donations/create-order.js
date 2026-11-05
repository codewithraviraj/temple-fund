import {
  getEnv,
  jsonError,
  razorpayRequest,
  supabaseRequest,
} from "../../server/donations.js";
import { randomUUID } from "node:crypto";

const cleanText = (value, limit) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim()
        .slice(0, limit)
    : "";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return jsonError(response, 405, "Method not allowed.");
  }

  try {
    for (const name of [
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "EMAILJS_SERVICE_ID",
      "EMAILJS_PUBLIC_KEY",
      "EMAILJS_PRIVATE_KEY",
      "EMAILJS_DONOR_TEMPLATE_ID",
      "EMAILJS_ADMIN_TEMPLATE_ID",
      "TEMPLE_NOTIFICATION_EMAIL",
    ]) {
      getEnv(name);
    }

    const body = request.body || {};
    const donor = body.donor || {};
    const amount = Number(body.amount);
    const donorName = cleanText(donor.name, 120);
    const donorEmail = cleanText(donor.email, 254).toLowerCase();
    const donorPhone = cleanText(donor.phone, 30);
    const publicOptIn = donor.publicOptIn === true;
    const displayName = publicOptIn
      ? cleanText(donor.displayName || donorName, 80)
      : "";

    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10000000) {
      return jsonError(response, 400, "Enter a valid donation amount.");
    }
    if (donorName.length < 2) {
      return jsonError(response, 400, "Enter your name.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return jsonError(response, 400, "Enter a valid email address.");
    }
    if (publicOptIn && !displayName) {
      return jsonError(response, 400, "Enter a public display name.");
    }
    if (!["money", "materials"].includes(body.donationType)) {
      return jsonError(response, 400, "Choose a valid donation type.");
    }

    const donationId = randomUUID();
    const amountPaise = amount * 100;
    const order = await razorpayRequest("orders", {
      method: "POST",
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: donationId.replaceAll("-", "").slice(0, 40),
        notes: { donation_id: donationId },
      }),
    });

    await supabaseRequest("donations", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id: donationId,
        amount_rupees: amount,
        currency: "INR",
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone || null,
        public_opt_in: publicOptIn,
        public_display_name: displayName || null,
        donation_type: body.donationType,
        item_summary: cleanText(body.itemSummary, 500),
        status: "pending",
        razorpay_order_id: order.id,
      }),
    });

    return response.status(201).json({
      keyId: getEnv("RAZORPAY_KEY_ID"),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Could not create donation order:", error);
    const configurationError = error.message?.startsWith("Missing required");
    return jsonError(
      response,
      configurationError ? 503 : 502,
      configurationError
        ? "Donation payments are not configured yet. Please contact the temple."
        : "Could not create a payment order. Please try again.",
    );
  }
}
