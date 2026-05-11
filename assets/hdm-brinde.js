(function() {
  // Seus IDs mapeados corretamente
  const variantX = 42746340868167; // Tônico (Produto Pago)
  const variantY = 42611001491527; // Esmalte (Brinde)

  let isProcessing = false;

  // Função principal que faz a checagem
  function checkAndApplyBrinde() {
    if (isProcessing) return;
    isProcessing = true;

    // Colocamos o Date.now() no final para o navegador não usar cache antigo
    fetch('/cart.js?v=' + Date.now())
      .then(response => response.json())
      .then(cart => {
        let hasX = false;
        let hasY = false;
        let keyY = null;

        // Varre o carrinho
        cart.items.forEach(item => {
          if (item.variant_id === variantX) hasX = true;
          if (item.variant_id === variantY) {
            hasY = true;
            keyY = item.key;
          }
        });

        // CENÁRIO A: Comprou X e não tem Y -> Adiciona Brinde
        if (hasX && !hasY) {
          fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ id: variantY, quantity: 1 }] })
          })
          .then(() => {
            // Força o reload para o brinde aparecer na sacola lateral imediatamente
            window.location.reload(); 
          })
          .catch(err => console.error('Erro ao adicionar brinde:', err))
          .finally(() => { isProcessing = false; });
        } 
        
        // CENÁRIO B: Removeu X, mas o brinde ficou -> Remove Brinde
        else if (!hasX && hasY) {
          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: keyY, quantity: 0 })
          })
          .then(() => {
            window.location.reload();
          })
          .catch(err => console.error('Erro ao remover brinde:', err))
          .finally(() => { isProcessing = false; });
        } 
        
        // CENÁRIO C: Tudo certo, não faz nada
        else {
          isProcessing = false;
        }
      })
      .catch(() => { isProcessing = false; });
  }

  // 1. Roda a verificação assim que a página carrega pela primeira vez
  document.addEventListener('DOMContentLoaded', checkAndApplyBrinde);

  // 2. O "Pulo do Gato": Fica vigiando o AJAX do Tema
  // Se o cliente clicar em comprar e abrir a sacola lateral, o script intercepta.
  const originalFetch = window.fetch;
  window.fetch = function() {
    return originalFetch.apply(this, arguments).then(response => {
      const url = arguments[0];
      // Se a requisição foi para adicionar, alterar ou atualizar o carrinho...
      if (typeof url === 'string' && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/update'))) {
        // Espera meio segundo para o tema processar a ação dele, e então roda a nossa checagem
        setTimeout(checkAndApplyBrinde, 500);
      }
      return response;
    });
  };

})();