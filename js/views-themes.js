// Écrans : thèmes, progrès, réglages.
import { h, s, gauge, bars, line, pct, fmtShort, mmss, toast, vibrate, beep, confirmSheet, makeTimer, fill } from './ui.js';
import { getState, update, getDay, dateKey, addDays, mondayOf, fromKey, replaceState, resetAll, addPhoto, listPhotos, deletePhoto } from './store.js';
import { THEMES, THEME_ORDER, QUIZ, HAIR, PEAU_PRODUITS, PEAU_NOTE_PRODUITS, MEMOIRE_LIEUX, SUCRE_SEMAINES, SOURCES, DISCLAIMER } from './data.js';
import { answers, adherence, dayScore, weeklyVolume, records, weekNumber, waterGoal, bedtime, bedtimeDefault, focusMinutes, streak } from './engine.js';

const go = hash => { location.hash = hash; };
const has = (id, v) => { const a = answers()[id]; return Array.isArray(a) ? a.includes(v) : a === v; };
const optLabel = (qid, v) => (QUIZ.find(q => q.id === qid).opts.find(o => o[0] === v) || [, v])[1];

export function applyTheme() {
  const t = getState().settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
}

const sourcesCard = theme => h('section', { class: 'card flat' }, h('h3', {}, 'Sources'),
  h('div', { class: 'sources' }, SOURCES[theme].map(([a, b]) => h('p', {}, h('b', {}, a), ' — ', b))),
  h('p', { class: 'muted small' }, DISCLAIMER));
const backTop = (title, sub) => h('header', { class: 'top' }, h('div', {}, h('a', { href: '#/themes', class: 'muted small', style: { textDecoration: 'none' } }, '‹ Thèmes'), h('h1', {}, title), sub ? h('p', { class: 'muted' }, sub) : null));
const adherenceCard = theme => h('section', { class: 'card' }, gauge(adherence(theme, 7), theme, 'Régularité sur 7 jours'));

/* ================================================================ LISTE DES THÈMES */
const ICONS = { sport: 'S', peau: 'P', cheveux: 'C', sommeil: 'Z', alim: 'A', memoire: 'M' };
const BLURBS = {
  sport: 'Séances au poids du corps, progression automatique',
  peau: 'Routine de jour discrète, produits en pharmacie',
  cheveux: 'Ton type de cheveux, lavage et coiffage',
  sommeil: 'Heure de coucher, coupure des écrans, suivi',
  alim: 'Eau, petit-déjeuner, protéines, défi sucre',
  memoire: 'Concentration, jeux et méthode des lieux',
};
export function themesView() {
  return h('div', { class: 'view' },
    h('header', { class: 'top' }, h('div', {}, h('p', { class: 'date' }, 'Tout ce que tu travailles'), h('h1', {}, 'Thèmes'))),
    THEME_ORDER.map(t => h('a', { class: 'card theme-card', href: t === 'sport' ? '#/sport' : `#/theme/${t}`, style: { '--tc': `var(--c-${t})`, textDecoration: 'none' } },
      h('span', { class: 'ico' }, ICONS[t]),
      h('span', { class: 'grow' }, h('b', {}, THEMES[t].label), h('span', { class: 'muted small' }, BLURBS[t])),
      h('span', { class: 'num', style: { fontWeight: 700 } }, `${pct(adherence(t, 7))} %`))));
}

export function themeView(id) {
  const fn = { peau, cheveux, sommeil, alim, memoire }[id];
  return fn ? fn() : themesView();
}

