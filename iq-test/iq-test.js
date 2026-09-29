/* IQ-Test — Ablauf, Zeichnen der Figuren, Auswertung.
   Die Aufgaben stehen in aufgaben.js. Nichts hier sendet Daten irgendwohin:
   Antworten, Zeit und Ergebnis bleiben im Browser. */

(function () {
  'use strict';

  /* ---------- Einstellungen ----------

     SCORE_MEAN und SCORE_SD sind ANNAHMEN, keine Messwerte. Sie legen fest,
     welche Punktzahl als IQ 100 gilt und wie viele Punkte 15 IQ-Punkte sind.
     Begründung der Startwerte: Die Aufgaben sind so gemischt, dass ein
     durchschnittlicher Erwachsener etwa die Hälfte löst (13 von 25); die
     Streuung von 4,5 Punkten liegt im üblichen Bereich kurzer 25-Aufgaben-
     Tests (rund 18 % der Aufgabenzahl). Sobald echte Ergebnisse vorliegen,
     hier Mittelwert und Standardabweichung der Rohpunkte eintragen. */
  const DURATION_MIN = 20;
  const SCORE_MEAN = 13;
  const SCORE_SD = 4.5;
  const IQ_MIN_SHOWN = 70;
  const IQ_MAX_SHOWN = 145;

  const items = window.IQ_ITEMS || [];
  const cats = window.IQ_CATEGORIES || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const screens = document.querySelectorAll('[data-screen]');
  if (!items.length || !screens.length) return;

  const LETTERS = 'ABCDEF';

  /* ---------- Figuren zeichnen ---------- */

  const NS = 'http://www.w3.org/2000/svg';

  function poly(n, cx, cy, r, startDeg) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (startDeg + (360 / n) * i) * Math.PI / 180;
      pts.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  }

  const fillOf = (f) => f === 'x' ? 'currentColor' : f === 's' ? 'url(#iq-hatch)' : 'none';

  function glyph(s, f, cx, cy, r, rot, sw) {
    const fill = fillOf(f);
    const common = `fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round"`;
    switch (s) {
      case 'circle':   return `<circle cx="${cx}" cy="${cy}" r="${r}" ${common}/>`;
      case 'square':   return `<polygon points="${poly(4, cx, cy, r * 1.2, -45)}" ${common}/>`;
      case 'diamond':  return `<polygon points="${poly(4, cx, cy, r * 1.22, -90)}" ${common}/>`;
      case 'triangle': return `<polygon points="${poly(3, cx, cy + r * 0.18, r * 1.3, -90)}" ${common}/>`;
      case 'hexagon':  return `<polygon points="${poly(6, cx, cy, r * 1.08, -90)}" ${common}/>`;
      case 'arrow': {
        const k = r * 1.35;
        const p = [[0, -1], [0.62, -0.18], [0.24, -0.18], [0.24, 1], [-0.24, 1], [-0.24, -0.18], [-0.62, -0.18]]
          .map(([x, y]) => (cx + x * k).toFixed(2) + ',' + (cy + y * k).toFixed(2)).join(' ');
        return `<polygon points="${p}" transform="rotate(${rot} ${cx} ${cy})" ${common}/>`;
      }
    }
    return '';
  }

  const LAYOUT = {
    1: { r: 23, p: [[50, 50]] },
    2: { r: 15, p: [[28, 50], [72, 50]] },
    3: { r: 13, p: [[50, 27], [27, 70], [73, 70]] },
    4: { r: 13, p: [[29, 29], [71, 29], [29, 71], [71, 71]] },
    5: { r: 11, p: [[24, 24], [76, 24], [50, 50], [24, 76], [76, 76]] },
    6: { r: 10.5, p: [[21, 32], [50, 32], [79, 32], [21, 68], [50, 68], [79, 68]] }
  };

  const SEG = {
    T: [18, 18, 82, 18], B: [18, 82, 82, 82], L: [18, 18, 18, 82], R: [82, 18, 82, 82],
    D1: [18, 18, 82, 82], D2: [82, 18, 18, 82], V: [50, 18, 50, 82], H: [18, 50, 82, 50]
  };

  // Rand des 3×3-Rasters, im Uhrzeigersinn ab oben links
  const RING = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]];
  const ringXY = (i) => [20 + RING[i][0] * 30, 20 + RING[i][1] * 30];

  function cellSVG(c) {
    let body = '';
    if (c.k === 'g') {
      const lay = LAYOUT[c.n] || LAYOUT[1];
      const sw = c.n >= 5 ? 2.4 : 3;
      body = lay.p.map(([x, y]) => glyph(c.s, c.f, x, y, lay.r, c.r || 0, sw)).join('');
    } else if (c.k === 'seg') {
      body = [[18, 18], [82, 18], [18, 82], [82, 82], [50, 50]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="currentColor" opacity=".3"/>`).join('');
      body += c.v.map((k) => {
        const [x1, y1, x2, y2] = SEG[k];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`;
      }).join('');
    } else if (c.k === 'ring') {
      const [dx, dy] = ringXY(c.d);
      const [bx, by] = ringXY(c.b);
      for (let gx = 20; gx <= 80; gx += 30) for (let gy = 20; gy <= 80; gy += 30) {
        if ((gx === dx && gy === dy) || (gx === bx && gy === by)) continue;
        body += `<circle cx="${gx}" cy="${gy}" r="1.6" fill="currentColor" opacity=".3"/>`;
      }
      body += `<rect x="${bx - 9}" y="${by - 9}" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"/>`;
      body += `<circle cx="${dx}" cy="${dy}" r="8.5" fill="currentColor"/>`;
    }
    return `<svg viewBox="0 0 100 100" xmlns="${NS}" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  // Raumfiguren: Kästchen drehen (Vierteldrehungen im Uhrzeigersinn) und spiegeln
  function transformShape(shape, t) {
    let cells = shape.cells.map(([x, y], i) => ({ x, y, m: i === shape.mark }));
    if (t && t.mir) cells = cells.map((c) => ({ ...c, x: -c.x }));
    for (let i = 0; i < ((t && t.rot) || 0); i++) cells = cells.map((c) => ({ ...c, x: -c.y, y: c.x }));
    const minX = Math.min(...cells.map((c) => c.x));
    const minY = Math.min(...cells.map((c) => c.y));
    return cells.map((c) => ({ ...c, x: c.x - minX, y: c.y - minY }));
  }

  function shapeSVG(shape, t) {
    const cells = transformShape(shape, t);
    const w = Math.max(...cells.map((c) => c.x)) + 1;
    const h = Math.max(...cells.map((c) => c.y)) + 1;
    const size = Math.min(22, 84 / Math.max(w, h));
    const ox = 50 - (w * size) / 2;
    const oy = 50 - (h * size) / 2;
    const body = cells.map((c) =>
      `<rect x="${(ox + c.x * size).toFixed(2)}" y="${(oy + c.y * size).toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" ` +
      (c.m ? 'fill="currentColor"' : 'fill="currentColor" fill-opacity=".14"') +
      ' stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>'
    ).join('');
    return `<svg viewBox="0 0 100 100" xmlns="${NS}" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  function optionHTML(item, opt) {
    if (item.cat === 'raum') return shapeSVG(item.shape, opt);
    if (typeof opt === 'string') return `<span class="iq-opt__text">${opt}</span>`;
    return cellSVG(opt);
  }

  function figureHTML(item) {
    const f = item.figure;
    if (!f) return '';
    if (f.type === 'series') return `<p class="iq-series">${f.text}</p>`;
    if (f.type === 'shape') return `<div class="iq-shape" role="img" aria-label="Ausgangsfigur">${shapeSVG(f.shape)}</div>`;
    if (f.type === 'matrix') {
      const cells = f.cells.map((c) => `<div class="iq-cell">${cellSVG(c)}</div>`).join('');
      return `<div class="iq-matrix" role="img" aria-label="Figurenmatrix mit drei mal drei Feldern, das letzte Feld fehlt">${cells}<div class="iq-cell iq-cell--missing">?</div></div>`;
    }
    return '';
  }

  /* ---------- Zustand ---------- */

  let state = null;
  let tick = null;
  let advanceTimer = null;

  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function show(name) {
    screens.forEach((s) => { s.hidden = s.dataset.screen !== name; });
    window.scrollTo({ top: 0 });
  }

  function start() {
    state = {
      perm: items.map((it) => shuffled(it.options.length)), // Anzeigeplatz → Original-Index
      answers: items.map(() => null),                         // Original-Index oder null
      current: 0,
      startedAt: Date.now(),
      endsAt: Date.now() + DURATION_MIN * 60 * 1000,
      finishedAt: null
    };
    buildDots();
    show('test');
    render(true);
    clearInterval(tick);
    tick = setInterval(updateTimer, 250);
    updateTimer();
  }

  /* ---------- Test-Ansicht ---------- */

  const els = {
    count: $('[data-count]'), progress: $('[data-progress]'), timer: $('[data-timer]'),
    cat: $('[data-cat]'), prompt: $('[data-prompt]'), figure: $('[data-figure]'),
    options: $('[data-options]'), stage: $('[data-stage]'), prev: $('[data-prev]'), next: $('[data-next]'),
    dots: $('[data-dots]'), finish: $('[data-finish]'), confirm: $('[data-confirm]'),
    confirmText: $('[data-confirm-text]')
  };

  function buildDots() {
    els.dots.innerHTML = items.map((_, i) =>
      `<li><button type="button" data-goto="${i}" aria-label="Aufgabe ${i + 1}">${i + 1}</button></li>`).join('');
  }

  function render(focusPrompt) {
    const i = state.current;
    const item = items[i];
    const answered = state.answers.filter((a) => a !== null).length;

    els.count.textContent = `Aufgabe ${i + 1} / ${items.length}`;
    els.progress.style.width = (answered / items.length) * 100 + '%';
    els.cat.textContent = cats[item.cat] || '';
    els.prompt.textContent = item.prompt;
    els.figure.innerHTML = figureHTML(item);
    els.figure.hidden = !item.figure;
    els.stage.classList.toggle('iq-stage--split', !!item.figure && typeof item.options[0] !== 'string');

    const textual = typeof item.options[0] === 'string';
    const short = textual && item.options.every((o) => o.length <= 6);
    els.options.className = 'iq-options' + (textual ? (short ? ' iq-options--short' : ' iq-options--text') : '');
    els.options.innerHTML = state.perm[i].map((orig, slot) => {
      const sel = state.answers[i] === orig;
      return `<button type="button" class="iq-opt${sel ? ' is-selected' : ''}" role="radio" aria-checked="${sel}" ` +
        `aria-label="Antwort ${LETTERS[slot]}${textual ? ': ' + item.options[orig] : ''}" data-slot="${slot}">` +
        `<span class="iq-opt__letter" aria-hidden="true">${LETTERS[slot]}</span>${optionHTML(item, item.options[orig])}</button>`;
    }).join('');

    els.prev.disabled = i === 0;
    const last = i === items.length - 1;
    els.next.hidden = last;
    els.next.innerHTML = state.answers[i] !== null ? 'Weiter <span aria-hidden="true">→</span>' : 'Überspringen <span aria-hidden="true">→</span>';
    els.finish.className = last ? 'btn btn--accent' : 'btn btn--link';

    els.dots.querySelectorAll('button').forEach((b, k) => {
      b.classList.toggle('is-answered', state.answers[k] !== null);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });

    els.confirm.hidden = true;
    if (focusPrompt) els.prompt.focus({ preventScroll: true });
  }

  function go(i) {
    if (!state || state.finishedAt) return;
    clearTimeout(advanceTimer);
    state.current = Math.max(0, Math.min(items.length - 1, i));
    render(true);
    const top = $('[data-screen="test"]').getBoundingClientRect().top + window.scrollY - 80;
    if (window.scrollY > top) window.scrollTo({ top });
  }

  function choose(slot) {
    const i = state.current;
    const orig = state.perm[i][slot];
    if (orig === undefined) return;
    state.answers[i] = orig;
    render(false);
    els.options.querySelector(`[data-slot="${slot}"]`).focus({ preventScroll: true });
    clearTimeout(advanceTimer);
    if (i < items.length - 1) advanceTimer = setTimeout(() => go(i + 1), 320);
  }

  function fmt(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function updateTimer() {
    if (!state || state.finishedAt) return;
    const left = state.endsAt - Date.now();
    els.timer.textContent = fmt(left);
    els.timer.classList.toggle('is-low', left <= 60 * 1000);
    if (left <= 0) finish(true);
  }

  function askFinish() {
    const open = state.answers.filter((a) => a === null).length;
    if (!open) return finish(false);
    els.confirmText.textContent = open === 1
      ? 'Eine Aufgabe ist noch offen und zählt dann als falsch. Trotzdem abgeben?'
      : `${open} Aufgaben sind noch offen und zählen dann als falsch. Trotzdem abgeben?`;
    els.confirm.hidden = false;
    $('[data-confirm-no]').focus();
  }

  /* ---------- Auswertung ---------- */

  // Standardnormalverteilung (Abramowitz & Stegun 26.2.17, Fehler < 7.5e-8)
  function phi(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  function band(iq) {
    if (iq >= 130) return 'Weit über dem Durchschnitt. Diese Punktzahl erreicht nur ein kleiner Teil der Teilnehmer.';
    if (iq >= 115) return 'Über dem Durchschnitt. Besonders die schweren Aufgaben am Ende trennen hier.';
    if (iq >= 85)  return 'Im Durchschnittsbereich — dort, wo rund zwei Drittel aller Menschen liegen.';
    return 'Unter dem Durchschnitt dieses Tests. Zeitdruck, Müdigkeit und Ablenkung drücken das Ergebnis stark — ein zweiter Versuch in Ruhe sagt mehr.';
  }

  function finish(timeout) {
    if (!state || state.finishedAt) return;
    clearInterval(tick);
    clearTimeout(advanceTimer);
    state.finishedAt = Math.min(Date.now(), state.endsAt);

    const correct = state.answers.map((a) => a === 0);
    const raw = correct.filter(Boolean).length;
    const z = (raw - SCORE_MEAN) / SCORE_SD;
    const iq = Math.round(100 + 15 * z);
    const shown = iq < IQ_MIN_SHOWN ? `< ${IQ_MIN_SHOWN}` : iq > IQ_MAX_SHOWN ? `> ${IQ_MAX_SHOWN}` : String(iq);
    const pct = Math.round(phi(z) * 100);

    $('[data-result-kicker]').textContent = timeout ? 'Zeit abgelaufen · dein Ergebnis' : 'Dein Ergebnis';
    $('[data-iq]').textContent = shown;
    $('[data-band]').textContent = band(iq);
    $('[data-raw]').textContent = `${raw} / ${items.length}`;
    $('[data-pct]').textContent = pct < 1 ? '< 1 %' : pct > 99 ? '> 99 %' : pct + ' %';
    $('[data-time]').textContent = fmt(state.finishedAt - state.startedAt) + ' min';

    // Bereiche
    $('[data-cats]').innerHTML = Object.keys(cats).map((key) => {
      const idx = items.map((it, i) => (it.cat === key ? i : -1)).filter((i) => i >= 0);
      const ok = idx.filter((i) => correct[i]).length;
      const w = idx.length ? (ok / idx.length) * 100 : 0;
      return `<div class="iq-cat"><div class="iq-cat__head"><span>${cats[key]}</span><span class="muted">${ok} / ${idx.length}</span></div>` +
        `<div class="iq-cat__bar"><span style="width:${w}%"></span></div></div>`;
    }).join('');

    // Rechenweg offenlegen
    $('[data-method]').innerHTML =
      `<p>Du hast <strong>${raw} von ${items.length}</strong> Aufgaben gelöst. Der Test nimmt an, dass ein durchschnittlicher Erwachsener ` +
      `<strong>${String(SCORE_MEAN).replace('.', ',')}</strong> Aufgaben löst und die Ergebnisse um <strong>${String(SCORE_SD).replace('.', ',')}</strong> Punkte streuen. ` +
      `Daraus: (${raw} − ${String(SCORE_MEAN).replace('.', ',')}) ÷ ${String(SCORE_SD).replace('.', ',')} = ${z.toFixed(2).replace('.', ',')} Standardabweichungen; ` +
      `auf der IQ-Skala (Mittelwert 100, eine Standardabweichung = 15) sind das ${iq}.</p>` +
      '<p>Diese beiden Annahmen sind <strong>nicht</strong> an einer repräsentativen Stichprobe gemessen. Der Wert ist deshalb eine Schätzung ' +
      'und kein diagnostischer IQ. Wer den Test wiederholt, kennt die Aufgaben schon — der zweite Wert ist entsprechend zu hoch.</p>';

    // Lösungen
    $('[data-review]').innerHTML = items.map((item, i) => {
      const a = state.answers[i];
      const ok = a === 0;
      const status = a === null ? 'offen' : ok ? 'richtig' : 'falsch';
      const yours = a === null ? '<span class="muted">keine Antwort</span>' : `<span class="iq-rv__opt">${optionHTML(item, item.options[a])}</span>`;
      return `<li class="iq-rv iq-rv--${status}"><details${ok ? '' : ' open'}>` +
        `<summary><span class="iq-rv__badge">${ok ? '✓' : a === null ? '–' : '✗'}</span>` +
        `<span class="iq-rv__title">${i + 1}. ${item.prompt}</span><span class="iq-rv__status">${status}</span></summary>` +
        `<div class="iq-rv__body">${item.figure ? `<div class="iq-rv__fig">${figureHTML(item)}</div>` : ''}` +
        `<div class="iq-rv__answers"><div><span class="muted-2">Deine Antwort</span>${yours}</div>` +
        `<div><span class="muted-2">Richtig</span><span class="iq-rv__opt">${optionHTML(item, item.options[0])}</span></div></div>` +
        `<p>${item.why}</p></div></details></li>`;
    }).join('');

    state.result = { iq: shown, raw };
    show('result');
    $('[data-result-h1]').focus({ preventScroll: true });
  }

  async function share() {
    const btn = $('[data-share]');
    const url = location.href.split('#')[0];
    const text = `Mein Ergebnis im IQ-Test: ${state.result.iq} (Schätzwert, ${state.result.raw}/${items.length} richtig). Schaffst du mehr?`;
    try {
      if (navigator.share) { await navigator.share({ title: 'IQ-Test', text, url }); return; }
      await navigator.clipboard.writeText(text + ' ' + url);
      btn.textContent = 'Kopiert ✓';
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      btn.textContent = 'Teilen nicht möglich';
    }
    setTimeout(() => { btn.textContent = 'Ergebnis teilen'; }, 2500);
  }

  /* ---------- Ereignisse ---------- */

  $('[data-start]').addEventListener('click', start);
  els.prev.addEventListener('click', () => go(state.current - 1));
  els.next.addEventListener('click', () => go(state.current + 1));
  els.finish.addEventListener('click', askFinish);
  $('[data-confirm-yes]').addEventListener('click', () => finish(false));
  $('[data-confirm-no]').addEventListener('click', () => { els.confirm.hidden = true; });
  $('[data-restart]').addEventListener('click', () => { state = null; show('intro'); });
  $('[data-share]').addEventListener('click', share);

  els.options.addEventListener('click', (e) => {
    const b = e.target.closest('[data-slot]');
    if (b) choose(Number(b.dataset.slot));
  });
  els.dots.addEventListener('click', (e) => {
    const b = e.target.closest('[data-goto]');
    if (b) go(Number(b.dataset.goto));
  });

  document.addEventListener('keydown', (e) => {
    if (!state || state.finishedAt || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const k = e.key.toLowerCase();
    let slot = '123456'.indexOf(k);
    if (slot < 0) slot = 'abcdef'.indexOf(k);
    if (slot >= 0 && e.key.length === 1) {
      if (slot < items[state.current].options.length) { e.preventDefault(); choose(slot); }
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(state.current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(state.current + 1); }
  });

  // Versehentliches Schließen mitten im Test abfangen
  window.addEventListener('beforeunload', (e) => {
    if (state && !state.finishedAt) { e.preventDefault(); e.returnValue = ''; }
  });

  // Zurück im Tab nach längerer Pause: Timer sofort nachziehen
  document.addEventListener('visibilitychange', updateTimer);
})();
