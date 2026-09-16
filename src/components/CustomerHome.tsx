import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Wrench,
  Droplets,
  Zap,
  Sparkles,
  Hammer,
  Truck,
  Car,
  HeartHandshake,
  Search,
  AlertOctagon,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  ChevronRight,
  Bot,
  ShieldCheck,
  Headphones,
  Check,
  Shield,
  Layers,
  Award,
  Phone,
  Mail,
  X,
  Users,
} from 'lucide-react';
import { AppUser, ServiceCategory, ServiceRequest, ServiceProvider } from '../types';
import { SERVICE_CATEGORIES, DHAKA_AREAS, FEATURED_SERVICES, SERVICE_PACKAGES, MOCK_PROVIDERS } from '../data/mockData';
import { ServoLogoIcon } from './ServoLogoIcon';
import heroBannerImage from '../assets/images/repair_hero_banner.jpg';
import { CategoryProvidersList } from './CategoryProvidersList';

interface CustomerHomeProps {
  user?: AppUser;
  currentUser?: AppUser;
  categories?: ServiceCategory[];
  onSelectCategory: (category: ServiceCategory, subService?: string) => void;
  onOpenAiAnalyzer: () => void;
  onOpenEmergency: () => void;
  activeRequest?: ServiceRequest;
  onViewRequest?: (request: ServiceRequest) => void;
  onTrackRequest?: (request: ServiceRequest) => void;
  onLocationChange?: (newLocation: string) => void;
  onBookDirectService?: (categoryId: string, subService: string) => void;
  onNavigateTab?: (tab: 'explore' | 'request' | 'my-jobs' | 'profile') => void;
  recentRequests?: ServiceRequest[];
  providers?: ServiceProvider[];
  allRequests?: ServiceRequest[];
  onDirectHireProvider?: (
    provider: ServiceProvider,
    work: string,
    categoryName: string,
    preferredDate?: string,
    preferredTime?: string,
    location?: string,
    contactPhone?: string
  ) => void;
}

// Vibrant Colorful Category Background Gradients matching the reference photo
const CATEGORY_TILE_STYLES: Record<string, { bg: string; icon: React.ReactNode }> = {
  cat_appliance: {
    bg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    icon: <Wrench className="w-5 h-5 text-white" />,
  },
  cat_plumbing: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    icon: <Droplets className="w-5 h-5 text-white" />,
  },
  cat_electrical: {
    bg: 'bg-gradient-to-br from-emerald-600 to-green-700',
    icon: <Zap className="w-5 h-5 text-white" />,
  },
  cat_cleaning: {
    bg: 'bg-gradient-to-br from-purple-600 to-fuchsia-600',
    icon: <Sparkles className="w-5 h-5 text-white" />,
  },
  cat_maintenance: {
    bg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    icon: <Hammer className="w-5 h-5 text-white" />,
  },
  cat_moving: {
    bg: 'bg-gradient-to-br from-lime-600 to-emerald-700',
    icon: <Truck className="w-5 h-5 text-white" />,
  },
  cat_car: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    icon: <Car className="w-5 h-5 text-white" />,
  },
  cat_personal: {
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    icon: <HeartHandshake className="w-5 h-5 text-white" />,
  },
};

interface SearchSuggestionItem {
  id: string;
  title: string;
  categoryName: string;
  categoryId: string;
  type: 'service' | 'category' | 'featured';
  price?: number;
  subService?: string;
  providerCount?: number;
}

export interface SubServiceDetail {
  startingPrice: number;
  estTime: string;
  warranty: string;
  description: string;
  popular?: boolean;
}

