import type { Root, AtRule } from 'postcss'

// This plugin moves all keyframes at-rules to the bottom of the CSS file.
// It ensures that keyframes are defined after all other styles, which is a common best practice
// in CSS to avoid issues with specificity and overrides.
export const moveKeyframesToBottomPlugin = (root: Root) => {
  const keyframes: AtRule[] = []
  root.walkAtRules((atRule) => {
    if (atRule.name === 'keyframes' || atRule.name === '-webkit-keyframes') {
      keyframes.push(atRule)
    }
  })
  keyframes.forEach((kf) => kf.remove())
  keyframes.forEach((kf) => root.append(kf))
}
moveKeyframesToBottomPlugin.postcssPlugin = 'move-keyframes-to-bottom'
