import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Copy,
  Check,
  Compass,
  Car,
  Clock,
  Share2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ServiceRequest, ServiceProvider } from '../types';
import { DHAKA_COORDINATES } from '../data/mockData';

interface ProviderMapNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  provider?: ServiceProvider;
  onOpenChat?: (request: ServiceRequest) => void;
}

export const ProviderMapNavigationModal: React.FC<ProviderMapNavigationModalProps> = ({
  isOpen,
  onClose,
  request,
  provider,
  onOpenChat,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!isOpen) return null;

  const locConfig = DHAKA_COORDINATES[request.location] || {
    lat: 23.7461,
    lng: 90.3742,
    landmark: 'Dhanmondi Lake & Road 7/A',
    addressSnippet: `House 42, Road 7/A, ${request.location}, Dhaka`,
  };

  const customerAddress =
    request.customerLocationDetails?.address || locConfig.addressSnippet;
  const customerLandmark =
    request.customerLocationDetails?.landmark || locConfig.landmark;
  const customerLat = request.customerLocationDetails?.lat || locConfig.lat;
  const customerLng = request.customerLocationDetails?.lng || locConfig.lng;

  // Provider departure location
  const providerLocation = provider?.location || 'Dhanmondi';
  const providerCoords = DHAKA_COORDINATES[providerLocation] || {
    lat: 23.7516,
    lng: 90.3882,
    landmark: 'Service Hub',
    addressSnippet: `${providerLocation} Hub`,
  };

  // Google Maps Directions URL
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${providerCoords.lat},${providerCoords.lng}&destination=${customerLat},${customerLng}&travelmode=driving`;
  const googleMapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${customerLat},${customerLng}`;

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(
      `${request.customerName}\n${customerAddress}\nল্যান্ডমার্ক: ${customerLandmark}\nফোন: ${request.customerPhone}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCoordinates = () => {
    navigator.clipboard?.writeText(`${customerLat}, ${customerLng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  গুগল ম্যাপ কাস্টমার লোকেশন ও নেভিগেশন
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-300">
                অর্ডার #{request.id} • কাস্টমার: {request.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
            <span>
              টেকনিশিয়ানের জন্য লাইভ গুগল ম্যাপ জিপিএস রুট ও ড্রাইভিং দিকনির্দেশনা।
            </span>
          </div>

          {/* Primary External Google Maps Launch Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>গুগল ম্যাপে নেভিগেশন চালু করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Interactive Visual Map Simulation */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64 sm:h-72 shadow-inner">
            {/* Styled Map Background Representation */}
            <div className="absolute inset-0 bg-[#e5e3df] overflow-hidden opacity-90">
              {/* Dhaka Grid & River Vector Lines */}
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Major Roads */}
                <path d="M-50,80 L800,240" stroke="#ffffff" strokeWidth="10" />
                <path d="M-50,80 L800,240" stroke="#fbd38d" strokeWidth="6" />
                <path d="M120,-20 L280,400" stroke="#ffffff" strokeWidth="8" />
                <path d="M120,-20 L280,400" stroke="#fed7aa" strokeWidth="4" />
                <path d="M350,-20 L420,400" stroke="#ffffff" strokeWidth="12" />
                <path d="M350,-20 L420,400" stroke="#fdba74" strokeWidth="7" />
                <path d="M50,180 Q300,120 700,160" stroke="#ffffff" strokeWidth="9" />
                <path d="M50,180 Q300,120 700,160" stroke="#fed7aa" strokeWidth="5" />

                {/* Lake Waterbody representation */}
                <path
                  d="M180,60 C210,100 190,160 220,220 C240,260 230,300 250,340"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="24"
                  strokeLinecap="round"
                />

                {/* Active Transit Route Line from Provider to Customer */}
                <path
                  d="M140,85 Q260,110 320,150 T480,210"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="5"
                  strokeDasharray="8,6"
                  className="animate-pulse"
                />
              </svg>
            </div>

            {/* Provider Origin Marker */}
            <div className="absolute top-[30%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[9px] font-bold shadow-md mb-1 whitespace-nowrap">
                আপনার হাব ({providerLocation})
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white border-2 border-white shadow-lg flex items-center justify-center font-bold">
                <Car className="w-4 h-4" />
              </div>
            </div>

            {/* Customer Destination Marker */}
            <div className="absolute top-[68%] left-[72%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-extrabold shadow-md mb-1 whitespace-nowrap animate-bounce flex items-center gap-1">
                <MapPin className="w-3 h-3 fill-current" />
                <span>কাস্টমারের বাসা</span>
              </div>
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></span>
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white border-3 border-white shadow-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* Map Overlay Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-2 rounded-xl border border-slate-200 shadow-md text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>২.৪ কিমি • আনুমানিক ১২ মিনিট</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                মিরপুর রোড হয়ে স্বাভাবিক ট্র্যাফিক
              </p>
            </div>

            {/* Direct Google Maps Floating Pin Link */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-600">
                GPS: {customerLat.toFixed(4)}, {customerLng.toFixed(4)}
              </span>
              <button
                onClick={handleCopyCoordinates}
                className="text-slate-500 hover:text-indigo-600 ml-1 p-0.5"
                title="Copy Coordinates"
              >
                {copiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Customer Address & Navigation Details Card */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  কাস্টমারের পূর্ণাঙ্গ ঠিকানা (Customer Full Address)
                </span>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{customerAddress}</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">ল্যান্ডমার্ক নির্দেশিকা:</span>
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-medium">
                    {customerLandmark}
                  </span>
                </p>
              </div>

              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs self-start"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">ঠিকানা কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>ঠিকানা কপি করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Route Instructions Steps */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                টার্ন-বাই-টার্ন রুট গাইড (Transit Directions)
              </span>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>{providerLocation} হাব থেকে দক্ষিণ দিকে রওনা হন এবং মিরপুর মেইন রোডে উঠুন।</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>রোড ৭/এ সিগন্যালে মোড় নিন ({customerLandmark})।</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>ডানপাশের গেট: {customerAddress} (গন্তব্য পৌঁছে গেছেন)।</span>
                </div>
              </div>
            </div>

            {/* Bilateral Contact Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
              <a
                href={`tel:${request.customerPhone}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>সরাসরি কল ({request.customerPhone})</span>
              </a>

              {onOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(request);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>কাস্টমার চ্যাটে মেসেজ পাঠান</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Latitude: {customerLat} • Longitude: {customerLng}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              বন্ধ করুন
            </button>
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>গুগল ম্যাপে খুলুন (Open Maps)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
