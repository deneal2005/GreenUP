/* ============================================================
   GreenUp · app.js
   one file, no build step, no framework. just the goods.
   ============================================================ */
(function () {
'use strict';

/* ------------------------------------------------------------
   0 · CONFIG
------------------------------------------------------------ */
const SUPABASE_URL = 'https://yosewbyorrtwjycbhhwq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UKVDIh533AZBaFWUhnwlzA_rHW54MNt'; // publishable — safe in the browser
const MAPS_KEY     = 'AIzaSyCQL1NAeKvDWK7GBnIelDxxK66vW-9tozU';

const LEVELS = [
  { n: 'Seed',            e: '🌱', min: 0,   flavor: 'Everyone starts in the dirt.' },
  { n: 'Sprout',          e: '🌿', min: 50,  flavor: 'You broke through the soil. No going back now.' },
  { n: 'Tree',            e: '🌳', min: 150, flavor: 'Birds are starting to take notice.' },
  { n: 'Forest Guardian', e: '🌲', min: 400, flavor: 'The grove answers to you now.' },
];
const BADGES = [
  { id: 'seed',   e: '🌱', n: 'Seed Starter',  t: 'Plant your first tree',      test: s => s.trees >= 1 },
  { id: 'champ',  e: '🧹', n: 'Clean Champ',   t: 'First clean-up logged',      test: s => s.cleans >= 1 },
  { id: 'guard',  e: '🌳', n: 'Tree Guardian', t: '10 trees planted',           test: s => s.trees >= 10 },
  { id: 'trash',  e: '🗑️', n: 'Trash Buster',  t: '5 clean-ups logged',         test: s => s.cleans >= 5 },
  { id: 'legend', e: '🏆', n: 'Eco Legend',    t: '5 trees + 5 clean-ups',      test: s => s.trees >= 5 && s.cleans >= 5 },
  { id: 'brain',  e: '🧠', n: 'Quiz Whiz',     t: 'Ace 3 daily quizzes',        test: s => s.quizWins >= 3 },
  { id: 'flame',  e: '🔥', n: 'Week Streak',   t: '7 days in a row',            test: s => s.streak >= 7 },
  { id: 'heart',  e: '💛', n: 'Patron Sapling',t: 'Fund the forest once',       test: s => s.donatedCount >= 1 },
];
const QUIZ = [
  { q: 'How much CO₂ does one mature tree absorb per year?', o: ['~2 kg', '~21 kg', '~210 kg', 'None'], a: 1 },
  { q: 'Which waste takes the longest to decompose?', o: ['Paper', 'Banana peel', 'Glass', 'Cotton'], a: 2 },
  { q: 'Best time of day to plant a sapling?', o: ['Noon heat', 'Early morning / evening', 'Midnight', "Doesn't matter"], a: 1 },
  { q: 'What does GreenUp pin to every action as proof?', o: ['Filters used', 'Photo + GPS + timestamp', 'Number of likes', 'File name'], a: 1 },
  { q: 'Roughly what share of beach litter worldwide is plastic?', o: ['10%', '30%', '80%', '99%'], a: 2 },
  { q: 'Composting food scraps mainly cuts emissions of…', o: ['Oxygen', 'Methane', 'Helium', 'Ozone'], a: 1 },
  { q: 'Where does a greasy pizza box actually belong?', o: ['Paper recycling', 'Compost / wet waste', 'Glass bin', 'The lake'], a: 1 },
  { q: 'How much of Earth’s land is covered by forest?', o: ['~7%', '~31%', '~62%', '~89%'], a: 1 },
  { q: 'Best way to water a freshly planted sapling?', o: ['A splash every hour', 'Deep soak, less often', 'Only when it rains', 'Soda works too'], a: 1 },
  { q: 'A clean-up photo pair is strongest when…', o: ['Shot from the same angle', 'Heavily filtered', 'Zoomed on one bottle', 'Taken days apart'], a: 0 },
];
const SPECIES_GROUPS = [
  { g: 'South Asia', items: ['Neem (Azadirachta indica)', 'Banyan (Ficus benghalensis)', 'Peepal (Ficus religiosa)', 'Mango (Mangifera indica)', 'Jamun / Java plum', 'Arjuna (Terminalia arjuna)', 'Amla / Indian gooseberry', 'Gulmohar (Delonix regia)', 'Jacaranda', 'Rain tree (Samanea saman)', 'Teak (Tectona grandis)', 'Sal (Shorea robusta)', 'Indian sandalwood', 'Ashoka (Saraca asoca)', 'Kadamba (Neolamarckia)', 'Palash / Flame of the forest', 'Indian coral tree', 'Moringa / Drumstick', 'Tamarind', 'Bael (Aegle marmelos)', 'Ber / Indian jujube', 'Custard apple', 'Guava', 'Pomegranate', 'Coconut palm', 'Karanja (Pongamia)', 'Mahua (Madhuca)', 'Champak (Magnolia champaca)'] },
  { g: 'Africa & Middle East', items: ['African baobab (Adansonia)', 'Umbrella thorn acacia', 'Marula', 'Mopane', 'Sausage tree (Kigelia)', 'Fever tree (Vachellia)', 'Argan', 'Date palm', 'Doum palm', 'African mahogany (Khaya)', 'Shea tree', 'Sycamore fig', 'Cedar of Lebanon', 'Frankincense (Boswellia)'] },
  { g: 'East & Southeast Asia', items: ['Cherry blossom (Yoshino)', 'Japanese maple', 'Ginkgo', 'Camphor tree', 'Dawn redwood', 'Giant clumping bamboo', 'Red mangrove (Rhizophora)', 'Rubber tree (Hevea)', 'Jackfruit', 'Durian', 'Rambutan', 'Longan', 'Lychee', 'Breadfruit', 'Narra (Pterocarpus)'] },
  { g: 'Europe', items: ['English oak (Quercus robur)', 'Silver birch', 'European beech', 'Norway maple', 'Horse chestnut', 'Small-leaved lime / Linden', 'Rowan / Mountain ash', 'Scots pine', 'Norway spruce', 'Olive', 'Cork oak', 'Stone pine', 'Italian cypress', 'Sweet chestnut', 'Hazel', 'Hawthorn', 'Yew'] },
  { g: 'The Americas', items: ['Sugar maple', 'Red maple', 'White oak', 'Bur oak', 'American sycamore', 'Tulip tree', 'Sweetgum', 'Eastern redbud', 'Flowering dogwood', 'Bald cypress', 'Coast redwood', 'Giant sequoia', 'Douglas fir', 'Ponderosa pine', 'Pecan', 'Black walnut', 'Avocado', 'Cacao', 'Brazil nut', 'Kapok (Ceiba)', 'Bigleaf mahogany', 'Silk floss tree', 'Monkey puzzle'] },
  { g: 'Oceania', items: ['River red gum (Eucalyptus)', 'Golden wattle', 'Moreton Bay fig', 'Bottlebrush (Callistemon)', 'Pōhutukawa', 'Kauri', 'Norfolk Island pine', 'Illawarra flame tree'] },
  { g: 'Fruit & food forest', items: ['Apple', 'Pear', 'Plum', 'Sweet cherry', 'Apricot', 'Fig', 'Mulberry', 'Walnut', 'Almond', 'Orange / Citrus', 'Lemon', 'Papaya'] },
];
const CURRENCIES = { INR: 1, USD: .0117, EUR: .0108, GBP: .0091, JPY: 1.74, CNY: .083, AUD: .0178, CAD: .016, SGD: .0152, AED: .0429, SAR: .0438, NGN: 18, KES: 1.51, ZAR: .211, BRL: .064, MXN: .213, IDR: 190, PHP: .66, THB: .4, MYR: .052, VND: 296, BDT: 1.37, LKR: 3.5, NPR: 1.87, PKR: 3.26, KRW: 16, TRY: .45, EGP: .57, NZD: .0193, CHF: .0103 };
const ZERO_DEC = ['JPY', 'KRW', 'IDR', 'VND'];
const COUNTRY_CUR = { IN: 'INR', US: 'USD', GB: 'GBP', JP: 'JPY', CN: 'CNY', AU: 'AUD', CA: 'CAD', SG: 'SGD', AE: 'AED', SA: 'SAR', NG: 'NGN', KE: 'KES', ZA: 'ZAR', BR: 'BRL', MX: 'MXN', ID: 'IDR', PH: 'PHP', TH: 'THB', MY: 'MYR', VN: 'VND', BD: 'BDT', LK: 'LKR', NP: 'NPR', PK: 'PKR', KR: 'KRW', TR: 'TRY', EG: 'EGP', NZ: 'NZD', CH: 'CHF', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', PT: 'EUR', IE: 'EUR', AT: 'EUR', BE: 'EUR', GR: 'EUR', FI: 'EUR' };

const DAY = 86400000;
const now = Date.now();
const DEMO_WORLD = [
  { id: 'd1',  kind: 'tree',    title: 'Neem · behind the science block', species: 'Neem (Azadirachta indica)', who: 'aanya', college: 'Green Valley College', place: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, ts: now - 2 * DAY,  pts: 10, demo: 1 },
  { id: 'd2',  kind: 'tree',    title: 'Gulmohar by the cycle stand', species: 'Gulmohar (Delonix regia)', who: 'meera_k', college: 'Eco Club', place: 'Bengaluru, India', lat: 12.935, lng: 77.61, ts: now - 4 * DAY,  pts: 10, demo: 1, team_id: 't1', team: 'Eco Club' },
  { id: 'd3',  kind: 'cleanup', title: 'Canteen lawn · 12 kg plastic', kg: 12, who: 'hostel_b', college: 'Hostel B Squad', place: 'Mumbai, India', lat: 19.076, lng: 72.877, ts: now - 6 * DAY,  pts: 14, demo: 1, team_id: 't2', team: 'Hostel B Squad' },
  { id: 'd4',  kind: 'tree',    title: 'Umbrella thorn on the ridge', species: 'Umbrella thorn acacia', who: 'amara_n', college: 'Green Belt Society', place: 'Nairobi, Kenya', lat: -1.286, lng: 36.817, ts: now - 3 * DAY,  pts: 10, demo: 1, team_id: 't3', team: 'Green Belt Society' },
  { id: 'd5',  kind: 'cleanup', title: 'Praia do Leme · 18 kg mixed', kg: 18, who: 'joao_rj', college: 'UFRJ', place: 'Rio de Janeiro, Brazil', lat: -22.964, lng: -43.17, ts: now - 8 * DAY,  pts: 17, demo: 1 },
  { id: 'd6',  kind: 'tree',    title: 'Red mangrove · tidal flat', species: 'Red mangrove (Rhizophora)', who: 'sari', college: 'UI Jakarta', place: 'Jakarta, Indonesia', lat: -6.2, lng: 106.816, ts: now - 5 * DAY,  pts: 10, demo: 1 },
  { id: 'd7',  kind: 'tree',    title: 'Linden on Karl-Marx-Allee', species: 'Small-leaved lime / Linden', who: 'jonas', college: 'TU Berlin', place: 'Berlin, Germany', lat: 52.52, lng: 13.405, ts: now - 9 * DAY,  pts: 10, demo: 1 },
  { id: 'd8',  kind: 'tree',    title: 'Douglas fir · community park', species: 'Douglas fir', who: 'liam_pdx', college: 'Portland CC', place: 'Portland, USA', lat: 45.515, lng: -122.678, ts: now - 11 * DAY, pts: 10, demo: 1 },
  { id: 'd9',  kind: 'cleanup', title: 'Manila Bay sweep · 25 kg', kg: 25, who: 'tala', college: 'UP Diliman', place: 'Manila, Philippines', lat: 14.599, lng: 120.984, ts: now - 7 * DAY,  pts: 18, demo: 1 },
  { id: 'd10', kind: 'tree',    title: 'Baobab for the schoolyard', species: 'African baobab (Adansonia)', who: 'kwame', college: 'Accra Green Corps', place: 'Accra, Ghana', lat: 5.603, lng: -0.187, ts: now - 13 * DAY, pts: 10, demo: 1 },
  { id: 'd11', kind: 'tree',    title: 'Momiji by the canal', species: 'Japanese maple', who: 'haruki', college: 'Kyoto U', place: 'Kyoto, Japan', lat: 35.011, lng: 135.768, ts: now - 10 * DAY, pts: 10, demo: 1 },
  { id: 'd12', kind: 'tree',    title: 'Pōhutukawa on the bays', species: 'Pōhutukawa', who: 'mia_nz', college: 'Vic Wellington', place: 'Wellington, NZ', lat: -41.286, lng: 174.776, ts: now - 12 * DAY, pts: 10, demo: 1 },
  { id: 'd13', kind: 'cleanup', title: 'Chapultepec litter run · 9 kg', kg: 9, who: 'diego', college: 'UNAM', place: 'Mexico City, Mexico', lat: 19.42, lng: -99.18, ts: now - 4 * DAY,  pts: 12, demo: 1 },
  { id: 'd14', kind: 'tree',    title: 'English oak · common green', species: 'English oak (Quercus robur)', who: 'amelia', college: 'UCL', place: 'London, UK', lat: 51.507, lng: -0.128, ts: now - 15 * DAY, pts: 10, demo: 1 },
  { id: 'd15', kind: 'tree',    title: 'Date palm · school gate', species: 'Date palm', who: 'omar', college: 'Cairo U', place: 'Cairo, Egypt', lat: 30.044, lng: 31.236, ts: now - 14 * DAY, pts: 10, demo: 1 },
  { id: 'd16', kind: 'cleanup', title: 'Juhu beach dawn patrol · 31 kg', kg: 31, who: 'priya', college: 'NSS Wing', place: 'Mumbai, India', lat: 19.099, lng: 72.826, ts: now - 2 * DAY,  pts: 18, demo: 1, team_id: 't4', team: 'NSS Wing' },
];
const DEMO_RIVALS = [
  { n: 'meera_k', c: 'Eco Club', p: 148 }, { n: 'liam_pdx', c: 'Portland CC', p: 142 }, { n: 'amara_n', c: 'Green Belt Society', p: 133 },
  { n: 'rahul_s', c: 'CS Dept', p: 121 }, { n: 'devika', c: 'Hostel B Squad', p: 96 }, { n: 'joao_rj', c: 'UFRJ', p: 88 },
  { n: 'arjun_m', c: 'NSS Wing', p: 77 }, { n: 'sana_f', c: 'Bio Dept', p: 58 },
];
const DEMO_TEAMS_FULL = [
  { id: 't1', name: 'Eco Club', org: 'Green Valley College', description: 'The OG grove gang. We plant on Fridays, argue about compost on Mondays.', logo: '', basePts: 412, owner: 'meera_k', members: [{ u: 'meera_k' }, { u: 'sana_f' }, { u: 'rahul_s' }] },
  { id: 't2', name: 'Hostel B Squad', org: 'Green Valley College', description: 'We clean what others walk past. Lake bank regulars.', logo: '', basePts: 355, owner: 'devika', members: [{ u: 'devika' }, { u: 'hostel_b' }] },
  { id: 't3', name: 'Green Belt Society', org: 'Nairobi chapter', description: 'Acacias on the ridge, one weekend at a time.', logo: '', basePts: 289, owner: 'amara_n', members: [{ u: 'amara_n' }, { u: 'kwame' }] },
  { id: 't4', name: 'NSS Wing', org: 'Green Valley College', description: 'Dawn patrols on Juhu. Bring gloves, leave footprints only.', logo: '', basePts: 240, owner: 'priya', members: [{ u: 'priya' }, { u: 'arjun_m' }] },
];
const TEAM_ACH = [
  { e: '🌱', n: 'First Roots', t: "Plant the team's first tree", test: s => s.trees >= 1 },
  { e: '🧹', n: 'Opening Sweep', t: 'First team clean-up', test: s => s.cleans >= 1 },
  { e: '🌳', n: 'Tiny Forest', t: '25 team trees', test: s => s.trees >= 25 },
  { e: '⚖️', n: 'Heavy Lifters', t: '100 kg cleared together', test: s => s.kg >= 100 },
  { e: '🤝', n: 'Full Squad', t: '10 members strong', test: s => s.members >= 10 },
  { e: '🏆', n: 'Sapling Contender', t: '1,000 team points', test: s => s.pts >= 1000 },
];
const DEMO_DONORS = [
  { name: 'Ananya', amount: 100, cur: 'INR', ts: now - 2 * DAY }, { name: 'Verma & Sons', amount: 500, cur: 'INR', ts: now - 5 * DAY },
  { name: 'Hannah', amount: 5, cur: 'USD', ts: now - 1 * DAY }, { name: 'GreenLeaf Café', amount: 500, cur: 'INR', ts: now - 12 * DAY },
  { name: 'Kenji', amount: 1000, cur: 'JPY', ts: now - 20 * DAY }, { name: "Batch of '24", amount: 1000, cur: 'INR', ts: now - 45 * DAY },
  { name: 'Anonymous', amount: 10, cur: 'EUR', ts: now - 3 * DAY }, { name: 'Kiran', amount: 50, cur: 'INR', ts: now - 26 * DAY },
  { name: 'Hannah', amount: 5, cur: 'USD', ts: now - 9 * DAY }, { name: 'Verma & Sons', amount: 250, cur: 'INR', ts: now - 60 * DAY },
];
const GREET_SUBS = [
  "Here's what your hands have grown so far.",
  'The soil missed you.',
  'Two hands, one planet. Nice ratio.',
  'Somewhere out there, a sapling is gossiping about you.',
  'Mud under fingernails: optional. Recommended.',
];

/* ------------------------------------------------------------
   1 · TINY UTILS
------------------------------------------------------------ */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtInt = n => (+n || 0).toLocaleString();
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - DAY).toISOString().slice(0, 10);

function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

function srand(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function hashNum(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 90e3) return 'just now';
  const m = Math.floor(d / 60e3); if (m < 60) return m + ' min ago';
  const h = Math.floor(m / 60); if (h < 24) return h + ' h ago';
  const days = Math.floor(h / 24); if (days < 7) return days === 1 ? 'yesterday' : days + ' days ago';
  const w = Math.floor(days / 7); if (w < 5) return w + ' wk ago';
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function phImg(emoji, c1, c2, label) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="640" height="420" fill="url(#g)"/><text x="50%" y="50%" font-size="150" text-anchor="middle" dominant-baseline="middle">' + emoji + '</text>' + (label ? '<text x="50%" y="90%" font-size="24" text-anchor="middle" fill="rgba(255,255,255,.9)" font-family="monospace" letter-spacing="6">' + label + '</text>' : '') + '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const PH_BEFORE  = phImg('🗑️', '#a8afa6', '#5f665e', 'BEFORE');
const PH_AFTER   = phImg('🌿', '#a9d77f', '#2f7d45', 'AFTER');
const PH_TBEFORE = phImg('🍂', '#c9b08c', '#7d6647', 'BEFORE');
const PH_TAFTER  = phImg('🌱', '#a9d77f', '#2f7d45', 'AFTER');
const TREE_PALS = [['#9CCB7B', '#3F7D3F'], ['#B5D98A', '#2F7D45'], ['#7FBF6E', '#1E5530'], ['#A8D27F', '#4C8A3A']];
function imgOf(a)    { if (a.after) return a.after; if (a.img) return a.img; const p = TREE_PALS[hashNum(a.id) % TREE_PALS.length]; return phImg(hashNum(a.id) % 2 ? '🌳' : '🌱', p[0], p[1]); }
function beforeOf(a) { return a.before || (a.kind === 'tree' ? PH_TBEFORE : PH_BEFORE); }
function afterOf(a)  { return a.after || a.img || (a.kind === 'tree' ? PH_TAFTER : PH_AFTER); }
function hasPair(a)  { return !!(a.before && a.after); }

function avatarHtml(name, url, extra) {
  if (url) return '<img class="av ' + (extra || '') + '" src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\'">';
  const h = hashNum(name || '?') % 360;
  return '<span class="av ' + (extra || '') + '" style="background:hsl(' + h + ',42%,80%);color:hsl(' + h + ',45%,24%)">' + esc((name || '?')[0].toUpperCase()) + '</span>';
}

function compressImage(file, max, q) {
  max = max || 1280; q = q || 0.78;
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k));
      c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error('compress failed')), 'image/jpeg', q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('not an image')); };
    img.src = url;
  });
}
const blobToDataURL = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });

