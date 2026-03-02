/**
 * README Template: Pro Advanced
 * A premium template with detailed sections, animated badges, and professional layout
 * Available on: Pro plan only
 */
import { ReadmeInput } from '../../utils/validation';
import {
  generateAllBadges,
  generateTechStackBadges,
  generateTechBadge,
} from '../badgeGenerator';

export const advancedTemplate = (input: ReadmeInput): string => {
  const badges = generateAllBadges(input);
  const techBadges = generateTechStackBadges(input.techStack);
  const sections: string[] = [];

  // ============ Hero Header ============
  sections.push(`<div align="center">

# 🚀 ${input.projectName}

### ${input.description}

${badges.join(' ')}

<br />

${techBadges}

<br />

${input.liveDemo ? `<a href="${input.liveDemo}"><img src="https://img.shields.io/badge/LIVE_DEMO-Visit_Now-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>` : ''}
${input.githubRepo ? `<a href="${input.githubRepo}"><img src="https://img.shields.io/badge/SOURCE_CODE-View_Repo-blue?style=for-the-badge&logo=github" alt="Source Code" /></a>` : ''}

</div>

<br />

---`);

  // ============ Table of Contents ============
  sections.push(`<details>
<summary><strong>📋 Table of Contents</strong></summary>

<br />

| Section | Description |
|---------|-------------|
| [🎯 Overview](#-overview) | What this project does |
| [🏗️ Architecture](#-architecture) | System design & tech stack |
| [✨ Features](#-features) | Key capabilities |
| [🚀 Quick Start](#-quick-start) | Get up and running |
| [💡 Usage](#-usage) | How to use the project |
${input.apiDocs ? '| [📡 API Docs](#-api-documentation) | API reference |\n' : ''}${input.screenshots.length > 0 ? '| [📸 Screenshots](#-screenshots) | Visual preview |\n' : ''}| [🗺️ Roadmap](#-roadmap) | Future plans |
| [🤝 Contributing](#-contributing) | How to contribute |
| [📄 License](#-license) | License information |

</details>

---`);

  // ============ Overview ============
  sections.push(`## 🎯 Overview

${input.description}

### Why ${input.projectName}?

| Problem | Solution |
|---------|----------|
| Complex setup processes | One-click installation |
| Lack of documentation | Comprehensive guides |
| Poor developer experience | Intuitive API & UI |`);

  // ============ Architecture ============
  sections.push(`## 🏗️ Architecture

### Tech Stack

<table>
<tr>
<td align="center"><strong>Category</strong></td>
<td align="center"><strong>Technologies</strong></td>
</tr>
${input.techStack
  .map(
    (tech: string) =>
      `<tr><td align="center">🔧</td><td>${generateTechBadge(tech)}</td></tr>`
  )
  .join('\n')}
</table>

### Project Structure

\`\`\`
${input.projectName.toLowerCase().replace(/\s+/g, '-')}/
├── 📁 src/           # Source code
├── 📁 tests/         # Test files
├── 📁 docs/          # Documentation
├── 📄 README.md      # This file
├── 📄 LICENSE        # License file
└── 📄 package.json   # Dependencies
\`\`\``);

  // ============ Features ============
  const featRows = input.features
    .map((f: string, i: number) => `| ${i + 1} | ✅ | ${f} |`)
    .join('\n');
  sections.push(`## ✨ Features

| # | Status | Feature |
|---|--------|---------|
${featRows}

> 💡 **Pro Tip:** Check out the [roadmap](#-roadmap) for upcoming features!`);

  // ============ Quick Start ============
  if (input.installation.length > 0) {
    sections.push(`## 🚀 Quick Start

### Prerequisites

\`\`\`bash
# Check required tools
node --version  # v18+
npm --version   # v9+
git --version
\`\`\`

### Installation

${input.githubRepo ? `\`\`\`bash
# Clone the repository
git clone ${input.githubRepo}
cd ${input.projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`\n` : ''}
${input.installation.map((step: string, i: number) => `**Step ${i + 1}:**\n\`\`\`bash\n${step}\n\`\`\``).join('\n\n')}

### Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
# Add your environment variables here
NODE_ENV=development
PORT=3000
\`\`\`

### Quick Verify

\`\`\`bash
# Run the application
npm run dev

# Run tests
npm test
\`\`\``);
  }

  // ============ Usage ============
  if (input.usage) {
    sections.push(`## 💡 Usage

${input.usage}`);
  }

  // ============ API Documentation ============
  if (input.apiDocs) {
    sections.push(`## 📡 API Documentation

${input.apiDocs}`);
  }

  // ============ Screenshots ============
  if (input.screenshots.length > 0) {
    const screenshotGallery = input.screenshots
      .map(
        (url: string, i: number) =>
          `| ![Screenshot ${i + 1}](${url}) |`
      )
      .join('\n');

    sections.push(`## 📸 Screenshots

<div align="center">

| Preview |
|---------|
${screenshotGallery}

</div>`);
  }

  // ============ Custom Sections ============
  if (input.customSections && input.customSections.length > 0) {
    input.customSections.forEach((section: { title: string; content: string }) => {
      sections.push(`## ${section.title}\n\n${section.content}`);
    });
  }

  // ============ Roadmap ============
  sections.push(`## 🗺️ Roadmap

- [x] Initial release
- [x] Core features
- [ ] Advanced integrations
- [ ] Performance optimizations
- [ ] Mobile support
- [ ] Internationalization

> See the [open issues](${input.githubRepo ? input.githubRepo + '/issues' : '#'}) for a full list of proposed features and known issues.`);

  // ============ Contributing ============
  sections.push(`## 🤝 Contributing

We love contributions! Here's how to get started:

<details>
<summary><strong>Contributing Guidelines</strong></summary>

1. **Fork** the repository
2. **Create** your feature branch
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Commit** your changes
   \`\`\`bash
   git commit -m 'feat: add amazing feature'
   \`\`\`
4. **Push** to the branch
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
5. **Open** a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Description |
|------|-------------|
| \`feat\` | New feature |
| \`fix\` | Bug fix |
| \`docs\` | Documentation |
| \`style\` | Formatting |
| \`refactor\` | Code restructuring |
| \`test\` | Adding tests |
| \`chore\` | Maintenance |

</details>`);

  // ============ License ============
  sections.push(`## 📄 License

Distributed under the **${input.license}** License. See [\`LICENSE\`](LICENSE) for more information.`);

  // ============ Author & Acknowledgments ============
  sections.push(`## 👨‍💻 Author

<table>
<tr>
<td align="center">
<strong>${input.authorName}</strong>
<br />
${input.authorGithub ? `<a href="https://github.com/${input.authorGithub}"><img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" /></a>` : ''}
${input.authorEmail ? `<a href="mailto:${input.authorEmail}"><img src="https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white" /></a>` : ''}
${input.authorWebsite ? `<a href="${input.authorWebsite}"><img src="https://img.shields.io/badge/Website-4285F4?style=flat&logo=google-chrome&logoColor=white" /></a>` : ''}
</td>
</tr>
</table>`);

  // ============ Footer ============
  sections.push(`---

<div align="center">

### ⭐ Star this repo if you find it useful!

Made with ❤️ by [${input.authorName}](${input.authorGithub ? `https://github.com/${input.authorGithub}` : '#'})

${input.githubRepo ? `[⬆ Back to Top](#-${input.projectName.toLowerCase().replace(/\s+/g, '-')})` : ''}

</div>`);

  return sections.join('\n\n');
};
