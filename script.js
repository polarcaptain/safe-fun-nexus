// Theme toggle with emoji swap + persistence
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('sfn-theme');

// Apply saved theme or system preference
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
}

// Function to set theme + emoji
function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('sfn-theme', theme);
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.textContent = theme === 'dark' ? '🌚' : '🌝';
}

// Initialize correct emoji on load
const currentTheme =
  savedTheme ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(currentTheme);

// Toggle handler
themeToggle?.addEventListener('click', () => {
  const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});
