import { GeoLocation } from './catalog.model';

export type VolunteerStatus = 'Available' | 'Busy' | 'Offline';

export interface VolunteerProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  skills: string[];
  location: GeoLocation | null;
  serviceRadiusKm: number;
  status: VolunteerStatus;
  currentLoad: number;
}

export interface UpdateVolunteerProfileRequest {
  skills: string[];
  location: GeoLocation | null;
  serviceRadiusKm: number;
}
