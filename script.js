// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
  mobileMenu.classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setMenu(mobileMenu.classList.contains('hidden')));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ---------- Highlight current section in nav ----------
const links = document.querySelectorAll('.nav-link');
const sections = [...links].map(l => document.querySelector(l.getAttribute('href')));

const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => s && spy.observe(s));

// ---------- Copy email ----------
const copyBtn = document.getElementById('copyBtn');
const copyMsg = document.getElementById('copyMsg');
const email = document.getElementById('emailLink').textContent.trim();

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email);
    copyMsg.textContent = 'Email copied';
  } catch {
    copyMsg.textContent = 'Could not copy. Select the email and copy it manually.';
  }
  setTimeout(() => (copyMsg.textContent = ''), 2500);
});

// ---------- Hero: dot grid that reacts to the cursor ----------
(function () {
  const canvas = document.getElementById('grid');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GAP = 30;          // space between dots
  const RADIUS = 140;      // cursor influence radius
  let w, h, dpr, mouse = { x: -999, y: -999 }, raf = null;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    raf = null;
    ctx.clearRect(0, 0, w, h);
    for (let x = GAP / 2; x < w; x += GAP) {
      for (let y = GAP / 2; y < h; y += GAP) {
        const d = Math.hypot(x - mouse.x, y - mouse.y);
        const t = Math.max(0, 1 - d / RADIUS);          // 0..1
        const r = 1.2 + t * 3.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = t > 0 ? `rgba(39,67,255,${0.25 + t * 0.75})` : '#C3CCDA';
        ctx.fill();
      }
    }
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };

  window.addEventListener('resize', resize);
  resize();

  if (!reduce) {
    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      schedule();
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; schedule(); });
  }
})();

// ---------- Portrait: gentle 3D tilt that follows the cursor ----------
(function () {
  const el = document.querySelector('.portrait');
  if (!el) return;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduce) return;

  const MAX = 9; // degrees

  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'transform .08s linear';
    el.style.setProperty('--ry', (x * MAX * 2).toFixed(2) + 'deg');
    el.style.setProperty('--rx', (-y * MAX * 2).toFixed(2) + 'deg');
    el.style.setProperty('--lift', '-8px');
  });

  el.addEventListener('pointerleave', () => {
    el.style.transition = '';
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.style.removeProperty('--lift');
  });
})();

// ---------- Contact: local time in Sri Lanka ----------
(function () {
  const el = document.getElementById('lkTime');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Colombo' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 30000);
})();

// ---------- Contact: quick message opens the visitor's email app ----------
(function () {
  const form = document.getElementById('msgForm');
  if (!form) return;
  const err = document.getElementById('fErr');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const company = form.company.value.trim();
    const message = form.message.value.trim();

    if (!message) {
      err.classList.remove('hidden');
      form.message.focus();
      return;
    }
    err.classList.add('hidden');

    const subject = name ? `Internship opportunity: message from ${name}` : 'Internship opportunity';
    const body = [message, '', name && `Name: ${name}`, company && `Company: ${company}`].filter(x => x !== '' && x !== false && x !== undefined).join('\n');
    window.location.href = `mailto:vphasintha@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();