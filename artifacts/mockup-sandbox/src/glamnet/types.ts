export type Role = 'client' | 'artist' | 'brand';

export type Page =
  | 'onboarding'
  | 'client-home'
  | 'client-profile'
  | 'client-booking'
  | 'client-confirmation'
  | 'artist-dashboard'
  | 'artist-requests'
  | 'brand-dashboard'
  | 'brand-create'
  | 'brand-review';

export interface NavState {
  page: Page;
  selectedArtistId?: string;
  selectedCampaignId?: string;
  confirmedArtistName?: string;
  confirmedDate?: string;
  confirmedService?: string;
}

export interface Artist {
  id: string;
  name: string;
  specialty: string;
  location: string;
  dayRate: number;
  rating: number;
  reviews: number;
  available: boolean;
  skills: string[];
  bio: string;
  seed: string;
}

export interface BookingRequest {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  budget: number;
  status: 'pending' | 'confirmed' | 'declined';
}

export interface Campaign {
  id: string;
  title: string;
  role: string;
  budget: number;
  deadline: string;
  applicants: number;
  status: 'active' | 'closed';
}

export interface Applicant {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  dayRate: number;
  location: string;
  seed: string;
}
