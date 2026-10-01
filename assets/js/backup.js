/* ============================================================
   backup.js — Physical Science · Data Backup & Restore
   Version: 1.0.0
   Depends on: config.js, store.js
   ============================================================ */

window.Backup = (function () {
  'use strict';

  const VERSION = 1;

  function buildSnapshot() {
    return {
      version: VERSION,
      app: 'Physical Science Online Modular App',
      appVersion: (window.PHYSCI_CONFIG && window.PHYSCI_CONFIG.version) || '1.0.0',
      exportedAt: new Date().toISOString(),
      student:  (window.Store && Store.getStudent()) || null,
      teacher:  (window.Store && Store.getTeacher()) || null,
      records:  (window.Store && Store.getRecords()) || [],
      progress: (window.Store && Store.getProgress()) || {},
      codes:    (window.Store && Store.getCodes()) || []
    };
  }

  function download(filename) {
    const snapshot = buildSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `physci-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return snapshot;
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try { resolve(JSON.parse(reader.result)); }
        catch (e) { reject(new Error('Invalid JSON file.')); }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }

  function restore(snapshot, opts) {
    const options = Object.assign({ mergeRecords: true, overwriteStudent: false }, opts || {});
    if (!snapshot || typeof snapshot !== 'object') throw new Error('Invalid snapshot.');

    const summary = { records: 0, imported: 0, skipped: 0 };

    // Restore records (merge or replace)
    if (Array.isArray(snapshot.records)) {
      const existing = (window.Store && Store.getRecords()) || [];

      if (options.mergeRecords) {
        const key = r => `${r.lrn}|${r.assessmentId}`;
        const seen = new Set(existing.map(key));
        snapshot.records.forEach(r => {
          summary.records++;
          if (!seen.has(key(r))) {
            existing.push(r);
            summary.imported++;
          } else {
            summary.skipped++;
          }
        });
        localStorage.setItem('physci_records', JSON.stringify(existing));
      } else {
        localStorage.setItem('physci_records', JSON.stringify(snapshot.records));
        summary.imported = snapshot.records.length;
      }
    }

    // Restore progress
    if (snapshot.progress && typeof snapshot.progress === 'object') {
      if (window.Store && Store.getProgress && Object.keys(Store.getProgress()).length) {
        // Merge
        const existing = Store.getProgress();
        const merged = deepMerge(existing, snapshot.progress);
        localStorage.setItem('physci_progress', JSON.stringify(merged));
      } else {
        localStorage.setItem('physci_progress', JSON.stringify(snapshot.progress));
      }
    }

    // Restore student (optional)
    if (options.overwriteStudent && snapshot.student) {
      localStorage.setItem('physci_student', JSON.stringify(snapshot.student));
    }

    // Restore codes (optional append)
    if (Array.isArray(snapshot.codes)) {
      localStorage.setItem('physci_codes', JSON.stringify(snapshot.codes));
    }

    return summary;
  }

  function deepMerge(a, b) {
    if (!a || typeof a !== 'object') return b;
    if (!b || typeof b !== 'object') return a;
    const out = Array.isArray(a) ? a.slice() : Object.assign({}, a);
    Object.keys(b).forEach(k => {
      if (typeof b[k] === 'object' && b[k] !== null && !Array.isArray(b[k])) {
        out[k] = deepMerge(out[k], b[k]);
      } else {
        out[k] = b[k];
      }
    });
    return out;
  }

  function clearAll() {
    if (window.Store && Store.clearAll) return Store.clearAll();
    ['physci_student', 'physci_teacher', 'physci_records', 'physci_progress', 'physci_codes', 'physci_activity_log', 'physci_sync_queue']
      .forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    return true;
  }

  return {
    buildSnapshot,
    download,
    readFile,
    restore,
    clearAll,
    VERSION
  };
})();
