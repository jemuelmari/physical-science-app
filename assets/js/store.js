/* ============================================================
   store.js — Physical Science · Local Storage Layer
   Version: 1.0.0
   Depends on: config.js
   ============================================================ */

window.Store = (function () {
  'use strict';

  const KEYS = {
    student:  'physci_student',
    records:  'physci_records',
    progress: 'physci_progress',
    teacher:  'physci_teacher',
    lastSync: 'physci_last_sync',
    codes:    'physci_codes'
  };

  // ---- Low-level helpers ----
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('store.read failed for', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('store.write failed for', key, e);
      return false;
    }
  }

  function remove(key) {
    try { localStorage.removeItem(key); return true; }
    catch (e) { return false; }
  }

  // ---- Student ----
  function getStudent() {
    return read(KEYS.student, null);
  }

  function setStudent(student) {
    return write(KEYS.student, student);
  }

  function clearStudent() {
    return remove(KEYS.student);
  }

  // ---- Records ----
  function getRecords() {
    const list = read(KEYS.records, []);
    return Array.isArray(list) ? list : [];
  }

  function saveRecord(record) {
    const list = getRecords();
    const idx = list.findIndex(r =>
      String(r.lrn) === String(record.lrn) &&
      String(r.assessmentId) === String(record.assessmentId)
    );
    if (idx >= 0) {
      list[idx] = Object.assign({}, list[idx], record, { updatedAt: new Date().toISOString() });
    } else {
      list.push(Object.assign({}, record, { createdAt: new Date().toISOString() }));
    }
    return write(KEYS.records, list);
  }

  function getRecord(lrn, assessmentId) {
    return getRecords().find(r =>
      String(r.lrn) === String(lrn) &&
      String(r.assessmentId) === String(assessmentId)
    ) || null;
  }

  function getRecordsByStudent(lrn) {
    return getRecords().filter(r => String(r.lrn) === String(lrn));
  }

  function clearRecords() {
    return remove(KEYS.records);
  }

  // ---- Progress ----
  function getProgress() {
    const p = read(KEYS.progress, {});
    return (p && typeof p === 'object') ? p : {};
  }

  function markDayComplete(week, day) {
    const p = getProgress();
    if (!p.weeks) p.weeks = {};
    if (!p.weeks[week]) p.weeks[week] = {};
    p.weeks[week]['day' + day] = true;
    p.lastUpdated = new Date().toISOString();
    return write(KEYS.progress, p);
  }

  function isDayComplete(week, day) {
    const p = getProgress();
    return !!(p.weeks && p.weeks[week] && p.weeks[week]['day' + day]);
  }

  function isWeekComplete(week, totalDays) {
    const total = totalDays || 4;
    for (let d = 1; d <= total; d++) {
      if (!isDayComplete(week, d)) return false;
    }
    return true;
  }

  function getWeekProgress(week, totalDays) {
    const total = totalDays || 4;
    let done = 0;
    for (let d = 1; d <= total; d++) {
      if (isDayComplete(week, d)) done++;
    }
    return { done, total, percent: Math.round((done / total) * 100) };
  }

  function clearProgress() {
    return remove(KEYS.progress);
  }

  // ---- Teacher ----
  function getTeacher() {
    return read(KEYS.teacher, null);
  }

  function setTeacher(teacher) {
    return write(KEYS.teacher, teacher);
  }

  function clearTeacher() {
    return remove(KEYS.teacher);
  }

  // ---- Sync ----
  function getLastSync() {
    return read(KEYS.lastSync, null);
  }

  function setLastSync(iso) {
    return write(KEYS.lastSync, iso || new Date().toISOString());
  }

  // ---- Codes ----
  function getCodes() {
    const list = read(KEYS.codes, []);
    return Array.isArray(list) ? list : [];
  }

  function saveCode(entry) {
    const list = getCodes();
    list.push(Object.assign({}, entry, { addedAt: new Date().toISOString() }));
    return write(KEYS.codes, list);
  }

  function clearCodes() {
    return remove(KEYS.codes);
  }

  // ---- Nuke ----
  function clearAll() {
    Object.values(KEYS).forEach(remove);
  }

  // ---- Public API ----
  return {
    KEYS,
    getStudent, setStudent, clearStudent,
    getRecords, saveRecord, getRecord, getRecordsByStudent, clearRecords,
    getProgress, markDayComplete, isDayComplete, isWeekComplete, getWeekProgress, clearProgress,
    getTeacher, setTeacher, clearTeacher,
    getLastSync, setLastSync,
    getCodes, saveCode, clearCodes,
    clearAll
  };
})();
