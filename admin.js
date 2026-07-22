/* ============================================================
   GreenUp · admin.js — role-gated admin console (RBAC)
   Separate from the main app; regular users never load this.
   All privileged writes are ALSO enforced by Supabase RLS, so
   the client checks below are UX, not the security boundary.
   ============================================================ */
(function () {
'use strict';

const SUPABASE_URL = 'https://yosewbyorrtwjycbhhwq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UKVDIh533AZBaFWUhnwlzA_rHW54MNt';
const PAGE = 20;
const DAY = 86400000;

/* ---- tiny utils ---- */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtInt = n => (+n || 0).toLocaleString();
const hashNum = s => { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60e3) return 'just now';
  const m = Math.floor(d / 60e3); if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  const days = Math.floor(h / 24); if (days < 30) return days + 'd ago';
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDate(ts) { return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function avatarHtml(name, url) {
  if (url) return '<img class="av" src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\'">';
  const h = hashNum(name || '?') % 360;
  return '<span class="av" style="background:hsl(' + h + ',42%,80%);color:hsl(' + h + ',45%,24%)">' + esc((name || '?')[0].toUpperCase()) + '</span>';
}
function toast(msg, emoji) {
  const stack = $('#toastStack');
  const t = document.createElement('div'); t.className = 'toast';
  t.textContent = (emoji ? emoji + ' ' : '') + msg;
  stack.appendChild(t);
  while (stack.children.length > 3) stack.firstChild.remove();
  setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 320); }, 3200);
}
function openModal(html) { const c = $('#modalCard'); c.className = 'card modal'; c.innerHTML = html; $('#modalBack').classList.add('show'); }
function closeModal() { $('#modalBack').classList.remove('show'); }
function applyTheme(t) {
  if (t === 'dark') document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('gu-theme', JSON.stringify(t)); } catch (e) {}
  document.querySelectorAll('[data-theme-toggle]').forEach(b => b.textContent = t === 'dark' ? '☀️' : '🌙');
}
const isDark = () => document.documentElement.dataset.theme === 'dark';

/* ---- RBAC ---- */
const PERMS = {
  super_admin: ['overview', 'queue', 'users', 'donations', 'campaigns', 'audit', 'roles', 'settings', 'approve', 'reject', 'delete', 'ban', 'manage_donations', 'manage_campaigns', 'manage_roles', 'system'],
  admin:       ['overview', 'queue', 'users', 'donations', 'campaigns', 'audit', 'approve', 'reject', 'ban', 'manage_donations', 'manage_campaigns'],
  moderator:   ['overview', 'queue', 'audit', 'approve', 'reject', 'flag'],
};
const ROLE_RANK = { moderator: 1, admin: 2, super_admin: 3 };
let db = null, session = null, me = null, myRoles = [], myPerms = new Set();
const can = p => myPerms.has(p);
const topRole = () => [...myRoles].sort((a, b) => (ROLE_RANK[b] || 0) - (ROLE_RANK[a] || 0))[0] || null;

/* ---- boot / gate ---- */
let authReady = false; // ignore the auth event burst that fires during initial load
function withTimeout(p, ms, label) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error((label || 'request') + ' timed out')), ms))]);
}
async function init() {
  applyTheme((() => { try { const t = localStorage.getItem('gu-theme'); return t ? JSON.parse(t) : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) { return 'light'; } })());
  document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => applyTheme(isDark() ? 'light' : 'dark')));
  $('#modalBack').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // hard safety net — the splash must never spin forever
  const splashGuard = setTimeout(() => {
    if ($('#adminSplash').style.display !== 'none') { authReady = true; showGate(gateError('This is taking longer than expected — check your connection and reload.')); }
  }, 12000);

  if (!window.supabase) { clearTimeout(splashGuard); showGate(gateError('The Supabase SDK failed to load — check your connection.')); return; }
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  // only react to genuine post-load auth changes; reload on SIGNED_IN only while
  // the gate is up (i.e. someone just signed in) so we never loop on the initial
  // event some supabase-js versions re-emit for an existing session.
  db.auth.onAuthStateChange((ev) => {
    if (!authReady) return;
    if (ev === 'SIGNED_OUT') { location.reload(); return; }
    if (ev === 'SIGNED_IN' && $('#shell').style.display === 'none') location.reload();
  });

  try {
    try { const { data } = await withTimeout(db.auth.getSession(), 8000, 'session'); session = data.session; }
    catch (e) { session = null; }
    if (!session || !session.user) { clearTimeout(splashGuard); authReady = true; showGate(gateSignIn()); return; }

    // load my profile + roles (wrapped — a hiccup here must not hang the splash)
    const [pRes, rRes] = await withTimeout(Promise.all([
      db.from('profiles').select('id, username, avatar_url').eq('id', session.user.id).maybeSingle(),
      db.from('user_roles').select('role').eq('user_id', session.user.id),
    ]), 12000, 'profile & roles');
    if (rRes && rRes.error) throw rRes.error;
    me = (pRes && pRes.data) || { id: session.user.id, username: (session.user.email || 'you').split('@')[0], avatar_url: '' };
    myRoles = ((rRes && rRes.data) || []).map(r => r.role);
    myPerms = new Set(myRoles.flatMap(r => PERMS[r] || []));

    clearTimeout(splashGuard);
    if (!myRoles.length) { authReady = true; showGate(gateDenied()); return; }

    $('#adminSplash').style.display = 'none';
    $('#gate').style.display = 'none';
    $('#shell').style.display = 'block';
    renderChrome();
    wireChrome();
    route();
    refreshBell();
    subscribeNew();
    authReady = true;
  } catch (e) {
    clearTimeout(splashGuard);
    authReady = true;
    showGate(gateError('Could not load the console: ' + ((e && e.message) || 'unknown error') + '. Reload to retry.'));
  }
}
function showGate(html) {
  $('#adminSplash').style.display = 'none';
  $('#shell').style.display = 'none';
  const g = $('#gate'); g.style.display = 'grid'; g.innerHTML = html;
  const f = $('#gateForm');
  if (f) f.addEventListener('submit', doSignIn);
  const g2 = $('#gateGoogle'); if (g2) g2.addEventListener('click', doGoogle);
  const so = $('#gateSignOut'); if (so) so.addEventListener('click', async () => { await db.auth.signOut(); location.reload(); });
}
function gateCard(inner) { return '<div class="card" style="max-width:420px;width:100%;padding:2rem"><div class="logo" style="font-family:var(--font-d);font-weight:800;font-size:1.3rem;display:flex;gap:.5rem;align-items:center;margin-bottom:1rem"><svg viewBox="0 0 24 24" width="26" fill="none"><path d="M12 22V10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 12C12 7 8 4 3 4c0 5 4 8 9 8Z" fill="#2F7D45"/><path d="M12 9c0-4 3-6 8-6 0 4-3 6-8 6Z" fill="#7DC852"/></svg>GreenUp Admin</div>' + inner + '</div>'; }
function gateSignIn() {
  return gateCard('<h2 style="font-family:var(--font-d);font-size:1.4rem">Staff sign-in</h2><p style="color:var(--soft);margin:.3rem 0 1.1rem;font-size:.9rem">This console is for GreenUp admins & moderators.</p>' +
    '<form id="gateForm"><div class="field"><label>Email</label><input type="email" id="gEmail" autocomplete="email" placeholder="you@campus.edu"></div>' +
    '<div class="field"><label>Password</label><input type="password" id="gPw" autocomplete="current-password" placeholder="••••••••"></div>' +
    '<div class="err" id="gErr"></div><button class="btn btn-primary" style="width:100%" type="submit">Sign in →</button></form>' +
    '<div class="or-row" style="text-align:center;color:var(--faint);margin:.8rem 0">or</div>' +
    '<button class="btn btn-soft" style="width:100%" id="gateGoogle">Continue with Google</button>' +
    '<a class="guest-link" href="index.html" style="display:block;text-align:center;margin-top:1rem;color:var(--soft)">← back to the app</a>');
}
function gateDenied() {
  return gateCard('<span style="font-size:2rem">🚫</span><h2 style="font-family:var(--font-d);font-size:1.4rem;margin-top:.4rem">No admin access</h2><p style="color:var(--soft);margin:.4rem 0 1.2rem;font-size:.92rem">You\'re signed in as <b>@' + esc(me.username) + '</b>, but you don\'t have a staff role. Ask a super admin to grant you one.</p><button class="btn btn-ghost" id="gateSignOut" style="width:100%">Sign out</button><a class="guest-link" href="index.html" style="display:block;text-align:center;margin-top:.8rem;color:var(--soft)">← back to the app</a>'); }
