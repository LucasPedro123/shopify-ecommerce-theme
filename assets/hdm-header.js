/**
 * HDM Header — Web Component (Sprint 1 refactor)
 *
 * Comportamentos:
 *   1. Scroll detection → data-state="scrolled" quando scrollY > 0
 *   2. Megamenu hover/focus → abre dropdown + dim overlay + data-state
 *   3. Dropdowns (CEP, Conta, Sacola) → toggle com aria-expanded
 *   4. Nav chevrons → scrollBy smooth, oculta quando não há overflow
 *   5. Mobile drawer → abre/fecha com focus básico
 *   6. ESC fecha tudo, click fora também
 *
 * Auto-registra como <header-component>.
 */

class HDMHeaderComponent extends HTMLElement {
  connectedCallback() {
    this._overlay = document.getElementById('hdm-header-overlay');
    this._spacer  = document.getElementById('hdm-header-spacer');
    this._drawer  = this.querySelector('#hdm-mobile-drawer');
    this._nav     = this.querySelector('[data-nav-scroller]');
    this._chevL   = this.querySelector('.hdm-nav__chevron--left');
    this._chevR   = this.querySelector('.hdm-nav__chevron--right');
    this._openDropdown = null;
    this._openMega     = null;

    this._bindScroll();
    this._bindDropdowns();
    this._bindMegamenu();
    this._bindChevrons();
    this._bindDrawer();
    this._bindGlobalDismiss();
    this._syncSpacer();
    window.addEventListener('resize', () => { this._syncSpacer(); this._updateChevronVisibility(); }, { passive: true });
    this._updateChevronVisibility();
  }

  /* ───────── 1. Scroll ───────── */
  _bindScroll() {
    if (this.dataset.sticky !== 'true') return;
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this._setScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    this._setScrolled(window.scrollY > 0);
  }

  _setScrolled(isScrolled) {
    const current = this.getAttribute('data-state');
    if (current === 'megamenu-open') return;
    this.setAttribute('data-state', isScrolled ? 'scrolled' : 'initial');
  }

