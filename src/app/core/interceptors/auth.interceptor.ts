import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthResponse } from '../models/models';

let refreshInFlight: Observable<AuthResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const tokens = inject(TokenStorageService);
  const accessToken = tokens.accessToken();
  const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => request.url.includes(path));
  const outgoing = accessToken && !isAuthRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthRequest) {
        return throwError(() => error);
      }

      const refreshToken = tokens.refreshToken();
      if (!refreshToken) {
        auth.logout();
        return throwError(() => error);
      }

      if (!refreshInFlight) {
        refreshInFlight = auth.refresh().pipe(
          finalize(() => { refreshInFlight = null; }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
      }

      return refreshInFlight.pipe(
        switchMap((authResponse) => {
          const retry = request.clone({
            setHeaders: { Authorization: `Bearer ${authResponse.accessToken}` }
          });
          return next(retry).pipe(
            catchError((retryError: unknown) => {
              if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                auth.logout();
              }
              return throwError(() => retryError);
            })
          );
        }),
        catchError((refreshError) => {
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
