export const CONFIG = {
  templeName: "Sri Sri 108 Sarwjanik Maa Kali Balajee Babosa Mandir",
  shortName: "Ananta Seva",
  location: "Kishanganj, Bihar",
  address: "Ward No 11, Dharamganj, Kishanganj, Pin-855108, Bihar",
  phone: "+91 90000 12345",
  email: "seva@anantatemple.org",

  upiId: "temple.seva@upi",

  accountName: "Sri Sri 108 Sarwjanik Maa Kali Balajee Babosa Mandir Trust",

  campaign: {
    title: "Restore the sanctum. Preserve a living tradition.",
    summary:
      "Help us repair the ancient roof, renew the prayer hall, and keep daily annadanam and Vedic learning accessible to every devotee.",
    goal: 1200000,
    raised: 836450,
    donors: 1248,
    endDate: "31 December 2026",
  },

  suggestedAmounts: [501, 1001, 2501, 5001, 11001],

  stripePaymentLinks: {
    // Replace these with Stripe Payment Links created in Stripe Dashboard.
    default: "https://buy.stripe.com/REPLACE_WITH_YOUR_PAYMENT_LINK",
    501: "https://buy.stripe.com/REPLACE_WITH_501_LINK",
    1001: "https://buy.stripe.com/REPLACE_WITH_1001_LINK",
    2501: "https://buy.stripe.com/REPLACE_WITH_2501_LINK",
    5001: "https://buy.stripe.com/REPLACE_WITH_5001_LINK",
    11001: "https://buy.stripe.com/REPLACE_WITH_11001_LINK",
  },

  email: {
    enabled: true,

    serviceId: "YOUR_EMAILJS_SERVICE_ID",

    templateId: "YOUR_EMAILJS_TEMPLATE_ID",

    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",

    threshold: 2000,
  },

  // ------------------------------------------
  // TEMPLE CONSTRUCTION MATERIALS
  // ------------------------------------------

  constructionMaterials: [
  {
    id: "brick",
    name: "Bricks",
    description: "Sponsor bricks for temple walls and construction.",
    unit: "brick",
    price: 8,
    image: "/images/materials/bricks.jpg",
  },
  {
    id: "cement",
    name: "Cement",
    description: "Sponsor cement bags for construction work.",
    unit: "bag",
    price: 500,
    image: "/images/materials/cement.jpg",
  },
  {
    id: "sand",
    name: "Sand",
    description: "Sponsor construction sand required for masonry.",
    unit: "unit",
    price: 1500,
    image: "/images/materials/sand.jpg",
  },
  {
    id: "iron",
    name: "Iron / Steel",
    description: "Sponsor iron and steel required for structural work.",
    unit: "unit",
    price: 6500,
    image: "/images/materials/iron.jpg",
  },
  {
    id: "stone",
    name: "Temple Stone",
    description: "Sponsor stone for temple structure and finishing.",
    unit: "unit",
    price: 2000,
    image: "/images/materials/stone.jpg",
  },
  {
    id: "tiles",
    name: "Floor Tiles",
    description: "Sponsor flooring for temple halls and pathways.",
    unit: "sq. ft.",
    price: 45,
    image: "/images/materials/tiles.jpg",
  },
  {
    id: "paint",
    name: "Paint",
    description: "Sponsor paint for temple walls and renovation.",
    unit: "bucket",
    price: 2500,
    image: "/images/materials/paint.jpg",
  },
],

  gallery: [
    {
      title: "Morning aarti",
      category: "Daily Seva",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=85",
    },
    {
      title: "Temple courtyard",
      category: "Heritage",
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
    },
    {
      title: "Deity darshan",
      category: "Darshan",
      image:
        "https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=1400&q=85",
    },
    {
      title: "Annadanam seva",
      category: "Community",
      image:
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=85",
    },
    {
      title: "Festival lamps",
      category: "Festivals",
      image:
        "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=1400&q=85",
    },
    {
      title: "Veda pathashala",
      category: "Learning",
      image:
        "https://images.unsplash.com/photo-1519817650390-64a93db511aa?auto=format&fit=crop&w=1400&q=85",
    },
  ],

  testimonials: [
    {
      name: "Ankush",
      city: "Kishanganj, Bihar",
      quote:
        "The donation process felt simple and respectful. I could choose UPI, scan, and complete my seva in a minute.",
    },
    {
      name: "Soni Devi",
      city: "Kishanganj, Bihar",
      quote:
        "I loved seeing exactly where the campaign is headed. The updates made the contribution feel tangible.",
    },
    {
      name: "Aman Kumar",
      city: "Kishanganj, Bihar",
      quote:
        "A beautiful experience that feels like a temple, not a generic checkout page.",
    },
  ],
};

export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
