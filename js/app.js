/* Servato Studio — Interaktion.
   Alles ohne Framework. Blöcke: Website-Check, Preisrechner, FAQ,
   Kontaktformular, Scroll-Animation.

   Impressum und Datenschutz sind bewusst KEIN JavaScript-Overlay, sondern
   eigene Seiten (impressum.html, datenschutz.html) — sie müssen nach
   § 5 DDG auch ohne JavaScript erreichbar sein und eine eigene URL haben.

   Multi-Page: jeder Block prüft am Anfang, ob seine Elemente existieren,
   damit dieselbe app.js auf allen Seiten ohne Fehler laufen kann. */

const euro = n => n.toLocaleString('de-DE') + ' €';
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =====================================================================
   1) Website-Check — verzweigt nach der ersten Frage in zwei Wege
   ===================================================================== */

(function initCheck() {
  if (!$('[data-check-ask]')) return;

  const TOTAL_STEPS = 4;

  const START = {
    q: 'Wie sind Sie im Internet aufgestellt?',
    hint: 'Danach kommen nur Fragen, die zu Ihrer Lage passen.',
    options: [
      { label: 'Noch gar nicht, keine Seite und kein Eintrag', score: 0, path: 'ohne',
        note: 'Wer Sie nicht kennt, findet Sie im Netz derzeit nicht.' },
      { label: 'Nur ein Google-Eintrag oder Social Media', score: 8, path: 'ohne',
        note: 'Ihre Sichtbarkeit ist geliehen. Wie Sie dargestellt werden, entscheidet die Plattform.' },
      { label: 'Eine Website, aber in die Jahre gekommen', score: 10, path: 'seite',
        note: 'Eine veraltete Seite kostet Vertrauen: Besucher schließen von der Seite auf den Betrieb.' },
      { label: 'Eine Website, mit der ich zufrieden bin', score: 22, path: 'seite', good: true,
        note: 'Sie haben eine Seite, hinter der Sie stehen. Das ist die beste Ausgangslage.' }
    ]
  };

  const PFAD_OHNE = [
    {
      q: 'Wie kommen neue Kunden heute zu Ihnen?',
      hint: 'Wenn mehreres zutrifft: der wichtigste Weg.',
      options: [
        { label: 'Fast nur Empfehlung und Laufkundschaft', score: 6,
          note: 'Empfehlung ist wertvoll, aber nicht steuerbar. Wächst Ihr Betrieb, wächst sie nicht mit.' },
        { label: 'Über Google Maps oder Branchenverzeichnisse', score: 12,
          note: 'Ihr Google-Eintrag bringt Leute. Nur endet ihr Weg dort, wo andere weiterführende Infos hätten.' },
        { label: 'Über Instagram oder Facebook', score: 12,
          note: 'Social Media erreicht, wer Ihnen schon folgt. Wer Sie gerade sucht, sucht bei Google.' },
        { label: 'Über Portale und Vergleichsseiten', score: 9,
          note: 'Portale vermitteln gegen Provision und stellen Sie neben Ihre Konkurrenz. Ein eigener Auftritt gehört Ihnen.' }
      ]
    },
    {
      q: 'Wie oft hören Sie „Ich habe Sie im Netz nicht gefunden“?',
      hint: 'Auch am Telefon oder im Gespräch vor Ort.',
      options: [
        { label: 'Das kommt regelmäßig vor', score: 2,
          note: 'Wenn Kunden das aussprechen, haben viele andere schon vorher aufgegeben.' },
        { label: 'Ab und zu', score: 8,
          note: 'Vereinzelte Rückmeldungen dieser Art sind meist die Spitze. Die meisten sagen nichts, sie gehen weiter.' },
        { label: 'Eigentlich nie', score: 15, good: true,
          note: 'Sie sind offenbar auffindbar. Die Frage ist, was Interessenten danach vorfinden.' }
      ]
    },
    {
      q: 'Was soll ein neuer Kunde als Erstes tun können?',
      hint: 'Das bestimmt, wie eine Seite gebaut sein muss.',
      options: [
        { label: 'Anrufen', score: 8,
          note: 'Ziel Anruf: Nummer gehört sichtbar nach oben, auf dem Handy als ein Fingertipp.' },
        { label: 'Einen Termin buchen', score: 8,
          note: 'Ziel Termin: Online-Buchung nimmt Ihnen Telefonate ab und funktioniert auch nach Feierabend.' },
        { label: 'Ein Angebot anfragen', score: 8,
          note: 'Ziel Angebot: ein kurzes Formular mit den richtigen Fragen spart Ihnen die halbe Rückfrage-Runde.' },
        { label: 'Leistungen oder Preise ansehen', score: 8,
          note: 'Ziel Information: wer vorher Preise und Leistungen sieht, ruft vorbereitet an, und das spart beiden Zeit.' }
      ]
    }
  ];

  const PFAD_SEITE = [
    {
      q: 'Wie sieht Ihre Seite auf dem Handy aus?',
      hint: 'Vier von fünf Besuchern kommen über das Smartphone.',
      options: [
        { label: 'Man muss zoomen und schieben', score: 4,
          note: 'Am Handy verlieren Sie Besucher, bevor sie Ihr Angebot überhaupt gesehen haben.' },
        { label: 'Sie passt sich an, wirkt aber veraltet', score: 13,
          note: 'Technisch passt sie sich an, optisch verliert sie gegen jüngere Mitbewerber.' },
        { label: 'Gut, ich habe es selbst geprüft', score: 22, good: true,
          note: 'Der mobile Auftritt sitzt, und Sie wissen es aus eigener Anschauung.' }
      ]
    },
    {
      q: 'Finden Kunden Sie über Google in Ihrer Stadt?',
      hint: 'Gemeint ist die Suche nach Ihrer Leistung plus Ortsname, nicht nach Ihrem Namen.',
      options: [
        { label: 'Nein, da tauche ich nicht auf', score: 2,
          note: 'In der lokalen Suche sind Sie unsichtbar. Dort entscheidet sich der größte Teil der Neukunden.' },
        { label: 'Weiß ich nicht', score: 6,
          note: 'Das lässt sich in fünf Minuten klären, und es ist die Zahl, an der sich alles Weitere ausrichtet.' },
        { label: 'Nur, wenn man meinen Namen kennt', score: 9,
          note: 'Sie werden gefunden, aber nur von Leuten, die Sie schon kennen. Neukunden suchen anders.' },
        { label: 'Ja, auf der ersten Seite', score: 22, good: true,
          note: 'Lokale Sichtbarkeit ist da. Der Hebel liegt jetzt darin, was Besucher auf der Seite tun.' }
      ]
    },
    {
      q: 'Wie viele Anfragen kommen über die Seite?',
      hint: 'Formular, Terminbuchung oder Anrufe, die erkennbar von der Seite kommen.',
      options: [
        { label: 'Keine', score: 2,
          note: 'Eine Seite ohne Anfragen ist eine Visitenkarte im Schrank. Sie kostet, ohne zu arbeiten.' },
        { label: 'Ein paar im Jahr', score: 8,
          note: 'Vereinzelte Anfragen zeigen: Leute kommen an. Es hakt am Weg von Interesse zu Kontakt.' },
        { label: 'Regelmäßig, aber es dürfte mehr sein', score: 16,
          note: 'Die Seite arbeitet bereits. Erfahrungsgemäß liegt hier der günstigste Zuwachs überhaupt.' },
        { label: 'So viele, dass ich kaum hinterherkomme', score: 26, good: true,
          note: 'Ihre Seite bringt, was sie soll. An Ihrer Stelle würde ich daran nichts anfassen.' }
      ]
    }
  ];

  const PFADE = { ohne: PFAD_OHNE, seite: PFAD_SEITE };

  const VERDICTS = {
    ohne: [
      { min: 34, title: 'Sie sind sichtbar, aber auf geliehenem Grund.',
        body: 'Was Sie heute erreichen, läuft über Plattformen, denen Sie nicht gehören. Eine eigene Seite macht aus Gefundenwerden ein Ergebnis, das Sie behalten. Und sie ist die Grundlage dafür, dass Google Sie ernst nimmt.' },
      { min: 24, title: 'Ihr Betrieb lebt von Empfehlung. Das ist Ihre Decke.',
        body: 'Empfehlung bringt gute Kunden, aber nur so viele, wie Ihr Bekanntenkreis hergibt. Wer Sie noch nicht kennt, sucht bei Google und findet dort gerade jemand anderen.' },
      { min: 0, title: 'Im Netz existieren Sie praktisch nicht.',
        body: 'Wer Ihre Leistung heute sucht, landet zwangsläufig bei einem Mitbewerber. Das ist der Normalfall bei Betrieben, die von Weiterempfehlung leben. Und es ist der Punkt, an dem eine einfache, gut gebaute Seite am meisten verändert.' }
    ],
    seite: [
      { min: 75, title: 'Ihre Seite arbeitet. Sparen Sie sich einen Relaunch.',
        body: 'Nach Ihren Angaben macht die Seite das Wichtigste richtig. Ich würde Ihnen davon abraten, daran viel Geld auszugeben. Der Hebel liegt eher bei Pflege und Kleinigkeiten als bei etwas Neuem.' },
      { min: 52, title: 'Gute Grundlage, aber sie holt nicht heraus, was drinsteckt.',
        body: 'Einiges funktioniert bereits. An zwei, drei entscheidenden Stellen verlieren Sie Anfragen, die Sie schon fast hatten. Dort anzusetzen bringt meist mehr als jedes Werbebudget.' },
      { min: 32, title: 'Die Seite ist da, aber sie verkauft nicht.',
        body: 'Sie haben einen Auftritt, doch er führt Besucher nicht bis zur Anfrage. Das ist selten eine Frage des Geschmacks, sondern des Aufbaus, und lässt sich gezielt beheben.' },
      { min: 0, title: 'Ihre jetzige Seite kostet Sie gerade Kunden.',
        body: 'So wie es aussieht, springen Besucher ab, bevor sie erfahren, was Sie können. Eine veraltete Seite schadet mehr als gar keine, weil sie Zweifel am Betrieb sät. Hier lohnt ein Neuanfang.' }
    ]
  };

  const check = { step: 0, answers: [] };

  const pfadName = () => {
    const first = check.answers[0];
    return first == null ? null : START.options[first].path;
  };
  const fragen = () => {
    const p = pfadName();
    return p ? [START].concat(PFADE[p]) : [START];
  };

  function render() {
    const askPane = $('[data-check-ask]');
    const resPane = $('[data-check-result]');
    const qs = fragen();
    const done = check.step >= TOTAL_STEPS;

    $('[data-check-bar]').style.width =
      Math.round((Math.min(check.step, TOTAL_STEPS) / TOTAL_STEPS) * 100) + '%';
    $('[data-check-progress-label]').textContent =
      done ? 'Ergebnis' : `Frage ${check.step + 1} von ${TOTAL_STEPS}`;

    askPane.hidden = done;
    resPane.hidden = !done;

    if (!done) {
      const q = qs[check.step];
      $('[data-check-q]').textContent = q.q;
      $('[data-check-hint]').textContent = q.hint;
      const box = $('[data-check-options]');
      box.innerHTML = '';
      q.options.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'option';
        b.innerHTML = `<span>${o.label}</span>`;
        b.addEventListener('click', () => {
          check.answers = check.answers.slice(0, check.step).concat(i);
          check.step++;
          render();
        });
        box.appendChild(b);
      });
      $('[data-check-back]').hidden = check.step === 0;
      return;
    }

    const gewaehlt = check.answers.map((ai, qi) => qs[qi].options[ai]);
    const score = gewaehlt.reduce((sum, o) => sum + o.score, 0);
    const verdict = VERDICTS[pfadName()].find(v => score >= v.min);

    $('[data-check-score]').textContent = score;
    $('[data-check-verdict-title]').textContent = verdict.title;
    $('[data-check-verdict-body]').textContent = verdict.body;

    const list = $('[data-check-findings]');
    list.innerHTML = '';
    gewaehlt.forEach(o => {
      const row = document.createElement('div');
      row.className = 'finding' + (o.good ? ' finding--good' : '');
      row.innerHTML = `<span class="finding__mark">${o.good ? '✓' : '!'}</span><span>${o.note}</span>`;
      list.appendChild(row);
    });
  }

  $('[data-check-back]').addEventListener('click', () => {
    check.step = Math.max(0, check.step - 1);
    render();
  });
  $('[data-check-reset]').addEventListener('click', () => {
    check.step = 0; check.answers = [];
    render();
  });
  render();
})();



