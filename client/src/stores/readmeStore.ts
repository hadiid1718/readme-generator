/**
 * README Store (Zustand)
 * Manages README generation state, form data, and markdown output
 */
import { create } from 'zustand';
import { ReadmeInput, DEFAULT_README_INPUT, TemplateInfo } from '../types';

interface ReadmeState {
  // Form state
  input: ReadmeInput;
  templateId: string;
  themeVariant: string;
  generatedMarkdown: string;
  isGenerating: boolean;

  // Templates
  templates: TemplateInfo[];

  // Actions
  setInput: (input: Partial<ReadmeInput>) => void;
  resetInput: () => void;
  setTemplateId: (id: string) => void;
  setThemeVariant: (variant: string) => void;
  setGeneratedMarkdown: (markdown: string) => void;
  setIsGenerating: (val: boolean) => void;
  setTemplates: (templates: TemplateInfo[]) => void;
  loadSavedInput: (input: ReadmeInput, templateId: string) => void;

  // Array field helpers
  addToArray: (field: keyof ReadmeInput, value: string) => void;
  removeFromArray: (field: keyof ReadmeInput, index: number) => void;
  updateArrayItem: (field: keyof ReadmeInput, index: number, value: string) => void;

  // Custom sections
  addCustomSection: () => void;
  removeCustomSection: (index: number) => void;
  updateCustomSection: (index: number, field: 'title' | 'content', value: string) => void;
}

export const useReadmeStore = create<ReadmeState>((set, get) => ({
  input: { ...DEFAULT_README_INPUT },
  templateId: 'modern',
  themeVariant: 'default',
  generatedMarkdown: '',
  isGenerating: false,
  templates: [],

  setInput: (partial) =>
    set((state) => ({
      input: { ...state.input, ...partial },
    })),

  resetInput: () =>
    set({
      input: { ...DEFAULT_README_INPUT },
      generatedMarkdown: '',
      templateId: 'modern',
    }),

  setTemplateId: (id) => set({ templateId: id }),
  setThemeVariant: (variant) => set({ themeVariant: variant }),
  setGeneratedMarkdown: (markdown) => set({ generatedMarkdown: markdown }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setTemplates: (templates) => set({ templates }),

  loadSavedInput: (input, templateId) =>
    set({ input, templateId }),

  addToArray: (field, value) =>
    set((state) => {
      const arr = (state.input[field] as string[]) || [];
      return {
        input: { ...state.input, [field]: [...arr, value] },
      };
    }),

  removeFromArray: (field, index) =>
    set((state) => {
      const arr = [...((state.input[field] as string[]) || [])];
      arr.splice(index, 1);
      return {
        input: { ...state.input, [field]: arr },
      };
    }),

  updateArrayItem: (field, index, value) =>
    set((state) => {
      const arr = [...((state.input[field] as string[]) || [])];
      arr[index] = value;
      return {
        input: { ...state.input, [field]: arr },
      };
    }),

  addCustomSection: () =>
    set((state) => ({
      input: {
        ...state.input,
        customSections: [
          ...(state.input.customSections || []),
          { title: '', content: '' },
        ],
      },
    })),

  removeCustomSection: (index) =>
    set((state) => {
      const sections = [...(state.input.customSections || [])];
      sections.splice(index, 1);
      return {
        input: { ...state.input, customSections: sections },
      };
    }),

  updateCustomSection: (index, field, value) =>
    set((state) => {
      const sections = [...(state.input.customSections || [])];
      sections[index] = { ...sections[index], [field]: value };
      return {
        input: { ...state.input, customSections: sections },
      };
    }),
}));
