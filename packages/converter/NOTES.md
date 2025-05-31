## Notes

- Currently components with identical root Tailwind classes are deduped to a single CSS module key.
 - if this becomes an issue we can solve at a later time.


- Components that have no Tailwind classes like `collapsible` are manually removed from the `data/shadcn` folder,
and are not included in the converter.
  - we will need to note this in the CLI if the user tried to download it.
  - on web app we should note this and direct the user to use the normal shadcn CLI command.


- Currently the converter will skip adding Tailwind class names like `peer` or `group` in `convertComponent.ts` on step 2,
which is `const safeClassName = removeForbiddenApplyUtils(className)`. We get an error in `tailwindToCss.ts` when using `postcss`,
it does not like that we add those tailwind classes to `@apply` since its a custom tailwind css/class name.
  - as of right now it only skips it on the component `checkbox` and its not an issue as the styles still match.


- When building the CLI we need to add logic to look for instances like:
`import { Label } from '@/registry/new-york/ui/label';`
`import { Label } from '@/registry/default/ui/label';`
in our converted component's json file and then rework it to be the correct path for the user's component folder.
it will most liekly be `import { Label } from '@/components/ui/label';`. Since we are going to be using component folders,
this should not be an issue placing it in the same `ui` folder as shadcn (if the user currently has shadcn components in their project).