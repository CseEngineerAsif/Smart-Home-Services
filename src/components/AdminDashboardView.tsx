import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Building,
  UserCheck,
  UserX,
  Radio,
  Sliders,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  FileText,
  Sparkles,
  User,
} from 'lucide-react';
import {
  AppUser,
  ServiceProvider,
  ServiceRequest,
  ServiceStatus,
  ServiceCategory,
  ServiceUrgency,
} from '../types';
import { DHAKA_AREAS, SERVICE_CATEGORIES } from '../data/mockData';
import { AdminProfileView } from './AdminProfileView';

export type AdminSubTab = 'overview' | 'bookings' | 'providers' | 'categories' | 'audit-logs' | 'profile';

interface AdminDashboardViewProps {
  adminUser: AppUser;
  requests: ServiceRequest[];
  providers: ServiceProvider[];
  categories: ServiceCategory[];
  onUpdateJobStatus: (requestId: string, newStatus: ServiceStatus, note?: string) => void;
  onReassignProvider: (requestId: string, newProviderId: string) => void;
  onToggleProviderVerification: (providerId: string) => void;
  onToggleProviderSuspension: (providerId: string) => void;
  onAddNewProvider: (provider: ServiceProvider) => void;
  onToggleCategoryActive: (categoryId: string) => void;
  onUpdateAdminProfile?: (updatedAdmin: AppUser) => void;
  activeSubTab?: AdminSubTab;
  onSubTabChange?: (tab: AdminSubTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminUser,
  requests,
  providers,
  categories,
  onUpdateJobStatus,
  onReassignProvider,
  onToggleProviderVerification,
  onToggleProviderSuspension,
  onAddNewProvider,
  onToggleCategoryActive,
  onUpdateAdminProfile,
  activeSubTab: externalSubTab,
  onSubTabChange: externalSubTabChange,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<AdminSubTab>('overview');
  const activeTab = externalSubTab || internalSubTab;
  const setTab = (tab: AdminSubTab) => {
    if (externalSubTabChange) {
      externalSubTabChange(tab);
    } else {
      setInternalSubTab(tab);
    }
  };

  // Search & Filter states for Bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingUrgencyFilter, setBookingUrgencyFilter] = useState<string>('all');
  const [bookingSearchTerm, setBookingSearchTerm] = useState<string>('');

  // Provider filter states
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');
  const [providerStatusFilter, setProviderStatusFilter] = useState<string>('all');
  const [providerSearchTerm, setProviderSearchTerm] = useState<string>('');

  // Modals inside Admin
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<ServiceRequest | null>(null);
  const [reassigningRequestId, setReassigningRequestId] = useState<string | null>(null);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);

  // New Provider Form state
  const [newProvName, setNewProvName] = useState('');
  const [newProvPhone, setNewProvPhone] = useState('+880 1711-');
  const [newProvEmail, setNewProvEmail] = useState('');
  const [newProvCategory, setNewProvCategory] = useState<string>(categories[0]?.name || 'Appliance and Gadget Repair');
  const [newProvLocation, setNewProvLocation] = useState<string>('Dhanmondi');
  const [newProvPrice, setNewProvPrice] = useState(850);
  const [newProvExperience, setNewProvExperience] = useState(6);
  const [newProvSpecialties, setNewProvSpecialties] = useState('');

  // Calculate High Level Platform KPIs
  const totalBookings = requests.length;
  const activeJobs = requests.filter(
    (r) => ['Requested', 'Assigned', 'Accepted', 'On The Way', 'In Progress'].includes(r.status)
  ).length;
  const completedJobs = requests.filter((r) => r.status === 'Completed').length;
  const emergencyJobs = requests.filter((r) => r.urgency === 'Emergency').length;
  const activeProvidersCount = providers.filter((p) => p.status !== 'suspended').length;
  const totalGrossVolume = requests
    .filter((r) => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + (r.estimatedPrice || 800), 0);
  const platformCommission = Math.round(totalGrossVolume * 0.15); // 15% commission

