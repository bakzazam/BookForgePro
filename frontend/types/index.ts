/**
 * AIPhDWriter Type Definitions
 */

// Book form types
export type AudienceType = 'students' | 'developers' | 'ceos' | 'general';
export type LengthType = 'short' | 'standard' | 'comprehensive' | 'dissertation';
export type StyleType = 'conversational' | 'academic' | 'technical' | 'business';

export interface BookFormData {
  topic: string;
  audience: AudienceType;
  length: LengthType;
  style: StyleType;
  userEmail: string;
}

// Pricing configuration
export interface PricingTier {
  id: LengthType;
  name: string;
  price: number;
  chapters: string;
  words: string;
  description: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'short',
    name: 'Short',
    price: 29,
    chapters: '5-7',
    words: '15K-25K',
    description: 'Quick guide or introduction',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 49,
    chapters: '8-12',
    words: '30K-50K',
    description: 'Complete book for most topics',
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    price: 99,
    chapters: '15-20',
    words: '60K-80K',
    description: 'In-depth coverage with examples',
  },
  {
    id: 'dissertation',
    name: 'Dissertation',
    price: 199,
    chapters: '25-30',
    words: '100K+',
    description: 'Academic-level depth and rigor',
  },
];

// Add-ons
export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export const ADD_ONS: AddOn[] = [
  {
    id: 'illustrations',
    name: 'AI Illustrations',
    price: 20,
    description: '10+ custom illustrations for your book',
    icon: 'image',
  },
  {
    id: 'cover',
    name: 'Custom Cover',
    price: 19,
    description: 'Professional AI-generated cover design',
    icon: 'book',
  },
  {
    id: 'rush',
    name: 'Rush Delivery',
    price: 29,
    description: 'Get your book in under 4 hours',
    icon: 'flash',
  },
];

// API Response Types
export interface Chapter {
  number: number;
  title: string;
  focus?: string;
}

export interface BookOutline {
  title: string;
  subtitle?: string;
  chapters: Chapter[];
  totalChapters: number;
  estimatedPages?: number;
  estimatedWords?: number;
}

export interface PreviewResponse {
  book_id: string;
  status: 'preview' | 'generating' | 'complete' | 'failed';
  outline: BookOutline;
  chapter_1: string;
  price: number;
}

export interface BookStatus {
  book_id: string;
  status: 'preview' | 'generating' | 'complete' | 'failed';
  progress: number;
  current_chapter?: number;
  total_chapters?: number;
  outline?: BookOutline;
  download_urls?: {
    pdf?: string;
    docx?: string;
    epub?: string;
  };
}

export interface PaymentIntentResponse {
  client_secret: string;  // Backend uses snake_case
  total_amount: number;   // Backend uses snake_case
  breakdown: {
    base: number;
    total: number;
    [key: string]: number;
  };
}

// Book for Dashboard
export interface Book {
  book_id: string;
  title: string;
  topic: string;
  status: 'preview' | 'generating' | 'complete' | 'failed';
  progress: number;
  created_at: string;
  paid: boolean;
  price: number;
  coverImage?: string;
  outline?: BookOutline;
}

// Navigation types
export type RootStackParamList = {
  index: undefined;
  create: undefined;
  preview: { bookId: string };
  payment: { bookId: string };
  status: { bookId: string };
  download: { bookId: string };
  dashboard: undefined;
};
