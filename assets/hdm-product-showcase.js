/**
 * HDM Beauty — Product Showcase Web Component
 *
 * Responsabilidades:
 *   1. Navegação por chevrons (scroll horizontal smooth)
 *   2. Dots de paginação calculados dinamicamente conforme viewport
 *   3. Esconde/desabilita chevrons quando atinge edge
 *   4. Toggle favoritos via localStorage 'hdm_wishlist'
 *   5. Dispara evento global 'hdm:wishlist:change' para sync entre componentes
 *
 * Auto-registra como <product-showcase>.
 */

const WISHLIST_KEY = 'hdm_wishlist';

class HDMProductShowcase extends HTMLElement {
  connectedCallback() {
    this._track = this.querySelector('[data-track]');
    this._prevBtn = this.querySelector('[data-action="prev"]');
    this._nextBtn = this.querySelector('[data-action="next"]');
    this._dotsContainer = this.querySelector('[data-dots]');

    if (!this._track) return;

    this._bindNavigation();
    this._bindFavorites();
    this._initFavoriteStates();
    this._renderDots();
    this._updateNavState();

    // Re-render dots e nav state quando viewport muda
    this._onResize = this._debounce(() => {
      this._renderDots();
      this._updateNavState();
    }, 150);
    window.addEventListener('resize', this._onResize, { passive: true });

    // Sync com mudanças de wishlist disparadas por outros componentes
    this._onWishlistChange = (e) => this._syncFavoriteStates(e.detail);
    window.addEventListener('hdm:wishlist:change', this._onWishlistChange);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('hdm:wishlist:change', this._onWishlistChange);
  }

  /* ──────────────── 1. Navegação ──────────────── */
  _bindNavigation() {
    this._prevBtn?.addEventListener('click', () => this._scrollByPage(-1));
    this._nextBtn?.addEventListener('click', () => this._scrollByPage(1));

    this._track.addEventListener('scroll', this._debounce(() => {
      this._updateNavState();
      this._updateActiveDot();
    }, 80), { passive: true });
  }

  _getCardWidth() {
    const firstCard = this._track.firstElementChild;
    if (!firstCard) return 0;
    const style = getComputedStyle(this._track);
    const gap = parseInt(style.columnGap || style.gap, 10) || 0;
    return firstCard.offsetWidth + gap;
  }

  _getVisibleCount() {
    const cardWidth = this._getCardWidth();
    if (!cardWidth) return 1;
    return Math.max(1, Math.round(this._track.clientWidth / cardWidth));
  }

  _scrollByPage(direction) {
    const visible = this._getVisibleCount();
    const cardWidth = this._getCardWidth();
    this._track.scrollBy({
      left: cardWidth * visible * direction,
      behavior: 'smooth'
    });
  }

  _updateNavState() {
    if (!this._prevBtn || !this._nextBtn) return;
    const { scrollLeft, scrollWidth, clientWidth } = this._track;
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    this._prevBtn.toggleAttribute('aria-disabled', atStart);
    this._nextBtn.toggleAttribute('aria-disabled', atEnd);
  }

  /* ──────────────── 2. Dots de paginação ──────────────── */
  _renderDots() {
    if (!this._dotsContainer) return;
    const visible = this._getVisibleCount();
    const totalChildren = this._track.children.length;
    const totalPages = Math.max(1, Math.ceil(totalChildren / visible));

    // Esconde dots se só tem 1 página
    if (totalPages <= 1) {
      this._dotsContainer.hidden = true;
      return;
    }
    this._dotsContainer.hidden = false;

    // Recria dots apenas se quantidade mudou
    if (this._dotsContainer.children.length !== totalPages) {
      this._dotsContainer.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hdm-showcase__dot';
        dot.dataset.page = String(i);
        dot.setAttribute('aria-label', `Ir para a página ${i + 1} de ${totalPages}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => this._gotoPage(i));
        this._dotsContainer.appendChild(dot);
      }
    }
    this._updateActiveDot();
  }

  _gotoPage(pageIndex) {
    const cardWidth = this._getCardWidth();
    const visible = this._getVisibleCount();
    this._track.scrollTo({
      left: cardWidth * visible * pageIndex,
      behavior: 'smooth'
    });
  }

  _updateActiveDot() {
    if (!this._dotsContainer || this._dotsContainer.hidden) return;
    const cardWidth = this._getCardWidth();
    const visible = this._getVisibleCount();
    if (!cardWidth) return;
    const pageWidth = cardWidth * visible;
    const currentPage = Math.round(this._track.scrollLeft / pageWidth);
    Array.from(this._dotsContainer.children).forEach((dot, i) => {
      dot.setAttribute('aria-selected', String(i === currentPage));
    });
  }

  /* ──────────────── 3. Favoritos (localStorage) ──────────────── */
  _bindFavorites() {
    // Event delegation: um único listener no host
    this.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="toggle-favorite"]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      this._toggleFavorite(btn);
    });
  }

  _getFavorites() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  _setFavorites(list) {
    const unique = [...new Set(list.map(String))];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(unique));
    // Notifica outros componentes (badge no header, página /favoritos, etc.)
    window.dispatchEvent(new CustomEvent('hdm:wishlist:change', {
      detail: unique
    }));
  }

  _toggleFavorite(btn) {
    const id = btn.dataset.productId;
    if (!id) return;
    const favs = this._getFavorites();
    const idx = favs.indexOf(String(id));
    if (idx > -1) {
      favs.splice(idx, 1);
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label',
        btn.getAttribute('aria-label')?.replace('Remover', 'Adicionar') || 'Adicionar aos favoritos'
      );
    } else {
      favs.push(id);
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label',
        btn.getAttribute('aria-label')?.replace('Adicionar', 'Remover') || 'Remover dos favoritos'
      );
    }
    this._setFavorites(favs);
  }

  _initFavoriteStates() {
    const favs = this._getFavorites();
    this.querySelectorAll('[data-action="toggle-favorite"]').forEach((btn) => {
      const isFav = favs.includes(String(btn.dataset.productId));
      btn.setAttribute('aria-pressed', String(isFav));
      if (isFav) {
        btn.setAttribute('aria-label',
          (btn.getAttribute('aria-label') || '').replace('Adicionar', 'Remover')
        );
      }
    });
  }

  _syncFavoriteStates(currentList) {
    if (!Array.isArray(currentList)) return;
    this.querySelectorAll('[data-action="toggle-favorite"]').forEach((btn) => {
      const isFav = currentList.includes(String(btn.dataset.productId));
      btn.setAttribute('aria-pressed', String(isFav));
    });
  }

  /* ──────────────── Util ──────────────── */
  _debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }
}

if (!customElements.get('product-showcase')) {
  customElements.define('product-showcase', HDMProductShowcase);
}
