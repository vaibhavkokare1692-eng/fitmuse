import type {
  ComparisonRow,
  Feature,
  NavLink,
  Outfit,
  PricingPlan,
  QuizFormValues,
  Step,
} from "@/types";

export const brandName = "FitMuse";
export const headerTagline = "Brief-to-Board Outfit Planner";
export const brandTagline =
  "Turn a style brief into complete outfit boards, no closet upload required.";

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Sample Looks", href: "/sample-looks" },
  { label: "Style Quiz", href: "/quiz" },
];

export const footerLinks: NavLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Difference", href: "/difference" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const heroMetrics = [
  { label: "Closet upload", value: "Not required" },
  { label: "Sample outfit boards", value: "8" },
  { label: "Average styling time", value: "Under 10 min" },
];

export const homeFeatures: Feature[] = [
  {
    eyebrow: "Built for real life",
    title: "Looks that work for plans, not just inspiration boards",
    description:
      "Build date, office, travel, and event looks without opening ten shopping tabs.",
  },
  {
    eyebrow: "Personalized by measurements",
    title: "Recommendations shaped around your fit",
    description:
      "Your sizes, proportions, and fit cues help each look feel closer to a stylist than a search filter.",
  },
  {
    eyebrow: "Styled for your aesthetic",
    title: "Match the vibe you actually want to project",
    description:
      "Clean girl, streetwear, old money, minimalist, office, and creator-shoot looks stay distinct and intentional.",
  },
  {
    eyebrow: "Retailer candidates where available",
    title: "One board, multiple stores, clearer next steps",
    description:
      "FitMuse separates sample style boards from manually reviewed retailer candidates so shopping claims stay honest.",
  },
];

export const creatorUseCases = [
  "Reels",
  "Photoshoots",
  "Date Night",
  "College",
  "Office",
  "Travel",
  "Events",
  "Brand Content",
];

export const howItWorksSteps: Step[] = [
  {
    title: "Measure",
    description: "Add your sizes, fit cues, and the brief details that shape the board.",
  },
  {
    title: "Choose aesthetic",
    description: "Pick the vibe, colors, and stores you want the board to respect.",
  },
  {
    title: "Set occasion + budget",
    description: "Keep the outfit board realistic for the plan and spend range in front of you.",
  },
  {
    title: "Get full looks",
    description: "See ranked outfit boards first, plus retailer candidates where FitMuse has manually reviewed them.",
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    legacy: "Closet apps usually start by asking you to catalog what you already own.",
    modern:
      "FitMuse starts with a style brief and builds the outfit board you need for the plan in front of you.",
  },
  {
    legacy: "Broad style-suggestion tools often stop at an aesthetic label.",
    modern:
      "FitMuse keeps the brief grounded in budget, fit, colors, stores, and occasion so the board feels more usable.",
  },
  {
    legacy: "Single-brand recommendation tools only show what one retailer wants to sell.",
    modern: "FitMuse can mix sample boards and manually reviewed retailer candidates across multiple stores.",
  },
  {
    legacy: "Mood boards and inspiration feeds rarely finish the outfit for you.",
    modern: "FitMuse turns the brief into a full board with reasoning, swaps, and price context.",
  },
  {
    legacy: "High-touch personal styling can help, but most people do not need a human service every time.",
    modern: "FitMuse aims to be a faster self-serve planning tool for repeat outfit decisions.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Current access",
    price: "Available now",
    description: "Use the live product free while FitMuse refines paid packaging.",
    features: [
      "Style quiz and saved brief",
      "Sample recommendation boards",
      "Saved looks in this browser",
      "Selected real-shopping candidate boards",
    ],
  },
  {
    name: "Future everyday plan",
    price: "Planned",
    description: "Direction for repeat outfit planning once the core loop proves sticky.",
    features: [
      "More repeat-use board generation",
      "Stronger shortlist and comparison tools",
      "Expanded brief presets",
      "Priority access to new board categories",
    ],
  },
  {
    name: "Future plus plan",
    price: "Planned",
    description: "Direction for heavier use and deeper planning tools.",
    features: [
      "Broader board coverage",
      "Deeper comparison and refinement tools",
      "Expanded saved-board workflow",
      "Earlier access to new shopping features",
    ],
  },
  {
    name: "Future creator plan",
    price: "Planned",
    description: "Direction for recurring shoots, brand days, and heavier board use.",
    highlighted: true,
    features: [
      "Repeat brief-to-board planning",
      "Creator-friendly occasion presets",
      "Faster board reuse for content days",
      "Deeper planning tools once validated",
    ],
  },
];

