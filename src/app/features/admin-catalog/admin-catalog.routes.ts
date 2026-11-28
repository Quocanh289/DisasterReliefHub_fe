import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { AdminCatalogComponent } from './catalog/admin-catalog.component';
import { EventsComponent } from './events/events.component';
import { ItemsComponent } from './items/items.component';
import { InventoriesComponent } from './inventories/inventories.component';
import { WarehousesComponent } from './warehouses/warehouses.component';

export const adminCatalogRoutes: Routes = [
  { path: 'catalog', component: AdminCatalogComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
  { path: 'inventory', component: InventoriesComponent, canActivate: [roleGuard], data: { roles: ['Admin', 'Coordinator'] } },
  { path: 'events', component: EventsComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
  { path: 'items', component: ItemsComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
  { path: 'warehouses', component: WarehousesComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
  { path: '', pathMatch: 'full', redirectTo: 'catalog' }
];
