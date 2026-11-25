// Écrans principaux : quiz, accueil, sport, lecteur de séance.
import { h, s, rings, pct, fmtDate, fmtShort, mmss, toast, vibrate, beep, confirmSheet, makeTimer, fill } from './ui.js';
import { getState, update, getDay, dateKey } from './store.js';
import { THEMES, THEME_ORDER, QUIZ, SESSIONS, FORMATS, LADDERS, SOURCES, DISCLAIMER } from './data.js';
import {
  answers, buildChecklist, isDone, themeScore, dayScore, adherence, streak, themeRank, nextSession,
  recommendFormat, planSession, applyProgression, waterGoal, workedOut, records, bedtimeDefault, exerciseFor,
} from './engine.js';

export const go = hash => { location.hash = hash; };

const tick = () => s('svg', { viewBox: '0 0 24 24' }, s('path', { d: 'M5 12.5l4.5 4.5L19 7.5' }));

/* ================================================================ QUIZ */
export function quizView() {
  const root = h('div', { class: 'quiz' });
  const prev = getState().profile.answers || {};
  const ans = { ...prev };
  let idx = 0;
  const n = QUIZ.length;

  function intro() {
    root.replaceChildren(h('div', { class: 'quiz-in fade-in' },
      h('div', { class: 'stack', style: { marginTop: '10vh' } },
        h('span', { class: 'chip', style: { justifySelf: 'start' } }, 'Cap Forme'),
        h('h1', {}, 'Construisons ton plan sur mesure'),
        h('p', { class: 'muted' }, `${n} questions, une par écran, environ 3 minutes. Tes réponses règlent ton programme de sport, tes routines et tes cases du jour. Elles restent sur ton téléphone.`)),
      h('div', { class: 'foot' }, h('button', { class: 'btn block', onclick: () => { idx = 0; draw(); } }, 'Commencer'))));
  }

  function draw() {
    const q = QUIZ[idx];
    const cur = ans[q.id];
    const selected = v => q.type === 'multi' ? Array.isArray(cur) && cur.includes(v) : cur === v;
    const ok = q.type === 'multi' ? Array.isArray(cur) && cur.length > 0 : !!cur;

    const choose = v => {
      if (q.type === 'multi') {
        let list = Array.isArray(cur) ? [...cur] : [];
        const exclusive = ['rien', 'aucun'].includes(v);
        if (exclusive) list = list.includes(v) ? [] : [v];
        else {
          list = list.filter(x => !['rien', 'aucun'].includes(x));
          if (list.includes(v)) list = list.filter(x => x !== v);
          else if (list.length >= q.max) { toast(`${q.max} choix maximum`); return; }
          else list.push(v);
        }
        ans[q.id] = list;
      } else ans[q.id] = v;
      draw();
    };

    root.replaceChildren(h('div', { class: 'quiz-in fade-in' },
      h('div', { class: 'stack' },
        h('div', { class: 'row between' }, h('span', { class: 'sec' }, q.section), h('span', { class: 'muted small num' }, `${idx + 1} / ${n}`)),
        h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': idx + 1, 'aria-valuemax': n }, h('i', { style: { width: `${((idx + 1) / n) * 100}%` } }))),
      h('h2', { style: { fontSize: '1.45rem' } }, q.q),
      q.type === 'multi' ? h('p', { class: 'muted small' }, q.max < 6 ? `Choisis jusqu’à ${q.max} réponses.` : 'Plusieurs réponses possibles.') : null,
      h('div', { class: 'stack' }, q.opts.map(([v, label]) =>
        h('button', { class: `opt ${q.type === 'multi' ? 'multi' : ''}`, 'aria-pressed': selected(v) ? 'true' : 'false', onclick: () => choose(v) }, h('span', { class: 'mk' }), label))),
      h('div', { class: 'foot' },
        h('button', { class: 'btn ghost', onclick: () => { if (idx === 0) intro(); else { idx--; draw(); } } }, 'Retour'),
        h('button', { class: 'btn', disabled: !ok, onclick: () => { if (idx < n - 1) { idx++; draw(); } else finish(); } }, idx < n - 1 ? 'Suivant' : 'Terminer'))));
    root.scrollTo(0, 0);
  }

  function finish() {
    update(st => {
      const first = !st.profile.done;
      st.profile.answers = { ...ans };
      st.profile.done = true;
      if (!st.profile.startDate) st.profile.startDate = dateKey();
      if (first) st.settings.bedtime = bedtimeDefault();
    });
    const fmt = FORMATS[recommendFormat('calme')];
    const lines = [
      ['Séances', `${fmt.label.toLowerCase()} de ${fmt.mins} min les jours calmes, express de 10 min les jours de train`],
      ['Niveau de départ', ['Débutant', 'Intermédiaire', 'Confirmé', 'Avancé'][+(ans.pompes || 0)]],
      ['Hydratation', `objectif de départ : ${waterGoal()} verres par jour`],
      ['Priorités', (ans.priorites || []).map(p => QUIZ.find(x => x.id === 'priorites').opts.find(o => o[0] === p)[1].toLowerCase()).join(', ')],
    ];
    root.replaceChildren(h('div', { class: 'quiz-in fade-in' },
      h('div', { class: 'stack', style: { marginTop: '8vh' } },
        h('h1', {}, 'Ton plan est prêt'),
        h('p', { class: 'muted' }, 'Voici ce que l’appli a réglé d’après tes réponses. Tu peux refaire le quiz quand ta situation change.')),
      h('div', { class: 'card' }, lines.map(([a, b]) => h('div', { class: 'stack' }, h('b', {}, a), h('span', { class: 'muted' }, b)))),
      h('div', { class: 'foot' }, h('button', { class: 'btn block', onclick: () => { root.remove(); go('#/home'); } }, 'Ouvrir mon plan'))));
  }

  Object.keys(prev).length ? draw() : intro();
  return root;
}

/* ================================================================ ACCUEIL */
function patchRings(svg, vals) {
  svg.querySelectorAll('.ring-arc').forEach((arc, i) => {
    const len = 2 * Math.PI * arc.getAttribute('r');
    arc.style.strokeDashoffset = len * (1 - Math.max(0.001, vals[i]));
  });
}

export function homeView() {
  const k = dateKey();
  const day = getDay(k);
  const root = h('div', { class: 'view' });
  const order = themeRank();
  let ringSvg, centerBig, checkEls = [], gridWrap;

  const compute = () => {
    const items = buildChecklist(k, getDay(k).mode);
    return { items, vals: order.map(t => themeScore(t, k)), total: dayScore(k) };
  };

  function paint() {
    const { vals, total } = compute();
    patchRings(ringSvg, vals);
    centerBig.firstChild.nodeValue = String(pct(total));
  }

  function toggle(item) {
    update(st => {
      const d = st.days[k] || (st.days[k] = { mode: 'calme', checks: {}, water: 0 });
      d.checks[item.id] = !d.checks[item.id];
    });
  }

  function itemRow(item) {
    if (item.kind === 'water') {
      const wrap = h('div', {});
      const row = h('div', { class: 'check', role: 'group', 'aria-label': item.label, style: { '--tc': `var(--c-${item.theme})`, cursor: 'default', paddingBottom: '2px' } });
      const label = h('span', { class: 'label' });
      const box = h('span', { class: 'box' }, tick());
      const glasses = h('div', { class: 'water' });
      const redraw = () => {
        const d = getDay(k);
        const done = (d.water || 0) >= item.goal;
        row.setAttribute('aria-checked', done ? 'true' : 'false');
        label.textContent = `${item.label.split(':')[0]} : ${d.water || 0} sur ${item.goal} verres`;
        glasses.replaceChildren(...Array.from({ length: item.goal }, (_, i) =>
          h('button', {
            class: `glass ${i < (d.water || 0) ? 'full' : ''}`, 'aria-label': `Verre ${i + 1}`,
            onclick: () => {
              update(st => { const dd = st.days[k]; dd.water = dd.water === i + 1 ? i : i + 1; });
              redraw(); paint();
            },
          })));
      };
      row.append(box, label);
      wrap.append(row, glasses);
      redraw();
      return wrap;
    }
    if (item.kind === 'session') {
      const done = workedOut(k);
      return h('button', { class: 'check', role: 'checkbox', 'aria-checked': done ? 'true' : 'false', style: { '--tc': `var(--c-${item.theme})` }, onclick: () => go('#/sport') },
        h('span', { class: 'box' }, tick()), h('span', { class: 'label' }, item.label), done ? null : h('span', { class: 'go' }, 'Lancer'));
    }
    const btn = h('button', { class: 'check', role: 'checkbox', 'aria-checked': isDone(item, k) ? 'true' : 'false', style: { '--tc': `var(--c-${item.theme})` } },
      h('span', { class: 'box' }, tick()), h('span', { class: 'label' }, item.label));
    btn.addEventListener('click', () => {
      toggle(item);
      btn.setAttribute('aria-checked', isDone(item, k) ? 'true' : 'false');
      vibrate(10);
      paint();
    });
    return btn;
  }

  function draw() {
    const { items, vals, total } = compute();
    const mode = getDay(k).mode;
    const sess = nextSession();
    const fmtId = recommendFormat(mode);
    const fmt = FORMATS[fmtId];
    const done = workedOut(k);

    ringSvg = rings(order.map((t, i) => ({ theme: t, value: vals[i] })));
    centerBig = h('div', { class: 'big num' }, String(pct(total)), h('small', {}, ' %'));
    const sessionCard = h('section', { class: 'card' },
      h('div', { class: 'row between' }, h('div', {}, h('p', { class: 'muted small' }, done ? 'Séance du jour faite' : 'Prochaine séance'), h('h2', {}, `${sess.id} · ${sess.name}`)),
        h('span', { class: 'tag' }, `${fmt.label} · ${fmt.mins} min`)),
      h('p', { class: 'muted' }, sess.tag),
      h('div', { class: 'row-btns' },
        h('button', { class: 'btn', onclick: () => go(`#/session/${sess.id}/${fmtId}`) }, done ? 'Refaire une séance' : 'Commencer la séance'),
        h('button', { class: 'btn ghost', onclick: () => go('#/sport') }, 'Choisir')));

    gridWrap = h('div', { class: 'view' }, order.map(t => {
      const list = items.filter(i => i.theme === t);
      if (!list.length) return null;
      return h('section', { class: 'card group', style: { '--tc': `var(--c-${t})` } },
        h('h3', {}, h('span', { class: 'dot' }), THEMES[t].label), list.map(itemRow));
    }));

    root.replaceChildren(
      h('header', { class: 'top' },
        h('div', {}, h('p', { class: 'date' }, fmtDate(k)), h('h1', {}, 'Aujourd’hui')),
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Type de journée' },
          [['calme', 'Calme'], ['train', 'Train']].map(([v, l]) =>
            h('button', { 'aria-pressed': mode === v ? 'true' : 'false', onclick: () => { update(st => { getDay(k); st.days[k].mode = v; }); draw(); } }, l)))),
      h('section', { class: 'card hero' },
        h('div', { class: 'ring-wrap' }, ringSvg, h('div', { class: 'ring-center' }, centerBig, h('div', { class: 'cap' }, 'de ta journée'))),
        h('div', { class: 'legend' }, order.map(t => h('span', { style: { '--c': `var(--c-${t})` } }, h('i', { class: 'dot' }), THEMES[t].label))),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', { class: 'num' }, streak()), h('span', {}, 'jours de suite')),
          h('div', { class: 'stat' }, h('b', { class: 'num' }, `${pct(adherence(null, 7))} %`), h('span', {}, 'régularité 7 j')),
          h('div', { class: 'stat' }, h('b', { class: 'num' }, getState().workouts.filter(w => w.date >= weekStart()).length), h('span', {}, 'séances / semaine')))),
      sessionCard,
      gridWrap);
  }
  draw();
  return root;
}

