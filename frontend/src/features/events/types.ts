export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  isRegistered?: boolean;
  registerUrl?: string;
  registrationEnabled?: boolean;
  registrationDeadline?: string;
  participantLimit?: number;
  registrations?: EventRegistration[];
  image?: { public_id?: string; url?: string };
  operatingHours?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  mapLocation?: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}
export interface EventRegistration {
  user: string;
  status: 'Registered' | 'Approved' | 'Rejected';
  registeredAt: string;
}
export interface EventFilters {
  status: 'All' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  search: string;
  page: number;
}
