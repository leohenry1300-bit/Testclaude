import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Mic, RotateCcw, Sparkles } from "lucide-react";
import { COACH_SUGGESTIONS, FREE_DAILY_COACH_MESSAGES, dayKey, isPremium } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { ApiError } from "../lib/http";

export function Coach() {
  const { account, server, mode, sendCoach, clearCoach, openPaywall, toast } = useAccount();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = account.coach;
  const premium = isPremium(account.user);
  const usedToday = messages.filter((m) => m.role === "user" && dayKey(m.createdAt) === dayKey(new Date())).length;
  const aiPowered = mode === "account" && server?.llm === "anthropic";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, busy]);

  const send = async (value: string) => {
    const t = value.trim();
    if (!t || busy) return;
    if (!premium && usedToday >= FREE_DAILY_COACH_MESSAGES) { openPaywall("coach_limit"); return; }
    setBusy(true);
    setText("");
    try {
      await sendCoach(t);
    } catch (e) {
      setText(t);
      if (e instanceof ApiError && e.status === 402) openPaywall("coach_limit");
      else toast((e as Error).message, "error");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="page" style={{ paddingBottom: "calc(var(--nav-h) + var(--safe-b) + 110px)" }}>
      <header className="row-between">
        <div>
          <h1 className="page-title">Coach IA</h1>
          <p className="page-sub">{aiPowered ? "Personnalisé avec tes résultats" : "Des conseils précis, basés sur tes sessions"}</p>
        </div>
        {messages.length > 0 && (
          <button className="icon-btn" aria-label="Nouvelle conversation" title="Nouvelle conversation"
            onClick={async () => { if (window.confirm("Effacer la conversation ?")) await clearCoach().catch((e) => toast((e as Error).message, "error")); }}>
            <RotateCcw size={20} />
          </button>
        )}
      </header>

      {messages.length === 0 && (
        <div className="card stack-lg">
          <div className="row">
            <span className="avatar" style={{ width: 44, height: 44 }}><Sparkles size={20} /></span>
            <div>
              <div className="strong">Bonjour {account.user.firstName}.</div>
              <div className="small muted">Pose-moi une question sur ta prise de parole, demande un exercice ou une simulation d'entretien.</div>
            </div>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {COACH_SUGGESTIONS.map((s) => (
              <button key={s} className="choice" style={{ padding: "12px 14px" }} onClick={() => void send(s)}>
                <span className="small">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.role}`}>
            {m.text}
            {m.action && (
              <div className="bubble-action">
                <Link to={`/exercice/${m.action.exerciseId}`} className="btn btn-sm btn-primary"><Mic size={15} />{m.action.label}</Link>
              </div>
            )}
          </div>
        ))}
        {busy && <div className="bubble coach typing" aria-label="Le coach écrit"><i /><i /><i /></div>}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && !busy && (
        <div className="chips" aria-label="Suggestions">
          {COACH_SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => void send(s)}>{s}</button>)}
        </div>
      )}

      <div className="composer">
        <form onSubmit={(e) => { e.preventDefault(); void send(text); }}>
          <label htmlFor="coach-input" className="sr-only">Message au coach</label>
          <textarea id="coach-input" ref={inputRef} rows={1} value={text} placeholder="Écris à ton coach…" maxLength={2000}
            onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${e.target.scrollHeight}px`; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(text); } }} />
          <button className="send" disabled={!text.trim() || busy} aria-label="Envoyer"><ArrowUp size={20} /></button>
        </form>
        {!premium && (
          <p className="tiny faint center" style={{ marginTop: 6 }}>
            {Math.max(0, FREE_DAILY_COACH_MESSAGES - usedToday)} message{FREE_DAILY_COACH_MESSAGES - usedToday > 1 ? "s" : ""} gratuit{FREE_DAILY_COACH_MESSAGES - usedToday > 1 ? "s" : ""} aujourd'hui
          </p>
        )}
      </div>
    </div>
  );
}
