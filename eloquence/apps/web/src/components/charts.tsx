import { useEffect, useId, useMemo, useRef, useState } from "react";
import { shortDay, weekdayLetter } from "../lib/format";

// Hand-rolled SVG charts: one series each, recessive axes, hover/touch tooltips.

interface Point { date: string; score: number; sessions: number }

/** Tracks the element width so the SVG uses real pixels (text never stretches). */
function useWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function ScoreLineChart({ points, height = 180 }: { points: Point[]; height?: number }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();
  const H = height;
  const pad = { l: 30, r: 12, t: 16, b: 26 };
  const values = points.map((p) => p.score);
  const min = Math.max(0, Math.floor((Math.min(...values, 100) - 8) / 10) * 10);
  const max = Math.min(100, Math.ceil((Math.max(...values, 0) + 5) / 10) * 10);
  const x = (i: number) => pad.l + (points.length <= 1 ? (W - pad.l - pad.r) / 2 : (i / (points.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - min) / Math.max(1, max - min)) * (H - pad.t - pad.b);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(" ");
  const area = points.length > 1 ? `${path} L${x(points.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z` : "";
  const ticks = useMemo(() => {
    const step = max - min > 40 ? 20 : 10;
    const out: number[] = [];
    for (let v = min; v <= max; v += step) out.push(v);
    return out;
  }, [min, max]);
  const labelEvery = Math.max(1, Math.ceil(points.length / 5));

  const onMove = (clientX: number) => {
    const el = ref.current;
    if (!el || !points.length) return;
    const rect = el.getBoundingClientRect();
    const rel = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    for (let i = 1; i < points.length; i++) if (Math.abs(x(i) - rel) < Math.abs(x(best) - rel)) best = i;
    setHover(best);
  };

  const hp = hover !== null ? points[hover] : null;
  return (
    <div className="chart" ref={ref}
      onMouseMove={(e) => onMove(e.clientX)} onMouseLeave={() => setHover(null)}
      onTouchStart={(e) => onMove(e.touches[0].clientX)} onTouchMove={(e) => onMove(e.touches[0].clientX)} onTouchEnd={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ height: H }} role="img"
        aria-label={`Évolution du score global : de ${points[0]?.score ?? 0} à ${points[points.length - 1]?.score ?? 0} sur ${points.length} jours d'entraînement`}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid">
          {ticks.map((t) => <line key={t} x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} vectorEffect="non-scaling-stroke" />)}
        </g>
        <g className="axis">
          {ticks.map((t) => <text key={t} x={pad.l - 8} y={y(t) + 4} textAnchor="end">{t}</text>)}
          {points.map((p, i) => (i % labelEvery === 0 || i === points.length - 1) && (
            <text key={p.date} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>{shortDay(p.date + "T12:00:00")}</text>
          ))}
        </g>
        {area && <path d={area} fill={`url(#${gradId})`} />}
        <path className="line" d={path} vectorEffect="non-scaling-stroke" />
        {hp && <line className="cross" x1={x(hover!)} x2={x(hover!)} y1={pad.t} y2={H - pad.b} vectorEffect="non-scaling-stroke" />}
      </svg>
      {/* Markers are HTML so they stay round whatever the aspect ratio. */}
      {points.map((p, i) => (
        (points.length <= 12 || i === hover || i === points.length - 1) && (
          <span key={p.date} aria-hidden="true" style={{
            position: "absolute", left: `${(x(i) / W) * 100}%`, top: y(p.score),
            width: i === hover ? 12 : 8, height: i === hover ? 12 : 8, borderRadius: "50%",
            background: "var(--chart-line)", boxShadow: "0 0 0 2px var(--surface)", transform: "translate(-50%,-50%)",
            transition: "width .1s, height .1s",
          }} />
        )
      ))}
      {hp && (
        <div className="chart-tip" style={{ left: `${(x(hover!) / W) * 100}%`, top: y(hp.score) }}>
          <strong>{hp.score}/100</strong> · {shortDay(hp.date + "T12:00:00")}{hp.sessions > 1 ? ` · ${hp.sessions} sessions` : ""}
        </div>
      )}
    </div>
  );
}

