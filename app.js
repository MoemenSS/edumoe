/* ═══════════════════════════════════════════════════════════════
   EDUMOE v6 — app.js
   Shared JavaScript for all pages.

   SECTIONS:
   ─────────────────────────────────────
   1.  Supabase setup
   2.  Loader
   3.  Theme switcher
   4.  Navigation (single-page goPage())
   5.  Scroll reveal
   6.  Toast notification
   7.  Parallax blob background
   8.  Card tilt effect
   9.  Auth (login / signup / logout)
   10. Quiz system
   11. Flashcards
   12. C++ Compiler (OneCompiler iframe + fallback)
   13. Simulator helpers
   14. Calculus / Math solver (inline with Math.js + Chart.js)
   15. Probability visualizer
   ═══════════════════════════════════════════════════════════════ */


/* ── 1. SUPABASE SETUP ─────────────────────────────────────────
   Your Supabase project credentials.
   EDIT: Replace with your project URL and anon key if you ever
   create a new Supabase project. These are safe to expose in
   client-side code (they are the "anon" public keys).
   ─────────────────────────────────────────────────────────────── */

const SUPABASE_URL  = 'https://ihkryvhqdlddywydrwmu.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa3J5dmhxZGxkZHl3eWRyd211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTc4MTMsImV4cCI6MjA4NzI3MzgxM30.r-jAgmWmtoICgwu5OZlhDIGvh_ZrpAJYSAcdXxgzoWw';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);


/* ── 2. LOADER ─────────────────────────────────────────────────
   Fades out the full-screen intro loader after page loads.
   ─────────────────────────────────────────────────────────────── */

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('out');
      setTimeout(() => {
        loader.style.display = 'none';
        const firstPage = document.querySelector('.page.active');
        if (firstPage) firstPage.classList.add('visible');
        initScrollReveal();
      }, 400);
    }
    setTimeout(() => showToast('🔴 Welcome to EDUMOE!'), 500);
  }, 600); // Was 2300ms — reduced for faster page feel
});

// Hero title words animate in via CSS — no JS delay needed
document.addEventListener('DOMContentLoaded', () => {
  // Eyebrow animation is CSS-controlled (0.3s delay)
  // Words are CSS-controlled via --d variable
});


/* ── 3. THEME SWITCHER ─────────────────────────────────────────
   Sets data-theme attribute on <html> element.
   Ruby is default (no data-theme = ruby in CSS :root).
   ─────────────────────────────────────────────────────────────── */

// EDIT: change 'ruby' to any other theme name if you want a
// different default. Options: ruby · lava · space · oxford · light
const DEFAULT_THEME = 'ruby';

function setTheme(themeName, dotEl) {
  // 'ruby' maps to :root (no attribute needed), others use data-theme
  if (themeName === 'ruby') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  // Update active dot highlight
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  if (dotEl) dotEl.classList.add('active');
  // Save preference
  localStorage.setItem('edumoe-theme', themeName);
  showToast('Theme: ' + themeName);
}

// Restore saved theme on load
(function restoreTheme() {
  const saved = localStorage.getItem('edumoe-theme') || DEFAULT_THEME;
  if (saved !== 'ruby') document.documentElement.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('td-' + saved);
    if (dot) dot.classList.add('active');
    else {
      // Default: activate ruby dot
      const rubyDot = document.getElementById('td-ruby');
      if (rubyDot) rubyDot.classList.add('active');
    }
  });
})();


/* ── 4. NAVIGATION ─────────────────────────────────────────────
   Single-page navigation. Each "page" is a <div class="page"
   id="page-NAME">. goPage('NAME') shows the right one.
   ─────────────────────────────────────────────────────────────── */

function goPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'visible');
  });
  // Remove active state from all nav links
  document.querySelectorAll('.nav-btn-link').forEach(l => l.classList.remove('active'));

  // Show the target page
  const target = document.getElementById('page-' + pageId);
  if (!target) return;
  target.classList.add('active');

  // Use requestAnimationFrame for smooth fade-in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.add('visible'));
  });

  // Mark the matching nav link as active
  document.querySelectorAll('.nav-btn-link').forEach(l => {
    const oc = l.getAttribute('onclick') || '';
    if (oc.includes("'" + pageId + "'")) l.classList.add('active');
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Page-specific init
  if (pageId === 'flashcards') renderFlashcards();
  if (pageId === 'simulators') {
    initProbabilityChart();
    setTimeout(initLogisim, 80); // canvas needs to be visible first
  }

  // Re-run scroll reveal for new page elements
  setTimeout(initScrollReveal, 80);
}

// Update footer year automatically
document.addEventListener('DOMContentLoaded', () => {
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
});


/* ── 5. SCROLL REVEAL ──────────────────────────────────────────
   Elements with class "sr" are hidden and animate in when
   they scroll into the viewport. Delays: sr-delay-1 through 4.
   ─────────────────────────────────────────────────────────────── */

function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), i * 40);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.sr:not(.in)').forEach(el => observer.observe(el));
}


/* ── 6. TOAST NOTIFICATION ─────────────────────────────────────
   showToast('message') shows a temporary notification.
   ─────────────────────────────────────────────────────────────── */

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toast-msg');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}


/* ── 7. PARALLAX BACKGROUND ────────────────────────────────────
   Background orbs follow the mouse slowly for depth effect.
   ─────────────────────────────────────────────────────────────── */

document.addEventListener('mousemove', e => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  document.querySelectorAll('.bg-orb').forEach((orb, i) => {
    const factor = (i + 1) * 6;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});


/* ── 8. CARD TILT EFFECT ───────────────────────────────────────
   Course cards, pricing cards, and about facts tilt toward
   the mouse cursor while hovering.
   ─────────────────────────────────────────────────────────────── */

document.addEventListener('mousemove', e => {
  document.querySelectorAll('.course-card, .price-card, .about-fact, .feature-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right
                && e.clientY >= rect.top  && e.clientY <= rect.bottom;
    if (!inside) { card.style.transform = ''; return; }
    const rx = (rect.height / 2 - (e.clientY - rect.top))  / 32;
    const ry = ((e.clientX - rect.left) - rect.width / 2)  / 32;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
});


/* ── 9. AUTH — LOGIN / SIGNUP / LOGOUT ─────────────────────────
   Uses Supabase Auth. Functions called by modal buttons.
   ─────────────────────────────────────────────────────────────── */

// Diagnose connection issues before showing generic error
function _diagAuthError(err) {
  const msg = err?.message || String(err);
  if (location.protocol === 'file:') {
    showToast('❌ Open the site via a server (not file://). Browsers block auth from local files.');
    return;
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('NetworkError')) {
    showToast('❌ Cannot reach Supabase. Check your internet or try a VPN.');
    return;
  }
  showToast('❌ ' + msg);
}

// Sign up a new user
async function doSignup() {
  const name  = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const pass  = document.getElementById('signupPassword')?.value;

  if (!name || !email || !pass) { showToast('⚠️ Fill in all fields'); return; }
  if (pass.length < 6) { showToast('⚠️ Password must be 6+ characters'); return; }

  if (location.protocol === 'file:') {
    showToast('❌ Open the site via a server (not file://). Browsers block auth from local files.');
    return;
  }

  showToast('⏳ Creating your account...');

  try {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name } }
    });
    if (error) { _diagAuthError(error); return; }
    document.getElementById('signupModal')?.classList.remove('open');
    showToast('✅ Check your email to confirm your account!');
  } catch(e) {
    _diagAuthError(e);
  }
}

// Log in an existing user
async function doLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass  = document.getElementById('loginPassword')?.value;

  if (!email || !pass) { showToast('⚠️ Enter email and password'); return; }

  if (location.protocol === 'file:') {
    showToast('❌ Open the site via a server (not file://). Browsers block auth from local files.');
    return;
  }

  showToast('⏳ Logging in...');

  try {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { _diagAuthError(error); return; }
    document.getElementById('loginModal')?.classList.remove('open');
    const firstName = data.user.user_metadata?.full_name?.split(' ')[0] || 'student';
    showToast('👋 Welcome back, ' + firstName + '!');
    updateAuthUI(data.user);
  } catch(e) {
    _diagAuthError(e);
  }
}

