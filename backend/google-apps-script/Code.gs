/**
 * ============================================================================
 * Google Apps Script Backend — Physical Science App
 * File: Code.gs
 * Version: 1.0.1
 *
 * Purpose:
 *   Receives student assessment records from the Physical Science web app
 *   and writes them to a Google Sheet. Also handles:
 *     - Assessment code generation (for gated access)
 *     - Record retrieval (for teacher dashboards)
 *     - Sync log
 *
 * Deployment:
 *   1. Create a new Google Sheet with 3 tabs:
 *        - Records
 *        - Codes
 *        - SyncLog
 *   2. Open Extensions → Apps Script
 *   3. Paste this file
 *   4. Deploy → New deployment → Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5. Copy the deployment URL → paste into config.js as gasEndpoint
 * ============================================================================
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SHEET_NAME_RECORDS = 'Records';
const SHEET_NAME_CODES   = 'Codes';
const SHEET_NAME_LOG     = 'SyncLog';

// HMAC secret — must match gasToken in config.js
const HMAC_SECRET = 'teacher2026';

// ============================================================================
// RECORD HEADERS
// ============================================================================

const RECORD_HEADERS = [
  'LRN', 'LastName', 'FirstName', 'MiddleName', 'GradeLevel', 'Section',
  'Subject', 'Type', 'AssessmentId', 'Score', 'Total', 'Percent',
  'FinalGrade', 'Passed', 'AutoSubmitted', 'TimeSpent', 'Timestamp',
  'PayloadJSON', 'Signature', 'LastUpdated'
];

const CODE_HEADERS = [
  'Code', 'LRN', 'PayloadJSON', 'Signature', 'CreatedAt', 'ExpiresAt', 'Used'
];

// ============================================================================
// WEB APP ENTRY POINTS
// ============================================================================

function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = (params.action || 'ping').toLowerCase();

    if (action === 'ping') {
      return jsonResponse({
        ok: true,
        service: 'Physical Science App Backend',
        version: '1.0.1',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'list') {
      return jsonResponse({ ok: true, records: listRecords(params.lrn) });
    }

    if (action === 'codes') {
      return jsonResponse({ ok: true, codes: listCodes() });
    }

    return jsonResponse({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function doPost(e) {
  try {
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
    }

    const action = (body.action || '').toLowerCase();

    if (action === 'saverecord' || action === 'save') {
      return jsonResponse(saveRecord(body.payload || body.record || {}));
    }

    if (action === 'createcode') {
      return jsonResponse(createCode(body.payload || {}));
    }

    if (action === 'markused') {
      return jsonResponse(markCodeUsed(body.payload || {}));
    }

    if (action === 'log') {
      logEvent('INFO', body.message || 'client event', body.payload || {});
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

// ============================================================================
// RECORD OPERATIONS
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

  logEvent('INFO', 'Record saved', { lrn, assessmentId, score: record.Score, total: record.Total });

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
// CODE GENERATION
// ============================================================================

function createCode(payload) {
  const sheet = getOrCreateSheet(SHEET_NAME_CODES, CODE_HEADERS);
  const lrn = String(payload.lrn || '').trim();
  if (!lrn) return { ok: false, error: 'Missing lrn' };

  const code = generateCode(8);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24);

  const row = [
    code,
    lrn,
    JSON.stringify(payload || {}),
    payload.signature || '',
    now.toISOString(),
    expiresAt.toISOString(),
    'FALSE'
  ];
  sheet.appendRow(row);

  logEvent('INFO', 'Code created', { lrn, code });
  return { ok: true, code, lrn, expiresAt: expiresAt.toISOString() };
}

function markCodeUsed(payload) {
  const code = String(payload.code || '').trim();
  if (!code) return { ok: false, error: 'Missing code' };

  const sheet = getOrCreateSheet(SHEET_NAME_CODES, CODE_HEADERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const codeCol = headers.indexOf('Code');
  const usedCol = headers.indexOf('Used');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][codeCol]) === code) {
      sheet.getRange(i + 1, usedCol + 1).setValue('TRUE');
      logEvent('INFO', 'Code marked used', { code });
      return { ok: true, code, used: true };
    }
  }
  return { ok: false, error: 'Code not found' };
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
// LOGGING
// ============================================================================

function logEvent(level, message, data) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAME_LOG, ['Timestamp', 'Level', 'Message', 'Data']);
    sheet.appendRow([
      new Date().toISOString(),
      level || 'INFO',
      message || '',
      JSON.stringify(data || {})
    ]);
  } catch (err) {
    // Silent fail — never break the main request
  }
}

// ============================================================================
// SHEET HELPERS
// ============================================================================

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#e6f4ea')
      .setBorder(true, true, true, true, true, true);
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

// ============================================================================
// JSON RESPONSE HELPER
// ============================================================================

function jsonResponse(obj, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============================================================================
// UTILITY — test functions
// ============================================================================

function __test_ping() {
  const res = doGet({ parameter: { action: 'ping' } });
  Logger.log(res.getContent());
}

function __test_saveRecord() {
  const res = saveRecord({
    lrn: '123456789012',
    lastName: 'Dela Cruz',
    firstName: 'Juan',
    gradeLevel: '11',
    section: 'STEM-A',
    subject: 'physci',
    type: 'quiz',
    assessmentId: 'physci-quiz1',
    score: 12,
    total: 15,
    percent: 80,
    finalGrade: 88,
    passed: true,
    timeSpent: 720,
    timestamp: new Date().toISOString(),
    answers: { 1: 0, 2: 1, 3: 2 },
    breakdown: []
  });
  Logger.log(JSON.stringify(res));
}
