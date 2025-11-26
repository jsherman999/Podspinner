# CLAUDE.md - AI Assistant Guide for Podspinner

This document provides comprehensive guidance for AI assistants working on the Podspinner codebase.

## Project Overview

**Podspinner** is a podcast management application.

### Tech Stack
- **Language**: [To be determined - likely TypeScript/JavaScript, Python, or Go]
- **Framework**: [To be determined based on implementation]
- **Database**: [To be determined]
- **Testing**: [To be determined]

## Repository Structure

```
Podspinner/
├── .git/                    # Git repository metadata
├── CLAUDE.md               # This file - AI assistant guide
└── [Additional structure to be added as project develops]
```

### Expected Directory Organization

When developing this project, consider organizing code into:

- `src/` or `app/` - Main application source code
- `tests/` or `__tests__/` - Test files
- `docs/` - Additional documentation
- `config/` - Configuration files
- `scripts/` - Build and utility scripts
- `public/` or `static/` - Static assets (if web application)

## Development Setup

### Prerequisites

Document required tools and versions here as they are added:
- Runtime/interpreter version
- Package manager
- Database (if applicable)
- Additional tools

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Podspinner

# Install dependencies (update based on actual setup)
# npm install / pip install -r requirements.txt / go mod download

# Configure environment
# cp .env.example .env (if applicable)

# Run database migrations (if applicable)

# Start development server
```

### Running Tests

```bash
# Run all tests
# [Command to be added]

# Run specific test suite
# [Command to be added]

# Run with coverage
# [Command to be added]
```

## Coding Conventions

### General Principles

1. **Simplicity First**: Write simple, readable code. Avoid over-engineering.
2. **Explicit Over Implicit**: Make intentions clear in code.
3. **DRY Selectively**: Don't abstract until you have 3+ similar cases.
4. **Minimal Dependencies**: Avoid adding dependencies unless necessary.

### Code Style

- Follow the language's standard style guide (PEP 8 for Python, StandardJS/Airbnb for JavaScript, etc.)
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Comment only when logic is not self-evident
- Prefer composition over inheritance

### File Naming

- Use consistent naming convention (snake_case, camelCase, or kebab-case)
- Name files after their primary export/class
- Test files should mirror source file names (e.g., `user.test.js` for `user.js`)

### Error Handling

- Handle errors at appropriate levels
- Use custom error types for domain-specific errors
- Log errors with sufficient context
- Validate input at system boundaries (API endpoints, user input)
- Trust internal code and framework guarantees

## Testing Guidelines

### Testing Philosophy

- Write tests for business logic and complex algorithms
- Focus on behavior, not implementation details
- Test edge cases and error conditions
- Keep tests readable and maintainable

### Test Organization

- One test file per source file
- Group related tests using describe/test blocks
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern

### What to Test

**Do test:**
- Business logic and algorithms
- API endpoints and request handling
- Data transformations
- Edge cases and error conditions
- Integration points with external services

**Don't over-test:**
- Simple getters/setters
- Framework internals
- Third-party library functionality
- Trivial utility functions

## Git Workflow

### Branching Strategy

- `main` or `master` - Production-ready code
- `develop` - Integration branch (if using git-flow)
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Emergency production fixes

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

**Example:**
```
feat(podcast): add RSS feed parsing functionality

Implement RSS feed parser to extract podcast episodes
from standard podcast feed formats.

