import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  CreditCard,
  CheckCircle2,
  Edit3,
  Camera,
  Save,
  X,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Building,
  Smartphone,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AppUser } from '../types';
import { DHAKA_AREAS } from '../data/mockData';
import { PhotoUploadModal } from './PhotoUploadModal';

interface CustomerProfileViewProps {
  currentUser: AppUser;
  onUpdateProfile: (updatedUser: AppUser) => void;
  onSwitchToProvider: () => void;
  activeRequestsCount: number;
  completedRequestsCount?: number;
}

interface SavedAddressItem {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

const DEFAULT_SAVED_ADDRESSES: SavedAddressItem[] = [
  {
    id: 'addr_1',
    label: 'Primary Residence',
    address: 'House 42, Road 27, Dhanmondi, Dhaka 1209',
    isDefault: true,
  },
  {
    id: 'addr_2',
    label: 'Work / Office',
    address: 'Level 6, UTC Building, Panthapath, Dhaka 1215',
    isDefault: false,
  },
  {
    id: 'addr_3',
    label: 'Family House',
    address: 'Ring Road, Mohammadpur, Dhaka 1207',
    isDefault: false,
  },
];

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  onSwitchToProvider,
  activeRequestsCount,
  completedRequestsCount = 5,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');

  // Editable Form State
  const [name, setName] = useState<string>(currentUser.name);
  const [email, setEmail] = useState<string>(currentUser.email);
  const [phone, setPhone] = useState<string>(currentUser.phone);
  const [location, setLocation] = useState<string>(currentUser.location);
  const [detailedAddress, setDetailedAddress] = useState<string>(
    currentUser.detailedAddress || 'House 42, Road 27, Dhanmondi, Dhaka 1209'
  );
  const [bio, setBio] = useState<string>(
    currentUser.bio || 'Please call 10 minutes before arrival at gate.'
  );
  const [emergencyContactName, setEmergencyContactName] = useState<string>(
    currentUser.emergencyContactName || 'Family Contact'
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>(
    currentUser.emergencyContactPhone || '+880 1711-001122'
  );
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<
    'bkash' | 'nagad' | 'card' | 'cash'
  >(currentUser.preferredPaymentMethod || 'bkash');

  // Preferences toggles
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [emergencyPriority, setEmergencyPriority] = useState<boolean>(true);
  const [emailInvoices, setEmailInvoices] = useState<boolean>(true);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(DEFAULT_SAVED_ADDRESSES);
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [newAddrLabel, setNewAddrLabel] = useState<string>('');
  const [newAddrText, setNewAddrText] = useState<string>('');

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: AppUser = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      phone: phone.trim() || currentUser.phone,
      location: location || currentUser.location,
      detailedAddress: detailedAddress.trim(),
      bio: bio.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      preferredPaymentMethod,
    };

    onUpdateProfile(updated);
    setIsEditing(false);
    showNotification('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone);
    setLocation(currentUser.location);
    setDetailedAddress(currentUser.detailedAddress || 'House 42, Road 27, Dhanmondi, Dhaka 1209');
    setBio(currentUser.bio || 'Please call 10 minutes before arrival at gate.');
    setEmergencyContactName(currentUser.emergencyContactName || 'Family Contact');
    setEmergencyContactPhone(currentUser.emergencyContactPhone || '+880 1711-001122');
    setPreferredPaymentMethod(currentUser.preferredPaymentMethod || 'bkash');
    setIsEditing(false);
  };