/* =====================================================================
   3) FAQ — nur eine Frage gleichzeitig offen
   ===================================================================== */

(function initFaq() {
  if (!$('[data-faq]')) return;
  const items = $$('[data-faq] .faq__item');

  /* aria-expanded/-controls werden hier gesetzt statt im HTML: sonst müsste
     man sie in acht Fragen von Hand pflegen und sie liefen auseinander. */
  /* setState hält drei Dinge zusammen, die sonst auseinanderlaufen:
     das data-Attribut (steuert die Animation), aria-expanded (sagt den
     Zustand an) und inert (nimmt die zugeklappte Antwort aus Tastatur und
     Screenreader — sonst wäre sie unsichtbar, aber weiterhin vorlesbar). */
  const setState = (item, open) => {
    item.dataset.open = String(open);
    $('.faq__q', item).setAttribute('aria-expanded', String(open));
    $('.faq__a', item).inert = !open;
  };

  items.forEach((item, i) => {
    const a = $('.faq__a', item);
    a.id = a.id || 'faq-a-' + i;
    $('.faq__q', item).setAttribute('aria-controls', a.id);
    setState(item, item.dataset.open === 'true');

    $('.faq__q', item).addEventListener('click', () => {
      const willOpen = item.dataset.open !== 'true';
      items.forEach(other => setState(other, false));
      setState(item, willOpen);
    });
  });
})();

