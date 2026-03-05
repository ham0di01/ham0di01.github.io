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
