/* IQ-Test — Aufgaben.

   Jede Aufgabe: id, Kategorie (cat), Schwierigkeit 1–5 (level), Frage
   (prompt), optional eine Abbildung (figure), die Antwortmöglichkeiten
   (options) und die Erklärung (why) für die Auswertung.

   WICHTIG: options[0] ist immer die richtige Antwort. Die Reihenfolge wird
   beim Start des Tests gemischt — hier also nicht umsortieren, sondern die
   richtige Antwort vorne lassen.

   Bausteine für Figuren:
     G(form, füllung, anzahl, drehung)  Formen. Füllung: 'o' leer, 's' schraffiert, 'x' voll
     L('T','V', …)                      Linien in einem Quadrat: T oben, B unten, L links,
                                        R rechts, D1 Diagonale \, D2 Diagonale /,
                                        V senkrechte Mitte, H waagerechte Mitte
     P(punkt, quadrat)                  Positionen auf dem Rand eines 3×3-Rasters,
                                        0 = oben links, dann im Uhrzeigersinn bis 7
     Raumfiguren: Kästchen [x, y] plus ein markiertes Kästchen (mark),
                  Antworten als { rot: Vierteldrehungen im Uhrzeigersinn, mir: gespiegelt } */

(function () {
  const G = (s, f = 'o', n = 1, r = 0) => ({ k: 'g', s, f, n, r });
  const L = (...v) => ({ k: 'seg', v });
  const P = (d, b) => ({ k: 'ring', d, b });

  const matrix = (cells) => ({ type: 'matrix', cells });

  const F_PENT = { cells: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] };
  const L_TET  = { cells: [[0, 0], [0, 1], [0, 2], [1, 2]], mark: 0 };
  const N_PENT = { cells: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], mark: 4 };
  const HEX    = { cells: [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2], [1, 3]], mark: 3 };

  window.IQ_CATEGORIES = {
    matrix: 'Figurenmatrizen',
    zahlen: 'Zahlenreihen',
    logik:  'Logik & Sprache',
    raum:   'Räumliches Denken'
  };

  window.IQ_ITEMS = [
    {
      id: 'm-anzahl', cat: 'matrix', level: 1,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        G('circle', 'o', 1),   G('circle', 'o', 2),   G('circle', 'o', 3),
        G('square', 'o', 1),   G('square', 'o', 2),   G('square', 'o', 3),
        G('triangle', 'o', 1), G('triangle', 'o', 2)
      ]),
      options: [G('triangle', 'o', 3), G('triangle', 'o', 2), G('square', 'o', 3), G('triangle', 'x', 3), G('triangle', 'o', 4), G('circle', 'o', 3)],
      why: 'In jeder Zeile bleibt die Form gleich, die Anzahl steigt von 1 auf 3. Unten rechts gehören also drei leere Dreiecke hin.'
    },
    {
      id: 'z-doppelt', cat: 'zahlen', level: 1,
      prompt: 'Welche Zahl setzt die Reihe fort?',
      figure: { type: 'series', text: '3 · 6 · 12 · 24 · ?' },
      options: ['48', '36', '42', '30', '72', '96'],
      why: 'Jede Zahl ist das Doppelte der vorigen: 24 × 2 = 48.'
    },
    {
      id: 'l-passt-nicht', cat: 'logik', level: 1,
      prompt: 'Welches Wort passt nicht zu den anderen?',
      options: ['Fledermaus', 'Adler', 'Spatz', 'Pinguin', 'Amsel'],
      why: 'Alle anderen sind Vögel, die Fledermaus ist ein Säugetier. Der Pinguin ist die Falle: Er kann nicht fliegen, ist aber trotzdem ein Vogel.'
    },
    {
      id: 'm-fuellung', cat: 'matrix', level: 1,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        G('diamond', 'o'), G('diamond', 's'), G('diamond', 'x'),
        G('hexagon', 'o'), G('hexagon', 's'), G('hexagon', 'x'),
        G('circle', 'o'),  G('circle', 's')
      ]),
      options: [G('circle', 'x'), G('circle', 's'), G('circle', 'o'), G('hexagon', 'x'), G('square', 'x'), G('circle', 'x', 2)],
      why: 'Die Füllung wechselt in jeder Zeile von leer über schraffiert zu voll, die Form bleibt gleich. Es fehlt ein voller Kreis.'
    },
    {
      id: 'r-drehen', cat: 'raum', level: 2,
      prompt: 'Die Figur wird um 90° im Uhrzeigersinn gedreht. Wie sieht sie danach aus?',
      figure: { type: 'shape', shape: F_PENT },
      shape: F_PENT,
      options: [{ rot: 1 }, { rot: 3 }, { rot: 2 }, { rot: 1, mir: true }, { rot: 0, mir: true }, { rot: 3, mir: true }],
      why: 'Eine Vierteldrehung nach rechts: Was oben war, zeigt danach nach rechts. Die Antworten mit Spiegelung oder Drehung in die andere Richtung sehen ähnlich aus, passen aber nicht Kästchen für Kästchen.'
    },
    {
      id: 'z-abstaende', cat: 'zahlen', level: 2,
      prompt: 'Welche Zahl setzt die Reihe fort?',
      figure: { type: 'series', text: '2 · 5 · 9 · 14 · 20 · ?' },
      options: ['27', '26', '28', '25', '30', '24'],
      why: 'Die Abstände wachsen jeweils um eins: +3, +4, +5, +6 und dann +7. 20 + 7 = 27.'
    },
    {
      id: 'm-drehung', cat: 'matrix', level: 2,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        G('arrow', 'o', 1, 0),   G('arrow', 'o', 1, 45),  G('arrow', 'o', 1, 90),
        G('arrow', 'o', 1, 90),  G('arrow', 'o', 1, 135), G('arrow', 'o', 1, 180),
        G('arrow', 'o', 1, 180), G('arrow', 'o', 1, 225)
      ]),
      options: [G('arrow', 'o', 1, 270), G('arrow', 'o', 1, 225), G('arrow', 'o', 1, 315), G('arrow', 'o', 1, 90), G('arrow', 'o', 1, 180), G('arrow', 'x', 1, 270)],
      why: 'Der Pfeil dreht sich von Feld zu Feld um 45° im Uhrzeigersinn, und jede Zeile beginnt 90° weiter als die vorige. Nach 225° kommt 270°: Der Pfeil zeigt nach links.'
    },
    {
      id: 'l-regen', cat: 'logik', level: 2,
      prompt: 'Wenn es regnet, ist die Straße nass. Die Straße ist nicht nass. Was folgt daraus sicher?',
      options: ['Es regnet nicht.', 'Es regnet.', 'Es hat vorhin geregnet.', 'Daraus folgt nichts Sicheres.'],
      why: 'Würde es regnen, wäre die Straße nass. Sie ist es nicht — also kann es nicht regnen. Über die Vergangenheit sagt der Satz nichts.'
    },
    {
      id: 'm-ueberlagern', cat: 'matrix', level: 2,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        L('T'),       L('V'),      L('T', 'V'),
        L('L', 'D1'), L('H'),      L('L', 'D1', 'H'),
        L('B', 'D2'), L('R', 'V')
      ]),
      options: [L('B', 'D2', 'R', 'V'), L('B', 'D2', 'R'), L('B', 'D2', 'R', 'V', 'H'), L('D2', 'R', 'V'), L('B', 'D1', 'R', 'V'), L('B', 'D2', 'L', 'V')],
      why: 'Das dritte Feld jeder Zeile ist die Überlagerung der ersten beiden. Unten + Diagonale / und rechts + Mitte senkrecht ergibt vier Linien.'
    },
    {
      id: 'z-wechsel', cat: 'zahlen', level: 2,
      prompt: 'Welche Zahl setzt die Reihe fort?',
      figure: { type: 'series', text: '4 · 9 · 7 · 12 · 10 · 15 · ?' },
      options: ['13', '20', '12', '18', '17', '11'],
      why: 'Abwechselnd +5 und −2. Nach 15 ist wieder −2 dran: 13.'
    },
    {
      id: 'r-nicht-gespiegelt', cat: 'raum', level: 3,
      prompt: 'Welche Figur ist dieselbe wie oben — nur gedreht, nicht gespiegelt?',
      figure: { type: 'shape', shape: L_TET },
      shape: L_TET,
      options: [{ rot: 2 }, { rot: 0, mir: true }, { rot: 1, mir: true }, { rot: 2, mir: true }, { rot: 3, mir: true }],
      why: 'Die richtige Figur ist um 180° gedreht. Alle anderen sind Spiegelbilder — egal wie man sie dreht, sie lassen sich nicht zur Deckung bringen.'
    },
    {
      id: 'm-latein', cat: 'matrix', level: 3,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        G('circle', 'o'),   G('square', 's'),   G('triangle', 'x'),
        G('square', 'x'),   G('triangle', 'o'), G('circle', 's'),
        G('triangle', 's'), G('circle', 'x')
      ]),
      options: [G('square', 'o'), G('square', 'x'), G('square', 's'), G('triangle', 'o'), G('circle', 'o'), G('square', 'o', 2)],
      why: 'Jede Form und jede Füllung kommt in jeder Zeile und jeder Spalte genau einmal vor. In der letzten Zeile fehlen das Quadrat und die leere Füllung.'
    },
    {
      id: 'l-reihenfolge', cat: 'logik', level: 3,
      prompt: 'Anna ist größer als Ben. Clara ist kleiner als Ben. David ist größer als Anna. Wer ist am zweitkleinsten?',
      options: ['Ben', 'Anna', 'Clara', 'David', 'Nicht bestimmbar'],
      why: 'Von groß nach klein: David, Anna, Ben, Clara. Die Zweitkleinste ist also Ben.'
    },
    {
      id: 'z-mal-zwei', cat: 'zahlen', level: 3,
      prompt: 'Welche Zahl setzt die Reihe fort?',
      figure: { type: 'series', text: '2 · 3 · 5 · 9 · 17 · ?' },
      options: ['33', '25', '34', '32', '31', '35'],
      why: 'Jede Zahl mal zwei minus eins: 17 × 2 − 1 = 33. Anders gesehen: Die Abstände verdoppeln sich (+1, +2, +4, +8, +16).'
    },
    {
      id: 'm-summe', cat: 'matrix', level: 3,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        G('circle', 'o', 2),  G('circle', 'o', 1),  G('circle', 'o', 3),
        G('square', 'o', 1),  G('square', 'o', 1),  G('square', 'o', 2),
        G('hexagon', 'o', 3), G('hexagon', 'o', 2)
      ]),
      options: [G('hexagon', 'o', 5), G('hexagon', 'o', 4), G('hexagon', 'o', 6), G('hexagon', 'o', 3), G('square', 'o', 5), G('hexagon', 's', 5)],
      why: 'Die Anzahl im dritten Feld ist die Summe der ersten beiden: 2 + 1 = 3, 1 + 1 = 2, 3 + 2 = 5.'
    },
    {
      id: 'l-sprachen', cat: 'logik', level: 3,
      prompt: 'In einer Gruppe sprechen 18 Personen Englisch, 12 Französisch und 5 beide Sprachen. Jede Person spricht mindestens eine der beiden. Wie viele Personen sind in der Gruppe?',
      options: ['25', '30', '35', '23', '20'],
      why: 'Die 5 Personen, die beide Sprachen sprechen, sind in den 18 und in den 12 enthalten — sie dürfen nur einmal gezählt werden: 18 + 12 − 5 = 25.'
    },
    {
      id: 'r-gespiegelt', cat: 'raum', level: 3,
      prompt: 'Vier dieser Figuren sind dieselbe, nur gedreht. Welche ist gespiegelt?',
      shape: N_PENT,
      options: [{ rot: 1, mir: true }, { rot: 0 }, { rot: 1 }, { rot: 2 }, { rot: 3 }],
      why: 'Vier Figuren lassen sich durch Drehen zur Deckung bringen, eine nicht. Hilfe: Folge vom markierten Kästchen aus dem Verlauf der Figur — nur beim Spiegelbild knickt sie zur anderen Seite ab.'
    },
    {
      id: 'm-abziehen', cat: 'matrix', level: 4,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        L('T', 'B', 'L', 'R', 'D1'), L('L', 'R'),  L('T', 'B', 'D1'),
        L('V', 'H', 'D1', 'D2'),     L('D1', 'H'), L('V', 'D2'),
        L('T', 'L', 'V', 'D2', 'H'), L('T', 'H')
      ]),
      options: [L('L', 'V', 'D2'), L('L', 'V', 'D2', 'T'), L('T', 'H'), L('L', 'V'), L('L', 'D2', 'H'), L('L', 'V', 'D1')],
      why: 'Vom ersten Feld werden die Linien des zweiten abgezogen. Übrig bleiben links, die senkrechte Mitte und die Diagonale /.'
    },
    {
      id: 'z-quadrate', cat: 'zahlen', level: 4,
      prompt: 'Welche Zahl setzt die Reihe fort?',
      figure: { type: 'series', text: '3 · 4 · 8 · 17 · 33 · ?' },
      options: ['58', '49', '57', '66', '50', '65'],
      why: 'Die Abstände sind Quadratzahlen: +1, +4, +9, +16 und dann +25. 33 + 25 = 58.'
    },
    {
      id: 'm-drei-merkmale', cat: 'matrix', level: 4,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        G('circle', 'o', 1),   G('triangle', 's', 2), G('square', 'x', 3),
        G('triangle', 'x', 3), G('square', 'o', 1),   G('circle', 's', 2),
        G('square', 's', 2),   G('circle', 'x', 3)
      ]),
      options: [G('triangle', 'o', 1), G('triangle', 's', 1), G('triangle', 'o', 2), G('square', 'o', 1), G('triangle', 'o', 3), G('circle', 'x', 1)],
      why: 'Drei Merkmale — Form, Anzahl und Füllung — kommen je Zeile und Spalte genau einmal vor, unabhängig voneinander. Es fehlen: Dreieck, eins, leer.'
    },
    {
      id: 'l-blips', cat: 'logik', level: 4,
      prompt: 'Alle Blips sind Blops. Einige Blops sind Blups. Folgt daraus zwingend, dass einige Blips Blups sind?',
      options: ['Nein, das folgt nicht zwingend.', 'Ja, das folgt zwingend.', 'Ja — sogar alle Blips sind Blups.', 'Nein — kein Blip kann ein Blup sein.'],
      why: 'Die Blops, die Blups sind, können genau die Blops sein, die keine Blips sind. Möglich ist es also — zwingend nicht. Und ausschließen kann man es ebenso wenig.'
    },
    {
      id: 'r-nicht-gespiegelt-2', cat: 'raum', level: 4,
      prompt: 'Welche Figur ist dieselbe wie oben — nur gedreht, nicht gespiegelt?',
      figure: { type: 'shape', shape: HEX },
      shape: HEX,
      options: [{ rot: 3 }, { rot: 0, mir: true }, { rot: 1, mir: true }, { rot: 2, mir: true }, { rot: 3, mir: true }],
      why: 'Die richtige Figur ist um 90° gegen den Uhrzeigersinn gedreht. Die übrigen vier sind Spiegelbilder in verschiedenen Lagen.'
    },
    {
      id: 'm-wandern', cat: 'matrix', level: 5,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        P(0, 6), P(1, 5), P(2, 4),
        P(3, 1), P(4, 0), P(5, 7),
        P(6, 4), P(7, 3)
      ]),
      options: [P(0, 2), P(0, 3), P(1, 2), P(7, 2), P(0, 4), P(2, 0)],
      why: 'Der Punkt wandert mit jedem Feld eine Position im Uhrzeigersinn am Rand entlang, das Quadrat in jeder Zeile eine Position gegen den Uhrzeigersinn. Ergebnis: Punkt oben links, Quadrat oben rechts.'
    },
    {
      id: 'z-mal-minus', cat: 'zahlen', level: 5,
      prompt: 'Welche Zahl setzt die Reihe fort?',
      figure: { type: 'series', text: '2 · 6 · 3 · 9 · 6 · 18 · ?' },
      options: ['15', '9', '12', '54', '21', '36'],
      why: 'Abwechselnd × 3 und − 3: 2 → 6 → 3 → 9 → 6 → 18 → 15.'
    },
    {
      id: 'm-entweder-oder', cat: 'matrix', level: 5,
      prompt: 'Welche Figur ergänzt die Matrix?',
      figure: matrix([
        L('T', 'L', 'D1'),       L('T', 'R'),       L('L', 'D1', 'R'),
        L('V', 'H', 'B'),        L('H', 'D2'),      L('V', 'B', 'D2'),
        L('T', 'B', 'D1', 'D2'), L('B', 'V', 'D1')
      ]),
      options: [L('T', 'D2', 'V'), L('T', 'B', 'D1', 'D2', 'V'), L('B', 'D1'), L('T', 'D2'), L('T', 'D2', 'V', 'H'), L('T', 'D1', 'V')],
      why: 'Linien, die in beiden ersten Feldern vorkommen, verschwinden; alle anderen bleiben (entweder–oder). Übrig bleiben oben, die Diagonale / und die senkrechte Mitte.'
    }
  ];
})();