export const aestheticOptions = [
  "old money",
  "streetwear",
  "minimalist",
  "clean girl",
  "smart casual",
  "office",
  "party",
  "date night",
  "travel",
  "creator/photoshoot",
  "gym casual",
];

export const occasionOptions = [
  "reels",
  "photoshoot",
  "date",
  "party",
  "college",
  "office",
  "travel",
  "wedding guest",
  "daily wear",
  "brand content",
];

export const budgetRangeOptions = [
  "under $100",
  "$100-$200",
  "$200-$350",
  "$350+",
];

export const fitPreferenceOptions = [
  "slim",
  "regular",
  "relaxed",
  "oversized",
  "modest",
  "classy",
  "trendy",
];

export const stylePreferenceOptions = [
  "feminine",
  "masculine",
  "androgynous",
  "mixed / open to all",
];

export const bodyTypeOptions = [
  "Pear",
  "Rectangle",
  "Hourglass",
  "Athletic",
  "Inverted triangle",
  "Apple",
  "Prefer not to say",
];

export const commonSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

export const supportedStoreOptions = [
  "H&M",
  "Zara",
  "Uniqlo",
  "Mango",
  "ASOS",
  "COS",
  "Abercrombie",
  "Amazon Fashion",
  "Nike",
  "Adidas",
  "Nordstrom Rack",
  "Urban Outfitters",
];

export const quickStartTemplates = [
  {
    id: "first-date",
    label: "First date",
    description: "Polished, flattering, and easy to wear.",
    values: {
      stylePreference: "feminine",
      aesthetic: "clean girl",
      occasion: "date",
      budgetRange: "$100-$200",
      fitPreference: "classy",
      preferredColors: "cream, camel, sage",
      storesLike: "Zara, Mango, COS",
    },
  },
  {
    id: "job-interview",
    label: "Job interview",
    description: "Work-safe confidence with clean structure.",
    values: {
      stylePreference: "mixed / open to all",
      aesthetic: "office",
      occasion: "office",
      budgetRange: "$200-$350",
      fitPreference: "regular",
      preferredColors: "navy, stone, charcoal",
      storesLike: "COS, Uniqlo, Mango",
    },
  },
  {
    id: "office-day",
    label: "Office day",
    description: "Smart, repeatable, and budget-aware.",
    values: {
      stylePreference: "mixed / open to all",
      aesthetic: "smart casual",
      occasion: "office",
      budgetRange: "$100-$200",
      fitPreference: "regular",
      preferredColors: "soft white, navy, camel",
      storesLike: "Uniqlo, COS, Zara",
    },
  },
  {
    id: "airport-travel",
    label: "Airport / travel",
    description: "Comfort-forward layers that still look put together.",
    values: {
      stylePreference: "mixed / open to all",
      aesthetic: "travel",
      occasion: "travel",
      budgetRange: "$100-$200",
      fitPreference: "relaxed",
      preferredColors: "stone, camel, sage",
      storesLike: "Uniqlo, Zara, COS",
    },
  },
  {
    id: "wedding-guest",
    label: "Wedding guest",
    description: "Elevated event dressing without overdoing it.",
    values: {
      stylePreference: "feminine",
      aesthetic: "luxury neutral",
      occasion: "wedding guest",
      budgetRange: "$200-$350",
      fitPreference: "classy",
      preferredColors: "champagne, taupe, charcoal",
      storesLike: "Mango, Nordstrom Rack, Zara",
    },
  },
  {
    id: "birthday-dinner",
    label: "Birthday dinner",
    description: "Going-out energy with budget discipline.",
    values: {
      stylePreference: "feminine",
      aesthetic: "party",
      occasion: "party",
      budgetRange: "$100-$200",
      fitPreference: "classy",
      preferredColors: "black, plum, gold",
      storesLike: "ASOS, Zara, Mango",
    },
  },
  {
    id: "casual-weekend",
    label: "Casual weekend",
    description: "Low effort, still intentional.",
    values: {
      stylePreference: "mixed / open to all",
      aesthetic: "minimalist",
      occasion: "daily wear",
      budgetRange: "$100-$200",
      fitPreference: "relaxed",
      preferredColors: "cream, navy, stone",
      storesLike: "Uniqlo, COS, H&M",
    },
  },
  {
    id: "concert-night",
    label: "Concert",
    description: "Statement styling without losing comfort.",
    values: {
      stylePreference: "mixed / open to all",
      aesthetic: "streetwear",
      occasion: "party",
      budgetRange: "$100-$200",
      fitPreference: "oversized",
      preferredColors: "charcoal, stone, black",
      storesLike: "ASOS, Adidas, Urban Outfitters",
    },
  },
  {
    id: "brunch-look",
    label: "Brunch",
    description: "Soft polish for daylight plans.",
    values: {
      stylePreference: "feminine",
      aesthetic: "clean girl",
      occasion: "daily wear",
      budgetRange: "$100-$200",
      fitPreference: "regular",
      preferredColors: "cream, soft white, sage",
      storesLike: "Mango, Zara, COS",
    },
  },
  {
    id: "creator-shoot",
    label: "Creator shoot",
    description: "Content-ready boards with clearer visual impact.",
    values: {
      stylePreference: "mixed / open to all",
      aesthetic: "creator/photoshoot",
      occasion: "photoshoot",
      budgetRange: "$200-$350",
      fitPreference: "trendy",
      preferredColors: "cream, charcoal, taupe",
      storesLike: "ASOS, Zara, Mango",
    },
  },
  {
    id: "quiet-luxury-budget",
    label: "Quiet luxury under budget",
    description: "Premium-looking basics without luxury pricing.",
    values: {
      stylePreference: "masculine",
      aesthetic: "old money",
      occasion: "date",
      budgetRange: "$100-$200",
      fitPreference: "slim",
      preferredColors: "cream, espresso, sage",
      storesLike: "Zara, Mango, H&M, ASOS",
    },
  },
  {
    id: "clean-minimal-everyday",
    label: "Clean minimal everyday",
    description: "Simple outfit boards that still feel elevated.",
    values: {
      stylePreference: "feminine",
      aesthetic: "clean girl",
      occasion: "daily wear",
      budgetRange: "$100-$200",
      fitPreference: "regular",
      preferredColors: "cream, navy, beige",
      storesLike: "COS, Uniqlo, Mango",
    },
  },
] as const;

