# shad-css Converter

The shad-css converter is a utility package that converts Shadcn UI components from inline Tailwind CSS to CSS Modules format. This tool helps migrate components to a more maintainable and performant CSS architecture while preserving all styling functionality.

## Features

- Converts inline Tailwind CSS classes to CSS Modules
- Preserves component structure and functionality
- Handles complex className expressions including:
  - String literals
  - Dynamic class expressions
  - Array literals
  - Conditional expressions
  - Class utility functions (e.g., cn())
- Cleans up Tailwind CSS variables and custom properties
- Generates properly formatted and linted output

## Usage

### Convert a Component

```bash
# Convert a single component to CSS Modules
npm run convert ComponentName default

# Example: Convert Button component
npm run convert Button default
```

### Sync Components

```bash
# Sync all components to CLI data directory
npm run sync:components default
```

### Sync Themes

```bash
# Sync theme data to CLI
npm run sync:themes
```

## How it Works

1. **Component Conversion**
   - Extracts all className expressions from the component
   - Generates CSS module styles for each class
   - Replaces inline classes with CSS module references
   - Cleans up Tailwind CSS variables
   - Formats and lints the output

2. **Theme Management**
   - Synchronizes theme data between directories
   - Handles theme variations (default, new-york, etc.)
   - Preserves theme-specific styling

## File Structure

```
packages/converter/
├── data/                        # Original Shadcn component JSON files
│   ├── components/              # Component definition files
│   └── themes/                  # Theme definition files
├── components/                  # Converted component files
│   ├── Button/                  # Example component directory
│   │   ├── index.tsx            # Converted TSX component
│   │   └── Button.module.css    # CSS Module file
│   │   └── Button.json          # Component definition file
│   └── ...                      # Other converted components
├── src/
│   ├── index.ts                 # Main conversion entry point
│   ├── syncComponents.ts        # Component synchronization
│   ├── syncThemes.ts            # Theme synchronization
│   └── utils/
│       ├── convertComponent.ts  # Core conversion logic
│       ├── findClassNameExpressions.ts # Class name extraction
│       ├── extractClassNamesFromExpression.ts # Expression handling
│       ├── tailwindToCss.ts     # Tailwind CSS processing
│       ├── transforms/          # AST transformations
│       │   └── transformClassExpression.ts
│       └── helpers/             # Utility functions
│           ├── formatClassName.ts
│           ├── normalizePostCssOutput.ts
│           └── removeForbiddenApplyUtils.ts
└── package.json
```

### Directory Roles

- `data/`: Contains the original Shadcn component and theme JSON files
- `components/`: Contains converted component files (for testing/validation)
  - `.tsx`: Converted TypeScript React component
  - `.css`: CSS Module file
  - `.json`: Component definition file (synced to CLI)
- `src/`: Contains the conversion logic and utilities

Note: While the converter generates three files per component (.tsx, .css, and .json), only the JSON files are synced to the CLI. The TypeScript and CSS files are used for testing and validation purposes only.

## Development

To work on the converter package:

```bash
# Install dependencies
npm install

# Build the package
npm run build
```
