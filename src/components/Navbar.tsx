import React, { useState } from 'react';
import {
  Bell,
  User,
  Wrench,
  ShieldCheck,
  Home,
  Compass,
  PlusCircle,
  Briefcase,
  Calendar,
  Inbox,
  LogOut,
  LogIn,
  Activity,
  Layers,
  FileText,
  ChevronDown,
  Users,
} from 'lucide-react';
import { AppUser, AppNotification, UserRole } from '../types';
import { ServoLogoIcon } from './ServoLogoIcon';

export type CustomerNavTab = 'home' | 'explore' | 'request' | 'my-jobs' | 'profile';
export type ProviderNavTab = 'home' | 'requests' | 'jobs' | 'schedule' | 'profile';
export type AdminNavTab = 'overview' | 'bookings' | 'providers' | 'categories' | 'audit-logs' | 'profile';

interface NavbarProps {
  currentUser: AppUser | null;
  onSwitchRole: (role: UserRole) => void;
  activeCustomerTab: CustomerNavTab;
  onSelectCustomerTab: (tab: CustomerNavTab) => void;
  activeProviderTab: ProviderNavTab;
  onSelectProviderTab: (tab: ProviderNavTab) => void;
  activeAdminTab: AdminNavTab;
  onSelectAdminTab: (tab: AdminNavTab) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenDocs: () => void;
  activeRequestsCount: number;
  incomingRequestsCount: number;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  activeCustomerTab,
  onSelectCustomerTab,
  activeProviderTab,
  onSelectProviderTab,
  activeAdminTab,
  onSelectAdminTab,
  notifications,
  onOpenNotifications,
  onOpenDocs,
  activeRequestsCount,
  incomingRequestsCount,
  onOpenAuthModal,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const role = currentUser?.role || 'customer';
  const isCustomer = role === 'customer';
  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Brand Logo & Event Tag */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8.5 h-8.5 flex items-center justify-center shrink-0">
              <ServoLogoIcon className="w-8.5 h-8.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-[#004B9C]">
                SERVO
              </span>
              <span className="hidden xl:inline-flex px-1.5 py-0.5 text-[9px] font-semibold rounded bg-blue-50 text-[#004B9C] border border-blue-200/70">
                BAUST '26
              </span>
              {/* Role badge */}
              {currentUser && (
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                    isAdmin
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : isProvider
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-3 h-3 text-purple-600" /> : isProvider ? <Wrench className="w-3 h-3 text-blue-600" /> : <User className="w-3 h-3 text-emerald-600" />}
                  {role}
                </span>
              )}
            </div>
          </div>

