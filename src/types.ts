// Shared type definitions for the Coniq messaging prototype

export type Channel = "SMS" | "WHATSAPP";
export type ChannelOption = Channel | "AUTO";

export type CommType =
  | "CAMPAIGN"
  | "AUTOMATED"
  | "SIGNUP_RESPONSE"
  | "REDEMPTION_RESPONSE"
  | "TRIGGERED_POINTS"
  | "AUTHENTICATION_OTP";

export type SchedulerCadence =
  | "EVERY_5_MIN"
  | "EVERY_10_MIN"
  | "EVERY_30_MIN"
  | "EVERY_1_HOUR"
  | "EVERY_3_HOURS"
  | "EVERY_6_HOURS"
  | "EVERY_24_HOURS"
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export type SmsSenderType = "SHORT_CODE" | "TOLL_FREE";
export type WaBrand = "LIWA" | "TANGER";

export interface Segment {
  id: string;
  name: string;
  estSize?: number;
}

export interface Sender {
  id: string;
  channel: Channel;
  sms?: {
    type: SmsSenderType;
    display: string;
  };
  wa?: {
    brand: WaBrand;
    display: string;
  };
}

export interface MediaAsset {
  id: string;
  url: string;
  mime: string;
  sizeBytes: number;
  name?: string;
}

export type PlaceholderScope = "CUSTOMER" | "LOYALTY" | "POTS" | "GENERAL";

export interface PlaceholderDef {
  key: string;
  label: string;
  scope: PlaceholderScope;
  sample?: string;
}

export type WaTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";

export interface WaTemplate {
  id: string;
  name: string;
  category: WaTemplateCategory;
  language: string;
  body: string;
  buttons?: Array<{ type: "QUICK_REPLY"; text: string }>;
  variableHints?: string[];
}

export type TriggerKind = "BUTTON_CLICK" | "KEYWORD";

export interface WaTrigger {
  on: TriggerKind;
  match: string;
  action: "SEND_BLOCK";
  blockRef: string;
}

export interface MessageBlock {
  id: string;
  channel: Channel;
  text: string;
  media?: MediaAsset[];
  buttons?: Array<{ text: string }>;
}

export interface ConversationMessage {
  id: string;
  channel: Channel;
  direction: "OUTBOUND" | "INBOUND";
  text?: string;
  media?: MediaAsset[];
  timestamp: string;
  meta?: {
    templateId?: string;
    blockId?: string;
    quickReply?: string;
  };
}

export interface ComposeBase {
  serviceCommunication: boolean;
  internalName: string;
  segmentId: string;
  offerIds?: string[];
  complianceLine?: string;
}

export interface ComposeSMS extends ComposeBase {
  channel: "SMS";
  fromSenderId: string;
  messageText: string;
  media?: MediaAsset[];
}

export interface ComposeWhatsApp extends ComposeBase {
  channel: "WHATSAPP";
  fromSenderId: string;
  mode: "TEMPLATE" | "FREEFORM";
  templateId?: string;
  templateVars?: Record<string, string>;
  messageText?: string;
  media?: MediaAsset[];
  blocks?: MessageBlock[];
  triggers?: WaTrigger[];
}

export interface CampaignSchedule {
  datetimeISO: string;
  timezone: string;
  rateLimitPerMin?: number;
}

export interface AutomatedSchedule {
  cadence: SchedulerCadence[];
  startISO?: string;
  endISO?: string;
  active: boolean;
}

export interface NoSchedule {
  active: boolean;
}

export type Schedule =
  | { type: "CAMPAIGN"; config: CampaignSchedule }
  | { type: "AUTOMATED"; config: AutomatedSchedule }
  | { type: "NONE"; config: NoSchedule };

export interface ComposeOTP {
  channel: ChannelOption;
  recipientE164: string;
  codeLength: 4 | 5 | 6;
  expiryMinutes: number;
  waTemplateId?: string;
}

export interface Communication {
  id: string;
  type: CommType;
  channel: Channel;
  compose: ComposeSMS | ComposeWhatsApp | ComposeOTP;
  schedule: Schedule;
  complianceLine?: string;
  createdAt: string;
  status: "DRAFT" | "SCHEDULED" | "SENT" | "PAUSED";
}

export interface CommStats {
  communicationId: string;
  delivered: number;
  failed: number;
  optOuts: number;
  optIns: number;
  replies: number;
}