/* ================================================================ PEAU */
function peau() {
  const a = answers();
  const soucis = Array.isArray(a.peauSoucis) ? a.peauSoucis.filter(x => x !== 'aucun') : [];
  const type = a.peauType || 'nsp';
  const nettoyant = type === 'seche' ? 'un lait ou une crème nettoyante plutôt qu’un gel moussant' : 'un gel nettoyant doux sans savon';
  const actif = soucis.includes('rougeurs') && !soucis.includes('boutons')
    ? 'niacinamide 4 à 10 % en gel ou sérum incolore, qui calme les rougeurs'
    : 'niacinamide 4 à 10 % ou acide salicylique 0,5 à 2 % en gel incolore, utile pour les boutons, points noirs et le grain';
  const steps = [
    ['Nettoyer', `Avec ${nettoyant}, eau tiède, 30 à 60 secondes, puis rince bien. Une seule fois, le matin : laver trop souvent irrite.`],
    ['Cibler', `Un actif : ${actif}. Semaine 1 : un jour sur quatre. Ensuite : un jour sur deux. Si ça tiraille ou rougit, saute un jour.`],
    ['Hydrater', type === 'seche' ? 'Une crème hydratante un peu plus riche, non comédogène.' : 'Un gel-crème léger, non comédogène. Même une peau grasse a besoin d’hydratation.'],
    ['Protéger', 'Une crème solaire fluide ou en gel, indice 30 minimum, sans fini blanc. C’est le geste qui protège le plus et limite les marques.'],
  ];
  return h('div', { class: 'view' },
    backTop('Peau', soucis.length ? `${optLabel('peauType', type)} · ${soucis.map(x => optLabel('peauSoucis', x).toLowerCase()).join(', ')}` : optLabel('peauType', type)),
    adherenceCard('peau'),
    h('section', { class: 'card' }, h('h2', {}, 'Ta routine du matin'), h('p', { class: 'muted' }, 'Deux minutes dans la salle de bain, rien de visible : pas de masque, aucun produit de nuit.'),
      h('div', { class: 'list' }, steps.map(([t, d], i) => h('div', { class: 'stack', style: { gap: '4px' } }, h('b', {}, `${i + 1}. ${t}`), h('span', { class: 'muted' }, d))))),
    h('section', { class: 'card' }, h('h2', {}, 'Produits à trouver en magasin'),
      h('div', { class: 'list' }, PEAU_PRODUITS.map(p => h('div', { class: 'stack', style: { gap: '2px' } }, h('b', {}, p.etape), h('span', { class: 'muted' }, p.exemples)))),
      h('p', { class: 'callout' }, PEAU_NOTE_PRODUITS)),
    h('section', { class: 'card' }, h('h2', {}, 'Bons réflexes'),
      h('details', { open: true }, h('summary', {}, 'À éviter'), h('p', { class: 'muted' }, 'Percer ou gratter les boutons, qui laisse des marques. Les gommages agressifs. Multiplier les actifs en même temps.')),
      h('details', {}, h('summary', {}, 'Un nouveau produit'), h('p', { class: 'muted' }, 'Teste-le d’abord sur une petite zone, près de la mâchoire, pendant deux jours. Introduis un seul nouveau produit à la fois.')),
      h('details', {}, h('summary', {}, 'Quand consulter'), h('p', { class: 'muted' }, 'Si les boutons sont nombreux, douloureux, profonds, ou laissent des marques, vois un médecin ou un dermatologue. Des traitements efficaces existent sur ordonnance.'))),
    sourcesCard('peau'));
}

/* ================================================================ CHEVEUX */
function cheveux() {
  const a = answers();
  const f = HAIR.forme[a.cheveuxForme] || HAIR.forme.raides;
  const c = HAIR.cuir[a.cuir] || HAIR.cuir.normal;
  const l = HAIR.longueur[a.cheveuxLong] || HAIR.longueur.c;
  return h('div', { class: 'view' },
    backTop('Cheveux', `${f.label} · ${l.label.toLowerCase()} · cuir chevelu ${c.label.toLowerCase()}`),
    adherenceCard('cheveux'),
    h('section', { class: 'card' }, h('h2', {}, 'Ton type de cheveux'), h('p', { class: 'muted' }, f.tips)),
    h('section', { class: 'card' }, h('h2', {}, 'Lavage'), h('p', { class: 'muted' }, c.conseil),
      h('p', { class: 'muted' }, 'Shampoing sur le cuir chevelu seulement, avec les doigts. Après-shampoing sur les longueurs si tes cheveux sont secs ou longs. Rince à l’eau tiède.'),
      h('p', { class: 'callout' }, `Jours de lavage proposés : environ un jour sur ${c.lavage}. L’appli l’ajoute à tes cases du jour.`)),
    h('section', { class: 'card' }, h('h2', {}, 'Coiffage'), h('p', { class: 'muted' }, l.style),
      h('div', { class: 'stack' }, h('b', {}, 'Produits adaptés'), h('span', { class: 'muted' }, f.produits))),
    h('section', { class: 'card' }, h('h2', {}, 'À éviter'),
      h('p', { class: 'muted' }, 'Brosser à sec des cheveux bouclés ou crépus. Le sèche-cheveux à pleine chaleur trop près : garde-le à distance, en température moyenne. Trop de produit d’un coup : commence par une petite quantité.')),
    sourcesCard('cheveux'));
}

