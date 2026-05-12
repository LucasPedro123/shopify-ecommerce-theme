/**
 * Tailwind CSS configuration for HDM Beauty Shopify theme.
 *
 * Strategy:
 *  - The Shopify admin (settings_schema.json + theme-styles-variables.liquid)
 *    is the single source of truth for colors, type scale, spacing and radii.
 *    This config maps Tailwind utilities onto the CSS custom properties the
 *    theme already emits, so editing tokens in the admin instantly reflects
 *    in any Tailwind class used across Liquid templates.
 *  - Colors that expose an `-rgb` companion variable use the `<alpha-value>`
 *    placeholder, enabling utilities like `text-primary/50`. Colors without
 *    `-rgb` fall back to plain `var(--token)`.
 *  - Tailwind ships alongside the existing base.css (NOT replacing it).
 *
 * Build (local):  npm run build:css   →  assets/tailwind.css
 * Watch (dev):    npm run watch:css
 */

const containerQueries = require('@tailwindcss/container-queries');
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');

/** Helper: color from `-rgb` variable, supports Tailwind alpha-value. */
const rgbVar = (name) => `rgb(var(${name}) / <alpha-value>)`;
/** Helper: color from a plain CSS variable (no alpha-value support). */
const cssVar = (name) => `var(${name})`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Avoid clashing with Shopify Dawn / base.css legacy utilities.
  // Every Tailwind class is prefixed with `tw-`. Example: `tw-flex tw-text-primary`.
  // This guarantees Tailwind + base.css coexist without specificity wars.
  prefix: 'tw-',

  // Disable preflight so we don't break Dawn's typography reset.
  // Re-enable later when you fully migrate components to Tailwind.
  corePlugins: {
    preflight: false,
  },

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
    // Mobile-first breakpoints aligned with the legacy theme's media queries.
    // Modify here if Shopify settings_schema introduces a custom page_width
    // beyond `narrow|page-width|full-width`.
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '990px', // Dawn uses 990px as the desktop boundary.
      xl: '1200px',
      '2xl': '1440px',
    },

    // Map Tailwind color names → CSS variables emitted by theme-styles-variables.liquid
    // and color-schemes.liquid. Anything edited in the admin propagates here.
    colors: ({ colors }) => ({
      // Tailwind defaults we still want
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#ffffff',
      black: '#000000',

      // Theme color scheme tokens (alpha-aware via -rgb companions).
      background: rgbVar('--color-background-rgb'),
      foreground: rgbVar('--color-foreground-rgb'),
      heading: rgbVar('--color-foreground-heading-rgb'),
      primary: rgbVar('--color-primary-rgb'),
      'primary-hover': rgbVar('--color-primary-hover-rgb'),
      border: rgbVar('--color-border-rgb'),
      shadow: rgbVar('--color-shadow-rgb'),

      // Button tokens (no -rgb counterparts in schema, use plain var)
      'btn-primary': cssVar('--color-primary-button-background'),
      'btn-primary-fg': cssVar('--color-primary-button-text'),
      'btn-primary-border': cssVar('--color-primary-button-border'),
      'btn-primary-hover': cssVar('--color-primary-button-hover-background'),
      'btn-primary-hover-fg': cssVar('--color-primary-button-hover-text'),
      'btn-secondary': cssVar('--color-secondary-button-background'),
      'btn-secondary-fg': cssVar('--color-secondary-button-text'),
      'btn-secondary-border': cssVar('--color-secondary-button-border'),
      'btn-secondary-hover': cssVar('--color-secondary-button-hover-background'),
      'btn-secondary-hover-fg': cssVar('--color-secondary-button-hover-text'),

      // Form inputs
      input: cssVar('--color-input-background'),
      'input-fg': rgbVar('--color-input-text-rgb'),
      'input-border': cssVar('--color-input-border-color'),
      'input-hover': cssVar('--color-input-hover-background'),

      // Variant pickers / swatches
      variant: cssVar('--color-variant-background-color'),
      'variant-fg': rgbVar('--color-variant-text-rgb'),
      'variant-border': cssVar('--color-variant-border-color'),
      'variant-selected': cssVar('--color-selected-variant-background-color'),
      'variant-selected-fg': cssVar('--color-selected-variant-text-color'),

      // Semantic state colors (theme-styles-variables emits these globally)
      success: cssVar('--color-success'),
      error: cssVar('--color-error'),
      instock: cssVar('--color-instock'),
      lowstock: cssVar('--color-lowstock'),
      outofstock: cssVar('--color-outofstock'),
    }),

    // Map Tailwind spacing scale to theme gap-* variables so paddings/margins
    // stay consistent with the existing design system. The legacy 4px-based
    // numeric scale (px-2, py-4 ...) is preserved via `extend.spacing`.
    spacing: {
      px: '1px',
      0: '0',
      // theme-styles-variables.liquid emits these from the spacing scale settings.
      '3xs': 'var(--gap-3xs)',
      '2xs': 'var(--gap-2xs)',
      xs: 'var(--gap-xs)',
      sm: 'var(--gap-sm)',
      md: 'var(--gap-md)',
      lg: 'var(--gap-lg)',
      xl: 'var(--gap-xl)',
      '2xl': 'var(--gap-2xl)',
      '3xl': 'var(--gap-3xl)',
      // Numeric fallbacks (Tailwind default) — kept so utilities like
      // `tw-p-4` still work for tactical adjustments outside the token system.
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      64: '16rem',
    },

    // Border radius mapped to admin tokens for buttons/cards/inputs/badges.
    borderRadius: {
      none: '0',
      sm: 'var(--border-radius-sm)',
      // Buttons (pills)
      btn: 'calc(var(--button-border-radius-primary, 0) * 1px)',
      'btn-secondary': 'calc(var(--button-border-radius-secondary, 0) * 1px)',
      pill: 'calc(var(--pills-border-radius, 100) * 1px)',
      // Cards / inputs
      input: 'calc(var(--inputs-border-radius, 8) * 1px)',
      card: 'calc(var(--card-corner-radius, 0) * 1px)',
      product: 'calc(var(--product-corner-radius, 0) * 1px)',
      popover: 'calc(var(--popover-border-radius, 8) * 1px)',
      // Standard rem scale (escape hatch)
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },

    fontFamily: {
      // 4 admin-pickable fonts → Tailwind families.
      body: ['var(--font-body--family)', 'system-ui', 'sans-serif'],
      heading: ['var(--font-heading--family)', 'serif'],
      subheading: ['var(--font-subheading--family)', 'sans-serif'],
      accent: ['var(--font-accent--family)', 'serif'],
      sans: ['var(--font-body--family)', 'system-ui', 'sans-serif'],
    },

    fontSize: {
      // Step scale comes straight from theme-styles-variables.
      '3xs': 'var(--font-size--3xs)',
      '2xs': 'var(--font-size--2xs)',
      xs: 'var(--font-size--xs)',
      sm: 'var(--font-size--sm)',
      base: 'var(--font-size--md)',
      md: 'var(--font-size--md)',
      lg: 'var(--font-size--lg)',
      xl: 'var(--font-size--xl)',
      '2xl': 'var(--font-size--2xl)',
      '3xl': 'var(--font-size--3xl)',
      '4xl': 'var(--font-size--4xl)',
      '5xl': 'var(--font-size--5xl)',
      '6xl': 'var(--font-size--6xl)',
    },

    lineHeight: {
      tight: 'var(--line-height--body-tight)',
      normal: 'var(--line-height--body-normal)',
      loose: 'var(--line-height--body-loose)',
      'display-tight': 'var(--line-height--display-tight)',
      'display-normal': 'var(--line-height--display-normal)',
      'display-loose': 'var(--line-height--display-loose)',
      'heading-tight': 'var(--line-height--heading-tight)',
      'heading-normal': 'var(--line-height--heading-normal)',
      'heading-loose': 'var(--line-height--heading-loose)',
    },

    letterSpacing: {
      tight: 'var(--letter-spacing--body-tight)',
      normal: 'var(--letter-spacing--body-normal)',
      loose: 'var(--letter-spacing--body-loose)',
      'heading-tight': 'var(--letter-spacing--heading-tight)',
      'heading-normal': 'var(--letter-spacing--heading-normal)',
      'heading-loose': 'var(--letter-spacing--heading-loose)',
    },

    zIndex: {
      // Layer system already defined in theme-styles-variables.
      base: 'var(--layer-base)',
      flat: 'var(--layer-flat)',
      raised: 'var(--layer-raised)',
      sticky: 'var(--layer-sticky)',
      heightened: 'var(--layer-heightened)',
      'header-menu': 'var(--layer-header-menu)',
      'menu-drawer': 'var(--layer-menu-drawer)',
      overlay: 'var(--layer-overlay)',
      'window-overlay': 'var(--layer-window-overlay)',
      temporary: 'var(--layer-temporary)',
      0: '0',
      10: '10',
      20: '20',
      50: '50',
      auto: 'auto',
    },

    extend: {
      maxWidth: {
        body: 'var(--max-width--body-normal)',
        'body-narrow': 'var(--max-width--body-narrow)',
        heading: 'var(--max-width--heading-normal)',
        'heading-narrow': 'var(--max-width--heading-narrow)',
        display: 'var(--max-width--display-normal)',
        'display-tight': 'var(--max-width--display-tight)',
        'display-narrow': 'var(--max-width--display-narrow)',
      },
      transitionTimingFunction: {
        'theme-out': 'var(--ease-out-quad)',
        'theme-in-out': 'var(--ease-in-out-quad)',
        'theme-bounce': 'var(--animation-timing-bounce)',
      },
      transitionDuration: {
        'theme-fast': 'var(--animation-speed-fast)',
        theme: 'var(--animation-speed)',
        'theme-slow': 'var(--animation-speed-slow)',
      },
      boxShadow: {
        focus: '0 0 0 var(--focus-outline-width) var(--color-foreground)',
      },
    },
  },

  plugins: [
    containerQueries, // Enables @container-based responsive utilities
    forms({ strategy: 'class' }), // form utilities require explicit `form-input` etc.
    typography,
  ],
};
