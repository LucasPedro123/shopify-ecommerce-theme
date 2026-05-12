# Tailwind CSS — Guia de uso (HDM Beauty Shopify Theme)

Este tema usa **Tailwind CSS** convivendo lado a lado com o CSS legado (`base.css`).
Tailwind é compilado **localmente** via CLI e o output (`assets/tailwind.css`) é
commitado no repositório para que o Shopify possa servir o arquivo.

---

## TL;DR

```bash
npm install              # uma vez, ao clonar o repo
npm run build:css        # build de produção (minificado)
npm run watch:css        # rebuild automático durante o desenvolvimento
```

Depois rode o Shopify CLI normalmente:

```bash
shopify theme dev
```

---

## Como funciona

1. **Input:** `src/tailwind.css` — diretivas `@tailwind base/components/utilities` +
   primitives de componentes do projeto.
2. **Config:** `tailwind.config.js` mapeia o utilitário Tailwind para as
   variáveis CSS já geradas pelo tema (`theme-styles-variables.liquid` e
   `color-schemes.liquid`). Toda configuração feita no admin Shopify
   (cores, fontes, raios, espaçamentos) propaga automaticamente para o
   Tailwind, sem nova compilação.
3. **Output:** `assets/tailwind.css` — minificado, servido pelo
   `{{ 'tailwind.css' | asset_url | stylesheet_tag }}` em
   `snippets/stylesheets.liquid`, **depois** de `base.css`.

### Convivência com o CSS legado

Para **evitar conflitos** com Dawn/base.css, todas as classes Tailwind têm
prefixo `tw-`. Exemplos:

```html
<!-- Tailwind -->
<div class="tw-flex tw-items-center tw-gap-md tw-text-primary">

<!-- Legado -->
<div class="page-width section">
```

`preflight` (reset do Tailwind) está **desativado** no `tailwind.config.js`
para não atropelar o reset tipográfico já existente. Quando 100% do tema
estiver migrado para Tailwind, reabilite `corePlugins.preflight = true`.

---

## Design Tokens

Os tokens estão mapeados em `tailwind.config.js` apontando para variáveis CSS
geradas pelo Shopify a partir de `config/settings_schema.json`. Isto significa
que:

- Alterar uma cor no admin → recompila color-schemes via Liquid →
  utilidades como `tw-bg-primary` e `tw-text-primary/50` mudam em runtime,
  **sem recompilar o Tailwind**.
- A tabela de tokens disponível inclui:

| Categoria   | Utilities Tailwind                                                                                                                |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Cores       | `background`, `foreground`, `heading`, `primary`, `primary-hover`, `border`, `shadow`                                             |
| Botões      | `btn-primary`, `btn-primary-fg`, `btn-secondary`, `btn-secondary-fg`, e variações `*-hover`, `*-border`                           |
| Inputs      | `input`, `input-fg`, `input-border`, `input-hover`                                                                                |
| Estado      | `success`, `error`, `instock`, `lowstock`, `outofstock`                                                                           |
| Espaçamento | `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` (mapeiam `--gap-*`)                                                      |
| Tipografia  | `font-body`, `font-heading`, `font-subheading`, `font-accent`; `text-{3xs..6xl}`; `leading-{tight,normal,loose}` etc.              |
| Raios       | `rounded-btn`, `rounded-btn-secondary`, `rounded-pill`, `rounded-input`, `rounded-card`, `rounded-product`, `rounded-popover`     |
| Z-index     | `z-base`, `z-sticky`, `z-overlay`, `z-window-overlay` etc.                                                                        |

Alpha-channel funciona via `<alpha-value>` em tokens que têm contraparte
`--*-rgb`. Exemplos: `tw-text-primary/50`, `tw-bg-foreground/10`.

---

## CVA (Class Variance Authority) em Liquid

Como Liquid não tem TypeScript nem objetos, implementamos CVA via snippets
parametrizados com `case/when`. Veja `snippets/ui-button.liquid`:

```liquid
{%- render 'ui-button',
      label: 'Comprar agora',
      variant: 'primary',
      size: 'lg',
      href: product.url,
      full_width: true,
      aria_label: 'Comprar ' | append: product.title -%}
```

Padrões suportados:

- `variant`: `primary` | `secondary` | `outline` | `ghost` | `destructive`
- `size`: `sm` | `md` | `lg` | `icon`
- `full_width`: `true|false`
- `disabled`, `aria_label`, `aria_expanded`, `aria_controls`
- `href` (renderiza `<a>` automaticamente) ou `type` (`button|submit|reset`)
- `icon`, `icon_right` (render de snippets de ícone)

Para criar novos componentes "CVA" siga o mesmo padrão: parâmetros via
`render`, lógica `case/when` em Liquid, classes Tailwind retornadas.

---

## Container Queries

Plugin `@tailwindcss/container-queries` está ativo. Use:

```liquid
<section class="tw-@container/card">
  <article class="tw-grid tw-grid-cols-1 @md/card:tw-grid-cols-2">
    ...
  </article>
</section>
```

Ou as classes utilitárias `tw-container-card` / `tw-container-section` já
declaradas em `src/tailwind.css` (`container-type: inline-size` + nome).

---

## Mobile-First

Os breakpoints estão no config (mobile-first nativo do Tailwind):

| Token  | Min-width |
|--------|-----------|
| `xs`   | 480 px    |
| `sm`   | 640 px    |
| `md`   | 768 px    |
| `lg`   | 990 px    |
| `xl`   | 1200 px   |
| `2xl`  | 1440 px   |

Padrão: escreva o estilo mobile primeiro e use `lg:` / `xl:` para escalar.

```html
<h1 class="tw-text-2xl lg:tw-text-4xl xl:tw-text-5xl">…</h1>
```

---

## Imagens (LCP)

Para imagens acima da dobra (banners, primeira imagem do produto, logo),
use o filtro `image_tag` do Shopify — entrega WebP/AVIF automaticamente:

```liquid
{{ image
    | image_url: width: 1600
    | image_tag:
        loading: 'eager',
        fetchpriority: 'high',
        sizes: '100vw',
        widths: '480, 768, 1200, 1600, 2000',
        alt: image.alt | default: product.title
}}
```

Imagens abaixo da dobra: `loading: 'lazy'` e remova `fetchpriority`.

---

## Estrutura de arquivos relevante

```
package.json              ← scripts npm
tailwind.config.js        ← tokens mapeados → CSS vars do tema
src/tailwind.css          ← input (editável, fonte de verdade)
assets/tailwind.css       ← output (gerado por npm run build:css)
snippets/ui-button.liquid ← exemplo CVA-style; copie o padrão para novos
                            componentes (badge, card, alert...)
snippets/stylesheets.liquid ← carrega base.css + tailwind.css (nessa ordem)
```

---

## Troubleshooting

**Tailwind não aplica em uma classe**
- Confira que ela usa o prefixo `tw-`.
- Garante que o caminho do arquivo está no `content[]` do `tailwind.config.js`
  (já cobre `layout/**`, `sections/**`, `snippets/**`, `blocks/**`,
  `templates/**`, `assets/**/*.js`).
- Rebuilda: `npm run build:css`.

**Quebrou layout legado**
- Tailwind respeita o preflight desligado. Se mesmo assim houver conflito,
  bumpe a especificidade do CSS legado ou troque a classe `tw-*` por um
  utilitário arbitrário (`tw-[color:#000]`).

**O `lg:` não funciona em 1024 px**
- O breakpoint `lg` deste config é 990 px (alinhado ao Dawn), não 1024 px.
  Use `xl:` se quiser ≥1200 px ou ajuste em `tailwind.config.js`.
