# Zyklus – einfache, kostenlose Perioden-App

Eine schlichte Web-App (PWA) für iPhone und iPad:

- **Zyklus tracken**: Periode eintragen, Vorhersage der nächsten Periode, fruchtbare Tage und Eisprung (geschätzt)
- **Symptome & Stimmung** pro Tag
- **Notizen & Gedanken**: jede Notiz ist entweder 🔒 **privat** oder 👥 **für den Partner**
- **Partner-Ansicht**: Der Partner sieht den Zyklus und, nur wenn sie es erlaubt, auch Symptome und Notizen „Für Partner“
- Läuft offline, ohne Konto und ohne Werbung, komplett kostenlos

> Die App ersetzt keine ärztliche Beratung und ist **kein Verhütungsmittel**.

## Warum eine Web-App statt App Store?

Für den App Store bräuchte man einen Mac mit Xcode und ein Apple-Entwicklerkonto (99 €/Jahr).
Eine PWA kostet nichts und funktioniert auf iPhone und iPad trotzdem wie eine richtige App:
eigenes Icon auf dem Home-Bildschirm, Vollbild und offline nutzbar.

## Datenschutz

- Alle Daten liegen **lokal auf dem Gerät**.
- Beim Teilen wird eine Kopie **auf dem Gerät verschlüsselt** (AES-256-GCM) und erst dann hochgeladen.
  Der Schlüssel steckt nur im Freigabe-Code, der Server sieht nur unlesbaren Zeichensalat.
- **Private Notizen werden niemals hochgeladen.**
- Mit „Freigabe beenden“ werden die Daten vom Server gelöscht und der Code ist ungültig.

---

## 1. App kostenlos online stellen (GitHub Pages)

Eine PWA muss über **https** erreichbar sein. Am einfachsten geht das so:

1. Kostenloses Konto auf <https://github.com> anlegen.
2. Neues **öffentliches** Repository anlegen, z. B. `zyklus`.
3. Den kompletten Inhalt dieses Ordners hochladen („Add file → Upload files“).
   Der Ordner `.claude` wird nicht benötigt.
4. Im Repository: **Settings → Pages → Branch: `main` / root → Save**.
5. Nach ca. 1 Minute ist die App unter `https://<dein-name>.github.io/zyklus/` erreichbar.

Alternativ funktionieren auch Netlify oder Cloudflare Pages (Ordner einfach per Drag & Drop hochladen).

## 2. Auf dem iPhone / iPad installieren

1. Die Adresse in **Safari** öffnen.
2. Auf **Teilen** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** tippen.
3. Die App über das neue Icon starten.

> Wichtig: Die App immer über das Icon auf dem Home-Bildschirm öffnen. Safari und die installierte
> App haben getrennte Speicher.

## 3. Partner-Freigabe einrichten (einmalig, kostenlos)

Ohne diesen Schritt funktioniert alles außer dem Teilen.

1. Kostenloses Konto auf <https://supabase.com> anlegen und ein **neues Projekt** erstellen
   (Region z. B. Frankfurt).
2. Im Projekt: **SQL Editor → New query**, den Inhalt von [`supabase/schema.sql`](supabase/schema.sql)
   einfügen und auf **Run** klicken.
3. Unter **Project Settings → API** (bzw. „Data API“ / „API Keys“) diese beiden Werte kopieren:
   - **Project URL** (z. B. `https://abcdefgh.supabase.co`)
   - **anon / public key** (der lange Schlüssel, **nicht** der `service_role`-Schlüssel!)
4. Beide Werte in [`config.js`](config.js) eintragen und die Datei erneut hochladen.

Hinweis: Supabase pausiert kostenlose Projekte nach 7 Tagen ohne Aktivität. Bei regelmäßiger
Nutzung passiert das nicht, und ein pausiertes Projekt lässt sich im Dashboard mit einem Klick fortsetzen.

## 4. So funktioniert das Teilen

1. **Sie** öffnet den Tab **Partner → Teilen aktivieren** und schickt ihm den Freigabe-Code
   (Kopieren oder „Senden…“, z. B. per iMessage).
2. **Er** installiert die App ebenfalls, wählt **„Ich bin Partner:in“** und fügt den Code ein.
3. Sie entscheidet per Schalter, ob er zusätzlich **Symptome & Stimmung** und **Notizen „Für Partner“** sieht.
   Jede Notiz kann jederzeit zwischen privat und „Für Partner“ umgeschaltet werden.
4. Änderungen werden automatisch hochgeladen. Er sieht sie beim nächsten Öffnen oder über „Aktualisieren“.

## Datensicherung

Die Daten liegen nur auf dem Gerät. Unter **Einstellungen → Exportieren** lässt sich ab und zu
eine Sicherung (JSON-Datei) z. B. in iCloud Drive speichern und bei Bedarf wieder importieren.

## Lokal testen (am PC)

```bash
python -m http.server 8080
```

Dann <http://localhost:8080> im Browser öffnen.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Grundgerüst der App |
| `app.js` | Logik: Zyklusberechnung, Einträge, Verschlüsselung, Teilen |
| `i18n.js` | Alle Texte auf Deutsch und Englisch |
| `symptoms.js` | Symptome mit ihren kleinen Bildern |
| `styles.css` | Design (hell & dunkel, iPhone & iPad) |
| `config.js` | Supabase-Zugangsdaten für die Partner-Freigabe |
| `sw.js` | Offline-Funktion |
| `manifest.webmanifest`, `icons/` | App-Name und Icons für den Home-Bildschirm |
| `supabase/schema.sql` | Datenbank für die Partner-Freigabe |

Wenn du Dateien änderst, erhöhe in `sw.js` die Versionsnummer (z. B. `zyklus-v3` → `zyklus-v4`),
damit installierte Apps das Update sicher bekommen.
