import { products } from "../data/products.ts";
import { realProducts } from "../data/realProducts.ts";

type CriticalIssue = {
  code: string;
  subject: string;
  message: string;
};

const criticalIssues: CriticalIssue[] = [];

function addCritical(code: string, subject: string, message: string) {
  criticalIssues.push({ code, subject, message });
}

function isMockProductUrl(url: string) {
  return url.startsWith("/mock-products/");
}

const mockProducts = products.filter((product) => isMockProductUrl(product.url));
const mockAffiliateReadyProducts = mockProducts.filter((product) => product.affiliateReady);
const sampleAffiliateReadyProducts = products.filter((product) => product.affiliateReady);
const realAffiliateReadyProducts = realProducts.filter((product) => product.affiliateReady);

for (const product of mockAffiliateReadyProducts) {
  addCritical(
    "mock-product-affiliate-ready",
    product.id,
    "Mock/sample products use internal placeholder URLs and must not be marked affiliateReady."
  );
}

console.log("Internal data hygiene QA");
console.log("------------------------");
console.log(`Sample/mock products checked: ${products.length}`);
console.log(`Sample/mock products with /mock-products/ URLs: ${mockProducts.length}`);
console.log(`Mock products with affiliateReady true: ${mockAffiliateReadyProducts.length}`);
console.log(`All sample products with affiliateReady true: ${sampleAffiliateReadyProducts.length}`);
console.log(`Real products checked: ${realProducts.length}`);
console.log(`Real products with affiliateReady true: ${realAffiliateReadyProducts.length}`);
console.log(`Critical issues: ${criticalIssues.length}`);

if (criticalIssues.length > 0) {
  console.log("\nCritical issues:");
  for (const issue of criticalIssues) {
    console.log(`- [${issue.code}] ${issue.subject}: ${issue.message}`);
  }

  process.exitCode = 1;
}
