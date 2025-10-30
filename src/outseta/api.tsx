import axios, { type AxiosResponse } from "axios";
import type {
  PlansResponse,
  ListItemsResponse,
  ContentGroupsResponse,
  BasicItem,
} from "./types";

const OUTSETA_OVERIDES_URL =
  "https://raw.githubusercontent.com/outseta/framer_overrides/refs/heads/main/outseta.tsx";

export const getPlanData = async (domain: string): Promise<PlansResponse> => {
  const fields = [
    "DiscountsExist",
    "PlanFamilies.Uid",
    "PlanFamilies.Name",
    "PlanFamilies.Plans.Uid",
    "PlanFamilies.Plans.Name",
  ].join(",");

  const response: AxiosResponse<PlansResponse> = await axios.get(
    `/api/v1/widgets/auth/init?fields=${fields}`,
    {
      baseURL: `https://${domain}`,
    },
  );

  return response.data;
};

export const getEmailListData = async (
  domain: string,
): Promise<ListItemsResponse<BasicItem>> => {
  const response: AxiosResponse<ListItemsResponse<BasicItem>> = await axios.get(
    `/api/v1/public/email/lists`,
    {
      baseURL: `https://${domain}`,
    },
  );

  return response.data;
};

export const getLeadCaptureData = async (
  domain: string,
): Promise<ListItemsResponse<BasicItem>> => {
  const response: AxiosResponse<ListItemsResponse<BasicItem>> = await axios.get(
    `/api/v1/public/crm/leadforms`,
    {
      baseURL: `https://${domain}`,
    },
  );

  return response.data;
};

export const getContentGroupData = async (
  domain: string,
): Promise<ContentGroupsResponse> => {
  const response: AxiosResponse<ContentGroupsResponse> = await axios.get(
    `/api/v1/nocode/contentgroups`,
    {
      baseURL: `https://${domain}`,
    },
  );

  return response.data;
};

export const getCodeOverrideContent = async (): Promise<string> => {
  const response: AxiosResponse<string> = await axios.get(OUTSETA_OVERIDES_URL);
  return response.data;
};
