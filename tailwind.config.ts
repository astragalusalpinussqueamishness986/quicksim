import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          card: 'var(--surface-card)',
          hover: 'var(--surface-hover)',
        },
        content: {
          DEFAULT: 'var(--content)',
          secondary: 'var(--content-secondary)',
          muted: 'var(--content-muted)',
          faint: 'var(--content-faint)',
        },
        line: {
          DEFAULT: 'var(--line)',
          hover: 'var(--line-hover)',
        },
      },
    },
  },
} satisfies Config