export function WeekBars({ days, height = 120 }: { days: { date: string; minutes: number }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(5, ...days.map((d) => d.minutes));
  return (
    <div className="chart" style={{ height: height + 22 }} role="img"
      aria-label={`Minutes d'entraînement sur 7 jours : ${days.map((d) => `${weekdayLetter(d.date)} ${d.minutes}`).join(", ")}`}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
        {days.map((d, i) => {
          const h = d.minutes > 0 ? Math.max(6, (d.minutes / max) * height) : 4;
          return (
            <div key={d.date} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", position: "relative", cursor: "default" }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)} onTouchEnd={() => setHover(null)}>
              <div style={{
                width: "100%", height: h, borderRadius: "6px 6px 3px 3px",
                background: d.minutes > 0 ? "var(--chart-line)" : "var(--surface-2)",
                opacity: hover === null || hover === i ? 1 : 0.55, transition: "opacity .15s",
              }} />
              {hover === i && (
                <div className="chart-tip" style={{ left: "50%", top: height - h }}>
                  <strong>{d.minutes.toString().replace(".", ",")} min</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {days.map((d, i) => (
          <span key={d.date} className="tiny" style={{ flex: 1, textAlign: "center", color: i === days.length - 1 ? "var(--text)" : "var(--text-3)", fontWeight: i === days.length - 1 ? 650 : 500 }}>
            {weekdayLetter(d.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Before/after horizontal bars per dimension (two series → legend). */
export function CompareBars({ rows }: { rows: { label: string; before: number; after: number }[] }) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="legend" aria-hidden="true">
        <span><i style={{ background: "var(--chart-muted)" }} />Avant</span>
        <span><i style={{ background: "var(--chart-line)" }} />Maintenant</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gap: 5 }}>
          <div className="row-between small">
            <span className="strong">{r.label}</span>
            <span className="tabular faint">{r.before} → <strong style={{ color: "var(--text)" }}>{r.after}</strong></span>
          </div>
          <div style={{ display: "grid", gap: 3 }} role="img" aria-label={`${r.label} : ${r.before} avant, ${r.after} maintenant`}>
            <div style={{ height: 6, width: `${r.before}%`, borderRadius: 99, background: "var(--chart-muted)" }} />
            <div style={{ height: 6, width: `${r.after}%`, borderRadius: 99, background: "var(--chart-line)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Words-per-minute over the answer, with the ideal band shaded. */
export function PaceChart({ samples, height = 110 }: { samples: { t: number; wpm: number }[]; height?: number }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const H = height;
  const pad = { l: 30, r: 8, t: 10, b: 20 };
  const max = Math.max(200, ...samples.map((s) => s.wpm));
  const tMax = Math.max(1, ...samples.map((s) => s.t));
  const x = (t: number) => pad.l + (t / tMax) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const path = samples.map((s, i) => `${i ? "L" : "M"}${x(s.t).toFixed(1)},${y(s.wpm).toFixed(1)}`).join(" ");
  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ height: H }} role="img"
        aria-label={`Débit au fil de la réponse, entre ${Math.min(...samples.map((s) => s.wpm))} et ${Math.max(...samples.map((s) => s.wpm))} mots par minute. Zone idéale : 130 à 160.`}>
        <rect x={pad.l} width={W - pad.l - pad.r} y={y(160)} height={y(130) - y(160)} fill="var(--success-soft)" />
        <g className="axis">
          {[100, 150, 200].filter((v) => v <= max).map((v) => <text key={v} x={pad.l - 8} y={y(v) + 4} textAnchor="end">{v}</text>)}
          <text x={pad.l} y={H - 4}>0 s</text>
          <text x={W - pad.r} y={H - 4} textAnchor="end">{tMax} s</text>
        </g>
        <path className="line" d={path} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
