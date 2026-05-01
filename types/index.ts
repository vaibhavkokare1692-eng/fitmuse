export type NavLink = {
  label: string;
  href: string;
};

export type Feature = {
  eyebrow: string;
  title: string;
  description: string;
};

export type Step = {
  title: string;
  description: string;
};

export type ComparisonRow = {
  legacy: string;
  modern: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type Aesthetic =
  | "old money"
  | "streetwear"
  | "minimalist"
  | "clean girl"
  | "smart casual"
  | "office"
  | "party"
  | "date night"
  | "travel"
  | "creator/photoshoot"
  | "luxury neutral"
  | "gym casual";

export type Occasion =
  | "reels"
  | "photoshoot"
  | "date"
  | "party"
  | "college"
  | "office"
  | "travel"
  | "wedding guest"
  | "daily wear"
  | "brand content";

export type FitPreference =
  | "slim"
  | "regular"
  | "relaxed"
  | "oversized"
  | "modest"
  | "classy"
  | "trendy";

export type StylePreference =
  | "feminine"
  | "masculine"
  | "androgynous"
  | "mixed / open to all";

export type BudgetRange = "under $100" | "$100-$200" | "$200-$350" | "$350+";

export type ProductCategory = "top" | "bottom" | "shoes" | "accessory" | "outerwear";

export type ColorFamily =
  | "neutral"
  | "earth"
  | "cool"
  | "warm"
  | "pastel"
  | "monochrome"
  | "metallic"
  | "sport";

export type ProductVisualType =
  | "tailored"
  | "soft-structure"
  | "street-stack"
  | "sport"
  | "evening"
  | "editorial"
  | "accessory"
  | "shoe"
  | "layered";

export type BudgetMatchLabel =
  | "Within budget"
  | "Near budget"
  | "Stretch upgrade"
  | "Over budget";

export type MatchQualityLabel =
  | "Best match"
  | "Strong match"
  | "Closest match";

export type Product = {
  id: string;
  name: string;
  brand: string;
  store: string;
  category: ProductCategory;
  price: number;
  aestheticTags: Aesthetic[];
  occasionTags: Occasion[];
  colors: string[];
  primaryColor: string;
  colorFamily: ColorFamily;
  availableSizes: string[];
  fitType: FitPreference;
  stylePreferences: StylePreference[];
  styleNotes: string;
  image: string;
  visualType: ProductVisualType;
  url: string;
  affiliateReady: boolean;
};

export type QuizAnswers = {
  name: string;
  stylePreference: StylePreference | "";
  location: string;
  height: string;
  weight: string;
  chestBust: string;
  waist: string;
  hips: string;
  topSize: string;
  bottomSize: string;
  shoeSize: string;
  bodyType: string;
  aesthetic: Aesthetic | "";
  occasion: Occasion | "";
  budgetRange: BudgetRange | "";
  fitPreference: FitPreference | "";
  preferredColors: string;
  avoidColors: string;
  storesLike: string;
};

export type QuizFormValues = QuizAnswers;
export type UserProfile = Partial<QuizAnswers>;

export type OutfitRecommendationItems = {
  top: Product;
  bottom: Product;
  shoes: Product;
  accessory?: Product;
  outerwear?: Product;
};

export type RecommendationPriceLineItem = {
  label: string;
  itemName: string;
  price: number;
};

export type OutfitSmartSwap = {
  type: "cheaper" | "premium" | "casual" | "dressy";
  label: string;
  suggestion: string;
  reason: string;
  priceDelta?: number;
};

export type OutfitRecommendation = {
  id: string;
  name: string;
  aesthetic: Aesthetic;
  occasion: Occasion;
  totalPrice: number;
  items: OutfitRecommendationItems;
  colorPalette: string[];
  colorFamilies: ColorFamily[];
  fitNote: string;
  whyItWorks: string;
  creatorUseCase: string;
  confidenceScore: number;
  matchQualityLabel: MatchQualityLabel;
  budgetMatchLabel: BudgetMatchLabel;
  budgetNote: string;
  matchReasons: string[];
  creatorAlignmentScore: number;
  stores: string[];
  priceBreakdown: RecommendationPriceLineItem[];
  occasionMatch: string;
  styleMatch: string;
  colorHarmony: string;
  fitConfidence: string;
  sizeCompatibility: string;
  storeMatch: string;
  fitTags: string[];
  stylingSummary: string;
  smartSwaps: OutfitSmartSwap[];
  matchMode: "exact" | "closest";
  shopUrl: string;
};

export type SavedLookBriefSummary = {
  name?: string;
  stylePreference?: StylePreference | "";
  location?: string;
  aesthetic?: Aesthetic | "";
  occasion?: Occasion | "";
  budgetRange?: BudgetRange | "";
  fitPreference?: FitPreference | "";
  preferredColors?: string[];
  storesLike?: string[];
};

export type SavedLookSnapshot = OutfitRecommendation & {
  savedAt: string;
  stylePreference?: StylePreference | "";
  briefSummary?: SavedLookBriefSummary;
};

export type RealProductCategory =
  | "top"
  | "bottom"
  | "dress/one-piece"
  | "outer layer"
  | "shoes"
  | "bag"
  | "accessory";

export type RealProductSourceType =
  | "manual-placeholder"
  | "manual-curated"
  | "manual_curated_candidate"
  | "affiliate-placeholder";

export type RealVerificationStatus = "needs_manual_verification" | "manually_verified";

export type RealOutfitPackSmartSwap = {
  label: string;
  note: string;
};

export type RealProduct = {
  id: string;
  name: string;
  store: string;
  brand: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  category: RealProductCategory;
  subcategory: string;
  productUrl: string;
  imageUrl?: string;
  colors: string[];
  sizes: string[];
  fitTags: string[];
  occasionTags: string[];
  aestheticTags: string[];
  stylePreferenceTags: StylePreference[];
  region: string;
  lastCheckedDate: string;
  inStock: boolean;
  affiliateReady: boolean;
  affiliateUrl?: string;
  sourceType: RealProductSourceType;
  verificationStatus?: RealVerificationStatus;
  notes?: string;
};

export type RealOutfitPack = {
  id: string;
  name: string;
  targetStylePreference: StylePreference;
  aesthetic: string;
  occasion: string;
  budgetRange: BudgetRange;
  productIds: string[];
  totalPrice: number;
  budgetLabel: BudgetMatchLabel;
  fitNote: string;
  whyItWorks: string;
  smartSwaps: RealOutfitPackSmartSwap[];
  notes?: string;
  lastUpdated: string;
  shopReady: boolean;
  verificationStatus?: RealVerificationStatus;
};

export type Outfit = {
  id: string;
  name: string;
  aesthetic: string;
  occasion: string;
  items: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string;
    outerwear?: string;
  };
  estimatedPrice: number;
  fitNotes: string;
  whyItSuits: string;
  creatorUseCase: string;
  colors: string[];
  stores: string[];
  fitPreferences: string[];
  links: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string;
    outerwear?: string;
  };
};
