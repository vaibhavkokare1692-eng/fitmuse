import { getStyleRulesForBrief } from "../data/styleRules.ts";

type RuleCheck = {
  label: string;
  brief: {
    aesthetic?: string;
    occasion?: string;
    stylePreference?: string;
    budget?: string;
    fitPreference?: string;
    bodyOrFit?: string;
    region?: string;
    climate?: string;
  };
  expectedRuleNames: string[];
};

const checks: RuleCheck[] = [
  {
    label: "Masculine Old Money Date",
    brief: {
      aesthetic: "old money",
      occasion: "date",
      stylePreference: "masculine",
      budget: "$100-$200",
    },
    expectedRuleNames: [
      "Old Money Date Night Core",
      "Oxford Shirt Core",
      "Budget $100-$200 Core Outfit",
      "Leather Coordination Rule",
      "Avoid Logos",
    ],
  },
  {
    label: "Masculine Old Money Travel / Warm Climate",
    brief: {
      aesthetic: "old money",
      occasion: "travel",
      stylePreference: "masculine",
      climate: "hot",
    },
    expectedRuleNames: ["Travel and Weather Fabric Adjustment"],
  },
  {
    label: "Masculine Office Smart Casual",
    brief: {
      aesthetic: "smart casual",
      occasion: "office",
      stylePreference: "masculine",
      budget: "$200-$350",
    },
    expectedRuleNames: [
      "Masculine Office Smart Casual Core",
      "Oxford Trouser Loafer Office Foundation",
      "Masculine Premium Office Upgrade",
    ],
  },
  {
    label: "Feminine Clean Minimal Date",
    brief: {
      aesthetic: "clean minimal",
      occasion: "date",
      stylePreference: "feminine",
      budget: "$100-$200",
    },
    expectedRuleNames: [
      "Feminine Clean Minimal Date Core",
      "Structure and Softness Contrast",
      "Natural Texture Quiet Luxury",
      "Budget High-Low Anchor Piece",
    ],
  },
  {
    label: "Feminine Petite Everyday Clean",
    brief: {
      aesthetic: "clean girl",
      occasion: "daily wear",
      stylePreference: "feminine",
      bodyOrFit: "petite",
    },
    expectedRuleNames: [
      "Feminine Everyday Clean Core",
      "Petite Vertical Line Rule",
      "Petite Skirt Length Rule",
      "White Tee and Straight Jean Formula",
    ],
  },
  {
    label: "Feminine Office Clean Minimal",
    brief: {
      aesthetic: "clean minimal",
      occasion: "office",
      stylePreference: "feminine",
      budget: "$100-$200",
    },
    expectedRuleNames: [
      "Feminine Office Clean Minimal Core",
      "Silk Blouse Tailored Trouser Office",
      "Fine Knit Wide-Leg Office",
      "Office Low Visual Noise Discipline",
    ],
  },
  {
    label: "Mixed/Open Business Casual",
    brief: {
      aesthetic: "minimalist",
      occasion: "office",
      stylePreference: "mixed / open to all",
      budget: "$100-$200",
    },
    expectedRuleNames: [
      "Mixed Open Business Casual Core",
      "Neutral Layer Office Flex",
      "Casual Office Clean Sneaker Rule",
      "Office Low Visual Noise Discipline",
    ],
  },
];

function confidenceRank(confidence: string) {
  if (confidence === "high") {
    return 3;
  }

  if (confidence === "medium") {
    return 2;
  }

  return 1;
}

let hasFailure = false;

for (const check of checks) {
  const matchedRules = getStyleRulesForBrief(check.brief).sort((left, right) => {
    return confidenceRank(right.confidence) - confidenceRank(left.confidence);
  });

  const matchedRuleNames = matchedRules.map((rule) => rule.name);
  const missingExpected = check.expectedRuleNames.filter(
    (expectedRule) => !matchedRuleNames.includes(expectedRule),
  );

  if (missingExpected.length > 0) {
    hasFailure = true;
  }

  console.log(`\n=== ${check.label} ===`);
  console.log(`Brief: ${JSON.stringify(check.brief)}`);
  console.log(`Matched rules: ${matchedRules.length}`);
  console.log(
    `Rule names: ${matchedRuleNames.length > 0 ? matchedRuleNames.join(" | ") : "No matches"}`,
  );
  console.log(
    `Top match reasons: ${
      matchedRules.length > 0
        ? matchedRules
            .slice(0, 3)
            .map((rule) => `"${rule.matchReason}"`)
            .join(" | ")
        : "No match reasons"
    }`,
  );

  if (missingExpected.length > 0) {
    console.log(`Missing expected rules: ${missingExpected.join(" | ")}`);
  } else {
    console.log("Expected rules check: passed");
  }
}

if (hasFailure) {
  process.exitCode = 1;
}
