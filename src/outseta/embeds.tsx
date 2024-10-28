import { CanvasNode, framer } from "framer-plugin";
import {
  OutsetaEmbedProps,
  AuthEmbedConfig,
  ProfileEmbedConfig,
  EmailListEmbedConfig,
  LeadCaptureEmbedConfig,
} from "./types";

export const OUTSETA_EMBED_URL = "https://framer.com/m/OutsetaEmbed-WlMD.js";

const upsertEmbed = async (
  controls: Partial<OutsetaEmbedProps>,
  componentInstance?: CanvasNode | null,
) => {
  if (componentInstance) {
    componentInstance.setAttributes({ controls: controls });
  } else {
    await framer.addComponentInstance({
      url: OUTSETA_EMBED_URL,
      attributes: {
        controls: controls,
      },
    });
  }
};

export const upsertAuthEmbed = async (
  { widgetMode, preselect, familyUid, planUid, discountCode }: AuthEmbedConfig,
  componentInstance: CanvasNode | null,
) => {
  const controls: Partial<OutsetaEmbedProps> = {
    widget: "auth",
    widgetMode: widgetMode,
    registerPreselect: preselect,
    registerFamilyUid: familyUid,
    registerPlanUid: planUid,
    registerDiscountCode: discountCode,
  };

  return upsertEmbed(controls, componentInstance);
};

export const upsertProfileEmbed = async (
  { tab }: ProfileEmbedConfig,
  componentInstance: CanvasNode | null,
) => {
  const controls: Partial<OutsetaEmbedProps> = {
    widget: "profile",
    profileDefaultTab: tab,
  };

  upsertEmbed(controls, componentInstance);
};

export const upsertEmailListEmbed = async (
  { uid }: EmailListEmbedConfig,
  componentInstance: CanvasNode | null,
) => {
  const controls: Partial<OutsetaEmbedProps> = {
    widget: "emailList",
    emailListUid: uid,
  };

  return upsertEmbed(controls, componentInstance);
};

export const addSupportEmbed = async () => {
  const controls: Partial<OutsetaEmbedProps> = {
    widget: "support",
  };

  return upsertEmbed(controls);
};

export const upsertLeadCaptureEmbed = async (
  { uid }: LeadCaptureEmbedConfig,
  componentInstance: CanvasNode | null,
) => {
  const controls: Partial<OutsetaEmbedProps> = {
    widget: "leadCapture",
    leadCaptureUid: uid,
  };

  return upsertEmbed(controls, componentInstance);
};
