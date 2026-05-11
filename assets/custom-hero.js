document.addEventListener('DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.custom-hero-wrapper');

  wrappers.forEach(wrapper => {
    const slider = wrapper.querySelector('.custom-hero-slider');
    const dots = wrapper.querySelectorAll('.custom-hero-dot');
    const btnLeft = wrapper.querySelector('.custom-hero-arrow--left');
    const btnRight = wrapper.querySelector('.custom-hero-arrow--right');
    const isAutoplay = wrapper.dataset.autoplay === 'true';
    const speed = parseInt(wrapper.dataset.speed, 10);
    
    let intervalId;
    let resumeTimeoutId; // Novo controle para a pausa após interação

    if (!slider || dots.length <= 1) return;

    // --- CONTROLE DE AUTOPLAY MELHORADO ---
    const startAutoplay = () => {
      if (!isAutoplay) return;
      
      // Garante que não há outro intervalo rodando antes de iniciar
      clearInterval(intervalId); 
      
      intervalId = setInterval(() => {
        const slideWidth = slider.clientWidth;
        if (slider.scrollLeft + slideWidth >= slider.scrollWidth - 5) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: slideWidth, behavior: 'smooth' });
        }
      }, speed);
    };

    const stopAutoplay = () => {
      clearInterval(intervalId);
      clearTimeout(resumeTimeoutId);
    };

    // Pausa temporária após interação manual, volta depois do tempo configurado
    const pauseAndResetAutoplay = () => {
      stopAutoplay();
      if (isAutoplay) {
        resumeTimeoutId = setTimeout(() => {
          startAutoplay();
        }, speed); // Espera o tempo de um slide antes de voltar o automático
      }
    };

    // --- LÓGICA DE ARRASTAR (DRAG TO SCROLL) ---
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
      
      stopAutoplay(); // Para o autoplay enquanto segura o mouse
    });

    slider.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      restoreSnap();
      pauseAndResetAutoplay();
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      restoreSnap();
      pauseAndResetAutoplay(); // Volta a contar após soltar
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
        if (isDragging) {
          e.preventDefault();
        }
      });
    });

    const restoreSnap = () => {
      slider.classList.remove('is-dragging');
      slider.style.scrollSnapType = 'x mandatory';
      slider.style.scrollBehavior = 'smooth';
      slider.scrollBy({ left: 0, behavior: 'smooth' }); 
    };


    // --- NAVEGAÇÃO ---
    slider.addEventListener('scroll', () => {
      const scrollLeft = slider.scrollLeft;
      const slideWidth = slider.clientWidth;
      const currentIndex = Math.round(scrollLeft / slideWidth);

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
      });
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const slideWidth = slider.clientWidth;
        slider.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
        pauseAndResetAutoplay();
      });
    });

    if (btnLeft && btnRight) {
      btnLeft.addEventListener('click', () => {
        slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
        pauseAndResetAutoplay();
      });
      
      btnRight.addEventListener('click', () => {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
        }
        pauseAndResetAutoplay();
      });
    }

    // --- INICIALIZAÇÃO ---
    startAutoplay();
    
    // Pausa se o mouse estiver sobre o banner inteiro
    wrapper.addEventListener('mouseenter', stopAutoplay);
    // Retoma quando tira o mouse
    wrapper.addEventListener('mouseleave', () => {
      if (!isDown) { // Garante que não retoma se ainda estiver arrastando
        pauseAndResetAutoplay();
      }
    });
    
    // Suporte a toque no celular para pausar também
    wrapper.addEventListener('touchstart', stopAutoplay, {passive: true});
    wrapper.addEventListener('touchend', pauseAndResetAutoplay, {passive: true});
  });
});