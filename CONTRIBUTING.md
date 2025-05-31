# Contributing to shad-css

First of all, thank you for considering contributing to shad-css! Your contributions help make this project better.

## How to Contribute

### Reporting Issues

1. Check if the issue has already been reported
2. Create a new issue with:
   - A clear and descriptive title
   - A detailed description of the problem
   - Steps to reproduce the issue (if applicable)
   - Your operating system and Node.js version

### Submitting Changes

1. Fork the repository
2. Create a descriptive feature branch (e.g., `fix/component-conversion`)
3. Make your changes
4. Add tests if applicable
5. Update documentation if needed
6. Commit your changes following our commit message conventions
7. Push to your fork
8. Create a Pull Request

## Commit Message Conventions

We follow a structured commit message format to help maintain a clear changelog. Please use the following format:

```
<type>(<scope>): <description>
```

Where:
- `<type>` is one of: `feat`, `fix`, `refactor`, `docs`, `build`, `test`, `ci`, or `chore`
- `<scope>` is the affected package or component (e.g., `converter`, `cli`, `webapp`, or specific component name)
- `<description>` is a concise description of the change

Example commit messages:
- `feat(converter): add support for new component type`
- `fix(cli): resolve component installation issue`
- `docs(readme): update contributing guidelines`
- `refactor(utils): improve class name extraction`

### Commit Message Types

- `feat`: New features or functionality
- `fix`: Bug fixes
- `refactor`: Code changes that neither fix a bug nor add a feature
- `docs`: Documentation changes
- `build`: Changes that affect the build system or external dependencies
- `test`: Adding missing tests or correcting existing tests
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Branch Naming

Please use lowercase, hyphen-separated branch names that clearly indicate the purpose of the changes. For example:
- `feat/converter-new-component`
- `fix/cli-component-install`
- `docs/update-readme`
- `refactor/utils-class-names`

### Pull Request Guidelines

- PRs should be focused and address a single issue
- Include tests if you're adding new functionality
- Update documentation if needed
- Follow the existing code style
- Ensure all tests pass

## Development Setup

1. Fork the repository on GitHub
   - Click the "Fork" button in the top-right corner of the repository page
   - Choose where to fork the repository (your GitHub account)

2. Clone your fork to your local machine:
```bash
# Replace YOUR-USERNAME with your GitHub username
gh repo clone YOUR-USERNAME/shad-css
```

3. Set up the upstream repository:
```bash
cd shad-css
gh repo set-upstream shad-css/shad-css
```

4. Install dependencies:
```bash
npm install
```

5. Build the packages:
```bash
npm run build
```

6. Run tests:
```bash
npm test
```

## Maintainer Workflow

For maintainers working on component updates:

1. Fetch latest components:
```bash
npm run dev:fetch
```

2. Convert components:
```bash
npm run dev:convert
```

3. Review changes
4. Commit and push updates

## Code Style

- Follow TypeScript best practices
- Use consistent naming conventions
- Keep functions small and focused
- Write clear and concise comments
- Include JSDoc documentation for public APIs
