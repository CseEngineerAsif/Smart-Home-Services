import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileCheck,
  Wrench,
  Check,
  Building2,
} from 'lucide-react';
import { ServiceRequest, ServiceProvider } from '../types';

interface DigitalWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  provider?: ServiceProvider;
  onClaimFreeRework: (
    originalRequest: ServiceRequest,
    claimDetails: {
      issueType: string;
      description: string;
      preferredDate: string;
      preferredTime: string;
    }
  ) => void;
}

export const DigitalWarrantyModal: React.FC<DigitalWarrantyModalProps> = ({
  isOpen,
  onClose,
  request,
  provider,
  onClaimFreeRework,
}) => {
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [issueType, setIssueType] = useState('একই সমস্যা পুনরায় দেখা দিয়েছে (Same issue recurring)');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('Tomorrow');
  const [preferredTime, setPreferredTime] = useState('11:00 AM - 01:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate warranty metrics (Default 14 days)
  const durationDays = Number(request.warranty?.durationDays) || 14;
  const warrantyCode = request.warranty?.warrantyCode || `WAR-${request.id.replace('req_', '')}-${durationDays}D`;
  const activatedDate = request.warranty?.activatedAt || (request.createdAt ? request.createdAt.split(' ')[0] : '2026-09-05') || '2026-09-05';

  // Calculate days remaining safely without NaN
  const now = new Date();
  let actTime = new Date(activatedDate).getTime();
  if (isNaN(actTime)) {
    const matchDate = activatedDate.match(/\d{4}-\d{2}-\d{2}/);
    if (matchDate) {
      actTime = new Date(matchDate[0]).getTime();
    }
  }
  const diffDays = !isNaN(actTime)
    ? Math.max(0, Math.floor((now.getTime() - actTime) / (1000 * 60 * 60 * 24)))
    : 0;
  const rawRemaining = durationDays - (diffDays > durationDays ? durationDays : diffDays);
  const remainingDays = isNaN(rawRemaining) ? durationDays : Math.max(0, rawRemaining);
  const isExpired = remainingDays === 0;
  const isClaimed = request.warranty?.status === 'claimed';

  const rawPercent = ((durationDays - remainingDays) / (durationDays || 1)) * 100;
  const progressPercent = isNaN(rawPercent) ? 0 : Math.min(100, Math.max(0, rawPercent));

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onClaimFreeRework(request, {
        issueType,
        description: description.trim() || 'ওয়ারেন্টি কভারেজের আওতায় একই সমস্যার ফ্রি রি-ওয়ার্ক অনুরোধ।',
        preferredDate,
        preferredTime,
      });
      setIsSubmitting(false);
      setIsClaimFormOpen(false);
      onClose();
    }, 400);
  };

  const RECURRING_ISSUES = [
    'একই সমস্যা পুনরায় দেখা দিয়েছে (Same issue recurring)',
    'অস্বাভাবিক শব্দ বা ভাইব্রেশন হচ্ছে (Abnormal noise)',
    'পানি বা গ্যাস লিকেজ শুরু হয়েছে (Leakage recurring)',
    'যন্ত্র পুরোপুরি পাওয়ার অন হচ্ছে না (Not powering on)',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-extrabold text-white shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  ডিজিটাল সার্ভিস ওয়ারেন্টি (Digital Warranty)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 uppercase tracking-wider">
                  {durationDays} Days Free
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-mono">
                Certificate ID: {warrantyCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Warranty Status & Progress Card */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                  {isClaimed
                    ? 'রি-ওয়ার্ক দাবি প্রক্রিয়ধীন (Claimed)'
                    : isExpired
                    ? 'ওয়ারেন্টি মেয়াদ উত্তীর্ণ (Expired)'
                    : 'সক্রিয় সুরক্ষা (Warranty Active)'}
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 mt-2">
                  {request.serviceType}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  টেকনিশিয়ান: <strong>{request.assignedProviderName || provider?.name || 'Assigned Specialist'}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-emerald-700">
                  {isClaimed ? 'CLAIM' : remainingDays}
                </span>
                <span className="text-xs font-bold text-emerald-900 block">
                  {isClaimed ? 'ইন প্রগ্রেস' : isExpired ? 'দিন বাকি' : 'দিন অবশিষ্ট'}
                </span>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="mt-4 pt-3 border-t border-emerald-200/80">
              <div className="flex items-center justify-between text-xs text-emerald-900 mb-1.5 font-medium">
                <span>এক্টিভেশন: {activatedDate}</span>
                <span>মেয়াদ: {durationDays} দিন ফ্রি কভারেজ</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${100 - progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Warranty Coverage Guarantees */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ওয়ারেন্টি সুবিধা ও গ্যারান্টি শর্তাবলী</span>
            </h5>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>১০০% ফ্রি ভিজিট ও কাজ:</strong> ওয়ারেন্টি মেয়াদের মধ্যে একই ত্রুটির জন্য টেকনিশিয়ান বিনা খরচে রি-ভিজিট করবেন।</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>এক ক্লিকে রি-ওয়ার্ক ক্লেইম:</strong> কোনো ঝামেলা ছাড়াই সরাসরি একই সার্ভিস পার্টনারের মাধ্যমে ফ্রি রি-ওয়ার্ক পাবেন।</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>বিবাদহীন প্রুফ ট্র্যাকিং:</strong> নষ্ট পার্টস এবং নতুন পার্টসের Before/After ছবি সিস্টেমে সেভ থাকায় সম্পূর্ণ স্বচ্ছতা।</span>
              </li>
            </ul>
          </div>

          {/* Claim Status or Claim Button */}
          {isClaimed ? (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>ফ্রি রি-ওয়ার্ক দাবি রিকোয়েস্ট গ্রহণ করা হয়েছে</span>
              </div>
              <p className="text-indigo-800">
                আপনার ওয়ারেন্টি ক্লেইম রিকোয়েস্ট #{request.warranty?.claimRequestId || `REQ-REW-${request.id}`} সরাসরি {request.assignedProviderName} এর কাছে এসাইন করা হয়েছে। টেকনিশিয়ান শিগগিরই যোগাযোগ করবেন।
              </p>
            </div>
          ) : isClaimFormOpen ? (
            /* Free Rework Claim Form */
            <form onSubmit={handleSubmitClaim} className="border-2 border-emerald-500 rounded-2xl p-5 bg-white space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <h5 className="font-extrabold text-sm text-slate-900">
                    ফ্রি রি-ওয়ার্ক রিকোয়েস্ট ফর্ম (Free Claim)
                  </h5>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  চার্জ: ৳০ (সম্পূর্ণ ফ্রি)
                </span>
              </div>

              {/* Issue Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  পুনরাবৃত্তি সমস্যার ধরন নির্বাচন করুন:
                </label>
                <div className="space-y-1.5">
                  {RECURRING_ISSUES.map((issue, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        issueType === issue
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recurringIssue"
                        checked={issueType === issue}
                        onChange={() => setIssueType(issue)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{issue}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details Textarea */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  বিস্তারিত সমস্যা বর্ণনা করুন:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="কী সমস্যা হচ্ছে বিস্তারিত লিখুন যাতে টেকনিশিয়ান প্রস্তুতি নিয়ে আসতে পারেন..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Preferred Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    পছন্দের তারিখ
                  </label>
                  <select
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Today">আজকে (Today)</option>
                    <option value="Tomorrow">আগামীকাল (Tomorrow)</option>
                    <option value="Within 2 Days">২ দিনের মধ্যে</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    পছন্দের সময়
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="09:00 AM - 11:00 AM">০৯:০০ AM - ১১:০০ AM</option>
                    <option value="11:00 AM - 01:00 PM">১১:০০ AM - ০১:০০ PM</option>
                    <option value="02:00 PM - 04:00 PM">০২:০০ PM - ০৪:০০ PM</option>
                    <option value="04:00 PM - 06:00 PM">০৪:০০ PM - ০৬:০০ PM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClaimFormOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isSubmitting ? 'প্রসেসিং...' : 'ফ্রি রি-ওয়ার্ক সাবমিট করুন (৳০)'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
              <div>
                <h5 className="font-extrabold text-sm">একই সমস্যা আবার হচ্ছে?</h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  ওয়ারেন্টি মেয়াদের মধ্যে এক ক্লিকেই সম্পূর্ণ ফ্রি রি-ওয়ার্ক দাবি করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimFormOpen(true)}
                disabled={isExpired}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Free Rework Claim করুন</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            SERVO Consumer Protection Guarantee
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
