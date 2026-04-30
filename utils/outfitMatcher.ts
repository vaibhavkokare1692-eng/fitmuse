import { getStyleRulesForBrief, type StyleRule } from "../data/styleRules.ts";
import { products } from "../data/products.ts";
import {
  formatCurrency,
  formatAestheticLabel,
  isCreatorOccasion,
  splitCommaSeparated,
} from "../lib/utils.ts";
import type {
  Aesthetic,
  BudgetMatchLabel,
  BudgetRange,
  ColorFamily,
  FitPreference,
  MatchQualityLabel,
  OutfitSmartSwap,
  Occasion,
  OutfitRecommendation,
  Product,
  ProductCategory,
  QuizAnswers,
  RecommendationPriceLineItem,
  StylePreference,
} from "@/types";

type ScoredProduct = {
  product: Product;
  score: number;
  styleRuleBoost: number;
  exactAesthetic: boolean;
  fallbackAesthetic: boolean;
  exactOccasion: boolean;
  fallbackOccasion: boolean;
  sizeExact: boolean;
  fitExact: boolean;
  fitAligned: boolean;
  matchedPreferredColors: string[];
  matchedPreferredFamily: boolean;
  matchedStores: string[];
  matchReasons: string[];
  matchedStyleRuleNames: string[];
  styleRuleReasons: string[];
  styleRuleAvoidHits: string[];
  creatorAlignmentScore: number;
};

type StyleRuleProductSignal = {
  score: number;
  matchedRuleNames: string[];
  matchReasons: string[];
  avoidHits: string[];
};

const coreCategories: ProductCategory[] = ["top", "bottom", "shoes"];
const poolSizes: Record<ProductCategory, number> = {
  top: 9,
  bottom: 9,
  shoes: 7,
  accessory: 6,
  outerwear: 4,
};

const creatorMoments: Occasion[] = ["reels", "photoshoot", "brand content"];
const creatorMomentSet = new Set<Occasion>(creatorMoments);

const fallbackAesthetics: Record<Aesthetic, Aesthetic[]> = {
  "old money": ["luxury neutral", "smart casual", "date night"],
  streetwear: ["creator/photoshoot", "gym casual", "travel"],
  minimalist: ["clean girl", "smart casual", "luxury neutral"],
  "clean girl": ["minimalist", "travel", "luxury neutral"],
  "smart casual": ["office", "minimalist", "travel"],
  office: ["smart casual", "luxury neutral", "minimalist"],
  party: ["date night", "creator/photoshoot", "streetwear"],
  "date night": ["old money", "party", "minimalist"],
  travel: ["luxury neutral", "smart casual", "gym casual"],
  "creator/photoshoot": ["streetwear", "luxury neutral", "party"],
  "luxury neutral": ["old money", "minimalist", "office"],
  "gym casual": ["streetwear", "travel", "clean girl"],
};

const fallbackOccasions: Record<Occasion, Occasion[]> = {
  reels: ["photoshoot", "brand content", "daily wear"],
  photoshoot: ["brand content", "reels", "party"],
  date: ["party", "brand content", "daily wear"],
  party: ["photoshoot", "date", "brand content"],
  college: ["daily wear", "travel", "reels"],
  office: ["brand content", "daily wear", "travel"],
  travel: ["daily wear", "college", "reels"],
  "wedding guest": ["date", "party", "brand content"],
  "daily wear": ["college", "travel", "reels"],
  "brand content": ["photoshoot", "reels", "office"],
};

const relatedFits: Record<FitPreference, FitPreference[]> = {
  slim: ["classy", "regular"],
  regular: ["slim", "relaxed", "classy"],
  relaxed: ["regular", "oversized", "modest"],
  oversized: ["relaxed", "trendy"],
  modest: ["relaxed", "classy"],
  classy: ["slim", "regular", "modest"],
  trendy: ["oversized", "slim"],
};

const colorFamilyMap: Record<string, ColorFamily> = {
  black: "monochrome",
  white: "neutral",
  cream: "neutral",
  bone: "neutral",
  ivory: "neutral",
  ecru: "neutral",
  oatmeal: "neutral",
  stone: "neutral",
  softwhite: "neutral",
  "soft white": "neutral",
  beige: "earth",
  camel: "earth",
  tan: "earth",
  sand: "earth",
  taupe: "earth",
  mocha: "earth",
  espresso: "earth",
  chocolate: "earth",
  sage: "earth",
  olive: "earth",
  blue: "cool",
  slate: "cool",
  navy: "cool",
  charcoal: "cool",
  silver: "metallic",
  gold: "metallic",
  pearl: "metallic",
  pink: "pastel",
  plum: "warm",
  graphite: "monochrome",
  grey: "monochrome",
  gray: "monochrome",
};

const quietLuxuryPalette = new Set([
  "cream",
  "navy",
  "camel",
  "forest green",
  "burgundy",
  "charcoal",
  "stone",
  "white",
  "off-white",
  "ivory",
  "taupe",
  "espresso",
  "chocolate",
  "tan",
  "beige",
  "maroon",
  "rust",
]);

const neutralBaseColors = new Set([
  "cream",
  "white",
  "off-white",
  "ivory",
  "stone",
  "charcoal",
  "camel",
  "beige",
  "taupe",
  "navy",
  "ecru",
  "oatmeal",
]);

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function formatLabel(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .split("/")
    .map((part) =>
      part
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" / ");
}

function getPreferredColorFamilies(preferredColors: string[]) {
  return Array.from(
    new Set(
      preferredColors
        .map((color) => colorFamilyMap[normalize(color)])
        .filter(Boolean) as ColorFamily[],
    ),
  );
}

function buildProductSearchText(product: Product) {
  return normalize(
    [
      product.name,
      product.styleNotes,
      product.primaryColor,
      ...product.colors,
      product.category,
      product.visualType,
      product.store,
      product.fitType,
      ...product.aestheticTags,
      ...product.occasionTags,
      ...product.stylePreferences,
    ].join(" "),
  );
}

