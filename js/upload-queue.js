/* ============================================================
   GreenUp · js/upload-queue.js
   Durable, resumable background uploads for proof photos.

   Why this exists: you shoot the BEFORE photo, then spend twenty
   minutes actually cleaning the place up. In those twenty minutes
   the tab gets backgrounded, the phone sleeps, the browser evicts
   the page, the wifi drops. The before photo has to survive all of
   that — so it goes into IndexedDB the moment it's picked, and the
   upload runs on its own with retries until it lands.

   Honest scope note: a web page cannot upload while it is fully
   closed — that needs a native app or a Service Worker with
   Background Sync (not reliably available on iOS). What this does
   instead is never lose the bytes: they're durable locally, and the
   transfer resumes automatically the next time the page is alive.
   ============================================================ */
import { openDb, idbPut, idbGet, idbGetAll, idbDelete } from './idb.js';

const DB_NAME = 'greenup-uploads';
const DB_VER = 1;
const STORE = 'queue';

/* attempt 1 waits 2s, attempt 2 waits 6s, … then every 2 min forever */
const BACKOFF = [2000, 6000, 15000, 45000, 120000];
const XHR_TIMEOUT = 90000;

/* Statuses:
   local     — held on this device only (guest mode, or not signed in yet)
   queued    — durable, waiting for its turn
   uploading — bytes in flight
   retrying  — an attempt failed, another is scheduled
   done      — public URL in hand
*/
const PUMPABLE = { queued: 1, retrying: 1 };

let cfg = {
  supabaseUrl: '',
  anonKey: '',
  getToken: async () => null,
  onChange: () => {},
};

let dbP = null;
const mem = new Map();     // id -> record (blob lives here too)
const inflight = new Map(); // id -> XMLHttpRequest
const waiters = new Map(); // id -> [{ resolve, reject }]
let pumping = false;
let retryTimer = 0;
let started = false;

const key = (draftId, slot) => draftId + '::' + slot;

function handle() {
  if (!dbP) {
    dbP = openDb(DB_NAME, DB_VER, db => {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    });
  }
  return dbP;
}

/* IndexedDB can't structured-clone an XHR, and we don't want to
   persist volatile UI fields. Only these columns hit disk. */
function stored(r) {
  return {
    id: r.id, draftId: r.draftId, slot: r.slot, blob: r.blob, mime: r.mime,
    uid: r.uid, bucket: r.bucket, path: r.path, status: r.status,
    attempts: r.attempts, error: r.error, url: r.url,
    createdAt: r.createdAt, updatedAt: r.updatedAt, nextTry: r.nextTry,
  };
}

async function save(r) {
  r.updatedAt = Date.now();
  try { await idbPut(await handle(), STORE, stored(r)); }
  catch (e) { /* private mode / quota — the in-memory copy still works for this session */ }
}

function emit(r) {
  try { cfg.onChange(r); } catch (e) {}
}

function settle(r) {
  const list = waiters.get(r.id);
  if (!list) return;
  waiters.delete(r.id);
  list.forEach(w => r.status === 'done' ? w.resolve(r.url) : w.reject(new Error(r.error || 'upload cancelled')));
}

/* ------------------------------------------------------------
   the transfer itself — XHR rather than supabase-js so we get
   real upload progress events to show the user
------------------------------------------------------------ */
function transfer(r, token) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', cfg.supabaseUrl + '/storage/v1/object/' + r.bucket + '/' + r.path, true);
    x.setRequestHeader('Authorization', 'Bearer ' + token);
    x.setRequestHeader('apikey', cfg.anonKey);
    x.setRequestHeader('x-upsert', 'true');
    x.setRequestHeader('Content-Type', r.mime);
    x.timeout = XHR_TIMEOUT;
    x.upload.onprogress = e => {
      if (!e.lengthComputable) return;
      r.progress = e.loaded / e.total;
      emit(r);
    };
    x.onload = () => {
      inflight.delete(r.id);
      if (x.status >= 200 && x.status < 300) {
        resolve(cfg.supabaseUrl + '/storage/v1/object/public/' + r.bucket + '/' + r.path);
      } else {
        reject(new Error('storage ' + x.status + ' ' + String(x.responseText || '').slice(0, 160)));
      }
    };
    x.onerror = () => { inflight.delete(r.id); reject(new Error('network unreachable')); };
    x.ontimeout = () => { inflight.delete(r.id); reject(new Error('timed out')); };
    x.onabort = () => { inflight.delete(r.id); reject(new Error('cancelled')); };
    inflight.set(r.id, x);
    x.send(r.blob);
  });
}

function nextUp() {
  const t = Date.now();
  let best = null;
  for (const r of mem.values()) {
    if (!PUMPABLE[r.status] || !r.uid || !r.path) continue;
    if ((r.nextTry || 0) > t) continue;
    // before photos go first — they're the ones the user is waiting on
    if (!best || (r.slot === 'before' && best.slot !== 'before') || r.createdAt < best.createdAt) best = r;
  }
  return best;
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  let soonest = Infinity;
  for (const r of mem.values()) {
    if (PUMPABLE[r.status] && r.uid && r.path) soonest = Math.min(soonest, r.nextTry || 0);
  }
  if (soonest === Infinity) return;
  retryTimer = setTimeout(pump, Math.max(500, soonest - Date.now()));
}

