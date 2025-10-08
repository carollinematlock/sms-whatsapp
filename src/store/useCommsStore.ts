import { create } from "zustand";
import {
  Channel,
  ChannelOption,
  CommType,
  Communication,
  ComposeOTP,
  ComposeSMS,
  ComposeWhatsApp,
  MessageBlock,
  SchedulerCadence,
  Schedule,
  WaTrigger
} from "../types";
import { newId } from "../utils/id";
import { nowISO } from "../utils/time";
import {
  DEFAULT_SMS_COMPLIANCE,
  DEMO_BLOCKS,
  DEMO_TRIGGERS,
  SEGMENTS,
  SENDERS,
  WA_TEMPLATES
} from "../demoData";
import { isActivationOnly, isOtp } from "../services/rules";

export type SmsDraft = {
  internalName: string;
  serviceCommunication: boolean;
  segmentId: string;
  fromSenderId: string;
  messageText: string;
  media: ComposeSMS["media"];
  complianceLine: string;
};

export type WhatsAppDraft = {
  internalName: string;
  serviceCommunication: boolean;
  segmentId: string;
  fromSenderId: string;
  mode: "TEMPLATE" | "FREEFORM";
  templateId?: string;
  templateVars: Record<string, string>;
  messageText: string;
  media: ComposeWhatsApp["media"];
  blocks: MessageBlock[];
  triggers: WaTrigger[];
};

export type OtpDraft = {
  channel: ChannelOption;
  recipientE164: string;
  codeLength: 6 | 5 | 4;
  expiryMinutes: number;
  waTemplateId?: string;
};

export type ScheduleDraft = {
  kind: "NONE" | "CAMPAIGN" | "AUTOMATED";
  campaign: {
    datetimeISO: string;
    timezone: string;
    rateLimitPerMin?: number;
  };
  automated: {
    cadence: SchedulerCadence[];
    startISO?: string;
    endISO?: string;
    active: boolean;
  };
  activation: {
    active: boolean;
  };
};

type WizardState = {
  commType?: CommType;
  channel?: ChannelOption;
  smsDraft: SmsDraft;
  whatsappDraft: WhatsAppDraft;
  otpDraft: OtpDraft;
  scheduleDraft: ScheduleDraft;
};

type CommsStore = {
  items: Communication[];
  wizard: WizardState;
  setCommType: (type: CommType) => void;
  setChannel: (channel: ChannelOption) => void;
  updateSmsDraft: (patch: Partial<SmsDraft>) => void;
  updateWhatsAppDraft: (patch: Partial<WhatsAppDraft>) => void;
  updateWhatsAppVars: (vars: Record<string, string>) => void;
  updateWhatsAppBlocks: (blocks: MessageBlock[]) => void;
  updateWhatsAppTriggers: (triggers: WaTrigger[]) => void;
  updateOtpDraft: (patch: Partial<OtpDraft>) => void;
  updateSchedule: (patch: Partial<ScheduleDraft>) => void;
  add: (payload: Omit<Communication, "id" | "createdAt" | "status">) => string;
  updateStatus: (id: string, status: Communication["status"]) => void;
  resetWizard: () => void;
};

const defaultSegmentId = SEGMENTS[0]?.id ?? "";
const defaultSmsSender = SENDERS.find((s) => s.channel === "SMS")?.id ?? "";
const defaultWaSender = SENDERS.find((s) => s.channel === "WHATSAPP")?.id ?? "";

const getDefaultSmsDraft = (): SmsDraft => ({
  internalName: "",
  serviceCommunication: false,
  segmentId: defaultSegmentId,
  fromSenderId: defaultSmsSender,
  messageText: "Hello {{first_name}}!",
  media: [],
  complianceLine: DEFAULT_SMS_COMPLIANCE
});

const getDefaultWhatsAppDraft = (): WhatsAppDraft => ({
  internalName: "",
  serviceCommunication: false,
  segmentId: defaultSegmentId,
  fromSenderId: defaultWaSender,
  mode: "TEMPLATE",
  templateId: WA_TEMPLATES[0]?.id,
  templateVars: {},
  messageText: "",
  media: [],
  blocks: DEMO_BLOCKS,
  triggers: DEMO_TRIGGERS
});

const getDefaultOtpDraft = (): OtpDraft => ({
  channel: "AUTO",
  recipientE164: "",
  codeLength: 6,
  expiryMinutes: 5,
  waTemplateId: "tpl_otp_lite"
});

const getDefaultScheduleDraft = (): ScheduleDraft => ({
  kind: "NONE",
  campaign: {
    datetimeISO: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    timezone: "UTC",
    rateLimitPerMin: 1000
  },
  automated: { cadence: ["EVERY_24_HOURS"], active: true },
  activation: { active: true }
});

const initialWizard: WizardState = {
  smsDraft: getDefaultSmsDraft(),
  whatsappDraft: getDefaultWhatsAppDraft(),
  otpDraft: getDefaultOtpDraft(),
  scheduleDraft: getDefaultScheduleDraft()
};

