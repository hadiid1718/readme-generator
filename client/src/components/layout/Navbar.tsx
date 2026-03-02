/**
 * Navbar Component
 * Responsive navigation with auth state awareness
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, FileText, LogOut, User, CreditCard, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-500 transition-colors">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              README<span className="text-primary-400">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/generator"
              className="px-4 py-2 text-dark-200 hover:text-white rounded-lg hover:bg-dark-800 transition-all text-sm font-medium"
            >
              Generator
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 text-dark-200 hover:text-white rounded-lg hover:bg-dark-800 transition-all text-sm font-medium"
            >
              Pricing
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-1 ml-2">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-dark-200 hover:text-white rounded-lg hover:bg-dark-800 transition-all text-sm font-medium flex items-center space-x-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* User menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-dark-800 transition-all">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border border-dark-600"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-dark-200 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    {user?.plan === 'pro' && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold rounded text-white">
                        PRO
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1.5">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-dark-200 hover:text-white hover:bg-dark-700"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/pricing"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-dark-200 hover:text-white hover:bg-dark-700"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Billing</span>
                      </Link>
                      <hr className="border-dark-700 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Sign up free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-dark-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-dark-700 animate-fade-in">
            <div className="flex flex-col space-y-1">
              <Link
                to="/generator"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-dark-200 hover:text-white rounded-lg hover:bg-dark-800 text-sm"
              >
                Generator
              </Link>
              <Link
                to="/pricing"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-dark-200 hover:text-white rounded-lg hover:bg-dark-800 text-sm"
              >
                Pricing
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 text-dark-200 hover:text-white rounded-lg hover:bg-dark-800 text-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-dark-800 text-sm text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary text-sm text-center"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-sm text-center"
                  >
                    Sign up free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
