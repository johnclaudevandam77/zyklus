// Symptome in Kategorien, jeweils mit eigener kleiner Illustration.
// "id" ist der gespeicherte Wert und darf nicht geändert werden, sonst passen alte Einträge nicht mehr.
// Gruppen mit private: true werden NICHT mit dem Partner geteilt, außer sie erlaubt es (Schalter im Partner-Tab).
(() => {
  const C = { rose: "#e0466f", pink: "#f58aa7", peach: "#ffd9c2", yellow: "#ffc94d", orange: "#ff9f5a", mint: "#62cdbd", green: "#9bd770", blue: "#6fafef", purple: "#a98bea", ink: "#5b3a4a", white: "#ffffff", grey: "#b9aeb5", cream: "#fff3d6", brown: "#b07a4f", choc: "#7b4a2e", red: "#e5484d" };
  const svg = (bg, body) => `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="${bg}"/>${body}</svg>`;
  const eyes = `<circle cx="19" cy="25" r="1.8" fill="${C.ink}"/><circle cx="29" cy="25" r="1.8" fill="${C.ink}"/>`;
  const line = `fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"`;
  const face = (fill = C.peach) => `<circle cx="24" cy="25" r="14" fill="${fill}"/>`;
  const drop = (fill, extra = "") => `<path d="M24 8c6 8 11 13 11 20a11 11 0 0 1-22 0c0-7 5-12 11-20z" fill="${fill}" ${extra}/>`;
  const shine = `<path d="M18 29a6 6 0 0 0 4 6" fill="none" stroke="${C.white}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
  const roll = `<rect x="10" y="15" width="22" height="20" rx="3" fill="${C.white}" stroke="${C.grey}" stroke-width="1.5"/><ellipse cx="32" cy="25" rx="5" ry="10" fill="${C.white}" stroke="${C.grey}" stroke-width="1.5"/><ellipse cx="32" cy="25" rx="2" ry="4" fill="${C.grey}"/>`;
  const heart = (fill) => `<path d="M21 39C9 31 6 24 7 18c1-7 10-9 14-2 4-7 13-5 14 2 1 6-2 13-14 21z" fill="${fill}"/>`;
  const shield = (fill, stroke) => `<path d="M24 8l13 5v10c0 9-6 15-13 18-7-3-13-9-13-18V13z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  const star = (x, y, r, fill) => `<path transform="translate(${x} ${y}) scale(${r / 10})" d="M0-10 2.9-3.1 10-3 4.5 1.6 6.2 9 0 4.8-6.2 9-4.5 1.6-10-3-2.9-3.1z" fill="${fill}"/>`;
  const bolt = (x, y, fill) => `<path transform="translate(${x} ${y})" d="M2-8l-5 9h4l-2 7 6-9h-4z" fill="${fill}"/>`;
  const strip = (mark) => `<g transform="rotate(-40 24 24)"><rect x="9" y="19" width="30" height="10" rx="3" fill="${C.white}" stroke="${C.grey}" stroke-width="1.5"/><rect x="11" y="21" width="7" height="6" rx="1.5" fill="#dce9f7"/><rect x="25" y="21" width="9" height="6" rx="1" fill="#f3f0f2"/>${mark}</g>`;
  const pill = (a, b) => `<g transform="rotate(-35 24 24)"><rect x="11" y="18" width="26" height="12" rx="6" fill="${a}"/><path d="M24 18h7a6 6 0 0 1 0 12h-7z" fill="${b}"/></g>`;
  const bottle = (cap, body, label) => `<rect x="16" y="9" width="16" height="6" rx="2" fill="${cap}"/><rect x="13" y="14" width="22" height="25" rx="5" fill="${body}"/><rect x="16" y="21" width="16" height="10" rx="2" fill="${C.white}"/><text x="24" y="29" text-anchor="middle" font-size="8" font-weight="700" font-family="Arial, sans-serif" fill="${C.ink}">${label}</text>`;

  const ART = {
    // ---- Allgemeine Symptome
    cramps: svg("#ffe3ea", `<path d="M9 14c4-4 8-1 11 3h8c3-4 7-7 11-3 2 3-1 6-4 6-3 0-4 2-4 5 0 4-3 6-3 9v5h-8v-5c0-3-3-5-3-9 0-3-1-5-4-5-3 0-6-3-4-6z" fill="${C.pink}"/><path d="M26 15l-7 11h5l-2 9 8-12h-5l3-8z" fill="${C.yellow}" stroke="${C.white}" stroke-width="1" stroke-linejoin="round"/>`),
    headache: svg("#fff0cf", `<circle cx="24" cy="28" r="13" fill="${C.peach}"/>${eyes}<path d="M19 35c3-3 7-3 10 0" ${line}/><path d="M15 4l-3 7h4l-2 6 6-8h-4l2-5z" fill="${C.rose}"/><path d="M34 4l-3 7h4l-2 6 6-8h-4l2-5z" fill="${C.rose}"/>`),
    back: svg("#e6e0fb", `<g fill="${C.purple}"><rect x="17" y="7" width="14" height="6" rx="3"/><rect x="15" y="15" width="16" height="6" rx="3"/><rect x="16" y="23" width="16" height="6" rx="3"/><rect x="17" y="31" width="16" height="6" rx="3"/></g><path d="M36 15l1.8 4 4.2.6-3 3 .7 4.3-3.7-2-3.7 2 .7-4.3-3-3 4.2-.6z" fill="${C.rose}" stroke="${C.white}" stroke-width="1"/>`),
    breast: svg("#ffe3ea", `<path d="M7 18l7-9M41 18l-7-9" fill="none" stroke="${C.rose}" stroke-width="2.5" stroke-linecap="round"/><path d="M6 19c5-3 13-2 18 6 5-8 13-9 18-6-1 11-7 17-13 16-3 0-5-3-5-5 0 2-2 5-5 5-6 1-12-5-13-16z" fill="${C.pink}"/><circle cx="24" cy="26" r="2.5" fill="${C.rose}"/>`),
    fatigue: svg("#e3effc", `<rect x="8" y="16" width="29" height="17" rx="4" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/><rect x="38" y="21" width="3" height="7" rx="1.5" fill="${C.ink}"/><rect x="11" y="19" width="6" height="11" rx="2" fill="${C.rose}"/>`),
    nausea: svg("#e8f6d9", `<circle cx="24" cy="24" r="15" fill="${C.green}"/><path d="M16 21l5 2M32 21l-5 2" ${line}/><path d="M15 32c2-3 4-3 6 0s4 3 6 0 4-3 6 0" ${line}/>`),
    dizzy: svg("#efe6fb", `<circle cx="24" cy="25" r="15" fill="${C.peach}"/><path d="M19 25a2 2 0 1 1-2-2 4 4 0 1 1-4 4M33 25a2 2 0 1 1-2-2 4 4 0 1 1-4 4" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="24" cy="33" rx="3" ry="2" fill="${C.ink}"/>${star(14, 10, 4, C.yellow)}${star(35, 8, 3.4, C.yellow)}`),
    skin: svg("#ffeadd", `<circle cx="24" cy="24" r="15" fill="${C.peach}"/>${eyes}<path d="M20 32c3 2 5 2 8 0" ${line}/><g fill="${C.rose}"><circle cx="14.5" cy="30" r="2"/><circle cx="33" cy="31" r="1.8"/><circle cx="31" cy="15" r="1.6"/><circle cx="18" cy="15" r="1.4"/></g>`),
    sleep: svg("#3f3a66", `<path d="M30 9a15 15 0 1 0 9 24A17 17 0 0 1 30 9z" fill="${C.yellow}"/><path d="M31 14h6l-6 7h6" fill="none" stroke="${C.white}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="1.3" fill="${C.white}"/>`),
    swings: svg("#e3effc", `<circle cx="17" cy="17" r="7" fill="${C.yellow}"/><g stroke="${C.yellow}" stroke-width="2" stroke-linecap="round"><path d="M17 5v2M5 17h2M8.5 8.5l1.5 1.5M25.5 8.5L24 10M8.5 25.5l1.5-1.5"/></g><path d="M18 34a6 6 0 0 1 1-12 8 8 0 0 1 15 1 5.5 5.5 0 0 1 1 11z" fill="${C.white}" stroke="${C.grey}" stroke-width="1.5"/><path d="M23 37l-1 4M30 37l-1 4" stroke="${C.blue}" stroke-width="2.2" stroke-linecap="round"/>`),
    hives: svg("#ffe7dc", `<circle cx="24" cy="24" r="15" fill="${C.peach}"/><g fill="#ff8a8a" opacity=".9"><circle cx="17" cy="19" r="4"/><circle cx="29" cy="17" r="3"/><circle cx="25" cy="28" r="5"/><circle cx="15" cy="31" r="3"/><circle cx="33" cy="30" r="3.4"/></g><g fill="#ffd0cf"><circle cx="17" cy="19" r="1.6"/><circle cx="25" cy="28" r="2"/></g>`),
    cyst: svg("#ffe3ea", `<path d="M16 22c-6-2-10 2-9 7 1 4 6 5 9 3M32 22c6-2 10 2 9 7-1 4-6 5-9 3" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/><path d="M16 14h16c2 0 3 2 2 4l-4 10v8h-8v-8l-4-10c-1-2 0-4 2-4z" fill="${C.pink}"/><circle cx="7.5" cy="30" r="4.5" fill="${C.rose}"/><circle cx="40.5" cy="30" r="3.5" fill="${C.rose}"/><circle cx="6.5" cy="29" r="1.4" fill="${C.white}" opacity=".7"/>`),
    hot: svg("#fff0dc", `<path d="M24 7c3 7 11 10 11 20a11 11 0 0 1-22 0c0-5 3-8 5-10 0 4 2 6 4 6-2-6 0-11 2-16z" fill="${C.orange}"/><path d="M24 22c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-5 0 2 1 3 2 3-1-3 0-6 1-9z" fill="${C.yellow}"/>`),
    cold: svg("#e3f1fc", `<g stroke="${C.blue}" stroke-width="2.6" stroke-linecap="round"><path d="M24 8v32M10 16l28 16M10 32l28-16"/><path d="M20 10l4 4 4-4M20 38l4-4 4 4M9 21l5-1-2-5M39 27l-5 1 2 5M9 27l5 1-2 5M39 21l-5-1 2-5" fill="none"/></g>`),
    // ---- Gelüste
    cravings: svg("#fff0cf", `<circle cx="24" cy="24" r="16" fill="#d99a63"/><path d="M9 22c1-8 8-14 15-14s14 6 15 14c-2 3-4 0-6 2s-3 5-6 3-4 1-6 0-3-4-6-3-4 1-6-2z" fill="${C.pink}"/><circle cx="24" cy="24" r="5.5" fill="#fff0cf"/><g stroke-width="2" stroke-linecap="round"><path d="M16 15l2 1" stroke="${C.yellow}"/><path d="M30 13l1 2" stroke="${C.white}"/><path d="M33 20l2-1" stroke="${C.mint}"/><path d="M14 21l1-2" stroke="${C.white}"/></g>`),
    salty: svg("#eef6e6", `<path d="M10 34l6-20h16l6 20z" fill="${C.yellow}"/><g stroke="#e0a52b" stroke-width="1.6" stroke-linecap="round"><path d="M18 18l-2 14M24 18v14M30 18l2 14"/></g><g fill="${C.white}"><rect x="17" y="10" width="3" height="3" rx=".5"/><rect x="25" y="7" width="3" height="3" rx=".5"/><rect x="31" y="11" width="2.5" height="2.5" rx=".5"/></g>`),
    sweet: svg("#ffe7ef", `<path d="M9 33l15-19 15 19z" fill="#ffd3a8"/><path d="M9 33h30v5H9z" fill="#f2a6b8"/><path d="M13 28h22" stroke="${C.white}" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="12" r="4" fill="${C.red}"/><path d="M24 8c1-2 3-3 4-3" stroke="${C.green}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),
    chocolate: svg("#f6e8dc", `<rect x="13" y="8" width="22" height="32" rx="3" fill="${C.choc}"/><g fill="#9a6040"><rect x="15.5" y="10.5" width="7.5" height="7" rx="1"/><rect x="25" y="10.5" width="7.5" height="7" rx="1"/><rect x="15.5" y="19.5" width="7.5" height="7" rx="1"/><rect x="25" y="19.5" width="7.5" height="7" rx="1"/></g><path d="M13 28h22v9a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" fill="${C.rose}"/>`),
    carbs: svg("#fff2dc", `<path d="M8 27h32a16 13 0 0 1-32 0z" fill="${C.white}" stroke="${C.grey}" stroke-width="1.5"/><path d="M12 27c2-6 6-9 12-9s10 3 12 9" fill="${C.yellow}"/><path d="M15 24c3-3 6-3 9 0s6 3 9 0M17 21c2-2 5-2 7 0s5 2 7 0" fill="none" stroke="#e0a52b" stroke-width="1.5" stroke-linecap="round"/><path d="M30 8l-6 18M35 9l-8 17" stroke="${C.brown}" stroke-width="2" stroke-linecap="round"/>`),
    // ---- Zervixschleim
    discharge: svg("#e3effc", `<path d="M19 9c5 7 9 11 9 17a9 9 0 0 1-18 0c0-6 4-10 9-17z" fill="${C.blue}"/><path d="M34 22c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill="#a9d0f7"/><path d="M14 27a5 5 0 0 0 4 5" fill="none" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    dry: svg("#f6ece0", `${drop("none", `stroke="${C.brown}" stroke-width="2" stroke-dasharray="3 3"`)}<path d="M19 30l4-3-2-3 4-2M26 33l3-3" fill="none" stroke="${C.brown}" stroke-width="1.6" stroke-linecap="round"/>`),
    watery: svg("#dcecfd", `${drop(C.blue)}${shine}<circle cx="37" cy="13" r="3" fill="#a9d0f7"/><circle cx="11" cy="17" r="2.2" fill="#a9d0f7"/>`),
    eggwhite: svg("#eef3f7", `${drop("#dfe8ef", `stroke="#9fb3c4" stroke-width="1.5"`)}${shine}<path d="M24 39c0 3 1 5 4 6" fill="none" stroke="#9fb3c4" stroke-width="1.5" stroke-linecap="round"/>${star(34, 11, 3.5, C.yellow)}`),
    creamy: svg("#fff6e3", `${drop(C.cream, `stroke="#ecd39e" stroke-width="1.5"`)}${shine}`),
    sticky: svg("#fdf4d8", `<path d="M24 8c6 8 11 12 11 19 0 4-2 6-4 7 1 3-1 5-3 4-1 3-6 3-7 0-2 1-4-1-3-4-3-1-5-3-5-7 0-7 5-11 11-19z" fill="#fbe7a7" stroke="#e5c66d" stroke-width="1.5"/>${shine}`),
    // ---- Verdauung
    bloating: svg("#dcf4f0", `<ellipse cx="24" cy="21" rx="13" ry="14" fill="${C.mint}"/><path d="M21 35h6l-3-3z" fill="${C.mint}"/><path d="M24 35c-3 3 3 4 0 8" ${line}/><ellipse cx="19" cy="15" rx="3" ry="4.5" fill="${C.white}" opacity=".65"/>`),
    diarrhea: svg("#e3effc", `${roll}<path d="M10 35c4 0 6 3 6 6M5 22h3M4 27h4M5 32h3" fill="none" stroke="${C.blue}" stroke-width="2" stroke-linecap="round"/>`),
    constipation: svg("#f6ece0", `${roll}<g transform="translate(9 26)"><path d="M0 0h9M0 13h9M1 0c0 5 7 8 7 13M8 0c0 5-7 8-7 13" fill="${C.white}" stroke="${C.brown}" stroke-width="1.7" stroke-linecap="round"/></g>`),
    gas: svg("#eaf6e2", `<circle cx="18" cy="27" r="7" fill="${C.green}" opacity=".8"/><circle cx="28" cy="21" r="8" fill="${C.green}"/><circle cx="34" cy="31" r="5" fill="${C.green}" opacity=".65"/><circle cx="12" cy="17" r="3" fill="${C.green}" opacity=".5"/><path d="M25 18a4 4 0 0 1 5-1" fill="none" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    // ---- Sex & Lust
    solo: svg("#f1e7fd", `${heart(C.purple)}${star(36, 12, 4.5, C.yellow)}<path d="M14 20a4 4 0 0 1 4-4" fill="none" stroke="${C.white}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`),
    protected: svg("#e3effc", `${shield(C.blue, C.blue)}<path d="M18 24l4 4 8-9" fill="none" stroke="${C.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
    unprotected: svg("#f0edf1", `${shield("none", C.grey)}<path d="M20 20l8 8M28 20l-8 8" fill="none" stroke="${C.rose}" stroke-width="2.6" stroke-linecap="round"/>`),
    libidoUp: svg("#ffe3ea", `${heart(C.rose)}<path d="M36 31V19M31 24l5-5 5 5" fill="none" stroke="${C.mint}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    libidoDown: svg("#efeaec", `${heart(C.grey)}<path d="M36 19v12M31 26l5 5 5-5" fill="none" stroke="${C.rose}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    // ---- Aktivitäten
    haircut: svg("#f1e7fd", `<circle cx="15" cy="32" r="5" fill="none" stroke="${C.purple}" stroke-width="3"/><circle cx="29" cy="34" r="5" fill="none" stroke="${C.purple}" stroke-width="3"/><path d="M18 28L34 9M26 30L15 10" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/><path d="M34 16c3 2 5 6 4 10M38 13c2 1 3 3 3 5" fill="none" stroke="${C.brown}" stroke-width="1.6" stroke-linecap="round"/>`),
    reading: svg("#fff0dc", `<path d="M24 15c-5-4-11-4-15-2v22c4-2 10-2 15 2 5-4 11-4 15-2V13c-4-2-10-2-15 2z" fill="${C.white}" stroke="${C.rose}" stroke-width="2" stroke-linejoin="round"/><path d="M24 15v22" stroke="${C.rose}" stroke-width="2"/><path d="M13 20h7M13 25h7M28 20h7M28 25h7" stroke="${C.grey}" stroke-width="1.5" stroke-linecap="round"/>`),
    napping: svg("#e8e6fb", `<rect x="8" y="27" width="32" height="8" rx="3" fill="${C.purple}"/><rect x="8" y="22" width="12" height="7" rx="3.5" fill="${C.white}"/><path d="M19 27c4-5 13-5 19 0z" fill="${C.pink}"/><path d="M29 10h5l-5 6h5M36 6h3l-3 4h3" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`),
    walking: svg("#e6f5ea", `<path d="M9 31c0-4 3-6 7-6h4l4 3h9c4 0 6 2 6 5v2H9z" fill="${C.mint}"/><path d="M9 35h30v3H9z" fill="${C.ink}" opacity=".75"/><path d="M20 25l2-4M24 28l2-4" stroke="${C.white}" stroke-width="1.6" stroke-linecap="round"/><path d="M6 16h7M4 21h6" stroke="${C.mint}" stroke-width="2" stroke-linecap="round"/>`),
    // ---- Rausch & Substanzen
    alcohol: svg("#f3eafd", `<path d="M12 10h24L24 25z" fill="${C.pink}" opacity=".85"/><path d="M12 10h24L24 25z" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 25v12M17 38h14" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/><circle cx="29" cy="13" r="2" fill="${C.green}"/><path d="M29 13l5-6" stroke="${C.ink}" stroke-width="1.4"/>`),
    nicotine: svg("#efeff2", `<g transform="rotate(-35 24 24)"><rect x="7" y="21" width="30" height="6" rx="1.5" fill="${C.white}" stroke="${C.grey}"/><rect x="7" y="21" width="9" height="6" rx="1.5" fill="${C.orange}"/><rect x="37" y="21" width="3" height="6" fill="${C.red}"/></g><path d="M37 13c-2-3 2-4 0-7M41 15c-2-3 2-4 0-7" fill="none" stroke="${C.grey}" stroke-width="1.5" stroke-linecap="round"/>`),
    cannabis: svg("#e6f5e6", `<g fill="#4fa865"><path d="M24 8c3 6 3 13 0 20-3-7-3-14 0-20z"/><path d="M24 28c-3-6-9-10-16-11 3 6 9 10 16 11zM24 28c3-6 9-10 16-11-3 6-9 10-16 11z"/><path d="M24 28c-5-2-10-1-14 2 5 2 10 1 14-2zM24 28c5-2 10-1 14 2-5 2-10 1-14-2z"/></g><path d="M24 28v11" stroke="#3b7d4b" stroke-width="2" stroke-linecap="round"/>`),
    psychedelics: svg("#fde8f1", `<path d="M8 25a16 13 0 0 1 32 0z" fill="${C.red}"/><g fill="${C.white}"><circle cx="17" cy="18" r="2.6"/><circle cx="27" cy="15" r="2.2"/><circle cx="33" cy="21" r="1.8"/><circle cx="22" cy="22" r="1.6"/></g><path d="M19 25h10l-1 13h-8z" fill="${C.cream}"/><path d="M6 9l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L3 11.3l2-.3z" fill="${C.purple}"/>`),
    // ---- Zyklus-Störfaktoren
    trauma: svg("#fbe7ee", `${heart(C.pink)}<path d="M12 20l6 4-4 4 6 4" fill="none" stroke="${C.white}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(-30 29 22)"><rect x="22" y="18" width="16" height="8" rx="4" fill="${C.cream}" stroke="#ecd39e"/><circle cx="28" cy="22" r=".9" fill="#d2b47a"/><circle cx="32" cy="22" r=".9" fill="#d2b47a"/></g>`),
    injury: svg("#fff0e3", `<g transform="rotate(-40 24 24)"><rect x="6" y="17" width="36" height="14" rx="7" fill="#f2c79b"/><rect x="17" y="17" width="14" height="14" fill="#f8dcbf"/><g fill="#d9a877"><circle cx="21" cy="21" r="1"/><circle cx="27" cy="21" r="1"/><circle cx="21" cy="27" r="1"/><circle cx="27" cy="27" r="1"/><circle cx="24" cy="24" r="1"/></g></g>`),
    chemical: svg("#eef3fb", `${strip(`<rect x="27" y="21" width="1.6" height="6" fill="${C.rose}" opacity=".35"/><rect x="31" y="21" width="1.6" height="6" fill="${C.rose}"/>`)}<path d="M37 10c1 3 3 4 5 4M10 37c3 0 4 2 4 5" stroke="${C.grey}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),
    loss: svg("#f1ecf0", `${heart("#c9a9bb")}<path d="M21 16l-3 7 5 3-4 7" fill="none" stroke="${C.white}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    // ---- Verhütung
    implantOut: svg("#eef0f6", `<path d="M10 30c6-8 14-12 26-14" stroke="${C.peach}" stroke-width="10" stroke-linecap="round"/><path d="M14 30l18-10" stroke="${C.grey}" stroke-width="3" stroke-linecap="round"/><path d="M33 12l6-4M36 17l6-1" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`),
    sos: svg("#ffe9e3", `${pill(C.orange, C.yellow)}<circle cx="37" cy="11" r="6" fill="${C.red}"/><path d="M37 8v3.5" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/><circle cx="37" cy="14" r="1" fill="${C.white}"/>`),
    tubes: svg("#ffe3ea", `<path d="M16 14h16c2 0 3 2 2 4l-4 10v8h-8v-8l-4-10c-1-2 0-4 2-4z" fill="${C.pink}"/><path d="M16 16c-5-2-9 1-9 5M32 16c5-2 9 1 9 5" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/><path d="M9 12l4 4M13 12l-4 4M35 12l4 4M39 12l-4 4" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`),
    withdrawal: svg("#eaf0fb", `<path d="M10 24h18" stroke="${C.blue}" stroke-width="4" stroke-linecap="round"/><path d="M22 17l7 7-7 7" fill="none" stroke="${C.blue}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 14v20" stroke="${C.purple}" stroke-width="4" stroke-linecap="round"/>`),
    // ---- Tests
    pregPos: svg("#ffe9ef", strip(`<rect x="27" y="21" width="1.6" height="6" fill="${C.rose}"/><rect x="31" y="21" width="1.6" height="6" fill="${C.rose}"/>`) + `<circle cx="37" cy="37" r="6" fill="${C.rose}"/><path d="M37 34v6M34 37h6" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    pregNeg: svg("#f0edf1", strip(`<rect x="31" y="21" width="1.6" height="6" fill="${C.rose}"/>`) + `<circle cx="37" cy="37" r="6" fill="${C.grey}"/><path d="M34 37h6" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    ovuPos: svg("#e3f4ef", strip(`<rect x="27" y="21" width="1.6" height="6" fill="${C.mint}"/><rect x="31" y="21" width="1.6" height="6" fill="${C.mint}"/>`) + `<circle cx="37" cy="37" r="6" fill="${C.mint}"/><path d="M37 34v6M34 37h6" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    ovuNeg: svg("#eef0ef", strip(`<rect x="31" y="21" width="1.6" height="6" fill="${C.mint}"/>`) + `<circle cx="37" cy="37" r="6" fill="${C.grey}"/><path d="M34 37h6" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    // ---- Medikamente
    painkiller: svg("#ffe9e3", `${pill(C.white, C.red)}<path d="M33 9l4 4M37 9l-4 4" stroke="${C.red}" stroke-width="2" stroke-linecap="round"/>`),
    progesterone: svg("#efe8fb", `<rect x="11" y="9" width="26" height="30" rx="4" fill="${C.purple}"/><g fill="${C.white}">${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<circle cx="${17 + c * 7}" cy="${15 + r * 6.5}" r="2.3"/>`).join("")).join("")}</g>`),
    stimulants: svg("#e3effc", `${pill(C.blue, C.white)}${bolt(36, 12, C.yellow)}`),
    testosterone: svg("#e6f5ea", `<circle cx="20" cy="28" r="9" fill="none" stroke="#3fa877" stroke-width="3.4"/><path d="M26.5 21.5L37 11M29 11h8v8" fill="none" stroke="#3fa877" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`),
    // ---- Nahrungsergänzung
    folic: svg("#eef6e1", bottle("#3fa877", C.green, "B9")),
    vitd: svg("#fff4d6", `<circle cx="24" cy="24" r="9" fill="${C.yellow}"/><g stroke="${C.yellow}" stroke-width="2.4" stroke-linecap="round"><path d="M24 8v4M24 36v4M8 24h4M36 24h4M12.7 12.7l2.8 2.8M32.5 32.5l2.8 2.8M12.7 35.3l2.8-2.8M32.5 15.5l2.8-2.8"/></g><text x="24" y="28" text-anchor="middle" font-size="10" font-weight="700" font-family="Arial, sans-serif" fill="${C.ink}">D</text>`),
    iron: svg("#f0ecee", `<path d="M10 30h28l-4 8H14z" fill="#8a8f98"/><path d="M14 30l3-10h14l3 10z" fill="#a9aeb6"/><text x="24" y="28" text-anchor="middle" font-size="8" font-weight="700" font-family="Arial, sans-serif" fill="${C.white}">Fe</text>`),
    prenatal: svg("#ffe9ef", `${bottle(C.rose, C.pink, "♥")}`),
    // ---- Endometriose
    painfulSex: svg("#ffe3ea", `${heart(C.rose)}${bolt(32, 16, C.yellow)}`),
    swelling: svg("#fff0e3", `<path d="M14 10c-2 8-2 14 1 20 3 5 13 6 18 1 4-4 3-12-1-16" fill="${C.peach}" stroke="#e8b897" stroke-width="1.5"/><path d="M33 16c4 2 6 4 6 8M38 12c3 2 4 5 4 8" fill="none" stroke="${C.orange}" stroke-width="1.8" stroke-linecap="round"/><circle cx="24" cy="25" r="1.5" fill="#d79a75"/>`),
    endoPain: svg("#f1e7fd", `<path d="M16 14h16c2 0 3 2 2 4l-4 10v8h-8v-8l-4-10c-1-2 0-4 2-4z" fill="${C.purple}"/>${bolt(13, 30, C.yellow)}${bolt(37, 30, C.yellow)}${bolt(24, 20, C.yellow)}`),
    legPain: svg("#fff0e3", `<path d="M18 7h9v18l3 8c1 3 6 3 8 4v3H18l1-6-1-27z" fill="${C.peach}" stroke="#e8b897" stroke-width="1.5" stroke-linejoin="round"/>${bolt(12, 20, C.rose)}${bolt(36, 15, C.rose)}`)
  };

  const GROUPS = [
    ["general", false, [["Krämpfe", "cramps"], ["Kopfschmerzen", "headache"], ["Rückenschmerzen", "back"], ["Brustspannen", "breast"], ["Müdigkeit", "fatigue"], ["Übelkeit", "nausea"], ["Schwindel", "dizzy"], ["Unreine Haut", "skin"], ["Schlafprobleme", "sleep"], ["Stimmungsschwankungen", "swings"], ["Nesselsucht", "hives"], ["Eierstockzyste", "cyst"], ["Mir ist heiß", "hot"], ["Mir ist kalt", "cold"]]],
    ["cravings", false, [["Heißhunger", "cravings"], ["Lust auf Salziges", "salty"], ["Lust auf Süßes", "sweet"], ["Lust auf Schokolade", "chocolate"], ["Lust auf Kohlenhydrate", "carbs"]]],
    ["mucus", false, [["Ausfluss", "discharge"], ["Schleim trocken", "dry"], ["Schleim wässrig", "watery"], ["Schleim eiweißartig", "eggwhite"], ["Schleim cremig", "creamy"], ["Schleim klebrig", "sticky"]]],
    ["gut", false, [["Blähungen", "bloating"], ["Durchfall", "diarrhea"], ["Verstopfung", "constipation"], ["Winde", "gas"]]],
    ["sex", true, [["Sex solo", "solo"], ["Sex geschützt", "protected"], ["Sex ungeschützt", "unprotected"], ["Lust ↑", "libidoUp"], ["Lust ↓", "libidoDown"]]],
    ["activities", false, [["Spontaner Haarschnitt", "haircut"], ["Lesen", "reading"], ["Mittagsschlaf", "napping"], ["Spazieren", "walking"]]],
    ["altered", true, [["Alkohol", "alcohol"], ["Nikotin", "nicotine"], ["Cannabis", "cannabis"], ["Psychedelika", "psychedelics"]]],
    ["disruptors", true, [["Trauma", "trauma"], ["Verletzung", "injury"], ["Biochemische Schwangerschaft", "chemical"], ["Fehlgeburt", "loss"]]],
    ["birthcontrol", true, [["Implantat entfernt", "implantOut"], ["Pille danach", "sos"], ["Sterilisation", "tubes"], ["Coitus interruptus", "withdrawal"]]],
    ["tests", true, [["Schwangerschaftstest positiv", "pregPos"], ["Schwangerschaftstest negativ", "pregNeg"], ["Ovulationstest positiv", "ovuPos"], ["Ovulationstest negativ", "ovuNeg"]]],
    ["meds", true, [["Schmerzmittel", "painkiller"], ["Progesteron", "progesterone"], ["Stimulanzien", "stimulants"], ["Testosteron", "testosterone"]]],
    ["supplements", false, [["Folsäure", "folic"], ["Vitamin D", "vitd"], ["Eisen", "iron"], ["Schwangerschaftsvitamine", "prenatal"]]],
    ["endo", false, [["Schmerzen beim Sex", "painfulSex"], ["Bauchschwellung", "swelling"], ["Endometriose-Schmerzen", "endoPain"], ["Beinschmerzen", "legPain"]]]
  ];

  window.ZYKLUS_SYMPTOM_GROUPS = GROUPS.map(([key, priv, items]) => ({ key, private: priv, items: items.map(([id, k]) => ({ id, key: k, group: key, art: ART[k] })) }));
  window.ZYKLUS_SYMPTOMS = window.ZYKLUS_SYMPTOM_GROUPS.flatMap((g) => g.items);
  // Bild für eigene Einträge: Anfangsbuchstabe auf einem Stern
  window.ZYKLUS_CUSTOM_ART = (label) => {
    const ch = String(label).trim().charAt(0).toUpperCase().replace(/[&<>"']/g, "") || "+";
    return svg("#f1e7fd", `${star(24, 25, 17, C.purple)}<text x="24" y="31" text-anchor="middle" font-size="14" font-weight="700" font-family="Arial, sans-serif" fill="${C.white}">${ch}</text>`);
  };
  window.ZYKLUS_ADD_ART = svg("#f0edf1", `<path d="M24 14v20M14 24h20" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`);
})();
