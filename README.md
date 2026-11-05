# Temple Seva Fundraising Web App

React + Vite frontend with Vercel serverless APIs for Razorpay payment
verification, Supabase donation records, and EmailJS notifications.

## Run and build

```bash
npm install
npm run dev
npm run build
```

`npm run dev` starts the Vite frontend only. The `/api` endpoints run on Vercel;
use the Vercel CLI (`vercel dev`) with local environment variables to test the
complete donation flow.

## Production setup

1. **Razorpay:** Create/activate the temple's merchant account, enable UPI and
   the desired payment methods, and use test keys until the full flow is
   verified. The existing UPI ID in `src/data/config.js` is not a payment
   verification credential; Razorpay must be configured to settle payments to
   the trust's verified bank account.
2. **Supabase:** For a new project, run [`supabase/schema.sql`](./supabase/schema.sql)
   in its SQL editor. For an existing project using `amount_paise`, run
   [`supabase/migrations/20261105_store_donation_amounts_in_rupees.sql`](./supabase/migrations/20261105_store_donation_amounts_in_rupees.sql)
   before deploying the updated app. It converts existing amounts to rupees
   without changing their value and updates the summary view. Keep the
   service-role key private; the browser never connects to Supabase directly.
3. **EmailJS:** Create two templates, one for the donor acknowledgement and one
   for the temple notification. Set each template's recipient to `{{to_email}}`.
   Add the EmailJS private key as `EMAILJS_PRIVATE_KEY`; strict mode requires
   this key for server-side API requests. Keep it private.
   Template variables available to both are `{{donor_name}}`,
   `{{donor_email}}`, `{{donor_phone}}`, `{{donation_amount}}`,
   `{{donation_type}}`, `{{item_summary}}`, `{{payment_id}}`,
   `{{donation_id}}`, `{{donation_date}}`, `{{currency}}`,
   `{{public_opt_in}}`, `{{temple_name}}`, and `{{temple_email}}`.
4. **Vercel environment:** Add every variable from [`.env.example`](./.env.example)
   to the Vercel project's environment settings. `RAZORPAY_WEBHOOK_SECRET` is
   required when enabling webhook confirmation; local checkout verification
   works without a webhook. `EMAILJS_PRIVATE_KEY` must also be set for strict-mode
   email requests. Do not commit real credentials.
5. **Razorpay webhook:** Add `https://<your-domain>/api/razorpay/webhook` in the
   Razorpay dashboard, select the `payment.captured` event, and set the same
   webhook signing secret as `RAZORPAY_WEBHOOK_SECRET` in Vercel. Redeploy after
   setting environment variables.
6. **Test:** Make a test-mode donation and verify that the donor popup appears
   only after server-side confirmation, both emails arrive, the record is
   `paid` in Supabase, and the donor wall updates. Switch to live keys only
   after this succeeds.

## Donation data and privacy

The server creates a Razorpay order, verifies checkout signatures and captured
payments, then stores verified donation amounts in rupees. Razorpay payment
requests and verification remain in paise as required by Razorpay. The webhook
is the server-side confirmation fallback. The public donor list contains only
payments marked `paid`; donor names and individual amounts are shown only with
the donor's explicit opt-in. Non-consenting donors contribute to aggregate
totals only. Donor email and phone are never returned by the public API.

## 80G tax receipts

The trust does not currently have 80G approval, so the website does not promise
a tax deduction, issue an 80G receipt, or collect PAN for that purpose. After
the trust receives applicable approval, confirm the conditions and receipt
requirements with a qualified tax professional before enabling this feature.
