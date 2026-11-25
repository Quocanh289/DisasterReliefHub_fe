import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DisasterEvent, InventoryItem, Item, UpsertInventoryRequest, Warehouse } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private http: HttpClient) {}

  events(): Observable<DisasterEvent[]> { return this.http.get<DisasterEvent[]>(`${environment.apiUrl}/events`); }
  event(id: string): Observable<DisasterEvent> { return this.http.get<DisasterEvent>(`${environment.apiUrl}/events/${id}`); }
  createEvent(body: DisasterEvent): Observable<DisasterEvent> { return this.http.post<DisasterEvent>(`${environment.apiUrl}/events`, body); }
  updateEvent(id: string, body: DisasterEvent): Observable<DisasterEvent> { return this.http.put<DisasterEvent>(`${environment.apiUrl}/events/${id}`, body); }
  deleteEvent(id: string): Observable<void> { return this.http.delete<void>(`${environment.apiUrl}/events/${id}`); }

  warehouses(): Observable<Warehouse[]> { return this.http.get<Warehouse[]>(`${environment.apiUrl}/warehouses`); }
  warehouse(id: string): Observable<Warehouse> { return this.http.get<Warehouse>(`${environment.apiUrl}/warehouses/${id}`); }
  createWarehouse(body: Warehouse): Observable<Warehouse> { return this.http.post<Warehouse>(`${environment.apiUrl}/warehouses`, body); }
  updateWarehouse(id: string, body: Warehouse): Observable<Warehouse> { return this.http.put<Warehouse>(`${environment.apiUrl}/warehouses/${id}`, body); }
  deleteWarehouse(id: string): Observable<void> { return this.http.delete<void>(`${environment.apiUrl}/warehouses/${id}`); }

  items(): Observable<Item[]> { return this.http.get<Item[]>(`${environment.apiUrl}/items`); }
  item(id: string): Observable<Item> { return this.http.get<Item>(`${environment.apiUrl}/items/${id}`); }
  createItem(body: Item): Observable<Item> { return this.http.post<Item>(`${environment.apiUrl}/items`, body); }
  updateItem(id: string, body: Item): Observable<Item> { return this.http.put<Item>(`${environment.apiUrl}/items/${id}`, body); }
  deleteItem(id: string): Observable<void> { return this.http.delete<void>(`${environment.apiUrl}/items/${id}`); }

  inventories(warehouseId?: string): Observable<InventoryItem[]> {
    const query = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : '';
    return this.http.get<InventoryItem[]>(`${environment.apiUrl}/inventories${query}`);
  }
  upsertInventory(body: UpsertInventoryRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${environment.apiUrl}/inventories`, body);
  }
}
