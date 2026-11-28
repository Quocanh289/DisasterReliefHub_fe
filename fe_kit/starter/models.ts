// Interfaces khớp với API contract Nhóm 1.
// Enum dạng string union. Nếu backend có thêm/khác giá trị enum, sửa tại đây.

export type Role = 'Requester' | 'Volunteer' | 'Coordinator' | 'Admin';
export type PublicRole = 'Requester' | 'Volunteer';
export type VolunteerStatus = 'Available' | 'Busy' | 'Offline';
// TODO-CHECK: đối chiếu với enum backend (ReliefRequestStatus, AssignmentStatus)
export type ReliefRequestStatus = 'Pending' | 'Allocated' | 'Fulfilled' | 'Cancelled';
export type AssignmentStatus = 'Pending' | 'Accepted' | 'InTransit' | 'Delivered' | 'Failed';

export interface GeoPoint { longitude: number; latitude: number; }

// ---------- Auth ----------
export interface RegisterRequest { fullName: string; email: string; password: string; role?: PublicRole; }
export interface LoginRequest { email: string; password: string; }
export interface RefreshRequest { refreshToken: string; }
export interface AuthResponse {
  userId: string; fullName: string; email: string; role: Role;
  accessToken: string; refreshToken: string;
}

// ---------- Catalog ----------
export interface DisasterEvent { id: string; name: string; [key: string]: unknown; }
export interface Warehouse { id: string; name: string; address?: string | null; location?: GeoPoint | null; isActive?: boolean; [key: string]: unknown; }
export interface Item { id: string; name: string; unit: string; [key: string]: unknown; }

export interface InventoryResponse {
  id: string; warehouseId: string; warehouseName: string;
  itemId: string; itemName: string; unit: string;
  quantityOnHand: number; quantityCommitted: number; safetyStock: number;
  available: number; // quantityOnHand - quantityCommitted - safetyStock
}
export interface UpsertInventoryRequest { warehouseId: string; itemId: string; quantityOnHand: number; safetyStock: number; }

// ---------- Volunteers ----------
export interface VolunteerProfileResponse {
  id: string; userId: string; fullName: string; email: string;
  skills: string[]; location: GeoPoint | null; serviceRadiusKm: number;
  status: VolunteerStatus; currentLoad: number;
}
export interface UpdateVolunteerProfileRequest { skills: string[]; serviceRadiusKm: number; longitude?: number | null; latitude?: number | null; }
export interface UpdateVolunteerStatusRequest { status: Extract<VolunteerStatus, 'Available' | 'Offline'>; }

// ---------- Relief requests ----------
export interface RequestItemInput { itemId: string; quantity: number; }
export interface CreateReliefRequest {
  phone: string; eventId: string | null; urgency: 1 | 2 | 3 | 4 | 5; affectedPeople: number;
  longitude: number; latitude: number; items: RequestItemInput[];
}
export interface ReliefRequestItemResponse { itemId: string; itemName: string; unit: string; quantityNeeded: number; quantityFulfilled: number; }
export interface ReliefRequestResponse {
  id: string; eventId: string | null; requesterId: string; requesterName: string; phone: string;
  location: GeoPoint; urgency: number; affectedPeople: number; status: ReliefRequestStatus;
  createdAt: string; items: ReliefRequestItemResponse[];
}

// ---------- Assignments ----------
export interface CreateAssignmentRequest {
  requestId: string; warehouseId: string; volunteerId: string;
  eta: string | null; note: string | null; items: RequestItemInput[];
}
export interface UpdateAssignmentStatusRequest { status: Exclude<AssignmentStatus, 'Pending'>; note?: string | null; }
export interface AssignmentItemResponse { itemId: string; itemName: string; unit: string; qtyDispatched: number; qtyDelivered: number; qtyReceived: number; }
export interface AssignmentResponse {
  id: string; requestId: string; requesterName: string;
  warehouseId: string; warehouseName: string; volunteerId: string; volunteerName: string;
  status: AssignmentStatus; eta: string | null; note: string | null; items: AssignmentItemResponse[];
}

// ---------- Notifications ----------
export interface NotificationResponse {
  id: string; createdAt: string; updatedAt: string | null; createdBy: string | null;
  userId: string; title: string; message: string; type: string;
  relatedEntityId: string | null; isRead: boolean; readAt: string | null;
}

// ---------- Errors ----------
export interface ProblemDetails { type?: string; title?: string; status?: number; detail?: string; instance?: string; errors?: Record<string, string[]>; }
export interface LegacyError { message: string; }
