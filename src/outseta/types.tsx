export const WidgetOptions = [
  "auth",
  "profile",
  "support",
  "leadCapture",
  "emailList",
] as const;

export type Widget = (typeof WidgetOptions)[number];

export const WidgetLabels: Record<Widget, string> = {
  auth: "Auth",
  profile: "Profile",
  support: "Support",
  leadCapture: "Lead Capture",
  emailList: "Email List",
};

export const WidgetModeOptions = [
  "register",
  "login",
  "login|register",
] as const;

export type WidgetMode = (typeof WidgetModeOptions)[number];

export const WidgetModeLabels: Record<WidgetMode, string> = {
  register: "Register",
  login: "Login",
  "login|register": "Combined",
};

export const RegisterPreselectOptions = ["none", "family", "plan"] as const;

export type RegisterPreselectOption = (typeof RegisterPreselectOptions)[number];

export const RegisterPreselectOptionLabels: Record<
  RegisterPreselectOption,
  string
> = {
  none: "None",
  family: "Plan Family",
  plan: "Single Plan",
};

export const ProfileTabOptions = [
  "profile",
  "passwordChange",
  "account",
  "team",
  "teamMemberInvite",
  "billing",
  "plan",
  "planChange",
  "planCancel",
] as const;

export type ProfileTabOption = (typeof ProfileTabOptions)[number];

export const ProfileTabOptionLabels: Record<ProfileTabOption, string> = {
  profile: "Profile",
  passwordChange: "|-- Change Password",
  account: "Account",
  team: "Team",
  teamMemberInvite: "|-- Team Member Invite",
  billing: "Billing",
  plan: "Plan",
  planChange: "|-- Plan Change",
  planCancel: "|-- Plan Cancel",
};

export type OutsetaEmbedProps = {
  widget: Widget;
  // Auth
  widgetMode: WidgetMode;
  registerPreselect: RegisterPreselectOption;
  registerFamilyUid: string;
  registerPlanUid: string;
  registerDiscountCode: string;
  // Profile
  profileDefaultTab: ProfileTabOption;
  // Email Lists
  emailListUid: string;
  // Lead Capture
  leadCaptureUid: string;
};

export const defaultProps: OutsetaEmbedProps = {
  widget: "auth",
  widgetMode: "login|register",
  registerPreselect: "none",
  registerFamilyUid: "",
  registerPlanUid: "",
  registerDiscountCode: "",
  profileDefaultTab: "profile",
  emailListUid: "",
  leadCaptureUid: "",
};

export type AuthEmbedConfig = {
  widgetMode: WidgetMode;
  preselect?: RegisterPreselectOption;
  familyUid?: string;
  planUid?: string;
  discountCode?: string;
};

export type ProfileEmbedConfig = {
  tab: ProfileTabOption;
};

export type EmailListEmbedConfig = {
  uid: string;
};

export type LeadCaptureEmbedConfig = {
  uid: string;
};
