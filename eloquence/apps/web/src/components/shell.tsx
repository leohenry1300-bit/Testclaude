import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Dumbbell, House, LineChart, MessageCircle, Sparkles, UserRound } from "lucide-react";
import { useStore } from "../lib/store";
import { Wordmark } from "./ui";

const TABS = [
  { to: "/", label: "Accueil", icon: House, end: true },
  { to: "/entrainement", label: "S'entraîner", icon: Dumbbell },
  { to: "/progression", label: "Progression", icon: LineChart },
  { to: "/coach", label: "Coach", icon: MessageCircle },
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

export function BrandHeader() {
  return <div style={{ padding: "8px 0" }}><Wordmark /></div>;
}
