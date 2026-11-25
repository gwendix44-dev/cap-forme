import { h, s } from './ui.js';
import { getState } from './store.js';
import { homeView, sportView, playerView, quizView } from './views-core.js';
import { themesView, themeView, progressView, settingsView, applyTheme } from './views-themes.js';

applyTheme();

const TABS = [
  ['home', 'Aujourd’hui', [['path', { d: 'M3.5 11.5 12 4l8.5 7.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z' }]]],
  ['sport', 'Sport', [['path', { d: 'M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11' }]]],
  ['themes', 'Thèmes', [['path', { d: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z' }]]],
  ['progress', 'Progrès', [['path', { d: 'M4 20V11M10 20V4M16 20v-7M21 20H3' }]]],
  ['settings', 'Réglages', [['path', { d: 'M4 7h9M17 7h3M4 17h3M11 17h9' }], ['circle', { cx: 15, cy: 7, r: 2 }], ['circle', { cx: 9, cy: 17, r: 2 }]]],
];

const app = document.getElementById('app');
const tabbar = document.getElementById('tabbar');
tabbar.append(h('nav', { 'aria-label': 'Navigation principale' }, TABS.map(([id, label, shapes]) =>
  h('a', { class: 'tab', href: `#/${id}`, 'data-id': id }, s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, shapes.map(([t, a]) => s(t, a))), label))));

let current = null;

function render() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name = 'home', ...rest] = raw.split('/');
  if (!getState().profile.done && name !== 'quiz') { location.replace('#/quiz'); return; }
  current && current._destroy && current._destroy();

  let el, full = false, tab = name;
  switch (name) {
    case 'quiz': el = quizView(); full = true; break;
    case 'session': el = playerView(rest[0] || 'A', rest[1] || 'standard'); full = true; break;
    case 'sport': el = sportView(); break;
    case 'themes': el = themesView(); break;
    case 'theme': el = themeView(rest[0]); tab = 'themes'; break;
    case 'progress': el = progressView(); break;
    case 'settings': el = settingsView(); break;
    default: el = homeView(); tab = 'home';
  }
  current = el;
  document.body.classList.toggle('full', full);
  app.replaceChildren(el);
  tabbar.querySelectorAll('.tab').forEach(a => {
    if (a.dataset.id === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (!full) window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* hors ligne indisponible */ }); });
}
