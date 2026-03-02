/**
 * Generator Page
 * Form-based README generator with live markdown preview
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Eye,
  Code,
  Copy,
  Download,
  Loader2,
  Plus,
  X,
  Trash2,
  ChevronDown,
  Sparkles,
  Lock,
  Github,
  LogIn,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAuthStore } from '../stores/authStore';
import { useReadmeStore } from '../stores/readmeStore';
import { readmeAPI } from '../lib/api';
import { ReadmeInput, TemplateInfo } from '../types';

// ============ Array Input Component ============
const ArrayInput = ({
  label,
  field,
  placeholder,
}: {
  label: string;
  field: keyof ReadmeInput;
  placeholder: string;
}) => {
  const { input, addToArray, removeFromArray, updateArrayItem } = useReadmeStore();
  const items = (input[field] as string[]) || [];
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addToArray(field, newItem.trim());
    setNewItem('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <button onClick={handleAdd} className="btn-secondary px-3 py-2" type="button">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayItem(field, index, e.target.value)}
                className="input-field text-sm py-1.5 flex-1"
              />
              <button
                onClick={() => removeFromArray(field, index)}
                className="p-1.5 text-dark-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ License Options ============
const LICENSE_OPTIONS = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'GPL-2.0',
  'BSD-3-Clause',
  'BSD-2-Clause',
  'ISC',
  'Unlicense',
  'MPL-2.0',
];

// ============ Main Generator Page ============
const GeneratorPage = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { user, isAuthenticated } = useAuthStore();
  const {
    input,
    setInput,
    resetInput,
    templateId,
    setTemplateId,
    generatedMarkdown,
    setGeneratedMarkdown,
    isGenerating,
    setIsGenerating,
    templates,
    setTemplates,
    loadSavedInput,
    addCustomSection,
    removeCustomSection,
    updateCustomSection,
  } = useReadmeStore();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'raw'>('edit');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishRepo, setPublishRepo] = useState('');
  const [publishBranch, setPublishBranch] = useState('main');
  const [publishToken, setPublishToken] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await readmeAPI.getTemplates();
        setTemplates(response.data.data.templates);
      } catch {
        // Use defaults if API fails
        setTemplates([
          { id: 'modern', name: 'Modern', description: 'Clean modern template', plan: 'free', isAccessible: true },
          { id: 'minimal', name: 'Minimal', description: 'Simple minimalist template', plan: 'free', isAccessible: true },
          { id: 'advanced', name: 'Advanced Pro', description: 'Premium detailed template', plan: 'pro', isAccessible: false },
        ]);
      }
    };
    loadTemplates();
  }, []);

  // Load existing README if editing
  useEffect(() => {
    if (editId && isAuthenticated) {
      const loadReadme = async () => {
        try {
          const response = await readmeAPI.getOne(editId);
          const { input: savedInput, templateId: savedTemplate, generatedMarkdown: savedMd } = response.data.data.readme;
          loadSavedInput(savedInput, savedTemplate);
          setGeneratedMarkdown(savedMd);
        } catch {
          toast.error('Failed to load README for editing');
        }
      };
      loadReadme();
    }
  }, [editId]);

  // ---- Live Preview (debounced) ----
  const generatePreview = useCallback(async () => {
    if (!input.projectName || !input.description || input.techStack.length === 0) return;

    setPreviewLoading(true);
    try {
      const response = await readmeAPI.preview({ input, templateId });
      setGeneratedMarkdown(response.data.data.markdown);
    } catch {
      // Silent fail for preview
    } finally {
      setPreviewLoading(false);
    }
  }, [input, templateId]);

  // Debounce preview generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.projectName && input.description && input.features.length > 0) {
        generatePreview();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [input, templateId]);

  // ---- Generate & Save ----
  const handleGenerate = async () => {
    if (!input.projectName || !input.description) {
      toast.error('Please fill in project name and description');
      return;
    }

    if (input.techStack.length === 0) {
      toast.error('Please add at least one technology');
      return;
    }

    if (input.features.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    if (!input.authorName) {
      toast.error('Please enter your name');
      return;
    }

    setIsGenerating(true);
    try {
      if (isAuthenticated) {
        const response = await readmeAPI.generate({ input, templateId });
        setGeneratedMarkdown(response.data.data.markdown);
        toast.success(`README generated! Exports remaining: ${response.data.data.exportsRemaining}`);
      } else {
        // For unauthenticated users, just preview
        const response = await readmeAPI.preview({ input, templateId });
        setGeneratedMarkdown(response.data.data.markdown);
        toast.success('README generated! Sign up to save and export.');
      }
      setActiveTab('preview');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate README');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Copy to Clipboard ----
  const handleCopy = async () => {
    if (!generatedMarkdown) return;
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // ---- Download as File ----
  const handleDownload = () => {
    if (!generatedMarkdown) return;
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded README.md!');
  };

  // ---- Publish to GitHub ----
  const handlePublish = async () => {
    if (!generatedMarkdown || !publishRepo || !publishToken) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsPublishing(true);
    try {
      // Parse owner/repo from input (supports full URL or owner/repo format)
      let owner = '';
      let repo = '';
      if (publishRepo.includes('github.com')) {
        const parts = publishRepo.replace(/\/$/, '').split('/');
        owner = parts[parts.length - 2];
        repo = parts[parts.length - 1];
      } else {
        const parts = publishRepo.split('/');
        owner = parts[0];
        repo = parts[1];
      }

      if (!owner || !repo) {
        toast.error('Invalid repo format. Use owner/repo or full GitHub URL');
        setIsPublishing(false);
        return;
      }

      // Check if README.md exists (to get its SHA for update)
      let sha: string | undefined;
      try {
        const existingRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${publishBranch}`,
          { headers: { Authorization: `token ${publishToken}` } }
        );
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          sha = existingData.sha;
        }
      } catch {
        // File doesn't exist, that's fine
      }

      // Create or update README.md
      const content = btoa(unescape(encodeURIComponent(generatedMarkdown)));
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${publishToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: sha ? 'Update README.md via README Generator Pro' : 'Add README.md via README Generator Pro',
            content,
            branch: publishBranch,
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to publish');
      }

      toast.success('README.md published to GitHub successfully!');
      setPublishModalOpen(false);
      setPublishRepo('');
      setPublishToken('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish to GitHub');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Top Bar */}
      <div className="sticky top-16 z-40 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/50">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-white hidden sm:block">
                {editId ? 'Edit README' : 'Generate README'}
              </h1>

              {/* Template Selector */}
              <div className="relative">
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="input-field text-sm py-2 pr-8 appearance-none cursor-pointer"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.isAccessible}>
                      {t.name} {t.plan === 'pro' ? '(Pro)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {generatedMarkdown && (
                <>
                  <button onClick={handleCopy} className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1.5" title={!isAuthenticated ? 'Login required' : 'Copy'}>
                    {!isAuthenticated ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                  <button onClick={handleDownload} className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1.5" title={!isAuthenticated ? 'Login required' : 'Download'}>
                    {!isAuthenticated ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Download className="w-4 h-4" />}
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  {isAuthenticated && (
                    <button onClick={() => setPublishModalOpen(true)} className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1.5 border-green-600/50 hover:border-green-500" title="Publish to GitHub">
                      <Upload className="w-4 h-4 text-green-400" />
                      <span className="hidden sm:inline">Publish</span>
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary text-sm py-2 px-4 flex items-center space-x-1.5"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isAuthenticated ? 'Generate & Save' : 'Generate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex bg-dark-800 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'raw'
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Raw
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ========== Form Panel ========== */}
          <div className={`${activeTab !== 'edit' ? 'hidden lg:block' : ''}`}>
            <div className="card space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
              {/* Project Info */}
              <fieldset>
                <legend className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <span>Project Information</span>
                </legend>

                <div className="space-y-4">
                  <div>
                    <label className="label">Project Name *</label>
                    <input
                      type="text"
                      value={input.projectName}
                      onChange={(e) => setInput({ projectName: e.target.value })}
                      placeholder="My Awesome Project"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Description *</label>
                    <textarea
                      value={input.description}
                      onChange={(e) => setInput({ description: e.target.value })}
                      placeholder="A brief description of what your project does..."
                      className="input-field min-h-[80px] resize-y"
                      rows={3}
                    />
                  </div>

                  <ArrayInput label="Tech Stack *" field="techStack" placeholder="e.g. React, Node.js, MongoDB" />
                  <ArrayInput label="Features *" field="features" placeholder="e.g. Real-time updates" />
                  <ArrayInput label="Installation Steps" field="installation" placeholder="npm install" />

                  <div>
                    <label className="label">Usage Instructions</label>
                    <textarea
                      value={input.usage}
                      onChange={(e) => setInput({ usage: e.target.value })}
                      placeholder="How to use the project (supports markdown)..."
                      className="input-field min-h-[80px] resize-y"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="label">API Documentation (optional)</label>
                    <textarea
                      value={input.apiDocs || ''}
                      onChange={(e) => setInput({ apiDocs: e.target.value })}
                      placeholder="Document your API endpoints (supports markdown)..."
                      className="input-field min-h-[80px] resize-y"
                      rows={3}
                    />
                  </div>

                  <ArrayInput label="Screenshot URLs" field="screenshots" placeholder="https://example.com/screenshot.png" />
                </div>
              </fieldset>

              {/* Links */}
              <fieldset>
                <legend className="text-lg font-semibold text-white mb-4">Links</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">GitHub Repository</label>
                    <input
                      type="url"
                      value={input.githubRepo || ''}
                      onChange={(e) => setInput({ githubRepo: e.target.value })}
                      placeholder="https://github.com/user/repo"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Live Demo URL</label>
                    <input
                      type="url"
                      value={input.liveDemo || ''}
                      onChange={(e) => setInput({ liveDemo: e.target.value })}
                      placeholder="https://myproject.vercel.app"
                      className="input-field"
                    />
                  </div>
                </div>
              </fieldset>

              {/* License */}
              <fieldset>
                <legend className="text-lg font-semibold text-white mb-4">License</legend>
                <select
                  value={input.license}
                  onChange={(e) => setInput({ license: e.target.value })}
                  className="input-field"
                >
                  {LICENSE_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </fieldset>

              {/* Author Info */}
              <fieldset>
                <legend className="text-lg font-semibold text-white mb-4">Author</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      value={input.authorName}
                      onChange={(e) => setInput({ authorName: e.target.value })}
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">GitHub Username</label>
                    <input
                      type="text"
                      value={input.authorGithub || ''}
                      onChange={(e) => setInput({ authorGithub: e.target.value })}
                      placeholder="johndoe"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={input.authorEmail || ''}
                      onChange={(e) => setInput({ authorEmail: e.target.value })}
                      placeholder="john@example.com"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      type="url"
                      value={input.authorWebsite || ''}
                      onChange={(e) => setInput({ authorWebsite: e.target.value })}
                      placeholder="https://johndoe.dev"
                      className="input-field"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Custom Sections (Pro feature indicator) */}
              <fieldset>
                <legend className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <span>Custom Sections</span>
                  {user?.plan !== 'pro' && (
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold rounded text-white flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>PRO</span>
                    </span>
                  )}
                </legend>

                {(input.customSections || []).map((section, index) => (
                  <div key={index} className="card mb-3 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark-400">Section {index + 1}</span>
                      <button
                        onClick={() => removeCustomSection(index)}
                        className="p-1 text-dark-500 hover:text-red-400"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateCustomSection(index, 'title', e.target.value)}
                      placeholder="Section Title"
                      className="input-field mb-2"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => updateCustomSection(index, 'content', e.target.value)}
                      placeholder="Section content (supports markdown)..."
                      className="input-field min-h-[60px] resize-y"
                      rows={2}
                    />
                  </div>
                ))}

                <button
                  onClick={addCustomSection}
                  className="btn-secondary text-sm w-full flex items-center justify-center space-x-2"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Section</span>
                </button>
              </fieldset>

              {/* Reset */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (confirm('Reset all fields?')) resetInput();
                  }}
                  className="text-sm text-dark-500 hover:text-red-400 transition-colors"
                  type="button"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>

          {/* ========== Preview Panel ========== */}
          <div className={`${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
            <div className="card sticky top-[140px] max-h-[calc(100vh-180px)] overflow-y-auto">
              {/* Preview header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-700">
                <div className="hidden lg:flex items-center space-x-2 bg-dark-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                      activeTab !== 'raw'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'raw'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Raw</span>
                  </button>
                </div>
                {previewLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                )}
              </div>

              {/* Content */}
              {!generatedMarkdown ? (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400">
                    Fill in the form and your README preview will appear here
                  </p>
                </div>
              ) : activeTab === 'raw' ? (
                <pre className="text-sm font-mono text-dark-200 whitespace-pre-wrap break-all bg-dark-800 rounded-lg p-4 border border-dark-700">
                  {generatedMarkdown}
                </pre>
              ) : (
                <div className="markdown-preview">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {generatedMarkdown}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
            <p className="text-dark-400 mb-6">
              You need to sign in to copy, download, or publish your README. Your generated content will be preserved.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="btn-primary w-full flex items-center justify-center space-x-2"
                onClick={() => setShowLoginPrompt(false)}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="btn-secondary w-full"
                onClick={() => setShowLoginPrompt(false)}
              >
                Create Account
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-sm text-dark-500 hover:text-dark-300 transition-colors"
              >
                Continue without saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish to GitHub Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPublishModalOpen(false)}>
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Github className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Publish to GitHub</h3>
                <p className="text-sm text-dark-400">Push README.md directly to your repo</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Repository *</label>
                <input
                  type="text"
                  value={publishRepo}
                  onChange={(e) => setPublishRepo(e.target.value)}
                  placeholder="owner/repo or https://github.com/owner/repo"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Branch</label>
                <input
                  type="text"
                  value={publishBranch}
                  onChange={(e) => setPublishBranch(e.target.value)}
                  placeholder="main"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">GitHub Personal Access Token *</label>
                <input
                  type="password"
                  value={publishToken}
                  onChange={(e) => setPublishToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxx"
                  className="input-field"
                />
                <p className="text-xs text-dark-500 mt-1">
                  Needs <code className="text-dark-400">repo</code> scope.{' '}
                  <a href="https://github.com/settings/tokens/new?scopes=repo&description=README+Generator+Pro" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                    Create one here
                  </a>
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setPublishModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;
