// Logique : cases du jour, scores, séries, génération et progression des séances.
import { getState, getDay, dateKey, addDays, daysBetween, dayOrdinal, update } from './store.js';
import { LADDERS, SESSIONS, FORMATS, WARMUP, COOLDOWN, HAIR, SUCRE_SEMAINES, THEME_ORDER } from './data.js';

export const answers = () => getState().profile.answers || {};
const has = (id, v) => { const a = answers()[id]; return Array.isArray(a) ? a.includes(v) : a === v; };

/* ---------- niveaux et contraintes ---------- */
const cap = slot => {
  const g = answers().gene;
  if (g === 'dos' && ['abs', 'abs2', 'core2'].includes(slot)) return 1;
  if (g === 'epaules') {
    if (slot === 'shoulder') return 0;
    if (slot === 'push' || slot === 'triceps') return 1;
  }
  return 3;
};

function initLevel(slot) {
  const a = answers();
  const push = +(a.pompes || 0);
  const core = +(a.planche || 0);
  const active = Array.isArray(a.activites) && a.activites.some(x => x !== 'rien');
  const map = {
    push, triceps: Math.max(0, push - 1), shoulder: Math.max(0, push - 1),
    biceps: push >= 2 ? 1 : 0, back: push >= 2 ? 1 : 0, traps: 0,
    abs: core, abs2: Math.max(0, core - 1), core2: core, cardio: active ? 1 : 0,
  };
  return Math.min(map[slot] ?? 0, cap(slot));
}

export function slotState(slot) {
  const p = getState().prog[slot];
  const level = Math.min(p ? p.level : initLevel(slot), cap(slot));
  return { level, bonus: p ? p.bonus : 0 };
}

export function exerciseFor(slot) {
  const { level, bonus } = slotState(slot);
  const ex = LADDERS[slot].ladder[level];
  const target = ex.type === 'time' ? ex.base + 5 * bonus : ex.base + bonus;
  const poignets = answers().gene === 'poignets' && /pompe|pike|diamant|planche|burpee|mountain/i.test(ex.name);
  return {
    slot, level, bonus, target, name: ex.name, type: ex.type, side: !!ex.side, silent: !!ex.silent,
    cue: ex.cue + (poignets ? ' Appuie-toi sur les poings ou les avant-bras pour ménager tes poignets.' : ''),
    group: LADDERS[slot].label,
  };
}

/* ---------- formats ---------- */
export function nextSession() { return SESSIONS[getState().rotation % SESSIONS.length]; }

export function recommendFormat(mode) {
  if (mode === 'train') return 'express';
  const t = answers().tempsCalme;
  if (t === 'm10') return 'express';
  if (t === 'm20') return 'standard';
  return 'complete';
}

const workSecs = e => e.type === 'time' ? e.target + 5 : e.target * (e.side ? 2 : 1) * 3.2 + 5;

export function planSession(sessionId, fmtId) {
  const sess = SESSIONS.find(s => s.id === sessionId);
  const fmt = FORMATS[fmtId];
  const exs = sess.slots.slice(0, fmt.slots).map(exerciseFor);
  const warm = WARMUP.slice(0, fmt.warm);
  const cool = COOLDOWN.slice(0, fmt.cool);
  const roundSecs = exs.reduce((t, e) => t + workSecs(e) + fmt.rest, 0);
  const budget = fmt.mins * 60 - (warm.length + cool.length) * 30;
  const rounds = Math.max(1, Math.min(4, Math.round(budget / roundSecs)));

  const steps = [];
  warm.forEach(w => steps.push({ kind: 'warm', name: w.name, cue: w.cue, type: 'time', secs: w.secs }));
  for (let r = 1; r <= rounds; r++) {
    exs.forEach((e, i) => {
      steps.push({ kind: 'work', ...e, round: r, rounds, secs: e.type === 'time' ? e.target : 0 });
      const last = r === rounds && i === exs.length - 1;
      if (!last) steps.push({ kind: 'rest', name: 'Repos', type: 'time', secs: fmt.rest });
    });
  }
  cool.forEach(c => steps.push({ kind: 'cool', name: c.name, cue: c.cue, type: 'time', secs: c.secs }));

  const estSecs = steps.reduce((t, s) => t + (s.kind === 'work' && s.type === 'reps' ? workSecs(s) : (s.secs || 0)), 0);
  return { sessionId, fmtId, name: sess.name, tag: sess.tag, steps, rounds, exercises: exs, estMin: Math.max(3, Math.round(estSecs / 60)) };
}

