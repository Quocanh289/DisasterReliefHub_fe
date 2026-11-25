import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, UserRole } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthResponse | null>(null);

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

  refresh(request: RefreshRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, request);
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

  getDefaultRouteByRole(role: UserRole): string {
    const routes: Record<UserRole, string> = {
      Admin: '/admin/events',
      Coordinator: '/coordinator/dashboard',
      Volunteer: '/volunteer/tasks',
      Requester: '/requester/requests'
    };
    return routes[role];
  }
}