function keywordMatches(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

function itemSignalKeywords(signal: string) {
  const normalized = normalize(signal);
  const keywords: Record<string, string[]> = {
    "oxford shirt": ["oxford"],
    "button-up shirt": ["button-up", "button up", "button-down", "button down", "oxford", "shirt"],
    "button-ups": ["button-up", "button up", "button-down", "button down", "oxford", "shirt"],
    blouse: ["blouse", "draped blouse", "shirt"],
    "silk/blend blouses": ["silk blouse", "draped blouse", "blouse", "silk shirt"],
    "button-down shirt": ["button-down", "button down", "oxford"],
    "white t-shirt": ["white t-shirt", "white t shirt", "white tee", "tee"],
    "high-quality white t-shirt": ["white t-shirt", "white t shirt", "white tee", "tee"],
    "simple premium tee": ["tee", "t-shirt", "t shirt", "crewneck tee", "refined tee"],
    "simple premium tees": ["tee", "t-shirt", "t shirt", "crewneck tee", "refined tee"],
    "oversized cotton/linen button-ups": ["button-up", "button up", "linen shirt", "cotton shirt", "oversized shirt"],
    "oversized button-up": ["button-up", "button up", "oversized shirt", "oversized button-up"],
    "silk button-up": ["silk button-up", "silk button up", "silk shirt", "button-up", "button up"],
    "fine knit top": ["fine knit", "knit top", "ribbed top", "sweater"],
    "fine knit tops": ["fine knit", "knit top", "ribbed top", "sweater"],
    "fitted knit/tube/corset tops": ["knit top", "tube top", "corset top", "ribbed top", "fitted knit"],
    "fitted knit top": ["knit top", "ribbed top", "fitted knit"],
    "corset-inspired top": ["corset", "corset top", "structured top"],
    "lightweight merino/cashmere sweaters": ["merino", "cashmere", "sweater", "crewneck"],
    "merino/cotton sweaters": ["merino", "cotton sweater", "sweater", "crewneck"],
    "neutral knit": ["knit", "crewneck", "sweater", "merino"],
    "knit polo": ["knit polo", "knitted polo", "polo"],
    "knitted polo": ["knit polo", "knitted polo", "polo"],
    "quarter-zip": ["quarter-zip", "quarter zip", "half-zip", "half zip"],
    "textured cardigan": ["cardigan"],
    cardigan: ["cardigan"],
    "unstructured navy blazer": ["blazer"],
    "oversized blazer": ["oversized blazer", "blazer"],
    "blazer dress": ["blazer dress", "dress"],
    blazer: ["blazer"],
    "suede layer": ["suede"],
    "textured jacket": ["textured", "jacket", "overshirt", "suede"],
    "crewneck": ["crewneck"],
    "high-rise straight-leg jeans": ["high-rise", "high rise", "straight-leg", "straight leg", "jeans", "denim"],
    "high-rise denim": ["high-rise", "high rise", "jeans", "denim"],
    "high-rise bottoms": ["high-rise", "high rise", "trousers", "pants", "jeans", "skirt"],
    "cropped or waist-defined tops": ["cropped", "wrap", "corset", "fitted", "waist"],
    "light third piece": ["cardigan", "blazer", "overshirt", "layer", "half-zip", "half zip"],
    "overshirt/light jacket": ["overshirt", "light jacket", "jacket", "shirt jacket"],
    "one anchor piece": ["blazer", "coat", "dress", "trousers", "loafers", "heels", "boots"],
    "versatile basics": ["tee", "shirt", "cardigan", "trousers", "jeans", "skirt", "loafers", "flats"],
    "high-low mix": ["tee", "shirt", "trousers", "jeans", "loafers", "flats", "bag"],
    "simple outfit base": ["tee", "shirt", "trousers", "jeans", "dress", "skirt", "cardigan"],
    "simple refined basics": ["tee", "shirt", "trousers", "jeans", "dress", "skirt", "cardigan", "flats"],
    "neutral core pieces": ["tee", "shirt", "trousers", "jeans", "dress", "skirt", "cardigan", "bag"],
    "tailored bottom": ["trouser", "trousers", "tailored", "chinos"],
    "tailored trousers": ["trouser", "trousers", "pleated", "front-crease", "front crease"],
    "straight-leg trousers": ["straight-leg", "straight leg", "trouser", "trousers"],
    "wide-leg trousers": ["wide-leg", "wide leg", "trouser", "trousers"],
    "flannel trousers": ["flannel", "trouser", "trousers"],
    "wide-leg or straight trousers": ["wide-leg", "wide leg", "straight-leg", "straight leg", "trouser", "trousers"],
    chinos: ["chino", "chinos"],
    "dark trousers": ["trouser", "trousers"],
    "grey flannel trousers": ["flannel", "trouser", "trousers"],
    "dark clean denim": ["denim", "jeans"],
    "baggy denim": ["baggy denim", "relaxed denim", "wide-leg jeans", "wide leg jeans", "jeans", "denim"],
    "slip dress": ["slip dress", "dress"],
    "midi/slip skirts": ["midi skirt", "slip skirt", "skirt"],
    "maxi skirt": ["maxi skirt", "skirt"],
    "mini skirt": ["mini skirt", "skirt"],
    "penny loafers": ["loafer", "loafers"],
    "tassel loafers": ["loafer", "loafers"],
    "leather loafers": ["leather loafers", "loafer", "loafers"],
    loafers: ["loafer", "loafers"],
    "chelsea boots": ["chelsea", "boot", "boots"],
    "knee-high boots": ["knee-high boots", "knee high boots", "boot", "boots"],
    "pointed-toe flats": ["pointed-toe flats", "pointed toe flats", "pointed flats", "slingback flats"],
    "pointed flats": ["pointed flats", "pointed-toe", "pointed toe", "slingback"],
    "kitten heels": ["kitten heels", "kitten heel", "slingback", "heel", "heels"],
    "low block heels": ["block heel", "block heels", "heel", "heels", "pump", "slingback"],
    slingbacks: ["slingback", "slingbacks"],
    "minimal leather sneakers": ["minimal", "sneaker", "sneakers", "court sneakers", "leather sneakers"],
    "minimal sneakers": ["minimal", "sneaker", "sneakers", "court sneakers"],
    "minimalist sneakers if office is casual": ["minimal", "sneaker", "sneakers", "court sneakers", "clean sneaker"],
    "refined shoes": ["loafer", "loafers", "pointed", "heel", "heels", "slingback", "boot", "boots"],
    "leather belt": ["belt"],
    "slim leather belt": ["belt"],
    "thin leather belts": ["thin belt", "belt"],
    "thin belt": ["thin belt", "belt"],
    "simple watch": ["watch"],
    "simple analog watch": ["watch"],
    "simple dress watch": ["watch"],
    "gold hoops": ["gold hoops", "hoops", "earrings"],
    "dainty gold hoops": ["gold hoops", "hoops", "earrings"],
    "simple gold jewelry": ["gold hoops", "hoops", "earrings", "chain", "necklace", "cuff"],
    "gold jewelry": ["gold hoops", "hoops", "earrings", "chain", "necklace", "cuff"],
    "simple chains/paperclip necklaces": ["chain", "paperclip necklace", "necklace"],
    "simple chains": ["chain", "necklace"],
    "minimal jewelry": ["hoops", "earrings", "chain", "necklace", "watch", "cuff"],
    "structured handbag": ["structured bag", "handbag", "bag", "tote"],
    "structured bag": ["structured bag", "handbag", "bag", "tote", "shoulder bag"],
    "structured work bag": ["structured work bag", "work tote", "laptop bag", "folio tote", "briefcase", "structured bag", "tote"],
    "clean laptop bag": ["laptop bag", "folio tote", "briefcase", "work tote", "sleeve"],
    "small handbag": ["small bag", "mini bag", "structured bag", "handbag"],
    "small structured bag": ["small bag", "mini bag", "structured bag", "handbag"],
    "scaled-down handbag": ["small bag", "mini bag", "structured bag", "shoulder bag", "handbag"],
    "structured neutral bag": ["structured bag", "mini bag", "shoulder bag", "handbag", "tote"],
    "only if it supports repeat wear": ["belt", "watch", "bag", "earrings", "necklace"],
    "clean bag": ["bag", "tote", "sling", "crossbody", "weekender", "laptop bag", "handbag"],
    "classic sunglasses": ["sunglasses", "tortoiseshell", "black sunglasses"],
    "subtle scarf": ["scarf"],
    "lightweight scarf": ["scarf"],
    "subtle fragrance": ["fragrance"],
    "clean clothing": ["clean", "tailored", "polished", "minimal"],
    "coordinated accessories": ["watch", "belt", "bag"],
  };

  return keywords[normalized] ?? [normalized];
}

function matchesPrioritySignal(product: Product, signal: string) {
  const text = buildProductSearchText(product);
  const normalizedSignal = normalize(signal);

  if (normalizedSignal === "top") {
    return product.category === "top";
  }

  if (normalizedSignal === "bottom") {
    return product.category === "bottom";
  }

  if (normalizedSignal === "shoes") {
    return product.category === "shoes";
  }

  if (normalizedSignal === "accessory" || normalizedSignal === "accessories") {
    return product.category === "accessory";
  }

  if (normalizedSignal === "outerwear") {
    return product.category === "outerwear";
  }

  return keywordMatches(text, itemSignalKeywords(signal));
}

function matchesPriorityColor(product: Product, color: string) {
  const normalizedColor = normalize(color);
  const normalizedProductColors = product.colors.map(normalize);

  if (normalizedColor === "quiet palette") {
    return normalizedProductColors.some((entry) => quietLuxuryPalette.has(entry));
  }

  if (normalizedColor === "neutral base" || normalizedColor === "monochrome neutrals") {
    return normalizedProductColors.some((entry) => neutralBaseColors.has(entry));
  }

  if (normalizedColor === "low-contrast neutrals" || normalizedColor === "soft neutrals") {
    return (
      normalizedProductColors.some((entry) => neutralBaseColors.has(entry)) ||
      product.colorFamily === "neutral" ||
      product.colorFamily === "earth"
    );
  }

  if (normalizedColor === "muted accent" || normalizedColor === "muted premium tones") {
    return (
      normalizedProductColors.some((entry) => quietLuxuryPalette.has(entry)) &&
      !["neon", "electric blue", "royal blue"].includes(product.primaryColor)
    );
  }

  if (normalizedColor === "same quiet-luxury palette") {
    return normalizedProductColors.some((entry) => quietLuxuryPalette.has(entry));
  }

  const colorVariants = normalizedColor
    .split("/")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return colorVariants.some(
    (entry) => normalizedProductColors.includes(entry) || normalize(product.primaryColor) === entry,
  );
}

function matchesPriorityFit(product: Product, fitSignal: string) {
  const normalizedFit = normalize(fitSignal);
  const productText = buildProductSearchText(product);

  if (!normalizedFit) {
    return false;
  }

  if (
    normalizedFit === normalize(product.fitType) ||
    (normalizedFit === "slim-straight" && ["slim", "regular"].includes(product.fitType)) ||
    (normalizedFit === "clean tailoring" && ["classy", "regular", "slim"].includes(product.fitType)) ||
    (normalizedFit === "soft structure" &&
      (product.visualType === "soft-structure" || product.visualType === "tailored")) ||
    (normalizedFit === "clean shoulder" && keywordMatches(productText, ["shoulder", "structured", "tailored"])) ||
    (normalizedFit === "controlled drape" && keywordMatches(productText, ["drape", "soft", "tailored"])) ||
    (normalizedFit === "skim fit" && ["slim", "regular", "classy"].includes(product.fitType)) ||
    (normalizedFit === "neat layering" && keywordMatches(productText, ["layer", "cardigan", "zip", "blazer"])) ||
    (normalizedFit === "pressed finish" && ["classy", "regular"].includes(product.fitType)) ||
    (normalizedFit === "high-rise" && keywordMatches(productText, ["high-rise", "high rise"])) ||
    (normalizedFit === "clean line" &&
      (["classy", "regular", "slim"].includes(product.fitType) ||
        keywordMatches(productText, ["tailored", "straight-leg", "straight leg", "clean line"]))) ||
    (normalizedFit === "clean vertical line" &&
      keywordMatches(productText, ["high-rise", "high rise", "straight-leg", "straight leg", "pointed", "tailored"])) ||
    (normalizedFit === "balanced proportions" &&
      (["classy", "regular", "slim"].includes(product.fitType) ||
        keywordMatches(productText, ["tailored", "structured", "balanced"]))) ||
    (normalizedFit === "polished silhouette" &&
      (["classy", "regular", "slim"].includes(product.fitType) ||
        keywordMatches(productText, ["tailored", "polished", "structured", "pointed"]))) ||
    (normalizedFit === "easy structure" &&
      keywordMatches(productText, ["tailored", "structured", "cardigan", "blazer", "straight-leg", "straight leg"])) ||
    (normalizedFit === "clean waist emphasis" &&
      keywordMatches(productText, ["wrap", "belt", "high-rise", "high rise", "corset", "waist"])) ||
    (normalizedFit === "waist definition" &&
      keywordMatches(productText, ["belt", "high-rise", "high rise", "corset", "waist"])) ||
    (normalizedFit === "defined waist" &&
      keywordMatches(productText, ["belt", "high-rise", "high rise", "corset", "waist"])) ||
    (normalizedFit === "not clingy" &&
      (["regular", "classy", "relaxed"].includes(product.fitType) ||
        keywordMatches(productText, ["drape", "fluid", "tailored"]))) ||
    (normalizedFit === "waist-aware" &&
      keywordMatches(productText, ["belt", "high-rise", "high rise", "wrap", "corset", "waist"])) ||
    (normalizedFit === "waist-aware structure" &&
      keywordMatches(productText, ["belt", "high-rise", "high rise", "tailored", "corset"])) ||
    (normalizedFit === "clean skim" &&
      (["slim", "classy", "regular"].includes(product.fitType) ||
        keywordMatches(productText, ["slip", "drape", "fluid", "tailored"]))) ||
    (normalizedFit === "layered without bulk" &&
      keywordMatches(productText, ["cardigan", "blazer", "coat", "lightweight", "overshirt"])) ||
    (normalizedFit === "long line" &&
      keywordMatches(productText, ["maxi", "longline", "straight-leg", "straight leg", "high-rise", "high rise"])) ||
    (normalizedFit === "clear leg line" &&
      keywordMatches(productText, ["mini", "maxi", "pointed", "straight-leg", "straight leg"])) ||
    (normalizedFit === "long vertical line" &&
      keywordMatches(productText, ["high-rise", "high rise", "pointed", "straight-leg", "straight leg"])) ||
    (normalizedFit === "breathable" &&
      keywordMatches(productText, ["linen", "cotton", "lightweight"])) ||
    (normalizedFit === "structured but comfortable" &&
      ((["classy", "regular", "relaxed"].includes(product.fitType) &&
        keywordMatches(productText, ["tailored", "structured", "soft", "comfortable"])) ||
        keywordMatches(productText, ["merino", "cardigan", "quarter-zip", "lightweight blazer"]))) ||
    (normalizedFit === "clean drape" &&
      keywordMatches(productText, ["drape", "fluid", "tailored", "straight-leg", "straight leg"])) ||
    (normalizedFit === "longer layers" &&
      keywordMatches(productText, ["coat", "blazer", "cardigan", "trench", "longline", "overshirt"])) ||
    (normalizedFit === "oversized top with structured or slimmer bottom" &&
      ((product.category === "top" && ["relaxed", "oversized"].includes(product.fitType)) ||
        (product.category === "bottom" && ["slim", "classy", "regular"].includes(product.fitType)))) ||
    (normalizedFit === "belt if needed" &&
      keywordMatches(productText, ["belt", "wrap", "corset", "waist"])) ||
    (normalizedFit === "simple and clean" &&
      (["classy", "regular", "slim"].includes(product.fitType) ||
        keywordMatches(productText, ["clean", "tailored", "minimal"]))) ||
    (normalizedFit === "clean silhouette" &&
      (["classy", "regular", "slim"].includes(product.fitType) ||
        keywordMatches(productText, ["tailored", "straight-leg", "straight leg", "clean"]))) ||
    (normalizedFit === "clean and uncluttered" &&
      (["classy", "regular", "slim"].includes(product.fitType) ||
        keywordMatches(productText, ["clean", "minimal", "tailored"]))) ||
    (normalizedFit === "clean basics before trend pieces" &&
      keywordMatches(productText, ["tee", "shirt", "trouser", "jeans", "cardigan", "blazer"])) ||
    (normalizedFit === "fitted top" &&
      (product.category === "top" && ["slim", "classy"].includes(product.fitType))) ||
    (normalizedFit === "relaxed bottom" &&
      product.category === "bottom" &&
      ["relaxed", "regular"].includes(product.fitType))
  ) {
    return true;
  }

  return false;
}

function matchesPriorityMaterial(product: Product, materialSignal: string) {
  const text = buildProductSearchText(product);
  const normalizedMaterial = normalize(materialSignal);

  const materialKeywords: Record<string, string[]> = {
    "oxford cotton": ["oxford"],
    merino: ["merino"],
    cashmere: ["cashmere"],
    silk: ["silk", "satin"],
    "light silk": ["silk", "satin"],
    "matte satin": ["satin"],
    "silk texture": ["silk", "satin"],
    "satin-like matte texture": ["satin"],
    "wool blend": ["wool", "flannel"],
    "smooth wool": ["wool", "flannel"],
    "soft wool": ["wool", "flannel", "merino"],
    suede: ["suede"],
    linen: ["linen"],
    cotton: ["cotton", "oxford"],
    "cotton denim": ["denim", "jeans", "cotton"],
    "cotton blend": ["cotton"],
    "cotton-linen blend": ["linen", "cotton"],
    "linen blend": ["linen", "cotton"],
    "fine gauge knit": ["knit"],
    "cotton knit": ["knit"],
    "rib knit": ["ribbed", "knit"],
    "soft wool blend": ["wool", "merino", "flannel"],
    flannel: ["flannel"],
    "clean denim": ["denim", "jeans"],
    leather: ["leather"],
    "soft leather": ["leather"],
    "smooth leather": ["leather"],
    "soft tailoring": ["tailored", "blazer"],
    "structured suiting": ["blazer", "tailored", "suiting"],
    "structured cotton": ["cotton", "structured"],
    "natural fibers": ["cotton", "linen", "silk", "wool", "cashmere", "merino"],
    "textured neutrals": ["knit", "linen", "wool", "suede", "leather"],
    "soft knit": ["knit", "merino", "cashmere"],
    "gold-tone metal": ["gold", "metal"],
    "thrifted leather": ["leather"],
    "polished natural textures": ["leather", "merino", "wool", "cotton", "suede"],
    "budget-friendly natural feel": ["cotton", "merino", "oxford"],
  };

  return keywordMatches(text, materialKeywords[normalizedMaterial] ?? [normalizedMaterial]);
}

function matchesAvoidSignal(product: Product, signal: string) {
  const normalizedSignal = normalize(signal);
  const text = buildProductSearchText(product);
  const normalizedColors = product.colors.map(normalize);

  const avoidKeywords: Record<string, string[]> = {
    "visible logos": ["logo", "logos"],
    "loud branding": ["logo", "branding", "monogram"],
    "loud monograms": ["monogram"],
    "oversized branding": ["logo", "branding"],
    "brand-led statement pieces": ["logo", "graphic", "monogram"],
    "graphic tee": ["graphic"],
    hoodie: ["hoodie"],
    "gym sneaker": ["runner", "trainer", "gym sneaker"],
    "gym sneakers": ["runner", "trainer", "gym sneaker"],
    "chunky sneakers": ["chunky", "skate", "runner"],
    "chunky loud sneakers": ["chunky", "skate", "runner"],
    "patent leather shoes": ["patent", "glossy"],
    "patent finish": ["patent", "glossy"],
    "glossy synthetic": ["glossy", "synthetic", "nylon"],
    "shiny synthetic": ["synthetic", "glossy", "nylon"],
    "high-shine suiting": ["high-shine", "glossy"],
    "sport polo styling": ["sport"],
    "technical sportswear": ["technical", "sport"],
    "technical-looking fabric noise": ["technical", "nylon"],
    "sport-golf styling": ["sport", "golf"],
    "hype-sneaker energy": ["chunky", "skate", "runner"],
    "distressed denim": ["distress", "rips", "whisker", "faded"],
    "heavy fading": ["faded"],
    "skinny jeans": ["skinny"],
    "extra slim pants": ["extra slim"],
    "trend-heavy leg shape": ["skinny"],
    "shiny faux leather": ["glossy", "patent"],
    "loud rocker styling": ["studded", "graphic"],
    "over-layered costume energy": ["graphic", "contrast"],
    "costume energy": ["graphic", "contrast"],
    "cheap shiny satin": ["satin", "glossy", "shiny"],
    "cheap shine": ["glossy", "shiny", "plastic"],
    "cheap shiny polyester": ["polyester", "glossy", "shiny"],
    "plastic sheen": ["plastic", "glossy", "shiny"],
    "plastic-looking synthetic": ["plastic", "synthetic", "glossy", "shiny"],
    "shiny synthetic jersey": ["synthetic", "glossy", "shiny", "jersey"],
    "busy print": ["print", "pattern"],
    "high-contrast loud pattern": ["print", "pattern", "contrast"],
    "too many accent colors": [],
    "accessory overload": [],
    "overwhelming oversized bag": ["weekender", "oversized bag"],
    "oversized bag": ["weekender", "oversized bag"],
    "oversized tote": ["oversized tote", "huge tote", "giant tote", "weekender"],
    "awkward knee-length skirt": ["knee-length", "knee length"],
    "low-rise": ["low-rise", "low rise"],
    "clubwear shine": ["satin", "glossy", "shiny"],
    "clubwear top": ["corset", "club", "bodycon"],
    "party cami": ["cami", "party", "club", "satin"],
    "club heel": ["platform", "stiletto", "metallic heel", "sparkle heel"],
    "nightlife styling": ["bodycon", "club", "glitter"],
    "junior costume styling": ["graphic", "novelty", "glitter"],
    "trend clutter": ["graphic", "novelty", "contrast"],
    "overdesigned basics": ["cargo", "utility", "contrast stitch", "panel", "graphic"],
    "logo-heavy accessory": ["logo", "monogram", "branding"],
    "too casual to feel polished": ["cargo", "utility", "runner", "sport", "clip", "pouch"],
    "random trend stacking": ["cargo", "utility", "graphic", "contrast stitch", "sequin"],
    "fake luxury cues": ["plastic", "glossy", "shiny", "novelty"],
    "trying too hard": ["graphic", "sequin", "glitter", "novelty"],
    "trying too hard with add-ons": ["clip", "pouch", "novelty"],
    "costume-office energy": ["contrast stitch", "graphic", "night", "sequin"],
    "boxy without balance": ["boxy", "oversized"],
    "boxy oversized layer with no waist control": ["boxy", "oversized blazer", "oversized layer"],
    "heavy swallowed frame": ["boxy", "oversized coat", "oversized blazer"],
    "sloppy oversized all-over": ["oversized", "baggy"],
    "sloppy oversized shirt with wide pant and no structure": ["oversized shirt", "wide-leg", "wide leg", "baggy"],
    "undefined waist": ["boxy", "shift"],
    "double-oversized proportion": ["oversized", "baggy"],
    "bodycon club dress": ["bodycon", "club", "glitter"],
    "ultra-bright satin": ["satin", "neon", "bright"],
    "plastic-shine satin": ["satin", "glossy", "shiny"],
    "heavy stiff maxi with bulky knit": ["bulky", "maxi", "heavy knit"],
    "harsh busy print": ["print", "pattern", "contrast"],
    "frumpy heaviness": ["bulky", "heavy"],
    "swallowed silhouette": ["boxy", "oversized"],
    "unintentional shapelessness": ["shapeless", "boxy", "oversized"],
    "all-soft no structure": ["draped", "soft"],
    "all-rigid no softness": ["stiff", "boxy", "rigid"],
    "one-note styling": ["uniform", "flat"],
    "plastic shine": ["plastic", "glossy", "shiny"],
    "synthetic shine": ["synthetic", "glossy", "shiny"],
    "harsh synthetic brights": ["neon", "bright", "synthetic"],
    "color overload": [],
    "cheap-looking statement branding": ["logo", "branding", "monogram"],
    "cheap plastic accessory finish": ["plastic", "acrylic"],
    "luxury-only expectation": [],
    "over-matching": [],
    "over-accessorizing": [],
    "sloppy wrinkled garment": [],
    "messy presentation": [],
    "too many themed pieces": [],
    "too many matching signals": [],
  };

  if (
    normalizedSignal === "more than 3 colors" ||
    normalizedSignal === "overly bright saturated shirt colors"
  ) {
    return normalizedColors.length > 3;
  }

  if (normalizedSignal === "clashing leather tones") {
    return product.category === "accessory" && !keywordMatches(text, ["belt", "watch", "bag"]);
  }

  return keywordMatches(text, avoidKeywords[normalizedSignal] ?? [normalizedSignal]);
}

function parseHeightToInches(height?: string | null) {
  const normalizedHeight = normalize(height);

  if (!normalizedHeight) {
    return null;
  }

  const feetInchesMatch = normalizedHeight.match(/(\d+)\s*['ft]+\s*(\d+)?/);

  if (feetInchesMatch) {
    const feet = Number(feetInchesMatch[1] ?? 0);
    const inches = Number(feetInchesMatch[2] ?? 0);

    if (!Number.isNaN(feet) && !Number.isNaN(inches)) {
      return feet * 12 + inches;
    }
  }

  const centimeterMatch = normalizedHeight.match(/(\d+(?:\.\d+)?)\s*cm/);

  if (centimeterMatch) {
    const centimeters = Number(centimeterMatch[1]);

    if (!Number.isNaN(centimeters)) {
      return centimeters / 2.54;
    }
  }

  return null;
}

function inferBodyOrFitSignal(answers: QuizAnswers) {
  const normalizedBodyType = normalize(answers.bodyType);

  if (normalizedBodyType.includes("petite")) {
    return "petite";
  }

  const heightInches = parseHeightToInches(answers.height);

  if (heightInches && heightInches <= 64) {
    return "petite";
  }

  return "";
}

function scoreProductAgainstStyleRules(
  product: Product,
  rules: StyleRule[],
  budgetCap: number | null,
) {
  if (rules.length === 0) {
    return {
      score: 0,
      matchedRuleNames: [],
      matchReasons: [],
      avoidHits: [],
    } satisfies StyleRuleProductSignal;
  }

  const matchedRuleNames = new Set<string>();
  const matchReasons = new Set<string>();
  const avoidHits = new Set<string>();
  let score = 0;
  const categoryTarget = budgetTargetForCategory(product.category, budgetCap);

  for (const rule of rules) {
    let localScore = 0;

    const prioritizedItemHit = rule.prioritize.items.some((signal) =>
      matchesPrioritySignal(product, signal),
    );
    const prioritizedColorHit = rule.prioritize.colors.some((signal) =>
      matchesPriorityColor(product, signal),
    );
    const prioritizedFitHit = rule.prioritize.fits.some((signal) =>
      matchesPriorityFit(product, signal),
    );
    const prioritizedMaterialHit = rule.prioritize.materials.some((signal) =>
      matchesPriorityMaterial(product, signal),
    );
    const prioritizedShoeHit = rule.prioritize.shoes.some((signal) =>
      matchesPrioritySignal(product, signal),
    );
    const prioritizedAccessoryHit = rule.prioritize.accessories.some((signal) =>
      matchesPrioritySignal(product, signal),
    );

    if (prioritizedItemHit) {
      localScore += 2;
    }

    if (prioritizedColorHit) {
      localScore += 1;
    }

    if (prioritizedFitHit) {
      localScore += 1;
    }

    if (prioritizedMaterialHit) {
      localScore += 1;
    }

    if (prioritizedShoeHit) {
      localScore += product.category === "shoes" ? 2 : 1;
    }

    if (prioritizedAccessoryHit) {
      localScore += product.category === "accessory" ? 2 : 1;
    }

    if (
      rule.id === "budget-100-200-core-outfit" &&
      budgetCap &&
      coreCategories.includes(product.category) &&
      categoryTarget &&
      product.price <= categoryTarget * 1.03
    ) {
      localScore += 2;
    }

    const localAvoidHits = [
      ...rule.avoid.items,
      ...rule.avoid.colors,
      ...rule.avoid.fits,
      ...rule.avoid.materials,
      ...rule.avoid.styleSignals,
    ].filter((signal) => matchesAvoidSignal(product, signal));

    if (localAvoidHits.length > 0) {
      localScore -= Math.min(4, localAvoidHits.length * 2);
      localAvoidHits.forEach((signal) => avoidHits.add(signal));
    }

    if (localScore > 0) {
      matchedRuleNames.add(rule.name);
      matchReasons.add(rule.matchReason);
    }

    score += Math.max(-4, Math.min(4, localScore));
  }

  return {
    score: Math.max(-12, Math.min(16, score)),
    matchedRuleNames: Array.from(matchedRuleNames),
    matchReasons: Array.from(matchReasons).slice(0, 4),
    avoidHits: Array.from(avoidHits),
  } satisfies StyleRuleProductSignal;
}

export function budgetCapFromRange(range?: string | null) {
  const normalized = normalize(range);

  if (!normalized) {
    return null;
  }

  if (normalized === "under $100") {
    return 100;
  }

  if (normalized === "$100-$200") {
    return 200;
  }

  if (normalized === "$200-$350") {
    return 350;
  }

  if (normalized === "$350+") {
    return 550;
  }

  return null;
}

function budgetTargetForCategory(category: ProductCategory, budgetCap: number | null) {
  if (!budgetCap) {
    return null;
  }

  if (category === "outerwear") {
    return budgetCap <= 200 ? budgetCap * 0.24 : budgetCap * 0.3;
  }

  if (category === "accessory") {
    return budgetCap <= 200 ? budgetCap * 0.1 : budgetCap * 0.16;
  }

  if (category === "shoes") {
    return budgetCap <= 200 ? budgetCap * 0.32 : budgetCap * 0.24;
  }

  return budgetCap <= 200 ? budgetCap * 0.28 : budgetCap * 0.22;
}

type BudgetThresholds = {
  withinMax: number;
  nearMax: number;
  stretchMax: number;
  hardMax: number;
};

function getBudgetThresholds(budgetCap: number | null): BudgetThresholds | null {
  if (!budgetCap) {
    return null;
  }

  if (budgetCap <= 100) {
    return {
      withinMax: budgetCap,
      nearMax: Math.round(budgetCap * 1.12),
      stretchMax: Math.round(budgetCap * 1.3),
      hardMax: Math.round(budgetCap * 1.42),
    };
  }

  if (budgetCap <= 200) {
    return {
      withinMax: budgetCap,
      nearMax: Math.round(budgetCap * 1.15),
      stretchMax: Math.round(budgetCap * 1.4),
      hardMax: Math.round(budgetCap * 1.55),
    };
  }

  if (budgetCap <= 350) {
    return {
      withinMax: budgetCap,
      nearMax: Math.round(budgetCap * 1.12),
      stretchMax: Math.round(budgetCap * 1.3),
      hardMax: Math.round(budgetCap * 1.42),
    };
  }

  return {
    withinMax: budgetCap,
    nearMax: Math.round(budgetCap * 1.1),
    stretchMax: Math.round(budgetCap * 1.24),
    hardMax: Math.round(budgetCap * 1.34),
  };
}

export function classifyBudgetMatch(totalPrice: number, budgetCap: number | null): BudgetMatchLabel {
  const thresholds = getBudgetThresholds(budgetCap);

  if (!thresholds) {
    return "Near budget";
  }

  if (totalPrice <= thresholds.withinMax) {
    return "Within budget";
  }

  if (totalPrice <= thresholds.nearMax) {
    return "Near budget";
  }

  if (totalPrice <= thresholds.stretchMax) {
    return "Stretch upgrade";
  }

  return "Over budget";
}

function getBudgetAnchorItem(items: Product[]) {
  const outerwear = items.find((item) => item.category === "outerwear");
  if (outerwear && keywordMatches(normalize(outerwear.name), ["blazer", "coat", "cardigan", "trench"])) {
    return outerwear;
  }

  const shoes = items.find((item) => item.category === "shoes");
  if (shoes) {
    return shoes;
  }

  return [...items].sort((left, right) => right.price - left.price)[0];
}

function getBudgetUpgradeReason(items: Product[]) {
  const anchorItem = getBudgetAnchorItem(items);
  const itemText = normalize(`${anchorItem.name} ${anchorItem.styleNotes}`);

  if (anchorItem.category === "shoes") {
    return "higher-quality shoes complete the look while staying close to your brief.";
  }

  if (
    anchorItem.category === "outerwear" &&
    keywordMatches(itemText, ["blazer", "coat", "cardigan", "trench"])
  ) {
    return "the blazer improves the silhouette and quiet-luxury feel.";
  }

  if (
    anchorItem.category === "bottom" &&
    keywordMatches(itemText, ["trouser", "trousers", "chino", "skirt"])
  ) {
    return "the tailored bottom sharpens the silhouette and keeps the look more refined.";
  }

  if (
    anchorItem.category === "top" &&
    keywordMatches(itemText, ["silk", "merino", "cashmere", "knit", "button", "blazer"])
  ) {
    return "the elevated top adds polish and a more premium finish.";
  }

  return "the stronger finishing piece keeps the outfit aligned to your brief.";
}

function getRequiredSize(product: Product, answers: QuizAnswers) {
  if (product.category === "top" || product.category === "outerwear") {
    return normalize(answers.topSize);
  }

  if (product.category === "bottom") {
    return normalize(answers.bottomSize);
  }

  if (product.category === "shoes") {
    return normalize(answers.shoeSize);
  }

  return "";
}

function getSizeSignal(product: Product, answers: QuizAnswers) {
  if (product.category === "accessory") {
    return { score: 0, exact: true, reason: "" };
  }

  const requestedSize = getRequiredSize(product, answers);

  if (!requestedSize) {
    return { score: 0, exact: true, reason: "" };
  }

  const hasSize = product.availableSizes.map((size) => normalize(size)).includes(requestedSize);

  return {
    score: hasSize ? 5 : -10,
    exact: hasSize,
    reason: hasSize ? "Available in your saved size range" : "",
  };
}

function getTagSignal<T extends string>(
  selected: T | "",
  tags: T[],
  fallbacks: Record<T, T[]>,
  exactReason: string,
  fallbackReason: string,
) {
  if (!selected) {
    return {
      score: 0,
      exact: true,
      matchedExact: false,
      matchedFallback: false,
      reason: "",
    };
  }

  if (tags.includes(selected)) {
    return {
      score: 16,
      exact: true,
      matchedExact: true,
      matchedFallback: false,
      reason: exactReason,
    };
  }

  const related = fallbacks[selected] ?? [];

  if (tags.some((tag) => related.includes(tag))) {
    return {
      score: 6,
      exact: false,
      matchedExact: false,
      matchedFallback: true,
      reason: fallbackReason,
    };
  }

  return {
    score: -8,
    exact: false,
    matchedExact: false,
    matchedFallback: false,
    reason: "",
  };
}

function stylePreferenceScore(product: Product, preference: StylePreference | "") {
  if (!preference) {
    return { score: 0, reason: "" };
  }

  const explicitMatch = product.stylePreferences.includes(preference);
  const openToAll = product.stylePreferences.includes("mixed / open to all");

  if (explicitMatch) {
    return {
      score: preference === "mixed / open to all" ? 2 : 7,
      reason: "Supports your style preference",
    };
  }

  if (openToAll) {
    return {
      score:
        preference === "mixed / open to all" || preference === "androgynous" ? 2 : -8,
      reason:
        preference === "mixed / open to all" || preference === "androgynous"
          ? "Keeps the styling open and flexible"
          : "",
    };
  }

  return {
    score:
      preference === "mixed / open to all" || preference === "androgynous" ? -1 : -10,
    reason: "",
  };
}

function fitScore(product: Product, fitPreference: FitPreference | "") {
  if (!fitPreference) {
    return { score: 0, reason: "", exact: true, aligned: true };
  }

  if (product.fitType === fitPreference) {
    return {
      score: 6,
      reason: `Leans ${formatLabel(fitPreference)} like you asked`,
      exact: true,
      aligned: true,
    };
  }

  if (relatedFits[fitPreference]?.includes(product.fitType)) {
    return {
      score: 3,
      reason: `Keeps a ${formatLabel(product.fitType)} silhouette close to your ${formatLabel(fitPreference)} preference`,
      exact: false,
      aligned: true,
    };
  }

  return { score: -3, reason: "", exact: false, aligned: false };
}

function colorScore(product: Product, preferredColors: string[], avoidedColors: string[]) {
  const preferredFamilies = getPreferredColorFamilies(preferredColors);
  const matchedPreferredColors = product.colors.filter((color) =>
    preferredColors.includes(normalize(color)),
  );
  const matchedAvoidColors = product.colors.filter((color) =>
    avoidedColors.includes(normalize(color)),
  );
  const matchedPreferredFamily = preferredFamilies.includes(product.colorFamily);

  let score = matchedPreferredColors.length * 5 - matchedAvoidColors.length * 10;

  if (matchedPreferredColors.length === 0 && matchedPreferredFamily) {
    score += 3;
  }

  if (
    preferredColors.length > 0 &&
    matchedPreferredColors.length === 0 &&
    !matchedPreferredFamily &&
    product.colorFamily === "neutral"
  ) {
    score += 1;
  }

  if (avoidedColors.length > 0 && matchedAvoidColors.length === 0) {
    score += 1;
  }

  return {
    score,
    matchedPreferredColors,
    matchedAvoidColors,
    matchedPreferredFamily,
    reason:
      matchedPreferredColors.length > 0
        ? `Uses your preferred ${formatLabel(matchedPreferredColors[0])} palette`
        : matchedPreferredFamily
          ? `Stays inside your preferred ${formatLabel(product.colorFamily)} palette family`
        : "",
  };
}

function storeScore(product: Product, preferredStores: string[]) {
  const matchedStores = preferredStores.filter((store) => normalize(product.store) === store);

  return {
    score: matchedStores.length > 0 ? 5 : preferredStores.length > 0 ? -2 : 0,
    matchedStores,
    reason: matchedStores.length > 0 ? `Pulls from a store you already like: ${product.store}` : "",
  };
}

function budgetScore(product: Product, budgetCap: number | null) {
  const target = budgetTargetForCategory(product.category, budgetCap);

  if (!target) {
    return { score: 0, reason: "" };
  }

  if (product.price >= target * 0.45 && product.price <= target * 0.95) {
    return { score: 7, reason: "Lands close to the ideal spend for this category" };
  }

  if (product.price <= target) {
    return { score: 5, reason: "Keeps the outfit budget realistic" };
  }

  if (product.price <= target * 1.08) {
    return { score: 2, reason: "Still sits close to the spend target" };
  }

  if (product.price <= target * 1.18) {
    return { score: -2, reason: "" };
  }

  return { score: -10, reason: "" };
}

function scoreProduct(
  product: Product,
  answers: QuizAnswers,
  matchedStyleRules: StyleRule[],
): ScoredProduct {
  const preferredColors = splitCommaSeparated(answers.preferredColors);
  const avoidedColors = splitCommaSeparated(answers.avoidColors);
  const preferredStores = splitCommaSeparated(answers.storesLike);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const aestheticLabel = formatAestheticLabel(answers.aesthetic, answers.stylePreference);

  const aestheticSignal = getTagSignal(
    answers.aesthetic,
    product.aestheticTags,
    fallbackAesthetics,
    `Matches your ${aestheticLabel} aesthetic`,
    `Leans close to your ${aestheticLabel} aesthetic`,
  );
  const occasionSignal = getTagSignal(
    answers.occasion,
    product.occasionTags,
    fallbackOccasions,
    `Fits your ${formatLabel(answers.occasion)} occasion`,
    `Works as a close fit for your ${formatLabel(answers.occasion)} moment`,
  );
  const sizeSignal = getSizeSignal(product, answers);
  const fitSignal = fitScore(product, answers.fitPreference);
  const styleSignal = stylePreferenceScore(product, answers.stylePreference);
  const colorSignal = colorScore(product, preferredColors, avoidedColors);
  const storeSignal = storeScore(product, preferredStores);
  const budgetSignal = budgetScore(product, budgetCap);
  const styleRuleSignal = scoreProductAgainstStyleRules(product, matchedStyleRules, budgetCap);

  const creatorAlignmentScore =
    (product.aestheticTags.includes("creator/photoshoot") ? 3 : 0) +
    product.occasionTags.filter((tag) => creatorMomentSet.has(tag)).length;

  const matchReasons = [
    aestheticSignal.reason,
    occasionSignal.reason,
    fitSignal.reason,
    styleSignal.reason,
    colorSignal.reason,
    storeSignal.reason,
    sizeSignal.reason,
    budgetSignal.reason,
    ...styleRuleSignal.matchReasons,
  ].filter(Boolean);

  return {
    product,
    score:
      aestheticSignal.score +
      occasionSignal.score +
      sizeSignal.score +
      fitSignal.score +
      styleSignal.score +
      colorSignal.score +
      storeSignal.score +
      budgetSignal.score +
      styleRuleSignal.score +
      creatorAlignmentScore,
    styleRuleBoost: styleRuleSignal.score,
    exactAesthetic: aestheticSignal.matchedExact,
    exactOccasion: occasionSignal.matchedExact,
    fallbackAesthetic: aestheticSignal.matchedFallback,
    fallbackOccasion: occasionSignal.matchedFallback,
    sizeExact: sizeSignal.exact,
    fitExact: fitSignal.exact,
    fitAligned: fitSignal.aligned,
    matchedPreferredColors: colorSignal.matchedPreferredColors,
    matchedPreferredFamily: colorSignal.matchedPreferredFamily,
    matchedStores: storeSignal.matchedStores,
    matchReasons,
    matchedStyleRuleNames: styleRuleSignal.matchedRuleNames,
    styleRuleReasons: styleRuleSignal.matchReasons,
    styleRuleAvoidHits: styleRuleSignal.avoidHits,
    creatorAlignmentScore,
  };
}

function pickPool(category: ProductCategory, answers: QuizAnswers, matchedStyleRules: StyleRule[]) {
  return products
    .filter((product) => product.category === category)
    .map((product) => scoreProduct(product, answers, matchedStyleRules))
    .sort((left, right) => right.score - left.score || left.product.price - right.product.price)
    .slice(0, poolSizes[category]);
}

function uniqueColors(items: Product[]) {
  return Array.from(new Set(items.flatMap((item) => item.colors))).slice(0, 5);
}

function uniqueColorFamilies(items: Product[]) {
  return Array.from(new Set(items.map((item) => item.colorFamily)));
}

function buildName(
  aesthetic: Aesthetic,
  occasion: Occasion,
  stylePreference: StylePreference | "",
  index: number,
) {
  const key = `${aesthetic}|${occasion}`;
  const names: Record<string, string> = {
    "old money|date": "Old Money Dinner Look",
    "streetwear|reels": "Streetwear Reel Fit",
    "minimalist|date": "Minimalist Coffee Date",
    "clean girl|daily wear":
      stylePreference === "feminine" ? "Clean Girl Everyday" : "Clean Minimal Everyday",
    "smart casual|college": "College Smart Casual Edit",
    "office|office": "Office Smart Casual",
    "party|party": "Party Night Outfit",
    "date night|date": "Date Night Espresso Edit",
    "travel|travel": "Airport Travel Look",
    "creator/photoshoot|brand content": "Brand Shoot Neutral Fit",
    "creator/photoshoot|photoshoot": "Creator Shoot Outfit Pack",
    "luxury neutral|wedding guest": "Luxury Neutral Event Look",
    "gym casual|daily wear": "Gym Casual Everyday Set",
  };

  const baseAestheticLabel = formatAestheticLabel(aesthetic, stylePreference);
  const baseName = names[key] ?? `${baseAestheticLabel} ${formatLabel(occasion)} Look`;

  return index === 0 ? baseName : `${baseName} ${index + 1}`;
}

function buildBudgetMatch(items: Product[], budgetCap: number | null) {
  if (!budgetCap) {
    return {
      label: "Near budget" as BudgetMatchLabel,
      note: "You left the budget flexible, so FitMuse prioritized overall match quality instead of a strict spend cap.",
    };
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const budgetLabel = classifyBudgetMatch(totalPrice, budgetCap);
  const budgetTargetLabel = formatLabel(budgetLabelFromCap(budgetCap));
  const stretchReason = getBudgetUpgradeReason(items);
  const compactBundle = items.length <= 4;

  if (budgetLabel === "Within budget") {
    return {
      label: budgetLabel,
      note: compactBundle
        ? `This look stays inside your ${budgetTargetLabel} target by focusing on the core pieces first.`
        : `This look stays inside your ${budgetTargetLabel} target while still feeling complete.`,
    };
  }

  if (budgetLabel === "Near budget") {
    return {
      label: budgetLabel,
      note: `Near budget: ${stretchReason.charAt(0).toUpperCase()}${stretchReason.slice(1)}`,
    };
  }

  if (budgetLabel === "Stretch upgrade") {
    return {
      label: budgetLabel,
      note: `Stretch upgrade: ${stretchReason.charAt(0).toUpperCase()}${stretchReason.slice(1)}`,
    };
  }

  return {
    label: budgetLabel,
    note: `Over budget: ${stretchReason.charAt(0).toUpperCase()}${stretchReason.slice(1)} FitMuse kept it only because the style match stayed unusually strong.`,
  };
}

function buildCreatorUseCase(occasion: Occasion) {
  const labels: Record<Occasion, string> = {
    reels: "Best for creator reels, transitions, and fast-turn content days.",
    photoshoot: "Best for styled photoshoots, editorial sets, and campaign content.",
    date: "Best for dinner dates, rooftop drinks, and polished evening plans.",
    party: "Best for event nights, nightlife plans, and sharper going-out looks.",
    college: "Best for campus days, coffee runs, and everyday student styling.",
    office: "Works well for office days, client meetings, and smart casual work settings.",
    travel: "Useful for airport days, travel transfers, and easy arrival looks.",
    "wedding guest": "Best for guest dressing that still feels realistic to shop.",
    "daily wear": "Best for everyday styling when you still want the look to feel complete.",
    "brand content": "Best for sponsor shoots, product seeding, and creator-ready brand moments.",
  };

  return labels[occasion];
}

function buildFitNote(items: Product[], answers: QuizAnswers) {
  const topFit = items.find((item) => item.category === "top")?.fitType ?? "regular";
  const bottomFit = items.find((item) => item.category === "bottom")?.fitType ?? "regular";
  const sizeSummary =
    answers.topSize && answers.bottomSize
      ? `around your ${answers.topSize}/${answers.bottomSize} saved sizes`
      : "around your saved size brief";

  return `${formatLabel(topFit)} volume on top with ${formatLabel(bottomFit)} balance below keeps the silhouette camera-friendly ${sizeSummary}.`;
}

function buildWhyItWorks(items: Product[], answers: QuizAnswers, matchedColors: string[]) {
  const palette = uniqueColors(items);
  const leadStores = Array.from(new Set(items.map((item) => item.store))).slice(0, 2);

  if (matchedColors.length > 0) {
    return `${formatLabel(matchedColors[0])} tones keep the outfit aligned to your brief while ${leadStores.join(" + ")} adds a multi-store styled feel.`;
  }

  return `${palette.slice(0, 3).map(formatLabel).join(", ")} tones keep the outfit cohesive while ${leadStores.join(" + ")} gives it a polished multi-store finish.`;
}

function buildPriceBreakdown(items: Product[]): RecommendationPriceLineItem[] {
  const orderedCategories: ProductCategory[] = ["top", "bottom", "shoes", "accessory", "outerwear"];

  return orderedCategories
    .map((category) => items.find((item) => item.category === category))
    .filter(Boolean)
    .map((item) => ({
      label: formatLabel(item!.category),
      itemName: item!.name,
      price: item!.price,
    }));
}

function buildOccasionMatchLabel(productEntries: ScoredProduct[]) {
  const exactOccasionCount = productEntries.filter((entry) => entry.exactOccasion).length;
  const fallbackOccasionCount = productEntries.filter((entry) => entry.fallbackOccasion).length;

  if (exactOccasionCount >= 2) {
    return "High occasion match";
  }

  if (exactOccasionCount >= 1 || fallbackOccasionCount >= 1) {
    return "Good occasion match";
  }

  return "Flexible occasion match";
}

function buildStyleMatchLabel(productEntries: ScoredProduct[]) {
  const exactAestheticCount = productEntries.filter((entry) => entry.exactAesthetic).length;
  const fallbackAestheticCount = productEntries.filter((entry) => entry.fallbackAesthetic).length;

  if (exactAestheticCount >= 2) {
    return "High style match";
  }

  if (exactAestheticCount >= 1 || fallbackAestheticCount >= 1) {
    return "Good style match";
  }

  return "Closest style match";
}

function buildColorHarmonyLabel(
  items: Product[],
  matchedColors: string[],
  productEntries: ScoredProduct[],
) {
  const familyCount = new Set(items.map((item) => item.colorFamily)).size;
  const matchedPreferredFamilyCount = productEntries.filter(
    (entry) => entry.matchedPreferredFamily,
  ).length;

  if (matchedColors.length > 0 && familyCount <= 2) {
    return "Strong color harmony";
  }

  if (matchedColors.length > 0 || matchedPreferredFamilyCount >= 2 || familyCount <= 3) {
    return "Balanced color harmony";
  }

  return "Directional palette mix";
}

function buildFitConfidenceLabel(productEntries: ScoredProduct[]) {
  const fitExactCount = productEntries.filter((entry) => entry.fitExact).length;
  const fitAlignedCount = productEntries.filter((entry) => entry.fitAligned).length;
  const sizeExactCount = productEntries.filter((entry) => entry.sizeExact).length;

  if (fitExactCount >= 2 && sizeExactCount >= Math.max(3, productEntries.length - 1)) {
    return "High fit confidence";
  }

  if (fitAlignedCount >= 2) {
    return "Good fit confidence";
  }

  return "Exploratory fit confidence";
}

function buildSizeCompatibilityLabel(productEntries: ScoredProduct[], answers: QuizAnswers) {
  const sizeExactCount = productEntries.filter((entry) => entry.sizeExact).length;
  const requestedAnySize = Boolean(answers.topSize || answers.bottomSize || answers.shoeSize);

  if (!requestedAnySize) {
    return "Open size mix";
  }

  if (sizeExactCount === productEntries.length) {
    return "All saved sizes available";
  }

  if (sizeExactCount >= Math.max(2, productEntries.length - 1)) {
    return "Mostly size-compatible";
  }

  return "Some size guesswork";
}

function buildStoreMatchLabel(productEntries: ScoredProduct[], answers: QuizAnswers) {
  const matchedStoreCount = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStores)),
  ).length;
  const preferredStores = splitCommaSeparated(answers.storesLike);
  const storeCount = new Set(productEntries.map((entry) => entry.product.store)).size;

  if (matchedStoreCount >= 2) {
    return "Preferred store match";
  }

  if (matchedStoreCount === 1) {
    return "Partial store match";
  }

  if (preferredStores.length === 0) {
    return storeCount <= 2 ? "Tight store mix" : "Open-store mix";
  }

  return "Mixed-store match";
}

function buildFitTags(items: Product[], answers: QuizAnswers) {
  const tags = new Set<string>();
  const heightInches = parseHeightToInches(answers.height);
  const itemText = normalize(items.map((item) => `${item.name} ${item.styleNotes}`).join(" "));

  if (answers.fitPreference) {
    tags.add(`${formatLabel(answers.fitPreference)} fit`);
  }

  if (inferBodyOrFitSignal(answers) === "petite") {
    tags.add("Petite-friendly");
  } else if (heightInches && heightInches >= 71) {
    tags.add("Tall-friendly");
  }

  if (
    (answers.topSize && ["xl", "xxl"].includes(normalize(answers.topSize))) ||
    (answers.bottomSize && ["xl", "xxl"].includes(normalize(answers.bottomSize)))
  ) {
    tags.add("Plus-size available");
  }

  if (answers.occasion === "office" || answers.occasion === "brand content") {
    tags.add("Work-safe");
  }

  if (
    answers.occasion === "travel" ||
    keywordMatches(itemText, ["sneaker", "cardigan", "layer", "lightweight", "relaxed"])
  ) {
    tags.add("Travel-friendly");
  }

  if (!keywordMatches(itemText, ["silk", "suede", "cashmere", "dry clean", "delicate"])) {
    tags.add("Low-maintenance fabric");
  }

  return Array.from(tags).slice(0, 4);
}

function buildStylingSummary(
  answers: QuizAnswers,
  budgetLabel: BudgetMatchLabel,
  matchedColors: string[],
  items: Product[],
) {
  const aestheticLabel = answers.aesthetic
    ? formatAestheticLabel(answers.aesthetic, answers.stylePreference).toLowerCase()
    : "style-led";
  const fitLabel = answers.fitPreference
    ? `${formatLabel(answers.fitPreference).toLowerCase()} fit`
    : "balanced fit";
  const colorLabel =
    matchedColors.length > 0
      ? `${formatLabel(matchedColors[0]).toLowerCase()}-led palette`
      : `${uniqueColors(items)[0] ? formatLabel(uniqueColors(items)[0]).toLowerCase() : "neutral"} palette`;
  const budgetVoice =
    budgetLabel === "Within budget"
      ? "built to stay inside budget"
      : budgetLabel === "Near budget"
        ? "kept close to budget"
        : budgetLabel === "Stretch upgrade"
          ? "with one stretch-upgrade move"
          : "with a deliberate over-budget tradeoff";

  return `${aestheticLabel} board with a ${fitLabel}, ${colorLabel}, and ${budgetVoice}.`;
}

function getSwapReferenceItem(items: Product[], mode: OutfitSmartSwap["type"]) {
  const coreItems = items.filter((item) => item.category !== "accessory");

  if (mode === "cheaper" || mode === "premium") {
    return [...coreItems].sort((left, right) => right.price - left.price)[0] ?? items[0];
  }

  if (mode === "casual") {
    return (
      items.find((item) => item.category === "shoes" && keywordMatches(normalize(item.name), ["loafer", "boot", "heel"])) ??
      items.find((item) => item.category === "outerwear") ??
      items.find((item) => item.category === "top") ??
      items[0]
    );
  }

  return (
    items.find((item) => item.category === "shoes" && keywordMatches(normalize(item.name), ["sneaker"])) ??
    items.find((item) => item.category === "top" && keywordMatches(normalize(item.name), ["tee", "t-shirt", "shirt"])) ??
    items.find((item) => item.category === "bottom" && keywordMatches(normalize(item.name), ["denim", "jeans"])) ??
    items[0]
  );
}

function isCasualSignal(product: Product) {
  return keywordMatches(buildProductSearchText(product), [
    "sneaker",
    "sneakers",
    "tee",
    "t-shirt",
    "t shirt",
    "denim",
    "jeans",
    "relaxed",
    "bomber",
    "cardigan",
  ]);
}

function isDressySignal(product: Product) {
  return keywordMatches(buildProductSearchText(product), [
    "loafer",
    "loafers",
    "heel",
    "heels",
    "chelsea",
    "blazer",
    "tailored",
    "trouser",
    "trousers",
    "silk",
    "merino",
    "cashmere",
  ]);
}

function findSmartSwap(
  mode: OutfitSmartSwap["type"],
  items: Product[],
  answers: QuizAnswers,
  matchedStyleRules: StyleRule[],
) {
  const reference = getSwapReferenceItem(items, mode);

  if (!reference) {
    return null;
  }

  const referenceScore = scoreProduct(reference, answers, matchedStyleRules).score;
  const candidates = products
    .filter((product) => product.category === reference.category && product.id !== reference.id)
    .map((product) => scoreProduct(product, answers, matchedStyleRules))
    .filter((entry) => {
      if (mode === "cheaper") {
        return entry.product.price < reference.price - 8 && entry.score >= referenceScore - 8;
      }

      if (mode === "premium") {
        return entry.product.price > reference.price + 8 && entry.score >= referenceScore - 4;
      }

      if (mode === "casual") {
        return isCasualSignal(entry.product) && entry.score >= referenceScore - 6;
      }

      return isDressySignal(entry.product) && entry.score >= referenceScore - 6;
    })
    .sort((left, right) => {
      if (mode === "cheaper") {
        return left.product.price - right.product.price || right.score - left.score;
      }

      if (mode === "premium") {
        return right.score - left.score || left.product.price - right.product.price;
      }

      return right.score - left.score || left.product.price - right.product.price;
    });

  const candidate = candidates[0]?.product;

  if (!candidate) {
    return null;
  }

  const priceDelta = candidate.price - reference.price;

  if (mode === "cheaper") {
    return {
      type: mode,
      label: "Cheaper swap",
      suggestion: `Swap ${reference.name} for ${candidate.name}.`,
      reason: `Saves about ${formatCurrency(Math.abs(priceDelta))} while keeping the board close to your brief.`,
      priceDelta,
    } satisfies OutfitSmartSwap;
  }

  if (mode === "premium") {
    return {
      type: mode,
      label: "More premium swap",
      suggestion: `Upgrade ${reference.name} to ${candidate.name}.`,
      reason: `Adds a stronger finishing piece for about ${formatCurrency(Math.abs(priceDelta))} more.`,
      priceDelta,
    } satisfies OutfitSmartSwap;
  }

  if (mode === "casual") {
    return {
      type: mode,
      label: "More casual swap",
      suggestion: `Trade ${reference.name} for ${candidate.name}.`,
      reason: "Softens the look into a more everyday version without losing the overall vibe.",
      priceDelta,
    } satisfies OutfitSmartSwap;
  }

  return {
    type: mode,
    label: "More dressy swap",
    suggestion: `Trade ${reference.name} for ${candidate.name}.`,
    reason: "Sharpens the outfit for a more elevated occasion finish.",
    priceDelta,
  } satisfies OutfitSmartSwap;
}

function buildSmartSwaps(
  items: Product[],
  answers: QuizAnswers,
  matchedStyleRules: StyleRule[],
) {
  return (["cheaper", "premium", "casual", "dressy"] as const)
    .map((mode) => findSmartSwap(mode, items, answers, matchedStyleRules))
    .filter(Boolean) as OutfitSmartSwap[];
}

function getStyleIntelligenceReasons(productEntries: ScoredProduct[], answers: QuizAnswers) {
  const reasons = new Set<string>();
  const matchedRuleNames = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStyleRuleNames)),
  );
  const styleRuleReasons = Array.from(
    new Set(productEntries.flatMap((entry) => entry.styleRuleReasons)),
  );
  const avoidHits = productEntries.flatMap((entry) => entry.styleRuleAvoidHits);
  const itemText = normalize(productEntries.map((entry) => entry.product.name).join(" "));

  if (matchedRuleNames.length > 0 && answers.aesthetic) {
    const aestheticLabel = formatAestheticLabel(answers.aesthetic, answers.stylePreference);
    const occasionLabel =
      answers.occasion === "date"
        ? "date-night"
        : normalize(formatLabel(answers.occasion || "")).replace(/\s+/g, "-");

    reasons.add(
      `Matches ${aestheticLabel} ${occasionLabel || "style"} rules from FitMuse's style intelligence.`,
    );
  }

  const feminineRuleHit =
    normalize(answers.stylePreference) === "feminine" &&
    matchedRuleNames.some((name) =>
      [
        "feminine clean minimal date core",
        "feminine everyday clean core",
        "structure and softness contrast",
        "petite vertical line rule",
        "natural texture quiet luxury",
        "feminine quiet luxury no logo",
      ].includes(normalize(name)),
    );

  if (feminineRuleHit) {
    reasons.add("Uses clean-minimal styling with balanced structure and softness.");

    if (
      matchedRuleNames.includes("Petite Vertical Line Rule") ||
      keywordMatches(itemText, ["high-rise", "high rise", "pointed", "slingback"])
    ) {
      reasons.add("High-rise lines and refined shoes help lengthen the silhouette.");
    }

    if (
      matchedRuleNames.includes("Natural Texture Quiet Luxury") ||
      matchedRuleNames.includes("Feminine Quiet Luxury No Logo") ||
      keywordMatches(itemText, ["silk", "linen", "leather", "suede", "cashmere", "merino"])
    ) {
      reasons.add("Natural textures and neutral tones create a quiet-luxury feel without logos.");
    }
  }

  if (
    keywordMatches(itemText, ["trouser", "trousers", "chino"]) &&
    keywordMatches(itemText, ["loafer", "sneaker", "boot"])
  ) {
    reasons.add("Prioritizes tailored trousers, clean shoes, and quiet-luxury colors.");
  }

  if (avoidHits.length === 0 || matchedRuleNames.includes("Avoid Logos")) {
    reasons.add("Keeps the look polished by avoiding loud logos and overdesigned pieces.");
  }

  for (const reason of styleRuleReasons) {
    reasons.add(reason);

    if (reasons.size >= 3) {
      break;
    }
  }

  return Array.from(reasons).slice(0, 3);
}

