export const CONFIG = {
  templeName: 'Sri Sri 108 Sarwjanik Maa Kali Balajee Babosa Mandir',
  shortName: 'Ananta Seva',
  location: 'Kishanganj, Bihar',
  address: 'Ward No 11, Dharamganj, Kishanganj, Pin-855108, Bihar',
  phone: '+91 90000 12345',
  email: 'seva@anantatemple.org',
  upiId: 'temple.seva@upi',
  accountName: 'Sri Sri 108 Sarwjanik Maa Kali Balajee Babosa Mandir Trust',
  campaign: {
    title: 'Restore the sanctum. Preserve a living tradition.',
    summary: 'Help us repair the ancient roof, renew the prayer hall, and keep daily annadanam and Vedic learning accessible to every devotee.',
    goal: 1200000,
    raised: 836450,
    donors: 1248,
    endDate: '31 December 2026',
  },
  suggestedAmounts: [501, 1001, 2501, 5001, 11001],
  stripePaymentLinks: {
    // Replace these with Stripe Payment Links created in your Stripe Dashboard.
    default: 'https://buy.stripe.com/REPLACE_WITH_YOUR_PAYMENT_LINK',
    501: 'https://buy.stripe.com/REPLACE_WITH_501_LINK',
    1001: 'https://buy.stripe.com/REPLACE_WITH_1001_LINK',
    2501: 'https://buy.stripe.com/REPLACE_WITH_2501_LINK',
    5001: 'https://buy.stripe.com/REPLACE_WITH_5001_LINK',
    11001: 'https://buy.stripe.com/REPLACE_WITH_11001_LINK',
  },
  gallery: [
    {
      title: 'Morning aarti',
      category: 'Daily Seva',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=85',
    },
    {
      title: 'Temple courtyard',
      category: 'Heritage',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85',
    },
    {
      title: 'Deity darshan',
      category: 'Darshan',
      image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=1400&q=85',
    },
    {
      title: 'Annadanam seva',
      category: 'Community',
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=85',
    },
    {
      title: 'Festival lamps',
      category: 'Festivals',
      image: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=1400&q=85',
    },
    {
      title: 'Veda pathashala',
      category: 'Learning',
      image: 'https://images.unsplash.com/photo-1519817650390-64a93db511aa?auto=format&fit=crop&w=1400&q=85',
    },
  ],
  testimonials: [
    {
      name: 'Ankush',
      city: 'Kishanganj, Bihar',
      quote: 'The donation process felt simple and respectful. I could choose UPI, scan, and complete my seva in a minute.',
    },
    {
      name: 'Soni Devi',
      city: 'Kishanganj, Bihar',
      quote: 'I loved seeing exactly where the campaign is headed. The updates made the contribution feel tangible.',
    },
    {
      name: 'Aman Kumar',
      city: 'Kishanganj, Bihar',
      quote: 'A beautiful experience that feels like a temple, not a generic checkout page.',
    },
  ],
}

export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