Closes #123
```

### Pull Request Guidelines

1. Create feature branch from `main` or `develop`
2. Make focused changes (one feature/fix per PR)
3. Write clear PR description explaining the change
4. Include test coverage for new code
5. Ensure all tests pass before requesting review
6. Update documentation if needed

## AI Assistant Guidelines

### When Making Code Changes

1. **Always Read First**: Never propose changes to code you haven't read
2. **Understand Context**: Read related files to understand the system
3. **Minimal Changes**: Only change what's necessary for the task
4. **No Over-Engineering**: Don't add features or refactor beyond the request
5. **Security Awareness**: Watch for SQL injection, XSS, command injection, etc.
6. **Test Changes**: Verify that changes work and don't break existing functionality

### What NOT to Do

- Don't add docstrings/comments to code you didn't change
- Don't refactor working code unless specifically asked
- Don't add error handling for impossible scenarios
- Don't create abstractions for single-use cases
- Don't add feature flags or backwards-compatibility unless needed
- Don't use placeholders in tool calls (e.g., `<branch-name>`)
- Don't create documentation files unless explicitly requested

### Code Review Approach

When reviewing or modifying code:

1. Check for security vulnerabilities
2. Verify error handling is appropriate
3. Ensure tests cover the changes
4. Look for performance issues
5. Verify code follows project conventions
6. Check that dependencies are necessary

### Working with Dependencies

- Research before adding new dependencies
- Consider bundle size impact (for web projects)
- Check maintenance status and security
- Prefer well-established libraries
- Document why dependency was added

## Architecture Patterns

### Design Patterns to Consider

Document architectural patterns used in this project:

- **MVC/MVVM/MVP**: (If applicable)
- **Repository Pattern**: For data access abstraction
- **Service Layer**: For business logic
- **Dependency Injection**: For testability
- **Factory Pattern**: For object creation

### API Design

If this is a web service:

- Use RESTful conventions or GraphQL consistently
- Version APIs appropriately
- Document endpoints and request/response formats
- Use proper HTTP status codes
- Implement rate limiting if needed
- Validate and sanitize all inputs

## Environment Configuration

### Environment Variables

Document required environment variables:

```bash
# Example structure
DATABASE_URL=           # Database connection string
API_KEY=               # External service API key
PORT=                  # Application port
NODE_ENV=              # Environment (development/production/test)
LOG_LEVEL=             # Logging verbosity
```

### Configuration Management

- Use environment-specific config files
- Never commit secrets or credentials
- Use `.env.example` to document required variables
- Validate required config on startup

## Security Considerations

### Best Practices

1. **Input Validation**: Validate all user input at boundaries
2. **Authentication**: Use established auth libraries/standards
3. **Authorization**: Check permissions before operations
4. **SQL Injection**: Use parameterized queries
5. **XSS Prevention**: Sanitize output, use CSP headers
6. **CSRF Protection**: Implement CSRF tokens for state-changing operations
7. **Secrets Management**: Use environment variables, never hardcode
8. **Dependency Security**: Regularly update and audit dependencies

### OWASP Top 10 Awareness

Be vigilant about:
- Injection attacks
- Broken authentication
- Sensitive data exposure
- XML external entities (XXE)
- Broken access control
- Security misconfiguration
- Cross-site scripting (XSS)
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging and monitoring

## Performance Considerations

### Optimization Guidelines

- Profile before optimizing
- Focus on algorithmic improvements first
- Use appropriate data structures
- Implement caching strategically
- Optimize database queries (use indexes, avoid N+1)
- Lazy load resources when appropriate
- Monitor and log performance metrics

### Database Optimization

- Use indexes on frequently queried fields
- Avoid SELECT * in production code
- Use connection pooling
- Implement query result caching where appropriate
- Monitor slow query logs

## Debugging and Troubleshooting

### Logging Strategy

- Use structured logging
- Include context in log messages
- Use appropriate log levels (DEBUG, INFO, WARN, ERROR)
- Don't log sensitive information
- Make logs searchable and actionable

### Common Issues

Document common issues and their solutions as they arise.

## Deployment

### Deployment Process

Document deployment steps:

1. Run tests
2. Build application
3. Run security checks
4. Deploy to staging
5. Run smoke tests
6. Deploy to production
7. Monitor for errors

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready (if applicable)
- [ ] Rollback plan prepared
- [ ] Monitoring and alerts configured

## Useful Commands

```bash
# Development
# [To be added based on project setup]

# Testing
# [To be added based on project setup]

# Building
# [To be added based on project setup]

# Deployment
# [To be added based on project setup]

# Database
# [To be added based on project setup]
```

## Resources

### Documentation Links

- Project README: `README.md`
- API Documentation: [To be added]
- Database Schema: [To be added]
- Architecture Diagrams: [To be added]

### External Resources

- Language Documentation: [Add link]
- Framework Documentation: [Add link]
- Related Services: [Add links]

## Contributing

### For Human Developers

1. Read this document
2. Set up development environment
3. Create feature branch
4. Make changes with tests
5. Submit pull request
6. Address review feedback

### For AI Assistants

1. Always start by understanding existing code
2. Use TodoWrite tool for multi-step tasks
3. Make focused, minimal changes
4. Prioritize security and correctness
5. Test changes thoroughly
6. Ask for clarification when requirements are ambiguous
7. Follow all guidelines in this document

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review and rotate secrets quarterly
- Audit security vulnerabilities
- Review and update documentation
- Monitor performance metrics
- Clean up deprecated code

### Technical Debt Tracking

Document known technical debt items:

- [ ] [Example: Refactor authentication module]
- [ ] [Example: Add integration tests for payment flow]
- [ ] [Example: Optimize database query performance]

## Notes for AI Assistants

### Project-Specific Context

As this codebase develops, document:

- Key business rules
- Important constraints
- Non-obvious design decisions
- Areas requiring special attention
- Known limitations or workarounds

### Common Tasks

Document common tasks and how to approach them:

**Adding a new feature:**
1. Understand requirements clearly
2. Read relevant existing code
3. Plan the implementation
4. Write tests first (TDD) or alongside code
5. Implement the feature minimally
6. Test thoroughly
7. Update documentation

**Fixing a bug:**
1. Reproduce the bug
2. Write a failing test that captures the bug
3. Fix the bug
4. Verify the test passes
5. Check for similar issues elsewhere
6. Document the fix if non-obvious

**Refactoring:**
1. Only refactor when explicitly requested or clearly necessary
2. Ensure tests exist before refactoring
3. Make small, incremental changes
4. Run tests after each change
5. Don't change behavior, only structure

---

## Document Maintenance

**Last Updated**: 2025-11-26
**Version**: 1.0.0

This document should be updated as the project evolves. When making significant architectural changes or establishing new conventions, update this document to reflect the current state of the project.

### Changelog

- **2025-11-26**: Initial creation of CLAUDE.md with comprehensive AI assistant guidelines
