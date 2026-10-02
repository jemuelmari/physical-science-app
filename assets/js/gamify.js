/* ============================================================
   gamify.js — Physical Science · Gamification Engine
   Version: 1.0.0
   Depends on: config.js, store.js, app.js, ui-helpers.js
   Provides: window.Gamify
   ============================================================ */

window.Gamify = (function () {
  'use strict';

  // ---- Storage keys ----
  const XP_KEY      = 'physci_xp';
  const STREAK_KEY  = 'physci_streak';
  const BADGES_KEY  = 'physci_badges';
  const LESSON_KEY  = 'physci_lesson_scores';

  // ---- XP rewards ----
  const XP = {
    day_complete: 20,
    quiz_perfect: 30,
    quiz_pass: 15,
    streak_bonus: 5,      // per consecutive day
    week_complete: 100,
    badge: 50
  };

  // ---- Badge definitions ----
  const BADGE_DEFS = [
    { id: 'first_step',     icon: '👣', name: 'First Step',          desc: 'Complete your first lesson' },
    { id: 'week1_done',     icon: '🌌', name: 'Cosmic Explorer',     desc: 'Complete Week 1 — Cosmic Origins' },
    { id: 'week2_done',     icon: '🏛️', name: 'Philosopher',         desc: 'Complete Week 2 — Ancient Greece' },
    { id: 'week3_done',     icon: '⚗️', name: 'Apprentice Alchemist', desc: 'Complete Week 3 — Alchemy' },
    { id: 'week4_done',     icon: '⚛️', name: 'Atomist',             desc: 'Complete Week 4 — Atomic Theory' },
    { id: 'week5_done',     icon: '🔬', name: 'Subatomic Pioneer',   desc: 'Complete Week 5 — Subatomic Revolution' },
    { id: 'week6_done',     icon: '☢️', name: 'Nuclear Scientist',   desc: 'Complete Week 6 — Nuclear Age' },
    { id: 'week7_done',     icon: '🧪', name: 'Bond Master',         desc: 'Complete Week 7 — Chemical Bonding' },
    { id: 'week8_done',     icon: '🏭', name: 'Industrial Chemist',  desc: 'Complete Week 8 — Industrial Chemistry' },
    { id: 'week9_done',     icon: '🧴', name: 'Consumer Chemist',    desc: 'Complete Week 9 — Consumer Chemistry' },
    { id: 'week10_done',    icon: '🔭', name: 'Cosmologist',         desc: 'Complete Week 10 — Cosmos & Motion' },
    { id: 'perfect_quiz',   icon: '💯', name: 'Perfect Score',       desc: 'Get 3/3 on any day quiz' },
    { id: 'streak_3',       icon: '🔥', name: 'On Fire',             desc: '3-day streak' },
    { id: 'streak_7',       icon: '⚡', name: 'Unstoppable',         desc: '7-day streak' },
    { id: 'half_way',       icon: '🎯', name: 'Halfway There',       desc: 'Complete 20 days' },
    { id: 'graduate',       icon: '🎓', name: 'Physical Scientist',  desc: 'Complete all 40 days' },
    { id: 'quiz_ace',       icon: '🏆', name: 'Quiz Ace',            desc: 'Pass 10 day quizzes' }
  ];

  // ============================================================
  // STORAGE HELPERS
  // ============================================================
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  function getLrn() {
    const s = (window.Store && Store.getStudent()) || null;
    return s ? s.lrn : 'anonymous';
  }

  function xpKey()      { return XP_KEY + '_' + getLrn(); }
  function streakKey()  { return STREAK_KEY + '_' + getLrn(); }
  function badgesKey()  { return BADGES_KEY + '_' + getLrn(); }
  function lessonKey()  { return LESSON_KEY + '_' + getLrn(); }

  // ============================================================
  // XP
  // ============================================================
  function getXP() {
    return Number(read(xpKey(), 0)) || 0;
  }

  function addXP(amount, reason) {
    const current = getXP();
    const next = current + Number(amount || 0);
    write(xpKey(), next);
    if (reason) logXPHistory(amount, reason);
    return next;
  }

  function getLevel() {
    // Level = every 200 XP
    const xp = getXP();
    const level = Math.floor(xp / 200) + 1;
    const intoLevel = xp % 200;
    return { level, intoLevel, nextLevelAt: 200, percent: Math.round((intoLevel / 200) * 100) };
  }

  function getXPHistory() {
    return read('physci_xp_history_' + getLrn(), []);
  }

  function logXPHistory(amount, reason) {
    const history = getXPHistory();
    history.push({ amount, reason, timestamp: new Date().toISOString() });
    write('physci_xp_history_' + getLrn(), history.slice(-100));
  }

  // ============================================================
  // STREAK
  // ============================================================
  function getStreak() {
    return read(streakKey(), { count: 0, lastDate: null });
  }

  function bumpStreak() {
    const s = getStreak();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (s.lastDate === today) return s.count;
    if (s.lastDate === yesterday) s.count += 1;
    else s.count = 1;

    s.lastDate = today;
    write(streakKey(), s);
    return s.count;
  }

  // ============================================================
  // LESSON QUIZ SCORES
  // ============================================================
  function getLessonScores() {
    return read(lessonKey(), {});
  }

  function getDayScore(week, day) {
    const all = getLessonScores();
    return all[week + '-' + day] || null;
  }

  function saveDayScore(week, day, correct, total) {
    const all = getLessonScores();
    const key = week + '-' + day;
    const prev = all[key];

    // Only keep the best score
    if (!prev || correct > prev.correct) {
      all[key] = { correct, total, percent: Math.round((correct / total) * 100), at: new Date().toISOString() };
      write(lessonKey(), all);
    }
    return all[key];
  }

  function countPassedQuizzes() {
    const all = getLessonScores();
    return Object.values(all).filter(s => s.percent >= 67).length;
  }

  // ============================================================
  // BADGES
  // ============================================================
  function getBadges() {
    const unlocked = read(badgesKey(), {});
    return BADGE_DEFS.map(b => Object.assign({}, b, {
      unlocked: !!unlocked[b.id],
      unlockedAt: unlocked[b.id] || null
    }));
  }

  function unlockBadge(id) {
    const unlocked = read(badgesKey(), {});
    if (unlocked[id]) return false;
    unlocked[id] = new Date().toISOString();
    write(badgesKey(), unlocked);
    addXP(XP.badge, 'badge:' + id);
    // Trigger a UI toast if available
    if (window.UI && UI.toast) {
      const def = BADGE_DEFS.find(b => b.id === id);
      if (def) UI.toast(`${def.icon} Badge unlocked: ${def.name}`, 'success', 4000);
    }
    return true;
  }

  function checkBadges(triggerContext) {
    const ctx = triggerContext || {};
    const unlocked = read(badgesKey(), {});
    const newly = [];

    // First step
    if (!unlocked.first_step && ctx.daysCompleted >= 1) {
      if (unlockBadge('first_step')) newly.push('first_step');
    }

    // Week complete
    if (ctx.weekComplete && !unlocked['week' + ctx.weekComplete + '_done']) {
      if (unlockBadge('week' + ctx.weekComplete + '_done')) newly.push('week' + ctx.weekComplete + '_done');
    }

    // Perfect quiz
    if (ctx.quizResult && ctx.quizResult.correct === ctx.quizResult.total && !unlocked.perfect_quiz) {
      if (unlockBadge('perfect_quiz')) newly.push('perfect_quiz');
    }

    // Streaks
    if (ctx.streak >= 3 && !unlocked.streak_3) {
      if (unlockBadge('streak_3')) newly.push('streak_3');
    }
    if (ctx.streak >= 7 && !unlocked.streak_7) {
      if (unlockBadge('streak_7')) newly.push('streak_7');
    }

    // Halfway
    if (ctx.daysCompleted >= 20 && !unlocked.half_way) {
      if (unlockBadge('half_way')) newly.push('half_way');
    }

    // Graduate
    if (ctx.daysCompleted >= 40 && !unlocked.graduate) {
      if (unlockBadge('graduate')) newly.push('graduate');
    }

    // Quiz ace
    if (countPassedQuizzes() >= 10 && !unlocked.quiz_ace) {
      if (unlockBadge('quiz_ace')) newly.push('quiz_ace');
    }

    return newly;
  }

  // ============================================================
  // DAY COMPLETION (called by lesson-engine)
  // ============================================================
  function completeDay(week, day) {
    // Mark in Store
    if (window.Store && Store.markDayComplete) {
      Store.markDayComplete(week, day);
    }

    // Award XP
    addXP(XP.day_complete, `day:${week}-${day}`);

    // Bump streak and grant bonus
    const streak = bumpStreak();
    if (streak > 1) addXP(XP.streak_bonus * (streak - 1), 'streak');

    // Count total completed days
    const daysCompleted = countDaysCompleted();

    // Check week completion
    let weekComplete = null;
    if (window.Store && Store.isWeekComplete && Store.isWeekComplete(week, 4)) {
      weekComplete = week;
      addXP(XP.week_complete, `week:${week}`);
    }

    // Check badges
    checkBadges({ daysCompleted, weekComplete, streak });

    return { xp: getXP(), streak, daysCompleted };
  }

  function countDaysCompleted() {
    if (!window.Store || !Store.isDayComplete) return 0;
    let n = 0;
    for (let w = 1; w <= 10; w++) {
      for (let d = 1; d <= 4; d++) {
        if (Store.isDayComplete(w, d)) n++;
      }
    }
    return n;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  return {
    // Constants
    XP,
    BADGE_DEFS,

    // XP
    getXP, addXP, getLevel, getXPHistory,

    // Streak
    getStreak, bumpStreak,

    // Lesson scores
    getLessonScores, getDayScore, saveDayScore, countPassedQuizzes,

    // Badges
    getBadges, unlockBadge, checkBadges,

    // Day flow
    completeDay, countDaysCompleted
  };
})();