export const defaultQuizValues: QuizFormValues = {
  name: "Ava",
  stylePreference: "feminine",
  location: "United States",
  height: "5'6\"",
  weight: "135 lb",
  chestBust: "34 in",
  waist: "27 in",
  hips: "38 in",
  topSize: "S",
  bottomSize: "M",
  shoeSize: "8",
  bodyType: "Hourglass",
  aesthetic: "clean girl",
  occasion: "brand content",
  budgetRange: "$100-$200",
  fitPreference: "classy",
  preferredColors: "cream, espresso, sage",
  avoidColors: "neon green",
  storesLike: "Zara, Mango, H&M, ASOS",
};

// Mock outfits keep the MVP sample catalog realistic while staying easy to evolve later.
export const outfits: Outfit[] = [
  {
    id: "old-money-dinner-look",
    name: "Old Money Dinner Look",
    aesthetic: "Old money",
    occasion: "Date / dinner",
    items: {
      top: "Fine-knit ivory polo",
      bottom: "Tailored espresso trousers",
      shoes: "Tan leather loafers",
      accessories: "Slim leather belt and analog watch",
      outerwear: "Camel trench coat",
    },
    estimatedPrice: 198,
    fitNotes:
      "The higher rise and long trouser line visually lengthen the legs, while the soft knit top keeps the torso polished without feeling stiff.",
    whyItSuits:
      "This look works beautifully for balanced or hourglass proportions because it defines the waist and keeps the palette elevated for camera-friendly closeups.",
    creatorUseCase: "Best for upscale dates, dinner plans, and refined evening moments.",
    colors: ["cream", "camel", "espresso"],
    stores: ["Mango", "Zara", "Aldo"],
    fitPreferences: ["Classy", "Slim fit", "Modest"],
    links: {
      top: "https://example.com/outfits/old-money/top",
      bottom: "https://example.com/outfits/old-money/bottom",
      shoes: "https://example.com/outfits/old-money/shoes",
      accessories: "https://example.com/outfits/old-money/accessories",
      outerwear: "https://example.com/outfits/old-money/outerwear",
    },
  },
  {
    id: "streetwear-reel-outfit",
    name: "Streetwear Reel Outfit",
    aesthetic: "Streetwear",
    occasion: "Reels / brand content",
    items: {
      top: "Oversized charcoal graphic tee",
      bottom: "Stone cargo pants",
      shoes: "Chunky low-top sneakers",
      accessories: "Chain necklace, cap, and crossbody sling",
      outerwear: "Lightweight bomber jacket",
    },
    estimatedPrice: 164,
    fitNotes:
      "The oversized top balances the cargo silhouette, and the stacked layers give movement that reads well in short-form video.",
    whyItSuits:
      "This is a confident pick for creators who want an easy on-camera silhouette with room to move, pose, and style around sneakers or accessories.",
    creatorUseCase: "Best for Instagram reels, street-style transitions, and casual sponsored content.",
    colors: ["charcoal", "stone", "silver"],
    stores: ["ASOS", "H&M", "Nike"],
    fitPreferences: ["Oversized", "Relaxed", "Trendy"],
    links: {
      top: "https://example.com/outfits/streetwear/top",
      bottom: "https://example.com/outfits/streetwear/bottom",
      shoes: "https://example.com/outfits/streetwear/shoes",
      accessories: "https://example.com/outfits/streetwear/accessories",
      outerwear: "https://example.com/outfits/streetwear/outerwear",
    },
  },
  {
    id: "minimalist-coffee-date-look",
    name: "Minimalist Coffee Date Look",
    aesthetic: "Minimalist",
    occasion: "Coffee date",
    items: {
      top: "Ribbed taupe mock-neck top",
      bottom: "Black straight-leg jeans",
      shoes: "Cream ankle boots",
      accessories: "Delicate watch and slim tote",
      outerwear: "Soft wool blazer",
    },
    estimatedPrice: 152,
    fitNotes:
      "Clean vertical lines slim the profile, while the structured blazer adds polish without overwhelming petite or medium frames.",
    whyItSuits:
      "Minimalist wardrobes shine when the fit feels intentional, and this combination makes everyday basics look expensive and photo-ready.",
    creatorUseCase: "Best for coffee date content, casual lifestyle posts, and day-to-night transitions.",
    colors: ["taupe", "black", "cream"],
    stores: ["COS", "Mango", "Steve Madden"],
    fitPreferences: ["Classy", "Slim fit", "Relaxed"],
    links: {
      top: "https://example.com/outfits/minimalist/top",
      bottom: "https://example.com/outfits/minimalist/bottom",
      shoes: "https://example.com/outfits/minimalist/shoes",
      accessories: "https://example.com/outfits/minimalist/accessories",
      outerwear: "https://example.com/outfits/minimalist/outerwear",
    },
  },
  {
    id: "clean-girl-everyday-look",
    name: "Clean Girl Everyday Look",
    aesthetic: "Clean girl",
    occasion: "Daily wear",
    items: {
      top: "White fitted tee",
      bottom: "Sage tailored shorts",
      shoes: "Neutral lifestyle sneakers",
      accessories: "Gold studs, slick bun clip, and canvas tote",
      outerwear: "Oatmeal cardigan",
    },
    estimatedPrice: 134,
    fitNotes:
      "The fitted base layer keeps the silhouette neat, while the tailored short gives structure and makes everyday movement feel polished.",
    whyItSuits:
      "Clean girl styling suits users who want effortless confidence with low visual clutter and colors that flatter on bright daytime footage.",
    creatorUseCase: "Best for daily vlogs, study content, and soft lifestyle reels.",
    colors: ["white", "sage", "oatmeal"],
    stores: ["Aritzia", "Uniqlo", "Veja"],
    fitPreferences: ["Classy", "Relaxed", "Modest"],
    links: {
      top: "https://example.com/outfits/clean-girl/top",
      bottom: "https://example.com/outfits/clean-girl/bottom",
      shoes: "https://example.com/outfits/clean-girl/shoes",
      accessories: "https://example.com/outfits/clean-girl/accessories",
      outerwear: "https://example.com/outfits/clean-girl/outerwear",
    },
  },
  {
    id: "college-casual-fit",
    name: "College Casual Fit",
    aesthetic: "Casual",
    occasion: "College",
    items: {
      top: "Striped baby tee",
      bottom: "Relaxed blue denim",
      shoes: "Retro campus sneakers",
      accessories: "Backpack, bracelet stack, and sunglasses",
      outerwear: "Zip-up hoodie",
    },
    estimatedPrice: 96,
    fitNotes:
      "This mix gives room through the hip and leg while keeping the top more fitted, which creates an easy proportion that feels current and comfortable.",
    whyItSuits:
      "It is approachable, affordable, and versatile enough for class, coffee runs, and spontaneous content captures across the day.",
    creatorUseCase: "Best for campus GRWM videos, study-day content, and everyday snapshots.",
    colors: ["blue", "white", "navy"],
    stores: ["Hollister", "H&M", "Converse"],
    fitPreferences: ["Relaxed", "Trendy", "Oversized"],
    links: {
      top: "https://example.com/outfits/college/top",
      bottom: "https://example.com/outfits/college/bottom",
      shoes: "https://example.com/outfits/college/shoes",
      accessories: "https://example.com/outfits/college/accessories",
      outerwear: "https://example.com/outfits/college/outerwear",
    },
  },
  {
    id: "office-smart-casual",
    name: "Office Smart Casual",
    aesthetic: "Office",
    occasion: "Office",
    items: {
      top: "Draped shell blouse",
      bottom: "Slate ankle trousers",
      shoes: "Pointed slingback flats",
      accessories: "Structured tote and slim gold watch",
      outerwear: "Lightweight blazer",
    },
    estimatedPrice: 178,
    fitNotes:
      "A soft blouse adds movement up top, while cropped trousers keep the outfit sharp and flattering across different heights with minimal tailoring.",
    whyItSuits:
      "This outfit balances polish with ease, which is ideal for young professionals who want to look credible without feeling overdressed.",
    creatorUseCase: "Best for office days, LinkedIn content, and polished weekday transitions.",
    colors: ["slate", "black", "soft white"],
    stores: ["Mango", "Banana Republic", "Sam Edelman"],
    fitPreferences: ["Classy", "Slim fit", "Modest"],
    links: {
      top: "https://example.com/outfits/office/top",
      bottom: "https://example.com/outfits/office/bottom",
      shoes: "https://example.com/outfits/office/shoes",
      accessories: "https://example.com/outfits/office/accessories",
      outerwear: "https://example.com/outfits/office/outerwear",
    },
  },
  {
    id: "party-night-outfit",
    name: "Party Night Outfit",
    aesthetic: "Party",
    occasion: "Party / event",
    items: {
      top: "Black satin corset top",
      bottom: "High-rise faux leather pants",
      shoes: "Strappy heels",
      accessories: "Statement earrings and mini shoulder bag",
      outerwear: "Cropped blazer",
    },
    estimatedPrice: 189,
    fitNotes:
      "The shaped top highlights the waist, while the sleek pant keeps the line long and dramatic for flash photography and night content.",
    whyItSuits:
      "This is ideal when the goal is standout energy, especially for creators who need a bold look that still feels balanced and wearable.",
    creatorUseCase: "Best for nightlife posts, event recaps, and party-ready photoshoots.",
    colors: ["black", "silver"],
    stores: ["ASOS", "PrettyLittleThing", "Steve Madden"],
    fitPreferences: ["Trendy", "Slim fit", "Classy"],
    links: {
      top: "https://example.com/outfits/party/top",
      bottom: "https://example.com/outfits/party/bottom",
      shoes: "https://example.com/outfits/party/shoes",
      accessories: "https://example.com/outfits/party/accessories",
      outerwear: "https://example.com/outfits/party/outerwear",
    },
  },
  {
    id: "travel-airport-look",
    name: "Travel Airport Look",
    aesthetic: "Luxury casual",
    occasion: "Travel",
    items: {
      top: "Soft beige lounge set hoodie",
      bottom: "Matching wide-leg travel pants",
      shoes: "Comfort sneakers",
      accessories: "Oversized tote, cap, and noise-canceling headphones",
      outerwear: "Longline wool wrap coat",
    },
    estimatedPrice: 143,
    fitNotes:
      "The monochrome base makes the frame look longer, and the relaxed cut keeps the outfit comfortable for sitting, layering, and airport movement.",
    whyItSuits:
      "Travel style lands best when it looks easy but intentional, and this outfit delivers that creator-off-duty feel without losing comfort.",
    creatorUseCase: "Best for airport fits, travel vlogs, and off-duty creator content.",
    colors: ["beige", "camel", "white"],
    stores: ["Aritzia", "Uniqlo", "New Balance"],
    fitPreferences: ["Relaxed", "Oversized", "Classy"],
    links: {
      top: "https://example.com/outfits/travel/top",
      bottom: "https://example.com/outfits/travel/bottom",
      shoes: "https://example.com/outfits/travel/shoes",
      accessories: "https://example.com/outfits/travel/accessories",
      outerwear: "https://example.com/outfits/travel/outerwear",
    },
  },
];
