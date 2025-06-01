## Notes

- Currently components with identical root Tailwind classes are deduped to a single CSS module key.
 - if this becomes an issue we can solve at a later time.


- Currently the converter will skip adding Tailwind class names like `peer` or `group` in `convertComponent.ts` on step 3,
which is `const safeClassName = removeForbiddenApplyUtils(className)`. We get an error in `tailwindToCss.ts` when using `postcss`,
it does not like that we add those tailwind classes to `@apply` since its a custom tailwind css/class name.


- When building the CLI we need to add logic to look for instances like:
`import { Label } from '@/registry/new-york/ui/label';`
`import { Label } from '@/registry/default/ui/label';`
in our converted component's json file and then rework it to be the correct path for the user's component folder.
it will most liekly be `import { Label } from '@/components/ui/label';`. Since we are going to be using component folders,
this should not be an issue placing it in the same `ui` folder as shadcn (if the user currently has shadcn components in their project).


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
- sonner              # ❌ needs a custom converter built
- toggle              # ⚠️ possibly with `findCvaExpressions()`
- toggle-group        # ⚠️ possibly with `findCvaExpressions()`


## Testing

All components and styles need to be tested. This will happen once the CLI is built.