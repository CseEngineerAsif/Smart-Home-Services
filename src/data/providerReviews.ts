import { ServiceRequest } from '../types';

export interface ProviderReviewItem {
  id: string;
  providerId: string;
  customerName: string;
  customerAvatar?: string;
  customerLocation: string;
  rating: number; // 1 to 5
  date: string;
  serviceType: string;
  comment: string;
  tags?: string[];
  verifiedBooking: boolean;
  isCurrentUserReview?: boolean;
}

export const PROVIDER_HISTORICAL_REVIEWS: ProviderReviewItem[] = [
  // prov_1: Rahim Electronics (AC & Appliance Specialist)
  {
    id: 'rev_rahim_1',
    providerId: 'prov_1',
    customerName: 'Fahim Alom',
    customerLocation: 'Dhanmondi, Dhaka',
    rating: 5,
    date: 'Sep 05, 2026',
    serviceType: 'Refrigerator Gas Refill & Compressor Check',
    comment:
      'Rahim arrived within 25 minutes with full diagnostic toolkit. Checked compressor, filled the refrigerant gas, and tested cooling. Very professional, polite, and tidy work!',
    tags: ['Punctual & On-Time', 'Clean & Tidy Work', 'Expert Diagnosis'],
    verifiedBooking: true,
  },
  {
    id: 'rev_rahim_2',
    providerId: 'prov_1',
    customerName: 'Tanvir Hasan',
    customerLocation: 'Dhanmondi Road 7',
    rating: 5,
    date: '3 days ago',
    serviceType: 'AC Repair & Servicing',
    comment:
      'Extremely satisfied with AC master jet wash service! Outdoor condenser was heavily clogged with dust. Rahim washed it thoroughly using pressure gun without spilling water inside. Cooling is now ice-cold and electricity draw reduced.',
    tags: ['Clean & Tidy Work', 'Expert Diagnosis', 'Quick Resolution'],
    verifiedBooking: true,
  },
  {
    id: 'rev_rahim_3',
    providerId: 'prov_1',
    customerName: 'Nusrat Jahan',
    customerLocation: 'Panthapath',
    rating: 5,
    date: '1 week ago',
    serviceType: 'AC Inverter PCB Repair',
    comment:
      'Very polite and knowledgeable technician. Diagnosed capacitor failure in 10 minutes, replaced with genuine Panasonic replacement part, and gave official warranty receipt. Completely fair and transparent price.',
    tags: ['Polite & Professional', 'Fair & Transparent'],
    verifiedBooking: true,
  },
  {
    id: 'rev_rahim_4',
    providerId: 'prov_1',
    customerName: 'Anisur Rahman',
    customerLocation: 'Mohammadpur',
    rating: 4,
    date: '2 weeks ago',
    serviceType: 'Microwave Oven Repair',
    comment:
      'Fixed magnetron and fuse issue of our Sharp microwave oven. Good diagnostics and took proper high-voltage safety precautions. Highly recommended for Dhanmondi/Mohammadpur residents.',
    tags: ['Expert Diagnosis', 'Punctual & On-Time'],
    verifiedBooking: true,
  },
  {
    id: 'rev_rahim_5',
    providerId: 'prov_1',
    customerName: 'Sadia Afrin',
    customerLocation: 'Dhanmondi 8/A',
    rating: 5,
    date: '3 weeks ago',
    serviceType: 'Washing Machine Drainage Repair',
    comment:
      'Drainage pump was jammed. Rahim took the bottom casing apart cleanly, cleared the blockage, tested spinning cycle twice, and cleaned the floor before leaving. Very honest person.',
    tags: ['Fair & Transparent', 'Quick Resolution', 'Clean & Tidy Work'],
    verifiedBooking: true,
  },

  // prov_2: Karim Plumbing Service
  {
    id: 'rev_karim_1',
    providerId: 'prov_2',
    customerName: 'Sazzad Hossain',
    customerLocation: 'Mirpur 10',
    rating: 5,
    date: 'Yesterday',
    serviceType: 'Pipe Leak Repair',
    comment:
      'Fixed a difficult concealed pipeline leakage without breaking unnecessary tiles. Very skilled plumber in Mirpur who comes prepared with modern pipe threaders and seals.',
    tags: ['Expert Diagnosis', 'Clean & Tidy Work'],
    verifiedBooking: true,
  },
  {
    id: 'rev_karim_2',
    providerId: 'prov_2',
    customerName: 'Tasnim Chowdhury',
    customerLocation: 'Kalyanpur',
    rating: 5,
    date: '4 days ago',
    serviceType: 'Water Motor / Pump Fixing',
    comment:
      'Rooftop tank pump had burnt capacitor. Karim replaced it and rewired the float switch properly. Rooftop water flow was restored in under 40 minutes.',
    tags: ['Quick Resolution', 'Punctual & On-Time'],
    verifiedBooking: true,
  },
  {
    id: 'rev_karim_3',
    providerId: 'prov_2',
    customerName: 'Mahfuz Ahmed',
    customerLocation: 'Mirpur 2',
    rating: 4,
    date: '1 week ago',
    serviceType: 'Bathroom Fitting & Sanitary',
    comment:
      'Installed new shower mixer and commode bib cock. Neatly sealed with white cement and checked for drips. Affordable charges.',
    tags: ['Polite & Professional', 'Fair & Transparent'],
    verifiedBooking: true,
  },

  // prov_3: FastFix Electrical
  {
    id: 'rev_fastfix_1',
    providerId: 'prov_3',
    customerName: 'Arman Khan',
    customerLocation: 'Mohammadpur',
    rating: 5,
    date: '2 days ago',
    serviceType: 'Emergency Short Circuit Repair',
    comment:
      'Had an alarming sparking switchboard during evening rain. Arrived in 20 minutes with safety tester, traced earth leakage, and resolved the tripping circuit breaker safely.',
    tags: ['Punctual & On-Time', 'Expert Diagnosis', 'Quick Resolution'],
    verifiedBooking: true,
  },
  {
    id: 'rev_fastfix_2',
    providerId: 'prov_3',
    customerName: 'Naila Ferdous',
    customerLocation: 'Lalmatia',
    rating: 5,
    date: '5 days ago',
    serviceType: 'IPS & Generator Maintenance',
    comment:
      'Replaced battery distilled water, cleaned terminal corrosion, and calibrated inverter charging cut-off. Great knowledge of Sukam and Luminous systems.',
    tags: ['Polite & Professional', 'Fair & Transparent'],
    verifiedBooking: true,
  },

  // prov_4: ProClean Solutions
  {
    id: 'rev_proclean_1',
    providerId: 'prov_4',
    customerName: 'Sabrina Mostafa',
    customerLocation: 'Gulshan 2',
    rating: 5,
    date: '3 days ago',
    serviceType: 'Full Home Deep Cleaning',
    comment:
      'Superb deep cleaning before moving in. 3-person team with industrial wet-dry vacuum and hospital-grade sanitizing solutions. Sparkling clean tiles and kitchen!',
    tags: ['Clean & Tidy Work', 'Polite & Professional'],
    verifiedBooking: true,
  },
  {
    id: 'rev_proclean_2',
    providerId: 'prov_4',
    customerName: 'Kabir Bin Zafar',
    customerLocation: 'Banani',
    rating: 4,
    date: '1 week ago',
    serviceType: 'Sofa & Carpet Shampoo Wash',
    comment:
      'Extracted stubborn tea stains from our 7-seater fabric sofa using foam shampoo extractor. Left a very pleasant fresh aroma.',
    tags: ['Quick Resolution', 'Clean & Tidy Work'],
    verifiedBooking: true,
  },

  // prov_5: Apex Appliance Care
  {
    id: 'rev_apex_1',
    providerId: 'prov_5',
    customerName: 'Mehedi Hasan',
    customerLocation: 'Uttara Sector 7',
    rating: 5,
    date: '2 days ago',
    serviceType: 'Refrigerator Repair',
    comment:
      'Frost-free defrost timer was broken, causing ice buildup in bottom chamber. Technician carried the exact replacement part in his bike toolbox. Fixed on the spot.',
    tags: ['Expert Diagnosis', 'Punctual & On-Time'],
    verifiedBooking: true,
  },

  // prov_6: MasterCool AC & Tech
  {
    id: 'rev_mastercool_1',
    providerId: 'prov_6',
    customerName: 'Zannat Ara',
    customerLocation: 'Banani',
    rating: 5,
    date: 'Yesterday',
    serviceType: 'AC Repair & Servicing',
    comment:
      'Top-notch cooling service. Checked gas pressure with digital manifold gauge and cleaned indoor blower wheel. AC is now running whisper quiet.',
    tags: ['Expert Diagnosis', 'Clean & Tidy Work'],
    verifiedBooking: true,
  },

  // prov_7: Dhaka Safe Pest Control
  {
    id: 'rev_pest_1',
    providerId: 'prov_7',
    customerName: 'Kamrul Hasan',
    customerLocation: 'Dhanmondi',
    rating: 5,
    date: '4 days ago',
    serviceType: 'Bed Bug & Cockroach Control',
    comment:
      'Odorless chemical gel treatment for kitchen cabinets. Not a single roach spotted since then. Safe for our toddler and pets.',
    tags: ['Clean & Tidy Work', 'Fair & Transparent'],
    verifiedBooking: true,
  },

  // prov_8: Shifting Bros Movers
  {
    id: 'rev_movers_1',
    providerId: 'prov_8',
    customerName: 'Dr. Tariqul Islam',
    customerLocation: 'Bashundhara R/A',
    rating: 5,
    date: '5 days ago',
    serviceType: 'Full House Shifting',
    comment:
      'Shifted 3-bedroom apartment without a single scratch on glass tables or TV. Bubble wrapped all fragile items carefully. Highly disciplined crew.',
    tags: ['Punctual & On-Time', 'Clean & Tidy Work', 'Polite & Professional'],
    verifiedBooking: true,
  },
];

