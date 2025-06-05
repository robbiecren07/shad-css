## Notes

- Currently components with identical root Tailwind classes are deduped to a single CSS module key.
 - if this becomes an issue we can solve at a later time.

- Currently the converter will skip adding Tailwind class names like `peer` or `group` in `convertComponent.ts` on step 3,
which is `const safeClassName = removeForbiddenApplyUtils(className)`. We get an error in `tailwindToCss.ts` when using `postcss`,
it does not like that we add those tailwind classes to `@apply` since its a custom tailwind css/class name.


### Components to address

- alert               # ⚠️ fixed with `findCvaExpressions()` but needs testing
- badge               # ⚠️ fixed with `findCvaExpressions()` but needs testing
- button              # ⚠️ fixed with `findCvaExpressions()` but needs testing
- calendar            # ⚠️ manually converted
- carousel            # ⚠️ manually converted
- chart               # ⚠️ manually converted
- label               # ⚠️ fixed with `findCvaExpressions()` but needs testing
- nevigation-menu     # ⚠️ fixed with `findCvaExpressions()` - but missing group styles
- pagination          # ⚠️ no issues should be fixed
- select              # ⚠️ manually converted
- sonner              # ⚠️ manually converted
- toggle-group        # ⚠️ fixed with `findCvaExpressions()` but needs testing


## Testing

All components and styles need to be tested. This will happen once the CLI is built.