// Log out current user
async function doLogout() {
  await _supabase.auth.signOut();
  showToast('👋 Logged out');
  updateAuthUI(null);
}

// Update the navbar buttons based on auth state
function updateAuthUI(user) {
  const loginBtn  = document.getElementById('loginNavBtn');
  const signupBtn = document.getElementById('signupNavBtn');
  if (!loginBtn || !signupBtn) return;

  if (user) {
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Profile';
    loginBtn.innerHTML = `<i class="fas fa-user-circle" style="font-size:13px;"></i> ${firstName}`;
    loginBtn.onclick = () => showToast('👤 Profile page coming soon!');
    signupBtn.textContent = 'Log out';
    signupBtn.onclick = doLogout;
  } else {
    loginBtn.innerHTML = '<i class="fas fa-user" style="font-size:13px;"></i> Log in';
    loginBtn.onclick = () => document.getElementById('loginModal')?.classList.add('open');
    signupBtn.textContent = 'Sign up';
    signupBtn.onclick = () => document.getElementById('signupModal')?.classList.add('open');
  }
}

// Check for existing session on page load
_supabase.auth.getSession().then(({ data }) => {
  if (data.session) updateAuthUI(data.session.user);
});

// Listen for auth state changes (e.g. after email confirmation)
_supabase.auth.onAuthStateChange((event, session) => {
  updateAuthUI(session?.user || null);
});

// Close modals when clicking outside them
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});


/* ── 10. QUIZ SYSTEM ────────────────────────────────────────────
   Built-in quiz questions. loadQ(key) loads a question.
   answerQ(el) handles the answer. toggleExpl() shows explanation.

   EDIT: Add more questions by adding entries to the QUESTIONS
   object below in the same format.
   ─────────────────────────────────────────────────────────────── */

let quizAnswered = false;

// EDIT: Add, remove, or change quiz questions here
// ── QUIZ QUESTION BANK ───────────────────────────────────────
// Multiple questions per topic — shown randomly each time

const QUESTION_BANK = {
  cpp: [
    {
      topic: 'C++ · Data Types',
      q: 'Which C++ data type stores a single character?',
      opts: ['A. string','B. char','C. letter','D. text'],
      ans: 1,
      explanation: '`char` stores a single character (1 byte). `string` stores a sequence of characters. Example: char grade = \'A\';'
    },
    {
      topic: 'C++ · Variables',
      q: 'What is the correct syntax to declare an integer variable x with value 5?',
      opts: ['A. x = 5;','B. int x = 5;','C. integer x = 5;','D. var x = 5;'],
      ans: 1,
      explanation: 'In C++, you must specify the type: `int x = 5;`. Unlike Python or JavaScript, C++ is statically typed.'
    },
    {
      topic: 'C++ · Control Flow',
      q: 'Which loop guarantees at least one execution of its body?',
      opts: ['A. for','B. while','C. do-while','D. foreach'],
      ans: 2,
      explanation: 'A `do-while` loop executes its body first, then checks the condition. Even if the condition is false from the start, the body runs once.'
    },
    {
      topic: 'C++ · Decisions',
      q: 'In C++, what does the `else if` clause allow you to do?',
      opts: ['A. Define a loop','B. Chain multiple conditions','C. Declare a function','D. Allocate memory'],
      ans: 1,
      explanation: '`else if` lets you test multiple conditions in sequence. Only the first true branch executes. This avoids deeply nested if statements.'
    },
    {
      topic: 'C++ · Loops',
      q: 'What is the output of: for(int i=0; i<3; i++) cout << i; ?',
      opts: ['A. 1 2 3','B. 0 1 2','C. 0 1 2 3','D. 1 2'],
      ans: 1,
      explanation: 'The loop starts at i=0, runs while i<3, and increments by 1 each iteration. It prints 0, 1, 2 — stopping before i reaches 3.'
    }
  ],
  logic: [
    {
      topic: 'Logic Design · Gates',
      q: 'What is the output of a NAND gate when both inputs are 1?',
      opts: ['A. 1','B. 0','C. X','D. Z'],
      ans: 1,
      explanation: 'NAND = NOT AND. AND(1,1) = 1, so NAND(1,1) = NOT(1) = 0. NAND is the universal gate — any other gate can be built from NANDs.'
    },
    {
      topic: 'Logic Design · Gates',
      q: 'Which gate outputs 1 only when an odd number of inputs are 1?',
      opts: ['A. OR','B. AND','C. XNOR','D. XOR'],
      ans: 3,
      explanation: 'XOR (Exclusive OR) outputs 1 when inputs differ (odd count of 1s). For two inputs: A⊕B = 1 only when exactly one input is 1.'
    },
    {
      topic: 'Logic Design · Boolean Algebra',
      q: 'Simplify: A + A\'  (A OR NOT A)',
      opts: ['A. A','B. 0','C. 1','D. A\''],
      ans: 2,
      explanation: 'A + A\' = 1 always (Complement Law). Any variable ORed with its own complement equals 1. This is a fundamental Boolean identity.'
    },
    {
      topic: 'Logic Design · Number Systems',
      q: 'What is the decimal value of the binary number 1010?',
      opts: ['A. 8','B. 10','C. 12','D. 5'],
      ans: 1,
      explanation: '1010 in binary = 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10. Remember: positions are powers of 2 from right to left.'
    },
    {
      topic: 'Logic Design · Circuits',
      q: 'In a Half Adder, what are the two outputs?',
      opts: ['A. Sum and Carry','B. Input and Output','C. And and Or','D. Bit and Byte'],
      ans: 0,
      explanation: 'A Half Adder adds two single bits and produces Sum (A XOR B) and Carry (A AND B). A Full Adder adds a third Carry-In input.'
    }
  ],
  calculus: [
    {
      topic: 'Calculus · Derivatives',
      q: 'What is the derivative of e^(3x) with respect to x?',
      opts: ['A. e^(3x)','B. 3e^(3x)','C. 3x·e^(3x-1)','D. e^x'],
      ans: 1,
      explanation: 'Chain rule: d/dx[e^(3x)] = e^(3x) · d/dx[3x] = 3e^(3x). The derivative of e^u is e^u · u\', where u=3x so u\'=3.'
    },
    {
      topic: 'Calculus · Integration',
      q: 'What is ∫ x² dx?',
      opts: ['A. 2x','B. x³','C. x³/3 + C','D. 3x³'],
      ans: 2,
      explanation: 'Power rule for integrals: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. For x²: ∫x² dx = x³/3 + C. Always add the constant of integration C.'
    },
    {
      topic: 'Calculus · ODEs',
      q: 'For y\'\' + 4y = 0, what type of solution does the characteristic equation give?',
      opts: ['A. Two real roots','B. Repeated root','C. Complex conjugate roots','D. No solution'],
      ans: 2,
      explanation: 'Characteristic equation: r² + 4 = 0 → r = ±2i. These are pure imaginary (complex conjugate) roots, giving solution y = C₁cos(2x) + C₂sin(2x).'
    },
    {
      topic: 'Calculus · Integration',
      q: 'What is ∫ sin(x) dx?',
      opts: ['A. cos(x) + C','B. -cos(x) + C','C. sin(x) + C','D. -sin(x) + C'],
      ans: 1,
      explanation: '∫sin(x)dx = -cos(x) + C. Remember: d/dx[-cos(x)] = sin(x). The minus sign is crucial — a common exam mistake is to write cos(x)+C.'
    },
    {
      topic: 'Calculus · Arc Length',
      q: 'The arc length formula for y=f(x) from a to b involves which expression under the square root?',
      opts: ['A. 1 + (f\'(x))²','B. f\'(x)²','C. 1 + f(x)','D. (f(x))² + 1'],
      ans: 0,
      explanation: 'Arc length L = ∫[a to b] √(1 + (f\'(x))²) dx. The 1 comes from the dx² term in ds² = dx² + dy². This is derived from the Pythagorean theorem.'
    }
  ],
  prob: [
    {
      topic: 'Probability · Distributions',
      q: 'Which distribution describes the number of successes in n independent Bernoulli trials?',
      opts: ['A. Normal','B. Poisson','C. Binomial','D. Exponential'],
      ans: 2,
      explanation: 'Binomial B(n,p): models successes in n independent trials each with probability p. P(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ.'
    },
    {
      topic: 'Probability · Basics',
      q: 'If P(A) = 0.4 and P(B) = 0.3 and A, B are independent, what is P(A and B)?',
      opts: ['A. 0.70','B. 0.12','C. 0.10','D. 0.07'],
      ans: 1,
      explanation: 'For independent events: P(A∩B) = P(A)·P(B) = 0.4 × 0.3 = 0.12. Independence means one event does not affect the probability of the other.'
    },
    {
      topic: 'Probability · Normal Distribution',
      q: 'In a Normal distribution N(μ, σ²), approximately what % of data lies within 1 standard deviation?',
      opts: ['A. 50%','B. 68%','C. 95%','D. 99.7%'],
      ans: 1,
      explanation: 'The 68-95-99.7 rule: ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ of the mean. This is fundamental to statistics and hypothesis testing.'
    },
    {
      topic: 'Probability · Combinatorics',
      q: 'How many ways can you choose 3 students from a group of 5? (order doesn\'t matter)',
      opts: ['A. 60','B. 15','C. 10','D. 20'],
      ans: 2,
      explanation: 'C(5,3) = 5!/(3!·2!) = (5×4)/(2×1) = 10. Combinations count selections where order doesn\'t matter. If order mattered (permutations): P(5,3) = 60.'
    },
    {
      topic: 'Probability · Poisson',
      q: 'In a Poisson distribution with λ=3, what is the expected value E[X]?',
      opts: ['A. 3','B. √3','C. 9','D. 1/3'],
      ans: 0,
      explanation: 'For Poisson(λ): E[X] = λ and Var[X] = λ. Both equal λ — a special property. Here λ=3, so E[X] = 3 and σ = √3 ≈ 1.73.'
    }
  ]
};