/* ================================================================ SOMMEIL */
const hoursBetween = (bed, wake) => {
  const [bh, bm] = bed.split(':').map(Number), [wh, wm] = wake.split(':').map(Number);
  let d = (wh * 60 + wm) - (bh * 60 + bm);
  if (d <= 0) d += 1440;
  return d / 60;
};

function sommeil() {
  const root = h('div', { class: 'view' });
  const k = dateKey();
  function draw() {
    const st = getState();
    const ecran = answers().ecran;
    const longScreen = ['s60', 's90'].includes(ecran);
    const last7 = Array.from({ length: 7 }, (_, i) => addDays(k, i - 6));
    const hrs = last7.map(d => { const sl = st.days[d] && st.days[d].sleep; return sl ? hoursBetween(sl.bed, sl.wake) : 0; });
    const dayLetter = d => fromKey(d).toLocaleDateString('fr-FR', { weekday: 'narrow' });
    const cur = getDay(k).sleep || { bed: bedtime(), wake: '09:00' };
    const bedIn = h('input', { type: 'time', value: cur.bed, 'aria-label': 'Heure de coucher' });
    const wakeIn = h('input', { type: 'time', value: cur.wake, 'aria-label': 'Heure de lever' });
    const targetIn = h('input', { type: 'time', value: bedtime(), 'aria-label': 'Heure de coucher visée' });
    root.replaceChildren(
      backTop('Sommeil', answers().reveil ? `Réveil ${optLabel('reveil', answers().reveil).toLowerCase()}` : null),
      adherenceCard('sommeil'),
      h('section', { class: 'card' }, h('h2', {}, 'Ton heure de coucher visée'),
        h('p', { class: 'muted' }, 'Les adultes ont besoin de 7 heures de sommeil ou plus. Avance ton coucher de 15 minutes par semaine plutôt que d’un coup.'),
        h('label', { class: 'field' }, 'Au lit avant', targetIn),
        h('button', { class: 'btn ghost', onclick: () => { update(s2 => { s2.settings.bedtime = targetIn.value || '23:30'; }); toast('Heure enregistrée'); draw(); } }, 'Enregistrer')),
      h('section', { class: 'card' }, h('h2', {}, 'La nuit dernière'),
        h('div', { class: 'grid2' }, h('label', { class: 'field' }, 'Coucher', bedIn), h('label', { class: 'field' }, 'Lever', wakeIn)),
        h('button', { class: 'btn', onclick: () => { update(s2 => { getDay(k); s2.days[k].sleep = { bed: bedIn.value, wake: wakeIn.value }; }); toast('Nuit enregistrée'); draw(); } }, 'Enregistrer la nuit'),
        h('p', { class: 'muted small' }, 'Durée de sommeil sur 7 jours (heures)'),
        bars(hrs, { max: 10, color: 'var(--c-sommeil)', labels: last7.map(dayLetter) })),
      h('section', { class: 'card' }, h('h2', {}, 'Rituel de coupure, 15 minutes'),
        h('div', { class: 'list' },
          [
            longScreen ? 'Fixe l’heure de fin de ton film : le film s’arrête avant l’heure de coucher visée, pas après.' : 'Termine ton film ou ta série 15 minutes avant l’heure visée.',
            'Pose le téléphone sur son chargeur, hors du lit, ou active le mode sans notification.',
            'Baisse la lumière de la chambre et prépare le lendemain : vêtements, eau, ce qu’il faut pour le train.',
            'Remplace le défilement par une activité calme : lecture, étirements doux, respiration lente.',
          ].map((t, i) => h('div', { class: 'stack', style: { gap: '2px' } }, h('b', {}, `${i + 1}`), h('span', { class: 'muted' }, t)))),
        longScreen ? h('p', { class: 'callout' }, 'Tu passes un moment sur ton téléphone au lit. Rien d’interdit : l’objectif est de réduire un peu, puis de poser l’écran avant de te coucher.') : null),
      h('section', { class: 'card' }, h('h2', {}, 'Repères'),
        h('details', {}, h('summary', {}, 'Travailler dans son lit'), h('p', { class: 'muted' }, 'Quand tu peux, travaille ailleurs que dans ton lit : le cerveau associe plus facilement le lit au sommeil. Sinon, sors du lit pour au moins une partie de la journée.')),
        h('details', {}, h('summary', {}, 'Caféine'), h('p', { class: 'muted' }, 'Évite le café, le thé fort et les boissons énergisantes dans les 6 heures avant le coucher.')),
        h('details', {}, h('summary', {}, 'Régularité'), h('p', { class: 'muted' }, 'Les jours de train, ton réveil change. Essaie de garder un coucher et un lever proches les autres jours.'))),
      sourcesCard('sommeil'));
  }
  draw();
  return root;
}

