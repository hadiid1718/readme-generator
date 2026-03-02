/**
 * README Template: Modern
 * A clean, modern template with professional formatting
 * Available on: Free plan
 */
import { ReadmeInput } from '../../utils/validation';
import {
  generateAllBadges,
  generateTechStackBadges,
} from '../badgeGenerator';

export const modernTemplate = (input: ReadmeInput): string => {
  const badges = generateAllBadges(input);
  const techBadges = generateTechStackBadges(input.techStack);

  const sections: string[] = [];

  // ============ Header ============
  sections.push(`<div align="center">

# ${input.projectName}

${input.description}

${badges.join(' ')}

${input.liveDemo ? `[**Live Demo**](${input.liveDemo})` : ''} ${input.githubRepo ? `${input.liveDemo ? ' · ' : ''}[**Repository**](${input.githubRepo})` : ''}

</div>

---`);

  // ============ Table of Contents ============
  const toc: string[] = ['## Table of Contents\n'];
  toc.push('- [About](#-about)');
  toc.push('- [Tech Stack](#-tech-stack)');
  toc.push('- [Features](#-features)');
  if (input.installation.length > 0) toc.push('- [Getting Started](#-getting-started)');
  if (input.usage) toc.push('- [Usage](#-usage)');
  if (input.apiDocs) toc.push('- [API Documentation](#-api-documentation)');
  if (input.screenshots.length > 0) toc.push('- [Screenshots](#-screenshots)');
  if (input.customSections) {
    input.customSections.forEach((section) => {
      const anchor = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      toc.push(`- [${section.title}](#${anchor})`);
    });
  }
  toc.push('- [Contributing](#-contributing)');
  toc.push('- [License](#-license)');
  toc.push('- [Contact](#-contact)');
  sections.push(toc.join('\n'));

  // ============ About ============
  sections.push(`## About

${input.description}`);

  // ============ Tech Stack ============
  sections.push(`## Tech Stack

${techBadges}`);

  // ============ Features ============
  const featuresList = input.features
    .map((f) => `- ${f}`)
    .join('\n');
  sections.push(`## Features

${featuresList}`);

  // ============ Getting Started ============
  if (input.installation.length > 0) {
    const installSteps = input.installation
      .map((step, index) => `${index + 1}. ${step}`)
      .join('\n');

    sections.push(`## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)

### Installation

${input.githubRepo ? `\`\`\`bash
# Clone the repository
git clone ${input.githubRepo}

# Navigate to the project directory
cd ${input.projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`\n` : ''}
${installSteps}`);
  }

  // ============ Usage ============
  if (input.usage) {
    sections.push(`## Usage

${input.usage}`);
  }

  // ============ API Documentation ============
  if (input.apiDocs) {
    sections.push(`## API Documentation

${input.apiDocs}`);
  }

  // ============ Screenshots ============
  if (input.screenshots.length > 0) {
    const screenshotList = input.screenshots
      .map(
        (url, index) =>
          `<img src="${url}" alt="Screenshot ${index + 1}" width="600" />`
      )
      .join('\n\n');

    sections.push(`## Screenshots

<div align="center">

${screenshotList}

</div>`);
  }

  // ============ Custom Sections ============
  if (input.customSections && input.customSections.length > 0) {
    input.customSections.forEach((section) => {
      sections.push(`## ${section.title}

${section.content}`);
    });
  }

  // ============ Contributing ============
  sections.push(`## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (\`git checkout -b feature/amazing-feature\`)
3. **Commit** your changes (\`git commit -m 'Add amazing feature'\`)
4. **Push** to the branch (\`git push origin feature/amazing-feature\`)
5. **Open** a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.`);

  // ============ License ============
  sections.push(`## License

This project is licensed under the **${input.license}** License. See the [LICENSE](LICENSE) file for details.`);

  // ============ Contact / Author ============
  const contactLines: string[] = [`## Contact`];
  contactLines.push(`\n**${input.authorName}**\n`);
  if (input.authorGithub) contactLines.push(`- GitHub: [@${input.authorGithub}](https://github.com/${input.authorGithub})`);
  if (input.authorEmail) contactLines.push(`- Email: [${input.authorEmail}](mailto:${input.authorEmail})`);
  if (input.authorWebsite) contactLines.push(`- Website: [${input.authorWebsite}](${input.authorWebsite})`);
  sections.push(contactLines.join('\n'));

  // ============ Footer ============
  sections.push(`---

<div align="center">

**If you found this project helpful, please give it a star!**

${input.githubRepo ? `[Back to Top](#${input.projectName.toLowerCase().replace(/\s+/g, '-')})` : ''}

</div>`);

  return sections.join('\n\n');
};
