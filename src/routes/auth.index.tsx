import { useEffect, useState } from "react";
import {
  Button,
  ListControls,
  SegmentedControls,
  TextControls,
} from "@triozer/framer-toolbox";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getPlanData,
  RegisterPreselectOption,
  RegisterPreselectOptionLabels,
  RegisterPreselectOptions,
  registerAuthPopupUrl,
  AuthEmbedConfig,
  upsertAuthEmbed,
} from "../outseta";
import {
  EmbedModeListControls,
  PopupLinkFormSection,
  ExternalLink,
} from "../common";
import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";
import { useConfiguration } from "../custom-code";
import { Alert } from "../common/Alert";

export const Route = createFileRoute("/auth/")({
  component: AuthRegisterPage,
});

function AuthRegisterPage() {
  const { domain, isInvalid } = useConfiguration();

  const query = useQuery({
    queryKey: ["outsea", "plans", "all", domain],
    queryFn: () => getPlanData(domain),
    enabled: !!domain && !isInvalid,
  });

  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();
  const embedControls = singleOutsetaEmbed?.controls;

  const [preselect, setPreselect] = useState<RegisterPreselectOption>(
    embedControls?.registerPreselect as RegisterPreselectOption,
  );
  const [familyUid, setFamilyUid] = useState<string>(
    embedControls?.registerFamilyUid as string,
  );
  const [planUid, setPlanUid] = useState<string>(
    embedControls?.registerPlanUid as string,
  );
  const [productFamilyUid, setProductFamilyUid] = useState<string>(
    embedControls?.registerProductFamilyUid as string,
  );
  const [priceId, setPriceId] = useState<string>(
    embedControls?.registerPriceId as string,
  );
  const [applyDiscountCode, setApplyDiscount] = useState<boolean>(
    !!(embedControls?.registerDiscountCode as string),
  );
  const [discountCode, setDiscountCode] = useState<string>(
    embedControls?.registerDiscountCode as string,
  );

  const planFamilies = query.data?.PlanFamilies;
  const stripeProducts = query.data?.StripeProducts;
  const stripeProductFamilies = query.data?.StripeProductFamilies;
  const usesStripeProducts = stripeProducts !== undefined;
  const stripeProductItems =
    stripeProducts?.flatMap((product) => {
      const priceId =
        product.DefaultPriceId ||
        product.StripePrices?.find((price) => price.IsActive)?.StripeId;

      return priceId ? [{ value: priceId, label: product.Name }] : [];
    }) ?? [];
  const defaultFamilyUid = planFamilies?.[0]?.Uid;
  const defaultPlanUid = planFamilies?.[0]?.Plans[0]?.Uid;
  const defaultProductFamilyUid = stripeProductFamilies?.[0]?.Uid;
  const defaultPriceId = stripeProductItems[0]?.value;
  const allPlans = planFamilies?.flatMap((family) => family.Plans);
  const discountCodeExists = query.data?.DiscountsExist;

  const { embedMode } = useEmbedMode();

  const config: AuthEmbedConfig = {
    widgetMode: "register",
    preselect,
    familyUid: usesStripeProducts ? undefined : familyUid || defaultFamilyUid,
    planUid: usesStripeProducts ? undefined : planUid || defaultPlanUid,
    productFamilyUid: usesStripeProducts
      ? productFamilyUid || defaultProductFamilyUid
      : undefined,
    priceId: usesStripeProducts ? priceId || defaultPriceId : undefined,
    discountCode,
  };

  useEffect(() => {
    const preselect =
      embedControls?.registerPreselect as RegisterPreselectOption;
    const familyUid = embedControls?.registerFamilyUid as string;
    const planUid = embedControls?.registerPlanUid as string;
    const productFamilyUid = embedControls?.registerProductFamilyUid as string;
    const priceId = embedControls?.registerPriceId as string;
    const code = embedControls?.registerDiscountCode as string;

    setPreselect(preselect || "none");
    setFamilyUid(familyUid);
    setPlanUid(planUid);
    setProductFamilyUid(productFamilyUid);
    setPriceId(priceId);
    setDiscountCode(code);
    if (code && !applyDiscountCode) {
      setApplyDiscount(true);
    }
  }, [
    embedControls?.registerPreselect,
    embedControls?.registerFamilyUid,
    embedControls?.registerPlanUid,
    embedControls?.registerProductFamilyUid,
    embedControls?.registerPriceId,
    embedControls?.registerDiscountCode,
  ]);

  const embedMutation = useMutation({
    mutationFn: () => upsertAuthEmbed(config, singleOutsetaEmbed),
  });

  const familyItems =
    (usesStripeProducts ? stripeProductFamilies : planFamilies)?.map(
      (family) => ({
        value: family.Uid,
        label: family.Name,
      }),
    ) || [];
  const selectedFamilyUid = usesStripeProducts ? productFamilyUid : familyUid;
  const selectedDefaultFamilyUid = usesStripeProducts
    ? defaultProductFamilyUid
    : defaultFamilyUid;

  if (selectedFamilyUid !== undefined && query.isSuccess) {
    if (!familyItems.find((item) => item.value === selectedFamilyUid)) {
      familyItems.unshift({
        value: selectedFamilyUid,
        label: `Invalid  - ${selectedFamilyUid || "empty"}`,
      });
    }
  }

  const productOrPlanItems = usesStripeProducts
    ? stripeProductItems
    : (planFamilies
        ?.find((family) =>
          familyUid
            ? family.Uid === familyUid
            : family.Uid === defaultFamilyUid,
        )
        ?.Plans.map((plan) => ({
          value: plan.Uid,
          label: plan.Name,
        })) ?? []);
  const selectedProductOrPlanId = usesStripeProducts ? priceId : planUid;
  const selectedDefaultProductOrPlanId = usesStripeProducts
    ? defaultPriceId
    : defaultPlanUid;

  if (selectedProductOrPlanId !== undefined && query.isSuccess) {
    if (
      !productOrPlanItems.find(
        (item) => item.value === selectedProductOrPlanId,
      )
    ) {
      productOrPlanItems.unshift({
        value: selectedProductOrPlanId,
        label: `Invalid  - ${selectedProductOrPlanId || "empty"}`,
      });
    }
  }

  return (
    <form
      onChange={() => {
        if (!singleOutsetaEmbed) return;
        embedMutation.mutate();
      }}
      onSubmit={(event) => {
        event.preventDefault();

        switch (embedMode) {
          case "embed":
            embedMutation.mutate();
            break;
        }
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      <ListControls
        title="Preselect"
        items={RegisterPreselectOptions.map((option) => ({
          value: option,
          label:
            usesStripeProducts && option !== "none"
              ? option === "family"
                ? "Product Family"
                : "Single Product"
              : RegisterPreselectOptionLabels[option],
        }))}
        value={preselect}
        onChange={(value) => setPreselect(value)}
      />

      {(preselect === "family" ||
        (!usesStripeProducts && preselect === "plan")) && (
        <ListControls
          title={usesStripeProducts ? "Product Family" : "Plan Family"}
          items={familyItems}
          value={
            selectedFamilyUid === undefined
              ? selectedDefaultFamilyUid
              : selectedFamilyUid
          }
          onChange={(value) =>
            usesStripeProducts
              ? setProductFamilyUid(value)
              : setFamilyUid(value)
          }
          disabled={query.isPending}
        />
      )}

      {preselect === "plan" && (
        <ListControls
          title={usesStripeProducts ? "Product" : "Plan"}
          items={productOrPlanItems}
          value={
            selectedProductOrPlanId === undefined
              ? selectedDefaultProductOrPlanId
              : selectedProductOrPlanId
          }
          onChange={(value) =>
            usesStripeProducts ? setPriceId(value) : setPlanUid(value)
          }
          disabled={query.isPending}
        />
      )}

      <SegmentedControls
        title="Apply discount code"
        value={applyDiscountCode}
        onChange={(value) => {
          setApplyDiscount(value);
          if (!value && singleOutsetaEmbed) {
            setDiscountCode("");
            // HACK: This is a workaround to update the discount
            // code in the embed when disables the discount code
            upsertAuthEmbed(
              { widgetMode: "register", discountCode: "" },
              singleOutsetaEmbed,
            );
          }
        }}
      />

      {applyDiscountCode && (
        <>
          <TextControls
            title="Discount code"
            value={discountCode}
            onChange={(value) => setDiscountCode(value)}
          />
          {!discountCodeExists && (
            <p>
              Remember to add{" "}
              <ExternalLink href={`https://${domain}/#/app/billing/discounts/`}>
                the discount code in Outseta
              </ExternalLink>
              .
            </p>
          )}
        </>
      )}

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary">Add Signup Embed to page</Button>
      )}

      {embedMode === "popup" && (
        <PopupLinkFormSection popupUrl={registerAuthPopupUrl(config, domain)} />
      )}

      <section>
        {(usesStripeProducts ? stripeProductItems.length : allPlans?.length) ===
          0 && (
          <Alert level="warning">
            Add at least one{" "}
            <ExternalLink href={`https://${domain}/#/app/billing/plans/`}>
              {usesStripeProducts ? "product" : "plan"} in Outseta
            </ExternalLink>{" "}
            to enable signup.
          </Alert>
        )}
      </section>
    </form>
  );
}
