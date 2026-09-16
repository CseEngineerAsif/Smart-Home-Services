import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Briefcase,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  User,
  Camera,
  Navigation,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { ServiceProvider, ServiceRequest, ServiceStatus } from '../types';

interface ProviderDashboardProps {
  provider: ServiceProvider;
  incomingRequests: ServiceRequest[];
  activeJobs: ServiceRequest[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onUpdateJobStatus: (requestId: string, newStatus: ServiceStatus) => void;
  onToggleAvailability: (available: boolean) => void;
  onTrackJob?: (request: ServiceRequest) => void;
  onOpenChat?: (request: ServiceRequest) => void;
  onOpenWorkProof?: (request: ServiceRequest) => void;
  onOpenMapNavigation?: (request: ServiceRequest) => void;
  activeTab?: 'home' | 'requests' | 'jobs' | 'schedule';
  onTabChange?: (tab: 'home' | 'requests' | 'jobs' | 'schedule') => void;
}

export const ProviderDashboardView: React.FC<ProviderDashboardProps> = ({
  provider,
  incomingRequests,
  activeJobs,
  onAcceptRequest,
  onRejectRequest,
  onUpdateJobStatus,
  onToggleAvailability,
  onTrackJob,
  onOpenChat,
  onOpenWorkProof,
  onOpenMapNavigation,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'home' | 'requests' | 'jobs' | 'schedule'>('home');
  const activeTab = controlledTab ?? internalTab;

  const handleSelectTab = (tab: 'home' | 'requests' | 'jobs' | 'schedule') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* Provider Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {provider.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Service Provider
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    provider.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {provider.isAvailable ? '● Accepting Jobs' : '○ Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {provider.location}, Dhaka
                </span>
                <span>•</span>
                <span className="text-amber-500 font-bold">{provider.rating} ★ ({provider.reviewCount} reviews)</span>
                <span>•</span>
                <span>Specialties: {provider.specialties.join(', ')}</span>
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 self-start md:self-auto">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Live Availability</p>
              <p className="text-[10px] text-slate-500">
                {provider.isAvailable ? 'Receive matching jobs' : 'Auto-diverts to next provider'}
              </p>
            </div>
            <button
              id="provider-availability-toggle"
              type="button"
              onClick={() => onToggleAvailability(!provider.isAvailable)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                provider.isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  provider.isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Workload Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Incoming Requests</span>
            <p className="text-xl font-extrabold text-indigo-700 mt-0.5">{incomingRequests.length}</p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Workload</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{provider.currentWorkload} Jobs</p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Completed All-Time</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{provider.completedJobs}</p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Earnings</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">৳2,400 BDT</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => handleSelectTab('home')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'home'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Home Overview</span>
        </button>

        <button
          onClick={() => handleSelectTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Requests</span>
          {incomingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Active Jobs</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {activeJobs.length}
          </span>
        </button>

        <button
          onClick={() => handleSelectTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule</span>
        </button>
      </div>

      {/* Tab: Provider Home Overview */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Incoming Job Action Alert Banner */}
          {incomingRequests.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 p-5 rounded-3xl border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {incomingRequests.length} Incoming Service Request awaiting your confirmation
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Latest: {incomingRequests[0].serviceType} in {incomingRequests[0].location} (৳{incomingRequests[0].estimatedPrice})
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSelectTab('requests')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                Review Requests Now →
              </button>
            </div>
          )}

          {/* Active Job in Progress Banner if any */}
          {activeJobs.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-xs ring-1 ring-indigo-500/10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900">Immediate Active Job</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {activeJobs[0].status}
                  </span>
                </div>
                <button
                  onClick={() => handleSelectTab('jobs')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>View All Jobs ({activeJobs.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{activeJobs[0].serviceType}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{activeJobs[0].description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Customer: {activeJobs[0].customerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {activeJobs[0].location}, Dhaka
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {activeJobs[0].customerPhone}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {onOpenMapNavigation && (
                    <button
                      onClick={() => onOpenMapNavigation(activeJobs[0])}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-200"
                      title="Open Google Maps Location & Directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>ম্যাপ</span>
                    </button>
                  )}
                  {onOpenWorkProof && (
                    <button
                      onClick={() => onOpenWorkProof(activeJobs[0])}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200"
                      title="Upload Before & After Photo Proof"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>প্রুফ</span>
                    </button>
                  )}
                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(activeJobs[0])}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="In-App Chat with Customer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>চ্যাট</span>
                    </button>
                  )}
                  <button
                    onClick={() => onTrackJob?.(activeJobs[0])}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200"
                    title="Open Live Tracking & Dispatch Controls"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Track Job</span>
                  </button>
                  {activeJobs[0].status === 'Accepted' && (
                    <button
                      onClick={() => onUpdateJobStatus(activeJobs[0].id, 'On The Way')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                    >
                      Start Transit (On The Way) 🛵
                    </button>
                  )}
                  {activeJobs[0].status === 'On The Way' && (
                    <button
                      onClick={() => onUpdateJobStatus(activeJobs[0].id, 'In Progress')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                    >
                      Arrived & Start Service 🛠️
                    </button>
                  )}
                  {activeJobs[0].status === 'In Progress' && (
                    <button
                      onClick={() => onUpdateJobStatus(activeJobs[0].id, 'Completed')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Complete & Collect ৳ ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleSelectTab('requests')}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 text-left shadow-xs transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Incoming Requests ({incomingRequests.length})
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Accept matching jobs or trigger instant auto-reassignment to next nearest technician.
              </p>
            </button>

            <button
              onClick={() => handleSelectTab('jobs')}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 text-left shadow-xs transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Active & Scheduled Jobs ({activeJobs.length})
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Manage ongoing assignments with live Firestore lifecycle status updates.
              </p>
            </button>

            <button
              onClick={() => handleSelectTab('schedule')}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 text-left shadow-xs transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Today's Slot Schedule
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Inspect double-booking locks and scheduled technician arrival time windows.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No Pending Incoming Requests</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You're all caught up! When a customer places a matching request in your Dhaka zone, it will appear here in real time.
              </p>
            </div>
          ) : (
            incomingRequests.map((req) => (
              <div
                key={req.id}
                id={`incoming-req-${req.id}`}
                className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Provider Acceptance
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.urgency === 'Emergency'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {req.urgency} Urgency
                      </span>
                      <span className="text-xs text-slate-400">ID: #{req.id}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{req.serviceType}</h3>
                    <p className="text-xs text-slate-600 mt-1">{req.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        Customer: {req.customerName} ({req.customerPhone})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {req.location}, Dhaka
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {req.preferredTime}
                      </span>
                      <span className="font-bold text-emerald-600">৳{req.estimatedPrice}</span>
                      {req.payment && req.payment.method === 'bkash' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[#E2136E]">
                          ৳ bKash Escrow Guaranteed
                        </span>
                      )}
                      {req.payment && req.payment.method === 'nagad' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#D83726]">
                          ন Nagad Escrow Guaranteed
                        </span>
                      )}
                      {req.payment && req.payment.method === 'card' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          💳 Card Payment Guaranteed
                        </span>
                      )}
                      {(!req.payment || req.payment.method === 'cash') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          💵 Cash Collection
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accept / Reject Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    <button
                      id={`reject-req-${req.id}`}
                      onClick={() => onRejectRequest(req.id)}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Demonstrates automated fallback to next provider"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject & Auto-Reassign</span>
                    </button>
                    <button
                      id={`accept-req-${req.id}`}
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept Job</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Hackathon Feature Note: Rejecting immediately triggers the <strong>Auto-Reassignment Engine</strong> to transfer this booking to the next best ranked provider.
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Active Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <h3 className="font-bold text-slate-800 text-base">No Active Jobs In Progress</h3>
              <p className="text-xs text-slate-500 mt-1">
                Accepted jobs will show here with one-click status transitions.
              </p>
            </div>
          ) : (
            activeJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Status: {job.status}
                      </span>
                      <span className="text-xs text-slate-400">ID: #{job.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{job.serviceType}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Customer: {job.customerName}</span>
                      <span>Location: {job.location}</span>
                      <span>Slot: {job.preferredTime}</span>
                      <span className="font-bold text-slate-800">Fee: ৳{job.estimatedPrice}</span>
                      {job.payment ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {job.payment.method.toUpperCase()} Escrow: {job.payment.status === 'paid' ? 'Paid in Full' : 'Deposit Received'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Cash Collection on Delivery
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status update controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {onOpenMapNavigation && (
                      <button
                        onClick={() => onOpenMapNavigation(job)}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-200"
                        title="Open Google Maps Location & Directions"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>ম্যাপ</span>
                      </button>
                    )}
                    {onOpenWorkProof && (
                      <button
                        onClick={() => onOpenWorkProof(job)}
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200"
                        title="Upload Before & After Photo Proof"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>প্রুফ</span>
                      </button>
                    )}
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(job)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="In-App Chat with Customer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>চ্যাট</span>
                      </button>
                    )}
                    <button
                      onClick={() => onTrackJob?.(job)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200"
                      title="Open Live Tracking & Dispatch Controls"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Track Job</span>
                    </button>
                    {job.status === 'Accepted' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'On The Way')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Start Transit (On The Way) 🛵
                      </button>
                    )}
                    {job.status === 'On The Way' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'In Progress')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Begin Service (In Progress) 🛠️
                      </button>
                    )}
                    {job.status === 'In Progress' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'Completed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Complete Job & Settle ৳ ✓
                      </button>
                    )}
                    {job.status === 'Completed' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Double-Booking Schedule Grid */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Schedule & Slot Availability</h3>
              <p className="text-xs text-slate-500">
                Guaranteed double-booking prevention: Locked slots cannot be assigned to another customer.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Date: 2026-09-08
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              '09:00 AM - 11:00 AM',
              '11:00 AM - 01:00 PM',
              '02:00 PM - 04:00 PM',
              '04:00 PM - 06:00 PM',
              '06:00 PM - 08:00 PM',
              'Immediate (Within 30 mins)',
            ].map((slot) => {
              const matchingJob = activeJobs.find((j) => j.preferredTime === slot && j.status !== 'Completed');
              const isLocked = !!matchingJob;

              return (
                <div
                  key={slot}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLocked
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{slot}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isLocked ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {isLocked ? 'LOCKED' : 'AVAILABLE'}
                    </span>
                  </div>
                  {isLocked ? (
                    <p className="text-[11px] text-rose-700 mt-2 font-medium">
                      Booked for: #{matchingJob.id} ({matchingJob.serviceType})
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 mt-2">
                      Open for automated matching & instant dispatch.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