/**
 * Combines dynamically submitted customer reviews from requests state with historical reviews
 */
export function getCombinedProviderReviews(
  providerId: string,
  allRequests: ServiceRequest[] = [],
  currentUserId?: string
): ProviderReviewItem[] {
  // 1. Extract reviews from allRequests where request has rating & assigned to this provider
  const liveReviews: ProviderReviewItem[] = allRequests
    .filter((req) => req.assignedProviderId === providerId && req.rating && req.rating > 0)
    .map((req) => ({
      id: `live_rev_${req.id}`,
      providerId: req.assignedProviderId!,
      customerName: req.customerName || 'Customer',
      customerLocation: req.location || 'Dhaka',
      rating: req.rating!,
      date: req.ratedAt || 'Recently',
      serviceType: req.serviceType || 'Home Service',
      comment: req.feedback || 'Service completed with high satisfaction.',
      tags: req.rating! >= 4
        ? ['Punctual & On-Time', 'Clean & Tidy Work', 'Verified Booking']
        : ['Verified Booking'],
      verifiedBooking: true,
      isCurrentUserReview: Boolean(currentUserId && req.customerId === currentUserId),
    }));

  // 2. Get static historical reviews for this provider
  const historical = PROVIDER_HISTORICAL_REVIEWS.filter(
    (rev) => rev.providerId === providerId
  );

  // Combine live reviews first (newest on top) then historical
  // Filter out any historical review that duplicates a seeded live request (e.g. req_100)
  const hasLiveFahim = liveReviews.some((r) => r.customerName === 'Fahim Alom');
  const sanitizedHistorical = hasLiveFahim
    ? historical.filter((h) => h.id !== 'rev_rahim_1')
    : historical;

  return [...liveReviews, ...sanitizedHistorical];
}

export function computeReviewStats(reviews: ProviderReviewItem[], fallbackRating = 4.8) {
  if (reviews.length === 0) {
    return {
      average: fallbackRating,
      totalCount: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[rounded]++;
    sum += r.rating;
  }

  const average = Number((sum / reviews.length).toFixed(1));
  const totalCount = reviews.length;
  const percentages = {
    5: Math.round((distribution[5] / totalCount) * 100),
    4: Math.round((distribution[4] / totalCount) * 100),
    3: Math.round((distribution[3] / totalCount) * 100),
    2: Math.round((distribution[2] / totalCount) * 100),
    1: Math.round((distribution[1] / totalCount) * 100),
  };

  return { average, totalCount, distribution, percentages };
}
