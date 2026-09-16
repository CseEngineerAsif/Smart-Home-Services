import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  MapPin,
  Image as ImageIcon,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  ExternalLink,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Camera,
  AlertCircle,
  User,
  Wrench,
} from 'lucide-react';
import { ServiceRequest, ServiceProvider, ChatMessage } from '../types';
import { DHAKA_COORDINATES } from '../data/mockData';

interface InAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  provider?: ServiceProvider;
  currentUserRole: 'customer' | 'provider' | 'admin';
  messages: ChatMessage[];
  onSendMessage: (
    text: string,
    attachmentType?: 'text' | 'image' | 'location',
    attachmentUrl?: string,
    locationData?: {
      address: string;
      lat: number;
      lng: number;
      mapsUrl: string;
    }
  ) => void;
}

// Preset parts photos for quick sending
const SAMPLE_PARTS_PRESETS = [
  {
    name: 'AC Capacitor (45µF)',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    caption: 'নষ্ট ক্যাপাসিটর - নতুন অরিজিনাল ক্যাপাসিটর লাগবে (আনুমানিক ৳৫৫০)',
  },
  {
    name: 'Copper Pipe & Valve Leak',
    url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop&q=80',
    caption: 'পাইপ জয়েন্টে লিকেজ পাওয়া গেছে, ব্রাশিং ও গ্যাস সিলিং প্রয়োজন',
  },
  {
    name: 'Compressor Overload Relay',
    url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop&q=80',
    caption: 'কম্প্রেসার রিলে পুড়ে গেছে, রিপ্লেসমেন্ট পার্টস দরকার',
  },
  {
    name: 'Water Filter Cartridge',
    url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80',
    caption: 'ফিল্টার কার্টিজ ব্লকড, নতুন ফিল্টার ইনস্টল করতে হবে',
  },
];

