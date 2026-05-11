'use strict';

/* ─────────────────────────────────────────────────────────────
   UTILITÁRIOS
   ───────────────────────────────────────────────────────────── */

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

/* ─────────────────────────────────────────────────────────────
   1. HdmHeader — fixed + scroll hide/show
   ───────────────────────────────────────────────────────────── */

class HdmHeader extends HTMLElement {
  #lastScrollY = 0;
  #section     = null;

  connectedCallback() {
    requestAnimationFrame(() => {
      this.#section = this.closest('.hdm-header-section') ?? this.parentElement;

      const updatePadding = () => {
        const headerH = this.#section?.offsetHeight ?? 0;
        const annBar  = document.getElementById('hdm-announcement-bar')
                     ?? document.querySelector('.hdm-announcement-section');
        const annH    = annBar?.offsetHeight ?? 0;
        const total   = headerH + annH;
        document.documentElement.style.setProperty('--hdm-header-fixed-height', `${total}px`);
        document.body.style.paddingTop = `${total}px`;
      };

      updatePadding();
      window.addEventListener('resize', updatePadding);

      this.#lastScrollY  = window.scrollY;
      this._onScroll     = this.#handleScroll.bind(this);
      window.addEventListener('scroll', this._onScroll, { passive: true });
    });
  }

  disconnectedCallback() {
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
  }

  #handleScroll() {
    const y     = window.scrollY;
    const delta = y - this.#lastScrollY;
    if (Math.abs(delta) < 8) return;

    if (delta > 0 && y > 80) {
      this.#section?.classList.add('hdm-header--hidden');
    } else {
      this.#section?.classList.remove('hdm-header--hidden');
    }

    this.#lastScrollY = y <= 0 ? 0 : y;
  }
}

/* ─────────────────────────────────────────────────────────────
   2. HdmMegaMenu — mega menu desktop (portal pattern)
   ───────────────────────────────────────────────────────────── */

class HdmMegaMenu {
  #openPanel  = null;
  #closeTimer = null;
  #closeDelay = 140;
  #portals    = new Map();
  #overlay    = null;
  #header     = null;

