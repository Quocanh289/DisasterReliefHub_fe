export interface GeoLocation {
  longitude: number;
  latitude: number;
}

export interface DisasterEvent {
  id: string;
  name: string;
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
  address?: string;
  location: GeoLocation;
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
