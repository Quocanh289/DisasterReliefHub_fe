import { GeoLocation } from './catalog.model';

export interface ReliefRequestItemResponse {
  itemId: string;
  itemName: string;
  unit: string;
  quantityNeeded: number;
  quantityFulfilled: number;
}

export interface ReliefRequestResponse {
  id: string;
  eventId: string | null;
  requesterId: string;
  requesterName: string;
  phone: string;
  location: GeoLocation;
  urgency: number;
  affectedPeople: number;
  status: 'Pending' | 'Assigned' | 'Fulfilled' | 'Cancelled';
  createdAt: string;
  items: ReliefRequestItemResponse[];
}

export interface CreateReliefRequestDto {
  phone: string;
  eventId: string | null;
  urgency: number;
  affectedPeople: number;
  longitude: number;
  latitude: number;
  items: Array<{ itemId: string; quantity: number }>;
}
