import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Star,
  MapPin,
  Clock,
  Briefcase,
  Zap,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { ProviderMatchResult, ServiceProvider, ServiceRequest } from '../types';
import { ProviderRatingHistoryModal } from './ProviderRatingHistoryModal';
import { getCombinedProviderReviews } from '../data/providerReviews';

interface ProviderMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: ProviderMatchResult[];
  category: string;
  subService: string;
  location: string;
  preferredTime: string;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  onSelectProvider: (provider: ServiceProvider, autoAssign: boolean) => void;
  allRequests?: ServiceRequest[];
  currentUserId?: string;
}

export const ProviderMatchingModal: React.FC<ProviderMatchingModalProps> = ({
  isOpen,
  onClose,
  matches,
  category,
  subService,
  location,
  preferredTime,
  urgency,
  onSelectProvider,
  allRequests = [],
  currentUserId,
}) => {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);
  const [selectedReviewProvider, setSelectedReviewProvider] = useState<ServiceProvider | null>(null);
  const [expandedInlineReviewId, setExpandedInlineReviewId] = useState<string | null>(null);

  if (!isOpen) return null;

  const topMatch = matches.length > 0 ? matches[0] : null;

  const handleConfirmBooking = (match: ProviderMatchResult) => {
    onSelectProvider(match.provider, false);
  };

  const handleAutoAssign = () => {
    if (topMatch) {
      onSelectProvider(topMatch.provider, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-4 md:p-6 py-6 sm:py-8">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header - Pinned at top */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Smart Provider Matching Engine
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    urgency === 'Emergency'
                      ? 'bg-rose-100 text-rose-700'
                      : urgency === 'Urgent'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {urgency} Priority
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Recommended Technicians in Dhaka
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Service: <strong className="text-slate-800">{subService}</strong> • Destination: <strong className="text-slate-800">{location}</strong> • Schedule: <strong className="text-slate-800">{preferredTime}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 flex-1">
            {/* Algorithm Weights Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  {urgency === 'Emergency' ? 'Emergency Dispatch Weights:' : 'Multi-Factor Ranking Formula:'}
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  {urgency === 'Emergency'
                    ? 'Availability 35% + Distance 30% + Expertise 20% + Rating 10% + Price 5% - Workload'
                    : 'Expertise 30% + Availability 25% + Rating 20% + Distance 15% + Price 10% - Workload'}
                </p>
              </div>

              {/* Auto Assign Toggle Pill */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-700">Auto Assign Best Provider</span>
                <button
                  id="auto-assign-toggle-btn"
                  type="button"
                  onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    autoAssignEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoAssignEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 1-Click Auto Assign Banner if enabled */}
            {autoAssignEnabled && topMatch && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50/60 border border-indigo-200 text-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                      Top Recommended Pick
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      Match Score: {topMatch.matchScore}%
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mt-1">{topMatch.provider.name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{topMatch.explanation}</p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setSelectedReviewProvider(topMatch.provider)}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="View rating history & reviews for top match"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Rating History</span>
                  </button>
                  <button
                    id="confirm-auto-assign-btn"
                    onClick={handleAutoAssign}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all whitespace-nowrap flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Auto-Assign & Pay ৳{topMatch.provider.basePrice}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Provider Cards List */}
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/90 px-3.5 py-2 rounded-xl border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Payment First, Booking Second:</strong> Clicking <strong>Book & Pay</strong> opens the secure gateway (bKash, Nagad, Card, or COD). Your booking is officially created and technician scheduled only upon successful payment authorization.
              </span>
            </div>

            <div className="space-y-3">
          {matches.map((match, idx) => {
            const { provider, matchScore, distanceKm, isSlotAvailable, explanation, badges, breakdown } = match;
            const isExpanded = expandedBreakdownId === provider.id;
            const providerReviews = getCombinedProviderReviews(provider.id, allRequests, currentUserId);
            const totalReviewsCount = providerReviews.length > 0 ? providerReviews.length : provider.reviewCount;

            return (
              <div
                key={provider.id}
                id={`provider-match-card-${provider.id}`}
                className={`p-4 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Provider Info */}
                  <div className="flex items-start gap-3">
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm">{provider.name}</h3>
                        {badges.map((b) => (
                          <span
                            key={b}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b === 'Best Match'
                                ? 'bg-indigo-600 text-white'
                                : b === 'Best Price'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {/* Interactive Rating Button with Click to View Rating History */}
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProvider(provider)}
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-200 transition-all cursor-pointer group shadow-2xs"
                          title="Click to view customer ratings and reviews"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-slate-900">{typeof provider.rating === 'number' && !isNaN(provider.rating) ? provider.rating.toFixed(1) : '4.8'}</span>
                          <span className="text-slate-500 font-medium underline decoration-amber-300">
                            ({totalReviewsCount || 0})
                          </span>
                        </button>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {provider.location} ({typeof distanceKm === 'number' && !isNaN(distanceKm) ? distanceKm.toFixed(1) : '2.5'} km)
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {provider.experienceYears || 3} yrs exp • {provider.completedJobs || 0} jobs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Select Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-medium">Match:</span>
                        <span className="text-base font-extrabold text-indigo-700">
                          {typeof matchScore === 'number' && !isNaN(matchScore) ? matchScore : 85}%
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 sm:mt-0.5">
                        ৳{provider.basePrice || 800}
                      </span>
                    </div>

                    <button
                      id={`select-provider-btn-${provider.id}`}
                      onClick={() => handleConfirmBooking(match)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        idx === 0
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-black text-white'
                      }`}
                    >
                      <span>Book & Pay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-slate-600 mt-2.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                  {explanation}
                </p>

                {/* Breakdown & Rating History toggle bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {isSlotAvailable ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Slot Available
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Limited Slot Availability
                      </span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span>Workload: {provider.currentWorkload} active</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* SPECIFIC RATING HISTORY BUTTON (as requested by user) */}
                    <button
                      id={`rating-history-btn-${provider.id}`}
                      type="button"
                      onClick={() => setSelectedReviewProvider(provider)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 text-xs font-bold border border-amber-200/90 shadow-2xs transition-all cursor-pointer hover:shadow-xs group"
                      title="Click to view customer ratings and reviews history"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span>Rating History ({totalReviewsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedBreakdownId(isExpanded ? null : provider.id)}
                      className="text-indigo-600 hover:underline font-semibold text-[11px] px-1 py-1"
                    >
                      {isExpanded ? 'Hide Score Breakdown' : 'View Score Breakdown'}
                    </button>
                  </div>
                </div>

                {/* Expanded Score Breakdown */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] bg-white p-2 rounded-lg">
                    <div>
                      <span className="text-slate-400 block">Expertise</span>
                      <span className="font-bold text-slate-800">{breakdown.expertiseScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Availability</span>
                      <span className="font-bold text-slate-800">{breakdown.availabilityScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Rating</span>
                      <span className="font-bold text-slate-800">{breakdown.ratingScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Distance</span>
                      <span className="font-bold text-slate-800">{breakdown.distanceScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Workload Penalty</span>
                      <span className="font-bold text-rose-600">-{breakdown.workloadPenalty}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </div>

          {/* Footer - Pinned at bottom */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0 bg-slate-50/90">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-slate-700">Supported Demo Payments:</span>
              <span className="px-2 py-0.5 rounded bg-pink-100 text-[#E2136E] font-extrabold text-[10px]">
                bKash
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-[#D83726] font-extrabold text-[10px]">
                Nagad
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                Bank Card
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Cash on Delivery
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 font-semibold transition-colors self-end sm:self-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Rating History & Reviews Modal */}
      <ProviderRatingHistoryModal
        isOpen={Boolean(selectedReviewProvider)}
        onClose={() => setSelectedReviewProvider(null)}
        provider={selectedReviewProvider}
        allRequests={allRequests}
        currentUserId={currentUserId}
        onSelectProvider={(prov) => {
          onSelectProvider(prov, false);
          setSelectedReviewProvider(null);
        }}
      />
    </div>
  );
};
