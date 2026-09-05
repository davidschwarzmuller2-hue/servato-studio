# Servato Studio — Website (normales HTML-Projekt)

Fertige, eigenständige Website. Kein Framework, kein Build-Schritt, keine Abhängigkeiten.
Doppelklick auf `index.html` öffnet sie im Browser — genau so läuft sie später auch auf dem Server.

## Dateien

```
index.html          Startseite: Hero, Website-Check, Marquee, Übersicht der Unterseiten
probleme.html       Die typischen Lücken, nach Branche sortiert
arbeiten.html       Portfolio: drei Bildschirmfotos der Demo-Startseiten
leistungen.html     Was drinsteckt + Vier-Wochen-Ablauf
preise.html         Drei Pakete + Preisrechner
ueber.html          Über mich + Porträt + "Ehrlich gesagt" + volle FAQ
kontakt.html        Formular
impressum.html      Pflichtangaben nach § 5 DDG
datenschutz.html    Datenschutzerklärung
404.html            Wird bei falscher Adresse ausgeliefert

styles/nocturne.css Design-Tokens: Farben, Schriftgrößen, Abstände, Radien, Schatten
styles/site.css     Layout und Aussehen (Klassen wie .hero, .plan, .faq, .pledge, .marquee)
js/app.js           Interaktion: Website-Check, Preisrechner, FAQ, mobiles Menü,
                    Formular, Scroll-Animation
fonts/              Geist + Instrument Serif, lokal — keine Verbindung zu Google
assets/             portrait.jpg, logo-mark.png, favicon.png, og-image-2.png
assets/arbeiten/    Bildschirmfotos der drei Demos, je AVIF + JPG in drei Breiten

_headers            Sicherheits- und Cache-Einstellungen für Netlify
robots.txt          Erlaubt Suchmaschinen alles, verweist auf die Sitemap
sitemap.xml         Liste aller Seiten für Google
```

Grundregel: **Text ändert man in der jeweiligen `*.html`, Aussehen in `styles/site.css`,
Verhalten in `js/app.js`.** Header und Footer stehen identisch in jeder Seite — Änderungen
an ihnen müssen in allen Dateien nachgezogen werden (Suche nach `class="header rule-bottom"`
bzw. `class="wrap footer"`).
Farben und Abstände kommen aus `styles/nocturne.css` — dort die `:root`-Variablen ändern,
dann ändert sich die ganze Seite konsistent. Keine Hex-Werte direkt in `site.css` schreiben,
sondern `var(--color-…)`, `var(--space-…)`, `var(--radius-…)`, `var(--shadow-…)` verwenden.

`js/app.js` prüft am Anfang jedes Blocks, ob die zugehörigen Elemente da sind — dieselbe
Datei läuft auf allen Seiten ohne Anpassung. Der Website-Check startet also nur auf
`index.html`, der Preisrechner nur auf `preise.html`, das Formular nur auf `kontakt.html`.

## Preise ändern

Die Preise stehen an mehreren Stellen und müssen zusammen passen:

| Wo | Was |
|---|---|
| `preise.html` | die drei `.plan__price`-Blöcke, der Betreuungspreis, die `<meta name="description">` |
| `js/app.js` | `BASE_PRICE`, `PER_PAGE` und die `EXTRAS`-Liste des Rechners |
| `index.html` | die Preisspanne in der Karte „Preise" |
| `ueber.html` | zwei FAQ-Antworten (Preisspanne, Betreuung) |
| `leistungen.html` | der Betreuungspreis im Abschnitt „Betreuung nach dem Livegang" |
| `preise.html` | die `hasOfferCatalog`-Preise in den strukturierten Daten im `<head>` |

Faustregel zur Kontrolle: Der Rechner soll bei Standardeinstellung zwischen dem kleinsten
und dem mittleren Paket landen, sonst widersprechen sich Pakete und Rechner.

## Rechtliches

Impressum und Datenschutz sind **eigene Seiten**, kein Overlay. Das ist Absicht:
§ 5 DDG verlangt „leicht erkennbar, unmittelbar erreichbar und ständig verfügbar" —
eine eingeblendete Ebene ohne eigene Adresse erfüllt das nicht sicher, und man kann
den Link nirgends hinschicken (Google-Unternehmensprofil, E-Mail-Signatur, Rechnungen).

Beide Texte sind **juristisch ungeprüft**. Der Umsatzsteuer-Abschnitt steht auf
Kleinunternehmer nach § 19 UStG; fällt die Entscheidung im Fragebogen zur steuerlichen
Erfassung anders aus, muss er geändert werden.

## Suchmaschinen und Link-Vorschau

Im `<head>` jeder Seite stehen:

- `<link rel="canonical">` — sagt Google, welche Adresse die richtige ist.
- Open-Graph-Angaben — erzeugen die Vorschaukarte in WhatsApp, LinkedIn, Signal, Slack.
- Strukturierte Daten (`application/ld+json`) — auf der Startseite die Firmendaten
  (`ProfessionalService` mit Anschrift, Telefon und Einzugsgebiet), auf `ueber.html`
  die FAQ, auf den übrigen Seiten die Brotkrümelnavigation.

