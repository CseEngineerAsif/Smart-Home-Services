import React, { useState } from 'react';
import {
  Wrench,
  Star,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  CreditCard,
  CheckCircle2,
  User,
  Clock,
  Briefcase,
  Edit3,
  Camera,
  Save,
  X,
  Plus,
  Trash2,
  Sparkles,
  Building,
  Tag,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { ServiceProvider } from '../types';
import { DHAKA_AREAS, SERVICE_CATEGORIES } from '../data/mockData';
import { PhotoUploadModal } from './PhotoUploadModal';

interface ProviderProfileViewProps {
  provider: ServiceProvider;
  onSwitchToCustomer: () => void;
  onToggleAvailability: () => void;
  onUpdateProvider?: (updatedProvider: ServiceProvider) => void;
}

export const ProviderProfileView: React.FC<ProviderProfileViewProps> = ({
  provider,
  onSwitchToCustomer,
  onToggleAvailability,
  onUpdateProvider,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Editable fields
  const [name, setName] = useState<string>(provider.name);
  const [businessName, setBusinessName] = useState<string>(
    provider.businessName || `${provider.name} & Services`
  );
  const [phone, setPhone] = useState<string>(provider.phone);
  const [email, setEmail] = useState<string>(provider.email);
  const [location, setLocation] = useState<string>(provider.location);
  const [basePrice, setBasePrice] = useState<number>(provider.basePrice);
  const [experienceYears, setExperienceYears] = useState<number>(provider.experienceYears);
  const [bio, setBio] = useState<string>(
    provider.bio ||
      'Certified technician with over 8+ years experience servicing high-end inverter ACs, refrigerators, and circuit boards across Dhaka.'
  );
  const [tradeLicense, setTradeLicense] = useState<string>(
    provider.tradeLicense || 'TRAD-DNCC-2024-8891'
  );
  const [specialties, setSpecialties] = useState<string[]>(provider.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3500);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: ServiceProvider = {
      ...provider,
      name: name.trim() || provider.name,
      businessName: businessName.trim(),
      phone: phone.trim() || provider.phone,
      email: email.trim() || provider.email,
      location: location || provider.location,
      basePrice: Number(basePrice) || provider.basePrice,
      experienceYears: Number(experienceYears) || provider.experienceYears,
      bio: bio.trim(),
      tradeLicense: tradeLicense.trim(),
      specialties,
    };

    onUpdateProvider?.(updated);
    setIsEditing(false);
    showToast('Provider profile updated successfully!');
  };

  const handleCancel = () => {
    setName(provider.name);
    setBusinessName(provider.businessName || `${provider.name} & Services`);
    setPhone(provider.phone);
    setEmail(provider.email);
    setLocation(provider.location);
    setBasePrice(provider.basePrice);
    setExperienceYears(provider.experienceYears);
    setBio(
      provider.bio ||
        'Certified technician with over 8+ years experience servicing high-end inverter ACs, refrigerators, and circuit boards across Dhaka.'
    );
    setTradeLicense(provider.tradeLicense || 'TRAD-DNCC-2024-8891');
    setSpecialties(provider.specialties || []);
    setIsEditing(false);
  };

  const handlePhotoSaved = (newPhotoUrl: string) => {
    const updated: ServiceProvider = {
      ...provider,
      avatar: newPhotoUrl || provider.avatar,
    };
    onUpdateProvider?.(updated);
    showToast('Provider profile photo updated!');
  };

  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (specialties.includes(newSpecialty.trim())) return;
    setSpecialties([...specialties, newSpecialty.trim()]);
    setNewSpecialty('');
  };

  const handleRemoveSpecialty = (spec: string) => {
    setSpecialties(specialties.filter((s) => s !== spec));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs transition-all">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Provider Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Camera badge */}
            <div className="relative group">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-slate-100">
                  {provider.name.charAt(0)}
                </div>
              )}
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
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{provider.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Provider
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    provider.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      provider.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {provider.isAvailable ? 'Accepting Jobs' : 'Shift Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Trade License: #{provider.tradeLicense || 'TRAD-DNCC-2024-8891'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Base: {provider.location}, Dhaka
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  {provider.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {provider.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Photo</span>
            </button>

            <button
              type="button"
              onClick={onToggleAvailability}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                provider.isAvailable
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-white' : 'bg-slate-500'}`} />
              <span>{provider.isAvailable ? 'Accepting Jobs' : 'Shift Paused'}</span>
            </button>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
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

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Customer Rating
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-xl font-extrabold text-slate-900">{provider.rating}</span>
            <span className="text-xs text-slate-500 font-medium">({provider.reviewCount})</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Jobs
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{provider.completedJobs}</p>
          <span className="text-[10px] text-slate-500">100% verified payout</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Field Experience
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{provider.experienceYears} Years</p>
          <span className="text-[10px] text-slate-500">Certified technician</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Base Inspection Fee
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">৳{provider.basePrice}</p>
          <span className="text-[10px] text-slate-500">Per service call</span>
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
                Edit Provider Profile & Service Rates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your business information, service hub, rate card, and specialties
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Editing Active
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Provider Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Technician / Lead Specialist Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Rahim Ahmed"
                  />
                </div>
              </div>

              {/* Business / Shop Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Business / Workshop Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Rahim Electronics & AC Care"
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
                    placeholder="+880 1711-234567"
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
                    placeholder="e.g. rahim@smartfix.bd"
                  />
                </div>
              </div>

              {/* Base Location */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Primary Base Location in Dhaka *
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

              {/* Trade License # */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Trade License / NID Verification #
                </label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="TRAD-DNCC-2024-..."
                />
              </div>

              {/* Base Price */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Base Inspection / Service Fee (৳) *
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-3">৳</span>
                  <input
                    type="number"
                    required
                    min={100}
                    step={50}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Experience Years */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Field Experience (Years) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={45}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="8"
                />
              </div>
            </div>

            {/* Bio / Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Professional Bio & Work History
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Highlight your technician skills, certifications, and types of repair services offered..."
              />
            </div>

            {/* Specialties Chips Editor */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Service Specialties & Skills
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {specialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(spec)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Inverter PCB, Gas Refill)"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0"
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Provider Profile</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specialties & Capabilities Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Specialties & Capabilities
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {specialties.length} Skills
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {provider.bio ||
                'Certified technician with over 8+ years experience servicing high-end inverter ACs, refrigerators, and circuit boards across Dhaka.'}
            </p>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Verified Skill Set
              </span>
              <div className="flex flex-wrap gap-2">
                {specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Service Category
              </span>
              <span className="inline-block px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 font-bold text-xs border border-indigo-200">
                {provider.serviceCategories?.join(', ') || 'Appliance and Gadget Repair'}
              </span>
            </div>
          </div>

          {/* Verification & Schedule Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                SERVO Trust & Verification
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Dhaka Trade License Verified</p>
                  <p className="text-slate-500 text-[11px]">DNCC Business Registry 2026-8891</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">National ID & Background Screened</p>
                  <p className="text-slate-500 text-[11px]">Police verification clearance recorded</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">SafeEscrow Instant Payouts</p>
                  <p className="text-slate-500 text-[11px]">Direct bKash / Bank account linked</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Available Shifts
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {provider.availableTimeSlots?.map((slot) => (
                  <span
                    key={slot}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-100"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch to Customer Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Customer Mode
          </span>
          <h4 className="text-base font-extrabold mt-0.5">Need a Home Service for Yourself?</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Switch back to customer mode anytime to book repairs, cleaning, plumbing, or electrical
            services across Dhaka.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToCustomer}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          Switch to Customer View
        </button>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        currentPhotoUrl={provider.avatar}
        userName={provider.name}
        userRole="provider"
        onClose={() => setIsPhotoModalOpen(false)}
        onSavePhoto={handlePhotoSaved}
      />
    </div>
  );
};
