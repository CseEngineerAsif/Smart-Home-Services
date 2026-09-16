import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  ShieldCheck,
  FileCheck,
  Eye,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { ServiceRequest, WorkProof, WorkProofPhoto } from '../types';

interface WorkProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onSaveProof: (requestId: string, proof: WorkProof) => void;
  userRole?: 'customer' | 'provider' | 'admin';
}

// Realistic sample presets for instant demonstration & testing
const PRESET_BEFORE_PHOTOS = [
  {
    title: 'AC Blown Capacitor & Burnt Wire',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    note: 'এসি আউটডোরের ক্যাপাসিটর ফুলে ফেটে গেছে এবং সংযোগ তারে স্পার্ক মার্ক রয়েছে।',
  },
  {
    title: 'Leaking Brass Pipe & Rust',
    url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
    note: 'বেসিন ড্রেন পাইপের নিচের থ্রেড ভেঙে তীব্র লিকেজ হচ্ছিল।',
  },
  {
    title: 'Damaged Refrigerator Relay',
    url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80',
    note: 'ফ্রিজের কম্প্রেসার পিটিসি রিলে ওভারহিট হয়ে জ্যাম হয়ে গেছে।',
  },
];

const PRESET_AFTER_PHOTOS = [
  {
    title: 'Fresh Original Part & Cooling Tested',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    note: 'নতুন অরিজিনাল ক্যাপাসিটর ইনস্টল ও ওয়্যারিং সিলিং সম্পন্ন। টেস্ট কুলিং ১৬°C ঠিক আছে।',
  },
  {
    title: 'Fitted Heavy-Duty Seal Pipe',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    note: 'নতুন হাই-প্রেশার সিলসহ ফ্লেক্স পাইপ রিপ্লেস করা হয়েছে। কোনো ড্রপ লিকেজ নেই।',
  },
  {
    title: 'New Sealed Relay & Balanced Gas',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    note: 'নতুন সিল্ড রিলে প্রতিস্থাপন এবং কম্প্রেসার এম্পিয়ার লোড টেস্ট পারফেক্ট।',
  },
];

