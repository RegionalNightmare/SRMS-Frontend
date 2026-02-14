import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { API_BASE } from './api.config';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'srmsToken';
  private readonly userKey = 'srmsUser';

  currentUser: User | null = null;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem(this.userKey);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch {
        this.currentUser = null;
      }
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  /** LOGIN */
  login(email: string, password: string) {
    console.log('[AuthService] login ->', email);

    return this.http.post<any>(`${API_BASE}/auth/login`, { email, password }).pipe(
      tap((res) => {
        console.log('[AuthService] login success response:', res);

        // CASE 1: backend returns { id, name, email, role, token }
        if (res && res.token && res.id && res.email) {
          const user: User = {
            id: res.id,
            name: res.name,
            email: res.email,
            role: res.role,
          };

          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUser = user;
          console.log('[AuthService] user set (flat shape):', this.currentUser);
          return;
        }

        // CASE 2: if you ever switch back to { token, user }
        if (res && res.token && res.user) {
          const user: User = res.user;
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUser = user;
          console.log('[AuthService] user set (token+user shape):', this.currentUser);
          return;
        }

        // Otherwise, it's unexpected
        throw new Error('Unexpected login response shape.');
      })
    );
  }

  /** REGISTER */
  register(name: string, email: string, password: string) {
    console.log('[AuthService] register ->', email);

    return this.http
      .post<any>(`${API_BASE}/auth/register`, {
        name,
        email,
        password,
        role: 'customer',
      })
      .pipe(
        tap((res) => {
          console.log('[AuthService] register success response:', res);

          // Assume register returns the same flat shape: {id, name, email, role, token}
          if (res && res.token && res.id && res.email) {
            const user: User = {
              id: res.id,
              name: res.name,
              email: res.email,
              role: res.role,
            };

            localStorage.setItem(this.tokenKey, res.token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUser = user;
            console.log('[AuthService] user set (flat shape):', this.currentUser);
            return;
          }

          // Fallback if it ever returns { token, user }
          if (res && res.token && res.user) {
            const user: User = res.user;
            localStorage.setItem(this.tokenKey, res.token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUser = user;
            console.log('[AuthService] user set (token+user shape):', this.currentUser);
            return;
          }

          throw new Error('Unexpected register response shape.');
        })
      );
  }

  logout() {
    console.log('[AuthService] logout');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser = null;
  }
}
