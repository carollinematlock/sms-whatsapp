import { ConversationMessage, MessageBlock, WaTrigger } from "../types";
import { newId } from "../utils/id";
import { nowISO } from "../utils/time";
import { findTrigger, findBlock } from "../utils/waTriggers";

type Listener<T> = (payload: T) => void;

type Bus = Record<string, Listener<any>[]>;

const listeners: Bus = {};

export function on<T>(event: string, callback: Listener<T>) {
  listeners[event] = listeners[event] ?? [];
  listeners[event].push(callback as Listener<any>);
  return () => {
    listeners[event] = (listeners[event] ?? []).filter((listener) => listener !== callback);
  };
}

function emit<T>(event: string, payload: T) {
  (listeners[event] ?? []).forEach((listener) => listener(payload));
}

export function simulateInbound(channel: "SMS" | "WHATSAPP", text: string) {
  const message: ConversationMessage = {
    id: newId(),
    channel,
    direction: "INBOUND",
    text,
    timestamp: nowISO()
  };
  emit("inbound", message);
  return message;
}

export function simulateOutbound(
  channel: "SMS" | "WHATSAPP",
  text: string,
  meta?: ConversationMessage["meta"]
) {
  const message: ConversationMessage = {
    id: newId(),
    channel,
    direction: "OUTBOUND",
    text,
    timestamp: nowISO(),
    meta
  };
  emit("outbound", message);
  return message;
}

export function simulateTriggerResponder(
  text: string,
  triggers: WaTrigger[],
  blocks: MessageBlock[]
) {
  const trigger = findTrigger(triggers, text);
  if (!trigger) return [];
  const block = findBlock(blocks, trigger.blockRef);
  if (!block) return [];
  const outbound = simulateOutbound(block.channel, block.text, { blockId: block.id });
  return [outbound];
}
