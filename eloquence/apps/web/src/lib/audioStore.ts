// Recordings made in offline/demo mode are kept on the device (IndexedDB).

const DB = "eloquence-audio";
const STORE = "clips";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveClip(id: string, blob: Blob): Promise<boolean> {
  try { await run("readwrite", (s) => s.put(blob, id)); return true; } catch { return false; }
}

export async function loadClip(id: string): Promise<Blob | null> {
  try { return ((await run("readonly", (s) => s.get(id))) as Blob | undefined) ?? null; } catch { return null; }
}

export async function deleteClip(id: string): Promise<void> {
  try { await run("readwrite", (s) => s.delete(id)); } catch { /* ignore */ }
}

export async function clearClips(): Promise<void> {
  try { await run("readwrite", (s) => s.clear()); } catch { /* ignore */ }
}
