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
  const I18N = window.ZYKLUS_I18N;
  const SYMPTOMS = window.ZYKLUS_SYMPTOMS;
  const SYMPTOM_GROUPS = window.ZYKLUS_SYMPTOM_GROUPS;
  const PRIVATE_GROUPS = new Set(SYMPTOM_GROUPS.filter((g) => g.private).map((g) => g.key));
  const isPrivateSymptom = (id) => { const s = SYMPTOMS.find((x) => x.id === id); return !!s && PRIVATE_GROUPS.has(s.group); };
  // Eigene Einträge werden als "eigen:Name" gespeichert
  const CUSTOM_PREFIX = "eigen:";
  const isCustom = (id) => String(id).startsWith(CUSTOM_PREFIX);
  const customName = (id) => String(id).slice(CUSTOM_PREFIX.length);
  const MOODS = [
    ["gut", "😊"], ["energie", "⚡"], ["ruhig", "😌"], ["neutral", "😐"], ["traurig", "😢"],
    ["gereizt", "😤"], ["aengstlich", "😰"], ["erschoepft", "😴"]
  ];

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

  // ---------- Stimmungen: alte Einträge (eine Stimmung) in das neue Format (Liste) ----------
  const moodsOf = (d) => {
    if (!d) return [];
    if (Array.isArray(d.moods)) return d.moods;
    return d.mood ? [d.mood] : [];
  };
  function normalizeDay(d) {
    const { mood, ...rest } = d || {};
    return { flow: rest.flow || 0, symptoms: rest.symptoms || [], notes: rest.notes || [], ...rest, moods: moodsOf(d) };
  }
  const normalizeDays = (days) => Object.fromEntries(Object.entries(days || {}).map(([k, d]) => [k, normalizeDay(d)]));

  // ---------- Zustand ----------
  function defaultState() {
    return {
      role: null, // "owner" | "partner"
      prefs: { lang: null, theme: "system", festive: true }, // lang null = Gerätesprache
      settings: { cycleLength: 28, periodLength: 5, name: "" },
      days: {},   // "YYYY-MM-DD": { flow, symptoms[], moods[], notes[] }
      custom: [], // eigene Symptom-Einträge (Namen)
      share: { enabled: false, id: null, key: null, secret: null, shareSymptoms: true, shareNotes: true, shareSex: false, lastSync: null, error: null },
      partner: { id: null, key: null, data: null, fetched: null, error: null }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw); const d = defaultState();
      return { ...d, ...s, prefs: { ...d.prefs, ...s.prefs }, settings: { ...d.settings, ...s.settings }, share: { ...d.share, ...s.share }, partner: { ...d.partner, ...s.partner }, days: normalizeDays(s.days), custom: Array.isArray(s.custom) ? s.custom : [] };
    } catch { return defaultState(); }
  }
  let state = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { toast(t("saveFailed")); }
  }

  const ui = { tab: "today", calMonth: null, noteFilter: "all", draftVis: "private", drafts: {}, symQuery: "" };

  function getDay(k) { return state.days[k] || { flow: 0, symptoms: [], moods: [], notes: [] }; }
  function setDay(k, patch) {
    const d = { ...getDay(k), ...patch };
    const empty = !d.flow && !d.symptoms.length && !d.moods.length && !d.notes.length;
    if (empty) delete state.days[k]; else state.days[k] = d;
    save(); scheduleSync();
  }

  // ---------- Sprache ----------
  const lang = () => state.prefs.lang || ((navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en");
  const dict = () => I18N[lang()];
  function t(key, vars) {
    const s = dict()[key] ?? I18N.de[key] ?? key;
    return vars ? String(s).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "") : s;
  }
  // Fehler werden als Schlüssel gespeichert, damit sie der gewählten Sprache folgen
  function errMsg(e) {
    if (!e) return "";
    const i = e.indexOf("|"), key = i < 0 ? e : e.slice(0, i);
    return dict()[key] ? t(key, { detail: i < 0 ? "" : e.slice(i + 1) }) : e;
  }
  const fmtDate = (k, withDow = false) => {
    const d = parseKey(k), month = t("months")[d.getMonth()];
    const s = lang() === "de" ? `${d.getDate()}. ${month}` : `${month} ${d.getDate()}`;
    return withDow ? `${t("dowLong")[d.getDay()]}, ${s}` : s;
  };
  const fmtShort = (k) => {
    const d = parseKey(k);
    return lang() === "de" ? `${d.getDate()}.${d.getMonth() + 1}.` : `${t("months")[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  };
  const fmtTime = (ts) => new Date(ts).toLocaleString(t("locale"));
  const moodLabel = (id) => t(`mood.${id}`);
  const symptomLabel = (id) => {
    if (isCustom(id)) return esc(customName(id));
    const s = SYMPTOMS.find((x) => x.id === id); return s ? t(`sym.${s.key}`) : esc(id);
  };
  const symptomArt = (id) => {
    if (isCustom(id)) return window.ZYKLUS_CUSTOM_ART(customName(id));
    const s = SYMPTOMS.find((x) => x.id === id); return s ? s.art : "";
  };

  // ---------- Design ----------
  function applyTheme() {
    const theme = state.prefs.theme, root = document.documentElement;
    if (theme === "light" || theme === "dark") root.dataset.theme = theme; else delete root.dataset.theme;
    const fest = festive();
    if (fest) root.dataset.festive = "1"; else delete root.dataset.festive;
    const lightBg = fest ? "#fbf5e9" : "#fbf7f8", darkBg = fest ? "#0d211b" : "#17131a";
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length === 2) {
      metas[0].content = theme === "dark" ? darkBg : lightBg;
      metas[1].content = theme === "light" ? lightBg : darkBg;
    }
    updateSnow(fest);
  }
  const festive = () => state.prefs.festive !== false;
  function updateSnow(on) {
    let snow = $("#snow");
    if (!on) { if (snow) snow.remove(); return; }
    if (snow) return;
    snow = document.createElement("div");
    snow.id = "snow"; snow.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 18; i++) {
      const f = document.createElement("i"), size = 3 + (i * 7) % 5;
      f.style.cssText = `left:${(i * 37 + 5) % 100}%;width:${size}px;height:${size}px;animation-duration:${9 + (i * 5) % 8}s;animation-delay:-${(i * 3) % 13}s`;
      snow.appendChild(f);
    }
    document.body.appendChild(snow);
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
      if (inPeriod) phase = { key: "period", cls: "phase-period" };
      else if (lateBy > 0) phase = { key: "late", cls: "phase-period" };
      else if (cycleDay === ovDay) phase = { key: "ovu", cls: "phase-fertile" };
      else if (cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1) phase = { key: "fertile", cls: "phase-fertile" };
      else if (cycleDay < ovDay - 5) phase = { key: "follicular", cls: "" };
      else phase = { key: "luteal", cls: "" };
    }
    const daysUntil = nextStart ? diffDays(today, nextStart) : null;
    return { set, starts, cycleLength, periodLength, lastStart, nextStart, cycleDay, lateBy, inPeriod, predicted, fertile, ovulation, phase, daysUntil, lengths };
  }

  const ownPeriodDays = () => Object.keys(state.days).filter((k) => state.days[k].flow > 0);
  const ownAnalysis = () => analyze(ownPeriodDays(), state.settings);

  // ---------- Rendering: Grundgerüst ----------
  const view = $("#view"), tabbar = $("#tabbar");

  function tabsFor(role) {
    if (role === "partner") return [["today", t("tab.overview"), ICONS.today], ["calendar", t("tab.calendar"), ICONS.cal], ["notes", t("tab.notes"), ICONS.notes], ["settings", t("tab.settings"), ICONS.settings]];
    return [["today", t("tab.today"), ICONS.today], ["calendar", t("tab.calendar"), ICONS.cal], ["notes", t("tab.notes"), ICONS.notes], ["share", t("tab.partner"), ICONS.share], ["settings", t("tab.settings"), ICONS.settings]];
  }

  function render() {
    document.documentElement.lang = lang();
    if (!state.role) { tabbar.hidden = true; view.classList.add("no-tabs"); view.innerHTML = renderWelcome(); return; }
    view.classList.remove("no-tabs");
    tabbar.hidden = false;
    const tabs = tabsFor(state.role);
    if (!tabs.some((x) => x[0] === ui.tab)) ui.tab = "today";
    tabbar.innerHTML = `<div class="tabbar-inner">${tabs.map(([id, label, icon]) =>
      `<button class="tab ${ui.tab === id ? "on" : ""}" data-action="tab" data-tab="${id}" aria-label="${label}">${icon}<span>${label}</span></button>`).join("")}</div>`;
    const R = state.role === "partner"
      ? { today: renderPartnerToday, calendar: renderCalendar, notes: renderPartnerNotes, settings: renderSettings }
      : { today: renderToday, calendar: renderCalendar, notes: renderNotes, share: renderShare, settings: renderSettings };
    view.innerHTML = R[ui.tab]();
    filterPickers();
  }

  function langSwitch(cls = "") {
    const l = lang();
    return `<div class="seg two ${cls}" role="group" aria-label="${t("language")}">
      <button class="${l === "de" ? "on" : ""}" data-action="set-lang" data-v="de" aria-pressed="${l === "de"}">Deutsch</button>
      <button class="${l === "en" ? "on" : ""}" data-action="set-lang" data-v="en" aria-pressed="${l === "en"}">English</button>
    </div>`;
  }

  // ---------- Willkommen ----------
  let welcomeStep = "choose";
  function renderWelcome() {
    if (welcomeStep === "owner") {
      return `<div class="welcome">
        <h1>${t("letsGo")}</h1>
        <p class="muted">${t("lastPeriodQ")}</p>
        <div class="card">
          <label class="small muted">${t("lastPeriodDay")}</label>
          <input type="date" id="w-last" max="${todayKey()}">
          <div class="list" style="margin-top:14px">
            <div class="item"><span>${t("avgCycleDays")}</span><input type="number" id="w-cycle" min="18" max="60" value="${state.settings.cycleLength}"></div>
            <div class="item"><span>${t("avgPeriodDays")}</span><input type="number" id="w-period" min="1" max="12" value="${state.settings.periodLength}"></div>
          </div>
        </div>
        <button class="btn primary block" data-action="welcome-owner-done">${t("done")}</button>
        <button class="btn ghost" data-action="welcome-back">${t("back")}</button>
      </div>`;
    }
    if (welcomeStep === "partner") {
      return `<div class="welcome">
        <h1>${t("connectPartner")}</h1>
        <p class="muted">${t("connectText")}</p>
        <textarea id="w-code" placeholder="${t("codePlaceholder")}" autocapitalize="off" autocomplete="off" spellcheck="false" style="min-height:70px"></textarea>
        ${SYNC_READY ? "" : `<div class="info">${t("syncMissing")}</div>`}
        <button class="btn primary block" data-action="welcome-partner-done">${t("connect")}</button>
        <button class="btn ghost" data-action="welcome-back">${t("back")}</button>
      </div>`;
    }
    return `<div class="welcome">
      <img class="logo" src="icons/icon-192.png" alt="">
      <h1 class="center">Zyklus</h1>
      <p class="center muted">${t("tagline")}</p>
      <button class="choice" data-action="welcome-choose" data-role="owner"><strong>${t("chooseOwner")}</strong><span>${t("chooseOwnerSub")}</span></button>
      <button class="choice" data-action="welcome-choose" data-role="partner"><strong>${t("choosePartner")}</strong><span>${t("choosePartnerSub")}</span></button>
      <p class="center muted small" style="margin-top:10px">${t("localOnly")}</p>
      ${langSwitch("lang-switch")}
    </div>`;
  }

  // ---------- Heute (Besitzerin) ----------
  function ringSvg(a) {
    const fest = festive(), r = fest ? 79 : 92, band = fest ? 13 : 16, c = 2 * Math.PI * r;
    const deco = fest ? wreathSvg() : "";
    if (!a.lastStart) return `<svg viewBox="0 0 220 220">${deco}<circle cx="110" cy="110" r="${r}" fill="none" stroke="var(--line)" stroke-width="${band}"/>${fest ? bowSvg() : ""}</svg>`;
    const total = a.cycleLength;
    const day = Math.min(a.cycleDay, total);
    const seg = (from, len, color, w = band) => {
      const l = (len / total) * c, o = (from / total) * c;
      return `<circle cx="110" cy="110" r="${r}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${l} ${c - l}" stroke-dashoffset="${-o}"/>`;
    };
    const ov = total - 14;
    const marker = ((day - 0.5) / total) * 2 * Math.PI;
    const mx = 110 + r * Math.cos(marker), my = 110 + r * Math.sin(marker);
    const marker2 = fest
      ? `<g transform="translate(${mx} ${my}) rotate(90)"><path d="M0-13 3.8-4.3 13-4 5.6 2 8 11 0 5.9-8 11-5.6 2-13-4-3.8-4.3z" fill="var(--gold)" stroke="var(--card)" stroke-width="2" stroke-linejoin="round"/></g>`
      : `<circle cx="${mx}" cy="${my}" r="11" fill="var(--card)" stroke="${a.inPeriod ? "var(--period)" : "var(--accent)"}" stroke-width="4"/>`;
    return `<svg viewBox="0 0 220 220">
      ${deco}
      <circle cx="110" cy="110" r="${r}" fill="none" stroke="var(--line)" stroke-width="${band}"/>
      ${seg(0, a.periodLength, "var(--period-soft)")}
      ${seg(Math.max(0, ov - 6), 7, "var(--fertile-soft)")}
      ${seg(ov - 1, 1, "var(--fertile)")}
      ${seg(0, day, a.lateBy > 0 || a.inPeriod ? "var(--period)" : "var(--accent)", 4)}
      ${fest ? bowSvg() : ""}
      ${marker2}
    </svg>`;
  }

  // ---------- Weihnachtsdeko ----------
  function wreathSvg() {
    const colors = ["#1f6b4a", "#2f8a5f", "#174f38"];
    let out = "";
    for (let i = 0; i < 46; i++) {
      const deg = i * 360 / 46, rad = i % 2 ? 94 : 100;
      out += `<ellipse cx="${rad}" cy="0" rx="9" ry="3.8" fill="${colors[i % 3]}" transform="translate(110 110) rotate(${deg}) rotate(35 ${rad} 0)"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const a = (i * 40 + 12) * Math.PI / 180;
      out += `<circle cx="${110 + 97 * Math.cos(a)}" cy="${110 + 97 * Math.sin(a)}" r="3.3" fill="#d62839" stroke="#fff" stroke-opacity=".55" stroke-width=".7"/>`;
    }
    return out;
  }
  // Die Ring-Grafik ist um -90° gedreht, die Schleife wird deshalb zurückgedreht
  const bowSvg = () => `<g transform="rotate(90 110 110) translate(110 208) scale(.68)"><path d="M0 3l-7 13 7-3 7 3z" fill="#a51d2d"/><path d="M0 0c-7-9-20-9-20 0s13 9 20 0zM0 0c7-9 20-9 20 0s-13 9-20 0z" fill="#d62839" stroke="#fff" stroke-opacity=".45"/><circle r="4.5" fill="#a51d2d"/></g>`;

  function festiveBanner() {
    if (!festive()) return "";
    const day = todayKey(), [y, m, d] = day.split("-").map(Number);
    if (m < 11 || (m === 12 && d > 26)) return "";
    const n = diffDays(day, `${y}-12-24`);
    const title = n > 1 ? t("xmasDays", { n }) : n === 1 ? t("xmasOne") : t("xmasEve");
    const colors = ["#ff5f6d", "#ffd166", "#6ee7b7", "#7cc4ff"];
    const bulbs = Array.from({ length: 12 }, (_, i) => {
      const x = 14 + i * 28, yy = 6 + 9 * Math.abs(Math.sin((i + .5) * Math.PI / 3));
      return `<circle class="bulb" style="animation-delay:${(i % 4) * .45}s" cx="${x}" cy="${yy + 4}" r="4" fill="${colors[i % 4]}"/>`;
    }).join("");
    return `<div class="xmas-banner">
      <svg class="xmas-lights" viewBox="0 0 336 26" aria-hidden="true"><path d="M0 4q28 18 56 0t56 0 56 0 56 0 56 0 56 0" fill="none" stroke="#e7d7a8" stroke-opacity=".7" stroke-width="1.4"/>${bulbs}</svg>
      <div class="xmas-body">
        <svg viewBox="0 0 48 56" aria-hidden="true"><path d="M24 6l14 17h-7l11 13h-8l10 12H4l10-12H6l11-13h-7z" fill="#3fa877"/><rect x="20" y="48" width="8" height="7" rx="1.5" fill="#9a6a3f"/><path d="M24 0l2 4.5 5 .4-3.8 3.2 1.2 4.9-4.4-2.6-4.4 2.6 1.2-4.9L17 4.9l5-.4z" fill="#ffd166"/><circle cx="19" cy="27" r="2.4" fill="#ff5f6d"/><circle cx="31" cy="34" r="2.4" fill="#ffd166"/><circle cx="16" cy="42" r="2.4" fill="#7cc4ff"/><circle cx="33" cy="44" r="2.4" fill="#ff5f6d"/></svg>
        <div><strong>${title}</strong><span>${t("xmasSub")}</span></div>
      </div>
    </div>`;
  }

  function cycleSummary(a, who = "self") {
    if (!a.lastStart) {
      return `<div class="ring-wrap"><div class="ring">${ringSvg(a)}<div class="ring-center"><div class="lbl">${who === "self" ? t("startHint") : t("noPeriod")}</div></div></div></div>`;
    }
    let big, lbl;
    if (a.inPeriod) { big = diffDays(a.lastStart, todayKey()) + 1; lbl = t("periodDay"); }
    else if (a.lateBy > 0) { big = a.lateBy; lbl = a.lateBy === 1 ? t("lateOne") : t("lateMany"); }
    else if (a.daysUntil === 0) { big = t("todayBig"); lbl = t("startsToday"); }
    else { big = a.daysUntil; lbl = a.daysUntil === 1 ? t("untilOne") : t("untilMany"); }
    return `<div class="ring-wrap"><div class="ring">${ringSvg(a)}
      <div class="ring-center"><div class="big">${big}</div><div class="lbl">${lbl}</div>
      ${a.phase && a.phase.key !== "late" ? `<div class="phase ${a.phase.cls}">${t(`phase.${a.phase.key}`)}</div>` : ""}</div></div></div>
      <div class="stats">
        <div class="stat"><div class="v">${a.cycleDay}</div><div class="k">${t("cycleDay")}</div></div>
        <div class="stat"><div class="v">${fmtShort(a.lateBy > 0 ? todayKey() : a.nextStart)}</div><div class="k">${t("nextPeriod")}${a.lateBy > 0 ? t("soon") : ""}</div></div>
        <div class="stat"><div class="v">${t("daysShort", { n: a.cycleLength })}</div><div class="k">${t("avgCycle")}</div></div>
        <div class="stat"><div class="v">${t("daysShort", { n: a.periodLength })}</div><div class="k">${t("avgPeriod")}</div></div>
      </div>`;
  }

  function renderToday() {
    const a = ownAnalysis(), day = todayKey(), d = getDay(day);
    const greet = state.settings.name ? t("hello", { name: esc(state.settings.name) }) : t("today");
    const periodBtn = d.flow > 0
      ? `<button class="btn block" data-action="period-toggle" data-date="${day}">${t("noPeriodToday")}</button>`
      : `<button class="btn primary block" data-action="period-start">${a.set.has(addDays(day, -1)) ? t("periodToday") : t("periodStarted")}</button>`;
    return `<div class="head"><h1>${greet}</h1></div>
      <div class="date-sub">${fmtDate(day, true)}</div>
      ${festiveBanner()}
      <div class="ipad-cols">
        <div class="card hero">${cycleSummary(a)}<div style="margin-top:14px">${periodBtn}</div></div>
        <div class="card"><h2>${t("howAreYou")}</h2>${dayEditor(day, { showFlow: false })}</div>
      </div>`;
  }

  function dayEditor(k, { showFlow = true } = {}) {
    const d = getDay(k);
    return `
      ${showFlow ? `<h3>${t("bleeding")}</h3><div class="seg five">${t("flows").map((f, i) => `<button class="${d.flow === i ? "on" : ""}" data-action="flow" data-date="${k}" data-v="${i}">${f}</button>`).join("")}</div>` : ""}
      <h3>${t("moods")} <span class="hint">${t("multiple")}</span></h3>
      <div class="moods">${MOODS.map(([id, e]) => { const on = d.moods.includes(id); return `<button class="mood ${on ? "on" : ""}" aria-pressed="${on}" data-action="mood" data-date="${k}" data-v="${id}"><span class="e">${e}</span>${moodLabel(id)}</button>`; }).join("")}</div>
      <h3>${t("symptoms")} <span class="hint">${t("multiple")}</span></h3>
      ${symptomPicker(k, d)}
      <h3>${t("notesThoughts")}</h3>
      ${d.notes.length ? `<div>${d.notes.map((n) => noteHtml(n, k, true)).join("")}</div>` : ""}
      <textarea data-draft="${k}" placeholder="${t("notePlaceholder")}">${esc(ui.drafts[k] || "")}</textarea>
      <div class="note-tools">
        <div class="vis-toggle" role="group" aria-label="${t("visibility")}">
          <button class="${ui.draftVis === "private" ? "on" : ""}" data-action="draft-vis" data-v="private">${t("private")}</button>
          <button class="${ui.draftVis === "public" ? "on" : ""}" data-action="draft-vis" data-v="public">${t("forPartner")}</button>
        </div>
        <button class="btn primary" data-action="note-add" data-date="${k}">${t("save")}</button>
      </div>`;
  }

  // Symptom-Auswahl: Suche, Kategorie-Reiter und Abschnitte
  const normText = (s) => String(s).replace(/­/g, "").toLowerCase();
  function symptomPicker(k, d) {
    const tile = (s) => {
      const on = d.symptoms.includes(s.id), label = s.label || t(`sym.${s.key}`);
      return `<button class="symptom ${on ? "on" : ""}" aria-pressed="${on}" data-action="symptom" data-date="${k}" data-v="${esc(s.id)}" data-s="${esc(normText(`${label} ${s.id} ${t(`grp.${s.group}`)}`))}">${s.art}<span>${label}</span></button>`;
    };
    // Eigene Einträge: gespeicherte Namen plus alles, was an diesem Tag schon eingetragen ist
    const customIds = [...new Set([...state.custom.map((n) => CUSTOM_PREFIX + n), ...d.symptoms.filter(isCustom)])];
    const customItems = customIds.map((id) => ({ id, group: "custom", label: esc(customName(id)), art: window.ZYKLUS_CUSTOM_ART(customName(id)) }));
    const groups = [...SYMPTOM_GROUPS, { key: "custom", items: customItems }];
    const addTile = `<button class="symptom add" data-action="custom-add" data-date="${k}" data-s="${esc(normText(`${t("addCustom")} ${t("grp.custom")}`))}">${window.ZYKLUS_ADD_ART}<span>${t("addCustom")}</span></button>`;
    return `<div class="sym-picker">
      <input type="search" class="sym-search" data-symsearch placeholder="🔍 ${t("symSearch")}" value="${esc(ui.symQuery)}" autocomplete="off" enterkeyhint="search">
      <div class="pills">${groups.map((g) => `<button class="pill" data-action="sym-jump" data-v="${g.key}">${t(`grp.${g.key}`)}</button>`).join("")}</div>
      ${groups.map((g) => `<section class="sym-sec" data-sec="${g.key}"><h4>${t(`grp.${g.key}`)}</h4><div class="symptoms">${g.items.map(tile).join("")}${g.key === "custom" ? addTile : ""}</div></section>`).join("")}
      <p class="muted small sym-empty" hidden>${t("noResults")}</p>
    </div>`;
  }
  function filterPickers() {
    const q = normText(ui.symQuery.trim());
    document.querySelectorAll(".sym-picker").forEach((p) => {
      let any = false;
      p.querySelectorAll(".sym-sec").forEach((sec) => {
        let n = 0;
        sec.querySelectorAll(".symptom").forEach((b) => { const hit = !q || b.dataset.s.includes(q); b.hidden = !hit; if (hit) n++; });
        sec.hidden = n === 0; if (n) any = true;
      });
      p.querySelector(".sym-empty").hidden = any;
      p.querySelector(".pills").hidden = !!q;
    });
  }

  // Nur-Lese-Anzeige von Stimmungen und Symptomen für die Partner-Ansicht
  function sharedDayHtml(info, withHeadings) {
    const moods = moodsOf(info).map((id) => MOODS.find((m) => m[0] === id)).filter(Boolean);
    const symptoms = (info && info.symptoms) || [];
    const moodHtml = moods.length ? `<div class="chips">${moods.map(([id, e]) => `<span class="chip static">${e} ${moodLabel(id)}</span>`).join("")}</div>` : "";
    const symHtml = symptoms.length ? `<div class="symptoms">${symptoms.map((id) => `<span class="symptom static">${symptomArt(id)}<span>${symptomLabel(id)}</span></span>`).join("")}</div>` : "";
    return (moodHtml ? `${withHeadings || symHtml ? `<h3>${t("moods")}</h3>` : ""}${moodHtml}` : "") + (symHtml ? `${withHeadings || moodHtml ? `<h3>${t("symptoms")}</h3>` : ""}${symHtml}` : "");
  }

  function noteHtml(n, k, editable, showDate = false) {
    const time = new Date(n.ts);
    return `<div class="note">
      <div class="note-meta">
        <span>${showDate ? fmtDate(k) + " · " : ""}${pad(time.getHours())}:${pad(time.getMinutes())}</span>
        <span>${editable
          ? `<button class="badge ${n.public ? "pub" : ""}" data-action="note-vis" data-date="${k}" data-id="${n.id}" title="${t("changeVisibility")}">${n.public ? t("forPartner") : t("private")}</button>
             <button class="icon-btn" data-action="note-del" data-date="${k}" data-id="${n.id}" aria-label="${t("deleteNote")}">${t("delete")}</button>`
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
    return { a: ownAnalysis(), hasEntry: (k) => { const d = state.days[k]; return !!d && (d.symptoms.length || d.moods.length || d.notes.length); } };
  }

  function renderCalendar() {
    const src = calendarSource();
    if (!src) return `<h1>${t("calendar")}</h1>${partnerEmpty()}`;
    const { a, hasEntry } = src;
    const base = ui.calMonth || todayKey().slice(0, 7);
    const [y, m] = base.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = todayKey();
    let cells = "";
    for (let i = 0; i < startOffset; i++) cells += `<div class="cal-day out"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = `${y}-${pad(m)}-${pad(d)}`;
      const cls = [
        a.set.has(k) ? "period" : a.predicted.has(k) ? "pred" : a.ovulation.has(k) ? "ovu" : a.fertile.has(k) ? "fertile" : "",
        k === today ? "today" : ""
      ].join(" ");
      cells += `<button class="cal-day ${cls}" data-action="open-day" data-date="${k}" aria-label="${fmtDate(k)}">${d}${hasEntry(k) ? '<span class="dot"></span>' : ""}</button>`;
    }
    return `<h1>${t("calendar")}</h1>
      <div class="card">
        <div class="cal-head">
          <button class="btn" data-action="cal-nav" data-v="-1" aria-label="${t("prevMonth")}">‹</button>
          <div class="cal-title">${t("months")[m - 1]} ${y}</div>
          <button class="btn" data-action="cal-nav" data-v="1" aria-label="${t("nextMonth")}">›</button>
        </div>
        <div class="cal-grid">${t("dow").map((d) => `<div class="cal-dow">${d}</div>`).join("")}${cells}</div>
        <div class="legend">
          <span><i style="background:var(--period)"></i>${t("legendPeriod")}</span>
          <span><i style="border:2px dashed var(--period)"></i>${t("legendExpected")}</span>
          <span><i style="background:var(--fertile-soft)"></i>${t("legendFertile")}</span>
          <span><i style="background:var(--fertile)"></i>${t("legendOvu")}</span>
        </div>
      </div>
      ${base !== today.slice(0, 7) ? `<button class="btn ghost block" data-action="cal-today">${t("jumpToday")}</button>` : ""}
      <p class="muted small center">${state.role === "partner" ? t("tapPartner") : t("tapOwner")}</p>`;
  }

  function openDaySheet(k) {
    let html;
    if (state.role === "partner") {
      const p = state.partner.data || {};
      const info = (p.days || {})[k] || {};
      const notes = (p.notes || []).filter((n) => n.date === k);
      const flow = (p.periodDays || []).includes(k) ? (p.flows && p.flows[k]) || 2 : 0;
      const shared = sharedDayHtml(info, true);
      html = `<h2>${fmtDate(k, true)}</h2>
        ${flow ? `<p><span class="badge" style="background:var(--period-soft);color:var(--period)">${t("periodBadge", { flow: t("flows")[flow] })}</span></p>` : ""}
        ${shared}
        ${notes.length ? `<h3>${t("notes")}</h3>${notes.map((n) => noteHtml(n, k, false)).join("")}` : ""}
        ${!flow && !shared && !notes.length ? `<p class="muted">${t("noShared")}</p>` : ""}
        <button class="btn block" style="margin-top:16px" data-action="sheet-close">${t("close")}</button>`;
    } else {
      html = `<div class="head"><h2 style="margin:0">${fmtDate(k, true)}</h2><button class="btn ghost" data-action="sheet-close">${t("done")}</button></div>${dayEditor(k)}`;
    }
    const sheet = $("#sheet");
    sheet.dataset.date = k;
    sheet.innerHTML = `<div class="grab"></div>${html}`;
    sheet.hidden = false; $("#sheet-backdrop").hidden = false;
    document.body.style.overflow = "hidden";
    filterPickers();
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
    return `<h1>${t("notes")}</h1>
      <div class="filter">${fb("all", t("all"))}${fb("private", t("private"))}${fb("public", t("forPartner"))}</div>
      <div class="card">${list.length ? list.map(({ k, n }) => noteHtml(n, k, true, true)).join("") : `<div class="empty">${t("noNotes")}</div>`}</div>
      <p class="muted small">${t("notesInfo")}</p>`;
  }

  // ---------- Partner-Freigabe (Besitzerin) ----------
  function shareCode() { return state.share.id && state.share.key ? `${state.share.id}.${state.share.key}` : ""; }

  function renderShare() {
    const s = state.share;
    if (!SYNC_READY) {
      return `<h1>${t("partner")}</h1><div class="card"><h2>${t("shareNotSetup")}</h2><p class="muted">${t("shareNotSetupText")}</p></div>`;
    }
    if (!s.enabled) {
      return `<h1>${t("partner")}</h1>
        <div class="card"><h2>${t("shareTitle")}</h2>
          <p class="muted">${t("shareText1")}</p>
          <p class="muted">${t("shareText2")}</p>
          <button class="btn primary block" data-action="share-enable">${t("shareEnable")}</button>
        </div>`;
    }
    const sw = (id, on, label, sub) => `<div class="item"><div>${label}<div class="small muted">${sub}</div></div><label class="switch"><input type="checkbox" data-action="${id}" ${on ? "checked" : ""}><span></span></label></div>`;
    return `<h1>${t("partner")}</h1>
      <div class="card">
        <h2>${t("shareCode")}</h2>
        <p class="muted small">${t("shareCodeText")}</p>
        <div class="code-box">${esc(shareCode())}</div>
        <div class="row"><button class="btn" data-action="share-copy">${t("copy")}</button>${navigator.share ? `<button class="btn" data-action="share-send">${t("send")}</button>` : ""}</div>
      </div>
      <div class="card list">
        <div class="item"><div>${t("shareCycle")}<div class="small muted">${t("shareCycleSub")}</div></div><span class="badge pub">${t("on")}</span></div>
        ${sw("share-symptoms", s.shareSymptoms, t("shareSym"), t("shareSymSub"))}
        ${sw("share-sex", s.shareSex, t("shareSex"), t("shareSexSub"))}
        ${sw("share-notes", s.shareNotes, t("shareNotes"), t("shareNotesSub"))}
      </div>
      <div class="card">
        <p class="small muted">${s.error ? `⚠️ ${esc(errMsg(s.error))}` : s.lastSync ? t("lastSync", { time: fmtTime(s.lastSync) }) : t("notSynced")}</p>
        <button class="btn block" data-action="share-sync">${t("syncNow")}</button>
        <button class="btn danger block" data-action="share-disable">${t("shareDisable")}</button>
      </div>`;
  }

  function buildPayload() {
    const periodDays = [], flows = {}, days = {}, notes = [];
    for (const [k, d] of Object.entries(state.days)) {
      if (d.flow > 0) { periodDays.push(k); flows[k] = d.flow; }
      // "mood" bleibt zusätzlich drin, damit noch nicht aktualisierte Partner-Apps weiter funktionieren
      // Sensible Einträge (Sex, Substanzen, Tests …) nur, wenn sie das ausdrücklich erlaubt
      const symptoms = state.share.shareSex ? d.symptoms : d.symptoms.filter((id) => !isPrivateSymptom(id));
      if (state.share.shareSymptoms && (symptoms.length || d.moods.length)) days[k] = { symptoms, moods: d.moods, mood: d.moods[0] || null };
      if (state.share.shareNotes) for (const n of d.notes) if (n.public) notes.push({ id: n.id, date: k, text: n.text, ts: n.ts, public: true });
    }
    return {
      v: 2, updated: Date.now(), name: state.settings.name || "",
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
    const base = CFG.supabaseUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
    const res = await fetch(`${base}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(res.status === 400 && /forbidden/.test(txt) ? t("noPermission") : t("serverError", { n: res.status })); }
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
      if (manual) toast(t("synced"));
    } catch (e) {
      s.error = navigator.onLine ? `syncFailed|${e.message}` : "offlineSync";
      save(); if (manual) toast(errMsg(s.error));
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
      if (!row) { p.error = "noData"; p.data = null; }
      else { p.data = await decrypt(row.payload, p.key); p.error = null; p.fetched = Date.now(); }
    } catch (e) {
      p.error = e.name === "OperationError" ? "badDecrypt" : navigator.onLine ? `loadFailed|${e.message}` : "offlineLoad";
    }
    save(); render();
    if (manual) toast(p.error ? errMsg(p.error) : t("updated"));
  }

  function partnerEmpty() {
    const p = state.partner;
    return `<div class="card"><div class="empty">${p.error ? esc(errMsg(p.error)) : t("loading")}</div><button class="btn block" data-action="partner-refresh">${t("retry")}</button></div>`;
  }

  function renderPartnerToday() {
    const p = state.partner.data;
    if (!p) return `<h1>${t("overview")}</h1>${partnerEmpty()}`;
    const a = analyze(p.periodDays || [], p.settings || state.settings);
    const day = todayKey();
    const info = (p.days || {})[day];
    const todayNotes = (p.notes || []).filter((n) => n.date === day);
    const who = p.name ? esc(p.name) : t("yourPartner");
    const shared = sharedDayHtml(info, false);
    return `<h1>${p.name ? t("partnerCycle", { name: who }) : t("overview")}</h1>
      <div class="date-sub">${fmtDate(day, true)}</div>
      ${festiveBanner()}
      <div class="ipad-cols">
        <div class="card hero">${cycleSummary(a, "partner")}</div>
        <div>
          ${a.phase ? `<div class="card"><h2>${t("goodToKnow")}</h2><div class="tip">${t(`tip.${a.phase.key}`)}</div></div>` : ""}
          <div class="card"><h2>${t("today")}</h2>
            ${p.sharesSymptoms === false ? `<p class="muted">${t("noSymShared", { who })}</p>` : shared || `<p class="muted">${t("nothingToday")}</p>`}
            ${todayNotes.length ? `<h3>${t("notes")}</h3>${todayNotes.map((n) => noteHtml(n, day, false)).join("")}` : ""}
          </div>
        </div>
      </div>
      <p class="muted small center">${state.partner.fetched ? t("asOf", { time: fmtTime(p.updated || state.partner.fetched) }) : ""}${state.partner.error ? ` · ${esc(errMsg(state.partner.error))}` : ""}</p>
      <button class="btn ghost block" data-action="partner-refresh">${t("refresh")}</button>`;
  }

  function renderPartnerNotes() {
    const p = state.partner.data;
    if (!p) return `<h1>${t("notes")}</h1>${partnerEmpty()}`;
    if (p.sharesNotes === false) return `<h1>${t("notes")}</h1><div class="card"><div class="empty">${t("noNotesShared", { who: p.name ? esc(p.name) : t("yourPartner") })}</div></div>`;
    const notes = [...(p.notes || [])].sort((a, b) => b.ts - a.ts);
    return `<h1>${t("notes")}</h1><div class="card">${notes.length ? notes.map((n) => noteHtml(n, n.date, false, true)).join("") : `<div class="empty">${t("noSharedNotes")}</div>`}</div>`;
  }

  // ---------- Einstellungen ----------
  function appearanceCard() {
    const th = state.prefs.theme;
    const b = (id, label) => `<button class="${th === id ? "on" : ""}" aria-pressed="${th === id}" data-action="set-theme" data-v="${id}">${label}</button>`;
    return `<div class="card"><h2>${t("appearance")}</h2>
      <div class="pref-label">${t("theme")}</div>
      <div class="seg three" role="group" aria-label="${t("theme")}">${b("system", t("themeSystem"))}${b("light", t("themeLight"))}${b("dark", t("themeDark"))}</div>
      <div class="pref-label">${t("language")}</div>
      ${langSwitch()}
      <div class="list" style="margin-top:14px"><div class="item"><div>${t("festive")}<div class="small muted">${t("festiveSub")}</div></div><label class="switch"><input type="checkbox" data-action="set-festive" ${festive() ? "checked" : ""}><span></span></label></div></div>
    </div>`;
  }

  function renderSettings() {
    if (state.role === "partner") {
      return `<h1>${t("settings")}</h1>
        ${appearanceCard()}
        <div class="card"><h2>${t("connection")}</h2><p class="muted small">${t("connectedCode")} <code>${esc((state.partner.id || "").slice(0, 6))}…</code></p>
          <button class="btn block" data-action="partner-refresh">${t("refreshData")}</button></div>
        <div class="card"><button class="btn danger block" data-action="reset">${t("disconnect")}</button></div>
        ${aboutCard()}`;
    }
    const s = state.settings;
    return `<h1>${t("settings")}</h1>
      ${appearanceCard()}
      <div class="card list">
        <div class="item"><span>${t("yourName")}</span><input type="text" data-action="set-name" value="${esc(s.name)}" placeholder="${t("namePlaceholder")}" style="max-width:180px"></div>
        <div class="item"><div>${t("avgCycle")}<div class="small muted">${t("autoCalc")}</div></div><input type="number" min="18" max="60" data-action="set-cycle" value="${s.cycleLength}"></div>
        <div class="item"><span>${t("avgPeriod")}</span><input type="number" min="1" max="12" data-action="set-period" value="${s.periodLength}"></div>
      </div>
      <div class="card"><h2>${t("customList")}</h2>
        ${state.custom.length ? `<div class="list">${state.custom.map((n) => `<div class="item"><span>${esc(n)}</span><button class="icon-btn" data-action="custom-remove" data-v="${esc(n)}">${t("remove")}</button></div>`).join("")}</div>` : `<p class="muted small">${t("customNone")}</p>`}
      </div>
      <div class="card"><h2>${t("backup")}</h2>
        <p class="muted small">${t("backupText")}</p>
        <div class="row"><button class="btn" data-action="export">${t("export")}</button><button class="btn" data-action="import">${t("import")}</button></div>
        <input type="file" id="import-file" accept="application/json,.json" hidden>
      </div>
      <div class="card"><button class="btn danger block" data-action="reset">${t("deleteAll")}</button></div>
      ${aboutCard()}`;
  }
  function aboutCard() {
    return `<div class="card"><h2>${t("about")}</h2><p class="muted small">${t("aboutText")}</p></div>`;
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2400);
  }

  // ---------- Aktionen ----------
  function rerender() { render(); refreshSheet(); }
  const toggle = (list, v) => list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

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
      if (!c) return toast(t("badCode"));
      state.partner = { ...state.partner, ...c, data: null, error: null };
      state.role = "partner"; ui.tab = "today"; save(); render(); fetchPartner();
    },
    "period-start": () => {
      const day = todayKey(), pl = ownAnalysis().periodLength;
      setDay(day, { flow: getDay(day).flow || 2 });
      toast(t("periodSaved", { n: pl }));
      render();
    },
    "period-toggle": (el) => { const k = el.dataset.date; setDay(k, { flow: getDay(k).flow ? 0 : 2 }); rerender(); },
    flow: (el) => { setDay(el.dataset.date, { flow: +el.dataset.v }); rerender(); },
    mood: (el) => { const k = el.dataset.date; setDay(k, { moods: toggle(getDay(k).moods, el.dataset.v) }); keepScroll(rerender); },
    symptom: (el) => { const k = el.dataset.date; setDay(k, { symptoms: toggle(getDay(k).symptoms, el.dataset.v) }); keepScroll(rerender); },
    "draft-vis": (el) => {
      ui.draftVis = el.dataset.v;
      document.querySelectorAll('[data-action="draft-vis"]').forEach((b) => b.classList.toggle("on", b.dataset.v === ui.draftVis));
    },
    "note-add": (el) => {
      const k = el.dataset.date, text = (ui.drafts[k] || "").trim();
      if (!text) return toast(t("writeFirst"));
      const d = getDay(k);
      setDay(k, { notes: [...d.notes, { id: uid(), text, public: ui.draftVis === "public", ts: Date.now() }] });
      delete ui.drafts[k];
      toast(ui.draftVis === "public" ? t("notePublicSaved") : t("notePrivateSaved"));
      keepScroll(rerender);
    },
    "note-vis": (el) => {
      const k = el.dataset.date, d = getDay(k);
      setDay(k, { notes: d.notes.map((n) => n.id === el.dataset.id ? { ...n, public: !n.public } : n) });
      keepScroll(rerender);
    },
    "note-del": (el) => {
      if (!confirm(t("confirmDeleteNote"))) return;
      const k = el.dataset.date, d = getDay(k);
      setDay(k, { notes: d.notes.filter((n) => n.id !== el.dataset.id) });
      keepScroll(rerender);
    },
    "custom-add": (el) => {
      const name = (prompt(t("customPrompt")) || "").trim().replace(/\s+/g, " ").slice(0, 40);
      if (!name) return;
      if (state.custom.some((n) => n.toLowerCase() === name.toLowerCase())) return toast(t("customExists"));
      state.custom.push(name);
      const k = el.dataset.date, d = getDay(k);
      setDay(k, { symptoms: d.symptoms.includes(CUSTOM_PREFIX + name) ? d.symptoms : [...d.symptoms, CUSTOM_PREFIX + name] });
      keepScroll(rerender);
    },
    "custom-remove": (el) => {
      const name = el.dataset.v;
      if (!confirm(t("confirmRemoveCustom", { name }))) return;
      state.custom = state.custom.filter((n) => n !== name);
      save(); keepScroll(render);
    },
    "sym-jump": (el) => {
      const sec = el.closest(".sym-picker").querySelector(`[data-sec="${el.dataset.v}"]`);
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
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
    "set-theme": (el) => { state.prefs.theme = el.dataset.v; save(); applyTheme(); keepScroll(render); },
    "set-lang": (el) => { state.prefs.lang = el.dataset.v; save(); keepScroll(render); },
    "share-enable": async () => {
      Object.assign(state.share, { enabled: true, id: randomToken(9), key: randomToken(16), secret: randomToken(24), error: null });
      save(); render(); await pushShare(true);
    },
    "share-disable": async () => {
      if (!confirm(t("confirmShareOff"))) return;
      const { id, secret } = state.share;
      try { await rpc("delete_share", { p_id: id, p_secret: secret }); } catch { toast(t("serverLocal")); }
      Object.assign(state.share, { enabled: false, id: null, key: null, secret: null, lastSync: null, error: null });
      save(); render();
    },
    "share-copy": async () => {
      try { await navigator.clipboard.writeText(shareCode()); toast(t("codeCopied")); } catch { toast(t("copyManual")); }
    },
    "share-send": async () => {
      try { await navigator.share({ title: t("shareMsgTitle"), text: `${t("shareMsg")}\n${shareCode()}` }); } catch { /* abgebrochen */ }
    },
    "share-sync": () => pushShare(true),
    "partner-refresh": () => fetchPartner(true),
    export: () => {
      const blob = new Blob([JSON.stringify({ app: "zyklus", v: 2, exported: new Date().toISOString(), settings: state.settings, days: state.days, custom: state.custom }, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `zyklus-backup-${todayKey()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    import: () => $("#import-file").click(),
    reset: () => {
      if (!confirm(state.role === "partner" ? t("confirmResetPartner") : t("confirmReset"))) return;
      if (state.role === "owner" && state.share.enabled && SYNC_READY) rpc("delete_share", { p_id: state.share.id, p_secret: state.share.secret }).catch(() => {});
      const prefs = state.prefs; // Sprache und Design bleiben erhalten
      state = defaultState(); state.prefs = prefs; ui.drafts = {};
      save(); welcomeStep = "choose"; ui.tab = "today"; render();
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

  // Angefangene Notiz merken, damit sie beim Antippen von Stimmung/Symptom nicht verschwindet
  document.addEventListener("input", (e) => {
    const k = e.target.dataset && e.target.dataset.draft;
    if (k) ui.drafts[k] = e.target.value;
    if (e.target.matches && e.target.matches("[data-symsearch]")) {
      ui.symQuery = e.target.value;
      document.querySelectorAll("[data-symsearch]").forEach((i) => { if (i !== e.target) i.value = ui.symQuery; });
      filterPickers();
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target, a = el.dataset.action;
    if (a === "set-festive") { state.prefs.festive = el.checked; save(); applyTheme(); keepScroll(render); }
    else if (a === "share-symptoms") { state.share.shareSymptoms = el.checked; save(); scheduleSync(); }
    else if (a === "share-notes") { state.share.shareNotes = el.checked; save(); scheduleSync(); }
    else if (a === "share-sex") { state.share.shareSex = el.checked; save(); scheduleSync(); }
    else if (a === "set-name") { state.settings.name = el.value.trim().slice(0, 40); save(); scheduleSync(); }
    else if (a === "set-cycle") { state.settings.cycleLength = clamp(+el.value, 18, 60, state.settings.cycleLength); el.value = state.settings.cycleLength; save(); scheduleSync(); }
    else if (a === "set-period") { state.settings.periodLength = clamp(+el.value, 1, 12, state.settings.periodLength); el.value = state.settings.periodLength; save(); scheduleSync(); }
    else if (el.id === "import-file" && el.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (data.app !== "zyklus" || typeof data.days !== "object") throw new Error();
          if (!confirm(t("confirmImport"))) return;
          state.days = { ...state.days, ...normalizeDays(data.days) };
          if (data.settings) state.settings = { ...state.settings, ...data.settings };
          if (Array.isArray(data.custom)) state.custom = [...new Set([...state.custom, ...data.custom.map(String)])];
          save(); scheduleSync(); render(); toast(t("imported"));
        } catch { toast(t("badBackup")); }
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

  applyTheme();
  render();
  if (state.role === "partner") fetchPartner();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