/* ---------- progression ---------- */
export function applyProgression(sets) {
  const bySlot = {};
  sets.forEach(s => { (bySlot[s.slot] ||= []).push(s); });
  const notes = [];
  update(st => {
    Object.entries(bySlot).forEach(([slot, arr]) => {
      const cur = slotState(slot);
      let { level, bonus } = cur;
      const allHit = arr.every(s => s.reps >= s.target);
      const mostlyMissed = arr.filter(s => s.reps < s.target * 0.7).length > arr.length / 2;
      let up = false;
      if (allHit) {
        bonus += 1;
        if (bonus >= 4 && level < cap(slot)) { level += 1; bonus = 0; up = true; }
      } else if (mostlyMissed) bonus = Math.max(0, bonus - 1);
      st.prog[slot] = { level, bonus };
      const nextEx = exerciseFor(slot);
      notes.push({ slot, name: nextEx.name, target: nextEx.target, type: nextEx.type, up, allHit });
    });
  });
  return notes;
}

/* ---------- semaine depuis le quiz ---------- */
export function weekNumber(k = dateKey()) {
  const start = getState().profile.startDate || k;
  return Math.max(1, Math.floor(daysBetween(start, k) / 7) + 1);
}

export function waterGoal(k = dateKey()) {
  const base = { e0: 4, e1: 5, e2: 6, e3: 7 }[answers().eau] ?? 6;
  return Math.min(8, base + Math.floor((weekNumber(k) - 1) / 2));
}

export function bedtimeDefault() {
  return { tot: '22:30', mid: '23:30', late: '00:00', vlate: '00:00' }[answers().coucher] || '23:30';
}
export const bedtime = () => getState().settings.bedtime || bedtimeDefault();

export function focusMinutes() {
  return { c10: 10, c25: 15, c45: 25, c60: 30 }[answers().concentration] ?? 25;
}

/* ---------- cases du jour ---------- */
export function workedOut(k) { return getState().workouts.some(w => w.date === k); }

export function buildChecklist(k, mode) {
  const a = answers();
  const calme = mode !== 'train';
  const items = [];
  const add = (id, theme, label, extra = {}) => items.push({ id, theme, label, ...extra });
  const fmt = FORMATS[recommendFormat(mode)];

  add('sport.seance', 'sport', calme ? `Séance de sport (${fmt.label.toLowerCase()}, ${fmt.mins} min)` : `Séance express (${fmt.mins} min)`, { kind: 'session' });
  add('sport.posture', 'sport', 'Trois pauses debout de 2 minutes dans la journée');

  add('peau.nettoyer', 'peau', 'Nettoyer le visage (matin, nettoyant doux)');
  if (calme && !has('peauSoucis', 'aucun') && dayOrdinal(k) % (weekNumber(k) > 1 ? 2 : 4) === 0) add('peau.actif', 'peau', 'Actif ciblé (gel ou sérum incolore)');
  add('peau.hydratant', 'peau', 'Hydratant léger');
  add('peau.solaire', 'peau', 'Crème solaire fluide');

  add('cheveux.coiffage', 'cheveux', 'Coiffer selon ton guide');
  const interval = (HAIR.cuir[a.cuir] || HAIR.cuir.normal).lavage;
  if (dayOrdinal(k) % interval === 0) add('cheveux.lavage', 'cheveux', 'Laver les cheveux aujourd’hui');

  add('sommeil.rituel', 'sommeil', 'Écran coupé 15 minutes avant de dormir');
  add('sommeil.coucher', 'sommeil', `Au lit avant ${bedtime()}`);

  const w = weekNumber(k);
  if (a.petitdej === 'sale') add('alim.petitdej', 'alim', 'Petit-déjeuner avec des protéines');
  else add('alim.petitdej', 'alim', SUCRE_SEMAINES[Math.min(w, SUCRE_SEMAINES.length) - 1]);
  add('alim.eau', 'alim', `Eau : ${waterGoal(k)} verres`, { kind: 'water', goal: waterGoal(k) });
  if (a.sucre && a.sucre !== 'jamais') add('alim.gouter', 'alim', 'Goûter : un fruit ou un laitage nature');

  add('memoire.rappel', 'memoire', 'Rappel actif : note 3 choses retenues hier');
  add('memoire.focus', 'memoire', `Une session de concentration de ${focusMinutes()} min`);
  if (calme) add('memoire.jeu', 'memoire', 'Un exercice de mémoire');
  return items;
}

