/* Zyklus – einfache, kostenlose Perioden-App (PWA)
 * Alle Daten liegen lokal auf dem Gerät. Optional wird eine verschlüsselte
 * Kopie (ohne private Notizen) für den/die Partner:in hochgeladen.
 */
(() => {
  "use strict";

  // ---------- Konstanten ----------
  const STORE_KEY = "zyklus.v1";
  const CFG = window.ZYKLUS_CONFIG || {};
  const SYNC_READY = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  const FLOWS = ["Keine", "Leicht", "Mittel", "Stark"];
  const SYMPTOMS = [
    "Krämpfe", "Kopfschmerzen", "Rückenschmerzen", "Blähungen", "Brustspannen",
    "Müdigkeit", "Übelkeit", "Unreine Haut", "Heißhunger", "Schlafprobleme",
    "Stimmungsschwankungen", "Ausfluss", "Lust ↑", "Lust ↓"
  ];
  const MOODS = [
    ["gut", "😊", "Gut"], ["ruhig", "😌", "Ruhig"], ["neutral", "😐", "Neutral"],
    ["traurig", "😢", "Traurig"], ["gereizt", "😤", "Gereizt"], ["aengstlich", "😰", "Ängstlich"],
    ["erschoepft", "😴", "Erschöpft"]
  ];
  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const DOW = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const DOW_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  const ICONS = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h6"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 20c.8-3 2.8-5 5-5s4.2 2 5 5M11 20c.8-3 2.8-5 5-5s4.2 2 5 5"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };

  // ---------- Helfer ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const todayKey = () => toKey(new Date());
  const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return toKey(d); };
  const utc = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const diffDays = (a, b) => Math.round((utc(b) - utc(a)) / 864e5); // b - a
  const fmtDate = (k, withDow = false) => {
    const d = parseKey(k);
    const s = `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
    return withDow ? `${DOW_LONG[d.getDay()]}, ${s}` : s;
  };
  const fmtShort = (k) => { const d = parseKey(k); return `${d.getDate()}.${d.getMonth() + 1}.`; };
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const randomToken = (bytes) => b64url(crypto.getRandomValues(new Uint8Array(bytes)));
  function b64url(buf) {
    let s = ""; const a = new Uint8Array(buf);
    for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromB64url(str) {
    const s = atob(str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4));
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // ---------- Zustand ----------
  function defaultState() {
    return {
      role: null, // "owner" | "partner"
      settings: { cycleLength: 28, periodLength: 5, name: "" },
      days: {},   // "YYYY-MM-DD": { flow, symptoms[], mood, notes[] }
      share: { enabled: false, id: null, key: null, secret: null, shareSymptoms: true, shareNotes: true, lastSync: null, error: null },
      partner: { id: null, key: null, data: null, fetched: null, error: null }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw); const d = defaultState();
      return { ...d, ...s, settings: { ...d.settings, ...s.settings }, share: { ...d.share, ...s.share }, partner: { ...d.partner, ...s.partner }, days: s.days || {} };
    } catch { return defaultState(); }
  }
  let state = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { toast("Speichern fehlgeschlagen – Speicher voll?"); }
  }

  const ui = { tab: "today", calMonth: null, noteFilter: "all", draftVis: "private" };

  function getDay(k) { return state.days[k] || { flow: 0, symptoms: [], mood: null, notes: [] }; }
  function setDay(k, patch) {
    const d = { ...getDay(k), ...patch };
    const empty = !d.flow && !d.symptoms.length && !d.mood && !d.notes.length;
    if (empty) delete state.days[k]; else state.days[k] = d;
    save(); scheduleSync();
  }

  // ---------- Zyklus-Berechnung ----------
  // Arbeitet nur mit einer Liste von Periodentagen, damit Besitzerin und Partner:in
  // exakt dieselbe Berechnung nutzen.
  function analyze(periodDays, settings) {
    const set = new Set(periodDays);
    const sorted = [...set].sort();
    const starts = sorted.filter((k) => !set.has(addDays(k, -1)) && !set.has(addDays(k, -2)));
    const lengths = [];
    for (let i = 1; i < starts.length; i++) {
      const d = diffDays(starts[i - 1], starts[i]);
      if (d >= 18 && d <= 60) lengths.push(d);
    }
    const recent = lengths.slice(-6);
    const cycleLength = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : settings.cycleLength;

    // Periodenlänge: zusammenhängende Tage ab Start (eine Lücke von 1 Tag erlaubt)
    const periodLens = starts.map((s) => {
      let last = 0;
      for (let i = 0; i < 14; i++) {
        if (set.has(addDays(s, i))) last = i + 1;
        else if (!set.has(addDays(s, i + 1))) break;
      }
      return last;
    }).filter((n) => n > 0);
    const recentPL = periodLens.slice(-6);
    const periodLength = recentPL.length ? Math.round(recentPL.reduce((a, b) => a + b, 0) / recentPL.length) : settings.periodLength;

    const today = todayKey();
    const lastStart = starts.length ? starts[starts.length - 1] : null;
    let nextStart = null, lateBy = 0, cycleDay = null;
    if (lastStart) {
      nextStart = addDays(lastStart, cycleLength);
      cycleDay = diffDays(lastStart, today) + 1;
      lateBy = Math.max(0, diffDays(nextStart, today));
    }
    const inPeriod = set.has(today);

    // Vorhersagen: kommende Perioden + fruchtbare Fenster
    const predStarts = [];
    if (nextStart) {
      let s = lateBy > 0 ? today : nextStart;
      for (let i = 0; i < 12; i++) { predStarts.push(s); s = addDays(s, cycleLength); }
    }
    const predicted = new Set(), fertile = new Set(), ovulation = new Set();
    for (const s of predStarts) {
      for (let i = 0; i < periodLength; i++) { const k = addDays(s, i); if (!set.has(k)) predicted.add(k); }
      const ov = addDays(s, -14);
      if (lastStart && diffDays(lastStart, ov) > periodLength - 1) {
        ovulation.add(ov);
        for (let i = -5; i <= 1; i++) { const k = addDays(ov, i); if (k !== ov && !set.has(k)) fertile.add(k); }
      }
    }

    let phase = null;
    if (lastStart) {
      const ovDay = cycleLength - 14;
      if (inPeriod) phase = { key: "period", name: "Periode", cls: "phase-period" };
      else if (lateBy > 0) phase = { key: "late", name: `Periode ${plural(lateBy, "Tag", "Tage")} überfällig`, cls: "phase-period" };
      else if (cycleDay === ovDay) phase = { key: "ovu", name: "Eisprung (geschätzt)", cls: "phase-fertile" };
      else if (cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1) phase = { key: "fertile", name: "Fruchtbare Tage", cls: "phase-fertile" };
      else if (cycleDay < ovDay - 5) phase = { key: "follicular", name: "Follikelphase", cls: "" };
      else phase = { key: "luteal", name: "Lutealphase", cls: "" };
    }
    const daysUntil = nextStart ? diffDays(today, nextStart) : null;
    return { set, starts, cycleLength, periodLength, lastStart, nextStart, cycleDay, lateBy, inPeriod, predicted, fertile, ovulation, phase, daysUntil, lengths };
  }

  const ownPeriodDays = () => Object.keys(state.days).filter((k) => state.days[k].flow > 0);
  const ownAnalysis = () => analyze(ownPeriodDays(), state.settings);

  const PHASE_TIPS = {
    period: "Wärme, Ruhe und Verständnis helfen jetzt oft am meisten. Eine Wärmflasche oder Tee kann gut tun.",
    late: "Die Periode ist später als erwartet. Das kann viele Gründe haben – Stress, Reisen, Krankheit.",
    follicular: "In dieser Phase steigt oft die Energie. Gute Zeit für gemeinsame Unternehmungen.",
    fertile: "Fruchtbares Fenster (geschätzt). Die App ist kein Verhütungsmittel!",
    ovu: "Eisprung um diesen Tag herum (geschätzt). Die App ist kein Verhütungsmittel!",
    luteal: "Vor der Periode können Müdigkeit, Heißhunger oder Stimmungsschwankungen auftreten. Etwas Extra-Rücksicht hilft."
  };

  // ---------- Rendering: Grundgerüst ----------
  const view = $("#view"), tabbar = $("#tabbar");

  function tabsFor(role) {
    if (role === "partner") return [["today", "Übersicht", ICONS.today], ["calendar", "Kalender", ICONS.cal], ["notes", "Notizen", ICONS.notes], ["settings", "Einstellungen", ICONS.settings]];
    return [["today", "Heute", ICONS.today], ["calendar", "Kalender", ICONS.cal], ["notes", "Notizen", ICONS.notes], ["share", "Partner", ICONS.share], ["settings", "Einstellungen", ICONS.settings]];
  }

  function render() {
    if (!state.role) { tabbar.hidden = true; view.classList.add("no-tabs"); view.innerHTML = renderWelcome(); return; }
    view.classList.remove("no-tabs");
    tabbar.hidden = false;
    const tabs = tabsFor(state.role);
    if (!tabs.some((t) => t[0] === ui.tab)) ui.tab = "today";
    tabbar.innerHTML = `<div class="tabbar-inner">${tabs.map(([id, label, icon]) =>
      `<button class="tab ${ui.tab === id ? "on" : ""}" data-action="tab" data-tab="${id}" aria-label="${label}">${icon}<span>${label}</span></button>`).join("")}</div>`;
    const R = state.role === "partner"
      ? { today: renderPartnerToday, calendar: renderCalendar, notes: renderPartnerNotes, settings: renderSettings }
      : { today: renderToday, calendar: renderCalendar, notes: renderNotes, share: renderShare, settings: renderSettings };
    view.innerHTML = R[ui.tab]();
  }

  // ---------- Willkommen ----------
  let welcomeStep = "choose";
  function renderWelcome() {
    if (welcomeStep === "owner") {
      return `<div class="welcome">
        <h1>Los geht's</h1>
        <p class="muted">Wann hat deine letzte Periode begonnen? Du kannst das auch überspringen und später im Kalender eintragen.</p>
        <div class="card">
          <label class="small muted">Erster Tag der letzten Periode</label>
          <input type="date" id="w-last" max="${todayKey()}">
          <div class="list" style="margin-top:14px">
            <div class="item"><span>Ø Zykluslänge (Tage)</span><input type="number" id="w-cycle" min="18" max="60" value="${state.settings.cycleLength}"></div>
            <div class="item"><span>Ø Periodenlänge (Tage)</span><input type="number" id="w-period" min="1" max="12" value="${state.settings.periodLength}"></div>
          </div>
        </div>
        <button class="btn primary block" data-action="welcome-owner-done">Fertig</button>
        <button class="btn ghost" data-action="welcome-back">Zurück</button>
      </div>`;
    }
    if (welcomeStep === "partner") {
      return `<div class="welcome">
        <h1>Partner:in verbinden</h1>
        <p class="muted">Gib den Freigabe-Code ein, den deine Partnerin dir in ihrer App unter „Partner“ geschickt hat.</p>
        <textarea id="w-code" placeholder="Freigabe-Code einfügen" autocapitalize="off" autocomplete="off" spellcheck="false" style="min-height:70px"></textarea>
        ${SYNC_READY ? "" : `<div class="info">Hinweis: Die Freigabe ist in dieser Installation noch nicht eingerichtet (config.js).</div>`}
        <button class="btn primary block" data-action="welcome-partner-done">Verbinden</button>
        <button class="btn ghost" data-action="welcome-back">Zurück</button>
      </div>`;
    }
    return `<div class="welcome">
      <img class="logo" src="icons/icon-192.png" alt="">
      <h1 class="center">Zyklus</h1>
      <p class="center muted">Einfach. Privat. Kostenlos.</p>
      <button class="choice" data-action="welcome-choose" data-role="owner"><strong>Ich tracke meinen Zyklus</strong><span>Periode, Symptome und Gedanken festhalten</span></button>
      <button class="choice" data-action="welcome-choose" data-role="partner"><strong>Ich bin Partner:in</strong><span>Den freigegebenen Zyklus ansehen</span></button>
      <p class="center muted small" style="margin-top:10px">Deine Daten bleiben auf deinem Gerät.</p>
    </div>`;
  }

  // ---------- Heute (Besitzerin) ----------
  function ringSvg(a) {
    const r = 92, c = 2 * Math.PI * r;
    if (!a.lastStart) return `<svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="${r}" fill="none" stroke="var(--line)" stroke-width="16"/></svg>`;
    const total = a.cycleLength;
    const day = Math.min(a.cycleDay, total);
    const seg = (from, len, color, w = 16) => {
      const l = (len / total) * c, o = (from / total) * c;
      return `<circle cx="110" cy="110" r="${r}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${l} ${c - l}" stroke-dashoffset="${-o}"/>`;
    };
    const ov = total - 14;
    const marker = ((day - 0.5) / total) * 2 * Math.PI;
    const mx = 110 + r * Math.cos(marker), my = 110 + r * Math.sin(marker);
    return `<svg viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="${r}" fill="none" stroke="var(--line)" stroke-width="16"/>
      ${seg(0, a.periodLength, "var(--period-soft)")}
      ${seg(Math.max(0, ov - 6), 7, "var(--fertile-soft)")}
      ${seg(ov - 1, 1, "var(--fertile)")}
      ${seg(0, day, a.lateBy > 0 || a.inPeriod ? "var(--period)" : "var(--accent)", 4)}
      <circle cx="${mx}" cy="${my}" r="11" fill="var(--card)" stroke="${a.inPeriod ? "var(--period)" : "var(--accent)"}" stroke-width="4"/>
    </svg>`;
  }

  function cycleSummary(a, who = "self") {
    if (!a.lastStart) {
      return `<div class="ring-wrap"><div class="ring">${ringSvg(a)}<div class="ring-center"><div class="lbl">${who === "self" ? "Trage den Beginn deiner Periode ein, um zu starten." : "Noch keine Periode eingetragen."}</div></div></div></div>`;
    }
    let big, lbl;
    if (a.inPeriod) { const d = diffDays(a.lastStart, todayKey()) + 1; big = d; lbl = `. Tag der Periode`; }
    else if (a.lateBy > 0) { big = a.lateBy; lbl = a.lateBy === 1 ? "Tag überfällig" : "Tage überfällig"; }
    else if (a.daysUntil === 0) { big = "Heute"; lbl = "beginnt die Periode (erwartet)"; }
    else { big = a.daysUntil; lbl = a.daysUntil === 1 ? "Tag bis zur Periode" : "Tage bis zur Periode"; }
    return `<div class="ring-wrap"><div class="ring">${ringSvg(a)}
      <div class="ring-center"><div class="big">${big}</div><div class="lbl">${lbl}</div>
      ${a.phase && a.phase.key !== "late" ? `<div class="phase ${a.phase.cls}">${a.phase.name}</div>` : ""}</div></div></div>
      <div class="stats">
        <div class="stat"><div class="v">${a.cycleDay}</div><div class="k">Zyklustag</div></div>
        <div class="stat"><div class="v">${fmtShort(a.lateBy > 0 ? todayKey() : a.nextStart)}</div><div class="k">Nächste Periode${a.lateBy > 0 ? " (bald)" : ""}</div></div>
        <div class="stat"><div class="v">${a.cycleLength} T.</div><div class="k">Ø Zykluslänge</div></div>
        <div class="stat"><div class="v">${a.periodLength} T.</div><div class="k">Ø Periodenlänge</div></div>
      </div>`;
  }

  function renderToday() {
    const a = ownAnalysis(), t = todayKey(), d = getDay(t);
    const greet = state.settings.name ? `Hallo ${esc(state.settings.name)}` : "Heute";
    const periodBtn = d.flow > 0
      ? `<button class="btn block" data-action="period-toggle" data-date="${t}">Heute keine Periode</button>`
      : `<button class="btn primary block" data-action="period-start">${a.set.has(addDays(t, -1)) ? "Periode heute eintragen" : "Periode hat heute begonnen"}</button>`;
    return `<div class="head"><h1>${greet}</h1></div>
      <div class="date-sub">${fmtDate(t, true)}</div>
      <div class="ipad-cols">
        <div class="card">${cycleSummary(a)}<div style="margin-top:14px">${periodBtn}</div></div>
        <div class="card"><h2>Wie geht es dir heute?</h2>${dayEditor(t, { showFlow: false })}</div>
      </div>`;
  }

  function dayEditor(k, { showFlow = true } = {}) {
    const d = getDay(k);
    return `
      ${showFlow ? `<h3>Blutung</h3><div class="seg">${FLOWS.map((f, i) => `<button class="${d.flow === i ? "on" : ""}" data-action="flow" data-date="${k}" data-v="${i}">${f}</button>`).join("")}</div>` : ""}
      <h3>Stimmung</h3>
      <div class="moods">${MOODS.map(([id, e, l]) => `<button class="mood ${d.mood === id ? "on" : ""}" data-action="mood" data-date="${k}" data-v="${id}"><span class="e">${e}</span>${l}</button>`).join("")}</div>
      <h3>Symptome</h3>
      <div class="chips">${SYMPTOMS.map((s) => `<button class="chip ${d.symptoms.includes(s) ? "on" : ""}" data-action="symptom" data-date="${k}" data-v="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <h3>Notizen & Gedanken</h3>
      ${d.notes.length ? `<div>${d.notes.map((n) => noteHtml(n, k, true)).join("")}</div>` : ""}
      <textarea id="note-input-${k}" placeholder="Was beschäftigt dich heute?"></textarea>
      <div class="note-tools">
        <div class="vis-toggle" role="group" aria-label="Sichtbarkeit">
          <button class="${ui.draftVis === "private" ? "on" : ""}" data-action="draft-vis" data-v="private">🔒 Privat</button>
          <button class="${ui.draftVis === "public" ? "on" : ""}" data-action="draft-vis" data-v="public">👥 Für Partner</button>
        </div>
        <button class="btn primary" data-action="note-add" data-date="${k}">Speichern</button>
      </div>`;
  }

  function noteHtml(n, k, editable, showDate = false) {
    const t = new Date(n.ts);
    return `<div class="note">
      <div class="note-meta">
        <span>${showDate ? fmtDate(k) + " · " : ""}${pad(t.getHours())}:${pad(t.getMinutes())}</span>
        <span>${editable
          ? `<button class="badge ${n.public ? "pub" : ""}" data-action="note-vis" data-date="${k}" data-id="${n.id}" title="Sichtbarkeit ändern">${n.public ? "👥 Für Partner" : "🔒 Privat"}</button>
             <button class="icon-btn" data-action="note-del" data-date="${k}" data-id="${n.id}" aria-label="Notiz löschen">Löschen</button>`
          : ""}</span>
      </div>
      <div class="note-text">${esc(n.text)}</div>
    </div>`;
  }

  // ---------- Kalender (beide Rollen) ----------
  function calendarSource() {
    if (state.role === "partner") {
      const p = state.partner.data;
      if (!p) return null;
      return { a: analyze(p.periodDays || [], p.settings || state.settings), hasEntry: (k) => !!((p.days && p.days[k]) || (p.notes || []).some((n) => n.date === k)) };
    }
    return { a: ownAnalysis(), hasEntry: (k) => { const d = state.days[k]; return !!d && (d.symptoms.length || d.mood || d.notes.length); } };
  }

  function renderCalendar() {
    const src = calendarSource();
    if (!src) return `<h1>Kalender</h1>${partnerEmpty()}`;
    const { a, hasEntry } = src;
    const base = ui.calMonth || todayKey().slice(0, 7);
    const [y, m] = base.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m, 0).getDate();
    const t = todayKey();
    let cells = "";
    for (let i = 0; i < startOffset; i++) cells += `<div class="cal-day out"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = `${y}-${pad(m)}-${pad(d)}`;
      const cls = [
        a.set.has(k) ? "period" : a.predicted.has(k) ? "pred" : a.ovulation.has(k) ? "ovu" : a.fertile.has(k) ? "fertile" : "",
        k === t ? "today" : ""
      ].join(" ");
      cells += `<button class="cal-day ${cls}" data-action="open-day" data-date="${k}" aria-label="${fmtDate(k)}">${d}${hasEntry(k) ? '<span class="dot"></span>' : ""}</button>`;
    }
    return `<h1>Kalender</h1>
      <div class="card">
        <div class="cal-head">
          <button class="btn" data-action="cal-nav" data-v="-1" aria-label="Vorheriger Monat">‹</button>
          <div class="cal-title">${MONTHS[m - 1]} ${y}</div>
          <button class="btn" data-action="cal-nav" data-v="1" aria-label="Nächster Monat">›</button>
        </div>
        <div class="cal-grid">${DOW.map((d) => `<div class="cal-dow">${d}</div>`).join("")}${cells}</div>
        <div class="legend">
          <span><i style="background:var(--period)"></i>Periode</span>
          <span><i style="border:2px dashed var(--period)"></i>Erwartet</span>
          <span><i style="background:var(--fertile-soft)"></i>Fruchtbar</span>
          <span><i style="background:var(--fertile)"></i>Eisprung</span>
        </div>
      </div>
      ${base !== t.slice(0, 7) ? `<button class="btn ghost block" data-action="cal-today">Zu heute springen</button>` : ""}
      <p class="muted small center">${state.role === "partner" ? "Tippe auf einen Tag für Details." : "Tippe auf einen Tag, um Periode, Symptome oder Notizen einzutragen."}</p>`;
  }

  function openDaySheet(k) {
    let html;
    if (state.role === "partner") {
      const p = state.partner.data || {};
      const info = (p.days || {})[k] || {};
      const notes = (p.notes || []).filter((n) => n.date === k);
      const flow = (p.periodDays || []).includes(k) ? (p.flows && p.flows[k]) || 2 : 0;
      const mood = MOODS.find((x) => x[0] === info.mood);
      html = `<h2>${fmtDate(k, true)}</h2>
        ${flow ? `<p><span class="badge" style="background:var(--period-soft);color:var(--period)">Periode · ${FLOWS[flow]}</span></p>` : ""}
        ${mood ? `<h3>Stimmung</h3><p>${mood[1]} ${mood[2]}</p>` : ""}
        ${info.symptoms && info.symptoms.length ? `<h3>Symptome</h3><div class="chips">${info.symptoms.map((s) => `<span class="chip static">${esc(s)}</span>`).join("")}</div>` : ""}
        ${notes.length ? `<h3>Notizen</h3>${notes.map((n) => noteHtml(n, k, false)).join("")}` : ""}
        ${!flow && !mood && !(info.symptoms || []).length && !notes.length ? `<p class="muted">Keine geteilten Einträge an diesem Tag.</p>` : ""}
        <button class="btn block" style="margin-top:16px" data-action="sheet-close">Schließen</button>`;
    } else {
      html = `<div class="head"><h2 style="margin:0">${fmtDate(k, true)}</h2><button class="btn ghost" data-action="sheet-close">Fertig</button></div>${dayEditor(k)}`;
    }
    const sheet = $("#sheet");
    sheet.dataset.date = k;
    sheet.innerHTML = `<div class="grab"></div>${html}`;
    sheet.hidden = false; $("#sheet-backdrop").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function refreshSheet() { const s = $("#sheet"); if (!s.hidden && s.dataset.date) openDaySheet(s.dataset.date); }
  function closeSheet() { $("#sheet").hidden = true; $("#sheet-backdrop").hidden = true; document.body.style.overflow = ""; render(); }

  // ---------- Notizen (Besitzerin) ----------
  function renderNotes() {
    const all = [];
    for (const k of Object.keys(state.days)) for (const n of state.days[k].notes) all.push({ k, n });
    all.sort((x, y) => y.n.ts - x.n.ts);
    const f = ui.noteFilter;
    const list = all.filter(({ n }) => f === "all" || (f === "public" ? n.public : !n.public));
    const fb = (id, l) => `<button class="chip ${f === id ? "on" : ""}" data-action="note-filter" data-v="${id}">${l}</button>`;
    return `<h1>Notizen</h1>
      <div class="filter">${fb("all", "Alle")}${fb("private", "🔒 Privat")}${fb("public", "👥 Für Partner")}</div>
      <div class="card">${list.length ? list.map(({ k, n }) => noteHtml(n, k, true, true)).join("") : `<div class="empty">Noch keine Notizen. Schreib unter „Heute“ deine Gedanken auf.</div>`}</div>
      <p class="muted small">🔒 Private Notizen verlassen nie dein Gerät. 👥 Notizen „Für Partner“ sieht dein:e Partner:in nur, wenn du das Teilen von Notizen erlaubst.</p>`;
  }

  // ---------- Partner-Freigabe (Besitzerin) ----------
  function shareCode() { return state.share.id && state.share.key ? `${state.share.id}.${state.share.key}` : ""; }

  function renderShare() {
    const s = state.share;
    if (!SYNC_READY) {
      return `<h1>Partner</h1><div class="card"><h2>Teilen noch nicht eingerichtet</h2>
        <p class="muted">Um deinen Zyklus mit deinem Partner zu teilen, muss einmalig ein kostenloser Supabase-Server in <code>config.js</code> eingetragen werden. Anleitung: README.md.</p></div>`;
    }
    if (!s.enabled) {
      return `<h1>Partner</h1>
        <div class="card"><h2>Zyklus mit Partner:in teilen</h2>
          <p class="muted">Dein:e Partner:in sieht dann deinen Zyklus, die nächste Periode und fruchtbare Tage. Du entscheidest, ob auch Symptome und Notizen „Für Partner“ sichtbar sind.</p>
          <p class="muted">Private Notizen werden niemals geteilt. Alles wird vor dem Hochladen auf deinem Gerät verschlüsselt.</p>
          <button class="btn primary block" data-action="share-enable">Teilen aktivieren</button>
        </div>`;
    }
    const sw = (id, on, label, sub) => `<div class="item"><div>${label}<div class="small muted">${sub}</div></div><label class="switch"><input type="checkbox" data-action="${id}" ${on ? "checked" : ""}><span></span></label></div>`;
    return `<h1>Partner</h1>
      <div class="card">
        <h2>Freigabe-Code</h2>
        <p class="muted small">Schick diesen Code an deine:n Partner:in. Er/sie wählt in der App „Ich bin Partner:in“ und fügt den Code ein.</p>
        <div class="code-box">${esc(shareCode())}</div>
        <div class="row"><button class="btn" data-action="share-copy">Kopieren</button>${navigator.share ? `<button class="btn" data-action="share-send">Senden…</button>` : ""}</div>
      </div>
      <div class="card list">
        <div class="item"><div>Zyklus & Periode<div class="small muted">Immer geteilt, solange die Freigabe aktiv ist</div></div><span class="badge pub">An</span></div>
        ${sw("share-symptoms", s.shareSymptoms, "Symptome & Stimmung", "Deine täglichen Symptome und Stimmung")}
        ${sw("share-notes", s.shareNotes, "Notizen „Für Partner“", "Private Notizen bleiben immer privat")}
      </div>
      <div class="card">
        <p class="small muted">${s.error ? `⚠️ ${esc(s.error)}` : s.lastSync ? `Zuletzt synchronisiert: ${new Date(s.lastSync).toLocaleString("de-DE")}` : "Noch nicht synchronisiert."}</p>
        <button class="btn block" data-action="share-sync">Jetzt synchronisieren</button>
        <button class="btn danger block" data-action="share-disable">Freigabe beenden & Code ungültig machen</button>
      </div>`;
  }

  function buildPayload() {
    const periodDays = [], flows = {}, days = {}, notes = [];
    for (const [k, d] of Object.entries(state.days)) {
      if (d.flow > 0) { periodDays.push(k); flows[k] = d.flow; }
      if (state.share.shareSymptoms && (d.symptoms.length || d.mood)) days[k] = { symptoms: d.symptoms, mood: d.mood };
      if (state.share.shareNotes) for (const n of d.notes) if (n.public) notes.push({ id: n.id, date: k, text: n.text, ts: n.ts, public: true });
    }
    return {
      v: 1, updated: Date.now(), name: state.settings.name || "",
      settings: { cycleLength: state.settings.cycleLength, periodLength: state.settings.periodLength },
      periodDays, flows, days, notes,
      sharesSymptoms: state.share.shareSymptoms, sharesNotes: state.share.shareNotes
    };
  }

  // ---------- Verschlüsselung (AES-GCM, Schlüssel nur im Code) ----------
  async function importKey(k) { return crypto.subtle.importKey("raw", fromB64url(k), "AES-GCM", false, ["encrypt", "decrypt"]); }
  async function encrypt(obj, k) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await importKey(k), new TextEncoder().encode(JSON.stringify(obj)));
    return JSON.stringify({ iv: b64url(iv), ct: b64url(ct) });
  }
  async function decrypt(str, k) {
    const { iv, ct } = JSON.parse(str);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64url(iv) }, await importKey(k), fromB64url(ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  async function rpc(fn, body) {
    const res = await fetch(`${CFG.supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const t = await res.text(); throw new Error(res.status === 400 && /forbidden/.test(t) ? "Keine Berechtigung" : `Serverfehler (${res.status})`); }
    const txt = await res.text();
    return txt ? JSON.parse(txt) : null;
  }

  let syncTimer = null;
  function scheduleSync() {
    if (state.role !== "owner" || !state.share.enabled || !SYNC_READY) return;
    clearTimeout(syncTimer); syncTimer = setTimeout(() => pushShare(), 1500);
  }
  async function pushShare(manual = false) {
    const s = state.share;
    try {
      const payload = await encrypt(buildPayload(), s.key);
      await rpc("push_share", { p_id: s.id, p_secret: s.secret, p_payload: payload });
      s.lastSync = Date.now(); s.error = null; save();
      if (manual) toast("Synchronisiert ✓");
    } catch (e) {
      s.error = navigator.onLine ? `Synchronisieren fehlgeschlagen: ${e.message}` : "Offline – wird später synchronisiert";
      save(); if (manual) toast(s.error);
    }
    if (ui.tab === "share") render();
  }

  // ---------- Partner-Ansicht ----------
  function parseCode(str) {
    let c = (str || "").trim();
    const m = c.match(/#join=([\w-]+\.[\w-]+)/); if (m) c = m[1];
    c = c.replace(/\s+/g, "");
    const [id, key] = c.split(".");
    if (!id || !key || id.length < 10 || key.length < 20) return null;
    return { id, key };
  }

  async function fetchPartner(manual = false) {
    const p = state.partner;
    if (!p.id || !SYNC_READY) return;
    try {
      const rows = await rpc("get_share", { p_id: p.id });
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row) { p.error = "Keine Daten gefunden – die Freigabe wurde evtl. beendet."; p.data = null; }
      else { p.data = await decrypt(row.payload, p.key); p.error = null; p.fetched = Date.now(); }
    } catch (e) {
      p.error = e.name === "OperationError" ? "Code ungültig (Entschlüsselung fehlgeschlagen)." : navigator.onLine ? `Laden fehlgeschlagen: ${e.message}` : "Offline – zeige zuletzt geladene Daten.";
    }
    save(); render();
    if (manual) toast(p.error || "Aktualisiert ✓");
  }

  function partnerEmpty() {
    const p = state.partner;
    return `<div class="card"><div class="empty">${p.error ? esc(p.error) : "Lade Daten…"}</div><button class="btn block" data-action="partner-refresh">Erneut versuchen</button></div>`;
  }

  function renderPartnerToday() {
    const p = state.partner.data;
    if (!p) return `<h1>Übersicht</h1>${partnerEmpty()}`;
    const a = analyze(p.periodDays || [], p.settings || state.settings);
    const t = todayKey();
    const info = (p.days || {})[t];
    const mood = info && MOODS.find((x) => x[0] === info.mood);
    const todayNotes = (p.notes || []).filter((n) => n.date === t);
    const who = p.name ? esc(p.name) : "Deine Partnerin";
    return `<h1>${p.name ? `${who}s Zyklus` : "Übersicht"}</h1>
      <div class="date-sub">${fmtDate(t, true)}</div>
      <div class="ipad-cols">
        <div class="card">${cycleSummary(a, "partner")}</div>
        <div>
          ${a.phase ? `<div class="card"><h2>Gut zu wissen</h2><div class="tip">${PHASE_TIPS[a.phase.key]}</div></div>` : ""}
          <div class="card"><h2>Heute</h2>
            ${p.sharesSymptoms === false ? `<p class="muted">${who} teilt keine Symptome.</p>` :
              (mood || (info && info.symptoms.length)) ? `${mood ? `<p>${mood[1]} ${mood[2]}</p>` : ""}${info && info.symptoms.length ? `<div class="chips">${info.symptoms.map((s) => `<span class="chip static">${esc(s)}</span>`).join("")}</div>` : ""}` : `<p class="muted">Heute noch nichts eingetragen.</p>`}
            ${todayNotes.length ? `<h3>Notizen</h3>${todayNotes.map((n) => noteHtml(n, t, false)).join("")}` : ""}
          </div>
        </div>
      </div>
      <p class="muted small center">${state.partner.fetched ? `Stand: ${new Date(p.updated || state.partner.fetched).toLocaleString("de-DE")}` : ""}${state.partner.error ? ` · ${esc(state.partner.error)}` : ""}</p>
      <button class="btn ghost block" data-action="partner-refresh">Aktualisieren</button>`;
  }

  function renderPartnerNotes() {
    const p = state.partner.data;
    if (!p) return `<h1>Notizen</h1>${partnerEmpty()}`;
    if (p.sharesNotes === false) return `<h1>Notizen</h1><div class="card"><div class="empty">${p.name ? esc(p.name) : "Deine Partnerin"} teilt aktuell keine Notizen.</div></div>`;
    const notes = [...(p.notes || [])].sort((a, b) => b.ts - a.ts);
    return `<h1>Notizen</h1><div class="card">${notes.length ? notes.map((n) => noteHtml(n, n.date, false, true)).join("") : `<div class="empty">Noch keine geteilten Notizen.</div>`}</div>`;
  }

  // ---------- Einstellungen ----------
  function renderSettings() {
    if (state.role === "partner") {
      return `<h1>Einstellungen</h1>
        <div class="card"><h2>Verbindung</h2><p class="muted small">Verbunden mit Code <code>${esc((state.partner.id || "").slice(0, 6))}…</code></p>
          <button class="btn block" data-action="partner-refresh">Daten aktualisieren</button></div>
        <div class="card"><button class="btn danger block" data-action="reset">Verbindung trennen & App zurücksetzen</button></div>
        ${aboutCard()}`;
    }
    const s = state.settings;
    return `<h1>Einstellungen</h1>
      <div class="card list">
        <div class="item"><span>Dein Name (optional)</span><input type="text" data-action="set-name" value="${esc(s.name)}" placeholder="Name" style="max-width:180px"></div>
        <div class="item"><div>Ø Zykluslänge<div class="small muted">Wird nach 2+ Zyklen automatisch berechnet</div></div><input type="number" min="18" max="60" data-action="set-cycle" value="${s.cycleLength}"></div>
        <div class="item"><span>Ø Periodenlänge</span><input type="number" min="1" max="12" data-action="set-period" value="${s.periodLength}"></div>
      </div>
      <div class="card"><h2>Datensicherung</h2>
        <p class="muted small">Deine Daten liegen nur auf diesem Gerät. Exportiere sie ab und zu als Sicherung (z. B. in die Dateien-App).</p>
        <div class="row"><button class="btn" data-action="export">Exportieren</button><button class="btn" data-action="import">Importieren</button></div>
        <input type="file" id="import-file" accept="application/json,.json" hidden>
      </div>
      <div class="card"><button class="btn danger block" data-action="reset">Alle Daten löschen</button></div>
      ${aboutCard()}`;
  }
  function aboutCard() {
    return `<div class="card"><h2>Über Zyklus</h2>
      <p class="muted small">Kostenlos, ohne Werbung, ohne Konto. Vorhersagen sind Schätzungen auf Basis deiner Einträge und ersetzen keine ärztliche Beratung. Diese App ist <strong>kein Verhütungsmittel</strong>.</p></div>`;
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2400);
  }

  // ---------- Aktionen ----------
  function rerender() { render(); refreshSheet(); }

  const actions = {
    tab: (el) => { ui.tab = el.dataset.tab; render(); window.scrollTo(0, 0); if (state.role === "partner" && ui.tab !== "settings") fetchPartner(); },
    "welcome-choose": (el) => { welcomeStep = el.dataset.role; render(); },
    "welcome-back": () => { welcomeStep = "choose"; render(); },
    "welcome-owner-done": () => {
      const last = $("#w-last").value;
      const cl = clamp(+$("#w-cycle").value, 18, 60, 28), pl = clamp(+$("#w-period").value, 1, 12, 5);
      state.settings.cycleLength = cl; state.settings.periodLength = pl;
      if (last && last <= todayKey()) for (let i = 0; i < pl; i++) { const k = addDays(last, i); if (k <= todayKey()) state.days[k] = { ...getDay(k), flow: 2 }; }
      state.role = "owner"; save(); render();
    },
    "welcome-partner-done": () => {
      const c = parseCode($("#w-code").value);
      if (!c) return toast("Der Code sieht nicht richtig aus.");
      state.partner = { ...state.partner, ...c, data: null, error: null };
      state.role = "partner"; ui.tab = "today"; save(); render(); fetchPartner();
    },
    "period-start": () => {
      const t = todayKey(), pl = ownAnalysis().periodLength;
      setDay(t, { flow: getDay(t).flow || 2 });
      toast(`Periode eingetragen. Trage die nächsten ~${pl} Tage im Kalender oder hier ein.`);
      render();
    },
    "period-toggle": (el) => { const k = el.dataset.date; setDay(k, { flow: getDay(k).flow ? 0 : 2 }); rerender(); },
    flow: (el) => { setDay(el.dataset.date, { flow: +el.dataset.v }); rerender(); },
    mood: (el) => { const k = el.dataset.date, d = getDay(k); setDay(k, { mood: d.mood === el.dataset.v ? null : el.dataset.v }); keepScroll(rerender); },
    symptom: (el) => {
      const k = el.dataset.date, v = el.dataset.v, d = getDay(k);
      setDay(k, { symptoms: d.symptoms.includes(v) ? d.symptoms.filter((s) => s !== v) : [...d.symptoms, v] });
      keepScroll(rerender);
    },
    "draft-vis": (el) => {
      ui.draftVis = el.dataset.v;
      document.querySelectorAll('[data-action="draft-vis"]').forEach((b) => b.classList.toggle("on", b.dataset.v === ui.draftVis));
    },
    "note-add": (el) => {
      const k = el.dataset.date, input = document.getElementById(`note-input-${k}`);
      const text = (input?.value || "").trim();
      if (!text) return toast("Schreib zuerst etwas.");
      const d = getDay(k);
      setDay(k, { notes: [...d.notes, { id: uid(), text, public: ui.draftVis === "public", ts: Date.now() }] });
      toast(ui.draftVis === "public" ? "Notiz gespeichert (für Partner sichtbar)" : "Private Notiz gespeichert 🔒");
      keepScroll(rerender);
    },
    "note-vis": (el) => {
      const k = el.dataset.date, d = getDay(k);
      setDay(k, { notes: d.notes.map((n) => n.id === el.dataset.id ? { ...n, public: !n.public } : n) });
      keepScroll(rerender);
    },
    "note-del": (el) => {
      if (!confirm("Diese Notiz löschen?")) return;
      const k = el.dataset.date, d = getDay(k);
      setDay(k, { notes: d.notes.filter((n) => n.id !== el.dataset.id) });
      keepScroll(rerender);
    },
    "note-filter": (el) => { ui.noteFilter = el.dataset.v; render(); },
    "open-day": (el) => openDaySheet(el.dataset.date),
    "sheet-close": closeSheet,
    "cal-nav": (el) => {
      const [y, m] = (ui.calMonth || todayKey().slice(0, 7)).split("-").map(Number);
      const d = new Date(y, m - 1 + +el.dataset.v, 1);
      ui.calMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; render();
    },
    "cal-today": () => { ui.calMonth = null; render(); },
    "share-enable": async () => {
      Object.assign(state.share, { enabled: true, id: randomToken(9), key: randomToken(16), secret: randomToken(24), error: null });
      save(); render(); await pushShare(true);
    },
    "share-disable": async () => {
      if (!confirm("Freigabe beenden? Dein:e Partner:in kann deinen Zyklus dann nicht mehr sehen.")) return;
      const { id, secret } = state.share;
      try { await rpc("delete_share", { p_id: id, p_secret: secret }); } catch { toast("Server nicht erreichbar – Code wurde lokal entfernt."); }
      Object.assign(state.share, { enabled: false, id: null, key: null, secret: null, lastSync: null, error: null });
      save(); render();
    },
    "share-copy": async () => {
      try { await navigator.clipboard.writeText(shareCode()); toast("Code kopiert"); } catch { toast("Bitte Code markieren und kopieren"); }
    },
    "share-send": async () => {
      try { await navigator.share({ title: "Zyklus-Freigabe", text: `Mein Freigabe-Code für die Zyklus-App:\n${shareCode()}` }); } catch { /* abgebrochen */ }
    },
    "share-sync": () => pushShare(true),
    "partner-refresh": () => fetchPartner(true),
    export: () => {
      const blob = new Blob([JSON.stringify({ app: "zyklus", v: 1, exported: new Date().toISOString(), settings: state.settings, days: state.days }, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `zyklus-backup-${todayKey()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    import: () => $("#import-file").click(),
    reset: () => {
      if (!confirm(state.role === "partner" ? "Verbindung trennen und App zurücksetzen?" : "Wirklich ALLE Daten auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.")) return;
      if (state.role === "owner" && state.share.enabled && SYNC_READY) rpc("delete_share", { p_id: state.share.id, p_secret: state.share.secret }).catch(() => {});
      state = defaultState(); save(); welcomeStep = "choose"; ui.tab = "today"; render();
    }
  };

  function clamp(v, lo, hi, def) { return Number.isFinite(v) && v >= lo && v <= hi ? Math.round(v) : def; }
  function keepScroll(fn) {
    const y = window.scrollY, sheet = $("#sheet"), sy = sheet.scrollTop; fn();
    window.scrollTo(0, y); sheet.scrollTop = sy;
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || el.tagName === "INPUT") return;
    const fn = actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el); }
  });
  $("#sheet-backdrop").addEventListener("click", closeSheet);

  document.addEventListener("change", (e) => {
    const el = e.target, a = el.dataset.action;
    if (a === "share-symptoms") { state.share.shareSymptoms = el.checked; save(); scheduleSync(); }
    else if (a === "share-notes") { state.share.shareNotes = el.checked; save(); scheduleSync(); }
    else if (a === "set-name") { state.settings.name = el.value.trim().slice(0, 40); save(); scheduleSync(); }
    else if (a === "set-cycle") { state.settings.cycleLength = clamp(+el.value, 18, 60, state.settings.cycleLength); el.value = state.settings.cycleLength; save(); scheduleSync(); }
    else if (a === "set-period") { state.settings.periodLength = clamp(+el.value, 1, 12, state.settings.periodLength); el.value = state.settings.periodLength; save(); scheduleSync(); }
    else if (el.id === "import-file" && el.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (data.app !== "zyklus" || typeof data.days !== "object") throw new Error();
          if (!confirm("Backup importieren? Vorhandene Einträge an denselben Tagen werden überschrieben.")) return;
          state.days = { ...state.days, ...data.days };
          if (data.settings) state.settings = { ...state.settings, ...data.settings };
          save(); scheduleSync(); render(); toast("Backup importiert ✓");
        } catch { toast("Datei ist kein gültiges Zyklus-Backup."); }
      };
      r.readAsText(el.files[0]); el.value = "";
    }
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#sheet").hidden) closeSheet(); });

  // Aktualisieren, wenn die App wieder in den Vordergrund kommt (z. B. neuer Tag)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !state.role) return;
    if (state.role === "partner") fetchPartner(); else render();
  });
  window.addEventListener("online", () => { if (state.role === "owner" && state.share.error) scheduleSync(); });

  // Einladungslink #join=ID.KEY
  const join = parseCode(location.hash);
  if (join && state.role !== "owner") {
    state.partner = { ...state.partner, ...join, data: null, error: null };
    state.role = "partner"; save(); history.replaceState(null, "", location.pathname);
  }

  render();
  if (state.role === "partner") fetchPartner();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
