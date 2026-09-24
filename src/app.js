'use strict';

/* ============================================================
   Icons (inline SVG sprite: works offline, no icon font)
   ============================================================ */
const ICONS = {
    logo: '<rect x="3" y="7" width="13" height="14" rx="2.5"/><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V16"/><path d="M6.5 12h6M6.5 16h4"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-8"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    folderPlus: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/><path d="M12 10v6M9 13h6"/>',
    import: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    export: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" stroke="none"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M7 16h10"/>',
    quiz: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 0 0 0 20c.9 0 1.7-.7 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17a5 5 0 0 0 5-5c0-5-4.5-9.4-10-9.4z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    listOrdered: '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    eraser: '<path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/><path d="m15 15 5 5M20 15l-5 5"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    snow: '<path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
    sprout: '<path d="M5 22h14M5 2h14"/><path d="M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22"/><path d="M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    alert: '<path d="m10.3 3.9-8.1 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'
};
const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;
function injectSprite() {
    const symbols = Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${symbols}</svg>`);
}

/* ============================================================
   Utilities
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MIN = 60000, DAY = 86400000;
const pad = n => String(n).padStart(2, '0');
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const keyToUTC = k => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const daysBetweenKeys = (a, b) => Math.round((keyToUTC(b) - keyToUTC(a)) / DAY);
const startOfDay = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const endOfDay = (t = Date.now()) => { const d = new Date(t); d.setHours(23, 59, 59, 999); return d.getTime(); };
const addDays = (t, n) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d.getTime(); };
const num = (v, def = 0) => { const n = Number(v); return Number.isFinite(n) ? n : def; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const plural = (n, one, many) => `${n} ${n > 1 ? (many || one + 's') : one}`;
const uid = (p = 'c') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
}
function stripHtml(html) {
    if (!html) return '';
    if (!/[<&]/.test(html)) return html;
    const t = document.createElement('template');
    t.innerHTML = String(html).replace(/<(br|\/p|\/div|\/li|\/h\d)[^>]*>/gi, ' $&');
    return (t.content.textContent || '').replace(/\s+/g, ' ').trim();
}
const hasImage = html => /<img\s/i.test(html || '');
const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
function fmtDays(d) {
    if (d < 30) return `${d} j`;
    if (d < 365) { const m = Math.round(d / 30 * 10) / 10; return `${String(m).replace('.', ',')} mois`; }
    const y = Math.round(d / 365 * 10) / 10; return `${String(y).replace('.', ',')} an${y >= 2 ? 's' : ''}`;
}
function fmtDelay(ms) {
    const m = Math.max(1, Math.round(ms / MIN));
    if (m < 60) return `${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h`;
    return fmtDays(Math.round(ms / DAY));
}
function fmtRelativeFuture(t, now = Date.now()) {
    if (t <= now) return 'maintenant';
    const days = daysBetweenKeys(dayKey(now), dayKey(t));
    if (days === 0) return `dans ${fmtDelay(t - now)}`;
    if (days === 1) return 'demain';
    return `dans ${fmtDays(days)}`;
}
function fmtDuration(sec) {
    sec = Math.round(sec);
    if (sec < 60) return `${sec} s`;
    const m = Math.round(sec / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${pad(r)}` : `${h} h`;
}
function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        for (let j = 1; j <= b.length; j++) {
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        prev = cur;
    }
    return prev[b.length];
}
function loadScript(src, timeout = 8000) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.async = true;
        const t = setTimeout(() => reject(new Error('timeout')), timeout);
        s.onload = () => { clearTimeout(t); resolve(); };
        s.onerror = () => { clearTimeout(t); reject(new Error('load error')); };
        document.head.appendChild(s);
    });
}
const readAsDataURL = file => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
const readAsText = file => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsText(file); });

/* ============================================================
   HTML sanitizer (card content is rendered as HTML)
   ============================================================ */
const SAFE_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'BR', 'P', 'DIV', 'SPAN', 'UL', 'OL', 'LI', 'IMG', 'SUB', 'SUP', 'MARK', 'CODE', 'PRE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'SMALL', 'A', 'HR', 'FONT', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH']);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'VIDEO', 'AUDIO', 'HEAD', 'TITLE', 'FRAME', 'FRAMESET', 'CANVAS']);
const SAFE_STYLES = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'text-align'];
const TAG_RE = /<\/?[a-z][^>]*>/i;
function escapePlain(s) {
    return s.replace(/&(?![a-z]+;|#\d+;|#x[0-9a-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}
function sanitizeHtml(html, opts = {}) {
    if (html === null || html === undefined) return '';
    html = String(html);
    if (!/[<>&\n]/.test(html)) return html.trim();
    if (!TAG_RE.test(html)) return escapePlain(html.trim());
    const keepColors = opts.colors !== false;
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');
    const walk = node => {
        [...node.childNodes].forEach(ch => {
            if (ch.nodeType === 3) return;
            if (ch.nodeType !== 1) { ch.remove(); return; }
            const tag = ch.tagName;
            if (DROP_TAGS.has(tag)) { ch.remove(); return; }
            walk(ch);
            if (!SAFE_TAGS.has(tag)) { ch.replaceWith(...ch.childNodes); return; }
            if (tag === 'IMG') {
                const src = ch.getAttribute('src') || '';
                if (!/^(data:image\/[a-z+.-]+;base64,|https?:\/\/)/i.test(src)) { ch.remove(); return; }
            }
            [...ch.attributes].forEach(a => {
                const n = a.name.toLowerCase();
                if (n === 'style') {
                    const kept = SAFE_STYLES.map(p => {
                        if (!keepColors && (p === 'color' || p === 'background-color')) return '';
                        const v = ch.style.getPropertyValue(p);
                        return v && !/url\(|expression|javascript/i.test(v) ? `${p}:${v}` : '';
                    }).filter(Boolean).join(';');
                    if (kept) ch.setAttribute('style', kept); else ch.removeAttribute('style');
                } else if (tag === 'IMG' && (n === 'src' || n === 'alt')) {
                    /* keep */
                } else if (tag === 'A' && n === 'href') {
                    if (!/^https?:\/\//i.test(a.value)) ch.removeAttribute('href');
                } else if (tag === 'FONT' && n === 'color' && keepColors) {
                    /* keep */
                } else if ((tag === 'TD' || tag === 'TH') && (n === 'colspan' || n === 'rowspan')) {
                    /* keep */
                } else {
                    ch.removeAttribute(a.name);
                }
            });
            if (tag === 'A') { ch.setAttribute('target', '_blank'); ch.setAttribute('rel', 'noopener noreferrer'); }
            if (tag === 'SPAN' && !ch.attributes.length) ch.replaceWith(...ch.childNodes);
        });
    };
    walk(doc.body);
    return doc.body.innerHTML.replace(/(<br\s*\/?>\s*)+$/i, '').trim();
}
const isBlank = html => !stripHtml(html).trim() && !hasImage(html);

/* ============================================================
   Themes & defaults
   ============================================================ */
const THEMES = [
    { id: 'auto', name: 'Automatique', desc: 'Suit ton appareil', p: { bg: 'linear-gradient(90deg,#f5f6fb 50%,#0b1020 50%)', surface: '#ffffff', primary: '#4f46e5', text: '#151a2d', line: '#c7cbe0' } },
    { id: 'clair', name: 'Clair', desc: 'Net et lumineux', p: { bg: '#f5f6fb', surface: '#ffffff', primary: '#4f46e5', text: '#151a2d', line: '#d7dbe8' } },
    { id: 'nuit', name: 'Nuit', desc: 'Sombre et doux', p: { bg: '#0b1020', surface: '#131a2e', primary: '#818cf8', text: '#e8ebf5', line: '#2b3553' } },
    { id: 'oled', name: 'Noir OLED', desc: 'Noir pur, économe', p: { bg: '#000', surface: '#0b0b0c', primary: '#f4f4f5', text: '#f4f4f5', line: '#27272a' } },
    { id: 'papier', name: 'Papier', desc: 'Sépia, typo livre', p: { bg: '#efe6d2', surface: '#fbf6ea', primary: '#9a3412', text: '#33271b', line: '#dccdab' } },
    { id: 'ocean', name: 'Océan', desc: 'Bleu frais', p: { bg: '#e9f4fb', surface: '#ffffff', primary: '#0284c7', text: '#0b2a3f', line: '#cfe3f1' } },
    { id: 'foret', name: 'Forêt', desc: 'Vert profond', p: { bg: '#0d1712', surface: '#14231b', primary: '#4ade80', text: '#e3f1e8', line: '#2a4636' } },
    { id: 'sakura', name: 'Sakura', desc: 'Rose tout doux', p: { bg: '#fff4f6', surface: '#ffffff', primary: '#db2777', text: '#4a1d2c', line: '#fbd5de' } },
    { id: 'lavande', name: 'Lavande', desc: 'Violet pastel', p: { bg: '#f4f1fd', surface: '#ffffff', primary: '#7c3aed', text: '#251a45', line: '#e3dbfa' } },
    { id: 'neon', name: 'Néon', desc: 'Cyberpunk lumineux', p: { bg: '#07000f', surface: '#120823', primary: '#ff2bd6', text: '#f5e9ff', line: '#3a1a5c' } },
    { id: 'terminal', name: 'Terminal', desc: 'Rétro, vert sur noir', p: { bg: '#020a03', surface: '#031205', primary: '#4dff7a', text: '#4dff7a', line: '#0f4a18' } },
    { id: 'brutal', name: 'Brutaliste', desc: 'Contrasté, audacieux', p: { bg: '#fff8e7', surface: '#ffffff', primary: '#ffd400', text: '#111', line: '#111' } }
];
const CARD_SIZES = { s: '1.1rem', m: '1.35rem', l: '1.6rem', xl: '1.9rem' };
const DEFAULT_SETTINGS = {
    theme: 'auto', cardSize: 'm', newPerDay: 20, newOrder: 'random', showIntervals: true,
    autoSpeak: false, answerMode: 'flip', learnAhead: 20, cloudSync: true,
    quizCount: 20, writeCount: 20, chronoDuration: 60
};
const DEFAULT_STATS = () => ({
    streak: 0, longestStreak: 0, lastStudyDate: null, freezes: 1,
    newSeen: { date: null, count: 0 }, history: {}, timeByDay: {}, studySeconds: 0,
    gradeCounts: { 1: 0, 2: 0, 3: 0, 4: 0 }, hourly: new Array(24).fill(0),
    chronoBest: {}, quizBest: 0
});
const EMOJIS = ['📚', '🧠', '💡', '🔬', '🧪', '📜', '🗺️', '🌍', '💰', '🏛️', '⚖️', '💼', '📈', '💻', '🎨', '🎵', '🗣️', '🇬🇧', '🇪🇸', '🩺', '🍳', '🚗', '🏠', '⭐'];
const STATUS = {
    new: { label: 'Nouvelles', one: 'Nouvelle', color: 'var(--new)', icon: 'sparkle' },
    learn: { label: 'En cours', one: 'En cours', color: 'var(--learn)', icon: 'sprout' },
    due: { label: 'À revoir', one: 'À revoir', color: 'var(--due)', icon: 'repeat' },
    mature: { label: 'Maîtrisées', one: 'Maîtrisée', color: 'var(--mature)', icon: 'award' }
};
const MATURE_IVL = 21;

/* ============================================================
   Data normalization: survives corrupted / legacy saves
   (the old version crashed because `cards` was not an array)
   ============================================================ */
function toArray(x) {
    if (Array.isArray(x)) return x;
    if (typeof x === 'string') { try { return toArray(JSON.parse(x)); } catch { return []; } }
    if (x && typeof x === 'object') return Object.values(x).flatMap(v => (Array.isArray(v) ? v : [v]));
    return [];
}
function normalizeCard(c) {
    if (!c || typeof c !== 'object') return null;
    const front = sanitizeHtml(c.front ?? c.question ?? c.recto ?? '');
    const back = sanitizeHtml(c.back ?? c.answer ?? c.verso ?? '');
    if (isBlank(front)) return null;
    const reps = num(c.reps ?? c.repetitions, 0);
    const lapses = num(c.lapses ?? c.laps, 0);
    const interval = Math.max(0, num(c.interval, 0));
    let state = c.state;
    if (!['new', 'learning', 'review', 'relearning'].includes(state)) {
        state = reps === 0 && lapses === 0 ? 'new' : interval >= 1 ? 'review' : 'learning';
    }
    let due = typeof c.due === 'number' ? c.due : Date.parse(c.dueDate);
    if (!Number.isFinite(due)) due = Date.now();
    let tags = c.tags;
    if (typeof tags === 'string') tags = tags.split(',');
    tags = toArray(tags).map(t => String(t).trim()).filter(Boolean);
    return {
        id: String(c.id || uid('c')), deckId: String(c.deckId ?? c.deck ?? ''),
        front, back, hint: sanitizeHtml(c.hint || ''), detail: sanitizeHtml(c.detail || ''), tags,
        created: num(c.created, 0), state, step: Math.max(0, num(c.step, 0)), interval,
        ease: clamp(num(c.ease ?? c.easeFactor, 2.5), 1.3, 5), due, reps, lapses,
        lastReview: c.lastReview ? num(c.lastReview, null) : null,
        errors: Math.max(0, num(c.errors, lapses >= 2 ? 1 : 0)), wrong: num(c.wrong, 0), right: num(c.right, 0)
    };
}
function normalizeStats(s) {
    const d = DEFAULT_STATS();
    if (!s || typeof s !== 'object') return d;
    const out = Object.assign(d, {
        streak: Math.max(0, num(s.streak, 0)), longestStreak: Math.max(0, num(s.longestStreak, num(s.streak, 0))),
        lastStudyDate: typeof s.lastStudyDate === 'string' ? s.lastStudyDate.slice(0, 10) : null,
        freezes: clamp(num(s.freezes, 1), 0, 2),
        studySeconds: num(s.studySeconds, num(s.totalStudyMinutes, 0) * 60),
        quizBest: num(s.quizBest, 0)
    });
    if (s.newSeen && typeof s.newSeen === 'object') out.newSeen = { date: s.newSeen.date || null, count: num(s.newSeen.count, 0) };
    else if (s.newSeenDate) out.newSeen = { date: String(s.newSeenDate).slice(0, 10), count: num(s.newSeenToday, 0) };
    if (s.history && typeof s.history === 'object') {
        Object.entries(s.history).forEach(([k, v]) => { if (/^\d{4}-\d{2}-\d{2}$/.test(k)) out.history[k] = num(typeof v === 'object' && v ? v.reviews ?? v.n : v, 0); });
    }
    if (s.timeByDay && typeof s.timeByDay === 'object') Object.entries(s.timeByDay).forEach(([k, v]) => { out.timeByDay[k] = num(v, 0); });
    if (s.gradeCounts) [1, 2, 3, 4].forEach(g => { out.gradeCounts[g] = num(s.gradeCounts[g], 0); });
    if (Array.isArray(s.hourly)) out.hourly = Array.from({ length: 24 }, (_, i) => num(s.hourly[i], 0));
    if (typeof s.chronoBest === 'number') out.chronoBest = { 60: s.chronoBest };
    else if (s.chronoBest && typeof s.chronoBest === 'object') Object.entries(s.chronoBest).forEach(([k, v]) => { out.chronoBest[k] = num(v, 0); });
    return out;
}
function normalizeState(raw) {
    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { return null; } }
    if (!raw || typeof raw !== 'object') return null;
    const seenDecks = new Set();
    const decks = toArray(raw.decks).filter(d => d && typeof d === 'object').map(d => ({
        id: String(d.id || uid('d')), name: String(d.name || d.title || 'Sans nom').slice(0, 80),
        emoji: String(d.emoji || '📁').slice(0, 8), description: String(d.description || '').slice(0, 300), created: num(d.created, 0)
    })).filter(d => (seenDecks.has(d.id) ? false : seenDecks.add(d.id)));
    const seenCards = new Set();
    const cards = toArray(raw.cards).map(normalizeCard).filter(Boolean).map(c => {
        if (seenCards.has(c.id)) c.id = uid('c');
        seenCards.add(c.id);
        return c;
    });
    const orphans = cards.filter(c => !seenDecks.has(c.deckId));
    if (orphans.length) {
        let misc = decks.find(d => d.id === 'misc');
        if (!misc) { misc = { id: 'misc', name: 'Divers', emoji: '🗂️', description: '', created: Date.now() }; decks.push(misc); }
        orphans.forEach(c => { c.deckId = 'misc'; });
    }
    const settings = Object.assign({}, DEFAULT_SETTINGS, raw.settings && typeof raw.settings === 'object' ? raw.settings : {});
    if (!raw.settings) {
        if (raw.darkMode) settings.theme = 'nuit';
        if (raw.stats && raw.stats.dailyNewGoal) settings.newPerDay = num(raw.stats.dailyNewGoal, 20);
    }
    if (!THEMES.some(t => t.id === settings.theme)) settings.theme = 'auto';
    if (!CARD_SIZES[settings.cardSize]) settings.cardSize = 'm';
    settings.newPerDay = clamp(num(settings.newPerDay, 20), 0, 9999);
    return { version: 4, decks, cards, stats: normalizeStats(raw.stats), settings, updatedAt: num(raw.updatedAt, 0) };
}
function seedState() {
    const now = Date.now();
    return normalizeState({
        decks: SEED_DECKS,
        cards: SEED_CARDS_RAW.map((c, i) => ({ ...c, created: now + i, dueDate: null, due: now })),
        settings: DEFAULT_SETTINGS, updatedAt: 0
    });
}

/* ============================================================
   Local storage layer: IndexedDB (large quota, images ok)
   with localStorage fallback
   ============================================================ */
const LEGACY_KEY = 'superanki_pro_state_v3';
const LS_KEY = 'superanki_pro_v4';
const Storage = {
    db: null,
    async init() {
        try {
            this.db = await new Promise((resolve, reject) => {
                const req = indexedDB.open('superanki_pro', 1);
                req.onupgradeneeded = () => req.result.createObjectStore('kv');
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
                setTimeout(() => reject(new Error('idb timeout')), 4000);
            });
        } catch (e) { this.db = null; }
    },
    tx(mode, fn) {
        return new Promise((resolve, reject) => {
            const t = this.db.transaction('kv', mode);
            const req = fn(t.objectStore('kv'));
            t.oncomplete = () => resolve(req && req.result);
            t.onerror = () => reject(t.error);
            t.onabort = () => reject(t.error);
        });
    },
    async load() {
        if (this.db) { try { const v = await this.tx('readonly', s => s.get('state')); if (v) return v; } catch (e) { /* fall through */ } }
        try { return localStorage.getItem(LS_KEY); } catch { return null; }
    },
    async save(json) {
        if (this.db) {
            await this.tx('readwrite', s => s.put(json, 'state'));
            try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
            return;
        }
        localStorage.setItem(LS_KEY, json);
    },
    legacy() { try { return localStorage.getItem(LEGACY_KEY); } catch { return null; } }
};

/* ============================================================
   Spaced repetition (SM-2 as in Anki, with learning steps)
   ============================================================ */
const SRS = { learnSteps: [1, 10], relearnSteps: [10], gradIvl: 1, easyIvl: 4, easyBonus: 1.3, hardMult: 1.2, lapseMult: 0.5, maxIvl: 3650, minEase: 1.3 };
function fuzzIvl(ivl) {
    if (ivl < 3) return ivl;
    const f = Math.max(1, Math.round(ivl * 0.05));
    return ivl + Math.floor(Math.random() * (2 * f + 1)) - f;
}
function schedule(card, grade, now = Date.now(), useFuzz = false) {
    const r = { state: card.state, step: card.step || 0, interval: card.interval || 0, ease: card.ease || 2.5, lapses: card.lapses || 0, due: card.due };
    const inMin = m => now + Math.round(m * MIN);
    const toReview = ivl => {
        ivl = clamp(Math.round(useFuzz ? fuzzIvl(ivl) : ivl), 1, SRS.maxIvl);
        r.state = 'review'; r.step = 0; r.interval = ivl; r.due = addDays(now, ivl);
    };
    if (r.state === 'new' || r.state === 'learning') {
        const steps = SRS.learnSteps;
        const cur = steps[Math.min(r.step, steps.length - 1)];
        if (grade === 1) { r.state = 'learning'; r.step = 0; r.due = inMin(steps[0]); }
        else if (grade === 2) { r.state = 'learning'; r.due = inMin(r.step === 0 && steps[1] ? (steps[0] + steps[1]) / 2 : cur); }
        else if (grade === 3) {
            if (r.step + 1 < steps.length) { r.state = 'learning'; r.step++; r.due = inMin(steps[r.step]); }
            else toReview(SRS.gradIvl);
        } else toReview(SRS.easyIvl);
    } else if (r.state === 'relearning') {
        const steps = SRS.relearnSteps;
        if (grade === 1) { r.step = 0; r.due = inMin(steps[0]); }
        else if (grade === 2) { r.due = inMin(steps[Math.min(r.step, steps.length - 1)]); }
        else if (grade === 3) {
            if (r.step + 1 < steps.length) { r.step++; r.due = inMin(steps[r.step]); }
            else toReview(Math.max(1, r.interval));
        } else toReview(Math.max(1, r.interval) + 1);
    } else {
        const ivl = Math.max(1, r.interval);
        const elapsed = card.lastReview ? (now - card.lastReview) / DAY : ivl;
        const delay = Math.max(0, elapsed - ivl);
        if (grade === 1) {
            r.lapses++;
            r.ease = Math.max(SRS.minEase, r.ease - 0.2);
            r.interval = Math.max(1, Math.round(ivl * SRS.lapseMult));
            r.state = 'relearning'; r.step = 0; r.due = inMin(SRS.relearnSteps[0]);
        } else {
            const hard = Math.max(ivl + 1, Math.round(ivl * SRS.hardMult));
            const good = Math.max(hard + 1, Math.round((ivl + delay / 2) * r.ease));
            const easy = Math.max(good + 1, Math.round((ivl + delay) * r.ease * SRS.easyBonus));
            if (grade === 2) { r.ease = Math.max(SRS.minEase, r.ease - 0.15); toReview(hard); }
            else if (grade === 3) toReview(good);
            else { r.ease = r.ease + 0.15; toReview(easy); }
        }
    }
    return r;
}
function previewLabel(card, grade, now) {
    const r = schedule(card, grade, now, false);
    return r.state === 'review' ? fmtDays(r.interval) : fmtDelay(r.due - now);
}
function cardStatus(c, now, eod) {
    if (c.state === 'new') return 'new';
    if (c.state === 'review' ? c.due <= eod : c.due <= now) return 'due';
    if (c.state === 'review' && c.interval >= MATURE_IVL) return 'mature';
    return 'learn';
}

/* Answer checking for "Écrire" */
const STOP = new Set('le la les un une des de du d l et ou a au aux en dans sur par pour avec sans ce ces cet cette est sont qui que quoi dont se sa son ses leur leurs plus moins ne pas the of and or to in is are'.split(' '));
const normAnswer = s => fold(stripHtml(s)).replace(/[^a-z0-9]+/g, ' ').trim();
function checkAnswer(typed, correctHtml) {
    const t = normAnswer(typed), c = normAnswer(correctHtml);
    if (!t) return { verdict: 'bad', score: 0 };
    const cWords = c.split(' ').filter(Boolean);
    if (cWords.length <= 6) {
        const sim = 1 - levenshtein(t, c) / Math.max(t.length, c.length, 1);
        const contains = c.length >= 3 && (t.includes(c) || (t.length >= 4 && c.includes(t) && t.length / c.length > 0.6));
        const score = contains ? Math.max(sim, 0.9) : sim;
        return { verdict: score >= 0.85 ? 'ok' : score >= 0.6 ? 'close' : 'bad', score };
    }
    const keys = [...new Set(cWords.filter(w => w.length >= 4 && !STOP.has(w)))];
    if (!keys.length) return { verdict: t === c ? 'ok' : 'close', score: t === c ? 1 : 0.5 };
    const tWords = t.split(' ');
    const found = keys.filter(k => tWords.some(w => w === k || (k.length >= 5 && w.length >= 4 && levenshtein(w, k) <= 1) || (w.length >= 5 && k.startsWith(w.slice(0, 5)))));
    const score = found.length / keys.length;
    return { verdict: score >= 0.7 ? 'ok' : score >= 0.35 ? 'close' : 'bad', score, found, keys };
}

/* ============================================================
   Cloud sync (Supabase, optional)
   ============================================================ */
const SUPABASE_URL = 'https://opmkdjkvbzfxbeygdvpo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yor28RXd0IEXDGyz6S9jCA_DOZ3wOYf';
const Cloud = {
    client: null, status: 'off', timer: null, busy: false, pending: false, lastPull: 0,
    async ensure() {
        if (this.client) return true;
        try {
            if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
            if (!window.supabase || !window.supabase.createClient) return false;
            this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return true;
        } catch { return false; }
    },
    setStatus(s) { this.status = s; app && app.renderSyncIndicator(); },
    async pull() {
        if (!(await this.ensure())) { this.setStatus('err'); return null; }
        const res = await this.client.from('game_state').select('data, updated_at').eq('id', 'main').maybeSingle();
        if (res.error) throw new Error(res.error.message);
        this.lastPull = Date.now();
        return res.data;
    },
    schedulePush() {
        if (!app.data.settings.cloudSync) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.push(), 2000);
    },
    async push() {
        if (!app.data.settings.cloudSync) return;
        if (this.busy) { this.pending = true; return; }
        this.busy = true; this.setStatus('busy');
        try {
            if (!(await this.ensure())) throw new Error('client');
            const payload = JSON.parse(app.serialize());
            const res = await this.client.from('game_state').upsert({ id: 'main', data: payload, updated_at: new Date(app.data.updatedAt || Date.now()).toISOString() });
            if (res.error) throw new Error(res.error.message);
            this.setStatus('ok');
        } catch (e) {
            console.warn('Sync cloud:', e.message);
            this.setStatus('err');
        } finally {
            this.busy = false;
            if (this.pending) { this.pending = false; this.schedulePush(); }
        }
    },
    async sync(manual = false) {
        if (!app.data.settings.cloudSync) { this.setStatus('off'); return; }
        this.setStatus('busy');
        try {
            const row = await this.pull();
            if (!row || !row.data) { await this.push(); if (manual) app.toast('Sauvegarde envoyée dans le cloud', 'success'); return; }
            const remoteAt = Math.max(num(row.data.updatedAt, 0), Date.parse(row.updated_at) || 0);
            if (remoteAt > (app.data.updatedAt || 0) + 1000) {
                const remote = normalizeState(row.data);
                if (remote && remote.cards.length) {
                    remote.updatedAt = remoteAt;
                    if (!row.data.settings) remote.settings = Object.assign({}, app.data.settings);
                    app.replaceData(remote, false);
                    app.toast('Progression synchronisée depuis le cloud', 'success', ic('cloud'));
                }
                this.setStatus('ok');
            } else if ((app.data.updatedAt || 0) > remoteAt + 1000) {
                await this.push();
                if (manual) app.toast('Cloud mis à jour', 'success');
            } else {
                this.setStatus('ok');
                if (manual) app.toast('Déjà à jour', 'success');
            }
        } catch (e) {
            console.warn('Sync cloud:', e.message);
            this.setStatus('err');
            if (manual) app.toast('Synchronisation impossible (hors ligne ?)', 'error');
        }
    }
};

/* ============================================================
   Charts (tiny SVG helpers, no library)
   ============================================================ */
function barChartSVG(values, labels, opts = {}) {
    const W = 340, H = opts.height || 170, top = 18, bottom = 22;
    const n = values.length, max = Math.max(1, ...values), bw = W / n;
    const colors = opts.colors || [];
    const every = Math.ceil(n / (opts.maxLabels || 12));
    let bars = '';
    values.forEach((v, i) => {
        const h = Math.max(v > 0 ? 2 : 0, (v / max) * (H - top - bottom));
        const x = i * bw + bw * 0.16, w = bw * 0.68, y = H - bottom - h;
        bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4, w / 3).toFixed(1)}" fill="${colors[i] || opts.color || 'var(--primary)'}"><title>${esc(labels[i])} : ${v}</title></rect>`;
        if (v > 0 && n <= 16) bars += `<text class="val" x="${(x + w / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle">${v}</text>`;
        if (i % every === 0) bars += `<text x="${(x + w / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(labels[i])}</text>`;
    });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${`<line x1="0" x2="${W}" y1="${H - bottom + .5}" y2="${H - bottom + .5}" stroke="var(--border)"/>`}${bars}</svg></div>`;
}
function donutSVG(segments) {
    const total = segments.reduce((a, s) => a + s.value, 0);
    const R = 60, C = 2 * Math.PI * R;
    let offset = 0, arcs = '';
    if (total === 0) arcs = `<circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--surface-3)" stroke-width="22"/>`;
    segments.forEach(s => {
        if (!s.value) return;
        const len = (s.value / total) * C;
        arcs += `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${s.color}" stroke-width="22" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 80 80)"><title>${esc(s.label)} : ${s.value}</title></circle>`;
        offset += len;
    });
    return `<svg viewBox="0 0 160 160">${arcs}<text x="80" y="78" text-anchor="middle" style="font-size:26px;font-weight:800;fill:var(--text)">${total}</text><text x="80" y="98" text-anchor="middle" style="font-size:11px;fill:var(--text-muted)">cartes</text></svg>`;
}

