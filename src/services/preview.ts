import {
  ComposeOTP,
  ComposeSMS,
  ComposeWhatsApp,
  MessageBlock,
  WaTrigger
} from "../types";
import { estimateSmsParts } from "../utils/gsm";
import { PLACEHOLDER_SAMPLE_MAP, WA_TEMPLATES } from "../demoData";
import { renderWithSamples } from "../utils/placeholder";
import { findBlock } from "../utils/waTriggers";
import { newId } from "../utils/id";
import { nowISO } from "../utils/time";

export const buildSmsPreview = (compose: ComposeSMS) => {
  const resolved = renderWithSamples(compose.messageText, PLACEHOLDER_SAMPLE_MAP);
  const parts = estimateSmsParts(compose.messageText, !!compose.media?.length);
  return {
    ...compose,
    resolved,
    parts
  };
};

export const buildWaPreview = (
  compose: ComposeWhatsApp,
  overrides?: Partial<{ blocks: MessageBlock[]; triggers: WaTrigger[] }>
) => {
  const template =
    compose.mode === "TEMPLATE"
      ? WA_TEMPLATES.find((candidate) => candidate.id === compose.templateId)
      : undefined;

  let body = compose.messageText ?? "";

  if (template) {
    body = template.body.replace(/\{\{(\d+)\}\}/g, (_, index: string) => {
      const value = compose.templateVars?.[index];
      return value ?? `{{${index}}}`;
    });
  }

  const blocks = overrides?.blocks ?? compose.blocks ?? [];
  const triggers = overrides?.triggers ?? compose.triggers ?? [];

  return {
    ...compose,
    template,
    body,
    blocks,
    triggers
  };
};

export const buildOtpPreview = (compose: ComposeOTP) => {
  const code = "0".repeat(compose.codeLength);
  const sms = `Your verification code is ${code}. It expires in ${compose.expiryMinutes} minutes.`;
  const wa = `Your Coniq verification code is ${code}. It expires in ${compose.expiryMinutes} minutes. Don’t share it.`;
  return {
    compose,
    sms,
    wa
  };
};

export const simulateBlockMessages = (blocks: MessageBlock[], blockId: string) => {
  const block = findBlock(blocks, blockId);
  if (!block) return [];
  return [
    {
      id: newId(),
      channel: block.channel,
      direction: "OUTBOUND" as const,
      text: block.text,
      timestamp: nowISO(),
      meta: { blockId }
    }
  ];
};
