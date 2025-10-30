// Small interactive behaviour: mobile nav toggle, theme toggle, smooth scroll, reveal on scroll, contact form basic UX.

(() => {
  const doc = document;
  const body = doc.documentElement;
  const mobileToggle = doc.getElementById('mobile-toggle');
  const nav = doc.getElementById('nav');
  const themeToggle = doc.getElementById('theme-toggle');
  const form = doc.getElementById('contact-form');
  const formNote = doc.getElementById('form-note');
  const currentYear = doc.getElementById('current-year');

  // Set year
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  // Mobile nav
  mobileToggle && mobileToggle.addEventListener('click', () => {
    const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', String(!expanded));
    if (nav) nav.style.display = expanded ? '' : 'block';
  });

  // Theme: read saved or system
  const THEME_KEY = 'prefers-theme';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) body.setAttribute('data-theme', saved);

  themeToggle && themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    localStorage.setItem(THEME_KEY, next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
  
  // Smooth scrolling for anchor links
  doc.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = doc.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
        // Close mobile nav if open
        if (mobileToggle && mobileToggle.getAttribute('aria-expanded') === 'true') {
          mobileToggle.click();
        }
      }
    });
  });

  // Reveal on scroll
  const reveals = Array.from(doc.querySelectorAll('.reveal'));
  const revealOnce = (el) => {
    el.classList.add('revealed');
  }

  const onScroll = () => {
    const viewportHeight = window.innerHeight;
    for (const el of reveals) {
      if (el.classList.contains('revealed')) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewportHeight - 80) revealOnce(el);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);

  // Basic contact form UX (Formspree expects a POST — replace action as needed)
  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = form.getAttribute('action');
      if (!action) {
        formNote.hidden = false;
        formNote.textContent = 'Form endpoint not set. Update the form action to your endpoint.';
        return;
      }

      const data = new FormData(form);
      try {
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          formNote.hidden = false;
          formNote.textContent = 'Thanks — your message has been sent.';
        } else {
          const body = await res.json().catch(()=> ({}));
          formNote.hidden = false;
          formNote.textContent = body.error || 'There was a problem sending your message.';
        }
      } catch (err) {
        formNote.hidden = false;
        formNote.textContent = 'Network error. Try again later.';
      }
    });
  }

  // Accessibility: hide mobile nav from assistive tech when not displayed
  const observer = new MutationObserver(() => {
    if (!nav) return;
    const visible = window.getComputedStyle(nav).display !== 'none';
    nav.setAttribute('aria-hidden', String(!visible));
  });
  if (nav) observer.observe(nav, {attributes:true, attributeFilter:['style']});
})();