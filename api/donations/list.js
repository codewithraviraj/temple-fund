import { jsonError, supabaseRequest } from "../../server/donations.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return jsonError(response, 405, "Method not allowed.");
  }

  try {
    const [totals, rows] = await Promise.all([
      supabaseRequest("donation_totals?select=total_amount_rupees,donor_count"),
      supabaseRequest(
        "donations?select=public_display_name,amount_rupees,paid_at&status=eq.paid&public_opt_in=eq.true&order=paid_at.desc&limit=12",
      ),
    ]);

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json({
      totalAmount: Number(totals[0]?.total_amount_rupees || 0),
      donorCount: Number(totals[0]?.donor_count || 0),
      donors: rows.map((row) => ({
        name: row.public_display_name,
        amount: Number(row.amount_rupees),
        paidAt: row.paid_at,
      })),
    });
  } catch (error) {
    console.error("Could not load public donation data:", error);
    return jsonError(response, 500, "Could not load the donor list.");
  }
}