  constructor(header) {
    this.#header  = header;
    this.#overlay = document.getElementById('hdm-mega-overlay');
    this.#setup();
    document.addEventListener('click', this.#onDocClick.bind(this));
    window.addEventListener('resize', debounce(this.#reposition.bind(this), 120));
    window.addEventListener('keydown', this.#onKeyDown.bind(this));
  }

  #setup() {
    const items = this.#header.querySelectorAll('.hdm-nav__item[data-has-submenu]');

    items.forEach((item) => {
      const panel = item.querySelector('.hdm-mega');
      const link  = item.querySelector('.hdm-nav__link');
      if (!panel || !link) return;

      document.body.appendChild(panel);
      this.#portals.set(item, panel);

      item.addEventListener('pointerenter', () => {
        this.#clearClose();
        this.#open(panel, link);
      });

      item.addEventListener('pointerleave', (e) => {
        if (e.relatedTarget && panel.contains(e.relatedTarget)) return;
        this.#scheduleClose();
      });

      panel.addEventListener('pointerenter', () => this.#clearClose());
      panel.addEventListener('pointerleave', (e) => {
        if (e.relatedTarget && item.contains(e.relatedTarget)) return;
        this.#scheduleClose();
      });
    });
  }

  #open(panel, link) {
    if (this.#openPanel && this.#openPanel !== panel) this.#close(this.#openPanel);

    this.#positionPanel(panel);
    panel.classList.add('hdm-mega--open');
    link.setAttribute('aria-expanded', 'true');
    this.#openPanel = panel;

    if (this.#overlay) this.#overlay.classList.add('hdm-mega-overlay--visible');
  }

  #close(panel) {
    panel.classList.remove('hdm-mega--open');

    this.#portals.forEach((p, item) => {
      if (p === panel) item.querySelector('.hdm-nav__link')?.setAttribute('aria-expanded', 'false');
    });

    if (this.#openPanel === panel) this.#openPanel = null;
    if (this.#overlay) this.#overlay.classList.remove('hdm-mega-overlay--visible');
  }

  #closeAll() {
    if (this.#openPanel) this.#close(this.#openPanel);
  }

  #scheduleClose() {
    this.#clearClose();
    this.#closeTimer = setTimeout(() => this.#closeAll(), this.#closeDelay);
  }

  #clearClose() {
    if (this.#closeTimer !== null) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }
  }

  #positionPanel(panel) {
    if (!this.#header) return;
    const rect = this.#header.getBoundingClientRect();
    panel.style.cssText = `position:fixed;top:${rect.bottom}px;left:0;right:0;width:100%;z-index:400;`;
  }

  #reposition() {
    if (this.#openPanel) this.#positionPanel(this.#openPanel);
  }

  #onDocClick(e) {
    if (this.#header?.contains(e.target)) return;
    let inside = false;
    this.#portals.forEach((p) => { if (p.contains(e.target)) inside = true; });
    if (!inside) this.#closeAll();
  }

  #onKeyDown(e) {
    if (e.key === 'Escape') this.#closeAll();
  }
}

/* ─────────────────────────────────────────────────────────────
   3. HdmNavArrows — scroll horizontal com setas
   ───────────────────────────────────────────────────────────── */

class HdmNavArrows {
  #track;
  #prev;
  #next;
  #scrollStep = 260;

  constructor(navbar) {
    this.#track = navbar.querySelector('.hdm-nav__track');
    this.#prev  = navbar.querySelector('.hdm-nav__arrow--prev');
    this.#next  = navbar.querySelector('.hdm-nav__arrow--next');
    if (!this.#track) return;

    this.#prev?.addEventListener('click', () => this.#track.scrollBy({ left: -this.#scrollStep, behavior: 'smooth' }));
    this.#next?.addEventListener('click', () => this.#track.scrollBy({ left:  this.#scrollStep, behavior: 'smooth' }));

    this.#track.addEventListener('scroll', debounce(this.#update.bind(this), 80), { passive: true });
    new ResizeObserver(debounce(this.#update.bind(this), 80)).observe(this.#track);
    this.#update();
  }

  #update() {
    const t      = this.#track;
    const atStart = t.scrollLeft <= 2;
    const atEnd   = t.scrollLeft + t.clientWidth >= t.scrollWidth - 2;
    const hasOvf  = t.scrollWidth > t.clientWidth + 4;

    if (this.#prev) { this.#prev.disabled = atStart; this.#prev.style.display = hasOvf ? '' : 'none'; }
    if (this.#next) { this.#next.disabled = atEnd;   this.#next.style.display = hasOvf ? '' : 'none'; }
  }
}

/* ─────────────────────────────────────────────────────────────
   4. HdmCepModal — CEP com localStorage
   ───────────────────────────────────────────────────────────── */

class HdmCepModal {
  static #KEY = 'hdm_user_cep';
  #modal; #label; #input;

  constructor() {
    this.#modal = document.getElementById('hdm-cep-modal');
    this.#label = document.getElementById('hdm-cep-label');
    this.#input = document.getElementById('hdm-cep-input');
    if (!this.#modal) return;
    this.#initLabel();
    this.#bindEvents();
  }

  #initLabel() {
    try {
      const saved = localStorage.getItem(HdmCepModal.#KEY);
      if (saved && this.#label) this.#label.textContent = saved;
    } catch (_) {}
  }

  #bindEvents() {
    document.getElementById('hdm-cep-trigger')?.addEventListener('click', () => this.#open());
    document.getElementById('hdm-cep-backdrop')?.addEventListener('click', () => this.#close());
    document.getElementById('hdm-cep-close')?.addEventListener('click', () => this.#close());
    document.getElementById('hdm-cep-save')?.addEventListener('click', () => this.#save());

    this.#input?.addEventListener('input', () => {
      if (this.#input) this.#input.value = formatCep(this.#input.value);
    });
    this.#input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  this.#save();
      if (e.key === 'Escape') this.#close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.#modal.hidden) this.#close();
    });
  }

  #open() {
    this.#modal.hidden = false;
    try {
      const saved = localStorage.getItem(HdmCepModal.#KEY);
      if (saved && this.#input) this.#input.value = saved;
    } catch (_) {}
    setTimeout(() => this.#input?.focus(), 80);
  }

  #close() {
    this.#modal.hidden = true;
    if (this.#input) this.#input.value = '';
  }

  #save() {
    const digits = (this.#input?.value ?? '').replace(/\D/g, '');
    if (digits.length < 8) {
      this.#input?.classList.add('hdm-cep-modal__input--error');
      setTimeout(() => this.#input?.classList.remove('hdm-cep-modal__input--error'), 1200);
      return;
    }
    const formatted = formatCep(digits);
    try { localStorage.setItem(HdmCepModal.#KEY, formatted); } catch (_) {}
    if (this.#label) this.#label.textContent = formatted;
    this.#close();
  }
}

/* ─────────────────────────────────────────────────────────────
   BOOTSTRAP
   ───────────────────────────────────────────────────────────── */

function init() {
  if (!customElements.get('hdm-header')) {
    customElements.define('hdm-header', HdmHeader);
  }

  const headerEl = document.getElementById('hdm-header');
  if (!headerEl) return;

  const navbar = headerEl.querySelector('.hdm-header__navbar');

  if (window.innerWidth > 989) new HdmMegaMenu(headerEl);

  let megaInit = window.innerWidth > 989;
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 989 && !megaInit) {
      new HdmMegaMenu(headerEl);
      megaInit = true;
    }
  }, 200));

  if (navbar) new HdmNavArrows(navbar);

  new HdmCepModal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}