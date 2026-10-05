/* ============================================================
   config.js — Physical Science Online Modular App
   Version: 1.0.1
   Purpose: Global runtime configuration for the whole app.
   Loaded FIRST before all other scripts.
   ============================================================ */

window.PHYSCI_CONFIG = {

  // ---- App Metadata ----
  appName: 'Physical Science Online Modular App',
  shortName: 'Physical Science',
  version: '1.0.1',
  buildDate: '2026-01-15',

  // ---- Subject ----
  subject: 'Physical Science',
  subjectCode: 'physci',
  gradeLevel: '11/12',
  term: '1 Term (10 Weeks)',
  hoursPerQuarter: 40,
  daysPerWeek: 4,
  lessonDurationMinutes: 60,

  // ---- Curriculum ----
  totalWeeks: 10,
  totalDays: 40,
  eraFlow: [
    'Cosmic Origins',
    'Ancient Greece',
    'Alchemy → Chemistry',
    'Atomic Theory',
    'Subatomic Revolution',
    'Nuclear Age',
    'Chemical Bonding Era',
    'Industrial Chemistry',
    'Consumer Chemistry',
    'Cosmos & Motion'
  ],

  // ---- Assessment Scoring ----
  passingScore: 75,
  allowRetake: false,
  maxRetakes: 0,

  // ---- Timer defaults (minutes) ----
  defaultTimeLimit: {
    quiz: 15,
    summative: 45,
    term: 60,
    performance: 0
  },

  // ---- Transmutation (empty — uses transmutation.js built-in table) ----
  transmutation: [],

  // ---- Cloud Sync (Google Apps Script) ----
  gasEndpoint: 'https://script.google.com/macros/s/AKfycbx1dYln5Fn1R5kfC1Y277ieFzb2pmRCNntOXTyWeqxa47rfMLBzs6Ksw-Sz8IjElBNE/exec',
  gasToken: 'teacher2026',
  syncEnabled: true,
  syncOnSave: true,
  syncBatchSize: 25,
  syncIntervalMinutes: 30,

  // ---- Local Storage Keys ----
  storageKeys: {
    student:   'physci_student',
    records:   'physci_records',
    progress:  'physci_progress',
    teacher:   'physci_teacher',
    lastSync:  'physci_last_sync',
    codes:     'physci_codes'
  },

  // ---- Feature Flags ----
  features: {
    enablePrint: false,
    enableOffline: true,
    enableBackup: true,
    enableDashboard: true,
    enableItemAnalysis: true,
    enableIntervention: true,
    enableRemediation: true,
    enableTeacherAuth: true,
    enableActivityGating: false,
    enableAutoSubmit: true,
    enableAnswersLock: true
  },

  // ---- UI ----
  ui: {
    brandColor: '#1b7a3d',
    accentColor: '#f4a300',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    itemsPerPage: 10,
    showTimer: true,
    showProgressBar: true,
    confirmOnSubmit: true,
    confirmOnExit: true
  },

  // ---- Developer ----
  developer: {
    name: 'Jemuel C. Mari, MAN, RN, LPT',
    role: 'Senior High School Teacher · Teacher II',
    school: 'Iba High School · San Jose West District · SDO Tarlac Province',
    region: 'Region III · Department of Education',
    github: 'https://github.com/jemuelmari',
    repo: 'https://github.com/jemuelmari/physical-science-app'
  },

  // ---- Legal ----
  license: 'For educational use. Aligned with DepEd K to 12 Basic Education Curriculum.',
  curriculumReference: 'DepEd K to 12 Physical Science Curriculum Guide (August 2016)'
};