/* ============================================================
   Application
   ============================================================ */
class SuperAnki {
    constructor() {
        this.data = null;
        this.view = 'dashboard';
        this.ui = { deck: 'all', filter: 'all', search: '', sort: 'recent', limit: 60 };
        this.session = null;
        this.modals = [];
        this.saveTimer = null;
        this.editorRange = null;
        this.imageTarget = null;
        this.saveErrorShown = false;
        this.searchCache = new Map();
    }

    /* ---------- boot ---------- */
    async init() {
        injectSprite();
        this.bindGlobalEvents();
        await Storage.init();
        let data = null, source = 'seed';
        try {
            const stored = await Storage.load();
            if (stored) { data = normalizeState(stored); source = 'local'; }
        } catch (e) { console.error(e); }
        if (!data) {
            const legacy = Storage.legacy();
            if (legacy) { data = normalizeState(legacy); source = 'legacy'; }
        }
        if (!data || !data.cards.length && !data.decks.length) { data = seedState(); source = 'seed'; }
        this.data = data;
        this.applySettings();
        this.checkStreak();
        this.writeNow();
        $('#boot').remove();
        this.go('dashboard');
        if (source === 'legacy') this.toast('Tes cartes et ta progression ont été récupérées', 'success');
        if (this.data.settings.cloudSync) Cloud.sync();
        else Cloud.setStatus('off');
    }

