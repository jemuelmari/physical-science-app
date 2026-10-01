/* ============================================================
   sync.js — Physical Science · Cloud Sync (Google Apps Script)
   Version: 1.0.0
   Depends on: config.js, store.js, security.js
   ============================================================ */

window.Sync = (function () {
  'use strict';

  const QUEUE_KEY = 'physci_sync_queue';
  const BACKOFF_MS = [2000, 5000, 15000, 30000, 60000];

  function cfg() {
    return window.PHYSCI_CONFIG || {};
  }

  function isEnabled() {
    const c = cfg();
    return !!c.gasEndpoint && (c.syncEnabled !== false);
  }

  // ---- Queue ----
  function readQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function writeQueue(list) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(list.slice(-200)));
      return true;
    } catch (e) { return false; }
  }

  function enqueue(record) {
    const q = readQueue();
    q.push({ record, attempts: 0, enqueuedAt: new Date().toISOString() });
    return writeQueue(q);
  }

  function clearQueue() {
    try { localStorage.removeItem(QUEUE_KEY); return true; }
    catch (e) { return false; }
  }

  // ---- Signed POST ----
  async function postJSON(body) {
    const c = cfg();
    const url = c.gasEndpoint;
    if (!url) throw new Error('No gasEndpoint configured');

    // Sign the payload
    let signature = '';
    try {
      if (window.Security && typeof Security.signPayload === 'function') {
        signature = await Security.signPayload(body.payload || body);
      }
    } catch (e) { /* noop */ }

    const finalBody = Object.assign({}, body, { signature });

    const res = await fetch(url, {
      method: 'POST',
      // text/plain avoids CORS preflight on Apps Script
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(finalBody)
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ---- High-level actions ----
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
      const data = await postJSON({ action: 'saveRecord', payload });
      if (data && data.ok) {
        if (window.Store) Store.setLastSync(new Date().toISOString());
        return data;
      }
      throw new Error(data && data.error ? data.error : 'Unknown backend error');
    } catch (err) {
      console.warn('Sync.push failed, queuing:', err);
      enqueue(record);
      return { ok: false, error: String(err), queued: true };
    }
  }

  async function flush() {
    if (!isEnabled()) return { ok: false, skipped: true };
    const q = readQueue();
    if (!q.length) return { ok: true, sent: 0 };

    let sent = 0;
    const remaining = [];

    for (const item of q) {
      try {
        const data = await postJSON({ action: 'saveRecord', payload: item.record });
        if (data && data.ok) {
          sent++;
        } else {
          item.attempts++;
          if (item.attempts < BACKOFF_MS.length) remaining.push(item);
        }
      } catch (e) {
        item.attempts++;
        if (item.attempts < BACKOFF_MS.length) remaining.push(item);
      }
    }

    writeQueue(remaining);
    if (sent > 0 && window.Store) Store.setLastSync(new Date().toISOString());
    return { ok: true, sent, remaining: remaining.length };
  }

  async function ping() {
    if (!isEnabled()) return { ok: false, skipped: true };
    try {
      const url = cfg().gasEndpoint + (cfg().gasEndpoint.includes('?') ? '&' : '?') + 'action=ping';
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  // ---- Periodic flush ----
  let flushTimer = null;
  function startAutoFlush() {
    if (flushTimer) return;
    const mins = Number(cfg().syncIntervalMinutes) || 30;
    flushTimer = setInterval(() => { flush().catch(() => {}); }, mins * 60 * 1000);
  }

  function stopAutoFlush() {
    if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
  }

  // ---- Wire online event ----
  window.addEventListener('online', () => { flush().catch(() => {}); });
  document.addEventListener('DOMContentLoaded', () => {
    if (isEnabled()) {
      startAutoFlush();
      // Attempt a flush shortly after load
      setTimeout(() => { flush().catch(() => {}); }, 3000);
    }
  });

  return {
    isEnabled,
    push,
    flush,
    ping,
    enqueue,
    clearQueue,
    readQueue,
    startAutoFlush,
    stopAutoFlush
  };
})();
