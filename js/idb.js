/* ============================================================
   GreenUp · js/idb.js
   A very small promise wrapper over IndexedDB.
   localStorage can't hold photo blobs (5 MB quota, strings only),
   so anything that must survive a refresh lives here instead.
   ============================================================ */

/* Resolve an IDBRequest. */
function req(r) {
  return new Promise((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

/* Resolve when the whole transaction commits — a put isn't durable
   until this fires, which is the difference between "probably saved"
   and "saved". */
function done(t) {
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error || new Error('transaction aborted'));
  });
}

export function openDb(name, version, upgrade) {
  return new Promise((res, rej) => {
    if (!self.indexedDB) { rej(new Error('IndexedDB unavailable')); return; }
    const r = indexedDB.open(name, version);
    r.onupgradeneeded = () => upgrade(r.result, r.transaction);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('IndexedDB blocked by another tab'));
  });
}

export async function idbPut(db, store, value) {
  const t = db.transaction(store, 'readwrite');
  const p = req(t.objectStore(store).put(value));
  await done(t);
  return p;
}

export async function idbGet(db, store, key) {
  const t = db.transaction(store, 'readonly');
  const p = req(t.objectStore(store).get(key));
  await done(t);
  return p;
}

export async function idbGetAll(db, store) {
  const t = db.transaction(store, 'readonly');
  const p = req(t.objectStore(store).getAll());
  await done(t);
  return (await p) || [];
}

export async function idbDelete(db, store, key) {
  const t = db.transaction(store, 'readwrite');
  t.objectStore(store).delete(key);
  await done(t);
}
