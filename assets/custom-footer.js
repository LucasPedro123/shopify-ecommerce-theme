document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.js-footer-accordion');

  const handleFooterAccordions = () => {
    const isDesktop = window.innerWidth >= 750;

    accordions.forEach(acc => {
      if (isDesktop) {
        acc.setAttribute('open', '');
      } else {
        acc.removeAttribute('open');
      }
    });
  };

  handleFooterAccordions();

  window.addEventListener('resize', handleFooterAccordions);
});