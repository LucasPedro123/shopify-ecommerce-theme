/**
 * HDM Beauty - Benefits Carousel Web Component
 * Lida com scroll snap nativo, dots e física de arrasto (drag to scroll).
 */
class BenefitsCarousel extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.slides = Array.from(this.querySelectorAll('[data-slide]'));
    this.dots = Array.from(this.querySelectorAll('[data-dot]'));
    this.btnPrev = this.querySelector('[data-prev]');
    this.btnNext = this.querySelector('[data-next]');
    
    // Variáveis para a física de Drag
    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;

    if (!this.slider || this.slides.length === 0) return;

    this.initObserver();
    this.bindEvents();
    this.bindDragEvents();
  }

  initObserver() {
    const observerOptions = {
      root: this.slider,
      threshold: 0.6
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeIndex = parseInt(entry.target.dataset.slide, 10);
          this.updateControls(activeIndex);
        }
      });
    }, observerOptions);

    this.slides.forEach(slide => this.observer.observe(slide));
  }

  bindEvents() {
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.scrollByDirection(-1));
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.scrollByDirection(1));
    
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.scrollToIndex(index));
    });
  }

  bindDragEvents() {
    // Mouse events
    this.slider.addEventListener('mousedown', (e) => {
      this.isDown = true;
      this.slider.classList.add('is-dragging');
      this.startX = e.pageX - this.slider.offsetLeft;
      this.scrollLeft = this.slider.scrollLeft;
    });

    this.slider.addEventListener('mouseleave', () => {
      this.isDown = false;
      this.slider.classList.remove('is-dragging');
    });

    this.slider.addEventListener('mouseup', () => {
      this.isDown = false;
      this.slider.classList.remove('is-dragging');
    });

    this.slider.addEventListener('mousemove', (e) => {
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.pageX - this.slider.offsetLeft;
      const walk = (x - this.startX) * 1.5; // Multiplicador de velocidade do arrasto
      this.slider.scrollLeft = this.scrollLeft - walk;
    });
  }

  scrollByDirection(direction) {
    const scrollAmount = this.slider.clientWidth * 0.8 * direction;
    this.slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  scrollToIndex(index) {
    if (this.slides[index]) {
      this.slides[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  updateControls(activeIndex) {
    // Atualiza os Dots alternando a classe 'is-active'
    this.dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });

    // Atualiza estado desabilitado das setas
    if (this.btnPrev && this.btnNext) {
      this.btnPrev.disabled = activeIndex === 0;
      this.btnNext.disabled = activeIndex === this.slides.length - 1;
    }
  }

  disconnectedCallback() {
    if (this.observer) this.observer.disconnect();
  }
}

if (!customElements.get('benefits-carousel')) {
  customElements.define('benefits-carousel', BenefitsCarousel);
}