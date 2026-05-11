import {
  getRealOutfitPacksForBrief,
  getShopReadyRealOutfitPacks,
} from "../data/realOutfitPacks.ts";

type RealBoardBrief = NonNullable<Parameters<typeof getRealOutfitPacksForBrief>[0]>;

type MatchScenario = {
  id: string;
  label: string;
  brief: RealBoardBrief;
  expectedIncludes: string[];
  expectedExcludes: string[];
};

type DiscoverabilityGapScenario = {
  id: string;
  label: string;
  brief: RealBoardBrief;
  boardId: string;
  note: string;
};

type CheckMessage = {
  code: string;
  scenarioId: string;
  message: string;
};

const classicCleanMinimalDate = "real-pack-feminine-clean-minimal-date";
const everydayClean = "real-pack-feminine-everyday-clean";
const polishedOffice = "real-pack-feminine-smart-casual-office";
const polishedTravel = "real-pack-feminine-travel-airport";
const classicOldMoneyDate = "real-pack-masculine-old-money-date";
const cleanAirportFit = "real-pack-masculine-clean-airport-fit";
const streetwearPhotoshoot = "real-pack-streetwear-photoshoot";

const expectedLiveBoardIds = [
  classicCleanMinimalDate,
  everydayClean,
  polishedOffice,
  polishedTravel,
  classicOldMoneyDate,
  cleanAirportFit,
  streetwearPhotoshoot,
];

