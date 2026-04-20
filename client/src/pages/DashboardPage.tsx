/**
 * Dashboard Page – Sidebar + Main Content Layout
 * Shows user stats, saved READMEs, subscription history, and profile
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Calendar,
  Download,
  Crown,
  BarChart3,
  Copy,
  CreditCard,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  LayoutDashboard,
  User as UserIcon,
  Settings,
  ChevronRight,
  Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { readmeAPI, paymentAPI } from '../lib/api';
import { SavedReadme, SubscriptionHistoryItem } from '../types';

// ============ Subscription Event Badge ============
const EventBadge = ({ event }: { event: SubscriptionHistoryItem['event'] }) => {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    subscribed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Subscribed' },
    renewed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Renewed' },
    canceled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Canceled' },
    expired: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <Clock className="w-3.5 h-3.5" />, label: 'Expired' },
    payment_failed: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Payment Failed' },
    reactivated: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Reactivated' },
  };
  const s = styles[event] || styles.subscribed;
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon}
      <span>{s.label}</span>
    </span>
  );
};

type SidebarSection = 'overview' | 'readmes' | 'subscription' | 'profile';

// ============ Main Dashboard ============
const DashboardPage = () => {
  const { user, loadUser } = useAuthStore();
  const navigate = useNavigate();

  // Sidebar state
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // README state
  const [readmes, setReadmes] = useState<SavedReadme[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Subscription history state
  const [subHistory, setSubHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subPagination, setSubPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    loadReadmes();
    loadUser();

    // Real-time polling for user dashboard stats (every 60 seconds)
    const pollInterval = setInterval(() => {
      loadReadmes();
      loadUser();
    }, 60_000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadReadmes = async (page = 1) => {
    try {
      const response = await readmeAPI.getAll(page);
      setReadmes(response.data.data.readmes);
      setPagination(response.data.data.pagination);
    } catch {
      toast.error('Failed to load READMEs');
    } finally {
      setLoading(false);
    }
  };

  const loadSubHistory = async (page = 1) => {
    setSubLoading(true);
    try {
      const response = await paymentAPI.getHistory(page, 10);
      setSubHistory(response.data.data.history);
      setSubPagination(response.data.data.pagination);
    } catch {
      toast.error('Failed to load subscription history');
    } finally {
      setSubLoading(false);
    }
  };

  // Load subscription history when section switches
  useEffect(() => {
    if (activeSection === 'subscription' && subHistory.length === 0 && !subLoading) {
      loadSubHistory();
    }
  }, [activeSection]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this README?')) return;
    setDeleting(id);
    try {
      await readmeAPI.delete(id);
      setReadmes((prev) => prev.filter((r) => r._id !== id));
      toast.success('README deleted');
    } catch {
      toast.error('Failed to delete README');
    } finally {
      setDeleting(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await paymentAPI.createPortal();
      window.location.href = response.data.data.url;
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  const exportRemaining =
    user?.plan === 'pro' ? 'Unlimited' : `${Math.max(0, 5 - (user?.exportsUsedThisMonth || 0))} / 5`;

  const subscriptionEndStr =
    user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'canceled'
      ? (user as any)?.subscriptionEndDate
        ? new Date((user as any).subscriptionEndDate).toLocaleDateString()
        : null
      : null;

  // ----- Sidebar Items -----
  const sidebarItems: { key: SidebarSection; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: 'readmes', label: 'My READMEs', icon: <FileText className="w-5 h-5" /> },
    { key: 'subscription', label: 'Subscription', icon: <History className="w-5 h-5" /> },
    { key: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="flex">
        {/* ===== Mobile Sidebar Overlay ===== */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ===== Sidebar ===== */}
        <aside
          className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-dark-800 border-r border-dark-700 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* User info */}
          <div className="p-5 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-dark-600"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <span className="text-xs text-dark-400 truncate block">{user?.email}</span>
              </div>
            </div>
            {user?.plan === 'pro' && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold rounded text-white">
                PRO
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.key
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeSection === item.key && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-dark-700 space-y-2">
            <Link
              to="/generator"
              className="btn-primary w-full flex items-center justify-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New README</span>
            </Link>
            {user?.plan === 'free' && (
              <Link
                to="/pricing"
                className="w-full flex items-center justify-center space-x-2 text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </Link>
            )}
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] bg-dark-900">
          {/* Mobile header with menu toggle */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-dark-700">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white capitalize">{activeSection}</h1>
            <div className="w-9" />
          </div>

          <div className="p-6 lg:p-8 max-w-6xl">
            {/* ========== OVERVIEW SECTION ========== */}
            {activeSection === 'overview' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-dark-400 mt-1 flex items-center space-x-2">
                    <span>Welcome back, {user?.name}</span>
                    <span className="text-dark-600">·</span>
                    <span className="flex items-center space-x-1 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-dark-500">Live</span>
                    </span>
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <div className="card flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user?.plan === 'pro' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-dark-700'}`}>
                      <Crown className={`w-6 h-6 ${user?.plan === 'pro' ? 'text-amber-400' : 'text-dark-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-dark-400">Current Plan</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-bold text-white capitalize">{user?.plan}</p>
                        {user?.plan === 'pro' && (
                          <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold rounded text-white">PRO</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user?.subscriptionStatus === 'active' ? 'bg-green-600/20' : user?.subscriptionStatus === 'past_due' ? 'bg-amber-600/20' : 'bg-dark-700'}`}>
                      <CreditCard className={`w-6 h-6 ${user?.subscriptionStatus === 'active' ? 'text-green-400' : user?.subscriptionStatus === 'past_due' ? 'text-amber-400' : 'text-dark-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-dark-400">Subscription</p>
                      <p className="text-lg font-bold text-white capitalize">
                        {user?.subscriptionStatus === 'none' ? 'No subscription' : user?.subscriptionStatus}
                      </p>
                      {subscriptionEndStr && (
                        <p className="text-xs text-dark-500">
                          {user?.subscriptionStatus === 'canceled' ? 'Ends' : 'Renews'}: {subscriptionEndStr}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="card flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-400">Exports This Month</p>
                      <p className="text-lg font-bold text-white">{exportRemaining}</p>
                    </div>
                  </div>

                  <div className="card flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-400">Total READMEs</p>
                      <p className="text-lg font-bold text-white">{pagination.total}</p>
                    </div>
                  </div>
                </div>

                {/* Upgrade banner */}
                {user?.plan === 'free' && (
                  <div className="card mb-8 bg-gradient-to-r from-primary-600/10 to-blue-600/10 border-primary-500/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <Crown className="w-8 h-8 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">Upgrade to Pro</p>
                          <p className="text-sm text-dark-400">Unlimited exports, premium templates, and custom sections for $4/month</p>
                        </div>
                      </div>
                      <Link to="/pricing" className="btn-primary whitespace-nowrap">Upgrade Now</Link>
                    </div>
                  </div>
                )}

                {user?.plan === 'pro' && (
                  <div className="mb-8">
                    <button onClick={handleManageBilling} className="btn-secondary text-sm">
                      <Settings className="w-4 h-4 inline-block mr-1.5" />Manage Billing
                    </button>
                  </div>
                )}

                {/* Recent READMEs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Recent READMEs</h2>
                    <button onClick={() => setActiveSection('readmes')} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">View all →</button>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
                  ) : readmes.length === 0 ? (
                    <div className="card text-center py-10">
                      <FileText className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                      <p className="text-dark-400">No READMEs yet. Create your first one!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {readmes.map((readme) => (
                        <div key={readme._id} className="card-hover flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-9 h-9 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-primary-400" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-white text-sm truncate">{readme.title}</h3>
                              <span className="text-xs text-dark-500">{new Date(readme.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/generator?edit=${readme._id}`)}
                            className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => loadReadmes(page)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === pagination.page ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== MY READMES SECTION ========== */}
            {activeSection === 'readmes' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">My READMEs</h1>
                    <p className="text-dark-400 text-sm mt-1">{pagination.total} total</p>
                  </div>
                  <Link to="/generator" className="btn-primary flex items-center space-x-2 text-sm">
                    <Plus className="w-4 h-4" />
                    <span>New README</span>
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : readmes.length === 0 ? (
                  <div className="card text-center py-12">
                    <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No READMEs yet</h3>
                    <p className="text-dark-400 mb-6">Create your first professional README in minutes</p>
                    <Link to="/generator" className="btn-primary inline-flex items-center space-x-2">
                      <Plus className="w-4 h-4" /><span>Create README</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {readmes.map((readme) => (
                      <div key={readme._id} className="card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white truncate">{readme.title}</h3>
                            <div className="flex items-center space-x-3 text-xs text-dark-400 mt-0.5">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(readme.createdAt).toLocaleDateString()}</span>
                              </div>
                              <span className="px-1.5 py-0.5 bg-dark-700 rounded text-[10px] uppercase">{readme.templateId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button onClick={() => navigate(`/generator?edit=${readme._id}`)} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(readme.generatedMarkdown || ''); toast.success('Copied to clipboard!'); }} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors" title="Copy Markdown">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(readme._id)} disabled={deleting === readme._id} className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors" title="Delete">
                            {deleting === readme._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => loadReadmes(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === pagination.page ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>{page}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========== SUBSCRIPTION HISTORY SECTION ========== */}
            {activeSection === 'subscription' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Subscription History</h1>
                    <p className="text-dark-400 text-sm mt-1">Billing events and invoices</p>
                  </div>
                  {user?.plan === 'pro' && (
                    <button onClick={handleManageBilling} className="btn-secondary text-sm">Manage Billing</button>
                  )}
                </div>

                {subLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                ) : subHistory.length === 0 ? (
                  <div className="card text-center py-12">
                    <History className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No subscription history</h3>
                    <p className="text-dark-400 mb-6">Your subscription events will appear here when you upgrade to Pro.</p>
                    {user?.plan === 'free' && (
                      <Link to="/pricing" className="btn-primary inline-flex items-center space-x-2">
                        <Crown className="w-4 h-4" /><span>Upgrade to Pro</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subHistory.map((item) => (
                      <div key={item._id} className="card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.event === 'subscribed' || item.event === 'renewed' || item.event === 'reactivated' ? 'bg-green-600/20' : item.event === 'payment_failed' ? 'bg-amber-600/20' : 'bg-red-600/20'
                          }`}>
                            <CreditCard className={`w-5 h-5 ${
                              item.event === 'subscribed' || item.event === 'renewed' || item.event === 'reactivated' ? 'text-green-400' : item.event === 'payment_failed' ? 'text-amber-400' : 'text-red-400'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 mb-0.5">
                              <EventBadge event={item.event} />
                              <span className="text-xs text-dark-500 uppercase font-medium">{item.plan} plan</span>
                            </div>
                            <p className="text-sm text-dark-300">{item.details}</p>
                            <div className="flex items-center space-x-3 text-xs text-dark-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                              {item.amount != null && <span className="font-medium">${item.amount.toFixed(2)} {item.currency?.toUpperCase()}</span>}
                              {item.periodEnd && <span>Period ends: {new Date(item.periodEnd).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {subPagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: subPagination.pages }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => loadSubHistory(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === subPagination.page ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>{page}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========== PROFILE SECTION ========== */}
            {activeSection === 'profile' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">Profile</h1>
                  <p className="text-dark-400 text-sm mt-1">Manage your account details</p>
                </div>

                <div className="card max-w-xl">
                  <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-dark-700">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-dark-600" />
                    ) : (
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
                      <p className="text-sm text-dark-400">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-400">Plan</span>
                      <span className="text-sm font-medium text-white capitalize flex items-center space-x-1.5">
                        <span>{user?.plan}</span>
                        {user?.plan === 'pro' && <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold rounded text-white">PRO</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-400">Subscription</span>
                      <span className="text-sm font-medium text-white capitalize">{user?.subscriptionStatus === 'none' ? 'No subscription' : user?.subscriptionStatus}</span>
                    </div>
                    {subscriptionEndStr && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-400">{user?.subscriptionStatus === 'canceled' ? 'Ends on' : 'Renews on'}</span>
                        <span className="text-sm font-medium text-white">{subscriptionEndStr}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-400">Exports this month</span>
                      <span className="text-sm font-medium text-white">{exportRemaining}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-400">Member since</span>
                      <span className="text-sm font-medium text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-dark-700 flex flex-wrap gap-3">
                    {user?.plan === 'free' && <Link to="/pricing" className="btn-primary text-sm">Upgrade to Pro</Link>}
                    {user?.plan === 'pro' && <button onClick={handleManageBilling} className="btn-secondary text-sm">Manage Billing</button>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