/* ================================================================ ALIMENTATION */
function alim() {
  const root = h('div', { class: 'view' });
  const k = dateKey();
  function draw() {
    const goal = waterGoal(k), d = getDay(k);
    const w = weekNumber(k);
    const lastW = [...getState().measures].reverse().find(m => m.weight);
    const prot = lastW ? `${Math.round(lastW.weight * 1.4)} à ${Math.round(lastW.weight * 2)} g par jour` : null;
    root.replaceChildren(
      backTop('Alimentation', 'Sans régime, avec ce qu’il y a à la maison'),
      adherenceCard('alim'),
      h('section', { class: 'card' }, h('h2', {}, 'Eau'), h('p', { class: 'muted' }, `Objectif du jour : ${goal} verres de 25 cl. Il monte d’un verre toutes les deux semaines, jusqu’à 8.`),
        h('div', { class: 'water', style: { padding: 0 } }, Array.from({ length: goal }, (_, i) =>
          h('button', { class: `glass ${i < (d.water || 0) ? 'full' : ''}`, 'aria-label': `Verre ${i + 1}`, onclick: () => { update(st => { getDay(k); const dd = st.days[k]; dd.water = dd.water === i + 1 ? i : i + 1; }); draw(); } })))),
      h('section', { class: 'card' }, h('h2', {}, 'Défi petit-déjeuner, 4 semaines'),
        h('p', { class: 'muted' }, 'Un seul changement à la fois. Tu es en semaine ' + Math.min(w, 4) + '.'),
        h('div', { class: 'list' }, SUCRE_SEMAINES.map((t, i) => h('div', { class: 'stack', style: { gap: '2px', opacity: i + 1 === Math.min(w, 4) ? 1 : .55 } }, h('b', {}, `Semaine ${i + 1}${i + 1 === Math.min(w, 4) ? ' · en cours' : ''}`), h('span', { class: 'muted' }, t))))),
      h('section', { class: 'card' }, h('h2', {}, 'Protéines pour le muscle'),
        h('p', { class: 'muted' }, prot ? `Repère pour prendre du muscle : ${prot}.` : 'Repère pour prendre du muscle : 1,4 à 2 g par kilo de poids de corps et par jour. Ajoute ton poids dans l’onglet Progrès pour voir ta fourchette.'),
        h('p', { class: 'muted' }, 'Sources faciles à la maison : œufs, fromage blanc, yaourt nature, fromage, viande, poisson, lentilles, pois chiches.')),
      h('section', { class: 'card' }, h('h2', {}, 'Repères utiles'),
        h('details', {}, h('summary', {}, 'Sauter le repas du midi'), h('p', { class: 'muted' }, 'Ce n’est pas interdit. Si tu t’entraînes ou si tu as très faim l’après-midi, une collation avec des protéines (yaourt, fromage blanc, œufs durs) évite de tomber sur les produits sucrés.')),
        h('details', {}, h('summary', {}, 'Le goûter'), h('p', { class: 'muted' }, 'Un fruit, un laitage nature ou une poignée d’oléagineux rassasient plus longtemps qu’un biscuit.')),
        h('details', {}, h('summary', {}, 'Perdre du gras du ventre'), h('p', { class: 'muted' }, 'Il se perd sur l’ensemble du corps, pas à un endroit choisi. Les leviers : moins de sucres rapides, protéines et légumes à chaque repas, séances régulières, marche dans la journée.'))),
      sourcesCard('alim'));
  }
  draw();
  return root;
}

