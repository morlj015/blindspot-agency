// =============================================
// Blindspot Agency - Main JavaScript
// =============================================

// =============================================
// Custom Cursor
// =============================================

(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .theme-toggle, .pricing-card, .case-card, .team-card, .value-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
})();

// Config
const WEBHOOK_URL = 'https://hook.eu1.make.com/REPLACE_WITH_YOUR_WEBHOOK';

// =============================================
// SVG Icons
// =============================================

const sunIconSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const moonIconSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

// =============================================
// Theme Toggle
// =============================================

function initTheme() {
  const saved = localStorage.getItem('blindspot-theme');
  if (saved === 'light') {
    document.documentElement.classList.add('light');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('blindspot-theme', isLight ? 'light' : 'dark');
  updateThemeIcon();
}

function updateThemeIcon() {
  const isLight = document.documentElement.classList.contains('light');
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.innerHTML = isLight ? sunIconSVG : moonIconSVG;
  btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

// =============================================
// Mobile Nav
// =============================================

function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const closeBtn = document.querySelector('.mobile-close');

  hamburger?.addEventListener('click', () => openMobileMenu());
  closeBtn?.addEventListener('click', () => closeMobileMenu());
  mobileOverlay?.addEventListener('click', () => closeMobileMenu());

  function openMobileMenu() {
    mobileMenu?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger?.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
  }
}

// =============================================
// Modal System
// =============================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const focusable = modal.querySelectorAll('input, select, textarea, button, [tabindex]');
  if (focusable.length > 0) {
    setTimeout(() => focusable[0].focus(), 50);
  }

  const escHandler = (e) => {
    if (e.key === 'Escape') closeModal(modalId);
  };
  document.addEventListener('keydown', escHandler);
  modal._escHandler = escHandler;
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (modal._escHandler) {
    document.removeEventListener('keydown', modal._escHandler);
    modal._escHandler = null;
  }
}

// =============================================
// Form Submission
// =============================================

async function submitForm(formEl, successMsg, modalId) {
  if (!formEl.reportValidity()) return;

  const data = {};
  const inputs = formEl.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (!input.name) return;
    if ((input.type === 'checkbox' || input.type === 'radio')) {
      if (input.checked) data[input.name] = input.value || 'yes';
      return;
    }
    data[input.name] = input.value;
  });

  const submitBtn = formEl.querySelector('[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  const errorEl = formEl.querySelector('.form-error');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('Payload sent:', data);
    formEl.style.display = 'none';
    const successEl = document.getElementById(successMsg);
    if (successEl) successEl.style.display = 'block';
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = 'Something went wrong. Please try again or reach out via the contact form.';
      errorEl.style.display = 'block';
    }
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// =============================================
// Cookie Notice
// =============================================

function initCookieNotice() {
  const noticeKey = 'blindspot-cookie-notice-v1';
  if (localStorage.getItem(noticeKey) === 'dismissed') return;

  const notice = document.createElement('aside');
  notice.className = 'cookie-notice';
  notice.setAttribute('role', 'dialog');
  notice.setAttribute('aria-label', 'Cookie notice');
  notice.innerHTML = `
    <p class="cookie-notice-text">
      We use essential site storage to remember your theme preference and cookie notice choice. We do not set analytics or advertising cookies by default.
      <a href="cookies.html">Cookies</a>
      <a href="privacy.html">Privacy</a>
    </p>
    <button type="button" class="cookie-notice-btn">OK</button>
  `;

  const dismiss = () => {
    localStorage.setItem(noticeKey, 'dismissed');
    notice.classList.remove('visible');
    setTimeout(() => notice.remove(), 220);
  };

  notice.querySelector('.cookie-notice-btn')?.addEventListener('click', dismiss);
  document.body.appendChild(notice);
  requestAnimationFrame(() => notice.classList.add('visible'));
}

// =============================================
// Scroll Animations
// =============================================

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay * 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = i % 4;
    observer.observe(el);
  });
}

// =============================================
// Drag and Drop Service Builder
// =============================================

