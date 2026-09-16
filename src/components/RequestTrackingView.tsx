import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  AlertCircle,
  Sparkles,
  Check,
  ChevronRight,
  Play,
  RotateCcw,
  CreditCard,
  Receipt,
  ShieldCheck,
  CheckCircle,
  Copy,
  Banknote,
  ExternalLink,
  Star,
  Camera,
  Navigation,
  FileCheck,
  Printer,
  Download,
} from 'lucide-react';
import { ServiceRequest, ServiceStatus, ServiceProvider } from '../types';
import { ServiceRatingSection } from './ServiceRatingSection';
import { printInvoiceDocument, downloadInvoiceHtml } from '../utils/invoiceGenerator';

interface RequestTrackingViewProps {
  request: ServiceRequest;
  provider?: ServiceProvider;
  onBack: () => void;
  onSimulateStatusUpdate?: (requestId: string, newStatus: ServiceStatus, note: string) => void;
  onCancelRequest?: (requestId: string) => void;
  onOpenPaymentModal?: (request: ServiceRequest) => void;
  onOpenInvoiceModal?: (request: ServiceRequest) => void;
  onRateService?: (requestId: string, rating: number, feedback: string) => void;
  onOpenChat?: (request: ServiceRequest) => void;
  onOpenWorkProof?: (request: ServiceRequest) => void;
  onOpenWarranty?: (request: ServiceRequest) => void;
  onOpenMapNavigation?: (request: ServiceRequest) => void;
  userRole?: 'customer' | 'provider' | 'admin';
}

const LIFECYCLE_STEPS: { status: ServiceStatus; label: string; description: string }[] = [
  { status: 'Requested', label: 'Requested', description: 'Automated matching initiated' },
  { status: 'Assigned', label: 'Assigned', description: 'Technician matched via algorithm' },
  { status: 'Accepted', label: 'Accepted', description: 'Provider confirmed schedule' },
  { status: 'On The Way', label: 'On The Way', description: 'Technician transit in progress' },
  { status: 'In Progress', label: 'In Progress', description: 'Service diagnosis & work underway' },
  { status: 'Completed', label: 'Completed', description: 'Job finished & verified' },
];

