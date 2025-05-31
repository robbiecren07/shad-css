# Shad-CSS CLI

A CLI tool for converting Shadcn/ui components to CSS modules.

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

- `src/data/` - Static JSON data files
- `src/components/` - Pre-converted CSS module components
- `src/scripts/` - Development/maintenance scripts
- `src/commands/` - CLI command implementations
- `src/utils/` - Utility functions