function initServiceBuilder() {
  const builderSection = document.querySelector('.builder-section');
  if (!builderSection) return;

  const dropZone = document.getElementById('drop-zone');
  const selectedContainer = document.getElementById('selected-chips');
  const hint = document.getElementById('drop-hint');

  if (!dropZone || !selectedContainer) return;

  const selectedServices = new Set();
  let suppressClick = false;

  function createDragClone(chip) {
    const clone = chip.cloneNode(true);
    clone.style.cssText = 'position:fixed;left:0;top:0;opacity:0.88;pointer-events:none;z-index:9999;border-radius:999px;padding:7px 13px;background:var(--surface);border:1px solid var(--accent);font-size:0.78rem;font-family:DM Sans,sans-serif;color:var(--accent);box-shadow:0 10px 24px rgba(0,0,0,0.25);';
    return clone;
  }

  function triggerPoof(x, y) {
    const rect = dropZone.getBoundingClientRect();
    const burstX = typeof x === 'number' ? x - rect.left : rect.width / 2;
    const burstY = typeof y === 'number' ? y - rect.top : rect.height / 2;
    const poof = document.createElement('div');
    poof.className = 'drop-poof';
    poof.style.left = `${burstX}px`;
    poof.style.top = `${burstY}px`;

    const ring = document.createElement('span');
    ring.className = 'drop-poof-ring';
    poof.appendChild(ring);

    for (let i = 0; i < 8; i += 1) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 20 + Math.random() * 18;
      particle.className = 'drop-poof-particle';
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      particle.style.animationDelay = `${i * 18}ms`;
      poof.appendChild(particle);
    }

    dropZone.appendChild(poof);
    setTimeout(() => poof.remove(), 620);
  }

  // Desktop drag and drop
  document.querySelectorAll('.service-chip').forEach(chip => {
    let mouseClone = null;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let isMouseDragging = false;

    chip.setAttribute('draggable', 'false');

    chip.addEventListener('click', () => {
      if (suppressClick) return;
      addService(chip.dataset.service);
    });

    chip.addEventListener('mousedown', e => {
      if (e.button !== 0 || chip.classList.contains('chip-used')) return;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
      isMouseDragging = false;

      const handleMouseMove = moveEvent => {
        const movedX = Math.abs(moveEvent.clientX - mouseStartX);
        const movedY = Math.abs(moveEvent.clientY - mouseStartY);

        if (!isMouseDragging && movedX < 6 && movedY < 6) return;

        if (!isMouseDragging) {
          isMouseDragging = true;
          suppressClick = true;
          chip.classList.add('dragging');
          mouseClone = createDragClone(chip);
          document.body.appendChild(mouseClone);
        }

        if (mouseClone) {
          mouseClone.style.left = `${moveEvent.clientX - 30}px`;
          mouseClone.style.top = `${moveEvent.clientY - 15}px`;
        }

        const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const isOverDrop = dropZone.contains(el) || el === dropZone;
        dropZone.classList.toggle('drag-over', isOverDrop);
      };

      const handleMouseUp = upEvent => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        if (mouseClone) {
          document.body.removeChild(mouseClone);
          mouseClone = null;
        }

        chip.classList.remove('dragging');
        dropZone.classList.remove('drag-over');

        if (isMouseDragging) {
          const el = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
          if (dropZone.contains(el) || el === dropZone) {
            addService(chip.dataset.service, { dropX: upEvent.clientX, dropY: upEvent.clientY });
          }
          setTimeout(() => {
            suppressClick = false;
          }, 0);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  });

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const service = e.dataTransfer.getData('text/plain');
    if (service) addService(service, { dropX: e.clientX, dropY: e.clientY });
  });

  // Touch support
  let touchChip = null;
  let touchClone = null;

  document.querySelectorAll('.service-chip').forEach(chip => {
    let touchStartX = 0;
    let touchStartY = 0;

    chip.addEventListener('touchstart', e => {
      touchChip = chip.dataset.service;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchClone = createDragClone(chip);
      document.body.appendChild(touchClone);
    }, { passive: true });

    chip.addEventListener('touchmove', e => {
      if (!touchClone) return;
      const touch = e.touches[0];
      touchClone.style.left = (touch.clientX - 30) + 'px';
      touchClone.style.top  = (touch.clientY - 15) + 'px';

      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const isOverDrop = dropZone.contains(el) || el === dropZone;
      dropZone.classList.toggle('drag-over', isOverDrop);
    }, { passive: true });

    chip.addEventListener('touchend', e => {
      if (touchClone) {
        document.body.removeChild(touchClone);
        touchClone = null;
      }
      dropZone.classList.remove('drag-over');

      const touch   = e.changedTouches[0];
      const movedX  = Math.abs(touch.clientX - touchStartX);
      const movedY  = Math.abs(touch.clientY - touchStartY);
      const wasTap  = movedX < 8 && movedY < 8;

      if (wasTap) {
        // Simple tap on mobile: add directly
        addService(touchChip);
      } else {
        // Drag: only add if released over the drop zone
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (dropZone.contains(el) || el === dropZone) {
          addService(touchChip, { dropX: touch.clientX, dropY: touch.clientY });
        }
      }
      touchChip = null;
    }, { passive: true });
  });

  function addService(service, options = {}) {
    if (!service || selectedServices.has(service)) return;
    selectedServices.add(service);

    // Fade out the empty state hint
    if (hint) {
      hint.style.transition = 'opacity 0.25s ease';
      hint.style.opacity = '0';
      setTimeout(() => { if (hint) hint.style.display = 'none'; }, 260);
    }

    // Dim the source chip and add a checkmark
    const sourceChip = document.querySelector(`.service-chip[data-service="${CSS.escape(service)}"]`);
    if (sourceChip) sourceChip.classList.add('chip-used');

    // Build the package chip with drop-in animation
    const chip = document.createElement('span');
    chip.className = 'package-chip drop-enter';
    chip.dataset.service = service;
    chip.innerHTML = `${service}<button class="remove-chip" aria-label="Remove ${service}">&times;</button>`;

    chip.querySelector('.remove-chip').addEventListener('click', () => {
      // Animate out before removing from DOM
      chip.classList.remove('drop-enter');
      chip.classList.add('drop-exit');
      setTimeout(() => {
        chip.remove();
        selectedServices.delete(service);
        if (sourceChip) sourceChip.classList.remove('chip-used');
        updateBuilderUI();
      }, 220);
    });

    selectedContainer.appendChild(chip);
    triggerPoof(options.dropX, options.dropY);
    // Clean up animation class once it has played
    setTimeout(() => chip.classList.remove('drop-enter'), 420);

    updateBuilderUI();
  }

  function updateBuilderUI() {
    const count      = selectedServices.size;
    const countLabel = document.getElementById('package-count-label');
    const badge      = document.getElementById('quote-count-badge');
    const btn        = document.getElementById('get-quote-btn');

    // Live counter label
    if (countLabel) {
      if (count === 0) {
        countLabel.textContent = 'Nothing added yet';
      } else {
        countLabel.innerHTML = `<span class="count-num" id="count-num">${count}</span>&nbsp;service${count === 1 ? '' : 's'} selected`;
        const num = document.getElementById('count-num');
        if (num) {
          num.classList.add('bump');
          setTimeout(() => num.classList.remove('bump'), 260);
        }
      }
    }

    // Badge on the quote button
    if (badge) {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.add('visible');
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 320);
      } else {
        badge.classList.remove('visible');
      }
    }

    // Glow the button once services are added
    if (btn) btn.classList.toggle('btn-ready', count > 0);

    // Restore hint if package is emptied
    if (count === 0 && hint) {
      hint.style.display = '';
      requestAnimationFrame(() => {
        hint.style.opacity = '1';
      });
    }
  }

  // Get quote button
  const quoteBtn = document.getElementById('get-quote-btn');
  quoteBtn?.addEventListener('click', () => {
    if (selectedServices.size === 0) {
      // Flash the drop zone border red instead of a jarring alert
      const dz = document.getElementById('drop-zone');
      if (dz) {
        const orig = dz.style.borderColor;
        dz.style.transition = 'border-color 0.2s ease';
        dz.style.borderColor = 'rgba(224,85,85,0.7)';
        setTimeout(() => { dz.style.borderColor = orig; }, 650);
      }
      return;
    }
    const hiddenInput = document.getElementById('selected-services-input');
    if (hiddenInput) hiddenInput.value = [...selectedServices].join(', ');
    openModal('modal-quote');
  });
}

