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

// ===== PAC-MAN GAME =====
const canvas = document.getElementById('pacmanGame');
const ctx = canvas?.getContext('2d');
const startBtn = document.getElementById('startGame');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

if (canvas && ctx) {
  const CELL = 20;
  const COLS = 28;
  const ROWS = 31;
  
  let score = 0;
  let lives = 3;
  let gameRunning = false;
  let pacman = { x: 14, y: 23, dir: 0, nextDir: 0, mouthOpen: true };
  let ghosts = [];
  let dots = [];
  let animFrame;
  let mouthTimer = 0;

  // Simplified maze (1 = wall, 0 = path, 2 = dot)
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,2,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Initialize dots
  function initDots() {
    dots = [];
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === 2) {
          dots.push({ x: c, y: r });
        }
      }
    }
  }

  // Initialize ghosts
  function initGhosts() {
    ghosts = [
      { x: 12, y: 11, color: '#FF0000', dir: 0 },
      { x: 14, y: 11, color: '#FFB8FF', dir: 1 },
      { x: 15, y: 11, color: '#00FFFF', dir: 2 },
      { x: 13, y: 11, color: '#FFB852', dir: 3 }
    ];
  }

  function drawMaze() {
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === 1) {
          ctx.fillStyle = '#2121DE';
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          ctx.strokeStyle = '#0000FF';
          ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
        }
      }
    }
  }

  function drawDots() {
    ctx.fillStyle = '#FFB897';
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x * CELL + CELL/2, dot.y * CELL + CELL/2, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawPacman() {
    const x = pacman.x * CELL + CELL/2;
    const y = pacman.y * CELL + CELL/2;
    const radius = CELL/2 - 2;
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    if (pacman.mouthOpen) {
      const angle = pacman.dir * Math.PI / 2;
      ctx.arc(x, y, radius, angle + 0.2, angle - 0.2 + Math.PI * 2);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
    
    ctx.fill();
  }

  function drawGhosts() {
    ghosts.forEach(ghost => {
      const x = ghost.x * CELL + CELL/2;
      const y = ghost.y * CELL + CELL/2;
      const radius = CELL/2 - 2;
      
      ctx.fillStyle = ghost.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, Math.PI, 0);
      ctx.lineTo(x + radius, y + radius);
      ctx.lineTo(x - radius, y + radius);
      ctx.closePath();
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x - 5, y - 2, 3, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x - 5, y - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function canMove(x, y) {
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
    return maze[y][x] !== 1;
  }

  function movePacman() {
    const dirs = [{x:1,y:0}, {x:0,y:1}, {x:-1,y:0}, {x:0,y:-1}];
    const nextPos = {
      x: pacman.x + dirs[pacman.nextDir].x,
      y: pacman.y + dirs[pacman.nextDir].y
    };
    
    if (canMove(nextPos.x, nextPos.y)) {
      pacman.dir = pacman.nextDir;
    }
    
    const newPos = {
      x: pacman.x + dirs[pacman.dir].x,
      y: pacman.y + dirs[pacman.dir].y
    };
    
    if (canMove(newPos.x, newPos.y)) {
      pacman.x = newPos.x;
      pacman.y = newPos.y;
      
      // Check for dot collision
      const dotIndex = dots.findIndex(d => d.x === pacman.x && d.y === pacman.y);
      if (dotIndex !== -1) {
        dots.splice(dotIndex, 1);
        score += 10;
        scoreEl.textContent = score;
        
        if (dots.length === 0) {
          alert('You Win!');
          resetGame();
        }
      }
    }
    
    // Toggle mouth
    mouthTimer++;
    if (mouthTimer > 5) {
      pacman.mouthOpen = !pacman.mouthOpen;
      mouthTimer = 0;
    }
  }

  function moveGhosts() {
    ghosts.forEach(ghost => {
      const dirs = [{x:1,y:0}, {x:0,y:1}, {x:-1,y:0}, {x:0,y:-1}];
      const possibleDirs = [];
      
      dirs.forEach((d, i) => {
        const newX = ghost.x + d.x;
        const newY = ghost.y + d.y;
        if (canMove(newX, newY)) {
          possibleDirs.push(i);
        }
      });
      
      if (possibleDirs.length > 0) {
        ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
        ghost.x += dirs[ghost.dir].x;
        ghost.y += dirs[ghost.dir].y;
      }
      
      // Check collision with pacman
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) {
          alert('Game Over! Score: ' + score);
          resetGame();
        } else {
          pacman.x = 14;
          pacman.y = 23;
        }
      }
    });
  }

  function gameLoop() {
    if (!gameRunning) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMaze();
    drawDots();
    drawPacman();
    drawGhosts();
    
    movePacman();
    moveGhosts();
    
    animFrame = requestAnimationFrame(gameLoop);
  }

  function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animFrame);
    score = 0;
    lives = 3;
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    pacman = { x: 14, y: 23, dir: 0, nextDir: 0, mouthOpen: true };
    initDots();
    initGhosts();
    mouthTimer = 0;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawDots();
    drawPacman();
    drawGhosts();
  }

  startBtn?.addEventListener('click', () => {
    if (!gameRunning) {
      gameRunning = true;
      gameLoop();
      startBtn.textContent = 'Restart';
    } else {
      resetGame();
      startBtn.textContent = 'Start Game';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    const keyMap = {
      'ArrowRight': 0,
      'ArrowDown': 1,
      'ArrowLeft': 2,
      'ArrowUp': 3
    };
    
    if (keyMap.hasOwnProperty(e.key)) {
      e.preventDefault();
      pacman.nextDir = keyMap[e.key];
    }
  });

  // Initial draw
  initDots();
  initGhosts();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawDots();
  drawPacman();
  drawGhosts();
}