/* ------------------------------------------------------------
   2 · TOAST / MODAL / CONFETTI
------------------------------------------------------------ */
function toast(msg, emoji) {
  const stack = $('#toastStack');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = (emoji ? emoji + ' ' : '') + msg;
  stack.appendChild(t);
  while (stack.children.length > 3) stack.firstChild.remove();
  setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 320); }, 3400);
}
function openModal(html, wide) {
  const card = $('#modalCard');
  card.className = 'card modal' + (wide ? ' wide' : '');
  card.innerHTML = html;
  $('#modalBack').classList.add('show');
}
function closeModal() { $('#modalBack').classList.remove('show'); }
function confetti(color) {
  if (prefersReduced) return;
  const shapes = ['🍃', '🌿', '✦', '❀', '✧'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('div');
    s.className = 'leaf-fall';
    s.textContent = shapes[i % shapes.length];
    s.style.cssText = 'left:' + Math.random() * 100 + 'vw;font-size:' + (14 + Math.random() * 16) + 'px;color:' + color + ';animation-duration:' + (2 + Math.random() * 2.4) + 's;animation-delay:' + Math.random() * .6 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 5200);
  }
}

/* ------------------------------------------------------------
   3 · STATE
------------------------------------------------------------ */
let db = null, user = null, guest = false, currentUid = null;
let worldActions = [], donations = [], mapFilter = 'all', lbKind = 'solo';
let pickedInr = 50, pickedMonthly = false, CUR = 'INR', curAuto = '';
let busy = false;

function demoState() {
  return {
    pts: 34, trees: 2, cleans: 1, waste: 3, streak: 3, lastActionOn: yesterdayStr(),
    quizWins: 0, quizDoneDay: 0, donatedCount: 0, mode: 'tree',
    actions: [
      { kind: 'tree', label: 'Neem · behind the science block', ts: now - 1 * DAY, pts: 10, img: '' },
      { kind: 'cleanup', label: '3 kg plastic · canteen lawn', ts: now - 3 * DAY, pts: 11, img: '' },
      { kind: 'tree', label: 'Mango · hostel garden', ts: now - 6 * DAY, pts: 10, img: '' },
    ],
    donationsLocal: [],
    myTeamIds: [], localTeams: [], defaultTeamId: '',
    profile: { username: 'aanya', full_name: 'Aanya Rao', college: 'Green Valley College', country: 'India', bio: 'Plant nerd. Will trade compost tips for chai.', avatar_url: '', email: 'demo@greenup.app', created_at: new Date(now - 40 * DAY).toISOString() },
  };
}
let S = demoState();

function persist() {
  if (guest) {
    const copy = JSON.parse(JSON.stringify(S));
    try { localStorage.setItem('greenup-demo', JSON.stringify(copy)); }
    catch (e) { // images blew the quota — drop them, keep the numbers
      copy.actions.forEach(a => { a.img = ''; });
      if (copy.profile) copy.profile.avatar_url = '';
      (copy.localTeams || []).forEach(t => { t.logo = ''; });
      lsSet('greenup-demo', copy);
    }
  } else if (user) {
    persistProfile();
    lsSet('gu-quiz-' + user.id, { quizDoneDay: S.quizDoneDay });
  }
}
async function persistProfile() {
  if (!db || !user) return;
  try {
    const { error } = await db.from('profiles').update({
      points: S.pts, trees: S.trees, cleanups: S.cleans, waste_kg: S.waste,
      streak: S.streak, last_action_on: S.lastActionOn || null, quiz_wins: S.quizWins,
    }).eq('id', user.id);
    if (error) throw error;
  } catch (e) { sbFail(e); }
}