function buildMatchReasons(
  productEntries: ScoredProduct[],
  answers: QuizAnswers,
  totalPrice: number,
  budgetLabel: BudgetMatchLabel,
) {
  const reasons = new Set<string>();
  const styleIntelligenceReasons = getStyleIntelligenceReasons(productEntries, answers);
  const aestheticLabel = formatAestheticLabel(answers.aesthetic, answers.stylePreference);
  const matchedColors = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedPreferredColors)),
  );
  const matchedStores = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStores)),
  );
  const avoidedColors = splitCommaSeparated(answers.avoidColors);
  const usesAvoidedColor = productEntries.some((entry) =>
    entry.product.colors.some((color) => avoidedColors.includes(normalize(color))),
  );

  styleIntelligenceReasons.forEach((reason) => reasons.add(reason));

  if (answers.aesthetic) {
    const exactCount = productEntries.filter((entry) => entry.exactAesthetic).length;
    reasons.add(
      exactCount >= 2
        ? `Matches your ${aestheticLabel} aesthetic`
        : `Leans close to your ${aestheticLabel} aesthetic`,
    );
  }

  if (answers.occasion) {
    const exactCount = productEntries.filter((entry) => entry.exactOccasion).length;
    reasons.add(
      exactCount >= 2
        ? `Fits your ${formatLabel(answers.occasion)} occasion`
        : `Still supports your ${formatLabel(answers.occasion)} moment`,
    );
  }

  if (matchedColors.length > 0) {
    reasons.add(`Uses your preferred ${formatLabel(matchedColors[0])} colors`);
  }

  if (avoidedColors.length > 0 && !usesAvoidedColor) {
    reasons.add("Avoids the colors you wanted to skip");
  }

  if (matchedStores.length > 0) {
    reasons.add(`Includes stores you already like: ${matchedStores.slice(0, 2).join(" + ")}`);
  }

  if (answers.fitPreference) {
    reasons.add(`Stays close to your ${formatLabel(answers.fitPreference)} fit preference`);
  }

  if (budgetLabel === "Within budget") {
    reasons.add(`Keeps the look within ${formatLabel(answers.budgetRange || "your target budget")}`);
  } else if (budgetLabel === "Near budget") {
    reasons.add("Keeps the full outfit close to your budget range");
  } else if (budgetLabel === "Stretch upgrade") {
    reasons.add("Adds one stronger upgrade piece while staying close to your budget brief");
  } else {
    reasons.add(`Pushes past ${formatLabel(answers.budgetRange || "budget")} only because the overall match is unusually strong`);
  }

  if (productEntries.every((entry) => entry.sizeExact)) {
    reasons.add("Available in the sizes saved in your style brief");
  }

  return Array.from(reasons);
}

