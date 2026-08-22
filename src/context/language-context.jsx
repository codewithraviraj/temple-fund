import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    language: "English",
    switchTo: "हिंदी",

    nav: {
      home: "Home",
      about: "About",
      seva: "Seva",
      gallery: "Gallery",
      stories: "Stories",
      donate: "Donate",
      contact: "Contact",
    },

    buttons: {
      donate: "Donate Now",
      learnMore: "Learn More",
      sponsor: "Sponsor Now",
      copy: "Copy",
      copied: "Copied",
      openUpi: "Open UPI App",
      continueStripe: "Continue to Stripe",
    },

    donate: {
      title: "Offer your seva",
      subtitle:
        "Choose your contribution and support the temple.",

      donateMoney: "Donate Money",
      sponsorMaterials: "Sponsor Materials",

      chooseAmount: "Choose donation amount",
      customAmount: "Or enter a custom amount",
      enterAmount: "Enter amount",

      sponsorTitle:
        "Sponsor temple construction materials",
      sponsorDescription:
        "Select one or more materials and the quantity you would like to sponsor.",

      itemTotal: "Item total",
      constructionTotal: "Construction seva total",
      yourDonation: "Your donation",
      materialSevaTotal: "Material seva total",

      paymentMethod: "Choose payment method",

      upi: "UPI App",
      upiDescription:
        "Google Pay, PhonePe, Paytm and other UPI apps",

      qr: "Scan QR",
      qrDescription:
        "Scan using any UPI app",

      stripe: "Card / Stripe",
      stripeDescription:
        "Secure hosted checkout",

      directUpi: "Direct UPI payment",
      payViaUpi: "Pay via UPI",

      templeUpi: "Temple UPI ID",
      copiedUpi: "UPI ID copied",

      donorDetails: "Donor Details",
      donorDetailsDescription:
        "For contributions above ₹2,000, please provide your details so we can send your donation acknowledgement.",

      fullName: "Full Name",
      email: "Email",
      phone: "Phone",

      nameRequired: "Please enter your name.",
      emailRequired:
        "Please enter a valid email address.",

      emailSent: "Thank-you email sent to",
      emailFailed:
        "We couldn't send the donor email. Please check the details above and try again.",

      preparing: "Preparing...",
      sending: "Sending...",

      donorThreshold:
        "Donor details required above ₹2,000",

      donorThresholdMaterial:
        "Your material sponsorship is above ₹2,000. Please provide your name and email so we can send your acknowledgement.",

      everySeva:
        "Every seva supports the temple.",

      mobileUpi:
        "Tap below to open your installed UPI app. The amount and temple UPI ID are pre-filled.",

      desktopUpi:
        "On desktop, scan the QR code using your phone. On mobile, the button can open your UPI app.",

      qrDescriptionFull:
        "Scan this QR code using Google Pay, PhonePe, Paytm, BHIM or another UPI app.",

      stripeDescriptionFull:
        "Continue to Stripe-hosted checkout for card and other supported payment methods.",

      stripeNotConfigured:
        "Stripe payment link is not configured for this amount yet.",

      openUpiHint:
        "UPI app support depends on the device and installed UPI applications. On desktop, use the QR option.",
    },

    footer: {
      rights: "All rights reserved.",
    },
  },

  hi: {
    language: "हिंदी",
    switchTo: "English",

    nav: {
      home: "होम",
      about: "हमारे बारे में",
      seva: "सेवा",
      gallery: "गैलरी",
      stories: "कहानियाँ",
      donate: "दान करें",
      contact: "संपर्क",
    },

    buttons: {
      donate: "अभी दान करें",
      learnMore: "और जानें",
      sponsor: "अभी प्रायोजित करें",
      copy: "कॉपी करें",
      copied: "कॉपी हो गया",
      openUpi: "UPI ऐप खोलें",
      continueStripe: "Stripe पर जारी रखें",
    },

    donate: {
      title: "अपनी सेवा अर्पित करें",
      subtitle:
        "अपना योगदान चुनें और मंदिर निर्माण में सहयोग करें।",

      donateMoney: "राशि दान करें",
      sponsorMaterials: "निर्माण सामग्री प्रायोजित करें",

      chooseAmount: "दान की राशि चुनें",
      customAmount: "या अपनी राशि दर्ज करें",
      enterAmount: "राशि दर्ज करें",

      sponsorTitle:
        "मंदिर निर्माण सामग्री प्रायोजित करें",
      sponsorDescription:
        "एक या अधिक सामग्री चुनें और जितनी मात्रा प्रायोजित करना चाहते हैं वह दर्ज करें।",

      itemTotal: "कुल राशि",
      constructionTotal: "निर्माण सेवा की कुल राशि",
      yourDonation: "आपका दान",
      materialSevaTotal: "सामग्री सेवा की कुल राशि",

      paymentMethod: "भुगतान का तरीका चुनें",

      upi: "UPI ऐप",
      upiDescription:
        "Google Pay, PhonePe, Paytm और अन्य UPI ऐप",

      qr: "QR स्कैन करें",
      qrDescription:
        "किसी भी UPI ऐप से स्कैन करें",

      stripe: "कार्ड / Stripe",
      stripeDescription:
        "सुरक्षित भुगतान पेज",

      directUpi: "सीधा UPI भुगतान",
      payViaUpi: "UPI से भुगतान करें",

      templeUpi: "मंदिर का UPI ID",
      copiedUpi: "UPI ID कॉपी हो गया",

      donorDetails: "दाता की जानकारी",
      donorDetailsDescription:
        "₹2,000 से अधिक के योगदान के लिए कृपया अपनी जानकारी दें ताकि हम आपको दान की स्वीकृति ईमेल कर सकें।",

      fullName: "पूरा नाम",
      email: "ईमेल",
      phone: "मोबाइल नंबर",

      nameRequired: "कृपया अपना नाम दर्ज करें।",
      emailRequired:
        "कृपया एक मान्य ईमेल पता दर्ज करें।",

      emailSent: "धन्यवाद ईमेल भेज दिया गया:",
      emailFailed:
        "दाता का ईमेल भेजा नहीं जा सका। कृपया ऊपर दी गई जानकारी जांचें और पुनः प्रयास करें।",

      preparing: "तैयार हो रहा है...",
      sending: "भेजा जा रहा है...",

      donorThreshold:
        "₹2,000 से अधिक पर दाता की जानकारी आवश्यक है",

      donorThresholdMaterial:
        "आपकी सामग्री सेवा ₹2,000 से अधिक है। कृपया अपना नाम और ईमेल दें ताकि हम आपको स्वीकृति भेज सकें।",

      everySeva:
        "हर सेवा मंदिर के निर्माण में सहयोग करती है।",

      mobileUpi:
        "नीचे दिए गए बटन पर टैप करके अपना UPI ऐप खोलें। राशि और मंदिर का UPI ID पहले से भरा रहेगा।",

      desktopUpi:
        "डेस्कटॉप पर अपने मोबाइल से QR कोड स्कैन करें। मोबाइल पर यह बटन आपका UPI ऐप खोल सकता है।",

      qrDescriptionFull:
        "इस QR कोड को Google Pay, PhonePe, Paytm, BHIM या किसी अन्य UPI ऐप से स्कैन करें।",

      stripeDescriptionFull:
        "कार्ड और अन्य समर्थित भुगतान माध्यमों के लिए Stripe के सुरक्षित भुगतान पेज पर जाएँ।",

      stripeNotConfigured:
        "इस राशि के लिए Stripe भुगतान लिंक अभी कॉन्फ़िगर नहीं किया गया है।",

      openUpiHint:
        "UPI ऐप सपोर्ट आपके डिवाइस और इंस्टॉल किए गए UPI ऐप पर निर्भर करता है। डेस्कटॉप पर QR विकल्प का उपयोग करें।",
    },

    footer: {
      rights: "सर्वाधिकार सुरक्षित।",
    },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return (
      localStorage.getItem("temple-language") || "en"
    );
  });

  useEffect(() => {
    localStorage.setItem(
      "temple-language",
      language
    );

    document.documentElement.lang =
      language === "hi" ? "hi-IN" : "en-IN";
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) =>
      current === "en" ? "hi" : "en"
    );
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: translations[language],
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}