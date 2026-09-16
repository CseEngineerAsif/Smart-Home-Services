import React, { useState } from 'react';
import {
  Briefcase,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  UserCheck,
  CreditCard,
  Receipt,
  Banknote,
  Star,
  MessageSquare,
  Camera,
  RotateCcw,
  Navigation,
  Printer,
  Download,
} from 'lucide-react';
import { ServiceRequest } from '../types';
import { ServiceRatingSection } from './ServiceRatingSection';
import { downloadInvoiceHtml, printInvoiceDocument } from '../utils/invoiceGenerator';

interface CustomerJobsViewProps {
  requests: ServiceRequest[];
  onOpenTracking?: (request: ServiceRequest) => void;
  onTrackRequest?: (request: ServiceRequest) => void;
  onRequestNewService?: () => void;
  onNewRequest?: () => void;
  onSimulateAdvance?: (requestId: string) => void;
  onCancelRequest?: (requestId: string) => void;
  onOpenPaymentModal?: (request: ServiceRequest) => void;
  onOpenInvoiceModal?: (request: ServiceRequest) => void;
  onRateService?: (requestId: string, rating: number, feedback: string) => void;
  onOpenChat?: (request: ServiceRequest) => void;
  onOpenWorkProof?: (request: ServiceRequest) => void;
  onOpenWarranty?: (request: ServiceRequest) => void;
  onOpenMapNavigation?: (request: ServiceRequest) => void;
}

