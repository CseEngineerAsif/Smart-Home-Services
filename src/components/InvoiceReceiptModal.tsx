import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  Sparkles,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import { ServiceRequest, ServiceProvider } from '../types';
import {
  printInvoiceDocument,
  downloadInvoiceHtml,
  downloadInvoiceText,
  downloadInvoiceCsv,
} from '../utils/invoiceGenerator';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  provider?: ServiceProvider;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  request,
  provider,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const payment = request.payment;
  const isPaid = payment?.status === 'paid';
  const isDeposit = payment?.status === 'deposit_paid';
  const isCod = payment?.method === 'cash' || !payment || payment.status === 'unpaid';

  const receiptNumber = payment?.receiptNumber || `SRV-INV-${request.id.replace('req_', '')}890`;
  const transactionId = payment?.transactionId || (isCod ? `COD-${request.id}` : 'BK9X7F201A');
  const paymentMethod = payment?.method ? payment.method.toUpperCase() : 'CASH ON DELIVERY';
  const paidAmount = payment ? payment.paidAmount : (request.status === 'Completed' ? request.estimatedPrice : 0);
  const remainingDue = payment ? payment.remainingDue : (request.status === 'Completed' ? 0 : request.estimatedPrice);
  const discountAmount = payment?.discountApplied || 0;
  const totalAmount = payment?.amount || request.estimatedPrice;
  const subtotal = totalAmount + discountAmount;
  const warrantyCode = request.warranty?.warrantyCode || `WAR-${request.id.replace('req_', '')}-14D`;
  const durationDays = request.warranty?.durationDays || 14;
  const tradeLicense = provider?.tradeLicense || 'TRAD-DNCC-2024-8891';

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleCopyInvoice = () => {
    navigator.clipboard?.writeText(
      `SERVO INVOICE #${receiptNumber}\nTrxID: ${transactionId}\nService: ${request.serviceType}\nTotal Amount: ৳${totalAmount} BDT\nCustomer: ${request.customerName}\nBIN: 004819284-0102 (NBR Mushak-6.3)`
    );
    setCopied(true);
    showFeedback('Invoice details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    showFeedback('Opening print dialog for official Tax Invoice...');
    printInvoiceDocument(request, provider);
  };

  const handleDownloadHtml = () => {
    setDownloadMenuOpen(false);
    downloadInvoiceHtml(request, provider);
    showFeedback(`Downloaded official Tax Invoice (${receiptNumber}.html)!`);
  };

  const handleDownloadText = () => {
    setDownloadMenuOpen(false);
    downloadInvoiceText(request, provider);
    showFeedback('Downloaded text expense receipt (.txt)!');
  };

  const handleDownloadCsv = () => {
    setDownloadMenuOpen(false);
    downloadInvoiceCsv(request, provider);
    showFeedback('Downloaded accounting spreadsheet (.csv)!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col print:shadow-none print:border-none print:max-h-full">
        {/* Floating Toast Notification */}
        {feedbackMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-bounce print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Modal Top Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 print:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
              Tax Receipt & Invoice
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800'
                  : isDeposit
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isPaid ? 'Paid in Full' : isDeposit ? 'Deposit Settled' : 'Payment Due'}
            </span>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct Print Button */}
            <button
              id="header-print-invoice-btn"
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer active:scale-95"
              title="Print Receipt (Ctrl/Cmd+P)"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Direct Download Button with dropdown */}
            <div className="relative">
              <button
                id="header-download-invoice-btn"
                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 text-xs font-bold shadow-2xs cursor-pointer active:scale-95"
                title="Download Tax Invoice"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {/* Download Format Dropdown Menu */}
              {downloadMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-left">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Download Format
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="w-full px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-emerald-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Official Invoice (HTML / PDF)</p>
                      <p className="text-[10px] text-slate-500">Standalone document with NBR & Stamp</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadText}
                    className="w-full px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Plain Text Receipt (.TXT)</p>
                      <p className="text-[10px] text-slate-500">Simple format for expense records</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="w-full px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-blue-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Accounting Spreadsheet (.CSV)</p>
                      <p className="text-[10px] text-slate-500">Import to Excel or Google Sheets</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyInvoice}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Copy Reference"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-printable-content" className="overflow-y-auto p-5 sm:p-7 space-y-5 flex-1 text-slate-800">
          {/* Brand & NBR Tax Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between pb-5 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm">
                  S
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">SERVO</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  NBR Mushak-6.3
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Smart Everyday Service & Repair Operation Network Ltd.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Gulshan-2, Dhaka 1212 • support@servo.com.bd • Helpline: 16999
              </p>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>Govt. Tax BIN:</span>
                  <strong className="font-mono text-slate-900">004819284-0102</strong>
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                OFFICIAL TAX INVOICE
              </span>
              <p className="font-mono text-base font-black text-slate-900">{receiptNumber}</p>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Issued: {payment?.paidAt || request.createdAt}
              </span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                Request Ref: #{request.id}
              </span>
            </div>
          </div>

          {/* Customer & Certified Specialist Bilateral Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                BILLED TO (CUSTOMER)
              </span>
              <p className="font-bold text-slate-900 text-sm">{request.customerName}</p>
              <p className="text-slate-600 mt-0.5">{request.customerPhone || '+880 1712-998877'}</p>
              <p className="text-slate-600 mt-0.5">{request.location}, Dhaka, Bangladesh</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CERTIFIED SERVICE SPECIALIST
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {request.assignedProviderName || provider?.name || 'Certified Specialist'}
              </p>
              <p className="text-slate-600 mt-0.5">Trade License: #{tradeLicense}</p>
              <p className="text-slate-600 mt-0.5">
                Schedule: {request.preferredDate} • {request.preferredTime}
              </p>
            </div>
          </div>

          {/* Itemized Service Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Service Description</th>
                  <th className="py-2.5 px-4 text-center">Urgency</th>
                  <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{request.serviceType}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{request.description}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                      ✓ Backed by SERVO Escrow Protection & {durationDays}-Day Guarantee
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        request.urgency === 'Emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {request.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    ৳{totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Base Fee:</span>
                <span>৳{subtotal} BDT</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Coupon Discount:</span>
                  <span>-৳{discountAmount} BDT</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Platform Dispatch & Escrow Guarantee Fee:</span>
                <span className="text-emerald-600 font-bold">FREE (৳0)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Govt VAT / Mushak (5% Included):</span>
                <span>৳{Math.round(totalAmount * 0.05)} BDT</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Total Invoice Value:</span>
                <span>৳{totalAmount} BDT</span>
              </div>
            </div>
          </div>

          {/* Payment Status & Escrow Settlement Verification Box */}
          <div
            className={`p-4 rounded-2xl border text-xs ${
              isPaid
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : isDeposit
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/5 mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold uppercase tracking-wider">
                  Payment Verification & Escrow Settlement
                </span>
              </div>
              <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-800">
                {paymentMethod}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div>
                <span className="text-slate-500 block">Payment Status</span>
                <strong className="uppercase font-extrabold text-emerald-800">
                  {payment?.status || (request.status === 'Completed' ? 'Settled' : 'Pending')}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Transaction Ref</span>
                <strong className="font-mono">{transactionId}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Paid Online / Settled</span>
                <strong className="text-emerald-700 font-extrabold">৳{paidAmount} BDT</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Balance Due</span>
                <strong>৳{remainingDue} BDT</strong>
              </div>
            </div>
          </div>

          {/* Digital Service Warranty Certificate */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-emerald-950 uppercase tracking-wider">
                  ডিজিটাল সার্ভিস ওয়ারেন্টি (Digital Warranty)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono">
                {warrantyCode}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block">কভারেজ মেয়াদ</span>
                <strong className="text-slate-900">{durationDays} Days Free Rework Warranty</strong>
              </div>
              <div>
                <span className="text-slate-500 block">সুরক্ষা অবস্থা</span>
                <strong className="text-emerald-700 font-semibold">
                  {request.warranty?.status === 'claimed' ? 'Rework In Progress' : 'Active Protection'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">গ্যারান্টি সুবিধা</span>
                <span className="text-slate-700">একই সমস্যায় ফ্রি ভিজিট ও সমাধান</span>
              </div>
            </div>
          </div>

          {/* Work Proof Verification Photos (Before & After) */}
          {request.proofPhotos && (request.proofPhotos.before || request.proofPhotos.after) && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  কাজের প্রুফ রেকর্ড (Before & After Work Proof)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Verified by {request.assignedProviderName || 'Technician'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Before Photo */}
                {request.proofPhotos.before && (
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        ১. কাজ শুরুর আগে (নষ্ট পার্টস)
                      </span>
                      {request.proofPhotos.before.timestamp && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {request.proofPhotos.before.timestamp}
                        </span>
                      )}
                    </div>
                    <img
                      src={request.proofPhotos.before.url}
                      alt="Before Repair"
                      className="w-full h-32 object-cover rounded-lg border border-slate-100"
                    />
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      &quot;{request.proofPhotos.before.note}&quot;
                    </p>
                  </div>
                )}

                {/* After Photo */}
                {request.proofPhotos.after && (
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ২. কাজ শেষে (ঠিক করার পর)
                      </span>
                      {request.proofPhotos.after.timestamp && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {request.proofPhotos.after.timestamp}
                        </span>
                      )}
                    </div>
                    <img
                      src={request.proofPhotos.after.url}
                      alt="After Repair"
                      className="w-full h-32 object-cover rounded-lg border border-slate-100"
                    />
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      &quot;{request.proofPhotos.after.note}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Notes & Legal Verification */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
            <div>
              <p>• Computer-generated digital tax receipt from SERVO Operations Platform.</p>
              <p>• National Board of Revenue (NBR) Bangladesh Registered • BIN 004819284-0102.</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SERVO AUTHENTICATED &amp; ESCROW SECURED</span>
            </div>
          </div>
        </div>

        {/* Persistent Bottom Action Toolbar (Print & Download Options) */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official digital invoice with tax-deductible proof.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Print Button */}
            <button
              id="footer-print-receipt-btn"
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Print Receipt</span>
            </button>

            {/* Primary Download Button */}
            <button
              id="footer-download-receipt-btn"
              type="button"
              onClick={handleDownloadHtml}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
