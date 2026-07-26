/* ============================================
   ТОЧКА ВХОДА — Theme Switcher
   ============================================ */

(function () {
  const STORAGE_KEY = 'theme';
  const html = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme, animate) {
    if (animate) {
      html.classList.add('theme-transitioning');
      setTimeout(() => html.classList.remove('theme-transitioning'), 350);
    }
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const lightIcon = btn.querySelector('.theme-toggle__icon--light');
      const darkIcon = btn.querySelector('.theme-toggle__icon--dark');
      if (lightIcon && darkIcon) {
        lightIcon.style.display = theme === 'light' ? 'block' : 'none';
        darkIcon.style.display = theme === 'dark' ? 'block' : 'none';
      }
      btn.setAttribute('aria-label', theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему');
    });
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next, true);
  }

  // Apply theme immediately (before DOM ready) to prevent flash
  setTheme(getPreferredTheme(), false);

  // Bind toggle buttons after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
    updateToggleIcon(html.getAttribute('data-theme') || 'light');
  });

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light', true);
    }
  });
})();
