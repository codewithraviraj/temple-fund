import {
  getEnv,
  jsonError,
  markDonationPaid,
  verifyHmac,
} from "../../server/donations.js";

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 1024 * 1024) throw new Error("Webhook body is too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return jsonError(response, 405, "Method not allowed.");
  }

  try {
    const rawBody = await readRawBody(request);
    const signature = request.headers["x-razorpay-signature"];
    if (
      !verifyHmac(rawBody, signature, getEnv("RAZORPAY_WEBHOOK_SECRET"))
    ) {
      return jsonError(response, 400, "Webhook signature is invalid.");
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (!payment?.id || !payment.order_id) {
        return jsonError(response, 400, "Captured payment data is incomplete.");
      }
      await markDonationPaid(payment);
    }

    return response.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error);
    return jsonError(response, 500, "Webhook processing failed.");
  }
}