export function isDone(item, k) {
  const d = getState().days[k];
  if (item.kind === 'session') return workedOut(k);
  if (!d) return false;
  if (item.kind === 'water') return (d.water || 0) >= item.goal;
  return !!d.checks[item.id];
}

export function themeScore(theme, k) {
  const d = getState().days[k];
  const items = buildChecklist(k, d ? d.mode : 'calme').filter(i => i.theme === theme);
  if (!items.length) return 0;
  return items.filter(i => isDone(i, k)).length / items.length;
}

export function dayScore(k) {
  const d = getState().days[k];
  const items = buildChecklist(k, d ? d.mode : 'calme');
  if (!items.length) return 0;
  return items.filter(i => isDone(i, k)).length / items.length;
}

export function adherence(theme, n = 7) {
  const today = dateKey();
  const start = getState().profile.startDate || today;
  let sum = 0, count = 0;
  for (let i = 0; i < n; i++) {
    const k = addDays(today, -i);
    if (daysBetween(start, k) < 0) break;
    sum += theme ? themeScore(theme, k) : dayScore(k);
    count++;
  }
  return count ? sum / count : 0;
}

export function streak() {
  const today = dateKey();
  let k = dayScore(today) >= 0.5 ? today : addDays(today, -1);
  let n = 0;
  const start = getState().profile.startDate || today;
  while (daysBetween(start, k) >= 0 && dayScore(k) >= 0.5) { n++; k = addDays(k, -1); }
  return n;
}

export function themeRank() {
  const pr = answers().priorites || [];
  const map = { muscle: 'sport', ventre: 'sport', peau: 'peau', cheveux: 'cheveux', memoire: 'memoire', sommeil: 'sommeil' };
  const first = [...new Set(pr.map(p => map[p]))].filter(Boolean);
  return [...first, ...THEME_ORDER.filter(t => !first.includes(t))];
}

/* ---------- volume d'entraînement ---------- */
export function weeklyVolume(weeks = 8) {
  const out = [];
  const today = dateKey();
  const dow = (new Date().getDay() + 6) % 7;
  const mon = addDays(today, -dow);
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(mon, -7 * i), end = addDays(start, 6);
    let reps = 0, sessions = 0;
    getState().workouts.forEach(w => {
      if (w.date >= start && w.date <= end) {
        sessions++;
        reps += w.sets.reduce((t, s) => t + (s.type === 'reps' ? s.reps * (s.side ? 2 : 1) : Math.round(s.reps / 3)), 0);
      }
    });
    out.push({ start, reps, sessions });
  }
  return out;
}

export function records() {
  const best = {};
  getState().workouts.forEach(w => w.sets.forEach(s => {
    const key = s.name;
    if (!best[key] || s.reps > best[key].reps) best[key] = { name: s.name, reps: s.reps, type: s.type, date: w.date };
  }));
  return Object.values(best).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
}