async function run(r) {
  r.status = 'uploading';
  r.error = '';
  r.progress = 0;
  emit(r);
  await save(r);
  try {
    const token = await cfg.getToken();
    if (!token) throw new Error('no session');
    r.url = await transfer(r, token);
    r.status = 'done';
    r.progress = 1;
    await save(r);
    emit(r);
    settle(r);
  } catch (e) {
    r.attempts++;
    r.error = String((e && e.message) || e);
    r.progress = 0;
    r.status = 'retrying';
    r.nextTry = Date.now() + BACKOFF[Math.min(r.attempts - 1, BACKOFF.length - 1)];
    await save(r);
    emit(r);
    scheduleRetry();
  }
}

async function pump() {
  if (pumping) return;
  pumping = true;
  try {
    for (;;) {
      const r = nextUp();
      if (!r) break;
      await run(r);
    }
  } finally {
    pumping = false;
    scheduleRetry();
  }
}

/* ------------------------------------------------------------
   public API
------------------------------------------------------------ */
export const uploads = {
  /* Load anything left over from a previous visit and get it moving. */
  async init(options) {
    Object.assign(cfg, options || {});
    if (started) return this.all();
    started = true;
    try {
      const rows = await idbGetAll(await handle(), STORE);
      rows.forEach(r => {
        // a transfer that was mid-flight when the page died restarts clean
        if (r.status === 'uploading') { r.status = 'retrying'; r.nextTry = 0; }
        r.progress = r.status === 'done' ? 1 : 0;
        mem.set(r.id, r);
      });
    } catch (e) {}
    addEventListener('online', () => {
      mem.forEach(r => { if (r.status === 'retrying') r.nextTry = 0; });
      pump();
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) pump(); });
    pump();
    return this.all();
  },

  /* Hand a photo over. Resolves once the bytes are durable on this
     device — the cloud upload continues on its own after that. */
  async put(draftId, slot, blob, uid, mime) {
    const id = key(draftId, slot);
    const r = {
      id: id, draftId: draftId, slot: slot, blob: blob,
      mime: mime || blob.type || 'image/jpeg',
      uid: uid || '',
      bucket: 'proofs',
      path: uid ? uid + '/' + draftId + '-' + slot + '.jpg' : '',
      status: uid ? 'queued' : 'local',
      progress: 0, attempts: 0, error: '', url: '',
      createdAt: Date.now(), updatedAt: Date.now(), nextTry: 0,
    };
    const old = inflight.get(id);
    if (old) old.abort();
    mem.set(id, r);
    await save(r);       // durable before we return
    emit(r);
    pump();
    return r;
  },

  /* A guest who signs in mid-draft: adopt their orphaned photos. */
  adopt(uid) {
    if (!uid) return;
    let changed = false;
    mem.forEach(r => {
      if (r.status !== 'local' || r.uid) return;
      r.uid = uid;
      r.path = uid + '/' + r.draftId + '-' + r.slot + '.jpg';
      r.status = 'queued';
      r.nextTry = 0;
      save(r); emit(r); changed = true;
    });
    if (changed) pump();
  },

  get(draftId, slot) { return mem.get(key(draftId, slot)) || null; },

  forDraft(draftId) {
    return Array.from(mem.values()).filter(r => r.draftId === draftId);
  },

  all() { return Array.from(mem.values()); },

  /* True once the bytes can't be lost by a refresh. */
  isSafe(draftId, slot) {
    const r = mem.get(key(draftId, slot));
    return !!r && (r.status === 'done' || r.status === 'local' || r.status === 'queued' || r.status === 'uploading' || r.status === 'retrying');
  },

  /* Resolves with the public URL, or rejects if it never lands. */
  whenDone(draftId, slot) {
    const id = key(draftId, slot);
    const r = mem.get(id);
    if (!r) return Promise.reject(new Error('nothing queued'));
    if (r.status === 'done') return Promise.resolve(r.url);
    if (r.status === 'local') return Promise.reject(new Error('local only'));
    return new Promise((resolve, reject) => {
      if (!waiters.has(id)) waiters.set(id, []);
      waiters.get(id).push({ resolve: resolve, reject: reject });
      if (r.status === 'retrying') { r.nextTry = 0; pump(); }
    });
  },

  /* Kick everything that's waiting on a backoff timer. */
  retryNow() {
    mem.forEach(r => { if (r.status === 'retrying') { r.nextTry = 0; r.attempts = 0; } });
    pump();
  },

  async drop(draftId) {
    const rows = this.forDraft(draftId);
    for (const r of rows) {
      const x = inflight.get(r.id);
      if (x) x.abort();
      inflight.delete(r.id);
      mem.delete(r.id);
      const list = waiters.get(r.id);
      if (list) { waiters.delete(r.id); list.forEach(w => w.reject(new Error('discarded'))); }
      try { await idbDelete(await handle(), STORE, r.id); } catch (e) {}
      r.status = 'gone';
      emit(r);
    }
  },
};
