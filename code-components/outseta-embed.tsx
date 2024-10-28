import { addPropertyControls, ControlType } from "framer";

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
  widgetMode: "register",
  registerPreselect: "none",
  registerFamilyUid: "",
  registerPlanUid: "",
  registerDiscountCode: "",
  profileDefaultTab: "profile",
  emailListUid: "",
  leadCaptureUid: "",
};

/**
 * These annotations control how your component sizes
 * Learn more: https://www.framer.com/developers/#code-components-auto-sizing
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function OutsetaEmbed({ widget, ...rest }: OutsetaEmbedProps) {
  switch (widget) {
    case "auth":
      return <AuthEmbed {...rest} />;
    case "profile":
      return <ProfileEmbed {...rest} />;
    case "support":
      return <SupportEmbed />;
    case "leadCapture":
      return <LeadCaptureEmbed {...rest} />;
    case "emailList":
      return <EmailListEmbed {...rest} />;

    default:
      return null;
  }
}

addPropertyControls(OutsetaEmbed, {
  widget: {
    title: "Embed",
    type: ControlType.Enum,
    defaultValue: defaultProps.widget,
    options: WidgetOptions.map((option) => option),
    optionTitles: WidgetOptions.map((option) => WidgetLabels[option]),
  },
  widgetMode: {
    title: "Auth Mode",
    type: ControlType.Enum,
    defaultValue: defaultProps.widgetMode,
    options: WidgetModeOptions.map((option) => option),
    optionTitles: WidgetModeOptions.map(
      (widgetMode) => WidgetModeLabels[widgetMode],
    ),
    hidden: (props: { widget: Widget }) => !["auth"].includes(props.widget),
  },
  registerPreselect: {
    title: "Preselect",
    type: ControlType.Enum,
    defaultValue: defaultProps.registerPreselect,
    options: RegisterPreselectOptions.map((option) => option),
    optionTitles: RegisterPreselectOptions.map(
      (option) => RegisterPreselectOptionLabels[option],
    ),
    hidden: (props: { widget: Widget; widgetMode: WidgetMode }) =>
      !["auth"].includes(props.widget) ||
      !["login|register", "register"].includes(props.widgetMode),
  },
  registerFamilyUid: {
    title: "Family Uid",
    type: ControlType.String,
    defaultValue: defaultProps.registerFamilyUid,
    hidden: (props: {
      widget: Widget;
      widgetMode: WidgetMode;
      registerPreselect: RegisterPreselectOption;
    }) =>
      !["auth"].includes(props.widget) ||
      !["login|register", "register"].includes(props.widgetMode) ||
      !["family"].includes(props.registerPreselect),
  },
  registerPlanUid: {
    title: "Plan Uid",
    type: ControlType.String,
    defaultValue: "",
    hidden: (props: {
      widget: Widget;
      widgetMode: WidgetMode;
      registerPreselect: RegisterPreselectOption;
    }) =>
      !["auth"].includes(props.widget) ||
      !["login|register", "register"].includes(props.widgetMode) ||
      !["plan"].includes(props.registerPreselect),
  },
  registerDiscountCode: {
    title: "Discount Code",
    type: ControlType.String,
    defaultValue: "",
    hidden: (props: {
      widget: Widget;
      widgetMode: WidgetMode;
      registerPreselect: RegisterPreselectOption;
    }) =>
      !["auth"].includes(props.widget) ||
      !["login|register", "register"].includes(props.widgetMode),
  },
  profileDefaultTab: {
    title: "Default Tab",
    type: ControlType.Enum,
    defaultValue: "profile",
    options: ProfileTabOptions.map((option) => option),
    optionTitles: ProfileTabOptions.map((tab) => ProfileTabOptionLabels[tab]),
    hidden: (props: { widget: Widget }) => !["profile"].includes(props.widget),
  },
  emailListUid: {
    title: "Email List Uid",
    type: ControlType.String,
    defaultValue: "",
    hidden: (props: { widget: Widget }) =>
      !["emailList"].includes(props.widget),
  },
  leadCaptureUid: {
    title: "Lead Capture Uid",
    type: ControlType.String,
    defaultValue: "",
    hidden: (props: { widget: Widget }) =>
      !["leadCapture"].includes(props.widget),
  },
});

//
// The Embeds
//

const containerStyle = {
  height: "100%",
  width: "100%",
  minHeight: "200px",
};

const AuthEmbed = ({
  widgetMode,
  registerPreselect,
  registerPlanUid,
  registerFamilyUid,
  registerDiscountCode,
}: {
  widgetMode: string;
  registerPreselect: RegisterPreselectOption;
  registerPlanUid: string;
  registerFamilyUid: string;
  registerDiscountCode: string;
}) => {
  const preselectProps: { planUid?: string; planFamilyUid?: string } = {};
  let subtitle = null;

  if (registerPreselect === "plan") {
    preselectProps["data-plan-uid"] = registerPlanUid;
    subtitle = (
      <>
        With plan <code>{registerPlanUid}</code>
      </>
    );
  }

  if (registerPreselect === "family") {
    preselectProps["data-plan-family-uid"] = registerFamilyUid;
    subtitle = (
      <>
        With plan family <code>{registerFamilyUid}</code>
      </>
    );
  }

  if (registerDiscountCode) {
    preselectProps["data-registration-defaults"] = JSON.stringify({
      Subscription: {
        DiscountCouponSubscriptions: [
          {
            DiscountCoupon: {
              UniqueIdentifier: registerDiscountCode,
            },
          },
        ],
      },
    });
    subtitle = subtitle ? (
      <>
        {subtitle} and discount code <code>{registerDiscountCode}</code>
      </>
    ) : (
      <>
        With discount code <code>{registerDiscountCode}</code>
      </>
    );
  }

  subtitle = subtitle ? <>{subtitle} preselected.</> : null;

  return (
    <div
      data-o-auth="1"
      data-mode="embed"
      data-widget-mode={widgetMode}
      style={containerStyle}
      {...preselectProps}
    >
      <Placeholder
        title={`${WidgetModeLabels[widgetMode]} Embed`}
        subtitle={subtitle}
        illustraton={
          widgetMode === "login" ? LOGIN_PLACEHOLDER : SIGNUP_PLACEHOLDER
        }
      />
    </div>
  );
};

const ProfileEmbed = ({ profileDefaultTab }: { profileDefaultTab: string }) => {
  return (
    <div
      data-o-profile="1"
      data-mode="embed"
      data-tab={profileDefaultTab}
      style={containerStyle}
    >
      <Placeholder
        title={`${WidgetLabels["profile"]} Embed`}
        subtitle={
          <>
            Opened to the <code>{profileDefaultTab}</code> tab.
          </>
        }
        illustraton={PROFILE_PLACEHOLDER}
      />
    </div>
  );
};

const LeadCaptureEmbed = ({ leadCaptureUid }: { leadCaptureUid: string }) => {
  return (
    <div
      data-o-lead-capture="1"
      data-mode="embed"
      data-form-uid={leadCaptureUid}
      style={containerStyle}
    >
      <Placeholder
        title={`${WidgetLabels["leadCapture"]} Embed`}
        subtitle={
          <>
            For the Lead Capture <code>{leadCaptureUid}</code>
          </>
        }
        illustraton={EMAIL_PLACEHOLDER}
      />
    </div>
  );
};

const SupportEmbed = () => {
  return (
    <div data-o-support="1" data-mode="embed" style={containerStyle}>
      <Placeholder
        title={`${WidgetLabels["support"]} Embed`}
        illustraton={SUPPORT_PLACEHOLDER}
      />
    </div>
  );
};

const EmailListEmbed = ({ emailListUid }: { emailListUid: string }) => {
  return (
    <div
      data-o-email-list="1"
      data-mode="embed"
      data-email-list-uid={emailListUid}
      style={containerStyle}
    >
      <Placeholder
        title={`${WidgetLabels["emailList"]} Embed`}
        subtitle={
          <>
            For the Email List <code>{emailListUid}</code>.
          </>
        }
        illustraton={EMAIL_PLACEHOLDER}
      />
    </div>
  );
};

const Placeholder = ({
  title,
  subtitle,
  illustraton,
}: {
  title: string;
  subtitle?: string | React.ReactNode;
  illustraton?: React.ReactNode;
}) => {
  if (!window?.location.host.includes("framercanvas.com")) return null;

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          maxWidth: "100%",
          minWidth: "400px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "24px",
            height: "24px",
            opacity: "0.5",
          }}
        >
          {OUTSETA_LOGO}
        </div>
        {illustraton}
      </div>
    </div>
  );
};

const OUTSETA_LOGO = (
  <svg
    width="100%"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M125.999 17.5056C125.999 13.5955 128.246 11.0112 131.347 11.0112C133.595 11.0112 135.28 12.382 135.707 15.0337L136.404 11.2584H139.999V23.7528H136.404L135.887 20.8315C135.28 22.8315 133.797 24 131.617 24C128.493 24 125.999 21.618 125.999 17.5056ZM130.538 17.5506C130.538 19.7753 131.55 20.8539 133.033 20.8539C134.471 20.8539 135.505 19.8427 135.505 18.0899V16.9888C135.505 15.236 134.493 14.2247 133.033 14.2247C131.55 14.2247 130.538 15.3483 130.538 17.5506Z"
      fill="#171717"
    />
    <path
      d="M114.864 14.809V11.2584H117.381L120.37 8.22472H121.314V11.2584H124.977V14.809H121.314V18.9213C121.314 19.9775 122.078 20.3595 122.977 20.3595C123.741 20.3595 124.572 20.1124 125.112 19.8202L124.999 23.0562C123.921 23.6629 122.707 24 121.494 24C119.044 24 116.82 22.5618 116.82 19.2135V14.809H114.864Z"
      fill="#171717"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M101.266 17.5506C101.266 21.4607 103.94 24 108.255 24C110.367 24 112.075 23.3933 113.491 22.5169L113.603 19.3258C112.278 20.2022 110.66 20.6292 109.311 20.6292C107.446 20.6292 105.963 19.7978 105.783 17.8652L114.143 18.0449C114.749 13.5955 112.098 11.0112 108.03 11.0112C104.053 11.0112 101.266 13.5506 101.266 17.5506ZM108.12 13.8876C109.379 13.8876 109.94 14.8315 110.053 16.2584H105.825C106.077 14.5168 107.069 13.8876 108.12 13.8876Z"
      fill="#171717"
    />
    <path
      d="M94.3918 24C92.4143 24 90.1671 23.5056 88.3694 22.5843L88.257 19.573C89.8974 20.382 92.1446 20.8764 93.7626 20.8764C95.2008 20.8764 95.7401 20.4719 95.7401 19.9101C95.7401 19.5281 95.4705 19.2584 94.4592 19.0562L91.6053 18.4944C89.5379 18.0899 88.0547 16.9438 88.0547 14.9888C88.0547 12.382 90.6615 11.0112 93.8974 11.0112C95.8974 11.0112 97.9649 11.5281 99.6727 12.382L99.7851 15.3708C98.4817 14.6966 96.5042 14.1348 94.5941 14.1348C93.1783 14.1348 92.5941 14.4719 92.5941 14.9888C92.5941 15.2809 92.7963 15.573 93.7401 15.7753L96.5716 16.4045C99.066 16.9663 100.279 18.2022 100.279 19.9775C100.279 22.4494 97.8974 24 94.3918 24Z"
      fill="#171717"
    />
    <path
      d="M76.7456 14.809V11.2584H79.2624L82.2512 8.22472H83.195V11.2584H86.858V14.809H83.195V18.9213C83.195 19.9775 83.9591 20.3595 84.858 20.3595C85.622 20.3595 86.4535 20.1124 86.9928 19.8202L86.8804 23.0562C85.8018 23.6629 84.5883 24 83.3748 24C80.9254 24 78.7006 22.5618 78.7006 19.2135V14.809H76.7456Z"
      fill="#171717"
    />
    <path
      d="M75.4095 11.2584V23.7528H71.8365L71.1399 19.9101C70.668 22.6742 69.0275 24 66.5781 24C63.7017 24 62.0163 22.1573 62.0163 18.427V11.2584H66.5107V18.0449C66.5107 19.8427 67.2298 20.6517 68.5331 20.6517C69.814 20.6517 70.9152 19.8427 70.9152 18.0225V11.2584H75.4095Z"
      fill="#171717"
    />
    <path
      d="M43.2667 16C43.2667 11.0562 46.8172 8 51.8285 8C56.8397 8 60.3903 11.0562 60.3903 16C60.3903 20.9438 56.8397 24 51.8285 24C46.8172 24 43.2667 20.9438 43.2667 16ZM47.9408 16C47.9408 18.7416 49.2667 20.4045 51.8285 20.4045C54.3903 20.4045 55.7161 18.7416 55.7161 16C55.7161 13.2584 54.3903 11.5955 51.8285 11.5955C49.2667 11.5955 47.9408 13.2584 47.9408 16Z"
      fill="#171717"
    />
    <path
      d="M20 16C20 18.2091 18.2091 20 16 20C14.9784 20 14.3377 19.6243 13.7561 18.9213C13.0962 18.1237 12.5735 16.9791 11.8813 15.4502C11.4257 14.4435 11.6287 13.7144 12.1716 13.1716C12.8005 12.5426 14.0702 12 16 12C17.8944 12 18.782 12.5204 19.2439 13.0787C19.7485 13.6887 20 14.6429 20 16Z"
      fill="#171717"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16 24C20.4183 24 24 20.4183 24 16C24 13.6546 23.3531 11.6731 22.1093 10.293C20.8867 8.93663 18.9427 8 16 8C13.0289 8 10.7302 8.95604 9.34314 10.3431C7.98657 11.6997 7.40962 13.548 7.95751 15.6661C8.59387 18.1263 9.56378 20.2347 10.8907 21.707C12.184 23.1418 13.8343 24 16 24ZM21.3333 16C21.3333 18.9455 18.9455 21.3333 16 21.3333C13.0805 21.3333 12.0187 18.9875 10.7019 16.0778L10.6667 16C9.33333 13.0545 11.7211 10.6667 16 10.6667C20.2788 10.6667 21.3333 13.0545 21.3333 16Z"
      fill="#171717"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16 28C22.4513 28 26.7474 22.7981 28.0213 15.7624C28.6044 12.542 27.6111 9.99487 25.5196 8.04782C23.3703 6.04696 19.9913 4.62747 15.7979 3.9846C11.7958 3.37103 8.57864 4.45079 6.51472 6.51472C4.45079 8.57864 3.37103 11.7958 3.9846 15.7979C4.62361 19.9661 6.03063 23.0012 8.01472 24.9853C9.97502 26.9456 12.6176 28 16 28ZM16 25.3333C21.1547 25.3333 25.3333 21.1547 25.3333 16C25.3333 10.8453 22.488 6.66666 16 6.66666C9.51201 6.66666 5.33333 10.8453 6.66666 16C8 21.1547 10.8453 25.3333 16 25.3333Z"
      fill="#171717"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16 32C24.7492 32 30.5217 24.8721 31.8419 16.0794C33.1621 7.28676 26.0694 1.4856 16 0.158888C5.9306 -1.16783 -1.16206 5.96005 0.158103 16.0794C1.47826 26.1988 7.25076 32 16 32ZM16 29.3333C23.3638 29.3333 28 23.3638 29.3333 16C30.6667 8.6362 24.6971 4 16 2.66666C7.30287 1.33333 1.33333 7.30287 2.66666 16C4 24.6971 8.6362 29.3333 16 29.3333Z"
      fill="#171717"
    />
  </svg>
);

const illustrationStyle = {
  boxShadow:
    "0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 24px 48px 0px rgba(0, 0, 0, 0.04), 0px 8px 16px 0px rgba(0, 0, 0, 0.04), 0px 4px 8px 0px rgba(0, 0, 0, 0.04), 0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
};

const SIGNUP_PLACEHOLDER = (
  <svg
    width="400"
    height="530"
    viewBox="0 0 400 530"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="398"
      height="528"
      rx="15"
      fill="url(#paint0_linear_62_175)"
      style={illustrationStyle}
    />
    <rect
      x="1"
      y="1"
      width="398"
      height="528"
      rx="15"
      stroke="white"
      stroke-width="2"
    />
    <rect
      x="176"
      y="40"
      width="48"
      height="48"
      rx="12"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="125" y="104" width="150" height="16" rx="8" fill="#171717" />
    <rect
      x="100"
      y="160"
      width="200"
      height="32"
      rx="12"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="104" y="164" width="96" height="24" rx="8" fill="white" />
    <rect x="32" y="208" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="232"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="280" width="80" height="16" rx="8" fill="#171717" />
    <path
      d="M32 312C32 307.582 35.5817 304 40 304H360C364.418 304 368 307.582 368 312V336H32V312Z"
      fill="#171717"
      fill-opacity="0.11"
    />
    <path
      d="M32 338H199V370H40C35.5817 370 32 366.418 32 362V338Z"
      fill="#171717"
      fill-opacity="0.11"
    />
    <path
      d="M201 338H368V362C368 366.418 364.418 370 360 370H201V338Z"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="386" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="410"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="458" width="336" height="32" rx="8" fill="#171717" />
    <defs>
      <linearGradient
        id="paint0_linear_62_175"
        x1="200"
        y1="0"
        x2="200"
        y2="530"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F5F5F5" />
        <stop offset="1" stop-color="white" />
      </linearGradient>
    </defs>
  </svg>
);

const LOGIN_PLACEHOLDER = (
  <svg
    width="400"
    height="512"
    viewBox="0 0 400 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="398"
      height="510"
      rx="15"
      fill="url(#paint0_linear_59_322)"
      style={illustrationStyle}
    />
    <rect
      x="1"
      y="1"
      width="398"
      height="510"
      rx="15"
      stroke="white"
      stroke-width="2"
    />
    <rect
      x="176"
      y="40"
      width="48"
      height="48"
      rx="12"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="125" y="104" width="150" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="160"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <path
      d="M32 224H180"
      stroke="#171717"
      stroke-opacity="0.11"
      stroke-width="2"
    />
    <rect
      x="188"
      y="216"
      width="24"
      height="16"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <path
      d="M220 224H368"
      stroke="#171717"
      stroke-opacity="0.11"
      stroke-width="2"
    />
    <rect x="32" y="256" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="280"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="328" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="352"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="400" width="336" height="32" rx="8" fill="#171717" />
    <rect
      x="125"
      y="456"
      width="150"
      height="16"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <defs>
      <linearGradient
        id="paint0_linear_59_322"
        x1="200"
        y1="0"
        x2="200"
        y2="512"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F5F5F5" />
        <stop offset="1" stop-color="white" />
      </linearGradient>
    </defs>
  </svg>
);

const PROFILE_PLACEHOLDER = (
  <svg
    width="500"
    height="376"
    viewBox="0 0 500 376"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="498"
      height="374"
      rx="15"
      fill="url(#paint0_linear_63_250)"
      style={illustrationStyle}
    />
    <rect
      x="1"
      y="1"
      width="498"
      height="374"
      rx="15"
      stroke="white"
      stroke-width="2"
    />
    <rect x="32" y="40" width="72" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="72"
      width="64"
      height="16"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect
      x="32"
      y="104"
      width="80"
      height="16"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect
      x="32"
      y="136"
      width="56"
      height="16"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect
      x="32"
      y="168"
      width="64"
      height="16"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <path d="M144 0V376" stroke="white" stroke-width="2" />
    <rect x="176" y="40" width="150" height="16" rx="8" fill="#171717" />
    <rect
      x="176"
      y="96"
      width="48"
      height="48"
      rx="24"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="176" y="160" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="176"
      y="184"
      width="292"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="176" y="232" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="176"
      y="256"
      width="292"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="176" y="304" width="292" height="32" rx="8" fill="#171717" />
    <defs>
      <linearGradient
        id="paint0_linear_63_250"
        x1="250"
        y1="0"
        x2="250"
        y2="376"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F5F5F5" />
        <stop offset="1" stop-color="white" />
      </linearGradient>
    </defs>
  </svg>
);

const EMAIL_PLACEHOLDER = (
  <svg
    width="400"
    height="312"
    viewBox="0 0 400 312"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="398"
      height="310"
      rx="15"
      fill="url(#paint0_linear_63_216)"
      style={illustrationStyle}
    />
    <rect
      x="1"
      y="1"
      width="398"
      height="310"
      rx="15"
      stroke="white"
      stroke-width="2"
    />
    <rect x="125" y="40" width="150" height="16" rx="8" fill="#171717" />
    <rect x="32" y="96" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="120"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="168" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="192"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="240" width="336" height="32" rx="8" fill="#171717" />
    <defs>
      <linearGradient
        id="paint0_linear_63_216"
        x1="200"
        y1="0"
        x2="200"
        y2="312"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F5F5F5" />
        <stop offset="1" stop-color="white" />
      </linearGradient>
    </defs>
  </svg>
);

const SUPPORT_PLACEHOLDER = (
  <svg
    width="400"
    height="448"
    viewBox="0 0 400 448"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="398"
      height="446"
      rx="15"
      fill="url(#paint0_linear_64_283)"
      style={illustrationStyle}
    />
    <rect
      x="1"
      y="1"
      width="398"
      height="446"
      rx="15"
      stroke="white"
      stroke-width="2"
    />
    <rect x="125" y="40" width="150" height="16" rx="8" fill="#171717" />
    <rect x="32" y="96" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="120"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="168" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="192"
      width="336"
      height="32"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="240" width="80" height="16" rx="8" fill="#171717" />
    <rect
      x="32"
      y="264"
      width="336"
      height="96"
      rx="8"
      fill="#171717"
      fill-opacity="0.11"
    />
    <rect x="32" y="376" width="336" height="32" rx="8" fill="#171717" />
    <defs>
      <linearGradient
        id="paint0_linear_64_283"
        x1="200"
        y1="0"
        x2="200"
        y2="448"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F5F5F5" />
        <stop offset="1" stop-color="white" />
      </linearGradient>
    </defs>
  </svg>
);
