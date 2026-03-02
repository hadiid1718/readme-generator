/**
 * Admin Dashboard Page
 * Sidebar + main content layout for admin operations:
 * Overview/Stats, User Management
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  BarChart3,
  FileText,
  DollarSign,
  Crown,
  Loader2,
  Search,
  ChevronRight,
  Trash2,
  Edit3,
  Menu,
  LogOut,
  Eye,
  X,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  PieChart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { adminAPI } from '../lib/api';

// ============ Types ============
interface AdminStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalReadmes: number;
  totalRevenue: number;
  monthlySignups: { _id: { year: number; month: number }; count: number }[];
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  subscriptionStatus: string;
  exportsUsedThisMonth: number;
  createdAt: string;
}

interface SubscriptionStats {
  overview: {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    proPercentage: string;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    pastDueSubscriptions: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: string;
    monthlyChart: { _id: { year: number; month: number }; total: number; count: number }[];
  };
  activity: {
    newProThisMonth: number;
    newFreeThisMonth: number;
    recentTransactions: {
      _id: string;
      userId: { _id: string; name: string; email: string; plan: string } | null;
      event: string;
      plan: string;
      amount: number;
      currency: string;
      createdAt: string;
      details: string;
    }[];
  };
  _fetchedAt: string;
}

type AdminSection = 'overview' | 'users' | 'subscriptions';

// ============ Main Admin Dashboard ============
const AdminDashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users list
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Edit modal
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ role: '', plan: '', subscriptionStatus: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Detail modal
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Subscription stats
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [subStatsLoading, setSubStatsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Real-time polling interval (30 seconds)
  const POLL_INTERVAL = 30_000;

  useEffect(() => {
    loadStats();

    // Real-time polling for overview stats
    const statsInterval = setInterval(() => {
      loadStats(true);
    }, POLL_INTERVAL);

    return () => clearInterval(statsInterval);
  }, []);

  // Real-time polling for subscription stats
  useEffect(() => {
    if (activeSection === 'subscriptions') {
      loadSubStats();
      const subInterval = setInterval(() => {
        loadSubStats(true);
      }, POLL_INTERVAL);
      return () => clearInterval(subInterval);
    }
  }, [activeSection]);

  const loadStats = async (silent = false) => {
    if (!silent) setStatsLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data.stats);
      setRecentUsers(res.data.data.recentUsers);
      setLastRefresh(new Date());
    } catch {
      if (!silent) toast.error('Failed to load admin stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadSubStats = async (silent = false) => {
    if (!silent) setSubStatsLoading(true);
    try {
      const res = await adminAPI.getSubscriptionStats();
      setSubStats(res.data.data);
      setLastRefresh(new Date());
    } catch {
      if (!silent) toast.error('Failed to load subscription stats');
    } finally {
      setSubStatsLoading(false);
    }
  };

  const loadUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.getUsers(page, 20, searchQuery, planFilter, roleFilter);
      setUsers(res.data.data.users);
      setUsersPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'users') {
      loadUsers();
    }
  }, [activeSection, planFilter, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      loadUsers(usersPagination.page);
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({
      role: u.role,
      plan: u.plan,
      subscriptionStatus: u.subscriptionStatus,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    try {
      await adminAPI.updateUser(editingUser._id, editForm);
      toast.success('User updated');
      setEditingUser(null);
      loadUsers(usersPagination.page);
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditSaving(false);
    }
  };

  const handleViewUser = async (id: string) => {
    setViewLoading(true);
    try {
      const res = await adminAPI.getUserById(id);
      setViewingUser(res.data.data);
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sidebarItems: { key: AdminSection; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ===== Sidebar ===== */}
        <aside
          className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-dark-800 border-r border-dark-700 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Admin badge */}
          <div className="p-5 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <span className="text-xs text-red-400 font-medium">Admin Panel</span>
              </div>
            </div>
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
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeSection === item.key && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-dark-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-sm px-4 py-2 rounded-lg text-red-400 hover:bg-red-600/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] bg-dark-900">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-dark-700">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white capitalize">{activeSection}</h1>
            <div className="w-9" />
          </div>

          <div className="p-6 lg:p-8 max-w-6xl">
            {/* ========== OVERVIEW ========== */}
            {activeSection === 'overview' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
                  <p className="text-dark-400 mt-1 flex items-center space-x-2">
                    <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                    <span>Live · Auto-refreshes every 30s · {lastRefresh.toLocaleTimeString()}</span>
                  </p>
                </div>

                {statsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : stats ? (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                      <div className="card flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-400">Total Users</p>
                          <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                      </div>

                      <div className="card flex items-center space-x-4">
                        <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
                          <Crown className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-400">Pro Users</p>
                          <p className="text-2xl font-bold text-white">{stats.proUsers}</p>
                          <p className="text-xs text-dark-500">
                            {stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}% conversion
                          </p>
                        </div>
                      </div>

                      <div className="card flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-400">Total READMEs</p>
                          <p className="text-2xl font-bold text-white">{stats.totalReadmes}</p>
                        </div>
                      </div>

                      <div className="card flex items-center space-x-4">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-400">Total Revenue</p>
                          <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Monthly signups */}
                    {stats.monthlySignups.length > 0 && (
                      <div className="card mb-8">
                        <h2 className="text-lg font-bold text-white mb-4">Monthly Signups</h2>
                        <div className="flex items-end space-x-2 h-32">
                          {stats.monthlySignups.map((m, i) => {
                            const max = Math.max(...stats.monthlySignups.map((s) => s.count), 1);
                            const height = (m.count / max) * 100;
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-dark-400">{m.count}</span>
                                <div
                                  className="w-full bg-primary-600/40 rounded-t-md min-h-[4px]"
                                  style={{ height: `${height}%` }}
                                />
                                <span className="text-[10px] text-dark-500">
                                  {monthNames[m._id.month - 1]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recent Users */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Recent Users</h2>
                        <button
                          onClick={() => setActiveSection('users')}
                          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentUsers.map((u) => (
                          <div key={u._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-700 transition-colors">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-white">
                                  {u.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                <p className="text-xs text-dark-500 truncate">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${u.plan === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-600 text-dark-400'}`}>
                                {u.plan.toUpperCase()}
                              </span>
                              <span className="text-xs text-dark-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* ========== SUBSCRIPTIONS ========== */}
            {activeSection === 'subscriptions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Subscriptions & Revenue</h1>
                    <p className="text-dark-400 mt-1 flex items-center space-x-2">
                      <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                      <span>Live data · Last updated {lastRefresh.toLocaleTimeString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => loadSubStats()}
                    className="btn-secondary text-sm flex items-center space-x-2"
                    disabled={subStatsLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${subStatsLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {subStatsLoading && !subStats ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : subStats ? (
                  <>
                    {/* Revenue Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                      <div className="card bg-gradient-to-br from-emerald-900/20 to-dark-800 border-emerald-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">ALL TIME</span>
                        </div>
                        <p className="text-sm text-dark-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-white mt-1">${subStats.revenue.totalRevenue.toFixed(2)}</p>
                      </div>

                      <div className="card bg-gradient-to-br from-blue-900/20 to-dark-800 border-blue-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400">THIS MONTH</span>
                        </div>
                        <p className="text-sm text-dark-400">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-white mt-1">${subStats.revenue.monthlyRevenue.toFixed(2)}</p>
                        <div className="flex items-center mt-2 text-xs">
                          {parseFloat(subStats.revenue.revenueGrowth) >= 0 ? (
                            <span className="flex items-center text-green-400">
                              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                              {subStats.revenue.revenueGrowth}% vs last month
                            </span>
                          ) : (
                            <span className="flex items-center text-red-400">
                              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                              {subStats.revenue.revenueGrowth}% vs last month
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="card bg-gradient-to-br from-amber-900/20 to-dark-800 border-amber-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-amber-400" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400">PRO</span>
                        </div>
                        <p className="text-sm text-dark-400">Pro Users</p>
                        <p className="text-3xl font-bold text-white mt-1">{subStats.overview.proUsers}</p>
                        <p className="text-xs text-dark-500 mt-1">{subStats.overview.proPercentage}% of total users</p>
                      </div>

                      <div className="card bg-gradient-to-br from-gray-900/20 to-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-dark-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-dark-300" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-dark-600 text-dark-300">FREE</span>
                        </div>
                        <p className="text-sm text-dark-400">Free Users</p>
                        <p className="text-3xl font-bold text-white mt-1">{subStats.overview.freeUsers}</p>
                        <p className="text-xs text-dark-500 mt-1">{(100 - parseFloat(subStats.overview.proPercentage)).toFixed(1)}% of total users</p>
                      </div>
                    </div>

                    {/* Subscription Status Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="card">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                          <PieChart className="w-5 h-5 text-primary-400" />
                          <span>Subscription Status</span>
                        </h2>
                        <div className="space-y-4">
                          {/* Active */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-dark-300 flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                                <span>Active</span>
                              </span>
                              <span className="text-sm font-semibold text-white">{subStats.overview.activeSubscriptions}</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${subStats.overview.totalUsers > 0 ? (subStats.overview.activeSubscriptions / subStats.overview.totalUsers) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          {/* Canceled */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-dark-300 flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                                <span>Canceled</span>
                              </span>
                              <span className="text-sm font-semibold text-white">{subStats.overview.canceledSubscriptions}</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${subStats.overview.totalUsers > 0 ? (subStats.overview.canceledSubscriptions / subStats.overview.totalUsers) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          {/* Past Due */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-dark-300 flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                <span>Past Due</span>
                              </span>
                              <span className="text-sm font-semibold text-white">{subStats.overview.pastDueSubscriptions}</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${subStats.overview.totalUsers > 0 ? (subStats.overview.pastDueSubscriptions / subStats.overview.totalUsers) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          {/* Free (no subscription) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-dark-300 flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-dark-400"></span>
                                <span>Free (No Subscription)</span>
                              </span>
                              <span className="text-sm font-semibold text-white">{subStats.overview.freeUsers}</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                              <div
                                className="bg-dark-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${subStats.overview.totalUsers > 0 ? (subStats.overview.freeUsers / subStats.overview.totalUsers) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Summary badges */}
                        <div className="mt-6 pt-4 border-t border-dark-700 grid grid-cols-2 gap-3">
                          <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-dark-400">New Pro (this month)</p>
                            <p className="text-xl font-bold text-amber-400 mt-1">{subStats.activity.newProThisMonth}</p>
                          </div>
                          <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-dark-400">New Free (this month)</p>
                            <p className="text-xl font-bold text-dark-300 mt-1">{subStats.activity.newFreeThisMonth}</p>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Chart */}
                      <div className="card">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-emerald-400" />
                          <span>Revenue Trend (12 months)</span>
                        </h2>
                        {subStats.revenue.monthlyChart.length > 0 ? (
                          <div className="flex items-end space-x-1.5 h-44">
                            {subStats.revenue.monthlyChart.map((m, i) => {
                              const max = Math.max(...subStats.revenue.monthlyChart.map((s) => s.total), 1);
                              const height = (m.total / max) * 100;
                              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                  <div className="relative">
                                    <span className="text-[10px] text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dark-700 px-1.5 py-0.5 rounded">
                                      ${m.total.toFixed(0)}
                                    </span>
                                  </div>
                                  <div
                                    className="w-full bg-gradient-to-t from-emerald-600/60 to-emerald-400/40 rounded-t-md min-h-[4px] transition-all duration-500 hover:from-emerald-600/80 hover:to-emerald-400/60"
                                    style={{ height: `${Math.max(height, 3)}%` }}
                                  />
                                  <span className="text-[10px] text-dark-500">
                                    {monthNames[m._id.month - 1]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-44 text-dark-500">
                            <p>No revenue data yet</p>
                          </div>
                        )}

                        {/* Last month comparison */}
                        <div className="mt-6 pt-4 border-t border-dark-700 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-dark-400">Last Month Revenue</p>
                            <p className="text-lg font-bold text-white">${subStats.revenue.lastMonthRevenue.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-dark-400">Growth</p>
                            <p className={`text-lg font-bold flex items-center ${
                              parseFloat(subStats.revenue.revenueGrowth) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {parseFloat(subStats.revenue.revenueGrowth) >= 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {subStats.revenue.revenueGrowth}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="card">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span>Recent Transactions</span>
                        <span className="ml-auto flex items-center space-x-1 text-xs text-dark-500">
                          <Clock className="w-3 h-3" />
                          <span>Auto-refreshes every 30s</span>
                        </span>
                      </h2>
                      {subStats.activity.recentTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-dark-700">
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-dark-400 uppercase">User</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-dark-400 uppercase">Event</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-dark-400 uppercase">Amount</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-dark-400 uppercase">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700/50">
                              {subStats.activity.recentTransactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-dark-800/50 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{tx.userId?.name || 'Deleted User'}</p>
                                      <p className="text-xs text-dark-500 truncate">{tx.userId?.email || '-'}</p>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      tx.event === 'subscribed' || tx.event === 'renewed' ? 'bg-green-500/20 text-green-400' :
                                      tx.event === 'canceled' || tx.event === 'expired' ? 'bg-red-500/20 text-red-400' :
                                      'bg-amber-500/20 text-amber-400'
                                    }`}>
                                      {tx.event}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-sm font-semibold text-emerald-400">
                                      ${tx.amount?.toFixed(2) || '0.00'} <span className="text-[10px] text-dark-500 uppercase">{tx.currency}</span>
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-sm text-dark-400">
                                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-dark-400">
                          <DollarSign className="w-10 h-10 mx-auto mb-3 text-dark-600" />
                          <p>No transactions yet</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* ========== USERS ========== */}
            {activeSection === 'users' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">User Management</h1>
                  <p className="text-dark-400 text-sm mt-1">{usersPagination.total} total users</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="input-field pl-10 w-full"
                    />
                  </form>
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="input-field w-full sm:w-32"
                  >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field w-full sm:w-32"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {usersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <>
                    {/* Users Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-dark-700">
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">Role</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">Plan</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">Joined</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700/50">
                          {users.map((u) => (
                            <tr key={u._id} className="hover:bg-dark-800/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    {u.avatar ? (
                                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                      <span className="text-xs font-bold text-white">{u.name?.charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                    <p className="text-xs text-dark-500 truncate">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-dark-600 text-dark-300'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.plan === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-600 text-dark-300'}`}>
                                  {u.plan}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  u.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                                  u.subscriptionStatus === 'past_due' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-dark-600 text-dark-400'
                                }`}>
                                  {u.subscriptionStatus}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-dark-400">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => handleViewUser(u._id)}
                                    className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditUser(u)}
                                    className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {users.length === 0 && !usersLoading && (
                      <div className="text-center py-12 text-dark-400">
                        <Users className="w-10 h-10 mx-auto mb-3 text-dark-600" />
                        <p>No users found</p>
                      </div>
                    )}

                    {/* Pagination */}
                    {usersPagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: usersPagination.pages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => loadUsers(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              page === usersPagination.page
                                ? 'bg-primary-600 text-white'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== Edit User Modal ===== */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-md relative">
            <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">Edit User</h2>
            <p className="text-sm text-dark-400 mb-6">{editingUser.name} ({editingUser.email})</p>

            <div className="space-y-4">
              <div>
                <label className="label">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Plan</label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label className="label">Subscription Status</label>
                <select
                  value={editForm.subscriptionStatus}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="none">None</option>
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSaveEdit} disabled={editSaving} className="btn-primary text-sm flex items-center space-x-2">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== View User Modal ===== */}
      {(viewingUser || viewLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setViewingUser(null)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {viewLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : viewingUser ? (
              <>
                <h2 className="text-lg font-bold text-white mb-4">User Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-dark-400">Name</span><span className="text-white">{viewingUser.user.name}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Email</span><span className="text-white">{viewingUser.user.email}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Role</span><span className={`px-2 py-0.5 rounded text-xs font-medium ${viewingUser.user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-dark-600 text-dark-300'}`}>{viewingUser.user.role}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Plan</span><span className="text-white capitalize">{viewingUser.user.plan}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Subscription</span><span className="text-white capitalize">{viewingUser.user.subscriptionStatus}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">READMEs Created</span><span className="text-white">{viewingUser.readmeCount}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Exports This Month</span><span className="text-white">{viewingUser.user.exportsUsedThisMonth}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Joined</span><span className="text-white">{new Date(viewingUser.user.createdAt).toLocaleDateString()}</span></div>
                  {viewingUser.user.stripeCustomerId && (
                    <div className="flex justify-between"><span className="text-dark-400">Stripe ID</span><span className="text-white text-xs font-mono">{viewingUser.user.stripeCustomerId}</span></div>
                  )}
                </div>

                {viewingUser.subscriptionHistory?.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-dark-700">
                    <h3 className="text-sm font-semibold text-white mb-3">Subscription History</h3>
                    <div className="space-y-2">
                      {viewingUser.subscriptionHistory.map((h: any) => (
                        <div key={h._id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-dark-700/50">
                          <span className={`font-medium ${
                            h.event === 'subscribed' || h.event === 'renewed' ? 'text-green-400' :
                            h.event === 'canceled' || h.event === 'expired' ? 'text-red-400' :
                            'text-amber-400'
                          }`}>{h.event}</span>
                          <span className="text-dark-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
