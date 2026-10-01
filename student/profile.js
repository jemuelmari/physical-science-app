/* ============================================================
   profile.js — Physical Science · Student Profile Logic
   Version: 1.0.0
   Depends on: store.js, app.js, ui-helpers.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const student = App.requireStudent();
  if (!student) return;

  const form = document.getElementById('profile-form');
  const msgEl = document.getElementById('profile-msg');

  // ---- Populate form ----
  document.getElementById('lrn').value = student.lrn || '';
  document.getElementById('lastName').value = student.lastName || '';
  document.getElementById('firstName').value = student.firstName || '';
  document.getElementById('gradeLevel').value = student.gradeLevel || '11';
  document.getElementById('section').value = student.section || '';

  // ---- Save changes ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = Object.assign({}, student, {
      lastName: document.getElementById('lastName').value.trim(),
      firstName: document.getElementById('firstName').value.trim(),
      gradeLevel: document.getElementById('gradeLevel').value,
      section: document.getElementById('section').value.trim(),
      updatedAt: new Date().toISOString()
    });

    if (!updated.lastName || !updated.firstName || !updated.section) {
      showMsg('⚠️ Please fill in all fields.', 'danger');
      return;
    }

    Store.setStudent(updated);
    showMsg('✅ Profile updated successfully.', 'success');
  });

  function showMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className = 'alert alert-' + type;
    msgEl.classList.remove('hidden');
    setTimeout(() => msgEl.classList.add('hidden'), 3000);
  }

  // ---- Records table ----
  renderRecords(student.lrn);

  function renderRecords(lrn) {
    const records = Store.getRecordsByStudent(lrn);
    const container = document.getElementById('records-table');

    if (!records.length) {
      container.innerHTML = `<div class="empty-state">No records yet.</div>`;
      return;
    }

    const sorted = records.slice().sort((a, b) =>
      new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
    );

    container.innerHTML = `
      <div class="modern-table-wrap">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Type</th>
              <th>Score</th>
              <th>%</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(r => `
              <tr>
                <td>${UI.escapeHtml(r.title || r.assessmentId)}</td>
                <td>${UI.escapeHtml((r.type || '').toUpperCase())}</td>
                <td>${r.score} / ${r.total}</td>
                <td>${r.percent}%</td>
                <td>${UI.gradeBadge(r.finalGrade)}</td>
                <td>${UI.formatDate(r.timestamp || r.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ---- Export ----
  document.getElementById('btn-export').addEventListener('click', () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      student: Store.getStudent(),
      records: Store.getRecordsByStudent(student.lrn),
      progress: Store.getProgress(),
      version: 1
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physci-${student.lrn}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ---- Import ----
  const fileInput = document.getElementById('file-import');
  document.getElementById('btn-import').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.records || !Array.isArray(data.records)) {
          throw new Error('Invalid backup file format.');
        }

        // Merge records (skip duplicates by assessmentId)
        const existing = Store.getRecordsByStudent(student.lrn);
        const existingIds = new Set(existing.map(r => r.assessmentId));
        let imported = 0;

        data.records.forEach(rec => {
          if (rec.assessmentId && !existingIds.has(rec.assessmentId)) {
            Store.saveRecord(rec);
            imported++;
          }
        });

        showMsg(`✅ Imported ${imported} new record(s).`, 'success');
        renderRecords(student.lrn);
      } catch (err) {
        showMsg('⚠️ ' + err.message, 'danger');
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  });
});
