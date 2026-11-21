// Symptome mit eigenen kleinen Illustrationen.
// "id" ist der gespeicherte Wert und darf nicht geändert werden, sonst passen alte Einträge nicht mehr.
(() => {
  const C = { rose: "#e0466f", pink: "#f58aa7", peach: "#ffd9c2", yellow: "#ffc94d", mint: "#62cdbd", green: "#9bd770", blue: "#6fafef", purple: "#a98bea", ink: "#5b3a4a", white: "#ffffff", grey: "#b9aeb5" };
  const svg = (bg, body) => `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="${bg}"/>${body}</svg>`;
  const eyes = `<circle cx="19" cy="25" r="1.8" fill="${C.ink}"/><circle cx="29" cy="25" r="1.8" fill="${C.ink}"/>`;
  const line = `fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"`;

  const ART = {
    cramps: svg("#ffe3ea", `<path d="M9 14c4-4 8-1 11 3h8c3-4 7-7 11-3 2 3-1 6-4 6-3 0-4 2-4 5 0 4-3 6-3 9v5h-8v-5c0-3-3-5-3-9 0-3-1-5-4-5-3 0-6-3-4-6z" fill="${C.pink}"/><path d="M26 15l-7 11h5l-2 9 8-12h-5l3-8z" fill="${C.yellow}" stroke="${C.white}" stroke-width="1" stroke-linejoin="round"/>`),
    headache: svg("#fff0cf", `<circle cx="24" cy="28" r="13" fill="${C.peach}"/>${eyes}<path d="M19 35c3-3 7-3 10 0" ${line}/><path d="M15 4l-3 7h4l-2 6 6-8h-4l2-5z" fill="${C.rose}"/><path d="M34 4l-3 7h4l-2 6 6-8h-4l2-5z" fill="${C.rose}"/>`),
    back: svg("#e6e0fb", `<g fill="${C.purple}"><rect x="17" y="7" width="14" height="6" rx="3"/><rect x="15" y="15" width="16" height="6" rx="3"/><rect x="16" y="23" width="16" height="6" rx="3"/><rect x="17" y="31" width="16" height="6" rx="3"/></g><path d="M36 15l1.8 4 4.2.6-3 3 .7 4.3-3.7-2-3.7 2 .7-4.3-3-3 4.2-.6z" fill="${C.rose}" stroke="${C.white}" stroke-width="1"/>`),
    bloating: svg("#dcf4f0", `<ellipse cx="24" cy="21" rx="13" ry="14" fill="${C.mint}"/><path d="M21 35h6l-3-3z" fill="${C.mint}"/><path d="M24 35c-3 3 3 4 0 8" ${line}/><ellipse cx="19" cy="15" rx="3" ry="4.5" fill="${C.white}" opacity=".65"/>`),
    breast: svg("#ffe3ea", `<path d="M7 18l7-9M41 18l-7-9" fill="none" stroke="${C.rose}" stroke-width="2.5" stroke-linecap="round"/><path d="M6 19c5-3 13-2 18 6 5-8 13-9 18-6-1 11-7 17-13 16-3 0-5-3-5-5 0 2-2 5-5 5-6 1-12-5-13-16z" fill="${C.pink}"/><circle cx="24" cy="26" r="2.5" fill="${C.rose}"/>`),
    fatigue: svg("#e3effc", `<rect x="8" y="16" width="29" height="17" rx="4" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/><rect x="38" y="21" width="3" height="7" rx="1.5" fill="${C.ink}"/><rect x="11" y="19" width="6" height="11" rx="2" fill="${C.rose}"/>`),
    nausea: svg("#e8f6d9", `<circle cx="24" cy="24" r="15" fill="${C.green}"/><path d="M16 21l5 2M32 21l-5 2" ${line}/><path d="M15 32c2-3 4-3 6 0s4 3 6 0 4-3 6 0" ${line}/>`),
    skin: svg("#ffeadd", `<circle cx="24" cy="24" r="15" fill="${C.peach}"/>${eyes}<path d="M20 32c3 2 5 2 8 0" ${line}/><g fill="${C.rose}"><circle cx="14.5" cy="30" r="2"/><circle cx="33" cy="31" r="1.8"/><circle cx="31" cy="15" r="1.6"/><circle cx="18" cy="15" r="1.4"/></g>`),
    cravings: svg("#fff0cf", `<circle cx="24" cy="24" r="16" fill="#d99a63"/><path d="M9 22c1-8 8-14 15-14s14 6 15 14c-2 3-4 0-6 2s-3 5-6 3-4 1-6 0-3-4-6-3-4 1-6-2z" fill="${C.pink}"/><circle cx="24" cy="24" r="5.5" fill="#fff0cf"/><g stroke-width="2" stroke-linecap="round"><path d="M16 15l2 1" stroke="${C.yellow}"/><path d="M30 13l1 2" stroke="${C.white}"/><path d="M33 20l2-1" stroke="${C.mint}"/><path d="M14 21l1-2" stroke="${C.white}"/></g>`),
    sleep: svg("#3f3a66", `<path d="M30 9a15 15 0 1 0 9 24A17 17 0 0 1 30 9z" fill="${C.yellow}"/><path d="M31 14h6l-6 7h6" fill="none" stroke="${C.white}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="1.3" fill="${C.white}"/>`),
    swings: svg("#e3effc", `<circle cx="17" cy="17" r="7" fill="${C.yellow}"/><g stroke="${C.yellow}" stroke-width="2" stroke-linecap="round"><path d="M17 5v2M5 17h2M8.5 8.5l1.5 1.5M25.5 8.5L24 10M8.5 25.5l1.5-1.5"/></g><path d="M18 34a6 6 0 0 1 1-12 8 8 0 0 1 15 1 5.5 5.5 0 0 1 1 11z" fill="${C.white}" stroke="${C.grey}" stroke-width="1.5"/><path d="M23 37l-1 4M30 37l-1 4" stroke="${C.blue}" stroke-width="2.2" stroke-linecap="round"/>`),
    discharge: svg("#e3effc", `<path d="M19 9c5 7 9 11 9 17a9 9 0 0 1-18 0c0-6 4-10 9-17z" fill="${C.blue}"/><path d="M34 22c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill="#a9d0f7"/><path d="M14 27a5 5 0 0 0 4 5" fill="none" stroke="${C.white}" stroke-width="2" stroke-linecap="round"/>`),
    libidoUp: svg("#ffe3ea", `<path d="M21 39C9 31 6 24 7 18c1-7 10-9 14-2 4-7 13-5 14 2 1 6-2 13-14 21z" fill="${C.rose}"/><path d="M36 31V19M31 24l5-5 5 5" fill="none" stroke="${C.mint}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    libidoDown: svg("#efeaec", `<path d="M21 39C9 31 6 24 7 18c1-7 10-9 14-2 4-7 13-5 14 2 1 6-2 13-14 21z" fill="${C.grey}"/><path d="M36 19v12M31 26l5 5 5-5" fill="none" stroke="${C.rose}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`)
  };

  window.ZYKLUS_SYMPTOMS = [
    ["Krämpfe", "cramps"], ["Kopfschmerzen", "headache"], ["Rückenschmerzen", "back"], ["Blähungen", "bloating"],
    ["Brustspannen", "breast"], ["Müdigkeit", "fatigue"], ["Übelkeit", "nausea"], ["Unreine Haut", "skin"],
    ["Heißhunger", "cravings"], ["Schlafprobleme", "sleep"], ["Stimmungsschwankungen", "swings"], ["Ausfluss", "discharge"],
    ["Lust ↑", "libidoUp"], ["Lust ↓", "libidoDown"]
  ].map(([id, key]) => ({ id, key, art: ART[key] }));
})();