// Pick a random question from a topic, track last shown to avoid repeats
const _lastQ = {};
function getRandomQuestion(topic) {
  const bank = QUESTION_BANK[topic];
  if (!bank) return null;
  let idx;
  do { idx = Math.floor(Math.random() * bank.length); }
  while (bank.length > 1 && idx === _lastQ[topic]);
  _lastQ[topic] = idx;
  const q = bank[idx];
  return {
    topic: q.topic,
    q: q.q,
    opts: q.opts.map((text, i) => ({ text, correct: i === q.ans })),
    explanation: q.explanation
  };
}

// Legacy alias — quiz cards use QUESTIONS[key] so we proxy it
const QUESTIONS = new Proxy({}, {
  get(_, key) { return getRandomQuestion(key); }
});

function loadQuizQuestion(key) {
  const q = QUESTIONS[key]; if (!q) return;
  quizAnswered = false;

  const topicBadge = document.getElementById('quiz-topic-badge');
  if (topicBadge) topicBadge.innerHTML = '<div class="section-label-dot"></div>' + q.topic;

  const questionEl = document.getElementById('quiz-q');
  if (questionEl) questionEl.textContent = q.q;

  const optsEl = document.getElementById('quiz-opts');
  if (optsEl) {
    optsEl.innerHTML = q.opts.map(opt => `
      <button class="quiz-opt" data-correct="${opt.correct}" onclick="answerQuiz(this)">
        ${opt.text}
      </button>
    `).join('');
  }

  const fb   = document.getElementById('quiz-fb');
  const expl = document.getElementById('quiz-expl');
  if (fb)   fb.style.display   = 'none';
  if (expl) expl.style.display = 'none';
}

function answerQuiz(el) {
  if (quizAnswered) return;
  quizAnswered = true;

  // Disable all options
  document.querySelectorAll('.quiz-opt').forEach(o => o.style.pointerEvents = 'none');

  const isCorrect = el.getAttribute('data-correct') === 'true';
  el.classList.add(isCorrect ? 'correct' : 'wrong');

  // Show feedback
  const fb = document.getElementById('quiz-fb');
  if (fb) {
    fb.style.display = 'block';
    fb.style.background = isCorrect ? 'rgba(39,174,96,0.13)' : 'rgba(220,53,69,0.13)';
    fb.style.borderRadius = '12px';
    fb.style.padding = '13px 16px';
    fb.textContent = isCorrect ? '✅ Correct! Well done.' : '❌ Not quite — check the explanation.';
  }

  if (isCorrect) showToast('🎉 Correct! +50 XP');

  // Auto-show explanation
  const expl = document.getElementById('quiz-expl');
  if (expl) {
    const qKey = document.querySelector('[data-quiz-key]')?.getAttribute('data-quiz-key');
    // Try to find current question explanation from the opts we built
    const q = Object.values(QUESTIONS).find(q => q.opts.some(o => el.textContent.trim().startsWith(o.text.substring(0,5))));
    expl.style.display = 'block';
    if (q) expl.innerHTML = `<strong style="color:var(--accent2)">📚 Explanation</strong><br><br>${q.explanation}`;
  }
}

function toggleExplanation() {
  const expl = document.getElementById('quiz-expl');
  if (expl) expl.style.display = expl.style.display === 'block' ? 'none' : 'block';
}


/* ── 11. FLASHCARDS ─────────────────────────────────────────────
   Stored in localStorage. renderFlashcards() draws the deck.
   addFlashcard() adds a new card. clearFlashcards() removes all.
   ─────────────────────────────────────────────────────────────── */

function renderFlashcards() {
  const cards = JSON.parse(localStorage.getItem('edumoe-cards') || '[]');
  const deck  = document.getElementById('fc-deck');
  if (!deck) return;

  if (!cards.length) {
    deck.innerHTML = '<p class="sf-body" style="grid-column:1/-1;color:var(--txt3);">No cards yet — add one above!</p>';
    return;
  }

  deck.innerHTML = cards.map((card, i) => `
    <div class="flashcard" onclick="this.classList.toggle('flipped')">
      <div class="fc-inner">
        <div class="fc-face fc-front">${card.front}</div>
        <div class="fc-face fc-back">${card.back}</div>
      </div>
    </div>
  `).join('');
}

function addFlashcard() {
  const frontEl = document.getElementById('fc-f');
  const backEl  = document.getElementById('fc-b');
  const catEl   = document.getElementById('fc-cat');
  if (!frontEl || !backEl) return;

  const front = frontEl.value.trim();
  const back  = backEl.value.trim();
  if (!front || !back) { showToast('⚠️ Fill in both sides'); return; }

  const cards = JSON.parse(localStorage.getItem('edumoe-cards') || '[]');
  cards.push({ front, back, category: catEl?.value || 'General', created: Date.now() });
  localStorage.setItem('edumoe-cards', JSON.stringify(cards));

  frontEl.value = '';
  backEl.value  = '';
  renderFlashcards();
  showToast('✅ Card added!');
}

function clearFlashcards() {
  if (confirm('Delete all flashcards? This cannot be undone.')) {
    localStorage.removeItem('edumoe-cards');
    renderFlashcards();
    showToast('🗑️ All cards deleted');
  }
}


/* ── 12. C++ COMPILER ──────────────────────────────────────────
   Uses OneCompiler embedded iframe — no API key needed.
   The custom editor below uses Judge0 API with fallback to
   pattern-based simulation.
   ─────────────────────────────────────────────────────────────── */

// Pre-written C++ examples for the selector dropdown
// EDIT: Add your own examples here
const CPP_EXAMPLES = {
  hello: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to EDUMOE!" << endl;
    return 0;
}`,
  fibonacci: `#include <iostream>
