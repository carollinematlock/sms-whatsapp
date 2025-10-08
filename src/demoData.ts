import {
  MessageBlock,
  PlaceholderDef,
  Segment,
  Sender,
  WaTemplate,
  WaTrigger
} from "./types";

export const SEGMENTS: Segment[] = [
  { id: "seg_all", name: "All customers", estSize: 150_000 },
  { id: "seg_new0", name: "New customers with 0 transactions", estSize: 12_000 },
  { id: "seg_premium", name: "Premium members", estSize: 6_800 }
];

export const SENDERS: Sender[] = [
  { id: "sms_sc_1", channel: "SMS", sms: { type: "SHORT_CODE", display: "SC 12345" } },
  { id: "sms_tf_1", channel: "SMS", sms: { type: "TOLL_FREE", display: "+1 800 555 0100" } },
  { id: "wa_liwa", channel: "WHATSAPP", wa: { brand: "LIWA", display: "LIWA (WhatsApp)" } },
  { id: "wa_tanger", channel: "WHATSAPP", wa: { brand: "TANGER", display: "Tanger (WhatsApp)" } }
];

export const PLACEHOLDERS: PlaceholderDef[] = [
  { key: "title", label: "Title", scope: "CUSTOMER", sample: "Ms" },
  { key: "first_name", label: "First name", scope: "CUSTOMER", sample: "Ana" },
  { key: "last_name", label: "Last name", scope: "CUSTOMER", sample: "Silva" },
  { key: "email", label: "Email", scope: "CUSTOMER", sample: "ana@example.com" },
  { key: "phone", label: "Phone number", scope: "CUSTOMER", sample: "+447700900123" },
  { key: "company_name", label: "Company name", scope: "CUSTOMER", sample: "Coniq" },
  { key: "addr1", label: "Address line 1", scope: "CUSTOMER", sample: "221B Baker St" },
  { key: "addr2", label: "Address line 2", scope: "CUSTOMER", sample: "" },
  { key: "city", label: "City", scope: "CUSTOMER", sample: "London" },
  { key: "postcode", label: "Postcode", scope: "CUSTOMER", sample: "NW1 6XE" },
  { key: "email_url", label: "Email (URL encoded)", scope: "CUSTOMER", sample: "ana%40example.com" },
  { key: "preferred_location", label: "Preferred Location name", scope: "CUSTOMER", sample: "LIWA Mall" },
  { key: "current_tier", label: "Current tier", scope: "LOYALTY", sample: "Gold" },
  { key: "tier_balance", label: "Tiered program balance", scope: "LOYALTY", sample: "1,200" },
  { key: "tier_progress_link", label: "Tiered program progress link", scope: "LOYALTY", sample: "https://example.com/progress" },
  { key: "txn_count", label: "Number of transactions", scope: "LOYALTY", sample: "7" },
  { key: "points_collected", label: "Points collected", scope: "LOYALTY", sample: "2,150" },
  { key: "points_redeemed", label: "Points redeemed", scope: "LOYALTY", sample: "900" },
  { key: "pot_name", label: "Pot name", scope: "POTS", sample: "Holiday Pot" },
  { key: "pot_balance", label: "Pot balance", scope: "POTS", sample: "340" },
  { key: "highest_offer", label: "Highest offer available", scope: "POTS", sample: "VIP Lounge Pass" },
  { key: "points_to_next", label: "Points to next offer", scope: "POTS", sample: "150" },
  { key: "next_offer", label: "Next offer to unlock", scope: "POTS", sample: "Free Coffee" },
  { key: "cost_next_offer", label: "Cost next offer", scope: "POTS", sample: "200" },
  { key: "cost_highest_offer", label: "Cost highest offer", scope: "POTS", sample: "1200" },
  { key: "date", label: "Date", scope: "GENERAL", sample: "08 Oct 2025" }
];

export const PLACEHOLDER_SAMPLE_MAP: Record<string, string> = Object.fromEntries(
  PLACEHOLDERS.filter((placeholder) => placeholder.sample !== undefined && placeholder.sample !== "")
    .map((placeholder) => [placeholder.key, placeholder.sample as string])
);

export const WA_TEMPLATES: WaTemplate[] = [
  {
    id: "tpl_offer_lite",
    name: "EXCLUSIVE_OFFER_LITE",
    category: "MARKETING",
    language: "en",
    body: "Hi {{1}}! We’ve saved something special for you at your favourite location. Reply MORE for details or tap REDEEM NOW.",
    buttons: [
      { type: "QUICK_REPLY", text: "MORE" },
      { type: "QUICK_REPLY", text: "REDEEM NOW" }
    ],
    variableHints: ["first_name"]
  },
  {
    id: "tpl_points_lite",
    name: "POINTS_UPDATE_LITE",
    category: "UTILITY",
    language: "en",
    body: "Update for you, {{1}}: your points balance changed. Reply POINTS to see what you can unlock.",
    buttons: [
      { type: "QUICK_REPLY", text: "POINTS" },
      { type: "QUICK_REPLY", text: "HELP" }
    ],
    variableHints: ["first_name"]
  },
  {
    id: "tpl_otp_lite",
    name: "OTP_CODE_LITE",
    category: "AUTHENTICATION",
    language: "en",
    body: "Your Coniq verification code is {{1}}. It expires in {{2}} minutes. Don’t share it.",
    variableHints: ["code", "minutes"]
  }
];

export const DEMO_BLOCKS: MessageBlock[] = [
  {
    id: "wa_welcome",
    channel: "WHATSAPP",
    text: "Welcome! Want more info or redeem now?",
    buttons: [{ text: "MORE" }, { text: "REDEEM NOW" }]
  },
  {
    id: "wa_more_info",
    channel: "WHATSAPP",
    text: "Here’s more info about your offer at LIWA Mall."
  },
  {
    id: "wa_redeem_flow",
    channel: "WHATSAPP",
    text: "Great—your redemption link is on its way."
  }
];

export const DEMO_TRIGGERS: WaTrigger[] = [
  { on: "BUTTON_CLICK", match: "MORE", action: "SEND_BLOCK", blockRef: "wa_more_info" },
  { on: "BUTTON_CLICK", match: "REDEEM NOW", action: "SEND_BLOCK", blockRef: "wa_redeem_flow" },
  { on: "KEYWORD", match: "POINTS", action: "SEND_BLOCK", blockRef: "wa_more_info" },
  { on: "KEYWORD", match: "HELP", action: "SEND_BLOCK", blockRef: "wa_welcome" }
];

export const DEFAULT_SMS_COMPLIANCE = "Text STOP to opt out";