/* ================================================================ MÉMOIRE */
function memoire() {
  const root = h('div', { class: 'view' });
  const k = dateKey();
  let timerBox = null;

  const markDone = id => update(st => { getDay(k); st.days[k].checks[id] = true; });

  /* Minuteur de concentration */
  function focusCard() {
    let mins = focusMinutes(), tm = null;
    const disp = h('div', { class: 'digits' }, mmss(mins * 60));
    const startBtn = h('button', { class: 'btn' }, 'Démarrer');
    const chips = h('div', { class: 'row', style: { flexWrap: 'wrap' } });
    const drawChips = () => chips.replaceChildren(...[10, 15, 25, 30].map(m => h('button', { class: `chip ${m === mins ? 'active' : ''}`, onclick: () => { if (tm) return; mins = m; disp.textContent = mmss(m * 60); drawChips(); } }, `${m} min`)));
    drawChips();
    startBtn.addEventListener('click', () => {
      if (tm) { tm.stop(); tm = null; startBtn.textContent = 'Démarrer'; disp.textContent = mmss(mins * 60); return; }
      startBtn.textContent = 'Arrêter';
      tm = makeTimer(mins * 60, { onTick: t => { disp.textContent = mmss(t); }, onDone: () => { tm = null; startBtn.textContent = 'Démarrer'; disp.textContent = mmss(mins * 60); beep(980, 300); vibrate([200, 80, 200]); markDone('memoire.focus'); toast('Session terminée, case cochée'); } });
    });
    timerBox = { stop: () => tm && tm.stop() };
    return h('section', { class: 'card' }, h('h2', {}, 'Session de concentration'),
      h('p', { class: 'muted' }, 'Un seul travail, téléphone posé hors de portée. Quand le minuteur se termine, prends 5 minutes de pause.'), chips, disp, startBtn);
  }

  /* Suite de chiffres */
  function digitCard() {
    const best = getState().games.digit || 0;
    const box = h('div', { class: 'stack' });
    let len = 3;
    function intro() {
      box.replaceChildren(h('p', { class: 'muted' }, `Mémorise la suite de chiffres, puis retape-la. Record : ${best || 'aucun'}.`), h('button', { class: 'btn', onclick: () => { len = 3; round(); } }, 'Jouer'));
    }
    function round() {
      const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
      const show = h('div', { class: 'digits' }, seq.split('').join(' '));
      box.replaceChildren(h('p', { class: 'muted small' }, `${len} chiffres`), show);
      setTimeout(() => {
        const inp = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: 'Ta réponse', 'aria-label': 'Suite de chiffres' });
        const ok = () => {
          if (inp.value.trim() === seq) { len++; toast('Bravo'); round(); }
          else {
            const score = len - 1;
            update(st => { if (score > (st.games.digit || 0)) st.games.digit = score; });
            box.replaceChildren(h('p', {}, `C’était ${seq}. Tu as retenu ${score} chiffres.`), h('button', { class: 'btn', onclick: intro }, 'Rejouer'));
            markDone('memoire.jeu');
          }
        };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
        box.replaceChildren(h('p', { class: 'muted small' }, `${len} chiffres`), inp, h('button', { class: 'btn', onclick: ok }, 'Valider'));
        inp.focus();
      }, 900 + len * 450);
    }
    intro();
    return h('section', { class: 'card' }, h('h2', {}, 'Jeu : suite de chiffres'), box);
  }

  /* Paires */
  function pairsCard() {
    const symbols = ['★', '●', '▲', '■', '◆', '✚'];
    const box = h('div', { class: 'stack' });
    function start() {
      const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
      let open = [], moves = 0, found = 0, lock = false;
      const grid = h('div', { class: 'memo-grid' });
      const info = h('p', { class: 'muted small' }, 'Coups : 0');
      const cards = deck.map((sym, i) => {
        const b = h('button', { class: 'memo-card', 'aria-label': 'Carte cachée' }, '?');
        b.addEventListener('click', () => {
          if (lock || b.classList.contains('ok') || open.includes(i)) return;
          b.classList.add('up'); b.textContent = sym; open.push(i);
          if (open.length === 2) {
            moves++; info.textContent = `Coups : ${moves}`; lock = true;
            const [x, y] = open;
            if (deck[x] === deck[y]) {
              cards[x].classList.replace('up', 'ok'); cards[y].classList.replace('up', 'ok'); open = []; lock = false; found++;
              if (found === symbols.length) {
                update(st => { if (!st.games.pairs || moves < st.games.pairs) st.games.pairs = moves; });
                markDone('memoire.jeu'); toast(`Terminé en ${moves} coups`);
                box.append(h('button', { class: 'btn', onclick: start }, 'Rejouer'));
              }
            } else setTimeout(() => { [x, y].forEach(j => { cards[j].classList.remove('up'); cards[j].textContent = '?'; }); open = []; lock = false; }, 800);
          }
        });
        return b;
      });
      grid.append(...cards);
      box.replaceChildren(info, grid);
    }
    box.append(h('p', { class: 'muted' }, `Retrouve les paires en un minimum de coups. Record : ${getState().games.pairs || 'aucun'}.`), h('button', { class: 'btn', onclick: start }, 'Jouer'));
    return h('section', { class: 'card' }, h('h2', {}, 'Jeu : paires'), box);
  }

  root.append(
    backTop('Mémoire', 'Concentration, jeux et méthodes'),
    adherenceCard('memoire'),
    focusCard(), digitCard(), pairsCard(),
    h('section', { class: 'card' }, h('h2', {}, 'Méthodes qui marchent'),
      h('details', { open: true }, h('summary', {}, 'Rappel actif, 3 minutes'), h('p', { class: 'muted' }, 'Sans regarder tes notes, écris trois choses que tu as apprises ou retenues hier. Se tester fixe mieux que relire.')),
      h('details', {}, h('summary', {}, 'Révisions espacées'), h('p', { class: 'muted' }, 'Revois une notion le lendemain, puis 3 jours plus tard, puis une semaine plus tard. Les rappels espacés ancrent la mémoire sur la durée.')),
      h('details', {}, h('summary', {}, 'Méthode des lieux'), h('div', { class: 'list' }, MEMOIRE_LIEUX.map((t, i) => h('p', { class: 'muted' }, `${i + 1}. ${t}`))))),
    sourcesCard('memoire'));
  root._destroy = () => timerBox && timerBox.stop();
  return root;
}

