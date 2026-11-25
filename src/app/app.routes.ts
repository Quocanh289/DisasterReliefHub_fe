import { inject } from '@angular/core';
import { Router, Routes, CanActivateFn } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

const defaultRouteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  return user
    ? router.createUrlTree([auth.getDefaultRouteByRole(user.role)])
    : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [defaultRouteGuard],
    component: MainLayoutComponent
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./features/admin-catalog/admin-catalog.routes').then((m) => m.adminCatalogRoutes),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'admin/inventories',
        loadComponent: () => import('./features/admin-catalog/inventories/inventories.component').then((m) => m.InventoriesComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Coordinator'] }
      },
      {
        path: 'coordinator',
        loadChildren: () => import('./features/coordinator/coordinator.routes').then((m) => m.coordinatorRoutes),
        canActivate: [roleGuard],
        data: { roles: ['Coordinator', 'Admin'] }
      },
      {
        path: 'volunteer',
        loadChildren: () => import('./features/volunteer/volunteer.routes').then((m) => m.volunteerRoutes),
        canActivate: [roleGuard],
        data: { roles: ['Volunteer'] }
      },
      {
        path: 'requester',
        loadChildren: () => import('./features/requester/requester.routes').then((m) => m.requesterRoutes),
        canActivate: [roleGuard],
        data: { roles: ['Requester'] }
      }
    ]
  },
  {
    path: '**',
    canActivate: [defaultRouteGuard],
    component: MainLayoutComponent
  }
];
