import React from 'react';
import { X, Bell, Check, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-4 md:p-6 py-6 sm:py-8">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden">
          {/* Pinned Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <p className="text-[11px] text-slate-500">Real-time alerts for jobs & matches</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto px-5 py-4 space-y-2.5 flex-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border text-xs transition-all ${
                    notif.read ? 'bg-slate-50 border-slate-200/60 opacity-80' : 'bg-indigo-50/50 border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Pinned Footer */}
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/90">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Mark all as read
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
