document.addEventListener('DOMContentLoaded', () => {
  
  const track = document.querySelector('.js-pdp-carousel-track');
  const slides = document.querySelectorAll('.js-pdp-carousel-slide');
  const thumbs = document.querySelectorAll('.js-pdp-thumb-btn');
  const dots = document.querySelectorAll('.js-pdp-dot');
  const mainImageContainer = document.querySelector('.js-pdp-main-image');
  
  let currentIndex = 0;

  // --- 1. LÓGICA CENTRAL DO CARROSSEL E THUMBNAILS ---
  const updateActiveStates = (index) => {
    currentIndex = index;
    thumbs.forEach(t => t.classList.remove('is-active'));
    dots.forEach(d => d.classList.remove('is-active'));
    
    if (thumbs[index]) thumbs[index].classList.add('is-active');
    if (dots[index]) dots[index].classList.add('is-active');
  };

  const scrollToSlide = (index) => {
    if (!slides[index] || !track) return;
    const targetScroll = slides[index].offsetLeft;
    track.scrollTo({ left: targetScroll, behavior: 'smooth' });
    updateActiveStates(index);
  };

  // Clique na miniatura (Desktop) ou Bolinha (Mobile)
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      scrollToSlide(index);
      
      // UX de Mestre: Se clicar na thumb com o "+X", já abre o modal gigante pra ele ver o resto!
      if (thumb.querySelector('.custom-pdp-thumb-overlay')) {
        setTimeout(() => {
          const zoomTrigger = document.querySelector('.js-zoom-trigger');
          if (zoomTrigger) zoomTrigger.click();
        }, 100); // Pequeno atraso pro carrossel alinhar a foto antes de abrir
      }
    });
  });
  
  dots.forEach((dot, index) => dot.addEventListener('click', () => scrollToSlide(index)));

  // Escuta o dedo arrastando no mobile (Swipe Native)
  if (track && window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          updateActiveStates(index);
        }
      });
    }, { root: track, threshold: 0.6 }); // Quando 60% da foto aparecer, acende a bolinha
    
    slides.forEach(slide => observer.observe(slide));
  }

  // Permite que outras funções (como a de Variantes) movam o carrossel
  window.pdpScrollToSlide = scrollToSlide;


  // --- 2. LÓGICA DE HOVER ZOOM (Desktop) ---
  if (mainImageContainer) {
    mainImageContainer.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 750) return;
      
      const { left, top, width, height } = mainImageContainer.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      
      // Aplica a origem do zoom em todas as imagens (a visível vai reagir)
      const allImages = document.querySelectorAll('.custom-pdp-img');
      allImages.forEach(img => img.style.transformOrigin = `${x}% ${y}%`);
    });

    mainImageContainer.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 750) mainImageContainer.classList.add('is-zooming');
    });

    mainImageContainer.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 750) {
        mainImageContainer.classList.remove('is-zooming');
        document.querySelectorAll('.custom-pdp-img').forEach(img => img.style.transformOrigin = 'center center');
      }
    });
  }


  // --- 3. LÓGICA DO MODAL (SUPER ZOOM) ---
  const zoomTriggers = document.querySelectorAll('.js-zoom-trigger');
  const zoomModal = document.querySelector('.js-pdp-zoom-modal');
  const zoomTargetImg = document.querySelector('.js-pdp-zoom-img-target');
  const zoomCloseBtn = document.querySelector('.js-pdp-zoom-close');
  const zoomViewport = document.querySelector('.js-pdp-zoom-viewport');
  const zoomPrev = document.querySelector('.js-pdp-zoom-prev');
  const zoomNext = document.querySelector('.js-pdp-zoom-next');

  if (zoomModal && zoomTargetImg) {
    const resetModalZoom = () => {
      zoomModal.classList.remove('is-zoomed-in');
      zoomTargetImg.style.transform = '';
      zoomViewport.scrollLeft = 0;
      zoomViewport.scrollTop = 0;
    };

    const updateModalImage = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      const targetImg = slides[index].querySelector('.js-zoom-trigger');
      if (targetImg) {
        zoomTargetImg.setAttribute('src', targetImg.getAttribute('data-zoom-url'));
        resetModalZoom();
        scrollToSlide(index); // Sincroniza a página lá atrás automaticamente!
      }
    };

    zoomTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        zoomTargetImg.setAttribute('src', e.target.getAttribute('data-zoom-url'));
        zoomModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      zoomModal.classList.remove('is-open');
      document.body.style.overflow = '';
      resetModalZoom();
    };

    if (zoomCloseBtn) zoomCloseBtn.addEventListener('click', closeModal);

    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal || e.target === zoomViewport) {
        if (!zoomModal.classList.contains('is-zoomed-in')) closeModal();
      }
    });

    if (zoomPrev) zoomPrev.addEventListener('click', (e) => { e.stopPropagation(); updateModalImage(currentIndex - 1); });
    if (zoomNext) zoomNext.addEventListener('click', (e) => { e.stopPropagation(); updateModalImage(currentIndex + 1); });

    // Panning (Arrastar no Super Zoom)
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    zoomTargetImg.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomModal.classList.toggle('is-zoomed-in');
    });

    zoomViewport.addEventListener('mousedown', (e) => {
      if (!zoomModal.classList.contains('is-zoomed-in')) return;
      isDragging = true;
      startX = e.pageX - zoomViewport.offsetLeft;
      startY = e.pageY - zoomViewport.offsetTop;
      scrollLeft = zoomViewport.scrollLeft;
      scrollTop = zoomViewport.scrollTop;
    });

    zoomViewport.addEventListener('mouseleave', () => isDragging = false);
    zoomViewport.addEventListener('mouseup', () => isDragging = false);
    zoomViewport.addEventListener('mousemove', (e) => {
      if (!isDragging || !zoomModal.classList.contains('is-zoomed-in')) return;
      e.preventDefault();
      zoomViewport.scrollLeft = scrollLeft - ((e.pageX - zoomViewport.offsetLeft) - startX) * 1.5;
      zoomViewport.scrollTop = scrollTop - ((e.pageY - zoomViewport.offsetTop) - startY) * 1.5;
    });
  }


  // --- 4. LÓGICA DO SELETOR DE QUANTIDADE (+ e -) ---
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus = document.querySelector('.qty-plus');
  const qtyInput = document.querySelector('.qty-input');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => { if (parseInt(qtyInput.value, 10) > 1) qtyInput.value = parseInt(qtyInput.value, 10) - 1; });
    qtyPlus.addEventListener('click', () => { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });
  }


  // --- 5. LÓGICA DE VARIANTES ---
  const variantRadios = document.querySelectorAll('.custom-pdp-swatch-input');
  const variantDataJson = document.querySelector('[id^="ProductJSON-"]');
  const hiddenIdInput = document.querySelector('input[name="id"]');
  
  if (variantRadios.length > 0 && variantDataJson && hiddenIdInput) {
    const variants = JSON.parse(variantDataJson.textContent);

    variantRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        
        const currentGroup = radio.closest('.custom-pdp-option-group');
        if (currentGroup) {
          const labelToUpdate = currentGroup.querySelector('.selected-value');
          if (labelToUpdate) labelToUpdate.textContent = radio.value;
        }

        const selectedOptions = Array.from(document.querySelectorAll('.custom-pdp-swatch-input:checked')).map(input => input.value);
        const matchedVariant = variants.find(variant => selectedOptions.every((val, index) => val === variant.options[index]));

        if (matchedVariant) {
          hiddenIdInput.value = matchedVariant.id;

          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('variant', matchedVariant.id);
          window.history.replaceState({}, '', newUrl);

          const priceElement = document.querySelector('.custom-pdp-current-price');
          const comparePriceElement = document.querySelector('.custom-pdp-compare-price');
          const pixPriceElement = document.querySelector('.custom-pdp-pix-price strong');
          const formatMoney = (cents) => 'R$ ' + (cents / 100).toFixed(2).replace('.', ',');

          if (priceElement) priceElement.textContent = formatMoney(matchedVariant.price);
          if (pixPriceElement) pixPriceElement.textContent = formatMoney(matchedVariant.price * 0.95);
          
          if (comparePriceElement) {
            if (matchedVariant.compare_at_price > matchedVariant.price) {
              const calcDesc = Math.round((matchedVariant.compare_at_price - matchedVariant.price) * 100 / matchedVariant.compare_at_price);
              comparePriceElement.innerHTML = `${formatMoney(matchedVariant.compare_at_price)} <span class="custom-pdp-swatch-discount discount-badge-sticky-button">-${calcDesc}% OFF</span>`;
              comparePriceElement.style.display = 'inline-block';
            } else {
              comparePriceElement.style.display = 'none';
            }
          }

          const addToCartBtn = document.querySelector('.custom-pdp-btn-add');
          if (addToCartBtn) {
            addToCartBtn.removeAttribute('disabled');
            addToCartBtn.textContent = matchedVariant.available ? 'ADICIONAR À SACOLA' : 'ESGOTADO';
            if (!matchedVariant.available) addToCartBtn.setAttribute('disabled', 'disabled');
          }

          // Rola o carrossel para a foto da variante escolhida!
          if (matchedVariant.featured_image) {
            const pos = matchedVariant.featured_image.position;
            if (pos && typeof window.pdpScrollToSlide === 'function') {
               window.pdpScrollToSlide(pos - 1); // Shopify envia a posição como 1,2,3. A gente subtrai 1.
            }
          }
        }
      });
    });
  }
});