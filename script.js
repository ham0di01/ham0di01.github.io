// ===== Neural Network Canvas Animation =====
(function () {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Configuration
    const config = {
        particleCount: window.innerWidth < 768 ? 40 : 80,
        connectionDistance: 150,
        mouseRadius: 200,
        mouseForce: 0.015,
        baseSpeed: 0.3,
        nodeColor: { r: 16, g: 185, b: 129 },  // --accent: #10b981
        nodeOpacity: 0.35,
        nodeMinRadius: 1.2,
        nodeMaxRadius: 2.8,
        lineOpacity: 0.06,
        lineHighlightOpacity: 0.18,
        lineWidth: 0.8,
    };

    let particles = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let animId = null;
    let isVisible = true;
    let w, h, dpr;

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * config.baseSpeed;
            this.vy = (Math.random() - 0.5) * config.baseSpeed;
            this.radius = config.nodeMinRadius + Math.random() * (config.nodeMaxRadius - config.nodeMinRadius);
            this.baseOpacity = 0.15 + Math.random() * 0.25;
            // Slow organic drift oscillation
            this.phase = Math.random() * Math.PI * 2;
            this.phaseSpeed = 0.002 + Math.random() * 0.003;
            this.driftAmp = 0.08 + Math.random() * 0.12;
        }

        update() {
            // Organic oscillation
            this.phase += this.phaseSpeed;
            this.vx += Math.sin(this.phase) * this.driftAmp * 0.01;
            this.vy += Math.cos(this.phase * 0.7) * this.driftAmp * 0.01;

            // Damping to keep speed in check
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Mouse attraction
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < config.mouseRadius && dist > 1) {
                    const force = (1 - dist / config.mouseRadius) * config.mouseForce;
                    this.vx += (dx / dist) * force;
                    this.vy += (dy / dist) * force;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges with padding
            const pad = 20;
            if (this.x < -pad) this.x = w + pad;
            else if (this.x > w + pad) this.x = -pad;
            if (this.y < -pad) this.y = h + pad;
            else if (this.y > h + pad) this.y = -pad;
        }

        draw() {
            const { r, g, b } = config.nodeColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.baseOpacity})`;
            ctx.fill();

            // Subtle glow on larger nodes
            if (this.radius > 2.2) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},${this.baseOpacity * 0.08})`;
                ctx.fill();
            }
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.parentElement.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        const { r, g, b } = config.nodeColor;
        const maxDist = config.connectionDistance;
        const maxDistSq = maxDist * maxDist;

        ctx.lineWidth = config.lineWidth;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    const dist = Math.sqrt(distSq);
                    const fade = 1 - dist / maxDist;

                    // Brighten connections near mouse
                    let opacity = config.lineOpacity * fade;
                    if (mouse.active) {
                        const midX = (particles[i].x + particles[j].x) / 2;
                        const midY = (particles[i].y + particles[j].y) / 2;
                        const mDx = mouse.x - midX;
                        const mDy = mouse.y - midY;
                        const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
                        if (mDist < config.mouseRadius) {
                            const mFade = 1 - mDist / config.mouseRadius;
                            opacity = Math.max(opacity, config.lineHighlightOpacity * fade * mFade);
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!isVisible) {
            animId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, w, h);
        drawConnections();
        for (const p of particles) {
            p.update();
            p.draw();
        }
        animId = requestAnimationFrame(animate);
    }

    // Mouse events on hero section
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        });
        heroSection.addEventListener('mouseleave', () => {
            mouse.active = false;
        });
        // Touch support
        heroSection.addEventListener('touchmove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
            mouse.active = true;
        }, { passive: true });
        heroSection.addEventListener('touchend', () => {
            mouse.active = false;
        });
    }

    // Visibility observer — pause when hero is off-screen
    const visObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    if (heroSection) visObserver.observe(heroSection);

    // Init
    resize();
    initParticles();
    animate();

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            // Re-distribute particles on significant size change
            const newCount = window.innerWidth < 768 ? 40 : 80;
            if (newCount !== particles.length) {
                config.particleCount = newCount;
                initParticles();
            }
        }, 200);
    });
})();

// ===== Typing Animation =====
const typedText = document.getElementById('typedText');
const phrases = [
    'Data Scientist & ML Engineer',
    'Building AI for Real-World Impact',
    'MSc AI @ Halmstad University',
    'Python · TensorFlow · PyTorch'
];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    const current = phrases[phraseIndex];
    if (isDeleting) { typedText.textContent = current.substring(0, charIndex - 1); charIndex--; }
    else { typedText.textContent = current.substring(0, charIndex + 1); charIndex++; }
    let delay = isDeleting ? 30 : 60;
    if (!isDeleting && charIndex === current.length) { delay = 2000; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 400; }
    setTimeout(type, delay);
}
type();

// ===== Navbar =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); });

// ===== Active link =====
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
function updateActiveLink() {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 150) current = s.getAttribute('id'); });
    navLinks.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === '#' + current) l.classList.add('active'); });
}
window.addEventListener('scroll', updateActiveLink);

// ===== Mobile menu =====
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});
navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const isMobileOpen = navLinksEl.classList.contains('open');
        navLinksEl.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) setTimeout(() => { target.scrollIntoView({ behavior: 'smooth' }); }, isMobileOpen ? 350 : 0);
        }
    });
});
document.addEventListener('click', (e) => {
    if (navLinksEl.classList.contains('open') && !navLinksEl.contains(e.target) && !navToggle.contains(e.target)) {
        navLinksEl.classList.remove('open'); navToggle.classList.remove('active'); document.body.style.overflow = '';
    }
});

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal, .reveal-text');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.closest('#navLinks')) return;
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ===== CV Dropdown =====
const cvDropdownToggle = document.getElementById('cvDropdownToggle');
const cvDropdownMenu = document.getElementById('cvDropdownMenu');
function positionDropdown() {
    const rect = cvDropdownToggle.getBoundingClientRect();
    const menuWidth = cvDropdownMenu.offsetWidth || 160;
    let left = rect.left + rect.width / 2 - menuWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    cvDropdownMenu.style.top = (rect.bottom + 8) + 'px';
    cvDropdownMenu.style.left = left + 'px';
}
if (cvDropdownToggle && cvDropdownMenu) {
    cvDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = cvDropdownMenu.classList.toggle('open');
        cvDropdownToggle.classList.toggle('open', isOpen);
        if (isOpen) positionDropdown();
    });
    window.addEventListener('scroll', () => { if (cvDropdownMenu.classList.contains('open')) positionDropdown(); }, { passive: true });
    window.addEventListener('resize', () => { if (cvDropdownMenu.classList.contains('open')) positionDropdown(); });
    document.addEventListener('click', (e) => {
        if (!cvDropdownToggle.contains(e.target) && !cvDropdownMenu.contains(e.target)) {
            cvDropdownMenu.classList.remove('open'); cvDropdownToggle.classList.remove('open');
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { cvDropdownMenu.classList.remove('open'); cvDropdownToggle.classList.remove('open'); }
    });
}
