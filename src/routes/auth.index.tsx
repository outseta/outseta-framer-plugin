import { useEffect, useRef } from "react";
import {
  Button,
  ListControls,
  SegmentedControls,
  TextControls,
} from "@triozer/framer-toolbox";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod";

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

  const planFamilies = query.data?.PlanFamilies;
  const defaultFamilyUid = query.data?.PlanFamilies?.[0]?.Uid;
  const defaultPlanUid = query.data?.PlanFamilies?.[0]?.Plans[0]?.Uid;
  const allPlans = planFamilies?.flatMap((family) => family.Plans);
  const discountCodeExists = query.data?.DiscountsExist;

  const { embedMode } = useEmbedMode();

  const form = useForm({
    defaultValues: {
      preselect: (embedControls?.registerPreselect as RegisterPreselectOption) ||
        ("none" as RegisterPreselectOption),
      familyUid: (embedControls?.registerFamilyUid as string) || (defaultFamilyUid as string | undefined) || "",
      planUid: (embedControls?.registerPlanUid as string) || (defaultPlanUid as string | undefined) || "",
      applyDiscountCode: !!(embedControls?.registerDiscountCode as string),
      discountCode: (embedControls?.registerDiscountCode as string) || "",
    },
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    validators: {
      onSubmit: z
        .object({
          preselect: z.custom<RegisterPreselectOption>(),
          familyUid: z.string().optional(),
          planUid: z.string().optional(),
          applyDiscountCode: z.boolean(),
          discountCode: z.string(),
        })
        .refine((v) => v.preselect !== "family" || !!(v.familyUid && v.familyUid.trim()), {
          message: "Family is required",
          path: ["familyUid"],
        })
        .refine((v) => v.preselect !== "plan" || !!(v.familyUid && v.planUid && v.planUid.trim()), {
          message: "Plan is required",
          path: ["planUid"],
        })
        .refine((v) => !v.applyDiscountCode || !!v.discountCode.trim(), {
          message: "Discount code required",
          path: ["discountCode"],
        })
        .optional(),
    },
    onSubmit: async () => {
      switch (embedMode) {
        case "embed":
          await embedMutation.mutateAsync();
          break;
      }
    },
  });

  // Keep form values in sync when embed controls or defaults change
  useEffect(() => {
    const nextPreselect =
      (embedControls?.registerPreselect as RegisterPreselectOption) ||
      ("none" as RegisterPreselectOption);
    const nextFamily =
      (embedControls?.registerFamilyUid as string) || defaultFamilyUid || "";
    const nextPlan =
      (embedControls?.registerPlanUid as string) || defaultPlanUid || "";
    const nextCode = (embedControls?.registerDiscountCode as string) || "";
    const nextApply = !!nextCode;

    if (form.state.values.preselect !== nextPreselect) {
      form.setFieldValue("preselect", nextPreselect);
    }
    if (form.state.values.familyUid !== nextFamily) {
      form.setFieldValue("familyUid", nextFamily);
    }
    if (form.state.values.planUid !== nextPlan) {
      form.setFieldValue("planUid", nextPlan);
    }
    if (form.state.values.discountCode !== nextCode) {
      form.setFieldValue("discountCode", nextCode);
    }
    if (form.state.values.applyDiscountCode !== nextApply) {
      form.setFieldValue("applyDiscountCode", nextApply);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    embedControls?.registerPreselect,
    embedControls?.registerFamilyUid,
    embedControls?.registerPlanUid,
    embedControls?.registerDiscountCode,
    defaultFamilyUid,
    defaultPlanUid,
  ]);

  const formValues = form.useStore((s) => s.values);
  const computedConfig: AuthEmbedConfig = {
    widgetMode: "register",
    preselect: formValues.preselect as RegisterPreselectOption,
    familyUid: (formValues.familyUid as string) || (defaultFamilyUid as string | undefined),
    planUid: (formValues.planUid as string) || (defaultPlanUid as string | undefined),
    discountCode: formValues.applyDiscountCode ? (formValues.discountCode as string) : "",
  };

  const embedMutation = useMutation({
    mutationFn: () => upsertAuthEmbed(computedConfig, singleOutsetaEmbed),
  });

  // Auto-apply on any relevant value change when an embed exists
  const didInit = useRef(false);
  const autoApplyValues = form.useStore((s) => [
    s.values.preselect,
    s.values.familyUid,
    s.values.planUid,
    s.values.applyDiscountCode,
    s.values.discountCode,
  ]);
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    if (!singleOutsetaEmbed) return;
    embedMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleOutsetaEmbed, ...autoApplyValues]);

  const planFamilyItems =
    planFamilies?.map((family) => ({
      value: family.Uid,
      label: family.Name,
    })) || [];

  if (formValues.familyUid !== undefined && query.isSuccess) {
    // After the query has succeeded
    if (!planFamilyItems.find((item) => item.value === formValues.familyUid)) {
      // Check if the uid is valid and if not add an invalid item to the top of the list
      planFamilyItems.unshift({
        value: formValues.familyUid as string,
        label: `Invalid  - ${formValues.familyUid ? (formValues.familyUid as string) : "empty"}`,
      });
    }
  }

  const planItems =
    planFamilies
      ?.find((family) => {
        if (formValues.familyUid) {
          return family.Uid === formValues.familyUid;
        } else {
          return family.Uid === defaultFamilyUid;
        }
      })
      ?.Plans.map((plan) => ({
        value: plan.Uid,
        label: plan.Name,
      })) || [];

  if (formValues.planUid !== undefined && query.isSuccess) {
    // After the query has succeeded
    if (!planItems.find((item) => item.value === formValues.planUid)) {
      // Check if the uid is valid and if not add an invalid item to the top of the list
      planItems.unshift({
        value: formValues.planUid as string,
        label: `Invalid  - ${formValues.planUid ? (formValues.planUid as string) : "empty"}`,
      });
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      <form.Field name="preselect">
        {(field) => (
          <ListControls
            title="Preselect"
            items={RegisterPreselectOptions.map((option) => ({
              value: option,
              label: RegisterPreselectOptionLabels[option],
            }))}
            value={field.state.value as RegisterPreselectOption}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      {/* Display plan family selection when preselect is set to "family" or "plan" */}
      <form.Subscribe selector={(s) => s.values.preselect}>
        {(preselect) => (
          <>
            {preselect !== "none" && (
              <form.Field name="familyUid">
                {(field) => (
                  <ListControls
                    title="Family"
                    items={planFamilyItems}
                    value={(field.state.value as string | undefined) ?? defaultFamilyUid}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                    disabled={query.isPending}
                  />
                )}
              </form.Field>
            )}
          </>
        )}
      </form.Subscribe>

      {/* Display plan selection when preselect is set to "plan" */}
      <form.Subscribe selector={(s) => s.values.preselect}>
        {(preselect) => (
          <>
            {preselect === "plan" && (
              <form.Field name="planUid">
                {(field) => (
                  <ListControls
                    title="Plan"
                    items={planItems}
                    value={(field.state.value as string | undefined) ?? defaultPlanUid}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                    disabled={query.isPending}
                  />
                )}
              </form.Field>
            )}
          </>
        )}
      </form.Subscribe>

      <form.Field name="applyDiscountCode">
        {(field) => (
          <SegmentedControls
            title="Apply discount code"
            value={field.state.value as boolean}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.values.applyDiscountCode}>
        {(applyDiscountCode) => (
          <>
            {applyDiscountCode && (
              <form.Field name="discountCode">
                {(field) => (
                  <TextControls
                    title="Discount code"
                    value={field.state.value as string}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            )}
            {applyDiscountCode && !discountCodeExists && (
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
      </form.Subscribe>

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary" disabled={query.isPending || embedMutation.isPending}>
          Add Signup Embed to page
        </Button>
      )}

      {embedMode === "popup" && (
        <PopupLinkFormSection popupUrl={registerAuthPopupUrl(computedConfig, domain)} />
      )}

      <section>
        {allPlans?.length === 0 && (
          <Alert level="warning">
            Add at least one{" "}
            <ExternalLink href={`https://${domain}/#/app/billing/plans/`}>
              plan in Outseta
            </ExternalLink>{" "}
            to enable signup.
          </Alert>
        )}
      </section>
    </form>
  );
}