/* =====================================================================
   4) Mobiles Menü
   ===================================================================== */

(function initMenu() {
  const knopf = $('[data-menu-open]');
  const menu  = $('[data-menu]');
  if (!knopf || !menu) return;

  const panel = $('.menu__panel', menu);
  let offen = false;

  function setzen(auf) {
    offen = auf;
    menu.hidden = !auf;
    knopf.setAttribute('aria-expanded', String(auf));
    knopf.setAttribute('aria-label', auf ? 'Menü schließen' : 'Menü öffnen');
    /* Seite dahinter festhalten, sonst scrollt sie unter dem Menü weg. */
    document.body.style.overflow = auf ? 'hidden' : '';
    if (auf) {
      const ziel = $('a', panel);
      if (ziel) ziel.focus();
    } else {
      knopf.focus();
    }
  }

  knopf.addEventListener('click', () => setzen(!offen));

  /* Schließkreuz im Menü: der Drei-Striche-Knopf liegt unter dem Menü und
     ist im offenen Zustand nicht antippbar. */
  const kreuz = $('[data-menu-close]', panel);
  if (kreuz) kreuz.addEventListener('click', () => setzen(false));

  /* Klick auf den abgedunkelten Bereich neben dem Menü schließt es. */
  menu.addEventListener('click', e => { if (e.target === menu) setzen(false); });

  /* Nach einem Klick auf einen Link schließen — wichtig für Sprungmarken
     auf derselben Seite, wo kein Seitenwechsel das Menü wegräumt. */
  $$('a', panel).forEach(a => a.addEventListener('click', () => setzen(false)));

  document.addEventListener('keydown', e => {
    if (!offen) return;
    if (e.key === 'Escape') { setzen(false); return; }
    if (e.key !== 'Tab') return;
    /* Fokus im Menü halten, solange es offen ist. */
    const ziele = [knopf].concat($$('a, button', panel));
    const erste = ziele[0], letzte = ziele[ziele.length - 1];
    if (e.shiftKey && document.activeElement === erste) { e.preventDefault(); letzte.focus(); }
    else if (!e.shiftKey && document.activeElement === letzte) { e.preventDefault(); erste.focus(); }
  });

  /* Wird das Fenster auf Desktopbreite gezogen, verschwindet der Menüknopf —
     dann muss auch das Menü weg, sonst bliebe die Seite gesperrt. */
  window.matchMedia('(min-width: 880px)').addEventListener('change', e => {
    if (e.matches && offen) setzen(false);
  });

  setzen(false);
})();