export const useCommsStore = create<CommsStore>((set) => ({
  items: [],
  wizard: initialWizard,

  setCommType: (type) =>
    set((state) => {
      const scheduleDraft = { ...state.wizard.scheduleDraft };
      if (type === "CAMPAIGN") {
        scheduleDraft.kind = "CAMPAIGN";
      } else if (type === "AUTOMATED") {
        scheduleDraft.kind = "AUTOMATED";
      } else {
        scheduleDraft.kind = "NONE";
      }
      return {
        wizard: {
          ...state.wizard,
          commType: type,
          scheduleDraft
        }
      };
    }),

  setChannel: (channel) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        channel
      }
    })),

  updateSmsDraft: (patch) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        smsDraft: {
          ...state.wizard.smsDraft,
          ...patch
        }
      }
    })),

  updateWhatsAppDraft: (patch) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        whatsappDraft: {
          ...state.wizard.whatsappDraft,
          ...patch
        }
      }
    })),

  updateWhatsAppVars: (vars) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        whatsappDraft: {
          ...state.wizard.whatsappDraft,
          templateVars: { ...state.wizard.whatsappDraft.templateVars, ...vars }
        }
      }
    })),

  updateWhatsAppBlocks: (blocks) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        whatsappDraft: {
          ...state.wizard.whatsappDraft,
          blocks
        }
      }
    })),

  updateWhatsAppTriggers: (triggers) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        whatsappDraft: {
          ...state.wizard.whatsappDraft,
          triggers
        }
      }
    })),

  updateOtpDraft: (patch) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        otpDraft: {
          ...state.wizard.otpDraft,
          ...patch
        }
      }
    })),

  updateSchedule: (patch) =>
    set((state) => ({
      wizard: {
        ...state.wizard,
        scheduleDraft: {
          ...state.wizard.scheduleDraft,
          ...patch
        }
      }
    })),

  add: (payload) => {
    const id = newId();
    const communication: Communication = {
      ...payload,
      id,
      createdAt: nowISO(),
      status: isOtp(payload.type) ? "SENT" : "DRAFT"
    };
    set((state) => ({
      items: [...state.items, communication]
    }));
    return id;
  },

  updateStatus: (id, status) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    })),

  resetWizard: () =>
    set(() => ({
      wizard: {
        commType: undefined,
        channel: undefined,
        smsDraft: getDefaultSmsDraft(),
        whatsappDraft: getDefaultWhatsAppDraft(),
        otpDraft: getDefaultOtpDraft(),
        scheduleDraft: getDefaultScheduleDraft()
      }
    }))
}));

export const resolveSchedule = (
  type: CommType,
  scheduleDraft: ScheduleDraft
): Schedule => {
  if (type === "CAMPAIGN") {
    return { type: "CAMPAIGN", config: { ...scheduleDraft.campaign } };
  }
  if (type === "AUTOMATED") {
    return { type: "AUTOMATED", config: { ...scheduleDraft.automated } };
  }
  if (isActivationOnly(type)) {
    return { type: "NONE", config: { ...scheduleDraft.activation } };
  }
  return { type: "NONE", config: { active: true } };
};

export const buildComposePayload = (
  commType: CommType,
  channel: ChannelOption,
  smsDraft: SmsDraft,
  whatsappDraft: WhatsAppDraft,
  otpDraft: OtpDraft
): ComposeSMS | ComposeWhatsApp | ComposeOTP => {
  if (commType === "AUTHENTICATION_OTP") {
    const finalChannel: ChannelOption =
      channel === "SMS" || channel === "WHATSAPP" ? channel : otpDraft.channel;
    return {
      channel: finalChannel,
      recipientE164: otpDraft.recipientE164,
      codeLength: otpDraft.codeLength,
      expiryMinutes: otpDraft.expiryMinutes,
      waTemplateId: otpDraft.waTemplateId
    };
  }

  const enforcedChannel: Channel =
    channel === "WHATSAPP" ? "WHATSAPP" : "SMS";

  if (enforcedChannel === "SMS") {
    const compose: ComposeSMS = {
      channel: "SMS",
      serviceCommunication: smsDraft.serviceCommunication,
      internalName: smsDraft.internalName || "Untitled SMS",
      segmentId: smsDraft.segmentId,
      fromSenderId: smsDraft.fromSenderId,
      messageText: smsDraft.messageText,
      media: smsDraft.media,
      complianceLine: smsDraft.complianceLine
    };
    return compose;
  }

  const compose: ComposeWhatsApp = {
    channel: "WHATSAPP",
    serviceCommunication: whatsappDraft.serviceCommunication,
    internalName: whatsappDraft.internalName || "Untitled WhatsApp",
    segmentId: whatsappDraft.segmentId,
    fromSenderId: whatsappDraft.fromSenderId,
    mode: whatsappDraft.mode,
    templateId: whatsappDraft.templateId,
    templateVars: whatsappDraft.templateVars,
    messageText: whatsappDraft.messageText,
    media: whatsappDraft.media,
    blocks: whatsappDraft.blocks,
    triggers: whatsappDraft.triggers
  };
  return compose;
};