export const RequestTrackingView: React.FC<RequestTrackingViewProps> = ({
  request,
  provider,
  onBack,
  onSimulateStatusUpdate,
  onCancelRequest,
  onOpenPaymentModal,
  onOpenInvoiceModal,
  onRateService,
  onOpenChat,
  onOpenWorkProof,
  onOpenWarranty,
  onOpenMapNavigation,
  userRole = 'customer',
}) => {
  const isProvider = userRole === 'provider';
  const [copiedTrx, setCopiedTrx] = useState(false);
  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.status === request.status);

  const getNextStatus = (): { status: ServiceStatus; note: string } | null => {
    switch (request.status) {
      case 'Requested':
        return { status: 'Assigned', note: 'System paired technician with 94% match score.' };
      case 'Assigned':
        return { status: 'Accepted', note: 'Provider accepted job and confirmed arrival time.' };
      case 'Accepted':
        return { status: 'On The Way', note: 'Provider is traveling to the destination address.' };
      case 'On The Way':
        return { status: 'In Progress', note: 'Technician arrived and began service diagnostic.' };
      case 'In Progress':
        return { status: 'Completed', note: 'Service completed successfully. Bill settled.' };
      default:
        return null;
    }
  };

  const nextStep = getNextStatus();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Tracking ID:</span>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            #{request.id}
          </span>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 border border-slate-200/90 shadow-sm relative overflow-hidden mb-6 bg-gradient-to-br from-white via-indigo-50/30 to-sky-50/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                {request.status}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {request.serviceCategory}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{request.serviceType}</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">{request.description}</p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {request.location}, Dhaka
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                {request.preferredDate} • {request.preferredTime}
              </span>
              <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Estimated: ৳{request.estimatedPrice}
              </span>
            </div>
          </div>

          {/* Role-adaptive Panel: Provider has dispatch/advance controls, Customer only views tracking */}
          {isProvider ? (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200 shadow-sm sm:min-w-[270px]">
              <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Provider Dispatch Controls
              </p>
              {nextStep ? (
                <button
                  id="simulate-next-status-btn"
                  onClick={() => onSimulateStatusUpdate?.(request.id, nextStep.status, nextStep.note)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Advance to: {nextStep.status}</span>
                </button>
              ) : (
                <div className="text-center py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Service Completed
                  </span>
                </div>
              )}
              {onCancelRequest && !['Completed', 'Cancelled', 'Rejected'].includes(request.status) && (
                <button
                  onClick={() => onCancelRequest(request.id)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-200"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Cancel / Release Booking</span>
                </button>
              )}
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Updates customer live tracking stream in real-time
              </p>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs sm:min-w-[270px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Live Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Stream
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Current Job Stage
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{request.status}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {request.status === 'Completed'
                      ? 'Service has been completed and verified.'
                      : request.status === 'In Progress'
                      ? 'Technician is actively working at your address.'
                      : request.status === 'On The Way'
                      ? 'Technician is en route to your location.'
                      : request.status === 'Accepted'
                      ? 'Technician confirmed your booking and is preparing.'
                      : 'Technician assigned and scheduled.'}
                  </p>
                </div>
              </div>

              {onCancelRequest && !['Completed', 'Cancelled', 'Rejected', 'In Progress'].includes(request.status) && (
                <button
                  onClick={() => onCancelRequest(request.id)}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-200"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Cancel Request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Service Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>Service Lifecycle Timeline</span>
          <span className="text-xs font-medium text-slate-400">(Real-time Firestore sync)</span>
        </h2>

        {/* Horizontal on Desktop, Vertical on Mobile */}
        <div className="relative">
          <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100)}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 relative z-10">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;

              return (
                <div key={step.status} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 text-left sm:text-center">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-600/30'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPast ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <h3
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-indigo-600'
                          : isPast
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logged Timeline Events */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Real-Time Audit Log
          </h3>
          <div className="space-y-2.5">
            {request.timeline.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-mono text-[10px] font-bold text-slate-400 mt-0.5">
                  {entry.timestamp}
                </span>
                <span className="font-bold text-indigo-700 shrink-0">[{entry.status}]</span>
                <span className="text-slate-600">{entry.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment & Escrow Settlement Shield Card */}
      {(() => {
        const payment = request.payment;
        const isPaidInFull = payment?.status === 'paid';
        const isDepositPaid = payment?.status === 'deposit_paid';
        const isCod = payment?.method === 'cash' || !payment;
        const remaining = payment ? payment.remainingDue : (request.status === 'Completed' ? 0 : request.estimatedPrice);
        const method = payment?.method || 'cash';

        const handleCopy = (txt: string) => {
          navigator.clipboard?.writeText(txt);
          setCopiedTrx(true);
          setTimeout(() => setCopiedTrx(false), 2000);
        };

        return (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                  method === 'bkash'
                    ? 'bg-[#E2136E]'
                    : method === 'nagad'
                    ? 'bg-gradient-to-tr from-[#D83726] to-[#F7941D]'
                    : method === 'card'
                    ? 'bg-slate-900'
                    : 'bg-emerald-600'
                }`}>
                  {method === 'bkash' ? (
                    <span className="text-base font-extrabold">৳</span>
                  ) : method === 'nagad' ? (
                    <span className="text-base font-extrabold">ন</span>
                  ) : method === 'card' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Banknote className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {method === 'bkash'
                        ? 'bKash MFS Escrow'
                        : method === 'nagad'
                        ? 'Nagad Post Office Escrow'
                        : method === 'card'
                        ? 'Bank Card Settlement'
                        : 'Cash on Delivery (Pay at Doorstep)'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isPaidInFull
                        ? 'bg-emerald-100 text-emerald-800'
                        : isDepositPaid
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isPaidInFull ? 'Paid in Full' : isDepositPaid ? '15% Deposit Paid' : 'Cash on Delivery'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {payment?.accountNumberMasked || 'Cash to be collected upon inspection'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
                {onOpenInvoiceModal && (
                  <button
                    id="track-view-invoice-btn"
                    onClick={() => onOpenInvoiceModal(request)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Receipt className="w-4 h-4 text-indigo-600" />
                    <span>View Receipt / Invoice</span>
                  </button>
                )}

                <button
                  id="track-download-invoice-btn"
                  onClick={() => downloadInvoiceHtml(request, provider)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors shadow-xs"
                  title="Download Official Tax Receipt (HTML/PDF)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  id="track-print-invoice-btn"
                  onClick={() => printInvoiceDocument(request, provider)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
                  title="Print Official Tax Receipt"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                </button>

                {remaining > 0 && onOpenPaymentModal && (
                  <button
                    id="track-settle-balance-btn"
                    onClick={() => onOpenPaymentModal(request)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Balance (৳{remaining})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Financial Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Bill
                </span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  ৳{payment?.amount || request.estimatedPrice} BDT
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Paid Online
                </span>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                  ৳{payment ? payment.paidAmount : (request.status === 'Completed' ? request.estimatedPrice : 0)} BDT
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Balance Remaining
                </span>
                <p className={`text-base font-extrabold mt-0.5 ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  ৳{remaining} BDT
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transaction Ref
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-slate-800 text-[11px] truncate">
                    {payment?.transactionId || `COD-${request.id}`}
                  </span>
                  {payment?.transactionId && (
                    <button
                      onClick={() => handleCopy(payment.transactionId || '')}
                      className="text-slate-400 hover:text-slate-700 ml-1"
                      title="Copy TrxID"
                    >
                      {copiedTrx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Note */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                SERVO SafeEscrow: Funds released to technician only after you confirm service satisfaction.
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                256-Bit SSL Demo Sandbox
              </span>
            </div>
          </div>
        );
      })()}

      {/* Assigned Provider Profile Card */}
      {provider && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{provider.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified Specialist
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rating: <strong className="text-amber-500">{provider.rating}★</strong> ({provider.reviewCount} reviews) • {provider.experienceYears} Years Exp
              </p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Base: {provider.location}, Dhaka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <a
              href={`tel:${provider.phone}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
            <button
              onClick={() => onOpenChat?.(request)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>চ্যাট ও কল (Chat)</span>
            </button>
            {isProvider && onOpenMapNavigation && (
              <button
                onClick={() => onOpenMapNavigation(request)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>ম্যাপ রুট</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Google Maps Customer Location Card (for both technician & customer) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                কাস্টমার লোকেশন ও গুগল ম্যাপ (Google Maps Location)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                GPS Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {request.customerLocationDetails?.address || `House 42, Road 7/A, ${request.location}, Dhaka`}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span className="font-semibold text-slate-700">ল্যান্ডমার্ক:</span>
              <span>{request.customerLocationDetails?.landmark || 'ধানমন্ডি ৭/এ রোড ও আবাহনী মাঠ সংলগ্ন'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {onOpenMapNavigation ? (
            <button
              onClick={() => onOpenMapNavigation(request)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>লাইভ ম্যাপে দেখুন</span>
            </button>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=23.7461,90.3742`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>গুগল ম্যাপে খুলুন</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Work Proof (Before & After Photo Upload & Verification) Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  কাজের প্রুফ (Before & After Work Proof)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {request.proofPhotos?.before && request.proofPhotos?.after
                    ? 'Complete Proof'
                    : request.proofPhotos?.before
                    ? 'Before Photo Uploaded'
                    : 'Pending Proof'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                কাজের পূর্বে নষ্ট পার্টস ও কাজ শেষে ফ্রেশ পার্টসের অফিসিয়াল ছবি রেকর্ড
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenWorkProof && (
              <button
                onClick={() => onOpenWorkProof(request)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isProvider
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {isProvider
                    ? 'প্রুফ ফটো আপডেট/আপলোড করুন'
                    : 'প্রুফ ফটো দেখুন ও যাচাই করুন'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Before / After Photo Display Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Before Photo Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                ১. কাজ শুরুর আগে (নষ্ট পার্টস)
              </span>
              {request.proofPhotos?.before?.timestamp && (
                <span className="text-[10px] font-mono text-slate-400">
                  {request.proofPhotos.before.timestamp}
                </span>
              )}
            </div>

            {request.proofPhotos?.before?.url ? (
              <div>
                <img
                  src={request.proofPhotos.before.url}
                  alt="Before Repair"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
                <p className="text-xs text-slate-700 mt-2 bg-white p-2.5 rounded-xl border border-slate-100">
                  {request.proofPhotos.before.note}
                </p>
              </div>
            ) : (
              <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                <Camera className="w-6 h-6 text-slate-300 mb-1" />
                <span>নষ্ট পার্টসের ছবি আপলোড বাকি</span>
              </div>
            )}
          </div>

          {/* After Photo Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ২. কাজ শেষে (ঠিক করার পর ফ্রেশ)
              </span>
              {request.proofPhotos?.after?.timestamp && (
                <span className="text-[10px] font-mono text-slate-400">
                  {request.proofPhotos.after.timestamp}
                </span>
              )}
            </div>

            {request.proofPhotos?.after?.url ? (
              <div>
                <img
                  src={request.proofPhotos.after.url}
                  alt="After Repair"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
                <p className="text-xs text-slate-700 mt-2 bg-white p-2.5 rounded-xl border border-slate-100">
                  {request.proofPhotos.after.note}
                </p>
              </div>
            ) : (
              <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                <Camera className="w-6 h-6 text-slate-300 mb-1" />
                <span>কাজ শেষে ফ্রেশ ছবি আপলোড হবে</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Digital Warranty & Free Rework Request Card */}
      {(request.warranty || request.status === 'Completed') && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    ডিজিটাল ওয়ারেন্টি ও ফ্রি রি-ওয়ার্ক গ্যারান্টি (Digital Warranty)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    {request.warranty?.durationDays || 14} Days Protection
                  </span>
                </div>
                <p className="text-xs text-emerald-900 mt-0.5">
                  ওয়ারেন্টি কোড: <strong className="font-mono">{request.warranty?.warrantyCode || `WAR-${request.id}-14D`}</strong> • 
                  একই সমস্যায় সম্পূর্ণ বিনা খরচে টেকনিশিয়ান ভিজিট ও রি-ওয়ার্ক সার্ভিস।
                </p>
                {request.warranty?.status === 'claimed' && (
                  <p className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg mt-2 inline-block">
                    ✓ আপনার ফ্রি রি-ওয়ার্ক ক্লেইম জমা হয়েছে এবং টেকনিশিয়ান এসাইন করা হয়েছে।
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenWarranty && (
                <button
                  onClick={() => onOpenWarranty(request)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Free Rework Claim করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating and Feedback for Completed Service */}
      {request.status === 'Completed' && onRateService && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <ServiceRatingSection
            requestId={request.id}
            serviceType={request.serviceType}
            providerName={request.assignedProviderName || provider?.name}
            existingRating={request.rating}
            existingFeedback={request.feedback}
            ratedAt={request.ratedAt}
            onSubmitRating={onRateService}
          />
        </div>
      )}
    </div>
  );
};