export const CustomerJobsView: React.FC<CustomerJobsViewProps> = ({
  requests,
  onOpenTracking,
  onTrackRequest,
  onRequestNewService,
  onNewRequest,
  onSimulateAdvance,
  onCancelRequest,
  onOpenPaymentModal,
  onOpenInvoiceModal,
  onRateService,
  onOpenChat,
  onOpenWorkProof,
  onOpenWarranty,
  onOpenMapNavigation,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleOpenTracking = (req: ServiceRequest) => {
    if (onOpenTracking) {
      onOpenTracking(req);
    } else if (onTrackRequest) {
      onTrackRequest(req);
    }
  };

  const handleNewService = () => {
    if (onRequestNewService) {
      onRequestNewService();
    } else if (onNewRequest) {
      onNewRequest();
    }
  };

  const activeRequests = requests.filter(
    (r) => !['Completed', 'Cancelled', 'Rejected'].includes(r.status)
  );
  const completedRequests = requests.filter((r) => r.status === 'Completed');

  const filteredRequests = requests.filter((req) => {
    if (filter === 'active') {
      return !['Completed', 'Cancelled', 'Rejected'].includes(req.status);
    }
    if (filter === 'completed') {
      return req.status === 'Completed';
    }
    return true;
  });

  const totalSpent = completedRequests.reduce((sum, r) => sum + r.estimatedPrice, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Customer Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">Service History & Live Dispatches</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Service Requests & Jobs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor real-time technician transit, inspect work milestones, and view service receipts.
          </p>
        </div>

        <button
          onClick={handleNewService}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{requests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active In-Progress</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">{activeRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{completedRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Settled</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">৳{totalSpent.toLocaleString()} BDT</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Active & Scheduled</span>
          {activeRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Completed ({completedRequests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((req) => {
          const isActive = !['Completed', 'Cancelled', 'Rejected'].includes(req.status);

          return (
            <div
              key={req.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-xs ${
                isActive ? 'border-indigo-200 ring-1 ring-indigo-500/10' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : req.status === 'On The Way'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {req.status}
                    </span>

                    {/* Payment Status Pill */}
                    {(() => {
                      const p = req.payment;
                      if (!p || p.method === 'cash') {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Banknote className="w-3 h-3 text-amber-600" />
                            <span>Cash on Delivery</span>
                          </span>
                        );
                      }
                      if (p.method === 'bkash') {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-50 text-[#E2136E] border border-pink-200 flex items-center gap-1">
                            <span>৳</span>
                            <span>bKash {p.status === 'deposit_paid' ? 'Deposit' : 'Paid'}</span>
                          </span>
                        );
                      }
                      if (p.method === 'nagad') {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-50 text-[#D83726] border border-orange-200 flex items-center gap-1">
                            <span>ন</span>
                            <span>Nagad {p.status === 'deposit_paid' ? 'Deposit' : 'Paid'}</span>
                          </span>
                        );
                      }
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-indigo-600" />
                          <span>{p.cardBrand || 'Card'} {p.status === 'deposit_paid' ? 'Deposit' : 'Paid'}</span>
                        </span>
                      );
                    })()}

                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {req.serviceCategory}
                    </span>
                    {req.urgency === 'Emergency' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        EMERGENCY 30-MIN
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">ID: {req.id}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{req.serviceType}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl mt-0.5">
                      {req.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {req.location}, Dhaka
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {req.preferredDate} • {req.preferredTime}
                    </span>
                    {req.assignedProviderName && (
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Technician: {req.assignedProviderName}
                      </span>
                    )}
                    {req.warranty && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{req.warranty.durationDays} দিন ফ্রি ওয়ারেন্টি অ্যাক্টিভ</span>
                      </span>
                    )}
                    {req.isWarrantyClaim && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                        <RotateCcw className="w-3 h-3 text-teal-600" />
                        <span>Free Rework ক্লেইম চলছে</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Fee</span>
                    <p className="text-xl font-extrabold text-slate-900">৳{req.estimatedPrice}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(req)}
                        className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
                        title="Direct Chat & Call with Technician"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>চ্যাট</span>
                      </button>
                    )}

                    {onOpenWorkProof && (
                      <button
                        onClick={() => onOpenWorkProof(req)}
                        className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                        title="View Before & After Work Photos"
                      >
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        <span>প্রুফ</span>
                      </button>
                    )}

                    {(req.warranty || req.status === 'Completed') && onOpenWarranty && (
                      <button
                        onClick={() => onOpenWarranty(req)}
                        className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold transition-colors border border-emerald-200"
                        title="Free Rework Claim & Digital Warranty Status"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ওয়ারেন্টি / রি-ওয়ার্ক</span>
                      </button>
                    )}

                    {onOpenMapNavigation && (
                      <button
                        onClick={() => onOpenMapNavigation(req)}
                        className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                        title="Customer Location on Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5 text-rose-500" />
                        <span>ম্যাপ</span>
                      </button>
                    )}

                    {onOpenInvoiceModal && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenInvoiceModal(req)}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
                          title="View Official Digital Tax Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => downloadInvoiceHtml(req)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors border border-emerald-200"
                          title="Download Tax Invoice (HTML/PDF)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => printInvoiceDocument(req)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors border border-slate-200"
                          title="Print Receipt Directly"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      </div>
                    )}

                    {req.payment && req.payment.remainingDue > 0 && onOpenPaymentModal && (
                      <button
                        onClick={() => onOpenPaymentModal(req)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                        title="Settle remaining balance"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Pay ৳{req.payment.remainingDue}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenTracking(req)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Track Live</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {isActive && onCancelRequest && !['Completed', 'Cancelled', 'Rejected', 'In Progress'].includes(req.status) && (
                      <button
                        onClick={() => onCancelRequest(req.id)}
                        className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors border border-rose-200"
                        title="Cancel this request"
                      >
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RATING & FEEDBACK SECTION FOR COMPLETED SERVICES */}
              {req.status === 'Completed' && onRateService && (
                <ServiceRatingSection
                  requestId={req.id}
                  serviceType={req.serviceType}
                  providerName={req.assignedProviderName}
                  existingRating={req.rating}
                  existingFeedback={req.feedback}
                  ratedAt={req.ratedAt}
                  onSubmitRating={onRateService}
                />
              )}
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No service requests in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You do not have any requests matching this category yet. Book your first certified home repair technician in 60 seconds.
            </p>
            <button
              onClick={handleNewService}
              className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Request a Service Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
