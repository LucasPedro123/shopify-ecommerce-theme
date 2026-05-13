/**
 * Tailwind CSS — HDM Beauty Design System v1
 *
 * Estratégia de tokens (decidida no Sprint 0):
 *  - Brand identity (purple + gold + neutrals) é HARD-CODED aqui. Esta é a
 *    fonte de verdade da marca; não deve ser editável por color scheme do
 *    Shopify admin (consistência > flexibilidade nesse ponto).
 *  - Tokens semânticos (background, foreground, border, heading) continuam
 *    mapeados pra `--color-*` que o tema emite via theme-styles-variables
 *    e color-schemes — assim cada section pode ter sua "color scheme"
 *    (header dark, cards light etc) e o Tailwind respeita.
 *  - Fonte única: Inter (4 pesos: 400/500/600/700). Outras famílias removidas.
 *  - Spacing: 4pt grid. Radius: inclui pill (botões CTA são pill).
 *  - Prefixo `tw-` para conviver com base.css legado.
 *  - Preflight OFF (não atropela reset do Dawn/base.css).
 *
 * Build: npm run build:css  →  assets/tailwind.css
 */

const containerQueries = require('@tailwindcss/container-queries');
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');

const rgbVar = (name) => `rgb(var(${name}) / <alpha-value>)`;
const cssVar = (name) => `var(${name})`;

/* ============================================================ *
 * BRAND PALETTE — fonte única de verdade
 * Decidida com base nos hexes fornecidos pelo cliente:
 *   âncoras: 50=#F4F3FF, 200=#E2E0FF, 300=#B5AFFF,
 *            500=#766CFF, 600=#7C79E7
 *   stops restantes derivados por curva HSL (matiz ~246°).
 * ============================================================ */
const brand = {
  50:  '#F4F3FF',
  100: '#EAE7FF',
  200: '#E2E0FF',
  300: '#B5AFFF',
  400: '#948CFF',
  500: '#766CFF', // CTA primário, ícones brand
  600: '#7C79E7', // hover/active do primário
  700: '#5A52CC',
  800: '#3F389E',
  900: '#262170',
};

/* Gold: usado em "-50%" badge e detalhes promocionais.
   Âncora fornecida = #EECF76. Escala curta — uso pontual. */
const gold = {
  50:  '#FDF8E8',
  100: '#FBEDC1',
  200: '#F7E19A',
  300: '#EECF76', // âncora — badge de desconto
  500: '#D4A93D',
  700: '#8B6E1F',
  900: '#4A3B0F',
};

