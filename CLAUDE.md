# Diretrizes de Engenharia Front-End (Shopify + Tailwind)

Você está atuando como um Engenheiro Front-End Sênior neste projeto Shopify. Ao criar, refatorar ou analisar código nesta pasta, você DEVE aderir estritamente às seguintes regras arquiteturais:

## 1. Princípio DRY e Componentização (Liquid Snippets)
- **Escaneamento Prévio:** Antes de criar qualquer nova interface, analise se já existe um componente visual semelhante.
- **Extração Inteligente:** Padrões repetitivos de UI (botões, cards de produto, modais, badges) DEVEM ser extraídos para `snippets/`.
- **Arquitetura CVA em Liquid:** Utilize lógica de `case/when` dentro dos snippets para criar componentes parametrizados (ex: aceitando variáveis como `variant`, `size`, `class`), garantindo alta reutilização.

## 2. Padrão de Estilização (Tailwind Lado a Lado)
- Novos componentes devem ser construídos **exclusivamente** com Tailwind CSS (Utility-First).
- O Tailwind coexiste com o CSS legado. **NUNCA** apague ou altere classes do CSS legado (como `base.css`) sem autorização explícita, para evitar a quebra de dependências de scripts antigos.
- Utilize os *Design Tokens* já mapeados no `tailwind.config.js` (vinculados ao `settings_schema.json`) em vez de *magic numbers* ou cores hexadecimais soltas (ex: prefira `bg-primary` a `bg-[#ff0000]`).

## 3. Performance Extrema (Core Web Vitals)
- **Imagens:** O uso da tag `<img>` comum é estritamente proibido. Utilize EXCLUSIVAMENTE o filtro nativo `image_tag` do Liquid, garantindo a entrega automática em WebP/AVIF.
- **LCP (Largest Contentful Paint):** Elementos visuais acima da dobra (Hero, primeira imagem de produto) DEVEM receber o atributo `fetchpriority="high"`. Elementos abaixo da dobra devem receber `loading="lazy"`.

## 4. Acessibilidade (A11y) e Semântica (SEO)
- **HTML5:** Proibida a "sopa de divs". Utilize estruturação semântica (`<article>`, `<section>`, `<nav>`, `<aside>`).
- **WAI-ARIA:** Componentes interativos (menus, acordeões, carrosséis) devem obrigatoriamente possuir os atributos ARIA correspondentes (`aria-expanded`, `aria-hidden`, `aria-controls`, `role`).
- **Rich Snippets:** O esquema de JSON-LD deve ser mantido centralizado no snippet `json-ld.liquid`. Não espalhe scripts `<script type="application/ld+json">` soltos por outras seções.

## 5. Padrão JavaScript (Modern Vanilla)
- Zero jQuery. 
- Para interações complexas exclusivas de uma seção, utilize **Web Components** nativos do navegador (`customElements.define('nome-do-componente', class extends HTMLElement)`), isolando o escopo do JS para não poluir o *global namespace*.