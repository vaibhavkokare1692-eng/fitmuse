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
  sourceModule: "Masculine Old Money / Quiet Luxury Date System";
};

const sourceModule = "Masculine Old Money / Quiet Luxury Date System" as const;

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
    office: ["office"],
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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
    sourceModule,
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

    if (
      brief.fitPreference &&
      !hasTagOrWildcard(rule.bodyOrFitTags as string[], brief.fitPreference, [
        "general",
        "any",
      ])
    ) {
      return false;
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
