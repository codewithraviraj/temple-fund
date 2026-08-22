# Temple Seva Fundraising Web App

Frontend-only React + Vite + Tailwind CSS temple fundraising website.

## Structure

- `src/pages/` — route-level pages: Home, About, Seva, Gallery, Stories, Donate, Contact
- `src/components/` — shared site header/footer, donation flow, modal, UI primitives
- `src/data/config.js` — temple identity, campaign, UPI ID, Stripe Payment Links, gallery and testimonials
- `src/styles.css` — Tailwind entry + global styling

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Configure payments

Edit `src/data/config.js`:

- Set `upiId` and `accountName` to the temple's actual UPI details.
- Replace the placeholder Stripe Payment Links with real Stripe-hosted Payment Links.

No Stripe secret key belongs in this frontend.

## Frontend-only limitation

UPI/QR and hosted Stripe checkout can initiate payment, but a frontend-only application cannot securely verify settlement or generate trusted receipts. For production reconciliation, connect a backend/webhook or use provider-managed confirmation pages and reporting.
