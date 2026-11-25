// Petites briques d'interface sans dépendance.
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [p, val] of Object.entries(v)) { if (p.startsWith('--')) el.style.setProperty(p, val); else el.style[p] = val; }
    }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return el;
}
const NS = 'http://www.w3.org/2000/svg';
export function s(tag, props = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(props || {})) if (v != null && v !== false) el.setAttribute(k, v);
  kids.flat(Infinity).forEach(c => { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return el;
}

export const fill = (root, ...kids) => root.replaceChildren(...kids.flat(Infinity).filter(k => k != null && k !== false));
export const pct = v => Math.round(v * 100);
export const fmtDate = k => {
  const [y, m, d] = k.split('-').map(Number);
  const t = new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};
export const fmtShort = k => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};
export const mmss = t => `${Math.floor(t / 60)}:${String(Math.max(0, t) % 60).padStart(2, '0')}`;

/* ---------- anneaux concentriques : un anneau par thème ---------- */
export function rings(items, size = 240) {
  const c = size / 2, stroke = 11, gap = 5;
  const svg = s('svg', { viewBox: `0 0 ${size} ${size}`, class: 'rings', role: 'img', 'aria-label': 'Progression du jour par thème' });
  items.forEach((it, i) => {
    const r = c - stroke / 2 - 4 - i * (stroke + gap);
    const len = 2 * Math.PI * r;
    svg.append(s('circle', { cx: c, cy: c, r, fill: 'none', stroke: 'var(--track)', 'stroke-width': stroke }));
    const arc = s('circle', {
      cx: c, cy: c, r, fill: 'none', stroke: `var(--c-${it.theme})`, 'stroke-width': stroke, 'stroke-linecap': 'round',
      'stroke-dasharray': len, 'stroke-dashoffset': len, transform: `rotate(-90 ${c} ${c})`, class: 'ring-arc',
    });
    svg.append(arc);
    requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.strokeDashoffset = len * (1 - Math.max(0.001, it.value)); }));
  });
  return svg;
}

export function gauge(value, theme, label, right) {
  const fill = h('div', { class: 'gauge-fill', style: { width: '0%', background: `var(--c-${theme})` } });
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${pct(value)}%`; }));
  return h('div', { class: 'gauge' },
    h('div', { class: 'gauge-top' }, h('span', { class: 'gauge-label' }, label), h('span', { class: 'gauge-val' }, right ?? `${pct(value)} %`)),
    h('div', { class: 'gauge-track' }, fill));
}

/* ---------- mini graphique en barres ---------- */
export function bars(data, { max, color = 'var(--accent)', height = 96, labels = [] } = {}) {
  const m = max ?? Math.max(1, ...data);
  const w = 300, gap = 6, bw = (w - gap * (data.length - 1)) / data.length;
  const svg = s('svg', { viewBox: `0 0 ${w} ${height + 18}`, class: 'bars', role: 'img' });
  data.forEach((v, i) => {
    const bh = Math.max(2, (v / m) * height);
    svg.append(s('rect', { x: i * (bw + gap), y: height - bh, width: bw, height: bh, rx: 4, fill: v ? color : 'var(--track)' }));
    if (labels[i]) svg.append(s('text', { x: i * (bw + gap) + bw / 2, y: height + 13, 'text-anchor': 'middle', class: 'chart-label' }, labels[i]));
  });
  return svg;
}

export function line(points, { height = 90, color = 'var(--accent)' } = {}) {
  const w = 300, pad = 8;
  const svg = s('svg', { viewBox: `0 0 ${w} ${height}`, class: 'bars', role: 'img' });
  if (points.length < 2) return svg;
  const ys = points.map(p => p.y), lo = Math.min(...ys), hi = Math.max(...ys), span = hi - lo || 1;
  const xy = points.map((p, i) => [pad + (i / (points.length - 1)) * (w - 2 * pad), pad + (1 - (p.y - lo) / span) * (height - 2 * pad)]);
  svg.append(s('polyline', { points: xy.map(p => p.join(',')).join(' '), fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  xy.forEach(p => svg.append(s('circle', { cx: p[0], cy: p[1], r: 3.5, fill: color })));
  return svg;
}

/* ---------- retours : toast, vibration, bip ---------- */
export function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add('out'), 2200);
  setTimeout(() => t.remove(), 2600);
}
export const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* non supporté */ } };
let actx;
export function beep(freq = 880, ms = 140) {
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = freq; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + ms / 1000);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + ms / 1000 + 0.05);
  } catch (e) { /* audio indisponible */ }
}

/* ---------- boîte de confirmation ---------- */
export function confirmSheet(title, body, okLabel = 'Confirmer', danger = false) {
  return new Promise(resolve => {
    const done = v => { sheet.remove(); resolve(v); };
    const sheet = h('div', { class: 'sheet-back', onclick: e => { if (e.target === sheet) done(false); } },
      h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
        h('h3', {}, title), body ? h('p', { class: 'muted' }, body) : null,
        h('div', { class: 'row-btns' },
          h('button', { class: 'btn ghost', onclick: () => done(false) }, 'Annuler'),
          h('button', { class: `btn ${danger ? 'danger' : ''}`, onclick: () => done(true) }, okLabel))));
    document.body.append(sheet);
    sheet.querySelector('.btn:last-child').focus();
  });
}

/* ---------- minuteur générique ---------- */
export function makeTimer(secs, { onTick, onDone, autostart = true } = {}) {
  let left = secs, iv = null, endAt = 0;
  const tick = () => {
    left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    onTick && onTick(left);
    if (left <= 0) { stop(); onDone && onDone(); }
  };
  const start = () => { stop(); endAt = Date.now() + left * 1000; iv = setInterval(tick, 250); onTick && onTick(left); };
  const stop = () => { if (iv) clearInterval(iv); iv = null; };
  const add = n => { left += n; endAt += n * 1000; onTick && onTick(left); };
  if (autostart) start();
  return { start, stop, add, left: () => left, running: () => !!iv };
}