    serialize() {
        const { version, decks, cards, stats, settings, updatedAt } = this.data;
        return JSON.stringify({ version, decks, cards, stats, settings, updatedAt });
    }
    save(sync = true) {
        this.data.updatedAt = Date.now();
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.writeNow(), 250);
        if (sync) Cloud.schedulePush();
    }
    async writeNow() {
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
        try {
            await Storage.save(this.serialize());
            this.saveErrorShown = false;
        } catch (e) {
            console.error(e);
            if (!this.saveErrorShown) {
                this.saveErrorShown = true;
                this.toast('Enregistrement impossible : stockage du navigateur plein ou bloqué. Exporte une sauvegarde.', 'error');
            }
        }
    }
    replaceData(newData, sync = true) {
        this.data = newData;
        this.searchCache.clear();
        this.applySettings();
        this.checkStreak();
        this.writeNow();
        if (sync) Cloud.schedulePush();
        if (this.session) this.endSession(false);
        this.render();
    }

    /* ---------- settings / theme ---------- */
    applySettings() {
        const s = this.data.settings;
        const resolved = s.theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'nuit' : 'clair') : s.theme;
        document.documentElement.dataset.theme = resolved;
        document.documentElement.style.setProperty('--card-size', CARD_SIZES[s.cardSize] || CARD_SIZES.m);
        requestAnimationFrame(() => {
            const meta = $('meta[name="theme-color"]');
            if (meta) meta.content = getComputedStyle(document.body).getPropertyValue('--surface').trim() || '#ffffff';
        });
    }
    setSetting(key, value) {
        this.data.settings[key] = value;
        this.save();
        this.applySettings();
    }

    /* ---------- streak ---------- */
    checkStreak() {
        const st = this.data.stats, today = dayKey();
        if (st.newSeen.date !== today) st.newSeen = { date: today, count: 0 };
        if (!st.lastStudyDate || st.lastStudyDate === today) return;
        const gap = daysBetweenKeys(st.lastStudyDate, today);
        if (gap <= 1) return;
        const missed = gap - 1;
        if (st.streak > 0 && st.freezes >= missed) {
            st.freezes -= missed;
            st.lastStudyDate = dayKey(Date.now() - DAY);
            setTimeout(() => this.toast(`${plural(missed, 'gel de série utilisé')} : ta série de ${st.streak} j tient bon`, 'success', ic('snow')), 600);
        } else if (st.streak > 0) {
            setTimeout(() => this.toast(`Série de ${st.streak} j interrompue. On repart !`, 'warning', ic('flame')), 600);
            st.streak = 0;
        }
    }
    recordStudyDay() {
        const st = this.data.stats, today = dayKey();
        if (st.lastStudyDate === today) return;
        const gap = st.lastStudyDate ? daysBetweenKeys(st.lastStudyDate, today) : null;
        st.streak = gap === 1 ? st.streak + 1 : 1;
        st.lastStudyDate = today;
        st.longestStreak = Math.max(st.longestStreak, st.streak);
        if (st.streak > 0 && st.streak % 7 === 0 && st.freezes < 2) {
            st.freezes++;
            this.toast(`${st.streak} jours de suite ! +1 gel de série`, 'success', ic('snow'));
        }
        this.renderStreak();
    }
    recordReview(grade, seconds) {
        const st = this.data.stats, today = dayKey();
        st.history[today] = (st.history[today] || 0) + 1;
        st.timeByDay[today] = (st.timeByDay[today] || 0) + seconds;
        st.studySeconds += seconds;
        if (grade) st.gradeCounts[grade] = (st.gradeCounts[grade] || 0) + 1;
        st.hourly[new Date().getHours()]++;
        this.recordStudyDay();
    }

    /* ---------- data helpers ---------- */
    card(id) { return this.data.cards.find(c => c.id === id); }
    deck(id) { return this.data.decks.find(d => d.id === id); }
    sortedDecks() { return [...this.data.decks].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })); }
    cardsOf(deckId) { return deckId ? this.data.cards.filter(c => c.deckId === deckId) : this.data.cards; }
    errorCards() { return this.data.cards.filter(c => c.errors > 0); }
    countStatuses(cards) {
        const now = Date.now(), eod = endOfDay(now);
        const out = { new: 0, learn: 0, due: 0, mature: 0, total: cards.length };
        cards.forEach(c => { out[cardStatus(c, now, eod)]++; });
        return out;
    }
    newBudget() {
        const st = this.data.stats;
        if (st.newSeen.date !== dayKey()) st.newSeen = { date: dayKey(), count: 0 };
        return Math.max(0, this.data.settings.newPerDay - st.newSeen.count);
    }
    studyPlan(deckIds, extraNew = 0) {
        const now = Date.now(), eod = endOfDay(now);
        const set = deckIds ? new Set(deckIds) : null;
        const pool = this.data.cards.filter(c => !set || set.has(c.deckId));
        const learning = pool.filter(c => c.state === 'learning' || c.state === 'relearning').map(c => ({ id: c.id, due: c.due }));
        const reviews = pool.filter(c => c.state === 'review' && c.due <= eod).sort((a, b) => a.due - b.due);
        let fresh = pool.filter(c => c.state === 'new');
        fresh = this.data.settings.newOrder === 'random' ? shuffle(fresh) : fresh.sort((a, b) => a.created - b.created);
        const budget = extraNew || this.newBudget();
        const news = fresh.slice(0, budget);
        return { reviews, news, learning, learningDue: learning.filter(l => l.due <= now).length, freshTotal: fresh.length };
    }
    nextDueTime() {
        let min = Infinity;
        this.data.cards.forEach(c => { if (c.state !== 'new' && c.due < min) min = c.due; });
        return min;
    }

    /* ============================================================
       Navigation & rendering
       ============================================================ */
    go(view, opts = {}) {
        if (this.session && view !== 'session') this.endSession(false);
        this.view = view;
        if (opts.deck !== undefined) { this.ui.deck = opts.deck; this.ui.limit = 60; }
        if (opts.filter !== undefined) this.ui.filter = opts.filter;
        this.render();
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }
    render() {
        ['dashboard', 'decks', 'stats', 'settings', 'session'].forEach(v => $(`#view-${v}`).classList.toggle('hidden', v !== this.view));
        $$('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === this.view && !b.classList.contains('brand') && !b.classList.contains('streak-chip') && !b.classList.contains('sync-dot')));
        document.body.classList.toggle('in-session', this.view === 'session');
        this.renderStreak();
        this.renderSyncIndicator();
        if (this.view === 'dashboard') this.renderDashboard();
        else if (this.view === 'decks') this.renderDecks();
        else if (this.view === 'stats') this.renderStats();
        else if (this.view === 'settings') this.renderSettings();
    }
    renderStreak() {
        if (!this.data) return;
        const st = this.data.stats;
        const alive = st.lastStudyDate === dayKey();
        $('#streak-value').textContent = st.streak;
        const chip = $('#streak-chip');
        chip.classList.toggle('cold', !alive);
        chip.title = alive ? `Série : ${st.streak} j (révision du jour faite)` : `Série : ${st.streak} j. Révise aujourd'hui pour la prolonger !`;
    }
    renderSyncIndicator() {
        const el = $('#sync-indicator');
        if (!el || !this.data) return;
        const on = this.data.settings.cloudSync;
        el.classList.toggle('hidden', !on);
        el.classList.remove('ok', 'busy', 'err');
        if (on && ['ok', 'busy', 'err'].includes(Cloud.status)) el.classList.add(Cloud.status);
        el.title = { ok: 'Synchronisé avec le cloud', busy: 'Synchronisation...', err: 'Synchronisation impossible (hors ligne ?)', off: 'Synchronisation désactivée' }[Cloud.status] || 'Synchronisation cloud';
        if (this.view === 'settings') { const s = $('#sync-status'); if (s) s.textContent = el.title; }
    }

    /* ---------- Dashboard ---------- */
    renderDashboard() {
        const d = this.data, now = Date.now();
        const counts = this.countStatuses(d.cards);
        const plan = this.studyPlan(null);
        const dueCount = plan.reviews.length + plan.learningDue;
        const toStudy = dueCount + plan.news.length;
        const h = new Date().getHours();
        const hello = h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
        let sub;
        if (toStudy > 0) {
            const parts = [];
            if (dueCount) parts.push(`<b>${plural(dueCount, 'carte')} à revoir</b>`);
            if (plan.news.length) parts.push(`<b>${plural(plan.news.length, 'nouvelle carte', 'nouvelles cartes')}</b>`);
            sub = `Au programme aujourd'hui : ${parts.join(' et ')}.`;
        } else {
            const next = this.nextDueTime();
            sub = `Tout est à jour, bravo ! 🎉 ${next < Infinity ? `Prochaine révision ${fmtRelativeFuture(next, now)}.` : ''}`;
        }
        const extra = toStudy === 0 && plan.freshTotal > 0
            ? `<button class="btn btn-hero-ghost" data-action="extra-new">${ic('plus')}10 nouvelles de plus</button>` : '';
        const pct = k => (counts.total ? Math.round(counts[k] / counts.total * 100) : 0);
        const chronoBest = d.stats.chronoBest[d.settings.chronoDuration] || 0;

        $('#view-dashboard').innerHTML = `
        <div class="stack">
            <div class="hero">
                <div class="hero-inner">
                    <div>
                        <span class="hero-kicker">${hello} 👋</span>
                        <h2 class="hero-title">Prêt pour ta révision ?</h2>
                        <p class="hero-sub">${sub}</p>
                    </div>
                    <div class="hero-actions">
                        ${toStudy > 0
                            ? `<button class="btn btn-lg btn-hero" data-action="study" data-deck="">${ic('play')}Réviser (${toStudy})</button>`
                            : `<button class="btn btn-lg btn-hero" data-action="practice-all">${ic('repeat')}S'entraîner</button>`}
                        ${extra || `<button class="btn btn-lg btn-hero-ghost" data-action="new-card">${ic('plus')}Nouvelle carte</button>`}
                    </div>
                </div>
            </div>

            <div class="status-grid">
                ${['new', 'learn', 'due', 'mature'].map(k => `
                <button class="panel status-tile" style="--c:${STATUS[k].color}" data-action="goto-filter" data-filter="${k}">
                    <div class="top"><span class="status-ico">${ic(STATUS[k].icon)}</span><span class="tiny faint">${pct(k)}%</span></div>
                    <div><div class="status-num">${counts[k]}</div><div class="status-label">${STATUS[k].label}</div></div>
                    <div class="bar"><i style="width:${pct(k)}%"></i></div>
                </button>`).join('')}
            </div>

            <div>
                <div class="section-head"><h3 class="section-title">Modes d'entraînement</h3></div>
                <div class="mode-grid">
                    <button class="panel mode-tile" style="--c:#0ea5e9" data-action="mode" data-mode="write">
                        <span class="mode-ico">${ic('keyboard')}</span>
                        <span><h4>Écrire</h4><p>Tape la réponse, correction automatique</p></span>${ic('chevronRight', 'chev')}
                    </button>
                    <button class="panel mode-tile" style="--c:#8b5cf6" data-action="mode" data-mode="quiz">
                        <span class="mode-ico">${ic('quiz')}</span>
                        <span><h4>Quiz</h4><p>QCM à 4 choix${d.stats.quizBest ? ` · record ${d.stats.quizBest}%` : ''}</p></span>${ic('chevronRight', 'chev')}
                    </button>
                    <button class="panel mode-tile" style="--c:#f97316" data-action="mode" data-mode="chrono">
                        <span class="mode-ico">${ic('timer')}</span>
                        <span><h4>Chrono</h4><p>${chronoBest ? `Record : ${chronoBest} pts en ${d.settings.chronoDuration} s` : 'Un max de bonnes réponses, vite !'}</p></span>${ic('chevronRight', 'chev')}
                    </button>
                </div>
            </div>

            <div>
                <div class="section-head">
                    <h3 class="section-title">Tes paquets</h3>
                    <button class="link" data-nav="decks">Gérer ${ic('chevronRight')}</button>
                </div>
                ${d.decks.length ? `<div class="deck-grid">${this.dashboardDeckCards()}</div>`
                    : `<div class="panel empty">${ic('layers')}<p>Aucun paquet pour l'instant.</p><button class="btn btn-primary" style="margin-top:14px" data-action="new-deck">${ic('folderPlus')}Créer un paquet</button></div>`}
            </div>
        </div>`;
    }
    dashboardDeckCards() {
        const now = Date.now(), eod = endOfDay(now);
        const budget = this.newBudget();
        const rows = this.sortedDecks().map(deck => {
            const cards = this.cardsOf(deck.id);
            const c = { new: 0, learn: 0, due: 0, mature: 0 };
            cards.forEach(x => { c[cardStatus(x, now, eod)]++; });
            return { deck, cards, c, todo: c.due + Math.min(c.new, budget) };
        }).sort((a, b) => (b.c.due > 0) - (a.c.due > 0) || 0);
        return rows.map(({ deck, cards, c, todo }) => {
            const total = cards.length || 1;
            const mastery = Math.round(c.mature / total * 100);
            return `
            <div class="panel deck-card" data-action="open-deck" data-deck="${esc(deck.id)}">
                <div class="deck-head">
                    <span class="deck-emoji">${esc(deck.emoji)}</span>
                    <div style="min-width:0"><div class="deck-name">${esc(deck.name)}</div><div class="deck-meta">${plural(cards.length, 'carte')} · ${mastery}% maîtrisé</div></div>
                </div>
                <div class="counts">
                    <span style="color:var(--new)" title="Nouvelles">${ic('sparkle')}${c.new}</span>
                    <span style="color:var(--learn)" title="En cours">${ic('sprout')}${c.learn}</span>
                    <span style="color:var(--due)" title="À revoir">${ic('repeat')}${c.due}</span>
                    <span style="color:var(--mature)" title="Maîtrisées">${ic('award')}${c.mature}</span>
                </div>
                <div class="progress"><i style="width:${c.mature / total * 100}%;background:var(--mature)"></i><i style="width:${c.learn / total * 100}%;background:var(--learn)"></i><i style="width:${c.due / total * 100}%;background:var(--due)"></i></div>
                <div class="deck-foot">
                    ${todo > 0 ? `<button class="btn btn-primary btn-sm" data-action="study" data-deck="${esc(deck.id)}">${ic('play')}Réviser (${todo})</button>`
                        : `<button class="btn btn-soft btn-sm" data-action="practice-deck" data-deck="${esc(deck.id)}">${ic('check')}À jour</button>`}
                    <div class="modes">
                        <button class="icon-btn icon-btn-sm" title="Écrire" data-action="mode" data-mode="write" data-deck="${esc(deck.id)}">${ic('keyboard')}</button>
                        <button class="icon-btn icon-btn-sm" title="Quiz" data-action="mode" data-mode="quiz" data-deck="${esc(deck.id)}">${ic('quiz')}</button>
                        <button class="icon-btn icon-btn-sm" title="Chrono" data-action="mode" data-mode="chrono" data-deck="${esc(deck.id)}">${ic('timer')}</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    /* ---------- Decks & cards manager ---------- */
    renderDecks() {
        const ui = this.ui;
        if (ui.deck !== 'all' && ui.deck !== 'errors' && !this.deck(ui.deck)) ui.deck = 'all';
        const errCount = this.errorCards().length;
        $('#view-decks').innerHTML = `
        <div class="stack">
            <div>
                <h2 class="page-title">Paquets &amp; Cartes</h2>
                <p class="page-sub">Choisis un paquet pour gérer tes fiches et lancer une révision.</p>
            </div>
            <div class="decks-toolbar">
                <button class="btn btn-primary" data-action="new-deck">${ic('folderPlus')}<span>Nouveau paquet</span></button>
                <button class="btn btn-soft" data-action="new-card">${ic('plus')}<span>Nouvelle carte</span></button>
                <button class="btn btn-soft" data-action="import">${ic('import')}<span>Importer</span></button>
            </div>
            <div class="panel search-bar">
                <label class="input-icon">${ic('search')}<span class="sr-only">Rechercher</span>
                    <input class="input" type="search" id="card-search" placeholder="Rechercher une carte (question, réponse, tag)..." value="${esc(ui.search)}" data-input="search" autocomplete="off">
                </label>
                <label><span class="sr-only">Trier</span>
                    <select class="select" data-input="sort">
                        ${[['recent', 'Plus récentes'], ['alpha', 'Alphabétique (A → Z)'], ['alpha-rev', 'Alphabétique (Z → A)'], ['due', 'Prochaine révision'], ['hard', 'Plus difficiles d\'abord']]
                            .map(([v, l]) => `<option value="${v}" ${ui.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </label>
            </div>
            <div class="manager">
                <aside class="panel deck-list" aria-label="Paquets">
                    <div class="dl-title">Paquets</div>
                    <button class="dl-item ${ui.deck === 'all' ? 'active' : ''}" data-action="select-deck" data-deck="all"><span class="em">📂</span><span class="nm">Toutes les cartes</span><span class="ct">${this.data.cards.length}</span></button>
                    <button class="dl-item errors ${ui.deck === 'errors' ? 'active' : ''}" data-action="select-deck" data-deck="errors"><span class="em">${ic('target')}</span><span class="nm">Mes erreurs</span><span class="ct">${errCount}</span></button>
                    <div class="dl-sep"></div>
                    ${this.sortedDecks().map(dk => `<button class="dl-item ${ui.deck === dk.id ? 'active' : ''}" data-action="select-deck" data-deck="${esc(dk.id)}"><span class="em">${esc(dk.emoji)}</span><span class="nm">${esc(dk.name)}</span><span class="ct">${this.cardsOf(dk.id).length}</span></button>`).join('')}
                </aside>
                <div class="panel" id="deck-panel" style="overflow:hidden"></div>
            </div>
        </div>`;
        this.renderDeckPanel();
    }
    filteredCards() {
        const ui = this.ui, now = Date.now(), eod = endOfDay(now);
        let list = ui.deck === 'all' ? this.data.cards : ui.deck === 'errors' ? this.errorCards() : this.cardsOf(ui.deck);
        const q = fold(ui.search.trim());
        if (q) {
            const terms = q.split(/\s+/);
            list = list.filter(c => { const hay = this.searchText(c); return terms.every(t => hay.includes(t)); });
        }
        const statusCounts = { all: list.length, new: 0, learn: 0, due: 0, mature: 0 };
        const withStatus = list.map(c => { const s = cardStatus(c, now, eod); statusCounts[s]++; return { c, s }; });
        let rows = ui.filter === 'all' ? withStatus : withStatus.filter(r => r.s === ui.filter);
        const txt = c => this.searchText(c).replace(/^[^a-z0-9]+/, '');
        const cmp = (x, y) => x.localeCompare(y, 'fr', { ignorePunctuation: true });
        const sorters = {
            recent: (a, b) => b.c.created - a.c.created,
            alpha: (a, b) => cmp(txt(a.c), txt(b.c)),
            'alpha-rev': (a, b) => cmp(txt(b.c), txt(a.c)),
            due: (a, b) => (a.c.state === 'new') - (b.c.state === 'new') || a.c.due - b.c.due,
            hard: (a, b) => b.c.errors - a.c.errors || b.c.lapses - a.c.lapses || a.c.ease - b.c.ease
        };
        rows = [...rows].sort(sorters[ui.sort] || sorters.recent);
        return { rows, statusCounts };
    }
    searchText(c) {
        const key = c.front + '\u0001' + c.back + '\u0001' + c.hint + '\u0001' + c.tags.join(',');
        const hit = this.searchCache.get(c.id);
        if (hit && hit.key === key) return hit.text;
        const text = fold(`${stripHtml(c.front)} ${stripHtml(c.back)} ${stripHtml(c.hint)} ${c.tags.join(' ')}`);
        this.searchCache.set(c.id, { key, text });
        return text;
    }
    renderDeckPanel() {
        const ui = this.ui, panel = $('#deck-panel');
        if (!panel) return;
        const deck = this.deck(ui.deck);
        const { rows, statusCounts } = this.filteredCards();
        const now = Date.now();
        let title, actions = '';
        if (ui.deck === 'all') title = `📂 Toutes les cartes`;
        else if (ui.deck === 'errors') {
            title = `${ic('target')} Mes erreurs`;
            actions = statusCounts.all ? `<button class="btn btn-primary btn-sm" data-action="practice-errors">${ic('play')}Retravailler</button>` : '';
        } else {
            title = `<span>${esc(deck.emoji)}</span> ${esc(deck.name)}`;
            actions = `
                <button class="btn btn-primary btn-sm" data-action="study" data-deck="${esc(deck.id)}">${ic('play')}Réviser</button>
                <button class="btn btn-soft btn-sm" data-action="new-card" data-deck="${esc(deck.id)}">${ic('plus')}Carte</button>
                <button class="icon-btn" title="Modifier le paquet" data-action="edit-deck" data-deck="${esc(deck.id)}">${ic('pencil')}</button>
                <button class="icon-btn danger" title="Supprimer le paquet" data-action="delete-deck" data-deck="${esc(deck.id)}">${ic('trash')}</button>`;
        }
        const chips = [['all', 'Toutes'], ['new', 'Nouvelles'], ['learn', 'En cours'], ['due', 'À revoir'], ['mature', 'Maîtrisées']]
            .map(([k, l]) => `<button class="chip ${ui.filter === k ? 'active' : ''}" data-action="filter" data-filter="${k}">${k !== 'all' ? `<span class="dot" style="background:${STATUS[k].color}"></span>` : ''}${l} <span class="count">${statusCounts[k]}</span></button>`).join('');
        const shown = rows.slice(0, ui.limit);
        const showDeck = ui.deck === 'all' || ui.deck === 'errors';
        const list = shown.map(({ c, s }) => {
            const dk = showDeck ? this.deck(c.deckId) : null;
            const when = c.state === 'new' ? 'Jamais vue' : s === 'due' ? 'À revoir maintenant' : `Révision ${fmtRelativeFuture(c.due, now)}`;
            return `
            <div class="card-row" data-action="edit-card" data-card="${esc(c.id)}">
                <span class="dot" style="background:${STATUS[s].color}" title="${STATUS[s].one}"></span>
                <div class="body">
                    <div class="q rich">${c.front}</div>
                    <div class="a">${esc(truncate(stripHtml(c.back), 220)) || (hasImage(c.back) ? '[image]' : '')}</div>
                    <div class="meta">
                        ${dk ? `<span class="tag">${esc(dk.emoji)} ${esc(dk.name)}</span>` : ''}
                        <span>${when}</span>
                        ${c.errors ? `<span style="color:var(--due)">${plural(c.errors, 'erreur')}</span>` : ''}
                        ${c.tags.map(t => `<span>#${esc(t)}</span>`).join('')}
                    </div>
                </div>
                <div class="actions">
                    <button class="icon-btn icon-btn-sm" title="Modifier" data-action="edit-card" data-card="${esc(c.id)}">${ic('pencil')}</button>
                    <button class="icon-btn icon-btn-sm danger" title="Supprimer" data-action="delete-card" data-card="${esc(c.id)}">${ic('trash')}</button>
                </div>
            </div>`;
        }).join('');
        const emptyMsg = ui.search ? 'Aucune carte ne correspond à ta recherche.'
            : ui.deck === 'errors' ? 'Aucune erreur à retravailler. Les cartes que tu rates apparaîtront ici. 🎉'
            : 'Aucune carte ici pour le moment.';
        panel.innerHTML = `
            <div class="deck-panel-head"><h3>${title} <span class="tag">${plural(statusCounts.all, 'carte')}</span></h3><div class="deck-panel-actions">${actions}</div></div>
            <div class="filter-row"><div class="chip-row">${chips}</div></div>
            <div id="card-list">${list || `<div class="empty">${ic('search')}<p>${emptyMsg}</p></div>`}</div>
            ${rows.length > ui.limit ? `<div class="load-more"><button class="btn btn-soft" data-action="more">Afficher plus (${rows.length - ui.limit} restantes)</button></div>` : ''}`;
    }

    /* ---------- Stats ---------- */
    renderStats() {
        const d = this.data, st = d.stats, now = Date.now();
        const counts = this.countStatuses(d.cards);
        const today = dayKey();
        const gc = st.gradeCounts, totalGrades = gc[1] + gc[2] + gc[3] + gc[4];
        const retention = totalGrades ? Math.round((gc[3] + gc[4] + gc[2]) / totalGrades * 100) : null;
        const histKeys = Object.keys(st.history).filter(k => st.history[k] > 0).sort();
        const activeDays = histKeys.length;
        const span = activeDays ? daysBetweenKeys(histKeys[0], today) + 1 : 0;
        const totalReviews = Object.values(st.history).reduce((a, b) => a + b, 0);

        const fc = new Array(14).fill(0);
        d.cards.forEach(c => {
            if (c.state === 'new') return;
            const diff = daysBetweenKeys(today, dayKey(c.due));
            if (diff < 0) fc[0]++; else if (diff < 14) fc[diff]++;
        });
        const fcLabels = fc.map((_, i) => (i === 0 ? 'Auj.' : i === 1 ? 'Dem.' : new Date(addDays(now, i)).toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')));

        const weeks = 26, start = new Date(addDays(now, -(weeks * 7 - 1)));
        const dow = (start.getDay() + 6) % 7;
        const heatStart = addDays(start.getTime(), -dow);
        const maxDay = Math.max(1, ...Object.values(st.history));
        let cells = '';
        for (let t = heatStart, i = 0; i < 400; i++, t = addDays(heatStart, i)) {
            const k = dayKey(t);
            if (k > today) break;
            const v = st.history[k] || 0, r = v / maxDay;
            const lvl = v === 0 ? '' : r > 0.75 ? 'l4' : r > 0.5 ? 'l3' : r > 0.25 ? 'l2' : 'l1';
            cells += `<i class="${lvl} ${k === today ? 'today' : ''}" title="${new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} : ${plural(v, 'révision')}"></i>`;
        }
        const errCount = this.errorCards().length;
        const deckRows = this.sortedDecks().map(dk => {
            const cs = this.cardsOf(dk.id), c = this.countStatuses(cs);
            const pct = cs.length ? Math.round(c.mature / cs.length * 100) : 0;
            return { dk, pct, c, n: cs.length };
        }).sort((a, b) => b.pct - a.pct);

        $('#view-stats').innerHTML = `
        <div class="stack">
            <div><h2 class="page-title">Statistiques</h2><p class="page-sub">Ta progression, jour après jour.</p></div>
            <div class="kpi-grid">
                <div class="panel kpi"><span>Série actuelle</span><b>🔥 ${st.streak} j</b><em>${ic('snow')} ${plural(st.freezes, 'gel')} de série</em></div>
                <div class="panel kpi"><span>Record de série</span><b>${st.longestStreak} j</b><em>&nbsp;</em></div>
                <div class="panel kpi"><span>Aujourd'hui</span><b>${st.history[today] || 0}</b><em>${fmtDuration(st.timeByDay[today] || 0)} d'étude</em></div>
                <div class="panel kpi"><span>Réussite</span><b>${retention === null ? '-' : retention + '%'}</b><em>${plural(totalGrades, 'réponse')}</em></div>
                <div class="panel kpi"><span>Temps total</span><b>${fmtDuration(st.studySeconds)}</b><em>${plural(totalReviews, 'révision')}</em></div>
                <div class="panel kpi"><span>Régularité</span><b>${span ? Math.round(activeDays / span * 100) : 0}%</b><em>${plural(activeDays, 'jour actif', 'jours actifs')}</em></div>
            </div>

            <div class="panel panel-pad chart-card">
                <h4>Calendrier de révision (6 derniers mois)</h4>
                <div class="heatmap-scroll"><div class="heatmap">${cells}</div></div>
            </div>

            <div class="chart-grid">
                <div class="panel panel-pad chart-card">
                    <h4>Répartition des cartes</h4>
                    <div class="donut-wrap">
                        ${donutSVG(['new', 'learn', 'due', 'mature'].map(k => ({ label: STATUS[k].label, value: counts[k], color: STATUS[k].color })))}
                        <div class="legend">${['new', 'learn', 'due', 'mature'].map(k => `<div><span class="dot" style="background:${STATUS[k].color}"></span>${STATUS[k].label}<b>${counts[k]}</b></div>`).join('')}</div>
                    </div>
                </div>
                <div class="panel panel-pad chart-card">
                    <h4>Révisions prévues (14 jours)</h4>
                    ${barChartSVG(fc, fcLabels, { color: 'var(--due)', maxLabels: 7 })}
                </div>
                <div class="panel panel-pad chart-card">
                    <h4>Tes réponses</h4>
                    ${barChartSVG([gc[1], gc[2], gc[3], gc[4]], ['Raté', 'Difficile', 'Bien', 'Facile'], { colors: ['var(--again)', 'var(--hard)', 'var(--good)', 'var(--easy)'] })}
                </div>
                <div class="panel panel-pad chart-card">
                    <h4>Heures de révision</h4>
                    ${barChartSVG(st.hourly, st.hourly.map((_, i) => `${i}h`), { maxLabels: 8 })}
                </div>
            </div>

            <div class="panel panel-pad">
                <div class="section-head" style="margin-bottom:6px">
                    <h4 style="font-size:.95rem;font-weight:800">${ic('target')} Mes erreurs</h4>
                    ${errCount ? `<button class="btn btn-primary btn-sm" data-action="practice-errors">${ic('play')}Retravailler (${errCount})</button>` : ''}
                </div>
                <p class="small muted">${errCount ? `${plural(errCount, 'carte')} ratée${errCount > 1 ? 's' : ''} récemment. Elles sortent de la liste dès que tu les réussis.` : 'Aucune erreur en attente. Les cartes ratées en révision, en quiz ou au chrono apparaîtront ici.'}</p>
            </div>

            <div class="panel panel-pad">
                <h4 style="font-size:.95rem;font-weight:800;margin-bottom:8px">Maîtrise par paquet</h4>
                ${deckRows.map(r => `
                <div class="deck-progress-row">
                    <span class="nm">${esc(r.dk.emoji)} ${esc(r.dk.name)}</span>
                    <div class="progress"><i style="width:${r.n ? r.c.mature / r.n * 100 : 0}%;background:var(--mature)"></i><i style="width:${r.n ? r.c.learn / r.n * 100 : 0}%;background:var(--learn)"></i><i style="width:${r.n ? r.c.due / r.n * 100 : 0}%;background:var(--due)"></i></div>
                    <b>${r.pct}%</b>
                </div>`).join('') || '<p class="small muted">Aucun paquet.</p>'}
            </div>
        </div>`;
    }

    /* ---------- Settings ---------- */
    renderSettings() {
        const s = this.data.settings;
        const seg = (key, options) => `<div class="segmented">${options.map(([v, l]) => `<button class="${String(s[key]) === String(v) ? 'active' : ''}" data-action="set" data-key="${key}" data-value="${v}">${l}</button>`).join('')}</div>`;
        const sw = (key, label) => `<label class="switch"><input type="checkbox" data-input="toggle" data-key="${key}" ${s[key] ? 'checked' : ''} aria-label="${esc(label)}"><span></span></label>`;
        $('#view-settings').innerHTML = `
        <div class="stack settings">
            <div><h2 class="page-title">Paramètres</h2><p class="page-sub">Personnalise l'apparence et ta façon de réviser.</p></div>

            <div class="panel panel-pad set-section">
                <h3>${ic('palette')} Thème</h3>
                <p class="small muted">Chaque thème change tout le design : couleurs, typographie, formes.</p>
                <div class="theme-grid">
                    ${THEMES.map(t => `
                    <button class="theme-opt ${s.theme === t.id ? 'active' : ''}" data-action="set" data-key="theme" data-value="${t.id}">
                        <div class="theme-prev" style="background:${t.p.bg}">
                            <div class="tp-bar" style="background:${t.p.surface};border:1px solid ${t.p.line}"></div>
                            <div class="tp-row">
                                <div class="tp-card" style="background:${t.p.primary}"><div class="tp-line" style="background:${t.p.surface};width:60%"></div></div>
                                <div class="tp-card" style="background:${t.p.surface};border:1px solid ${t.p.line}"><div class="tp-line" style="background:${t.p.text};width:80%"></div><div class="tp-line" style="background:${t.p.line};width:50%"></div></div>
                            </div>
                        </div>
                        <div class="theme-name">${t.name} <small>${t.desc}</small></div>
                    </button>`).join('')}
                </div>
                <div class="set-row">
                    <div class="txt"><b>Taille du texte des cartes</b><span>Pour la question et la réponse pendant les révisions.</span></div>
                    ${seg('cardSize', [['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']])}
                </div>
            </div>

            <div class="panel panel-pad set-section">
                <h3>${ic('repeat')} Révision</h3>
                <div class="set-row">
                    <div class="txt"><b>Nouvelles cartes par jour</b><span>Combien de cartes jamais vues découvrir chaque jour. Les cartes <b>à revoir</b> (celles dont la date de révision est arrivée) ne sont jamais limitées.</span></div>
                    ${seg('newPerDay', [[5, '5'], [10, '10'], [20, '20'], [30, '30'], [50, '50'], [9999, '∞']])}
                </div>
                <div class="set-row">
                    <div class="txt"><b>Ordre des nouvelles cartes</b><span>Mélangées ou dans l'ordre de création.</span></div>
                    ${seg('newOrder', [['random', 'Aléatoire'], ['ordered', 'Dans l\'ordre']])}
                </div>
                <div class="set-row">
                    <div class="txt"><b>Façon de répondre</b><span>Retourner la carte, ou taper la réponse (correction automatique).</span></div>
                    ${seg('answerMode', [['flip', 'Retourner'], ['type', 'Écrire']])}
                </div>
                <div class="set-row">
                    <div class="txt"><b>Afficher le délai sur les boutons</b><span>Montre quand la carte reviendra (ex. « 4 j ») sous chaque bouton.</span></div>
                    ${sw('showIntervals', 'Afficher le délai')}
                </div>
                <div class="set-row">
                    <div class="txt"><b>Lecture audio automatique</b><span>Lit la question à voix haute à chaque carte.</span></div>
                    ${sw('autoSpeak', 'Lecture audio automatique')}
                </div>
            </div>

            <div class="panel panel-pad set-section">
                <h3>${ic('cloud')} Synchronisation cloud</h3>
                <div class="set-row">
                    <div class="txt"><b>Synchroniser entre mes appareils</b><span id="sync-status">...</span></div>
                    <div style="display:flex;gap:10px;align-items:center">
                        <button class="btn btn-soft btn-sm" data-action="sync-now" ${s.cloudSync ? '' : 'disabled'}>${ic('refresh')}Synchroniser</button>
                        ${sw('cloudSync', 'Synchronisation cloud')}
                    </div>
                </div>
            </div>

            <div class="panel panel-pad set-section">
                <h3>${ic('file')} Données</h3>
                <div class="set-row">
                    <div class="txt"><b>Sauvegarde</b><span>Exporte tout (cartes, images, progression) dans un fichier, ou restaure une sauvegarde.</span></div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        <button class="btn btn-soft btn-sm" data-action="export">${ic('export')}Exporter</button>
                        <button class="btn btn-soft btn-sm" data-action="import-json">${ic('import')}Restaurer</button>
                    </div>
                </div>
                <div class="set-row">
                    <div class="txt"><b>Importer des fiches</b><span>Depuis un fichier TXT / CSV (ou un export Anki en texte).</span></div>
                    <button class="btn btn-soft btn-sm" data-action="import">${ic('file')}Importer</button>
                </div>
                <div class="set-row">
                    <div class="txt"><b>Remettre la progression à zéro</b><span>Toutes les cartes redeviennent nouvelles. Les cartes sont conservées.</span></div>
                    <button class="btn btn-danger-soft btn-sm" data-action="reset-progress">${ic('reset')}Remettre à zéro</button>
                </div>
                <div class="set-row">
                    <div class="txt"><b>Réinitialiser l'application</b><span>Efface tout et recharge les ${SEED_CARDS_RAW.length} cartes d'origine.</span></div>
                    <button class="btn btn-danger-soft btn-sm" data-action="reset-all">${ic('trash')}Tout réinitialiser</button>
                </div>
            </div>

            <div class="panel panel-pad set-section">
                <h3>${ic('keyboard')} Raccourcis clavier</h3>
                <div class="kbd-list">
                    <span><kbd class="k">Espace</kbd></span><span>Afficher la réponse, puis « Bien »</span>
                    <span><kbd class="k">1</kbd> <kbd class="k">2</kbd> <kbd class="k">3</kbd> <kbd class="k">4</kbd></span><span>Raté · Difficile · Bien · Facile (ou choix du quiz)</span>
                    <span><kbd class="k">Z</kbd></span><span>Annuler la dernière réponse</span>
                    <span><kbd class="k">E</kbd></span><span>Modifier la carte en cours</span>
                    <span><kbd class="k">H</kbd></span><span>Afficher l'indice</span>
                    <span><kbd class="k">Échap</kbd></span><span>Quitter la session / fermer une fenêtre</span>
                    <span><kbd class="k">Ctrl</kbd> + <kbd class="k">Entrée</kbd></span><span>Enregistrer une carte</span>
                </div>
            </div>

            <p class="tiny faint" style="text-align:center">SuperAnki Pro · Algorithme de répétition espacée SM-2 (celui d'Anki) · ${plural(this.data.cards.length, 'carte')} · Stockage ${Storage.db ? 'IndexedDB' : 'local'}</p>
        </div>`;
        this.renderSyncIndicator();
    }

    /* ============================================================
       Sessions: srs (Anki review), practice, quiz, chrono
       ============================================================ */
    startStudy(deckId, extraNew = 0) {
        const deckIds = deckId ? [deckId] : null;
        const plan = this.studyPlan(deckIds, extraNew);
        const queue = interleave(shuffle(plan.reviews.map(c => c.id)), plan.news.map(c => c.id));
        if (!queue.length && !plan.learning.length) {
            if (plan.freshTotal > 0) {
                this.confirm({
                    title: 'Objectif du jour atteint 🎉', message: `Tu as déjà découvert tes ${this.data.settings.newPerDay} nouvelles cartes du jour. Veux-tu en apprendre 10 de plus ?`,
                    ok: 'Apprendre 10 de plus'
                }).then(y => { if (y) this.startStudy(deckId, 10); });
            } else {
                this.confirm({ title: 'Tout est à jour 🎉', message: 'Rien à réviser ici pour l\'instant. Veux-tu t\'entraîner quand même (sans impact sur le planning) ?', ok: 'S\'entraîner' })
                    .then(y => { if (y) this.startPractice(deckIds, 'flip', 20); });
            }
            return;
        }
        const deck = deckId && this.deck(deckId);
        this.session = {
            kind: 'srs', title: deck ? `${deck.emoji} ${deck.name}` : 'Révision du jour',
            answer: this.data.settings.answerMode, queue, learning: plan.learning, current: null, lastId: null,
            revealed: false, typed: null, done: 0, correct: 0, missed: [], history: [], startedAt: Date.now(), cardStart: Date.now()
        };
        this.go('session');
        this.nextCard();
    }
    startPractice(deckIds, answer = 'flip', count = 20, title, fromIds) {
        let ids = fromIds || this.poolFor(deckIds).map(c => c.id);
        if (!ids.length) { this.toast('Aucune carte disponible.', 'warning'); return; }
        ids = shuffle([...ids]).slice(0, count >= 9999 ? ids.length : count);
        const deck = deckIds && deckIds.length === 1 && this.deck(deckIds[0]);
        this.session = {
            kind: 'practice', title: title || (answer === 'type' ? 'Écrire' : 'Entraînement') + (deck ? ` · ${deck.name}` : ''),
            answer, queue: ids, total: ids.length, retries: {}, current: null, revealed: false, typed: null,
            done: 0, correct: 0, missed: [], history: [], startedAt: Date.now(), cardStart: Date.now()
        };
        this.go('session');
        this.nextCard();
    }
    poolFor(deckIds) {
        if (deckIds === 'errors') return this.errorCards();
        const set = deckIds ? new Set(deckIds) : null;
        return this.data.cards.filter(c => !set || set.has(c.deckId));
    }
    endSession(goHome = true) {
        const s = this.session;
        if (!s) return;
        if (s.timer) clearInterval(s.timer);
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        this.session = null;
        document.body.classList.remove('in-session');
        if (goHome) this.go('dashboard');
    }
    quitSession() {
        const s = this.session;
        if (!s) return;
        if (s.kind === 'chrono') { this.finishChrono(); return; }
        if (s.kind !== 'srs' && s.done > 0) { this.showSummary(); return; }
        const done = s.done;
        this.endSession(true);
        if (done) this.toast(`Progression enregistrée (${plural(done, 'carte')})`, 'success');
    }

    nextCard() {
        const s = this.session;
        if (!s) return;
        let id = null;
        if (s.kind === 'srs') {
            const now = Date.now();
            s.learning.sort((a, b) => a.due - b.due);
            const first = s.learning[0];
            if (first && first.due <= now && !(first.id === s.lastId && s.queue.length)) id = s.learning.shift().id;
            else if (s.queue.length) id = s.queue.shift();
            else if (first && first.due - now <= this.data.settings.learnAhead * MIN) id = s.learning.shift().id;
        } else if (s.queue.length) id = s.queue.shift();
        if (!id || !this.card(id)) {
            if (id) return this.nextCard();
            return this.showSummary();
        }
        s.current = id; s.revealed = false; s.typed = null; s.cardStart = Date.now();
        this.renderSession();
        if (this.data.settings.autoSpeak) this.speak('front');
    }
    sessionCounts() {
        const s = this.session;
        const cur = s.current ? this.card(s.current) : null;
        const c = { new: 0, learn: s.learning ? s.learning.length : 0, due: 0 };
        s.queue.forEach(id => { const x = this.card(id); if (!x) return; if (x.state === 'new') c.new++; else if (x.state === 'review') c.due++; else c.learn++; });
        let curKey = null;
        if (cur) { curKey = cur.state === 'new' ? 'new' : cur.state === 'review' ? 'due' : 'learn'; c[curKey]++; }
        return { c, curKey };
    }
    renderSession() {
        const s = this.session, card = this.card(s.current), deck = this.deck(card.deckId);
        const set = this.data.settings, now = Date.now();
        const typeMode = s.answer === 'type';
        let counter, progress;
        if (s.kind === 'srs') {
            const { c, curKey } = this.sessionCounts();
            counter = `<div class="session-counts">${['new', 'learn', 'due'].map(k => `<span class="${curKey === k ? 'cur' : ''}" style="color:${STATUS[k].color}" title="${STATUS[k].label}">${c[k]}</span>`).join('')}</div>`;
            const remaining = c.new + c.learn + c.due;
            progress = s.done / Math.max(1, s.done + remaining) * 100;
        } else {
            const remaining = s.queue.length + 1;
            counter = `<div class="session-counts"><span>${s.done + 1}<span class="faint">/${s.done + remaining}</span></span></div>`;
            progress = s.done / Math.max(1, s.done + remaining) * 100;
        }
        const grades = s.kind === 'srs'
            ? `<div class="grade-grid">${[[1, 'Raté', 'again'], [2, 'Difficile', 'hard'], [3, 'Bien', 'good'], [4, 'Facile', 'easy']].map(([g, l, v]) => `
                <button class="grade-btn ${s.typed && s.typed.suggest === g ? 'suggested' : ''}" style="--c:var(--${v})" data-action="grade" data-grade="${g}">
                    <span>${l} <kbd>${g}</kbd></span>${set.showIntervals ? `<small>${previewLabel(card, g, now)}</small>` : ''}
                </button>`).join('')}</div>`
            : `<div class="grade-grid two">
                <button class="grade-btn ${s.typed && s.typed.suggest === 1 ? 'suggested' : ''}" style="--c:var(--again)" data-action="practice-answer" data-ok="0"><span>${ic('x')} Raté <kbd>1</kbd></span></button>
                <button class="grade-btn ${s.typed && s.typed.suggest >= 3 ? 'suggested' : ''}" style="--c:var(--easy)" data-action="practice-answer" data-ok="1"><span>${ic('check')} Je savais <kbd>2</kbd></span></button>
              </div>`;
        const typed = s.typed;
        const typedBox = typeMode ? (s.revealed
            ? `<div class="type-result ${typed.verdict}">
                    <div class="verdict">${typed.verdict === 'ok' ? `${ic('check')} Correct !` : typed.verdict === 'close' ? `${ic('info')} Presque !` : `${ic('x')} Pas tout à fait`}</div>
                    <div class="muted small">Ta réponse : <b>${esc(typed.text) || '<i>(vide)</i>'}</b></div>
               </div>`
            : `<div class="type-box">
                    <textarea class="textarea" id="type-answer" rows="2" style="min-height:64px" placeholder="Tape ta réponse puis Entrée..." data-input="type-answer"></textarea>
               </div>`) : '';
        $('#view-session').innerHTML = `
        <div class="session">
            <div class="session-top">
                <button class="icon-btn" title="Quitter (Échap)" data-action="quit-session">${ic('x')}</button>
                <div class="session-title"><h3>${esc(s.title)}</h3><p>${s.kind === 'srs' ? 'Révision' : s.answer === 'type' ? 'Écrire · sans impact sur le planning' : 'Entraînement · sans impact sur le planning'}</p></div>
                ${counter}
                <button class="icon-btn" title="Écouter" data-action="speak">${ic('volume')}</button>
                <button class="icon-btn" title="Annuler la dernière réponse (Z)" data-action="undo" ${s.history.length ? '' : 'disabled style="opacity:.35"'}>${ic('undo')}</button>
                <button class="icon-btn" title="Modifier la carte (E)" data-action="edit-current">${ic('pencil')}</button>
            </div>
            <div class="pbar"><i style="width:${progress}%"></i></div>
            <div class="panel flashcard" ${s.revealed || typeMode ? '' : 'data-action="reveal" style="cursor:pointer"'}>
                <div class="fc-top">
                    <span class="tag">${esc(deck ? deck.emoji + ' ' + deck.name : '')}</span>
                    <span class="tiny faint">${card.state === 'new' ? 'Nouvelle' : card.errors ? `${ic('target')} ${plural(card.errors, 'erreur')}` : ''}</span>
                </div>
                <div class="fc-content fc-front rich">${card.front}</div>
                ${!s.revealed && card.hint ? `<div class="fc-extra"><button class="pill-btn hint" data-action="hint">${ic('bulb')}Indice</button><div id="hint-slot"></div></div>` : ''}
                ${typedBox}
                ${s.revealed ? `
                    <hr class="fc-divider">
                    <div class="fc-content fc-back rich">${card.back || '<span class="faint">(pas de réponse)</span>'}</div>
                    ${card.hint || card.detail ? `<div class="fc-extra">
                        ${card.hint ? `<div class="hint-box rich">${ic('bulb')} ${card.hint}</div>` : ''}
                        ${card.detail ? `<button class="pill-btn" data-action="detail">${ic('plus')}En savoir plus</button><div id="detail-slot"></div>` : ''}
                    </div>` : ''}` : (!typeMode ? `<p class="fc-hint-tap">Touche la carte ou appuie sur Espace</p>` : '')}
            </div>
            <div class="study-actions">
                ${s.revealed ? grades
                    : typeMode ? `<button class="btn btn-primary btn-lg btn-block" data-action="submit-typed">${ic('check')}Vérifier</button>`
                    : `<button class="btn btn-primary btn-lg btn-block" data-action="reveal">${ic('eye')}Afficher la réponse</button>`}
            </div>
        </div>`;
        if (typeMode && !s.revealed) {
            const ta = $('#type-answer');
            if (ta && matchMedia('(hover: hover)').matches) setTimeout(() => ta.focus(), 30);
        }
    }
    reveal() {
        const s = this.session;
        if (!s || s.revealed) return;
        if (s.answer === 'type') return this.submitTyped();
        s.revealed = true;
        this.renderSession();
        if (this.data.settings.autoSpeak) this.speak('back');
    }
    submitTyped() {
        const s = this.session;
        if (!s || s.revealed) return;
        const card = this.card(s.current);
        const text = ($('#type-answer') || {}).value || '';
        const res = checkAnswer(text, card.back);
        res.text = text.trim();
        res.suggest = res.verdict === 'ok' ? 3 : res.verdict === 'close' ? 2 : 1;
        s.typed = res; s.revealed = true;
        this.renderSession();
    }
    elapsedSec() { return clamp((Date.now() - this.session.cardStart) / 1000, 1, 60); }
    snapshot() {
        const s = this.session;
        s.history.push({
            card: { ...this.card(s.current) }, stats: JSON.stringify(this.data.stats),
            queue: [...s.queue], learning: s.learning ? s.learning.map(l => ({ ...l })) : null,
            done: s.done, correct: s.correct, missed: [...s.missed], retries: s.retries ? { ...s.retries } : null, current: s.current
        });
        if (s.history.length > 50) s.history.shift();
    }
    grade(g) {
        const s = this.session;
        if (!s || s.kind !== 'srs' || !s.revealed) return;
        const card = this.card(s.current), now = Date.now();
        this.snapshot();
        const prev = card.state;
        const res = schedule(card, g, now, true);
        Object.assign(card, res);
        card.reps++; card.lastReview = now;
        if (g === 1 && prev !== 'new' && prev !== 'learning') { card.errors++; card.wrong++; }
        else if (g >= 3 && prev === 'review') { card.errors = Math.max(0, card.errors - 1); card.right++; }
        if (prev === 'new') this.data.stats.newSeen.count++;
        if (card.state === 'learning' || card.state === 'relearning') s.learning.push({ id: card.id, due: card.due });
        s.done++;
        if (g >= 2) s.correct++;
        if (g === 1 && !s.missed.includes(card.id)) s.missed.push(card.id);
        this.recordReview(g, this.elapsedSec());
        s.lastId = card.id;
        this.save();
        this.nextCard();
    }
    practiceAnswer(ok) {
        const s = this.session;
        if (!s || s.kind !== 'practice' || !s.revealed) return;
        const card = this.card(s.current);
        this.snapshot();
        if (ok) { card.right++; card.errors = Math.max(0, card.errors - 1); s.correct++; }
        else {
            card.wrong++; card.errors++;
            if (!s.missed.includes(card.id)) s.missed.push(card.id);
            s.retries[card.id] = (s.retries[card.id] || 0) + 1;
            if (s.retries[card.id] <= 2) s.queue.splice(Math.min(3, s.queue.length), 0, card.id);
        }
        s.done++;
        this.recordReview(null, this.elapsedSec());
        this.save();
        this.nextCard();
    }
    undo() {
        const s = this.session;
        if (!s || !s.history.length) return;
        const h = s.history.pop();
        const card = this.card(h.card.id);
        if (card) Object.assign(card, h.card);
        this.data.stats = normalizeStats(JSON.parse(h.stats));
        s.queue = h.queue; if (h.learning) s.learning = h.learning;
        s.done = h.done; s.correct = h.correct; s.missed = h.missed; if (h.retries) s.retries = h.retries;
        s.current = h.current; s.revealed = false; s.typed = null; s.cardStart = Date.now();
        this.save();
        this.renderSession();
        this.renderStreak();
        this.toast('Dernière réponse annulée', 'success', ic('undo'));
    }
    speak(side) {
        if (!('speechSynthesis' in window)) { this.toast('Lecture audio non disponible sur ce navigateur', 'warning'); return; }
        const s = this.session;
        let html = '';
        if (s && s.current) { const c = this.card(s.current); html = side === 'back' || (!side && s.revealed) ? c.back : c.front; }
        else if (s && s.quizCard) html = this.card(s.quizCard).front;
        const text = stripHtml(html);
        if (!text) return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'fr-FR';
        speechSynthesis.speak(u);
    }

    /* ---------- Quiz & Chrono ---------- */
    optionHtml(card) {
        const t = stripHtml(card.back);
        return t ? esc(truncate(t, 170)) : `<span class="rich">${card.back}</span>`;
    }
    buildOptions(card) {
        const correctKey = normAnswer(card.back) || card.id;
        const seen = new Set([correctKey]);
        const sameDeck = shuffle(this.data.cards.filter(c => c.deckId === card.deckId && c.id !== card.id));
        const others = shuffle(this.data.cards.filter(c => c.deckId !== card.deckId)).slice(0, 40);
        const len = stripHtml(card.back).length;
        const pick = (list, n) => {
            const out = [];
            list.slice(0, 24).sort((a, b) => Math.abs(stripHtml(a.back).length - len) - Math.abs(stripHtml(b.back).length - len))
                .forEach(c => { const k = normAnswer(c.back) || c.id; if (out.length < n && !seen.has(k)) { seen.add(k); out.push(c); } });
            return out;
        };
        let wrong = pick(sameDeck, 3);
        if (wrong.length < 3) wrong = wrong.concat(pick(others, 3 - wrong.length));
        return shuffle([{ id: card.id, ok: true }, ...wrong.map(c => ({ id: c.id, ok: false }))]);
    }
    startQuiz(deckIds, count, chrono = 0) {
        const pool = this.poolFor(deckIds);
        if (this.data.cards.length < 4) { this.toast('Il faut au moins 4 cartes pour un quiz.', 'warning'); return; }
        if (!pool.length) { this.toast('Aucune carte dans cette sélection.', 'warning'); return; }
        const deck = Array.isArray(deckIds) && deckIds.length === 1 ? this.deck(deckIds[0]) : null;
        const label = deckIds === 'errors' ? 'Mes erreurs' : deck ? deck.name : 'Tous les paquets';
        const ids = shuffle(pool.map(c => c.id));
        this.session = {
            kind: chrono ? 'chrono' : 'quiz', title: `${chrono ? 'Chrono' : 'Quiz'} · ${label}`,
            pool: ids, queue: chrono ? [...ids] : ids.slice(0, count >= 9999 ? ids.length : count),
            total: 0, index: 0, score: 0, answered: false, quizCard: null, options: [], missed: [], history: [],
            done: 0, correct: 0, startedAt: Date.now(), cardStart: Date.now(),
            duration: chrono, timeLeft: chrono, timer: null, combo: 0
        };
        this.session.total = this.session.queue.length;
        this.go('session');
        this.nextQuestion();
        if (chrono) {
            this.session.timer = setInterval(() => {
                const s = this.session;
                if (!s || s.kind !== 'chrono') return;
                s.timeLeft--;
                this.updateChronoHud();
                if (s.timeLeft <= 0) this.finishChrono();
            }, 1000);
        }
    }
    nextQuestion() {
        const s = this.session;
        if (!s) return;
        if (!s.queue.length) {
            if (s.kind === 'chrono') s.queue = shuffle([...s.pool]);
            else return this.showSummary();
        }
        const card = this.card(s.queue.shift());
        if (!card) return this.nextQuestion();
        s.quizCard = card.id; s.options = this.buildOptions(card); s.answered = false; s.cardStart = Date.now();
        this.renderQuiz();
    }
    renderQuiz() {
        const s = this.session, card = this.card(s.quizCard), deck = this.deck(card.deckId);
        const chrono = s.kind === 'chrono';
        const hud = chrono
            ? `<div class="chrono-hud">
                    <div><div class="tiny faint" style="font-weight:700">SCORE</div><div class="chrono-num" id="chrono-score">${s.score}</div></div>
                    <div style="text-align:right"><div class="tiny faint" style="font-weight:700">TEMPS</div><div class="chrono-num ${s.timeLeft <= 10 ? 'low' : ''}" id="chrono-time">${s.timeLeft}s</div></div>
               </div>
               <div class="pbar timer"><i id="chrono-bar" style="width:${s.timeLeft / s.duration * 100}%"></i></div>`
            : `<div class="pbar"><i style="width:${s.done / Math.max(1, s.total) * 100}%"></i></div>`;
        $('#view-session').innerHTML = `
        <div class="session">
            <div class="session-top">
                <button class="icon-btn" title="Quitter (Échap)" data-action="quit-session">${ic('x')}</button>
                <div class="session-title"><h3>${esc(s.title)}</h3><p>${chrono ? 'Bonne réponse +1 · erreur -3 s' : 'Choisis la bonne réponse · sans impact sur le planning'}</p></div>
                ${chrono ? '' : `<div class="session-counts"><span>${Math.min(s.done + 1, s.total)}<span class="faint">/${s.total}</span></span></div>`}
            </div>
            ${hud}
            <div class="panel flashcard" style="min-height:0">
                <div class="fc-top"><span class="tag">${esc(deck ? deck.emoji + ' ' + deck.name : '')}</span></div>
                <div class="fc-content fc-front rich" style="padding:10px 0 4px">${card.front}</div>
            </div>
            <div class="quiz-options" id="quiz-options">
                ${s.options.map((o, i) => `<button class="quiz-opt" data-action="quiz-answer" data-i="${i}"><span class="k">${i + 1}</span><span>${this.optionHtml(this.card(o.id))}</span></button>`).join('')}
            </div>
            <div id="quiz-after"></div>
        </div>`;
    }
    updateChronoHud() {
        const s = this.session;
        const t = $('#chrono-time'), b = $('#chrono-bar'), sc = $('#chrono-score');
        if (t) { t.textContent = `${Math.max(0, s.timeLeft)}s`; t.classList.toggle('low', s.timeLeft <= 10); }
        if (b) b.style.width = `${Math.max(0, s.timeLeft) / s.duration * 100}%`;
        if (sc) sc.textContent = s.score;
    }
    quizAnswer(i, el) {
        const s = this.session;
        if (!s || s.answered || (s.kind !== 'quiz' && s.kind !== 'chrono')) return;
        const opt = s.options[i];
        if (!opt) return;
        s.answered = true;
        const card = this.card(s.quizCard);
        const btns = $$('.quiz-opt');
        $('#quiz-options').classList.add('locked');
        btns.forEach((b, j) => {
            if (s.options[j].ok) b.classList.add('correct');
            else if (j === i) b.classList.add('wrong');
            else b.classList.add('dim');
        });
        s.done++;
        if (opt.ok) {
            s.score++; s.correct++;
            card.right++; card.errors = Math.max(0, card.errors - 1);
        } else {
            card.wrong++; card.errors++;
            if (!s.missed.includes(card.id)) s.missed.push(card.id);
        }
        this.recordReview(null, clamp((Date.now() - s.cardStart) / 1000, 1, 60));
        this.save();
        if (s.kind === 'chrono') {
            if (!opt.ok) { s.timeLeft = Math.max(0, s.timeLeft - 3); }
            this.floatText(el || btns[i], opt.ok ? '+1' : '-3 s', opt.ok ? 'var(--mature)' : 'var(--due)');
            this.updateChronoHud();
            if (s.timeLeft <= 0) { this.finishChrono(); return; }
            setTimeout(() => { if (this.session === s && s.timeLeft > 0) this.nextQuestion(); }, opt.ok ? 350 : 1100);
            return;
        }
        const full = stripHtml(card.back);
        $('#quiz-after').innerHTML = `
            ${(full.length > 170 || card.detail || hasImage(card.back)) ? `<div class="panel panel-pad rich" style="margin-top:12px;font-size:.95rem">${card.back}${card.detail ? `<div class="detail-box rich" style="margin-top:10px">${card.detail}</div>` : ''}</div>` : ''}
            <div class="study-actions"><button class="btn btn-primary btn-lg btn-block" data-action="quiz-next">${s.queue.length ? 'Question suivante' : 'Voir le résultat'} ${ic('chevronRight')}</button></div>`;
    }
    floatText(anchor, text, color) {
        if (!anchor) return;
        const r = anchor.getBoundingClientRect();
        const f = document.createElement('div');
        f.className = 'float-pts'; f.textContent = text; f.style.color = color;
        f.style.left = `${r.right - 60}px`; f.style.top = `${r.top}px`;
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 800);
    }
    finishChrono() {
        const s = this.session;
        if (!s || s.kind !== 'chrono') return;
        clearInterval(s.timer); s.timer = null;
        const best = this.data.stats.chronoBest[s.duration] || 0;
        s.newRecord = s.score > best && s.score > 0;
        if (s.newRecord) this.data.stats.chronoBest[s.duration] = s.score;
        this.save();
        this.showSummary();
    }
    showSummary() {
        const s = this.session;
        if (!s) return;
        if (s.timer) { clearInterval(s.timer); s.timer = null; }
        const secs = Math.round((Date.now() - s.startedAt) / 1000);
        const acc = s.done ? Math.round(s.correct / s.done * 100) : 0;
        let emoji = acc >= 90 ? '🏆' : acc >= 70 ? '🎉' : acc >= 50 ? '💪' : '📚';
        let title = s.kind === 'srs' ? 'Session terminée !' : s.kind === 'chrono' ? 'Temps écoulé !' : s.kind === 'quiz' ? 'Quiz terminé !' : 'Entraînement terminé !';
        let lead = '';
        if (s.kind === 'chrono') {
            emoji = s.newRecord ? '🏆' : '⏱️';
            lead = s.newRecord ? `Nouveau record : <b>${s.score} points</b> !` : `Score : <b>${s.score}</b> · record ${this.data.stats.chronoBest[s.duration] || 0}`;
        } else if (s.kind === 'quiz') {
            if (s.total >= 5 && acc > (this.data.stats.quizBest || 0)) { this.data.stats.quizBest = acc; this.save(); lead = 'Nouveau record de réussite !'; }
        } else if (s.kind === 'srs') {
            const pending = (s.learning || []).length;
            const next = this.nextDueTime();
            lead = pending ? `${plural(pending, 'carte')} en cours d'apprentissage reviendra bientôt.` : next < Infinity ? `Prochaine révision ${fmtRelativeFuture(next)}.` : '';
        }
        if (!s.done && s.kind !== 'chrono') { this.endSession(true); return; }
        const missed = s.missed.map(id => this.card(id)).filter(Boolean);
        const kind = s.kind;
        const replay = { kind, pool: s.pool, duration: s.duration, total: s.total, title: s.title };
        this.session = null;
        this.lastSession = { missed: missed.map(c => c.id), replay };
        document.body.classList.add('in-session');
        $('#view-session').innerHTML = `
        <div class="summary">
            <div class="summary-emoji">${emoji}</div>
            <h2 class="page-title" style="margin-top:12px">${title}</h2>
            ${lead ? `<p class="page-sub">${lead}</p>` : ''}
            <div class="summary-stats">
                <div class="panel"><b>${kind === 'chrono' ? s.score : s.done}</b><span>${kind === 'chrono' ? 'points' : 'cartes'}</span></div>
                <div class="panel"><b>${acc}%</b><span>réussite</span></div>
                <div class="panel"><b>${fmtDuration(secs)}</b><span>durée</span></div>
            </div>
            ${missed.length ? `
            <div class="panel missed-list" style="margin-bottom:18px">
                <div class="section-head" style="padding:14px 16px 0"><h4 style="font-size:.95rem;font-weight:800">À retravailler (${missed.length})</h4></div>
                ${missed.slice(0, 30).map(c => `<div class="missed-item"><div class="rich" style="font-weight:700">${c.front}</div><div class="a">${esc(truncate(stripHtml(c.back), 200))}</div></div>`).join('')}
            </div>` : ''}
            <div style="display:grid;gap:10px">
                ${missed.length ? `<button class="btn btn-primary btn-lg" data-action="practice-missed">${ic('target')}Retravailler ces ${plural(missed.length, 'erreur')}</button>` : ''}
                ${kind === 'chrono' || kind === 'quiz' ? `<button class="btn btn-soft btn-lg" data-action="replay">${ic('repeat')}Rejouer</button>` : ''}
                <button class="btn ${missed.length ? 'btn-soft' : 'btn-primary'} btn-lg" data-action="home">${ic('home')}Retour à l'accueil</button>
            </div>
        </div>`;
        this.view = 'session';
        this.renderStreak();
    }

    /* ============================================================
       Modals
       ============================================================ */
    openModal({ title, body, foot = '', size = '', onClose }) {
        const back = document.createElement('div');
        back.className = 'modal-back';
        back.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${esc(stripHtml(title))}">
            <div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-close aria-label="Fermer">${ic('x')}</button></div>
            <div class="modal-body">${body}</div>
            ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
        </div>`;
        let downOnBack = false;
        back.addEventListener('mousedown', e => { downOnBack = e.target === back; });
        back.addEventListener('click', e => {
            if ((e.target === back && downOnBack) || e.target.closest('[data-close]')) this.closeModal(back);
        });
        back._onClose = onClose;
        $('#modal-root').appendChild(back);
        this.modals.push(back);
        document.body.style.overflow = 'hidden';
        return back;
    }
    closeModal(el) {
        el = el || this.modals[this.modals.length - 1];
        if (!el) return;
        this.modals = this.modals.filter(m => m !== el);
        if (el._onClose) el._onClose();
        el.remove();
        if (!this.modals.length) document.body.style.overflow = '';
    }
    confirm({ title, message, ok = 'Confirmer', danger = false }) {
        return new Promise(resolve => {
            let answered = false;
            const m = this.openModal({
                title, size: 'narrow',
                body: `<p class="muted">${message}</p>`,
                foot: `<button class="btn btn-soft" data-close>Annuler</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${ok}</button>`,
                onClose: () => { if (!answered) resolve(false); }
            });
            m.querySelector('[data-ok]').addEventListener('click', () => { answered = true; this.closeModal(m); resolve(true); });
            setTimeout(() => m.querySelector('[data-ok]').focus(), 30);
        });
    }

    /* ---------- Deck modal ---------- */
    openDeckModal(deckId) {
        const deck = deckId ? this.deck(deckId) : null;
        const emoji = deck ? deck.emoji : '📚';
        const m = this.openModal({
            title: deck ? 'Modifier le paquet' : 'Nouveau paquet', size: 'narrow',
            body: `<form id="deck-form" novalidate>
                <div class="field"><label class="label" for="deck-name">Nom du paquet</label><input class="input" id="deck-name" maxlength="80" placeholder="Ex : Biologie cellulaire" value="${esc(deck ? deck.name : '')}" autocomplete="off"></div>
                <div class="field"><span class="label">Icône</span>
                    <div class="emoji-row" id="emoji-row">${EMOJIS.map(e => `<button type="button" class="${e === emoji ? 'active' : ''}" data-emoji="${e}">${e}</button>`).join('')}</div>
                    <input class="input" id="deck-emoji" maxlength="8" value="${esc(emoji)}" style="margin-top:8px;width:120px;text-align:center" aria-label="Emoji personnalisé">
                </div>
                <div class="field"><label class="label" for="deck-desc">Description (optionnel)</label><textarea class="textarea" id="deck-desc" rows="2" style="min-height:70px" maxlength="300">${esc(deck ? deck.description : '')}</textarea></div>
                <button type="submit" class="hidden"></button>
            </form>`,
            foot: `<button class="btn btn-soft" data-close>Annuler</button><button class="btn btn-primary" id="deck-save">${ic('check')}Enregistrer</button>`
        });
        const emojiInput = $('#deck-emoji', m);
        $('#emoji-row', m).addEventListener('click', e => {
            const b = e.target.closest('[data-emoji]');
            if (!b) return;
            emojiInput.value = b.dataset.emoji;
            $$('#emoji-row button', m).forEach(x => x.classList.toggle('active', x === b));
        });
        const submit = () => {
            const name = $('#deck-name', m).value.trim();
            if (!name) { $('#deck-name', m).focus(); this.toast('Donne un nom au paquet.', 'warning'); return; }
            const payload = { name, emoji: emojiInput.value.trim() || '📁', description: $('#deck-desc', m).value.trim() };
            let id = deckId;
            if (deck) Object.assign(deck, payload);
            else { id = uid('d'); this.data.decks.push({ id, created: Date.now(), ...payload }); }
            this.save();
            this.closeModal(m);
            this.toast(deck ? 'Paquet modifié' : 'Paquet créé', 'success');
            if (!deck) { this.ui.deck = id; this.ui.filter = 'all'; }
            this.render();
        };
        $('#deck-save', m).addEventListener('click', submit);
        $('#deck-form', m).addEventListener('submit', e => { e.preventDefault(); submit(); });
        setTimeout(() => $('#deck-name', m).focus(), 30);
    }
    async deleteDeck(deckId) {
        const deck = this.deck(deckId);
        if (!deck) return;
        const n = this.cardsOf(deckId).length;
        const ok = await this.confirm({ title: 'Supprimer le paquet ?', message: `« ${esc(deck.name)} » et ses ${plural(n, 'carte')} seront supprimés définitivement.`, ok: 'Supprimer', danger: true });
        if (!ok) return;
        this.data.decks = this.data.decks.filter(d => d.id !== deckId);
        this.data.cards = this.data.cards.filter(c => c.deckId !== deckId);
        this.ui.deck = 'all';
        this.save();
        this.render();
        this.toast('Paquet supprimé', 'success');
    }

    /* ---------- Card editor (rich text) ---------- */
    editorHtml(id, placeholder, small = false) {
        const b = (cmd, title, inner) => `<button type="button" class="tb-btn" data-cmd="${cmd}" title="${title}" aria-label="${title}">${inner}</button>`;
        return `<div class="editor ${small ? 'sm' : ''}">
            <div class="toolbar" role="toolbar">
                ${b('bold', 'Gras (Ctrl+B)', '<b>B</b>')}${b('italic', 'Italique (Ctrl+I)', '<i style="font-family:Georgia,serif">I</i>')}${b('underline', 'Souligné (Ctrl+U)', '<u>U</u>')}${b('strikeThrough', 'Barré', '<s>S</s>')}
                <span class="tb-sep"></span>
                ${b('red', 'Texte en rouge', '<span style="color:#e11d48">A</span>')}${b('blue', 'Texte en bleu', '<span style="color:#2563eb">A</span>')}${b('highlight', 'Surligner', '<span style="background:#fde047;color:#111;padding:0 5px;border-radius:3px">A</span>')}
                <span class="tb-sep"></span>
                ${b('insertUnorderedList', 'Liste à puces', ic('list'))}${b('insertOrderedList', 'Liste numérotée', ic('listOrdered'))}
                <span class="tb-sep"></span>
                ${b('image', 'Ajouter une image', ic('image'))}${b('removeFormat', 'Effacer la mise en forme', ic('eraser'))}
            </div>
            <div class="editor-area rich" contenteditable="true" id="${id}" data-placeholder="${esc(placeholder)}" role="textbox" aria-multiline="true"></div>
        </div>`;
    }
    openCardModal(cardId, presetDeck) {
        if (!this.data.decks.length) { this.toast('Crée d\'abord un paquet.', 'warning'); this.openDeckModal(); return; }
        const card = cardId ? this.card(cardId) : null;
        const inSession = !!this.session;
        const deckId = card ? card.deckId : presetDeck || (this.ui.deck !== 'all' && this.ui.deck !== 'errors' ? this.ui.deck : this.lastDeckUsed) || this.sortedDecks()[0].id;
        const m = this.openModal({
            title: card ? 'Modifier la carte' : 'Nouvelle carte', size: 'wide',
            body: `
                <div class="field"><label class="label" for="cf-deck">Paquet</label>
                    <select class="select" id="cf-deck">${this.sortedDecks().map(d => `<option value="${esc(d.id)}" ${d.id === deckId ? 'selected' : ''}>${esc(d.emoji)} ${esc(d.name)}</option>`).join('')}</select></div>
                <div class="field"><span class="label">Recto · question</span>${this.editorHtml('cf-front', 'Question ou terme... (tu peux coller une image)')}</div>
                <div class="field"><span class="label">Verso · réponse</span>${this.editorHtml('cf-back', 'Réponse...')}</div>
                <details class="field" ${card && (card.hint || card.detail || card.tags.length) ? 'open' : ''}>
                    <summary class="label" style="cursor:pointer;display:flex;align-items:center;gap:6px">${ic('chevronDown')}Plus d'options (indice, détails, tags${card ? '' : ', sens inversé'})</summary>
                    <div class="field" style="margin-top:12px"><label class="label" for="cf-hint">Indice (affiché sur demande avant la réponse)</label><input class="input" id="cf-hint" placeholder="Un petit coup de pouce..." value="${esc(card ? stripHtml(card.hint) : '')}"></div>
                    <div class="field"><span class="label">Détails (repliés sous « En savoir plus »)</span>${this.editorHtml('cf-detail', 'Explication plus poussée...', true)}</div>
                    <div class="field"><label class="label" for="cf-tags">Tags (séparés par des virgules)</label><input class="input" id="cf-tags" placeholder="chapitre1, dates" value="${esc(card ? card.tags.join(', ') : '')}"></div>
                    ${card ? '' : `<label class="field" style="display:flex;align-items:center;gap:12px;cursor:pointer"><span class="switch"><input type="checkbox" id="cf-both"><span></span></span><span class="small"><b>Créer aussi la carte inversée</b><br><span class="muted">Réponse → question, utile pour le vocabulaire.</span></span></label>`}
                </details>
                ${card ? `<p class="help">${card.state === 'new' ? 'Carte jamais révisée.' : `Prochaine révision ${fmtRelativeFuture(card.due)} · ${plural(card.reps, 'révision')} · ${plural(card.lapses, 'oubli')}`}</p>` : ''}`,
            foot: `${card ? `<button class="btn btn-danger-soft" id="cf-delete" style="margin-right:auto">${ic('trash')}<span class="hide-mobile">Supprimer</span></button>` : ''}
                <button class="btn btn-soft hide-mobile" data-close>Annuler</button>
                ${card ? '' : `<button class="btn btn-soft" id="cf-save-next" title="Enregistrer et créer une autre carte (Ctrl+Entrée)">${ic('plus')}Enregistrer + nouvelle</button>`}
                <button class="btn btn-primary" id="cf-save">${ic('check')}Enregistrer</button>`
        });
        m.dataset.cardModal = '1';
        const front = $('#cf-front', m), back = $('#cf-back', m), detail = $('#cf-detail', m);
        if (card) { front.innerHTML = card.front; back.innerHTML = card.back; detail.innerHTML = card.detail; }
        const save = (keepOpen) => {
            const f = sanitizeHtml(front.innerHTML), bk = sanitizeHtml(back.innerHTML);
            if (isBlank(f)) { this.toast('Le recto (question) est vide.', 'warning'); front.focus(); return; }
            if (isBlank(bk)) { this.toast('Le verso (réponse) est vide.', 'warning'); back.focus(); return; }
            const fields = {
                deckId: $('#cf-deck', m).value, front: f, back: bk,
                hint: sanitizeHtml($('#cf-hint', m).value), detail: isBlank(detail.innerHTML) ? '' : sanitizeHtml(detail.innerHTML),
                tags: $('#cf-tags', m).value.split(',').map(t => t.trim()).filter(Boolean)
            };
            this.lastDeckUsed = fields.deckId;
            if (card) {
                Object.assign(card, fields);
                this.toast('Carte modifiée', 'success');
            } else {
                const base = { state: 'new', step: 0, interval: 0, ease: 2.5, due: Date.now(), reps: 0, lapses: 0, lastReview: null, errors: 0, wrong: 0, right: 0 };
                this.data.cards.push({ id: uid('c'), created: Date.now(), ...fields, ...base });
                const both = $('#cf-both', m);
                if (both && both.checked) this.data.cards.push({ id: uid('c'), created: Date.now() + 1, ...fields, front: bk, back: f, ...base });
                this.toast(both && both.checked ? '2 cartes créées (dont l\'inversée)' : 'Carte créée', 'success');
            }
            this.save();
            if (keepOpen) {
                front.innerHTML = ''; back.innerHTML = ''; detail.innerHTML = ''; $('#cf-hint', m).value = '';
                front.focus();
            } else this.closeModal(m);
            if (inSession && this.session) { if (this.session.quizCard) this.renderQuiz(); else if (this.session.current) this.renderSession(); }
            else if (this.view === 'decks') this.renderDecks();
            else if (this.view === 'dashboard') this.renderDashboard();
        };
        m._save = () => save(!card);
        $('#cf-save', m).addEventListener('click', () => save(false));
        const next = $('#cf-save-next', m);
        if (next) next.addEventListener('click', () => save(true));
        const del = $('#cf-delete', m);
        if (del) del.addEventListener('click', async () => { if (await this.deleteCard(card.id)) this.closeModal(m); });
        setTimeout(() => (card ? null : front.focus()), 50);
    }
    async deleteCard(cardId) {
        const card = this.card(cardId);
        if (!card) return false;
        const ok = await this.confirm({ title: 'Supprimer la carte ?', message: `« ${esc(truncate(stripHtml(card.front), 90))} » sera supprimée définitivement.`, ok: 'Supprimer', danger: true });
        if (!ok) return false;
        this.data.cards = this.data.cards.filter(c => c.id !== cardId);
        this.save();
        if (this.session) {
            const s = this.session;
            s.queue = s.queue.filter(id => id !== cardId);
            if (s.learning) s.learning = s.learning.filter(l => l.id !== cardId);
            if (s.current === cardId) this.nextCard();
            else if (s.quizCard === cardId) this.nextQuestion();
        } else this.render();
        this.toast('Carte supprimée', 'success');
        return true;
    }
    execEditor(cmd, area) {
        if (document.activeElement !== area) {
            area.focus();
            if (this.editorRange && area.contains(this.editorRange.startContainer)) {
                const sel = getSelection(); sel.removeAllRanges(); sel.addRange(this.editorRange);
            } else {
                const r = document.createRange(); r.selectNodeContents(area); r.collapse(false);
                const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
            }
        }
        if (cmd === 'image') { this.pickImage(area); return; }
        const css = ['red', 'blue', 'highlight'].includes(cmd);
        try { document.execCommand('styleWithCSS', false, css); } catch { /* ignore */ }
        if (cmd === 'red' || cmd === 'blue') {
            document.execCommand('foreColor', false, cmd === 'red' ? '#e11d48' : '#2563eb');
        } else if (cmd === 'highlight') {
            if (!document.execCommand('hiliteColor', false, '#fde047')) document.execCommand('backColor', false, '#fde047');
        } else if (cmd === 'removeFormat') {
            document.execCommand('removeFormat');
            document.execCommand('unlink');
        } else document.execCommand(cmd);
        this.updateToolbarState(area);
    }
    updateToolbarState(area) {
        const ed = area && area.closest('.editor');
        if (!ed) return;
        ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].forEach(cmd => {
            const b = ed.querySelector(`[data-cmd="${cmd}"]`);
            let on = false;
            try { on = document.queryCommandState(cmd); } catch { /* ignore */ }
            if (b) b.classList.toggle('on', on);
        });
    }
    pickImage(area) {
        this.imageTarget = area;
        const input = $('#hidden-file');
        input.accept = 'image/*';
        input.value = '';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) await this.insertImage(file, area);
        };
        input.click();
    }
    async compressImage(file) {
        if (file.size < 180 * 1024 && /^image\/(png|jpe?g|gif|webp)$/.test(file.type)) return readAsDataURL(file);
        const url = URL.createObjectURL(file);
        try {
            const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
            const max = 1280, scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
            const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
            const cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            const ctx = cv.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            return cv.toDataURL('image/jpeg', 0.82);
        } finally { URL.revokeObjectURL(url); }
    }
    async insertImage(file, area) {
        if (!file || !file.type.startsWith('image/')) { this.toast('Ce fichier n\'est pas une image.', 'warning'); return; }
        try {
            const src = await this.compressImage(file);
            area.focus();
            if (this.editorRange && area.contains(this.editorRange.startContainer)) {
                const sel = getSelection(); sel.removeAllRanges(); sel.addRange(this.editorRange);
            } else {
                const r = document.createRange(); r.selectNodeContents(area); r.collapse(false);
                const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
            }
            document.execCommand('insertHTML', false, `<img src="${src}" alt=""><br>`);
            this.toast('Image ajoutée', 'success', ic('image'));
        } catch (e) {
            console.error(e);
            this.toast('Impossible de lire cette image (format non supporté ?)', 'error');
        }
    }

    /* ---------- Import / export ---------- */
    openImportModal() {
        if (!this.data.decks.length) { this.toast('Crée d\'abord un paquet.', 'warning'); this.openDeckModal(); return; }
        const cur = this.ui.deck !== 'all' && this.ui.deck !== 'errors' ? this.ui.deck : '';
        const m = this.openModal({
            title: 'Importer des fiches', size: 'wide',
            body: `
                <p class="small muted" style="margin-bottom:14px">Une fiche par ligne : <code>question ; réponse</code> (séparateur <code>;</code>, tabulation ou virgule). Une 3e colonne optionnelle sert d'indice. Compatible avec les exports texte d'Anki et Quizlet.</p>
                <div class="field"><label class="label" for="im-deck">Paquet de destination</label>
                    <select class="select" id="im-deck">${this.sortedDecks().map(d => `<option value="${esc(d.id)}" ${d.id === cur ? 'selected' : ''}>${esc(d.emoji)} ${esc(d.name)}</option>`).join('')}<option value="__new">+ Nouveau paquet...</option></select></div>
                <div class="field hidden" id="im-newdeck-wrap"><label class="label" for="im-newdeck">Nom du nouveau paquet</label><input class="input" id="im-newdeck" placeholder="Ex : Vocabulaire anglais"></div>
                <div class="field"><span class="label">Fichier</span><button class="btn btn-soft btn-block" id="im-file">${ic('file')}Choisir un fichier TXT / CSV</button></div>
                <div class="field"><label class="label" for="im-text">... ou colle tes fiches ici</label><textarea class="textarea" id="im-text" rows="6" placeholder="Capitale de l'Italie ; Rome&#10;H2O ; L'eau"></textarea></div>
                <p class="help" id="im-preview">Aucune fiche détectée pour l'instant.</p>`,
            foot: `<button class="btn btn-soft" data-close>Annuler</button><button class="btn btn-primary" id="im-go" disabled>${ic('import')}Importer</button>`
        });
        const ta = $('#im-text', m), prev = $('#im-preview', m), go = $('#im-go', m), sel = $('#im-deck', m);
        const refresh = () => {
            const rows = parseImport(ta.value);
            prev.innerHTML = rows.length ? `<b>${plural(rows.length, 'fiche')} détectée${rows.length > 1 ? 's' : ''}</b>. Ex. : « ${esc(truncate(stripHtml(rows[0].front), 50))} » → « ${esc(truncate(stripHtml(rows[0].back), 50))} »` : 'Aucune fiche détectée pour l\'instant.';
            go.disabled = !rows.length;
            return rows;
        };
        ta.addEventListener('input', refresh);
        sel.addEventListener('change', () => $('#im-newdeck-wrap', m).classList.toggle('hidden', sel.value !== '__new'));
        $('#im-file', m).addEventListener('click', () => {
            const input = $('#hidden-file');
            input.accept = '.txt,.csv,.tsv,text/plain,text/csv';
            input.value = '';
            input.onchange = async () => {
                const f = input.files[0];
                if (!f) return;
                ta.value = await readAsText(f);
                refresh();
                $('#im-file', m).innerHTML = `${ic('check')}${esc(f.name)}`;
            };
            input.click();
        });
        go.addEventListener('click', () => {
            const rows = refresh();
            if (!rows.length) return;
            let deckId = sel.value;
            if (deckId === '__new') {
                const name = $('#im-newdeck', m).value.trim();
                if (!name) { this.toast('Donne un nom au nouveau paquet.', 'warning'); return; }
                deckId = uid('d');
                this.data.decks.push({ id: deckId, name, emoji: '📥', description: '', created: Date.now() });
            }
            const now = Date.now();
            rows.forEach((r, i) => this.data.cards.push({
                id: uid('c'), deckId, front: r.front, back: r.back, hint: r.hint || '', detail: '', tags: [], created: now + i,
                state: 'new', step: 0, interval: 0, ease: 2.5, due: now, reps: 0, lapses: 0, lastReview: null, errors: 0, wrong: 0, right: 0
            }));
            this.save();
            this.closeModal(m);
            this.ui.deck = deckId; this.ui.filter = 'all';
            this.go('decks');
            this.toast(`${plural(rows.length, 'fiche importée', 'fiches importées')}`, 'success');
        });
    }
    exportJSON() {
        const json = JSON.stringify(JSON.parse(this.serialize()), null, 1);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `superanki-sauvegarde-${dayKey()}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        this.toast('Sauvegarde exportée', 'success', ic('export'));
    }
    importJSON() {
        const input = $('#hidden-file');
        input.accept = '.json,application/json';
        input.value = '';
        input.onchange = async () => {
            const f = input.files[0];
            if (!f) return;
            let data = null;
            try { data = normalizeState(await readAsText(f)); } catch (e) { data = null; }
            if (!data || !data.cards.length) { this.toast('Fichier de sauvegarde invalide.', 'error'); return; }
            const ok = await this.confirm({ title: 'Restaurer cette sauvegarde ?', message: `${plural(data.decks.length, 'paquet')} et ${plural(data.cards.length, 'carte')}. Tes données actuelles seront remplacées.`, ok: 'Restaurer', danger: true });
            if (!ok) return;
            data.settings = Object.assign({}, this.data.settings, data.settings);
            this.replaceData(data);
            this.save();
            this.toast('Sauvegarde restaurée', 'success');
        };
        input.click();
    }

    /* ---------- Mode launcher ---------- */
    openModeLauncher(mode, presetDeck) {
        const meta = {
            write: { title: `${ic('keyboard')} Écrire`, desc: 'Tape la réponse de mémoire, la correction est automatique (fautes de frappe tolérées).', key: 'writeCount' },
            quiz: { title: `${ic('quiz')} Quiz`, desc: 'Pour chaque question, choisis la bonne réponse parmi 4.', key: 'quizCount' },
            chrono: { title: `${ic('timer')} Chrono`, desc: 'Un maximum de bonnes réponses avant la fin du temps. Chaque erreur coûte 3 secondes.', key: 'chronoDuration' }
        }[mode];
        const s = this.data.settings;
        let sel = presetDeck || 'all';
        let opt = s[meta.key];
        const errCount = this.errorCards().length;
        const item = (id, em, name, n) => `<button class="pick-item ${sel === id ? 'active' : ''}" data-pick="${esc(id)}" ${n ? '' : 'disabled style="opacity:.45"'}><span>${em}</span>${esc(name)}<span class="ct">${n}</span></button>`;
        const choices = mode === 'chrono' ? [[30, '30 s'], [60, '60 s'], [120, '2 min']] : [[10, '10'], [20, '20'], [50, '50'], [9999, 'Tout']];
        const m = this.openModal({
            title: meta.title,
            body: `<p class="muted small" style="margin-bottom:16px">${meta.desc}</p>
                <div class="field"><span class="label">Cartes</span>
                    <div class="pick-list" id="pick-list">
                        ${item('all', '📂', 'Tous les paquets', this.data.cards.length)}
                        ${item('errors', '🎯', 'Mes erreurs', errCount)}
                        ${this.sortedDecks().map(d => item(d.id, esc(d.emoji), d.name, this.cardsOf(d.id).length)).join('')}
                    </div>
                </div>
                <div class="field"><span class="label">${mode === 'chrono' ? 'Durée' : 'Nombre de questions'}</span>
                    <div class="segmented" id="opt-seg">${choices.map(([v, l]) => `<button class="${opt === v ? 'active' : ''}" data-opt="${v}">${l}</button>`).join('')}</div>
                </div>`,
            foot: `<button class="btn btn-soft" data-close>Annuler</button><button class="btn btn-primary" id="mode-go">${ic('play')}C'est parti</button>`
        });
        $('#pick-list', m).addEventListener('click', e => {
            const b = e.target.closest('[data-pick]');
            if (!b || b.disabled) return;
            sel = b.dataset.pick;
            $$('[data-pick]', m).forEach(x => x.classList.toggle('active', x === b));
        });
        $('#opt-seg', m).addEventListener('click', e => {
            const b = e.target.closest('[data-opt]');
            if (!b) return;
            opt = Number(b.dataset.opt);
            $$('[data-opt]', m).forEach(x => x.classList.toggle('active', x === b));
        });
        const active = $('.pick-item.active', m);
        if (active) setTimeout(() => active.scrollIntoView({ block: 'nearest' }), 30);
        $('#mode-go', m).addEventListener('click', () => {
            s[meta.key] = opt;
            this.save(false);
            this.closeModal(m);
            const deckIds = sel === 'all' ? null : sel === 'errors' ? 'errors' : [sel];
            if (mode === 'write') {
                const pool = this.poolFor(deckIds).map(c => c.id);
                const d = deckIds && deckIds !== 'errors' ? this.deck(sel) : null;
                this.startPractice(null, 'type', opt, `Écrire · ${sel === 'errors' ? 'Mes erreurs' : d ? d.name : 'Tous les paquets'}`, pool);
            } else if (mode === 'quiz') this.startQuiz(deckIds, opt, 0);
            else this.startQuiz(deckIds, 0, opt);
        });
    }

    /* ============================================================
       Toasts
       ============================================================ */
    toast(msg, type = 'success', icon) {
        const box = $('#toasts');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        const ico = icon || ic(type === 'error' ? 'alert' : type === 'warning' ? 'info' : 'check');
        t.innerHTML = `${ico}<span>${esc(msg)}</span>`;
        box.appendChild(t);
        while (box.children.length > 3) box.firstElementChild.remove();
        setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, type === 'error' ? 5000 : 3000);
    }

    /* ============================================================
       Events (single delegated handler, no inline onclick)
       ============================================================ */
    bindGlobalEvents() {
        document.addEventListener('click', e => {
            const nav = e.target.closest('[data-nav]');
            if (nav) { this.go(nav.dataset.nav); return; }
            const tb = e.target.closest('.tb-btn');
            if (tb) { const area = tb.closest('.editor').querySelector('.editor-area'); this.execEditor(tb.dataset.cmd, area); return; }
            const el = e.target.closest('[data-action]');
            if (!el || el.disabled) return;
            this.handleAction(el.dataset.action, el, e);
        });
        document.addEventListener('mousedown', e => { if (e.target.closest('.tb-btn')) e.preventDefault(); });
        document.addEventListener('input', e => {
            const el = e.target;
            if (el.classList && el.classList.contains('editor-area')) {
                if (el.innerHTML === '<br>' || el.innerHTML === '<div><br></div>') el.innerHTML = '';
                return;
            }
            const k = el.dataset && el.dataset.input;
            if (k === 'search') {
                this.ui.search = el.value; this.ui.limit = 60;
                clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => this.renderDeckPanel(), 120);
            }
        });
        document.addEventListener('change', e => {
            const el = e.target, k = el.dataset && el.dataset.input;
            if (k === 'sort') { this.ui.sort = el.value; this.renderDeckPanel(); }
            else if (k === 'toggle') {
                this.setSetting(el.dataset.key, el.checked);
                if (el.dataset.key === 'cloudSync') {
                    if (el.checked) Cloud.sync(true); else Cloud.setStatus('off');
                    this.renderSettings();
                }
            }
        });
        document.addEventListener('selectionchange', () => {
            const sel = getSelection();
            if (!sel.rangeCount) return;
            const r = sel.getRangeAt(0);
            const node = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement;
            const area = node && node.closest && node.closest('.editor-area');
            if (area) { this.editorRange = r.cloneRange(); this.updateToolbarState(area); }
        });
        document.addEventListener('paste', e => {
            const area = e.target.closest && e.target.closest('.editor-area');
            if (!area) return;
            const dt = e.clipboardData;
            if (!dt) return;
            const fileItem = [...(dt.items || [])].find(i => i.kind === 'file' && i.type.startsWith('image/'));
            if (fileItem) { e.preventDefault(); this.insertImage(fileItem.getAsFile(), area); return; }
            const html = dt.getData('text/html');
            if (html) { e.preventDefault(); document.execCommand('insertHTML', false, sanitizeHtml(html.replace(/<!--[\s\S]*?-->/g, ''), { colors: false })); return; }
            const text = dt.getData('text/plain');
            if (text) { e.preventDefault(); document.execCommand('insertText', false, text); }
        });
        document.addEventListener('drop', e => {
            const area = e.target.closest && e.target.closest('.editor-area');
            if (!area) return;
            const file = [...(e.dataTransfer.files || [])].find(f => f.type.startsWith('image/'));
            if (file) { e.preventDefault(); this.editorRange = null; this.insertImage(file, area); }
        });
        document.addEventListener('keydown', e => this.onKey(e));
        matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (this.data && this.data.settings.theme === 'auto') this.applySettings(); });
        const flush = () => { if (this.saveTimer) this.writeNow(); };
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') { flush(); if (Cloud.timer) { clearTimeout(Cloud.timer); Cloud.push(); } }
            else if (this.data && this.data.settings.cloudSync && !this.session && Date.now() - Cloud.lastPull > 60000) Cloud.sync();
        });
    }
    onKey(e) {
        const tag = (e.target.tagName || '').toLowerCase();
        const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
        if (this.modals.length) {
            const top = this.modals[this.modals.length - 1];
            if (e.key === 'Escape') { e.preventDefault(); this.closeModal(top); }
            else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && top._save) { e.preventDefault(); top._save(); }
            return;
        }
        const s = this.session;
        if (this.view !== 'session') return;
        if (!s) {
            if (e.key === 'Escape' || (e.key === 'Enter' && !typing)) { e.preventDefault(); this.go('dashboard'); }
            return;
        }
        if (e.key === 'Escape') { e.preventDefault(); this.quitSession(); return; }
        if (e.target.id === 'type-answer') {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitTyped(); }
            return;
        }
        if (typing || e.ctrlKey || e.metaKey || e.altKey) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); this.undo(); }
            return;
        }
        const k = e.key.toLowerCase();
        if (s.kind === 'quiz' || s.kind === 'chrono') {
            if (['1', '2', '3', '4'].includes(k)) { e.preventDefault(); this.quizAnswer(Number(k) - 1, $$('.quiz-opt')[Number(k) - 1]); }
            else if ((k === 'enter' || k === ' ') && s.answered && s.kind === 'quiz') { e.preventDefault(); this.nextQuestion(); }
            return;
        }
        if (k === 'z') { e.preventDefault(); this.undo(); return; }
        if (k === 'e') { e.preventDefault(); this.openCardModal(s.current); return; }
        if (k === 'h') { e.preventDefault(); this.handleAction('hint'); return; }
        if (!s.revealed) {
            if (k === ' ' || k === 'enter') { e.preventDefault(); this.reveal(); }
            return;
        }
        if (s.kind === 'srs') {
            if (['1', '2', '3', '4'].includes(k)) { e.preventDefault(); this.grade(Number(k)); }
            else if (k === ' ' || k === 'enter') { e.preventDefault(); this.grade(s.typed ? s.typed.suggest : 3); }
        } else {
            if (k === '1' || k === 'arrowleft') { e.preventDefault(); this.practiceAnswer(false); }
            else if (k === '2' || k === 'arrowright') { e.preventDefault(); this.practiceAnswer(true); }
            else if (k === ' ' || k === 'enter') { e.preventDefault(); this.practiceAnswer(s.typed ? s.typed.suggest >= 3 : true); }
        }
    }
    async handleAction(action, el = {}, e) {
        const ds = el.dataset || {};
        switch (action) {
            case 'study': this.startStudy(ds.deck || null); break;
            case 'extra-new': this.startStudy(null, 10); break;
            case 'practice-all': this.startPractice(null, this.data.settings.answerMode, 20); break;
            case 'practice-deck': this.startPractice([ds.deck], this.data.settings.answerMode, 20); break;
            case 'practice-errors': {
                const ids = this.errorCards().map(c => c.id);
                if (!ids.length) { this.toast('Aucune erreur à retravailler 🎉', 'success'); break; }
                this.startPractice(null, this.data.settings.answerMode, 30, '🎯 Mes erreurs', ids);
                break;
            }
            case 'practice-missed': {
                const ids = (this.lastSession && this.lastSession.missed) || [];
                if (ids.length) this.startPractice(null, 'flip', 9999, '🎯 Erreurs de la session', ids);
                break;
            }
            case 'replay': {
                const r = this.lastSession && this.lastSession.replay;
                if (!r) { this.go('dashboard'); break; }
                if (r.kind === 'chrono') this.startQuizFromIds(r.pool, 0, r.duration, r.title);
                else this.startQuizFromIds(r.pool, r.total, 0, r.title);
                break;
            }
            case 'home': this.endSession(false); this.go('dashboard'); break;
            case 'mode': this.openModeLauncher(ds.mode, ds.deck); break;
            case 'new-card': this.openCardModal(null, ds.deck); break;
            case 'new-deck': this.openDeckModal(); break;
            case 'edit-deck': this.openDeckModal(ds.deck); break;
            case 'delete-deck': this.deleteDeck(ds.deck); break;
            case 'edit-card': this.openCardModal(ds.card); break;
            case 'delete-card': this.deleteCard(ds.card); break;
            case 'edit-current': if (this.session && this.session.current) this.openCardModal(this.session.current); break;
            case 'import': this.openImportModal(); break;
            case 'import-json': this.importJSON(); break;
            case 'export': this.exportJSON(); break;
            case 'open-deck': this.go('decks', { deck: ds.deck, filter: 'all' }); break;
            case 'select-deck': this.ui.deck = ds.deck; this.ui.limit = 60; this.renderDecks(); break;
            case 'filter': this.ui.filter = ds.filter; this.ui.limit = 60; this.renderDeckPanel(); break;
            case 'goto-filter': this.ui.search = ''; this.go('decks', { deck: 'all', filter: ds.filter }); break;
            case 'more': this.ui.limit += 100; this.renderDeckPanel(); break;
            case 'set': {
                const cur = this.data.settings[ds.key];
                const v = typeof cur === 'number' ? Number(ds.value) : ds.value;
                this.setSetting(ds.key, v);
                this.renderSettings();
                break;
            }
            case 'sync-now': Cloud.sync(true); break;
            case 'reset-progress': {
                const ok = await this.confirm({ title: 'Remettre la progression à zéro ?', message: 'Toutes les cartes redeviennent « nouvelles ». Tes cartes, tes images et ta série sont conservées.', ok: 'Remettre à zéro', danger: true });
                if (!ok) break;
                const now = Date.now();
                this.data.cards.forEach(c => Object.assign(c, { state: 'new', step: 0, interval: 0, ease: 2.5, due: now, reps: 0, lapses: 0, lastReview: null, errors: 0 }));
                this.data.stats.newSeen = { date: dayKey(), count: 0 };
                this.save(); this.render();
                this.toast('Progression remise à zéro', 'success');
                break;
            }
            case 'reset-all': {
                const ok = await this.confirm({ title: 'Tout réinitialiser ?', message: 'Tes paquets, cartes, images et statistiques seront effacés et remplacés par les cartes d\'origine. Pense à exporter une sauvegarde avant.', ok: 'Tout effacer', danger: true });
                if (!ok) break;
                const fresh = seedState();
                fresh.settings = Object.assign({}, this.data.settings);
                this.replaceData(fresh);
                this.save();
                this.toast('Application réinitialisée', 'success');
                break;
            }
            case 'quit-session': this.quitSession(); break;
            case 'reveal': this.reveal(); break;
            case 'submit-typed': this.submitTyped(); break;
            case 'grade': this.grade(Number(ds.grade)); break;
            case 'practice-answer': this.practiceAnswer(ds.ok === '1'); break;
            case 'undo': this.undo(); break;
            case 'speak': this.speak(); break;
            case 'hint': {
                const slot = $('#hint-slot');
                const c = this.session && this.session.current && this.card(this.session.current);
                if (slot && c && c.hint) { slot.innerHTML = slot.innerHTML ? '' : `<div class="hint-box rich">${c.hint}</div>`; }
                if (e) e.stopPropagation();
                break;
            }
            case 'detail': {
                const slot = $('#detail-slot');
                const c = this.session && this.session.current && this.card(this.session.current);
                if (slot && c) slot.innerHTML = slot.innerHTML ? '' : `<div class="detail-box rich">${c.detail}</div>`;
                break;
            }
            case 'quiz-answer': this.quizAnswer(Number(ds.i), el); break;
            case 'quiz-next': this.nextQuestion(); break;
            default: break;
        }
    }
    startQuizFromIds(ids, count, chrono, title) {
        const pool = (ids || []).filter(id => this.card(id));
        if (!pool.length) { this.go('dashboard'); return; }
        const s = {
            kind: chrono ? 'chrono' : 'quiz', title: chrono ? 'Chrono' : 'Quiz', pool: shuffle([...pool]),
            total: 0, index: 0, score: 0, answered: false, quizCard: null, options: [], missed: [], history: [],
            done: 0, correct: 0, startedAt: Date.now(), cardStart: Date.now(), duration: chrono, timeLeft: chrono, timer: null
        };
        s.queue = chrono ? [...s.pool] : s.pool.slice(0, count || s.pool.length);
        s.total = s.queue.length;
        if (title) s.title = title;
        this.session = s;
        this.go('session');
        this.nextQuestion();
        if (chrono) {
            s.timer = setInterval(() => {
                if (this.session !== s) { clearInterval(s.timer); return; }
                s.timeLeft--;
                this.updateChronoHud();
                if (s.timeLeft <= 0) this.finishChrono();
            }, 1000);
        }
    }
}