/* ------------------------------------------------------------
   4 · SUPABASE
------------------------------------------------------------ */
function sbInit() {
  if (!window.supabase) return;
  try { db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { db = null; }
}
function sbFail(e) {
  const m = ((e && e.message) || '') + ' ' + ((e && e.code) || '');
  if (/PGRST205|PGRST204|PGRST202|42P01|schema cache|does not exist|Bucket not found/i.test(m)) $('#setupBanner').classList.add('show');
}
async function apiGetProfile(uid) {
  try {
    const { data, error } = await db.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) { sbFail(e); return null; }
}
async function apiCreateProfile(uid) {
  const meta = (user && user.user_metadata) || {};
  let base = (meta.username || (user.email || 'gardener').split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  if (base.length < 3) base = 'gardener';
  for (let i = 0; i < 4; i++) {
    const candidate = i === 0 ? base : base + Math.floor(Math.random() * 9000 + 1000);
    try {
      const { data, error } = await db.from('profiles').insert({
        id: uid, username: candidate,
        full_name: meta.full_name || meta.name || '', college: meta.college || '',
        avatar_url: meta.avatar_url || meta.picture || '',
      }).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      if (e && e.code === '23505') continue; // username collision, retry
      sbFail(e); return null;
    }
  }
  return null;
}
async function apiMyActions() {
  try {
    const { data, error } = await db.from('actions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return (data || []).map(r => ({ kind: r.kind, label: r.title, ts: +new Date(r.created_at), pts: r.points, img: r.photo_url || r.after_url || '' }));
  } catch (e) { sbFail(e); return []; }
}
async function apiUpload(bucket, path, blob) {
  const { error } = await db.storage.from(bucket).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
async function apiDonatedCount() {
  if (!db || !user) return;
  try {
    const { count, error } = await db.from('donations').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
    if (error) throw error;
    S.donatedCount = count || 0;
    renderBadges();
  } catch (e) { sbFail(e); }
}
function rowToAction(r) {
  const prof = r.profiles || {};
  return {
    id: r.id, kind: r.kind, title: r.title || (r.kind === 'tree' ? 'A new tree' : 'A clean-up'),
    species: r.species, kg: r.weight_kg ? +r.weight_kg : 0,
    who: prof.username || 'a gardener', college: prof.college || '', avatar_url: prof.avatar_url || '',
    place: r.place || '', lat: r.lat, lng: r.lng, ts: +new Date(r.created_at),
    img: r.photo_url || '', before: r.before_url || '', after: r.after_url || '', pts: r.points || 0,
    team_id: r.team_id || null, team: (r.teams && r.teams.name) || '',
  };
}
async function loadWorld() {
  let rows = null;
  if (db) {
    try {
      const { data, error } = await db.from('actions').select('*, profiles(username, college, avatar_url), teams(name)').order('created_at', { ascending: false }).limit(150);
      if (error) throw error;
      rows = data;
    } catch (e) { sbFail(e); }
  }
  worldActions = rows && rows.length ? rows.map(rowToAction) : [...DEMO_WORLD];
  renderWorld();
}
function subscribeWorld() {
  if (!db) return;
  try {
    db.channel('gu-world').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions' }, payload => {
      const r = payload.new || {};
      if (user && r.user_id === user.id) return;
      worldActions.unshift(rowToAction(r));
      renderWorld();
      toast('Someone just logged a ' + (r.kind === 'tree' ? 'tree 🌍' : 'clean-up 🌍'));
    }).subscribe();
  } catch (e) { /* realtime is a bonus, not a dependency */ }
}
async function loadDonations() {
  if (db && user && !guest) {
    try {
      const { data, error } = await db.from('donations').select('donor_name, amount, currency, created_at, user_id').order('created_at', { ascending: false }).limit(400);
      if (error) throw error;
      if (data && data.length) {
        donations = data.map(d => ({ name: d.donor_name || 'Anonymous', amount: +d.amount, cur: d.currency || 'INR', ts: +new Date(d.created_at), uid: d.user_id || '' }));
        renderDonate();
        return;
      }
    } catch (e) { sbFail(e); }
  }
  donations = [...(S.donationsLocal || []), ...DEMO_DONORS];
  renderDonate();
}

/* ------------------------------------------------------------
   5 · THEME / VIEWS / ROUTING
------------------------------------------------------------ */
function applyTheme(t) {
  if (t === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
  lsSet('gu-theme', t);
  $$('[data-theme-toggle]').forEach(b => b.textContent = t === 'dark' ? '☀️' : '🌙');
  if (worldMap && window.google) worldMap.setOptions({ styles: mapStyles() });
  if (osmTiles) osmTiles.setUrl(osmTileUrl());
  renderForest();
}
const isDark = () => document.documentElement.dataset.theme === 'dark';

const SCREENS = ['dash', 'log', 'map', 'board', 'team', 'donate', 'learn', 'profile'];
let suppressHash = false;
function showView(n) {
  $('#landing').style.display = n === 'landing' ? 'flex' : 'none';
  $('#authView').style.display = n === 'auth' ? 'block' : 'none';
  $('#app').style.display = n === 'app' ? 'block' : 'none';
  window.scrollTo(0, 0);
  if (n === 'app') {
    const m = location.hash.match(/^#\/(\w+)/);
    go(m ? m[1] : 'dash', false);
  }
}
function go(id, setHash) {
  if (setHash === undefined) setHash = true;
  if (!SCREENS.includes(id)) id = 'dash';
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#screen-' + id).classList.add('active');
  $$('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  closeSide();
  if (setHash && location.hash !== '#/' + id) { suppressHash = true; location.hash = '#/' + id; }
  window.scrollTo({ top: 0 });
  if (id === 'map') ensureWorldMap();
  if (id === 'log') { loadMaps().catch(() => {}); updPv(); }
  if (id === 'board') renderBoard(lbKind);
  if (id === 'team') renderTeamsScreen();
  if (id === 'profile') renderProfile();
}
function closeSide() { $('#side').classList.remove('open'); $('#scrim').classList.remove('show'); }

/* ------------------------------------------------------------
   6 · RENDER — DASHBOARD & SHARED
------------------------------------------------------------ */
function levelOf(p) { let l = LEVELS[0]; for (const L of LEVELS) if (p >= L.min) l = L; return l; }
function nextLevel(p) { return LEVELS.find(L => L.min > p); }

function setBig(id, val, suffix) {
  const el = document.getElementById(id);
  const prev = +el.dataset.v || 0;
  el.dataset.v = val;
  const paint = v => { el.innerHTML = fmtInt(v) + (suffix || ''); };
  if (prefersReduced || prev === val) { paint(val); return; }
  const t0 = performance.now(), dur = 650;
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    paint(Math.round(prev + (val - prev) * e));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

function firstName() { return (S.profile.full_name || S.profile.username || 'friend').split(' ')[0]; }

function renderAll() {
  const h = new Date().getHours();
  $('#greeting').textContent = (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ', ' + firstName() + ' 🌿';
  $('#greetSub').textContent = GREET_SUBS[Math.floor(Date.now() / DAY) % GREET_SUBS.length];

  setBig('stTrees', S.trees);
  setBig('stCleans', S.cleans);
  setBig('stWaste', Math.round(S.waste), '<span> kg</span>');
  setBig('stCO2', S.trees * 21, '<span> kg</span>');
  setBig('stStreak', S.streak);

  const lvl = levelOf(S.pts), nxt = nextLevel(S.pts);
  $('#lvlName').textContent = lvl.e + ' ' + lvl.n;
  $('#lvlPts').textContent = fmtInt(S.pts) + ' pts';
  $('#meName').textContent = S.profile.username ? '@' + S.profile.username : 'you';
  $('#meLvl').textContent = lvl.e + ' ' + lvl.n + ' · ' + fmtInt(S.pts) + ' pts';
  $('#meAvatar').innerHTML = avatarHtml(S.profile.username, S.profile.avatar_url);
  const base = lvl.min, top = nxt ? nxt.min : (S.pts || 1);
  const pct = nxt ? Math.min(100, Math.round((S.pts - base) / (top - base) * 100)) : 100;
  $('#ringPct').textContent = pct + '%';
  $('#ringFill').style.strokeDashoffset = 326.7 * (1 - pct / 100);
  $('#lvlNext').textContent = nxt ? (nxt.min - S.pts) + ' pts to ' + nxt.e + ' ' + nxt.n : 'Maximum level reached — guard the forest!';

  renderBadges();
  renderFeed();
  renderForest();
  renderQuiz();
  renderDonate();
}

function renderBadges() {
  $('#badgeRow').innerHTML = BADGES.map(b => {
    const u = b.test(S);
    return '<div class="badge ' + (u ? 'unlocked' : 'locked') + '" title="' + esc(b.t) + '"><div class="coin">' + b.e + '</div>' + b.n + '</div>';
  }).join('');
}

function renderFeed() {
  $('#feed').innerHTML = S.actions.map(a => {
    const dot = a.img
      ? '<div class="dot"><img src="' + esc(a.img) + '" alt="" loading="lazy"></div>'
      : '<div class="dot" style="background:' + (a.kind === 'tree' ? 'var(--sprout-soft)' : 'var(--clean-soft)') + '">' + (a.kind === 'tree' ? '🌱' : '🧹') + '</div>';
    return '<div class="feed-item">' + dot +
      '<div style="flex:1;min-width:0"><b>' + esc(a.label) + '</b><small>' + timeAgo(a.ts) + ' · verified ✓</small></div>' +
      '<b class="fpts">+' + a.pts + '</b></div>';
  }).join('') || "<p style='color:var(--soft)'>No actions yet — your forest starts with one tap.</p>";
}

/* the living forest strip */
let lastForestN = 0;
function treeShape(i, x, front, animated) {
  const r1 = srand(i * 7 + 1), r2 = srand(i * 13 + 2), r3 = srand(i * 29 + 3);
  const h = (front ? 42 : 26) + r1 * (front ? 56 : 30);
  const w = (front ? 14 : 9) + r2 * (front ? 20 : 11);
  const hues = ['#2F7D45', '#5DA45F', '#7DC852', '#3E6B3A', '#8FBF4D'];
  const hue = hues[Math.floor(r3 * hues.length)];
  const shape = Math.floor(srand(i * 31 + 4) * 3);
  let crown;
  if (shape === 1) {
    crown = '<polygon points="' + (x - w) + ',' + (150 - h * .35) + ' ' + x + ',' + (150 - h) + ' ' + (x + w) + ',' + (150 - h * .35) + '" fill="' + hue + '"/>' +
            '<polygon points="' + (x - w * .8) + ',' + (150 - h * .58) + ' ' + x + ',' + (150 - h - 4) + ' ' + (x + w * .8) + ',' + (150 - h * .58) + '" fill="' + hue + '" opacity=".85"/>';
  } else if (shape === 2) {
    crown = '<circle cx="' + (x - w * .45) + '" cy="' + (150 - h * .55) + '" r="' + (w * .72) + '" fill="' + hue + '" opacity=".9"/>' +
            '<circle cx="' + (x + w * .4) + '" cy="' + (150 - h * .64) + '" r="' + (w * .62) + '" fill="' + hue + '"/>';
  } else {
    crown = '<ellipse cx="' + x + '" cy="' + (150 - h * .58) + '" rx="' + w + '" ry="' + (h * .42) + '" fill="' + hue + '"/>';
  }
  return '<g' + (animated ? ' class="sprouting"' : '') + (front ? '' : ' opacity=".3"') + '>' +
    '<rect x="' + (x - 2) + '" y="' + (150 - h * .45) + '" width="4" height="' + (h * .45) + '" rx="2" fill="var(--clay)"/>' + crown + '</g>';
}
function renderForest() {
  const svg = $('#forestStrip');
  if (!svg) return;
  const n = Math.min(60, 18 + S.trees + S.cleans);
  let out = '<circle cx="938" cy="28" r="15" fill="#FFCB3D" opacity=".85"/>' +
            '<path d="M150 36 q5 -7 10 0 q5 -7 10 0" stroke="var(--faint)" stroke-width="1.6" fill="none" opacity=".6"/>' +
            '<path d="M730 24 q5 -7 10 0 q5 -7 10 0" stroke="var(--faint)" stroke-width="1.6" fill="none" opacity=".5"/>' +
            '<rect y="142" width="1000" height="8" fill="var(--sprout-soft)"/>';
  const back = Math.round(n * .7);
  for (let i = 0; i < back; i++) out += treeShape(i * 3 + 101, 36 + i * (930 / Math.max(back - 1, 1)), false, false);
  for (let i = 0; i < n; i++) out += treeShape(i + 3, 20 + i * (960 / Math.max(n - 1, 1)), true, i >= lastForestN && lastForestN > 0);
  svg.innerHTML = out;
  lastForestN = n;
  $('#forestCount').textContent = n + ' trees standing (you + community)';
}

/* ------------------------------------------------------------
   7 · LOG SCREEN
------------------------------------------------------------ */
const photos = { before: null, after: null };
let speciesCustom = false;
const MODE_COPY = {
  tree: {
    before: '🍂<br><b>Bare ground</b><br><small>the spot, before planting</small>',
    after: '🌱<br><b>Sapling in!</b><br><small>same spot, planted & watered</small>',
  },
  cleanup: {
    before: '🗑️<br><b>The mess</b><br><small>before you started</small>',
    after: '✨<br><b>The glow-up</b><br><small>same spot, after</small>',
  },
};
function resetDrops() {
  if (!photos.before) $('#dropBeforeInner').innerHTML = MODE_COPY[S.mode].before;
  if (!photos.after) $('#dropAfterInner').innerHTML = MODE_COPY[S.mode].after;
}

function setMode(m) {
  if (S.mode !== m) { photos.before = photos.after = null; $('#baPreview').innerHTML = ''; }
  S.mode = m;
  $('#modeTree').setAttribute('aria-pressed', m === 'tree');
  $('#modeClean').setAttribute('aria-pressed', m === 'cleanup');
  $('#treeFields').style.display = m === 'tree' ? 'block' : 'none';
  $('#cleanFields').style.display = m === 'cleanup' ? 'block' : 'none';
  $('#dropPair').classList.toggle('tree', m === 'tree');
  $('#pvTitle').textContent = m === 'tree' ? '🌱 New tree' : '🧹 New clean-up';
  $('#pvPts').textContent = m === 'tree' ? '+10 pts' : '+8 pts & weight bonus';
  resetDrops();
  updPv();
}

function selTeam() {
  const sel = $('#teamSelect');
  if (!sel || !sel.value) return null;
  const t = myTeams.find(x => String(x.id) === sel.value);
  return t ? { id: t.id, name: t.name } : null;
}
function updPv() {
  const t = selTeam();
  const L = [];
  L.push('before ........ ' + (photos.before ? 'attached ✓' : 'pending'));
  L.push('after ......... ' + (photos.after ? 'attached ✓' : 'pending'));
  L.push('gps ........... ' + (S.lastGPS ? 'locked ✓' + (S.lastGPS.place ? ' · ' + S.lastGPS.place : '') : 'pending'));
  L.push('team .......... ' + (t ? t.name : 'solo'));
  L.push('timestamp ..... ' + new Date().toLocaleString());
  L.push('exif check .... on submit');
  L.push('duplicate ..... on submit');
  $('#pvMeta').textContent = L.join('\n');
}

function baInner(b, a, withRange) {
  return '<img class="ba-img" src="' + b + '" alt="before">' +
    '<div class="ba-clip"><img class="ba-img" src="' + a + '" alt="after"></div>' +
    '<div class="ba-line"></div><span class="ba-tag ba-tag-b">AFTER</span><span class="ba-tag ba-tag-a">BEFORE</span>' +
    (withRange ? '<input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Compare before and after">' : '');
}
/* left side of the line = AFTER (clipped layer), right = BEFORE (base). tags swapped accordingly */
function baSlider(b, a, h) { return '<div class="ba" style="--h:' + (h || 220) + 'px">' + baInner(b, a, true) + '</div>'; }

async function handlePhoto(input, slot, innerId) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) { toast("That doesn't look like an image", '🤔'); return; }
  try {
    const blob = await compressImage(f);
    const url = await blobToDataURL(blob);
    photos[slot] = { blob, url };
    document.getElementById(innerId).innerHTML = '<img src="' + url + '" alt="proof preview"><br><small>attached ✓ · EXIF queued</small>';
    if (photos.before && photos.after) $('#baPreview').innerHTML = baSlider(photos.before.url, photos.after.url, 210);
    updPv();
  } catch (e) { toast('Could not read that photo', '⚠️'); }
  input.value = '';
}
function wireDrop(dropId, inputId, slot, innerId) {
  const drop = document.getElementById(dropId), input = document.getElementById(inputId);
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('drag');
    if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; handlePhoto(input, slot, innerId); }
  });
  input.addEventListener('change', () => handlePhoto(input, slot, innerId));
}

function detectGPS() {
  const btn = $('#gpsBtn');
  btn.textContent = '📡 Locating…';
  const done = (lat, lng, approx) => {
    S.lastGPS = { lat: +(+lat).toFixed(5), lng: +(+lng).toFixed(5), place: '' };
    $('#gpsText').textContent = '📍 ' + S.lastGPS.lat + '°, ' + S.lastGPS.lng + '°' + (approx ? ' · approximate' : ' · locked ✓');
    btn.textContent = '📍 Detect GPS';
    updPv();
    placeName(S.lastGPS.lat, S.lastGPS.lng).then(p => {
      if (p && S.lastGPS) { S.lastGPS.place = p; $('#gpsText').textContent = '📍 ' + p + ' · ' + S.lastGPS.lat + '°, ' + S.lastGPS.lng + '° ✓'; updPv(); }
    });
  };
  const fallback = () => done(12.92 + Math.random() * .09, 77.55 + Math.random() * .09, true);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(p => done(p.coords.latitude, p.coords.longitude), fallback, { timeout: 6000, enableHighAccuracy: true });
  } else fallback();
}
async function placeName(lat, lng) {
  if (!gmFailed) {
    try {
      await loadMaps();
      const g = new google.maps.Geocoder();
      const { results } = await g.geocode({ location: { lat, lng } });
      const r = results.find(x => x.types.includes('locality')) || results[0];
      if (r) {
        const get = t => { const c = r.address_components.find(c => c.types.includes(t)); return c ? c.long_name : ''; };
        const s = [get('locality') || get('administrative_area_level_2'), get('country')].filter(Boolean).join(', ');
        if (s) return s;
      }
    } catch (e) { /* fall through to OSM */ }
  }
  try { // keyless fallback: OpenStreetMap Nominatim
    const r = await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng);
    const j = await r.json();
    const ad = j.address || {};
    return [ad.city || ad.town || ad.village || ad.county || '', ad.country || ''].filter(Boolean).join(', ');
  } catch (e) { return ''; }
}

