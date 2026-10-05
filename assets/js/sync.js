/* ============================================================
   sync.js — Physical Science · Cloud Sync v2.0.0
   Auto-syncs: records, activities, students, sync codes.
   ============================================================ */

window.Sync = (function () {
  'use strict';

  const QUEUE_KEY = 'physci_sync_queue';

  function cfg() { return window.PHYSCI_CONFIG || {}; }
  function isEnabled() {
    const c = cfg();
    return !!c.gasEndpoint && c.syncEnabled !== false;
  }
  function getToken() {
    return cfg().gasToken || '';
  }
  function getEndpoint() {
    return cfg().gasEndpoint || '';
  }

  // ---- Queue ----
  function readQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeQueue(list) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(list.slice(-500))); return true; }
    catch (e) { return false; }
  }
  function enqueue(job) {
    const q = readQueue();
    q.push(Object.assign({ attempts: 0, enqueuedAt: new Date().toISOString() }, job));
    writeQueue(q);
  }
  function clearQueue() {
    try { localStorage.removeItem(QUEUE_KEY); return true; } catch (e) { return false; }
  }

  // ---- Core POST ----
  async function postJSON(body) {
    const url = getEndpoint();
    if (!url) throw new Error('No gasEndpoint configured');

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ---- GET ----
  async function getJSON(query) {
    const url = getEndpoint();
    if (!url) throw new Error('No gasEndpoint configured');
    const full = url + (url.includes('?') ? '&' : '?') + query;
    const res = await fetch(full);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ---- Save student profile (on register/login) ----
  async function saveStudent(student) {
    if (!isEnabled() || !student || !student.lrn) return { ok: false, skipped: true };
    const payload = {
      lrn: student.lrn,
      lastName: student.lastName || '',
      firstName: student.firstName || '',
      middleName: student.middleName || '',
      gradeLevel: student.gradeLevel || '',
      section: student.section || '',
      sex: student.sex || '',
      pin: student.pin || '',
      createdAt: student.createdAt || new Date().toISOString()
    };
    try {
      const res = await postJSON({ action: 'saveStudent', payload });
      return res;
    } catch (e) {
      enqueue({ action: 'saveStudent', payload });
      return { ok: false, error: String(e), queued: true };
    }
  }

  // ---- Save assessment record ----
  async function push(record) {
    if (!isEnabled()) return { ok: false, skipped: true };

    const payload = {
      lrn: record.lrn,
      lastName: record.lastName,
      firstName: record.firstName,
      middleName: record.middleName || '',
      gradeLevel: record.gradeLevel,
      section: record.section,
      subject: record.subject || 'physci',
      type: record.type,
      assessmentId: record.assessmentId,
      score: record.score,
      total: record.total,
      percent: record.percent,
      finalGrade: record.finalGrade,
      passed: !!record.passed,
      autoSubmitted: !!record.autoSubmitted,
      timeSpent: record.timeSpent,
      timestamp: record.timestamp || new Date().toISOString(),
      answers: record.answers || {},
      breakdown: record.breakdown || []
    };

    try {
      const res = await postJSON({ action: 'saveRecord', payload });
      if (res && res.ok) {
        if (window.Store) Store.setLastSync(new Date().toISOString());
        return res;
      }
      throw new Error(res && res.error ? res.error : 'backend error');
    } catch (e) {
      enqueue({ action: 'saveRecord', payload });
      return { ok: false, error: String(e), queued: true };
    }
  }

  // ---- Save activity (lesson / day / week events) ----
  async function pushActivity(event) {
    if (!isEnabled()) return { ok: false, skipped: true };

    const student = (window.Store && Store.getStudent()) || {};
    const payload = {
      timestamp: event.timestamp || new Date().toISOString(),
      lrn: event.lrn || student.lrn || '',
      lastName: event.lastName || student.lastName || '',
      firstName: event.firstName || student.firstName || '',
      action: event.action || 'activity',
      week: event.week,
      day: event.day,
      code: event.code,
      assessmentId: event.assessmentId,
      score: event.score,
      total: event.total,
      percent: event.percent
    };

    if (!payload.lrn) return { ok: false, skipped: true };

    try {
      const res = await postJSON({ action: 'saveActivity', payload });
      if (res && res.ok) {
        if (window.Store) Store.setLastSync(new Date().toISOString());
        return res;
      }
      throw new Error(res && res.error ? res.error : 'backend error');
    } catch (e) {
      enqueue({ action: 'saveActivity', payload });
      return { ok: false, error: String(e), queued: true };
    }
  }

  // ---- Generate code ----
  async function generateCode() {
    const student = (window.Store && Store.getStudent()) || {};
    if (!student.lrn) throw new Error('Not logged in');
    const res = await postJSON({
      action: 'generateCode',
      payload: { lrn: student.lrn }
    });
    return res;
  }

  // ---- Redeem code (teacher) ----
  async function redeemCode(code) {
    const res = await postJSON({
      action: 'redeemCode',
      payload: { code }
    });
    return res;
  }

  // ---- Teacher: fetch all ----
  async function fetchAll() {
    const token = getToken();
    const [recordsRes, activitiesRes, studentsRes] = await Promise.all([
      getJSON('action=list&token=' + encodeURIComponent(token)),
      getJSON('action=listActivities&token=' + encodeURIComponent(token)),
      getJSON('action=listStudents&token=' + encodeURIComponent(token))
    ]);
    return {
      records: (recordsRes && recordsRes.records) || [],
      activities: (activitiesRes && activitiesRes.activities) || [],
      students: (studentsRes && studentsRes.students) || []
    };
  }

  // ---- Flush queue ----
  async function flush() {
    if (!isEnabled()) return { ok: false, skipped: true };
    const q = readQueue();
    if (!q.length) return { ok: true, sent: 0 };

    let sent = 0;
    const remaining = [];

    for (const job of q) {
      try {
        const res = await postJSON({ action: job.action, payload: job.payload });
        if (res && res.ok) sent++;
        else {
          job.attempts++;
          if (job.attempts < 5) remaining.push(job);
        }
      } catch (e) {
        job.attempts++;
        if (job.attempts < 5) remaining.push(job);
      }
    }

    writeQueue(remaining);
    if (sent > 0 && window.Store) Store.setLastSync(new Date().toISOString());
    return { ok: true, sent, remaining: remaining.length };
  }

  // ---- Ping ----
  async function ping() {
    if (!isEnabled()) return { ok: false, skipped: true };
    try {
      const url = getEndpoint() + (getEndpoint().includes('?') ? '&' : '?') + 'action=ping';
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  // ---- Auto-flush every 60s ----
  let flushTimer = null;
  function startAutoFlush() {
    if (flushTimer) return;
    flushTimer = setInterval(() => { flush().catch(() => {}); }, 60000);
  }
  function stopAutoFlush() {
    if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
  }

  // ---- Wire online + init ----
  window.addEventListener('online', () => { flush().catch(() => {}); });
  document.addEventListener('DOMContentLoaded', () => {
    if (isEnabled()) {
      startAutoFlush();
      setTimeout(() => { flush().catch(() => {}); }, 3000);
    }
  });

  return {
    isEnabled,
    saveStudent,
    push,
    pushActivity,
    generateCode,
    redeemCode,
    fetchAll,
    flush,
    ping,
    readQueue,
    clearQueue,
    startAutoFlush,
    stopAutoFlush
  };
})();
