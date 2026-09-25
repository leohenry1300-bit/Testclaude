import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Check, Dumbbell, House, LineChart, MessageCircle, Sparkles, UserRound, X } from "lucide-react";
import { FREE_DAILY_COACH_MESSAGES, FREE_DAILY_EXERCISES, FREE_HISTORY_DAYS, isPremium } from "@eloquence/core";
import { useStore, type PaywallReason } from "../lib/store";
import { Sheet, Wordmark } from "./ui";

const TABS = [
  { to: "/", label: "Accueil", icon: House, end: true },
  { to: "/entrainement", label: "S'entraîner", icon: Dumbbell },
  { to: "/progression", label: "Progression", icon: LineChart },
  { to: "/coach", label: "Coach IA", icon: MessageCircle },
  { to: "/profil", label: "Profil", icon: UserRound },
];

export function AppShell() {
  const { mode } = useStore();
  return (
    <div className="app with-nav">
      <nav className="bottom-nav" aria-label="Navigation principale">
        <div className="brand-rail"><Link to="/" aria-label="Accueil"><span className="wordmark"><span className="mark" style={{ width: 40, height: 40, borderRadius: 12 }}><svg width="22" height="22" viewBox="0 0 64 64"><path d="M14 18h32M14 32h22M14 46h32" stroke="#fff" strokeWidth="7" strokeLinecap="round" /><circle cx="49" cy="32" r="5" fill="#7CE0B8" /></svg></span></span></Link></div>
        <ul>
          {TABS.map(({ to, label, icon: I, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="nav-ic"><I size={21} aria-hidden="true" /></span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main">
        {mode === "demo" && <DemoBanner />}
        <Outlet />
      </main>
    </div>
  );
}

function DemoBanner() {
  const { logout } = useStore();
  const nav = useNavigate();
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px 0" }}>
      <div className="banner demo">
        <Sparkles size={18} aria-hidden="true" />
        <span className="grow">Mode démo : données fictives. Crée ton profil pour t'entraîner pour de vrai.</span>
        <button className="btn btn-sm btn-primary" onClick={async () => { await logout(); nav("/bienvenue"); }}>Commencer</button>
      </div>
    </div>
  );
}

const REASON_TEXT: Record<PaywallReason, { title: string; sub: string }> = {
  premium_exercise: { title: "Cet exercice fait partie de Premium", sub: "Entretiens avancés, pitchs, débats et présentations longues : tout le catalogue, sans limite." },
  daily_limit: { title: `Tes ${FREE_DAILY_EXERCISES} exercices du jour sont faits`, sub: "Belle régularité. Reviens demain, ou continue maintenant avec Premium." },
  coach_limit: { title: "Continue la conversation", sub: `La version gratuite inclut ${FREE_DAILY_COACH_MESSAGES} messages par jour avec le coach. Premium les rend illimités.` },
  history: { title: "Tout ton historique", sub: `La version gratuite garde tes ${FREE_HISTORY_DAYS} derniers jours. Premium conserve chaque session.` },
  advanced: { title: "L'analyse complète de ta voix", sub: "Débit seconde par seconde, diversité lexicale, tous les points relevés." },
  program: { title: "Un programme construit pour toi", sub: "Ton coach IA planifie 14 jours d'exercices selon ton objectif et tes résultats." },
  profile: { title: "Passe à la vitesse supérieure", sub: "Tout Éloquence, sans limite, pour progresser plus vite." },
};

export const PREMIUM_FEATURES = [
  "Exercices illimités, tout le catalogue",
  "Analyses IA avancées de ta voix",
  "Coach IA illimité et simulations d'entretien",
  "Programmes personnalisés sur 14 jours",
  "Historique complet et statistiques avancées",
];

export function PaywallSheet() {
  const { paywall, closePaywall, checkout, account, toast } = useStore();
  const [plan, setPlan] = useState<"yearly" | "monthly">("yearly");
  const [busy, setBusy] = useState(false);
  if (!paywall || !account) return null;
  const text = REASON_TEXT[paywall];
  const premium = isPremium(account.user);

  const start = async () => {
    setBusy(true);
    try {
      await checkout(plan);
      toast("Premium activé. Ton essai de 7 jours commence maintenant.", "success");
      closePaywall();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet onClose={closePaywall} label="Éloquence Premium">
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className="pill primary"><Sparkles size={13} />Premium</span>
        <button className="icon-btn" onClick={closePaywall} aria-label="Fermer"><X size={20} /></button>
      </div>
      <div className="stack-lg">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 650 }}>{text.title}</h2>
          <p className="muted" style={{ marginTop: 6 }}>{text.sub}</p>
        </div>
        <ul className="feature-list">
          {PREMIUM_FEATURES.map((f) => <li key={f}><Check size={18} />{f}</li>)}
        </ul>
        {premium ? (
          <div className="form-info">Tu es déjà Premium. Profite de tout, sans limite.</div>
        ) : (
          <>
            <div className="stack" role="radiogroup" aria-label="Formule">
              <button className="plan-card" role="radio" aria-checked={plan === "yearly"} onClick={() => setPlan("yearly")}>
                <span className="radio" />
                <span><span className="strong">Annuel</span> <span className="pill success" style={{ marginLeft: 6 }}>−50 %</span><br /><span className="small muted">59,99 € / an, soit 5 € / mois</span></span>
                <span className="price">5 €<span className="tiny faint"> /mois</span></span>
              </button>
              <button className="plan-card" role="radio" aria-checked={plan === "monthly"} onClick={() => setPlan("monthly")}>
                <span className="radio" />
                <span><span className="strong">Mensuel</span><br /><span className="small muted">Sans engagement</span></span>
                <span className="price">9,99 €<span className="tiny faint"> /mois</span></span>
              </button>
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <button className="btn btn-primary btn-lg btn-block" onClick={start} disabled={busy}>
                {busy ? <span className="spinner" /> : null}Essayer 7 jours gratuitement
              </button>
              <button className="btn btn-ghost btn-block" onClick={closePaywall}>Plus tard</button>
              <p className="tiny faint center">Annulable à tout moment depuis ton profil. Aucun prélèvement pendant l'essai.</p>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}

export function BrandHeader() {
  return <div style={{ padding: "8px 0" }}><Wordmark /></div>;
}
