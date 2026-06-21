// ============================================================
// EDUMOE – COMPLETE JAVASCRIPT
// Theme Switcher · Custom Color Picker · Particles · Orbit · Auth
// ============================================================

// ========== THEME SWITCHER ==========
function setTheme(theme, el) {
  if (theme === 'ruby') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }

  document.querySelectorAll('.theme-dot').forEach(function(d) {
    d.classList.remove('active');
  });

  if (el) el.classList.add('active');

  localStorage.setItem('edumoe-theme', theme);
  showToast('Theme: ' + theme);
}

function setCustomTheme(color) {
  var r = parseInt(color.slice(1, 3), 16);
  var g = parseInt(color.slice(3, 5), 16);
  var b = parseInt(color.slice(5, 7), 16);

  document.documentElement.setAttribute('data-theme', 'custom');

  document.documentElement.style.setProperty('--custom-accent', color);
  document.documentElement.style.setProperty('--custom-accent2', 'rgb(' + Math.min(r + 40, 255) + ', ' + Math.min(g + 40, 255) + ', ' + Math.min(b + 40, 255) + ')');
  document.documentElement.style.setProperty('--custom-accent3', 'rgb(' + Math.min(r + 80, 255) + ', ' + Math.min(g + 80, 255) + ', ' + Math.min(b + 80, 255) + ')');
  document.documentElement.style.setProperty('--custom-glow', 'rgba(' + r + ',' + g + ',' + b + ',0.35)');
  document.documentElement.style.setProperty('--custom-glow2', 'rgba(' + r + ',' + g + ',' + b + ',0.14)');
  document.documentElement.style.setProperty('--custom-border', 'rgba(' + r + ',' + g + ',' + b + ',0.25)');
  document.documentElement.style.setProperty('--custom-border2', 'rgba(' + r + ',' + g + ',' + b + ',0.45)');
  document.documentElement.style.setProperty('--custom-tint', 'rgba(' + r + ',' + g + ',' + b + ',0.06)');
  document.documentElement.style.setProperty('--custom-tint2', 'rgba(' + r + ',' + g + ',' + b + ',0.12)');
  document.documentElement.style.setProperty('--custom-tint3', 'rgba(' + r + ',' + g + ',' + b + ',0.20)');

  document.querySelectorAll('.theme-dot').forEach(function(d) {
    d.classList.remove('active');
  });

  localStorage.setItem('edumoe-theme', 'custom');
  localStorage.setItem('edumoe-custom-color', color);
  showToast('Custom theme applied!');
}

// ========== TOAST ==========
var toastTimer;

function showToast(message) {
  var toast = document.getElementById('toast');
  var msg = document.getElementById('toast-msg');

  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 3200);
}

// ========== CANVAS BACKGROUND (Particles) ==========
var canvas, ctx, particles = [];
var mouseX = 0, mouseY = 0;
var bgInitialized = false;

function initCanvasBackground() {
  canvas = document.getElementById('bg-canvas');

  if (!canvas || bgInitialized) return;

  bgInitialized = true;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');

  var texts = [
    // C++
    "cout << x;", "int main()", "for(int i=0;i<10;i++)", "while(condition)",
    "if(x>0) else if(x<0)", "int* ptr = &x;", "struct Student { string name; };",
    // Math
    "∫dx", "dy/dx", "Σ", "∏", "√x", "∞", "π = 3.14", "e^x", "sin(x)", "cos(x)",
    "∫x²dx = x³/3 + C", "d/dx sin(x) = cos(x)", "lim(x→0) sinx/x = 1",
    // Logic
    "AND", "OR", "NOT", "NAND", "XOR", "A→B", "A∧B", "A∨B",
    "F = Σm(1,3,5)", "F = ΠM(0,2,4)", "1011₂ = 11₁₀",
    // Discrete
    "∅", "{}", "A⊆B", "A∩B", "A∪B", "ℤ", "ℕ", "∀x ∃y",
    // Physics
    "V = IR", "∮E·dA = Q/ε₀", "ε = -dΦ/dt", "∑V = 0",
    "F = ma", "v = at", "C = Q/V",
    // Probability
    "P(A|B) = P(B|A)P(A)/P(B)", "P(X=k)=C(n,k)pᵏ(1-p)ⁿ⁻ᵏ",
    "P(X=k)=e⁻ˡλᵏ/k!", "E[X]", "Var[X]", "σ"
  ];

  for (var i = 0; i < 150; i++) {
    particles.push({
      text: texts[Math.floor(Math.random() * texts.length)],
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: 0.06 + Math.random() * 0.12,
      size: 12 + Math.random() * 14
    });
  }

  // Mouse tracking for particle repulsion
  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  drawParticles();
}

