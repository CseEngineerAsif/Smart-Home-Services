import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  RefreshCw,
  Trash2,
  Camera,
  Link,
  ShieldCheck,
  User,
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  currentPhotoUrl?: string;
  userName: string;
  userRole: 'customer' | 'provider' | 'admin';
  onClose: () => void;
  onSavePhoto: (newPhotoUrl: string) => void;
}

// Curated high quality avatars matching real professional aesthetics
const AVATAR_PRESETS = [
  // Friendly Customer Avatars
  {
    id: 'cust_1',
    label: 'Modern Casual 1',
    category: 'customer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_2',
    label: 'Modern Casual 2',
    category: 'customer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_3',
    label: 'Casual Portrait 3',
    category: 'customer',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_4',
    label: 'Casual Portrait 4',
    category: 'customer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  },
  // Field Specialists & Technicians
  {
    id: 'tech_1',
    label: 'AC Specialist',
    category: 'provider',
    url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech_2',
    label: 'Electrical Pro',
    category: 'provider',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech_3',
    label: 'Master Plumber',
    category: 'provider',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech_4',
    label: 'Home Maintenance Specialist',
    category: 'provider',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech_5',
    label: 'Senior Engineer',
    category: 'provider',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&auto=format&fit=crop&q=80',
  },
  // Executives & System Administrators
  {
    id: 'admin_1',
    label: 'Operations Director',
    category: 'admin',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin_2',
    label: 'Security & Dispatch Lead',
    category: 'admin',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin_3',
    label: 'Command Executive',
    category: 'admin',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
  },
  // Clean Professional Avatars
  {
    id: 'pro_1',
    label: 'Studio Portrait 1',
    category: 'all',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'pro_2',
    label: 'Studio Portrait 2',
    category: 'all',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'pro_3',
    label: 'Studio Portrait 3',
    category: 'all',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'pro_4',
    label: 'Studio Portrait 4',
    category: 'all',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  currentPhotoUrl,
  userName,
  userRole,
  onClose,
  onSavePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhotoUrl || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }
    // Limit to 8MB
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedPhoto(result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a valid image web URL.');
      return;
    }
    setErrorMsg('');
    setSelectedPhoto(urlInput.trim());
  };

  const handleSave = () => {
    onSavePhoto(selectedPhoto);
    onClose();
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto('');
    onSavePhoto('');
    onClose();
  };

  const filteredPresets = AVATAR_PRESETS.filter((preset) => {
    if (filterCategory === 'all') return true;
    return preset.category === filterCategory || preset.category === 'all';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Update Profile Photo</h2>
              <p className="text-xs text-slate-500">
                Upload a custom photo or choose from verified SERVO presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Live Preview Display */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="relative">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={userName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-white">
                  {userName.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs">
                {userRole}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-slate-900">{userName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedPhoto
                  ? 'Photo is ready to save to your account profile.'
                  : 'Currently showing default avatar initials.'}
              </p>
              {selectedPhoto && (
                <button
                  onClick={() => setSelectedPhoto('')}
                  className="mt-2 text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 mx-auto sm:mx-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset to Initials</span>
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Selector Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avatar Presets</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Tab 1: File Upload (Drag & Drop) */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Click to browse or drag & drop photo
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, JPEG, WEBP (up to 8MB)
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Choose From Device
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Curated Presets Gallery */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">Filter Presets:</span>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      filterCategory === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterCategory('customer')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      filterCategory === 'customer'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => setFilterCategory('provider')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      filterCategory === 'provider'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Provider
                  </button>
                  <button
                    onClick={() => setFilterCategory('admin')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      filterCategory === 'admin'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPhoto(preset.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/30 scale-95'
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white text-indigo-700 flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Image URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Paste Direct Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0"
                >
                  Preview
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                You can use direct image links from Unsplash, Imgur, or cloud storage.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {currentPhotoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
