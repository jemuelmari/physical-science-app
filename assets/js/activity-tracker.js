/* ============================================================
   activity-tracker.js — Physical Science · Activity Logger
   Version: 1.0.0
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

  function log(event) {
    if (!event || typeof event !== 'object') return false;
    const student = (window.Store && Store.getStudent()) || null;
    const entry = Object.assign({
      timestamp: new Date().toISOString(),
      lrn: student ? student.lrn : null,
      subject: 'physci'
    }, event);

    const list = readLog();
    list.push(entry);
    writeLog(list);
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

  return {
    log,
    logDayComplete,
    logAssessmentStart,
    logAssessmentSubmit,
    logLessonView,
    getEvents,
    getEventsForStudent,
    countByAction,
    clear
  };
})();