function weekStart() {
  const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dateKey(d);
}

/* ================================================================ SPORT */
export function sportView() {
  const root = h('div', { class: 'view' });
  const mode = getDay(dateKey()).mode;
  let selSession = nextSession().id;
  let selFmt = recommendFormat(mode);

  function draw() {
    const plan = planSession(selSession, selFmt);
    const hist = getState().workouts.slice(-6).reverse();
    const rec = records();
    fill(root,
      h('header', { class: 'top' }, h('div', {}, h('p', { class: 'date' }, 'Au poids du corps, sans matériel'), h('h1', {}, 'Sport'))),
      h('section', { class: 'card' },
        h('h2', {}, 'Choisis ta séance'),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } }, SESSIONS.map(se =>
          h('button', { class: `chip ${selSession === se.id ? 'active' : ''}`, onclick: () => { selSession = se.id; draw(); } }, `${se.id} · ${se.name}`))),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } }, Object.values(FORMATS).map(f =>
          h('button', { class: `chip ${selFmt === f.id ? 'active' : ''}`, onclick: () => { selFmt = f.id; draw(); } }, `${f.label} ${f.mins} min`))),
        h('p', { class: 'muted small' }, `${plan.rounds} tour${plan.rounds > 1 ? 's' : ''} · environ ${plan.estMin} minutes avec échauffement`),
        h('div', { class: 'list' }, plan.exercises.map(e =>
          h('div', { class: 'exo' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('b', {}, e.name), h('span', { class: 'muted small' }, e.group)),
            h('span', { class: 'tag' }, e.type === 'time' ? `${e.target} s` : e.side ? `${e.target} / côté` : `${e.target} rép.`)))),
        h('button', { class: 'btn block', onclick: () => go(`#/session/${selSession}/${selFmt}`) }, 'Commencer')),
      hist.length ? h('section', { class: 'card' }, h('h2', {}, 'Dernières séances'),
        h('div', { class: 'list' }, hist.map(w => {
          const se = SESSIONS.find(x => x.id === w.sessionId);
          const reps = w.sets.filter(x => x.type === 'reps').reduce((t, x) => t + x.reps * (x.side ? 2 : 1), 0);
          return h('div', { class: 'exo' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('b', {}, se ? se.name : 'Séance'), h('span', { class: 'muted small' }, fmtShort(w.date))),
            h('span', { class: 'tag num' }, `${Math.round(w.secs / 60)} min · ${reps} rép.`));
        }))) : null,
      rec.length ? h('section', { class: 'card' }, h('h2', {}, 'Records'),
        h('div', { class: 'list' }, rec.map(r => h('div', { class: 'exo' }, h('span', {}, r.name), h('b', { class: 'num' }, r.type === 'time' ? `${r.reps} s` : `${r.reps} rép.`))))) : null,
      h('section', { class: 'card' }, h('h2', {}, 'Comment ça marche'),
        h('details', {}, h('summary', {}, 'La progression automatique'),
          h('p', { class: 'muted' }, 'Quand tu atteins toutes les répétitions visées sur une série, la cible monte d’une répétition à la séance suivante. Au bout de quatre progressions, l’exercice passe à une variante plus difficile. C’est le principe de surcharge progressive.')),
        h('details', {}, h('summary', {}, 'Et le gras du ventre ?'),
          h('p', { class: 'muted' }, 'Les abdos renforcent le muscle mais ne font pas fondre la graisse du ventre à eux seuls : on ne choisit pas où on maigrit. La perte de gras vient surtout de l’alimentation et de l’activité de la journée. C’est pour ça que l’appli suit aussi ton alimentation, tes pas et ton tour de taille.')),
        h('details', {}, h('summary', {}, 'Pas de matériel'),
          h('p', { class: 'muted' }, 'Pour les biceps, le dos et les trapèzes, l’appli utilise ce que tu as chez toi : deux bouteilles d’eau de 1,5 L et un sac à dos chargé de livres. Un bord de lit stable sert pour les dips.')),
        h('div', { class: 'sources' }, SOURCES.sport.map(([a, b]) => h('p', {}, h('b', {}, a), ' — ', b))),
        h('p', { class: 'muted small' }, DISCLAIMER)));
  }
  draw();
  return root;
}

