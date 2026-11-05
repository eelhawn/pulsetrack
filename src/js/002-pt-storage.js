
    /* PulseTrack storage with no size limit.
     * Phones cap localStorage at about 5 MB. PTLS behaves like localStorage, but anything that does not fit
     * moves into IndexedDB (hundreds of MB or more). It loads that overflow before the app starts. */
    const PTLS = (function () {
      const DB_NAME = "pulsetrack-store", STORE = "kv";
      let LS = null;
      try { LS = window.localStorage; LS.getItem("pulsetrack_probe"); } catch (e) { LS = null; }
      const over = new Map();           // key -> string value that lives in IndexedDB
      let db = null, degraded = false;
      let warned = false;
      const warn = err => {
        console.error("PulseTrack storage error", err);
        if (warned) return; warned = true;
        try { if (window.PT && PT.alert) PT.alert("PulseTrack could not save to this phone's storage, so your last change may NOT be saved.\n\nGo to Settings → Data & Backup → Export Backup, then free up space on your phone."); } catch (e) {}
      };
      const put = (k, v) => { if (!db || degraded) return; try { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put(v, k); tx.onerror = tx.onabort = () => warn(tx.error); } catch (e) { warn(e); } };
      const del = k => { if (!db || degraded) return; try { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(k); } catch (e) {} };
      const ready = new Promise(resolve => {
        let settled = false;
        const finish = () => { if (!settled) { settled = true; resolve(); } };
        if (!("indexedDB" in window) || !window.indexedDB) { finish(); return; }
        // If IndexedDB never answers (rare browser bug), start anyway but never write to it, so nothing can be overwritten.
        const timer = setTimeout(() => { degraded = true; finish(); }, 7000);
        try {
          const req = indexedDB.open(DB_NAME, 1);
          req.onupgradeneeded = () => { try { req.result.createObjectStore(STORE); } catch (e) {} };
          req.onerror = req.onblocked = () => { clearTimeout(timer); finish(); };
          req.onsuccess = () => {
            db = req.result;
            try {
              const tx = db.transaction(STORE, "readonly"), cur = tx.objectStore(STORE).openCursor();
              cur.onsuccess = e => { const c = e.target.result; if (c) { over.set(String(c.key), c.value); c.continue(); } };
              tx.oncomplete = () => { clearTimeout(timer); finish(); };
              tx.onerror = tx.onabort = () => { clearTimeout(timer); degraded = true; finish(); };
            } catch (e) { clearTimeout(timer); degraded = true; finish(); }
          };
        } catch (e) { clearTimeout(timer); finish(); }
      });
      const lsKeys = () => { const out = []; if (LS) for (let i = 0; i < LS.length; i++) out.push(LS.key(i)); return out; };
      const allKeys = () => { const s = new Set(lsKeys()); over.forEach((v, k) => s.add(k)); return [...s]; };
      let snap = [];
      return {
        ready,
        getItem(k) { return over.has(k) ? over.get(k) : (LS ? LS.getItem(k) : null); },
        setItem(k, v) {
          v = String(v);
          if (LS) {
            try { LS.setItem(k, v); if (over.has(k)) { over.delete(k); del(k); } return; } catch (e) { /* no room: spill to the big store */ }
          }
          if (!db || degraded) throw new Error("No storage space left");
          over.set(k, v); put(k, v);
          if (LS) { try { LS.removeItem(k); } catch (e) {} }
        },
        removeItem(k) { if (over.has(k)) { over.delete(k); del(k); } if (LS) { try { LS.removeItem(k); } catch (e) {} } },
        key(i) { return (snap.length > i ? snap : allKeys())[i] || null; },
        get length() { snap = allKeys(); return snap.length; },
        /** Bytes held in the big store (for the Settings meter). */
        overflowBytes() { let n = 0; over.forEach((v, k) => { n += (k.length + v.length) * 2; }); return n; },
        isDegraded() { return degraded; }
      };
    })();
  