# Contributing Guidelines

Thank you for your interest in contributing to Nova‑XFinity AI Article Writer! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/finity-ai-seo-article-writer.git
   ```
3. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Test your changes**
6. **Commit and push:**
   ```bash
   git commit -m "Add: Description of changes"
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-user-authentication`
- `fix/fix-draft-saving-bug`
- `docs/update-api-documentation`
- `refactor/modularize-writer-component`

### Commit Messages

Follow conventional commits:

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add image generation to MediaHub

Add support for Gemini 2.5 Flash image generation
with customizable styles and aspect ratios.

Closes #123
```

```
fix: Fix draft autosave not triggering

Draft autosave was not triggering on section updates.
Fixed by updating useEffect dependencies.

Fixes #456
```

## Code Standards

### JavaScript/React

1. **Use ES6+ features**
2. **Follow React best practices**
3. **Use functional components and hooks**
4. **Keep components small (< 100 lines)**
5. **Use meaningful variable names**
6. **Add comments for complex logic**

### Code Style

- Use Prettier for formatting
- Use ESLint for linting
- Follow existing code patterns
- Maintain consistency with codebase

### File Organization

- Follow [Code Organization Guidelines](code-organization.md)
- Keep files focused and small
- Use feature-based structure
- Extract reusable code to `shared/`

## Pull Request Process

### Before Submitting

1. **Test your changes:**
   ```bash
   npm test
   ```

2. **Check formatting:**
   ```bash
   npm run lint
   npm run format
   ```

3. **Update documentation** if needed

4. **Ensure all tests pass**

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, PR will be merged

## Testing Guidelines

### Frontend Tests

Write tests for:
- Components (render, interactions)
- Hooks (state management)
- Utilities (pure functions)
- Services (API calls mocked)

**Example:**
```javascript
// WriterConfig.test.js
import { render, screen } from '@testing-library/react';
import WriterConfig from './WriterConfig';

describe('WriterConfig', () => {
  it('renders configuration form', () => {
    render(<WriterConfig />);
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
  });
});
```

### Backend Tests

Write tests for:
- API endpoints
- Services
- Middleware
- Utilities

## Documentation

### Code Comments

Add comments for:
- Complex algorithms
- Non-obvious logic
- Workarounds for bugs
- TODO items

```javascript
// Calculate word count excluding HTML tags
const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
```

### Documentation Updates

Update documentation when:
- Adding new features
- Changing APIs
- Updating setup procedures
- Modifying architecture

## Feature Requests

When suggesting features:

1. **Check existing issues** first
2. **Create a detailed issue:**
   - Problem description
   - Proposed solution
   - Use cases
   - Alternatives considered

## Bug Reports

When reporting bugs:

1. **Use the bug report template**
2. **Include:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details
   - Screenshots (if applicable)

## Questions?

- Open an issue for questions
- Check existing documentation
- Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Appreciated! 🎉

Thank you for contributing to Nova‑XFinity AI Article Writer!
