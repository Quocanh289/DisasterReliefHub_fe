import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../models/models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthResponse | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private http: HttpClient, private tokens: TokenStorageService, private router: Router) {
    this.currentUser.set(this.tokens.read());
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((auth) => this.storeAuth(auth))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      tap((auth) => this.storeAuth(auth))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.tokens.refreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Không tìm thấy refresh token.'));
    }
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((auth) => this.storeAuth(auth))
    );
  }

  storeAuth(auth: AuthResponse): void {
    this.tokens.save(auth);
    this.currentUser.set(auth);
  }

  logout(): void {
    this.tokens.clear();
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  getDefaultRouteByRole(role: Role): string {
    const routes: Record<Role, string> = {
      Admin: '/coordinator/requests',
      Coordinator: '/coordinator/requests',
      Volunteer: '/volunteer/assignments',
      Requester: '/requester/new'
    };
    return routes[role];
  }
}