/* ================================================================ LECTEUR DE SÉANCE */
export function playerView(sessionId, fmtId) {
  const plan = planSession(sessionId, fmtId);
  const steps = plan.steps;
  const root = h('div', { class: 'player' });
  const sets = [];
  const t0 = Date.now();
  let i = 0, timer = null, wake = null;

  (async () => { try { wake = await navigator.wakeLock.request('screen'); } catch (e) { /* non supporté */ } })();
  const stopTimer = () => { timer && timer.stop(); timer = null; };
  root._destroy = () => { stopTimer(); wake && wake.release().catch(() => {}); };

  const nextWork = from => steps.slice(from + 1).find(x => x.kind === 'work');

  const header = () => h('div', { class: 'head' },
    h('div', { class: 'row' },
      h('button', { class: 'btn ghost small', onclick: quit }, 'Quitter'),
      h('span', { class: 'muted small', style: { marginLeft: 'auto' } }, `${plan.name} · ${FORMATS[fmtId].label}`)),
    h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': i, 'aria-valuemax': steps.length }, h('i', { style: { width: `${(i / steps.length) * 100}%` } })));

  async function quit() {
    const ok = await confirmSheet('Quitter la séance ?', 'Cette séance ne sera pas enregistrée.', 'Quitter', true);
    if (ok) go('#/sport');
  }

  function next() { i++; draw(); }

  function countdown(secs, big, opts = {}) {
    stopTimer();
    timer = makeTimer(secs, {
      onTick: t => { big.textContent = mmss(t); if (t > 0 && t <= 3 && opts.beepEnd !== false) beep(660, 90); },
      onDone: () => { beep(980, 220); vibrate([120, 60, 120]); opts.onDone && opts.onDone(); },
    });
    return timer;
  }

  function draw() {
    stopTimer();
    if (i >= steps.length) return finish();
    const st = steps[i];
    const label = { warm: 'Échauffement', cool: 'Retour au calme', rest: 'Repos', work: `Série ${st.round} sur ${st.rounds} · ${st.group || ''}` }[st.kind];
    const tc = st.kind === 'work' ? 'var(--accent)' : 'var(--muted)';
    let body, actions;

    if (st.kind === 'work' && st.type === 'reps') {
      let val = st.target;
      const out = h('output', { class: 'num' }, String(val));
      body = h('div', { class: 'body fade-in' },
        h('span', { class: 'kind', style: { '--tc': tc } }, label),
        h('div', { class: 'name' }, st.name),
        h('p', { class: 'cue' }, st.cue),
        h('div', { class: 'big num' }, String(st.target)),
        h('p', { class: 'sub' }, st.side ? 'répétitions par côté' : 'répétitions visées'),
        h('div', { class: 'stepper', 'aria-label': 'Répétitions réalisées' },
          h('button', { 'aria-label': 'Moins', onclick: () => { val = Math.max(0, val - 1); out.textContent = val; } }, '−'), out,
          h('button', { 'aria-label': 'Plus', onclick: () => { val += 1; out.textContent = val; } }, '+')));
      actions = h('div', { class: 'actions' }, h('button', { class: 'btn block', onclick: () => { logSet(st, val); next(); } }, 'Série faite'));
    } else if (st.kind === 'work') {
      const big = h('div', { class: 'big num' }, mmss(st.target));
      const btn = h('button', { class: 'btn block' }, 'Démarrer');
      let t0s = 0;
      btn.addEventListener('click', () => {
        if (timer) { const spent = st.target - timer.left(); stopTimer(); logSet(st, Math.max(1, spent)); next(); return; }
        t0s = Date.now();
        btn.textContent = 'Arrêter';
        btn.classList.add('ghost');
        countdown(st.target, big, { onDone: () => { logSet(st, st.target); next(); } });
      });
      body = h('div', { class: 'body fade-in' }, h('span', { class: 'kind', style: { '--tc': tc } }, label), h('div', { class: 'name' }, st.name), h('p', { class: 'cue' }, st.cue), big, h('p', { class: 'sub' }, 'secondes à tenir'));
      actions = h('div', { class: 'actions' }, btn);
    } else {
      const big = h('div', { class: 'big num' }, mmss(st.secs));
      const nw = st.kind === 'rest' ? nextWork(i) : null;
      body = h('div', { class: 'body fade-in' },
        h('span', { class: 'kind', style: { '--tc': tc } }, label),
        st.kind === 'rest' ? null : h('div', { class: 'name' }, st.name),
        st.cue ? h('p', { class: 'cue' }, st.cue) : null,
        big,
        nw ? h('p', { class: 'next' }, `Ensuite : ${nw.name}, ${nw.type === 'time' ? `${nw.target} s` : `${nw.target}${nw.side ? ' par côté' : ' rép.'}`}`) : null);
      const tm = countdown(st.secs, big, { onDone: next, beepEnd: st.kind === 'rest' });
      actions = h('div', { class: 'actions' },
        h('div', { class: 'row-btns' },
          st.kind === 'rest' ? h('button', { class: 'btn ghost', onclick: () => tm.add(15) }, '+15 s') : null,
          h('button', { class: 'btn', onclick: () => { stopTimer(); next(); } }, 'Passer')));
    }
    root.replaceChildren(header(), body, actions);
  }

  function logSet(st, reps) {
    sets.push({ slot: st.slot, name: st.name, type: st.type, side: st.side, target: st.target, reps, level: st.level });
  }

  function finish() {
    const secs = Math.round((Date.now() - t0) / 1000);
    const notes = applyProgression(sets);
    update(st => {
      st.workouts.push({ id: Date.now(), date: dateKey(), sessionId, fmtId, secs, sets });
      if (nextSession().id === sessionId) st.rotation += 1;
    });
    const bySlot = {};
    sets.forEach(x => { (bySlot[x.slot] ||= { name: x.name, type: x.type, list: [] }).list.push(x.reps); });
    root.replaceChildren(
      h('div', { class: 'head' }, h('div', { class: 'progress' }, h('i', { style: { width: '100%' } }))),
      h('div', { class: 'body fade-in', style: { justifyItems: 'stretch', textAlign: 'left', alignContent: 'start', overflowY: 'auto' } },
        h('div', { style: { textAlign: 'center' } }, h('span', { class: 'kind' }, 'Séance terminée'), h('div', { class: 'name', style: { margin: '6px auto' } }, 'Bien joué'), h('p', { class: 'sub num' }, `${mmss(secs)} · ${sets.length} séries`)),
        h('div', { class: 'card' }, h('h3', {}, 'Ton bilan'),
          Object.values(bySlot).map(b => h('div', { class: 'summary-row' }, h('span', {}, b.name), h('b', { class: 'num' }, b.list.join(' · ') + (b.type === 'time' ? ' s' : '')))),
        ),
        h('div', { class: 'card' }, h('h3', {}, 'Prochaine fois'),
          notes.map(n => h('div', { class: 'summary-row' }, h('span', {}, n.up ? `Niveau supérieur : ${n.name}` : n.name),
            h('b', { class: 'num' }, n.type === 'time' ? `${n.target} s` : `${n.target} rép.`))))),
      h('div', { class: 'actions' }, h('button', { class: 'btn block', onclick: () => go('#/home') }, 'Terminer')));
    beep(980, 200); vibrate([100, 50, 100, 50, 200]);
  }

  draw();
  return root;
}
