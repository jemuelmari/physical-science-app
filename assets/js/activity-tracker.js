/* ============================================================
   activity-tracker.js — Physical Science · Activity Logger v2.0.0
   Auto-syncs every activity to backend via Sync.pushActivity()
   ============================================================ */

window.ActivityTracker = (function () {
  'use strict';

  const EVENTS_KEY = 'physci_activity_log';
  const MAX_EVENTS = 500;

  function readLog() {
    try {
      const raw = localStorage.getItem(EVENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function writeLog(list) {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(-MAX_EVENTS)));
      return true;
    } catch (e) { return false; }
  }

  // ---- Log event locally + push to backend ----
  function log(event) {
    if (!event || typeof event !== 'object') return false;

    const student = (window.Store && Store.getStudent()) || null;
    const entry = Object.assign({
      timestamp: new Date().toISOString(),
      lrn: student ? student.lrn : null,
      lastName: student ? student.lastName : null,
      firstName: student ? student.firstName : null,
      subject: 'physci'
    }, event);

    // Save locally
    const list = readLog();
    list.push(entry);
    writeLog(list);

    // ---- Push to backend automatically ----
    if (window.Sync && typeof Sync.pushActivity === 'function') {
      Sync.pushActivity(entry).catch(err => {
        console.warn('Activity sync failed:', err);
      });
    }

    return true;
  }

  function logStudentLogin() {
    const s = (window.Store && Store.getStudent()) || {};
    return log({
      action: 'student_login',
      lrn: s.lrn,
      lastName: s.lastName,
      firstName: s.firstName
    });
  }

  function logStudentRegister() {
    const s = (window.Store && Store.getStudent()) || {};
    return log({
      action: 'student_register',
      lrn: s.lrn,
      lastName: s.lastName,
      firstName: s.firstName
    });
  }

  function logDayComplete(week, day, code) {
    if (window.Store && typeof Store.markDayComplete === 'function') {
      Store.markDayComplete(week, day);
    }
    return log({ action: 'day_complete', week, day, code });
  }

  function logWeekComplete(week) {
    return log({ action: 'week_complete', week });
  }

  function logAssessmentStart(assessmentId) {
    return log({ action: 'assessment_start', assessmentId });
  }

  function logAssessmentSubmit(assessmentId, score, total) {
    return log({
      action: 'assessment_submit',
      assessmentId,
      score,
      total,
      percent: total > 0 ? Math.round((score / total) * 100) : 0
    });
  }

  function logQuizSubmit(week, day, score, total, xpEarned) {
    return log({
      action: 'quiz_submit',
      week,
      day,
      score,
      total,
      percent: total > 0 ? Math.round((score / total) * 100) : 0,
      xpEarned
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
    try { localStorage.removeItem(EVENTS_KEY); return true; } catch (e) { return false; }
  }

  return {
    log,
    logStudentLogin,
    logStudentRegister,
    logDayComplete,
    logWeekComplete,
    logAssessmentStart,
    logAssessmentSubmit,
    logQuizSubmit,
    logLessonView,
    getEvents,
    getEventsForStudent,
    countByAction,
    clear
  };
})();
