import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CloudOff, Eye, EyeOff } from "lucide-react";
import { useStore } from "../lib/store";
import { TopBar, Wordmark } from "../components/ui";

function AuthLayout({ title, sub, children }: { title: string; sub?: ReactNode; children: ReactNode }) {
  const { server } = useStore();
  return (
    <div className="onb">
      <TopBar />
      <div className="onb-body" style={{ paddingTop: 8 }}>
        <Wordmark />
        <div>
          <h1>{title}</h1>
          {sub && <p className="muted" style={{ marginTop: 8 }}>{sub}</p>}
        </div>
        {!server && (
          <div className="banner warn" role="alert">
            <CloudOff size={18} aria-hidden="true" />
            <span className="grow">Le serveur Éloquence est injoignable. Les comptes sont indisponibles, mais tu peux t'entraîner sans compte.</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input id={id} className="input" type={show ? "text" : "password"} autoComplete={autoComplete} value={value}
        onChange={(e) => onChange(e.target.value)} required minLength={autoComplete === "new-password" ? 8 : undefined} style={{ paddingRight: 52 }} />
      <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        style={{ position: "absolute", right: 3, top: 3 }}>
        {show ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize(o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }): void;
      renderButton(el: HTMLElement, o: Record<string, unknown>): void;
    } } };
  }
}

function GoogleButton() {
  const { server, googleSignIn, toast } = useStore();
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const clientId = server?.googleClientId;

  useEffect(() => {
    if (!clientId) return;
    const init = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            await googleSignIn(credential);
            nav("/", { replace: true });
          } catch (e) {
            toast((e as Error).message, "error");
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", width: ref.current.offsetWidth || 320, text: "continue_with", locale: "fr" });
      setReady(true);
    };
    if (window.google) { init(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = init;
    s.onerror = () => toast("Impossible de charger la connexion Google.", "error");
    document.head.appendChild(s);
  }, [clientId, googleSignIn, nav, toast]);

  if (!clientId) {
    return (
      <button type="button" className="btn btn-outline btn-block" onClick={() => toast("La connexion Google n'est pas encore activée sur ce serveur.", "info")}>
        <GoogleG />Continuer avec Google
      </button>
    );
  }
  return (
    <div>
      {!ready && <div className="skeleton" style={{ height: 44 }} />}
      <div ref={ref} style={{ display: "flex", justifyContent: "center", minHeight: ready ? 44 : 0 }} />
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function useSubmit(fn: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try { await fn(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  return { busy, error, submit };
}

export function Login() {
  const { login, server } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { busy, error, submit } = useSubmit(async () => { await login(email, password); nav("/", { replace: true }); });
  return (
    <AuthLayout title="Content de te revoir." sub="Ton entraînement reprend là où tu l'as laissé.">
      <form className="stack" onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="email">E-mail</label>
          <input id="email" className="input" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="pw">Mot de passe</label>
          <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="current-password" /></div>
        <div style={{ textAlign: "right" }}><Link to="/mot-de-passe-oublie" className="small">Mot de passe oublié ?</Link></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || !server || !email || !password}>{busy && <span className="spinner" />}Se connecter</button>
        <div className="divider">ou</div>
        <GoogleButton />
      </form>
      <p className="center small muted">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
    </AuthLayout>
  );
}

export function Signup() {
  const { signup, server, mode, account } = useStore();
  const nav = useNavigate();
  const [firstName, setFirstName] = useState(mode === "guest" ? account?.user.firstName ?? "" : "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { busy, error, submit } = useSubmit(async () => { await signup(firstName.trim(), email.trim(), password); nav("/", { replace: true }); });
  const tooShort = password.length > 0 && password.length < 8;
  return (
    <AuthLayout
      title="Sauvegarde ta progression."
      sub={mode === "guest" && account?.sessions.length ? `Tes ${account.sessions.length} session${account.sessions.length > 1 ? "s" : ""} seront conservées dans ton compte.` : "Retrouve tes sessions sur tous tes appareils."}>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="fn">Prénom</label>
          <input id="fn" className="input" autoComplete="given-name" required maxLength={40} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div className="field"><label htmlFor="email">E-mail</label>
          <input id="email" className="input" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="pw">Mot de passe</label>
          <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="new-password" />
          <span className={tooShort ? "field-error" : "tiny faint"}>8 caractères minimum</span></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || !server || !firstName.trim() || !email || password.length < 8}>{busy && <span className="spinner" />}Créer mon compte</button>
        <div className="divider">ou</div>
        <GoogleButton />
        <p className="tiny faint center">En créant un compte, tu acceptes que tes enregistrements soient analysés pour générer ton feedback. Tu peux les supprimer à tout moment.</p>
      </form>
      <p className="center small muted">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const { forgotPassword, server } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string | undefined>();
  const { busy, error, submit } = useSubmit(async () => { setDevUrl(await forgotPassword(email.trim())); setSent(true); });
  return (
    <AuthLayout title="Mot de passe oublié" sub="Indique ton e-mail : on t'envoie un lien pour en choisir un nouveau.">
      {sent ? (
        <div className="stack">
          <div className="form-info" role="status">Si un compte existe pour {email}, un e-mail vient de partir. Pense à vérifier tes spams.</div>
          {devUrl && (
            <div className="card soft small">
              <strong>Mode développement :</strong> aucun service d'e-mail n'est configuré. <a href={new URL(devUrl).pathname + new URL(devUrl).search}>Ouvrir le lien de réinitialisation</a>
            </div>
          )}
          <Link to="/connexion" className="btn btn-outline btn-block">Retour à la connexion</Link>
        </div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <div className="field"><label htmlFor="email">E-mail</label>
            <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={busy || !server || !email}>{busy && <span className="spinner" />}Envoyer le lien</button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPassword() {
  const { resetPassword } = useStore();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const { busy, error, submit } = useSubmit(async () => { await resetPassword(token, password); nav("/", { replace: true }); });
  return (
    <AuthLayout title="Nouveau mot de passe" sub="Choisis un mot de passe d'au moins 8 caractères.">
      {!token ? (
        <div className="form-error">Lien incomplet. <Link to="/mot-de-passe-oublie">Refais une demande</Link>.</div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <div className="field"><label htmlFor="pw">Nouveau mot de passe</label>
            <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="new-password" /></div>
          {error && <div className="form-error" role="alert">{error} {error.includes("expiré") && <Link to="/mot-de-passe-oublie">Nouvelle demande</Link>}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={busy || password.length < 8}>{busy && <span className="spinner" />}Enregistrer et me connecter</button>
        </form>
      )}
    </AuthLayout>
  );
}
