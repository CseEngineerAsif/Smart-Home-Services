import React, { useState, useMemo } from 'react';
import {
  Star,
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
  SlidersHorizontal,
  X,
  ChevronRight,
  Check,
  Award,
  Calendar,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { ServiceProvider, ServiceRequest, AppUser } from '../types';
import { DHAKA_AREAS, DHAKA_DISTANCES } from '../data/mockData';
import { ProviderRatingHistoryModal } from './ProviderRatingHistoryModal';

interface CategoryProvidersListProps {
  work: string;
  categoryName: string;
  categoryId?: string;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  providers: ServiceProvider[];
  onClearSearch: () => void;
  onSelectWork?: (newWork: string) => void;
  onHireProvider: (
    provider: ServiceProvider,
    work: string,
    categoryName: string,
    date: string,
    time: string,
    location: string,
    phone: string
  ) => void;
  allRequests?: ServiceRequest[];
  currentUser?: AppUser | null;
  onOpenCustomRequestWizard?: () => void;
}

export const CategoryProvidersList: React.FC<CategoryProvidersListProps> = ({
  work,
  categoryName,
  categoryId,
  selectedArea,
  onAreaChange,
  providers,
  onClearSearch,
  onSelectWork,
  onHireProvider,
  allRequests = [],
  currentUser,
  onOpenCustomRequestWizard,
}) => {
  // Sort state
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'experience' | 'distance'>('rating');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  // Review Modal state
  const [selectedReviewProvider, setSelectedReviewProvider] = useState<ServiceProvider | null>(null);

  // Direct Booking Modal state
  const [selectedBookingProvider, setSelectedBookingProvider] = useState<ServiceProvider | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingLocation, setBookingLocation] = useState<string>(currentUser?.location || selectedArea || 'Dhanmondi');
  const [bookingPhone, setBookingPhone] = useState<string>(currentUser?.phone || '+880 1711-000000');

  // Filter & match providers
  const { directSpecialists, otherCategoryProviders } = useMemo(() => {
    const qWork = work.trim().toLowerCase();
    const qCat = categoryName.trim().toLowerCase();

    // 1. Filter providers related to this category or work
    const relevant = providers.filter((p) => {
      // Category match
      const catMatch =
        qCat === 'all categories' ||
        p.serviceCategories.some(
          (c) => c.toLowerCase().includes(qCat) || qCat.includes(c.toLowerCase())
        );

      // Specialty / work match
      const specialtyMatch = p.specialties.some(
        (s) =>
          s.toLowerCase().includes(qWork) ||
          qWork.includes(s.toLowerCase()) ||
          qWork.split(' ').some((w) => w.length > 2 && s.toLowerCase().includes(w))
      );

      // Name match
      const nameMatch = p.name.toLowerCase().includes(qWork);

      return catMatch || specialtyMatch || nameMatch;
    });

    // 2. Filter by availability if toggled
    const afterAvailability = onlyAvailableToday
      ? relevant.filter((p) => p.isAvailable && p.availableTimeSlots.length > 0)
      : relevant;

    // 3. Separate into direct specialists vs general category providers
    const specialists: ServiceProvider[] = [];
    const others: ServiceProvider[] = [];

    afterAvailability.forEach((p) => {
      const isSpecialist = p.specialties.some(
        (s) =>
          s.toLowerCase().includes(qWork) ||
          qWork.includes(s.toLowerCase()) ||
          (qWork.length > 3 && s.toLowerCase().includes(qWork.slice(0, 4)))
      );
      if (isSpecialist) {
        specialists.push(p);
      } else {
        others.push(p);
      }
    });

    // 4. Sort helper
    const sortFn = (a: ServiceProvider, b: ServiceProvider) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price_asc') {
        return a.basePrice - b.basePrice;
      }
      if (sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      if (sortBy === 'distance') {
        const distA = selectedArea !== 'All' ? DHAKA_DISTANCES[selectedArea]?.[a.location] || 5 : 0;
        const distB = selectedArea !== 'All' ? DHAKA_DISTANCES[selectedArea]?.[b.location] || 5 : 0;
        return distA - distB;
      }
      return 0;
    };

    specialists.sort(sortFn);
    others.sort(sortFn);

    return {
      directSpecialists: specialists,
      otherCategoryProviders: others,
    };
  }, [providers, work, categoryName, selectedArea, sortBy, onlyAvailableToday]);

  const totalProvidersCount = directSpecialists.length + otherCategoryProviders.length;

  // Open Direct Booking Modal for a provider
  const handleOpenDirectBooking = (prov: ServiceProvider) => {
    setSelectedBookingProvider(prov);
    setBookingTime(prov.availableTimeSlots[0] || '02:00 PM - 04:00 PM');
    setBookingLocation(currentUser?.location || selectedArea !== 'All' ? selectedArea : 'Dhanmondi');
  };

  // Confirm booking
  const handleConfirmDirectBooking = () => {
    if (!selectedBookingProvider) return;
    onHireProvider(
      selectedBookingProvider,
      work,
      categoryName,
      bookingDate,
      bookingTime,
      bookingLocation,
      bookingPhone
    );
    setSelectedBookingProvider(null);
  };

  return (
    <div id="search-results-provider-list" className="space-y-4 pt-1">
      {/* Top Banner / Breadcrumb & Summary - Compact Sleek Height */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs py-2 px-3.5 sm:py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Technicians for &ldquo;{work}&rdquo;
            </h2>
            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
              {totalProvidersCount} {totalProvidersCount === 1 ? 'provider' : 'providers'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
              <span>{categoryName}</span>
            </span>
            {selectedArea !== 'All' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                <MapPin className="w-2.5 h-2.5 text-rose-500" />
                <span>{selectedArea}</span>
              </span>
            )}
          </div>

          <button
            id="clear-search-btn"
            onClick={onClearSearch}
            className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Filter Controls Bar - Ultra Compact */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left: Area & Availability filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="text-slate-500 font-medium text-[10px]">Zone:</span>
              <select
                id="provider-list-area-select"
                value={selectedArea}
                onChange={(e) => onAreaChange(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="All">All Dhaka</option>
                {DHAKA_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="provider-filter-available-toggle"
              type="button"
              onClick={() => setOnlyAvailableToday(!onlyAvailableToday)}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 border transition-all cursor-pointer ${
                onlyAvailableToday
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${onlyAvailableToday ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Available Today</span>
            </button>
          </div>

          {/* Right: Sort By */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium text-[10px] flex items-center gap-1">
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Sort:</span>
            </span>
            <select
              id="provider-list-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 font-bold text-slate-800 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="rating">Highest Rated (★ 5.0)</option>
              <option value="price_asc">Lowest Fee (৳)</option>
              <option value="experience">Experience (Yrs)</option>
              <option value="distance">Nearest Distance (KM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Provider Cards Container */}
      {totalProvidersCount === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3.5 border border-amber-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No technicians found in {selectedArea}</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try switching the zone to &ldquo;All Dhaka&rdquo; or turning off &ldquo;Available Today&rdquo; to see providers from adjacent areas.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                onAreaChange('All');
                setOnlyAvailableToday(false);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              View All Dhaka Technicians
            </button>
            <button
              onClick={onClearSearch}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Back to Categories
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Direct Specialists for the Searched Work */}
          {directSpecialists.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Direct Specialists for &ldquo;{work}&rdquo; ({directSpecialists.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {directSpecialists.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    searchedWork={work}
                    selectedArea={selectedArea}
                    onOpenBooking={() => handleOpenDirectBooking(provider)}
                    onOpenReviews={() => setSelectedReviewProvider(provider)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Other Verified Category Technicians */}
          {otherCategoryProviders.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Other Certified {categoryName} Technicians ({otherCategoryProviders.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherCategoryProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    searchedWork={work}
                    selectedArea={selectedArea}
                    onOpenBooking={() => handleOpenDirectBooking(provider)}
                    onOpenReviews={() => setSelectedReviewProvider(provider)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Direct Booking Modal (Fast 1-Step Hire Without Request Wizard) */}
      {selectedBookingProvider && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBookingProvider.avatar}
                  alt={selectedBookingProvider.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {selectedBookingProvider.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Direct Booking • Starting fee ৳{selectedBookingProvider.basePrice}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingProvider(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-4 text-xs text-slate-800">
              {/* Selected Service Badge */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Selected Work
                  </span>
                  <span className="text-sm font-extrabold text-emerald-950">{work}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  Confirmed
                </span>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Preferred Service Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Available Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    {selectedBookingProvider.availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Dhaka Destination Area
                  </label>
                  <div className="flex items-center px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0" />
                    <select
                      value={bookingLocation}
                      onChange={(e) => setBookingLocation(e.target.value)}
                      className="w-full bg-transparent font-semibold focus:outline-none cursor-pointer"
                    >
                      {DHAKA_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="+880 1711-000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Transparent Price Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Technician Base Inspection & Service Fee</span>
                  <span className="font-bold text-slate-900">৳{selectedBookingProvider.basePrice}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>SERVO Platform Dispatch Guarantee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-emerald-700 font-black">৳{selectedBookingProvider.basePrice}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedBookingProvider(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-direct-hire-btn"
                onClick={handleConfirmDirectBooking}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-98 cursor-pointer"
              >
                <span>Confirm & Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Rating History Modal */}
      <ProviderRatingHistoryModal
        isOpen={Boolean(selectedReviewProvider)}
        onClose={() => setSelectedReviewProvider(null)}
        provider={selectedReviewProvider}
        allRequests={allRequests}
        currentUserId={currentUser?.id}
        onSelectProvider={(prov) => {
          setSelectedReviewProvider(null);
          handleOpenDirectBooking(prov);
        }}
      />
    </div>
  );
};

// Subcomponent: Individual Provider Card
interface ProviderCardProps {
  provider: ServiceProvider;
  searchedWork: string;
  selectedArea: string;
  onOpenBooking: () => void;
  onOpenReviews: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  searchedWork,
  selectedArea,
  onOpenBooking,
  onOpenReviews,
}) => {
  const distanceKm =
    selectedArea !== 'All' ? DHAKA_DISTANCES[selectedArea]?.[provider.location] || 4.2 : null;

  const isDirectWorkSpecialist = provider.specialties.some(
    (s) =>
      s.toLowerCase().includes(searchedWork.toLowerCase()) ||
      searchedWork.toLowerCase().includes(s.toLowerCase())
  );

  return (
    <div
      id={`provider-card-${provider.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all p-4 sm:p-5 flex flex-col justify-between"
    >
      <div>
        {/* Top: Avatar, Name, Rating, Verification */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
            />
            {provider.isAvailable && (
              <span
                title="Available Now"
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {provider.name}
              </h4>
              <span className="inline-flex items-center text-emerald-600" title="Verified Technician">
                <ShieldCheck className="w-4 h-4 fill-emerald-100 text-emerald-600" />
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs">
              <button
                type="button"
                onClick={onOpenReviews}
                className="flex items-center gap-1 font-extrabold text-amber-500 hover:text-amber-600 cursor-pointer"
                title="Click to view all reviews"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{typeof provider.rating === 'number' && !isNaN(provider.rating) ? provider.rating.toFixed(1) : '4.8'}</span>
                <span className="text-slate-400 font-normal">({provider.reviewCount || 0})</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-[11px]">{provider.experienceYears || 3} yrs exp</span>
            </div>

            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="font-semibold text-slate-700">{provider.location}</span>
              {distanceKm !== null && !isNaN(distanceKm) && (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded text-[10px]">
                  ~{distanceKm} km
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Specialties Chips */}
        <div className="mb-3 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Specialties & Skills
          </span>
          <div className="flex flex-wrap gap-1">
            {provider.specialties.map((spec) => {
              const isMatch =
                spec.toLowerCase().includes(searchedWork.toLowerCase()) ||
                searchedWork.toLowerCase().includes(spec.toLowerCase());
              return (
                <span
                  key={spec}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold truncate max-w-[200px] ${
                    isMatch
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isMatch ? '★ ' : ''}
                  {spec}
                </span>
              );
            })}
          </div>
        </div>

        {/* Available Slot Preview */}
        {provider.availableTimeSlots.length > 0 && (
          <div className="mb-3.5 flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">Next Slot: <strong>{provider.availableTimeSlots[0]}</strong></span>
          </div>
        )}
      </div>

      {/* Bottom: Price & Direct Hire Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block leading-tight">Starting Fee</span>
          <span className="text-sm sm:text-base font-black text-slate-900">
            ৳{provider.basePrice}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenReviews}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Read Reviews & Ratings"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <a
            href={`tel:${provider.phone}`}
            className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title={`Call ${provider.phone}`}
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            type="button"
            id={`direct-book-btn-${provider.id}`}
            onClick={onOpenBooking}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Direct Book</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
