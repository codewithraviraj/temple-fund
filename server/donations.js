import { createHmac, timingSafeEqual } from "node:crypto";

export function getEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function supabaseRequest(path, options = {}) {
  const url = getEnv("SUPABASE_URL").replace(/\/$/, "");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Supabase request failed:", response.status, details);
    throw new Error(`Donation database request failed (${response.status}).`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function razorpayRequest(path, options = {}) {
  const keyId = getEnv("RAZORPAY_KEY_ID");
  const keySecret = getEnv("RAZORPAY_KEY_SECRET");
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Razorpay API request failed:", response.status, result);
    throw new Error("The payment provider could not process this request.");
  }
  return result;
}

export function verifyHmac(message, signature, secret) {
  if (typeof signature !== "string" || !signature) return false;
  const expected = createHmac("sha256", secret).update(message).digest();
  let received;
  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export async function getDonationByOrder(orderId) {
  const rows = await supabaseRequest(
    `donations?select=*&razorpay_order_id=eq.${encodeURIComponent(orderId)}&limit=1`,
  );
  return rows[0] || null;
}

async function sendEmail(templateId, templateParams) {
  const response = await fetch(
    "https://api.emailjs.com/api/v1.0/email/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: getEnv("EMAILJS_SERVICE_ID"),
        template_id: templateId,
        user_id: getEnv("EMAILJS_PUBLIC_KEY"),
        accessToken: getEnv("EMAILJS_PRIVATE_KEY"),
        template_params: templateParams,
      }),
    },
  );
  if (!response.ok) {
    const details = await response.text();
    console.error("EmailJS request failed:", response.status, details);
    throw new Error(`Email delivery failed (${response.status}).`);
  }
}

async function sendDonationEmails(donation, paymentId) {
  const sharedParams = {
    donation_id: donation.id,
    donor_name: donation.donor_name,
    donor_email: donation.donor_email,
    donor_phone: donation.donor_phone || "Not provided",
    donation_amount: Number(donation.amount_rupees).toFixed(2),
    currency: "INR",
    donation_type: donation.donation_type,
    item_summary: donation.item_summary || "",
    payment_id: paymentId,
    donation_date: new Date().toISOString(),
    public_opt_in: donation.public_opt_in ? "Yes" : "No",
    temple_name: "Sri Sri 108 Sarwjanik Maa Kali Balajee Babosa Mandir",
    temple_email: getEnv("TEMPLE_NOTIFICATION_EMAIL"),
  };

  let donorSent = false;
  let adminSent = false;
  try {
    await sendEmail(getEnv("EMAILJS_DONOR_TEMPLATE_ID"), {
      ...sharedParams,
      to_email: donation.donor_email,
    });
    donorSent = true;
  } catch (error) {
    console.error("Donor confirmation email failed:", error);
  }
  try {
    await sendEmail(getEnv("EMAILJS_ADMIN_TEMPLATE_ID"), {
      ...sharedParams,
      to_email: getEnv("TEMPLE_NOTIFICATION_EMAIL"),
    });
    adminSent = true;
  } catch (error) {
    console.error("Temple donation notification email failed:", error);
  }

  await supabaseRequest(
    `donations?id=eq.${encodeURIComponent(donation.id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        donor_email_sent: donorSent,
        admin_email_sent: adminSent,
      }),
    },
  );
  return { emailSent: donorSent, adminEmailSent: adminSent };
}

export async function markDonationPaid(payment) {
  const donation = await getDonationByOrder(payment.order_id);
  if (!donation) throw new Error("Donation order was not found.");
  if (
    Number(payment.amount) !== Math.round(Number(donation.amount_rupees) * 100) ||
    payment.currency !== "INR"
  ) {
    throw new Error("Payment amount does not match the donation order.");
  }

  if (donation.status === "paid") {
    return {
      status: "paid",
      emailSent: donation.donor_email_sent,
      adminEmailSent: donation.admin_email_sent,
    };
  }

  if (payment.status !== "captured") {
    return { status: "pending", emailSent: false, adminEmailSent: false };
  }

  const updated = await supabaseRequest(
    `donations?razorpay_order_id=eq.${encodeURIComponent(payment.order_id)}&status=eq.pending`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "paid",
        razorpay_payment_id: payment.id,
        paid_at: new Date().toISOString(),
      }),
    },
  );

  if (!updated.length) {
    const current = await getDonationByOrder(payment.order_id);
    if (current?.status === "paid") {
      return {
        status: "paid",
        emailSent: current.donor_email_sent,
        adminEmailSent: current.admin_email_sent,
      };
    }
    return { status: current?.status || "pending", emailSent: false };
  }

  return {
    status: "paid",
    ...(await sendDonationEmails(updated[0], payment.id)),
  };
}

export function jsonError(response, status, message) {
  return response.status(status).json({ error: message });
}
