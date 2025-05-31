import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import postcssNested from 'postcss-nested'
import { cleanTailwindVars } from './cleanTailwindVars'
import { normalizePostCssOutput } from './helpers'

/**
 * This function processes the input CSS using Tailwind CSS and PostCSS to generate
 * a valid CSS output. It applies Tailwind's utility classes, handles nested rules,
 * and cleans up any Tailwind-specific variables.
 *
 * @param cssInput - A string containing the CSS input that may include Tailwind CSS classes.
 * @returns A Promise that resolves to a string containing the processed CSS output.
 */
export async function tailwindToCss(cssInput: string): Promise<string> {
  const result = await postcss([
    tailwindcss({
      config: './tailwind.config.js',
      corePlugins: {
        preflight: false,
      },
    }),
    postcssNested,
  ]).process(cssInput, { from: undefined })

  // Clean up Tailwind's --tw-* vars and var(...) usage
  const cleanedCss = await cleanTailwindVars(result.css)

  // Normalize formatting before Prettier
  const compactCss = normalizePostCssOutput(cleanedCss)

  return compactCss
}