  // Dhaka area distribution count
  const areaDistribution: Record<string, number> = {};
  requests.forEach((r) => {
    const loc = r.location || 'Dhanmondi';
    areaDistribution[loc] = (areaDistribution[loc] || 0) + 1;
  });

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    const matchesStatus =
      bookingStatusFilter === 'all' || r.status.toLowerCase() === bookingStatusFilter.toLowerCase();
    const matchesUrgency =
      bookingUrgencyFilter === 'all' || r.urgency.toLowerCase() === bookingUrgencyFilter.toLowerCase();
    const searchLower = bookingSearchTerm.toLowerCase();
    const matchesSearch =
      !searchLower ||
      r.id.toLowerCase().includes(searchLower) ||
      r.customerName.toLowerCase().includes(searchLower) ||
      r.serviceCategory.toLowerCase().includes(searchLower) ||
      r.serviceType.toLowerCase().includes(searchLower) ||
      (r.assignedProviderName && r.assignedProviderName.toLowerCase().includes(searchLower));

    return matchesStatus && matchesUrgency && matchesSearch;
  });

  // Filtered providers list
  const filteredProviders = providers.filter((p) => {
    const matchesCat =
      providerCategoryFilter === 'all' ||
      p.serviceCategories.some((c) => c.toLowerCase() === providerCategoryFilter.toLowerCase());
    const isSuspended = p.status === 'suspended';
    const isVerified = p.isVerified !== false;

    let matchesStatus = true;
    if (providerStatusFilter === 'verified') matchesStatus = isVerified && !isSuspended;
    if (providerStatusFilter === 'pending') matchesStatus = !isVerified && !isSuspended;
    if (providerStatusFilter === 'suspended') matchesStatus = isSuspended;

    const sLower = providerSearchTerm.toLowerCase();
    const matchesSearch =
      !sLower ||
      p.name.toLowerCase().includes(sLower) ||
      p.location.toLowerCase().includes(sLower) ||
      p.specialties.some((s) => s.toLowerCase().includes(sLower));

    return matchesCat && matchesStatus && matchesSearch;
  });

  // Handle Add New Provider submit
  const handleCreateProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim()) return;

    const newEntity: ServiceProvider = {
      id: `prov_${Date.now().toString().slice(-4)}`,
      name: newProvName.trim(),
      phone: newProvPhone.trim(),
      email: newProvEmail.trim() || `${newProvName.toLowerCase().replace(/\s+/g, '')}@servo.bd`,
      serviceCategories: [newProvCategory],
      specialties: newProvSpecialties
        ? newProvSpecialties.split(',').map((s) => s.trim())
        : [newProvCategory],
      location: newProvLocation,
      rating: 5.0,
      reviewCount: 1,
      basePrice: Number(newProvPrice) || 800,
      experienceYears: Number(newProvExperience) || 5,
      availableTimeSlots: [
        '09:00 AM - 11:00 AM',
        '11:00 AM - 01:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM',
        'Immediate (Within 30 mins)',
      ],
      currentWorkload: 0,
      completedJobs: 0,
      isAvailable: true,
      isVerified: true,
      status: 'active',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    onAddNewProvider(newEntity);
    setShowAddProviderModal(false);
    setNewProvName('');
    setNewProvSpecialties('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                ADMIN COMMAND CENTER
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Dispatch Network Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Operations & Dispatch Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Logged in as <strong className="text-white">{adminUser.name}</strong> •{' '}
              {adminUser.adminDepartment || 'Operations Headquarters'} • Dhaka, Bangladesh (BST +06:00)
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="admin-profile-header-btn"
              onClick={() => setTab('profile')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="View & Edit Admin Profile"
            >
              {adminUser.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl}
                  alt={adminUser.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-purple-400" />
              )}
              <span>Admin Profile</span>
            </button>
            <button
              id="admin-onboard-prov-btn"
              onClick={() => setShowAddProviderModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Provider</span>
            </button>
            <button
              id="admin-refresh-data-btn"
              onClick={() => {
                // Flash notification
                alert('Platform dispatch telemetry re-synchronized with all Dhaka service hubs.');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Sync Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Sync Live</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
              <span>Total Bookings</span>
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-xl font-black text-white mt-1">{totalBookings}</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +18% this week
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
              <span>Active Dispatches</span>
              <Radio className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xl font-black text-white mt-1">{activeJobs}</p>
            <span className="text-[10px] text-amber-400 font-semibold mt-0.5 block">
              In transit / On-site
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
              <span>Verified Technicians</span>
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-xl font-black text-white mt-1">{activeProvidersCount}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
              Across 8 categories
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
              <span>Gross Volume</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-white mt-1">৳{totalGrossVolume.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
              Platform GMV
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
              <span>Revenue (15%)</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-xl font-black text-white mt-1">৳{platformCommission.toLocaleString()}</p>
            <span className="text-[10px] text-purple-300 font-semibold mt-0.5 block">
              Net commission
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
              <span>Emergency SLA</span>
              <Clock className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-xl font-black text-white mt-1">99.4%</p>
            <span className="text-[10px] text-rose-300 font-semibold mt-0.5 block">
              {emergencyJobs} urgent cases handled
            </span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          id="admin-tab-overview"
          onClick={() => setTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operations Overview</span>
        </button>

        <button
          id="admin-tab-bookings"
          onClick={() => setTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>All Requests & Dispatch</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-extrabold">
            {requests.length}
          </span>
        </button>

        <button
          id="admin-tab-providers"
          onClick={() => setTab('providers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'providers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Provider Verification & Directory</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-extrabold">
            {providers.length}
          </span>
        </button>

        <button
          id="admin-tab-categories"
          onClick={() => setTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Service Categories</span>
        </button>

        <button
          id="admin-tab-audit"
          onClick={() => setTab('audit-logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'audit-logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>AI & Dispatch Audit Log</span>
        </button>

        <button
          id="admin-tab-profile"
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Admin Profile & Photo</span>
        </button>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Dhaka Area Distribution & Live Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dhaka Area Heatmap / Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dhaka Metropolitan Demand Distribution
                  </h3>
                  <p className="text-xs text-slate-500">Live request volume across major serviced zones</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {Object.keys(areaDistribution).length} Active Hubs
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DHAKA_AREAS.slice(0, 8).map((area) => {
                  const count = areaDistribution[area] || 0;
                  return (
                    <div
                      key={area}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-slate-700">{area}</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg font-black text-slate-900">{count}</span>
                        <span className="text-[10px] text-slate-600 font-medium">orders</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(15, count * 25))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Dispatch Activity Stream */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Dispatch Telemetry</h3>
                  <p className="text-xs text-slate-500">Chronological feed of customer requests and technician updates</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3">
                {requests.slice(0, 6).map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          req.urgency === 'Emergency'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : req.urgency === 'Urgent'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {req.urgency.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            #{req.id} • {req.serviceType}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono">
                            ({req.location})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Customer: <strong className="text-slate-700">{req.customerName}</strong> • Provider:{' '}
                          <strong className="text-slate-700">{req.assignedProviderName || 'Unassigned'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'In Progress' || req.status === 'On The Way'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {req.status}
                      </span>
                      <p className="text-[10px] text-slate-600 mt-1">{req.preferredTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Admin Controls & Safety Protocols */}
          <div className="space-y-6">
            {/* Urgency SLA Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Emergency Response Protocol</h3>
              <p className="text-xs text-slate-500 mb-4">
                Smart automated 30-minute matching benchmark for hazardous situations (gas, electrical short, flood).
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                    <span>Emergency Escalations</span>
                    <span>{emergencyJobs} Active</span>
                  </div>
                  <p className="text-[11px] text-rose-600 mt-1">
                    Auto-dispatched with highest priority weight to the closest verified technician.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>Urgent Bookings</span>
                    <span>{requests.filter((r) => r.urgency === 'Urgent').length} Handled</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">Average provider acceptance under 4.2 mins.</p>
                </div>
              </div>
            </div>

            {/* Technician Quality & Rating Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Network Quality Metrics</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Average Technician Rating</span>
                  <span className="font-bold text-slate-900">4.78 / 5.0 ★</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Job Completion Rate</span>
                  <span className="font-bold text-emerald-600">98.2%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Auto-Reassignment Success</span>
                  <span className="font-bold text-blue-600">100% Zero-Drop</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Customer Re-book Rate</span>
                  <span className="font-bold text-purple-600">64.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ALL BOOKINGS & DISPATCH */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="admin-search-bookings-input"
                type="text"
                value={bookingSearchTerm}
                onChange={(e) => setBookingSearchTerm(e.target.value)}
                placeholder="Search by ID, customer name, technician, or service..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                id="admin-filter-booking-status"
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Assigned">Assigned</option>
                <option value="Accepted">Accepted</option>
                <option value="On The Way">On The Way</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Urgency Filter */}
              <select
                id="admin-filter-booking-urgency"
                value={bookingUrgencyFilter}
                onChange={(e) => setBookingUrgencyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Urgencies</option>
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service & Area</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No matching requests found for your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{req.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{req.customerName}</p>
                        <p className="text-[10px] text-slate-600">{req.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{req.serviceType}</p>
                        <p className="text-[10px] text-slate-600 font-medium">{req.location}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{req.preferredTime}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.urgency === 'Emergency'
                              ? 'bg-rose-100 text-rose-700'
                              : req.urgency === 'Urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">
                          {req.assignedProviderName || 'Not Assigned'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            req.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'In Progress' || req.status === 'On The Way'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">৳{req.estimatedPrice || 850}</p>
                        {req.payment ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                            req.payment.method === 'bkash'
                              ? 'bg-pink-100 text-[#E2136E]'
                              : req.payment.method === 'nagad'
                              ? 'bg-orange-100 text-[#D83726]'
                              : req.payment.method === 'card'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {req.payment.method} ({req.payment.status === 'paid' ? 'Paid' : 'Deposit'})
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase mt-0.5">
                            COD
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRequestForDetail(req)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setReassigningRequestId(req.id)}
                            className="px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 text-[11px] font-semibold transition-colors"
                          >
                            Reassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PROVIDER MANAGEMENT & VERIFICATION */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          {/* Provider Controls & Filters */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="admin-search-providers-input"
                type="text"
                value={providerSearchTerm}
                onChange={(e) => setProviderSearchTerm(e.target.value)}
                placeholder="Search technician name, specialties, or area..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                id="admin-filter-provider-category"
                value={providerCategoryFilter}
                onChange={(e) => setProviderCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Service Categories</option>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                id="admin-filter-provider-status"
                value={providerStatusFilter}
                onChange={(e) => setProviderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified & Active</option>
                <option value="pending">Pending Verification</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                id="admin-add-provider-btn"
                onClick={() => setShowAddProviderModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Provider</span>
              </button>
            </div>
          </div>

          {/* Provider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((prov) => {
              const isSuspended = prov.status === 'suspended';
              const isVerified = prov.isVerified !== false;

              return (
                <div
                  key={prov.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    isSuspended
                      ? 'border-rose-200 bg-rose-50/20 opacity-80'
                      : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prov.avatar}
                        alt={prov.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900">{prov.name}</h4>
                          {isVerified && !isSuspended && (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{prov.location} • {prov.phone}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSuspended
                          ? 'bg-rose-100 text-rose-700'
                          : isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isSuspended ? 'Suspended' : isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-600 block">Rating</span>
                      <strong className="text-slate-800">{prov.rating} ★</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-600 block">Done Jobs</span>
                      <strong className="text-slate-800">{prov.completedJobs}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-600 block">Base Price</span>
                      <strong className="text-slate-800">৳{prov.basePrice}</strong>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Categories:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prov.serviceCategories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleProviderVerification(prov.id)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        isVerified
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isVerified ? 'Unverify' : 'Verify'}</span>
                    </button>

                    <button
                      onClick={() => onToggleProviderSuspension(prov.id)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        isSuspended
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      }`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Service Category Catalog & Pricing</h3>
              <p className="text-xs text-slate-500">
                Manage active categories, sub-services, base standard rates, and availability across Dhaka.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
              {categories.length} Categories Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const isActive = cat.isActive !== false;
              const providerCountForCat = providers.filter((p) =>
                p.serviceCategories.includes(cat.name)
              ).length;

              return (
                <div
                  key={cat.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isActive ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                    </div>
                    <button
                      onClick={() => onToggleCategoryActive(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Sub-services ({cat.subServices.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cat.subServices.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{providerCountForCat} Verified Technicians in Dhaka</span>
                    <span className="font-bold text-slate-800">SLA: &lt; 30 mins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: AUDIT & AI LOGS */}
      {activeTab === 'audit-logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Diagnostic & Automated Dispatch Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Verified logs of symptom evaluations, multi-factor ranking scores, and auto-reassignments
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              Audit Stream Nominal
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>[2026-09-08 02:15:30 BST] • AI-ANALYSIS-DIAGNOSTIC</span>
                <span className="text-emerald-600 font-bold">Confidence: 94.2%</span>
              </div>
              <p className="text-slate-800">
                Processed symptom: <span className="text-blue-700 font-semibold">"AC loud rattling noise and not cooling"</span> →
                Categorized to <span className="font-bold text-slate-900">Appliance and Gadget Repair (AC Repair & Servicing)</span>. Urgency: Normal.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>[2026-09-08 02:16:02 BST] • DISPATCH-RANKING-ENGINE</span>
                <span className="text-purple-600 font-bold">Score: 92.4%</span>
              </div>
              <p className="text-slate-800">
                Evaluated 15 providers for Dhanmondi AC Servicing. Top match: <span className="font-bold text-slate-900">Rahim Electronics</span> (Distance: 1.0 km, Availability: Confirmed, Workload: 1).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center justify-between text-amber-800 text-[11px] mb-1">
                <span>[2026-09-08 01:42:10 BST] • AUTO-REASSIGNMENT-TRIGGER</span>
                <span className="text-amber-700 font-bold">SLA: 0.8s Handover</span>
              </div>
              <p className="text-slate-800">
                Provider Karim Plumbing marked busy. Automatic Reassignment triggered for Request #req_102. Auto-rerouted to next best candidate: <span className="font-bold text-slate-900">Plumber Point Dhaka</span> (Distance: 2.2km).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center justify-between text-rose-800 text-[11px] mb-1">
                <span>[2026-09-08 11:10:00 BST] • EMERGENCY-ELEVATION</span>
                <span className="text-rose-700 font-bold">Priority: CRITICAL</span>
              </div>
              <p className="text-slate-800">
                Detected keyword: "Emergency Short Circuit / Sparks" in Dhanmondi. Priority elevated to <span className="font-bold text-rose-700">Emergency (30-min SLA)</span>. Dispatched FastFix Electrical.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ADMIN PROFILE */}
      {activeTab === 'profile' && (
        <AdminProfileView
          adminUser={adminUser}
          onUpdateAdminProfile={(updated) => onUpdateAdminProfile?.(updated)}
          onSwitchToOverview={() => setTab('overview')}
        />
      )}

      {/* DETAIL MODAL FOR ADMIN */}
      {selectedRequestForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  #{selectedRequestForDetail.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedRequestForDetail.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequestForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50">
                <div>
                  <span className="text-slate-600 block">Customer</span>
                  <strong className="text-slate-900">{selectedRequestForDetail.customerName}</strong>
                  <p className="text-[10px] text-slate-600">{selectedRequestForDetail.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-600 block">Assigned Technician</span>
                  <strong className="text-slate-900">
                    {selectedRequestForDetail.assignedProviderName || 'Unassigned'}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-slate-600 block mb-0.5">Problem Description</span>
                <p className="p-3 rounded-xl bg-slate-50 text-slate-800 font-medium">
                  {selectedRequestForDetail.description || 'No custom note provided.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-600 block">Location</span>
                  <strong className="text-slate-800">{selectedRequestForDetail.location}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-600 block">Slot</span>
                  <strong className="text-slate-800">{selectedRequestForDetail.preferredTime}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-600 block">Status</span>
                  <strong className="text-purple-700">{selectedRequestForDetail.status}</strong>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                    Payment & Escrow Information
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white border border-indigo-200 text-indigo-700">
                    {selectedRequestForDetail.payment ? selectedRequestForDetail.payment.method.toUpperCase() : 'CASH ON DELIVERY'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Estimated Fee:</span>
                    <strong className="text-slate-900">৳{selectedRequestForDetail.estimatedPrice} BDT</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Escrow Paid Amount:</span>
                    <strong className="text-emerald-700">
                      ৳{selectedRequestForDetail.payment?.paidAmount ?? (selectedRequestForDetail.status === 'Completed' ? selectedRequestForDetail.estimatedPrice : 0)} BDT
                    </strong>
                  </div>
                  {selectedRequestForDetail.payment?.transactionId && (
                    <div className="col-span-2 pt-1 border-t border-indigo-100/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">TrxID:</span>
                      <span className="font-mono font-bold text-indigo-900">
                        {selectedRequestForDetail.payment.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Force Status change buttons */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Admin Status Override:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Assigned', 'Accepted', 'On The Way', 'In Progress', 'Completed', 'Cancelled'] as ServiceStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateJobStatus(selectedRequestForDetail.id, st, `Admin force-updated status to ${st}`);
                          setSelectedRequestForDetail(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          selectedRequestForDetail.status === st
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN MODAL */}
      {reassigningRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Admin Dispatch: Reassign Request #{reassigningRequestId}
              </h3>
              <button
                onClick={() => setReassigningRequestId(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Select an available verified service technician to take over this service order immediately:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {providers
                .filter((p) => p.status !== 'suspended')
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onReassignProvider(reassigningRequestId, p.id);
                      setReassigningRequestId(null);
                    }}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex items-center justify-between text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.location} • Rating: {p.rating}★ • {p.serviceCategories[0]}</p>
                    </div>
                    <span className="text-xs font-bold text-purple-600">Assign</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ONBOARD NEW PROVIDER MODAL */}
      {showAddProviderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Admin Onboarding: Register New Service Provider
              </h3>
              <button
                onClick={() => setShowAddProviderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Technician Name
                </label>
                <input
                  type="text"
                  required
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  placeholder="e.g. Master Cleaners Dhaka"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newProvPhone}
                    onChange={(e) => setNewProvPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newProvEmail}
                    onChange={(e) => setNewProvEmail(e.target.value)}
                    placeholder="tech@servo.bd"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Category
                  </label>
                  <select
                    value={newProvCategory}
                    onChange={(e) => setNewProvCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dhaka Base Area
                  </label>
                  <select
                    value={newProvLocation}
                    onChange={(e) => setNewProvLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  >
                    {DHAKA_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Price (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={newProvPrice}
                    onChange={(e) => setNewProvPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={newProvExperience}
                    onChange={(e) => setNewProvExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialties (comma separated)
                </label>
                <input
                  type="text"
                  value={newProvSpecialties}
                  onChange={(e) => setNewProvSpecialties(e.target.value)}
                  placeholder="e.g. Inverter AC, Gas Leak, Compressor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all mt-2 cursor-pointer"
              >
                Confirm Technician Verification & Onboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