  /* ───────── 2. Dropdowns (CEP, Conta, Sacola) ───────── */
  _bindDropdowns() {
    this.querySelectorAll('[data-action="toggle-dropdown"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const popId = btn.getAttribute('aria-controls');
        const pop = document.getElementById(popId);
        if (!pop) return;
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        this._closeAllDropdowns();
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          pop.hidden = false;
          this._openDropdown = { btn, pop };
          // Força white state + overlay enquanto dropdown estiver aberto
          this.setAttribute('data-state', 'megamenu-open');
          this._showOverlay();
          // Reset CEP pra invite sempre que abrir
          if (pop.classList.contains('hdm-pop--cep')) {
            pop.setAttribute('data-cep-state', 'invite');
          }
          const focusable = pop.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
          focusable?.focus();
        }
      });
    });

    // Botão "fechar" dentro de qualquer popover
    this.querySelectorAll('[data-action="close-dropdown"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeAllDropdowns();
      });
    });

    // CEP: pane invite → form (click no botão "Informar CEP" dentro do popover)
    this.querySelectorAll('.hdm-cep-show-form-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pop = btn.closest('.hdm-pop--cep');
        if (!pop) return;
        pop.setAttribute('data-cep-state', 'form');
        pop.querySelector('#hdm-cep-input')?.focus();
      });
    });

    // CEP: voltar para invite
    this.querySelectorAll('[data-action="cep-back-to-invite"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pop = btn.closest('.hdm-pop--cep');
        if (pop) pop.setAttribute('data-cep-state', 'invite');
      });
    });
  }

  _closeAllDropdowns() {
    if (!this._openDropdown) return;
    this._openDropdown.btn.setAttribute('aria-expanded', 'false');
    this._openDropdown.pop.hidden = true;
    // Reset CEP pra invite quando fecha
    if (this._openDropdown.pop.classList.contains('hdm-pop--cep')) {
      this._openDropdown.pop.setAttribute('data-cep-state', 'invite');
    }
    this._openDropdown = null;
    // Volta ao estado correto (scrolled ou initial) e esconde overlay
    if (!this._openMega) {
      this._setScrolledForce(window.scrollY > 0);
      this._hideOverlay();
    }
  }

  /* Versão direta do setScrolled que não respeita o lock de megamenu-open */
  _setScrolledForce(isScrolled) {
    this.setAttribute('data-state', isScrolled ? 'scrolled' : 'initial');
  }

  /* ───────── 3. Megamenu ───────── */
  _bindMegamenu() {
    const items = this.querySelectorAll('[data-megamenu-trigger="true"]');
    items.forEach((item) => {
      const trigger = item.querySelector('.hdm-nav__link');
      const targetId = item.getAttribute('data-mega-target');
      // Megamenu agora é IRMÃO do <ul> (não filho do <li>), busca por ID
      const mega = targetId ? document.getElementById(targetId) : null;
      if (!mega || !trigger) return;

      const open = () => {
        this._closeMega();
        mega.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        this._openMega = { item, mega, trigger };
        this.setAttribute('data-state', 'megamenu-open');
        this._showOverlay();
      };
      const scheduleClose = () => {
        this._closeMegaTimeout = setTimeout(() => this._closeMega(), 120);
      };
      const cancelClose = () => clearTimeout(this._closeMegaTimeout);

      item.addEventListener('mouseenter', () => { cancelClose(); open(); });
      item.addEventListener('mouseleave', scheduleClose);
      mega.addEventListener('mouseenter', cancelClose);
      mega.addEventListener('mouseleave', scheduleClose);
      trigger.addEventListener('focus', open);
    });
  }

  _closeMega() {
    if (!this._openMega) return;
    this._openMega.mega.hidden = true;
    this._openMega.trigger.setAttribute('aria-expanded', 'false');
    this._openMega = null;
    // Se ainda houver dropdown aberto, mantém white state
    if (!this._openDropdown) {
      this._setScrolledForce(window.scrollY > 0);
      this._hideOverlay();
    }
  }

  _showOverlay() { if (this._overlay) { this._overlay.hidden = false; requestAnimationFrame(() => this._overlay.setAttribute('data-visible', 'true')); } }
  _hideOverlay() {
    if (!this._overlay) return;
    this._overlay.removeAttribute('data-visible');
    setTimeout(() => { if (!this._overlay.getAttribute('data-visible')) this._overlay.hidden = true; }, 260);
  }

  /* ───────── 4. Nav chevrons ───────── */
  _bindChevrons() {
    if (!this._nav) return;
    [this._chevL, this._chevR].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const dir = btn.dataset.direction === 'right' ? 1 : -1;
        const delta = (this._nav.clientWidth * 0.6) * dir;
        this._nav.scrollBy({ left: delta, behavior: 'smooth' });
      });
    });
    this._nav.addEventListener('scroll', () => this._updateChevronVisibility(), { passive: true });
  }

  _updateChevronVisibility() {
    if (!this._nav) return;
    const { scrollLeft, scrollWidth, clientWidth } = this._nav;
    const hasOverflow = scrollWidth > clientWidth + 2;
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    if (this._chevL) {
      this._chevL.toggleAttribute('hidden', !hasOverflow || atStart);
      this._chevL.setAttribute('data-visible', String(hasOverflow && !atStart));
    }
    if (this._chevR) {
      this._chevR.toggleAttribute('hidden', !hasOverflow || atEnd);
      this._chevR.setAttribute('data-visible', String(hasOverflow && !atEnd));
    }
  }

  /* ───────── 5. Mobile drawer ───────── */
  _bindDrawer() {
    const openBtn  = this.querySelector('[data-action="open-drawer"]');
    const closeBtn = this._drawer?.querySelector('[data-action="close-drawer"]');
    openBtn?.addEventListener('click', () => this._openDrawerFn());
    closeBtn?.addEventListener('click', () => this._closeDrawer());
  }

  _openDrawerFn() {
    if (!this._drawer) return;
    this._drawer.hidden = false;
    requestAnimationFrame(() => this._drawer.setAttribute('data-open', 'true'));
    document.body.style.overflow = 'hidden';
    this._drawer.querySelector('a, button')?.focus();
  }

  _closeDrawer() {
    if (!this._drawer) return;
    this._drawer.removeAttribute('data-open');
    setTimeout(() => { this._drawer.hidden = true; }, 310);
    document.body.style.overflow = '';
  }

  /* ───────── 6. Global dismiss ───────── */
  _bindGlobalDismiss() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._closeAllDropdowns();
        this._closeMega();
        this._closeDrawer();
      }
    });
    document.addEventListener('click', (e) => {
      if (this._openDropdown) {
        const within = this._openDropdown.btn.contains(e.target) || this._openDropdown.pop.contains(e.target);
        if (!within) this._closeAllDropdowns();
      }
    });
    this._overlay?.addEventListener('click', () => {
      this._closeMega();
      this._closeAllDropdowns();
    });
  }

  _syncSpacer() {
    if (!this._spacer) return;
    this._spacer.style.height = this.offsetHeight + 'px';
  }
}

if (!customElements.get('header-component')) {
  customElements.define('header-component', HDMHeaderComponent);
}
