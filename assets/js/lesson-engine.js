/* ============================================================
   lesson-engine.js — Physical Science · Lesson Engine (v4.0.0)
   Loads lessons from data/physci-lessons.json
   Loads quizzes from data/physci-quizzes.json
   Auto-syncs all activity to backend via ActivityTracker
   ============================================================ */

window.LessonEngine = (function () {
  'use strict';

  const XP = { COMPLETE_DAY: 20, QUIZ_BASE: 15, QUIZ_PERFECT: 30, STREAK_BONUS: 5 };
  let LEVEL_THRESHOLD = 200;
  let cfg = {};

  function $(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function resolveDataPath(filename) {
    const here = window.location.pathname;
    if (here.includes('/student/physci/week')) return '../../../data/' + filename;
    if (here.includes('/student/physci/'))     return '../../data/' + filename;
    if (here.includes('/student/assessments/'))return '../../data/' + filename;
    if (here.includes('/student/'))            return '../data/' + filename;
    return 'data/' + filename;
  }

  async function loadXpConfig() {
    try {
      const res = await fetch(resolveDataPath('physci-quizzes.json'));
      if (!res.ok) return;
      const bank = await res.json();
      if (bank && bank.xp) {
        if (typeof bank.xp.base === 'number')           XP.QUIZ_BASE = bank.xp.base;
        if (typeof bank.xp.perfect === 'number')        XP.QUIZ_PERFECT = bank.xp.perfect;
        if (typeof bank.xp.completeDay === 'number')    XP.COMPLETE_DAY = bank.xp.completeDay;
        if (typeof bank.xp.streakBonus === 'number')    XP.STREAK_BONUS = bank.xp.streakBonus;
        if (typeof bank.xp.levelThreshold === 'number') LEVEL_THRESHOLD = bank.xp.levelThreshold;
      }
    } catch (e) { /* use defaults */ }
  }

  async function loadQuiz(week, day) {
    try {
      const res = await fetch(resolveDataPath('physci-quizzes.json'));
      if (!res.ok) return [];
      const bank = await res.json();
      const w = String(week), d = String(day);
      if (bank.quizzes && bank.quizzes[w] && bank.quizzes[w][d]) return bank.quizzes[w][d];
      return [];
    } catch (e) { return []; }
  }

  async function loadLesson(week, day) {
    try {
      const res = await fetch(resolveDataPath('physci-lessons.json'));
      if (!res.ok) return null;
      const bank = await res.json();
      const w = String(week), d = String(day);
      if (bank.lessons && bank.lessons[w] && bank.lessons[w][d]) return bank.lessons[w][d];
      return null;
    } catch (e) { return null; }
  }

  // ---------- Gamification ----------
  function getGamState() {
    try {
      const raw = localStorage.getItem('physci_gamification');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* noop */ }
    return { xp: 0, level: 1, streak: 0, lastDay: null, completedDays: [] };
  }
  function saveGamState(s) {
    try { localStorage.setItem('physci_gamification', JSON.stringify(s)); } catch (e) {}
  }
  function addXp(amount) {
    const s = getGamState();
    s.xp += amount;
    const newLevel = Math.floor(s.xp / LEVEL_THRESHOLD) + 1;
    const leveledUp = newLevel > s.level;
    s.level = newLevel;
    saveGamState(s);
    return { xp: s.xp, level: s.level, leveledUp, xpAdded: amount };
  }
  function updateStreak() {
    const s = getGamState();
    const today = new Date().toISOString().slice(0, 10);
    if (s.lastDay === today) { /* no change */ }
    else if (s.lastDay === yesterdayIso()) s.streak += 1;
    else s.streak = 1;
    s.lastDay = today;
    saveGamState(s);
    return s.streak;
  }
  function yesterdayIso() {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  function markDayComplete(week, day) {
    const s = getGamState();
    const key = 'w' + week + 'd' + day;
    if (!s.completedDays.includes(key)) { s.completedDays.push(key); saveGamState(s); }
  }
  function isDayComplete(week, day) {
    return getGamState().completedDays.includes('w' + week + 'd' + day);
  }
  function getXpToNextLevel() {
    const s = getGamState();
    return LEVEL_THRESHOLD - (s.xp % LEVEL_THRESHOLD);
  }

  // ---------- Render helpers ----------
  function renderStatsBar() {
    const s = getGamState();
    const xpToNext = getXpToNextLevel();
    const pct = Math.round(((s.xp % LEVEL_THRESHOLD) / LEVEL_THRESHOLD) * 100);
    return `
      <div class="lesson-stats-bar">
        <div class="stat-chip xp-chip">
          <span class="stat-icon">⚡</span>
          <div class="stat-chip-text">
            <span class="stat-value">${s.xp}</span>
            <span class="stat-label">XP</span>
          </div>
        </div>
        <div class="stat-chip level-chip">
          <span class="stat-icon">🏅</span>
          <div class="stat-chip-text">
            <span class="stat-value">Level ${s.level}</span>
            <span class="stat-label">Rank</span>
          </div>
        </div>
        <div class="stat-chip streak-chip">
          <span class="stat-icon">🔥</span>
          <div class="stat-chip-text">
            <span class="stat-value">${s.streak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
        <div class="stat-chip progress-chip">
          <div class="mini-progress">
            <div class="mini-progress-fill" style="width:${pct}%;"></div>
          </div>
          <div class="stat-chip-text">
            <span class="stat-value">${xpToNext} XP</span>
            <span class="stat-label">to Level ${s.level + 1}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderHeader(day, data) {
    return `
      <div class="lesson-hero" data-era="${escapeHtml(data.era)}">
        <div class="lesson-hero-badge">${escapeHtml(data.era)}</div>
        <h2>Day ${day.day}: ${escapeHtml(day.competency)}</h2>
        <div class="lesson-hero-meta">
          <span>📅 Week ${data.week}</span>
          <span>⏱ ${escapeHtml(day.duration)}</span>
          <span>🔖 ${escapeHtml(day.code)}</span>
        </div>
      </div>
    `;
  }

  function renderObjectives(objectives) {
    if (!objectives || !objectives.length) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">🎯</span> Objectives</h3>
        <ul class="objectives-list">
          ${objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function renderVocabulary(vocab) {
    if (!vocab || !vocab.length) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">📖</span> Key Vocabulary</h3>
        <div class="vocab-list">
          ${vocab.map(v => `
            <div class="vocab-item">
              <div class="vocab-term">${escapeHtml(v.term)}</div>
              <div class="vocab-def">${escapeHtml(v.definition)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderIntro(intro) {
    if (!intro) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">💡</span> Introduction</h3>
        <div class="lesson-text">${escapeHtml(intro)}</div>
      </div>
    `;
  }

  function renderContent(contentArr) {
    if (!contentArr || !contentArr.length) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">📚</span> Lesson Content</h3>
        <div class="lesson-text">${contentArr.join('')}</div>
      </div>
    `;
  }

  function renderActivity(activity) {
    if (!activity) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">🧪</span> Activity</h3>
        <div class="activity-box">
          <div class="activity-icon">✏️</div>
          <p>${escapeHtml(activity)}</p>
        </div>
      </div>
    `;
  }

  function renderPractice(practice) {
    if (!practice || !practice.length) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">📝</span> Practice Problems</h3>
        <div class="practice-list">
          ${practice.map((p, i) => `
            <details class="practice-item">
              <summary>
                <span class="practice-num">${i + 1}</span>
                ${escapeHtml(p.question)}
              </summary>
              <div class="practice-answer">
                <strong>Answer:</strong> ${escapeHtml(p.answer)}
              </div>
            </details>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderCheck(check) {
    if (!check) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">✅</span> Check for Understanding</h3>
        <div class="check-box">
          <div class="check-icon">💭</div>
          <p>${escapeHtml(check)}</p>
        </div>
      </div>
    `;
  }

  function renderSummary(summary) {
    if (!summary || !summary.length) return '';
    return `
      <div class="lesson-section">
        <h3><span class="sec-icon">🎓</span> Summary</h3>
        <ul class="summary-list">
          ${summary.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function renderQuiz(quiz) {
    if (!quiz || !quiz.length) return '';
    return `
      <div class="lesson-section gamified-quiz">
        <div class="quiz-banner">
          <div class="quiz-banner-icon">🎮</div>
          <div class="quiz-banner-text">
            <div class="quiz-banner-title">Quick Check — Gamified Quiz</div>
            <div class="quiz-banner-sub">
              <span class="quiz-xp-tag">+${XP.QUIZ_BASE} XP</span>
              <span class="quiz-xp-tag perfect">🏆 Perfect: +${XP.QUIZ_PERFECT} XP</span>
            </div>
          </div>
        </div>
        <form id="quiz-form">
          ${quiz.map((q, i) => `
            <div class="quiz-item" data-qid="${q.id}">
              <div class="quiz-q-text">
                <span class="quiz-q-num">Q${i + 1}</span>
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

  function renderCompleteButton(week, day) {
    const done = isDayComplete(week, day);
    return `
      <div class="lesson-complete-wrap">
        <button id="btn-complete"
                class="btn btn-success btn-full btn-lg ${done ? 'completed' : ''}"
                ${done ? 'disabled' : ''}>
          ${done
            ? '✅ Day Completed!'
            : `🎉 Mark Day as Complete (+${XP.COMPLETE_DAY} XP)`}
        </button>
      </div>
    `;
  }

  function renderNav(weekNum, dayNum, totalDays) {
    const prev = dayNum > 1
      ? `<a class="btn btn-outline" href="day.html?d=${dayNum - 1}">← Day ${dayNum - 1}</a>`
      : `<a class="btn btn-outline" href="index.html">← Week ${weekNum}</a>`;
    const next = dayNum < totalDays
      ? `<a class="btn btn-primary" href="day.html?d=${dayNum + 1}">Day ${dayNum + 1} →</a>`
      : `<a class="btn btn-primary" href="../index.html">Back to Timeline →</a>`;
    return `<div class="lesson-nav">${prev}${next}</div>`;
  }

  // ---------- Bind quiz ----------
  function bindQuiz(quiz, week, day) {
    const form = $('quiz-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let correct = 0;
      quiz.forEach(item => {
        const selected = form.querySelector(`input[name="q_${item.id}"]:checked`);
        const qEl = form.querySelector(`.quiz-item[data-qid="${item.id}"]`);
        if (!qEl) return;
        qEl.querySelectorAll('.quiz-opt').forEach(el => el.classList.remove('correct', 'incorrect'));
        const opts = qEl.querySelectorAll('.quiz-opt');
        opts[item.answer].classList.add('correct');
        if (selected) {
          const idx = parseInt(selected.value, 10);
          if (idx === item.answer) correct++;
          else opts[idx].classList.add('incorrect');
        }
      });
      const total = quiz.length;
      const perfect = correct === total;
      const passed = correct >= Math.ceil(total * 0.6);
      let xpEarned = 0;
      if (perfect) xpEarned = XP.QUIZ_PERFECT;
      else if (passed) xpEarned = XP.QUIZ_BASE;
      const result = addXp(xpEarned);
      const fb = $('quiz-feedback');
      fb.classList.remove('hidden');
      fb.className = 'quiz-feedback ' + (perfect ? 'perfect' : passed ? 'pass' : 'fail');
      fb.innerHTML = `
        <div class="fb-icon">${perfect ? '🏆' : passed ? '✅' : '📚'}</div>
        <div class="fb-body">
          <div class="fb-title">${perfect ? 'Perfect Score!' : passed ? 'Nice work!' : 'Keep trying!'}</div>
          <div class="fb-sub">
            You got ${correct} out of ${total}.
            ${xpEarned > 0 ? 'Earned <strong>+' + xpEarned + ' XP</strong>.' : 'No XP this time.'}
          </div>
          ${result.leveledUp ? '<div class="fb-levelup">🎉 Level Up! You are now Level ' + result.level + '</div>' : ''}
        </div>
      `;
      const statsBar = $('lesson-stats');
      if (statsBar) statsBar.innerHTML = renderStatsBar();
      fb.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // ---- Auto-sync quiz submission ----
      if (window.ActivityTracker) {
        ActivityTracker.logQuizSubmit(week, day, correct, total, xpEarned);
      }
    });
  }

  // ---------- Bind complete (with auto-sync) ----------
  function bindComplete(week, day) {
    const btn = $('btn-complete');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      // Mark day locally
      markDayComplete(week, day);
      if (window.Store && Store.markDayComplete) Store.markDayComplete(week, day);

      updateStreak();
      const result = addXp(XP.COMPLETE_DAY);
      showCelebration(XP.COMPLETE_DAY, result.leveledUp);

      btn.disabled = true;
      btn.classList.add('completed');
      btn.textContent = '✅ Day Completed!';

      const statsBar = $('lesson-stats');
      if (statsBar) statsBar.innerHTML = renderStatsBar();

      // ---- AUTO-SYNC: day complete ----
      if (window.ActivityTracker) {
        ActivityTracker.logDayComplete(week, day, cfg.day.code);
      }

      // ---- AUTO-SYNC: week complete (if all 4 days done) ----
      if (window.Store && Store.isWeekComplete && Store.isWeekComplete(week, 4)) {
        if (window.ActivityTracker) {
          ActivityTracker.logWeekComplete(week);
        }
      }
    });
  }

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
    for (let i = 0; i < 25; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%';
      c.style.animationDelay = (Math.random() * 0.6) + 's';
      c.style.background = ['#1b7a3d', '#f4a300', '#4caf50', '#ff7043', '#42a5f5', '#ab47bc'][i % 6];
      overlay.appendChild(c);
    }
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 400);
    }, 2200);
  }

  // ---------- Init ----------
  async function init(config) {
    cfg = config;
    await loadXpConfig();

    const weekFolder = config.weekFolder || ('week' + config.week);
    const res = await fetch(weekFolder + '.json');
    const data = await res.json();
    const day = data.days.find(d => d.day === config.day.day);
    if (!day) {
      $('lesson-body').innerHTML = `<div class="alert alert-danger">Lesson not found.</div>`;
      return;
    }

    const quiz = await loadQuiz(data.week, day.day);
    const lesson = await loadLesson(data.week, day.day);

    const content = lesson || {
      intro: 'Lesson content coming soon.',
      objectives: ['Understand the day\'s competency.'],
      vocabulary: [],
      body: [],
      activity: 'Complete the activities.',
      practice: [],
      check: '',
      summary: []
    };

    // ---- AUTO-SYNC: log lesson view ----
    if (window.ActivityTracker) {
      ActivityTracker.logLessonView(data.week, day.day, day.code);
    }

    $('lesson-header').innerHTML = renderHeader(day, data);
    $('lesson-body').innerHTML = `
      <div id="lesson-stats">${renderStatsBar()}</div>
      ${renderIntro(content.intro)}
      ${renderObjectives(content.objectives)}
      ${renderVocabulary(content.vocabulary)}
      ${renderContent(content.body)}
      ${renderActivity(content.activity)}
      ${renderPractice(content.practice)}
      ${renderCheck(content.check)}
      ${renderQuiz(quiz)}
      ${renderSummary(content.summary)}
      ${renderCompleteButton(data.week, day.day)}
    `;
    $('lesson-nav').innerHTML = renderNav(data.week, day.day, data.days.length);

    bindQuiz(quiz, data.week, day.day);
    bindComplete(data.week, day.day);
  }

  return { init, addXp, getGamState };
})();
