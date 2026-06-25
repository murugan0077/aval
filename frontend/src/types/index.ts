export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
  preferredLang?: string;
  city?: string;
  pincode?: string;
  state?: string;
  lat?: number;
  lng?: number;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  user: { id: string; name: string; phone: string };
  skillCategory: string;
  subSkills: string[];
  yearsOfExperience: number;
  serviceRadiusKm: number;
  description?: string;
  idProofType?: string;
  verificationStatus: string;
  verificationBadge?: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  availabilityNow: boolean;
  premiumTier: 'NONE' | 'PRO' | 'FEATURED';
  isProfileComplete: boolean;
  serviceListings: ServiceListing[];
  reviews: Review[];
  availability: Availability[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameHi?: string;
  icon?: string;
  description?: string;
  subCategories: ServiceSubCategory[];
}

export interface ServiceSubCategory {
  id: string;
  categoryId: string;
  name: string;
  fixedPrice?: number;
  priceUnit: string;
  isCustomQuote: boolean;
}

export interface ServiceListing {
  id: string;
  professionalId: string;
  categoryId: string;
  subCategoryId?: string;
  category: ServiceCategory;
  subCategory?: ServiceSubCategory;
  price?: number;
  priceUnit: string;
  isCustomPricing: boolean;
}

export interface Booking {
  id: string;
  bookingId: string;
  customerId: string;
  professionalId: string;
  categoryName: string;
  subCategoryName?: string;
  jobDescription: string;
  status: BookingStatus;
  scheduledDate?: string;
  scheduledSlot?: string;
  isInstant: boolean;
  address: string;
  city: string;
  pincode?: string;
  estimatedCost: number;
  finalCost?: number;
  cancellationFee?: number;
  customer?: { name: string; phone: string };
  professional?: ProfessionalProfile;
  payment?: Payment;
  review?: Review;
  createdAt: string;
}

export type BookingStatus =
  | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS'
  | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  isPublished: boolean;
  reviewer: { name: string };
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  platformCommission: number;
  taxAmount: number;
  professionalEarning: number;
  status: PaymentStatus;
  method?: string;
  transactionId?: string;
}

export type PaymentStatus =
  | 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED';

export interface Dispute {
  id: string;
  bookingId?: string;
  category: string;
  description: string;
  status: string;
  responseSla?: string;
  booking?: { bookingId: string; status: string };
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  subSkills: string[];
  rating: number;
  totalReviews: number;
  experience: number;
  distance: number;
  startingPrice?: number;
  priceUnit: string;
  availableNow: boolean;
  premiumTier: string;
  verificationBadge?: string;
}