using namespace std;
int fib(int n) {
    if(n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
int main() {
    cout << "Fibonacci sequence:" << endl;
    for(int i = 0; i < 12; i++)
        cout << "fib(" << i << ") = " << fib(i) << endl;
    return 0;
}`,
  factorial: `#include <iostream>
using namespace std;
long long factorial(int n) {
    if(n <= 1) return 1;
    return n * factorial(n-1);
}
int main() {
    for(int i = 0; i <= 10; i++)
        cout << i << "! = " << factorial(i) << endl;
    return 0;
}`,
  pointers: `#include <iostream>
using namespace std;
void swap(int* a, int* b) {
    int temp = *a; *a = *b; *b = temp;
}
int main() {
    int x = 42, y = 99;
    cout << "Before: x=" << x << " y=" << y << endl;
    swap(&x, &y);
    cout << "After:  x=" << x << " y=" << y << endl;
    int arr[] = {3, 1, 4, 1, 5, 9};
    int* ptr = arr;
    cout << "Array via pointer: ";
    for(int i = 0; i < 6; i++) cout << *(ptr+i) << " ";
    cout << endl;
    return 0;
}`,
  oop: `#include <iostream>
#include <string>
using namespace std;
class Student {
private:
    string name;
    int grade;
public:
    Student(string n, int g) : name(n), grade(g) {}
    void display() {
        cout << "Student: " << name
             << " | Grade: " << grade
             << " | Status: " << (grade >= 60 ? "Pass" : "Fail") << endl;
    }
};
int main() {
    Student s1("Ahmed", 85);
    Student s2("Sara",  72);
    Student s3("Omar",  55);
    s1.display(); s2.display(); s3.display();
    return 0;
}`
};

function loadCppExample(key) {
  const code = CPP_EXAMPLES[key];
  if (!code) return;
  const editor = document.getElementById('cppEditor');
  if (editor) { editor.value = code; updateLineNumbers(); }
  document.getElementById('outputPanel')?.classList.remove('show');
  showToast('✏️ Example loaded — press Run!');
}

function resetCppCode() {
  const editor = document.getElementById('cppEditor');
  if (editor) { editor.value = CPP_EXAMPLES.hello; updateLineNumbers(); }
  document.getElementById('outputPanel')?.classList.remove('show');
}

function updateLineNumbers() {
  const editor = document.getElementById('cppEditor');
  const nums   = document.getElementById('lineNums');
  if (!editor || !nums) return;
  const count = editor.value.split('\n').length;
  nums.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join('<br>');
}

// Ctrl+Enter shortcut to run code
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const editor = document.getElementById('cppEditor');
    if (document.activeElement === editor) runCppCode();
  }
});

async function runCppCode() {
  const editor   = document.getElementById('cppEditor');
  const btn      = document.getElementById('run-btn');
  const spinner  = document.getElementById('spinner');
  const runMsg   = document.getElementById('runMsg');
  const outPanel = document.getElementById('outputPanel');
  const outBody  = document.getElementById('outputBody');
  const execTime = document.getElementById('exec-time');
  if (!editor) return;

  const code = editor.value.trim();
  if (!code) { showToast('⚠️ Write some code first!'); return; }

  // UI: loading state
  if (btn)      { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Running...'; }
  if (spinner)  spinner.classList.add('show');
  if (runMsg)   runMsg.textContent = 'Compiling...';
  if (outPanel) outPanel.classList.add('show');
  if (outBody)  { outBody.className = 'output-body out-info'; outBody.textContent = 'Compiling and running...'; }
  if (execTime) execTime.textContent = '';

  const startTime = Date.now();

  try {
    // Try Judge0 public CE instance (no key needed for basic use)
    const submitRes = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: 54,  // C++ (GCC 9.2.0)
        source_code: code,
        stdin: '',
        cpu_time_limit: 5
      })
    });

    if (!submitRes.ok) throw new Error('JUDGE0_UNAVAILABLE');

    const result = await submitRes.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    if (execTime) execTime.textContent = `⏱ ${result.time || elapsed}s`;

    if (result.stdout) {
      if (outBody) { outBody.className = 'output-body out-ok'; outBody.textContent = result.stdout; }
    } else if (result.compile_output) {
      if (outBody) { outBody.className = 'output-body out-err'; outBody.textContent = '🔴 Compile error:\n' + result.compile_output; }
    } else if (result.stderr) {
      if (outBody) { outBody.className = 'output-body out-err'; outBody.textContent = '🔴 Runtime error:\n' + result.stderr; }
    } else {
      if (outBody) { outBody.className = 'output-body out-info'; outBody.textContent = '(No output)'; }
    }

  } catch (err) {
    // Fallback: smart simulation for the built-in example programs
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    if (execTime) execTime.textContent = '⏱ simulated';
    if (outBody) {
      outBody.className = 'output-body';
      outBody.innerHTML = simulateCppOutput(code);
    }
  }

  // Reset UI
  if (btn)     { btn.disabled = false; btn.innerHTML = '<i class="fas fa-play"></i> Run'; }
  if (spinner) spinner.classList.remove('show');
  if (runMsg)  runMsg.textContent = '';
  showToast('▶️ Done!');
}

// Pattern-based output simulation for demo purposes
function simulateCppOutput(code) {
  if (code.includes('Hello, World')) return '<span class="out-ok">Hello, World!\nWelcome to EDUMOE!</span>';
  if (code.includes('fib('))        return '<span class="out-ok">Fibonacci sequence:\nfib(0) = 0\nfib(1) = 1\nfib(2) = 1\nfib(3) = 2\nfib(4) = 3\nfib(5) = 5\nfib(6) = 8\nfib(7) = 13\nfib(8) = 21\nfib(9) = 34\nfib(10) = 55\nfib(11) = 89</span>';
  if (code.includes('factorial'))   return '<span class="out-ok">0! = 1\n1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n6! = 720\n7! = 5040\n8! = 40320\n9! = 362880\n10! = 3628800</span>';
  if (code.includes('swap(&x'))     return '<span class="out-ok">Before: x=42 y=99\nAfter:  x=99 y=42\nArray via pointer: 3 1 4 1 5 9 </span>';
  if (code.includes('class Student')) return '<span class="out-ok">Student: Ahmed | Grade: 85 | Status: Pass\nStudent: Sara | Grade: 72 | Status: Pass\nStudent: Omar | Grade: 55 | Status: Fail</span>';
  // Try to extract cout strings
  const matches = [...code.matchAll(/cout\s*<<\s*["']([^"']+)["']/g)];
  if (matches.length) return `<span class="out-ok">${matches.map(m => m[1]).join('\n')}</span>`;
  return `<span class="out-info">⚠️ Live execution unavailable right now.\nTry the OneCompiler tab above for guaranteed execution.\n\nFor API-powered execution:\nGet a free key at judge0.com and update app.js</span>`;
}



/* ── 13. SIMULATOR HELPERS ─────────────────────────────────────
   4 Simulators — one per subject:
   1. C++ Compiler — OneCompiler iframe (embedded in HTML)
   2. Logic Design — Inline Logisim-style gate simulator
   3. Calculus/ODE — Full math solver (derivatives, integrals, ODEs)
   4. Probability  — Multi-distribution visualizer
   ─────────────────────────────────────────────────────────────── */

// ── Logisim-style gate simulator ──────────────────────────────
let logisimGates = [];
let logisimMode = 'select';
let logisimCanvas, logisimCtx;
let logisimSelected = null;
let logisimDragging = null;
let logisimDragOffset = {x:0,y:0};

function initLogisim() {
  logisimCanvas = document.getElementById('logisim-canvas');
  if (!logisimCanvas) return;
  logisimCtx = logisimCanvas.getContext('2d');
  logisimCanvas.width  = logisimCanvas.offsetWidth  || 800;
  logisimCanvas.height = logisimCanvas.offsetHeight || 380;
  loadLogisimPreset('half-adder');
  logisimCanvas.addEventListener('mousedown', logisimMouseDown);
  logisimCanvas.addEventListener('mousemove', logisimMouseMove);
  logisimCanvas.addEventListener('mouseup',   () => { logisimDragging = null; });
}

const LOGISIM_PRESETS = {
  'half-adder': { gates: [
    {type:'IN',  x:60,  y:80,  label:'A', value:0, inputs:[]},
    {type:'IN',  x:60,  y:180, label:'B', value:0, inputs:[]},
    {type:'XOR', x:220, y:100, label:'XOR', inputs:[{g:0},{g:1}]},
    {type:'AND', x:220, y:200, label:'AND', inputs:[{g:0},{g:1}]},
    {type:'OUT', x:380, y:100, label:'S', inputs:[{g:2}]},
    {type:'OUT', x:380, y:200, label:'C', inputs:[{g:3}]},
  ]},
  'full-adder': { gates: [
    {type:'IN',  x:40,  y:60,  label:'A',   value:0, inputs:[]},
    {type:'IN',  x:40,  y:140, label:'B',   value:0, inputs:[]},
    {type:'IN',  x:40,  y:220, label:'Cin', value:0, inputs:[]},
    {type:'XOR', x:170, y:80,  label:'XOR1', inputs:[{g:0},{g:1}]},
    {type:'AND', x:170, y:200, label:'AND1', inputs:[{g:0},{g:1}]},
    {type:'XOR', x:300, y:100, label:'XOR2', inputs:[{g:3},{g:2}]},
    {type:'AND', x:300, y:200, label:'AND2', inputs:[{g:3},{g:2}]},
    {type:'OR',  x:400, y:220, label:'OR',   inputs:[{g:4},{g:6}]},
    {type:'OUT', x:480, y:100, label:'Sum',  inputs:[{g:5}]},
    {type:'OUT', x:480, y:230, label:'Cout', inputs:[{g:7}]},
  ]},
  'sr-latch': { gates: [
    {type:'IN',  x:40,  y:80,  label:'S', value:0, inputs:[]},
    {type:'IN',  x:40,  y:200, label:'R', value:0, inputs:[]},
    {type:'NOR', x:180, y:80,  label:'NOR1', inputs:[{g:0}]},
    {type:'NOR', x:180, y:200, label:'NOR2', inputs:[{g:1}]},
    {type:'OUT', x:330, y:80,  label:'Q',    inputs:[{g:2}]},
    {type:'OUT', x:330, y:200, label:"Q'",  inputs:[{g:3}]},
  ]},
  'decoder': { gates: [
    {type:'IN',  x:40,  y:80,  label:'A', value:0, inputs:[]},
    {type:'IN',  x:40,  y:180, label:'B', value:0, inputs:[]},
    {type:'NOT', x:160, y:60,  label:"A'", inputs:[{g:0}]},
    {type:'NOT', x:160, y:160, label:"B'", inputs:[{g:1}]},
    {type:'AND', x:290, y:40,  label:'D0', inputs:[{g:2},{g:3}]},
    {type:'AND', x:290, y:110, label:'D1', inputs:[{g:2},{g:1}]},
    {type:'AND', x:290, y:180, label:'D2', inputs:[{g:0},{g:3}]},
    {type:'AND', x:290, y:250, label:'D3', inputs:[{g:0},{g:1}]},
    {type:'OUT', x:420, y:40,  label:'D0', inputs:[{g:4}]},
    {type:'OUT', x:420, y:110, label:'D1', inputs:[{g:5}]},
    {type:'OUT', x:420, y:180, label:'D2', inputs:[{g:6}]},
    {type:'OUT', x:420, y:250, label:'D3', inputs:[{g:7}]},
  ]}
};

function loadLogisimPreset(name) {
  if (!logisimCtx) initLogisim();
  const preset = LOGISIM_PRESETS[name];
  if (!preset) return;
  logisimGates = preset.gates.map(g => ({...g, inputs:(g.inputs||[]).map(i=>({...i}))}));
  computeLogisim(); drawLogisim(); buildTruthTable();
  showToast('\u{1F50C} Loaded: ' + name);
}

function setLogisimMode(mode, btn) {
  if (!logisimCtx) initLogisim();
  logisimMode = mode;
  document.querySelectorAll('.gate-btn[data-mode]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function computeLogisim() {
  function evalGate(idx, visited = new Set()) {
    if (visited.has(idx)) return 0;
    visited.add(idx);
    const g = logisimGates[idx];
    if (!g) return 0;
    if (g.type === 'IN') return g.value || 0;
    const ins = (g.inputs||[]).map(i => evalGate(i.g, new Set(visited)));
    switch(g.type) {
      case 'AND':  return ins.length ? ins.reduce((a,b)=>a&b, 1) : 0;
      case 'OR':   return ins.length ? ins.reduce((a,b)=>a|b, 0) : 0;
      case 'NOT':  return ins.length ? (ins[0]?0:1) : 1;
      case 'NAND': return ins.length ? (ins.reduce((a,b)=>a&b,1)?0:1) : 1;
      case 'NOR':  return ins.length ? (ins.reduce((a,b)=>a|b,0)?0:1) : 1;
      case 'XOR':  return ins.length ? ins.reduce((a,b)=>a^b, 0) : 0;
      case 'XNOR': return ins.length ? (ins.reduce((a,b)=>a^b,0)?0:1) : 1;
      case 'OUT':  return ins.length ? ins[0] : 0;
      default: return 0;
    }
  }
  logisimGates.forEach((g,i) => { g._val = evalGate(i); });
}

function drawLogisim() {
  if (!logisimCtx) { initLogisim(); return; }
  const c = logisimCtx;
  const W = logisimCanvas.width, H = logisimCanvas.height;
  c.clearRect(0,0,W,H);
  // Grid
  c.strokeStyle='rgba(255,255,255,0.04)'; c.lineWidth=1;
  for(let x=0;x<W;x+=20){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  for(let y=0;y<H;y+=20){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  // Wires first
  logisimGates.forEach((g) => {
    (g.inputs||[]).forEach((inp,portIdx) => {
      const from = logisimGates[inp.g]; if(!from) return;
      const fx=from.x+56, fy=from.y+18, tx=g.x, ty=g.y+10+portIdx*16;
      c.strokeStyle = from._val ? '#4ade80aa':'#3a3a5caa';
      c.lineWidth=1.8;
      c.beginPath(); c.moveTo(fx,fy);
      c.bezierCurveTo(fx+28,fy,tx-28,ty,tx,ty);
      c.stroke();
    });
  });
  // Gates
  logisimGates.forEach((g,i) => {
    const sel=logisimSelected===i, val=g._val||0;
    const gateColors={AND:'#e5c07b',OR:'#61afef',NOT:'#98c379',NAND:'#e06c75',NOR:'#ff79c6',XOR:'#c678dd',XNOR:'#56b6c2'};
    const col = gateColors[g.type]||'#abb2bf';
    c.save(); c.translate(g.x,g.y);
    if(g.type==='IN') {
      c.fillStyle=val?'rgba(74,222,128,0.22)':'rgba(255,255,255,0.07)';
      c.strokeStyle=sel?'#e11d48':val?'#4ade80':'rgba(255,255,255,0.28)';
      c.lineWidth=sel?2:1.5;
      c.beginPath();c.arc(22,18,18,0,Math.PI*2);c.fill();c.stroke();
      c.fillStyle='#fff';c.font='bold 10px Inter';c.textAlign='center';c.textBaseline='middle';
      c.fillText(g.label,22,18);
      c.strokeStyle=val?'#4ade80':'#444';c.lineWidth=1.5;
      c.beginPath();c.moveTo(40,18);c.lineTo(56,18);c.stroke();
      c.fillStyle=val?'#4ade80':'#555';c.beginPath();c.arc(56,18,3,0,Math.PI*2);c.fill();
    } else if(g.type==='OUT') {
      c.fillStyle=val?'rgba(74,222,128,0.18)':'rgba(255,255,255,0.05)';
      c.strokeStyle=sel?'#e11d48':val?'#4ade80':'rgba(255,255,255,0.22)';
      c.lineWidth=sel?2:1.5;
      c.beginPath();c.roundRect(2,5,50,26,6);c.fill();c.stroke();
      c.fillStyle=val?'#4ade80':'#abb2bf';c.font='bold 9px Inter';c.textAlign='center';c.textBaseline='middle';
      c.fillText(g.label,27,18);
      c.strokeStyle=val?'#4ade80':'#444';c.lineWidth=1.5;
      c.beginPath();c.moveTo(-12,18);c.lineTo(0,18);c.stroke();
      c.fillStyle=val?'#4ade80':'#555';c.beginPath();c.arc(-12,18,3,0,Math.PI*2);c.fill();
      // Output LED indicator
      c.fillStyle=val?'#4ade80':'#ef4444';c.beginPath();c.arc(27,-8,5,0,Math.PI*2);c.fill();
    } else {
      c.fillStyle=sel?col+'33':'rgba(255,255,255,0.06)';
      c.strokeStyle=sel?col:col+'88';c.lineWidth=sel?2:1.4;
      c.beginPath();c.roundRect(0,0,52,36,8);c.fill();c.stroke();
      c.fillStyle=col;c.font='bold 8px monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText(g.type,26,18);
      (g.inputs||[]).forEach((_,idx)=>{
        const py=10+idx*16;
        c.strokeStyle='#3a3a5c';c.lineWidth=1;
        c.beginPath();c.moveTo(-12,py);c.lineTo(0,py);c.stroke();
        c.fillStyle='#444';c.beginPath();c.arc(-12,py,2.5,0,Math.PI*2);c.fill();
      });
      c.strokeStyle=val?'#4ade80':'#3a3a5c';c.lineWidth=1.5;
      c.beginPath();c.moveTo(52,18);c.lineTo(64,18);c.stroke();
      c.fillStyle=val?'#4ade80':'#555';c.beginPath();c.arc(64,18,3,0,Math.PI*2);c.fill();
      c.fillStyle=val?'#4ade80':'#ef4444';c.beginPath();c.arc(26,-6,4,0,Math.PI*2);c.fill();
    }
    c.restore();
  });
}

function logisimMouseDown(e) {
  const rect=logisimCanvas.getBoundingClientRect();
  const mx=e.clientX-rect.left, my=e.clientY-rect.top;
  for(let i=logisimGates.length-1;i>=0;i--) {
    const g=logisimGates[i];
    const w=g.type==='IN'?50:g.type==='OUT'?56:70;
    if(mx>=g.x-5&&mx<=g.x+w&&my>=g.y-5&&my<=g.y+45) {
      if(logisimMode==='select') {
        if(g.type==='IN'){g.value=g.value?0:1;computeLogisim();drawLogisim();buildTruthTable();return;}
        logisimSelected=i;logisimDragging=i;logisimDragOffset={x:mx-g.x,y:my-g.y};
        drawLogisim();return;
      }
    }
  }
  const typeMap={addAND:'AND',addOR:'OR',addNOT:'NOT',addNAND:'NAND',addNOR:'NOR',addXOR:'XOR',addXNOR:'XNOR',addIN:'IN',addOUT:'OUT'};
  const gt=typeMap[logisimMode];
  if(gt){logisimGates.push({type:gt,x:mx-26,y:my-18,label:gt+(logisimGates.length+1),inputs:[],value:0});computeLogisim();drawLogisim();buildTruthTable();}
  logisimSelected=null;drawLogisim();
}

function logisimMouseMove(e) {
  if(logisimDragging===null)return;
  const rect=logisimCanvas.getBoundingClientRect();
  logisimGates[logisimDragging].x=e.clientX-rect.left-logisimDragOffset.x;
  logisimGates[logisimDragging].y=e.clientY-rect.top-logisimDragOffset.y;
  computeLogisim();drawLogisim();
}

function deleteLogisimSelected() {
  if (!logisimCtx) initLogisim();
  if(logisimSelected===null){showToast('Select a gate first');return;}
  const di=logisimSelected;
  logisimGates.splice(di,1);
  logisimGates.forEach(g=>{g.inputs=(g.inputs||[]).filter(i=>i.g!==di).map(i=>({...i,g:i.g>di?i.g-1:i.g}));});
  logisimSelected=null;computeLogisim();drawLogisim();buildTruthTable();
}
function clearLogisim(){ if(!logisimCtx)initLogisim();logisimGates=[];logisimSelected=null;computeLogisim();drawLogisim();const t=document.getElementById('logisim-tt');if(t)t.innerHTML='';}

function buildTruthTable() {
  const ttEl=document.getElementById('logisim-tt'); if(!ttEl)return;
  const ins=logisimGates.filter(g=>g.type==='IN');
  const outs=logisimGates.filter(g=>g.type==='OUT');
  if(!ins.length||!outs.length){ttEl.innerHTML='';return;}
  const n=ins.length; if(n>5){ttEl.innerHTML='<p style="color:var(--txt3);font-size:12px;">Too many inputs for truth table (max 5)</p>';return;}
  const rows=1<<n;
  let html='<table><tr>';
  ins.forEach(g=>html+=`<th>${g.label}</th>`);
  outs.forEach(g=>html+=`<th>${g.label}</th>`);
  html+='</tr>';
  for(let r=0;r<rows;r++){
    html+='<tr>';
    ins.forEach((g,i)=>{g.value=(r>>(n-1-i))&1;});
    computeLogisim();
    ins.forEach(g=>html+=`<td>${g.value}</td>`);
    outs.forEach(g=>html+=`<td class="${g._val?'out-1':'out-0'}">${g._val}</td>`);
    html+='</tr>';
  }
  ttEl.innerHTML=html+'</table>';
  ins.forEach(g=>g.value=0);computeLogisim();drawLogisim();
}


/* ── 14. CALCULUS & MATH SOLVER (INLINE) ────────────────────────
   Full solver: derivatives, integrals, ODEs, series, limits, simplify
   ─────────────────────────────────────────────────────────────── */

let mathChartInstance = null;

function solveMath(type) {
  const inputEl = document.getElementById('mathIn');
  const resultEl = document.getElementById('mathOut');
  if(!inputEl||!resultEl) return;
  const expr = inputEl.value.trim();
  if(!expr){showToast('⚠️ Enter an expression first');return;}
  resultEl.classList.add('show');
  resultEl.innerHTML='<span style="color:var(--txt3)">⏳ Computing...</span>';
  setTimeout(()=>{
    try {
      let output='';
      switch(type){
        case 'derivative': output=solveDerivative(expr); break;
        case 'integral':   output=solveIntegral(expr);   break;
        case 'ode':        output=solveODE(expr);        break;
        case 'simplify':   output=solveSimplify(expr);   break;
        case 'series':     output=solveSeries(expr);     break;
        case 'limit':      output=solveLimit(expr);      break;
        case 'plot':       plotFunction(expr); output=`<strong style="color:var(--accent2)">📈 Plotting f(x) = ${expr}</strong>`; break;
      }
      resultEl.innerHTML=output;
      if(type!=='plot'&&type!=='ode') plotFunction(expr);
    } catch(err){
      resultEl.innerHTML=`<span style="color:#e06c75;">⚠️ ${err.message}</span>`;
    }
  },80);
}

function solveDerivative(expr) {
  const node=math.parse(expr);
  const deriv=math.simplify(math.derivative(node,'x'));
  let d2='N/A';
  try{d2=math.simplify(math.derivative(deriv,'x')).toString();}catch(e){}
  return `<strong style="color:var(--accent2)">d/dx [ ${expr} ]</strong><br><br>
          <span style="color:var(--txt2)">f'(x) =</span> <code style="color:#98c379;font-size:17px;"> ${deriv.toString()}</code><br><br>
          <span style="color:var(--txt2)">f''(x) =</span> <code style="color:#c678dd;"> ${d2}</code><br><br>
          <small style="color:var(--txt3)">✅ Symbolic via math.js</small>`;
}

function solveIntegral(expr) {
  const m=expr.match(/^(.+?)\s+from\s+([-\d.π]+)\s+to\s+([-\d.π]+)$/i);
  let funcExpr=expr,a=null,b=null;
  if(m){funcExpr=m[1].trim();a=parseFloat(m[2].replace('π',Math.PI));b=parseFloat(m[3].replace('π',Math.PI));}

  let out=`<strong style="color:var(--accent2)">∫ ${funcExpr} dx</strong><br><br>`;

  if(a!==null&&b!==null){
    const f=math.compile(funcExpr);
    const n=2000,h=(b-a)/n;
    let sum=0;
    try{sum=f.evaluate({x:a})+f.evaluate({x:b});}catch(e){}
    for(let i=1;i<n;i++){try{sum+=(i%2===0?2:4)*f.evaluate({x:a+i*h});}catch(e){}}
    const result=(h/3)*sum;
    out+=`<span style="color:var(--txt2)">From ${a} to ${b}:</span><br>
          <code style="color:#4ade80;font-size:22px;font-weight:700;">≈ ${result.toFixed(8)}</code><br><br>
          <small style="color:var(--txt3)">Simpson's Rule n=2000</small>`;
    plotFunctionWithArea(funcExpr,a,b);
  } else {
    out+=`<div style="font-family:monospace;font-size:13px;line-height:2;color:#abb2bf;margin:8px 0;">
    <span style="color:var(--accent2)">Common antiderivatives:</span><br>
    <span style="color:var(--txt3)">∫</span> xⁿ dx = xⁿ⁺¹/(n+1) + C<br>
    <span style="color:var(--txt3)">∫</span> eˣ dx = eˣ + C<br>
    <span style="color:var(--txt3)">∫</span> sin(x) dx = -cos(x) + C<br>
    <span style="color:var(--txt3)">∫</span> cos(x) dx = sin(x) + C<br>
    <span style="color:var(--txt3)">∫</span> 1/x dx = ln|x| + C<br>
    <span style="color:var(--txt3)">∫</span> sec²(x) dx = tan(x) + C<br>
    <span style="color:var(--txt3)">∫</span> 1/(a²+x²) dx = (1/a)arctan(x/a) + C<br>
    <span style="color:var(--txt3)">∫</span> 1/√(a²-x²) dx = arcsin(x/a) + C<br>
    </div><small style="color:var(--txt3)">💡 For definite: type <code>${funcExpr} from 0 to 3</code></small>`;
  }
  return out;
}