function drawParticles() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    // Mouse repulsion
    var dx = p.x - mouseX;
    var dy = p.y - mouseY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 120) {
      var angle = Math.atan2(dy, dx);
      var force = (120 - dist) / 120 * 0.8;
      p.x += Math.cos(angle) * force;
      p.y += Math.sin(angle) * force;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Wrap around edges
    if (p.x < -50) p.x = canvas.width + 50;
    if (p.x > canvas.width + 50) p.x = -50;
    if (p.y < -50) p.y = canvas.height + 50;
    if (p.y > canvas.height + 50) p.y = -50;

    ctx.font = p.size + 'px "Fira Code", monospace';
    ctx.fillStyle = 'rgba(100, 100, 150, ' + p.alpha + ')';
    ctx.fillText(p.text, p.x, p.y);
  }

  requestAnimationFrame(drawParticles);
}

// ========== PLANETARY ORBIT (8 Floating Windows) ==========
function initOrbits() {
  var container = document.getElementById('orbitContainer');

  if (!container) return;

  var windows = [
    {
      title: "ode.math",
      badge: "ODE",
      content: "y'' + 2y' + 5y = 0<br>r = -1 ± 2i<br>y = e⁻ˣ(A·cos2x + B·sin2x)",
      size: "large",
      radius: 210,
      speed: 0.4,
      startAngle: 0
    },
    {
      title: "main.cpp",
      badge: "C++",
      content: "#include &lt;iostream&gt;<br>int main() {<br>&nbsp;&nbsp;cout &lt;&lt; \"Hello EDUMOE\";<br>&nbsp;&nbsp;return 0;<br>}",
      size: "large",
      radius: 210,
      speed: 0.4,
      startAngle: Math.PI * 0.5
    },
    {
      title: "normal_dist.py",
      badge: "STATS",
      content: "μ=0, σ=1<br>-1σ → 34.1%<br>+1σ → 34.1%<br>68.2% within 1σ",
      size: "large",
      radius: 210,
      speed: 0.4,
      startAngle: Math.PI
    },
    {
      title: "half_adder.circ",
      badge: "LOGIC",
      content: "A ─┬─ XOR ─ S<br>B ─┘ ┌─ AND ─ C",
      size: "large",
      radius: 210,
      speed: 0.4,
      startAngle: Math.PI * 1.5
    },
    {
      title: "calculus.math",
      badge: "MATH",
      content: "∫ x² dx = x³/3 + C<br>d/dx sin(x) = cos(x)",
      size: "small",
      radius: 170,
      speed: 0.6,
      startAngle: Math.PI / 4
    },
    {
      title: "physics.sim",
      badge: "PHY",
      content: "V = I·R (Ohm)<br>∮E·dA = Q/ε₀<br>ε = -dΦ/dt",
      size: "small",
      radius: 170,
      speed: 0.6,
      startAngle: Math.PI / 4 + Math.PI * 0.5
    },
    {
      title: "discrete.set",
      badge: "SET",
      content: "A ∩ B ∪ C<br>|A ∪ B| = |A|+|B|-|A∩B|<br>(A∪B)' = A'∩B'",
      size: "small",
      radius: 170,
      speed: 0.6,
      startAngle: Math.PI / 4 + Math.PI
    },
    {
      title: "cpp_fundamentals.h",
      badge: "C++",
      content: "#include &lt;iostream&gt;<br>using namespace std;<br>int* ptr = &x;",
      size: "small",
      radius: 170,
      speed: 0.6,
      startAngle: Math.PI / 4 + Math.PI * 1.5
    }
  ];

  var elements = [];

  for (var i = 0; i < windows.length; i++) {
    var win = windows[i];
    var div = document.createElement('div');

    div.className = 'float-win ' + (win.size === 'large' ? 'fw-large' : 'fw-small');

    div.innerHTML = `
      <div class="float-win-topbar">
        <div class="cd cd-r"></div>
        <div class="cd cd-y"></div>
        <div class="cd cd-g"></div>
        <span class="float-win-title">${win.title}</span>
        <span class="float-win-badge">${win.badge}</span>
      </div>
      <div class="float-win-body">${win.content}</div>
    `;

    container.appendChild(div);

    elements.push({
      element: div,
      radius: win.radius,
      speed: win.speed,
      angle: win.startAngle,
      size: win.size
    });
  }

  var last = 0;

  function animateOrbits(now) {
    requestAnimationFrame(animateOrbits);

    if (!last) last = now;
    var delta = Math.min(0.033, (now - last) / 1000);
    last = now;

    var cx = container.clientWidth / 2;
    var cy = container.clientHeight / 2;

    for (var i = 0; i < elements.length; i++) {
      var win = elements[i];
      win.angle += win.speed * delta;

      var x = cx + Math.cos(win.angle) * win.radius;
      var y = cy + Math.sin(win.angle) * win.radius;

      win.element.style.left = (x - (win.size === 'large' ? 100 : 77)) + 'px';
      win.element.style.top = (y - 45) + 'px';
    }
  }

  requestAnimationFrame(animateOrbits);
}

