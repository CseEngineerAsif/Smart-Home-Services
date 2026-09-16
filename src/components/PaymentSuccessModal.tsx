import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  Copy,
  Check,
  Receipt,
  X,
  Phone,
  CheckCircle,
  Printer,
  Download,
} from 'lucide-react';
import { ServiceRequest, ServiceProvider, PaymentDetails } from '../types';
import { printInvoiceDocument, downloadInvoiceHtml } from '../utils/invoiceGenerator';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  provider?: ServiceProvider | null;
  payment: PaymentDetails;
  onTrackOrder: (request: ServiceRequest) => void;
  onViewInvoice: (request: ServiceRequest) => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  request,
  provider,
  payment,
  onTrackOrder,
  onViewInvoice,
}) => {
  const [copiedTrx, setCopiedTrx] = useState(false);

  if (!isOpen) return null;

  const handleCopyTrx = (trx: string) => {
    navigator.clipboard?.writeText(trx);
    setCopiedTrx(true);
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  const isCod = payment.method === 'cash';
  const methodLabel =
    payment.method === 'bkash'
      ? 'bKash Wallet'
      : payment.method === 'nagad'
      ? 'Nagad Wallet'
      : payment.method === 'card'
      ? `Credit/Debit Card (${payment.cardBrand || 'Visa/Mastercard'})`
      : 'Cash on Delivery (COD)';

  return (
    <div
      id="payment-success-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="payment-success-modal-content"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto flex flex-col max-h-[95vh]"
      >
        {/* Top Header Banner with Emerald Glow */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 text-center shrink-0">
          <button
            id="close-success-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Success Badge */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/20 mb-3.5">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-300"></span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/40 text-emerald-100 text-xs font-bold border border-emerald-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Order #{request.id.toUpperCase()}</span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Payment Successful & Request Sent!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-sm mx-auto font-medium">
            পেমেন্ট সফল হয়েছে এবং টেকনিশিয়ানের কাছে সার্ভিস রিকোয়েস্ট পাঠানো হয়েছে।
          </p>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
          {/* Quick Payment & Escrow Guarantee Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                ৳
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {isCod ? 'Order Amount' : 'Amount Paid & Escrow Secured'}
                </span>
                <p className="text-lg font-extrabold text-slate-900">
                  ৳{payment.paidAmount.toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-slate-500">BDT</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {isCod ? 'COD Guaranteed' : 'Escrow Secured'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">{methodLabel}</p>
            </div>
          </div>

          {/* Transaction & Receipt Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Transaction ID:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                <span>{payment.transactionId || `COD-${request.id}`}</span>
                <button
                  id="copy-trx-id-btn"
                  onClick={() => handleCopyTrx(payment.transactionId || `COD-${request.id}`)}
                  className="text-slate-400 hover:text-indigo-600 p-0.5 transition-colors"
                  title="Copy Transaction ID"
                >
                  {copiedTrx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Payment Channel:</span>
              <span className="font-bold text-indigo-700 capitalize">
                {payment.method} {payment.accountNumberMasked ? `(${payment.accountNumberMasked})` : ''}
              </span>
            </div>

            {payment.remainingDue > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-medium">Remaining Balance:</span>
                <span className="font-bold text-amber-700">
                  ৳{payment.remainingDue.toLocaleString()} BDT (Pay after work)
                </span>
              </div>
            )}
          </div>

          {/* Booking & Assigned Provider Snapshot */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider">
                  {request.serviceCategory}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">
                  {request.serviceType}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {request.status}
              </span>
            </div>

            {/* Provider Card */}
            {provider && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-slate-900">{provider.name}</h5>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Assigned
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{provider.specialties?.[0] || 'Certified Pro'}</p>
                  </div>
                </div>

                <a
                  href={`tel:${provider.phone}`}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Call</span>
                </a>
              </div>
            )}

            {/* Schedule & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{request.preferredDate} ({request.preferredTime})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium truncate">{request.location}</span>
              </div>
            </div>
          </div>

          {/* 3-Step Lifecycle Status Tracker */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Automated Dispatch Pipeline
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Payment Verified</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Request Sent</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1 text-indigo-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span>3. Tech On Schedule</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
            <button
              id="view-invoice-btn"
              onClick={() => {
                onClose();
                onViewInvoice(request);
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              title="View Complete Invoice"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Tax Invoice</span>
            </button>

            <button
              id="quick-download-receipt-btn"
              onClick={() => {
                downloadInvoiceHtml(request, provider || undefined);
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              title="Download Official Tax Receipt (HTML/PDF)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download</span>
            </button>

            <button
              id="quick-print-receipt-btn"
              onClick={() => {
                printInvoiceDocument(request, provider || undefined);
              }}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center"
              title="Print Receipt Directly"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="dismiss-success-modal-btn"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              id="track-order-live-btn"
              onClick={() => {
                onClose();
                onTrackOrder(request);
              }}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
