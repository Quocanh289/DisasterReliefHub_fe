import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/models';

const AUTH_KEY = 'disaster-relief-auth';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  save(auth: AuthResponse): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  read(): AuthResponse | null {
    const value = localStorage.getItem(AUTH_KEY);
    return value ? JSON.parse(value) as AuthResponse : null;
  }

  clear(): void {
    localStorage.removeItem(AUTH_KEY);
  }

  accessToken(): string | null {
    return this.read()?.accessToken ?? null;
  }

  refreshToken(): string | null {
    return this.read()?.refreshToken ?? null;
  }
}
