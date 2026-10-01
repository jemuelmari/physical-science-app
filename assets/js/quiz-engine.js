/* ============================================================
   quiz-engine.js — Physical Science · Quiz Engine
   Version: 1.0.0
   Purpose: Renders and manages all assessment types
            (quiz1-3, st1-2, te, pt1) for Physical Science.
   Depends on: store.js, security.js, transmutation.js
   ============================================================ */

window.QuizEngine = (function () {
  'use strict';

  // ------------------------------------------------------------
  // Internal state
  // ------------------------------------------------------------
  let cfg = {};
  let answers = {};          // { itemId: optionIndex }
  let currentIndex = 0;
  let timeRemaining = 0;
  let timerHandle = null;
  let startTime = null;
  let submitted = false;

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

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function getStudent() {
    try {
      if (window.Store && typeof Store.getStudent === 'function') {
        return Store.getStudent();
      }
      const raw = localStorage.getItem('physci_student');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // ------------------------------------------------------------
  // Render: Start screen
  // ------------------------------------------------------------
  function renderStartScreen() {
    const student = getStudent();
    const header = $('quiz-header');
    const body = $('quiz-body');
    const nav = $('quiz-nav');

    if (header) header.innerHTML = '';
    if (nav) nav.innerHTML = '';

    if (!student) {
      body.innerHTML = `
        <div class="quiz-alert danger">
          ⚠️ You are not logged in. Please log in to take this assessment.
        </div>
        <a href="../../student/login.html" class="btn btn-primary btn-full">Go to Login</a>
      `;
      return;
    }

    body.innerHTML = `
      <div class="quiz-start">
        <div class="start-icon">📝</div>
        <h2>${escapeHtml(cfg.title)}</h2>
        <p>Read each question carefully. Select the best answer, then click Submit.</p>

        <div class="quiz-start-info">
          <div class="quiz-start-info-item">
            <div class="info-label">Subject</div>
            <div class="info-value">Physical Science</div>
          </div>
          <div class="quiz-start-info-item">
            <div class="info-label">Type</div>
            <div class="info-value">${escapeHtml((cfg.type || 'quiz').toUpperCase())}</div>
          </div>
          <div class="quiz-start-info-item">
            <div class="info-label">Items</div>
            <div class="info-value">${cfg.items.length}</div>
          </div>
          <div class="quiz-start-info-item">
            <div class="info-label">Time Limit</div>
            <div class="info-value">${cfg.timeLimit} min</div>
          </div>
          <div class="quiz-start-info-item">
            <div class="info-label">Passing Score</div>
            <div class="info-value">${cfg.passingScore}%</div>
          </div>
          <div class="quiz-start-info-item">
            <div class="info-label">Student</div>
            <div class="info-value">${escapeHtml(student.lastName || student.lrn || 'Learner')}</div>
          </div>
        </div>

        <div class="quiz-alert info">
          ⏱️ The timer starts immediately once you click <strong>Start</strong>.
          Do not close or refresh the page.
        </div>

        <button id="btn-start" class="btn btn-primary btn-full">▶ Start Assessment</button>
      </div>
    `;

    $('btn-start').addEventListener('click', startAssessment);
  }

  // ------------------------------------------------------------
  // Start assessment
  // ------------------------------------------------------------
  function startAssessment() {
    startTime = Date.now();
    timeRemaining = cfg.timeLimit * 60;
    currentIndex = 0;

    renderQuizHeader();
    renderProgress();
    renderQuestion(currentIndex);
    renderQuizNav();
    startTimer();
  }

  // ------------------------------------------------------------
  // Quiz header (timer + meta)
  // ------------------------------------------------------------
  function renderQuizHeader() {
    const header = $('quiz-header');
    if (!header) return;

    header.innerHTML = `
      <div class="quiz-header">
        <h2>${escapeHtml(cfg.title)}</h2>
        <div class="quiz-subtitle">Physical Science · ${escapeHtml((cfg.type || 'quiz').toUpperCase())}</div>
        <div class="quiz-meta-row">
          <div class="quiz-meta-item">
            <span class="meta-icon">📋</span>
            <span>${cfg.items.length} items</span>
          </div>
          <div class="quiz-meta-item">
            <span class="meta-icon">🎯</span>
            <span>Passing: ${cfg.passingScore}%</span>
          </div>
          <div class="quiz-meta-item" style="margin-left:auto;">
            <span id="quiz-timer" class="quiz-timer">⏱️ ${formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Progress bar
  // ------------------------------------------------------------
  function renderProgress() {
    let el = $('quiz-progress');
    if (!el) {
      el = document.createElement('div');
      el.id = 'quiz-progress';
      const body = $('quiz-body');
      body.parentNode.insertBefore(el, body);
    }
    const answered = Object.keys(answers).length;
    const total = cfg.items.length;
    const pct = total === 0 ? 0 : Math.round((answered / total) * 100);

    el.innerHTML = `
      <div class="quiz-progress">
        <div class="quiz-progress-label">
          <span>Progress</span>
          <span>${answered} / ${total} answered</span>
        </div>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${pct}%;"></div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render single question
  // ------------------------------------------------------------
  function renderQuestion(index) {
    const body = $('quiz-body');
    if (!body) return;

    const item = cfg.items[index];
    if (!item) {
      body.innerHTML = `<div class="quiz-alert danger">Question not found.</div>`;
      return;
    }

    const selected = answers[item.id];
    const isLast = index === cfg.items.length - 1;

    body.innerHTML = `
      <div class="quiz-question">
        <div class="quiz-q-header">
          <span class="quiz-q-num">Q${index + 1}</span>
          ${item.code ? `<span class="quiz-q-code">${escapeHtml(item.code)}</span>` : ''}
        </div>
        <div class="quiz-q-text">${escapeHtml(item.question)}</div>
        <div class="quiz-options">
          ${item.options.map((opt, i) => `
            <label class="quiz-option ${selected === i ? 'selected' : ''}" data-index="${i}">
              <input type="radio" name="q_${item.id}" value="${i}" ${selected === i ? 'checked' : ''} />
              <span class="option-label">
                <strong>${String.fromCharCode(65 + i)}.</strong> ${escapeHtml(opt)}
              </span>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    // Attach listeners
    body.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index, 10);
        selectAnswer(item.id, idx);
      });
    });

    // Show "Next" or "Submit" hint
    body.dataset.currentIndex = index;
    body.dataset.isLast = isLast ? '1' : '0';
  }

  // ------------------------------------------------------------
  // Select answer
  // ------------------------------------------------------------
  function selectAnswer(itemId, optionIndex) {
    if (submitted) return;
    answers[itemId] = optionIndex;

    // Update visual state
    document.querySelectorAll('.quiz-option').forEach(el => {
      el.classList.remove('selected');
    });
    const target = document.querySelector(`.quiz-option[data-index="${optionIndex}"]`);
    if (target) target.classList.add('selected');

    renderProgress();
  }

  // ------------------------------------------------------------
  // Quiz navigation (Prev / Next / Submit)
  // ------------------------------------------------------------
  function renderQuizNav() {
    const nav = $('quiz-nav');
    if (!nav) return;

    const total = cfg.items.length;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === total - 1;

    nav.innerHTML = `
      <div class="quiz-nav">
        <button id="btn-prev" class="btn btn-outline" ${isFirst ? 'disabled' : ''}>← Previous</button>
        <div class="nav-center">
          <span class="text-muted text-small">Question ${currentIndex + 1} of ${total}</span>
        </div>
        ${isLast
          ? `<button id="btn-submit" class="btn btn-primary">✔ Submit</button>`
          : `<button id="btn-next" class="btn btn-primary">Next →</button>`
        }
      </div>
    `;

    const btnPrev = $('btn-prev');
    const btnNext = $('btn-next');
    const btnSubmit = $('btn-submit');

    if (btnPrev) btnPrev.addEventListener('click', goPrev);
    if (btnNext) btnNext.addEventListener('click', goNext);
    if (btnSubmit) btnSubmit.addEventListener('click', confirmSubmit);
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion(currentIndex);
      renderQuizNav();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goNext() {
    if (currentIndex < cfg.items.length - 1) {
      currentIndex++;
      renderQuestion(currentIndex);
      renderQuizNav();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ------------------------------------------------------------
  // Timer
  // ------------------------------------------------------------
  function startTimer() {
    stopTimer();
    timerHandle = setInterval(() => {
      timeRemaining--;
      updateTimerUI();

      if (timeRemaining <= 0) {
        stopTimer();
        autoSubmit();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function updateTimerUI() {
    const el = $('quiz-timer');
    if (!el) return;
    el.textContent = `⏱️ ${formatTime(Math.max(0, timeRemaining))}`;

    el.classList.remove('warning', 'danger');
    if (timeRemaining <= 60) el.classList.add('danger');
    else if (timeRemaining <= 180) el.classList.add('warning');
  }

  // ------------------------------------------------------------
  // Confirm / Submit
  // ------------------------------------------------------------
  function confirmSubmit() {
    const answered = Object.keys(answers).length;
    const total = cfg.items.length;
    const unanswered = total - answered;

    let msg = `You answered ${answered} of ${total} items.`;
    if (unanswered > 0) {
      msg += `\n\n⚠️ You still have ${unanswered} unanswered item(s).`;
    }
    msg += `\n\nSubmit your assessment now?`;

    if (window.confirm(msg)) {
      submitAssessment();
    }
  }

  function autoSubmit() {
    alert('⏰ Time is up! Your assessment will be submitted automatically.');
    submitAssessment();
  }

  // ------------------------------------------------------------
  // Score + Submit
  // ------------------------------------------------------------
  function computeScore() {
    let correct = 0;
    const breakdown = [];

    cfg.items.forEach(item => {
      const studentAns = answers[item.id];
      const isCorrect = studentAns === item.answer;
      if (isCorrect) correct++;
      breakdown.push({
        id: item.id,
        code: item.code || '',
        question: item.question,
        studentAnswer: studentAns != null ? studentAns : -1,
        correctAnswer: item.answer,
        isCorrect
      });
    });

    const total = cfg.items.length;
    const raw = total === 0 ? 0 : Math.round((correct / total) * 100);
    return { correct, total, raw, breakdown };
  }

  function submitAssessment() {
    if (submitted) return;
    submitted = true;
    stopTimer();

    const student = getStudent();
    const { correct, total, raw, breakdown } = computeScore();
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Apply transmutation if available
    let finalGrade = raw;
    if (window.Transmutation && typeof Transmutation.apply === 'function') {
      try { finalGrade = Transmutation.apply(raw); } catch (e) { /* noop */ }
    }

    // Build record
    const record = {
      subject: cfg.subject || 'physci',
      assessmentId: cfg.assessmentId,
      type: cfg.type,
      title: cfg.title,
      lrn: student ? student.lrn : null,
      lastName: student ? student.lastName : null,
      firstName: student ? student.firstName : null,
      gradeLevel: student ? student.gradeLevel : null,
      section: student ? student.section : null,
      score: correct,
      total,
      percent: raw,
      finalGrade,
      passingScore: cfg.passingScore,
      passed: finalGrade >= cfg.passingScore,
      timeSpent: elapsed,
      timestamp: new Date().toISOString(),
      answers,
      breakdown
    };

    // Persist locally
    try {
      if (window.Store && typeof Store.saveRecord === 'function') {
        Store.saveRecord(record);
      } else {
        const key = 'physci_records';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(record);
        localStorage.setItem(key, JSON.stringify(arr));
      }
    } catch (e) {
      console.error('Failed to save record:', e);
    }

    // Optional sync to Google Apps Script
    try {
      if (window.Sync && typeof Sync.push === 'function') {
        Sync.push(record);
      }
    } catch (e) {
      console.warn('Sync push failed:', e);
    }

    renderResults(record);
  }

  // ------------------------------------------------------------
  // Render results
  // ------------------------------------------------------------
  function renderResults(record) {
    const header = $('quiz-header');
    const body = $('quiz-body');
    const nav = $('quiz-nav');

    if (header) header.innerHTML = '';
    if (nav) nav.innerHTML = '';

    const pct = record.percent;
    const passed = record.passed;
    const icon = passed ? '🎉' : '📚';
    const titleText = passed ? 'Great job!' : 'Keep practicing!';
    const badgeClass = passed ? 'passing' : 'failing';
    const badgeText = passed ? 'PASSED' : 'NEEDS REVIEW';

    const breakdownHtml = record.breakdown.map((b, i) => `
      <div class="results-breakdown-item ${b.isCorrect ? 'correct' : 'incorrect'}">
        <div class="bd-question">
          <strong>Q${i + 1}.</strong> ${escapeHtml(b.question)}
        </div>
        <div class="bd-status">${b.isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
      </div>
    `).join('');

    body.innerHTML = `
      <div class="quiz-results">
        <div class="results-icon">${icon}</div>
        <div class="results-title">${titleText}</div>
        <div class="results-subtitle">${escapeHtml(record.title)}</div>

        <div class="results-score-circle ${passed ? 'passing' : 'failing'}">
          <div class="circle-bg"></div>
          <div class="circle-fg"></div>
          <div class="results-score-value">${pct}<span class="percent-sign">%</span></div>
        </div>

        <div class="results-badge ${badgeClass}">${badgeText}</div>

        <div class="results-breakdown">
          <h3>📊 Score Summary</h3>
          <div class="results-breakdown-item">
            <div class="bd-question"><strong>Raw Score:</strong></div>
            <div class="bd-status">${record.score} / ${record.total}</div>
          </div>
          <div class="results-breakdown-item">
            <div class="bd-question"><strong>Percentage:</strong></div>
            <div class="bd-status">${record.percent}%</div>
          </div>
          <div class="results-breakdown-item">
            <div class="bd-question"><strong>Transmuted Grade:</strong></div>
            <div class="bd-status">${record.finalGrade}</div>
          </div>
          <div class="results-breakdown-item">
            <div class="bd-question"><strong>Passing Score:</strong></div>
            <div class="bd-status">${record.passingScore}%</div>
          </div>
          <div class="results-breakdown-item">
            <div class="bd-question"><strong>Time Spent:</strong></div>
            <div class="bd-status">${formatTime(record.timeSpent)}</div>
          </div>
        </div>

        <div class="results-breakdown">
          <h3>📋 Item Breakdown</h3>
          ${breakdownHtml}
        </div>
      </div>

      <div class="quiz-nav" style="margin-top:24px;">
        <a href="index.html" class="btn btn-outline">← Back to Assessments</a>
        <a href="../dashboard.html" class="btn btn-primary">🏠 Dashboard</a>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ------------------------------------------------------------
  // Locked assessment (called externally)
  // ------------------------------------------------------------
  function renderLocked(reason) {
    const body = $('quiz-body');
    const header = $('quiz-header');
    const nav = $('quiz-nav');

    if (header) header.innerHTML = '';
    if (nav) nav.innerHTML = '';

    body.innerHTML = `
      <div class="quiz-locked">
        <div class="lock-icon">🔒</div>
        <h2>Assessment Locked</h2>
        <p>${escapeHtml(reason || 'This assessment is not currently available.')}</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:20px;">← Back to Assessments</a>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Activity gate check
  // ------------------------------------------------------------
  function checkGate() {
    if (window.ActivityGate && typeof ActivityGate.isUnlocked === 'function') {
      try {
        return ActivityGate.isUnlocked(cfg.assessmentId);
      } catch (e) {
        return true;
      }
    }
    return true;
  }

  // ------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------
  return {
    init(config) {
      cfg = Object.assign({
        assessmentId: 'physci-assessment',
        subject: 'physci',
        type: 'quiz',
        title: 'Assessment',
        items: [],
        timeLimit: 30,
        passingScore: 75
      }, config || {});

      answers = {};
      currentIndex = 0;
      submitted = false;

      // Gate check
      if (!checkGate()) {
        renderLocked('Please complete the required lesson before taking this assessment.');
        return;
      }

      // Log activity
      if (window.ActivityTracker && typeof ActivityTracker.log === 'function') {
        try {
          ActivityTracker.log({
            subject: cfg.subject,
            action: 'start_assessment',
            assessmentId: cfg.assessmentId,
            timestamp: new Date().toISOString()
          });
        } catch (e) { /* noop */ }
      }

      renderStartScreen();
    },

    // Exposed utilities
    getAnswers() { return Object.assign({}, answers); },
    getCurrentIndex() { return currentIndex; },
    getTimeRemaining() { return timeRemaining; },
    isSubmitted() { return submitted; },
    submit() { submitAssessment(); },
    renderLocked
  };
})();
