/**
 * Landing Page
 * Conversion-optimized hero, features, and CTA sections
 */
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  Copy,
  Download,
  Eye,
  Star,
  Code2,
  Palette,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Professional Templates',
    description: 'Choose from beautifully designed templates that make your project stand out.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Auto Badges',
    description: 'Shields.io badges automatically generated for your tech stack, license, and more.',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Live Preview',
    description: 'See your README rendered in real-time as you fill in the form.',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Clean Markdown',
    description: 'Generated markdown follows best practices with proper formatting and emojis.',
  },
  {
    icon: <Copy className="w-6 h-6" />,
    title: 'One-Click Copy',
    description: 'Copy the generated markdown to clipboard with a single click.',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Download as File',
    description: 'Download your README.md file ready to drop into your repository.',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Theme Variants',
    description: 'Customize the look and feel with different color schemes and styles.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Save & Edit',
    description: 'Save your READMEs to your account and edit them anytime.',
  },
];

const steps = [
  { step: '1', title: 'Fill the Form', desc: 'Enter your project details, features, and links.' },
  { step: '2', title: 'Choose Template', desc: 'Pick from free or premium professional templates.' },
  { step: '3', title: 'Export README', desc: 'Copy to clipboard or download as README.md file.' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* ============ Hero Section ============ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">
              Trusted by 10,000+ developers
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
            Create Professional
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              GitHub READMEs
            </span>
            <br />
            in Minutes
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 animate-slide-up">
            Stop struggling with markdown. Generate beautiful, professional README.md 
            files with our intuitive form-based tool. Templates, badges, and live preview included.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <Link
              to="/generator"
              className="btn-primary text-lg px-8 py-3.5 flex items-center space-x-2 group"
            >
              <span>Start Generating</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="btn-secondary text-lg px-8 py-3.5"
            >
              View Pricing
            </Link>
          </div>

          {/* Preview mockup */}
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="card p-0 overflow-hidden shadow-2xl shadow-primary-600/10">
              {/* Window chrome */}
              <div className="flex items-center space-x-2 px-4 py-3 bg-dark-800 border-b border-dark-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-dark-400 ml-3 font-mono">README.md</span>
              </div>
              {/* Fake markdown content */}
              <div className="p-6 text-left font-mono text-sm space-y-3">
                <p className="text-primary-400 text-lg font-bold"># 🚀 My Awesome Project</p>
                <p className="text-dark-300">&gt; A powerful tool that transforms your workflow</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">React</span>
                  <span className="px-2 py-0.5 bg-green-600/20 text-green-400 rounded text-xs">Node.js</span>
                  <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded text-xs">TypeScript</span>
                  <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded text-xs">MIT License</span>
                </div>
                <p className="text-dark-400">## ✨ Features</p>
                <p className="text-dark-300">- ✅ Blazing fast performance</p>
                <p className="text-dark-300">- ✅ Beautiful, responsive UI</p>
                <p className="text-dark-300">- ✅ Full TypeScript support</p>
                <p className="text-dark-500">...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ How It Works ============ */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Three simple steps to a professional README
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="card-hover text-center">
                <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-primary-400">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-dark-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Features Grid ============ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Packed with features to make your documentation shine
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card-hover group"
              >
                <div className="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/20 transition-colors text-primary-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Social Proof ============ */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by Developers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "This tool saved me hours of formatting. My project README went from plain text to professional in 5 minutes.",
                name: "Sarah Chen",
                role: "Full-Stack Developer",
              },
              {
                quote: "The Pro templates are incredible. The advanced template with collapsible sections makes my docs look amazing.",
                name: "Marcus Johnson",
                role: "Open Source Maintainer",
              },
              {
                quote: "Finally, a README generator that actually produces good markdown. The badges integration is 🔥.",
                name: "Alex Rivera",
                role: "DevOps Engineer",
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="card">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-dark-200 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-dark-400 text-xs">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA Section ============ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card p-12 bg-gradient-to-br from-primary-600/10 to-blue-600/10 border-primary-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Create Your README?
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers who use README Generator Pro to create 
              stunning documentation for their projects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3.5 flex items-center space-x-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-dark-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
