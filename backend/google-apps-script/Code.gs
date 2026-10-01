/**
 * ============================================================================
 * Google Apps Script Backend — Physical Science App
 * File: Code.gs
 * Version: 1.0.0
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

// Teacher token — same as in config.js (change this to a strong secret!)
const TEACHER_TOKEN_HASH = '01d58c1ac3df6d023d869e50bf78e2f9185332c281f665fd53f6dbd7592df45e';

// HMAC secret — used for signature verification of incoming payloads
const HMAC_SECRET = 'PS-APP-2026-DEPED-SECRET-KEY-v1';

// ============================================================================
// RECORD HEADERS (must match the order written by the client)
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

/**
 * GET handler — used for health checks and teacher dashboards.
 * Query params:
 *   action  — 'ping' | 'list' | 'codes' | 'verify'
 *   token   — teacher token (required for list, codes, verify)
 *   lrn     — filter by LRN (optional)
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = (params.action || 'ping').toLowerCase();

    if (action === 'ping') {
      return jsonResponse({
        ok: true,
        service: 'Physical Science App Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // All other actions require teacher authentication
    if (!isTeacher(params.token)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
    }

    if (action === 'list') {
      return jsonResponse({ ok: true, records: listRecords(params.lrn) });
    }

    if (action === 'codes') {
      return jsonResponse({ ok: true, codes: listCodes() });
    }

    if (action === 'verify') {
      return jsonResponse({ ok: true, valid: isTeacher(params.token) });
    }

    return jsonResponse({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

/**
 * POST handler — main entry for client sync.
 * Body (JSON):
 *   {
 *     action: 'saveRecord' | 'createCode' | 'markUsed',
 *     payload: { ... },
 *     signature: '...'   // optional, validated if present
 *   }
 */
function doPost(e) {
  try {
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
    }

    const action = (body.action || '').toLowerCase();

    // Signature verification (relaxed — accepts if signature missing or valid)
    const signature = body.signature || '';
    if (signature && !verifySignature(body.payload, signature)) {
      // Log but do not reject (matches general-biology-app behavior)
      logEvent('WARN', 'Invalid signature received', { action });
    }

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

/**
 * Saves a student assessment record to the Records sheet.
 * If a record with the same (LRN, AssessmentId) exists, it is updated.
 */
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

  // Look for existing row
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const lrnCol = headers.indexOf('LRN');
  const aidCol = headers.indexOf('AssessmentId');

  let existingRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][lrnCol]) === lrn && String(data[i][aidCol]) === assessmentId) {
      existingRow = i + 1; // 1-based row number
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

/**
 * Returns all records (optionally filtered by LRN).
 */
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
// CODE GENERATION (gated access)
// ============================================================================

/**
 * Creates a one-time assessment code for a student.
 */
function createCode(payload) {
  const sheet = getOrCreateSheet(SHEET_NAME_CODES, CODE_HEADERS);
  const lrn = String(payload.lrn || '').trim();
  if (!lrn) return { ok: false, error: 'Missing lrn' };

  const code = generateCode(8);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 24 hours

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

/**
 * Marks an assessment code as used.
 */
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

/**
 * Lists all codes (for teacher dashboards).
 */
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
// AUTH / SECURITY
// ============================================================================

/**
 * Validates the teacher token by comparing its SHA-256 hash.
 */
function isTeacher(token) {
  if (!token) return false;
  const hash = sha256Hex(String(token));
  return hash === TEACHER_TOKEN_HASH;
}

/**
 * Verifies the HMAC signature of a payload.
 */
function verifySignature(payload, signature) {
  if (!signature) return false;
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expected = hmacSha256Hex(payloadStr, HMAC_SECRET);
  return expected === String(signature);
}

/**
 * SHA-256 hex digest.
 */
function sha256Hex(str) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return bytesToHex(bytes);
}

/**
 * HMAC-SHA256 hex digest.
 */
function hmacSha256Hex(message, secret) {
  const sigBytes = Utilities.computeHmacSha256Signature(message, secret);
  return bytesToHex(sigBytes);
}

/**
 * Converts a byte array to a lowercase hex string.
 */
function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = (bytes[i] < 0 ? bytes[i] + 256 : bytes[i]).toString(16);
    out += (b.length === 1 ? '0' : '') + b;
  }
  return out;
}

/**
 * Generates a random alphanumeric code of given length.
 */
function generateCode(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Appends a log entry to the SyncLog sheet.
 */
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
    // Silent fail — never break the main request because logging failed
  }
}

// ============================================================================
// SHEET HELPERS
// ============================================================================

/**
 * Gets a sheet by name, creating it (with headers) if it doesn't exist.
 */
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
    // Ensure headers exist
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

/**
 * Returns a JSON ContentService response with CORS-friendly headers.
 */
function jsonResponse(obj, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  // Note: Apps Script Web Apps automatically allow cross-origin reads
  // when deployed as "Anyone". Custom status codes are not supported.
  return output;
}

// ============================================================================
// UTILITY — manual test function (run from Apps Script editor)
// ============================================================================

function __test_saveRecord() {
  const res = saveRecord({
    lrn: '123456789012',
    lastName: 'Dela Cruz',
    firstName: 'Juan',
    middleName: 'Santos',
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

function __test_createCode() {
  const res = createCode({ lrn: '123456789012' });
  Logger.log(JSON.stringify(res));
}

function __test_ping() {
  const res = doGet({ parameter: { action: 'ping' } });
  Logger.log(res.getContent());
}
