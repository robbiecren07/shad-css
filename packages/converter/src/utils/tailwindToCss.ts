import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import postcssNested from 'postcss-nested'
import postcssCombineDuplicated from 'postcss-combine-duplicated-selectors'
import postcssDiscardEmpty from 'postcss-discard-empty'
import { moveKeyframesToBottomPlugin } from '@/lib/postcssPlugins'
import { normalizePostCssOutput } from './helpers'

/**
 * Processes Tailwind CSS classes into valid CSS using PostCSS.
 *
 * This function:
 * 1. Applies Tailwind's utility classes using the configured config file
 * 2. Processes nested CSS rules using postcss-nested
 * 3. Cleans up Tailwind-specific variables and formatting
 * 4. Normalizes the output before returning
 *
 * @param cssInput A string containing the CSS input that may include Tailwind CSS classes.
 * @returns A Promise that resolves to a string containing the processed CSS output.
 */
export async function tailwindToCss(cssInput: string): Promise<string> {
  // Process CSS through PostCSS pipeline
  const result = await postcss([
    tailwindcss({
      config: './tailwind.config.js',
      corePlugins: {
        preflight: false,
      },
    }),
    postcssNested,
    postcssCombineDuplicated,
    moveKeyframesToBottomPlugin,
    postcssDiscardEmpty,
  ]).process(cssInput, { from: undefined })

  /**
   * Note: Currently, removing Tailwind-specific variables creates issues with
   * the generated CSS, keyframes, animations, and other utilities.
   *
   * Clean up Tailwind-specific variables
   * - Removes --tw-* custom properties
   * - Replaces var(...) references with actual values
   */
  //const cleanedCss = await cleanTailwindVars(result.css)

  // Normalize CSS formatting
  const compactCss = normalizePostCssOutput(result.css)

  return compactCss
}
