import { format, formatDistanceToNow } from "date-fns";

export const nowISO = () => new Date().toISOString();

export const addMinutesISO = (iso: string, minutes: number) =>
  new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();

export const formatTimestamp = (iso: string) => format(new Date(iso), "dd MMM yyyy HH:mm");

export const fromNow = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true });