/* ================================================================ PROGRÈS */
export function progressView() {
  const root = h('div', { class: 'view' });
  let photoKind = 'visage';

  async function photosCard() {
    const list = await listPhotos();
    const mine = list.filter(p => p.kind === photoKind);
    const urls = mine.map(p => URL.createObjectURL(p.blob));
    const input = h('input', { type: 'file', accept: 'image/*', hidden: true });
    input.addEventListener('change', async () => {
      const f = input.files && input.files[0]; if (!f) return;
      try {
        const bmp = await createImageBitmap(f);
        const sc = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
        await addPhoto({ id: String(Date.now()), kind: photoKind, date: dateKey(), blob });
        toast('Photo ajoutée'); draw();
      } catch (e) { toast('Photo impossible à lire'); }
    });
    return h('section', { class: 'card' }, h('h2', {}, 'Photos de suivi'),
      h('p', { class: 'muted' }, 'Stockées uniquement sur ce téléphone, jamais envoyées. Prends-les dans les mêmes conditions : même lumière, même position, une fois par semaine.'),
      h('div', { class: 'seg' }, ['visage', 'ventre'].map(kk => h('button', { 'aria-pressed': photoKind === kk ? 'true' : 'false', onclick: () => { photoKind = kk; draw(); } }, kk === 'visage' ? 'Visage' : 'Ventre'))),
      mine.length >= 2 ? h('div', { class: 'compare' },
        h('figure', {}, h('img', { src: urls[0], alt: 'Première photo' }), h('figcaption', {}, `Début · ${fmtShort(mine[0].date)}`)),
        h('figure', {}, h('img', { src: urls[urls.length - 1], alt: 'Dernière photo' }), h('figcaption', {}, `Récent · ${fmtShort(mine[mine.length - 1].date)}`))) : null,
      mine.length ? h('div', { class: 'photo-grid' }, mine.map((p, i) => h('img', { src: urls[i], alt: `Photo du ${p.date}`, onclick: async () => { if (await confirmSheet('Supprimer cette photo ?', fmtShort(p.date), 'Supprimer', true)) { await deletePhoto(p.id); draw(); } } }))) : h('p', { class: 'muted' }, 'Aucune photo pour l’instant.'),
      h('button', { class: 'btn', onclick: () => input.click() }, 'Ajouter une photo'), input);
  }

  function measuresCard() {
    const ms = getState().measures;
    const waist = h('input', { type: 'number', step: '0.5', inputmode: 'decimal', placeholder: 'ex. 82' });
    const weight = h('input', { type: 'number', step: '0.1', inputmode: 'decimal', placeholder: 'ex. 70' });
    const wpts = ms.filter(m => m.waist).map(m => ({ y: m.waist }));
    const first = ms.find(m => m.waist), last = [...ms].reverse().find(m => m.waist);
    return h('section', { class: 'card' }, h('h2', {}, 'Mesures'),
      h('p', { class: 'muted' }, 'Une fois par semaine, le matin à jeun. Le tour de taille se mesure au niveau du nombril : c’est le meilleur repère pour le gras du ventre.'),
      h('div', { class: 'grid2' }, h('label', { class: 'field' }, 'Tour de taille (cm)', waist), h('label', { class: 'field' }, 'Poids (kg), facultatif', weight)),
      h('button', { class: 'btn', onclick: () => {
        const wv = parseFloat(waist.value), kv = parseFloat(weight.value);
        if (!wv && !kv) { toast('Entre au moins une mesure'); return; }
        update(st => { st.measures = st.measures.filter(m => m.date !== dateKey()); st.measures.push({ date: dateKey(), waist: wv || null, weight: kv || null }); st.measures.sort((a, b) => a.date.localeCompare(b.date)); });
        toast('Mesure enregistrée'); draw();
      } }, 'Enregistrer'),
      wpts.length >= 2 ? [line(wpts, { color: 'var(--c-sport)' }), h('p', { class: 'muted small' }, `Tour de taille : ${first.waist} cm au début, ${last.waist} cm maintenant (${last.waist - first.waist > 0 ? '+' : ''}${(last.waist - first.waist).toFixed(1)} cm).`)] : null);
  }

  async function draw() {
    const k = dateKey();
    const vol = weeklyVolume(8);
    const withData = vol.filter(v => v.reps > 0);
    const gain = withData.length >= 2 ? Math.round((withData[withData.length - 1].reps / withData[0].reps - 1) * 100) : null;
    const days14 = Array.from({ length: 14 }, (_, i) => addDays(k, i - 13));
    const thisWeek = vol[vol.length - 1];
    const photos = await photosCard();
    fill(root,
      h('header', { class: 'top' }, h('div', {}, h('p', { class: 'date' }, 'Ton évolution'), h('h1', {}, 'Progrès'))),
      h('section', { class: 'card' }, h('h2', {}, 'Régularité sur 7 jours'),
        gauge(adherence(null, 7), 'sport', 'Global', `${pct(adherence(null, 7))} %`),
        THEME_ORDER.map(t => gauge(adherence(t, 7), t, THEMES[t].label)),
        h('p', { class: 'muted small' }, `Série en cours : ${streak()} jour${streak() > 1 ? 's' : ''} (un jour compte à partir de la moitié des cases).`)),
      h('section', { class: 'card' }, h('h2', {}, 'Muscle : amélioration'),
        gain === null ? h('p', { class: 'muted' }, 'Fais au moins deux semaines de séances pour voir ton pourcentage d’amélioration.') :
          h('div', { class: 'stack' }, h('div', { class: 'big num', style: { fontSize: '2.6rem', fontWeight: 760, letterSpacing: '-.04em' } }, `${gain > 0 ? '+' : ''}${gain} %`), h('p', { class: 'muted' }, 'de volume de répétitions par rapport à ta première semaine.')),
        h('p', { class: 'muted small' }, `Cette semaine : ${thisWeek.sessions} séance${thisWeek.sessions > 1 ? 's' : ''}. Objectif conseillé : 3 à 4.`),
        bars(vol.map(v => v.reps), { color: 'var(--c-sport)', labels: vol.map(v => fmtShort(v.start).split(' ')[0]) }),
        h('p', { class: 'muted small' }, 'Répétitions par semaine, 8 dernières semaines')),
      h('section', { class: 'card' }, h('h2', {}, 'Score des 14 derniers jours'),
        bars(days14.map(d => dayScore(d)), { max: 1, labels: days14.map(d => String(fromKey(d).getDate())) })),
      records().length ? h('section', { class: 'card' }, h('h2', {}, 'Records'), h('div', { class: 'list' }, records().map(r => h('div', { class: 'exo' }, h('span', {}, r.name), h('b', { class: 'num' }, r.type === 'time' ? `${r.reps} s` : `${r.reps} rép.`))))) : null,
      measuresCard(), photos);
  }
  draw();
  return root;
}

