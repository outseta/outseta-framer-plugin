import axios, { type AxiosResponse } from "axios";

const OUTSETA_OVERIDES_URL =
  "https://raw.githubusercontent.com/outseta/framer_overrides/refs/heads/main/outseta.tsx";

export const getPlanData = async (domain: string) => {
  const fields = [
    "DiscountsExist",
    "PlanFamilies.Uid",
    "PlanFamilies.Name",
    "PlanFamilies.Plans.Uid",
    "PlanFamilies.Plans.Name",
  ].join(",");

  const response: AxiosResponse<{
    DiscountsExist: boolean;
    PlanFamilies: {
      Uid: string;
      Name: string;
      Plans: {
        Uid: string;
        Name: string;
      }[];
    }[];
  }> = await axios.get(`/api/v1/widgets/auth/init?fields=${fields}`, {
    baseURL: `https://${domain}`,
  });

  return response.data;
};

export const getEmailListData = async (domain: string) => {
  const response: AxiosResponse<{ items: { Uid: string; Name: string }[] }> =
    await axios.get(`/api/v1/public/email/lists`, {
      baseURL: `https://${domain}`,
    });

  return response.data;
};

export const getLeadCaptureData = async (domain: string) => {
  const response: AxiosResponse<{ items: { Uid: string; Name: string }[] }> =
    await axios.get(`/api/v1/public/crm/leadforms`, {
      baseURL: `https://${domain}`,
    });

  return response.data;
};

export const getContentGroupData = async (domain: string) => {
  const response: AxiosResponse<{
    items: {
      Uid: string;
      Name: string;
      ContentGroupItems: { Uid: string; Pattern: string; MatchMode: number }[];
      AllowedPlans: { Uid: string; Name: string }[];
      AllowedAddOns: { Uid: string; Name: string }[];
    }[];
  }> = await axios.get(`/api/v1/nocode/contentgroups`, {
    baseURL: `https://${domain}`,
  });

  return response.data;
};

export const getCodeOverrideContent = async () => {
  const response: AxiosResponse = await axios.get(OUTSETA_OVERIDES_URL);
  return response.data;
};