function matchQualityLabel(confidenceScore: number) {
  if (confidenceScore >= 75) {
    return "Best match" as MatchQualityLabel;
  }

  if (confidenceScore >= 55) {
    return "Strong match" as MatchQualityLabel;
  }

  return "Closest match" as MatchQualityLabel;
}

function buildConfidenceScore(
  productEntries: ScoredProduct[],
  budgetCap: number | null,
  totalPrice: number,
  creatorAlignmentScore: number,
  occasion: Occasion,
) {
  const items = productEntries.map((entry) => entry.product);
  const exactAestheticCount = productEntries.filter((entry) => entry.exactAesthetic).length;
  const fallbackAestheticCount = productEntries.filter((entry) => entry.fallbackAesthetic).length;
  const exactOccasionCount = productEntries.filter((entry) => entry.exactOccasion).length;
  const fallbackOccasionCount = productEntries.filter((entry) => entry.fallbackOccasion).length;
  const sizeExactCount = productEntries.filter((entry) => entry.sizeExact).length;
  const fitExactCount = productEntries.filter((entry) => entry.fitExact).length;
  const fitAlignedCount = productEntries.filter((entry) => entry.fitAligned).length;
  const matchedColorCount = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedPreferredColors)),
  ).length;
  const matchedPreferredFamilyCount = productEntries.filter(
    (entry) => entry.matchedPreferredFamily,
  ).length;
  const matchedStoreCount = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStores)),
  ).length;
  const styleRuleCoverage = productEntries.filter(
    (entry) => entry.matchedStyleRuleNames.length > 0,
  ).length;
  const totalStyleRuleBoost = productEntries.reduce(
    (sum, entry) => sum + Math.max(0, entry.styleRuleBoost),
    0,
  );
  const allSizeMatched = sizeExactCount === productEntries.length;
  const paletteTight = new Set(items.map((item) => item.colorFamily)).size <= 3;
  const budgetLabel = classifyBudgetMatch(totalPrice, budgetCap);

  let confidence = 28;

  if (exactAestheticCount >= 2) {
    confidence += 20;
  } else if (exactAestheticCount === 1) {
    confidence += 14;
  } else if (fallbackAestheticCount >= 2) {
    confidence += 10;
  } else if (fallbackAestheticCount === 1) {
    confidence += 6;
  } else {
    confidence -= 4;
  }

  if (exactOccasionCount >= 2) {
    confidence += 20;
  } else if (exactOccasionCount === 1) {
    confidence += 14;
  } else if (fallbackOccasionCount >= 2) {
    confidence += 10;
  } else if (fallbackOccasionCount === 1) {
    confidence += 6;
  } else {
    confidence -= 4;
  }

  if (!budgetCap) {
    confidence += 10;
  } else if (budgetLabel === "Within budget") {
    confidence += 18;
  } else if (budgetLabel === "Near budget") {
    confidence += 11;
  } else if (budgetLabel === "Stretch upgrade") {
    confidence += 5;
  } else {
    confidence -= 9;
  }

  if (allSizeMatched) {
    confidence += 10;
  } else if (sizeExactCount >= Math.max(2, productEntries.length - 1)) {
    confidence += 5;
  } else {
    confidence -= 6;
  }

  if (fitExactCount >= 2) {
    confidence += 8;
  } else if (fitAlignedCount >= 2) {
    confidence += 5;
  } else if (fitAlignedCount >= 1) {
    confidence += 2;
  }

  if (matchedColorCount > 0) {
    confidence += 6;
  } else if (matchedPreferredFamilyCount > 0) {
    confidence += 3;
  }

  if (matchedStoreCount > 0) {
    confidence += 4;
  }

  if (styleRuleCoverage >= 2) {
    confidence += Math.min(8, Math.round(totalStyleRuleBoost / 4));
  } else if (styleRuleCoverage === 1) {
    confidence += Math.min(4, Math.round(totalStyleRuleBoost / 6));
  }

  if (paletteTight) {
    confidence += 4;
  }

  if (isCreatorOccasion(occasion) && creatorAlignmentScore >= 4) {
    confidence += 4;
  }

  if (budgetCap && totalPrice <= budgetCap && productEntries.length <= 4) {
    confidence += 2;
  }

  return Math.max(35, Math.min(96, confidence));
}

