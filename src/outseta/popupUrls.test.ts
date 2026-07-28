import { describe, expect, it } from "vitest";
import { registerAuthPopupUrl } from "./popupUrls";

describe("registerAuthPopupUrl", () => {
  it("uses Stripe price and product family identifiers", () => {
    expect(
      registerAuthPopupUrl(
        {
          widgetMode: "register",
          preselect: "plan",
          priceId: "price_123",
          planUid: "legacy-plan",
        },
        "example.outseta.com",
      ),
    ).toContain("priceId=price_123");

    expect(
      registerAuthPopupUrl(
        {
          widgetMode: "register",
          preselect: "family",
          productFamilyUid: "product-family-123",
          familyUid: "legacy-family",
        },
        "example.outseta.com",
      ),
    ).toContain("productFamilyUid=product-family-123");
  });

  it("falls back to legacy plan identifiers", () => {
    expect(
      registerAuthPopupUrl(
        {
          widgetMode: "register",
          preselect: "plan",
          planUid: "plan-123",
        },
        "example.outseta.com",
      ),
    ).toContain("planUid=plan-123");

    expect(
      registerAuthPopupUrl(
        {
          widgetMode: "register",
          preselect: "family",
          familyUid: "family-123",
        },
        "example.outseta.com",
      ),
    ).toContain("planFamilyUid=family-123");
  });
});
