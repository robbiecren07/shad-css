/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate'

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,js,ts,tsx,jsx}', './packages/converter/src/**/*.{ts,tsx}'],
  plugins: [
    animate,
    function ({ addUtilities }) {
      addUtilities({
        '.origin-top-center': {
          'transform-origin': 'top center',
        },
      })
    },
  ],
  safelist: [
    'max-h-[--radix-context-menu-content-available-height]',
    'origin-[--radix-context-menu-content-transform-origin]',
    'origin-[--radix-hover-card-content-transform-origin]',
    'origin-[--radix-menubar-content-transform-origin]',
    'origin-[--radix-menubar-content-transform-origin]',
    'origin-[--radix-popover-content-transform-origin]',
    'origin-[--radix-select-content-transform-origin]',
    'max-h-[--radix-select-content-available-height]',
    'h-[var(--radix-select-trigger-height)]',
    'min-w-[var(--radix-select-trigger-width)]',
    'origin-[--radix-tooltip-content-transform-origin]',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'caret-blink': {
          '0%, 70%, 100%': {
            opacity: '1',
          },
          '20%, 50%': {
            opacity: '0',
          },
        },

        // tailwindcss-animate animations
        enter: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        exit: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        'fade-in-0': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out-0': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'zoom-in-95': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'zoom-out-95': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        'slide-in-from-top-2': {
          '0%': { transform: 'translateY(-0.5rem)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom-2': {
          '0%': { transform: 'translateY(0.5rem)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left-2': {
          '0%': { transform: 'translateX(-0.5rem)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right-2': {
          '0%': { transform: 'translateX(0.5rem)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        in: 'enter 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        out: 'exit 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-0': 'fade-in-0 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-out-0': 'fade-out-0 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        'zoom-in-95': 'zoom-in-95 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        'zoom-out-95': 'zoom-out-95 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-from-top-2': 'slide-in-from-top-2 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-from-bottom-2': 'slide-in-from-bottom-2 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-from-left-2': 'slide-in-from-left-2 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-from-right-2': 'slide-in-from-right-2 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
}
