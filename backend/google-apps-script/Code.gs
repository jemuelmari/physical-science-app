/**
 * ============================================================================
 * Google Apps Script Backend — Physical Science App
 * File: Code.gs
 * Version: 2.0.0
 *
 * Actions:
 *   GET:
 *     ?action=ping                     — health check
 *     ?action=list&token=...           — list all assessment records
 *     ?action=listActivities&token=... — list all activity logs
 *     ?action=codes&token=...          — list codes
 *
 *   POST (JSON body):
 *     { action: "saveRecord", payload: {...} }
 *     { action: "saveActivity", payload: {...} }
 *     { action: "generateCode", payload: { lrn } }
 *     { action: "redeemCode", payload: { code } }
 * ============================================================================
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SHEET_NAME_RECORDS     = 'Records';
const SHEET_NAME_CODES       = 'Codes';
const SHEET_NAME_LOG         = 'SyncLog';
const SHEET_NAME_ACTIVITIES  = 'Activities';
const SHEET_NAME_STUDENTS    = 'Students';

const TEACHER_TOKEN = 'teacher2026'; // must match config.js gasToken

const RECORD_HEADERS = [
  'LRN', 'LastName', 'FirstName', 'MiddleName', 'GradeLevel', 'Section',
  'Subject', 'Type', 'AssessmentId', 'Score', 'Total', 'Percent',
  'FinalGrade', 'Passed', 'AutoSubmitted', 'TimeSpent', 'Timestamp',
  'PayloadJSON', 'Signature', 'LastUpdated'
];

const CODE_HEADERS = [
  'Code', 'LRN', 'CreatedAt', 'ExpiresAt', 'Used'
];

const ACTIVITY_HEADERS = [
  'Timestamp', 'LRN', 'LastName', 'FirstName', 'Action',
  'Week', 'Day', 'Code', 'AssessmentId', 'Score', 'Total', 'Percent', 'PayloadJSON'
];

const STUDENT_HEADERS = [
  'LRN', 'LastName', 'FirstName', 'MiddleName', 'GradeLevel', 'Section',
  'Sex', 'PIN', 'CreatedAt', 'LastUpdated'
];

// ============================================================================
// GET
// ============================================================================

function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = (params.action || 'ping').toLowerCase();
    const token  = params.token || '';

    if (action === 'ping') {
      return jsonResponse({
        ok: true,
        service: 'Physical Science App Backend',
        version: '2.0.0',
        timestamp: new Date().toISOString()
      });
    }

    if (!isTeacher(token)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }

    if (action === 'list') {
      return jsonResponse({ ok: true, records: listRecords(params.lrn) });
    }

    if (action === 'listactivities') {
      return jsonResponse({ ok: true, activities: listActivities(params.lrn) });
    }

    if (action === 'liststudents') {
      return jsonResponse({ ok: true, students: listStudents() });
    }

    if (action === 'codes') {
      return jsonResponse({ ok: true, codes: listCodes() });
    }

    if (action === 'stats') {
      return jsonResponse({
        ok: true,
        stats: {
          students: listStudents().length,
          records: listRecords().length,
          activities: listActivities().length,
          codes: listCodes().length
        }
      });
    }

    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ============================================================================
// POST
// ============================================================================

function doPost(e) {
  try {
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: 'Invalid JSON' });
    }

    const action = (body.action || '').toLowerCase();
    const payload = body.payload || body.record || body;

    if (action === 'saverecord' || action === 'save') {
      return jsonResponse(saveRecord(payload));
    }
    if (action === 'saveactivity') {
      return jsonResponse(saveActivity(payload));
    }
    if (action === 'savestudent') {
      return jsonResponse(saveStudent(payload));
    }
    if (action === 'generatecode') {
      return jsonResponse(generateCode(payload));
    }
    if (action === 'redeemcode') {
      return jsonResponse(redeemCode(payload));
    }
    if (action === 'log') {
      logEvent('INFO', body.message || 'client event', payload);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ============================================================================
// RECORDS
// ============================================================================

function saveRecord(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Missing payload' };
  }

  const sheet = getOrCreateSheet(SHEET_NAME_RECORDS, RECORD_HEADERS);
  const lrn = String(payload.lrn || '').trim();
  const assessmentId = String(payload.assessmentId || '').trim();

  if (!lrn || !assessmentId) {
    return { ok: false, error: 'Missing lrn or assessmentId' };
  }

  const now = new Date().toISOString();
  const record = {
    LRN: lrn,
    LastName: payload.lastName || '',
    FirstName: payload.firstName || '',
    MiddleName: payload.middleName || '',
    GradeLevel: payload.gradeLevel || '',
    Section: payload.section || '',
    Subject: payload.subject || 'physci',
    Type: payload.type || 'quiz',
    AssessmentId: assessmentId,
    Score: Number(payload.score) || 0,
    Total: Number(payload.total) || 0,
    Percent: Number(payload.percent) || 0,
    FinalGrade: Number(payload.finalGrade) || 0,
    Passed: payload.passed ? 'TRUE' : 'FALSE',
    AutoSubmitted: payload.autoSubmitted ? 'TRUE' : 'FALSE',
    TimeSpent: Number(payload.timeSpent) || 0,
    Timestamp: payload.timestamp || now,
    PayloadJSON: JSON.stringify(payload.answers || payload.breakdown || {}),
    Signature: payload.signature || '',
    LastUpdated: now
  };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const lrnCol = headers.indexOf('LRN');
  const aidCol = headers.indexOf('AssessmentId');

  let existingRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][lrnCol]) === lrn && String(data[i][aidCol]) === assessmentId) {
      existingRow = i + 1;
      break;
    }
  }

  const row = RECORD_HEADERS.map(h => record[h]);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, RECORD_HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return { ok: true, saved: true, lrn, assessmentId };
}

function listRecords(lrn) {
  const sheet = getOrCreateSheet(SHEET_NAME_RECORDS, RECORD_HEADERS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (!lrn || String(row.LRN) === String(lrn)) {
      out.push(row);
    }
  }
  return out;
}

// ============================================================================
// ACTIVITIES (day / week / lesson events)
// ============================================================================

function saveActivity(payload) {
  const sheet = getOrCreateSheet(SHEET_NAME_ACTIVITIES, ACTIVITY_HEADERS);
  const lrn = String(payload.lrn || '').trim();
  if (!lrn) return { ok: false, error: 'Missing lrn' };

  const row = [
    payload.timestamp || new Date().toISOString(),
    lrn,
    payload.lastName || '',
    payload.firstName || '',
    payload.action || '',
    payload.week || '',
    payload.day || '',
    payload.code || '',
    payload.assessmentId || '',
    payload.score != null ? payload.score : '',
    payload.total != null ? payload.total : '',
    payload.percent != null ? payload.percent : '',
    JSON.stringify(payload)
  ];
  sheet.appendRow(row);

  return { ok: true, saved: true, action: payload.action };
}

function listActivities(lrn) {
  const sheet = getOrCreateSheet(SHEET_NAME_ACTIVITIES, ACTIVITY_HEADERS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (!lrn || String(row.LRN) === String(lrn)) {
      out.push(row);
    }
  }
  return out;
}

// ============================================================================
// STUDENTS
// ============================================================================

function saveStudent(payload) {
  const sheet = getOrCreateSheet(SHEET_NAME_STUDENTS, STUDENT_HEADERS);
  const lrn = String(payload.lrn || '').trim();
  if (!lrn) return { ok: false, error: 'Missing lrn' };

  const now = new Date().toISOString();
  const row = [
    lrn,
    payload.lastName || '',
    payload.firstName || '',
    payload.middleName || '',
    payload.gradeLevel || '',
    payload.section || '',
    payload.sex || '',
    payload.pin || '',
    payload.createdAt || now,
    now
  ];

  const data = sheet.getDataRange().getValues();
  const lrnCol = data[0].indexOf('LRN');
  let existingRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][lrnCol]) === lrn) { existingRow = i + 1; break; }
  }

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, STUDENT_HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return { ok: true, saved: true, lrn };
}

function listStudents() {
  const sheet = getOrCreateSheet(SHEET_NAME_STUDENTS, STUDENT_HEADERS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    out.push(row);
  }
  return out;
}

// ============================================================================
// SYNC CODES
// ============================================================================

function generateCode(payload) {
  const lrn = String(payload.lrn || '').trim();
  if (!lrn) return { ok: false, error: 'Missing lrn' };

  const code = makeCode(6); // e.g. JX3K9P
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const sheet = getOrCreateSheet(SHEET_NAME_CODES, CODE_HEADERS);
  sheet.appendRow([code, lrn, now.toISOString(), expiresAt.toISOString(), 'FALSE']);

  return { ok: true, code, lrn, expiresAt: expiresAt.toISOString() };
}

function redeemCode(payload) {
  const code = String(payload.code || '').trim().toUpperCase();
  if (!code) return { ok: false, error: 'Missing code' };

  const sheet = getOrCreateSheet(SHEET_NAME_CODES, CODE_HEADERS);
  const data = sheet.getDataRange().getValues();

  let found = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === code) { found = data[i]; break; }
  }

  if (!found) return { ok: false, error: 'Code not found' };

  const lrn = found[1];
  const student = listStudents().find(s => String(s.LRN) === String(lrn));
  const records = listRecords(lrn);
  const activities = listActivities(lrn);

  return {
    ok: true,
    code,
    lrn,
    student: student || null,
    records,
    activities
  };
}

function listCodes() {
  const sheet = getOrCreateSheet(SHEET_NAME_CODES, CODE_HEADERS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    out.push(row);
  }
  return out;
}

// ============================================================================
// HELPERS
// ============================================================================

function makeCode(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function isTeacher(token) {
  return String(token || '').trim() === TEACHER_TOKEN;
}

function logEvent(level, message, data) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAME_LOG, ['Timestamp', 'Level', 'Message', 'Data']);
    sheet.appendRow([new Date().toISOString(), level || 'INFO', message || '', JSON.stringify(data || {})]);
  } catch (e) {}
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#e6f4ea');
    sheet.setFrozenRows(1);
  } else {
    const firstRow = sheet.getRange(1, 1, 1, Math.max(headers.length, 1)).getValues()[0];
    if (!firstRow[0]) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
