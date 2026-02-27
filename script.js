// ===== Typing Animation =====
const typedText = document.getElementById('typedText');
const phrases = [
    'Data Scientist & ML Engineer',
    'Building AI for Real-World Impact',
    'MSc AI @ Halmstad University',
    'Python · TensorFlow · PyTorch'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
        typedText.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedText.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    let delay = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === current.length) {
        delay = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400;
    }

    setTimeout(type, delay);
}

type();

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    navbar.classList.toggle('scrolled', currentScroll > 50);
    lastScroll = currentScroll;
});

// ===== Active Nav Link Highlighting =====
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ===== Mobile Menu Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked, then smooth-scroll
navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const isMobileOpen = navLinksEl.classList.contains('open');

        // Always close menu first
        navLinksEl.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';

        // Smooth scroll to anchor
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Small delay on mobile so menu slide-out doesn't fight the scroll
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, isMobileOpen ? 350 : 0);
            }
        }
    });
});

// Tap outside menu to close
document.addEventListener('click', (e) => {
    if (
        navLinksEl.classList.contains('open') &&
        !navLinksEl.contains(e.target) &&
        !navToggle.contains(e.target)
    ) {
        navLinksEl.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== Smooth Scroll (desktop — mobile handled in menu click above) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip links inside the nav; they are handled by the menu close logic above
    if (anchor.closest('#navLinks')) return;
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
