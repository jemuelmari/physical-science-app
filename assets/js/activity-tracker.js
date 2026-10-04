/* ============================================================
   activity-tracker.js — Physical Science · Activity Logger
   Version: 1.1.0 — Cross-device sync via Google Apps Script
   Depends on: config.js, store.js
   ============================================================ */

window.ActivityTracker = (function () {
  'use strict';

  const EVENTS_KEY = 'physci_activity_log';
  const MAX_EVENTS = 500;

  function readLog() {
    try {
      const raw = localStorage.getItem(EVENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeLog(list) {
    try {
      const trimmed = list.slice(-MAX_EVENTS);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Grab the student profile from Store (in-memory current session)
  function getProfile() {
    if (window.Store && typeof Store.getStudent === 'function') {
      return Store.getStudent() || null;
    }
    return null;
  }

  // Fallback: read the profile from localStorage by LRN
  function getProfileByLrn(lrn) {
    if (!lrn) return null;
    try {
      const raw = localStorage.getItem('physci_profile_' + lrn);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Build the enriched event — carries name + grade + section
  function enrich(event) {
    const sessionProfile = getProfile();
    const lrn = event.lrn || (sessionProfile && sessionProfile.lrn) || null;
    const storedProfile = lrn ? getProfileByLrn(lrn) : null;
    const p = sessionProfile || storedProfile || {};

    return Object.assign({
      timestamp: new Date().toISOString(),
      lrn: lrn,
      lastName: p.lastName || '',
      firstName: p.firstName || '',
      middleName: p.middleName || '',
      gradeLevel: p.gradeLevel || '',
      section: p.section || '',
      subject: 'physci'
    }, event);
  }

  // ---- Remote push (fire-and-forget) ----
  function pushToBackend(entry) {
    const url = (window.CONFIG && CONFIG.gasEndpoint) || '';
    if (!url) return;

    const body = JSON.stringify({
      action: 'logEvent',
      payload: {
        timestamp: entry.timestamp,
        action: entry.action,
        lrn: entry.lrn,
        lastName: entry.lastName,
        firstName: entry.firstName,
        middleName: entry.middleName,
        gradeLevel: entry.gradeLevel,
        section: entry.section,
        week: entry.week || '',
        day: entry.day || '',
        code: entry.code || '',
        assessmentId: entry.assessmentId || '',
        score: entry.score || '',
        total: entry.total || '',
        percent: entry.percent || '',
        extra: entry.extra || {}
      }
    });

    try {
      // no-cors is required because Apps Script doesn't send CORS headers on POST.
      // We get fire-and-forget semantics — the write happens, we just can't read the reply.
      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body
      }).catch(() => { /* swallow network errors — offline students shouldn't crash */ });
    } catch (e) { /* noop */ }
  }

  function log(event) {
    if (!event || typeof event !== 'object') return false;
    const entry = enrich(event);
    const list = readLog();
    list.push(entry);
    writeLog(list);
    pushToBackend(entry);
    return true;
  }

  // ---- Convenience ----
  function logDayComplete(week, day, code) {
    if (window.Store && typeof Store.markDayComplete === 'function') {
      Store.markDayComplete(week, day);
    }
    return log({ action: 'day_complete', week, day, code });
  }

  function logAssessmentStart(assessmentId, subject) {
    return log({ action: 'assessment_start', assessmentId, subject: subject || 'physci' });
  }

  function logAssessmentSubmit(assessmentId, score, total, subject) {
    return log({
      action: 'assessment_submit',
      assessmentId,
      score, total,
      percent: total > 0 ? Math.round((score / total) * 100) : 0,
      subject: subject || 'physci'
    });
  }

  function logLessonView(week, day, code) {
    return log({ action: 'lesson_view', week, day, code });
  }

  function getEvents(filter) {
    const list = readLog();
    if (!filter) return list;
    return list.filter(filter);
  }

  function getEventsForStudent(lrn) {
    return getEvents(e => String(e.lrn) === String(lrn));
  }

  function countByAction(action) {
    return getEvents(e => e.action === action).length;
  }

  function clear() {
    try { localStorage.removeItem(EVENTS_KEY); return true; }
    catch (e) { return false; }
  }

  // ---- Remote fetch for teacher tracker ----
  async function fetchRemoteEvents(token) {
    const url = (window.CONFIG && CONFIG.gasEndpoint) || '';
    if (!url) return [];
    try {
      const params = new URLSearchParams({ action: 'activity', token: token || '' });
      const r = await fetch(url + '?' + params.toString());
      const j = await r.json();
      return (j && j.ok && Array.isArray(j.events)) ? j.events : [];
    } catch (e) {
      console.warn('ActivityTracker.fetchRemoteEvents failed:', e);
      return [];
    }
  }

  return {
    log,
    logDayComplete,
    logAssessmentStart,
    logAssessmentSubmit,
    logLessonView,
    getEvents,
    getEventsForStudent,
    countByAction,
    clear,
    fetchRemoteEvents
  };
})();
