const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const weekdayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "narrow" });

export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.round((b - a) / 86_400_000);
  if (diff === 0) return `Aujourd'hui, ${timeFmt.format(d)}`;
  if (diff === 1) return `Hier, ${timeFmt.format(d)}`;
  if (diff < 7) return `Il y a ${diff} jours`;
  return shortFmt.format(d);
}

export const longDay = (iso: string) => dayFmt.format(new Date(iso));
export const shortDay = (iso: string) => shortFmt.format(new Date(iso));
export const weekdayLetter = (key: string) => weekdayFmt.format(new Date(`${key}T12:00:00`)).toUpperCase();

/** 9240 → "2 h 34", 540 → "9 min", 42 → "42 s" */
export function spokenTime(sec: number): string {
  if (sec < 60) return `${Math.round(sec)} s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function clock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const nf = new Intl.NumberFormat("fr-FR");

export function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "±0";
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 5 ? "Bonsoir" : h < 18 ? "Bonjour" : "Bonsoir";
}

export function scoreTone(score: number): "high" | "mid" | "low" {
  return score >= 80 ? "high" : score >= 65 ? "mid" : "low";
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${nf.format(n)} ${n > 1 ? many : one}`;
}