function buildOutfitRecommendation(
  productEntries: ScoredProduct[],
  answers: QuizAnswers,
  index: number,
): OutfitRecommendation {
  const items = productEntries.map((entry) => entry.product);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const colorPalette = uniqueColors(items);
  const creatorAlignmentScore = productEntries.reduce(
    (sum, entry) => sum + entry.creatorAlignmentScore,
    0,
  );
  const confidenceScore = buildConfidenceScore(
    productEntries,
    budgetCap,
    totalPrice,
    creatorAlignmentScore,
    (answers.occasion || "daily wear") as Occasion,
  );
  const matchMode: OutfitRecommendation["matchMode"] =
    confidenceScore >= 55 ? "exact" : "closest";
  const budgetMatch = buildBudgetMatch(items, budgetCap);
  const matchReasons = buildMatchReasons(productEntries, answers, totalPrice, budgetMatch.label);
  const matchedColors = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedPreferredColors)),
  );
  const priceBreakdown = buildPriceBreakdown(items);

  return {
    id: productEntries.map((entry) => entry.product.id).join("__"),
    name: buildName(
      (answers.aesthetic || "smart casual") as Aesthetic,
      (answers.occasion || "daily wear") as Occasion,
      answers.stylePreference,
      index,
    ),
    aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
    occasion: (answers.occasion || "daily wear") as Occasion,
    totalPrice,
    items: {
      top: productEntries.find((entry) => entry.product.category === "top")!.product,
      bottom: productEntries.find((entry) => entry.product.category === "bottom")!.product,
      shoes: productEntries.find((entry) => entry.product.category === "shoes")!.product,
      accessory: productEntries.find((entry) => entry.product.category === "accessory")?.product,
      outerwear: productEntries.find((entry) => entry.product.category === "outerwear")?.product,
    },
    colorPalette,
    colorFamilies: uniqueColorFamilies(items),
    fitNote: buildFitNote(items, answers),
    whyItWorks: buildWhyItWorks(items, answers, matchedColors),
    creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
    confidenceScore,
    matchQualityLabel: matchQualityLabel(confidenceScore),
    budgetMatchLabel: budgetMatch.label,
    budgetNote: budgetMatch.note,
    matchReasons,
    creatorAlignmentScore,
    stores: Array.from(new Set(items.map((item) => item.store))),
    priceBreakdown,
    occasionMatch: buildOccasionMatchLabel(productEntries),
    styleMatch: buildStyleMatchLabel(productEntries),
    colorHarmony: buildColorHarmonyLabel(items, matchedColors, productEntries),
    fitConfidence: buildFitConfidenceLabel(productEntries),
    sizeCompatibility: buildSizeCompatibilityLabel(productEntries, answers),
    storeMatch: buildStoreMatchLabel(productEntries, answers),
    fitTags: buildFitTags(items, answers),
    stylingSummary: buildStylingSummary(answers, budgetMatch.label, matchedColors, items),
    smartSwaps: [],
    matchMode,
    shopUrl: `/mock-look/${productEntries[0].product.id}`,
  };
}

