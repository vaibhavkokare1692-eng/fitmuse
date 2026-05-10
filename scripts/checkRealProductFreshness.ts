import {
  getRealProductById,
  hasRealRetailerCandidateProductLink,
  isPlaceholderRealProductLink,
  realProducts,
} from "../data/realProducts.ts";
import {
  getShopReadyRealOutfitPacks,
  realOutfitPacks,
  validateRealOutfitPackTotals,
} from "../data/realOutfitPacks.ts";
import type {
  RealOutfitPack,
  RealProduct,
  RealProductFreshnessStatus,
} from "../types/index.ts";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REVIEW_SOON_AFTER_DAYS = 7;
const STALE_AFTER_DAYS = 14;

type CheckMessage = {
  code: string;
  subject: string;
  message: string;
};

const today = new Date();
const todayUtc = new Date(
  Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
);

const warnings: CheckMessage[] = [];
const criticalIssues: CheckMessage[] = [];

function addWarning(code: string, subject: string, message: string) {
  warnings.push({ code, subject, message });
}

function addCritical(code: string, subject: string, message: string) {
  criticalIssues.push({ code, subject, message });
}

function parseIsoDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return undefined;
  }

  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
}

function daysSince(value?: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return undefined;
  }

  return Math.floor((todayUtc.getTime() - date.getTime()) / MS_PER_DAY);
}

function daysUntil(value?: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return undefined;
  }

  return Math.floor((date.getTime() - todayUtc.getTime()) / MS_PER_DAY);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSalePrice(product: RealProduct) {
  return (
    product.isSalePrice === true ||
    (typeof product.originalPrice === "number" &&
      product.originalPrice > product.currentPrice) ||
    /sale price|sale-price|markdown/i.test(product.notes ?? "")
  );
}

function classifyProductFreshness(
  product: RealProduct
): RealProductFreshnessStatus {
  if (product.replacementNeeded || product.inStock === false) {
    return "blocked";
  }

  if (!hasRealRetailerCandidateProductLink(product)) {
    return "blocked";
  }

  const checkedAge = daysSince(product.lastCheckedDate);

  if (checkedAge === undefined) {
    return "blocked";
  }

  if (checkedAge > STALE_AFTER_DAYS) {
    return "stale";
  }

  const nextCheckDueIn = daysUntil(product.nextCheckDate);
  if (
    checkedAge > REVIEW_SOON_AFTER_DAYS ||
    (nextCheckDueIn !== undefined && nextCheckDueIn <= 0)
  ) {
    return "review_soon";
  }

  return "fresh";
}

function classifyPackFreshness(pack: RealOutfitPack) {
  const updatedAge = daysSince(pack.lastUpdated);

  if (updatedAge === undefined) {
    return "blocked" satisfies RealProductFreshnessStatus;
  }

  if (updatedAge > STALE_AFTER_DAYS) {
    return "stale" satisfies RealProductFreshnessStatus;
  }

  if (updatedAge > REVIEW_SOON_AFTER_DAYS) {
    return "review_soon" satisfies RealProductFreshnessStatus;
  }

  return "fresh" satisfies RealProductFreshnessStatus;
}

function calculatePackTotal(pack: RealOutfitPack) {
  return pack.productIds.reduce((runningTotal, productId) => {
    const product = getRealProductById(productId);
    return runningTotal + (product?.currentPrice ?? 0);
  }, 0);
}

const shopReadyPacks = getShopReadyRealOutfitPacks();
const shopReadyProductIds = new Set(shopReadyPacks.flatMap((pack) => pack.productIds));

for (const product of realProducts) {
  const hasRealLink = hasRealRetailerCandidateProductLink(product);

  if (
    !product.productUrl ||
    (!isPlaceholderRealProductLink(product.productUrl) &&
      !isHttpUrl(product.productUrl))
  ) {
    addCritical(
      "invalid-product-url",
      product.id,
      "Product URL must be either the placeholder URL or a valid http(s) retailer candidate URL."
    );
  }

  if (hasRealLink && !product.lastCheckedDate) {
    addCritical(
      "missing-last-checked",
      product.id,
      "Real retailer candidate is missing lastCheckedDate."
    );
  }

  if (hasRealLink && !product.verificationStatus) {
    addCritical(
      "missing-verification-status",
      product.id,
      "Real retailer candidate is missing verificationStatus."
    );
  }

  if (product.sourceType === "manual_curated_candidate" && !hasRealLink) {
    addCritical(
      "candidate-without-real-link",
      product.id,
      "Manual curated candidate products must use a real retailer candidate URL."
    );
  }

  if (product.affiliateReady) {
    if (
      !product.affiliateUrl ||
      isPlaceholderRealProductLink(product.affiliateUrl)
    ) {
      addCritical(
        "unsafe-affiliate-ready",
        product.id,
        "affiliateReady is true without a non-placeholder affiliateUrl."
      );
    } else if (!isHttpUrl(product.affiliateUrl)) {
      addCritical(
        "invalid-affiliate-url",
        product.id,
        "affiliateReady is true but affiliateUrl is not a valid http(s) URL."
      );
    }
  }

  if (shopReadyProductIds.has(product.id)) {
    const freshness = classifyProductFreshness(product);
    const checkedAge = daysSince(product.lastCheckedDate);

    if (product.replacementNeeded) {
      addCritical(
        "replacement-needed-in-shop-ready-pack",
        product.id,
        `Product appears in a shop-ready pack but is marked replacementNeeded: ${
          product.replacementReason ?? "No replacement reason provided."
        }`
      );
    }

    if (isSalePrice(product) && (!product.priceNote || !product.availabilityNote)) {
      addWarning(
        "sale-price-missing-context",
        product.id,
        "Sale-price product in a shop-ready pack should include priceNote and availabilityNote."
      );
    }

    if (product.confidenceLevel === "low") {
      addWarning(
        "low-confidence-shop-ready-product",
        product.id,
        "Low-confidence product appears in a shop-ready pack."
      );
    }

    if (freshness === "review_soon" || freshness === "stale") {
      addWarning(
        `product-${freshness}`,
        product.id,
        `Product freshness is ${freshness}; last checked ${
          product.lastCheckedDate
        }${checkedAge === undefined ? "" : ` (${checkedAge} days ago)`}.`
      );
    }
  }
}

