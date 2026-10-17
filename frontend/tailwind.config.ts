import type { Config } from 'tailwindcss';

/**
 * Tokens do design "Academy modern".
 *
 * Paleta quente de inspiração acadêmica: vinho para as ações principais,
 * dourado para destaques e neutros quentes (estilo stone) para superfícies e
 * texto. As famílias de fonte são resolvidas por variáveis CSS definidas em
 * `globals.css`, com pilhas seguras (serif para títulos, sans para o corpo e
 * mono para dados), sem depender de download externo no build.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f3',
          100: '#fbe2e4',
          200: '#f6cacd',
          300: '#efa6ab',
          400: '#e4747d',
          500: '#d44a56',
          600: '#be2f3d',
          700: '#9f2331',
          800: '#85202c',
          900: '#6f1e29',
        },
        accent: {
          50: '#fdf9ec',
          100: '#f9efc9',
          200: '#f3dd8e',
          300: '#ecc553',
          400: '#e5ae2d',
          500: '#d59216',
          600: '#b96f10',
          700: '#955013',
          800: '#7b4016',
          900: '#693614',
        },
        // Neutros quentes: substituem o cinza frio padrão em todo o painel.
        gray: {
          50: '#faf9f7',
          100: '#f4f2ef',
          200: '#e7e4df',
          300: '#d6d1ca',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(28 25 23 / 0.04), 0 10px 30px -18px rgb(28 25 23 / 0.28)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-up': 'slide-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