  const handlePhotoSaved = (newPhotoUrl: string) => {
    const updated: AppUser = {
      ...currentUser,
      avatarUrl: newPhotoUrl,
    };
    onUpdateProfile(updated);
    showNotification('Profile photo updated!');
  };

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast('');
    }, 3500);
  };

  const handleAddAddress = () => {
    if (!newAddrLabel.trim() || !newAddrText.trim()) return;
    const newAddr: SavedAddressItem = {
      id: `addr_${Date.now()}`,
      label: newAddrLabel.trim(),
      address: newAddrText.trim(),
      isDefault: false,
    };
    setSavedAddresses((prev) => [...prev, newAddr]);
    setNewAddrLabel('');
    setNewAddrText('');
    setShowAddAddress(false);
    showNotification('Address added to saved list!');
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setSavedAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    showNotification('Default delivery address updated.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs transition-all">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {saveToast}
          </span>
          <button onClick={() => setSaveToast('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Photo with Change Badge */}
            <div className="relative group">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-slate-100">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              {/* Photo Change Button Overlay */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                title="Update Profile Photo"
                className="absolute inset-0 bg-slate-900/40 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Change</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Verified Customer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SafeEscrow Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dhaka Metropolitan Member since {currentUser.createdAt || '2026'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {currentUser.location}, Dhaka
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {currentUser.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Photo</span>
            </button>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Bookings
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">{activeRequestsCount}</p>
          <span className="text-[10px] text-slate-500">Live dispatched</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Services
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{completedRequestsCount}</p>
          <span className="text-[10px] text-slate-500">100% verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SafeEscrow Status
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">Protected</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Zero-fraud shield</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Home Hub
          </span>
          <p className="text-xl font-extrabold text-slate-800 mt-1 truncate">{currentUser.location}</p>
          <span className="text-[10px] text-slate-500">Dhaka North / South</span>
        </div>
      </div>

      {/* Main Content: Edit Form OR View Details */}
      {isEditing ? (
        /* Edit Mode Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                Edit Customer Account Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details, service location, and notes for technicians
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Editing Active
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Fahim Alom"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. fahim@gmail.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+880 1712-998877"
                  />
                </div>
              </div>

              {/* Dhaka Area Location */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Dhaka Area Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {DHAKA_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}, Dhaka
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detailed Street Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Default Home / Delivery Address
              </label>
              <textarea
                rows={2}
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="House, Road, Apartment/Flat number, Landmark..."
              />
            </div>

            {/* Notes / Bio for Technicians */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Technician Arrival Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Lift is under maintenance, please call 5 minutes before arriving..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Emergency Contact Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Brother / Spouse"
                />
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="+880 1..."
                />
              </div>
            </div>

            {/* Preferred Payment Gateway */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Preferred Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'bkash', label: 'bKash Wallet', sub: 'Instant & Escrow' },
                  { id: 'nagad', label: 'Nagad Pay', sub: 'Instant & Escrow' },
                  { id: 'card', label: 'Debit / Credit Card', sub: 'Visa, Master, Amex' },
                  { id: 'cash', label: 'Cash On Delivery', sub: 'Direct Settlement' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPreferredPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      preferredPaymentMethod === pm.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{pm.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{pm.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Saved Addresses Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Saved Delivery Addresses
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Add Address Mini Form */}
            {showAddAddress && (
              <div className="p-3.5 mb-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">New Saved Address</span>
                  <button onClick={() => setShowAddAddress(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Label (e.g. Studio, Sister House)"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Full Address & Dhaka Area"
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                >
                  Save Address
                </button>
              </div>
            )}

            <div className="space-y-3">
              {savedAddresses.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.isDefault
                      ? 'bg-indigo-50/50 border-indigo-200'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {item.isDefault ? (
                        <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(item.id)}
                          className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600"
                        >
                          Make Default
                        </button>
                      )}
                      {!item.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(item.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Preferences & Security */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Notification & Dispatch Settings
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">SMS Transit & Arrival Alerts</p>
                  <p className="text-[11px] text-slate-500">Live SMS when technician starts transit</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    smsAlerts ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      smsAlerts ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Email Tax Invoices</p>
                  <p className="text-[11px] text-slate-500">Auto-send digital receipts after job finish</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailInvoices(!emailInvoices)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    emailInvoices ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      emailInvoices ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Emergency Dispatch Priority</p>
                  <p className="text-[11px] text-slate-500">Fast-track requests marked Emergency</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmergencyPriority(!emergencyPriority)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    emergencyPriority ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      emergencyPriority ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Emergency Contact Strip */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Emergency Contact: {currentUser.emergencyContactName || 'Family Contact'}
                  </p>
                  <p className="text-[11px] text-amber-800">
                    {currentUser.emergencyContactPhone || '+880 1711-001122'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch to Provider Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            Earn with SERVO
          </span>
          <h4 className="text-base font-extrabold mt-0.5">Are you a Skilled Technician in Dhaka?</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Join the SERVO Dispatch Network as a verified service provider. Receive instant bookings in
            your neighborhood with guaranteed SafeEscrow payments.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToProvider}
          className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          Switch to Provider View
        </button>
      </div>

      {/* Photo Upload / Selection Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        currentPhotoUrl={currentUser.avatarUrl}
        userName={currentUser.name}
        userRole={currentUser.role}
        onClose={() => setIsPhotoModalOpen(false)}
        onSavePhoto={handlePhotoSaved}
      />
    </div>
  );
};
