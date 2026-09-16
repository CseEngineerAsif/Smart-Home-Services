import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Briefcase,
  ThumbsUp,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  UserCheck,
} from 'lucide-react';
import { ServiceProvider, ServiceRequest } from '../types';
import {
  getCombinedProviderReviews,
  computeReviewStats,
  ProviderReviewItem,
} from '../data/providerReviews';

interface ProviderRatingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider | null;
  allRequests?: ServiceRequest[];
  currentUserId?: string;
  onSelectProvider?: (provider: ServiceProvider) => void;
}

export const ProviderRatingHistoryModal: React.FC<ProviderRatingHistoryModalProps> = ({
  isOpen,
  onClose,
  provider,
  allRequests = [],
  currentUserId,
  onSelectProvider,
}) => {
  const [activeStarFilter, setActiveStarFilter] = useState<'all' | '5' | '4' | '3_below' | 'mine'>('all');

  const reviews: ProviderReviewItem[] = useMemo(() => {
    if (!provider) return [];
    return getCombinedProviderReviews(provider.id, allRequests, currentUserId);
  }, [provider, allRequests, currentUserId]);

  const stats = useMemo(() => {
    return computeReviewStats(reviews, provider?.rating || 4.8);
  }, [reviews, provider]);

  const userReviewsCount = useMemo(() => {
    return reviews.filter((r) => r.isCurrentUserReview).length;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeStarFilter === 'all') return reviews;
    if (activeStarFilter === '5') return reviews.filter((r) => r.rating === 5);
    if (activeStarFilter === '4') return reviews.filter((r) => r.rating === 4);
    if (activeStarFilter === '3_below') return reviews.filter((r) => r.rating <= 3);
    if (activeStarFilter === 'mine') return reviews.filter((r) => r.isCurrentUserReview);
    return reviews;
  }, [reviews, activeStarFilter]);

  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-amber-50/40 via-white to-slate-50 shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-200 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {provider.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Dhaka Tech</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {provider.location}, Dhaka
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {provider.experienceYears} Years Exp • {provider.completedJobs} Jobs
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close rating history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 flex-1">
          {/* Rating Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-slate-50 border border-amber-200/80 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Overall Score */}
              <div className="sm:col-span-4 text-center sm:text-left sm:border-r sm:border-amber-200/60 sm:pr-4">
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {stats.average.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 5.0</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start text-amber-400 gap-0.5 my-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(stats.average)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs font-semibold text-slate-600">
                  Based on <strong className="text-slate-900">{stats.totalCount || provider.reviewCount}</strong> customer reviews
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Authenticated bookings</span>
                </p>
              </div>

              {/* Progress Bars Breakdown */}
              <div className="sm:col-span-8 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((starNum) => {
                  const pct = stats.percentages[starNum] || 0;
                  const count = stats.distribution[starNum] || 0;
                  return (
                    <div key={starNum} className="flex items-center gap-2 text-xs">
                      <span className="w-7 font-bold text-slate-700 text-right flex items-center justify-end gap-0.5">
                        <span>{starNum}</span>
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-[11px] text-slate-500 font-medium text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality Badges */}
            <div className="mt-4 pt-3 border-t border-amber-200/50 flex flex-wrap items-center justify-around gap-2 text-center">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>99% Satisfaction Rate</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dhaka Verified Pro</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Punctual & Tool-Equipped</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setActiveStarFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  activeStarFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All ({reviews.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveStarFilter('5')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  activeStarFilter === '5'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>5 Stars ({stats.distribution[5] || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStarFilter('4')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  activeStarFilter === '4'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>4 Stars ({stats.distribution[4] || 0})</span>
              </button>

              {userReviewsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStarFilter('mine')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    activeStarFilter === 'mine'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Your Reviews ({userReviewsCount})</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              Showing {filteredReviews.length} review{filteredReviews.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Customer Reviews List */}
          <div className="space-y-3 pt-1">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-700">No reviews found in this filter</p>
                <p className="text-xs text-slate-400 mt-1">Try selecting 'All' to see all customer feedback.</p>
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const initials = rev.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      rev.isCurrentUserReview
                        ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            rev.isCurrentUserReview
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                          }`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-extrabold text-slate-900">
                              {rev.customerName}
                            </h4>
                            {rev.verifiedBooking && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Verified Booking
                              </span>
                            )}
                            {rev.isCurrentUserReview && (
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Your Submitted Review
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span>{rev.customerLocation}</span>
                            <span>•</span>
                            <span>{rev.date}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-800 ml-1">
                          {rev.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Service Type Badge */}
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Service: {rev.serviceType}
                      </span>
                      {rev.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Feedback Text */}
                    <p className="text-xs text-slate-700 mt-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 block">Technician Rate:</span>
            <span className="text-sm font-extrabold text-slate-900">
              ৳{provider.basePrice} BDT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Back to Technicians
            </button>

            {onSelectProvider && (
              <button
                type="button"
                onClick={() => {
                  onSelectProvider(provider);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition-all"
              >
                <span>Book {provider.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