**Bei Domainwechsel** muss `https://servato-studio.netlify.app` in allen `*.html`,
in `robots.txt` und in `sitemap.xml` ersetzt werden — am schnellsten mit Suchen-und-Ersetzen
über den ganzen Ordner.

Das Vorschaubild `assets/og-image.png` (1200 × 630) wurde per Skript erzeugt, nicht von
Hand gezeichnet. Steht die Adresse unten im Bild nicht mehr, muss es neu erstellt werden.

## Mit Claude Code arbeiten

1. Ordner öffnen, `claude` starten.
2. Beispiele für Aufträge:
   - „Ändere die Preise auf 990 / 1.890 / 3.400 € — überall, auch im Rechner."
   - „Füge im FAQ zwei Fragen zu Wartungsverträgen hinzu, im gleichen Stil."
   - „Baue eine Seite referenzen.html mit demselben Header und Footer."
3. Zum Anschauen: `python -m http.server 8000` im Ordner starten und
   http://localhost:8000 öffnen.

## Was noch offen ist

- **Porträtfoto** — eingebaut, aber mit Sonnenbrille und Blick von der Kamera weg.
  Für eine Seite, die „eine Person, die Sie kennen und erreichen" verspricht, ist das
  die schwächste Stelle: Vertrauen entsteht über die Augen. Ein Ersatz mit offenem
  Blick in die Kamera wäre der größte Einzelgewinn an dieser Seite.
  Neues Foto: hochkant, dunkler Hintergrund, als `assets/portrait.jpg` ablegen —
  `.lighten` lässt dunkle Bildhintergründe mit der Seite verschmelzen.
- **Rechtstexte juristisch prüfen lassen** (siehe oben).
- **Anschrift in den strukturierten Daten**: In `index.html` steht die Wohnanschrift
  maschinenlesbar als Geschäftsadresse. Das ist für lokales SEO gewollt, sie steht
  ohnehin im Impressum — wer das nicht möchte, entfernt in `index.html` den Block
  `"address"` aus den strukturierten Daten.

## Logo

Aus der Vorlage in `Downloads` wurden zwei Dateien erzeugt, beide freigestellt und
in der Textfarbe der Seite eingefärbt, weil das Original dunkle Tinte auf weißem
Grund ist und auf dem dunklen Seitenhintergrund sonst als weißer Kasten erschiene:

- `assets/logo-mark.png` — nur das Monogramm, transparent, sitzt im Header.
- `assets/favicon.png` — quadratisch auf `#161826`, damit es auch in hellen
  Browser-Tabs Kontrast hat.

Die Wortmarke aus der Vorlage wird nicht verwendet: „Servato Studio" steht im Header
bereits als Text in Inter.

## Schrift

Inter liegt lokal in `fonts/` — die Seite lädt nichts von Google, das spart die
Einwilligung nach DSGVO. Google liefert Inter als Variable Font aus: eine Datei
deckt die Gewichte 400–700 ab, deshalb genügen zwei Dateien (latin, latin-ext).
Neue Gewichte brauchen keine neue Datei, nur `font-weight` im CSS.

## Mobil zuerst

Die Seite wird ab **880 px** breit auf die Desktop-Ansicht umgeschaltet. Darunter gilt:

- Kopfzeile in **einer** Zeile: Logo links, Menüknopf rechts, 72 px hoch. Früher brach die
  Navigation in eine zweite Zeile um — die klebende Kopfzeile war dann 134 px hoch und
  fraß ein Fünftel des Handybildschirms.
- Das Menü-`<div>` steht im HTML **außerhalb** von `<header>`. Läge es darin und bekäme
  der Header je einen `filter` oder `transform`, würde er zum Bezugsrahmen für
  `position: fixed` und das Menü fiele auf Kopfzeilenhöhe zusammen.
- Alle Bedienelemente sind mindestens **44 px** hoch. Ausgenommen sind Links mitten im
  Fließtext — die sind nach WCAG 2.5.8 zulässig.
- Raster immer als `minmax(min(280px, 100%), 1fr)` schreiben, nie `minmax(280px, 1fr)`.
  Sonst erzwingt die Spalte ihre 280 px auch in einem schmaleren Kasten, und ein
  `overflow: hidden` darüber schneidet den Inhalt ab.
- Überschriften haben `hyphens: auto`. Deutsche Komposita sind lang: „Datenschutzerklärung"
  war 400 px breit und sprengte den 335 px schmalen Kasten — die Seite scrollte seitlich.

Geprüft bei 320, 375 und 768 px Breite: kein Querscrollen, kein überlaufender Text,
keine zu kleinen Tippziele.

## Wiederholung vermeiden

Der häufigste Grund, warum die Seite „generisch“ wirkt, ist nicht das Design, sondern
Wiederholung. Zwei Regeln beim Erweitern:

