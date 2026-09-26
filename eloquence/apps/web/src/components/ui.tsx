import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, AudioLines, Award, Baby, Ban, BookMarked, BookOpen, BrainCircuit, Briefcase,
  CalendarCheck, Check, CheckCircle2, CircleAlert, ClipboardCheck, Coffee, Compass, Cpu, Dices, Drama,
  Eraser, Eye, FileText, Flame, FlaskConical, Frown, Gamepad2, Gauge, Gavel, GraduationCap, Globe,
  Handshake, HelpCircle, Hourglass, Info, Landmark, Layers, ListTree, Mic, MessageCircle,
  MessageCircleQuestion, MessageSquareText, MessageSquareWarning, Moon, Palette, Presentation, Puzzle,
  RefreshCcw, Repeat, Rocket, Scale, ShieldAlert, ShieldCheck, ShoppingCart, Shuffle, Sparkles, SpellCheck,
  Sunrise, Swords, Target, Timer, TrendingDown, TrendingUp, Trophy, Type, UserPlus, Users, VolumeX, Wallet,
  Wand2, Zap,
  type LucideIcon,
} from "lucide-react";
import { DIMENSION_LABELS, type Dimension } from "@eloquence/core";
import { scoreTone } from "../lib/format";
import { canGoBackInApp } from "../lib/nav";
import { useStore } from "../lib/store";

export const ICONS: Record<string, LucideIcon> = {
  Sparkles, Briefcase, Rocket, Presentation, Scale, Users, AudioLines,
  Mic, Layers, Award, Timer, Flame, Trophy, Eraser, Target, TrendingUp, Compass,
  Dices, Zap, Hourglass, Ban, VolumeX, Gauge, Shuffle, Wand2, Baby, GraduationCap, Swords, ShieldAlert,
  RefreshCcw, HelpCircle, Puzzle, MessageSquareWarning, FileText, Repeat, SpellCheck, Type, ListTree,
  MessageCircleQuestion, Landmark, BrainCircuit, Globe, Cpu, FlaskConical, Palette, Coffee, MessageCircle,
  MessageSquareText, TrendingDown, Gamepad2, Drama, ClipboardCheck, CalendarCheck, CheckCircle2, Sunrise,
  Moon, Eye, BookOpen, BookMarked, Handshake, ShieldCheck, Frown, Wallet, ShoppingCart, Gavel, UserPlus,
  AlertTriangle,
};

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const C = ICONS[name] ?? Sparkles;
  return <C size={size} aria-hidden="true" />;
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="wordmark" style={light ? { color: "#fff" } : undefined}>
      <span className="mark" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 64 64"><path d="M14 18h32M14 32h22M14 46h32" stroke="#fff" strokeWidth="7" strokeLinecap="round" /><circle cx="49" cy="32" r="5" fill="#7CE0B8" /></svg>
      </span>
      Éloquence
    </span>
  );
}

export function TopBar({ title, back = true, right, onBack }: { title?: string; back?: boolean; right?: ReactNode; onBack?: () => void }) {
  const nav = useNavigate();
  return (
    <header className="topbar">
      {back ? (
        <button className="icon-btn" onClick={onBack ?? (() => (canGoBackInApp() ? nav(-1) : nav("/")))} aria-label="Retour">
          <ArrowLeft size={22} />
        </button>
      ) : <span className="spacer" />}
      <h1>{title}</h1>
      {right ?? <span className="spacer" />}
    </header>
  );
}

export function ScoreRing({ score, size = 132, stroke = 10, label }: { score: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(score);
  return (
    <div className={`score-ring tone-${tone}`} style={{ width: size, height: size }} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label={label ?? "Score global"}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="ring-value" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="ring-label">
        <div>
          <div className="ring-num" style={{ fontSize: size * 0.3 }}>{score}</div>
          <div className="ring-den">/ 100</div>
        </div>
      </div>
    </div>
  );
}

export function DimensionBars({ scores, deltas, dims, unmeasured }: {
  scores: Partial<Record<Dimension, number>>;
  deltas?: Partial<Record<Dimension, number>>;
  dims?: Dimension[];
  unmeasured?: Dimension[];
}) {
  const list = dims ?? (Object.keys(DIMENSION_LABELS) as Dimension[]);
  return (
    <div className="dim-bars">
      {list.map((d) => {
        const v = scores[d] ?? 0;
        const delta = deltas?.[d];
        if (unmeasured?.includes(d)) {
          return (
            <div className="dim-bar" key={d}>
              <span className="name">{DIMENSION_LABELS[d]}</span>
              <span className="val faint small">non mesuré à l'écrit</span>
              <div className="track" />
            </div>
          );
        }
        return (
          <div className="dim-bar" key={d}>
            <span className="name">{DIMENSION_LABELS[d]}</span>
            <span className="val">
              {v}<small>/100</small>
              {delta !== undefined && delta !== 0 && (
                <span className={`delta ${delta > 0 ? "delta-up" : "delta-down"}`}>{delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}</span>
              )}
            </span>
            <div className="track" role="meter" aria-label={DIMENSION_LABELS[d]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
              <div className={`fill tone-${scoreTone(v)}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Avatar({ name, src, size = 44 }: { name: string; src?: string | null; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="e-ic">{icon}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Sheet({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        <div className="grabber" />
        {children}
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          <span className="t-ic">{t.tone === "success" ? <Check size={18} /> : t.tone === "error" ? <CircleAlert size={18} /> : <Info size={18} />}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </span>
  );
}

export function Spinner({ label = "Chargement" }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function FullScreenLoader() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      <div className="stack" style={{ alignItems: "center" }}>
        <Wordmark />
        <Spinner />
      </div>
    </div>
  );
}
