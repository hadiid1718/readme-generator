/**
 * Footer Component
 */
import { Link } from 'react-router-dom';
import { FileText, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                README<span className="text-primary-400">Pro</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm max-w-md">
              Generate professional GitHub README.md files in minutes. 
              Beautiful templates, smart badges, and live preview.
            </p>
            <div className="flex items-center space-x-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/generator" className="text-sm text-dark-400 hover:text-white transition-colors">Generator</Link></li>
              <li><Link to="/pricing" className="text-sm text-dark-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-sm text-dark-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms-of-service" className="text-sm text-dark-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/term-of-policy" className="text-sm text-dark-400 hover:text-white transition-colors">Term of Policy</Link></li>
              <li><Link to="/refund-policy" className="text-sm text-dark-400 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-8 text-center">
          <p className="text-sm text-dark-500">
            &copy; {new Date().getFullYear()} README Generator Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