export const SUB_SERVICE_DETAILS: Record<string, SubServiceDetail> = {
  // Appliance & Gadget Repair
  'AC Repair & Servicing': {
    startingPrice: 1000,
    estTime: '30-60 mins',
    warranty: '14-Day Free Warranty',
    description: 'Indoor jet chemical wash, refrigerant gas calibration, capacitor diagnostic & cooling optimization.',
    popular: true,
  },
  'Refrigerator Repair': {
    startingPrice: 900,
    estTime: '45-90 mins',
    warranty: '14-Day Warranty',
    description: 'Compressor health check, thermostat relay replacement, freezer gas top-up & defrost heater test.',
    popular: true,
  },
  'Washing Machine Repair': {
    startingPrice: 850,
    estTime: '45-60 mins',
    warranty: '14-Day Warranty',
    description: 'Front-load & top-load motor bearing, PCB circuit board repair, drainage pump & spin belt fixing.',
  },
  'Microwave Oven Repair': {
    startingPrice: 700,
    estTime: '30-45 mins',
    warranty: '7-Day Warranty',
    description: 'Heating magnetron replacement, high voltage capacitor, door microswitch & control panel fix.',
  },
  'TV & Audio Repair': {
    startingPrice: 800,
    estTime: '40-60 mins',
    warranty: '14-Day Warranty',
    description: 'LED backlight strip replacement, display panel repair, power supply unit & motherboard fixing.',
  },
  'Gadget Screen & Battery': {
    startingPrice: 600,
    estTime: '30-45 mins',
    warranty: '7-Day Warranty',
    description: 'Original grade OLED/LCD screen replacement, battery health renewal & charging port servicing.',
  },

  // Plumbing
  'Pipe Leak Repair': {
    startingPrice: 650,
    estTime: '30-45 mins',
    warranty: '14-Day Leak Warranty',
    description: 'Acoustic concealed pipe leak pinpointing, PPR/CPVC joint fusion & pressure valve replacement.',
    popular: true,
  },
  'Water Motor / Pump Fixing': {
    startingPrice: 850,
    estTime: '45-90 mins',
    warranty: '14-Day Warranty',
    description: 'Submersible & rooftop pump rewinding, bearing oiling, capacitor swap & automatic float switch setup.',
    popular: true,
  },
  'Bathroom Fitting & Sanitary': {
    startingPrice: 500,
    estTime: '30-60 mins',
    warranty: '7-Day Warranty',
    description: 'Mixer tap, hand bidet, commode flush cistern overhaul, shower head & geyser plumbing.',
  },
  'Kitchen Sink Blockage': {
    startingPrice: 550,
    estTime: '30-45 mins',
    warranty: '7-Day Warranty',
    description: 'Heavy grease dissolving chemicals, motorized snake auger clearing & p-trap drain replacement.',
  },
  'Water Line Installation': {
    startingPrice: 1200,
    estTime: '2-3 hours',
    warranty: '14-Day Warranty',
    description: 'Concealed & overhead main pipeline layout with pressure balancing and water tank connection.',
  },

  // Electrical
  'Emergency Short Circuit Repair': {
    startingPrice: 700,
    estTime: '20-40 mins',
    warranty: '14-Day Safety Warranty',
    description: 'Rapid tripping diagnostic, burnt wire isolation, MCB circuit breaker repair & phase balancing.',
    popular: true,
  },
  'Switch & Socket Replacement': {
    startingPrice: 350,
    estTime: '20-30 mins',
    warranty: '7-Day Warranty',
    description: 'Modern modular switch & 3-pin power socket fitting, regulator replacement & grounding check.',
  },
  'Ceiling Fan & Light Installation': {
    startingPrice: 400,
    estTime: '30-45 mins',
    warranty: '7-Day Warranty',
    description: 'Ceiling fan balancing rod mounting, chandelier, LED panel spotlight & strip light wiring.',
  },
  'IPS & Generator Maintenance': {
    startingPrice: 1000,
    estTime: '45-60 mins',
    warranty: '14-Day Warranty',
    description: 'Tubular battery distilled water top-up, inverter circuit inspection & automatic load transfer test.',
    popular: true,
  },
  'Full Home Wiring Inspection': {
    startingPrice: 1200,
    estTime: '1-2 hours',
    warranty: '14-Day Warranty',
    description: 'Digital insulation megger testing, earth rod leakage audit & comprehensive safety report.',
  },

  // Cleaning & Pest Control
  'Full Home Deep Cleaning': {
    startingPrice: 1800,
    estTime: '3-5 hours',
    warranty: '100% Satisfaction',
    description: 'Heavy rotary single-disc floor scrubbing, kitchen chimney degreasing, bathroom steam cleaning & balcony wash.',
    popular: true,
  },
  'Sofa & Carpet Shampoo Wash': {
    startingPrice: 900,
    estTime: '1-2 hours',
    warranty: 'Fabric Safe Guarantee',
    description: 'German high-pressure foam injection & wet extraction cleaning for fabric, velvet, or leather sofas.',
    popular: true,
  },
  'Kitchen & Bathroom Sanitization': {
    startingPrice: 800,
    estTime: '1-2 hours',
    warranty: 'Sanitized Clean',
    description: 'Hard water scale stain removal, acid-free tile grout whitening & anti-fungal chemical treatment.',
  },
  'Bed Bug & Cockroach Control': {
    startingPrice: 1200,
    estTime: '45-60 mins',
    warranty: '14-Day Free Re-spray',
    description: 'Odorless target gel baiting, crack & crevice treatment and WHO-approved residual pesticide mist.',
  },
  'Termite Treatment': {
    startingPrice: 2000,
    estTime: '2-4 hours',
    warranty: '1-Year Warranty Protection',
    description: 'Precision perimeter drilling, chemical barrier injection & wooden furniture anti-termite shield.',
  },

  // Home Maintenance
  'Door Lock & Handle Repair': {
    startingPrice: 450,
    estTime: '30-45 mins',
    warranty: '7-Day Warranty',
    description: 'Mortise lock cylinder replacement, jammed wooden latch repair & smart biometric lock installation.',
    popular: true,
  },
  'Furniture Carpentry': {
    startingPrice: 650,
    estTime: '1-2 hours',
    warranty: '7-Day Warranty',
    description: 'Almirah hinge adjustment, hydraulic bed lift fix, sliding drawer rail & custom shelf craft.',
  },
  'Wall Damp & Painting Touch-up': {
    startingPrice: 1000,
    estTime: '2-4 hours',
    warranty: '14-Day Warranty',
    description: 'Waterproof sealant plaster, anti-efflorescence treatment, putty coating & exact wall color match.',
  },
  'Tile & Marble Repair': {
    startingPrice: 750,
    estTime: '1-2 hours',
    warranty: '7-Day Warranty',
    description: 'Hollow tile re-bonding, chipped marble chip repair & waterproof epoxy tile grouting.',
  },
  'Curtain & Shelf Mounting': {
    startingPrice: 400,
    estTime: '30-45 mins',
    warranty: '7-Day Warranty',
    description: 'Impact drill wall anchor mounting for curtain rods, floating shelves, mirrors & TV brackets.',
  },

  // Moving & Shifting
  'Full House Shifting': {
    startingPrice: 3500,
    estTime: '4-6 hours',
    warranty: 'Damage Protection Included',
    description: 'End-to-end carton packing, bubble wrapping fragile glassware, covered truck transport & room placement.',
    popular: true,
  },
  'Office Relocation': {
    startingPrice: 5000,
    estTime: 'Full Day',
    warranty: 'Commercial Safe',
    description: 'IT equipment packaging, workstation dismantle, confidential document transport & reassembly.',
  },
  'Packaging & Box Supply': {
    startingPrice: 1200,
    estTime: '1-2 hours',
    warranty: 'Standard Pack',
    description: 'Heavy 5-ply corrugated carton boxes, 3-layer air bubble wrap roll, stretch film & sealing tapes.',
  },
  'Furniture Disassembly & Loading': {
    startingPrice: 1500,
    estTime: '2-3 hours',
    warranty: 'Trained Handlers',
    description: 'Experienced master carpenters for bed, dining table, showcase & wardrobe dismantle with safe stair carry.',
  },
  'Pickup Van Service': {
    startingPrice: 1800,
    estTime: 'Scheduled Slot',
    warranty: 'GPS Tracked Van',
    description: '1-ton and 2-ton covered pickup vans with verified drivers available across all Dhaka neighborhood routes.',
  },

  // Car Care & Repair
  'Doorstep Car Wash & Polish': {
    startingPrice: 700,
    estTime: '45-60 mins',
    warranty: 'Streak-Free Finish',
    description: 'High-pressure foam exterior wash, rim decontamination, deep interior vacuum & dashboard UV polish.',
    popular: true,
  },
  'Battery Jumpstart & Replacement': {
    startingPrice: 600,
    estTime: '20-30 mins',
    warranty: 'Instant Jump Guarantee',
    description: 'Emergency mobile arrival with heavy-duty jump booster, battery alternator health test & terminal cleaning.',
    popular: true,
  },
  'Brake & Engine Diagnostic': {
    startingPrice: 1200,
    estTime: '45-60 mins',
    warranty: 'Full Scan Report',
    description: 'OBD2 computer fault code diagnostics, brake disc pad inspection, coolant check & engine oil top-up.',
  },
  'AC Filter Cleaning': {
    startingPrice: 800,
    estTime: '30-45 mins',
    warranty: 'Cooling Boost',
    description: 'Cabin air filter washing, blower fan decontamination & antibacterial evaporator coil foam spray.',
  },
  'Flat Tire Fixing': {
    startingPrice: 500,
    estTime: '20-30 mins',
    warranty: 'Pressure Sealed',
    description: 'Doorstep tubeless tire puncture repair, wheel balancing inspection & emergency spare wheel swap.',
  },

  // Personal Care
  'Men Haircut & Beard Grooming': {
    startingPrice: 450,
    estTime: '30-45 mins',
    warranty: 'Sterilized Tools',
    description: 'Doorstep professional barber with disposable cape, sanitized clippers, haircut & hot towel beard trim.',
    popular: true,
  },
  'Women Salon & Facial': {
    startingPrice: 900,
    estTime: '1-2 hours',
    warranty: 'Herbal & Safe Products',
    description: 'Glow gold facial, herbal bleach, eyebrow threading, wax & precision hair styling in private home comfort.',
    popular: true,
  },
  'Manicure & Pedicure': {
    startingPrice: 700,
    estTime: '45-60 mins',
    warranty: 'Spa Grade',
    description: 'Aromatherapy foot soak, dead skin exfoliating scrub, cuticle treatment, nail trimming & gentle massage.',
  },
  'Body Massage & Spa': {
    startingPrice: 1200,
    estTime: '60 mins',
    warranty: 'Certified Therapists',
    description: 'Full body acupressure, soothing herbal essential oil therapy, muscular fatigue relief & relaxation.',
  },
  'Senior Care Companion': {
    startingPrice: 800,
    estTime: 'Flexible Timing',
    warranty: 'Police Verified Staff',
    description: 'Compassionate assistance with daily mobility, blood pressure/sugar vitals check & medicine schedule support.',
  },
};

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  user,
  currentUser,
  categories,
  onSelectCategory,
  onOpenAiAnalyzer,
  onOpenEmergency,
  activeRequest,
  onViewRequest,
  onTrackRequest,
  onLocationChange,
  onBookDirectService,
  onNavigateTab,
  recentRequests,
  providers,
  allRequests,
  onDirectHireProvider,
}) => {
  const activeUser = currentUser || user;
  const effectiveActiveRequest =
    activeRequest ||
    recentRequests?.find((r) =>
      ['Requested', 'Assigned', 'Accepted', 'On The Way', 'In Progress'].includes(r.status)
    );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>(activeUser?.location || 'Dhanmondi');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedCategoryForServices, setSelectedCategoryForServices] = useState<ServiceCategory | null>(null);
  const [categoryServiceSearch, setCategoryServiceSearch] = useState('');

  // Active search state for displaying the categories provider list of that specific work
  const [activeSearch, setActiveSearch] = useState<{
    isActive: boolean;
    query: string;
    work: string;
    categoryName: string;
    categoryId?: string;
    area: string;
  } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultsSectionRef = useRef<HTMLDivElement>(null);
  const categoryServicesSectionRef = useRef<HTMLDivElement>(null);

  // Close auto-suggestions on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Helper to count available providers for a specific work/category
  const allProvidersList = providers || MOCK_PROVIDERS;
  const getProviderCountForWork = (workName: string, catName: string) => {
    const qW = workName.toLowerCase();
    const qC = catName.toLowerCase();
    return allProvidersList.filter((p) => {
      const catMatch = p.serviceCategories.some((c) => c.toLowerCase().includes(qC) || qC.includes(c.toLowerCase()));
      const specMatch = p.specialties.some(
        (s) => s.toLowerCase().includes(qW) || qW.includes(s.toLowerCase())
      );
      return catMatch || specMatch;
    }).length;
  };

  // Compute matching auto-suggestions across sub-services, categories, and featured services
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: SearchSuggestionItem[] = [];

    // 1. Search sub-services
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
            providerCount: getProviderCountForWork(sub, cat.name),
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
            providerCount: getProviderCountForWork(cat.name, cat.name),
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
            providerCount: getProviderCountForWork(feat.title, feat.categoryName),
          });
        }
      }
    }

    // Sort items: items starting with query come first
    matches.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });

    return matches.slice(0, 6);
  }, [searchQuery, providers]);

  // When a user selects a search suggestion:
  // Instead of showing the request form modal, display the categories provider list of that specific work!
  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    setSearchQuery(item.title);
    setIsSuggestionsOpen(false);

    const cat = SERVICE_CATEGORIES.find((c) => c.id === item.categoryId) || SERVICE_CATEGORIES[0];
    const targetWork = item.subService || item.title;
    setSelectedCategoryFilter(cat.id);

    setActiveSearch({
      isActive: true,
      query: item.title,
      work: targetWork,
      categoryName: item.categoryName || cat.name,
      categoryId: cat.id,
      area: selectedAreaFilter,
    });

    setTimeout(() => {
      searchResultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // When a user presses enter or clicks Search:
  // Show provider list for that work/category!
  const handleTriggerSearch = () => {
    setIsSuggestionsOpen(false);
    const q = searchQuery.trim();

    let targetCat = SERVICE_CATEGORIES.find((c) => c.id === selectedCategoryFilter);
    let targetWork = q;

    if (selectedCategoryFilter !== 'All' && targetCat) {
      if (!targetWork) {
        targetWork = targetCat.name;
      }
    } else if (q) {
      for (const cat of SERVICE_CATEGORIES) {
        if (cat.name.toLowerCase().includes(q.toLowerCase())) {
          targetCat = cat;
          targetWork = cat.name;
          break;
        }
        const matchingSub = cat.subServices.find((s) => s.toLowerCase().includes(q.toLowerCase()));
        if (matchingSub) {
          targetCat = cat;
          targetWork = matchingSub;
          break;
        }
      }
    }

    if (!targetCat) {
      targetCat = SERVICE_CATEGORIES[0];
    }
    if (!targetWork) {
      targetWork = targetCat.name;
    }

    setSelectedCategoryFilter(targetCat.id);
    setActiveSearch({
      isActive: true,
      query: q || targetWork,
      work: targetWork,
      categoryName: targetCat.name,
      categoryId: targetCat.id,
      area: selectedAreaFilter,
    });

    setTimeout(() => {
      searchResultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleClearSearch = () => {
    setActiveSearch(null);
    setSearchQuery('');
    setSelectedCategoryFilter('All');
  };

  // When customer clicks "Book Service" or "Book Package":
  // Open the service request form modal prefilled with that category & work!
  const handleBookService = (categoryId: string, subService: string) => {
    if (onBookDirectService) {
      onBookDirectService(categoryId, subService);
      return;
    }
    const cat =
      (categories || SERVICE_CATEGORIES).find((c) => c.id === categoryId) ||
      SERVICE_CATEGORIES[0];
    if (onSelectCategory) {
      onSelectCategory(cat, subService);
    }
  };

  const handleCategoryTileClick = (category: ServiceCategory) => {
    if (selectedCategoryForServices?.id === category.id) {
      setSelectedCategoryForServices(null);
      setCategoryServiceSearch('');
    } else {
      setSelectedCategoryForServices(category);
      setCategoryServiceSearch('');
      setTimeout(() => {
        categoryServicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  const filteredSubServices = useMemo(() => {
    if (!selectedCategoryForServices) return [];
    if (!categoryServiceSearch.trim()) return selectedCategoryForServices.subServices;
    const q = categoryServiceSearch.toLowerCase();
    return selectedCategoryForServices.subServices.filter((s) => s.toLowerCase().includes(q));
  }, [selectedCategoryForServices, categoryServiceSearch]);

  const featuredPackagesForCategory = useMemo(() => {
    if (!selectedCategoryForServices) return [];
    const feat = FEATURED_SERVICES.filter((f) => f.categoryId === selectedCategoryForServices.id);
    const pkg = SERVICE_PACKAGES.filter((p) => p.categoryId === selectedCategoryForServices.id);
    return [...feat, ...pkg];
  }, [selectedCategoryForServices]);

  const renderCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'cat_plumbing':
        return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case 'cat_electrical':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'cat_cleaning':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
      case 'cat_maintenance':
        return <Hammer className="w-3.5 h-3.5 text-violet-600" />;
      case 'cat_moving':
        return <Truck className="w-3.5 h-3.5 text-indigo-600" />;
      case 'cat_car':
        return <Car className="w-3.5 h-3.5 text-orange-500" />;
      case 'cat_personal':
        return <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
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
        <span className="font-black text-emerald-600 bg-emerald-50 px-0.5 rounded">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-slate-50 text-slate-900 font-sans">
      {/* 1. HERO SECTION (Dark Midnight Navy with Technician Banner Background) */}
      <section className="bg-[#080E1E] text-white pt-10 pb-12 sm:pt-16 sm:pb-18 lg:pt-20 lg:pb-22 min-h-[440px] sm:min-h-[500px] lg:min-h-[530px] flex flex-col justify-center px-3.5 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Image & Gradient Layering */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img
            src={heroBannerImage}
            alt="Appliance Repair Technician"
            className="w-full h-full object-cover object-[80%_top] sm:object-[85%_top] lg:object-[right_top] opacity-70 sm:opacity-85 lg:opacity-95"
            referrerPolicy="no-referrer"
          />
          {/* Gradients ensuring clear visibility of technician on the right while maintaining crisp contrast for text on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080E1E] via-[#080E1E]/80 via-40% sm:via-[#080E1E]/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080E1E] via-transparent to-transparent" />
          {/* Accent lighting highlights mirroring the image's emerald & golden-yellow colors */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Tag pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/85 border border-amber-400/30 text-amber-300 text-[10px] sm:text-[11px] font-semibold mb-2.5 shadow-inner backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider font-bold text-amber-400">Verified Technicians</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Fast Home Appliance Repair</span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3.5 sm:mb-5">
            Repair Your <span className="text-amber-400">Home Appliances</span> &{' '}
            <span className="text-emerald-400">Services</span>
          </h1>

          {/* Floating Search & Filter Box - Responsive with Auto-Suggestions Popup */}
          <div
            ref={searchContainerRef}
            className="relative bg-white rounded-2xl sm:rounded-full p-2.5 sm:p-2 shadow-2xl shadow-slate-950/25 border border-white/60 ring-1 ring-slate-900/5 max-w-3xl mx-auto text-slate-800 text-left transition-all"
          >
            {/* Mobile Layout (sm:hidden) */}
            <div className="sm:hidden space-y-2">
              {/* Mobile Search input */}
              <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  id="hero-service-search-mobile"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setIsSuggestionsOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (suggestions.length > 0) {
                        handleSelectSuggestion(suggestions[0]);
                      } else {
                        handleTriggerSearch();
                      }
                    }
                  }}
                  placeholder="Search work or service (e.g. AC repair, plumbing)..."
                  className="w-full text-base sm:text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSuggestionsOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer active:scale-90"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2 Dropdowns side-by-side in a 2-column grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Category select */}
                <div className="flex items-center px-2.5 py-2 min-h-[42px] bg-slate-50 rounded-xl border border-slate-200/80">
                  <select
                    id="hero-category-select-mobile"
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    aria-label="Filter by Service Category"
                    className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    <option value="All">All Categories</option>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area select */}
                <div className="flex items-center px-2.5 py-2 min-h-[42px] bg-slate-50 rounded-xl border border-slate-200/80">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1 shrink-0" />
                  <select
                    id="hero-area-select-mobile"
                    value={selectedAreaFilter}
                    onChange={(e) => {
                      setSelectedAreaFilter(e.target.value);
                      if (e.target.value !== 'All' && onLocationChange) {
                        onLocationChange(e.target.value);
                      }
                    }}
                    aria-label="Filter by Dhaka Zone"
                    className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    <option value="All">All Dhaka</option>
                    {DHAKA_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  id="hero-search-btn-mobile"
                  onClick={handleTriggerSearch}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer touch-manipulation"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Technicians</span>
                </button>
                <button
                  id="hero-ai-btn-mobile"
                  onClick={onOpenAiAnalyzer}
                  className="px-3.5 min-h-[44px] py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer touch-manipulation"
                  title="Smart AI Problem Analyzer"
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>AI Scanner</span>
                </button>
              </div>
            </div>

            {/* Desktop Layout (hidden sm:flex) */}
            <div className="hidden sm:flex items-center gap-1">
              {/* Input 1: Search query */}
              <div className="flex items-center gap-2 px-3 py-1.5 flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  id="hero-service-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setIsSuggestionsOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (suggestions.length > 0) {
                        handleSelectSuggestion(suggestions[0]);
                      } else {
                        handleTriggerSearch();
                      }
                    }
                  }}
                  placeholder="Search work or service (e.g. AC repair, plumbing, wiring)..."
                  className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSuggestionsOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-px h-6 bg-slate-200 shrink-0" />

              {/* Dropdown 2: All Categories */}
              <div className="flex items-center px-2.5 py-1 shrink-0">
                <select
                  id="hero-category-select"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  aria-label="Filter by Service Category"
                  className="w-auto text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="All">All Categories</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-px h-6 bg-slate-200 shrink-0" />

              {/* Dropdown 3: Dhaka Area / Division */}
              <div className="flex items-center px-2.5 py-1 shrink-0">
                <MapPin className="w-3 h-3 text-rose-500 mr-1 shrink-0" />
                <select
                  id="hero-area-select"
                  value={selectedAreaFilter}
                  onChange={(e) => {
                    setSelectedAreaFilter(e.target.value);
                    if (e.target.value !== 'All' && onLocationChange) {
                      onLocationChange(e.target.value);
                    }
                  }}
                  aria-label="Filter by Dhaka Zone"
                  className="w-auto text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="All">All Dhaka Zones</option>
                  {DHAKA_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Action Button (Vivid Emerald Green) */}
              <button
                id="hero-search-btn"
                onClick={handleTriggerSearch}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Technicians</span>
              </button>

              {/* Secondary Action: AI Diagnostic Scanner */}
              <button
                id="hero-ai-btn"
                onClick={onOpenAiAnalyzer}
                className="px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors shrink-0 cursor-pointer"
                title="Smart AI Problem Analyzer"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline">AI Diagnostic</span>
              </button>
            </div>

            {/* Active search filter bar indicator */}
            {activeSearch && activeSearch.isActive && (
              <div className="mt-2 pt-2 border-t border-slate-100 px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-600 font-medium">
                    Showing technicians for: <strong className="text-slate-900">&ldquo;{activeSearch.work}&rdquo;</strong>
                  </span>
                  <span className="hidden sm:inline text-slate-400">({activeSearch.categoryName})</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Search</span>
                </button>
              </div>
            )}

            {/* AUTO-SUGGESTIONS DROPDOWN MENU (Appears smoothly when user types) */}
            {isSuggestionsOpen && searchQuery.trim().length > 0 && (
              <div
                id="search-auto-suggestions-dropdown"
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-800"
              >
                {/* Header bar */}
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto Suggestions</span>
                  </div>
                  <span>
                    {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {/* Suggestions List */}
                {suggestions.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        id={`suggestion-item-${item.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectSuggestion(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectSuggestion(item);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-emerald-50/70 transition-colors group cursor-pointer focus:outline-none focus:bg-emerald-50/70"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-xs transition-all">
                            {renderCategoryIcon(item.categoryId)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                              {highlightMatch(item.title, searchQuery)}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              in <span className="font-medium text-slate-600">{item.categoryName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {typeof item.providerCount === 'number' && !isNaN(item.providerCount) && item.providerCount > 0 ? (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Users className="w-3 h-3 text-emerald-600" />
                              <span>{item.providerCount} {item.providerCount === 1 ? 'Provider' : 'Providers'}</span>
                            </span>
                          ) : null}
                          {typeof item.price === 'number' && !isNaN(item.price) && item.price > 0 ? (
                            <span className="text-[11px] font-black text-slate-700">
                              ৳{item.price}
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSuggestionsOpen(false);
                              handleBookService(item.categoryId, item.subService || item.title);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Directly open request form"
                          >
                            <span>Book Service</span>
                          </button>
                          <span className="hidden sm:inline-flex px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 group-hover:bg-slate-200 text-slate-700 transition-colors items-center gap-1">
                            <span>Providers</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-700 font-medium">
                      No direct services found for &ldquo;<span className="font-bold text-slate-900">{searchQuery}</span>&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try searching AC repair, pipe leak, socket replacement, or deep clean
                    </p>
                    <div className="mt-2.5 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleTriggerSearch}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Search All Technicians
                      </button>
                      <button
                        type="button"
                        onClick={onOpenAiAnalyzer}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Scan with AI
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggestions Footer */}
                {suggestions.length > 0 && (
                  <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 text-[10px]">Click any item to view verified technicians</span>
                    <button
                      type="button"
                      onClick={handleTriggerSearch}
                      className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <span>Show All Matches</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-8 sm:space-y-10 pb-6 sm:pb-8 flex-1 w-full">
        {/* Scroll anchor for search results */}
        <div ref={searchResultsSectionRef} />

        {/* Dynamic Provider List for Searched Work */}
        {activeSearch && activeSearch.isActive && (
          <CategoryProvidersList
            work={activeSearch.work}
            categoryName={activeSearch.categoryName}
            categoryId={activeSearch.categoryId}
            selectedArea={activeSearch.area}
            onAreaChange={(newArea) => {
              setActiveSearch((prev) => (prev ? { ...prev, area: newArea } : null));
              setSelectedAreaFilter(newArea);
              if (onLocationChange && newArea !== 'All') {
                onLocationChange(newArea);
              }
            }}
            providers={providers || MOCK_PROVIDERS}
            onClearSearch={handleClearSearch}
            onHireProvider={(prov, workName, catName, date, time, loc, phone) => {
              if (onDirectHireProvider) {
                onDirectHireProvider(prov, workName, catName, date, time, loc, phone);
              } else {
                alert(`Booking confirmed with ${prov.name} for ${workName}!`);
              }
            }}
            allRequests={allRequests || recentRequests}
            currentUser={activeUser}
            onOpenCustomRequestWizard={() => {
              const cat = SERVICE_CATEGORIES.find((c) => c.id === activeSearch.categoryId) || SERVICE_CATEGORIES[0];
              onSelectCategory(cat, activeSearch.work);
            }}
          />
        )}
        {/* Active Job Alert Banner (If customer has a job in progress) */}
        {effectiveActiveRequest && (
          <div className="bg-white border border-indigo-100 rounded-xl sm:rounded-2xl p-3 sm:py-3.5 sm:px-5 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 border border-indigo-100">
                  <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Live Status: {effectiveActiveRequest.status}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400">Request #{effectiveActiveRequest.id}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                    {effectiveActiveRequest.serviceType} in {effectiveActiveRequest.location}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    Assigned: {effectiveActiveRequest.assignedProviderName || 'Matching nearest Dhaka technician...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const cb = onTrackRequest || onViewRequest;
                  if (cb) cb(effectiveActiveRequest);
                }}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>Track Live Progress</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. EXPLORE BY CATEGORY (App-Style 4-Column Grid on Mobile) */}
        <section id="explore-by-category-section" className="scroll-mt-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  Explore by Category
                </h2>
                {selectedCategoryForServices && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active: {selectedCategoryForServices.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
                Click any category button below to show its available services, pricing, and warranty
              </p>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('explore')}
                className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
            {SERVICE_CATEGORIES.map((category) => {
              const tile = CATEGORY_TILE_STYLES[category.id] || {
                bg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
                icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />,
              };
              const isSelected = selectedCategoryForServices?.id === category.id;

              return (
                <button
                  key={category.id}
                  id={`cat-card-${category.id}`}
                  onClick={() => handleCategoryTileClick(category)}
                  className={`relative ${tile.bg} rounded-xl sm:rounded-2xl p-2 sm:p-4 text-white flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all cursor-pointer group min-h-[86px] sm:min-h-[110px] active:scale-90 touch-manipulation select-none ${
                    isSelected
                      ? 'ring-4 ring-emerald-400 ring-offset-2 scale-105 shadow-lg shadow-emerald-500/25 z-10'
                      : 'opacity-95 hover:opacity-100 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Selected checkmark indicator */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px] shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Central translucent circular icon badge */}
                  <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full ${isSelected ? 'bg-white/35 scale-110' : 'bg-white/20'} backdrop-blur-xs flex items-center justify-center mb-1.5 sm:mb-2.5 group-hover:scale-110 transition-transform`}>
                    {tile.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2">
                    {category.name.replace(' and Gadget Repair', '').replace(' & Pest Control', '')}
                  </span>

                  {/* Down arrow marker pointing to category services below */}
                  {isSelected && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 sm:border-x-6 border-x-transparent border-t-4 sm:border-t-6 border-t-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Reference anchor for smooth scroll */}
          <div ref={categoryServicesSectionRef} className="scroll-mt-4" />

          {/* Prompt banner when no category button is clicked yet */}
          {!selectedCategoryForServices && (
            <div className="mt-3 py-2.5 px-4 text-center text-xs font-medium text-slate-500 bg-slate-100/80 rounded-xl border border-dashed border-slate-200 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Click any category button above to show its services, starting prices, and warranty under this section.</span>
            </div>
          )}

          {/* CATEGORY SERVICES DISPLAY UNDER THIS SECTION */}
          {selectedCategoryForServices && (
            <div
              id={`category-services-panel-${selectedCategoryForServices.id}`}
              className="mt-4 sm:mt-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/60 p-4 sm:p-6 relative overflow-hidden transition-all duration-300"
            >
              {/* Decorative top accent colored by the category gradient */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${CATEGORY_TILE_STYLES[selectedCategoryForServices.id]?.bg || 'bg-emerald-500'}`} />

              {/* Category Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 sm:mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl ${CATEGORY_TILE_STYLES[selectedCategoryForServices.id]?.bg || 'bg-emerald-600'} text-white flex items-center justify-center shadow-md shrink-0`}>
                    {CATEGORY_TILE_STYLES[selectedCategoryForServices.id]?.icon || <Wrench className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        {selectedCategoryForServices.name} Services
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {selectedCategoryForServices.subServices.length} Services Available
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>7-14 Days Free Warranty</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedCategoryForServices.description}
                    </p>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleBookService(selectedCategoryForServices.id, selectedCategoryForServices.name)}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Custom Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryForServices(null);
                      setCategoryServiceSearch('');
                    }}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Close Services Panel"
                    aria-label="Close services panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-search filter inside category services if more than 4 items */}
              {selectedCategoryForServices.subServices.length > 4 && (
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={categoryServiceSearch}
                      onChange={(e) => setCategoryServiceSearch(e.target.value)}
                      placeholder={`Filter ${selectedCategoryForServices.name} services...`}
                      className="w-full pl-8 pr-7 py-2 sm:py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {categoryServiceSearch && (
                      <button
                        onClick={() => setCategoryServiceSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {categoryServiceSearch && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Showing {filteredSubServices.length} of {selectedCategoryForServices.subServices.length}
                    </span>
                  )}
                </div>
              )}

              {/* Grid of Services for this Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredSubServices.map((subService) => {
                  const meta = SUB_SERVICE_DETAILS[subService] || {
                    startingPrice: 700,
                    estTime: '30-60 mins',
                    warranty: '14-Day Free Warranty',
                    description: 'Verified technician service with standard diagnostic and rework guarantee.',
                  };
                  const providerCount = getProviderCountForWork(subService, selectedCategoryForServices.name);

                  return (
                    <div
                      key={subService}
                      className="bg-slate-50/70 hover:bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                            {subService}
                          </h4>
                          <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-black bg-emerald-100 text-emerald-800">
                            ৳{meta.startingPrice}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                          {meta.description}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {meta.estTime}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">
                            {meta.warranty}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSearch({
                                isActive: true,
                                query: subService,
                                work: subService,
                                categoryName: selectedCategoryForServices.name,
                                categoryId: selectedCategoryForServices.id,
                                area: selectedAreaFilter,
                              });
                              setTimeout(() => {
                                searchResultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 80);
                            }}
                            className="min-h-[32px] px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all active:scale-95 touch-manipulation cursor-pointer"
                            title="View technicians for this service"
                          >
                            Techs ({providerCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookService(selectedCategoryForServices.id, subService)}
                            className="min-h-[32px] px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs active:scale-95 touch-manipulation flex items-center gap-1 cursor-pointer"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Featured Packages for Category */}
              {featuredPackagesForCategory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Popular Packages & Offers for {selectedCategoryForServices.name}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {featuredPackagesForCategory.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-200 text-amber-900">
                              {(pkg as any).badge || 'Bundle'}
                            </span>
                            <p className="text-xs font-bold text-slate-900 truncate">{pkg.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{pkg.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-slate-900">
                            ৳{Number((pkg as any).price || (pkg as any).startingPrice) || 1200}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleBookService(pkg.categoryId, (pkg as any).subService || pkg.title)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Book Deal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Emergency SOS Banner - Compact Sleeker Height */}
        <section className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3 text-white shadow-md shadow-rose-600/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <AlertOctagon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-xs sm:text-sm text-white">Need Emergency Assistance?</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white text-rose-700 uppercase tracking-wider">
                  24/7 Rapid
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-rose-100 mt-0.5 truncate sm:whitespace-normal">
                Electrical short circuits, gas leaks, pipe bursts, or vehicle stalls across Dhaka.
              </p>
            </div>
          </div>
          <button
            id="emergency-banner-btn"
            onClick={onOpenEmergency}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl bg-white text-rose-700 font-bold text-xs shadow-xs hover:bg-rose-50 transition-all w-full sm:w-auto text-center shrink-0 active:scale-95"
          >
            Book Emergency Service 🚨
          </button>
        </section>

        {/* 3. TOP BOOKED SERVICES ("Top Tourist Spots" in Reference Photo) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top Booked Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Most requested verified household repairs & diagnostics in Dhaka
              </p>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('explore')}
                className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_SERVICES.map((item) => (
              <div
                key={item.id}
                id={`featured-card-${item.id}`}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Category Badge */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badge on top left matching reference */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                      {item.badge}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.location}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Bar (Rating + Emerald Action Button) */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-extrabold text-slate-900">
                      {typeof item.rating === 'number' && !isNaN(item.rating) ? item.rating : '4.8'}
                    </span>
                    <span className="text-slate-400">({item.reviewCount || 0})</span>
                  </div>

                  <button
                    onClick={() => handleBookService(item.categoryId, item.subService)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                  >
                    Book Service ৳{item.startingPrice}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SMART SERVICE PACKAGES ("Travel Packages" in Reference Photo) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Smart Service Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                All-in-one scheduled bundles with verified warranties
              </p>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('explore')}
                className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                id={`pkg-card-${pkg.id}`}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Price Tag & Duration Tag */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {pkg.duration}
                    </span>
                    <span className="text-lg font-black text-emerald-600">
                      ৳{pkg.price}
                    </span>
                  </div>

                  {pkg.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                      {pkg.badge}
                    </span>
                  )}

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Bullet perks with checkmarks */}
                  <div className="mt-4 space-y-1.5">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat.replace('✔ ', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleBookService(pkg.categoryId, pkg.subService)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
                >
                  Book Package
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. "WHY SERVO?" SECTION - Aligned with bottom footer */}
      <section className="bg-[#0B132B] text-white py-3.5 sm:py-4 px-3.5 sm:px-6 lg:px-8 mt-auto border-t border-b border-slate-800/90 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 sm:mb-3">
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              Why SERVO?
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Automated smart service dispatch across Dhaka
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {/* Feature 1: Verified Listings */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[11px] sm:text-xs text-white leading-tight truncate">Verified Listings</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Vetted technicians & licenses</p>
              </div>
            </div>

            {/* Feature 2: Best Prices */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[11px] sm:text-xs text-white leading-tight truncate">Upfront Prices</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Zero hidden surge fees</p>
              </div>
            </div>

            {/* Feature 3: 24/7 Support */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[11px] sm:text-xs text-white leading-tight truncate">24/7 Rapid SOS</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Emergency dispatch support</p>
              </div>
            </div>

            {/* Feature 4: Local Expertise */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[11px] sm:text-xs text-white leading-tight truncate">Local Dhaka Hub</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Dispatched in 10km radius</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER - Seamless Bottom Line Integration */}
      <footer className="bg-[#070D1E] text-slate-400 py-3.5 sm:py-4 px-3.5 sm:px-6 lg:px-8 border-t border-slate-800/80 text-xs w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Brand & Fest Info */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <ServoLogoIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">SERVO</span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-xs text-slate-400">BAUST CSE FEST 2026</span>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 text-xs font-medium">
            <button
              onClick={() => onNavigateTab?.('explore')}
              className="hover:text-emerald-400 text-slate-300 transition-colors"
            >
              Services
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigateTab?.('request')}
              className="hover:text-emerald-400 text-slate-300 transition-colors"
            >
              Book Service
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigateTab?.('my-jobs')}
              className="hover:text-emerald-400 text-slate-300 transition-colors"
            >
              My Jobs
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={onOpenAiAnalyzer}
              className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Scanner</span>
            </button>
          </div>

          {/* Contact & City Tag */}
          <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
            <a
              href="tel:+8801712998877"
              className="flex items-center gap-1.5 hover:text-emerald-400 text-slate-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+880 1712-998877</span>
            </a>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Dhaka, BD</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
