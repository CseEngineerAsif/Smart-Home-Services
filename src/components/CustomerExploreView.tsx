import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Droplets,
  Zap,
  Sparkles,
  Hammer,
  Truck,
  Car,
  HeartHandshake,
  X,
  CornerDownLeft,
  MapPin,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { SERVICE_CATEGORIES, FEATURED_SERVICES, DHAKA_AREAS, TIME_SLOTS } from '../data/mockData';
import { ServiceCategory } from '../types';

export interface ServiceFilterPrefill {
  location?: string;
  date?: string;
  time?: string;
}

interface CustomerExploreViewProps {
  onSelectService: (category: ServiceCategory, subService: string, prefill?: ServiceFilterPrefill) => void;
  onRequestWizard: (prefill?: ServiceFilterPrefill) => void;
  onOpenAiAnalyzer: () => void;
  categories?: ServiceCategory[];
}

interface SearchSuggestionItem {
  id: string;
  title: string;
  categoryName: string;
  categoryId: string;
  subService?: string;
  type: 'service' | 'category' | 'featured';
  price?: number;
}

const getCategoryIcon = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    default:
      return <Wrench className={className} />;
  }
};

export const CustomerExploreView: React.FC<CustomerExploreViewProps> = ({
  onSelectService,
  onRequestWizard,
  onOpenAiAnalyzer,
  categories = SERVICE_CATEGORIES,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper to package current filters into prefill for booking wizard
  const getPrefill = (): ServiceFilterPrefill => ({
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
    date: selectedDate !== 'all' ? selectedDate : undefined,
    time: selectedTime !== 'all' ? selectedTime : undefined,
  });

  const hasActiveFilters =
    selectedCategoryFilter !== 'all' ||
    selectedLocation !== 'all' ||
    selectedDate !== 'all' ||
    selectedTime !== 'all' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedLocation('all');
    setSelectedDate('all');
    setSelectedTime('all');
    setIsSuggestionsOpen(false);
  };

  // Click outside listener to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute smart auto suggestions from categories, subservices, and popular packages
  const suggestions: SearchSuggestionItem[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: SearchSuggestionItem[] = [];

    // 1. Search specific sub-services
    for (const cat of SERVICE_CATEGORIES) {
      for (const sub of cat.subServices) {
        if (sub.toLowerCase().includes(q)) {
          matches.push({
            id: `sub-${cat.id}-${sub}`,
            title: sub,
            categoryName: cat.name,
            categoryId: cat.id,
            subService: sub,
            type: 'service',
          });
        }
      }
    }

    // 2. Search category names
    for (const cat of SERVICE_CATEGORIES) {
      if (cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)) {
        if (!matches.some((m) => m.id === `cat-${cat.id}`)) {
          matches.push({
            id: `cat-${cat.id}`,
            title: cat.name,
            categoryName: cat.name,
            categoryId: cat.id,
            type: 'category',
          });
        }
      }
    }

    // 3. Search featured packages
    for (const feat of FEATURED_SERVICES) {
      if (feat.title.toLowerCase().includes(q) || feat.categoryName.toLowerCase().includes(q)) {
        if (!matches.some((m) => m.title.toLowerCase() === feat.title.toLowerCase())) {
          matches.push({
            id: `feat-${feat.id}`,
            title: feat.title,
            categoryName: feat.categoryName,
            categoryId: feat.categoryId,
            subService: feat.title,
            type: 'featured',
            price: feat.startingPrice,
          });
        }
      }
    }

    // Rank matches: exact or prefix matches appear first
    matches.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });

    return matches.slice(0, 7);
  }, [searchQuery]);

  const handleSelectSuggestion = (item: SearchSuggestionItem, directBook = false) => {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    const targetCategory = categories.find((c) => c.id === item.categoryId) || categories[0];

    if (item.type === 'category') {
      setSelectedCategoryFilter(item.categoryId);
      setSearchQuery('');
    } else {
      setSearchQuery(item.title);
      setSelectedCategoryFilter('all');

      if (directBook && item.subService) {
        onSelectService(targetCategory, item.subService, getPrefill());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        setIsSuggestionsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[activeSuggestionIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        setIsSuggestionsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    const q = query.trim();
    if (!q) return text;
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + q.length);
    const after = text.slice(index + q.length);
    return (
      <>
        {before}
        <span className="font-extrabold text-emerald-600 bg-emerald-50 px-0.5 rounded">{match}</span>
        {after}
      </>
    );
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
    return cat ? cat.color : 'from-emerald-500 to-teal-500';
  };

  const getCategoryIconName = (categoryId: string) => {
    const cat = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
    return cat ? cat.icon : 'Wrench';
  };

  const filteredCategories = SERVICE_CATEGORIES.filter((cat) => {
    if (selectedCategoryFilter !== 'all' && cat.id !== selectedCategoryFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchName = cat.name.toLowerCase().includes(query);
    const matchDesc = cat.description.toLowerCase().includes(query);
    const matchSub = cat.subServices.some((s) => s.toLowerCase().includes(query));
    return matchName || matchDesc || matchSub;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Action Buttons Bar */}
      <div className="flex items-center justify-end gap-2.5 mb-6">
        <button
          onClick={onOpenAiAnalyzer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs shadow-xs transition-all border border-emerald-500/20"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>AI Symptom Diagnostic</span>
        </button>
        <button
          onClick={onRequestWizard}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs shadow-xs transition-all"
        >
          <span>Custom Request</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div
        ref={searchContainerRef}
        className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs mb-8 space-y-3.5"
      >
        {/* Main Search and Location/Date/Time Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* 1. Keyword Search Input (spanning 5 columns on desktop) */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              id="explore-service-search"
              type="text"
              placeholder="Search services (e.g. AC Gas Refill, Water Leak, Kitchen Cleaning)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSuggestionsOpen(true);
                setActiveSuggestionIndex(-1);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setIsSuggestionsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSuggestionsOpen(false);
                  setActiveSuggestionIndex(-1);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* AUTO-SUGGESTIONS POPUP */}
            {isSuggestionsOpen && searchQuery.trim().length > 0 && (
              <div
                id="explore-auto-suggestions-dropdown"
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {/* Header bar */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Suggestions</span>
                  </div>
                  <span>
                    {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches found'}
                  </span>
                </div>

                {/* Suggestions List */}
                {suggestions.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {suggestions.map((item, index) => {
                      const isActive = index === activeSuggestionIndex;
                      return (
                        <div
                          key={item.id}
                          id={`explore-suggestion-${item.id}`}
                          onClick={() => handleSelectSuggestion(item)}
                          className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                            isActive ? 'bg-emerald-50/90' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getCategoryColor(
                                item.categoryId
                              )} text-white flex items-center justify-center shadow-xs shrink-0`}
                            >
                              {getCategoryIcon(getCategoryIconName(item.categoryId), 'w-4 h-4')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {highlightMatch(item.title, searchQuery)}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                Category:{' '}
                                <span className="font-semibold text-slate-700">
                                  {item.categoryName}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.price && (
                              <span className="text-xs font-extrabold text-slate-800">
                                ৳{item.price}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                item.type === 'category'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                  : item.type === 'featured'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}
                            >
                              {item.type === 'category'
                                ? 'Category'
                                : item.type === 'featured'
                                ? 'Featured'
                                : 'Service'}
                            </span>

                            {/* Direct Action */}
                            {item.subService ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSuggestion(item, true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                                title="Book this service directly"
                              >
                                <span>Book</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <div className="p-1 text-slate-400 group-hover:text-emerald-600">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Search className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-700 font-semibold">
                      No suggestions for &ldquo;<span className="font-bold text-slate-900">{searchQuery}</span>&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      Try searching &ldquo;AC Repair&rdquo;, &ldquo;Water Leak&rdquo;, &ldquo;Sofa Cleaning&rdquo;, or &ldquo;Wiring&rdquo;
                    </p>
                  </div>
                )}

                {/* Footer keyboard hint */}
                <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[9px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[9px]">↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[9px]">Enter</kbd> to select
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Location Filter Dropdown (spanning 3 columns on desktop) */}
          <div className="relative md:col-span-3">
            <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="explore-location-filter"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-9 pr-7 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-all cursor-pointer"
            >
              <option value="all">📍 All Areas (Dhaka)</option>
              {DHAKA_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}, Dhaka
                </option>
              ))}
            </select>
          </div>

          {/* 3. Date & Time Filter Dropdowns (spanning 4 columns on desktop) */}
          <div className="grid grid-cols-2 gap-2 md:col-span-4">
            {/* Date filter */}
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="explore-date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-8 pr-6 py-2.5 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-all cursor-pointer truncate"
              >
                <option value="all">📅 Any Date</option>
                <option value="Today (2026-09-08)">Today</option>
                <option value="Tomorrow (2026-09-09)">Tomorrow</option>
                <option value="Day After Tomorrow (2026-09-10)">Day After</option>
                <option value="Flexible Schedule">Flexible</option>
              </select>
            </div>

            {/* Time filter */}
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="explore-time-filter"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full pl-8 pr-6 py-2.5 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-all cursor-pointer truncate"
              >
                <option value="all">⏰ Any Time</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips & Feedback */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 font-medium">Applied Filters:</span>
            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-100">
                <MapPin className="w-3 h-3" />
                <span>Area: {selectedLocation}</span>
                <button
                  onClick={() => setSelectedLocation('all')}
                  className="hover:text-rose-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDate !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                <Calendar className="w-3 h-3" />
                <span>Date: {selectedDate.split(' ')[0]}</span>
                <button
                  onClick={() => setSelectedDate('all')}
                  className="hover:text-indigo-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTime !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-100">
                <Clock className="w-3 h-3" />
                <span>Slot: {selectedTime}</span>
                <button
                  onClick={() => setSelectedTime('all')}
                  className="hover:text-amber-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="text-slate-500 font-medium ml-auto">
              Technicians ready to dispatch in{' '}
              <strong className="text-emerald-700 font-bold">
                {selectedLocation !== 'all' ? selectedLocation : 'Dhaka Metro'}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Quality Guarantees Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">7-Day Service Warranty</h4>
            <p className="text-[11px] text-slate-500">Free rework guarantee if any recurring fault emerges</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Background-Verified Technicians</h4>
            <p className="text-[11px] text-slate-500">NID verified, trade licensed & police checked</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">30-Min Emergency SLA</h4>
            <p className="text-[11px] text-slate-500">Priority technician dispatch for urgent home breakdowns</p>
          </div>
        </div>
      </div>

      {/* Categories & Subservices List */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            id={`explore-${category.id}`}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${category.color} text-white flex items-center justify-center shadow-xs`}>
                  {getCategoryIcon(category.icon)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                  <p className="text-xs text-slate-500">{category.description}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                {category.subServices.length} Specialized Sub-Services
              </span>
            </div>

            {/* Sub-services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {category.subServices.map((sub, idx) => (
                <div
                  key={idx}
                  className="group bg-slate-50/80 hover:bg-indigo-50/40 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {sub}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        Available
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Certified Dhaka technician visit with diagnostic toolkit.
                    </p>
                    {selectedTime !== 'all' && (
                      <p className="text-[10px] text-amber-700 font-semibold mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Slot: {selectedTime}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60">
                    <span className="text-xs font-extrabold text-slate-900">
                      From ৳450 BDT
                    </span>
                    <button
                      onClick={() => onSelectService(category, sub, getPrefill())}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Book</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No matching services found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any services matching "{searchQuery}". Try searching for electrical, plumbing, or AC repair.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Clear Search Query
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
