export const baseStyles = `

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-feature-settings: normal;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  max-width: 100vw;
}

body {
  font-family: var(--font-body);
  color: var(--foreground);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
}

*,
::before,
::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
  margin: 0;
  padding: 0;
}

* {
  border-color: var(--border);
}

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

menu, ol, ul {
  list-style: none;
}

`
