import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createDemoAccount, DEFAULT_SETTINGS, summarize, uid,
  type AccountState, type Frequency, type Goal, type Level, type ProgressSummary, type SessionResult,
} from "@eloquence/core";
import { ApiError, fetchServerConfig, getToken, http, setToken, type ServerConfig } from "./http";
import { LocalBackend, RemoteBackend, type Backend, type SubmitInput, type UserPatch } from "./backend";
import { clearClips } from "./audioStore";

export type Mode = "none" | "guest" | "demo" | "account";

export interface OnboardingProfile {
  firstName: string;
  goal: Goal;
  level: Level;
  frequency: Frequency;
}

export type PaywallReason = "premium_exercise" | "daily_limit" | "coach_limit" | "history" | "advanced" | "program" | "profile";

interface Toast { id: string; text: string; tone: "info" | "success" | "error" }

interface Ctx {
  status: "booting" | "ready" | "error";
  bootError: string | null;
  mode: Mode;
  account: AccountState | null;
  summary: ProgressSummary | null;
  server: ServerConfig | null;
  paywall: PaywallReason | null;
  toasts: Toast[];
  retryBoot(): void;
  startGuest(profile: OnboardingProfile): void;
  startDemo(): void;
  signup(firstName: string, email: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  googleSignIn(credential: string): Promise<void>;
  forgotPassword(email: string): Promise<string | undefined>;
  resetPassword(token: string, password: string): Promise<void>;
  logout(): Promise<void>;
  deleteAccount(): Promise<void>;
  submitSession(input: SubmitInput): Promise<SessionResult>;
  deleteSession(id: string): Promise<void>;
  sendCoach(text: string): Promise<void>;
  clearCoach(): Promise<void>;
  updateMe(patch: UserPatch): Promise<void>;
  createProgram(goalText: string): Promise<void>;
  deleteProgram(): Promise<void>;
  checkout(plan: "monthly" | "yearly"): Promise<void>;
  cancelPremium(): Promise<void>;
  openPaywall(reason: PaywallReason): void;
  closePaywall(): void;
  toast(text: string, tone?: Toast["tone"]): void;
  setGuestTheme(theme: "system" | "light" | "dark"): void;
}

const StoreContext = createContext<Ctx | null>(null);

const LOCAL_KEY = "eloquence:local";
const THEME_KEY = "eloquence:theme";

function readLocal(): { mode: "guest" | "demo"; account: AccountState } | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(mode: "guest" | "demo" | null, account: AccountState | null) {
  try {
    if (!mode || !account) localStorage.removeItem(LOCAL_KEY);
    else localStorage.setItem(LOCAL_KEY, JSON.stringify({ mode, account }));
  } catch { /* quota or private mode: keeps working in memory */ }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Ctx["status"]>("booting");
  const [bootError, setBootError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("none");
  const [account, setAccount] = useState<AccountState | null>(null);
  const [server, setServer] = useState<ServerConfig | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [guestTheme, setGuestThemeState] = useState<"system" | "light" | "dark">(() => {
    try { return (localStorage.getItem(THEME_KEY) as "light" | "dark" | null) ?? "system"; } catch { return "system"; }
  });
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const accountRef = useRef(account);
  accountRef.current = account;

  const local = useMemo(() => new LocalBackend((s) => writeLocal(modeRef.current === "demo" ? "demo" : "guest", s)), []);
  const remote = useMemo(() => new RemoteBackend(), []);
  const backend: Backend = mode === "account" ? remote : local;

  const toast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = uid("t");
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // ---- Boot --------------------------------------------------------------

  const boot = useCallback(async () => {
    setStatus("booting");
    setBootError(null);
    const cfg = await fetchServerConfig();
    setServer(cfg);
    const token = getToken();
    if (token && cfg) {
      try {
        const state = await http<AccountState>("GET", "/api/state");
        setAccount(state);
        setMode("account");
        setStatus("ready");
        return;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) setToken(null);
        else {
          setBootError((e as Error).message);
          setStatus("error");
          return;
        }
      }
    }
    const saved = readLocal();
    if (saved) {
      // Demo data is regenerated each day so it always looks current.
      if (saved.mode === "demo") {
        const fresh = createDemoAccount();
        const lastDemo = saved.account.sessions.find((s) => s.id.startsWith("demo_"));
        const isStale = !lastDemo || new Date(lastDemo.createdAt).toDateString() !== new Date(fresh.sessions[0].createdAt).toDateString();
        const own = saved.account.sessions.filter((s) => !s.id.startsWith("demo_"));
        const account = isStale
          ? { ...fresh, user: { ...fresh.user, ...saved.account.user, premiumUntil: fresh.user.premiumUntil }, sessions: [...own, ...fresh.sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), coach: saved.account.coach }
          : saved.account;
        setAccount(account);
        writeLocal("demo", account);
      } else {
        setAccount(saved.account);
      }
      setMode(saved.mode);
    }
    setStatus("ready");
  }, []);

  useEffect(() => { void boot(); }, [boot]);

  // ---- Theme -------------------------------------------------------------

  const theme = account?.user.settings.theme ?? guestTheme;
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = dark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]:not([media])')?.remove();
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = dark ? "#0C0E16" : "#F6F5F1";
      document.head.appendChild(meta);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setGuestTheme = useCallback((t: "system" | "light" | "dark") => {
    setGuestThemeState(t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  }, []);

  // ---- Auth & modes ------------------------------------------------------

  const enterAccount = (token: string, state: AccountState) => {
    setToken(token);
    writeLocal(null, null);
    void clearClips();
    setAccount(state);
    setMode("account");
  };

  const startGuest = useCallback((p: OnboardingProfile) => {
    const account: AccountState = {
      user: {
        id: uid("guest_"),
        firstName: p.firstName,
        email: null,
        avatar: null,
        goal: p.goal,
        goalText: null,
        level: p.level,
        frequency: p.frequency,
        plan: "free",
        premiumUntil: null,
        createdAt: new Date().toISOString(),
        settings: { ...DEFAULT_SETTINGS, theme: guestTheme, sessionSeconds: p.frequency === "5" ? 45 : 60 },
      },
      sessions: [],
      program: null,
      coach: [],
      badges: [],
    };
    modeRef.current = "guest";
    writeLocal("guest", account);
    setAccount(account);
    setMode("guest");
  }, [guestTheme]);

  const startDemo = useCallback(() => {
    const account = createDemoAccount();
    modeRef.current = "demo";
    writeLocal("demo", account);
    setAccount(account);
    setMode("demo");
  }, []);

  const guestImport = () => {
    const a = accountRef.current;
    if (modeRef.current !== "guest" || !a) return { profile: undefined, importState: undefined };
    return {
      profile: { goal: a.user.goal, goalText: a.user.goalText, level: a.user.level, frequency: a.user.frequency },
      importState: { sessions: a.sessions, coach: a.coach, program: a.program, badges: a.badges },
    };
  };

  const signup = useCallback(async (firstName: string, email: string, password: string) => {
    const r = await http<{ token: string; state: AccountState }>("POST", "/api/auth/signup", { firstName, email, password, ...guestImport() });
    enterAccount(r.token, r.state);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await http<{ token: string; state: AccountState }>("POST", "/api/auth/login", { email, password });
    enterAccount(r.token, r.state);
  }, []);

  const googleSignIn = useCallback(async (credential: string) => {
    const r = await http<{ token: string; state: AccountState }>("POST", "/api/auth/google", { credential, ...guestImport() });
    enterAccount(r.token, r.state);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const r = await http<{ ok: boolean; devResetUrl?: string }>("POST", "/api/auth/forgot", { email });
    return r.devResetUrl;
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const r = await http<{ token: string; state: AccountState }>("POST", "/api/auth/reset", { token, password });
    enterAccount(r.token, r.state);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    writeLocal(null, null);
    await clearClips();
    setAccount(null);
    setMode("none");
  }, []);

  const deleteAccount = useCallback(async () => {
    if (modeRef.current === "account") await http("DELETE", "/api/me");
    await logout();
  }, [logout]);

  // ---- Account operations -------------------------------------------------

  const withAccount = useCallback(async <T,>(fn: (b: Backend, s: AccountState) => Promise<T>): Promise<T> => {
    const s = accountRef.current;
    if (!s) throw new ApiError(0, "no_account", "Aucun profil actif.");
    try {
      return await fn(backend, s);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && modeRef.current === "account") {
        toast("Ta session a expiré. Reconnecte-toi.", "error");
        await logout();
      }
      throw e;
    }
  }, [backend, logout, toast]);