function gateError(msg) { return gateCard('<span style="font-size:2rem">⚠️</span><h2 style="font-family:var(--font-d);font-size:1.3rem;margin-top:.4rem">Something went wrong</h2><p style="color:var(--soft);margin-top:.4rem">' + esc(msg) + '</p>'); }
async function doSignIn(e) {
  e.preventDefault();
  const err = $('#gErr'); err.textContent = '';
  const email = $('#gEmail').value.trim(), pw = $('#gPw').value;
  if (!email || !pw) { err.textContent = 'Email and password, both.'; return; }
  const { error } = await db.auth.signInWithPassword({ email, password: pw });
  if (error) err.textContent = /invalid login/i.test(error.message) ? 'Wrong email or password.' : error.message;
}
async function doGoogle() { await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } }); }

/* ---- chrome (top bar + sidebar) ---- */
const NAV = [
  { id: 'overview', label: 'Overview', icon: '📊', perm: 'overview' },
  { id: 'queue', label: 'Verification', icon: '✅', perm: 'queue', badge: true },
  { id: 'users', label: 'Users', icon: '👥', perm: 'users' },
  { id: 'donations', label: 'Donations', icon: '💛', perm: 'donations' },
  { id: 'campaigns', label: 'Campaigns', icon: '🎯', perm: 'campaigns' },
  { id: 'audit', label: 'Audit log', icon: '📜', perm: 'audit' },
  { id: 'roles', label: 'Admins & roles', icon: '🛡️', perm: 'roles' },
  { id: 'settings', label: 'Settings', icon: '⚙️', perm: 'settings' },
];
function renderChrome() {
  $('#meAvatar').innerHTML = avatarHtml(me.username, me.avatar_url);
  $('#meName').textContent = '@' + me.username;
  const r = topRole();
  $('#meRole').innerHTML = myRoles.map(x => '<span class="role-badge rb-' + x + '">' + x.replace('_', ' ') + '</span>').join(' ');
  $('#aNav').innerHTML = NAV.filter(n => can(n.perm)).map(n =>
    '<button class="a-nav" data-nav="' + n.id + '"><span class="ni">' + n.icon + '</span>' + n.label + (n.badge ? '<span class="nb" id="navBadge" style="display:none">0</span>' : '') + '</button>'
  ).join('');
}
function wireChrome() {
  $('#aNav').addEventListener('click', e => { const b = e.target.closest('[data-nav]'); if (b) { location.hash = '#/' + b.dataset.nav; $('#side').classList.remove('open'); } });
  $('#menuToggle').addEventListener('click', () => $('#side').classList.toggle('open'));
  $('#signOutBtn').addEventListener('click', async () => { await db.auth.signOut(); location.reload(); });
  $('#bellBtn').addEventListener('click', toggleNotif);
  window.addEventListener('hashchange', route);
}
function setActiveNav(id) { document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === id)); }

