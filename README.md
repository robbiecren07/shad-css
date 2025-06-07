# shad-css

A toolset that enables developers to use [Shadcn/ui](https://ui.shadcn.com/) components in their projects without Tailwind CSS.

## About

This project is not affiliated with or endorsed by Shadcn/ui. We are simply providing a tool to help developers who want to use Shadcn/ui's excellent components but cannot or do not want to use Tailwind CSS in their projects.

The component designs and implementations are sourced from Shadcn/ui and Radix UI. This project converts these components to use CSS Modules instead of inline Tailwind CSS classes, while preserving their original functionality and design patterns.

### Note

**As of right now the converter and CLI are setup to only support shadcn@2.3.0 and tailwindcss v3.**

The conversion process currently preserves Tailwind’s `--tw-*` custom properties to ensure accurate styles and animations.
We plan to offer an option to remove Tailwind variables in a future release.

These variables are MIT-licensed and come from [Tailwind CSS](https://tailwindcss.com/).

## Packages

- **converter** - Internal tool used by maintainers to convert Shadcn/ui components to CSS Modules format
- **cli** - Command-line interface for end-users to integrate converted components into their projects
- **webapp** - [TBD] Web interface for component conversion and management

## Target Audience

- **End-users** (developers): Use the CLI to add converted components to their projects
- **Maintainers**: Use the converter to keep the component library up-to-date with Shadcn/ui changes

## Development Workflow

1. **For Maintainers (Component Updates)**
   - Run `npm run dev:fetch` to fetch the latest components from Shadcn/ui
   - Run `npm run dev:convert` to convert the components to CSS Modules
   - Commit the changes to the repository

2. **For End-users (Using Components)**
   - Install the CLI globally: `npm install -g .`
   - Initialize a project: `shad-css init`
   - Add components: `shad-css add button`

## Packages

- **converter** - Core conversion logic that transforms Shadcn/ui components from inline Tailwind CSS to CSS Modules format
- **cli** - Command-line interface for using the converter
- **webapp** - [TBD] Web interface for component conversion and management

## Development Workflow

1. **Update Components**
   - Run `npm run dev:fetch` to fetch the latest components from Shadcn/ui
   - Run `npm run dev:convert` to convert the components to CSS modules
   - Commit the changes to the repository

2. **Using the CLI**
   - Install the CLI globally: `npm install -g .`
   - Initialize a project: `shad-css init`
   - Add components: `shad-css add button`

## Project Structure

```
shad-css/
├── packages/
│   ├── converter/           # Core conversion logic
│   │   ├── data/           # Original Shadcn component JSON files
│   │   ├── components/     # Converted component files
│   │   └── src/            # Conversion logic
│   ├── cli/                # Command-line interface
│   └── webapp/             # Web interface (TBD)
└── package.json
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the packages:
```bash
npm run build
```
