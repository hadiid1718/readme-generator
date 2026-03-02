/**
 * Shared TypeScript types for the frontend application
 */

// ----- User Types -----
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'past_due';
  exportsUsedThisMonth: number;
  exportsResetDate: string;
  createdAt: string;
}

// ----- README Types -----
export interface ReadmeInput {
  projectName: string;
  description: string;
  techStack: string[];
  features: string[];
  installation: string[];
  usage: string;
  apiDocs?: string;
  screenshots: string[];
  githubRepo?: string;
  liveDemo?: string;
  license: string;
  authorName: string;
  authorGithub?: string;
  authorEmail?: string;
  authorWebsite?: string;
  customSections?: CustomSection[];
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface SavedReadme {
  _id: string;
  userId: string;
  title: string;
  input: ReadmeInput;
  generatedMarkdown: string;
  templateId: string;
  themeVariant: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  plan: 'free' | 'pro';
  isAccessible: boolean;
}

// ----- API Response Types -----
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ----- Payment Types -----
export interface SubscriptionStatus {
  plan: 'free' | 'pro';
  subscriptionStatus: string;
  subscriptionEndDate?: string;
  exportsUsedThisMonth: number;
  exportsLimit: number | 'unlimited';
}

export interface SubscriptionHistoryItem {
  _id: string;
  userId: string;
  event: 'subscribed' | 'renewed' | 'canceled' | 'expired' | 'payment_failed' | 'reactivated';
  plan: 'free' | 'pro';
  amount?: number;
  currency?: string;
  stripeSubscriptionId?: string;
  periodStart?: string;
  periodEnd?: string;
  details?: string;
  createdAt: string;
}

// ----- Form Defaults -----
export const DEFAULT_README_INPUT: ReadmeInput = {
  projectName: '',
  description: '',
  techStack: [],
  features: [],
  installation: [],
  usage: '',
  apiDocs: '',
  screenshots: [],
  githubRepo: '',
  liveDemo: '',
  license: 'MIT',
  authorName: '',
  authorGithub: '',
  authorEmail: '',
  authorWebsite: '',
  customSections: [],
};