function initCombo() {
  const inp = $('#speciesInput'), list = $('#comboList');
  let activeIdx = -1;
  function options() { return Array.from(list.querySelectorAll('.combo-opt')); }
  function show(q) {
    q = (q || '').trim().toLowerCase();
    let html = '', any = false;
    SPECIES_GROUPS.forEach(g => {
      const hits = g.items.filter(s => s.toLowerCase().includes(q));
      if (!hits.length) return;
      any = true;
      html += '<div class="combo-group">' + esc(g.g) + '</div>' + hits.map(s => '<button type="button" class="combo-opt" data-v="' + esc(s) + '">' + esc(s) + '</button>').join('');
    });
    if (!any) html += '<div class="combo-empty">No matches in the field guide…</div>';
    html += '<button type="button" class="combo-opt combo-other" data-other="1">✏️ ' + (q ? 'Use “' + esc(q) + '” as a custom species' : "Can't find it? Type a name, then tap here") + '</button>';
    list.innerHTML = html;
    list.classList.add('open');
    inp.setAttribute('aria-expanded', 'true');
    activeIdx = -1;
  }
  function hide() { list.classList.remove('open'); inp.setAttribute('aria-expanded', 'false'); }
  inp.addEventListener('focus', () => show(inp.value));
  inp.addEventListener('input', () => { speciesCustom = false; show(inp.value); });
  inp.addEventListener('keydown', e => {
    const opts = options();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!list.classList.contains('open')) { show(inp.value); return; }
      activeIdx = e.key === 'ArrowDown' ? Math.min(opts.length - 1, activeIdx + 1) : Math.max(0, activeIdx - 1);
      opts.forEach((o, i) => o.classList.toggle('active', i === activeIdx));
      if (opts[activeIdx]) opts[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (list.classList.contains('open') && opts[activeIdx]) { e.preventDefault(); opts[activeIdx].dispatchEvent(new Event('pick')); }
      else hide();
    } else if (e.key === 'Escape') hide();
  });
  list.addEventListener('mousedown', e => {
    const b = e.target.closest('.combo-opt');
    if (!b) return;
    e.preventDefault();
    b.dispatchEvent(new Event('pick'));
  });
  list.addEventListener('pick', e => {
    const b = e.target.closest ? e.target.closest('.combo-opt') : null;
    if (!b) return;
    if (b.dataset.other) {
      speciesCustom = true;
      if (!inp.value.trim()) { toast('Type your species name first, then tap that again', '✏️'); inp.focus(); return; }
      toast('Custom species noted: ' + inp.value.trim(), '✏️');
    } else { inp.value = b.dataset.v; speciesCustom = false; }
    hide();
  }, true);
  inp.addEventListener('blur', () => setTimeout(hide, 160));
}

function selectedWasteTypes() {
  return $$('#wasteChips .chip[aria-pressed="true"]').map(c => c.textContent.trim()).join(', ') || '🍂 Mixed';
}

function addPoints(n) {
  const before = levelOf(S.pts);
  S.pts += n;
  const after = levelOf(S.pts);
  if (after.min > before.min) {
    setTimeout(() => {
      openModal('<div class="lvlup"><span class="lvl-emoji">' + after.e + '</span><h3>Level up — ' + after.n + '!</h3><p style="color:var(--soft)">' + after.flavor + '</p><button class="btn btn-primary" data-close style="margin-top:1.1rem">Keep growing</button></div>');
      confetti('#FFCB3D');
    }, 700);
  }
}
function bumpStreak() {
  const today = todayStr();
  if (S.lastActionOn === today) return;
  S.streak = S.lastActionOn === yesterdayStr() ? S.streak + 1 : 1;
  S.lastActionOn = today;
}

async function submitAction() {
  if (busy) return;
  const mode = S.mode;
  if (!S.lastGPS) { toast('Detect GPS first — proof needs a pin', '📍'); return; }
  if (!photos.before || !photos.after) {
    toast((mode === 'tree' ? 'Trees' : 'Clean-ups') + ' need BOTH before & after shots', '📷');
    return;
  }
  let label, pts, species = null, kg = 0;
  if (mode === 'tree') {
    species = $('#speciesInput').value.trim();
    if (!species) { toast('Which species did you plant?', '🌱'); return; }
    const note = $('#treeNote').value.trim();
    label = species.replace(/\s*\(.*\)$/, '') + (note ? ' · ' + note : '');
    pts = 10;
  } else {
    kg = Math.min(200, Math.max(1, +$('#kgNum').value || 1));
    pts = 8 + Math.min(10, Math.floor(kg / 2));
    label = kg + ' kg · ' + selectedWasteTypes();
  }
  const team = selTeam();

  busy = true;
  const btn = $('#submitBtn');
  btn.disabled = true; btn.textContent = 'Verifying…';

  const ts = Date.now();
  const urls = {};
  let savedRow = null;

  if (db && user && !guest) {
    try {
      toast('Uploading proof 1/2…', '☁️');
      urls.before = await apiUpload('proofs', user.id + '/' + ts + '-before.jpg', photos.before.blob);
      toast('Uploading proof 2/2…', '☁️');
      urls.after = await apiUpload('proofs', user.id + '/' + ts + '-after.jpg', photos.after.blob);
      const { data, error } = await db.from('actions').insert({
        user_id: user.id, kind: mode, title: label,
        species: species, note: mode === 'tree' ? $('#treeNote').value.trim() : null,
        waste_types: mode === 'cleanup' ? selectedWasteTypes() : null,
        weight_kg: kg || null, points: pts,
        lat: S.lastGPS.lat, lng: S.lastGPS.lng, place: S.lastGPS.place || '',
        photo_url: null, before_url: urls.before || null, after_url: urls.after || null,
        team_id: team ? team.id : null,
      }).select().single();
      if (error) throw error;
      savedRow = data;
    } catch (e) {
      sbFail(e);
      toast('Cloud save failed — keeping it locally for now', '⚠️');
    }
  }

  if (mode === 'tree') { S.trees++; } else { S.cleans++; S.waste += kg; }
  addPoints(pts);
  bumpStreak();
  S.actions.unshift({ kind: mode, label, ts, pts, img: guest ? photos.after.url : (urls.after || '') });
  S.actions = S.actions.slice(0, 14);

  worldActions.unshift({
    id: savedRow ? savedRow.id : 'l' + ts, kind: mode, title: label, species, kg,
    who: S.profile.username || 'you', college: S.profile.college || '', avatar_url: S.profile.avatar_url || '',
    place: S.lastGPS.place || '', lat: S.lastGPS.lat, lng: S.lastGPS.lng, ts, pts,
    img: '', before: urls.before || photos.before.url, after: urls.after || photos.after.url,
    team_id: team ? team.id : null, team: team ? team.name : '',
  });

  persist();
  confetti(mode === 'tree' ? '#7DC852' : '#3E8ED0');
  toast('Verified! +' + pts + ' pts — your forest just grew' + (team ? ' for ' + team.name : '') + '.', mode === 'tree' ? '🌱' : '🧹');

  // reset the form (the chosen team intentionally stays put)
  photos.before = photos.after = null;
  S.lastGPS = null;
  resetDrops();
  $('#baPreview').innerHTML = '';
  $('#gpsText').textContent = 'Tap “Detect GPS” to pin this action';
  $('#speciesInput').value = ''; $('#treeNote').value = '';
  btn.disabled = false; btn.textContent = 'Submit for verification →';
  busy = false;

  renderAll();
  renderWorld();
  go('dash');
}

/* ------------------------------------------------------------
   8 · GOOGLE MAPS — the world grove
------------------------------------------------------------ */
let mapsP = null, worldMap = null, infoWin = null, markers = [], clusterer = null, youMarker = null;
let mapEngine = null, osmMap = null, osmMarkers = [], osmTiles = null, osmYou = null, gmFailed = false;

/* Google calls this if the key is rejected at runtime (API not enabled,
   billing missing, referer blocked…) — we swap to OpenStreetMap so the
   world grove never goes dark. */
