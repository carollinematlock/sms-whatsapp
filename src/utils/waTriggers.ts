import { MessageBlock, WaTrigger } from "../types";

const normalise = (value: string) => value.trim().toLowerCase();

export function findTrigger(triggers: WaTrigger[], input: string) {
  const target = normalise(input);
  return triggers.find((trigger) => normalise(trigger.match) === target);
}

export function findBlock(blocks: MessageBlock[], id: string) {
  return blocks.find((block) => block.id === id);
}