// ========== AUTH (Supabase) ==========
var SUPABASE_URL = 'https://ajhbaomxdsvnegjiypob.supabase.co';
var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaGJhb214ZHN2bmVnaml5cG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDY3NzQsImV4cCI6MjA4NzYyMjc3NH0.FptC_9E49l7V_GhYiVmVwf4Ee8bXkcgcWmc96POmKGI';

var _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

function doSignup() {
  var name = document.getElementById('signupName')?.value.trim();
  var email = document.getElementById('signupEmail')?.value.trim();
  var pass = document.getElementById('signupPassword')?.value;

  if (!name || !email || !pass) {
    showToast('⚠️ Fill in all fields');
    return;
  }

  if (pass.length < 6) {
    showToast('⚠️ Password must be 6+ characters');
    return;
  }

  showToast('⏳ Creating your account...');

  _supabase.auth.signUp({
    email: email,
    password: pass,
    options: { data: { full_name: name } }
  }).then(function(result) {
    var data = result.data;
    var error = result.error;

    if (error) {
      showToast('❌ ' + error.message);
      return;
    }

    document.getElementById('signupModal')?.classList.remove('open');
    showToast('✅ Check your email to confirm your account!');
  }).catch(function(e) {
    showToast('❌ ' + e.message);
  });
}

function doLogin() {
  var email = document.getElementById('loginEmail')?.value.trim();
  var pass = document.getElementById('loginPassword')?.value;

  if (!email || !pass) {
    showToast('⚠️ Enter email and password');
    return;
  }

  showToast('⏳ Logging in...');

  _supabase.auth.signInWithPassword({
    email: email,
    password: pass
  }).then(function(result) {
    var data = result.data;
    var error = result.error;

    if (error) {
      showToast('❌ ' + error.message);
      return;
    }

    document.getElementById('loginModal')?.classList.remove('open');

    var firstName = data.user.user_metadata?.full_name?.split(' ')[0] || 'student';
    showToast('👋 Welcome back, ' + firstName + '!');
  }).catch(function(e) {
    showToast('❌ ' + e.message);
  });
}

// ========== INITIALIZATION ==========
window.addEventListener('load', function() {
  // Initialize canvas background
  try {
    initCanvasBackground();
  } catch (e) {
    console.error('[EDUMOE] Canvas init failed:', e);
  }

  // Initialize planetary orbit
  try {
    initOrbits();
  } catch (e) {
    console.error('[EDUMOE] Orbit init failed:', e);
  }

  // Student count animation (230+)
  var statEl = document.getElementById('stat-students');
  if (statEl) {
    var count = 0;
    var target = 230;
    var interval = setInterval(function() {
      count += Math.ceil(target / 40);
      if (count >= target) {
        statEl.textContent = target + '+';
        clearInterval(interval);
      } else {
        statEl.textContent = count;
      }
    }, 30);
  }
});

// ========== WINDOW RESIZE HANDLER ==========
var resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    var container = document.getElementById('orbitContainer');
    if (container) {
      var existingWindows = container.querySelectorAll('.float-win');
      existingWindows.forEach(function(el) {
        el.remove();
      });

      try {
        initOrbits();
      } catch (e) {
        console.error('[EDUMOE] Orbit re-init failed:', e);
      }
    }
  }, 300);
});