export const WorkProofUploadModal: React.FC<WorkProofUploadModalProps> = ({
  isOpen,
  onClose,
  request,
  onSaveProof,
  userRole = 'provider',
}) => {
  const isReadOnly = userRole === 'customer';

  // State for Before photo
  const [beforeUrl, setBeforeUrl] = useState<string>(
    request.proofPhotos?.before?.url || ''
  );
  const [beforeNote, setBeforeNote] = useState<string>(
    request.proofPhotos?.before?.note || ''
  );
  const [beforeTime, setBeforeTime] = useState<string>(
    request.proofPhotos?.before?.timestamp || ''
  );

  // State for After photo
  const [afterUrl, setAfterUrl] = useState<string>(
    request.proofPhotos?.after?.url || ''
  );
  const [afterNote, setAfterNote] = useState<string>(
    request.proofPhotos?.after?.note || ''
  );
  const [afterTime, setAfterTime] = useState<string>(
    request.proofPhotos?.after?.timestamp || ''
  );

  const [activePresetTab, setActivePresetTab] = useState<'none' | 'before' | 'after'>('none');
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (target === 'before') {
            setBeforeUrl(reader.result);
            setBeforeTime(nowTime);
            if (!beforeNote) setBeforeNote('কাজের শুরুর অবস্থা (নষ্ট পার্টসের ছবি তোলা হয়েছে)');
          } else {
            setAfterUrl(reader.result);
            setAfterTime(nowTime);
            if (!afterNote) setAfterNote('কাজের পরবর্তী ফ্রেশ অবস্থা (সফল মেরামতের ছবি)');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_BEFORE_PHOTOS[0], target: 'before' | 'after') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (target === 'before') {
      setBeforeUrl(preset.url);
      setBeforeNote(preset.note);
      setBeforeTime(nowTime);
    } else {
      setAfterUrl(preset.url);
      setAfterNote(preset.note);
      setAfterTime(nowTime);
    }
    setActivePresetTab('none');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newProof: WorkProof = {
      before: beforeUrl
        ? {
            url: beforeUrl,
            note: beforeNote || 'কাজ শুরুর আগের নষ্ট পার্টসের ছবি',
            timestamp: beforeTime || 'Logged upon arrival',
            uploadedBy: request.assignedProviderName || 'Technician',
          }
        : request.proofPhotos?.before,
      after: afterUrl
        ? {
            url: afterUrl,
            note: afterNote || 'কাজ সম্পন্ন পরবর্তী ফ্রেশ ছবি',
            timestamp: afterTime || 'Logged after completion',
            uploadedBy: request.assignedProviderName || 'Technician',
          }
        : request.proofPhotos?.after,
    };

    onSaveProof(request.id, newProof);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                কাজের প্রুফ (Before & After Photo Verification)
              </h3>
              <p className="text-xs text-slate-500">
                অর্ডার #{request.id} • {request.serviceType} • {request.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Sub-banner */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {isReadOnly
                ? 'টেকনিশিয়ান কর্তৃক আপলোডকৃত নষ্ট ও ফ্রেশ পার্টসের অফিসিয়াল প্রুফ রেকর্ড।'
                : 'কাজ শুরুর আগে নষ্ট পার্টস এবং কাজ শেষে ফ্রেশ পার্টসের ছবি আপলোড করুন যাতে ইনভয়েস ও জব হিস্ট্রিতে সেভ থাকে।'}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0 hidden sm:inline">
            Dispute Proof
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. BEFORE WORK CARD */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                    <span>১. কাজ শুরুর আগে (Before)</span>
                  </span>
                  {beforeTime && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {beforeTime}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                  নষ্ট পার্টসের ছবি (Faulty/Damaged Part)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  কাজ শুরু করার পূর্বে নষ্ট যন্ত্রাংশ বা সমস্যার স্পষ্ট ছবি
                </p>

                {/* Photo Preview Container */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-4/3 flex items-center justify-center group mb-3 shadow-2xs">
                  {beforeUrl ? (
                    <>
                      <img
                        src={beforeUrl}
                        alt="Before work proof"
                        className="w-full h-full object-cover"
                      />
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            setBeforeUrl('');
                            setBeforeNote('');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-slate-400 flex flex-col items-center">
                      <Camera className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-xs font-bold text-slate-500">কোনো ছবি নেই</span>
                      <span className="text-[10px] text-slate-400">আপলোড বা স্যাম্পল সিলেক্ট করুন</span>
                    </div>
                  )}
                </div>

                {/* Notes Input / Display */}
                {!isReadOnly ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      নষ্ট পার্টসের বর্ণনা (Damage Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={beforeNote}
                      onChange={(e) => setBeforeNote(e.target.value)}
                      placeholder="যেমন: ক্যাপাসিটর ফুলে গেছে, ফ্যান জ্যাম..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  beforeNote && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">নোট:</span>
                      {beforeNote}
                    </div>
                  )
                )}
              </div>

              {/* Upload Controls for Before */}
              {!isReadOnly && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                  <input
                    ref={fileInputBeforeRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'before')}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputBeforeRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>ছবি আপলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePresetTab(activePresetTab === 'before' ? 'none' : 'before')}
                    className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    স্যাম্পল
                  </button>
                </div>
              )}
            </div>

            {/* 2. AFTER WORK CARD */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span>২. কাজ শেষে (After)</span>
                  </span>
                  {afterTime && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {afterTime}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                  ঠিক করার পর ফ্রেশ ছবি (Repaired Part)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  কাজ সম্পন্ন করার পর নতুন/মেরামতকৃত পার্টসের ফ্রেশ ছবি
                </p>

                {/* Photo Preview Container */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-4/3 flex items-center justify-center group mb-3 shadow-2xs">
                  {afterUrl ? (
                    <>
                      <img
                        src={afterUrl}
                        alt="After work proof"
                        className="w-full h-full object-cover"
                      />
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            setAfterUrl('');
                            setAfterNote('');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-slate-400 flex flex-col items-center">
                      <Camera className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-xs font-bold text-slate-500">কোনো ছবি নেই</span>
                      <span className="text-[10px] text-slate-400">কাজ শেষে ফ্রেশ ছবি দিন</span>
                    </div>
                  )}
                </div>

                {/* Notes Input / Display */}
                {!isReadOnly ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      মেরামতের বর্ণনা (Repair Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={afterNote}
                      onChange={(e) => setAfterNote(e.target.value)}
                      placeholder="যেমন: নতুন জাপানি ক্যাপাসিটর ইনস্টল ও টেস্ট কুলিং সম্পন্ন..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ) : (
                  afterNote && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">নোট:</span>
                      {afterNote}
                    </div>
                  )
                )}
              </div>

              {/* Upload Controls for After */}
              {!isReadOnly && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                  <input
                    ref={fileInputAfterRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'after')}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputAfterRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>ছবি আপলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePresetTab(activePresetTab === 'after' ? 'none' : 'after')}
                    className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    স্যাম্পল
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Selector Drawer */}
          {activePresetTab !== 'none' && !isReadOnly && (
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>
                    দ্রুত টেস্টের জন্য {activePresetTab === 'before' ? 'Before (নষ্ট)' : 'After (ফ্রেশ)'} স্যাম্পল ছবি বেছে নিন:
                  </span>
                </h5>
                <button
                  onClick={() => setActivePresetTab('none')}
                  className="text-indigo-400 hover:text-indigo-700 text-xs font-bold"
                >
                  বন্ধ করুন
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(activePresetTab === 'before' ? PRESET_BEFORE_PHOTOS : PRESET_AFTER_PHOTOS).map(
                  (preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset, activePresetTab)}
                      className="p-2 bg-white rounded-xl border border-indigo-200 hover:border-indigo-600 transition-all text-left flex flex-col group shadow-xs"
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-20 object-cover rounded-lg group-hover:scale-102 transition-transform"
                      />
                      <span className="text-[11px] font-bold text-slate-900 mt-1.5 line-clamp-1">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        {preset.note}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline">
            ইনভয়েস এবং সার্ভিস ট্র্যাকিংয়ে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              {isReadOnly ? 'বন্ধ করুন' : 'বাতিল'}
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!beforeUrl && !afterUrl}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>প্রুফ সেভ করুন (Save Proof)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