/* ================================================================ RÉGLAGES */
function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const pad2 = n => String(n).padStart(2, '0');
function icsFile(events) {
  const d = new Date();
  const day = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const stamp = `${day}T000000`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cap Forme//FR', 'CALSCALE:GREGORIAN'];
  events.forEach((e, i) => {
    const [hh, mm] = e.time.split(':');
    lines.push('BEGIN:VEVENT', `UID:capforme-${i}-${day}@local`, `DTSTAMP:${stamp}`, `DTSTART:${day}T${hh}${mm}00`, 'RRULE:FREQ=DAILY', 'SUMMARY:Rappel',
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Rappel', 'END:VALARM', 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function settingsView() {
  const root = h('div', { class: 'view' });
  function draw() {
    const st = getState();
    const morning = h('input', { type: 'time', value: st.settings.reminders.morning || '09:30', 'aria-label': 'Rappel du matin' });
    const evening = h('input', { type: 'time', value: st.settings.reminders.evening || '23:00', 'aria-label': 'Rappel du soir' });
    const file = h('input', { type: 'file', accept: 'application/json', hidden: true });
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || !data.profile) throw new Error('format');
        replaceState(data); applyTheme(); toast('Données importées'); draw();
      } catch (e) { toast('Fichier non reconnu'); }
    });
    root.replaceChildren(
      h('header', { class: 'top' }, h('div', {}, h('p', { class: 'date' }, 'Préférences'), h('h1', {}, 'Réglages'))),
      h('section', { class: 'card' }, h('h2', {}, 'Apparence'),
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Thème' }, [['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, l]) =>
          h('button', { 'aria-pressed': st.settings.theme === v ? 'true' : 'false', onclick: () => { update(s2 => { s2.settings.theme = v; }); applyTheme(); draw(); } }, l)))),
      h('section', { class: 'card' }, h('h2', {}, 'Rappels discrets'),
        h('p', { class: 'muted' }, 'Une appli web ne peut pas programmer de notifications fiables quand elle est fermée. Le plus sûr est d’ajouter deux rappels à ton calendrier. Ils s’appellent simplement « Rappel », sans aucun détail visible.'),
        h('div', { class: 'grid2' }, h('label', { class: 'field' }, 'Matin', morning), h('label', { class: 'field' }, 'Soir', evening)),
        h('button', { class: 'btn', onclick: () => {
          update(s2 => { s2.settings.reminders = { morning: morning.value, evening: evening.value }; });
          download('rappels.ics', 'text/calendar', icsFile([{ time: morning.value || '09:30' }, { time: evening.value || '23:00' }]));
        } }, 'Ajouter à mon calendrier')),
      h('section', { class: 'card' }, h('h2', {}, 'Ton profil'),
        h('button', { class: 'btn ghost', onclick: () => go('#/quiz') }, 'Refaire le quiz')),
      h('section', { class: 'card' }, h('h2', {}, 'Tes données'),
        h('p', { class: 'muted' }, 'Tout reste sur ce téléphone. Exporte une copie pour ne rien perdre si tu changes d’appareil (les photos ne sont pas incluses).'),
        h('div', { class: 'row-btns' },
          h('button', { class: 'btn ghost', onclick: () => download('cap-forme-sauvegarde.json', 'application/json', JSON.stringify(getState())) }, 'Exporter'),
          h('button', { class: 'btn ghost', onclick: () => file.click() }, 'Importer')), file,
        h('button', { class: 'btn danger', onclick: async () => { if (await confirmSheet('Tout effacer ?', 'Profil, historique et mesures seront supprimés de ce téléphone.', 'Effacer', true)) { resetAll(); applyTheme(); go('#/quiz'); } } }, 'Réinitialiser l’appli')),
      h('section', { class: 'card' }, h('h2', {}, 'Installer l’appli'),
        h('p', { class: 'muted' }, 'iPhone : bouton Partager puis « Sur l’écran d’accueil ». Android : menu du navigateur puis « Installer l’application ».')),
      h('section', { class: 'card flat' }, h('h3', {}, 'Sources et avertissement'),
        THEME_ORDER.map(t => h('details', {}, h('summary', {}, THEMES[t].label), h('div', { class: 'sources' }, SOURCES[t === 'sport' ? 'sport' : t].map(([a, b]) => h('p', {}, h('b', {}, a), ' — ', b))))),
        h('p', { class: 'muted small' }, DISCLAIMER)));
  }
  draw();
  return root;
}
