/* ============================================
   script.js — Portfolio Interactif
   ============================================ */

/* ── 1. CANVAS BACKGROUND (particules animées) ── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 80;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.a  = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${this.a})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  loop();
})();


/* ── 2. NAVBAR — scroll + burger menu ── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  const links     = document.querySelectorAll('.nav-link');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Burger menu
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  // Ferme le menu au clic sur un lien
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });
})();


/* ── 3. SMOOTH SCROLL + ACTIVE LINK ── */
(function initSmoothScroll() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  function setActive() {
    const scrollY = window.scrollY;
    sections.forEach(section => {
      const top    = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < bottom) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();


/* ── 4. INTERSECTION OBSERVER — animations d'entrée ── */
(function initFadeIn() {
  // Applique la classe fade-in aux éléments à animer
  const targets = [
    '.section-label',
    '.section-title',
    '.contact-intro',
    '.about-text',
    '.about-card',
    '.skill-card',
    '.project-card',
    '.contact-info',
    '.contact-form',
    '.hero-content',
    '.hero-visual',
    '.about-stats .stat'
  ];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-in');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();


/* ── 5. SKILL BARS — animation au scroll ── */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(fill => observer.observe(fill));
})();


/* ── 6. FORMULAIRE DE CONTACT ── */
(function initContactForm() {
  const form     = document.getElementById('contactForm');
  const feedback = document.getElementById('form-feedback');
  const btnText  = form.querySelector('.btn-text');

  function showFeedback(type, message) {
    feedback.textContent = message;
    feedback.className   = `form-feedback ${type}`;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(loading) {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = loading;
    btnText.textContent = loading ? 'Envoi en cours...' : 'Envoyer le message';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validation basique
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      showFeedback('error', '⚠ Veuillez entrer votre nom.');
      form.name.focus();
      return;
    }
    if (!emailRe.test(email)) {
      showFeedback('error', '⚠ Adresse email invalide.');
      form.email.focus();
      return;
    }
    if (message.length < 10) {
      showFeedback('error', '⚠ Votre message est trop court (min. 10 caractères).');
      form.message.focus();
      return;
    }

    // Simulation d'envoi
    setLoading(true);
    feedback.className = 'form-feedback'; // cache feedback

    setTimeout(() => {
      setLoading(false);
      showFeedback(
        'success',
        `✓ Message envoyé, ${name} ! Je vous répondrai dès que possible.`
      );
      form.reset();
    }, 1500);
  });

  // Cache le feedback quand l'utilisateur retape
  ['name', 'email', 'message'].forEach(id => {
    form[id].addEventListener('input', () => {
      feedback.className = 'form-feedback';
    });
  });
})();


/* ── 7. EFFET TYPAGE (Hero overline) ── */
(function initTyping() {
  const el     = document.querySelector('.hero-overline');
  if (!el) return;

  const icon   = el.querySelector('i');
  const full   = ' Disponible pour des collaborations';
  el.innerHTML = '';
  if (icon) el.appendChild(icon);

  let i = 0;
  const span = document.createElement('span');
  el.appendChild(span);

  function type() {
    if (i <= full.length) {
      span.textContent = full.slice(0, i++);
      setTimeout(type, 45);
    }
  }

  // Démarre après un court délai
  setTimeout(type, 600);
})();
