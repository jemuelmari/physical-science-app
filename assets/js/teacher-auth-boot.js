/* ============================================================
   teacher-auth-boot.js — Boot wrapper for teacher auth
   Version: 1.1.0
   Depends on: teacher-auth.js
   ============================================================ */

window.TeacherAuthBoot = (function () {
  'use strict';

  /**
   * Waits until the TeacherAuth module is available, then calls
   * onReady(auth) if authenticated, or onFail() otherwise.
   *
   * If not authenticated, it automatically redirects to the
   * teacher login page. onFail() is only called if the module
   * failed to load entirely.
   */
  function ready(onReady, onFail) {
    var attempts = 0;
    var maxAttempts = 40; // ~4 seconds at 100ms intervals

    function check() {
      if (window.TeacherAuth && typeof window.TeacherAuth.isAuthenticated === 'function') {
        if (window.TeacherAuth.isAuthenticated()) {
          if (typeof onReady === 'function') {
            try { onReady(window.TeacherAuth); } catch (e) { console.error(e); }
          }
        } else {
          window.TeacherAuth.requireTeacher();
        }
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        if (typeof onFail === 'function') {
          try { onFail(); } catch (e) { console.error(e); }
        }
        return;
      }
      setTimeout(check, 100);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', check);
    } else {
      check();
    }
  }

  return { ready: ready };
})();