/* =====================================================================
   5) Kontaktformular — Absendung über Netlify Forms (AJAX)
   ===================================================================== */

(function initForm() {
  const form = $('[data-contact-form]');
  if (!form) return;
  const formNote = $('[data-form-note]');
  const noteDefault = formNote.textContent;

  function showError() {
    formNote.classList.add('form__note--error');
    formNote.innerHTML =
      'Das Absenden hat gerade nicht geklappt. Schreiben Sie mir direkt an ' +
      '<a href="mailto:servatostudio@gmail.com">servatostudio@gmail.com</a> ' +
      'oder rufen Sie an: <a href="tel:+491789126559">0178 9126559</a>.';
  }

  function showDone() {
    form.innerHTML =
      '<div class="form__done">' +
      '<h3>Danke, Ihre Anfrage ist da.</h3>' +
      '<p>Ich melde mich innerhalb eines Werktags bei Ihnen. Wenn es eilt, ' +
      'erreichen Sie mich auch direkt unter 0178 9126559.</p>' +
      '</div>';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';
    formNote.classList.remove('form__note--error');
    formNote.textContent = noteDefault;

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      showDone();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Erstgespräch anfragen';
      showError();
    }
  });
})();

/* =====================================================================
   6) Scroll-Animation (gestaffeltes Einblenden)
   ===================================================================== */

