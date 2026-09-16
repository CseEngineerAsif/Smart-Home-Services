export type UserRole = 'customer' | 'provider' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  avatarUrl?: string;
  createdAt: string;
  businessName?: string;
  serviceCategory?: string;
  providerId?: string;
  adminDepartment?: string;
  bio?: string;
  detailedAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredPaymentMethod?: 'bkash' | 'nagad' | 'card' | 'cash';
  specialties?: string[];
  experienceYears?: number;
  basePrice?: number;
  tradeLicense?: string;
  isAvailable?: boolean;
}

export type ServiceUrgency = 'Normal' | 'Urgent' | 'Emergency';

export type ServiceStatus =
  | 'Requested'
  | 'Assigned'
  | 'Accepted'
  | 'On The Way'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subServices: string[];
  description: string;
  isActive?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceCategories: string[];
  specialties: string[];
  location: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  experienceYears: number;
  availableTimeSlots: string[];
  currentWorkload: number; // active jobs count
  completedJobs: number;
  isAvailable: boolean;
  avatar: string;
  isVerified?: boolean;
  status?: 'active' | 'suspended';
  bio?: string;
  businessName?: string;
  tradeLicense?: string;
}

export type PaymentMethodType = 'bkash' | 'nagad' | 'card' | 'cash';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded';
export type PaymentPlanType = 'full' | 'advance_deposit' | 'cash_on_delivery';

export interface PaymentDetails {
  method: PaymentMethodType;
  status: PaymentStatus;
  plan: PaymentPlanType;
  amount: number; // total service price
  paidAmount: number; // amount paid so far
  remainingDue: number; // remaining balance
  currency: 'BDT';
  transactionId?: string;
  accountNumberMasked?: string;
  cardBrand?: 'Visa' | 'Mastercard' | 'Amex' | 'Nexus';
  paidAt?: string;
  receiptNumber?: string;
  gatewayFee?: number;
  discountApplied?: number;
  note?: string;
}

export interface WorkProofPhoto {
  url: string;
  note?: string;
  timestamp: string;
  uploadedBy?: string;
}

export interface WorkProof {
  before?: WorkProofPhoto;
  after?: WorkProofPhoto;
}

export interface DigitalWarranty {
  durationDays: number; // 7 or 14 days
  activatedAt: string;
  expiresAt: string;
  status: 'active' | 'claimed' | 'expired';
  warrantyCode: string;
  claimedAt?: string;
  claimRequestId?: string;
  claimReason?: string;
}

export interface CustomerLocationDetails {
  area: string;
  address: string;
  landmark?: string;
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'provider' | 'admin';
  text: string;
  timestamp: string;
  type?: 'text' | 'image' | 'location';
  attachmentType?: 'text' | 'image' | 'location';
  imageUrl?: string;
  attachmentUrl?: string;
  location?: {
    address: string;
    lat: number;
    lng: number;
    mapUrl?: string;
    mapsUrl?: string;
  };
  locationData?: {
    address: string;
    lat: number;
    lng: number;
    mapsUrl: string;
  };
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceCategory: string;
  serviceType: string;
  description: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  urgency: ServiceUrgency;
  imageUrl?: string;
  samplePhotos?: string[];
  assignedProviderId?: string;
  assignedProviderName?: string;
  status: ServiceStatus;
  estimatedPrice: number;
  createdAt: string;
  autoAssign: boolean;
  notes?: string;
  rating?: number;
  feedback?: string;
  ratedAt?: string;
  payment?: PaymentDetails;
  proofPhotos?: WorkProof;
  warranty?: DigitalWarranty;
  isWarrantyClaim?: boolean;
  originalRequestId?: string;
  customerLocationDetails?: CustomerLocationDetails;
  timeline: {
    status: ServiceStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface ProviderMatchResult {
  provider: ServiceProvider;
  matchScore: number;
  distanceKm: number;
  isSlotAvailable: boolean;
  explanation: string;
  badges: ('Best Match' | 'Best Price' | 'Best Rated')[];
  breakdown: {
    expertiseScore: number;
    availabilityScore: number;
    ratingScore: number;
    distanceScore: number;
    priceScore: number;
    workloadPenalty: number;
  };
}

export interface Booking {
  id: string;
  requestId: string;
  providerId: string;
  customerId: string;
  date: string;
  timeSlot: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  requestId?: string;
}

export interface FeaturedService {
  id: string;
  title: string;
  categoryName: string;
  categoryId: string;
  subService: string;
  location: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  description: string;
  imageUrl: string;
  badge: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  description: string;
  features: string[];
  categoryName: string;
  categoryId: string;
  subService: string;
  badge?: string;
}