  const apply = (s: AccountState) => { accountRef.current = s; setAccount(s); };

  const ctx: Ctx = {
    status, bootError, mode, account, server, paywall, toasts,
    summary: account ? summarize(account.sessions, account.badges) : null,
    retryBoot: () => void boot(),
    startGuest, startDemo, signup, login, googleSignIn, forgotPassword, resetPassword, logout, deleteAccount,
    submitSession: (input) => withAccount(async (b, s) => {
      const r = await b.submitSession(s, input);
      apply(r.state);
      return r.result;
    }),
    deleteSession: (id) => withAccount(async (b, s) => apply(await b.deleteSession(s, id))),
    sendCoach: (text) => withAccount(async (b, s) => {
      // Optimistic: show the user's message right away.
      const pending = { id: uid("pending_"), role: "user" as const, text, createdAt: new Date().toISOString() };
      setAccount({ ...s, coach: [...s.coach, pending] });
      try {
        apply(await b.sendCoach(s, text));
      } catch (e) {
        setAccount(s);
        throw e;
      }
    }),
    clearCoach: () => withAccount(async (b, s) => apply(await b.clearCoach(s))),
    updateMe: (patch) => withAccount(async (b, s) => apply(await b.updateMe(s, patch))),
    createProgram: (goalText) => withAccount(async (b, s) => apply(await b.createProgram(s, goalText))),
    deleteProgram: () => withAccount(async (b, s) => apply(await b.deleteProgram(s))),
    checkout: (plan) => withAccount(async (b, s) => apply(await b.checkout(s, plan))),
    cancelPremium: () => withAccount(async (b, s) => apply(await b.cancelPremium(s))),
    openPaywall: setPaywall,
    closePaywall: () => setPaywall(null),
    toast,
    setGuestTheme,
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

/** Account is guaranteed on routes behind the app shell. */
export function useAccount() {
  const s = useStore();
  return { ...s, account: s.account!, summary: s.summary! };
}
