/**
 * Template Registry
 * Central registry for all README templates with metadata
 */
import { ReadmeInput } from '../../utils/validation';
import { modernTemplate } from './modern';
import { minimalTemplate } from './minimal';
import { advancedTemplate } from './advanced';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  plan: 'free' | 'pro'; // Which plan can access this template
  generator: (input: ReadmeInput) => string;
}

/**
 * All available templates
 */
export const templates: Record<string, TemplateInfo> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'A clean, modern template with emojis and professional formatting',
    plan: 'free',
    generator: modernTemplate,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'A simple, minimalist template focused on content',
    plan: 'free',
    generator: minimalTemplate,
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Pro',
    description: 'Premium template with detailed sections, tables, and collapsible content',
    plan: 'pro',
    generator: advancedTemplate,
  },
};

/**
 * Get template by ID
 * Falls back to 'modern' if not found
 */
export const getTemplate = (templateId: string): TemplateInfo => {
  return templates[templateId] || templates.modern;
};

/**
 * Get all templates available for a given plan
 */
export const getTemplatesForPlan = (plan: 'free' | 'pro'): TemplateInfo[] => {
  return Object.values(templates).filter((t) => {
    if (plan === 'pro') return true; // Pro gets all templates
    return t.plan === 'free';
  });
};

/**
 * Get all templates (for listing)
 */
export const getAllTemplates = (): TemplateInfo[] => {
  return Object.values(templates);
};
