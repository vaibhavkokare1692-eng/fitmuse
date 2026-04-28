import { getStyleRulesForBrief } from "../data/styleRules.ts";

type RuleCheck = {
  label: string;
  brief: {
    aesthetic?: string;
    occasion?: string;
    stylePreference?: string;
    budget?: string;
    fitPreference?: string;
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
    },
    expectedRuleNames: ["Oxford Shirt Core"],
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