(function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!$('[data-reveal]')) return;

  const targets = [];
  $$('[data-reveal]').forEach((group, gi) => {
    const prep = (el, delay) => {
      el.classList.add('is-hidden', 'reveal-anim');
      el.style.transitionDelay = delay + 'ms';
      targets.push(el);
    };
    if (gi > 0) prep(group, 0);                                  // Hero blendet nicht ein
    $$('[data-stagger] > *', group).forEach((kid, i) => prep(kid, 80 + i * 90));
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('is-hidden');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  targets.forEach(el => io.observe(el));
  setTimeout(() => targets.forEach(el => el.classList.remove('is-hidden')), 5000);
})();


/* ══════════════════════════════════════════════════════════════════════
   Magnet-Knopf — der Hauptknopf im Hero kommt der Maus entgegen.

   Zwei Feinheiten, die man leicht falsch macht:

   1. Die Mitte des Knopfes wird EINMAL gemessen und in Dokument-Koordinaten
      gespeichert (pageX/pageY), nicht bei jeder Mausbewegung neu. Sonst
      misst man den bereits verschobenen Knopf und die Bewegung schaukelt
      sich auf — und ein getBoundingClientRect() pro Bild erzwingt jedes
      Mal ein neues Layout.
   2. Nachgezogen wird gefedert (immer 18 % der Reststrecke pro Bild),
      nicht per CSS-transition. Dadurch fuehlt es sich beim Ziehen
      trotzdem direkt an und schwingt beim Verlassen weich zurueck.
   ═════════════════════════════════════════════════════════════════════ */