          {/* Center Navigation Bar Links (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center h-14 gap-1 lg:gap-2">
            {/* 1. CUSTOMER TABS */}
            {isCustomer && (
              <>
                <button
                  id="nav-customer-home"
                  onClick={() => onSelectCustomerTab('home')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeCustomerTab === 'home'
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                  {activeCustomerTab === 'home' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600" />
                  )}
                </button>

                <button
                  id="nav-customer-explore"
                  onClick={() => onSelectCustomerTab('explore')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeCustomerTab === 'explore'
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Services</span>
                  {activeCustomerTab === 'explore' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600" />
                  )}
                </button>

                <button
                  id="nav-customer-request"
                  onClick={() => onSelectCustomerTab('request')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeCustomerTab === 'request'
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Request</span>
                  {activeCustomerTab === 'request' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600" />
                  )}
                </button>

                <button
                  id="nav-customer-jobs"
                  onClick={() => onSelectCustomerTab('my-jobs')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeCustomerTab === 'my-jobs'
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>My Requests</span>
                  {activeRequestsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 leading-none">
                      {activeRequestsCount}
                    </span>
                  )}
                  {activeCustomerTab === 'my-jobs' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600" />
                  )}
                </button>

                <button
                  id="nav-customer-profile"
                  onClick={() => onSelectCustomerTab('profile')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeCustomerTab === 'profile'
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                  {activeCustomerTab === 'profile' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600" />
                  )}
                </button>
              </>
            )}

            {/* 2. PROVIDER TABS */}
            {isProvider && (
              <>
                <button
                  id="nav-provider-home"
                  onClick={() => onSelectProviderTab('home')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeProviderTab === 'home'
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Overview</span>
                  {activeProviderTab === 'home' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  id="nav-provider-requests"
                  onClick={() => onSelectProviderTab('requests')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeProviderTab === 'requests'
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Requests</span>
                  {incomingRequestsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500 text-white leading-none animate-pulse">
                      {incomingRequestsCount}
                    </span>
                  )}
                  {activeProviderTab === 'requests' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  id="nav-provider-jobs"
                  onClick={() => onSelectProviderTab('jobs')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeProviderTab === 'jobs'
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Active Jobs</span>
                  {activeRequestsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 leading-none">
                      {activeRequestsCount}
                    </span>
                  )}
                  {activeProviderTab === 'jobs' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  id="nav-provider-schedule"
                  onClick={() => onSelectProviderTab('schedule')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeProviderTab === 'schedule'
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                  {activeProviderTab === 'schedule' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  id="nav-provider-profile"
                  onClick={() => onSelectProviderTab('profile')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeProviderTab === 'profile'
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                  {activeProviderTab === 'profile' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600" />
                  )}
                </button>
              </>
            )}

            {/* 3. ADMIN TABS */}
            {isAdmin && (
              <>
                <button
                  id="nav-admin-overview"
                  onClick={() => onSelectAdminTab('overview')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeAdminTab === 'overview'
                      ? 'text-purple-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                  {activeAdminTab === 'overview' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600" />
                  )}
                </button>

                <button
                  id="nav-admin-bookings"
                  onClick={() => onSelectAdminTab('bookings')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeAdminTab === 'bookings'
                      ? 'text-purple-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Dispatch & Requests</span>
                  {activeAdminTab === 'bookings' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600" />
                  )}
                </button>

                <button
                  id="nav-admin-providers"
                  onClick={() => onSelectAdminTab('providers')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeAdminTab === 'providers'
                      ? 'text-purple-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Providers</span>
                  {activeAdminTab === 'providers' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600" />
                  )}
                </button>

                <button
                  id="nav-admin-categories"
                  onClick={() => onSelectAdminTab('categories')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeAdminTab === 'categories'
                      ? 'text-purple-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Categories</span>
                  {activeAdminTab === 'categories' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600" />
                  )}
                </button>

                <button
                  id="nav-admin-audit"
                  onClick={() => onSelectAdminTab('audit-logs')}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs transition-colors cursor-pointer ${
                    activeAdminTab === 'audit-logs'
                      ? 'text-purple-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Audit Logs</span>
                  {activeAdminTab === 'audit-logs' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600" />
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Notifications & Profile Info */}
          <div className="flex items-center gap-2">
            {/* Notifications button */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={onOpenNotifications}
                className="w-8 h-8 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-1 ring-white" />
                )}
              </button>
            </div>

            {/* User Profile / Auth Actions */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity cursor-pointer"
                  title="User menu"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                        isAdmin
                          ? 'bg-purple-600'
                          : isProvider
                          ? 'bg-blue-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize leading-none">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {currentUser.role} • {currentUser.location}
                      </span>
                    </div>

                    {/* Actions: Login / Switch Account & Logout */}
                    <div className="py-1 space-y-0.5">
                      <button
                        id="dropdown-my-profile-btn"
                        onClick={() => {
                          setShowUserDropdown(false);
                          if (isCustomer) onSelectCustomerTab('profile');
                          else if (isProvider) onSelectProviderTab('profile');
                          else if (isAdmin) onSelectAdminTab('profile');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-slate-800 font-semibold cursor-pointer"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>My Profile & Photo</span>
                      </button>

                      {onOpenAuthModal && (
                        <button
                          id="dropdown-login-btn"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-blue-600 font-semibold cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </button>
                      )}
                      {onLogout && (
                        <button
                          id="dropdown-logout-btn"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-left text-rose-600 font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {onOpenAuthModal && (
                  <button
                    onClick={onOpenAuthModal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#004B9C] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern App-Style Bottom Navigation Bar (Mobile / Touch Devices) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-1.5 py-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className={`grid ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} items-center max-w-md mx-auto`}>
          {isCustomer ? (
            <>
              {/* Home */}
              <button
                id="mob-nav-customer-home"
                onClick={() => onSelectCustomerTab('home')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeCustomerTab === 'home'
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Home</span>
                {activeCustomerTab === 'home' && <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />}
              </button>

              {/* Services */}
              <button
                id="mob-nav-customer-explore"
                onClick={() => onSelectCustomerTab('explore')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeCustomerTab === 'explore'
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Compass className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Services</span>
                {activeCustomerTab === 'explore' && <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />}
              </button>

              {/* Request (Prominent Action Center Button) */}
              <button
                id="mob-nav-customer-request"
                onClick={() => onSelectCustomerTab('request')}
                className="min-h-[46px] flex flex-col items-center justify-center -mt-3.5 group cursor-pointer touch-manipulation"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 border-2 border-white group-active:scale-90 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 mt-0.5 leading-tight">Request</span>
              </button>

              {/* My Requests */}
              <button
                id="mob-nav-customer-jobs"
                onClick={() => onSelectCustomerTab('my-jobs')}
                className={`min-h-[46px] relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeCustomerTab === 'my-jobs'
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="relative">
                  <Briefcase className="w-5 h-5 mb-0.5" />
                  {activeRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {activeRequestsCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight">Requests</span>
                {activeCustomerTab === 'my-jobs' && <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />}
              </button>

              {/* Profile */}
              <button
                id="mob-nav-customer-profile"
                onClick={() => onSelectCustomerTab('profile')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeCustomerTab === 'profile'
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Profile</span>
                {activeCustomerTab === 'profile' && <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />}
              </button>
            </>
          ) : isProvider ? (
            <>
              {/* Provider Home */}
              <button
                id="mob-nav-provider-home"
                onClick={() => onSelectProviderTab('home')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeProviderTab === 'home'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Overview</span>
                {activeProviderTab === 'home' && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
              </button>

              {/* Provider Requests */}
              <button
                id="mob-nav-provider-requests"
                onClick={() => onSelectProviderTab('requests')}
                className={`min-h-[46px] relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeProviderTab === 'requests'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="relative">
                  <Inbox className="w-5 h-5 mb-0.5" />
                  {incomingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {incomingRequestsCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight">Requests</span>
                {activeProviderTab === 'requests' && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
              </button>

              {/* Provider Jobs */}
              <button
                id="mob-nav-provider-jobs"
                onClick={() => onSelectProviderTab('jobs')}
                className={`min-h-[46px] relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeProviderTab === 'jobs'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="relative">
                  <Briefcase className="w-5 h-5 mb-0.5" />
                  {activeRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {activeRequestsCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight">Jobs</span>
                {activeProviderTab === 'jobs' && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
              </button>

              {/* Provider Schedule */}
              <button
                id="mob-nav-provider-schedule"
                onClick={() => onSelectProviderTab('schedule')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeProviderTab === 'schedule'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Calendar className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Schedule</span>
                {activeProviderTab === 'schedule' && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
              </button>

              {/* Provider Profile */}
              <button
                id="mob-nav-provider-profile"
                onClick={() => onSelectProviderTab('profile')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeProviderTab === 'profile'
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Profile</span>
                {activeProviderTab === 'profile' && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
              </button>
            </>
          ) : (
            /* Admin Mobile Tabs */
            <>
              <button
                id="mob-nav-admin-overview"
                onClick={() => onSelectAdminTab('overview')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeAdminTab === 'overview'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Activity className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] leading-tight">Dash</span>
                {activeAdminTab === 'overview' && <span className="w-1 h-1 rounded-full bg-purple-600 mt-0.5" />}
              </button>

              <button
                id="mob-nav-admin-bookings"
                onClick={() => onSelectAdminTab('bookings')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeAdminTab === 'bookings'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Briefcase className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] leading-tight">Orders</span>
                {activeAdminTab === 'bookings' && <span className="w-1 h-1 rounded-full bg-purple-600 mt-0.5" />}
              </button>

              <button
                id="mob-nav-admin-providers"
                onClick={() => onSelectAdminTab('providers')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeAdminTab === 'providers'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Users className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] leading-tight">Pros</span>
                {activeAdminTab === 'providers' && <span className="w-1 h-1 rounded-full bg-purple-600 mt-0.5" />}
              </button>

              <button
                id="mob-nav-admin-categories"
                onClick={() => onSelectAdminTab('categories')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeAdminTab === 'categories'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Layers className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] leading-tight">Cats</span>
                {activeAdminTab === 'categories' && <span className="w-1 h-1 rounded-full bg-purple-600 mt-0.5" />}
              </button>

              <button
                id="mob-nav-admin-audit"
                onClick={() => onSelectAdminTab('audit-logs')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeAdminTab === 'audit-logs'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <FileText className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] leading-tight">Audit</span>
                {activeAdminTab === 'audit-logs' && <span className="w-1 h-1 rounded-full bg-purple-600 mt-0.5" />}
              </button>

              <button
                id="mob-nav-admin-profile"
                onClick={() => onSelectAdminTab('profile')}
                className={`min-h-[46px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                  activeAdminTab === 'profile'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <User className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] leading-tight">Profile</span>
                {activeAdminTab === 'profile' && <span className="w-1 h-1 rounded-full bg-purple-600 mt-0.5" />}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