export const InAppChatModal: React.FC<InAppChatModalProps> = ({
  isOpen,
  onClose,
  request,
  provider,
  currentUserRole,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle in-app voice call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalling) {
      setCallStatus('ringing');
      setCallDuration(0);
      const ringTimer = setTimeout(() => {
        setCallStatus('connected');
      }, 2000);

      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(ringTimer);
        clearInterval(timer);
      };
    }
  }, [isCalling]);

  if (!isOpen) return null;

  const isCustomer = currentUserRole === 'customer';
  const partnerName = isCustomer
    ? request.assignedProviderName || provider?.name || 'Technician'
    : request.customerName || 'Customer';
  const partnerPhone = isCustomer
    ? provider?.phone || '+880 1711-234567'
    : request.customerPhone || '+880 1712-998877';
  const partnerAvatar = isCustomer
    ? provider?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

  // Get location details for current request
  const locationInfo = DHAKA_COORDINATES[request.location] || {
    lat: 23.7461,
    lng: 90.3742,
    landmark: 'Dhanmondi Area',
    addressSnippet: `${request.location}, Dhaka`,
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  const handleShareLocation = () => {
    const lat = locationInfo.lat;
    const lng = locationInfo.lng;
    const address = `${locationInfo.addressSnippet} (${locationInfo.landmark})`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    onSendMessage(
      `📍 ঠিকানার লোকেশন: ${address}`,
      'location',
      undefined,
      {
        address,
        lat,
        lng,
        mapsUrl,
      }
    );
  };

  const handleSendSamplePart = (preset: typeof SAMPLE_PARTS_PRESETS[0]) => {
    onSendMessage(
      `🔧 পার্টস ছবি: ${preset.name} - ${preset.caption}`,
      'image',
      preset.url
    );
    setShowPhotoPicker(false);
  };

  const handleCustomPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhotoUrl.trim()) return;

    const text = photoCaption.trim()
      ? `📷 পার্টসের ছবি: ${photoCaption}`
      : '📷 প্রয়োজনীয় পার্টসের ছবি শেয়ার করা হয়েছে';

    onSendMessage(text, 'image', customPhotoUrl.trim());
    setCustomPhotoUrl('');
    setPhotoCaption('');
    setShowPhotoPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSendMessage('📷 প্রয়োজনীয় পার্টসের ছবি', 'image', reader.result);
          setShowPhotoPicker(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const QUICK_REPLIES = isCustomer
    ? [
        'আমি বাসায় আছি, গেট খোলা আছে',
        'আপনি কোন রাস্তায় আছেন?',
        'পার্টসের আনুমানিক দাম কত?',
        'লোকেশন ম্যাপ শেয়ার করেছি',
      ]
    : [
        'আমি ঠিকানায় পৌঁছে গেছি',
        'গেটের সামনে দাঁড়িয়ে আছি',
        'নষ্ট পার্টসের ছবি পাঠিয়েছি',
        'কাজ শুরু করছি, ১৫-২০ মিনিট লাগবে',
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[720px]">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-indigo-400/50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  {partnerName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {isCustomer ? 'টেকনিশিয়ান (Technician)' : 'কাস্টমার (Customer)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active on #{request.id} • {request.serviceType}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Phone Call Button */}
            <button
              onClick={() => setIsCalling(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title={`Call ${partnerName}`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সরাসরি কল</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Call Active Simulation Overlay */}
        {isCalling && (
          <div className="bg-gradient-to-b from-indigo-900 to-slate-950 text-white p-5 flex flex-col items-center justify-center border-b border-indigo-700/50 shadow-inner animate-in fade-in duration-200">
            <div className="relative mb-3">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-16 h-16 rounded-full object-cover border-4 border-indigo-400 ring-4 ring-indigo-500/30 shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            </div>
            <h4 className="font-extrabold text-base text-white">{partnerName}</h4>
            <p className="text-xs text-indigo-200 font-mono mt-0.5">{partnerPhone}</p>
            <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              {callStatus === 'ringing' ? (
                <span>Ringing SERVO Encrypted Voice Bridge...</span>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Connected • {formatDuration(callDuration)}</span>
                </>
              )}
            </p>

            {/* In-Call Controls */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-all ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3 rounded-full transition-all ${
                  isSpeakerOn ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Speaker"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <a
                href={`tel:${partnerPhone}`}
                className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                title="Real Phone Dial"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsCalling(false)}
                className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Service Context Sub-bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-900 truncate">{request.serviceType}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              {request.location}, Dhaka
            </span>
          </div>

          <button
            onClick={handleShareLocation}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>ঠিকানার লোকেশন শেয়ার</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">ইন-অ্যাপ চ্যাট চালু হয়েছে</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                ঠিকানার লোকেশন বা প্রয়োজনীয় নষ্ট/নতুন পার্টসের ছবি টেকনিশিয়ানকে পাঠিয়ে দ্রুত কাজ এগিয়ে নিন।
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (currentUserRole === 'customer' && msg.senderRole === 'customer') ||
                (currentUserRole === 'provider' && msg.senderRole === 'provider');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </span>

                  <div
                    className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 shadow-xs text-xs leading-relaxed ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {/* Text Message */}
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Image Attachment (Parts Photo) */}
                    {msg.attachmentType === 'image' && msg.attachmentUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-black/10 shadow-xs">
                        <img
                          src={msg.attachmentUrl}
                          alt="Parts attachment"
                          className="w-full max-h-56 object-cover bg-slate-100"
                        />
                      </div>
                    )}

                    {/* Location Attachment with Google Maps Link */}
                    {msg.attachmentType === 'location' && msg.locationData && (
                      <div className={`mt-2 p-2.5 rounded-xl border ${
                        isMine ? 'bg-indigo-700/60 border-indigo-400/40 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[11px] truncate">
                              {msg.locationData.address}
                            </p>
                            <p className="text-[10px] opacity-80 mt-0.5">
                              GPS: {msg.locationData.lat.toFixed(4)}, {msg.locationData.lng.toFixed(4)}
                            </p>
                            <a
                              href={msg.locationData.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                                isMine
                                  ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              <span>গুগল ম্যাপে দেখুন</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Quick:
          </span>
          {QUICK_REPLIES.map((reply, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(reply, 'text')}
              className="text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors shrink-0 shadow-2xs whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Photo Picker Drawer */}
        {showPhotoPicker && (
          <div className="p-3.5 bg-slate-100 border-t border-slate-200 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>প্রয়োজনীয় পার্টস বা সমস্যার ছবি পাঠান</span>
              </span>
              <button
                onClick={() => setShowPhotoPicker(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PARTS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendSamplePart(preset)}
                  className="flex flex-col items-start p-1.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 transition-all text-left group overflow-hidden"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-slate-800 mt-1 truncate w-full">
                    {preset.name}
                  </span>
                  <span className="text-[9px] text-slate-500 line-clamp-1">
                    Send with note
                  </span>
                </button>
              ))}
            </div>

            {/* Custom URL or File Upload */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>ডিভাইস থেকে আপলোড</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <form onSubmit={handleCustomPhotoSubmit} className="flex-1 flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder="বা ইমেজের URL পেস্ট করুন..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!customPhotoUrl.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
                >
                  পাঠান
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendText}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => setShowPhotoPicker(!showPhotoPicker)}
            className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
            title="পার্টস বা সমস্যার ছবি পাঠান"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleShareLocation}
            className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            title="ঠিকানার লোকেশন শেয়ার করুন"
          >
            <MapPin className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="মেসেজ লিখুন (Write a message)..."
            className="flex-1 bg-slate-100 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