/* ---- router ---- */
function route() {
  const m = (location.hash.match(/^#\/(\w+)/) || [])[1];
  let id = m && NAV.some(n => n.id === m && can(n.perm)) ? m : (NAV.find(n => can(n.perm)) || {}).id;
  if (!id) return;
  setActiveNav(id);
  const v = $('#view'); v.scrollTop = 0;
  ({ overview: viewOverview, queue: viewQueue, users: viewUsers, donations: viewDonations, campaigns: viewCampaigns, audit: viewAudit, roles: viewRoles, settings: viewSettings }[id] || viewOverview)();
}
function head(title, sub, right) {
  return '<div class="a-head"><div><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div>' + (right || '') + '</div>';
}
function empty(emoji, msg) { return '<div class="a-empty"><span class="e-emoji">' + emoji + '</span>' + esc(msg) + '</div>'; }
function loadingRows() { return '<div class="a-empty"><span class="e-emoji">🌿</span>loading…</div>'; }

/* ---- audit helper ---- */
async function audit(action, entity, entity_id, meta) {
  try { await db.from('audit_log').insert({ actor: me.id, actor_name: me.username || '', action, entity, entity_id: String(entity_id == null ? '' : entity_id), meta: meta || {} }); }
  catch (e) { /* audit is best-effort */ }
}

/* ---- notifications (needs-review count + realtime) ---- */
async function countNeedsReview() {
  try {
    const { count } = await db.from('actions').select('id', { count: 'exact', head: true }).is('reviewed_at', null).neq('status', 'draft').neq('status', 'rejected');
    return count || 0;
  } catch (e) { return 0; }
}
async function refreshBell() {
  const n = await countNeedsReview();
  const dot = $('#bellDot'), nb = $('#navBadge');
  if (dot) { dot.style.display = n ? 'inline-block' : 'none'; dot.textContent = n > 99 ? '99+' : n; }
  if (nb) { nb.style.display = n ? 'inline-block' : 'none'; nb.textContent = n > 99 ? '99+' : n; }
}
async function toggleNotif() {
  const pop = $('#notifPop');
  if (pop.style.display === 'block') { pop.style.display = 'none'; return; }
  pop.style.display = 'block';
  pop.innerHTML = '<b style="font-size:.85rem">Needs review</b><div style="margin-top:.5rem">loading…</div>';
  try {
    const { data } = await db.from('actions').select('id, kind, title, created_at, profiles!actions_user_id_fkey(username)').is('reviewed_at', null).neq('status', 'draft').neq('status', 'rejected').order('created_at', { ascending: false }).limit(8);
    const rows = data || [];
    pop.innerHTML = '<b style="font-size:.85rem">Needs review (' + rows.length + ')</b>' + (rows.length
      ? rows.map(a => '<div class="notif-row">' + (a.kind === 'tree' ? '🌳' : '🧹') + '<div style="flex:1;min-width:0"><b style="font-size:.85rem">' + esc(a.title || 'Action') + '</b><br><small style="color:var(--faint)">@' + esc(a.profiles ? a.profiles.username : '?') + ' · ' + timeAgo(+new Date(a.created_at)) + '</small></div></div>').join('')
      : '<p class="empty-note">All caught up 🎉</p>') + '<button class="btn btn-soft btn-sm" style="width:100%;margin-top:.6rem" onclick="location.hash=\'#/queue\'">Open queue</button>';
  } catch (e) { pop.innerHTML = '<p class="empty-note">Could not load.</p>'; }
}
function subscribeNew() {
  try {
    db.channel('admin-actions').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions' }, () => { refreshBell(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'actions' }, () => { refreshBell(); }).subscribe();
    db.channel('admin-donations').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, () => { toast('New donation received 💛'); }).subscribe();
  } catch (e) {}
}

/* ============================================================
   VIEW · OVERVIEW (analytics + charts)
   ============================================================ */
const charts = {};
function destroyCharts() { Object.keys(charts).forEach(k => { try { charts[k].destroy(); } catch (e) {} delete charts[k]; }); }
async function viewOverview() {
  destroyCharts();
  const v = $('#view');
  v.innerHTML = head('Overview', 'Live snapshot of the whole grove.') +
    '<div class="kpi-grid" id="kpis">' + Array(6).fill('<div class="card kpi skeleton" style="height:104px"></div>').join('') + '</div>' +
    '<div class="chart-grid">' +
      '<div class="card chart-card"><h3>Actions · last 14 days</h3><div class="chart-wrap"><canvas id="cActions"></canvas></div></div>' +
      '<div class="card chart-card"><h3>Submission status</h3><div class="chart-wrap"><canvas id="cStatus"></canvas></div></div>' +
      '<div class="card chart-card"><h3>Donations (₹) · last 14 days</h3><div class="chart-wrap"><canvas id="cDon"></canvas></div></div>' +
      '<div class="card chart-card"><h3>Top colleges</h3><div class="chart-wrap"><canvas id="cColleges"></canvas></div></div>' +
    '</div>' +
    '<div class="card" style="padding:1.2rem"><h3 style="font-family:var(--font-d);font-size:1.05rem;margin-bottom:.6rem">Recent activity</h3><div id="recentActivity">' + loadingRows() + '</div></div>';

  // --- gather data ---
  const [users, aTotal, aApproved, aPending, aRejected, aDraft] = await Promise.all([
    getCount('profiles'), getCount('actions'),
    getCount('actions', q => q.eq('status', 'approved')),
    getCount('actions', q => q.eq('status', 'pending')),
    getCount('actions', q => q.eq('status', 'rejected')),
    getCount('actions', q => q.eq('status', 'draft')),
  ]);
  let dons = [], acts = [], profs = [];
  try { dons = (await db.from('donations').select('amount_inr, amount, currency, created_at, user_id').order('created_at', { ascending: false }).limit(1000)).data || []; } catch (e) {}
  try { acts = (await db.from('actions').select('kind, status, created_at, place, profiles!actions_user_id_fkey(college)').order('created_at', { ascending: false }).limit(1000)).data || []; } catch (e) {}
  const raised = dons.reduce((s, d) => s + (d.amount_inr != null ? +d.amount_inr : +d.amount), 0);
  const donorSet = new Set(dons.map(d => d.user_id || Math.random()));
  const campActive = await getCount('campaigns', q => q.eq('status', 'active'));

  $('#kpis').innerHTML =
    kpi('👥', fmtInt(users), 'Total users') +
    kpi('🌿', fmtInt(aTotal), 'Total submissions') +
    kpi('⏳', fmtInt(aPending + aDraft), 'Awaiting / in progress') +
    kpi('🚫', fmtInt(aRejected), 'Rejected') +
    kpi('💛', '₹' + fmtInt(Math.round(raised)), 'Raised (all-time)') +
    kpi('🎯', fmtInt(campActive), 'Active campaigns');

  // recent activity
  const recent = acts.slice(0, 8);
  $('#recentActivity').innerHTML = recent.length ? recent.map(a =>
    '<div class="notif-row">' + (a.kind === 'tree' ? '🌳' : '🧹') + '<div style="flex:1;min-width:0"><b style="font-size:.88rem">' + esc(a.kind === 'tree' ? 'Tree planted' : 'Clean-up') + '</b> <span class="status-pill st-' + (a.status || 'approved') + '">' + (a.status || 'approved') + '</span><br><small style="color:var(--faint)">' + esc(a.place || 'somewhere') + ' · ' + timeAgo(+new Date(a.created_at)) + '</small></div></div>'
  ).join('') : empty('🌱', 'No activity yet.');

  drawCharts(acts, dons);
}
function kpi(ico, big, lbl) { return '<div class="card kpi"><div class="k-ico">' + ico + '</div><div class="k-big">' + big + '</div><div class="k-lbl">' + esc(lbl) + '</div></div>'; }
async function getCount(table, mod) {
  try { let q = db.from(table).select('id', { count: 'exact', head: true }); if (mod) q = mod(q); const { count } = await q; return count || 0; }
  catch (e) { return 0; }
}
function dayKeys(n) { const out = []; const today = new Date(); today.setHours(0, 0, 0, 0); for (let i = n - 1; i >= 0; i--) out.push(new Date(+today - i * DAY)); return out; }
function drawCharts(acts, dons) {
  if (!window.Chart) return;
  const grid = isDark() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)';
  const tick = isDark() ? '#9fb8a6' : '#5a6b58';
  Chart.defaults.color = tick; Chart.defaults.font.family = 'Outfit, sans-serif';
  const days = dayKeys(14);
  const labels = days.map(d => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
  const keyOf = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return +d; };
  // actions/day by kind
  const trees = days.map(() => 0), cleans = days.map(() => 0);
  acts.forEach(a => { const idx = days.findIndex(d => +d === keyOf(a.created_at)); if (idx >= 0) { if (a.kind === 'tree') trees[idx]++; else cleans[idx]++; } });
  charts.actions = new Chart($('#cActions'), { type: 'line', data: { labels, datasets: [
    { label: 'Trees', data: trees, borderColor: '#2F7D45', backgroundColor: 'rgba(47,125,69,.15)', tension: .35, fill: true },
    { label: 'Clean-ups', data: cleans, borderColor: '#3E8ED0', backgroundColor: 'rgba(62,142,208,.15)', tension: .35, fill: true },
  ] }, options: chartOpts(grid) });
  // status doughnut
  const st = { approved: 0, pending: 0, draft: 0, rejected: 0 };
  acts.forEach(a => { st[a.status || 'approved'] = (st[a.status || 'approved'] || 0) + 1; });
  charts.status = new Chart($('#cStatus'), { type: 'doughnut', data: { labels: ['Approved', 'Pending', 'Draft', 'Rejected'], datasets: [{ data: [st.approved, st.pending, st.draft, st.rejected], backgroundColor: ['#2F7D45', '#3E8ED0', '#9aa39a', '#E0457B'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
  // donations/day
  const dperday = days.map(() => 0);
  dons.forEach(d => { const idx = days.findIndex(x => +x === keyOf(d.created_at)); if (idx >= 0) dperday[idx] += (d.amount_inr != null ? +d.amount_inr : +d.amount); });
  charts.don = new Chart($('#cDon'), { type: 'bar', data: { labels, datasets: [{ label: '₹ raised', data: dperday.map(x => Math.round(x)), backgroundColor: '#FFCB3D', borderRadius: 5 }] }, options: chartOpts(grid) });
  // top colleges
  const col = {};
  acts.forEach(a => { const c = a.profiles && a.profiles.college; if (c) col[c] = (col[c] || 0) + 1; });
  const top = Object.entries(col).sort((a, b) => b[1] - a[1]).slice(0, 6);
  charts.colleges = new Chart($('#cColleges'), { type: 'bar', data: { labels: top.map(x => x[0]), datasets: [{ label: 'Actions', data: top.map(x => x[1]), backgroundColor: '#7DC852', borderRadius: 5 }] }, options: Object.assign(chartOpts(grid), { indexAxis: 'y' }) });
}
function chartOpts(grid) { return { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } }, scales: { x: { grid: { color: grid } }, y: { grid: { color: grid }, beginAtZero: true, ticks: { precision: 0 } } } }; }

/* ============================================================
   VIEW · VERIFICATION QUEUE
   ============================================================ */
const qState = { page: 0, status: 'review', kind: 'all', search: '' };
async function viewQueue() {
  const v = $('#view');
  v.innerHTML = head('Verification queue', 'Review before/after proof. Approve to keep, reject to remove.') +
    '<div class="a-filters">' +
      '<input type="search" id="qSearch" placeholder="Search title, place or @user…" value="' + esc(qState.search) + '">' +
      '<select id="qStatus">' + opt(['review|Needs review', 'all|All', 'approved|Approved', 'pending|Pending', 'draft|In progress', 'rejected|Rejected'], qState.status) + '</select>' +
      '<select id="qKind">' + opt(['all|All kinds', 'tree|Trees', 'cleanup|Clean-ups'], qState.kind) + '</select>' +
    '</div><div id="qList">' + loadingRows() + '</div><div class="pager" id="qPager"></div>';
  $('#qSearch').addEventListener('input', debounce(() => { qState.search = $('#qSearch').value.trim(); qState.page = 0; loadQueue(); }, 300));
  $('#qStatus').addEventListener('change', () => { qState.status = $('#qStatus').value; qState.page = 0; loadQueue(); });
  $('#qKind').addEventListener('change', () => { qState.kind = $('#qKind').value; qState.page = 0; loadQueue(); });
  loadQueue();
}
async function loadQueue() {
  const list = $('#qList'); list.innerHTML = loadingRows();
  let q = db.from('actions').select('*, profiles!actions_user_id_fkey(username, college, avatar_url)', { count: 'exact' });
  if (qState.status === 'review') q = q.is('reviewed_at', null).neq('status', 'draft').neq('status', 'rejected');
  else if (qState.status !== 'all') q = q.eq('status', qState.status);
  if (qState.kind !== 'all') q = q.eq('kind', qState.kind);
  if (qState.search) q = q.or('title.ilike.%' + safe(qState.search) + '%,place.ilike.%' + safe(qState.search) + '%');
  q = q.order('created_at', { ascending: false }).range(qState.page * PAGE, qState.page * PAGE + PAGE - 1);
  let data, count;
  try { const r = await q; if (r.error) throw r.error; data = r.data || []; count = r.count || 0; }
  catch (e) { list.innerHTML = empty('⚠️', 'Could not load submissions.'); return; }
  if (!data.length) { list.innerHTML = empty('🎉', qState.status === 'review' ? 'Nothing to review — all clear!' : 'No submissions match.'); $('#qPager').innerHTML = ''; return; }
  list.innerHTML = '<div class="q-grid">' + data.map(qCard).join('') + '</div>';
  renderPager('qPager', qState, count, loadQueue);
  list.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => queueAction(b.dataset.act, +b.dataset.id, data.find(x => x.id === +b.dataset.id))));
}
function qCard(a) {
  const before = a.before_url, after = a.after_url;
  const reviewed = a.reviewed_at ? '✓ reviewed' : 'unreviewed';
  return '<div class="card q-card">' +
    '<div class="q-imgs">' +
      '<figure><span class="tag">BEFORE</span>' + (before ? '<img src="' + esc(before) + '" alt="before" loading="lazy">' : '<div class="a-empty" style="padding:1rem">—</div>') + '</figure>' +
      '<figure><span class="tag">AFTER</span>' + (after ? '<img src="' + esc(after) + '" alt="after" loading="lazy">' : '<div class="a-empty" style="padding:1rem;font-size:.75rem">no after yet</div>') + '</figure>' +
    '</div>' +
    '<div class="q-body"><div style="display:flex;justify-content:space-between;gap:.5rem;align-items:center"><span class="status-pill st-' + (a.status || 'approved') + '">' + (a.status || 'approved') + '</span><small>' + reviewed + '</small></div>' +
    '<h4>' + (a.kind === 'tree' ? '🌳 ' : '🧹 ') + esc(a.title || 'Action') + '</h4>' +
    '<small>@' + esc(a.profiles ? a.profiles.username : '?') + (a.profiles && a.profiles.college ? ' · ' + esc(a.profiles.college) : '') + '</small>' +
    '<small>📍 ' + esc(a.place || '—') + ' · ' + timeAgo(+new Date(a.created_at)) + (a.weight_kg ? ' · ' + a.weight_kg + ' kg' : '') + '</small>' +
    (a.reject_reason ? '<small style="color:#c0356a">✕ ' + esc(a.reject_reason) + '</small>' : '') +
    '<div class="q-acts">' +
      (can('approve') && a.status !== 'draft' ? '<button class="btn btn-primary" data-act="approve" data-id="' + a.id + '">Approve</button>' : '') +
      (can('reject') ? '<button class="btn btn-danger" data-act="reject" data-id="' + a.id + '">Reject</button>' : '') +
      (can('delete') ? '<button class="btn btn-ghost" data-act="delete" data-id="' + a.id + '">🗑</button>' : '') +
    '</div></div></div>';
}
async function queueAction(act, id, a) {
  if (act === 'approve') {
    const pts = a.points || (a.kind === 'tree' ? 10 : 8 + Math.min(10, Math.floor((+a.weight_kg || 0) / 2)));
    try {
      const { error } = await db.from('actions').update({ status: 'approved', points: pts, reviewed_by: me.id, reviewed_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      audit('approve_action', 'action', id, { kind: a.kind }); toast('Approved ✓', '✅'); refreshBell(); loadQueue();
    } catch (e) { toast('Could not approve — ' + (e.message || 'error'), '⚠️'); }
  } else if (act === 'reject') {
    openModal('<button class="x" data-close>✕</button><h3>Reject submission</h3><p style="color:var(--soft);margin:.3rem 0 .8rem">This hides it from the map. Optionally reverse the points too.</p>' +
      '<div class="field"><label>Reason (shown to reviewers)</label><input type="text" id="rjReason" placeholder="e.g. duplicate photo, no visible change"></div>' +
      (a.status === 'approved' ? '<label style="display:flex;gap:.5rem;align-items:center;font-size:.9rem;margin-bottom:1rem"><input type="checkbox" id="rjReverse" checked> reverse the points/stats this earned</label>' : '') +
      '<button class="btn btn-danger" style="width:100%" id="rjGo">Reject submission</button>');
    $('#rjGo').addEventListener('click', async () => {
      const reason = $('#rjReason').value.trim();
      const reverse = $('#rjReverse') && $('#rjReverse').checked;
      try {
        const { error } = await db.from('actions').update({ status: 'rejected', reject_reason: reason, reviewed_by: me.id, reviewed_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        if (reverse) await reverseStats(a);
        audit('reject_action', 'action', id, { reason, reversed: !!reverse });
        closeModal(); toast('Rejected', '🚫'); refreshBell(); loadQueue();
      } catch (e) { toast('Could not reject — ' + (e.message || 'error'), '⚠️'); }
    });
  } else if (act === 'delete') {
    if (!confirm('Permanently delete this submission? This cannot be undone.')) return;
    try { const { error } = await db.from('actions').delete().eq('id', id); if (error) throw error; audit('delete_action', 'action', id, {}); toast('Deleted', '🗑'); refreshBell(); loadQueue(); }
    catch (e) { toast('Could not delete — ' + (e.message || 'error'), '⚠️'); }
  }
}
async function reverseStats(a) {
  // best-effort: only admins can update other profiles (RLS). Moderators will
  // silently no-op here, which is fine — the record is still hidden.
  try {
    const { data: p } = await db.from('profiles').select('points, trees, cleanups, waste_kg').eq('id', a.user_id).maybeSingle();
    if (!p) return;
    const patch = { points: Math.max(0, (p.points || 0) - (a.points || 0)) };
    if (a.kind === 'tree') patch.trees = Math.max(0, (p.trees || 0) - 1);
    else { patch.cleanups = Math.max(0, (p.cleanups || 0) - 1); patch.waste_kg = Math.max(0, (+p.waste_kg || 0) - (+a.weight_kg || 0)); }
    await db.from('profiles').update(patch).eq('id', a.user_id);
  } catch (e) {}
}

/* ============================================================
   VIEW · USERS
   ============================================================ */
const uState = { page: 0, search: '', sort: 'points' };
async function viewUsers() {
  const v = $('#view');
  v.innerHTML = head('Users', 'Every gardener in the grove.') +
    '<div class="a-filters"><input type="search" id="uSearch" placeholder="Search username, name or college…" value="' + esc(uState.search) + '">' +
    '<select id="uSort">' + opt(['points|Top points', 'created_at|Newest', 'trees|Most trees'], uState.sort) + '</select></div>' +
    '<div class="table-wrap"><table class="atable"><thead><tr><th>User</th><th>College</th><th>Pts</th><th>Trees</th><th>Clean</th><th>Status</th>' + (can('ban') ? '<th>Actions</th>' : '') + '</tr></thead><tbody id="uBody"><tr><td colspan="7">' + loadingRows() + '</td></tr></tbody></table></div><div class="pager" id="uPager"></div>';
  $('#uSearch').addEventListener('input', debounce(() => { uState.search = $('#uSearch').value.trim(); uState.page = 0; loadUsers(); }, 300));
  $('#uSort').addEventListener('change', () => { uState.sort = $('#uSort').value; uState.page = 0; loadUsers(); });
  loadUsers();
}
async function loadUsers() {
  const body = $('#uBody'); body.innerHTML = '<tr><td colspan="7">' + loadingRows() + '</td></tr>';
  let q = db.from('profiles').select('id, username, full_name, college, points, trees, cleanups, banned, flagged, created_at', { count: 'exact' });
  if (uState.search) q = q.or('username.ilike.%' + safe(uState.search) + '%,full_name.ilike.%' + safe(uState.search) + '%,college.ilike.%' + safe(uState.search) + '%');
  q = q.order(uState.sort, { ascending: uState.sort === 'created_at' ? false : false }).range(uState.page * PAGE, uState.page * PAGE + PAGE - 1);
  let data, count;
  try { const r = await q; if (r.error) throw r.error; data = r.data || []; count = r.count || 0; }
  catch (e) { body.innerHTML = '<tr><td colspan="7">' + empty('⚠️', 'Could not load users.') + '</td></tr>'; return; }
  if (!data.length) { body.innerHTML = '<tr><td colspan="7">' + empty('👤', 'No users match.') + '</td></tr>'; $('#uPager').innerHTML = ''; return; }
  body.innerHTML = data.map(u =>
    '<tr><td><div class="a-userchip">' + avatarHtml(u.username, '') + '<div><b>@' + esc(u.username) + '</b>' + (u.full_name ? '<br><small style="color:var(--faint)">' + esc(u.full_name) + '</small>' : '') + '</div></div></td>' +
    '<td>' + esc(u.college || '—') + '</td><td>' + fmtInt(u.points) + '</td><td>' + fmtInt(u.trees) + '</td><td>' + fmtInt(u.cleanups) + '</td>' +
    '<td>' + (u.banned ? '<span class="status-pill st-rejected">banned</span>' : u.flagged ? '<span class="status-pill st-pending">flagged</span>' : '<span class="status-pill st-approved">ok</span>') + '</td>' +
    (can('ban') ? '<td><button class="btn btn-ghost btn-sm" data-u="' + u.id + '">Manage</button></td>' : '') + '</tr>'
  ).join('');
  renderPager('uPager', uState, count, loadUsers);
  body.querySelectorAll('[data-u]').forEach(b => b.addEventListener('click', () => manageUser(data.find(x => x.id === b.dataset.u))));
}
function manageUser(u) {
  if (!u) return;
  openModal('<button class="x" data-close>✕</button><h3>@' + esc(u.username) + '</h3>' +
    '<p style="color:var(--soft);margin:.3rem 0 1rem">' + esc(u.full_name || '') + (u.college ? ' · ' + esc(u.college) : '') + '</p>' +
    '<div class="pf-stats" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem"><span class="leaf-tag">✨ ' + fmtInt(u.points) + ' pts</span><span class="leaf-tag">🌳 ' + fmtInt(u.trees) + '</span><span class="leaf-tag">🧹 ' + fmtInt(u.cleanups) + '</span></div>' +
    '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
      '<button class="btn btn-soft btn-sm" id="mFlag">' + (u.flagged ? 'Unflag' : '🚩 Flag') + '</button>' +
      '<button class="btn btn-danger btn-sm" id="mBan">' + (u.banned ? 'Unban' : '⛔ Ban') + '</button>' +
    '</div><p style="font-size:.74rem;color:var(--faint);margin-top:.8rem">Flag/ban are moderation flags on the profile. Deleting the auth account requires the Supabase dashboard.</p>');
  $('#mFlag').addEventListener('click', () => setUserFlag(u, 'flagged', !u.flagged));
  $('#mBan').addEventListener('click', () => setUserFlag(u, 'banned', !u.banned));
}
async function setUserFlag(u, field, val) {
  try {
    const patch = {}; patch[field] = val;
    const { error } = await db.from('profiles').update(patch).eq('id', u.id);
    if (error) throw error;
    audit((val ? '' : 'un') + field + '_user', 'profile', u.id, { username: u.username });
    closeModal(); toast('Updated @' + u.username, '✓'); loadUsers();
  } catch (e) { toast('Could not update — RLS may block this (admins only)', '⚠️'); }
}

/* ============================================================
   VIEW · DONATIONS
   ============================================================ */
const dState = { page: 0, search: '' };
async function viewDonations() {
  const v = $('#view');
  const canManage = can('manage_donations');
  v.innerHTML = head('Donations', 'Every gift, fully traceable.') +
    '<div class="kpi-grid" id="dKpis">' + Array(3).fill('<div class="card kpi skeleton" style="height:104px"></div>').join('') + '</div>' +
    '<div class="a-filters"><input type="search" id="dSearch" placeholder="Search donor name…" value="' + esc(dState.search) + '"></div>' +
    '<div class="table-wrap"><table class="atable"><thead><tr><th>Donor</th><th>Amount</th><th>≈ ₹</th><th>Campaign</th><th>When</th></tr></thead><tbody id="dBody"><tr><td colspan="5">' + loadingRows() + '</td></tr></tbody></table></div><div class="pager" id="dPager"></div>';
  $('#dSearch').addEventListener('input', debounce(() => { dState.search = $('#dSearch').value.trim(); dState.page = 0; loadDonations(); }, 300));
  // kpis
  try {
    const all = (await db.from('donations').select('amount_inr, amount, user_id').limit(2000)).data || [];
    const raised = all.reduce((s, d) => s + (d.amount_inr != null ? +d.amount_inr : +d.amount), 0);
    $('#dKpis').innerHTML = kpi('💛', '₹' + fmtInt(Math.round(raised)), 'Total raised') + kpi('🧑‍🤝‍🧑', fmtInt(new Set(all.map(d => d.user_id || Math.random())).size), 'Donors') + kpi('🎁', fmtInt(all.length), 'Gifts');
  } catch (e) { $('#dKpis').innerHTML = empty('⚠️', 'Could not load totals.'); }
  loadDonations();
}
async function loadDonations() {
  const body = $('#dBody'); body.innerHTML = '<tr><td colspan="5">' + loadingRows() + '</td></tr>';
  let q = db.from('donations').select('*, campaigns(title)', { count: 'exact' });
  if (dState.search) q = q.ilike('donor_name', '%' + safe(dState.search) + '%');
  q = q.order('created_at', { ascending: false }).range(dState.page * PAGE, dState.page * PAGE + PAGE - 1);
  let data, count;
  try { const r = await q; if (r.error) throw r.error; data = r.data || []; count = r.count || 0; }
  catch (e) { body.innerHTML = '<tr><td colspan="5">' + empty('⚠️', 'Could not load donations.') + '</td></tr>'; return; }
  if (!data.length) { body.innerHTML = '<tr><td colspan="5">' + empty('💸', 'No donations yet.') + '</td></tr>'; $('#dPager').innerHTML = ''; return; }
  body.innerHTML = data.map(d =>
    '<tr><td><b>' + esc(d.donor_name || 'Anonymous') + '</b></td><td>' + esc(d.currency) + ' ' + fmtInt(d.amount) + '</td><td>₹' + fmtInt(Math.round(d.amount_inr != null ? d.amount_inr : d.amount)) + '</td><td>' + esc(d.campaigns ? d.campaigns.title : '—') + '</td><td><small>' + fmtDate(+new Date(d.created_at)) + '</small></td></tr>'
  ).join('');
  renderPager('dPager', dState, count, loadDonations);
}

/* ============================================================
   VIEW · CAMPAIGNS
   ============================================================ */
async function viewCampaigns() {
  const v = $('#view');
  const canManage = can('manage_campaigns');
  v.innerHTML = head('Campaigns', 'Fundraising drives.', canManage ? '<button class="btn btn-primary" id="newCampBtn">+ New campaign</button>' : '') +
    '<div id="campList">' + loadingRows() + '</div>';
  if (canManage) $('#newCampBtn').addEventListener('click', () => editCampaign(null));
  loadCampaignsList();
}
async function loadCampaignsList() {
  const el = $('#campList'); el.innerHTML = loadingRows();
  let camps = [], dons = [];
  try { camps = (await db.from('campaigns').select('*').order('created_at', { ascending: false })).data || []; } catch (e) { el.innerHTML = empty('⚠️', 'Could not load campaigns.'); return; }
  try { dons = (await db.from('donations').select('campaign_id, amount_inr, amount')).data || []; } catch (e) {}
  const raisedBy = {}; dons.forEach(d => { if (d.campaign_id != null) raisedBy[d.campaign_id] = (raisedBy[d.campaign_id] || 0) + (d.amount_inr != null ? +d.amount_inr : +d.amount); });
  if (!camps.length) { el.innerHTML = empty('🎯', 'No campaigns yet.'); return; }
  const canManage = can('manage_campaigns');
  el.innerHTML = '<div class="q-grid">' + camps.map(c => {
    const raised = raisedBy[c.id] || 0, goal = +c.goal_inr || 0, pct = goal ? Math.min(100, Math.round(raised / goal * 100)) : 0;
    return '<div class="card" style="padding:1.1rem 1.2rem"><div style="display:flex;justify-content:space-between;gap:.5rem;align-items:start"><b style="font-size:1.05rem">' + esc(c.title) + '</b><span class="status-pill st-' + (c.status === 'active' ? 'approved' : c.status === 'archived' ? 'rejected' : 'pending') + '">' + esc(c.status) + '</span></div>' +
      (c.description ? '<p style="color:var(--soft);font-size:.85rem;margin:.4rem 0">' + esc(c.description) + '</p>' : '') +
      '<div class="dn-bar" style="margin:.6rem 0 .4rem"><span style="width:' + pct + '%"></span></div>' +
      '<small style="color:var(--soft)">₹' + fmtInt(Math.round(raised)) + (goal ? ' of ₹' + fmtInt(goal) : '') + ' · ' + pct + '%</small>' +
      (canManage ? '<div class="q-acts" style="margin-top:.7rem"><button class="btn btn-soft btn-sm" data-edit="' + c.id + '">Edit</button></div>' : '') + '</div>';
  }).join('') + '</div>';
  if (canManage) el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editCampaign(camps.find(x => x.id === +b.dataset.edit))));
}
function editCampaign(c) {
  const isNew = !c;
  openModal('<button class="x" data-close>✕</button><h3>' + (isNew ? 'New campaign' : 'Edit campaign') + '</h3>' +
    '<div class="field"><label>Title</label><input type="text" id="cTitle" maxlength="120" value="' + esc(c ? c.title : '') + '"></div>' +
    '<div class="field"><label>Description</label><textarea id="cDesc" maxlength="400">' + esc(c ? c.description : '') + '</textarea></div>' +
    '<div class="field"><label>Goal (₹)</label><input type="number" id="cGoal" min="0" value="' + (c ? c.goal_inr : 50000) + '"></div>' +
    '<div class="field"><label>Status</label><select id="cStatus">' + opt(['active|Active', 'paused|Paused', 'completed|Completed', 'archived|Archived'], c ? c.status : 'active') + '</select></div>' +
    '<div class="err" id="cErr"></div><button class="btn btn-primary" style="width:100%" id="cSave">' + (isNew ? 'Create' : 'Save') + '</button>');
  $('#cSave').addEventListener('click', async () => {
    const title = $('#cTitle').value.trim();
    if (title.length < 2) { $('#cErr').textContent = 'Title needs at least 2 characters.'; return; }
    const patch = { title, description: $('#cDesc').value.trim(), goal_inr: Math.max(0, +$('#cGoal').value || 0), status: $('#cStatus').value };
    try {
      if (isNew) { patch.created_by = me.id; const { data, error } = await db.from('campaigns').insert(patch).select().single(); if (error) throw error; audit('create_campaign', 'campaign', data.id, { title }); }
      else { const { error } = await db.from('campaigns').update(patch).eq('id', c.id); if (error) throw error; audit('update_campaign', 'campaign', c.id, { title }); }
      closeModal(); toast('Saved', '✓'); loadCampaignsList();
    } catch (e) { $('#cErr').textContent = 'Could not save — ' + (e.message || 'admins only'); }
  });
}

/* ============================================================
   VIEW · AUDIT LOG
   ============================================================ */
const auState = { page: 0, search: '' };
async function viewAudit() {
  const v = $('#view');
  v.innerHTML = head('Audit log', 'Every privileged action, recorded.') +
    '<div class="a-filters"><input type="search" id="auSearch" placeholder="Search action or entity…" value="' + esc(auState.search) + '"></div>' +
    '<div class="table-wrap"><table class="atable"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody id="auBody"><tr><td colspan="5">' + loadingRows() + '</td></tr></tbody></table></div><div class="pager" id="auPager"></div>';
  $('#auSearch').addEventListener('input', debounce(() => { auState.search = $('#auSearch').value.trim(); auState.page = 0; loadAudit(); }, 300));
  loadAudit();
}
async function loadAudit() {
  const body = $('#auBody'); body.innerHTML = '<tr><td colspan="5">' + loadingRows() + '</td></tr>';
  let q = db.from('audit_log').select('*', { count: 'exact' });
  if (auState.search) q = q.or('action.ilike.%' + safe(auState.search) + '%,entity.ilike.%' + safe(auState.search) + '%,actor_name.ilike.%' + safe(auState.search) + '%');
  q = q.order('created_at', { ascending: false }).range(auState.page * PAGE, auState.page * PAGE + PAGE - 1);
  let data, count;
  try { const r = await q; if (r.error) throw r.error; data = r.data || []; count = r.count || 0; }
  catch (e) { body.innerHTML = '<tr><td colspan="5">' + empty('⚠️', 'Could not load the audit log.') + '</td></tr>'; return; }
  if (!data.length) { body.innerHTML = '<tr><td colspan="5">' + empty('📜', 'No audit entries yet.') + '</td></tr>'; $('#auPager').innerHTML = ''; return; }
  body.innerHTML = data.map(a =>
    '<tr><td><small>' + fmtDate(+new Date(a.created_at)) + '</small></td><td>@' + esc(a.actor_name || '?') + '</td><td><code style="font-size:.8rem">' + esc(a.action) + '</code></td><td>' + esc(a.entity) + (a.entity_id ? ' #' + esc(a.entity_id) : '') + '</td><td class="audit-meta">' + esc(JSON.stringify(a.meta || {})) + '</td></tr>'
  ).join('');
  renderPager('auPager', auState, count, loadAudit);
}

/* ============================================================
   VIEW · ROLES / ADMINS (super admin only)
   ============================================================ */
async function viewRoles() {
  const v = $('#view');
  v.innerHTML = head('Admins & roles', 'Grant or revoke staff access.', '<button class="btn btn-primary" id="grantBtn">+ Grant role</button>') +
    '<div class="table-wrap"><table class="atable"><thead><tr><th>User</th><th>Role</th><th>Granted</th><th></th></tr></thead><tbody id="rBody"><tr><td colspan="4">' + loadingRows() + '</td></tr></tbody></table></div>';
  $('#grantBtn').addEventListener('click', grantRole);
  loadRoles();
}
async function loadRoles() {
  const body = $('#rBody'); body.innerHTML = '<tr><td colspan="4">' + loadingRows() + '</td></tr>';
  let data;
  // user_roles has no FK to profiles (it references auth.users), so fetch the
  // profiles separately and stitch them on by id
  try {
    const r = await db.from('user_roles').select('user_id, role, granted_at').order('granted_at', { ascending: false });
    if (r.error) throw r.error;
    data = r.data || [];
    const ids = [...new Set(data.map(x => x.user_id))];
    if (ids.length) {
      const { data: profs } = await db.from('profiles').select('id, username, avatar_url').in('id', ids);
      const byId = {}; (profs || []).forEach(p => { byId[p.id] = p; });
      data.forEach(x => { x.profiles = byId[x.user_id] || null; });
    }
  } catch (e) { body.innerHTML = '<tr><td colspan="4">' + empty('⚠️', 'Could not load roles.') + '</td></tr>'; return; }
  if (!data.length) { body.innerHTML = '<tr><td colspan="4">' + empty('🛡️', 'No staff yet.') + '</td></tr>'; return; }
  body.innerHTML = data.map(r =>
    '<tr><td><div class="a-userchip">' + avatarHtml(r.profiles ? r.profiles.username : '?', r.profiles ? r.profiles.avatar_url : '') + '<b>@' + esc(r.profiles ? r.profiles.username : r.user_id.slice(0, 8)) + '</b></div></td>' +
    '<td><span class="role-badge rb-' + r.role + '">' + r.role.replace('_', ' ') + '</span></td><td><small>' + fmtDate(+new Date(r.granted_at)) + '</small></td>' +
    '<td>' + (r.user_id === me.id && r.role === 'super_admin' ? '<small style="color:var(--faint)">you</small>' : '<button class="btn btn-ghost btn-sm" data-revoke="' + r.user_id + '|' + r.role + '">Revoke</button>') + '</td></tr>'
  ).join('');
  body.querySelectorAll('[data-revoke]').forEach(b => b.addEventListener('click', () => { const [uid, role] = b.dataset.revoke.split('|'); revokeRole(uid, role); }));
}
function grantRole() {
  openModal('<button class="x" data-close>✕</button><h3>Grant a staff role</h3>' +
    '<div class="field"><label>Find user by username</label><input type="text" id="grUser" placeholder="username" autocomplete="off"><div class="hint" id="grHint"></div></div>' +
    '<div class="field"><label>Role</label><select id="grRole">' + opt(['moderator|Moderator', 'admin|Admin', 'super_admin|Super admin'], 'moderator') + '</select></div>' +
    '<div class="err" id="grErr"></div><button class="btn btn-primary" style="width:100%" id="grGo">Grant role</button>');
  let found = null;
  $('#grUser').addEventListener('input', debounce(async () => {
    const uname = $('#grUser').value.trim().toLowerCase();
    found = null; $('#grHint').textContent = '';
    if (uname.length < 2) return;
    const { data } = await db.from('profiles').select('id, username').ilike('username', uname).limit(1);
    if (data && data.length) { found = data[0]; $('#grHint').innerHTML = '✓ found <b>@' + esc(found.username) + '</b>'; }
    else $('#grHint').textContent = 'no exact match yet…';
  }, 300));
  $('#grGo').addEventListener('click', async () => {
    if (!found) { $('#grErr').textContent = 'Pick a valid username first.'; return; }
    const role = $('#grRole').value;
    try {
      const { error } = await db.from('user_roles').insert({ user_id: found.id, role, granted_by: me.id });
      if (error && error.code !== '23505') throw error;
      audit('grant_role', 'user_role', found.id, { role, username: found.username });
      closeModal(); toast('Granted ' + role + ' to @' + found.username, '🛡️'); loadRoles();
    } catch (e) { $('#grErr').textContent = 'Could not grant — ' + (e.message || 'super admins only'); }
  });
}
async function revokeRole(uid, role) {
  if (!confirm('Revoke ' + role + ' from this user?')) return;
  try {
    const { error } = await db.from('user_roles').delete().eq('user_id', uid).eq('role', role);
    if (error) throw error;
    audit('revoke_role', 'user_role', uid, { role });
    toast('Revoked', '✓'); loadRoles();
  } catch (e) { toast('Could not revoke — ' + (e.message || 'super admins only'), '⚠️'); }
}

/* ============================================================
   VIEW · SETTINGS / SYSTEM (super admin only)
   ============================================================ */
async function viewSettings() {
  const v = $('#view');
  v.innerHTML = head('Settings & system', 'Configuration and health.') +
    '<div class="card" style="padding:1.3rem;margin-bottom:1rem"><h3 style="font-family:var(--font-d);font-size:1.1rem;margin-bottom:.6rem">Moderation</h3>' +
    '<p style="color:var(--soft);font-size:.9rem">GreenUp runs <b>post-moderation</b>: submissions go live and count points immediately, and staff review them here — rejecting removes them (and can reverse the points). To switch to pre-moderation, change new submissions to <code>status=\'pending\'</code> in the app and approve them from the queue.</p></div>' +
    '<div class="card" style="padding:1.3rem;margin-bottom:1rem"><h3 style="font-family:var(--font-d);font-size:1.1rem;margin-bottom:.6rem">System health</h3><div id="sysHealth">' + loadingRows() + '</div></div>' +
    '<div class="card" style="padding:1.3rem"><h3 style="font-family:var(--font-d);font-size:1.1rem;margin-bottom:.6rem">Recommendations</h3>' +
    '<ul style="color:var(--soft);font-size:.9rem;line-height:1.7;padding-left:1.1rem"><li>Enable <b>leaked-password protection</b> in Supabase → Auth → Passwords.</li><li>Lock the Google Maps key to your domain in Google Cloud Console.</li><li>Keep at least two super admins so you\'re never locked out.</li></ul></div>';
  try {
    const [users, actions, dons, camps, staff] = await Promise.all([getCount('profiles'), getCount('actions'), getCount('donations'), getCount('campaigns'), getCount('user_roles')]);
    $('#sysHealth').innerHTML = '<div class="kpi-grid" style="margin:0">' + kpi('👥', fmtInt(users), 'Profiles') + kpi('🌿', fmtInt(actions), 'Actions') + kpi('💛', fmtInt(dons), 'Donations') + kpi('🎯', fmtInt(camps), 'Campaigns') + kpi('🛡️', fmtInt(staff), 'Staff grants') + '</div>';
  } catch (e) { $('#sysHealth').innerHTML = empty('⚠️', 'Could not load health.'); }
}

/* ---- shared helpers ---- */
function opt(pairs, sel) { return pairs.map(p => { const [v, l] = p.split('|'); return '<option value="' + v + '"' + (v === sel ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }
function safe(s) { return String(s).replace(/[%,()]/g, ''); }
function debounce(fn, ms) { let t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
function renderPager(id, state, count, reload) {
  const el = $('#' + id); if (!el) return;
  const pages = Math.max(1, Math.ceil(count / PAGE)), cur = state.page + 1;
  el.innerHTML = '<span style="color:var(--faint)">' + fmtInt(count) + ' total · page ' + cur + '/' + pages + '</span>' +
    '<button class="btn btn-soft btn-sm" ' + (state.page <= 0 ? 'disabled' : '') + ' data-pg="prev">← Prev</button>' +
    '<button class="btn btn-soft btn-sm" ' + (cur >= pages ? 'disabled' : '') + ' data-pg="next">Next →</button>';
  el.querySelectorAll('[data-pg]').forEach(b => b.addEventListener('click', () => { state.page += b.dataset.pg === 'next' ? 1 : -1; if (state.page < 0) state.page = 0; reload(); }));
}

document.addEventListener('DOMContentLoaded', init);
})();
