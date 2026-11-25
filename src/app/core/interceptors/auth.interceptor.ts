import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const tokens = inject(TokenStorageService);
  const accessToken = tokens.accessToken();
  let outgoing = request;

  if (accessToken && !request.url.includes('/auth/login') && !request.url.includes('/auth/register') && !request.url.includes('/auth/refresh')) {
    outgoing = outgoing.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      if (request.url.includes('/auth/refresh')) {
        auth.logout();
        return throwError(() => error);
      }

      const refreshToken = tokens.refreshToken();
      if (!refreshToken) {
        auth.logout();
        return throwError(() => error);
      }

      return auth.refresh({ refreshToken }).pipe(
        switchMap((authResponse) => {
          auth.storeAuth(authResponse);
          const retry = request.clone({
            setHeaders: { Authorization: `Bearer ${authResponse.accessToken}` }
          });
          return next(retry);
        }),
        catchError((refreshError) => {
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
