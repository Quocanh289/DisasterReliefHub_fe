import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  const roles = (route.data['roles'] ?? []) as UserRole[];
  if (user && roles.includes(user.role)) return true;
  if (user) return router.createUrlTree([auth.getDefaultRouteByRole(user.role)]);
  return router.createUrlTree(['/login']);
};
