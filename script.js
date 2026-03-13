/* ═══════════════════════════════════════════════════
   Cafe Aroma — Premium JavaScript v4 (Volumetric Smoke)
   ═══════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────
//  VOLUMETRIC SMOKE ENGINE (Soft Blooms)
// ─────────────────────────────────────────────────
class VolumetricSmoke {
  constructor(ctx, x, y, options = {}) {
    this.ctx = ctx;
    this.reset(x, y, options);
  }

  reset(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -(Math.random() * 0.6 + 0.4);
    this.size = options.size || (Math.random() * 50 + 40);
    this.growth = Math.random() * 0.3 + 0.1;
    this.life = 0;
    this.maxLife = options.maxLife || (Math.random() * 200 + 150);
    this.alpha = options.alpha || 0.04; // Decreased transparency
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.size += this.growth;
    this.rotation += this.rotationSpeed;
    this.life++;
    return this.life < this.maxLife;
  }

  draw() {
    const lifeRatio = this.life / this.maxLife;
    const currentAlpha = Math.sin(lifeRatio * Math.PI) * this.alpha;

    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation);

    const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    grad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
    grad.addColorStop(0.4, `rgba(245, 240, 230, ${currentAlpha * 0.6})`);
    grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
    this.ctx.restore();
  }
}

// ─────────────────────────────────────────────────
//  INTRO CANVAS ANIMATION
// ─────────────────────────────────────────────────
(function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const canvas = document.getElementById('smoke-canvas');
  const title = document.getElementById('intro-title');
  const tagline = document.getElementById('intro-tagline');
  const sub = document.getElementById('intro-sub');
  const wrapper = document.getElementById('site-wrapper');

  const introCtx = canvas.getContext('2d');
  let W, H, smokeClouds = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Split title for animation
  const text = title.textContent;
  title.innerHTML = '';
  [...text].forEach((char, i) => {
    const outer = document.createElement('span');
    outer.className = 'letter-outer';
    const inner = document.createElement('span');
    inner.className = 'letter-inner';
    inner.textContent = char === ' ' ? '\u00A0' : char;
    outer.appendChild(inner);
    title.appendChild(outer);
  });

  const letters = title.querySelectorAll('.letter-inner');

  // Pre-fill smoke (Reduced Volume)
  for (let i = 0; i < 12; i++) {
    const s = new VolumetricSmoke(introCtx, Math.random() * W, Math.random() * H, { alpha: 0.02 });
    s.life = Math.random() * s.maxLife;
    smokeClouds.push(s);
  }

  let animId;
  function animate() {
    if (overlay.style.display === 'none') return;
    introCtx.clearRect(0, 0, W, H);

    // Ambient smoke (Reduced frequency)
    if (Math.random() > 0.95) {
      smokeClouds.push(new VolumetricSmoke(introCtx, Math.random() * W, H + 50, { alpha: 0.02 }));
    }

    smokeClouds = smokeClouds.filter(s => {
      s.update();
      s.draw();
      return s.life < s.maxLife;
    });

    animId = requestAnimationFrame(animate);
  }
  animate();

  // HIGH-SPEED SEQUENCE
  setTimeout(() => tagline.classList.add('show'), 50);

  letters.forEach((l, i) => {
    setTimeout(() => l.classList.add('show'), 200 + (i * 40));
  });

  setTimeout(() => sub.classList.add('show'), 800);

  // TRANSITION
  setTimeout(() => {
    overlay.classList.add('intro-exit');
    title.classList.add('logo-zoom-exit');

    wrapper.style.visibility = 'visible';
    wrapper.style.opacity = '1';

    setTimeout(() => {
      document.getElementById('coffee-widget').classList.add('active');
      document.getElementById('cursor-smoke-canvas').classList.add('active');
    }, 500);

    setTimeout(() => {
      cancelAnimationFrame(animId);
      overlay.style.display = 'none';
      initCursorSmoke();
    }, 900);
  }, 2800);
})();

// ─────────────────────────────────────────────────
//  INTERACTIVE VOLUMETRIC SMOKE (from Coffee Cup)
// ─────────────────────────────────────────────────
function initCursorSmoke() {
  const canvas = document.getElementById('cursor-smoke-canvas');
  if (!canvas) return;
  const cursorCtx = canvas.getContext('2d');
  const widget = document.getElementById('coffee-widget');

  let W, H, cursorP = { x: 0, y: 0 }, targetP = { x: 0, y: 0 };
  let smokeBlooms = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    targetP.x = e.clientX;
    targetP.y = e.clientY;
  });

  function animate() {
    cursorCtx.clearRect(0, 0, W, H);

    // Interpolate cursor
    cursorP.x += (targetP.x - cursorP.x) * 0.08;
    cursorP.y += (targetP.y - cursorP.y) * 0.08;

    const rect = widget.getBoundingClientRect();
    const emitX = rect.left + rect.width / 2 - 4;
    const emitY = rect.top + 34;

    // Emit more realistic volumetric blooms (Reduced Volume & Transparency)
    if (Math.random() > 0.85) {
      const s = new VolumetricSmoke(cursorCtx, emitX, emitY, {
        size: Math.random() * 18 + 12,
        alpha: 0.05,
        maxLife: Math.random() * 140 + 100
      });
      // Initial velocity toward cursor
      s.vx = (cursorP.x - emitX) * 0.005 + (Math.random() - 0.5) * 0.1;
      s.vy = (cursorP.y - emitY) * 0.005 - (Math.random() * 0.4 + 0.3);
      smokeBlooms.push(s);
    }

    smokeBlooms = smokeBlooms.filter(s => {
      s.update();
      // Slight attraction to cursor
      s.vx += (cursorP.x - s.x) * 0.0001;
      s.vy += (cursorP.y - s.y) * 0.00005;
      s.draw();
      return s.life < s.maxLife;
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// ─────────────────────────────────────────────────
//  LENIS SMOOTH SCROLL & UI
// ─────────────────────────────────────────────────
let lenis;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.0, // Sharper duration
    easing: t => 1 - Math.pow(1 - t, 4), // Quicker easing (easeOutQuart)
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -80, duration: 1.1 });
    });
  });
}

(function initUI() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const targets = [
    ...document.querySelectorAll('.menu-card, .gallery-item, .about-img-col, .about-text-col, .section-header, .footer-inner > *, .stat, .quote-strip blockquote'),
  ];

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 6 !== 0) el.classList.add(`reveal-delay-${(i % 6) + 1}`);
    io.observe(el);
  });
})();

function orderNow() {
  alert('Thanks for your interest! Please call us to place your order: 555-123-4567');
}

function submitForm(event) {
  event.preventDefault();
  const name = document.getElementById('name-field').value;
  const email = document.getElementById('email-field').value;
  const message = document.getElementById('message-field').value;
  if (!name || !email || !message) {
    alert('Please fill out all fields.');
    return;
  }
  alert('Message sent! We will get back to you soon.');
  document.getElementById('contact-form').reset();
}