(function initMagnet() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('[data-magnet]').forEach(el => {
    const ZUG   = 15;   // wie weit der Knopf hoechstens mitgeht (px)
    const FELD  = 70;   // wie weit ausserhalb der Cursor schon zieht (px)
    const FEDER = 0.18; // Anteil der Reststrecke pro Bild

    let mitte = null;
    const messen = () => {
      const alt = el.style.transform;
      el.style.transform = 'none';
      const r = el.getBoundingClientRect();
      el.style.transform = alt;
      mitte = {
        x: r.left + window.scrollX + r.width / 2,
        y: r.top + window.scrollY + r.height / 2,
        w: r.width, h: r.height
      };
    };
    messen();
    window.addEventListener('resize', messen, { passive: true });

    let zielX = 0, zielY = 0, zielS = 1;
    let istX = 0, istY = 0, istS = 1, bild = 0, drin = false;

    const lauf = () => {
      istX += (zielX - istX) * FEDER;
      istY += (zielY - istY) * FEDER;
      istS += (zielS - istS) * FEDER;
      el.style.transform = 'translate(' + istX.toFixed(2) + 'px,' + istY.toFixed(2) + 'px) scale(' + istS.toFixed(4) + ')';
      const fertig = Math.abs(zielX - istX) < .1 && Math.abs(zielY - istY) < .1 && Math.abs(zielS - istS) < .001;
      if (!fertig) { bild = requestAnimationFrame(lauf); return; }
      bild = 0;
      if (!drin) el.style.transform = '';   // im Ruhezustand gar kein transform
    };
    const anstossen = () => { if (!bild) bild = requestAnimationFrame(lauf); };

    window.addEventListener('pointermove', e => {
      if (!mitte) return;
      const dx = e.pageX - mitte.x;
      const dy = e.pageY - mitte.y;
      drin = Math.abs(dx) < mitte.w / 2 + FELD && Math.abs(dy) < mitte.h / 2 + FELD;

      if (drin) {
        // Waagerecht zieht es deutlich, senkrecht nur halb so weit —
        // sonst wirkt der Knopf wie losgerissen statt wie angezogen.
        zielX = Math.max(-ZUG, Math.min(ZUG, dx * 0.34));
        zielY = Math.max(-ZUG * .5, Math.min(ZUG * .5, dy * 0.28));
        zielS = 1.035;
        // Position des Glanzlichts fuer den radial-gradient in apple.css
        el.style.setProperty('--mx', (((e.pageX - mitte.x) / mitte.w + .5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (((e.pageY - mitte.y) / mitte.h + .5) * 100).toFixed(1) + '%');
      } else {
        zielX = 0; zielY = 0; zielS = 1;
      }
      anstossen();
    }, { passive: true });
  });
})();


/* ══════════════════════════════════════════════════════════════════════
   Kopfzeile ueber dem Himmel

   Auf der Startseite steht die Navigation ohne eigene Flaeche auf dem
   goldenen Verlauf. Das geht nur solange nichts dahinter durchlaeuft —
   sobald gescrollt wird, schiebt sich der Seiteninhalt darunter und die
   Schrift wuerde unlesbar. Ab 24 px Scrollweg bekommt sie deshalb wieder
   Grund (weiss, leicht durchscheinend, mit Weichzeichner dahinter).

   Bewusst ein schlichter scroll-Listener und kein IntersectionObserver:
   die Zeile ist in zwei Saetzen erklaert, laeuft ueberall gleich und
   kostet dank passive:true und der Zustandspruefung praktisch nichts —
   classList.toggle wird nur angefasst, wenn sich wirklich etwas aendert.
   ═════════════════════════════════════════════════════════════════════ */
(function initKopfzeile() {
  // Lief frueher nur auf der Startseite (Klasse hat-himmel). Seit die
  // Kopfzeile ueberall eine schwebende Pille ist, braucht jede Seite das
  // Signal: gescrollt heisst dichteres Glas und tieferer Schatten.
  const kopf = document.querySelector('.header');
  if (!kopf) return;

  const SCHWELLE = 24;
  let fest = null;

  const pruefen = () => {
    const jetzt = window.scrollY > SCHWELLE;
    if (jetzt === fest) return;      // nichts geaendert, nichts anfassen
    fest = jetzt;
    kopf.classList.toggle('header--fest', jetzt);
  };

  pruefen();                          // auch richtig, wenn die Seite
                                      // bereits gescrollt geladen wird
  window.addEventListener('scroll', pruefen, { passive: true });
})();


/* ══════════════════════════════════════════════════════════════════════
   Ruhe — Dauerlaeufer anhalten, solange sie nicht im Bild sind.

   Wortwoge, Laufband und die Aurora-Schleier laufen als
   `infinite`-Animationen. Der Browser rechnet sie auch weiter, wenn sie
   zehn Bildschirmlaengen weiter unten liegen: das kostet auf dem Handy
   dauerhaft Rechenzeit und Akku, ohne dass jemand etwas davon sieht.

   `rootMargin: 200px` startet sie ein Stueck vor der Kante — man sieht
   also nie den Moment des Anspringens.
   ═════════════════════════════════════════════════════════════════════ */
(function initRuhe() {
  if (!('IntersectionObserver' in window)) return;
  const ziele = document.querySelectorAll('.woge, .marquee__track, .schein');
  if (!ziele.length) return;

  const io = new IntersectionObserver(eintraege => {
    eintraege.forEach(e => e.target.classList.toggle('anim-aus', !e.isIntersecting));
  }, { rootMargin: '200px 0px' });

  ziele.forEach(el => { el.classList.add('anim-aus'); io.observe(el); });
})();