window.gm_authFailure = function () {
  gmFailed = true;
  console.warn(
    '[GreenUp] Google Maps rejected the key at runtime. In Google Cloud Console check:\n' +
    '  1. APIs & Services → Library → enable "Maps JavaScript API" (and "Geocoding API")\n' +
    '  2. Billing is linked to the project (required even on the free tier)\n' +
    '  3. Key restrictions allow this origin: ' + location.origin + '\n' +
    'Falling back to OpenStreetMap meanwhile.'
  );
  showMapNote();
  if (mapEngine === 'google') {
    worldMap = null; infoWin = null; markers = []; clusterer = null; mapEngine = null;
    ensureWorldMap();
  }
};
function showMapNote() {
  const n = $('#mapNote');
  if (!n) return;
  n.style.display = 'block';
  n.innerHTML = '🛰️ The Google Maps key isn’t fully set up — enable <b>Maps JavaScript API</b> + billing in Google Cloud Console (details in the browser console). Showing the OpenStreetMap fallback meanwhile, nothing is lost.';
}
function pinSvg(kind) {
  const c = kind === 'tree' ? '#2F7D45' : '#3E8ED0';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 43C7.5 30.5 4 23.5 4 16a13 13 0 1 1 26 0c0 7.5-3.5 14.5-13 27Z" fill="' + c + '" stroke="#FCFDF6" stroke-width="3"/><circle cx="17" cy="16" r="5.5" fill="#FCFDF6"/></svg>';
}
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((res, rej) => {
    let tries = 0;
    const t = setInterval(() => {
      if (window.L) { clearInterval(t); res(); }
      else if (++tries > 40) { clearInterval(t); rej(new Error('leaflet missing')); }
    }, 150);
  });
}
function osmTileUrl() {
  return isDark()
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
}
function initOsmMap() {
  const div = $('#worldMap');
  div.innerHTML = '';
  osmMap = L.map(div, { worldCopyJump: true }).setView([16, 14], 2);
  osmTiles = L.tileLayer(osmTileUrl(), { attribution: '© OpenStreetMap contributors · © CARTO', maxZoom: 19 }).addTo(osmMap);
  mapEngine = 'osm';
  refreshMarkers();
}
function loadMaps() {
  if (window.google && window.google.maps) return Promise.resolve();
  if (mapsP) return mapsP;
  mapsP = new Promise((res, rej) => {
    window.__guMapsReady = () => res();
    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + MAPS_KEY + '&callback=__guMapsReady&loading=async&v=weekly';
    s.async = true;
    s.onerror = () => { mapsP = null; rej(new Error('maps failed to load')); };
    document.head.appendChild(s);
    setTimeout(() => rej(new Error('maps timed out')), 15000);
  });
  return mapsP;
}
function mapStyles() {
  return isDark() ? [
    { elementType: 'geometry', stylers: [{ color: '#15211a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8fb59a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1510' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2c4233' }] },
    { featureType: 'landscape.natural', stylers: [{ color: '#182619' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }, { color: '#1d3322' }] },
    { featureType: 'road', stylers: [{ color: '#1f2d22' }, { visibility: 'simplified' }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', stylers: [{ color: '#0e1b26' }] },
  ] : [
    { elementType: 'geometry', stylers: [{ color: '#e8efdc' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#41603c' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f6f9ee' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#b9c9a5' }] },
    { featureType: 'landscape.natural', stylers: [{ color: '#e3ecd2' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }, { color: '#cfe4b4' }] },
    { featureType: 'road', stylers: [{ color: '#f3f6ea' }, { visibility: 'simplified' }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', stylers: [{ color: '#b7d4e6' }] },
  ];
}
function pinIcon(kind) {
  return { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pinSvg(kind)), scaledSize: new google.maps.Size(34, 44), anchor: new google.maps.Point(17, 43) };
}
function clusterIcon(count) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="20" fill="#2F7D45" stroke="#FCFDF6" stroke-width="3" opacity=".94"/></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
async function ensureWorldMap() {
  const status = $('#mapStatus');
  if (mapEngine === 'google' && worldMap) { google.maps.event.trigger(worldMap, 'resize'); return; }
  if (mapEngine === 'osm' && osmMap) { requestAnimationFrame(() => osmMap.invalidateSize()); return; }
  status.style.display = 'grid';
  status.textContent = 'summoning satellites…';
  if (!gmFailed) {
    try {
      await loadMaps();
      if (!gmFailed) {
        worldMap = new google.maps.Map($('#worldMap'), {
          center: { lat: 16, lng: 14 }, zoom: 2, minZoom: 2,
          styles: mapStyles(), mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
          backgroundColor: isDark() ? '#0e1b26' : '#b7d4e6',
        });
        infoWin = new google.maps.InfoWindow();
        mapEngine = 'google';
        status.style.display = 'none';
        refreshMarkers();
        return;
      }
    } catch (e) {
      mapsP = null; // network hiccup — allow a retry next visit
    }
  }
  // plan B: keyless OpenStreetMap
  try {
    await loadLeaflet();
    initOsmMap();
    status.style.display = 'none';
  } catch (e) {
    status.innerHTML = '🛰️ No map engine could load — check your connection and revisit this tab.';
  }
}
function infoHtml(a) {
  const img = (hasPair(a) || a.kind === 'cleanup')
    ? '<div class="iw-pair"><img src="' + beforeOf(a) + '" alt="before"><img src="' + afterOf(a) + '" alt="after"></div>'
    : '<img class="iw-img" src="' + imgOf(a) + '" alt="">';
  return '<div class="iw">' + img + '<div class="iw-body">' +
    '<span class="iw-kind ' + (a.kind === 'tree' ? 't' : 'c') + '">' + (a.kind === 'tree' ? '🌳 tree planted' : '🧹 area cleaned') + '</span>' +
    '<b>' + esc(a.title) + '</b>' +
    '<div class="iw-meta">@' + esc(a.who) + (a.team ? ' · 🤝 ' + esc(a.team) : (a.college ? ' · ' + esc(a.college) : '')) + '<br>' + esc(a.place || '') + ' · ' + timeAgo(a.ts) + ' · <b style="color:var(--leaf)">+' + a.pts + '</b></div>' +
    '</div></div>';
}
function refreshMarkers() {
  const list = worldActions.filter(a => a.lat && a.lng && (mapFilter === 'all' || a.kind === mapFilter));
  $('#mapCount').textContent = list.length + ' verified actions';

  if (mapEngine === 'osm' && osmMap) {
    osmMarkers.forEach(m => m.remove());
    osmMarkers = [];
    list.forEach(a => {
      const m = L.marker([+a.lat, +a.lng], {
        icon: L.divIcon({ className: '', html: pinSvg(a.kind), iconSize: [34, 44], iconAnchor: [17, 43], popupAnchor: [0, -40] }),
        title: a.title,
      }).addTo(osmMap).bindPopup(infoHtml(a), { maxWidth: 260, className: 'gu-pop' });
      m.guId = a.id;
      osmMarkers.push(m);
    });
    return;
  }

  if (!worldMap || !window.google) return;
  markers.forEach(m => m.setMap(null));
  if (clusterer) { try { clusterer.clearMarkers(); } catch (e) {} }
  markers = [];
  list.forEach(a => {
    const m = new google.maps.Marker({ position: { lat: +a.lat, lng: +a.lng }, icon: pinIcon(a.kind), title: a.title });
    m.guId = a.id;
    m.addListener('click', () => { infoWin.setContent(infoHtml(a)); infoWin.open({ map: worldMap, anchor: m }); });
    markers.push(m);
  });
  const MC = window.markerClusterer && window.markerClusterer.MarkerClusterer;
  if (MC) {
    if (!clusterer) {
      clusterer = new MC({
        map: worldMap, markers,
        renderer: { render: ({ count, position }) => new google.maps.Marker({ position, icon: { url: clusterIcon(count), scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 24) }, label: { text: String(count), color: '#fff', fontFamily: 'Outfit', fontWeight: '700' }, zIndex: 2000 + count }) },
      });
    } else clusterer.addMarkers(markers);
  } else markers.forEach(m => m.setMap(worldMap));
}
async function panToAction(a) {
  go('map');
  await ensureWorldMap();
  if (!a.lat) return;
  if (mapEngine === 'osm' && osmMap) {
    osmMap.setView([+a.lat, +a.lng], 12);
    const m = osmMarkers.find(x => x.guId === a.id);
    if (m) m.openPopup();
    else L.popup({ maxWidth: 260, className: 'gu-pop' }).setLatLng([+a.lat, +a.lng]).setContent(infoHtml(a)).openOn(osmMap);
    return;
  }
  if (!worldMap) return;
  worldMap.setZoom(12);
  worldMap.panTo({ lat: +a.lat, lng: +a.lng });
  if (infoWin) {
    infoWin.setContent(infoHtml(a));
    infoWin.setPosition({ lat: +a.lat, lng: +a.lng });
    infoWin.open({ map: worldMap });
  }
}
function nearMe() {
  if (!navigator.geolocation) { toast('No geolocation on this device', '🛰️'); return; }
  navigator.geolocation.getCurrentPosition(async p => {
    await ensureWorldMap();
    const lat = p.coords.latitude, lng = p.coords.longitude;
    if (mapEngine === 'osm' && osmMap) {
      osmMap.setView([lat, lng], 11);
      if (osmYou) osmYou.remove();
      osmYou = L.circleMarker([lat, lng], { radius: 9, color: '#16291C', weight: 2.5, fillColor: '#FFCB3D', fillOpacity: 1 }).addTo(osmMap);
      return;
    }
    if (!worldMap) return;
    worldMap.setZoom(11);
    worldMap.panTo({ lat, lng });
    if (youMarker) youMarker.setMap(null);
    youMarker = new google.maps.Marker({ map: worldMap, position: { lat, lng }, title: 'You are here', icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#FFCB3D', fillOpacity: 1, strokeColor: '#16291C', strokeWeight: 2.5 } });
  }, () => toast('Could not get your location', '🛰️'));
}

/* gallery under the map */
function renderWorld() {
  const grid = $('#galleryGrid');
  if (!grid) return;
  const withPics = worldActions.slice(0, 36);
  grid.innerHTML = withPics.map(a => {
    const img = afterOf(a);
    return '<button class="ga-card" data-aid="' + esc(String(a.id)) + '">' +
      '<span class="ga-imgwrap"><img loading="lazy" src="' + img + '" alt="' + esc(a.title) + '">' +
      '<span class="ga-kind ' + (a.kind === 'tree' ? 't' : 'c') + '">' + (a.kind === 'tree' ? 'TREE' : 'CLEAN-UP') + '</span>' +
      (hasPair(a) || a.kind === 'cleanup' ? '<span class="ga-2x">📷 ×2</span>' : '') +
      (a.demo ? '<span class="sample-tag">sample</span>' : '') + '</span>' +
      '<span class="ga-body"><b>' + esc(a.title) + '</b>' +
      '<span class="ga-place">📍 ' + esc(a.place || 'somewhere green') + (a.team ? ' · 🤝 ' + esc(a.team) : '') + '</span>' +
      '<span class="ga-meta">' + avatarHtml(a.who, a.avatar_url) + '<span>@' + esc(a.who) + ' · ' + timeAgo(a.ts) + '</span><span style="margin-left:auto;font-family:var(--font-m);color:var(--leaf);font-weight:700">+' + a.pts + '</span></span>' +
      '</span></button>';
  }).join('');
  $('#galleryCount').textContent = worldActions.length + ' actions worldwide';
  refreshMarkers();
}
function openActionModal(a) {
  const pair = hasPair(a) || a.kind === 'cleanup';
  const visual = pair
    ? baSlider(beforeOf(a), afterOf(a), 280)
    : '<img class="modal-detail-img" src="' + imgOf(a) + '" alt="' + esc(a.title) + '">';
  openModal('<button class="x" data-close>✕</button>' +
    '<span class="eyebrow">' + (a.kind === 'tree' ? '🌳 tree planted' : '🧹 area cleaned') + (pair ? ' — drag to compare' : '') + '</span>' +
    '<h3 style="margin:.3rem 0 .8rem">' + esc(a.title) + '</h3>' + visual +
    '<div style="display:flex;align-items:center;gap:.6rem;margin-top:1rem;flex-wrap:wrap">' + avatarHtml(a.who, a.avatar_url) +
    '<div style="flex:1;min-width:0"><b>@' + esc(a.who) + '</b>' + (a.team ? ' · 🤝 ' + esc(a.team) : (a.college ? ' · ' + esc(a.college) : '')) + '<br><small style="color:var(--soft)">📍 ' + esc(a.place || 'somewhere green') + ' · ' + timeAgo(a.ts) + (a.kg ? ' · ' + a.kg + ' kg cleared' : '') + '</small></div>' +
    '<span class="mono" style="color:var(--leaf);font-weight:700">+' + a.pts + ' pts</span></div>' +
    (a.lat ? '<button class="btn btn-soft" style="width:100%;margin-top:1.1rem" id="modalMapBtn">🗺️ Show on the world map</button>' : ''), true);
  const mb = $('#modalMapBtn');
  if (mb) mb.addEventListener('click', () => { closeModal(); panToAction(a); });
}

/* ------------------------------------------------------------
   8.5 · TEAMS
------------------------------------------------------------ */
let myTeams = []; // [{id, name, org, description, logo, role}]

function teamLogoHtml(t) {
  if (t.logo) return '<img class="team-logo" src="' + esc(t.logo) + '" alt="">';
  const h = hashNum(t.name || '?') % 360;
  return '<span class="team-logo" style="background:hsl(' + h + ',40%,82%);color:hsl(' + h + ',45%,24%)">' + esc((t.name || '?')[0].toUpperCase()) + '</span>';
}
function demoAllTeams() { return [...(S.localTeams || []), ...DEMO_TEAMS_FULL]; }
function isMyTeam(id) { return myTeams.some(t => String(t.id) === String(id)); }

async function loadMyTeams() {
  if (db && user && !guest) {
    try {
      const { data, error } = await db.from('team_members').select('role, teams(id, name, org, description, logo_url)').eq('user_id', user.id);
      if (error) throw error;
      myTeams = (data || []).filter(r => r.teams).map(r => ({ id: r.teams.id, name: r.teams.name, org: r.teams.org, description: r.teams.description, logo: r.teams.logo_url, role: r.role }));
      renderTeamSelect();
      return;
    } catch (e) { sbFail(e); }
  }
  const all = demoAllTeams();
  myTeams = (S.myTeamIds || [])
    .map(id => all.find(t => String(t.id) === String(id)))
    .filter(Boolean)
    .map(t => ({ id: t.id, name: t.name, org: t.org, description: t.description, logo: t.logo, role: (S.localTeams || []).some(l => l.id === t.id) ? 'owner' : 'member' }));
  renderTeamSelect();
}
function renderTeamSelect() {
  const field = $('#teamField'), sel = $('#teamSelect');
  if (!field) return;
  if (!myTeams.length) { field.style.display = 'none'; sel.innerHTML = ''; updPv(); return; }
  field.style.display = 'block';
  const def = guest ? (S.defaultTeamId || '') : (user ? (lsGet('gu-team-' + user.id) || '') : '');
  sel.innerHTML = '<option value="">🚶 No team — solo action</option>' + myTeams.map(t => '<option value="' + esc(String(t.id)) + '">🤝 ' + esc(t.name) + '</option>').join('');
  if (Array.from(sel.options).some(o => o.value === String(def))) sel.value = String(def);
  updPv();
}

async function fetchTeams(q) {
  if (db && user && !guest) {
    try {
      let qry = db.from('teams').select('id, name, org, description, logo_url, team_members(count)').order('created_at', { ascending: false }).limit(24);
      if (q) qry = qry.or('name.ilike.%' + q.replace(/[%,()]/g, '') + '%,org.ilike.%' + q.replace(/[%,()]/g, '') + '%');
      const { data, error } = await qry;
      if (error) throw error;
      return (data || []).map(t => ({ id: t.id, name: t.name, org: t.org, description: t.description, logo: t.logo_url, memberCount: (t.team_members && t.team_members[0] && t.team_members[0].count) || 0 }));
    } catch (e) { sbFail(e); }
  }
  const ql = (q || '').toLowerCase();
  return demoAllTeams()
    .filter(t => !ql || t.name.toLowerCase().includes(ql) || (t.org || '').toLowerCase().includes(ql))
    .map(t => ({ id: t.id, name: t.name, org: t.org, description: t.description, logo: t.logo, memberCount: (t.members || []).length + (isMyTeam(t.id) && !(t.members || []).some(m => m.u === S.profile.username) ? 1 : 0) }));
}
function teamCard(t, mine) {
  return '<button class="team-card" data-team="' + esc(String(t.id)) + '">' + teamLogoHtml(t) +
    '<span class="tc-meta"><b>' + esc(t.name) + (mine && t.role === 'owner' ? '<span class="role-tag">OWNER</span>' : '') + '</b>' +
    '<small>' + esc(t.org || 'independent grove') + '</small>' +
    (t.memberCount != null ? '<span class="mono">' + t.memberCount + ' member' + (t.memberCount === 1 ? '' : 's') + '</span>' : '') +
    '</span></button>';
}
async function renderTeamsScreen() {
  $('#teamDetail').style.display = 'none';
  $('#teamHome').style.display = 'block';
  $('#myTeamsGrid').innerHTML = myTeams.length
    ? myTeams.map(t => teamCard(t, true)).join('')
    : '<p class="empty-note">No team yet — create one, or join below. Solo trees still count 🌱</p>';
  const results = await fetchTeams($('#teamSearch').value.trim());
  const others = results.filter(t => !isMyTeam(t.id));
  $('#teamResults').innerHTML = others.length
    ? others.map(t => teamCard(t, false)).join('')
    : '<p class="empty-note">Nothing matches — name yours and plant the flag.</p>';
}

function shapeTeamDetail(team, members, acts) {
  const stats = { trees: 0, cleans: 0, kg: 0, pts: 0, members: members.length };
  const byUser = {};
  acts.forEach(a => {
    if (a.kind === 'tree') stats.trees++; else { stats.cleans++; stats.kg += a.kg || 0; }
    stats.pts += a.pts || 0;
    byUser[a.who] = (byUser[a.who] || 0) + (a.pts || 0);
  });
  return { team, members, acts, stats, byUser };
}
async function fetchTeamDetail(id) {
  if (db && user && !guest) {
    try {
      const { data: team, error: e1 } = await db.from('teams').select('*').eq('id', id).single();
      if (e1) throw e1;
      const { data: mem, error: e2 } = await db.from('team_members').select('role, profiles(id, username, avatar_url)').eq('team_id', id);
      if (e2) throw e2;
      const { data: acts, error: e3 } = await db.from('actions').select('kind, title, points, weight_kg, place, created_at, profiles(username)').eq('team_id', id).order('created_at', { ascending: false }).limit(200);
      if (e3) throw e3;
      return shapeTeamDetail(
        { id: team.id, name: team.name, org: team.org, description: team.description, logo: team.logo_url },
        (mem || []).map(m => ({ u: m.profiles ? m.profiles.username : '?', av: m.profiles ? m.profiles.avatar_url : '', role: m.role })),
        (acts || []).map(a => ({ kind: a.kind, title: a.title, pts: a.points || 0, kg: +a.weight_kg || 0, who: a.profiles ? a.profiles.username : '?', ts: +new Date(a.created_at), place: a.place }))
      );
    } catch (e) { sbFail(e); return null; }
  }
  const t = demoAllTeams().find(x => String(x.id) === String(id));
  if (!t) return null;
  const acts = worldActions.filter(a => String(a.team_id || '') === String(id)).map(a => ({ kind: a.kind, title: a.title, pts: a.pts, kg: a.kg || 0, who: a.who, ts: a.ts, place: a.place }));
  const members = (t.members || []).map(m => ({ u: m.u, av: '', role: m.u === t.owner ? 'owner' : 'member' }));
  if (isMyTeam(t.id) && !members.some(m => m.u === S.profile.username)) {
    members.push({ u: S.profile.username, av: S.profile.avatar_url, role: (S.localTeams || []).some(l => l.id === t.id) ? 'owner' : 'member' });
  }
  return shapeTeamDetail(t, members, acts);
}
function teamStatChips(d) {
  return '<span class="pstat">👥 <b>' + d.stats.members + '</b> members</span>' +
    '<span class="pstat">🌳 <b>' + d.stats.trees + '</b> trees</span>' +
    '<span class="pstat">🧹 <b>' + d.stats.cleans + '</b> clean-ups</span>' +
    '<span class="pstat">♻️ <b>' + Math.round(d.stats.kg) + '</b> kg</span>' +
    '<span class="pstat">✨ <b>' + fmtInt(d.stats.pts) + '</b> pts</span>';
}
async function openTeamPreview(id) {
  const d = await fetchTeamDetail(id);
  if (!d) { toast('Could not load that team', '⚠️'); return; }
  openModal('<button class="x" data-close>✕</button>' +
    '<div style="display:flex;gap:1rem;align-items:center">' + teamLogoHtml(d.team) +
    '<div style="min-width:0"><h3 style="margin:0">' + esc(d.team.name) + '</h3><small style="color:var(--soft)">' + esc(d.team.org || 'independent grove') + '</small></div></div>' +
    (d.team.description ? '<p style="margin:.9rem 0 .3rem;color:var(--soft)">' + esc(d.team.description) + '</p>' : '') +
    '<div class="pf-stats" style="justify-content:flex-start;margin:.8rem 0 1.1rem">' + teamStatChips(d) + '</div>' +
    '<button class="btn btn-primary" style="width:100%" id="joinTeamBtn">🤝 Join ' + esc(d.team.name) + '</button>' +
    '<button class="guest-link" id="peekTeamBtn">just peek at the dashboard →</button>');
  $('#joinTeamBtn').addEventListener('click', () => joinTeam(id));
  $('#peekTeamBtn').addEventListener('click', () => { closeModal(); openTeamDash(id); });
}
async function joinTeam(id) {
  if (db && user && !guest) {
    try {
      const { error } = await db.from('team_members').insert({ team_id: id, user_id: user.id });
      if (error && error.code !== '23505') throw error;
    } catch (e) { sbFail(e); toast('Could not join — re-run supabase-setup.sql?', '⚠️'); return; }
  } else {
    S.myTeamIds = S.myTeamIds || [];
    if (!S.myTeamIds.includes(id)) S.myTeamIds.push(id);
    persist();
  }
  closeModal();
  await loadMyTeams();
  confetti('#7DC852');
  toast('Welcome to the crew!', '🤝');
  openTeamDash(id);
}
async function leaveTeam(id) {
  if (db && user && !guest) {
    try { await db.from('team_members').delete().eq('team_id', id).eq('user_id', user.id); } catch (e) { sbFail(e); }
    if ((lsGet('gu-team-' + user.id) || '') === String(id)) lsSet('gu-team-' + user.id, '');
  } else {
    S.myTeamIds = (S.myTeamIds || []).filter(x => String(x) !== String(id));
    S.localTeams = (S.localTeams || []).filter(t => String(t.id) !== String(id)); // abandoning your own demo team dissolves it
    if (String(S.defaultTeamId) === String(id)) S.defaultTeamId = '';
    persist();
  }
  await loadMyTeams();
  toast('You left the team — no hard feelings', '👋');
  renderTeamsScreen();
}
async function openTeamDash(id) {
  const d = await fetchTeamDetail(id);
  if (!d) { toast('Could not load that team', '⚠️'); return; }
  $('#teamHome').style.display = 'none';
  const el = $('#teamDetail');
  el.style.display = 'block';
  const mine = isMyTeam(id);
  const sortedMembers = [...d.members].sort((a, b) => (d.byUser[b.u] || 0) - (d.byUser[a.u] || 0));
  const memberRows = sortedMembers.map(m =>
    '<div class="member-row">' + avatarHtml(m.u, m.av) +
    '<div style="flex:1;min-width:0"><b>@' + esc(m.u) + '</b>' + (m.role === 'owner' ? '<span class="role-tag">OWNER</span>' : '') +
    '<br><small>' + fmtInt(d.byUser[m.u] || 0) + ' pts for this team</small></div></div>'
  ).join('') || '<p class="empty-note">Nobody here yet.</p>';
  const feedRows = d.acts.slice(0, 8).map(a =>
    '<div class="feed-item"><div class="dot" style="background:' + (a.kind === 'tree' ? 'var(--sprout-soft)' : 'var(--clean-soft)') + '">' + (a.kind === 'tree' ? '🌱' : '🧹') + '</div>' +
    '<div style="flex:1;min-width:0"><b>' + esc(a.title) + '</b><small>@' + esc(a.who) + ' · ' + timeAgo(a.ts) + '</small></div>' +
    '<b class="fpts">+' + a.pts + '</b></div>'
  ).join('') || '<p class="empty-note">No team actions yet — pick this team in “Log an action” and get digging.</p>';
  const achRows = TEAM_ACH.map(x =>
    '<div class="ach ' + (x.test(d.stats) ? '' : 'off') + '"><span class="ach-e">' + x.e + '</span><span><b>' + x.n + '</b><small>' + esc(x.t) + '</small></span></div>'
  ).join('');
  el.innerHTML = '<button class="chip back-btn" id="teamBackBtn">← All teams</button>' +
    '<div class="card td-head">' + teamLogoHtml(d.team) +
    '<div style="flex:1;min-width:220px"><span class="eyebrow">' + esc(d.team.org || 'independent grove') + '</span>' +
    '<h3 style="font-family:var(--font-d);font-size:1.7rem">' + esc(d.team.name) + '</h3>' +
    (d.team.description ? '<p style="color:var(--soft);font-size:.95rem">' + esc(d.team.description) + '</p>' : '') +
    '<div class="td-stats">' + teamStatChips(d) + '</div></div>' +
    (mine ? '<button class="btn btn-ghost btn-sm" id="leaveTeamBtn">Leave team</button>' : '<button class="btn btn-primary btn-sm" id="joinTeamBtn2">🤝 Join this team</button>') +
    '</div>' +
    '<div class="dash-grid" style="margin-top:1.2rem">' +
    '<div class="card" style="padding:1.3rem"><span class="eyebrow">Members</span><h3 style="font-family:var(--font-d);font-size:1.3rem">Who’s digging</h3><div class="member-list">' + memberRows + '</div></div>' +
    '<div><div class="card" style="padding:1.3rem"><span class="eyebrow">Team journal</span><h3 style="font-family:var(--font-d);font-size:1.3rem;margin-bottom:.8rem">Latest team actions</h3><div class="feed">' + feedRows + '</div></div>' +
    '<div class="card" style="padding:1.3rem;margin-top:1.2rem"><span class="eyebrow">Achievements</span><div class="ach-grid" style="margin-top:.7rem">' + achRows + '</div></div></div>' +
    '</div>';
  $('#teamBackBtn').addEventListener('click', renderTeamsScreen);
  const lv = $('#leaveTeamBtn');
  if (lv) lv.addEventListener('click', () => leaveTeam(id));
  const jn = $('#joinTeamBtn2');
  if (jn) jn.addEventListener('click', () => joinTeam(id));
}
function openCreateTeam() {
  openModal('<button class="x" data-close>✕</button><h3>🌿 Create a team</h3>' +
    '<p style="color:var(--soft);margin-bottom:1rem">Round up your hostel, class or club.</p>' +
    '<div class="field"><label>Team name</label><input type="text" id="ctName" maxlength="40" placeholder="Eco Club"></div>' +
    '<div class="field"><label>Organization / college <span style="color:var(--faint);font-weight:500">(optional)</span></label><input type="text" id="ctOrg" maxlength="60" placeholder="Green Valley College"></div>' +
    '<div class="field"><label>Description <span style="color:var(--faint);font-weight:500">(optional)</span></label><textarea id="ctDesc" maxlength="240" placeholder="What does this crew do?"></textarea></div>' +
    '<div class="field"><label>Logo <span style="color:var(--faint);font-weight:500">(optional)</span></label><input type="file" id="ctLogo" accept="image/*"></div>' +
    '<div class="err" id="ctErr"></div>' +
    '<button class="btn btn-primary" style="width:100%" id="ctGo">Plant the flag 🚩</button>');
  $('#ctGo').addEventListener('click', createTeam);
}
async function createTeam() {
  const errEl = $('#ctErr');
  errEl.textContent = '';
  const name = $('#ctName').value.trim();
  const org = $('#ctOrg').value.trim();
  const desc = $('#ctDesc').value.trim();
  if (name.length < 3) { errEl.textContent = 'Team name needs at least 3 characters.'; return; }
  const f = $('#ctLogo').files[0];
  let logoBlob = null;
  if (f) { try { logoBlob = await compressImage(f, 512, .82); } catch (e) {} }
  const btn = $('#ctGo');
  btn.disabled = true; btn.textContent = 'Planting…';
  if (db && user && !guest) {
    try {
      const { data: team, error } = await db.from('teams').insert({ name, org, description: desc, created_by: user.id }).select().single();
      if (error) throw error;
      await db.from('team_members').insert({ team_id: team.id, user_id: user.id, role: 'owner' });
      if (logoBlob) {
        try {
          const url = await apiUpload('avatars', user.id + '/team-' + team.id + '.jpg', logoBlob);
          await db.from('teams').update({ logo_url: url }).eq('id', team.id);
        } catch (e) { /* logo is optional, team still stands */ }
      }
      closeModal();
      await loadMyTeams();
      confetti('#7DC852');
      toast('Team created — recruit away!', '🚩');
      openTeamDash(team.id);
      return;
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Plant the flag 🚩';
      if (e && e.code === '23505') { errEl.textContent = 'That team name is taken.'; return; }
      sbFail(e);
      errEl.textContent = 'Cloud save failed — re-run supabase-setup.sql (teams are new), then try again.';
      return;
    }
  }
  const t = { id: 'lt' + Date.now(), name, org, description: desc, logo: '', basePts: 0, owner: S.profile.username, members: [] };
  if (logoBlob) { try { t.logo = await blobToDataURL(logoBlob); } catch (e) {} }
  S.localTeams = S.localTeams || [];
  S.localTeams.unshift(t);
  S.myTeamIds = S.myTeamIds || [];
  S.myTeamIds.push(t.id);
  persist();
  closeModal();
  await loadMyTeams();
  confetti('#7DC852');
  toast('Team created (demo) — it lives in this browser', '🚩');
  renderTeamsScreen();
}

/* ------------------------------------------------------------
   9 · LEADERBOARD
------------------------------------------------------------ */
async function renderBoard(kind) {
  lbKind = kind || 'solo';
  $$('[data-lb]').forEach(c => c.setAttribute('aria-pressed', c.dataset.lb === lbKind));
  let rows = null;
  if (db && user && !guest) {
    try {
      if (lbKind === 'team') {
        const [tRes, aRes] = await Promise.all([
          db.from('teams').select('id, name, org'),
          db.from('actions').select('team_id, points').not('team_id', 'is', null).limit(2000),
        ]);
        if (tRes.error) throw tRes.error;
        if (aRes.error) throw aRes.error;
        if (tRes.data && tRes.data.length) {
          const sums = {};
          (aRes.data || []).forEach(a => { sums[a.team_id] = (sums[a.team_id] || 0) + (a.points || 0); });
          rows = tRes.data.map(t => ({ label: t.name, sub: t.org || 'Team grove', pts: sums[t.id] || 0, you: isMyTeam(t.id) }));
        }
      } else {
        const { data, error } = await db.from('profiles').select('id, username, college, points').order('points', { ascending: false }).limit(50);
        if (error) throw error;
        if (data && data.length) {
          rows = data.map(p => ({ label: '@' + p.username, sub: p.college || '—', pts: p.points || 0, you: p.id === user.id }));
          if (!rows.some(r => r.you)) rows.push({ label: '@' + S.profile.username, sub: S.profile.college || '—', pts: S.pts, you: true });
        }
      }
    } catch (e) { sbFail(e); }
  }
  if (!rows) {
    if (lbKind === 'team') {
      rows = demoAllTeams().map(t => {
        const sum = worldActions.filter(a => String(a.team_id || '') === String(t.id)).reduce((n, a) => n + (a.pts || 0), 0);
        return { label: t.name, sub: t.org || 'Team grove', pts: (t.basePts || 0) + sum, you: isMyTeam(t.id) };
      });
    } else {
      rows = [...DEMO_RIVALS.map(r => ({ label: '@' + r.n, sub: r.c, pts: r.p, you: false })), { label: '@' + S.profile.username, sub: S.profile.college || '—', pts: S.pts, you: true }];
    }
  }
  rows.sort((a, b) => b.pts - a.pts);
  rows = rows.slice(0, 12);
  const max = rows.length ? rows[0].pts || 1 : 1;
  $('#lbList').innerHTML = rows.map((r, i) =>
    '<div class="lb-row ' + (i === 0 ? 'top1' : '') + (r.you ? ' you-row' : '') + '"><div class="bar" style="width:' + Math.round(r.pts / max * 100) + '%"></div>' +
    '<div class="rank">' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1) + '</div>' +
    '<div style="min-width:0"><b>' + esc(r.label) + '</b>' + (r.you ? '<span class="you-tag">YOU</span>' : '') + '<br><small style="color:var(--soft)">' + esc(r.sub) + '</small></div>' +
    '<div class="pts">' + fmtInt(r.pts) + ' pts</div></div>'
  ).join('');
}

/* ------------------------------------------------------------
   10 · DONATE — multi-currency
------------------------------------------------------------ */
function nicePrice(v, cur) {
  if (ZERO_DEC.includes(cur)) {
    if (v < 100) return Math.max(10, Math.round(v / 10) * 10);
    if (v < 2000) return Math.round(v / 50) * 50;
    return Math.round(v / 100) * 100;
  }
  if (v < 2) return Math.max(.5, Math.round(v * 2) / 2);
  if (v < 10) return Math.max(1, Math.round(v));
  if (v < 100) return Math.round(v / 5) * 5;
  if (v < 1000) return Math.round(v / 10) * 10;
  return Math.round(v / 50) * 50;
}
const inrTo = (inr, cur) => nicePrice(inr * CURRENCIES[cur || CUR], cur || CUR);
const convInr = (inr, cur) => inr * CURRENCIES[cur || CUR];
function fmtCur(v, cur) {
  cur = cur || CUR;
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: v % 1 ? 2 : 0 }).format(v); }
  catch (e) { return cur + ' ' + v; }
}
async function initCurrency() {
  const saved = lsGet('gu-cur');
  if (saved && CURRENCIES[saved]) { CUR = saved; curAuto = ''; renderDonate(); return; }
  let cc = '', cur = '';
  try {
    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), 2600);
    const r = await fetch('https://ipapi.co/json/', { signal: ctl.signal });
    const j = await r.json();
    cc = j.country_code || '';
    if (j.currency && CURRENCIES[j.currency]) cur = j.currency;
  } catch (e) {}
  if (!cur) {
    if (!cc) cc = ((navigator.language || '').split('-')[1] || '');
    cur = COUNTRY_CUR[cc.toUpperCase()] || 'USD';
  }
  CUR = CURRENCIES[cur] ? cur : 'USD';
  curAuto = cc;
  renderDonate();
}
function setCurrency(c) {
  if (!CURRENCIES[c]) return;
  CUR = c; curAuto = '';
  lsSet('gu-cur', c);
  renderDonate();
}
function deriveDonStats() {
  let totalInr = 0, trees = 0, kits = 0;
  donations.forEach(d => {
    const rate = CURRENCIES[d.cur] || 1;
    const inr = d.amount / rate;
    totalInr += inr;
    if (inr >= 500) trees += 10; else if (inr >= 100) kits += 1; else trees += 1;
  });
  return { totalInr, trees, kits };
}
function renderDonate() {
  const sel = $('#curSelect');
  if (!sel) return;
  if (!sel.options.length) {
    sel.innerHTML = Object.keys(CURRENCIES).map(c => '<option value="' + c + '">' + c + '</option>').join('');
    sel.addEventListener('change', () => setCurrency(sel.value));
  }
  sel.value = CUR;
  $('#curNote').textContent = curAuto ? 'auto-detected from your location (' + curAuto + ') — change anytime' : 'prices adapt to your currency';
  $$('#tierGrid .tier').forEach(t => {
    const amt = inrTo(+t.dataset.inr);
    t.querySelector('.amt').innerHTML = fmtCur(amt) + (t.dataset.monthly ? '<span class="permo">/mo</span>' : '');
  });
  const d = deriveDonStats();
  $('#dnRaised').textContent = fmtCur(Math.round(convInr(d.totalInr)));
  setBig('dnTrees', d.trees);
  setBig('dnKits', d.kits);
  $('#donorWall').innerHTML = donations.slice(0, 12).map(x => '<span class="leaf-tag">🌱 ' + esc(x.name) + ' · ' + fmtCur(x.amount, x.cur) + '</span>').join('') || '<p style="color:var(--soft)">Be the first leaf on this wall.</p>';
  renderDonorBoard();
}
let dnPeriod = 'all';
function renderDonorBoard() {
  const list = $('#dnLbList');
  if (!list) return;
  const cut = dnPeriod === 'week' ? Date.now() - 7 * DAY : dnPeriod === 'month' ? Date.now() - 30 * DAY : 0;
  const agg = {};
  donations.forEach(d => {
    if ((d.ts || 0) < cut) return;
    const key = d.uid ? 'u:' + d.uid : 'n:' + (d.name || 'Anonymous').toLowerCase();
    if (!agg[key]) agg[key] = { name: d.name || 'Anonymous', uid: d.uid || '', inr: 0, n: 0 };
    agg[key].inr += d.amount / (CURRENCIES[d.cur] || 1);
    agg[key].n++;
  });
  const rows = Object.values(agg).sort((a, b) => b.inr - a.inr).slice(0, 8);
  const max = rows.length ? rows[0].inr || 1 : 1;
  list.innerHTML = rows.map((r, i) =>
    '<div class="dnlb-row"><div class="bar" style="width:' + Math.round(r.inr / max * 100) + '%"></div>' +
    '<div class="rank">' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1) + '</div>' +
    '<div style="min-width:0"><b>' + esc(r.name) + '</b>' + (user && !guest && r.uid === user.id ? '<span class="you-tag">YOU</span>' : '') + '<br><small>' + r.n + ' gift' + (r.n === 1 ? '' : 's') + '</small></div>' +
    '<div class="amt">' + fmtCur(Math.round(convInr(r.inr))) + '</div></div>'
  ).join('') || '<p class="empty-note">No gifts in this window yet — be the trendsetter.</p>';
}
function openDonate() {
  const amt = inrTo(pickedInr);
  openModal('<button class="x" data-close>✕</button><h3>💛 Confirm your gift</h3>' +
    '<p style="color:var(--soft);margin-bottom:1rem">' + (pickedMonthly ? 'Monthly' : 'One-time') + ' · simulated checkout, no card needed.</p>' +
    '<div class="field"><label>Amount (' + CUR + ')</label><input type="number" id="dnAmt" min="0" step="0.5" value="' + amt + '"></div>' +
    '<div class="field"><label>Name on the Wall of Impact</label><input type="text" id="dnName" maxlength="40" placeholder="Your name (or Anonymous)"></div>' +
    '<button class="btn btn-gold" style="width:100%" id="dnPayBtn">Give ' + fmtCur(amt) + ' →</button>');
  const amtEl = $('#dnAmt');
  amtEl.addEventListener('input', () => { $('#dnPayBtn').textContent = 'Give ' + fmtCur(+amtEl.value || 0) + ' →'; });
  $('#dnPayBtn').addEventListener('click', confirmDonate);
}
async function confirmDonate() {
  const amount = Math.max(0, +$('#dnAmt').value || 0);
  if (!amount) { toast('Pick an amount first', '💛'); return; }
  const name = ($('#dnName').value || '').trim() || 'Anonymous';
  const entry = { name, amount, cur: CUR, ts: Date.now(), uid: (user && !guest) ? user.id : '' };
  if (db && user && !guest) {
    try {
      const { error } = await db.from('donations').insert({ user_id: user.id, donor_name: name, amount, currency: CUR });
      if (error) throw error;
    } catch (e) { sbFail(e); }
  } else {
    S.donationsLocal = S.donationsLocal || [];
    S.donationsLocal.unshift(entry);
  }
  donations.unshift(entry);
  S.donatedCount = (S.donatedCount || 0) + 1;
  persist();
  closeModal();
  renderDonate();
  renderBadges();
  confetti('#FFCB3D');
  toast('Thank you, ' + name + '! Your gift is on the dashboard.', '🌻');
}

/* ------------------------------------------------------------
   11 · QUIZ
------------------------------------------------------------ */
const dayN = () => Math.floor(Date.now() / DAY);
function renderQuiz() {
  const qWrap = $('#quizOpts');
  if (!qWrap) return;
  const q = QUIZ[dayN() % QUIZ.length];
  $('#quizDay').textContent = 'quiz #' + (dayN() % QUIZ.length + 1) + ' of ' + QUIZ.length + ' · a fresh one every midnight';
  $('#quizQ').textContent = q.q;
  const done = S.quizDoneDay === dayN();
  qWrap.innerHTML = q.o.map((o, i) => '<button class="quiz-opt' + (done && i === q.a ? ' correct' : '') + '" data-i="' + i + '"' + (done ? ' disabled' : '') + '>' + esc(o) + '</button>').join('');
  $('#quizMsg').textContent = done ? 'Done for today — come back after midnight 🌅' : '';
}
function answerQuiz(i, btn) {
  if (S.quizDoneDay === dayN()) return;
  const q = QUIZ[dayN() % QUIZ.length];
  $$('.quiz-opt').forEach(b => b.disabled = true);
  S.quizDoneDay = dayN();
  if (i === q.a) {
    btn.classList.add('correct');
    addPoints(5);
    S.quizWins++;
    $('#quizMsg').innerHTML = '✅ Correct! <b class="pts-flash">+5 pts</b>';
    confetti('#7DC852');
  } else {
    btn.classList.add('wrong');
    const opts = $$('.quiz-opt');
    if (opts[q.a]) opts[q.a].classList.add('correct');
    $('#quizMsg').textContent = 'Almost — the green one is right.';
  }
  persist();
  setTimeout(renderAll, 1700);
}

/* ------------------------------------------------------------
   12 · PROFILE
------------------------------------------------------------ */
function renderProfile() {
  const p = S.profile;
  $('#pfAvatarWrap').innerHTML = avatarHtml(p.username, p.avatar_url);
  $('#pfName').textContent = p.full_name || p.username || '—';
  $('#pfHandle').textContent = '@' + (p.username || '—');
  $('#pfUsername').value = p.username || '';
  $('#pfFullname').value = p.full_name || '';
  $('#pfCollege').value = p.college || '';
  $('#pfCountry').value = p.country || '';
  $('#pfBio').value = p.bio || '';
  $('#pfEmail').value = p.email || '';
  $('#pfErr').textContent = '';
  $('#pfGuestNote').style.display = guest ? 'block' : 'none';
  $('#signOutBtn').textContent = guest ? 'Exit demo' : 'Sign out';
  $('#pfJoined').textContent = p.created_at ? 'growing since ' + new Date(p.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '';
  const unlocked = BADGES.filter(b => b.test(S)).length;
  $('#pfStats').innerHTML =
    '<span class="pstat">🌳 <b>' + S.trees + '</b> trees</span>' +
    '<span class="pstat">🧹 <b>' + S.cleans + '</b> clean-ups</span>' +
    '<span class="pstat">♻️ <b>' + Math.round(S.waste) + '</b> kg</span>' +
    '<span class="pstat">✨ <b>' + fmtInt(S.pts) + '</b> pts</span>' +
    '<span class="pstat">🔥 <b>' + S.streak + '</b> streak</span>' +
    '<span class="pstat">🏅 <b>' + unlocked + '/' + BADGES.length + '</b> badges</span>';
}
async function saveProfile() {
  const errEl = $('#pfErr');
  errEl.textContent = '';
  const username = $('#pfUsername').value.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(username)) { errEl.textContent = 'Username: 3–24 chars, letters/numbers/underscores only.'; return; }
  const patch = {
    username,
    full_name: $('#pfFullname').value.trim(),
    college: $('#pfCollege').value.trim(),
    country: $('#pfCountry').value.trim(),
    bio: $('#pfBio').value.trim(),
  };
  if (db && user && !guest) {
    const btn = $('#pfSaveBtn');
    btn.disabled = true;
    try {
      const { error } = await db.from('profiles').update(patch).eq('id', user.id);
      if (error) throw error;
    } catch (e) {
      btn.disabled = false;
      if (e && e.code === '23505') { errEl.textContent = 'That username is taken — try another.'; return; }
      sbFail(e);
      errEl.textContent = 'Could not save to the cloud (saved locally).';
    }
    btn.disabled = false;
  }
  Object.assign(S.profile, patch);
  persist();
  renderProfile();
  renderAll();
  toast('Profile saved', '🌿');
}
async function handleAvatar(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  try {
    const blob = await compressImage(f, 512, .82);
    if (db && user && !guest) {
      toast('Uploading avatar…', '☁️');
      const url = await apiUpload('avatars', user.id + '/avatar.jpg', blob);
      const busted = url + '?v=' + Date.now();
      await db.from('profiles').update({ avatar_url: busted }).eq('id', user.id);
      S.profile.avatar_url = busted;
    } else {
      S.profile.avatar_url = await blobToDataURL(blob);
    }
    persist();
    renderProfile();
    renderAll();
    toast('Looking sharp', '🌻');
  } catch (e) { sbFail(e); toast('Avatar upload failed', '⚠️'); }
  input.value = '';
}

/* ------------------------------------------------------------
   13 · AUTH
------------------------------------------------------------ */
function authOpen(tab) { showView('auth'); authTab(tab || 'in'); }
function authTab(t) {
  $('#tabIn').classList.toggle('on', t === 'in');
  $('#tabUp').classList.toggle('on', t === 'up');
  $('#formIn').style.display = t === 'in' ? 'block' : 'none';
  $('#formUp').style.display = t === 'up' ? 'block' : 'none';
  $('#authTitle').textContent = t === 'in' ? 'Welcome back' : 'Join the grove';
  $('#authSub').textContent = t === 'in' ? 'The soil missed you.' : 'Free forever. Takes about 40 seconds.';
  $('#confirmPanel').hidden = true;
  $('#authForms').style.display = 'block';
}
function friendlyAuthErr(e) {
  const m = (e && e.message) || 'Something went wrong';
  if (/invalid login credentials/i.test(m)) return 'Wrong email or password.';
  if (/email not confirmed/i.test(m)) return 'Email not confirmed yet — check your inbox.';
  if (/rate limit/i.test(m)) return 'Too many tries — give it a minute.';
  return m;
}
async function doSignIn(e) {
  e.preventDefault();
  const errEl = $('#inErr');
  errEl.textContent = '';
  if (!db) { errEl.textContent = 'Supabase SDK failed to load — check your connection.'; return; }
  const email = $('#inEmail').value.trim(), pw = $('#inPw').value;
  if (!email || !pw) { errEl.textContent = 'Email and password, both.'; return; }
  const btn = $('#btnIn');
  btn.disabled = true; btn.textContent = 'Signing in…';
  const { error } = await db.auth.signInWithPassword({ email, password: pw });
  btn.disabled = false; btn.textContent = 'Sign in →';
  if (error) errEl.textContent = friendlyAuthErr(error);
}
async function doSignUp(e) {
  e.preventDefault();
  const errEl = $('#upErr');
  errEl.textContent = '';
  if (!db) { errEl.textContent = 'Supabase SDK failed to load — check your connection.'; return; }
  const username = $('#upUser').value.trim().toLowerCase();
  const email = $('#upEmail').value.trim();
  const pw = $('#upPw').value;
  const college = $('#upCollege').value.trim();
  if (!/^[a-z0-9_]{3,24}$/.test(username)) { errEl.textContent = 'Username: 3–24 chars, letters/numbers/underscores.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { errEl.textContent = 'That email looks off.'; return; }
  if (pw.length < 6) { errEl.textContent = 'Password needs at least 6 characters.'; return; }
  const btn = $('#btnUp');
  btn.disabled = true; btn.textContent = 'Planting…';
  try {
    const { data: taken, error: qErr } = await db.from('profiles').select('id').eq('username', username).maybeSingle();
    if (!qErr && taken) { errEl.textContent = 'That username is taken — try another.'; btn.disabled = false; btn.textContent = 'Plant my account 🌱'; return; }
  } catch (e2) { /* table may not exist yet — the unique constraint will catch it later */ }
  const { data, error } = await db.auth.signUp({ email, password: pw, options: { data: { username, college } } });
  btn.disabled = false; btn.textContent = 'Plant my account 🌱';
  if (error) { errEl.textContent = friendlyAuthErr(error); return; }
  if (!data.session) {
    $('#authForms').style.display = 'none';
    $('#confirmPanel').hidden = false;
    $('#confirmEmail').textContent = email;
  }
}
async function doGoogle() {
  if (!db) { toast('Supabase SDK failed to load', '⚠️'); return; }
  if (location.protocol === 'file:') { toast('Google sign-in needs the app served over http(s) — see the README', '🌐'); return; }
  const { error } = await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
  if (error) toast('Google sign-in failed: ' + error.message, '⚠️');
}
async function doForgot(e) {
  e.preventDefault();
  const email = $('#inEmail').value.trim();
  if (!email) { $('#inErr').textContent = 'Type your email above first, then hit Forgot.'; return; }
  try {
    await db.auth.resetPasswordForEmail(email, { redirectTo: location.protocol === 'file:' ? undefined : location.origin + location.pathname });
    toast('Reset link sent to ' + email, '📬');
  } catch (e2) { toast('Could not send reset link', '⚠️'); }
}
async function doSignOut() {
  if (db && user) { try { await db.auth.signOut(); } catch (e) {} }
  currentUid = null; user = null; guest = false;
  S = demoState();
  myTeams = [];
  showView('landing');
  toast('Signed out — the trees will wait', '👋');
}

function stateFromProfile(p) {
  const st = demoState();
  // a real account starts from its own numbers, not the demo's
  st.pts = 0; st.trees = 0; st.cleans = 0; st.waste = 0; st.streak = 0; st.lastActionOn = ''; st.quizWins = 0; st.actions = [];
  if (p) {
    st.pts = p.points || 0; st.trees = p.trees || 0; st.cleans = p.cleanups || 0;
    st.waste = +p.waste_kg || 0; st.streak = p.streak || 0; st.lastActionOn = p.last_action_on || '';
    st.quizWins = p.quiz_wins || 0;
    st.profile = {
      username: p.username || 'gardener', full_name: p.full_name || '', college: p.college || '',
      country: p.country || '', bio: p.bio || '', avatar_url: p.avatar_url || '',
      email: (user && user.email) || '', created_at: p.created_at || new Date().toISOString(),
    };
  } else {
    const meta = (user && user.user_metadata) || {};
    st.profile = {
      username: (meta.username || (user.email || 'gardener').split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'gardener',
      full_name: meta.full_name || meta.name || '', college: meta.college || '', country: '', bio: '',
      avatar_url: meta.avatar_url || meta.picture || '', email: (user && user.email) || '', created_at: new Date().toISOString(),
    };
  }
  return st;
}
async function enterSession(session) {
  if (!session || !session.user) return;
  if (currentUid === session.user.id && !guest) return;
  user = session.user;
  currentUid = user.id;
  guest = false;
  let p = await apiGetProfile(user.id);
  if (!p) p = await apiCreateProfile(user.id);
  S = stateFromProfile(p);
  const qz = lsGet('gu-quiz-' + user.id);
  if (qz) S.quizDoneDay = qz.quizDoneDay || 0;
  S.actions = await apiMyActions();
  apiDonatedCount();
  await loadMyTeams();
  showView('app');
  renderAll();
  loadWorld();
  loadDonations();
}
function enterDemo() {
  guest = true; user = null; currentUid = null;
  const saved = lsGet('greenup-demo');
  S = saved && saved.profile ? Object.assign(demoState(), saved) : demoState();
  loadMyTeams();
  showView('app');
  renderAll();
  if (!worldActions.length) loadWorld(); else renderWorld();
  loadDonations();
  toast('Demo grove — everything works, nothing leaves this browser', '🌼');
}

/* ------------------------------------------------------------
   14 · LANDING FLOURISHES
------------------------------------------------------------ */
function buildTicker() {
  const items = '<span>🌳 <b>5,000+</b> trees target · year one</span><span>🧑‍🎓 <b>1,000+</b> students joining</span><span>💨 <b>~20 t</b> CO₂ offset goal</span><span>🏫 <b>10+</b> partner campuses</span><span>🎯 <b>1,000,000</b> student-planted trees by 2030</span><span>📍 photo + GPS + timestamp = proof</span>';
  $('#tickerTrack').innerHTML = items + items;
}
function countUp(el) {
  const to = +el.dataset.to || 0;
  if (prefersReduced) { el.textContent = fmtInt(to); return; }
  const t0 = performance.now(), dur = 1400;
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmtInt(Math.round(to * e));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function initObservers() {
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  const ioc = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { countUp(x.target); ioc.unobserve(x.target); } }), { threshold: .4 });
  $$('.count').forEach(el => ioc.observe(el));
}

/* ------------------------------------------------------------
   15 · BOOT
------------------------------------------------------------ */
function wire() {
  // theme
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => applyTheme(isDark() ? 'light' : 'dark')));
  // landing
  $$('[data-auth-open]').forEach(b => b.addEventListener('click', () => authOpen(b.dataset.authOpen)));
  $('#demoBtn').addEventListener('click', enterDemo);
  $('#landDonateBtn').addEventListener('click', () => { enterDemo(); go('donate'); });
  window.addEventListener('scroll', () => $('#landNav').classList.toggle('scrolled', window.scrollY > 8), { passive: true });
  // auth
  $('#tabIn').addEventListener('click', () => authTab('in'));
  $('#tabUp').addEventListener('click', () => authTab('up'));
  $('#formIn').addEventListener('submit', doSignIn);
  $('#formUp').addEventListener('submit', doSignUp);
  $('#googleBtn').addEventListener('click', doGoogle);
  $('#guestBtn').addEventListener('click', enterDemo);
  $('#forgotBtn').addEventListener('click', doForgot);
  $('#authLogoBtn').addEventListener('click', () => showView('landing'));
  $('#confirmedBtn').addEventListener('click', () => { authTab('in'); $('#inEmail').value = $('#confirmEmail').textContent; });
  $('#confirmBackBtn').addEventListener('click', () => authTab('up'));
  // shell
  $$('[data-screen]').forEach(b => b.addEventListener('click', () => go(b.dataset.screen)));
  $('#menuBtn').addEventListener('click', () => { $('#side').classList.toggle('open'); $('#scrim').classList.toggle('show'); });
  $('#scrim').addEventListener('click', closeSide);
  let logoTaps = 0;
  $('#side').querySelector('.logo').addEventListener('click', () => {
    if (++logoTaps === 7) { logoTaps = 0; confetti('#7DC852'); toast('You found the hidden grove. Tell no one.', '🌳'); }
  });
  // log
  $('#modeTree').addEventListener('click', () => setMode('tree'));
  $('#modeClean').addEventListener('click', () => setMode('cleanup'));
  wireDrop('dropBefore', 'photoBefore', 'before', 'dropBeforeInner');
  wireDrop('dropAfter', 'photoAfter', 'after', 'dropAfterInner');
  $('#teamSelect').addEventListener('change', () => {
    const v = $('#teamSelect').value;
    if (guest) { S.defaultTeamId = v; persist(); }
    else if (user) lsSet('gu-team-' + user.id, v);
    updPv();
  });
  $('#gpsBtn').addEventListener('click', detectGPS);
  $('#submitBtn').addEventListener('click', submitAction);
  initCombo();
  $('#wasteChips').addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (c) c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true');
  });
  const kgR = $('#kgRange'), kgN = $('#kgNum');
  kgR.addEventListener('input', () => { kgN.value = kgR.value; });
  kgN.addEventListener('input', () => { kgR.value = Math.min(200, Math.max(1, +kgN.value || 1)); });
  // before/after sliders (delegated — they're created dynamically)
  document.addEventListener('input', e => {
    if (e.target.classList && e.target.classList.contains('ba-range')) {
      const w = e.target.closest('.ba');
      if (w) w.style.setProperty('--x', e.target.value + '%');
    }
  });
  // map
  $$('[data-filter]').forEach(c => c.addEventListener('click', () => {
    mapFilter = c.dataset.filter;
    $$('[data-filter]').forEach(x => x.setAttribute('aria-pressed', x === c));
    refreshMarkers();
  }));
  $('#nearBtn').addEventListener('click', nearMe);
  $('#galleryGrid').addEventListener('click', e => {
    const card = e.target.closest('.ga-card');
    if (!card) return;
    const a = worldActions.find(x => String(x.id) === card.dataset.aid);
    if (a) openActionModal(a);
  });
  // board
  $$('[data-lb]').forEach(c => c.addEventListener('click', () => renderBoard(c.dataset.lb)));
  // donate
  $('#tierGrid').addEventListener('click', e => {
    const t = e.target.closest('.tier');
    if (!t) return;
    $$('#tierGrid .tier').forEach(x => x.classList.remove('selected'));
    t.classList.add('selected');
    pickedInr = +t.dataset.inr;
    pickedMonthly = !!t.dataset.monthly;
  });
  $('#donateBtn').addEventListener('click', openDonate);
  $('#dnLbTabs').addEventListener('click', e => {
    const c = e.target.closest('[data-dnp]');
    if (!c) return;
    dnPeriod = c.dataset.dnp;
    $$('#dnLbTabs [data-dnp]').forEach(x => x.setAttribute('aria-pressed', x === c));
    renderDonorBoard();
  });
  // teams
  $('#createTeamBtn').addEventListener('click', openCreateTeam);
  let teamSearchTimer;
  $('#teamSearch').addEventListener('input', () => {
    clearTimeout(teamSearchTimer);
    teamSearchTimer = setTimeout(renderTeamsScreen, 280);
  });
  $('#screen-team').addEventListener('click', e => {
    const card = e.target.closest('.team-card');
    if (!card) return;
    const id = card.dataset.team;
    if (isMyTeam(id)) openTeamDash(id); else openTeamPreview(id);
  });
  // quiz
  $('#quizOpts').addEventListener('click', e => {
    const b = e.target.closest('.quiz-opt');
    if (b && !b.disabled) answerQuiz(+b.dataset.i, b);
  });
  // profile
  $('#pfSaveBtn').addEventListener('click', saveProfile);
  $('#signOutBtn').addEventListener('click', doSignOut);
  $('#pfAvatarInput').addEventListener('change', e => handleAvatar(e.target));
  // modal
  $('#modalBack').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  // routing
  window.addEventListener('hashchange', () => {
    if (suppressHash) { suppressHash = false; return; }
    const m = location.hash.match(/^#\/(\w+)/);
    if (m && $('#app').style.display !== 'none') go(m[1], false);
  });
}

async function boot() {
  applyTheme(lsGet('gu-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  buildTicker();
  initObservers();
  $('#baDemo').innerHTML = baInner(PH_BEFORE, PH_AFTER, false); // demo sweeps the clean over the mess
  wire();
  setMode('tree');
  updPv();
  sbInit();
  initCurrency();

  let session = null;
  if (db) {
    try { const { data } = await db.auth.getSession(); session = data.session; } catch (e) {}
    db.auth.onAuthStateChange((ev, s) => {
      if (ev === 'SIGNED_IN' && s && s.user) enterSession(s);
      if (ev === 'SIGNED_OUT' && !user) { /* already handled by doSignOut */ }
    });
  }
  if (session) await enterSession(session);
  else showView('landing');

  loadWorld();
  subscribeWorld();
  loadDonations();
  $('#splash').classList.add('done');
  setTimeout(() => { const sp = $('#splash'); if (sp) sp.remove(); }, 600);
  console.log('%c🌱 GreenUp', 'font-size:16px;font-weight:bold;color:#2F7D45', '— plant. clean. grow.');
}

document.addEventListener('DOMContentLoaded', boot);
})();
