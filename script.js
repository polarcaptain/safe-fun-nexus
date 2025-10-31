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
  themeToggle.textContent = theme === 'dark' ? '🌝' : '🌚';
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

// Auto-play background music
const backgroundMusic = document.getElementById('backgroundMusic');

if (backgroundMusic) {
  // Try to autoplay immediately
  const playPromise = backgroundMusic.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      // Autoplay was prevented by browser, play on first user interaction
      console.log('Autoplay prevented, waiting for user interaction');
      
      const playOnInteraction = () => {
        backgroundMusic.play().catch(e => console.log('Playback failed:', e));
        // Remove listeners after first play
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      };
      
      document.addEventListener('click', playOnInteraction);
      document.addEventListener('keydown', playOnInteraction);
      document.addEventListener('scroll', playOnInteraction);
    });
  }
}