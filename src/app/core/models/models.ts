export type Role = 'Requester' | 'Volunteer' | 'Coordinator' | 'Admin';
export type UserRole = Role;
export type PublicRole = 'Requester' | 'Volunteer';

export type VolunteerStatus = 'Available' | 'Busy' | 'Offline';
export type ReliefRequestStatus = 'Pending' | 'PartiallyAssigned' | 'Assigned' | 'Fulfilled' | 'Cancelled';
export type AssignmentStatus = 'Pending' | 'Accepted' | 'InTransit' | 'Delivered' | 'Failed';

export interface GeoLocation {
  longitude: number;
  latitude: number;
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role?: PublicRole;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface DisasterEvent {
  id: string;
  name: string;
  isActive?: boolean;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: GeoLocation | null;
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string | null;
  location?: GeoLocation | null;
  isActive?: boolean;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemName: string;
  unit: string;
  quantityOnHand: number;
  quantityCommitted: number;
  safetyStock: number;
  available: number;
}

export interface UpsertInventoryRequest {
  warehouseId: string;
  itemId: string;
  quantityOnHand: number;
  safetyStock: number;
}

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
  serviceRadiusKm: number;
  longitude?: number | null;
  latitude?: number | null;
}

export interface UpdateVolunteerStatusRequest {
  status: Extract<VolunteerStatus, 'Available' | 'Offline'>;
}

export interface RequestItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateReliefRequestDto {
  phone: string;
  eventId: string | null;
  urgency: 1 | 2 | 3 | 4 | 5;
  affectedPeople: number;
  longitude: number;
  latitude: number;
  items: RequestItemInput[];
}

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
  status: ReliefRequestStatus;
  createdAt: string;
  items: ReliefRequestItemResponse[];
}

export interface CreateAssignmentDto {
  requestId: string;
  warehouseId: string;
  volunteerId: string;
  eta: string | null;
  note: string | null;
  items: RequestItemInput[];
}

export interface UpdateAssignmentStatusDto {
  status: Exclude<AssignmentStatus, 'Pending'>;
  note?: string | null;
}

export interface AssignmentItemResponse {
  itemId: string;
  itemName: string;
  unit: string;
  qtyDispatched: number;
  qtyDelivered: number;
  qtyReceived: number;
}

export interface AssignmentResponse {
  id: string;
  requestId: string;
  requesterName: string;
  warehouseId: string;
  warehouseName: string;
  volunteerId: string;
  volunteerName: string;
  status: AssignmentStatus;
  eta: string | null;
  note: string | null;
  items: AssignmentItemResponse[];
}

export interface NotificationItem {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export interface LegacyErrorMessage {
  message?: string;
}