const scenarios: MatchScenario[] = [
  {
    id: "feminine-clean-minimal-date",
    label: "Feminine clean minimal date",
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean minimal",
      occasion: "date",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [classicCleanMinimalDate],
    expectedExcludes: [streetwearPhotoshoot, classicOldMoneyDate, polishedOffice],
  },
  {
    id: "feminine-clean-minimal-everyday",
    label: "Feminine clean minimal everyday",
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean minimal",
      occasion: "daily wear",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [everydayClean],
    expectedExcludes: [streetwearPhotoshoot, classicCleanMinimalDate, polishedOffice],
  },
  {
    id: "feminine-smart-casual-office",
    label: "Feminine smart casual office",
    brief: {
      stylePreference: "feminine",
      aesthetic: "smart casual",
      occasion: "office",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [polishedOffice],
    expectedExcludes: [streetwearPhotoshoot, polishedTravel, classicOldMoneyDate],
  },
  {
    id: "feminine-clean-minimal-office-alias",
    label: "Feminine clean minimal office alias",
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean minimal",
      occasion: "office",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [polishedOffice],
    expectedExcludes: [streetwearPhotoshoot, everydayClean, classicCleanMinimalDate],
  },
  {
    id: "feminine-clean-minimal-travel",
    label: "Feminine clean minimal travel",
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean minimal",
      occasion: "travel",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [polishedTravel],
    expectedExcludes: [streetwearPhotoshoot, cleanAirportFit, polishedOffice],
  },
  {
    id: "feminine-airport-alias",
    label: "Feminine airport alias",
    brief: {
      stylePreference: "feminine",
      aesthetic: "travel",
      occasion: "airport",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [polishedTravel],
    expectedExcludes: [streetwearPhotoshoot, cleanAirportFit, classicCleanMinimalDate],
  },
  {
    id: "masculine-old-money-date",
    label: "Masculine old money date",
    brief: {
      stylePreference: "masculine",
      aesthetic: "old money",
      occasion: "date",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [classicOldMoneyDate],
    expectedExcludes: [streetwearPhotoshoot, classicCleanMinimalDate, polishedOffice],
  },
  {
    id: "masculine-quiet-luxury-date-alias",
    label: "Masculine quiet luxury date alias",
    brief: {
      stylePreference: "masculine",
      aesthetic: "quiet luxury",
      occasion: "date",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [classicOldMoneyDate],
    expectedExcludes: [streetwearPhotoshoot, classicCleanMinimalDate, polishedTravel],
  },
  {
    id: "masculine-clean-minimal-travel",
    label: "Masculine clean minimal travel",
    brief: {
      stylePreference: "masculine",
      aesthetic: "clean minimal",
      occasion: "travel",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [cleanAirportFit],
    expectedExcludes: [streetwearPhotoshoot, polishedTravel, classicOldMoneyDate],
  },
  {
    id: "masculine-airport-alias",
    label: "Masculine airport alias",
    brief: {
      stylePreference: "masculine",
      aesthetic: "travel",
      occasion: "airport",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [cleanAirportFit],
    expectedExcludes: [streetwearPhotoshoot, polishedTravel, classicOldMoneyDate],
  },
  {
    id: "mixed-streetwear-photoshoot",
    label: "Mixed streetwear photoshoot",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "streetwear",
      occasion: "photoshoot",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [streetwearPhotoshoot],
    expectedExcludes: [polishedOffice, polishedTravel, classicOldMoneyDate],
  },
  {
    id: "creator-photoshoot-board-discovery",
    label: "Creator/photoshoot board discovery",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "creator/photoshoot",
      occasion: "photoshoot",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [streetwearPhotoshoot],
    expectedExcludes: [polishedOffice, polishedTravel, classicOldMoneyDate],
  },
  {
    id: "masculine-streetwear-photoshoot",
    label: "Masculine streetwear photoshoot",
    brief: {
      stylePreference: "masculine",
      aesthetic: "streetwear",
      occasion: "photoshoot",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [streetwearPhotoshoot],
    expectedExcludes: [cleanAirportFit, classicOldMoneyDate, polishedOffice],
  },
  {
    id: "streetwear-brand-content-alias",
    label: "Streetwear brand content alias",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "streetwear",
      occasion: "brand content",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [streetwearPhotoshoot],
    expectedExcludes: [polishedOffice, cleanAirportFit, classicCleanMinimalDate],
  },
  {
    id: "streetwear-reels-alias",
    label: "Streetwear reels alias",
    brief: {
      stylePreference: "androgynous",
      aesthetic: "streetwear",
      occasion: "reels",
      budgetRange: "$100-$200",
    },
    expectedIncludes: [streetwearPhotoshoot],
    expectedExcludes: [polishedOffice, cleanAirportFit, classicOldMoneyDate],
  },
];

const currentGapScenarios: DiscoverabilityGapScenario[] = [
  {
    id: "casual-urban-daily-wear",
    label: "Casual urban daily wear",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "streetwear",
      occasion: "daily wear",
      budgetRange: "$100-$200",
    },
    boardId: streetwearPhotoshoot,
    note:
      "Current matcher keeps Streetwear Photoshoot photoshoot-specific, so daily wear does not surface it yet.",
  },
  {
    id: "going-out-streetwear-party",
    label: "Going out streetwear party",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "streetwear",
      occasion: "party",
      budgetRange: "$100-$200",
    },
    boardId: streetwearPhotoshoot,
    note:
      "Current matcher keeps Streetwear Photoshoot photoshoot-specific, so party/going-out does not surface it yet.",
  },
];

const warnings: CheckMessage[] = [];
const criticalIssues: CheckMessage[] = [];

function addWarning(code: string, scenarioId: string, message: string) {
  warnings.push({ code, scenarioId, message });
}

function addCritical(code: string, scenarioId: string, message: string) {
  criticalIssues.push({ code, scenarioId, message });
}

function getMatchedPackIds(brief: RealBoardBrief) {
  return getRealOutfitPacksForBrief(brief).map((pack) => pack.id);
}

function describeMatches(matchedIds: string[]) {
  return matchedIds.length > 0 ? matchedIds.join(", ") : "none";
}

const shopReadyBoardIds = new Set(getShopReadyRealOutfitPacks().map((pack) => pack.id));

for (const boardId of expectedLiveBoardIds) {
  if (!shopReadyBoardIds.has(boardId)) {
    addCritical(
      "expected-live-board-not-shop-ready",
      boardId,
      "Expected live real candidate board is not returned by getShopReadyRealOutfitPacks()."
    );
  }
}

for (const scenario of scenarios) {
  const matchedIds = getMatchedPackIds(scenario.brief);

  for (const expectedId of scenario.expectedIncludes) {
    if (!matchedIds.includes(expectedId)) {
      addCritical(
        "expected-board-missing",
        scenario.id,
        `${scenario.label} should include ${expectedId}; matched: ${describeMatches(matchedIds)}.`
      );
    }
  }

  for (const excludedId of scenario.expectedExcludes) {
    if (matchedIds.includes(excludedId)) {
      addCritical(
        "unrelated-board-surfaced",
        scenario.id,
        `${scenario.label} should not include ${excludedId}; matched: ${describeMatches(matchedIds)}.`
      );
    }
  }
}

for (const scenario of currentGapScenarios) {
  const matchedIds = getMatchedPackIds(scenario.brief);

  if (!matchedIds.includes(scenario.boardId)) {
    addWarning(
      "documented-discoverability-gap",
      scenario.id,
      `${scenario.note} Matched: ${describeMatches(matchedIds)}.`
    );
  } else {
    addWarning(
      "documented-gap-now-surfaces",
      scenario.id,
      `${scenario.label} now surfaces ${scenario.boardId}; confirm this was intentional before treating it as stable coverage.`
    );
  }
}

console.log("Real board matching QA");
console.log("----------------------");
console.log(`Shop-ready real boards: ${shopReadyBoardIds.size}`);
console.log(`Required scenarios: ${scenarios.length}`);
console.log(`Documented gap scenarios: ${currentGapScenarios.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Critical issues: ${criticalIssues.length}`);

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- [${warning.code}] ${warning.scenarioId}: ${warning.message}`);
  }
}

if (criticalIssues.length > 0) {
  console.log("\nCritical issues:");
  for (const issue of criticalIssues) {
    console.log(`- [${issue.code}] ${issue.scenarioId}: ${issue.message}`);
  }

  process.exitCode = 1;
}
