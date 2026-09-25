export { clock } from "../lib/format";

export function formatDurationLong(sec: number): string {
  if (sec < 60) return `${sec} secondes`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m} min ${s} s` : `${m} minute${m > 1 ? "s" : ""}`;
}
