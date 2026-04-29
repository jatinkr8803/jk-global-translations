/* JK Global Translations — Frontend Script */

/* ---- NAV SCROLL ---- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- MOBILE MENU ---- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
navLinks.style.flexDirection = 'column';
navLinks.style.position = 'fixed';
navLinks.style.top = '70px';
navLinks.style.left = '0';
navLinks.style.right = '0';
navLinks.style.background = 'rgba(8,14,26,0.98)';
navLinks.style.padding = '24px';
navLinks.style.gap = '20px';
navLinks.style.zIndex = '99';
navLinks.style.borderBottom = '1px solid var(--border)';
});

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll(
'.service-card, .tool-category, .industry-card, .stat-block, .testi-card, .fh-item, .section-header, .founder-img-wrap, .founder-content, .contact-left, .contact-right, .trust-logo'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
revealObserver.unobserve(entry.target);
}
});
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- ANIMATED COUNTERS ---- */
const counters = document.querySelectorAll('.stat-num');
let countersStarted = false;

const startCounters = () => {
if (countersStarted) return;
countersStarted = true;
counters.forEach(counter => {
const target = +counter.getAttribute('data-target');
const duration = 1800;
const step = target / (duration / 16);
let current = 0;
const timer = setInterval(() => {
current += step;
if (current >= target) {
current = target;
clearInterval(timer);
}
counter.textContent = Math.floor(current);
}, 16);
});
};

const statsSection = document.querySelector('.stats');
const statsObserver = new IntersectionObserver((entries) => {
if (entries[0].isIntersecting) startCounters();
}, { threshold: 0.3 });
if (statsSection) statsObserver.observe(statsSection);

/* ---- TESTIMONIALS SLIDER ---- */
const track = document.getElementById('testiTrack');
const dotsContainer = document.getElementById('testiDots');
const cards = track ? Array.from(track.querySelectorAll('.testi-card')) : [];
let current = 0;
let autoInterval;

const createDots = () => {
cards.forEach((_, i) => {
const dot = document.createElement('div');
dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
dot.addEventListener('click', () => goTo(i));
dotsContainer.appendChild(dot);
});
};

const updateSlider = () => {
if (!track) return;
track.style.transform = `translateX(calc(-${current * 100}% - ${current * 24}px))`;
document.querySelectorAll('.testi-dot').forEach((d, i) => {
d.classList.toggle('active', i === current);
});
};

const goTo = (n) => {
current = (n + cards.length) % cards.length;
updateSlider();
resetAuto();
};

const resetAuto = () => {
clearInterval(autoInterval);
autoInterval = setInterval(() => goTo(current + 1), 5000);
};

document.getElementById('testPrev')?.addEventListener('click', () => goTo(current - 1));
document.getElementById('testNext')?.addEventListener('click', () => goTo(current + 1));

if (cards.length) {
createDots();
resetAuto();
}

/* ---- CONTACT FORM ---- */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoader = document.getElementById('submitLoader');
const formStatus = document.getElementById('formStatus');

form?.addEventListener('submit', async (e) => {
e.preventDefault();

const name = document.getElementById('name').value.trim();
const email = document.getElementById('email').value.trim();
const projectType = document.getElementById('projectType').value;
const message = document.getElementById('message').value.trim();

if (!name || !email || !projectType || !message) {
showStatus('error', 'Please fill in all required fields.');
return;
}
if (!/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email)) {
showStatus('error', 'Please enter a valid email address.');
return;
}

submitBtn.disabled = true;
submitText.style.display = 'none';
submitLoader.style.display = 'block';

try {
const API_URL = "https://jk-global-api.onrender.com";


const res = await fetch(`${API_URL}/contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, projectType, message })
});

if (!res.ok) {
  throw new Error("Server error");
}

const data = await res.json();

if (data.success) {
  showStatus('success', '✓ Message sent! We\'ll get back to you within 2 hours.');
  form.reset();
} else {
  throw new Error(data.message || 'Submission failed');
}
```

} catch (err) {
console.error("❌ Frontend error:", err);


showStatus(
  'error',
  'Something went wrong. Please try again or contact us at jkglobaltranslations@gmail.com'
);
```

} finally {
submitBtn.disabled = false;
submitText.style.display = 'block';
submitLoader.style.display = 'none';
}
});

function showStatus(type, msg) {
formStatus.className = 'form-status ' + type;
formStatus.textContent = msg;
formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
setTimeout(() => { formStatus.className = 'form-status'; formStatus.textContent = ''; }, 8000);
}

/* ---- SMOOTH ANCHOR SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
link.addEventListener('click', () => {
if (navLinks.style.display === 'flex') {
navLinks.style.display = 'none';
}
});
});

/* ---- STAGGERED SERVICE CARDS ---- */
document.querySelectorAll('.service-card').forEach((card, i) => {
card.style.transitionDelay = (i * 50) + 'ms';
});
