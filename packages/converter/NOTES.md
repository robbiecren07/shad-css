## Notes

- Currently components with identical root Tailwind classes are deduped to a single CSS module key.
 - if this becomes an issue we can solve at a later time.

- Currently the converter will skip adding Tailwind class names like `peer` or `group` in `convertComponent.ts` on step 3,
which is `const safeClassName = removeForbiddenApplyUtils(className)`. We get an error in `tailwindToCss.ts` when using `postcss`,
it does not like that we add those tailwind classes to `@apply` since its a custom tailwind css/class name.


### Components to address

- alert-dialog        # ⚠️ possibly resolved with update in `transformClassExpression()`
- alert               # ⚠️ possibly with `findCvaExpressions()`
- badge               # ⚠️ possibly with `findCvaExpressions()`
- button              # ⚠️ possibly with `findCvaExpressions()`
- calendar            # ❌ needs a custom converter built
- carousel            # ❌ might be able to extend the general converter
- chart               # ❌ might be able to extend the general converter
- label               # ⚠️ possibly with `findCvaExpressions()`
- nevigation-menu     # ⚠️ possibly with `findCvaExpressions()` - but missing group styles
- pagination          # ❌ might be able to extend `findCvaExpressions()` to handle this
- select              # ❌ might be able to extend `findCvaExpressions()` to handle this
- sheet               # ❌ need to extend `findCvaExpressions()` to handle
- sonner              # ❌ needs a custom converter built
- toggle              # ⚠️ possibly with `findCvaExpressions()`
- toggle-group        # ⚠️ possibly with `findCvaExpressions()`


## Testing

All components and styles need to be tested. This will happen once the CLI is built.