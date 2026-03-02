/**
 * Badge Generator
 * Creates Shields.io badge markdown for various categories
 */
import { ReadmeInput } from '../utils/validation';

// Tech stack badge color mapping
const TECH_COLORS: Record<string, { color: string; logo: string }> = {
  // Languages
  javascript: { color: 'F7DF1E', logo: 'javascript' },
  typescript: { color: '3178C6', logo: 'typescript' },
  python: { color: '3776AB', logo: 'python' },
  java: { color: 'ED8B00', logo: 'openjdk' },
  rust: { color: '000000', logo: 'rust' },
  go: { color: '00ADD8', logo: 'go' },
  'c++': { color: '00599C', logo: 'cplusplus' },
  'c#': { color: '239120', logo: 'csharp' },
  php: { color: '777BB4', logo: 'php' },
  ruby: { color: 'CC342D', logo: 'ruby' },
  swift: { color: 'FA7343', logo: 'swift' },
  kotlin: { color: '7F52FF', logo: 'kotlin' },
  dart: { color: '0175C2', logo: 'dart' },
  // Frameworks
  react: { color: '61DAFB', logo: 'react' },
  'next.js': { color: '000000', logo: 'nextdotjs' },
  nextjs: { color: '000000', logo: 'nextdotjs' },
  vue: { color: '4FC08D', logo: 'vuedotjs' },
  'vue.js': { color: '4FC08D', logo: 'vuedotjs' },
  angular: { color: 'DD0031', logo: 'angular' },
  svelte: { color: 'FF3E00', logo: 'svelte' },
  express: { color: '000000', logo: 'express' },
  'express.js': { color: '000000', logo: 'express' },
  nestjs: { color: 'E0234E', logo: 'nestjs' },
  django: { color: '092E20', logo: 'django' },
  flask: { color: '000000', logo: 'flask' },
  fastapi: { color: '009688', logo: 'fastapi' },
  'spring boot': { color: '6DB33F', logo: 'springboot' },
  laravel: { color: 'FF2D20', logo: 'laravel' },
  rails: { color: 'CC0000', logo: 'rubyonrails' },
  flutter: { color: '02569B', logo: 'flutter' },
  // Databases
  mongodb: { color: '47A248', logo: 'mongodb' },
  postgresql: { color: '4169E1', logo: 'postgresql' },
  mysql: { color: '4479A1', logo: 'mysql' },
  redis: { color: 'DC382D', logo: 'redis' },
  firebase: { color: 'FFCA28', logo: 'firebase' },
  supabase: { color: '3ECF8E', logo: 'supabase' },
  // Tools & platforms
  docker: { color: '2496ED', logo: 'docker' },
  kubernetes: { color: '326CE5', logo: 'kubernetes' },
  aws: { color: '232F3E', logo: 'amazonaws' },
  vercel: { color: '000000', logo: 'vercel' },
  netlify: { color: '00C7B7', logo: 'netlify' },
  tailwindcss: { color: '06B6D4', logo: 'tailwindcss' },
  'tailwind css': { color: '06B6D4', logo: 'tailwindcss' },
  sass: { color: 'CC6699', logo: 'sass' },
  graphql: { color: 'E10098', logo: 'graphql' },
  'node.js': { color: '339933', logo: 'nodedotjs' },
  nodejs: { color: '339933', logo: 'nodedotjs' },
  npm: { color: 'CB3837', logo: 'npm' },
  yarn: { color: '2C8EBB', logo: 'yarn' },
  pnpm: { color: 'F69220', logo: 'pnpm' },
  vite: { color: '646CFF', logo: 'vite' },
  webpack: { color: '8DD6F9', logo: 'webpack' },
  git: { color: 'F05032', logo: 'git' },
  github: { color: '181717', logo: 'github' },
  stripe: { color: '008CDD', logo: 'stripe' },
};

// License badge mapping
const LICENSE_BADGES: Record<string, string> = {
  MIT: 'MIT-yellow',
  'Apache-2.0': 'Apache%202.0-blue',
  'GPL-3.0': 'GPLv3-blue',
  'GPL-2.0': 'GPLv2-blue',
  'BSD-3-Clause': 'BSD%203--Clause-orange',
  'BSD-2-Clause': 'BSD%202--Clause-orange',
  ISC: 'ISC-blue',
  Unlicense: 'Unlicense-blue',
  'MPL-2.0': 'MPL%202.0-brightgreen',
};

/**
 * Generate a tech stack badge
 */
export const generateTechBadge = (tech: string): string => {
  const normalized = tech.toLowerCase().trim();
  const config = TECH_COLORS[normalized];

  if (config) {
    return `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-${config.color}?style=for-the-badge&logo=${config.logo}&logoColor=white)`;
  }

  // Fallback: generate generic badge
  return `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-333333?style=for-the-badge)`;
};

/**
 * Generate license badge
 */
export const generateLicenseBadge = (license: string): string => {
  const badgeLabel = LICENSE_BADGES[license] || `${encodeURIComponent(license)}-blue`;
  return `![License](https://img.shields.io/badge/License-${badgeLabel}.svg?style=for-the-badge)`;
};

/**
 * Generate GitHub stars badge
 */
export const generateStarsBadge = (repoUrl: string): string => {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return '';

  const [, owner, repo] = match;
  return `![GitHub Stars](https://img.shields.io/github/stars/${owner}/${repo}?style=for-the-badge&logo=github)`;
};

/**
 * Generate GitHub forks badge
 */
export const generateForksBadge = (repoUrl: string): string => {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return '';

  const [, owner, repo] = match;
  return `![GitHub Forks](https://img.shields.io/github/forks/${owner}/${repo}?style=for-the-badge&logo=github)`;
};

/**
 * Generate GitHub issues badge
 */
export const generateIssuesBadge = (repoUrl: string): string => {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return '';

  const [, owner, repo] = match;
  return `![GitHub Issues](https://img.shields.io/github/issues/${owner}/${repo}?style=for-the-badge)`;
};

/**
 * Generate all badges for a README input
 */
export const generateAllBadges = (input: ReadmeInput): string[] => {
  const badges: string[] = [];

  // License badge
  if (input.license) {
    badges.push(generateLicenseBadge(input.license));
  }

  // GitHub badges
  if (input.githubRepo) {
    badges.push(generateStarsBadge(input.githubRepo));
    badges.push(generateForksBadge(input.githubRepo));
    badges.push(generateIssuesBadge(input.githubRepo));
  }

  return badges.filter(Boolean);
};

/**
 * Generate tech stack badges row
 */
export const generateTechStackBadges = (techStack: string[]): string => {
  return techStack.map(generateTechBadge).join(' ');
};