for (const pack of shopReadyPacks) {
  if (!pack.verificationStatus) {
    addCritical(
      "shop-ready-pack-missing-verification-status",
      pack.id,
      "Shop-ready real outfit pack is missing verificationStatus."
    );
  }

  const products = pack.productIds.map((productId) => ({
    productId,
    product: getRealProductById(productId),
  }));

  const missingProductIds = products
    .filter(({ product }) => !product)
    .map(({ productId }) => productId);

  for (const missingProductId of missingProductIds) {
    addCritical(
      "shop-ready-pack-missing-product",
      pack.id,
      `Shop-ready pack references missing product ${missingProductId}.`
    );
  }

  const existingProducts = products
    .map(({ product }) => product)
    .filter((product): product is RealProduct => Boolean(product));

  const realCandidateCount = existingProducts.filter((product) =>
    hasRealRetailerCandidateProductLink(product)
  ).length;

  if (realCandidateCount === 0) {
    addCritical(
      "shop-ready-pack-without-real-candidates",
      pack.id,
      "Shop-ready pack must include at least one real retailer candidate link."
    );
  }

  for (const product of existingProducts) {
    if (isPlaceholderRealProductLink(product.productUrl)) {
      addCritical(
        "placeholder-product-in-shop-ready-pack",
        pack.id,
        `Shop-ready pack includes placeholder product ${product.id}.`
      );
    }
  }

  const packFreshness = classifyPackFreshness(pack);
  const updatedAge = daysSince(pack.lastUpdated);

  if (packFreshness === "review_soon" || packFreshness === "stale") {
    addWarning(
      `pack-${packFreshness}`,
      pack.id,
      `Pack freshness is ${packFreshness}; last updated ${
        pack.lastUpdated
      }${updatedAge === undefined ? "" : ` (${updatedAge} days ago)`}.`
    );
  }
}

for (const totalCheck of validateRealOutfitPackTotals()) {
  if (!totalCheck.matches) {
    const pack = realOutfitPacks.find((candidate) => candidate.id === totalCheck.id);
    const calculatedTotal = pack ? calculatePackTotal(pack) : 0;

    addCritical(
      "pack-total-mismatch",
      totalCheck.id,
      pack
        ? `Pack total is ${pack.totalPrice.toFixed(
            2
          )}, but product prices sum to ${calculatedTotal.toFixed(2)}.`
        : "Pack total check failed, but the pack could not be found."
    );
  }
}

const realCandidateProducts = realProducts.filter((product) =>
  hasRealRetailerCandidateProductLink(product)
);
const placeholderProducts = realProducts.filter((product) =>
  isPlaceholderRealProductLink(product.productUrl)
);
const freshnessCounts: Record<RealProductFreshnessStatus, number> = {
  fresh: 0,
  review_soon: 0,
  stale: 0,
  blocked: 0,
};

for (const product of realCandidateProducts) {
  freshnessCounts[classifyProductFreshness(product)] += 1;
}

console.log("Real product freshness QA");
console.log("-------------------------");
console.log(`Products: ${realProducts.length}`);
console.log(`Real retailer candidates: ${realCandidateProducts.length}`);
console.log(`Placeholder products: ${placeholderProducts.length}`);
console.log(`Outfit packs: ${realOutfitPacks.length}`);
console.log(`Shop-ready outfit packs: ${shopReadyPacks.length}`);
console.log(
  `Freshness: ${freshnessCounts.fresh} fresh, ${freshnessCounts.review_soon} review soon, ${freshnessCounts.stale} stale, ${freshnessCounts.blocked} blocked`
);
console.log(`Warnings: ${warnings.length}`);
console.log(`Critical issues: ${criticalIssues.length}`);

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- [${warning.code}] ${warning.subject}: ${warning.message}`);
  }
}

if (criticalIssues.length > 0) {
  console.log("\nCritical issues:");
  for (const issue of criticalIssues) {
    console.log(`- [${issue.code}] ${issue.subject}: ${issue.message}`);
  }

  process.exitCode = 1;
}
