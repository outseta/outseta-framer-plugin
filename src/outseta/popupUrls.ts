import {
  AuthEmbedConfig,
  EmailListEmbedConfig,
  LeadCaptureEmbedConfig,
  ProfileEmbedConfig,
} from "./types";

function popupUrl({ path, domain }: { path: string; domain: string }) {
  if (!domain) return "";
  // Make sure the URL is valid
  const url = new URL(path, `https://${domain}`);
  return url.href;
}

export function registerAuthPopupUrl(
  { preselect, planUid, familyUid, discountCode }: AuthEmbedConfig,
  domain: string,
) {
  let path = `/auth?widgetMode=register`;

  if (preselect === "plan" && planUid) {
    path += `&planUid=${planUid}`;
  }

  if (preselect === "family" && familyUid) {
    path += `&planFamilyUid=${familyUid}`;
  }

  if (discountCode) {
    const registrationDefaultsAsString = JSON.stringify({
      Subscription: {
        DiscountCouponSubscriptions: [
          {
            DiscountCoupon: {
              UniqueIdentifier: discountCode,
            },
          },
        ],
      },
    });

    path += `&registrationDefaults=${registrationDefaultsAsString}`;
  }

  path += "#o-anonymous";

  return popupUrl({
    path: path,
    domain: domain,
  });
}

export function loginAuthPopupUrl(domain: string) {
  return popupUrl({ path: "/auth?widgetMode=login#o-anonymous", domain });
}

export function profilePopupUrl({ tab }: ProfileEmbedConfig, domain: string) {
  return popupUrl({
    path: `/profile?tab=${tab}#o-authenticated`,
    domain: domain,
  });
}

export function emailListPopupUrl(
  { uid }: EmailListEmbedConfig,
  domain: string,
) {
  if (!uid) return "";
  return popupUrl({
    path: `/email/lists/${uid}/subscribe`,
    domain: domain,
  });
}

export function leadCapturePopupUrl(
  { uid }: LeadCaptureEmbedConfig,
  domain: string,
) {
  if (!uid) return "";
  return popupUrl({
    path: `/forms/${uid}`,
    domain: domain,
  });
}

export function supportPopupUrl(domain: string) {
  return popupUrl({
    path: "/support/kb",
    domain: domain,
  });
}
