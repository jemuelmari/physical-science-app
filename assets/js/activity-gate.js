/* ============================================================
   activity-gate.js — Physical Science · Assessment Gating (v3.0.0)
   Gating disabled — everything is open.
   ============================================================ */

window.ActivityGate = (function () {
  'use strict';

  const TOTAL_DAYS_PER_WEEK = 4;

  function registry() {
    return (window.App && App.getRegistry) ? App.getRegistry() : { gating: {} };
  }

  function getRequirement(assessmentId) {
    const g = registry().gating || {};
    return g[assessmentId] || null;
  }

  function isWeekComplete(week) {
    if (!window.Store) return false;
    return Store.isWeekComplete(Number(week), TOTAL_DAYS_PER_WEEK);
  }

  // ---- GATING DISABLED — EVERYTHING IS UNLOCKED ----
  function isUnlocked(assessmentId) {
    // To re-enable gating later, replace this with:
    // const req = getRequirement(assessmentId);
    // if (!req || !req.requiresWeek) return true;
    // return isWeekComplete(req.requiresWeek);
    return true;
  }

  function getLockReason(assessmentId) {
    return null;
  }

  function getStatus(assessmentId) {
    return {
      assessmentId,
      unlocked: true,
      reason: null,
      requirement: null
    };
  }

  function listUnlocked() {
    const list = (window.App && App.getAssessments) ? App.getAssessments() : [];
    return list;
  }

  function listLocked() {
    return [];
  }

  function applyLocks(selector) {
    // No-op — nothing is locked
    return;
  }

  return {
    isUnlocked,
    getLockReason,
    getStatus,
    getRequirement,
    isWeekComplete,
    listUnlocked,
    listLocked,
    applyLocks
  };
})();
