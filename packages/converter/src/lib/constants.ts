export const basicHtmlTags = new Set([
  'div',
  'p',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'img',
  'ul',
  'ol',
  'li',
  'button',
  'input',
  'textarea',
  'form',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'main',
  'aside',
])

// These are class names that should not be used in the tailwindToCss converter
export const FORBIDDEN_CLASS_NAMES = [
  'peer',
  'group',
  'peer-disabled',
  'group-disabled',
  'variant',
  'size',
  'buttonVariants',
  'buttonBase',
  'buttonOutline',
  'buttonDestructive',
  // add any other cva/prop names or keys you discover, or automate by regex if needed
]

// These are Tailwind CSS default variables that are used in cleanTailwindVars.ts
export const TAILWIND_DEFAULT_VARS: Record<string, string> = {
  '--tw-border-spacing-x': '0',
  '--tw-border-spacing-y': '0',
  '--tw-translate-x': '0',
  '--tw-translate-y': '0',
  '--tw-rotate': '0',
  '--tw-skew-x': '0',
  '--tw-skew-y': '0',
  '--tw-scale-x': '1',
  '--tw-scale-y': '1',
  '--tw-pan-x': '',
  '--tw-pan-y': '',
  '--tw-pinch-zoom': '',
  '--tw-scroll-snap-strictness': 'proximity',
  '--tw-gradient-from-position': '',
  '--tw-gradient-via-position': '',
  '--tw-gradient-to-position': '',
  '--tw-ordinal': '',
  '--tw-slashed-zero': '',
  '--tw-numeric-figure': '',
  '--tw-numeric-spacing': '',
  '--tw-numeric-fraction': '',
  '--tw-ring-inset': '',
  '--tw-ring-offset-width': '0px',
  '--tw-ring-offset-color': '#fff',
  '--tw-ring-color': 'rgb(59 130 246 / 0.5)',
  '--tw-ring-offset-shadow': '0 0 #0000',
  '--tw-ring-shadow': '0 0 #0000',
  '--tw-shadow': '0 0 #0000',
  '--tw-shadow-colored': '0 0 #0000',
  '--tw-blur': '',
  '--tw-brightness': '',
  '--tw-contrast': '',
  '--tw-grayscale': '',
  '--tw-hue-rotate': '',
  '--tw-invert': '',
  '--tw-saturate': '',
  '--tw-sepia': '',
  '--tw-drop-shadow': '',
  '--tw-backdrop-blur': '',
  '--tw-backdrop-brightness': '',
  '--tw-backdrop-contrast': '',
  '--tw-backdrop-grayscale': '',
  '--tw-backdrop-hue-rotate': '',
  '--tw-backdrop-invert': '',
  '--tw-backdrop-opacity': '',
  '--tw-backdrop-saturate': '',
  '--tw-backdrop-sepia': '',
  '--tw-contain-size': '',
  '--tw-contain-layout': '',
  '--tw-contain-paint': '',
  '--tw-contain-style': '',
}

// these are shadcn components that do not have a direct Tailwind CSS equivalent
export const EXCLUDE_STYLESHEET_INJECTION = ['aspect-ratio', 'collapsible']

// these components need the button.module.css style sheet
export const NEEDS_BUTTON_STYLES = ['alert-dialog']

// these components need the toggle-group.module.css style sheet
export const NEEDS_TOGGLE_STYLES = ['toggle-group']

// these components are not supported by the converter, they are manually converted
export const EXCLUDE_COMPONENTS_FROM_CONVERTER = [
  'calendar',
  'carousel',
  'chart',
  'sonner',
  'select',
]