function solveODE(expr) {
  const e=expr.trim();
  let out=`<strong style="color:var(--accent2)">🧮 ODE Solver</strong><br><br>`;

  // Second order: y'' + ay' + by = 0
  const m2=e.match(/y''\s*\+\s*([\d.]+)\s*y'\s*\+\s*([\d.]+)\s*y/i);
  if(m2||(e.includes("y''"))) {
    out+=`<span style="color:var(--txt2)">Type: <b>2nd-Order Linear, Constant Coefficients</b></span><br><br>`;
    if(m2){
      const p=parseFloat(m2[1]),q=parseFloat(m2[2]);
      const disc=p*p-4*q;
      out+=`Char. eq: r² + ${p}r + ${q} = 0 &nbsp; Δ = <code>${disc.toFixed(4)}</code><br><br>`;
      if(disc>0){
        const r1=(-p+Math.sqrt(disc))/2,r2=(-p-Math.sqrt(disc))/2;
        out+=`Roots: r₁=${r1.toFixed(4)}, r₂=${r2.toFixed(4)}<br>
              <code style="color:#98c379;font-size:15px;">y = C₁e^(${r1.toFixed(3)}x) + C₂e^(${r2.toFixed(3)}x)</code>`;
      } else if(Math.abs(disc)<1e-10){
        const r=-p/2;
        out+=`Repeated root: r=${r.toFixed(4)}<br>
              <code style="color:#c678dd;font-size:15px;">y = (C₁+C₂x)e^(${r.toFixed(3)}x)</code>`;
      } else {
        const al=-p/2,be=Math.sqrt(-disc)/2;
        out+=`Complex: ${al.toFixed(3)}±${be.toFixed(3)}i<br>
              <code style="color:#61afef;font-size:15px;">y = e^(${al.toFixed(3)}x)(C₁cos(${be.toFixed(3)}x) + C₂sin(${be.toFixed(3)}x))</code>`;
      }
    } else {
      out+=`<div style="font-family:monospace;font-size:13px;line-height:2;color:#abb2bf;">
      Format: <code>y'' + 2y' + 5y = 0</code><br>
      Δ>0 → y=C₁e^r₁x+C₂e^r₂x<br>
      Δ=0 → y=(C₁+C₂x)e^rx<br>
      Δ&lt;0 → y=eᵅˣ(C₁cosβx+C₂sinβx)
      </div>`;
    }
  } else if(e.includes("y'")) {
    out+=`<span style="color:var(--txt2)">Type: <b>First-Order ODE</b></span><br><br>
    <div style="font-family:monospace;font-size:13px;line-height:2.2;color:#abb2bf;">
    <span style="color:#98c379;">Separable</span> dy/dx=g(x)h(y):<br>
    &nbsp;∫ dy/h(y) = ∫ g(x)dx + C<br><br>
    <span style="color:#c678dd;">Linear</span> dy/dx + P(x)y = Q(x):<br>
    &nbsp;μ=e^(∫P dx), y=(1/μ)∫μQ dx+C<br><br>
    <span style="color:#61afef;">Exact</span> M dx + N dy=0:<br>
    &nbsp;Check ∂M/∂y=∂N/∂x → find F(x,y)=C
    </div>`;
  } else {
    out+=`<span style="color:var(--txt3)">Enter an ODE like:<br>
    <code>y'' + 2y' + 5y = 0</code><br>
    <code>y' + y = sin(x)</code></span>`;
  }
  return out;
}

function solveSeries(expr) {
  const series=[
    ['sin(x)','x - x³/3! + x⁵/5! - x⁷/7! + … = Σ(-1)ⁿx^(2n+1)/(2n+1)!'],
    ['cos(x)','1 - x²/2! + x⁴/4! - x⁶/6! + … = Σ(-1)ⁿx^(2n)/(2n)!'],
    ['e^x',  '1 + x + x²/2! + x³/3! + x⁴/4! + … = Σxⁿ/n!'],
    ['ln(1+x)','x - x²/2 + x³/3 - x⁴/4 + … (|x|≤1)'],
    ['(1+x)^n','1 + nx + n(n-1)x²/2! + … (|x|<1)'],
    ['1/(1-x)','1 + x + x² + x³ + … (|x|<1)'],
    ['arctan(x)','x - x³/3 + x⁵/5 - … (|x|≤1)'],
    ['sinh(x)','x + x³/3! + x⁵/5! + …'],
    ['cosh(x)','1 + x²/2! + x⁴/4! + …'],
  ];
  let out=`<strong style="color:var(--accent2)">Taylor / Maclaurin Series</strong><br><br>`;
  out+=`<div style="font-size:13px;line-height:2.2;font-family:monospace;">`;
  series.forEach(([fn,ser])=>{
    const active=expr.toLowerCase().includes(fn.split('(')[0]);
    out+=`<div ${active?'style="background:var(--tint2);padding:2px 8px;border-radius:6px;"':''}>
      <span style="color:var(--accent2)">${fn}</span>
      <span style="color:var(--txt3)"> = </span>
      <span style="color:#abb2bf">${ser}</span>
    </div>`;
  });
  out+=`</div>`;
  try{const v=math.evaluate(expr.replace(/x/g,'0.5'));out+=`<br><small style="color:var(--txt3)">At x=0.5: f(0.5) ≈ <code style="color:#4ade80">${v.toFixed(8)}</code></small>`;}catch(e){}
  return out;
}

function solveLimit(expr) {
  const m=expr.match(/^(.+)\s+as\s+x\s*->\s*([-\d.]+|∞|inf)$/i);
  let funcExpr=expr,target=0;
  if(m){funcExpr=m[1].trim();target=(m[2]==='∞'||m[2].toLowerCase()==='inf')?1e8:parseFloat(m[2]);}
  try{
    const f=math.compile(funcExpr);
    const h=1e-5;
    const lR=f.evaluate({x:target+h});
    const lL=f.evaluate({x:target-h});
    const lim=(Math.abs(lR-lL)<0.001)?((lR+lL)/2):'DNE';
    return `<strong style="color:var(--accent2)">lim(x→${target}) ${funcExpr}</strong><br><br>
            <code style="color:#4ade80;font-size:18px;">≈ ${typeof lim==='number'?lim.toFixed(8):lim}</code><br><br>
            <small style="color:var(--txt3)">Numerical. Right: ${typeof lR==='number'?lR.toFixed(6):lR} | Left: ${typeof lL==='number'?lL.toFixed(6):lL}</small>`;
  } catch(e) {
    return `<span style="color:#e06c75;">Cannot evaluate: ${e.message}<br>Format: <code>sin(x)/x as x -> 0</code></span>`;
  }
}

function solveSimplify(expr) {
  const s=math.simplify(expr);
  let v='—'; try{v=math.evaluate(expr.replace(/x/g,'1')).toFixed(6);}catch(e){}
  return `<strong style="color:var(--accent2)">Simplified:</strong><br>
          <code style="color:#98c379;font-size:18px;">${s.toString()}</code><br><br>
          <span style="color:var(--txt2)">At x=1:</span> <code style="color:var(--accent3)">${v}</code>`;
}

function plotFunction(expr) {
  const cw=document.getElementById('mathCanvasWrap');
  const cv=document.getElementById('mathCanvas');
  if(!cw||!cv)return; cw.style.display='block';
  try{
    const clean=expr.replace(/\s+from\s+[-\d.πPI]+\s+to\s+[-\d.πPI]+/i,'').trim();
    const f=math.compile(clean);
    const X=[],Y=[];
    for(let i=0;i<=500;i++){
      const x=-8+(16*i/500);
      try{const y=f.evaluate({x});X.push(x.toFixed(3));Y.push(isFinite(y)&&Math.abs(y)<1e5?y:null);}
      catch(e){X.push(x.toFixed(3));Y.push(null);}
    }
    const a=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#e11d48';
    if(mathChartInstance)mathChartInstance.destroy();
    mathChartInstance=new Chart(cv,{type:'line',data:{labels:X,datasets:[{label:`f(x)=${clean}`,data:Y,borderColor:a,borderWidth:2.5,pointRadius:0,tension:0.1,fill:{target:'origin',above:a+'18',below:a+'10'}}]},options:{responsive:true,plugins:{legend:{labels:{color:'#abb2bf'}}},scales:{x:{ticks:{color:'#555',maxTicksLimit:14},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#555'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
  }catch(e){cw.style.display='none';}
}

function plotFunctionWithArea(expr,a,b){
  const cw=document.getElementById('mathCanvasWrap');
  const cv=document.getElementById('mathCanvas');
  if(!cw||!cv)return; cw.style.display='block';
  try{
    const f=math.compile(expr);
    const xMin=a-1,xMax=b+1;
    const X=[],Yall=[],Yfill=[];
    for(let i=0;i<=400;i++){
      const x=xMin+(xMax-xMin)*i/400;
      let y=null;try{y=f.evaluate({x});if(!isFinite(y)||Math.abs(y)>1e5)y=null;}catch(e){}
      X.push(x.toFixed(3));Yall.push(y);Yfill.push(x>=a&&x<=b?y:null);
    }
    const ac=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#e11d48';
    if(mathChartInstance)mathChartInstance.destroy();
    mathChartInstance=new Chart(cv,{type:'line',data:{labels:X,datasets:[
      {label:`f(x)=${expr}`,data:Yall,borderColor:ac,borderWidth:2,pointRadius:0,tension:0.1},
      {label:`∫[${a},${b}]`,data:Yfill,borderColor:'transparent',backgroundColor:ac+'33',fill:'origin',pointRadius:0}
    ]},options:{responsive:true,plugins:{legend:{labels:{color:'#abb2bf'}}},scales:{x:{ticks:{color:'#555'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#555'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
  }catch(e){cw.style.display='none';}
}


/* ── 15. PROBABILITY VISUALIZER (ADVANCED) ──────────────────────
   Distributions: Normal, Binomial, Poisson, Uniform, Exponential
   ─────────────────────────────────────────────────────────────── */

let probChartInstance = null;
let probDistType = 'normal';

function initProbabilityChart() {
  const canvas = document.getElementById('probCanvas');
  if (!canvas) return;
  updateProbChart();
}

function setProbDist(type, btn) {
  if (!probChartInstance) initProbabilityChart();
  probDistType = type;
  document.querySelectorAll('.prob-dist-tab').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.prob-ctrl-group').forEach(g=>{
    g.style.display = (g.dataset.dist===type||g.dataset.dist==='all') ? 'block':'none';
  });
  updateProbChart();
}

function updateProbChart() {
  if (!probChartInstance) initProbabilityChart();
  const canvas=document.getElementById('probCanvas'); if(!canvas)return;
  const dist=probDistType||'normal';
  const ac=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#e11d48';
  let labels=[],data=[],stats={};

  if(dist==='normal'){
    const mu=parseFloat(document.getElementById('prob-mu')?.value??0);
    const sigma=parseFloat(document.getElementById('prob-sigma')?.value??1);
    const muD=document.getElementById('prob-mu-val'),siD=document.getElementById('prob-sigma-val');
    if(muD)muD.textContent=mu.toFixed(1); if(siD)siD.textContent=sigma.toFixed(1);
    for(let i=0;i<=200;i++){
      const x=mu-4*sigma+(8*sigma*i/200);
      labels.push(x.toFixed(2));
      data.push((1/(sigma*Math.sqrt(2*Math.PI)))*Math.exp(-0.5*((x-mu)/sigma)**2));
    }
    stats={E:'μ = '+mu.toFixed(2),V:'σ² = '+(sigma*sigma).toFixed(2),SD:'σ = '+sigma.toFixed(2)};

  } else if(dist==='binomial'){
    const n=parseInt(document.getElementById('prob-n')?.value??10);
    const p=parseFloat(document.getElementById('prob-p')?.value??0.5);
    const nD=document.getElementById('prob-n-val'),pD=document.getElementById('prob-p-val');
    if(nD)nD.textContent=n; if(pD)pD.textContent=p.toFixed(2);
    function C(n,k){let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return r;}
    for(let k=0;k<=n;k++){labels.push('k='+k);data.push(C(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k));}
    stats={E:'np='+  (n*p).toFixed(2),V:'np(1-p)='+(n*p*(1-p)).toFixed(2),SD:'√npq='+ Math.sqrt(n*p*(1-p)).toFixed(2)};

  } else if(dist==='poisson'){
    const lam=parseFloat(document.getElementById('prob-lambda')?.value??3);
    const lD=document.getElementById('prob-lambda-val'); if(lD)lD.textContent=lam.toFixed(1);
    function fact(n){return n<=1?1:n*fact(n-1);}
    const kMax=Math.min(Math.ceil(lam+5*Math.sqrt(lam)),35);
    for(let k=0;k<=kMax;k++){labels.push('k='+k);data.push((Math.exp(-lam)*Math.pow(lam,k))/fact(k));}
    stats={E:'λ='+lam.toFixed(2),V:'λ='+lam.toFixed(2),SD:'√λ='+Math.sqrt(lam).toFixed(2)};

  } else if(dist==='uniform'){
    const a2=parseFloat(document.getElementById('prob-a')?.value??0);
    const b2=parseFloat(document.getElementById('prob-b')?.value??1);
    const aD=document.getElementById('prob-a-val'),bD=document.getElementById('prob-b-val');
    if(aD)aD.textContent=a2.toFixed(1); if(bD)bD.textContent=b2.toFixed(1);
    const h=b2>a2?1/(b2-a2):1;
    for(let i=0;i<=100;i++){labels.push((a2+(b2-a2)*i/100).toFixed(2));data.push(h);}
    stats={E:'(a+b)/2='+((a2+b2)/2).toFixed(2),V:'(b-a)²/12='+((b2-a2)**2/12).toFixed(2),SD:'='+(Math.abs(b2-a2)/Math.sqrt(12)).toFixed(2)};

  } else if(dist==='exponential'){
    const lam2=parseFloat(document.getElementById('prob-lam2')?.value??1);
    const lD2=document.getElementById('prob-lam2-val'); if(lD2)lD2.textContent=lam2.toFixed(1);
    for(let i=0;i<=100;i++){const x=5*i/100;labels.push(x.toFixed(2));data.push(lam2*Math.exp(-lam2*x));}
    stats={E:'1/λ='+(1/lam2).toFixed(2),V:'1/λ²='+(1/lam2**2).toFixed(2),SD:'1/λ='+(1/lam2).toFixed(2)};
  }

  // Update stats display
  const eEl=document.getElementById('prob-stat-e');
  const vEl=document.getElementById('prob-stat-v');
  const sEl=document.getElementById('prob-stat-sd');
  if(eEl)eEl.textContent=stats.E||'—';
  if(vEl)vEl.textContent=stats.V||'—';
  if(sEl)sEl.textContent=stats.SD||'—';

  const isBar=['binomial','poisson'].includes(dist);
  if(probChartInstance)probChartInstance.destroy();
  probChartInstance=new Chart(canvas,{
    type:isBar?'bar':'line',
    data:{labels,datasets:[{label:dist,data,borderColor:ac,backgroundColor:ac+(isBar?'99':'22'),borderWidth:isBar?0:2.5,pointRadius:0,tension:0.4,fill:!isBar}]},
    options:{responsive:true,plugins:{legend:{labels:{color:'#abb2bf'}},tooltip:{callbacks:{label:ctx=>`P = ${Number(ctx.raw).toFixed(5)}`}}},scales:{x:{ticks:{color:'#555',maxTicksLimit:14},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#555'},grid:{color:'rgba(255,255,255,0.05)'},beginAtZero:true}}}
  });
}