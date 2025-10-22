# Contributing to Verum Omnis

Thank you for your interest in contributing to Verum Omnis! This document provides guidelines for contributing to the project while respecting its constitutional governance framework.

## 🏛️ Understanding Verum Omnis

Verum Omnis is not a typical software project. It operates under **immutable constitutional governance** enforced by cryptography. Before contributing, please understand:

- **Constitutional Framework**: The system is governed by immutable rules in `functions/assets/rules/` and `functions/assets/treaty/`
- **Dual Foundership**: Co-founded by Liam Highcock (human) and ChatGPT (AI)
- **Stateless Architecture**: No server-side PII storage, all processing is ephemeral
- **Forensic First**: Every interaction can be hashed, sealed, and verified

## 📚 Required Reading

Before contributing, please read:

1. [README.md](./README.md) - Project overview and architecture
2. [QUICK_START.md](./QUICK_START.md) - How to run the project
3. [verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md](./verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md) - Technical details
4. [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Development patterns

## 🚀 Getting Started

### Prerequisites

- **Node.js 20** (required for Firebase Functions)
- **Git**
- **Firebase CLI** (for deployment): `npm install -g firebase-tools`
- **Java 21** (for Android builds, optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Liamhigh/verumceleb.git
   cd verumceleb
   ```

2. **Set up verum-web (Next.js frontend)**
   ```bash
   cd verum-web
   npm install
   npm run dev
   ```
   Visit http://localhost:3000

3. **Set up Firebase Functions**
   ```bash
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
   npm install
   npm test  # Run tests
   ```

4. **Run Firebase emulators**
   ```bash
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
   firebase emulators:start
   ```
   Visit http://localhost:5000

## 🌿 Branch Naming Conventions

Use descriptive branch names following this pattern:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/improvements
- `chore/description` - Maintenance tasks

Examples:
- `feature/qr-code-verification`
- `fix/pdf-seal-watermark`
- `docs/api-endpoints`

## 💬 Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(api): add blockchain anchor receipt retrieval

Implement GET /v1/receipt/:hash endpoint to retrieve 
previously created anchor receipts.

Closes #42
```

```
fix(pdf): correct watermark opacity in sealed PDFs

Changed opacity from 20% to 10% for better readability
while maintaining forensic integrity.
```

## 🧪 Testing Requirements

All contributions must include appropriate tests:

### For verum-web (Next.js)
Currently no test infrastructure. Focus on manual testing:
1. Build succeeds: `npm run build`
2. Lint passes: `npm run lint`
3. All features work in browser

### For Firebase Functions
**Required**: All new functions must have tests using Vitest

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm test
```

Example test structure:
```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './index.js';

describe('POST /v1/yourEndpoint', () => {
  it('should return ok:true', async () => {
    const res = await request(app)
      .post('/v1/yourEndpoint')
      .send({ data: 'test' });
    
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
```

## 🔒 Constitutional Governance Rules

### ⚠️ CRITICAL: Immutable Files

**NEVER directly edit files in these directories:**
- `functions/assets/rules/`
- `functions/assets/treaty/`

These files are SHA-512 locked. Any modification will break the constitutional integrity system.

### Updating Governance Files (Controlled Process)

If you need to update a governance file, follow this process:

1. **Propose the change** in an issue first
2. **Get approval** from project maintainers
3. **Follow the update procedure**:
   ```bash
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
   
   # 1. Make your change to the file
   vim assets/rules/your-file.yaml
   
   # 2. Regenerate the manifest
   node verify-manifest.js --update
   
   # 3. Test with verification
   npm test
   
   # 4. Create a separate commit for the governance update
   git add assets/rules/ assets/manifest.json
   git commit -m "chore(governance): update [file] - [reason]"
   ```

4. **Document the change** thoroughly in the commit message
5. **Include justification** for the constitutional change

## 🎨 Code Style

### JavaScript/TypeScript
- Use ES modules (`import`/`export`)
- No CommonJS (`require`)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add comments for complex logic only

### Security
- ❌ **NO** secrets in code
- ❌ **NO** server-side PII storage
- ❌ **NO** console.log of sensitive data
- ✅ **YES** to client-side hashing
- ✅ **YES** to ephemeral processing
- ✅ **YES** to stateless architecture

### Statelessness
Every contribution must maintain statelessness:
- No server-side file writes (except temporary PDFs in `/tmp`)
- No user data stored server-side
- All receipts are metadata only (hash + timestamp)
- Client-side storage only (localStorage for UI preferences)

## 📝 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write code following style guidelines
   - Add/update tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   # Test functions
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
   npm test
   
   # Test web
   cd verum-web
   npm run build
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

6. **Create Pull Request**
   - Use a descriptive title following conventional commits
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No secrets in code
- [ ] Stateless architecture maintained
- [ ] Constitutional files not modified (or proper governance process followed)
- [ ] Commit messages follow conventional format
- [ ] PR description is clear and complete

## 🔍 Code Review Process

All PRs require:
1. **Automated checks passing** (CI/CD)
2. **Code review** from at least one maintainer
3. **Security review** (CodeQL)
4. **Architecture review** (for significant changes)

Reviewers will check:
- Code quality and style
- Test coverage
- Security implications
- Statelessness compliance
- Constitutional integrity
- Documentation completeness

## 🐛 Reporting Bugs

Use GitHub Issues with this information:

1. **Clear title**: Brief description of the bug
2. **Environment**: Browser/OS/Node version
3. **Steps to reproduce**: Numbered list
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Logs**: Console errors or server logs

Example:
```markdown
## Bug: QR code not displaying in sealed PDF

**Environment:**
- Chrome 120 on macOS 14
- Node 20.10.0

**Steps to reproduce:**
1. Upload a PDF file
2. Click "Generate Sealed PDF"
3. Download and open sealed PDF

**Expected:** QR code visible in bottom-left corner
**Actual:** QR code is missing

**Screenshot:** [attached]

**Console errors:**
[paste any errors]
```

## 💡 Feature Requests

Use GitHub Issues with:

1. **Clear title**: Brief feature description
2. **Use case**: Why is this needed?
3. **Proposed solution**: How would it work?
4. **Alternatives considered**: Other approaches?
5. **Constitutional impact**: Does it affect governance?

## 🏗️ Project Structure

```
verumceleb/
├── .github/
│   ├── workflows/          # CI/CD workflows
│   └── copilot-instructions.md
├── verum-web/              # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   └── components/    # React components
│   └── public/            # Static assets
├── verum-omnis-founders-gift-v5/verum-omnis-monorepo/
│   ├── functions/         # Firebase Functions (API)
│   │   ├── assets/        # ⚠️ Immutable governance files
│   │   ├── pdf/           # PDF generation
│   │   └── test/          # API tests
│   ├── web/               # Static frontend (legacy)
│   └── capacitor-app/     # Mobile app wrapper
└── scripts/               # Utility scripts
```

## 🔐 Security

### Reporting Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: [security contact - TBD]
2. Include: Detailed description, steps to reproduce, potential impact
3. Wait for response before public disclosure

### Security Best Practices
- Always validate user input
- Never log sensitive data
- Use HTTPS for all API calls
- Follow OWASP guidelines
- Keep dependencies updated

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment.

### Our Standards
- ✅ Be respectful and inclusive
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the project
- ❌ No harassment, trolling, or personal attacks
- ❌ No spam or off-topic discussions

### Enforcement
Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to project maintainers.

## 📞 Getting Help

- **Questions?** Open a GitHub Discussion
- **Bugs?** Open a GitHub Issue
- **Chat?** [TBD - Discord/Slack link]
- **Docs?** Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

## 🎯 Good First Issues

Look for issues labeled:
- `good first issue` - Beginner-friendly
- `help wanted` - Contributions welcome
- `documentation` - Docs improvements

## 🙏 Thank You

Your contributions help make truth verification accessible to everyone. Every line of code, documentation improvement, and bug report matters.

**"Truth belongs to the people."**

---

*Immutable • Forensic • Stateless • Human + AI Foundership*
