/* ═══════════════════════════════════════════════════════════════
   EDUMOE v7 — app.js (Shared JavaScript)
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. SUPABASE SETUP ─────────────────────────────────────────── */
const SUPABASE_URL = 'https://ajhbaomxdsvnegjiypob.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaGJhb214ZHN2bmVnaml5cG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDY3NzQsImV4cCI6MjA4NzYyMjc3NH0.FptC_9E49l7V_GhYiVmVwf4Ee8bXkcgcWmc96POmKGI';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── 2. LOADER ─────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 1000);
    }, 500);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  updateAuthUI(null);
  updateFooterYear();
  attachMouseEffects();
});

/* ── 3. THEME SWITCHER ──────────────────────────────────────────── */
const DEFAULT_THEME = 'ruby';

function setTheme(themeName, dotEl) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('edumoe_theme', themeName);
  
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.remove('active');
  });
  
  if (dotEl) {
    dotEl.classList.add('active');
  }
}

(function restoreTheme() {
  const saved = localStorage.getItem('edumoe_theme') || DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', saved);
  
  const dots = document.querySelectorAll('.theme-dot');
  dots.forEach(dot => {
    const matchesTheme = {
      'ruby': dot.classList.contains('td-ruby'),
      'lava': dot.classList.contains('td-lava'),
      'space': dot.classList.contains('td-space'),
      'oxford': dot.classList.contains('td-oxford'),
      'light': dot.classList.contains('td-light'),
      'emerald': dot.classList.contains('td-emerald')
    }[saved];
    
    if (matchesTheme) {
      dot.classList.add('active');
    }
  });
})();

/* ── 4. SCROLL REVEAL ───────────────────────────────────────────── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.sr');
  const revealOnScroll = () => {
    reveals.forEach(element => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
}

/* ── 5. TOAST NOTIFICATION ──────────────────────────────────────── */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  
  if (!toast || !toastMsg) return;
  
  toastMsg.textContent = message;
  toast.classList.add('show');
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ── 6. PARALLAX BACKGROUND ────────────────────────────────────── */
document.addEventListener('mousemove', e => {
  const orbs = document.querySelectorAll('.bg-orb');
  orbs.forEach((orb, i) => {
    const x = (e.clientX / window.innerWidth) * (i + 1) * 2;
    const y = (e.clientY / window.innerHeight) * (i + 1) * 2;
    orb.style.transform = `translate(${x}px, ${y}px) scale(${1 + i * 0.05})`;
  });
});

/* ── 7. CARD TILT EFFECT ────────────────────────────────────────── */
document.addEventListener('mousemove', e => {
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 10;
    const rotateY = (rect.width / 2 - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
});

/* ── 8. AUTH — LOGIN / SIGNUP / LOGOUT ──────────────────────────── */
function _diagAuthError(err) {
  console.error('Auth error:', err);
  
  if (err.message.includes('Invalid login credentials')) {
    return 'Wrong email or password.';
  }
  if (err.message.includes('Email not confirmed')) {
    return 'Check your email for confirmation.';
  }
  if (err.message.includes('User already registered')) {
    return 'This email is already registered.';
  }
  return err.message || 'Connection issue. Check your internet.';
}

async function doSignup() {
  const name = document.getElementById('signup-name')?.value;
  const email = document.getElementById('signup-email')?.value;
  const password = document.getElementById('signup-password')?.value;
  
  if (!email || !password || !name) {
    showToast('❌ Fill all fields');
    return;
  }
  
  try {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    
    if (error) {
      showToast('❌ ' + _diagAuthError(error));
      return;
    }
    
    showToast('✅ Signed up! Check your email.');
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-name').value = '';
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}

async function doLogin() {
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  
  if (!email || !password) {
    showToast('❌ Enter email and password');
    return;
  }
  
  try {
    const { data, error } = await _supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      showToast('❌ ' + _diagAuthError(error));
      return;
    }
    
    showToast('✅ Logged in!');
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    updateAuthUI(data.user);
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}

async function doLogout() {
  try {
    await _supabase.auth.signOut();
    showToast('✅ Logged out.');
    updateAuthUI(null);
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}

function updateAuthUI(user) {
  const authContainer = document.getElementById('auth-container');
  const loggedInContainer = document.getElementById('logged-in-container');
  const userName = document.getElementById('user-name');
  
  if (!authContainer || !loggedInContainer) return;
  
  if (user) {
    authContainer.style.display = 'none';
    loggedInContainer.style.display = 'flex';
    if (userName) {
      const profile = user.user_metadata?.full_name || user.email.split('@')[0];
      userName.textContent = `👋 ${profile}`;
    }
  } else {
    authContainer.style.display = 'flex';
    loggedInContainer.style.display = 'none';
  }
}

_supabase.auth.getSession().then(({ data }) => {
  if (data?.session) {
    updateAuthUI(data.session.user);
  }
});

_supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    updateAuthUI(session.user);
  } else {
    updateAuthUI(null);
  }
});

/* ── 9. MODAL CLOSE ON OUTSIDE CLICK ────────────────────────────── */
document.addEventListener('click', e => {
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === signupModal) signupModal.style.display = 'none';
});

/* ── 10. FOOTER YEAR ────────────────────────────────────────────── */
function updateFooterYear() {
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
}

/* ── 11. MOUSE EFFECTS ──────────────────────────────────────────── */
function attachMouseEffects() {
  // Page transition fade effect on links
  const pageLinks = document.querySelectorAll('a[href$=".html"]');
  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('target') === '_blank') return;
      if (link.href.includes('#')) return;
      
      const href = link.href;
      if (href.includes(window.location.pathname.split('/').pop())) return;
      
      // Could add fade effect here if desired
      // e.preventDefault();
      // ... fade logic ...
    });
  });
}

console.log('✅ EDUMOE v7 initialized');
