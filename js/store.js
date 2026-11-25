// Données stockées uniquement sur l'appareil (localStorage + IndexedDB pour les photos).
const KEY = 'capforme.v1';

const defaults = () => ({
  v: 1,
  profile: { done: false, answers: {}, startDate: null },
  settings: { theme: 'auto', bedtime: '23:30', reminders: {} },
  days: {},          // 'YYYY-MM-DD' -> { mode, checks:{id:true}, water:n, sleep:{bed,wake} }
  workouts: [],      // séances terminées
  prog: {},          // progression par slot : { level, bonus }
  rotation: 0,
  measures: [],      // { date, waist, weight }
  games: {},
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch (e) { /* données illisibles : on repart de zéro */ }
  return defaults();
}

let state = load();
export const getState = () => state;
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* stockage plein ou bloqué */ }
}
export function update(fn) { fn(state); save(); }
export function replaceState(next) { state = { ...defaults(), ...next }; save(); }
export function resetAll() { state = defaults(); save(); }

/* ---------- dates (heure locale) ---------- */
const pad = n => String(n).padStart(2, '0');
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dateKey(d); };
export const dayOrdinal = k => Math.floor(Date.UTC(...k.split('-').map((v, i) => i === 1 ? v - 1 : +v)) / 86400000);
export const daysBetween = (a, b) => dayOrdinal(b) - dayOrdinal(a);
export const mondayOf = k => { const d = fromKey(k); const wd = (d.getDay() + 6) % 7; return addDays(k, -wd); };

export function getDay(k) {
  const s = getState();
  if (!s.days[k]) s.days[k] = { mode: 'calme', checks: {}, water: 0 };
  return s.days[k];
}

/* ---------- photos (IndexedDB) ---------- */
const openDb = () => new Promise((res, rej) => {
  const r = indexedDB.open('capforme', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
export async function addPhoto(rec) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').put(rec);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
export async function listPhotos() {
  const db = await openDb();
  return new Promise((res, rej) => {
    const rq = db.transaction('photos').objectStore('photos').getAll();
    rq.onsuccess = () => res(rq.result.sort((a, b) => a.date.localeCompare(b.date)));
    rq.onerror = () => rej(rq.error);
  });
}
export async function deletePhoto(id) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
