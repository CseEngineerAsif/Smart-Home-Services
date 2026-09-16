import React, { useState } from 'react';
import {
  User,
  Wrench,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { AppUser, UserRole, ServiceProvider } from '../types';
import { DHAKA_AREAS, SERVICE_CATEGORIES } from '../data/mockData';
import {
  DEFAULT_CUSTOMER,
  DEFAULT_PROVIDER,
  DEFAULT_ADMIN,
  getStoredAccounts,
  saveStoredAccounts,
  setActiveSessionUser,
  StoredAccount,
} from '../data/authUsers';
import { ServoLogoIcon } from './ServoLogoIcon';

interface AuthViewProps {
  onLoginSuccess: (user: AppUser, newProvider?: ServiceProvider) => void;
  onContinueGuest?: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onContinueGuest,
  initialRole = 'customer',
  initialMode = 'login',
  isModal = false,
  onCloseModal,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Common Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Signup fields - Customer
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custLocation, setCustLocation] = useState<string>('Dhanmondi');
  const [custPassword, setCustPassword] = useState('');

  // Signup fields - Provider
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provCategory, setProvCategory] = useState<string>(SERVICE_CATEGORIES[0].name);
  const [provSpecialties, setProvSpecialties] = useState('');
  const [provBasePrice, setProvBasePrice] = useState(900);
  const [provExperience, setProvExperience] = useState(5);
  const [provLocation, setProvLocation] = useState<string>('Dhanmondi');
  const [provPassword, setProvPassword] = useState('');

  // Signup fields - Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('+880 1800-990000');
  const [adminDepartment, setAdminDepartment] = useState('Platform Operations & Dispatch');
  const [adminSecurityKey, setAdminSecurityKey] = useState('SERVO2026');
  const [adminPassword, setAdminPassword] = useState('');

  // Quick 1-Click Demo Login handler
  const handleQuickLogin = (role: UserRole) => {
    setErrorMessage('');
    let targetUser: AppUser;
    if (role === 'customer') {
      targetUser = DEFAULT_CUSTOMER;
    } else if (role === 'provider') {
      targetUser = DEFAULT_PROVIDER;
    } else {
      targetUser = DEFAULT_ADMIN;
    }
    setActiveSessionUser(targetUser);
    setSuccessMessage(`Logged in as ${targetUser.name} (${role.toUpperCase()})`);
    setTimeout(() => {
      onLoginSuccess(targetUser);
    }, 300);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your email/phone and password.');
      return;
    }

    const accounts = getStoredAccounts();
    const cleanEmail = loginEmail.trim().toLowerCase();

    // Check matching account
    const found = accounts.find(
      (acc) =>
        (acc.user.email.toLowerCase() === cleanEmail || acc.user.phone.includes(cleanEmail)) &&
        (selectedRole ? acc.user.role === selectedRole : true)
    );

    if (found) {
      if (found.passwordHash === loginPassword || loginPassword.length >= 4) {
        setActiveSessionUser(found.user);
        setSuccessMessage(`Welcome back, ${found.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(found.user);
        }, 350);
        return;
      } else {
        setErrorMessage('Incorrect password. For testing, use "customer123", "provider123", or "admin123".');
        return;
      }
    }

    // If not found in stored accounts, allow login for demo emails
    if (cleanEmail === DEFAULT_CUSTOMER.email.toLowerCase() || cleanEmail === 'customer') {
      setActiveSessionUser(DEFAULT_CUSTOMER);
      onLoginSuccess(DEFAULT_CUSTOMER);
      return;
    }
    if (cleanEmail === DEFAULT_PROVIDER.email.toLowerCase() || cleanEmail === 'provider') {
      setActiveSessionUser(DEFAULT_PROVIDER);
      onLoginSuccess(DEFAULT_PROVIDER);
      return;
    }
    if (cleanEmail === DEFAULT_ADMIN.email.toLowerCase() || cleanEmail === 'admin') {
      setActiveSessionUser(DEFAULT_ADMIN);
      onLoginSuccess(DEFAULT_ADMIN);
      return;
    }

    // Dynamic fallback account creation on successful login attempt
    const dynamicUser: AppUser = {
      id: `${selectedRole}_${Date.now().toString().slice(-5)}`,
      name: loginEmail.split('@')[0].replace(/[._]/g, ' '),
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@servo.bd`,
      phone: '+880 1700-000000',
      role: selectedRole,
      location: 'Dhanmondi',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const newAccounts = [...accounts, { user: dynamicUser, passwordHash: loginPassword }];
    saveStoredAccounts(newAccounts);
    setActiveSessionUser(dynamicUser);
    setSuccessMessage(`Signed in as ${dynamicUser.name}`);
    setTimeout(() => {
      onLoginSuccess(dynamicUser);
    }, 350);
  };

  // Submit Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const accounts = getStoredAccounts();

    if (selectedRole === 'customer') {
      if (!custName.trim() || !custEmail.trim() || !custPassword.trim()) {
        setErrorMessage('Please fill in Name, Email, and Password.');
        return;
      }
      const newCust: AppUser = {
        id: `cust_${Date.now().toString().slice(-5)}`,
        name: custName.trim(),
        email: custEmail.trim().toLowerCase(),
        phone: custPhone.trim() || '+880 1712-000000',
        role: 'customer',
        location: custLocation,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      const updated = [...accounts, { user: newCust, passwordHash: custPassword }];
      saveStoredAccounts(updated);
      setActiveSessionUser(newCust);
      setSuccessMessage('Customer account created successfully!');
      setTimeout(() => {
        onLoginSuccess(newCust);
      }, 400);
    } else if (selectedRole === 'provider') {
      if (!provName.trim() || !provEmail.trim() || !provPassword.trim()) {
        setErrorMessage('Please fill in Provider Name, Email, and Password.');
        return;
      }

      const provId = `prov_${Date.now().toString().slice(-4)}`;
      const newProvUser: AppUser = {
        id: provId,
        name: provName.trim(),
        businessName: provName.trim(),
        email: provEmail.trim().toLowerCase(),
        phone: provPhone.trim() || '+880 1811-000000',
        role: 'provider',
        location: provLocation,
        serviceCategory: provCategory,
        providerId: provId,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      // Create matching ServiceProvider entity
      const newProvEntity: ServiceProvider = {
        id: provId,
        name: provName.trim(),
        phone: provPhone.trim() || '+880 1811-000000',
        email: provEmail.trim().toLowerCase(),
        serviceCategories: [provCategory],
        specialties: provSpecialties
          ? provSpecialties.split(',').map((s) => s.trim())
          : [provCategory],
        location: provLocation,
        rating: 5.0,
        reviewCount: 1,
        basePrice: Number(provBasePrice) || 800,
        experienceYears: Number(provExperience) || 3,
        availableTimeSlots: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
          '04:00 PM - 06:00 PM',
          'Immediate (Within 30 mins)',
        ],
        currentWorkload: 0,
        completedJobs: 0,
        isAvailable: true,
        isVerified: true,
        status: 'active',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };

      const updated = [...accounts, { user: newProvUser, passwordHash: provPassword }];
      saveStoredAccounts(updated);
      setActiveSessionUser(newProvUser);
      setSuccessMessage('Provider profile registered & verified!');
      setTimeout(() => {
        onLoginSuccess(newProvUser, newProvEntity);
      }, 400);
    } else {
      // Admin Signup
      if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
        setErrorMessage('Please fill in Admin Name, Email, and Password.');
        return;
      }
      if (adminSecurityKey !== 'SERVO2026' && adminSecurityKey !== 'admin') {
        setErrorMessage('Invalid Admin Security Passcode. Default test passcode is: SERVO2026');
        return;
      }

      const newAdminUser: AppUser = {
        id: `admin_${Date.now().toString().slice(-4)}`,
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        phone: adminPhone.trim(),
        role: 'admin',
        location: 'Gulshan HQ',
        adminDepartment,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      const updated = [...accounts, { user: newAdminUser, passwordHash: adminPassword }];
      saveStoredAccounts(updated);
      setActiveSessionUser(newAdminUser);
      setSuccessMessage('Admin credential authorized!');
      setTimeout(() => {
        onLoginSuccess(newAdminUser);
      }, 400);
    }
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4'
          : 'min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8'
      }`}
    >
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative">
        {/* Top Decorative Brand Ribbon */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-emerald-600 to-indigo-600" />

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        )}

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <ServoLogoIcon className="w-10 h-10" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#004B9C]">
                SERVO
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Smart Everyday Service & Repair Operation
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Select your role to access dedicated customer booking, provider dispatch, or admin command interfaces across Dhaka.
            </p>
          </div>

          {/* Quick 1-Click Demo Logins Banner */}
          <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                1-Click Quick Demo Access
              </span>
              <span className="text-[10px] text-slate-600 font-medium">Instant Test</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                id="quick-login-customer-btn"
                onClick={() => handleQuickLogin('customer')}
                className="flex flex-col items-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 transition-all group text-center"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px]">Customer</span>
                <span className="text-[9px] text-emerald-700 truncate w-full">Fahim Alom</span>
              </button>

              <button
                type="button"
                id="quick-login-provider-btn"
                onClick={() => handleQuickLogin('provider')}
                className="flex flex-col items-center p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 transition-all group text-center"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px]">Provider</span>
                <span className="text-[9px] text-blue-700 truncate w-full">Rahim Electr.</span>
              </button>

              <button
                type="button"
                id="quick-login-admin-btn"
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-center p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 transition-all group text-center"
              >
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px]">Admin</span>
                <span className="text-[9px] text-purple-700 truncate w-full">Operations HQ</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          <div className="mt-5 flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              id="auth-mode-login-btn"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              id="auth-mode-signup-btn"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Role Selection Tabs */}
          <div className="mt-4">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Select User Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="role-select-customer"
                onClick={() => {
                  setSelectedRole('customer');
                  setLoginEmail(DEFAULT_CUSTOMER.email);
                  setLoginPassword('customer123');
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'customer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                id="role-select-provider"
                onClick={() => {
                  setSelectedRole('provider');
                  setLoginEmail(DEFAULT_PROVIDER.email);
                  setLoginPassword('provider123');
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'provider'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Provider</span>
              </button>

              <button
                type="button"
                id="role-select-admin"
                onClick={() => {
                  setSelectedRole('admin');
                  setLoginEmail(DEFAULT_ADMIN.email);
                  setLoginPassword('admin123');
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'admin'
                    ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-xs ring-1 ring-purple-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 px-0.5">
              {selectedRole === 'customer' && '• Customer: Book services, live tracking, AI diagnosis, booking history.'}
              {selectedRole === 'provider' && '• Provider: Receive job alerts, accept/reject, mark progress, set availability.'}
              {selectedRole === 'admin' && '• Admin: Monitor all bookings, verify providers, manage pricing & dispatch logs.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM: LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="login-email-input"
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'customer'
                        ? 'fahimalom013@gmail.com'
                        : selectedRole === 'provider'
                        ? 'rahim.electronics@smartfix.bd'
                        : 'admin@servo.bd'
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-600">
                  <span>Demo passwords: customer123 / provider123 / admin123</span>
                  <button
                    type="button"
                    onClick={() => setLoginPassword(selectedRole + '123')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Auto-fill Demo Password
                  </button>
                </div>
              </div>

              <button
                id="auth-submit-login-btn"
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#004B9C] hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all mt-2"
              >
                <span>Sign In as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* FORM: SIGN UP */
            <form onSubmit={handleSignupSubmit} className="mt-4 space-y-3">
              {/* Role specific inputs */}
              {selectedRole === 'customer' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="signup-cust-name"
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Asif Mahmud"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                      <input
                        id="signup-cust-email"
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="asif@example.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                      <input
                        id="signup-cust-phone"
                        type="tel"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+880 1711-000000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dhaka Area</label>
                      <select
                        id="signup-cust-location"
                        value={custLocation}
                        onChange={(e) => setCustLocation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      >
                        {DHAKA_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                      <input
                        id="signup-cust-password"
                        type="password"
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedRole === 'provider' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business or Technician Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="signup-prov-name"
                        type="text"
                        value={provName}
                        onChange={(e) => setProvName(e.target.value)}
                        placeholder="e.g. Master Clean & Repair Dhaka"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                      <input
                        id="signup-prov-email"
                        type="email"
                        value={provEmail}
                        onChange={(e) => setProvEmail(e.target.value)}
                        placeholder="provider@example.bd"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                      <input
                        id="signup-prov-phone"
                        type="tel"
                        value={provPhone}
                        onChange={(e) => setProvPhone(e.target.value)}
                        placeholder="+880 1819-000000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Category
                      </label>
                      <select
                        id="signup-prov-category"
                        value={provCategory}
                        onChange={(e) => setProvCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      >
                        {SERVICE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Base Area in Dhaka
                      </label>
                      <select
                        id="signup-prov-location"
                        value={provLocation}
                        onChange={(e) => setProvLocation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      >
                        {DHAKA_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Base Service Price (৳ BDT)
                      </label>
                      <input
                        id="signup-prov-price"
                        type="number"
                        min="200"
                        max="10000"
                        step="50"
                        value={provBasePrice}
                        onChange={(e) => setProvBasePrice(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Experience (Years)
                      </label>
                      <input
                        id="signup-prov-exp"
                        type="number"
                        min="1"
                        max="30"
                        value={provExperience}
                        onChange={(e) => setProvExperience(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specialties (comma separated)
                    </label>
                    <input
                      id="signup-prov-specialties"
                      type="text"
                      value={provSpecialties}
                      onChange={(e) => setProvSpecialties(e.target.value)}
                      placeholder="e.g. AC Filter Wash, Gas Refill, Circuit Board Repair"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      id="signup-prov-password"
                      type="password"
                      value={provPassword}
                      onChange={(e) => setProvPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {selectedRole === 'admin' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrator Name
                    </label>
                    <input
                      id="signup-admin-name"
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Tanvir Hossain"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                      <input
                        id="signup-admin-email"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="ops@servo.bd"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                      <select
                        id="signup-admin-department"
                        value={adminDepartment}
                        onChange={(e) => setAdminDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      >
                        <option value="Platform Operations & Dispatch">Operations & Dispatch</option>
                        <option value="Quality Assurance & Verification">Quality & Verification</option>
                        <option value="Emergency Response Control">Emergency Command</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Admin Security Key
                      </label>
                      <input
                        id="signup-admin-key"
                        type="text"
                        value={adminSecurityKey}
                        onChange={(e) => setAdminSecurityKey(e.target.value)}
                        placeholder="SERVO2026"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 font-mono"
                      />
                      <span className="text-[10px] text-slate-600">Default passcode: SERVO2026</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                      <input
                        id="signup-admin-password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                id="auth-submit-signup-btn"
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all mt-3"
              >
                <span>Complete {selectedRole.toUpperCase()} Registration</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Guest explore option */}
          {onContinueGuest && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                id="continue-as-guest-btn"
                onClick={onContinueGuest}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors flex items-center gap-1"
              >
                <span>Continue as Guest Customer to Explore Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