function interleave(reviews, news) {
    if (!news.length) return reviews;
    if (!reviews.length) return news;
    const out = [], every = reviews.length / (news.length + 1);
    let ri = 0;
    news.forEach((n, i) => {
        const upto = Math.round((i + 1) * every);
        while (ri < upto && ri < reviews.length) out.push(reviews[ri++]);
        out.push(n);
    });
    while (ri < reviews.length) out.push(reviews[ri++]);
    return out;
}

/* CSV / TXT parser: ; tab or , separators, quoted fields, Anki "#" headers */
function parseImport(text) {
    const lines = String(text || '').replace(/^﻿/, '').split(/\r\n|\n|\r/).filter(l => l.trim() && !/^#(separator|html|tags|columns|notetype|deck)/i.test(l.trim()));
    if (!lines.length) return [];
    const sample = lines.slice(0, 20);
    const sep = sample.some(l => l.includes('\t')) ? '\t' : sample.some(l => l.includes(';')) ? ';' : ',';
    const split = line => {
        const out = []; let cur = '', q = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (q) {
                if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
                else if (ch === '"') q = false;
                else cur += ch;
            } else if (ch === '"' && cur.trim() === '') { q = true; cur = ''; }
            else if (ch === sep) { out.push(cur); cur = ''; }
            else cur += ch;
        }
        out.push(cur);
        return out.map(s => s.trim());
    };
    const rows = [];
    lines.forEach(l => {
        const f = split(l);
        if (f.length < 2) return;
        const front = sanitizeHtml(f[0]), back = sanitizeHtml(f[1]);
        if (isBlank(front) || isBlank(back)) return;
        rows.push({ front, back, hint: f[2] ? sanitizeHtml(f[2]) : '' });
    });
    return rows;
}

const app = new SuperAnki();
window.app = app;
app.init().catch(err => {
    console.error(err);
    const boot = document.getElementById('boot');
    if (boot) boot.innerHTML = `Oups, le chargement a échoué : ${esc(err.message)}. <br><button class="btn btn-primary" style="margin-top:12px" onclick="location.reload()">Recharger</button>`;
});
