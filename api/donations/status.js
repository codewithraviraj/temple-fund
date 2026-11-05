import { getDonationByOrder, jsonError } from "../../server/donations.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return jsonError(response, 405, "Method not allowed.");
  }

  const orderId =
    typeof request.query?.orderId === "string" ? request.query.orderId : "";
  if (!/^order_[A-Za-z0-9]+$/.test(orderId)) {
    return jsonError(response, 400, "A valid payment order is required.");
  }

  try {
    const donation = await getDonationByOrder(orderId);
    if (!donation) return jsonError(response, 404, "Donation order not found.");
    return response.status(200).json({
      status: donation.status,
      emailSent: donation.donor_email_sent,
    });
  } catch (error) {
    console.error("Could not retrieve donation status:", error);
    return jsonError(response, 500, "Could not check the payment status.");
  }
}
