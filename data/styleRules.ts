import type {
  Aesthetic,
  BudgetRange,
  FitPreference,
  Occasion,
  StylePreference,
} from "@/types";

// This file is the first structured step toward FitMuse's stylist brain.
// The rules are intentionally data-only for now so the recommendation engine
// can adopt them later without changing the current MVP behavior yet.

export type StyleRuleConfidence = "high" | "medium" | "low";

export type StyleRuleBrief = {
  aesthetic?: string;
  occasion?: string;
  stylePreference?: string;
  budget?: string;
  fitPreference?: string;
  bodyOrFit?: string;
  region?: string;
  climate?: string;
};

export type StyleRulePriority = {
  items: string[];
  colors: string[];
  fits: string[];
  materials: string[];
  shoes: string[];
  accessories: string[];
};

export type StyleRuleAvoid = {
  items: string[];
  colors: string[];
  fits: string[];
  materials: string[];
  styleSignals: string[];
};

export type StyleRuleScoringImpact = {
  addPointsFor: string[];
  removePointsFor: string[];
};

export type StyleRule = {
  id: string;
  name: string;
  aestheticTags: string[];
  occasionTags: string[];
  stylePreferenceTags: Array<StylePreference | string>;
  budgetTags: Array<BudgetRange | string>;
  bodyOrFitTags: Array<FitPreference | string>;
  regionOrClimateTags: string[];
  prioritize: StyleRulePriority;
  avoid: StyleRuleAvoid;
  why: string;
  scoringImpact: StyleRuleScoringImpact;
  matchReason: string;
  confidence: StyleRuleConfidence;
  sourceModule:
    | "Masculine Old Money / Quiet Luxury Date System"
    | "Feminine Clean / Minimal / Quiet Luxury Date & Everyday System"
    | "Smart Casual / Office Style System";
};

const masculineSourceModule = "Masculine Old Money / Quiet Luxury Date System" as const;
const feminineSourceModule =
  "Feminine Clean / Minimal / Quiet Luxury Date & Everyday System" as const;
const officeSourceModule = "Smart Casual / Office Style System" as const;

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function expandAliases(value?: string) {
  const normalizedValue = normalize(value);

  if (!normalizedValue) {
    return [];
  }

  const aliasMap: Record<string, string[]> = {
    hot: ["hot", "warm climate", "tropical", "summer"],
    warm: ["warm", "warm climate", "tropical", "summer"],
    tropical: ["tropical", "warm climate", "hot", "summer"],
    cool: ["cool", "cool weather", "winter", "autumn"],
    cold: ["cold", "cool weather", "winter"],
    travel: ["travel"],
    office: ["office", "work", "interview", "meeting", "business casual"],
    work: ["work", "office", "interview", "meeting", "business casual"],
    interview: ["interview", "office", "work", "meeting", "business casual"],
    meeting: ["meeting", "office", "work", "interview", "business casual"],
    "business casual": ["business casual", "office", "work", "meeting", "interview"],
  };

  return aliasMap[normalizedValue] ?? [normalizedValue];
}

function hasTag(tags: string[], value?: string) {
  const normalizedValues = expandAliases(value);

  if (normalizedValues.length === 0) {
    return true;
  }

  const normalizedTags = tags.map(normalize);

  return normalizedValues.some((entry) => normalizedTags.includes(entry));
}

function hasTagOrWildcard(tags: string[], value: string | undefined, wildcards: string[]) {
  const normalizedTags = tags.map(normalize);

  if (wildcards.some((wildcard) => normalizedTags.includes(normalize(wildcard)))) {
    return true;
  }

  return hasTag(tags, value);
}

