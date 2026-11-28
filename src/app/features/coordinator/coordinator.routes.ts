import { Routes } from '@angular/router';
import { CoordinatorAssignComponent } from './assign/coordinator-assign.component';
import { CoordinatorDashboardComponent } from './dashboard/coordinator-dashboard.component';
import { CoordinatorVolunteersComponent } from './volunteers/coordinator-volunteers.component';

export const coordinatorRoutes: Routes = [
  { path: 'requests', component: CoordinatorDashboardComponent },
  { path: 'assign', component: CoordinatorAssignComponent },
  { path: 'volunteers', component: CoordinatorVolunteersComponent },
  { path: 'dashboard', redirectTo: 'requests', pathMatch: 'full' },
  { path: '', pathMatch: 'full', redirectTo: 'requests' }
];
