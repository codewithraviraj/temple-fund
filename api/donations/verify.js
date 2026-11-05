import {
  getDonationByOrder,
  getEnv,
  jsonError,
  markDonationPaid,
  razorpayRequest,
  verifyHmac,
} from "../../server/donations.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return jsonError(response, 405, "Method not allowed.");
  }

  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = request.body || {};
    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string"
    ) {
      return jsonError(response, 400, "Payment verification data is missing.");
    }

    const donation = await getDonationByOrder(orderId);
    if (!donation) return jsonError(response, 404, "Donation order not found.");

    const validSignature = verifyHmac(
      `${orderId}|${paymentId}`,
      signature,
      getEnv("RAZORPAY_KEY_SECRET"),
    );
    if (!validSignature) {
      return jsonError(response, 400, "Payment signature is invalid.");
    }

    const payment = await razorpayRequest(
      `payments/${encodeURIComponent(paymentId)}`,
      { method: "GET" },
    );
    if (
      payment.order_id !== orderId ||
      Number(payment.amount) !== Math.round(Number(donation.amount_rupees) * 100) ||
      payment.currency !== "INR"
    ) {
      return jsonError(response, 400, "Payment does not match this donation.");
    }

    if (payment.status !== "captured") {
      return response.status(202).json({ status: "pending" });
    }

    const result = await markDonationPaid(payment);
    return response.status(result.status === "paid" ? 200 : 202).json(result);
  } catch (error) {
    console.error("Donation verification failed:", error);
    return jsonError(response, 500, "Could not verify this payment yet.");
  }
}
