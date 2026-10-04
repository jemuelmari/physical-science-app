/* ============================================================
   teacher-auth.js — Physical Science · Teacher Authentication
   Version: 1.1.0
   Depends on: config.js, store.js, security.js
   ============================================================ */

window.TeacherAuth = (function () {
  'use strict';

  var TOKEN_KEY_LS = 'physci_teacher_token';
  var TOKEN_KEY_SS = 'physci_teacher_token';
  var SESSION_KEY  = 'physci_teacher_session';

  // The app's root folder name (the repo name on GitHub Pages)
  var APP_ROOT_SEGMENT = '/physical-science-app/';

  /**
   * Compute an absolute URL to a file at the app root,
   * regardless of where the current page lives.
   * Example: redirectTo('teacher-login.html')
   *   from /physical-science-app/classrecord/grading-sheet.html
   *   → /physical-science-app/teacher-login.html
   */
  function appUrl(relativePath) {
    var path = window.location.pathname;
    var idx = path.indexOf(APP_ROOT_SEGMENT);
    var root;
    if (idx >= 0) {
      root = path.substring(0, idx + APP_ROOT_SEGMENT.length);
    } else {
      // Fallback: assume we're at the app root already
      root = path.substring(0, path.lastIndexOf('/') + 1);
    }
    return root + relativePath.replace(/^\/+/, '');
  }

  /* ---------------- Token handling ---------------- */

  function saveToken(token, remember) {
    try {
      if (remember) {
        localStorage.setItem(TOKEN_KEY_LS, token);
      } else {
        sessionStorage.setItem(TOKEN_KEY_SS, token);
      }
    } catch (e) { /* noop */ }
  }

  function getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY_SS)
          || localStorage.getItem(TOKEN_KEY_LS)
          || '';
    } catch (e) { return ''; }
  }

  function clearToken() {
    try { sessionStorage.removeItem(TOKEN_KEY_SS); } catch (e) {}
    try { localStorage.removeItem(TOKEN_KEY_LS); } catch (e) {}
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  /* ---------------- Auth checks ---------------- */

  function isAuthenticated() {
    return !!getToken();
  }

  function requireTeacher(options) {
    options = options || {};
    if (!isAuthenticated()) {
      var redirect = options.redirect || 'teacher-login.html';
      window.location.replace(appUrl(redirect));
      return false;
    }
    return true;
  }

  /* ---------------- Login / Logout ---------------- */

  /**
   * Log in with a token (typically after verifying it against the Apps Script).
   * Stores the token, then redirects to the teacher dashboard.
   */
  function login(token, remember) {
    if (!token) return false;
    saveToken(token, !!remember);
    return true;
  }

  /**
   * Log out. Clears tokens, then redirects to teacher-login.html.
   * The redirect is always absolute to the app root, so it works
   * from any nested page (classrecord/, teacher/, etc.).
   *
   * Options:
   *   redirect (string)  — target file at app root. Default 'teacher-login.html'.
   *   noRedirect (bool)  — if true, do NOT navigate away. Caller handles it.
   */
  function logout(options) {
    options = options || {};
    clearToken();

    if (options.noRedirect) return;

    var target = options.redirect || 'teacher-login.html';
    window.location.replace(appUrl(target));
  }

  /* ---------------- Exports ---------------- */

  return {
    saveToken: saveToken,
    getToken: getToken,
    clearToken: clearToken,
    isAuthenticated: isAuthenticated,
    requireTeacher: requireTeacher,
    login: login,
    logout: logout,
    appUrl: appUrl
  };
})();
