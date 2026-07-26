/* ============================================
   ТОЧКА ВХОДА — Auth (login / register)
   ============================================ */

(function () {
  const STORAGE_KEY = 'user';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }

  function setUser(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'index.html';
  }

  function redirectByRole() {
    const user = getUser();
    if (!user) return;
    if (user.role === 'company') {
      window.location.href = 'dashboard-company.html';
    } else {
      window.location.href = 'dashboard-participant.html';
    }
  }

  /* ---------- Login form ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) return;

      // demo: accept any credentials, guess role from email
      const role = email.includes('company') ? 'company' : 'participant';
      setUser({ email, role, name: email.split('@')[0] });
      redirectByRole();
    });
  }

  /* ---------- Register form ---------- */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    // role selector
    const roleCards = registerForm.querySelectorAll('[data-role]');
    let selectedRole = 'participant';
    roleCards.forEach(function (card) {
      card.addEventListener('click', function () {
        roleCards.forEach(function (c) {
          c.style.borderColor = '';
          c.style.background = '';
          var icon = c.querySelector('.role-icon');
          if (icon) { icon.style.background = ''; icon.style.color = ''; }
        });
        card.style.borderColor = 'var(--accent)';
        card.style.background = 'var(--accent-lighter)';
        var icon = card.querySelector('.role-icon');
        if (icon) { icon.style.background = 'var(--accent-light)'; icon.style.color = 'var(--accent)'; }
        selectedRole = card.getAttribute('data-role');
      });
    });

    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('regEmail').value.trim();
      const firstName = document.getElementById('regFirstName').value.trim();
      if (!email) return;
      setUser({ email, role: selectedRole, name: firstName || email.split('@')[0] });
      redirectByRole();
    });
  }

  /* ---------- Expose logout ---------- */
  window.authLogout = logout;
  window.authGetUser = getUser;
})();