// =============================================
// Case Study Expand
// =============================================

function initCaseStudies() {
  document.querySelectorAll('.case-read-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.case-card');
      const expanded = card.querySelector('.case-expanded');
      if (!expanded) return;
      const isOpen = expanded.classList.toggle('open');
      btn.textContent = isOpen ? 'Read less' : 'Read more';
    });
  });
}

// =============================================
// Scroll To Top
// =============================================

function initScrollToTop() {
  const btn = document.getElementById('scroll-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =============================================
// Active Nav Link
// =============================================

function setActiveNav() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    const isActive =
      href === filename ||
      (filename === '' && href === 'index.html') ||
      (filename === 'index.html' && href === 'index.html') ||
      (path.endsWith('/') && href === 'index.html');

    link.classList.toggle('active', isActive);
  });
}

// =============================================
// DOMContentLoaded Init
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initScrollAnimations();
  initCaseStudies();
  initServiceBuilder();
  initCookieNotice();
  setActiveNav();
  initScrollToTop();

  // Theme toggle button
  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);

  // All "Book a Call" triggers
  document.querySelectorAll('[data-modal="book"]').forEach(btn => {
    btn.addEventListener('click', () => openModal('modal-book'));
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Modal overlay background click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Book a call form
  const bookForm = document.getElementById('form-book');
  bookForm?.addEventListener('submit', e => {
    e.preventDefault();
    submitForm(bookForm, 'success-book', 'modal-book');
  });

  // Quote form
  const quoteForm = document.getElementById('form-quote');
  quoteForm?.addEventListener('submit', e => {
    e.preventDefault();
    submitForm(quoteForm, 'success-quote', 'modal-quote');
  });
});
