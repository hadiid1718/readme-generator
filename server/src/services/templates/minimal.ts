/**
 * README Template: Minimal
 * A clean, minimalist template
 * Available on: Free plan
 */
import { ReadmeInput } from '../../utils/validation';
import { generateAllBadges, generateTechStackBadges } from '../badgeGenerator';

export const minimalTemplate = (input: ReadmeInput): string => {
  const badges = generateAllBadges(input);
  const techBadges = generateTechStackBadges(input.techStack);
  const sections: string[] = [];

  // Header
  sections.push(`# ${input.projectName}

> ${input.description}

${badges.join(' ')}`);

  // Tech Stack
  sections.push(`## Tech Stack

${techBadges}`);

  // Features
  const featuresList = input.features.map((f) => `- ${f}`).join('\n');
  sections.push(`## Features

${featuresList}`);

  // Installation
  if (input.installation.length > 0) {
    const steps = input.installation.join('\n');
    sections.push(`## Installation

\`\`\`bash
${steps}
\`\`\``);
  }

  // Usage
  if (input.usage) {
    sections.push(`## Usage

${input.usage}`);
  }

  // API Documentation
  if (input.apiDocs) {
    sections.push(`## API

${input.apiDocs}`);
  }

  // Screenshots
  if (input.screenshots.length > 0) {
    const imgs = input.screenshots
      .map((url, i) => `![Screenshot ${i + 1}](${url})`)
      .join('\n\n');
    sections.push(`## Screenshots

${imgs}`);
  }

  // Custom Sections
  if (input.customSections) {
    input.customSections.forEach((s) => {
      sections.push(`## ${s.title}\n\n${s.content}`);
    });
  }

  // Contributing
  sections.push(`## Contributing

Pull requests are welcome. For major changes, please open an issue first.`);

  // License
  sections.push(`## License

[${input.license}](LICENSE)`);

  // Author
  const authorLinks: string[] = [];
  if (input.authorGithub) authorLinks.push(`[GitHub](https://github.com/${input.authorGithub})`);
  if (input.authorEmail) authorLinks.push(`[Email](mailto:${input.authorEmail})`);
  if (input.authorWebsite) authorLinks.push(`[Website](${input.authorWebsite})`);

  sections.push(`## Author

**${input.authorName}** ${authorLinks.length > 0 ? '— ' + authorLinks.join(' · ') : ''}`);

  return sections.join('\n\n');
};
