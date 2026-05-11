document.addEventListener('DOMContentLoaded', () => {
  
  // Envolvemos tudo numa função para podermos chamar no carregamento e no Theme Editor
  const initProductSliders = () => {
    const sliders = document.querySelectorAll('.custom-ps-wrapper');

    sliders.forEach(wrapper => {
      // FIX: Previne que o script seja executado múltiplas vezes na mesma seção
      if (wrapper.dataset.isInitialized === 'true') return;
      wrapper.dataset.isInitialized = 'true';

      const slider = wrapper.querySelector('.custom-ps-slider');
      const btnLeft = wrapper.querySelector('.custom-hero-arrow--left');
      const btnRight = wrapper.querySelector('.custom-hero-arrow--right');
      const dotsContainer = wrapper.querySelector('.custom-ps-dots');

      if (!slider) return;

      // --- LÓGICA DE ARRASTAR COM O MOUSE ---
      let isDown = false;
      let startX;
      let scrollLeft;
      let isDragging = false;

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        slider.classList.add('is-dragging');
        slider.style.scrollSnapType = 'none'; 
        slider.style.scrollBehavior = 'auto'; 
        
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });

      slider.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        restoreSnap();
      });

      slider.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        restoreSnap();
      });

      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        isDragging = true;
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; 
        slider.scrollLeft = scrollLeft - walk;
      });

      const links = slider.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          if (isDragging) e.preventDefault();
        });
      });

      const restoreSnap = () => {
        slider.classList.remove('is-dragging');
        slider.style.scrollSnapType = 'x mandatory';
        slider.style.scrollBehavior = 'smooth';
        slider.scrollBy({ left: 0, behavior: 'smooth' }); 
      };

      // --- LÓGICA DAS SETAS ---
      if (btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => {
          slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
        });
        
        btnRight.addEventListener('click', () => {
          if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
            slider.scrollTo({ left: 0, behavior: 'smooth' }); 
          } else {
            slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
          }
        });
      }

      // --- LÓGICA DOS DOTS (APENAS MOBILE) ---
      if (dotsContainer) {
        const slides = slider.querySelectorAll('.custom-ps-slide');
        
        // FIX: Limpa os dots antigos antes de criar novos (evita duplicação no Theme Editor)
        dotsContainer.innerHTML = ''; 
        
        slides.forEach((_, index) => {
          const dot = document.createElement('button');
          dot.classList.add('custom-ps-dot');
          if (index === 0) dot.classList.add('is-active');
          dot.setAttribute('aria-label', `Ir para o produto ${index + 1}`);
          
          dot.addEventListener('click', () => {
            const slideWidth = slides[0].clientWidth + 20; 
            slider.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
          });
          
          dotsContainer.appendChild(dot);
        });

        const updateDots = () => {
          const scrollLeft = slider.scrollLeft;
          const slideWidth = slides[0].clientWidth + 20; 
          const currentIndex = Math.round(scrollLeft / slideWidth);

          const allDots = dotsContainer.querySelectorAll('.custom-ps-dot');
          allDots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === currentIndex);
          });
        };

        slider.addEventListener('scroll', updateDots);
      }
    });
  };

  // Executa ao carregar a página
  initProductSliders();

  // FIX: Executa novamente caso o lojista altere algo na seção via Theme Editor
  document.addEventListener('shopify:section:load', initProductSliders);
});