/* Neutrals (ink) — escala derivada do Zinc, ajustada para a marca. */
const ink = {
  0:   '#FFFFFF',
  50:  '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
  ink: '#000000',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  corePlugins: { preflight: false },

  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './blocks/**/*.liquid',
    './templates/**/*.liquid',
    './templates/**/*.json',
    './assets/**/*.js',
  ],

  theme: {
    // Mobile-first, alinhado ao breakpoint legado do Dawn (lg=990).
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '990px',
      xl: '1200px',
      '2xl': '1440px',
    },

    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#ffffff',
      black: '#000000',

      // --- Brand (hard-coded) ---
      brand,
      primary: brand[500], // alias direto (tw-bg-primary)
      'primary-hover': brand[600],

      // --- Gold accent ---
      gold,

      // --- Neutrals (ink) ---
      ink,

      // --- Semantic (mapeadas via CSS vars do tema) ---
      // Permite que color schemes do Shopify admin alterem
      // o esquema visual por section.
      background: rgbVar('--color-background-rgb'),
      foreground: rgbVar('--color-foreground-rgb'),
      heading: rgbVar('--color-foreground-heading-rgb'),
      border: rgbVar('--color-border-rgb'),
      shadow: rgbVar('--color-shadow-rgb'),

      // --- Estado ---
      success: '#16A34A',
      warning: '#F59E0B',
      error:   '#DC2626',
      sale:    gold[300], // visual de "-50%" usa gold, não vermelho
      'rating-star': '#FACC15',
    },

    spacing: {
      px: '1px',
      0: '0',
      // 4pt grid (token-based)
      '3xs': '2px',   // 0.125rem
      '2xs': '4px',   // 0.25rem
      xs:    '8px',   // 0.5rem
      sm:    '12px',  // 0.75rem
      md:    '16px',  // 1rem
      lg:    '24px',  // 1.5rem
      xl:    '32px',  // 2rem
      '2xl': '48px',  // 3rem
      '3xl': '64px',  // 4rem
      '4xl': '96px',  // 6rem
      // Escala numérica (escape hatch — mesmo Tailwind default)
      1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
      5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem',
      12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem',
      32: '8rem', 40: '10rem', 48: '12rem', 64: '16rem',
    },

    borderRadius: {
      none: '0',
      sm:   '4px',
      DEFAULT: '8px',
      md:   '8px',
      lg:   '12px',
      xl:   '16px',
      '2xl': '20px',
      '3xl': '24px',
      card: '16px',    // product card, banner card
      input: '8px',
      pill: '9999px',  // botão CTA primário
      full: '9999px',
    },

    fontFamily: {
      // Inter como única família, 4 pesos
      sans: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Inter', 'system-ui', 'sans-serif'],
      subheading: ['Inter', 'system-ui', 'sans-serif'],
      accent: ['Inter', 'system-ui', 'sans-serif'],
    },

    fontSize: {
      // Escala estática (não mais via --font-size-* do schema).
      // Type scale derivada do screenshot: caption 11, sm 14, base 16,
      // h3 20, h2 32, h1 48.
      '3xs': ['0.625rem', { lineHeight: '1' }],      // 10px
      '2xs': ['0.6875rem', { lineHeight: '1.2' }],   // 11px caption
      xs:   ['0.75rem',  { lineHeight: '1.4' }],     // 12px
      sm:   ['0.875rem', { lineHeight: '1.5' }],     // 14px body sm
      base: ['1rem',     { lineHeight: '1.55' }],    // 16px body
      lg:   ['1.125rem', { lineHeight: '1.5' }],     // 18px
      xl:   ['1.25rem',  { lineHeight: '1.4' }],     // 20px h3
      '2xl':['1.5rem',   { lineHeight: '1.3' }],     // 24px
      '3xl':['2rem',     { lineHeight: '1.15' }],    // 32px h2
      '4xl':['2.5rem',   { lineHeight: '1.1' }],     // 40px
      '5xl':['3rem',     { lineHeight: '1.05' }],    // 48px h1
      '6xl':['3.75rem',  { lineHeight: '1' }],       // 60px display
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    letterSpacing: {
      tighter: '-0.025em',
      tight:   '-0.0125em',
      normal:  '0',
      wide:    '0.025em',
      wider:   '0.05em',   // category eyebrow
      widest:  '0.1em',    // CAPTION upper
    },

    zIndex: {
      base: '0',
      raised: '10',
      sticky: '20',
      header: '30',
      drawer: '40',
      overlay: '50',
      modal: '60',
      toast: '70',
      auto: 'auto',
    },

    extend: {
      maxWidth: {
        body: '1280px',          // padrão de section
        wide: '1440px',
        narrow: '960px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(118,108,255,0.12), 0 2px 4px rgba(0,0,0,0.06)',
        focus: '0 0 0 3px rgba(118,108,255,0.35)',
      },
      aspectRatio: {
        product: '1 / 1',
        banner: '16 / 9',
        'banner-wide': '21 / 9',
        story: '9 / 16',
      },
      transitionTimingFunction: {
        'brand-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'brand-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '250ms',
        slow: '400ms',
      },
    },
  },

  plugins: [
    containerQueries,
    forms({ strategy: 'class' }),
    typography,
  ],
};
