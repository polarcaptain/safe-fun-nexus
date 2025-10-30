// Theme toggle with local persistence
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('sfn-theme');
if (saved) root.setAttribute('data-theme', saved);

function setTheme(next){
  root.setAttribute('data-theme', next);
  localStorage.setItem('sfn-theme', next);
  themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
}
themeToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Greet widget
const nameInput = document.getElementById('nameInput');
const greetBtn = document.getElementById('greetBtn');
const greetOut = document.getElementById('greetOut');

greetBtn?.addEventListener('click', () => {
  const name = (nameInput?.value || 'friend').trim();
  greetOut.textContent = `Hello, ${name}! 🎉 Welcome to Safe Fun Nexus.`;
});

// Tiny confetti burst (DOM-only; no deps)
const partyBtn = document.getElementById('partyBtn');
partyBtn?.addEventListener('click', (e) => {
  const burst = document.createElement('div');
  burst.style.position = 'fixed';
  burst.style.inset = 0;
  burst.style.pointerEvents = 'none';
  document.body.appendChild(burst);

  const pieces = 60;
  for (let i=0; i<pieces; i++){
    const s = document.createElement('span');
    s.style.position = 'absolute';
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    s.style.width = s.style.height = `${6 + Math.random()*6}px`;
    s.style.borderRadius = '2px';
    s.style.background = i % 2 ? 'var(--brand)' : 'var(--brand-2)';
    s.style.transform = `translate(-50%,-50%)`;
    s.style.transition = `transform 700ms cubic-bezier(.2,.6,.2,1), opacity 700ms linear`;
    burst.appendChild(s);
    requestAnimationFrame(() => {
      const angle = Math.random()*2*Math.PI;
      const dist = 80 + Math.random()*160;
      s.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) rotate(${Math.random()*720}deg)`;
      s.style.opacity = '0';
    });
  }
  setTimeout(() => burst.remove(), 750);
});