function budgetPriority(label: BudgetMatchLabel) {
  if (label === "Within budget") {
    return 0;
  }

  if (label === "Near budget") {
    return 1;
  }

  if (label === "Stretch upgrade") {
    return 2;
  }

  return 3;
}

function selectBudgetBalancedRecommendations(
  recommendations: OutfitRecommendation[],
  budgetCap: number | null,
  limit: number,
) {
  if (!budgetCap || recommendations.length <= limit) {
    return recommendations.slice(0, limit);
  }

  const within = recommendations.filter(
    (recommendation) => recommendation.budgetMatchLabel === "Within budget",
  );
  const near = recommendations.filter(
    (recommendation) => recommendation.budgetMatchLabel === "Near budget",
  );
  const stretch = recommendations.filter(
    (recommendation) => recommendation.budgetMatchLabel === "Stretch upgrade",
  );
  const over = recommendations.filter(
    (recommendation) => recommendation.budgetMatchLabel === "Over budget",
  );

  const selected: OutfitRecommendation[] = [];
  const seen = new Set<string>();

  const takeFromBucket = (bucket: OutfitRecommendation[], targetCount: number) => {
    for (const recommendation of bucket) {
      if (selected.length >= limit || targetCount <= 0) {
        break;
      }

      if (seen.has(recommendation.id)) {
        continue;
      }

      selected.push(recommendation);
      seen.add(recommendation.id);
      targetCount -= 1;
    }
  };

  const targetWithin = Math.min(
    within.length,
    Math.max(3, Math.ceil(limit * 0.6)),
  );
  const targetNear = Math.min(
    near.length,
    near.length > 0 ? Math.max(1, Math.floor(limit * 0.2)) : 0,
  );
  const targetStretch = Math.min(
    stretch.length,
    stretch.length > 0
      ? budgetCap <= 100
        ? 1
        : Math.min(2, Math.max(1, Math.floor(limit * 0.15)))
      : 0,
  );

  takeFromBucket(within, targetWithin);
  takeFromBucket(near, targetNear);
  takeFromBucket(stretch, targetStretch);

  for (const bucket of [within, near, stretch, over]) {
    if (selected.length >= limit) {
      break;
    }

    takeFromBucket(bucket, limit - selected.length);
  }

  return selected.slice(0, limit);
}