export const styleRules: StyleRule[] = [
  {
    id: "old-money-date-night-core",
    name: "Old Money Date Night Core",
    aestheticTags: ["old money", "quiet luxury", "luxury neutral"],
    occasionTags: ["date", "dinner", "evening date"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["slim", "regular", "classy", "general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["oxford shirt", "knit polo", "tailored trousers"],
      colors: ["cream", "navy", "camel", "charcoal"],
      fits: ["regular", "slim-straight", "clean tailoring"],
      materials: ["oxford cotton", "merino", "wool blend"],
      shoes: ["penny loafers"],
      accessories: ["slim leather belt", "simple analog watch"],
    },
    avoid: {
      items: ["chunky sneakers", "graphic tee"],
      colors: ["neon", "electric blue"],
      fits: ["skinny", "extra slim"],
      materials: ["shiny synthetic"],
      styleSignals: ["visible logos", "loud branding"],
    },
    why: "This is the clearest quiet-luxury date-night baseline because it balances polish, softness, and timeless masculine structure.",
    scoringImpact: {
      addPointsFor: ["old money aesthetic", "date occasion", "loafers", "tailored trousers"],
      removePointsFor: ["visible logos", "chunky sneakers", "distressed denim"],
    },
    matchReason:
      "This look uses quiet luxury colors and clean tailoring for a polished date-night feel.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "navy-blazer-foundation",
    name: "Navy Blazer Foundation",
    aestheticTags: ["old money", "quiet luxury", "smart casual"],
    occasionTags: ["date", "smart casual evening", "dinner"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["classy", "regular", "structured layering"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["unstructured navy blazer", "off-white shirt", "tailored trousers"],
      colors: ["navy", "off-white", "camel", "charcoal"],
      fits: ["clean shoulder", "soft structure", "slim-straight"],
      materials: ["cotton blend", "wool blend", "soft tailoring"],
      shoes: ["loafers"],
      accessories: ["slim leather belt", "analog watch"],
    },
    avoid: {
      items: ["stiff suit jacket", "corporate tie"],
      colors: ["harsh contrast black-white"],
      fits: ["boxy blazer", "tight sleeve"],
      materials: ["high-shine suiting"],
      styleSignals: ["officewear stiffness"],
    },
    why: "A soft navy blazer lifts the date look without making it feel like workwear.",
    scoringImpact: {
      addPointsFor: ["soft blazer", "off-white shirt", "date occasion"],
      removePointsFor: ["formal business suit", "patent leather shoes"],
    },
    matchReason:
      "The blazer adds structure without making the outfit feel too formal for a date.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "oxford-shirt-core",
    name: "Oxford Shirt Core",
    aestheticTags: ["old money", "smart casual", "quiet luxury"],
    occasionTags: ["date", "office", "dinner"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["slim", "regular", "general"],
    regionOrClimateTags: ["all regions", "warm weather", "mild weather"],
    prioritize: {
      items: ["oxford shirt", "tailored trousers", "chinos"],
      colors: ["off-white", "pale blue", "cream"],
      fits: ["slim", "regular", "clean shoulder"],
      materials: ["oxford cotton", "cotton-linen blend"],
      shoes: ["loafers", "minimal leather sneakers"],
      accessories: ["belt when tucked"],
    },
    avoid: {
      items: ["high-shine dress shirt"],
      colors: ["overly bright saturated shirt colors"],
      fits: ["skin-tight shirt"],
      materials: ["glossy blend"],
      styleSignals: ["forced trend detail"],
    },
    why: "The oxford shirt is the most reliable old-money base because it stays timeless, crisp, and adaptable.",
    scoringImpact: {
      addPointsFor: ["oxford shirt", "clean neckline", "muted palette"],
      removePointsFor: ["shiny shirt", "extreme slim fit"],
    },
    matchReason:
      "A clean oxford shirt gives the outfit timeless structure without overcomplicating the look.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "knit-polo-smart-casual",
    name: "Knit Polo Smart Casual",
    aestheticTags: ["old money", "quiet luxury", "smart casual"],
    occasionTags: ["date", "lounge date", "evening drinks"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["slim", "regular", "softness preferred"],
    regionOrClimateTags: ["all regions", "warm weather", "mild weather"],
    prioritize: {
      items: ["knitted polo", "flannel trousers", "tailored trousers"],
      colors: ["cream", "forest green", "burgundy", "navy"],
      fits: ["close but not clingy", "slim-straight"],
      materials: ["merino", "cotton knit", "fine gauge knit"],
      shoes: ["loafers"],
      accessories: ["minimal watch"],
    },
    avoid: {
      items: ["sport polo"],
      colors: ["neon trim"],
      fits: ["clingy torso fit"],
      materials: ["glossy synthetic knit"],
      styleSignals: ["loud tipping", "oversized logos"],
    },
    why: "A knitted polo softens the outfit and feels more inviting for a date without losing refinement.",
    scoringImpact: {
      addPointsFor: ["knit texture", "muted polo color", "date occasion"],
      removePointsFor: ["sport polo styling", "high-contrast trim"],
    },
    matchReason:
      "The textured knit adds softness, making the outfit feel approachable without looking casual.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "textured-cardigan-date-look",
    name: "Textured Cardigan Date Look",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "intimate date", "evening"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["slim frame", "cool weather", "layering"],
    regionOrClimateTags: ["all regions", "cool weather", "indoor evening"],
    prioritize: {
      items: ["textured cardigan", "button-down shirt", "dark trousers"],
      colors: ["oatmeal", "taupe", "forest green", "charcoal"],
      fits: ["soft layer", "controlled drape"],
      materials: ["wool blend", "cotton knit", "merino blend"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["watch if budget allows"],
    },
    avoid: {
      items: ["chunky novelty cardigan"],
      colors: ["overly busy pattern"],
      fits: ["sloppy oversized"],
      materials: ["itchy bulky knit"],
      styleSignals: ["over-layered costume energy"],
    },
    why: "Texture and softness make the outfit warmer and more intimate while still aligned with quiet-luxury values.",
    scoringImpact: {
      addPointsFor: ["textured knitwear", "cool weather", "date occasion"],
      removePointsFor: ["bulky cardigan", "graphic layering"],
    },
    matchReason:
      "The layered cardigan adds depth and warmth while keeping the outfit refined.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "suede-chelsea-boot-date-look",
    name: "Suede and Chelsea Boot Date Look",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "cool-weather dinner", "evening"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["cool weather", "classy", "structured"],
    regionOrClimateTags: ["cool weather", "autumn", "winter", "all regions"],
    prioritize: {
      items: ["suede layer", "textured jacket", "tailored trousers"],
      colors: ["chocolate", "camel", "charcoal", "stone"],
      fits: ["clean torso fit", "lean trouser line"],
      materials: ["suede", "wool blend", "cotton twill"],
      shoes: ["chelsea boots"],
      accessories: ["coordinated belt"],
    },
    avoid: {
      items: ["patent leather jacket"],
      colors: ["glossy high-shine black"],
      fits: ["boxy torso"],
      materials: ["patent leather", "shiny faux leather"],
      styleSignals: ["loud rocker styling"],
    },
    why: "Suede and sleek Chelsea boots add depth and richness without using obvious luxury signals.",
    scoringImpact: {
      addPointsFor: ["suede texture", "chelsea boots", "cool climate"],
      removePointsFor: ["chunky boots", "patent finish"],
    },
    matchReason:
      "The textured outer layer makes the outfit feel richer while staying understated.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "quarter-zip-smart-casual",
    name: "Quarter-Zip Smart Casual",
    aestheticTags: ["smart casual", "old money"],
    occasionTags: ["date", "casual date", "coffee-to-dinner"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["layered polish", "regular", "classy"],
    regionOrClimateTags: ["mild weather", "cool weather", "all regions"],
    prioritize: {
      items: ["quarter-zip", "oxford shirt", "chinos"],
      colors: ["navy", "camel", "stone", "cream"],
      fits: ["neat layering", "regular", "trim but not tight"],
      materials: ["cotton", "merino", "soft wool blend"],
      shoes: ["loafers", "minimal sneakers"],
      accessories: ["minimal watch"],
    },
    avoid: {
      items: ["technical athletic quarter-zip"],
      colors: ["contrast piping colors"],
      fits: ["bulky layering"],
      materials: ["shiny performance fabric"],
      styleSignals: ["sport-golf styling"],
    },
    why: "The quarter-zip is a polished bridge between casual ease and refined styling.",
    scoringImpact: {
      addPointsFor: ["layering", "smart casual setting", "quiet knit"],
      removePointsFor: ["technical sportswear", "shiny zip details"],
    },
    matchReason:
      "The layered quarter-zip keeps the outfit relaxed while still feeling composed.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "brown-dark-skin-premium-colors",
    name: "Brown or Dark Skin Premium Colors",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "dinner", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["skin tone preference: brown", "skin tone preference: dark"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["quiet luxury core pieces"],
      colors: ["ivory", "off-white", "camel", "forest green", "maroon", "rust", "navy"],
      fits: ["standard old-money fits"],
      materials: ["cotton", "merino", "wool blend"],
      shoes: ["brown leather", "burgundy leather"],
      accessories: ["coordinated leather tones"],
    },
    avoid: {
      items: ["harsh optic white if unwanted"],
      colors: ["bright optic white when user dislikes it"],
      fits: [],
      materials: [],
      styleSignals: ["color choices based on assumption instead of stated preference"],
    },
    why: "Richer muted tones and softer whites can feel more premium for users who explicitly prefer them.",
    scoringImpact: {
      addPointsFor: ["off-white", "forest green", "maroon", "camel"],
      removePointsFor: ["harsh bright white when user dislikes it"],
    },
    matchReason:
      "The color palette feels richer and more flattering without becoming loud.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "broad-shoulders-lean-legs-balance",
    name: "Broad Shoulders and Lean Legs Balance",
    aestheticTags: ["old money", "smart casual"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["broad shoulders", "lean legs"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["balanced upper layers", "regular or slim-straight trousers"],
      colors: ["quiet-luxury palette"],
      fits: ["regular", "slim-straight", "no aggressive taper"],
      materials: ["cotton", "wool blend", "flannel"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["minimal accessories"],
    },
    avoid: {
      items: ["skinny pants"],
      colors: [],
      fits: ["aggressive taper", "extra slim pants"],
      materials: [],
      styleSignals: ["top-heavy proportion exaggeration"],
    },
    why: "Straighter lower-body lines balance broader shoulders better than very narrow trouser cuts.",
    scoringImpact: {
      addPointsFor: ["regular trouser cut", "balanced silhouette"],
      removePointsFor: ["skinny pants", "sharp ankle taper"],
    },
    matchReason:
      "The trouser shape balances the upper body so the outfit looks intentional rather than top-heavy.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "midsection-verticality-support",
    name: "Midsection Verticality Support",
    aestheticTags: ["old money", "smart casual"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["midsection", "belly", "shorter body line"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["structured layers", "simple plackets", "clean trousers"],
      colors: ["monochrome neutrals", "low-contrast neutrals"],
      fits: ["skim fit", "clean vertical line"],
      materials: ["structured cotton", "soft wool blend"],
      shoes: ["simple refined shoes"],
      accessories: ["minimal accessories"],
    },
    avoid: {
      items: ["clingy tops"],
      colors: ["abrupt torso color blocks"],
      fits: ["tight across stomach"],
      materials: [],
      styleSignals: ["horizontal emphasis at midsection"],
    },
    why: "Vertical continuity and controlled structure help the body line read longer and cleaner.",
    scoringImpact: {
      addPointsFor: ["monochrome family", "vertical line", "structured layer"],
      removePointsFor: ["strong color block", "clingy knit"],
    },
    matchReason:
      "The clean line through the torso helps the outfit look sharper and more proportional.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "slim-frame-texture-support",
    name: "Slim Frame Texture Support",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["slim frame"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["textured knitwear", "cardigans", "quarter-zips", "layered shirts"],
      colors: ["soft neutrals", "one muted accent"],
      fits: ["not oversized", "some visual depth"],
      materials: ["merino", "cotton knit", "soft wool blend"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["simple leather accessories"],
    },
    avoid: {
      items: ["ultra-flat thin outfit with no layer"],
      colors: [],
      fits: ["oversized with no structure"],
      materials: ["paper-thin fabric with no texture"],
      styleSignals: ["visually empty silhouette"],
    },
    why: "Texture and layering help a slimmer frame feel fuller and more grounded without requiring bulk.",
    scoringImpact: {
      addPointsFor: ["textured knit", "layering depth"],
      removePointsFor: ["flat one-dimensional outfit"],
    },
    matchReason:
      "The texture adds depth so the outfit feels fuller and more premium on a slimmer frame.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "leather-coordination-rule",
    name: "Leather Coordination Rule",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["belt and shoes in compatible tones"],
      colors: ["brown leather family", "burgundy leather family", "black with black"],
      fits: ["n/a"],
      materials: ["smooth leather", "suede"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["matching watch strap when possible"],
    },
    avoid: {
      items: ["randomly mismatched leather accessories"],
      colors: ["clashing leather tones"],
      fits: [],
      materials: ["mixed incompatible leathers"],
      styleSignals: ["accidental-looking coordination"],
    },
    why: "Coordinated leather details make even a simple outfit feel considered and polished.",
    scoringImpact: {
      addPointsFor: ["matched belt-shoe family", "coordinated watch strap"],
      removePointsFor: ["clashing leather tones"],
    },
    matchReason: "The leather tones are coordinated, which makes the look feel intentional.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "budget-100-200-core-outfit",
    name: "Budget $100-$200 Core Outfit",
    aestheticTags: ["old money", "quiet luxury", "smart casual"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["$100-$200"],
    bodyOrFitTags: ["general", "budget conscious"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["top", "bottom", "shoes"],
      colors: ["neutral base", "muted accent"],
      fits: ["clean and simple"],
      materials: ["cotton", "merino blend", "budget-friendly natural feel"],
      shoes: ["budget loafers", "minimal sneakers"],
      accessories: ["only if budget allows"],
    },
    avoid: {
      items: ["forced outerwear", "extra accessory clutter"],
      colors: [],
      fits: [],
      materials: ["overpriced statement pieces"],
      styleSignals: ["luxury-only shopping logic"],
    },
    why: "A strong three-piece outfit is usually the smartest quiet-luxury move inside this budget band.",
    scoringImpact: {
      addPointsFor: ["top-bottom-shoes balance", "core-piece focus", "within budget"],
      removePointsFor: ["forcing five pieces", "over-budget accessory stack"],
    },
    matchReason:
      "This outfit stays within your budget by focusing on core pieces instead of unnecessary extras.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "avoid-logos",
    name: "Avoid Logos",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "office", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["clean basics", "refined layers"],
      colors: ["quiet palette"],
      fits: ["classic fits"],
      materials: ["natural-looking materials"],
      shoes: ["simple classic leather", "minimal sneakers"],
      accessories: ["subtle only"],
    },
    avoid: {
      items: ["logo-heavy top", "monogram belt"],
      colors: [],
      fits: [],
      materials: [],
      styleSignals: ["visible logos", "loud monograms", "oversized branding"],
    },
    why: "Quiet luxury depends on restraint and refinement rather than overt brand signaling.",
    scoringImpact: {
      addPointsFor: ["unbranded styling", "quiet palette"],
      removePointsFor: ["visible logo", "brand-led statement pieces"],
    },
    matchReason:
      "The look feels more refined because it relies on fit and texture instead of branding.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "avoid-skinny-jeans",
    name: "Avoid Skinny Jeans",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["chinos", "tailored trousers", "straight clean denim"],
      colors: ["dark neutral", "muted neutral"],
      fits: ["regular", "straight", "slim-straight"],
      materials: ["cotton twill", "wool blend", "clean denim"],
      shoes: ["loafers", "chelsea boots", "minimal sneakers"],
      accessories: ["simple belt"],
    },
    avoid: {
      items: ["skinny jeans"],
      colors: [],
      fits: ["skinny", "extra slim"],
      materials: [],
      styleSignals: ["trend-heavy leg shape"],
    },
    why: "Skinny jeans break the calm, timeless proportion that old-money styling depends on.",
    scoringImpact: {
      addPointsFor: ["straight trouser line", "clean hem"],
      removePointsFor: ["skinny jeans", "extra slim pants"],
    },
    matchReason:
      "The trouser line looks more polished because it avoids tight, trend-heavy proportions.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "minimal-sneaker-casual-date-look",
    name: "Minimal Sneaker Casual Date Look",
    aestheticTags: ["old money", "smart casual"],
    occasionTags: ["date", "casual date", "daytime date"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["casual setting", "general"],
    regionOrClimateTags: ["all regions", "warm weather", "mild weather"],
    prioritize: {
      items: ["crewneck or oxford", "chinos", "clean dark denim"],
      colors: ["cream", "navy", "camel", "stone"],
      fits: ["tidy", "structured", "slim-straight"],
      materials: ["cotton", "merino blend", "clean denim"],
      shoes: ["minimal leather sneakers"],
      accessories: ["one subtle accessory or none"],
    },
    avoid: {
      items: ["chunky sneakers"],
      colors: ["neon accents"],
      fits: [],
      materials: ["sport mesh visual noise"],
      styleSignals: ["hype-sneaker energy"],
    },
    why: "Minimal sneakers keep the outfit easy and modern without breaking the refined visual language.",
    scoringImpact: {
      addPointsFor: ["minimal sneakers", "casual date", "quiet color palette"],
      removePointsFor: ["chunky loud sneaker", "athletic visual noise"],
    },
    matchReason:
      "The sneaker keeps the look easy to wear while the rest of the outfit stays refined.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "bottoms-selection-rule",
    name: "Chinos and Tailored Trousers Selection",
    aestheticTags: ["old money", "quiet luxury", "smart casual"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["tailored trousers", "chinos", "clean denim for casual settings"],
      colors: ["beige", "khaki", "stone", "navy", "camel", "charcoal"],
      fits: ["regular", "slim-straight"],
      materials: ["wool blend", "cotton twill", "flannel", "clean denim"],
      shoes: ["loafers", "chelsea boots", "minimal sneakers"],
      accessories: ["matched belt"],
    },
    avoid: {
      items: ["distressed denim"],
      colors: [],
      fits: ["skinny", "stacking hem"],
      materials: ["heavily faded denim"],
      styleSignals: ["overly casual jean wash"],
    },
    why: "Clean trousers are one of the fastest ways to make the entire outfit feel more premium and intentional.",
    scoringImpact: {
      addPointsFor: ["tailored trousers", "clean chinos", "straight line"],
      removePointsFor: ["distressed denim", "heavy fading"],
    },
    matchReason:
      "The trousers keep a clean line, which improves proportion without looking too tight.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "travel-weather-fabric-adjustment",
    name: "Travel and Weather Fabric Adjustment",
    aestheticTags: ["old money", "quiet luxury", "smart casual"],
    occasionTags: ["date", "travel", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["warm climate", "cool climate", "travel", "all regions"],
    prioritize: {
      items: ["linen shirt", "cotton shirt", "merino layer", "textured layer"],
      colors: ["same quiet-luxury palette"],
      fits: ["breathable but controlled", "layered without bulk"],
      materials: ["linen", "cotton", "merino", "soft wool blend"],
      shoes: ["loafers", "minimal sneakers", "boots by season"],
      accessories: ["minimal seasonal additions"],
    },
    avoid: {
      items: ["weather-inappropriate heavy layer"],
      colors: [],
      fits: ["bulky warm-weather layering"],
      materials: ["overly technical fabric for quiet-luxury look"],
      styleSignals: ["out-of-season styling mismatch"],
    },
    why: "Weather-appropriate fabric keeps the outfit believable, comfortable, and more naturally elegant.",
    scoringImpact: {
      addPointsFor: ["linen in warm weather", "merino in cool weather", "seasonal logic"],
      removePointsFor: ["wrong fabric for climate", "technical-looking fabric noise"],
    },
    matchReason:
      "The fabric choice keeps the outfit premium while making sense for the weather.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "grooming-finishing-touches",
    name: "Grooming and Finishing Touches",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["clean clothing", "coordinated accessories"],
      colors: ["neat and controlled"],
      fits: ["pressed finish", "clean line"],
      materials: ["polished natural textures"],
      shoes: ["polished but not glossy shoes"],
      accessories: ["subtle fragrance", "analog watch", "neat belt"],
    },
    avoid: {
      items: ["sloppy wrinkled garment"],
      colors: [],
      fits: ["careless presentation"],
      materials: [],
      styleSignals: ["cluttered accessory mix", "overpowering fragrance"],
    },
    why: "Quiet luxury depends on how finished the whole look feels, not just the garments themselves.",
    scoringImpact: {
      addPointsFor: ["clean presentation", "subtle finishing touches"],
      removePointsFor: ["messy presentation", "over-accessorizing"],
    },
    matchReason:
      "The finishing details make the outfit feel intentional without drawing too much attention.",
    confidence: "medium",
    sourceModule: masculineSourceModule,
  },
  {
    id: "costume-avoidance-rule",
    name: "Over-Matching and Costume Avoidance",
    aestheticTags: ["old money", "quiet luxury"],
    occasionTags: ["date", "general"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["one or two strong refined signals"],
      colors: ["2 to 3 coordinated colors"],
      fits: ["natural and easy"],
      materials: ["quiet premium textures"],
      shoes: ["classic footwear"],
      accessories: ["restrained accessories"],
    },
    avoid: {
      items: ["too many themed pieces"],
      colors: ["more than 3 colors"],
      fits: ["over-styled precision"],
      materials: ["too many statement textures at once"],
      styleSignals: ["costume energy", "over-matching"],
    },
    why: "Old money works best when it feels believable, lived-in, and calm rather than theatrical.",
    scoringImpact: {
      addPointsFor: ["restraint", "limited palette", "one strong signal"],
      removePointsFor: ["costume styling", "too many matching signals"],
    },
    matchReason:
      "The look stays believable because it feels styled, not costume-like.",
    confidence: "high",
    sourceModule: masculineSourceModule,
  },
  {
    id: "feminine-clean-date-core",
    name: "Feminine Clean Minimal Date Core",
    aestheticTags: ["clean girl", "clean minimal", "minimalist", "quiet luxury"],
    occasionTags: ["date", "everyday", "daily wear"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "classy", "balanced"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["fitted top", "tailored bottom", "refined shoes"],
      colors: ["cream", "beige", "camel", "navy", "charcoal"],
      fits: ["clean line", "balanced proportions", "polished silhouette"],
      materials: ["cotton", "linen", "silk", "leather"],
      shoes: ["loafers", "pointed-toe flats", "kitten heels"],
      accessories: ["gold hoops", "structured handbag"],
    },
    avoid: {
      items: ["graphic top", "logo-heavy accessory"],
      colors: ["neon", "ultra-brights"],
      fits: ["sloppy oversized all-over"],
      materials: ["plastic-looking synthetic"],
      styleSignals: ["too many accessories", "loud branding"],
    },
    why: "This is the clearest clean-minimal date baseline because it balances polish, softness, and quiet structure.",
    scoringImpact: {
      addPointsFor: ["clean date styling", "neutral palette", "refined footwear"],
      removePointsFor: ["loud graphics", "logo-led styling"],
    },
    matchReason:
      "The neutral palette keeps the look clean while the refined accessories add just enough polish.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "feminine-everyday-clean-core",
    name: "Feminine Everyday Clean Core",
    aestheticTags: ["clean girl", "clean minimal", "minimalist"],
    occasionTags: ["daily wear", "everyday", "date"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "relaxed", "balanced"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["high-quality white t-shirt", "high-rise denim", "light third piece"],
      colors: ["white", "cream", "camel", "sage", "navy"],
      fits: ["easy structure", "clean waist emphasis"],
      materials: ["cotton", "linen", "soft leather"],
      shoes: ["loafers", "minimal sneakers", "pointed-toe flats"],
      accessories: ["gold hoops", "small handbag"],
    },
    avoid: {
      items: ["overdesigned basics"],
      colors: ["high-contrast loud pattern"],
      fits: ["boxy without balance"],
      materials: ["shiny synthetic jersey"],
      styleSignals: ["trend clutter"],
    },
    why: "Everyday clean styling should feel effortless, useful, and quietly polished rather than dressed up for content alone.",
    scoringImpact: {
      addPointsFor: ["white tee", "high-rise denim", "structured everyday pieces"],
      removePointsFor: ["cluttered styling", "cheap sheen"],
    },
    matchReason:
      "The outfit stays simple and wearable while still looking intentional through fit and texture.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "white-tee-straight-jean-formula",
    name: "White Tee and Straight Jean Formula",
    aestheticTags: ["clean girl", "clean minimal", "minimalist"],
    occasionTags: ["daily wear", "date", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "petite"],
    regionOrClimateTags: ["all regions", "warm climate", "mild weather"],
    prioritize: {
      items: ["white t-shirt", "high-rise straight-leg jeans"],
      colors: ["white", "blue", "camel", "cream"],
      fits: ["high-rise", "clean vertical line"],
      materials: ["cotton denim", "structured cotton"],
      shoes: ["leather loafers", "pointed-toe flats"],
      accessories: ["gold hoops", "thin belt"],
    },
    avoid: {
      items: ["distressed denim", "oversized slogan tee"],
      colors: ["neon accents"],
      fits: ["low-rise", "baggy top with baggy bottom"],
      materials: ["thin clingy jersey"],
      styleSignals: ["too casual to feel polished"],
    },
    why: "A crisp tee with high-rise denim is one of the strongest high-low clean-minimal formulas.",
    scoringImpact: {
      addPointsFor: ["high-rise denim", "clean white tee", "simple leather shoe"],
      removePointsFor: ["distressing", "low-rise denim"],
    },
    matchReason:
      "A crisp tee and clean high-rise denim create a simple base that still feels polished.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "structured-blazer-balance",
    name: "Structured Blazer Balance",
    aestheticTags: ["clean minimal", "quiet luxury", "minimalist"],
    occasionTags: ["date", "office", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "petite", "balanced"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["oversized blazer", "blazer dress", "thin belt"],
      colors: ["camel", "charcoal", "black", "cream"],
      fits: ["waist definition", "structured shoulder", "clean hem"],
      materials: ["wool blend", "structured suiting", "cotton blend"],
      shoes: ["knee-high boots", "loafers", "pointed flats"],
      accessories: ["structured handbag", "simple chain"],
    },
    avoid: {
      items: ["boxy oversized layer with no waist control"],
      colors: ["busy plaid with loud contrast"],
      fits: ["heavy swallowed frame"],
      materials: ["cheap stiff polyester"],
      styleSignals: ["costume-office energy"],
    },
    why: "A structured blazer can add authority and polish, but the styling needs softness or waist definition to stay inviting.",
    scoringImpact: {
      addPointsFor: ["third piece", "waist balance", "structured layer"],
      removePointsFor: ["boxy overwhelm", "cheap suiting sheen"],
    },
    matchReason:
      "The structured blazer balances the softness of the outfit so it feels polished instead of flat.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "silk-shirt-tailored-trouser",
    name: "Silk Shirt Tailored Trouser Polish",
    aestheticTags: ["quiet luxury", "clean minimal", "minimalist"],
    occasionTags: ["date", "office", "dinner"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "classy"],
    regionOrClimateTags: ["all regions", "mild weather", "warm climate"],
    prioritize: {
      items: ["silk button-up", "tailored trousers"],
      colors: ["cream", "stone", "navy", "charcoal"],
      fits: ["clean drape", "not clingy", "waist-aware"],
      materials: ["silk", "linen blend", "wool blend"],
      shoes: ["pointed-toe flats", "kitten heels", "loafers"],
      accessories: ["simple chain", "structured handbag"],
    },
    avoid: {
      items: ["wrinkled oversized satin shirt"],
      colors: ["overly bright jewel tones"],
      fits: ["sloppy oversized shirt with wide pant and no structure"],
      materials: ["cheap shiny satin"],
      styleSignals: ["trying too hard"],
    },
    why: "Fluid fabric plus tailored structure is a classic quiet-luxury pairing for polished feminine looks.",
    scoringImpact: {
      addPointsFor: ["silk-like texture", "tailored trouser", "quiet palette"],
      removePointsFor: ["cheap shine", "messy drape"],
    },
    matchReason:
      "The fluid shirt and tailored trouser pairing keeps the look polished without feeling stiff.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "fitted-top-relaxed-denim-balance",
    name: "Fitted Top and Relaxed Denim Balance",
    aestheticTags: ["clean girl", "clean minimal", "minimalist"],
    occasionTags: ["date", "daily wear", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "petite", "balanced"],
    regionOrClimateTags: ["all regions", "warm climate", "mild weather"],
    prioritize: {
      items: ["fitted knit top", "corset-inspired top", "baggy denim"],
      colors: ["cream", "black", "stone", "blue"],
      fits: ["fitted top", "relaxed bottom", "defined waist"],
      materials: ["ribbed knit", "cotton denim", "soft leather"],
      shoes: ["kitten heels", "pointed flats", "minimal sneakers"],
      accessories: ["small handbag", "gold hoops"],
    },
    avoid: {
      items: ["oversized top with oversized bottom"],
      colors: ["clashing accents"],
      fits: ["undefined waist"],
      materials: ["cheap stretch sheen"],
      styleSignals: ["random trend stacking"],
    },
    why: "When the bottom is relaxed, a more fitted top keeps the outfit intentional and flattering.",
    scoringImpact: {
      addPointsFor: ["fitted top", "relaxed denim", "waist definition"],
      removePointsFor: ["double-oversized proportion", "cheap clubwear signals"],
    },
    matchReason:
      "The fitted top balances the relaxed denim so the outfit feels intentional.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "slip-dress-layering-rule",
    name: "Slip Dress Layering Rule",
    aestheticTags: ["quiet luxury", "clean minimal", "minimalist"],
    occasionTags: ["date", "dinner", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "petite", "modest layering"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["slip dress", "blazer", "light sweater"],
      colors: ["black", "champagne", "sage", "cream"],
      fits: ["clean skim", "layered without bulk"],
      materials: ["silk", "satin-like matte texture", "soft wool"],
      shoes: ["kitten heels", "pointed flats", "boots"],
      accessories: ["simple chain", "structured handbag"],
    },
    avoid: {
      items: ["bodycon club dress"],
      colors: ["ultra-bright satin"],
      fits: ["clingy with no balancing layer"],
      materials: ["plastic-shine satin"],
      styleSignals: ["overly nightlife-coded styling"],
    },
    why: "A slip dress feels elevated fastest when balanced with a structured or cozy third piece.",
    scoringImpact: {
      addPointsFor: ["slip dress with blazer", "matte luxury texture"],
      removePointsFor: ["clubwear shine", "unbalanced slip styling"],
    },
    matchReason:
      "The extra layer gives the slip dress a polished finish instead of making it feel too bare.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "maxi-skirt-texture-balance",
    name: "Maxi Skirt Texture Balance",
    aestheticTags: ["clean minimal", "quiet luxury", "minimalist"],
    occasionTags: ["everyday", "date", "office"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "petite", "modest"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["maxi skirt", "fitted knit top", "light sweater"],
      colors: ["cream", "charcoal", "olive", "brown"],
      fits: ["long line", "defined waist", "clean hem"],
      materials: ["silk texture", "rib knit", "wool blend"],
      shoes: ["boots", "pointed flats", "kitten heels"],
      accessories: ["thin belt", "small handbag"],
    },
    avoid: {
      items: ["heavy stiff maxi with bulky knit"],
      colors: ["harsh busy print"],
      fits: ["waistless volume"],
      materials: ["cheap clingy jersey"],
      styleSignals: ["frumpy heaviness"],
    },
    why: "A textured maxi works best when the waist stays readable and the rest of the outfit stays controlled.",
    scoringImpact: {
      addPointsFor: ["waist definition", "textured neutral skirt"],
      removePointsFor: ["unstructured volume", "busy print"],
    },
    matchReason:
      "The long line feels refined because the waist and textures keep the outfit controlled.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "petite-vertical-line-rule",
    name: "Petite Vertical Line Rule",
    aestheticTags: ["clean girl", "clean minimal", "minimalist", "quiet luxury"],
    occasionTags: ["date", "daily wear", "everyday", "office"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["petite"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["high-rise bottoms", "cropped or waist-defined tops"],
      colors: ["monochrome neutrals", "soft tonal palettes"],
      fits: ["long vertical line", "clean waist placement"],
      materials: ["structured cotton", "smooth wool", "soft leather"],
      shoes: ["pointed-toe flats", "kitten heels", "sleek boots"],
      accessories: ["scaled-down handbag"],
    },
    avoid: {
      items: ["overwhelming oversized bag"],
      colors: ["hard horizontal break"],
      fits: ["cut-off midline", "heavy stacking"],
      materials: [],
      styleSignals: ["shortening proportion tricks"],
    },
    why: "Petite styling often works best when the silhouette keeps the eye moving vertically.",
    scoringImpact: {
      addPointsFor: ["high rise", "pointed toe", "vertical line"],
      removePointsFor: ["heavy horizontal break", "oversized bag"],
    },
    matchReason:
      "The high-rise waist and pointed toe help create a longer vertical line.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "petite-skirt-length-rule",
    name: "Petite Skirt Length Rule",
    aestheticTags: ["clean girl", "clean minimal", "minimalist"],
    occasionTags: ["date", "daily wear", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["petite"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["mini skirt", "maxi skirt with clean line"],
      colors: ["neutral palette"],
      fits: ["clear leg line", "waist emphasis"],
      materials: ["structured cotton", "silk texture"],
      shoes: ["pointed flats", "boots", "kitten heels"],
      accessories: ["lightweight accessories"],
    },
    avoid: {
      items: ["awkward knee-length skirt"],
      colors: [],
      fits: ["leg-line cut at widest point"],
      materials: [],
      styleSignals: ["visually shortened lower half"],
    },
    why: "For petite users, knee-length skirts can interrupt the leg line more than mini or full-length options.",
    scoringImpact: {
      addPointsFor: ["mini skirt", "full clean maxi", "leg-lengthening shoe"],
      removePointsFor: ["knee-length cut", "heavy calf break"],
    },
    matchReason:
      "The silhouette keeps the leg line cleaner instead of cutting it off at the knee.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "oversized-top-balance-rule",
    name: "Oversized Top Balance Rule",
    aestheticTags: ["clean minimal", "clean girl", "minimalist"],
    occasionTags: ["daily wear", "everyday", "date"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "oversized", "petite"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["oversized button-up", "lightweight blazer", "structured bottom"],
      colors: ["white", "cream", "beige", "navy"],
      fits: ["oversized top with structured or slimmer bottom", "belt if needed"],
      materials: ["cotton", "linen", "soft tailoring"],
      shoes: ["loafers", "pointed flats", "minimal sneakers"],
      accessories: ["thin belt", "small bag"],
    },
    avoid: {
      items: ["oversized top plus oversized bottom"],
      colors: [],
      fits: ["swallowed silhouette"],
      materials: ["stiff bulky layer"],
      styleSignals: ["unintentional shapelessness"],
    },
    why: "An oversized top needs a clearer counterbalance so the silhouette still feels intentional.",
    scoringImpact: {
      addPointsFor: ["structured bottom", "belted shape", "clean oversized shirt"],
      removePointsFor: ["double-oversized balance loss"],
    },
    matchReason:
      "The oversized layer feels cleaner because the rest of the outfit keeps the shape controlled.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "structured-softness-contrast",
    name: "Structure and Softness Contrast",
    aestheticTags: ["quiet luxury", "clean minimal", "minimalist"],
    occasionTags: ["date", "office", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "balanced"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["structured blazer", "soft dress", "fluid blouse", "clean trouser"],
      colors: ["cream", "camel", "black", "navy"],
      fits: ["one structured piece plus one soft piece"],
      materials: ["wool", "silk", "linen", "soft leather"],
      shoes: ["kitten heels", "loafers", "pointed flats"],
      accessories: ["simple gold jewelry"],
    },
    avoid: {
      items: ["all-soft no structure", "all-rigid no softness"],
      colors: [],
      fits: ["stiff overall silhouette"],
      materials: ["plastic shine"],
      styleSignals: ["one-note styling"],
    },
    why: "The feminine clean-luxury look gets stronger when softness and structure are both present.",
    scoringImpact: {
      addPointsFor: ["contrast of soft and structured pieces", "balanced silhouette"],
      removePointsFor: ["one-note styling", "rigid heaviness"],
    },
    matchReason:
      "The contrast between soft and structured pieces makes the look feel polished and balanced.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "natural-texture-quiet-luxury",
    name: "Natural Texture Quiet Luxury",
    aestheticTags: ["quiet luxury", "clean minimal", "minimalist"],
    occasionTags: ["date", "office", "everyday", "daily wear"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["simple refined basics"],
      colors: ["cream", "camel", "brown", "olive", "charcoal"],
      fits: ["clean skim", "intentional drape"],
      materials: ["cotton", "linen", "silk", "wool", "cashmere", "leather", "suede"],
      shoes: ["leather loafers", "pointed flats", "boots"],
      accessories: ["structured bag", "silk scarf"],
    },
    avoid: {
      items: ["plastic-looking statement piece"],
      colors: ["harsh synthetic brights"],
      fits: [],
      materials: ["synthetic shine", "plastic-looking satin"],
      styleSignals: ["fake luxury cues"],
    },
    why: "Texture and material quality do more to signal quiet luxury than logos or trend pieces.",
    scoringImpact: {
      addPointsFor: ["linen", "silk", "leather", "suede", "cashmere"],
      removePointsFor: ["synthetic sheen", "fake-luxury shine"],
    },
    matchReason:
      "Natural textures like silk, linen, and leather create a quiet-luxury feel without logos.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "neutral-palette-depth",
    name: "Neutral Palette Depth",
    aestheticTags: ["clean minimal", "quiet luxury", "clean girl", "minimalist"],
    occasionTags: ["date", "daily wear", "office", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["neutral core pieces"],
      colors: ["beige", "camel", "cream", "white", "navy", "charcoal", "black"],
      fits: ["simple and clean"],
      materials: ["textured neutrals"],
      shoes: ["neutral leather shoes"],
      accessories: ["gold jewelry", "structured neutral bag"],
    },
    avoid: {
      items: [],
      colors: ["neon", "loud contrast pattern"],
      fits: [],
      materials: ["flat cheap-looking fabric with no depth"],
      styleSignals: ["color overload"],
    },
    why: "Neutral outfits feel richer when depth comes from texture, tone shifts, and a restrained palette.",
    scoringImpact: {
      addPointsFor: ["neutral palette", "tonal dressing", "textured depth"],
      removePointsFor: ["color overload", "high-contrast pattern clash"],
    },
    matchReason:
      "The neutral palette keeps the outfit refined while texture adds enough depth to avoid feeling flat.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "soft-accent-discipline",
    name: "Soft Accent Discipline",
    aestheticTags: ["clean girl", "clean minimal", "quiet luxury"],
    occasionTags: ["daily wear", "date", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["neutral base with one soft accent"],
      colors: ["sage", "matcha", "soft pastel", "brown", "olive"],
      fits: ["clean silhouette"],
      materials: ["cotton", "linen", "soft knit"],
      shoes: ["neutral shoes"],
      accessories: ["simple gold jewelry"],
    },
    avoid: {
      items: [],
      colors: ["neon", "ultra-bright accent pile-up"],
      fits: [],
      materials: [],
      styleSignals: ["too many accent colors"],
    },
    why: "One muted accent can keep a neutral outfit interesting without breaking the clean-luxury feel.",
    scoringImpact: {
      addPointsFor: ["muted accent", "sage", "olive", "soft pastel"],
      removePointsFor: ["too many accent colors", "neon pop"],
    },
    matchReason:
      "A muted accent adds interest without breaking the clean, expensive-looking palette.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "quiet-luxury-no-logo-feminine",
    name: "Feminine Quiet Luxury No Logo",
    aestheticTags: ["quiet luxury", "clean minimal", "minimalist"],
    occasionTags: ["date", "office", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["logo-free basics", "structured bag", "refined shoes"],
      colors: ["neutral palette"],
      fits: ["clean lines", "precise tailoring"],
      materials: ["natural fibers", "leather", "suede"],
      shoes: ["loafers", "pointed flats", "boots"],
      accessories: ["minimal jewelry"],
    },
    avoid: {
      items: ["visible logo belt", "logo-heavy bag"],
      colors: [],
      fits: [],
      materials: ["plastic sheen"],
      styleSignals: ["visible logos", "junior costume styling"],
    },
    why: "Quiet luxury in this feminine module depends on polish, proportion, and material quality more than obvious branding.",
    scoringImpact: {
      addPointsFor: ["logo-free styling", "structured bag", "precise tailoring"],
      removePointsFor: ["visible logos", "cheap-looking statement branding"],
    },
    matchReason:
      "The look feels more elevated because it relies on proportion and texture instead of logos.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "minimal-accessories-warmth",
    name: "Minimal Accessories Warmth",
    aestheticTags: ["clean girl", "clean minimal", "quiet luxury"],
    occasionTags: ["date", "daily wear", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "petite"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["simple outfit base"],
      colors: ["neutral palette", "warm metal accents"],
      fits: ["clean and uncluttered"],
      materials: ["gold-tone metal", "silk scarf", "leather bag"],
      shoes: ["refined neutral shoes"],
      accessories: ["dainty gold hoops", "simple chains", "thin belt", "classic sunglasses"],
    },
    avoid: {
      items: ["accessory overload"],
      colors: ["too many mixed metals with no logic"],
      fits: [],
      materials: ["cheap plastic accessory finish"],
      styleSignals: ["trying too hard with add-ons"],
    },
    why: "A few warm, clean accessories can finish a minimal outfit without making it noisy.",
    scoringImpact: {
      addPointsFor: ["gold hoops", "simple chain", "thin belt"],
      removePointsFor: ["too many accessories", "plastic-looking jewelry"],
    },
    matchReason:
      "The minimal jewelry adds warmth without taking over the outfit.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "budget-high-low-anchor-piece",
    name: "Budget High-Low Anchor Piece",
    aestheticTags: ["clean girl", "clean minimal", "quiet luxury", "minimalist"],
    occasionTags: ["date", "daily wear", "everyday", "office"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200"],
    bodyOrFitTags: ["general", "budget conscious"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["one anchor piece", "versatile basics", "high-low mix"],
      colors: ["neutral repeat-wear palette"],
      fits: ["clean basics before trend pieces"],
      materials: ["cotton", "linen", "thrifted leather", "silk scarf"],
      shoes: ["versatile loafers", "pointed flats", "neutral sneakers"],
      accessories: ["only if it supports repeat wear"],
    },
    avoid: {
      items: ["multiple trend pieces at once"],
      colors: ["impulse statement color buys"],
      fits: [],
      materials: ["cheap trend fabric"],
      styleSignals: ["luxury-only expectation"],
    },
    why: "A stronger anchor piece plus versatile basics usually reads more expensive than spreading the budget across too many weak items.",
    scoringImpact: {
      addPointsFor: ["core-piece strategy", "versatile basics", "repeat-wear value"],
      removePointsFor: ["too many trend pieces", "budget dilution"],
    },
    matchReason:
      "The outfit feels more elevated because the budget is focused on the pieces that matter most.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "warm-climate-light-fabric-feminine",
    name: "Warm Climate Light Fabric Feminine",
    aestheticTags: ["clean girl", "clean minimal", "quiet luxury", "minimalist"],
    occasionTags: ["daily wear", "date", "travel", "everyday"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["warm climate", "hot", "tropical", "all regions"],
    prioritize: {
      items: ["cotton tee", "linen shirt", "lightweight dress", "airy trouser"],
      colors: ["cream", "white", "sage", "stone", "olive"],
      fits: ["breathable", "clean drape", "not clingy"],
      materials: ["linen", "cotton", "light silk"],
      shoes: ["loafers", "pointed flats", "minimal sandals if refined"],
      accessories: ["lightweight scarf", "small structured bag"],
    },
    avoid: {
      items: ["heavy blazer with no balance"],
      colors: ["overly dark all-over if user wants breathable look"],
      fits: ["sticky clingy fabric fit"],
      materials: ["heavy synthetics", "plastic sheen"],
      styleSignals: ["weather mismatch"],
    },
    why: "Warm-weather clean styling looks stronger when the fabrics breathe and still hold a polished line.",
    scoringImpact: {
      addPointsFor: ["linen", "cotton", "breathable silhouette"],
      removePointsFor: ["heavy synthetic", "climate-mismatched layer"],
    },
    matchReason:
      "The light fabric keeps the outfit polished while still making sense for warm weather.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "office-clean-minimal-polish",
    name: "Office Clean Minimal Polish",
    aestheticTags: ["clean minimal", "minimalist", "quiet luxury", "smart casual"],
    occasionTags: ["office", "everyday", "daily wear"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "classy", "balanced"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["tailored trousers", "silk button-up", "lightweight sweater", "structured blazer"],
      colors: ["navy", "cream", "charcoal", "camel"],
      fits: ["clean drape", "waist-aware structure"],
      materials: ["silk", "cotton", "wool blend", "cashmere"],
      shoes: ["loafers", "pointed-toe flats", "slingbacks"],
      accessories: ["structured bag", "simple jewelry"],
    },
    avoid: {
      items: ["clubwear top"],
      colors: ["neon accent", "busy print"],
      fits: ["too casual sloppy fit"],
      materials: ["cheap shiny polyester"],
      styleSignals: ["overdone nightlife cues"],
    },
    why: "Office-ready clean minimalism depends on calm structure, clean drape, and quiet polish.",
    scoringImpact: {
      addPointsFor: ["tailored office pieces", "neutral polish", "structured bag"],
      removePointsFor: ["nightlife styling", "cheap shine"],
    },
    matchReason:
      "The tailored pieces keep the outfit polished and office-ready without looking severe.",
    confidence: "high",
    sourceModule: feminineSourceModule,
  },
  {
    id: "clean-girl-vs-quiet-luxury-distinction",
    name: "Clean Girl vs Quiet Luxury Distinction",
    aestheticTags: ["clean girl", "clean minimal", "quiet luxury", "minimalist"],
    occasionTags: ["date", "daily wear", "everyday", "office"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["clean girl wellness basics", "quiet luxury material upgrades"],
      colors: ["neutral palette", "soft tonal accents"],
      fits: ["polished but not overworked"],
      materials: ["natural fibers", "soft leather", "textured knit"],
      shoes: ["loafers", "pointed flats", "minimal sneakers"],
      accessories: ["gold hoops", "structured bag"],
    },
    avoid: {
      items: ["mislabeling every neutral outfit as the same thing"],
      colors: [],
      fits: [],
      materials: ["cheap shortcuts that mimic luxury badly"],
      styleSignals: ["confusing wellness-clean with mature luxury if the brief says otherwise"],
    },
    why: "Clean Girl and Quiet Luxury overlap, but one is more youthful and effortless while the other is more material- and tailoring-driven.",
    scoringImpact: {
      addPointsFor: ["brief-appropriate interpretation", "material-aware styling"],
      removePointsFor: ["misaligned aesthetic signal"],
    },
    matchReason:
      "The styling fits your clean-minimal brief without pushing the look into a louder or less refined lane.",
    confidence: "medium",
    sourceModule: feminineSourceModule,
  },
  {
    id: "masculine-office-smart-casual-core",
    name: "Masculine Office Smart Casual Core",
    aestheticTags: ["smart casual", "office", "old money", "luxury neutral", "quiet luxury"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "slim", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["oxford shirt", "tailored trousers", "loafers"],
      colors: ["navy", "charcoal", "cream", "camel"],
      fits: ["clean tailoring", "polished silhouette", "not clingy"],
      materials: ["oxford cotton", "wool blend", "cotton"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["leather belt", "simple watch", "structured work bag"],
    },
    avoid: {
      items: ["graphic tee", "hoodie", "gym sneakers"],
      colors: ["neon", "ultra-bright sport color"],
      fits: ["skin-tight", "sloppy oversized"],
      materials: ["shiny synthetic"],
      styleSignals: ["loud logos", "clubwear shine", "overly sporty office styling"],
    },
    why: "The strongest masculine office-smart-casual looks stay polished, comfortable, and workplace-credible without tipping into stiff formalwear.",
    scoringImpact: {
      addPointsFor: ["office-ready tailoring", "clean shoes", "low visual noise"],
      removePointsFor: ["graphic casualwear", "gym styling", "clubwear shine"],
    },
    matchReason:
      "This look keeps office polish without feeling overly formal.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "oxford-trouser-loafer-office-foundation",
    name: "Oxford Trouser Loafer Office Foundation",
    aestheticTags: ["smart casual", "office", "old money", "minimalist"],
    occasionTags: ["office", "work", "interview", "meeting"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "slim", "regular", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["oxford shirt", "button-up shirt", "tailored trousers"],
      colors: ["white/off-white", "soft blue", "navy", "charcoal"],
      fits: ["clean line", "pressed finish", "clean tailoring"],
      materials: ["oxford cotton", "cotton", "wool blend"],
      shoes: ["loafers"],
      accessories: ["leather belt", "simple watch"],
    },
    avoid: {
      items: ["club shirt", "distressed denim"],
      colors: ["neon", "loud contrast pattern"],
      fits: ["skinny", "baggy with no structure"],
      materials: ["glossy synthetic"],
      styleSignals: ["casual-nightlife crossover"],
    },
    why: "A crisp shirt, clean trouser line, and refined loafer solve the office brief quickly and credibly.",
    scoringImpact: {
      addPointsFor: ["oxford shirt", "tailored trousers", "loafers"],
      removePointsFor: ["distressed denim", "nightlife top"],
    },
    matchReason:
      "The tailored trousers and clean shoes make the outfit work-ready.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "knit-polo-chino-office-casual",
    name: "Knit Polo Chino Office Casual",
    aestheticTags: ["smart casual", "office", "quiet luxury", "old money"],
    occasionTags: ["office", "work", "business casual", "meeting"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "warm climate", "mild weather"],
    prioritize: {
      items: ["knit polo", "chinos", "clean clothing"],
      colors: ["navy", "beige", "camel", "olive"],
      fits: ["not clingy", "clean line", "structured but comfortable"],
      materials: ["cotton knit", "cotton", "linen blend"],
      shoes: ["loafers", "minimalist sneakers if office is casual"],
      accessories: ["leather belt", "clean laptop bag"],
    },
    avoid: {
      items: ["sport polo", "gym sneakers", "hoodie"],
      colors: ["neon", "gym color pop"],
      fits: ["clingy torso fit", "sloppy oversized"],
      materials: ["high-shine performance fabric"],
      styleSignals: ["too sporty for office"],
    },
    why: "A knit polo and chinos keep the outfit breathable and comfortable while still reading business-casual.",
    scoringImpact: {
      addPointsFor: ["knit polo", "chinos", "casual office comfort"],
      removePointsFor: ["sport polo styling", "gym sneaker energy"],
    },
    matchReason:
      "The knit layer adds comfort while keeping the silhouette sharp.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "quarter-zip-office-layer",
    name: "Quarter-Zip Office Layer",
    aestheticTags: ["smart casual", "office", "minimalist", "quiet luxury"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "cool weather", "mild weather"],
    prioritize: {
      items: ["quarter-zip", "button-up shirt", "tailored trousers"],
      colors: ["charcoal", "navy", "cream", "soft blue"],
      fits: ["neat layering", "layered without bulk", "clean tailoring"],
      materials: ["merino", "cotton", "soft wool blend"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["simple watch", "clean laptop bag"],
    },
    avoid: {
      items: ["technical quarter-zip", "gym runner"],
      colors: ["neon zip detail"],
      fits: ["bulky layering"],
      materials: ["shiny performance knit"],
      styleSignals: ["golf-athletic office crossover"],
    },
    why: "The quarter-zip is a strong office-smart-casual bridge when the fabrics stay refined and the layering stays clean.",
    scoringImpact: {
      addPointsFor: ["quarter-zip layering", "clean shirt base", "cool-weather office"],
      removePointsFor: ["technical sportswear", "bulky layer stack"],
    },
    matchReason:
      "The layer keeps the outfit comfortable for long wear while still reading polished.",
    confidence: "medium",
    sourceModule: officeSourceModule,
  },
  {
    id: "blazer-tee-chino-business-casual",
    name: "Blazer Tee Chino Business Casual",
    aestheticTags: ["smart casual", "office", "minimalist", "luxury neutral"],
    occasionTags: ["office", "business casual", "meeting", "work"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["blazer", "simple premium tee", "chinos"],
      colors: ["navy", "charcoal", "cream", "camel"],
      fits: ["soft structure", "balanced proportions", "not clingy"],
      materials: ["soft tailoring", "cotton", "wool blend"],
      shoes: ["loafers", "minimalist sneakers if office is casual"],
      accessories: ["structured work bag", "simple watch"],
    },
    avoid: {
      items: ["graphic tee", "formal suit trouser", "hoodie"],
      colors: ["clubwear contrast"],
      fits: ["boxy blazer with sloppy tee"],
      materials: ["shiny suiting"],
      styleSignals: ["trying too formal or too casual at once"],
    },
    why: "A soft blazer over a premium tee keeps the look current, approachable, and still office-safe in more flexible dress codes.",
    scoringImpact: {
      addPointsFor: ["soft blazer", "clean tee", "business casual office"],
      removePointsFor: ["graphic tee", "stiff suiting", "hoodie"],
    },
    matchReason:
      "The clean layer stack makes the outfit work-ready without feeling corporate.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "merino-sweater-chelsea-office",
    name: "Merino Sweater Chelsea Office",
    aestheticTags: ["office", "smart casual", "quiet luxury", "old money"],
    occasionTags: ["office", "work", "meeting", "interview"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "classy", "cool weather"],
    regionOrClimateTags: ["all regions", "cool weather", "winter", "autumn"],
    prioritize: {
      items: ["merino/cotton sweaters", "tailored trousers", "clean clothing"],
      colors: ["charcoal", "navy", "camel", "olive"],
      fits: ["clean line", "polished silhouette", "not clingy"],
      materials: ["merino", "wool blend", "cotton"],
      shoes: ["chelsea boots", "loafers"],
      accessories: ["leather belt", "structured work bag"],
    },
    avoid: {
      items: ["graphic sweatshirt", "gym sneaker"],
      colors: ["neon", "electric color pop"],
      fits: ["baggy hem stack"],
      materials: ["fuzzy sloppy knit"],
      styleSignals: ["too weekend casual"],
    },
    why: "A clean merino layer and sleek boot keep cooler-weather office looks comfortable while preserving polish.",
    scoringImpact: {
      addPointsFor: ["merino sweater", "chelsea boots", "cool-weather office"],
      removePointsFor: ["sweatshirt styling", "gym sneaker"],
    },
    matchReason:
      "The knit layer adds comfort while the sharper shoes keep the outfit credible for work.",
    confidence: "medium",
    sourceModule: officeSourceModule,
  },
  {
    id: "masculine-office-budget-core",
    name: "Masculine Office Budget Core",
    aestheticTags: ["smart casual", "office", "minimalist"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["under $100", "$100-$200"],
    bodyOrFitTags: ["general", "regular", "slim", "budget conscious"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["oxford shirt", "chinos", "clean clothing"],
      colors: ["white/off-white", "navy", "beige", "charcoal"],
      fits: ["clean tailoring", "structured but comfortable", "clean line"],
      materials: ["cotton", "oxford cotton", "budget-friendly natural feel"],
      shoes: ["loafers", "minimalist sneakers if office is casual"],
      accessories: ["leather belt"],
    },
    avoid: {
      items: ["blazer", "coat", "extra accessory pileup"],
      colors: ["neon", "graphic contrast"],
      fits: ["overcomplicated layering"],
      materials: ["cheap shine"],
      styleSignals: ["forcing a five-piece outfit on a lean budget"],
    },
    why: "At lower office budgets, credibility comes from a clean top-bottom-shoe core rather than forcing extra layers.",
    scoringImpact: {
      addPointsFor: ["core-piece office logic", "budget realism", "clean shoe"],
      removePointsFor: ["budget dilution", "forced outerwear"],
    },
    matchReason:
      "This outfit stays within budget by focusing on office-ready core pieces.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "masculine-premium-office-upgrade",
    name: "Masculine Premium Office Upgrade",
    aestheticTags: ["smart casual", "office", "old money", "quiet luxury", "luxury neutral"],
    occasionTags: ["office", "work", "meeting", "interview"],
    stylePreferenceTags: ["masculine"],
    budgetTags: ["$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["blazer", "merino/cotton sweaters", "structured work bag"],
      colors: ["navy", "charcoal", "camel", "muted burgundy"],
      fits: ["soft structure", "clean tailoring", "polished silhouette"],
      materials: ["wool blend", "merino", "soft tailoring", "leather"],
      shoes: ["loafers", "chelsea boots"],
      accessories: ["simple watch", "structured work bag"],
    },
    avoid: {
      items: ["loud sneaker", "graphic knit"],
      colors: ["harsh statement brights"],
      fits: ["stiff corporate suiting"],
      materials: ["plastic sheen"],
      styleSignals: ["showy luxury instead of quiet polish"],
    },
    why: "Higher office budgets should show their value through better layers, better shoes, and better carry pieces instead of louder styling.",
    scoringImpact: {
      addPointsFor: ["premium blazer", "better shoe", "structured work bag"],
      removePointsFor: ["showy luxury cue", "corporate stiffness"],
    },
    matchReason:
      "The stronger layer and sharper shoes make the outfit feel more premium without losing office ease.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "feminine-office-clean-minimal-core",
    name: "Feminine Office Clean Minimal Core",
    aestheticTags: ["clean minimal", "minimalist", "smart casual", "office", "quiet luxury"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["blouse", "tailored trousers", "structured bag"],
      colors: ["cream", "navy", "charcoal", "camel"],
      fits: ["clean drape", "waist-aware structure", "not clingy"],
      materials: ["silk", "cotton", "wool blend"],
      shoes: ["pointed flats", "loafers", "slingbacks"],
      accessories: ["minimal jewelry", "structured work bag"],
    },
    avoid: {
      items: ["clubwear top", "gym sneaker", "distressed denim"],
      colors: ["neon", "overly bright contrast"],
      fits: ["too tight", "too revealing"],
      materials: ["shiny polyester"],
      styleSignals: ["nightlife styling in office context"],
    },
    why: "Feminine office-clean-minimal looks are strongest when they combine calm structure, soft polish, and practical long-wear comfort.",
    scoringImpact: {
      addPointsFor: ["office blouse", "tailored trouser", "structured bag"],
      removePointsFor: ["clubwear top", "gym sneaker", "cheap shine"],
    },
    matchReason:
      "The tailored pieces keep the outfit polished and office-ready without looking severe.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "silk-blouse-tailored-trouser-office",
    name: "Silk Blouse Tailored Trouser Office",
    aestheticTags: ["clean minimal", "quiet luxury", "office", "smart casual"],
    occasionTags: ["office", "meeting", "interview", "work"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "classy", "regular"],
    regionOrClimateTags: ["all regions", "mild weather", "warm climate"],
    prioritize: {
      items: ["silk/blend blouses", "tailored trousers"],
      colors: ["cream", "soft blue", "charcoal", "muted burgundy"],
      fits: ["clean drape", "polished silhouette", "not clingy"],
      materials: ["silk", "light silk", "wool blend"],
      shoes: ["pointed flats", "loafers", "low block heels"],
      accessories: ["structured work bag", "minimal jewelry"],
    },
    avoid: {
      items: ["party cami", "club heel"],
      colors: ["neon", "hyper-saturated jewel tone"],
      fits: ["clingy satin line"],
      materials: ["cheap shiny satin"],
      styleSignals: ["too evening-coded for office"],
    },
    why: "A fluid blouse plus clean trouser line gives feminine office looks polish quickly, especially for meetings and client-facing days.",
    scoringImpact: {
      addPointsFor: ["silk blouse", "tailored trousers", "meeting polish"],
      removePointsFor: ["cheap shiny satin", "party-coded pieces"],
    },
    matchReason:
      "The fluid blouse and clean trouser line make the outfit feel polished but still easy to wear all day.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "fine-knit-wide-leg-office",
    name: "Fine Knit Wide-Leg Office",
    aestheticTags: ["clean minimal", "minimalist", "office", "quiet luxury"],
    occasionTags: ["office", "work", "business casual", "meeting"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["fine knit top", "wide-leg trousers", "structured bag"],
      colors: ["navy", "cream", "camel", "olive"],
      fits: ["clean drape", "balanced proportions", "not clingy"],
      materials: ["soft knit", "cotton", "wool blend"],
      shoes: ["loafers", "pointed flats", "low block heels"],
      accessories: ["minimal jewelry", "structured work bag"],
    },
    avoid: {
      items: ["graphic tee", "gym runner"],
      colors: ["neon accent"],
      fits: ["wide plus shapeless with no anchor"],
      materials: ["synthetic shine"],
      styleSignals: ["too loungey for office"],
    },
    why: "A fine knit with a clean wide-leg trouser gives feminine office looks comfort, movement, and polish without becoming stiff.",
    scoringImpact: {
      addPointsFor: ["fine knit", "wide-leg trousers", "work-ready balance"],
      removePointsFor: ["shapeless volume", "gym sneakers"],
    },
    matchReason:
      "The knit layer adds comfort while the tailored line keeps the outfit office-ready.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "blazer-tee-straight-trouser-office",
    name: "Blazer Tee Straight Trouser Office",
    aestheticTags: ["smart casual", "office", "minimalist", "clean minimal"],
    occasionTags: ["office", "business casual", "work", "meeting"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["blazer", "simple premium tee", "straight-leg trousers"],
      colors: ["charcoal", "cream", "navy", "camel"],
      fits: ["soft structure", "balanced proportions", "clean line"],
      materials: ["soft tailoring", "cotton", "wool blend"],
      shoes: ["pointed flats", "loafers", "minimalist sneakers if office is casual"],
      accessories: ["structured work bag", "simple watch"],
    },
    avoid: {
      items: ["graphic tee", "party heel"],
      colors: ["overly loud contrast"],
      fits: ["boxy with no waist control"],
      materials: ["shiny blazer fabric"],
      styleSignals: ["too nightlife or too corporate at once"],
    },
    why: "A clean tee under a softer blazer keeps the outfit current and office-friendly, especially in business-casual environments.",
    scoringImpact: {
      addPointsFor: ["blazer", "clean tee", "straight trouser"],
      removePointsFor: ["graphic tee", "party-coded pieces"],
    },
    matchReason:
      "The structured blazer and simple base keep the outfit intentional without making it feel heavy.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "midi-skirt-structured-knit-office",
    name: "Midi Skirt Structured Knit Office",
    aestheticTags: ["clean minimal", "office", "quiet luxury", "minimalist"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "modest", "classy"],
    regionOrClimateTags: ["all regions", "mild weather", "cool weather"],
    prioritize: {
      items: ["midi/slip skirts", "fine knit top", "structured bag"],
      colors: ["cream", "charcoal", "camel", "olive"],
      fits: ["clean drape", "waist-aware structure", "not clingy"],
      materials: ["silk texture", "soft knit", "wool blend"],
      shoes: ["pointed flats", "slingbacks", "chelsea boots"],
      accessories: ["minimal jewelry", "subtle scarf"],
    },
    avoid: {
      items: ["clubwear skirt", "sparkle heel"],
      colors: ["neon", "loud party palette"],
      fits: ["too bodycon", "sloppy waistless volume"],
      materials: ["clubwear shine"],
      styleSignals: ["too evening-specific for work"],
    },
    why: "A calm midi or slip-skirt formula keeps the office look feminine and polished while remaining appropriate for long wear.",
    scoringImpact: {
      addPointsFor: ["midi skirt", "structured knit", "office polish"],
      removePointsFor: ["party skirt", "sparkle styling"],
    },
    matchReason:
      "The structured knit and cleaner skirt line keep the outfit work-ready without losing softness.",
    confidence: "medium",
    sourceModule: officeSourceModule,
  },
  {
    id: "cardigan-high-rise-trouser-office",
    name: "Cardigan High-Rise Trouser Office",
    aestheticTags: ["clean minimal", "smart casual", "office", "minimalist"],
    occasionTags: ["office", "work", "business casual", "meeting"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "any"],
    bodyOrFitTags: ["general", "petite", "regular", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["cardigan", "high-rise bottoms", "structured bag"],
      colors: ["cream", "navy", "camel", "soft blue"],
      fits: ["high-rise", "long vertical line", "clean drape"],
      materials: ["cotton knit", "merino", "wool blend"],
      shoes: ["pointed flats", "loafers", "minimalist sneakers if office is casual"],
      accessories: ["structured work bag", "minimal jewelry"],
    },
    avoid: {
      items: ["hoodie", "gym sneaker"],
      colors: ["athletic brights"],
      fits: ["slouchy with no structured element"],
      materials: ["fleece-heavy casual fabric"],
      styleSignals: ["too weekend casual for work"],
    },
    why: "A cardigan and high-rise trouser formula keeps feminine office outfits comfortable and repeatable while preserving a clear line.",
    scoringImpact: {
      addPointsFor: ["cardigan", "high-rise bottom", "structured bag"],
      removePointsFor: ["hoodie styling", "slouchy office mix"],
    },
    matchReason:
      "The cardigan keeps the outfit easy for long wear while the high-rise line keeps it polished.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "feminine-petite-office-line",
    name: "Feminine Petite Office Line",
    aestheticTags: ["clean minimal", "minimalist", "office", "smart casual"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["petite"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["high-rise bottoms", "fine knit top", "small structured bag"],
      colors: ["cream", "navy", "camel", "soft blue"],
      fits: ["long vertical line", "waist-aware structure", "clean line"],
      materials: ["cotton", "soft knit", "wool blend"],
      shoes: ["pointed flats", "low block heels", "slingbacks"],
      accessories: ["small structured bag", "minimal jewelry"],
    },
    avoid: {
      items: ["oversized tote", "awkward knee-length cut"],
      colors: [],
      fits: ["heavy volume with no break"],
      materials: [],
      styleSignals: ["proportion-breaking office accessories"],
    },
    why: "Petite office dressing reads cleaner when the waist stays clear, the shoe line stays refined, and the bag scale stays controlled.",
    scoringImpact: {
      addPointsFor: ["high-rise line", "pointed shoe", "scaled bag"],
      removePointsFor: ["oversized tote", "leg-shortening cut"],
    },
    matchReason:
      "The high-rise line and refined shoes help the office outfit feel longer and cleaner.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "feminine-office-budget-anchor",
    name: "Feminine Office Budget Anchor",
    aestheticTags: ["clean minimal", "office", "minimalist", "smart casual"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["feminine"],
    budgetTags: ["under $100", "$100-$200"],
    bodyOrFitTags: ["general", "budget conscious", "regular"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["fine knit top", "tailored trousers", "pointed flats"],
      colors: ["cream", "navy", "charcoal", "camel"],
      fits: ["clean drape", "polished silhouette", "not clingy"],
      materials: ["cotton", "soft knit", "budget-friendly natural feel"],
      shoes: ["pointed flats", "loafers"],
      accessories: ["minimal jewelry", "only if it supports repeat wear"],
    },
    avoid: {
      items: ["blazer", "coat", "extra accessory stack"],
      colors: ["neon", "loud print"],
      fits: ["overcomplicated layering"],
      materials: ["cheap shine"],
      styleSignals: ["forcing too many office extras into a low budget"],
    },
    why: "For lower office budgets, the smartest spend is a clean top-bottom-shoe base that still looks work-appropriate.",
    scoringImpact: {
      addPointsFor: ["budget office core", "repeat-wear basics", "clean flats"],
      removePointsFor: ["forced blazer spend", "too many extras"],
    },
    matchReason:
      "This outfit stays within budget by focusing on office-ready essentials instead of extra layers.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "mixed-open-business-casual-core",
    name: "Mixed Open Business Casual Core",
    aestheticTags: ["smart casual", "minimalist", "office", "luxury neutral", "quiet luxury"],
    occasionTags: ["office", "work", "business casual", "meeting"],
    stylePreferenceTags: ["mixed / open to all", "androgynous"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["blazer", "simple premium tee", "straight-leg trousers"],
      colors: ["navy", "charcoal", "cream", "olive"],
      fits: ["structured but comfortable", "balanced proportions", "clean line"],
      materials: ["cotton", "wool blend", "soft tailoring"],
      shoes: ["loafers", "minimalist sneakers if office is casual", "chelsea boots"],
      accessories: ["structured work bag", "simple watch"],
    },
    avoid: {
      items: ["graphic tee", "clubwear top", "gym sneaker"],
      colors: ["neon", "sport-only bright palette"],
      fits: ["too tight", "too oversized unless balanced"],
      materials: ["shiny synthetic"],
      styleSignals: ["overly gendered office signaling"],
    },
    why: "Mixed/open office styling works best when the pieces feel neutral, structured, and comfortable without leaning into narrow gender cues.",
    scoringImpact: {
      addPointsFor: ["neutral layering", "clean shoes", "business-casual balance"],
      removePointsFor: ["graphic casualwear", "overly gendered signals"],
    },
    matchReason:
      "The neutral layers and clean shoes keep the outfit structured, comfortable, and office-ready.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
  {
    id: "neutral-layer-office-flex",
    name: "Neutral Layer Office Flex",
    aestheticTags: ["minimalist", "smart casual", "office", "luxury neutral", "quiet luxury"],
    occasionTags: ["office", "work", "meeting", "business casual"],
    stylePreferenceTags: ["mixed / open to all", "androgynous"],
    budgetTags: ["$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "relaxed", "oversized", "tall-friendly"],
    regionOrClimateTags: ["all regions", "cool weather", "mild weather"],
    prioritize: {
      items: ["overshirt/light jacket", "neutral knit", "tailored bottom"],
      colors: ["charcoal", "navy", "stone", "olive"],
      fits: ["layered without bulk", "balanced proportions", "longer layers"],
      materials: ["cotton", "soft wool blend", "linen blend"],
      shoes: ["minimalist sneakers if office is casual", "loafers", "chelsea boots"],
      accessories: ["clean laptop bag", "minimal jewelry"],
    },
    avoid: {
      items: ["hoodie", "parachute pant", "runner"],
      colors: ["loud sport contrast"],
      fits: ["double-oversized with no anchor"],
      materials: ["nylon shine"],
      styleSignals: ["too casual creative-office spillover"],
    },
    why: "A neutral layered system gives mixed/open office looks flexibility and comfort while keeping one clear structured line.",
    scoringImpact: {
      addPointsFor: ["neutral layer", "tailored bottom", "clean office comfort"],
      removePointsFor: ["double-oversized imbalance", "sporty nylon shine"],
    },
    matchReason:
      "The layered neutral pieces keep the outfit flexible for work while still looking intentional.",
    confidence: "medium",
    sourceModule: officeSourceModule,
  },
  {
    id: "casual-office-clean-sneaker-rule",
    name: "Casual Office Clean Sneaker Rule",
    aestheticTags: ["smart casual", "office", "minimalist", "clean minimal"],
    occasionTags: ["office", "work", "business casual"],
    stylePreferenceTags: ["general"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general", "regular", "relaxed", "classy"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["clean clothing", "tailored trousers", "button-up shirt"],
      colors: ["white/off-white", "navy", "charcoal", "camel"],
      fits: ["structured but comfortable", "clean line", "balanced proportions"],
      materials: ["cotton", "wool blend", "leather"],
      shoes: ["minimalist sneakers if office is casual"],
      accessories: ["clean laptop bag", "simple watch"],
    },
    avoid: {
      items: ["gym sneakers", "club heel"],
      colors: ["neon accent"],
      fits: ["sloppy hem stack"],
      materials: ["mesh-heavy athletic fabric"],
      styleSignals: ["treating work sneakers like gym shoes"],
    },
    why: "Clean sneakers can work in casual offices, but only when the rest of the outfit stays tailored and quiet.",
    scoringImpact: {
      addPointsFor: ["minimal sneaker", "tailored support pieces", "casual office cue"],
      removePointsFor: ["gym sneaker", "athletic mesh signal"],
    },
    matchReason:
      "The clean sneakers work because the rest of the outfit keeps the office silhouette structured.",
    confidence: "medium",
    sourceModule: officeSourceModule,
  },
  {
    id: "office-low-visual-noise-discipline",
    name: "Office Low Visual Noise Discipline",
    aestheticTags: ["office", "smart casual", "minimalist", "clean minimal", "quiet luxury", "old money", "luxury neutral"],
    occasionTags: ["office", "work", "meeting", "interview", "business casual"],
    stylePreferenceTags: ["general"],
    budgetTags: ["under $100", "$100-$200", "$200-$350", "$350+", "any"],
    bodyOrFitTags: ["general"],
    regionOrClimateTags: ["all regions", "all climates"],
    prioritize: {
      items: ["clean clothing", "structured work bag", "coordinated accessories"],
      colors: ["navy", "charcoal", "beige", "cream", "olive", "soft blue"],
      fits: ["polished silhouette", "clean line", "not clingy"],
      materials: ["cotton", "wool blend", "merino", "leather"],
      shoes: ["refined shoes"],
      accessories: ["structured work bag", "minimal jewelry", "simple watch"],
    },
    avoid: {
      items: ["graphic tee", "distressed denim", "gym sneakers", "clubwear top"],
      colors: ["neon", "loud graphics", "overly sporty color blocking"],
      fits: ["too tight", "sloppy oversized"],
      materials: ["overly shiny synthetic fabrics"],
      styleSignals: ["high visual noise", "loud logos", "office-inappropriate reveal"],
    },
    why: "Most successful office-smart-casual outfits feel deliberate because they keep visual noise low and let structure do the work.",
    scoringImpact: {
      addPointsFor: ["low visual noise", "cohesive accessories", "quiet office palette"],
      removePointsFor: ["graphic clutter", "loud logos", "office-inappropriate reveal"],
    },
    matchReason:
      "The structured bag and minimal accessories make the look feel intentional.",
    confidence: "high",
    sourceModule: officeSourceModule,
  },
];

export function getStyleRulesForBrief(brief: StyleRuleBrief) {
  return styleRules.filter((rule) => {
    if (!hasTagOrWildcard(rule.aestheticTags, brief.aesthetic, ["general", "any"])) {
      return false;
    }

    if (!hasTagOrWildcard(rule.occasionTags, brief.occasion, ["general", "any"])) {
      return false;
    }

    if (
      !hasTagOrWildcard(rule.stylePreferenceTags as string[], brief.stylePreference, [
        "mixed / open to all",
        "general",
        "any",
      ])
    ) {
      return false;
    }

    if (!hasTagOrWildcard(rule.budgetTags as string[], brief.budget, ["any", "general"])) {
      return false;
    }

    const bodySignals = [brief.fitPreference, brief.bodyOrFit].filter(Boolean);

    if (bodySignals.length > 0) {
      const matchesBodyOrFit = bodySignals.some((signal) =>
        hasTagOrWildcard(rule.bodyOrFitTags as string[], signal, ["general", "any"]),
      );

      if (!matchesBodyOrFit) {
        return false;
      }
    }

    if (
      brief.region &&
      !hasTagOrWildcard(rule.regionOrClimateTags, brief.region, ["all regions", "general", "any"])
    ) {
      return false;
    }

    if (
      brief.climate &&
      !hasTagOrWildcard(rule.regionOrClimateTags, brief.climate, [
        "all climates",
        "general",
        "any",
      ])
    ) {
      return false;
    }

    return true;
  });
}

export type StyleRuleModuleAesthetic = Aesthetic | "quiet luxury";
export type StyleRuleModuleOccasion = Occasion | "dinner" | "casual date" | "smart casual evening";
