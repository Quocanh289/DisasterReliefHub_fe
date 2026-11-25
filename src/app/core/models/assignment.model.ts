export type AssignmentStatus = 'Pending' | 'Accepted' | 'InTransit' | 'Delivered' | 'Failed';

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

export interface CreateAssignmentDto {
  requestId: string;
  warehouseId: string;
  volunteerId: string;
  eta: string | null;
  note: string | null;
  items: Array<{ itemId: string; quantity: number }>;
}

export interface UpdateAssignmentStatusDto {
  status: AssignmentStatus;
  note: string;
}
