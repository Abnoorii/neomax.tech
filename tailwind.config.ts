import type { Config } from 'tailwindcss'

/**
 * NEOMAX design system.
 * Two token families live here side by side:
 *  - `neomax` marketing tokens (raw hex, driven by the palette in app/globals.css)
 *  - the pre-existing shadcn `hsl(var(--*))` tokens used by the internal payroll app
 * Both are kept so the marketing site and the internal app can share one build.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-manrope)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        dari: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        // ---- NEOMAX brand surfaces -------------------------------------
        ink: '#080B12',
        navy: '#11182A',
        surface: {
          dark: '#151D31',
          // second dark step: gives dark-mode cards real separation from `dark`
          raised: '#1C2740',
        },
        'off-white': '#F5F6F8',
        'soft-gray': '#E7E9EE',

        // ---- Text -------------------------------------------------------
        // `slate` is the brief value; verified 4.78:1 on white but only 4.42:1
        // on off-white, so body copy uses `slate-strong` (6.29:1) instead.
        slate: {
          DEFAULT: '#697386',
          strong: '#55607A',
        },
        // muted text for dark surfaces (6.78:1 on #151D31)
        'muted-dark': '#9AA5BC',

        // ---- Accents ----------------------------------------------------
        violet: {
          200: '#C9BAFF',
          300: '#B5A2FF',
          400: '#9C85FF',
          500: '#7657FF', // primary action
          600: '#5B3EE0', // 6.54:1 on white — links on light surfaces
          700: '#4A31BC',
        },
        lime: {
          // brand lime: dark-surface labels/status only (12.73:1 on #151D31)
          DEFAULT: '#B7F34A',
          // validated chart step — passes the categorical checks in BOTH modes
          chart: '#729620',
        },
        success: {
          DEFAULT: '#41D69D',
          strong: '#1E8F66',
        },
        danger: {
          // dark surfaces only (5.62:1 on #151D31); fails on white at 2.99:1
          DEFAULT: '#FF5D6C',
          strong: '#D92D3D',
        },

        // ---- shadcn tokens (internal payroll app) -----------------------
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
      },
      fontSize: {
        // Editorial scale. Every step is clamp()-driven so mobile stays scannable.
        'display-xl': ['clamp(2.75rem, 1.55rem + 4.8vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg': ['clamp(2.125rem, 1.5rem + 2.6vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-md': ['clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.025em', fontWeight: '700' }],
        'heading': ['clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'subheading': ['1.0625rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)', { lineHeight: '1.65' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        'label': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.14em', fontWeight: '500' }],
        'metric': ['clamp(1.875rem, 1.4rem + 2vw, 3rem)', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'metric-sm': ['clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      maxWidth: {
        container: '1280px',
        // 55–75 character measure for long-form reading
        measure: '68ch',
        'measure-sm': '58ch',
      },
      spacing: {
        edge: 'clamp(1.25rem, 0.7rem + 2.2vw, 2.5rem)',
        section: 'clamp(4.5rem, 2.8rem + 6vw, 8.5rem)',
        'section-sm': 'clamp(3rem, 2rem + 3.5vw, 5rem)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionTimingFunction: {
        // expo-out: fast departure, soft settle. No overshoot, no bounce.
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        fast: '180ms',
        base: '260ms',
        slow: '420ms',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-dot': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
      },
      animation: {
        'accordion-down': 'accordion-down 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        'accordion-up': 'accordion-up 200ms cubic-bezier(0.4, 0, 1, 1)',
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