export function buildOutfitRecommendations(answers: QuizAnswers, limit = 8) {
  const matchedStyleRules = getStyleRulesForBrief({
    aesthetic: answers.aesthetic,
    occasion: answers.occasion,
    stylePreference: answers.stylePreference,
    budget: answers.budgetRange,
    fitPreference: answers.fitPreference,
    bodyOrFit: inferBodyOrFitSignal(answers),
    region: answers.location,
  });
  const topPool = pickPool("top", answers, matchedStyleRules);
  const bottomPool = pickPool("bottom", answers, matchedStyleRules);
  const shoesPool = pickPool("shoes", answers, matchedStyleRules);
  const accessoryPool = pickPool("accessory", answers, matchedStyleRules);
  const outerwearPool = pickPool("outerwear", answers, matchedStyleRules);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const budgetThresholds = getBudgetThresholds(budgetCap);
  const recommendations: OutfitRecommendation[] = [];
  const accessoryChoices = [undefined, ...accessoryPool];
  const outerwearChoices = [undefined, ...outerwearPool];

  for (const top of topPool) {
    for (const bottom of bottomPool) {
      for (const shoes of shoesPool) {
        for (const accessory of accessoryChoices) {
          for (const outerwear of outerwearChoices) {
            const productEntries = [top, bottom, shoes, accessory, outerwear].filter(Boolean) as ScoredProduct[];
            const items = productEntries.map((entry) => entry.product);
            const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
            const coreTotal = [top, bottom, shoes].reduce(
              (sum, entry) => sum + entry.product.price,
              0,
            );

            if (budgetThresholds && coreTotal > budgetThresholds.stretchMax) {
              continue;
            }

            if (budgetThresholds && totalPrice > budgetThresholds.hardMax) {
              continue;
            }

            if (
              budgetCap &&
              budgetCap <= 100 &&
              outerwear &&
              totalPrice > budgetThresholds!.withinMax
            ) {
              continue;
            }

            if (
              budgetCap &&
              budgetCap <= 200 &&
              accessory &&
              outerwear &&
              totalPrice > budgetThresholds!.nearMax
            ) {
              continue;
            }

            if (
              budgetCap &&
              budgetCap <= 200 &&
              outerwear &&
              coreTotal > budgetThresholds!.nearMax
            ) {
              continue;
            }

            const recommendation = buildOutfitRecommendation(
              productEntries,
              answers,
              recommendations.length,
            );

            recommendations.push(recommendation);
          }
        }
      }
    }
  }

  const uniqueRecommendations = Array.from(
    new Map(recommendations.map((recommendation) => [recommendation.id, recommendation])).values(),
  );

  const sorted = uniqueRecommendations.sort(
    (left, right) =>
      budgetPriority(left.budgetMatchLabel) - budgetPriority(right.budgetMatchLabel) ||
      right.confidenceScore - left.confidenceScore ||
      right.creatorAlignmentScore - left.creatorAlignmentScore ||
      left.totalPrice - right.totalPrice,
  );

  if (sorted.length > 0) {
    return selectBudgetBalancedRecommendations(sorted, budgetCap, limit).map((recommendation, index) => {
      const recommendationItems = [
        recommendation.items.top,
        recommendation.items.bottom,
        recommendation.items.shoes,
        recommendation.items.accessory,
        recommendation.items.outerwear,
      ].filter(Boolean) as Product[];

      return {
        ...recommendation,
        name: buildName(
          (answers.aesthetic || "smart casual") as Aesthetic,
          (answers.occasion || "daily wear") as Occasion,
          answers.stylePreference,
          index,
        ),
        smartSwaps: buildSmartSwaps(recommendationItems, answers, matchedStyleRules),
      };
    });
  }

  const fallbackItems = [...coreCategories, "accessory" as const]
    .map((category) =>
      products
        .filter((product) => product.category === category)
        .sort((left, right) => left.price - right.price)[0],
    )
    .filter(Boolean) as Product[];

  if (fallbackItems.length < 3) {
    return [];
  }

  const fallbackBudgetMatch = buildBudgetMatch(fallbackItems, budgetCap);
  const fallbackRecommendation: OutfitRecommendation = {
    id: fallbackItems.map((item) => item.id).join("__"),
    name: "Closest FitMuse Look",
    aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
    occasion: (answers.occasion || "daily wear") as Occasion,
    totalPrice: fallbackItems.reduce((sum, item) => sum + item.price, 0),
    items: {
      top: fallbackItems.find((item) => item.category === "top")!,
      bottom: fallbackItems.find((item) => item.category === "bottom")!,
      shoes: fallbackItems.find((item) => item.category === "shoes")!,
      accessory: fallbackItems.find((item) => item.category === "accessory"),
      outerwear: undefined,
    },
    colorPalette: uniqueColors(fallbackItems),
    colorFamilies: uniqueColorFamilies(fallbackItems),
    fitNote: buildFitNote(fallbackItems, answers),
    whyItWorks: "This is the closest ready-to-buy outfit mix available in the current mock catalog.",
    creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
    confidenceScore: 49,
    matchQualityLabel: "Closest match",
    budgetMatchLabel: fallbackBudgetMatch.label,
    budgetNote:
      "This fallback prioritizes showing a complete outfit over a blank page while staying as close to your budget as the current catalog allows.",
    matchReasons: [
      "No perfect match yet, but this is the closest full outfit in the current mock catalog",
      answers.aesthetic
        ? `Still leans toward your ${formatAestheticLabel(answers.aesthetic, answers.stylePreference)} aesthetic`
        : "Still keeps the outfit visually cohesive",
    ],
    creatorAlignmentScore: 2,
    stores: Array.from(new Set(fallbackItems.map((item) => item.store))),
    priceBreakdown: buildPriceBreakdown(fallbackItems),
    occasionMatch: "Flexible occasion match",
    styleMatch: answers.aesthetic ? "Closest style match" : "Directional style match",
    colorHarmony:
      uniqueColorFamilies(fallbackItems).length <= 3 ? "Balanced color harmony" : "Directional palette mix",
    fitConfidence: "Exploratory fit confidence",
    sizeCompatibility:
      answers.topSize || answers.bottomSize || answers.shoeSize
        ? "Some size guesswork"
        : "Open size mix",
    storeMatch: splitCommaSeparated(answers.storesLike).length > 0 ? "Mixed-store match" : "Open-store mix",
    fitTags: buildFitTags(fallbackItems, answers),
    stylingSummary: buildStylingSummary(
      answers,
      fallbackBudgetMatch.label,
      [],
      fallbackItems,
    ),
    smartSwaps: buildSmartSwaps(fallbackItems, answers, matchedStyleRules),
    matchMode: "closest",
    shopUrl: `/mock-look/${fallbackItems[0].id}`,
  };

  return [fallbackRecommendation];
}

export function hasQuizAnswers(answers?: Partial<QuizAnswers> | null) {
  if (!answers) {
    return false;
  }

  return Boolean(
    answers.name ||
      answers.aesthetic ||
      answers.occasion ||
      answers.budgetRange ||
      answers.fitPreference ||
      answers.topSize ||
      answers.bottomSize,
  );
}

export function emptyQuizAnswers(): QuizAnswers {
  return {
    name: "",
    stylePreference: "",
    location: "",
    height: "",
    weight: "",
    chestBust: "",
    waist: "",
    hips: "",
    topSize: "",
    bottomSize: "",
    shoeSize: "",
    bodyType: "",
    aesthetic: "",
    occasion: "",
    budgetRange: "",
    fitPreference: "",
    preferredColors: "",
    avoidColors: "",
    storesLike: "",
  };
}

export function budgetLabelFromCap(cap: string | number) {
  const value = typeof cap === "string" ? budgetCapFromRange(cap as BudgetRange) : cap;

  if (!value) {
    return "Flexible";
  }

  if (value <= 100) {
    return "Under $100";
  }

  if (value <= 200) {
    return "Up to $200";
  }

  if (value <= 350) {
    return "Up to $350";
  }

  return "$350+";
}
