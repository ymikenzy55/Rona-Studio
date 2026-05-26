// Project Types
export interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  categories: ProjectCategory[];
  client?: string;
  date: string;
  location?: string;
  coverImage: MediaAsset;
  images: MediaAsset[];
  videos?: MediaAsset[];
  featured: boolean;
  order: number;
  metadata?: {
    duration?: string;
    team?: string[];
    equipment?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory = 
  | 'photography' 
  | 'videography' 
  | 'weddings' 
  | 'corporate' 
  | 'events' 
  | 'fashion' 
  | 'lifestyle';

export interface MediaAsset {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  type: 'image' | 'video';
  thumbnail?: string;
  alt?: string;
}

// Booking Types
export interface Booking {
  _id: string;
  service: ServiceType;
  preferredDate: string;
  package: PackageType;
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    message?: string;
  };
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = 
  | 'wedding-photography'
  | 'wedding-videography'
  | 'corporate-coverage'
  | 'fashion-shoots'
  | 'brand-content'
  | 'events-coverage';

export type PackageType = 'basic' | 'standard' | 'premium' | 'custom';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Contact Types
export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// User Types
export interface User {
  _id: string;
  email: string;
  role: 'admin';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Form Types
export interface BookingFormData {
  service: ServiceType;
  preferredDate: string;
  package: PackageType;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Analytics Types
export interface DashboardStats {
  totalProjects: number;
  totalBookings: number;
  pendingBookings: number;
  totalMessages: number;
  unreadMessages: number;
  recentBookings: Booking[];
  recentMessages: ContactMessage[];
}

// Animation Types
export interface AnimationConfig {
  initial: any;
  animate: any;
  exit?: any;
  transition?: any;
}

// Cursor Types
export interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  text?: string;
}
