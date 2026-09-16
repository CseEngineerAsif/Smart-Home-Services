import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Key,
  CheckCircle2,
  Edit3,
  Camera,
  Save,
  X,
  Lock,
  Radio,
  Sliders,
  Sparkles,
  Activity,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { AppUser } from '../types';
import { DHAKA_AREAS } from '../data/mockData';
import { PhotoUploadModal } from './PhotoUploadModal';

interface AdminProfileViewProps {
  adminUser: AppUser;
  onUpdateAdminProfile: (updatedAdmin: AppUser) => void;
  onSwitchToOverview?: () => void;
}

const ADMIN_DEPARTMENTS = [
  'Operations & Dispatch Commander',
  'Compliance, KYC & Escrow Security',
  'Technician Verification & Quality Assurance',
  'Customer Happiness & Dispute Resolution',
  'Platform Architect & Systems Lead',
];

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  adminUser,
  onUpdateAdminProfile,
  onSwitchToOverview,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Editable fields
  const [name, setName] = useState<string>(adminUser.name);
  const [email, setEmail] = useState<string>(adminUser.email);
  const [phone, setPhone] = useState<string>(adminUser.phone);
  const [location, setLocation] = useState<string>(adminUser.location || 'Gulshan HQ');
  const [adminDepartment, setAdminDepartment] = useState<string>(
    adminUser.adminDepartment || 'Operations & Dispatch Commander'
  );
  const [bio, setBio] = useState<string>(
    adminUser.bio ||
      'Supervises real-time field technician dispatching, escrow clearance, and high-priority emergency responses throughout the Dhaka Metropolitan area.'
  );

  // Security Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(true);
  const [auditAlerts, setAuditAlerts] = useState<boolean>(true);
  const [emergencyBypass, setEmergencyBypass] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3500);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: AppUser = {
      ...adminUser,
      name: name.trim() || adminUser.name,
      email: email.trim() || adminUser.email,
      phone: phone.trim() || adminUser.phone,
      location: location.trim() || adminUser.location,
      adminDepartment,
      bio: bio.trim(),
    };

    onUpdateAdminProfile(updated);
    setIsEditing(false);
    showToast('Administrator profile updated successfully!');
  };

  const handleCancel = () => {
    setName(adminUser.name);
    setEmail(adminUser.email);
    setPhone(adminUser.phone);
    setLocation(adminUser.location || 'Gulshan HQ');
    setAdminDepartment(adminUser.adminDepartment || 'Operations & Dispatch Commander');
    setBio(
      adminUser.bio ||
        'Supervises real-time field technician dispatching, escrow clearance, and high-priority emergency responses throughout the Dhaka Metropolitan area.'
    );
    setIsEditing(false);
  };

  const handlePhotoSaved = (newPhotoUrl: string) => {
    const updated: AppUser = {
      ...adminUser,
      avatarUrl: newPhotoUrl,
    };
    onUpdateAdminProfile(updated);
    showToast('Admin profile photo updated!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
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

      {/* Admin Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Camera badge */}
            <div className="relative group">
              {adminUser.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl}
                  alt={adminUser.name}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-purple-100 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-purple-100">
                  {adminUser.name.charAt(0)}
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
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{adminUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 uppercase tracking-wider">
                  <Shield className="w-3 h-3 text-purple-600" />
                  System Administrator
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Root Clearance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{adminUser.adminDepartment || 'Operations & Dispatch Commander'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {adminUser.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  {adminUser.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {adminUser.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>Change Photo</span>
            </button>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
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

      {/* Admin Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Access Role
          </span>
          <p className="text-xl font-extrabold text-purple-700 mt-1">Super Admin</p>
          <span className="text-[10px] text-slate-500">Dhaka Region Command</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Security Status
          </span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">2FA Enforced</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Hardware Key Active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Audit Authority
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">Escrow & Payouts</p>
          <span className="text-[10px] text-slate-500">Full ledger override</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Duty Station
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{adminUser.location}</p>
          <span className="text-[10px] text-slate-500">Main Control Center</span>
        </div>
      </div>

      {/* Main Content: Edit Form OR View Details */}
      {isEditing ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600" />
                Edit Administrator Credentials & Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your administrative title, command department, and official contact channels
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Admin Editing
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Administrator Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="e.g. Tanvir Hossain"
                  />
                </div>
              </div>

              {/* Official Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Official Admin Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="admin@servo.bd"
                  />
                </div>
              </div>

              {/* Official Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Emergency Command Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="+880 1800-999000"
                  />
                </div>
              </div>

              {/* Admin Department */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Operational Department *
                </label>
                <select
                  value={adminDepartment}
                  onChange={(e) => setAdminDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  {ADMIN_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Headquarters Location */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Command Headquarters & Station
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="e.g. Gulshan HQ, 8th Floor"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Role Description & Responsibility Scope
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Detail your responsibilities in overseeing Dhaka platform operations..."
              />
            </div>

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
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Admin Profile</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Scope */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Administrative Scope & Role
              </h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                Active Commander
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {adminUser.bio ||
                'Supervises real-time field technician dispatching, escrow clearance, and high-priority emergency responses throughout the Dhaka Metropolitan area.'}
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-900">{adminUser.adminDepartment}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Clearance Level</span>
                <span className="font-bold text-emerald-700">Tier 1 - Root Dispatch</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Admin ID</span>
                <span className="font-mono text-slate-600">{adminUser.id}</span>
              </div>
            </div>
          </div>

          {/* Security Protocols */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                System Security & Control Center
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Enforced
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-slate-500">Hardware authenticator / SMS verification</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    twoFactorAuth ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      twoFactorAuth ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Real-Time Audit Trail Alerts</p>
                  <p className="text-[11px] text-slate-500">Notify upon payout manual release</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditAlerts(!auditAlerts)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    auditAlerts ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      auditAlerts ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Emergency Override Access</p>
                  <p className="text-[11px] text-slate-500">Can reassign technicians directly</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmergencyBypass(!emergencyBypass)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    emergencyBypass ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      emergencyBypass ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        currentPhotoUrl={adminUser.avatarUrl}
        userName={adminUser.name}
        userRole="admin"
        onClose={() => setIsPhotoModalOpen(false)}
        onSavePhoto={handlePhotoSaved}
      />
    </div>
  );
};
