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
import { CopyButton, EmbedModeListControls } from "../common";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
  useSingleSupportsLinkSelection,
} from "../app-state";
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

  const singleSupportsLink = useSingleSupportsLinkSelection();
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
  const [applyDiscountCode, setApplyDiscount] = useState<boolean>(
    !!(embedControls?.registerDiscountCode as string),
  );
  const [discountCode, setDiscountCode] = useState<string>(
    embedControls?.registerDiscountCode as string,
  );

  const planFamilies = query.data?.PlanFamilies;
  const defaultFamilyUid = query.data?.PlanFamilies?.[0]?.Uid;
  const defaultPlanUid = query.data?.PlanFamilies?.[0]?.Plans[0]?.Uid;
  const allPlans = planFamilies?.flatMap((family) => family.Plans);
  const discountCodeExists = query.data?.DiscountsExist;

  const { embedMode } = useEmbedMode();

  const config: AuthEmbedConfig = {
    widgetMode: "register",
    preselect,
    familyUid: familyUid || defaultFamilyUid,
    planUid: planUid || defaultPlanUid,
    discountCode,
  };

  useEffect(() => {
    const preselect =
      embedControls?.registerPreselect as RegisterPreselectOption;
    const familyUid = embedControls?.registerFamilyUid as string;
    const planUid = embedControls?.registerPlanUid as string;
    const code = embedControls?.registerDiscountCode as string;

    setPreselect(preselect || "none");
    setFamilyUid(familyUid);
    setPlanUid(planUid);
    setDiscountCode(code);
    if (code && !applyDiscountCode) {
      setApplyDiscount(true);
    }
  }, [
    embedControls?.registerPreselect,
    embedControls?.registerFamilyUid,
    embedControls?.registerPlanUid,
    embedControls?.registerDiscountCode,
  ]);

  const embedMutation = useMutation({
    mutationFn: () => upsertAuthEmbed(config, singleOutsetaEmbed),
  });

  const popupMutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLink) return Promise.resolve(null);
      return singleSupportsLink.setAttributes({
        link: registerAuthPopupUrl(config, domain),
        linkOpenInNewTab: false,
      });
    },
  });

  const planFamilyItems =
    planFamilies?.map((family) => ({
      value: family.Uid,
      label: family.Name,
    })) || [];

  if (familyUid !== undefined && query.isSuccess) {
    // After the query has succeeded
    if (!planFamilyItems.find((item) => item.value === familyUid)) {
      // Check if the uid is valid and if not add an invalid item to the top of the list
      planFamilyItems.unshift({
        value: familyUid,
        label: `Invalid  - ${familyUid ? familyUid : "empty"}`,
      });
    }
  }

  const planItems =
    planFamilies
      ?.find((family) => {
        if (familyUid) {
          return family.Uid === familyUid;
        } else {
          return family.Uid === defaultFamilyUid;
        }
      })
      ?.Plans.map((plan) => ({
        value: plan.Uid,
        label: plan.Name,
      })) || [];

  if (planUid !== undefined && query.isSuccess) {
    // After the query has succeeded
    if (!planItems.find((item) => item.value === planUid)) {
      // Check if the uid is valid and if not add an invalid item to the top of the list
      planItems.unshift({
        value: planUid,
        label: `Invalid  - ${planUid ? planUid : "empty"}`,
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
          case "popup":
            popupMutation.mutate();

            break;
        }
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      <ListControls
        title="Preselect"
        items={RegisterPreselectOptions.map((option) => ({
          value: option,
          label: RegisterPreselectOptionLabels[option],
        }))}
        value={preselect}
        onChange={(value) => setPreselect(value)}
      />

      {/* Display plan family selection when preselect is set to "family" or "plan" */}
      {preselect !== "none" && (
        <ListControls
          title="Family"
          items={planFamilyItems}
          value={familyUid === undefined ? defaultFamilyUid : familyUid}
          onChange={(value) => setFamilyUid(value)}
          disabled={query.isPending}
        />
      )}

      {/* Display plan selection when preselect is set to "plan" */}
      {preselect === "plan" && (
        <ListControls
          title="Plan"
          items={planItems}
          value={planUid === undefined ? defaultPlanUid : planUid}
          onChange={(value) => setPlanUid(value)}
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
              <a
                href={`https://${domain}/#/app/billing/discounts/`}
                target="_blank"
              >
                the discount code in Outseta
              </a>
              .
            </p>
          )}
        </>
      )}

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary">Add Signup Embed to page</Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button variant="primary">Set Signup Popup Link</Button>
      )}

      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={registerAuthPopupUrl(config, domain)}
          />
          <p>
            and paste the url as the "link to" value making sure open in new tab
            is not enabled.
          </p>
        </>
      )}

      <section>
        {allPlans?.length === 0 && (
          <Alert level="warning">
            Add at least one{" "}
            <a href={`https://${domain}/#/app/billing/plans/`} target="_blank">
              plan in Outseta
            </a>{" "}
            to enable signup.
          </Alert>
        )}
      </section>
    </form>
  );
}