- **Kein Baustein auf zwei Seiten.** `.pledge` gehört zu *Leistungen*, `.klartext` zu
  *Über mich*, `.contact` zu *Kontakt*, `.steps` zum Ablauf. Als „Ehrlich gesagt“ noch
  `.pledge` benutzte, sah der ehrlichste Abschnitt der Seite aus wie eine Leistungsliste.
- **Kein Satz auf zwei Seiten.** Zum Prüfen alle Sätze über 45 Zeichen aus den HTML-Dateien
  ziehen und auf Dopplungen vergleichen — so fielen der komplett kopierte Kontaktblock
  (Start + Kontakt) und das doppelte „45-Minuten-Interview“ (Leistungen + Über mich) auf.

Floskeln, die sich einschleichen und die Seite austauschbar machen: „ohne Verkaufsdruck“,
„unverbindlich“, „ein Ansprechpartner“, „kein Baukasten“. Einmal ist Positionierung,
viermal ist Füllmaterial. Konkret schlägt allgemein: „Kein zweiter Anruf, kein Nachfassen“
ist überprüfbar, „ohne Verkaufsdruck“ ist es nicht.

**Keine Ortsnamen als Verkaufsargument.** Servato Studio arbeitet deutschlandweit; der
Sitz steht nur dort, wo er hingehört (Impressum, Datenschutz). Der Hebel gegen
Beliebigkeit ist stattdessen das Konkrete: „Kein zweiter Anruf, kein Nachfassen“,
„zwei Aufträge gleichzeitig, mehr nicht“, „590 € Onepager“ — überprüfbare Sätze,
die eine Agentur nicht ungestraft abschreiben kann.

## Barrierefreiheit

Beim Erweitern bitte fortführen:

- Jede Seite beginnt mit einer Sprungmarke (`.skip-link`) zum `<main id="inhalt">`.
- Die aktive Seite trägt in der Navigation `aria-current="page"`, nicht nur `class="active"`.
- Aufklappbares braucht `aria-expanded`; was zugeklappt ist, wird per `inert` aus
  Tastatur und Screenreader genommen (siehe FAQ in `js/app.js`).
- Bereiche, deren Inhalt sich per JavaScript ändert, tragen `aria-live="polite"`.
- Nebentext nicht heller als `.muted-3` setzen — darunter reißt der Kontrast
  unter die 4,5:1, die für kleinen Text gelten.

## Formular

Das Formular ist auf **Netlify Forms** eingestellt. Es sendet per JavaScript im
Hintergrund, der Besucher bleibt auf der Seite und sieht eine Dankesmeldung. Geht der
Versand schief, erscheint ein Hinweis mit E-Mail und Telefon als Ausweichweg — es geht
also nie eine Anfrage verloren.

**Damit Anfragen ankommen, sobald die Seite auf Netlify liegt:**

1. Seite bei Netlify veröffentlichen. Beim ersten Deploy erkennt Netlify das Formular
   automatisch (am Attribut `data-netlify="true"` und am versteckten `form-name`-Feld).
2. Im Netlify-Dashboard: **Forms → Form notifications → Add notification →
   Email notification**, die Adresse `servatostudio@gmail.com` eintragen.
   Ohne diesen Schritt sammelt Netlify die Anfragen zwar, schickt aber keine Mail.
3. Eine Testanfrage abschicken und prüfen, dass sie unter **Forms** auftaucht.

Lokal (per Doppelklick oder `python -m http.server`) kann das Formular nicht senden —
dort erscheint immer der Ausweich-Hinweis. Das ist normal; scharf ist es erst auf Netlify.

**Anderer Host als Netlify?** Dann statt Netlify einen Dienst wie Formspree nehmen:
am `<form>` `action="https://formspree.io/f/DEIN-CODE"` setzen und in `js/app.js` in der
`fetch`-Zeile das `'/'` durch dieselbe Adresse ersetzen. Der Rest bleibt gleich.
Wichtig: Dann muss in `_headers` die Zeile `form-action 'self'` um die neue Adresse
ergänzt werden, sonst blockiert der Browser den Versand.

## Veröffentlichen

Der Ordner ist eine statische Website — jeder dieser Wege funktioniert ohne Anpassung:

- **Netlify / Cloudflare Pages / Vercel**: Ordner ins Browserfenster ziehen, fertig.
  Wichtig beim Zippen: den **Inhalt** des Ordners packen, nicht den Ordner selbst —
  sonst liegt `index.html` eine Ebene zu tief und Netlify zeigt eine leere Seite.
- **Klassisches Webhosting**: alle Dateien per FTP ins Web-Verzeichnis, Struktur beibehalten.
  `_headers` wirkt dort nicht, das ist eine Netlify-Datei.
- **GitHub Pages**: Repository anlegen, Ordnerinhalt pushen, Pages aktivieren.

## Herkunft

Diese Version wurde aus dem Design-Entwurf `Servato Studio.dc.html` übertragen.
Das Design folgt dem Nocturne-System (dunkler Grund, ein Akzentviolett als Linie und Glow,
umrandete statt gefüllte Buttons, Inter in Gewicht 500 für Überschriften) — beim Erweitern
bitte diese Regeln fortführen.
