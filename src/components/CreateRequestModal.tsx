import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Camera,
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Upload,
  Sparkles,
  Trash2,
  Eye,
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { ServiceCategory, ServiceUrgency } from '../types';
import { DHAKA_AREAS, TIME_SLOTS, SERVICE_CATEGORIES } from '../data/mockData';

// Realistic Curated Sample Problem Photos for Home Repairs
const SAMPLE_ISSUE_PHOTOS = [
  {
    id: 'sample_ac_leak',
    title: 'AC Water Leakage',
    category: 'Appliance and Gadget Repair',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    desc: 'Water dripping from indoor split AC unit',
  },
  {
    id: 'sample_burnt_switch',
    title: 'Burnt Switch / Socket',
    category: 'Electrical',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
    desc: 'Charred socket with spark residue',
  },
  {
    id: 'sample_breaker',
    title: 'Tripped Circuit Breaker',
    category: 'Electrical',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    desc: 'Main DB board tripping continuously',
  },
  {
    id: 'sample_pipe_leak',
    title: 'Sink Pipe Burst',
    category: 'Plumbing',
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
    desc: 'Drain pipe leak under bathroom washbasin',
  },
  {
    id: 'sample_fridge',
    title: 'Refrigerator Cooling Issue',
    category: 'Appliance and Gadget Repair',
    url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80',
    desc: 'Excess ice frost & low cooling',
  },
  {
    id: 'sample_washing_machine',
    title: 'Washing Machine Error',
    category: 'Appliance and Gadget Repair',
    url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80',
    desc: 'Drum vibrating / water drainage stopped',
  },
  {
    id: 'sample_sofa_stain',
    title: 'Sofa Fabric Stains',
    category: 'Cleaning & Pest Control',
    url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
    desc: 'Deep beverage stain on living room sofa',
  },
  {
    id: 'sample_door_lock',
    title: 'Broken Door Lock',
    category: 'Home Maintenance',
    url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80',
    desc: 'Jammed latch and loose mortise handle',
  },
];

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ServiceCategory | null;
  initialSubService?: string;
  initialUrgency?: ServiceUrgency;
  initialDescription?: string;
  initialLocation?: string;
  initialDate?: string;
  initialTime?: string;
  userLocation: string;
  userPhone: string;
  onSubmit: (data: {
    category: string;
    subService: string;
    description: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    urgency: ServiceUrgency;
    imageUrl?: string;
    samplePhotos?: string[];
    contactPhone: string;
  }) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  initialSubService,
  initialUrgency = 'Normal',
  initialDescription = '',
  initialLocation,
  initialDate,
  initialTime,
  userLocation,
  userPhone,
  onSubmit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory?.name || SERVICE_CATEGORIES[0].name
  );
  const [selectedSubService, setSelectedSubService] = useState<string>(
    initialSubService || SERVICE_CATEGORIES[0].subServices[0]
  );
  const [description, setDescription] = useState(initialDescription);
  const [location, setLocation] = useState(initialLocation || userLocation);
  const [preferredDate, setPreferredDate] = useState(initialDate || 'Today (2026-09-08)');
  const [preferredTime, setPreferredTime] = useState<string>(initialTime || TIME_SLOTS[0]);
  const [urgency, setUrgency] = useState<ServiceUrgency>(initialUrgency);
  const [phone, setPhone] = useState(userPhone);

  // Real Photo Attachments State
  const [photos, setPhotos] = useState<string[]>([]);
  const [showSamplePicker, setShowSamplePicker] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory.name);
      setSelectedSubService(initialSubService || initialCategory.subServices[0]);
    }
  }, [initialCategory, initialSubService]);

  useEffect(() => {
    if (initialUrgency) setUrgency(initialUrgency);
    if (initialDescription) setDescription(initialDescription);
    if (initialLocation) setLocation(initialLocation);
    if (initialDate) setPreferredDate(initialDate);
    if (initialTime) setPreferredTime(initialTime);
  }, [initialUrgency, initialDescription, initialLocation, initialDate, initialTime]);

  // When urgency is set to Emergency, auto-set time slot to Immediate
  useEffect(() => {
    if (urgency === 'Emergency') {
      setPreferredTime('Immediate (Within 30 mins)');
    }
  }, [urgency]);

  if (!isOpen) return null;

  const currentCategoryObj = SERVICE_CATEGORIES.find((c) => c.name === selectedCategory) || SERVICE_CATEGORIES[0];

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    const cat = SERVICE_CATEGORIES.find((c) => c.name === catName);
    if (cat && cat.subServices.length > 0) {
      setSelectedSubService(cat.subServices[0]);
    }
  };

  // Process uploaded image files
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setPhotos((prev) => (prev.includes(result) ? prev : [...prev, result]));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSamplePhoto = (url: string) => {
    setPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddUrl = () => {
    if (customUrl.trim()) {
      setPhotos((prev) => [...prev, customUrl.trim()]);
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category: selectedCategory,
      subService: selectedSubService,
      description: description.trim() || `${selectedSubService} requested for ${location}.`,
      location,
      preferredDate,
      preferredTime,
      urgency,
      imageUrl: photos.length > 0 ? photos[0] : undefined,
      samplePhotos: photos.length > 0 ? photos : undefined,
      contactPhone: phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-4 md:p-6 py-6 sm:py-8">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
          {/* Pinned Header - Always Visible at Top */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Service Request Wizard
                </span>
                {urgency === 'Emergency' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                    EMERGENCY MODE
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Request Home Service
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5 flex-1">
              {/* Category & SubService */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Specific Service Type
                  </label>
                  <select
                    value={selectedSubService}
                    onChange={(e) => setSelectedSubService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {currentCategoryObj.subServices.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Contact Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location (Dhaka Area)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {DHAKA_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}, Dhaka
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-indigo-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+880 17XX-XXXXXX"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Urgency Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Normal', 'Urgent', 'Emergency'] as ServiceUrgency[]).map((level) => {
                    const isSelected = urgency === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? level === 'Emergency'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                              : level === 'Urgent'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{level}</span>
                        <span className="text-[10px] font-normal opacity-90">
                          {level === 'Emergency' ? 'Within 30m' : level === 'Urgent' ? 'Today' : 'Flexible'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-indigo-500 absolute left-3 top-3" />
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="Today (2026-09-08)">Today (2026-09-08)</option>
                      <option value="Tomorrow (2026-09-09)">Tomorrow (2026-09-09)</option>
                      <option value="Day After Tomorrow (2026-09-10)">Day After Tomorrow (2026-09-10)</option>
                      <option value="Flexible / As Soon As Possible">Flexible / As Soon As Possible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-indigo-500 absolute left-3 top-3" />
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Problem Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, appliance model, or specific requirements..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* ============================================================== */}
              {/* COMPREHENSIVE PHOTO ATTACHMENT & SAMPLE PHOTO SECTION          */}
              {/* ============================================================== */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Problem Photos & Sample References
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Upload your photo or choose a sample photo to help the technician arrive with the right spare parts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowSamplePicker(!showSamplePicker)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        showSamplePicker
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showSamplePicker ? 'Hide Samples' : 'Pick Sample Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for Native File/Camera Pick */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {/* Dropzone Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-indigo-600 bg-indigo-50/60'
                      : 'border-slate-300 hover:border-indigo-400 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-700">
                    Click to select from your device or drag & drop images here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP, or live camera snapshot on mobile
                  </p>
                </div>

                {/* Sample Photos Curated Preset Picker Panel */}
                {showSamplePicker && (
                  <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Common Issue Sample Photos (Click to attach):
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {SAMPLE_ISSUE_PHOTOS.length} sample templates
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                      {SAMPLE_ISSUE_PHOTOS.map((sample) => {
                        const isAttached = photos.includes(sample.url);
                        return (
                          <div
                            key={sample.id}
                            onClick={() => handleAddSamplePhoto(sample.url)}
                            className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer text-left ${
                              isAttached
                                ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                                : 'border-slate-200 hover:border-indigo-400 bg-slate-50'
                            }`}
                          >
                            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                              <img
                                src={sample.url}
                                alt={sample.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              {isAttached && (
                                <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                            <div className="p-1.5">
                              <p className="text-[11px] font-bold text-slate-800 truncate">
                                {sample.title}
                              </p>
                              <p className="text-[9px] text-slate-500 truncate">
                                {sample.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct Image URL Option toggle */}
                <div className="pt-1">
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Or paste an image web link</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/broken-unit.jpg"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Attached Photos Preview Strip */}
                {photos.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Attached Photos ({photos.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotos([])}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold"
                      >
                        Remove All
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {photos.map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-xs"
                        >
                          <img
                            src={photoUrl}
                            alt={`Attached ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-indigo-600/90 text-white text-[8px] font-bold px-1 rounded">
                              Primary
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewZoomImage(photoUrl);
                              }}
                              className="p-1 bg-white/90 text-slate-800 rounded-md hover:bg-white transition-colors"
                              title="Zoom Preview"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(idx);
                              }}
                              className="p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add more button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all text-center p-1"
                        title="Add another photo"
                      >
                        <Plus className="w-4 h-4 mb-0.5" />
                        <span className="text-[9px] font-bold leading-tight">Add Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Footer - Always Visible at Bottom */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/90">
              <div className="text-xs text-slate-500">
                {photos.length > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {photos.length} photo{photos.length > 1 ? 's' : ''} ready
                  </span>
                ) : (
                  <span>Photo optional</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-request-find-providers-btn"
                  type="submit"
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Search & Match Providers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {previewZoomImage && (
        <div
          onClick={() => setPreviewZoomImage(null)}
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <img
              src={previewZoomImage}
              alt="Zoomed problem view"
              className="max-h-[75vh] w-auto rounded-xl object-contain mx-auto"
            />
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-xs font-bold text-slate-700">Problem Photo Reference</span>
              <button
                type="button"
                onClick={() => setPreviewZoomImage(null)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
