import { PlaceholderDef, SchedulerCadence } from "../types";

export const required = (value: unknown) =>
  !(value === undefined || value === null || value === "");

export function validatePlaceholders(text: string, catalog: PlaceholderDef[]) {
  const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) ?? [];
  const keys = matches.map((match) => match.slice(2, -2));
  const known = new Set(catalog.map((placeholder) => placeholder.key));
  const invalid = keys.filter((key) => !known.has(key));
  return { invalid, count: keys.length };
}

export function maxVars(text: string, max = 2) {
  const matches = text.match(/\{\{\d+\}\}/g) ?? [];
  return matches.length <= max;
}

export const cadenceLabels: Record<SchedulerCadence, string> = {
  EVERY_5_MIN: "Every 5 minutes",
  EVERY_10_MIN: "Every 10 minutes",
  EVERY_30_MIN: "Every 30 minutes",
  EVERY_1_HOUR: "Hourly",
  EVERY_3_HOURS: "Every 3 hours",
  EVERY_6_HOURS: "Every 6 hours",
  EVERY_24_HOURS: "Daily",
  MON: "Mondays",
  TUE: "Tuesdays",
  WED: "Wednesdays",
  THU: "Thursdays",
  FRI: "Fridays",
  SAT: "Saturdays",
  SUN: "Sundays"
};
