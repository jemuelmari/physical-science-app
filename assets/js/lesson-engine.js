/* ============================================================
   lesson-engine.js — Physical Science · Lesson Engine (v2.0.0)
   Adds: 5-question gamified quiz, XP/Level/Streak system,
         celebration animations, per-day completion tracking.
   Depends on: config.js, store.js, ui-helpers.js
   ============================================================ */

window.LessonEngine = (function () {
  'use strict';

  // ------------------------------------------------------------
  // XP Rules
  // ------------------------------------------------------------
  const XP = {
    COMPLETE_DAY: 20,
    QUIZ_BASE: 15,
    QUIZ_PERFECT: 30,
    STREAK_BONUS: 5
  };

  const LEVEL_THRESHOLD = 200; // XP per level

  // ------------------------------------------------------------
  // State
  // ------------------------------------------------------------
  let cfg = {};
  let content = null;
  let currentQuizAnswers = {};

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  function $(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ------------------------------------------------------------
  // Gamification persistence
  // ------------------------------------------------------------
  function getGamState() {
    try {
      const raw = localStorage.getItem('physci_gamification');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* noop */ }
    return { xp: 0, level: 1, streak: 0, lastDay: null, completedDays: [] };
  }

  function saveGamState(state) {
    try { localStorage.setItem('physci_gamification', JSON.stringify(state)); }
    catch (e) { /* noop */ }
  }

  function addXp(amount) {
    const s = getGamState();
    s.xp += amount;
    const newLevel = Math.floor(s.xp / LEVEL_THRESHOLD) + 1;
    const leveledUp = newLevel > s.level;
    s.level = newLevel;
    saveGamState(s);
    return { ...s, leveledUp, xpAdded: amount };
  }

  function updateStreak() {
    const s = getGamState();
    const today = new Date().toISOString().slice(0, 10);

    if (s.lastDay === today) {
      // Same day — no change
    } else if (s.lastDay === yesterdayIso()) {
      s.streak += 1; // Continue streak
    } else {
      s.streak = 1; // New streak
    }
    s.lastDay = today;
    saveGamState(s);
    return s.streak;
  }

  function yesterdayIso() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function markDayComplete(week, day) {
    const s = getGamState();
    const key = `w${week}d${day}`;
    if (!s.completedDays.includes(key)) {
      s.completedDays.push(key);
      saveGamState(s);
    }
  }

  function isDayComplete(week, day) {
    const s = getGamState();
    return s.completedDays.includes(`w${week}d${day}`);
  }

  function getXpToNextLevel() {
    const s = getGamState();
    return LEVEL_THRESHOLD - (s.xp % LEVEL_THRESHOLD);
  }

  // ------------------------------------------------------------
  // Render: stats bar
  // ------------------------------------------------------------
  function renderStatsBar() {
    const s = getGamState();
    const xpToNext = getXpToNextLevel();
    const pct = Math.round(((s.xp % LEVEL_THRESHOLD) / LEVEL_THRESHOLD) * 100);

    return `
      <div class="lesson-stats-bar">
        <div class="stat-chip xp-chip">
          <span class="stat-icon">⚡</span>
          <span class="stat-value">${s.xp}</span>
          <span class="stat-label">XP</span>
        </div>
        <div class="stat-chip level-chip">
          <span class="stat-icon">🏅</span>
          <span class="stat-value">Level ${s.level}</span>
        </div>
        <div class="stat-chip streak-chip">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">${s.streak}</span>
          <span class="stat-label">day streak</span>
        </div>
        <div class="stat-chip progress-chip">
          <div class="mini-progress">
            <div class="mini-progress-fill" style="width:${pct}%;"></div>
          </div>
          <span class="stat-label">${xpToNext} XP to Level ${s.level + 1}</span>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: lesson header
  // ------------------------------------------------------------
  function renderHeader(day, data) {
    return `
      <div class="lesson-hero">
        <div class="lesson-era">Week ${data.week} · ${escapeHtml(data.era)} · ${escapeHtml(data.period)}</div>
        <h2>Day ${day.day}: ${escapeHtml(day.competency)}</h2>
        <div class="lesson-code">${escapeHtml(day.code)} · ${escapeHtml(day.duration)}</div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: objectives
  // ------------------------------------------------------------
  function renderObjectives(objectives) {
    if (!objectives || !objectives.length) return '';
    return `
      <div class="lesson-section">
        <h3>🎯 Objectives</h3>
        <ul class="objectives-list">
          ${objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: content
  // ------------------------------------------------------------
  function renderContent(contentArr) {
    if (!contentArr || !contentArr.length) return '';
    return `
      <div class="lesson-section">
        <h3>📚 Lesson Content</h3>
        ${contentArr.join('')}
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: activity
  // ------------------------------------------------------------
  function renderActivity(activity) {
    if (!activity) return '';
    return `
      <div class="lesson-section">
        <h3>🧪 Activity</h3>
        <div class="activity-box">
          <p>${escapeHtml(activity)}</p>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: 5-question gamified quiz
  // ------------------------------------------------------------
  function renderQuiz(quiz) {
    if (!quiz || !quiz.length) return '';

    return `
      <div class="lesson-section gamified-quiz">
        <div class="quiz-banner">
          <span class="quiz-banner-icon">🎮</span>
          <div>
            <div class="quiz-banner-title">Quick Check — Gamified Quiz</div>
            <div class="quiz-banner-sub">+${XP.QUIZ_BASE} XP · Perfect: +${XP.QUIZ_PERFECT} XP</div>
          </div>
        </div>
        <form id="quiz-form">
          ${quiz.map((q, i) => `
            <div class="quiz-item" data-qid="${q.id}">
              <div class="quiz-q-text">
                <span class="quiz-q-num">Q${i + 1}.</span>
                ${escapeHtml(q.question)}
              </div>
              <div class="quiz-q-options">
                ${q.options.map((opt, j) => `
                  <label class="quiz-opt" data-index="${j}">
                    <input type="radio" name="q_${q.id}" value="${j}" />
                    <span class="opt-letter">${String.fromCharCode(65 + j)}</span>
                    <span class="opt-text">${escapeHtml(opt)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div id="quiz-feedback" class="quiz-feedback hidden"></div>
          <button type="submit" class="btn btn-primary btn-full btn-lg">
            🎯 Submit Answers
          </button>
        </form>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: mark complete button
  // ------------------------------------------------------------
  function renderCompleteButton(week, day) {
    const done = isDayComplete(week, day);
    return `
      <div class="lesson-complete-wrap">
        <button
          id="btn-complete"
          class="btn btn-success btn-full btn-lg ${done ? 'completed' : ''}"
          ${done ? 'disabled' : ''}>
          ${done
            ? '✅ Day Completed!'
            : `🎉 Mark Day as Complete (+${XP.COMPLETE_DAY} XP)`}
        </button>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render: navigation
  // ------------------------------------------------------------
  function renderNav(weekNum, dayNum, totalDays) {
    const prev = dayNum > 1
      ? `<a class="btn btn-outline" href="day.html?d=${dayNum - 1}">← Day ${dayNum - 1}</a>`
      : `<a class="btn btn-outline" href="index.html">← Week ${weekNum}</a>`;
    const next = dayNum < totalDays
      ? `<a class="btn btn-primary" href="day.html?d=${dayNum + 1}">Day ${dayNum + 1} →</a>`
      : `<a class="btn btn-primary" href="../index.html">Back to Timeline →</a>`;
    return `<div class="lesson-nav">${prev}${next}</div>`;
  }

  // ------------------------------------------------------------
  // Quiz: submit handler
  // ------------------------------------------------------------
  function bindQuiz(quiz) {
    const form = $('quiz-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let correct = 0;
      let answered = 0;

      quiz.forEach(item => {
        const selected = form.querySelector(`input[name="q_${item.id}"]:checked`);
        const qEl = form.querySelector(`.quiz-item[data-qid="${item.id}"]`);
        if (!qEl) return;

        // Clear previous states
        qEl.querySelectorAll('.quiz-opt').forEach(el => {
          el.classList.remove('correct', 'incorrect');
        });

        const opts = qEl.querySelectorAll('.quiz-opt');
        opts[item.answer].classList.add('correct');

        if (selected) {
          answered++;
          const idx = parseInt(selected.value, 10);
          if (idx === item.answer) {
            correct++;
          } else {
            opts[idx].classList.add('incorrect');
          }
        }
      });

      const total = quiz.length;
      const perfect = correct === total;
      const passed = correct >= Math.ceil(total * 0.6); // 60% to pass

      // XP reward
      let xpEarned = 0;
      if (perfect) xpEarned = XP.QUIZ_PERFECT;
      else if (passed) xpEarned = XP.QUIZ_BASE;

      const result = addXp(xpEarned);

      // Feedback
      const fb = $('quiz-feedback');
      fb.classList.remove('hidden');
      fb.className = 'quiz-feedback ' + (perfect ? 'perfect' : passed ? 'pass' : 'fail');

      fb.innerHTML = `
        <div class="fb-icon">${perfect ? '🏆' : passed ? '✅' : '📚'}</div>
        <div class="fb-body">
          <div class="fb-title">
            ${perfect ? 'Perfect Score!' : passed ? 'Nice work!' : 'Keep trying!'}
          </div>
          <div class="fb-sub">
            You got ${correct} out of ${total}.
            ${xpEarned > 0 ? `Earned <strong>+${xpEarned} XP</strong>.` : 'No XP this time — try again!'}
          </div>
          ${result.leveledUp ? `<div class="fb-levelup">🎉 Level Up! You're now Level ${result.level}</div>` : ''}
        </div>
      `;

      // Refresh stats bar
      const statsBar = $('lesson-stats');
      if (statsBar) statsBar.innerHTML = renderStatsBar();

      // Scroll to feedback
      fb.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Log activity
      if (window.ActivityTracker) {
        ActivityTracker.log({
          action: 'quiz_submit',
          week: cfg.week,
          day: cfg.day.day,
          score: correct,
          total,
          xpEarned
        });
      }
    });
  }

  // ------------------------------------------------------------
  // Complete: button handler
  // ------------------------------------------------------------
  function bindComplete(week, day) {
    const btn = $('btn-complete');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      markDayComplete(week, day);
      updateStreak();
      const result = addXp(XP.COMPLETE_DAY);

      // Visual celebration
      showCelebration(XP.COMPLETE_DAY, result.leveledUp);

      // Update button
      btn.disabled = true;
      btn.classList.add('completed');
      btn.textContent = '✅ Day Completed!';

      // Refresh stats
      const statsBar = $('lesson-stats');
      if (statsBar) statsBar.innerHTML = renderStatsBar();

      // Persist to Store
      if (window.Store && Store.markDayComplete) {
        Store.markDayComplete(week, day);
      }

      // Log activity
      if (window.ActivityTracker) {
        ActivityTracker.log({
          action: 'day_complete',
          week,
          day,
          code: cfg.day.code
        });
      }
    });
  }

  // ------------------------------------------------------------
  // Celebration overlay
  // ------------------------------------------------------------
  function showCelebration(xp, leveledUp) {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration-card">
        <div class="celebration-icon">🎉</div>
        <div class="celebration-title">Day Complete!</div>
        <div class="celebration-xp">+${xp} XP</div>
        ${leveledUp ? '<div class="celebration-levelup">🏅 Level Up!</div>' : ''}
      </div>
    `;
    document.body.appendChild(overlay);

    // Confetti particles
    for (let i = 0; i < 20; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%';
      c.style.animationDelay = (Math.random() * 0.6) + 's';
      c.style.background = ['#1b7a3d', '#f4a300', '#4caf50', '#ff7043', '#42a5f5'][i % 5];
      overlay.appendChild(c);
    }

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 400);
    }, 2200);
  }

  // ------------------------------------------------------------
  // Public init
  // ------------------------------------------------------------
  async function init(config) {
    cfg = config;

    // Fetch content bank
    const weekFolder = config.weekFolder || `week${config.week}`;
    const res = await fetch(`${weekFolder}.json`);
    const data = await res.json();
    const day = data.days.find(d => d.day === config.day.day);

    if (!day) {
      $('lesson-body').innerHTML =
        `<div class="alert alert-danger">Lesson not found.</div>`;
      return;
    }

    // Try to fetch quiz content from a separate file
    // Format: quiz_week{N}_day{D}.json — falls back to inline if missing
    let quiz = [];
    try {
      const quizRes = await fetch(`${weekFolder}/quiz_day${day.day}.json`);
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        quiz = quizData.questions || [];
      }
    } catch (e) {
      // No quiz file — try inline from week JSON
      quiz = day.quiz || [];
    }

    // Fallback content if week JSON has no content block
    const content = day.content || {
      intro: day.intro || 'Lesson content for this day.',
      objectives: day.objectives || ['Understand the day\'s competency.'],
      body: day.body || [],
      activity: day.activity || 'Complete the activities.',
      check: day.check || ''
    };

    // Render
    $('lesson-header').innerHTML = renderHeader(day, data);
    $('lesson-body').innerHTML = `
      <div id="lesson-stats">${renderStatsBar()}</div>
      ${renderObjectives(content.objectives)}
      ${content.intro ? `<div class="lesson-section"><h3>📖 Introduction</h3><p>${escapeHtml(content.intro)}</p></div>` : ''}
      ${renderContent(content.body)}
      ${renderActivity(content.activity)}
      ${content.check ? `<div class="lesson-section"><h3>✅ Check for Understanding</h3><p>${escapeHtml(content.check)}</p></div>` : ''}
      ${renderQuiz(quiz)}
      ${renderCompleteButton(data.week, day.day)}
    `;
    $('lesson-nav').innerHTML = renderNav(data.week, day.day, data.days.length);

    // Bind
    bindQuiz(quiz);
    bindComplete(data.week, day.day);
  }

  return { init, addXp, getGamState };
})();
