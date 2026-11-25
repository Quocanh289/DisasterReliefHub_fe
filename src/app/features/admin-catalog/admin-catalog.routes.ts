import { Routes } from '@angular/router';
import { EventsComponent } from './events/events.component';
import { ItemsComponent } from './items/items.component';
import { WarehousesComponent } from './warehouses/warehouses.component';

export const adminCatalogRoutes: Routes = [
  { path: 'events', component: EventsComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'warehouses', component: WarehousesComponent }
];
