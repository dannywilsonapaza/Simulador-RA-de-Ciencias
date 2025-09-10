import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { User, UserRole, LoginCredentials, AuthResponse, ROLE_PERMISSIONS } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // Señales reactivas para el estado de autenticación
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isAuthenticated = signal(false);
  private readonly _isLoading = signal(false);

  // Propiedades públicas computadas
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly userRole = computed(() => this._currentUser()?.role || null);
  readonly userPermissions = computed(() => {
    const role = this.userRole();
    return role ? ROLE_PERMISSIONS[role] : [];
  });

  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    // Intentar restaurar sesión al inicializar
    this.initializeFromStorage();
  }

  /**
   * Inicializar estado desde localStorage
   */
  private initializeFromStorage(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);

      if (token && userJson) {
        const user: User = JSON.parse(userJson);

        // Verificar si el token no ha expirado (implementación simplificada)
        if (this.isTokenValid(token)) {
          this._currentUser.set(user);
          this._isAuthenticated.set(true);
        } else {
          this.clearStoredAuth();
        }
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      this.clearStoredAuth();
    }
  }

  /**
   * Verificar validez del token (implementación simplificada)
   */
  private isTokenValid(token: string): boolean {
    try {
      // En una implementación real, verificarías la expiración del JWT
      // Por ahora, asumimos que el token es válido si existe
      return token.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);

    // Simulación de llamada API - en producción sería una petición HTTP real
    return this.simulateApiCall(credentials).pipe(
      tap(response => {
        this.setAuthData(response);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Simulación de API de login (reemplazar con HttpClient en producción)
   */
  private simulateApiCall(credentials: LoginCredentials): Observable<AuthResponse> {
    return timer(1000).pipe( // Simula latencia de red
      switchMap(() => {
        // Usuarios de ejemplo para testing
        const mockUsers: Record<string, { user: User; password: string }> = {
          'admin@ejemplo.com': {
            password: 'admin123',
            user: {
              id: '1',
              email: 'admin@ejemplo.com',
              name: 'Administrador',
              role: UserRole.ADMIN,
              isActive: true,
              createdAt: new Date(),
              preferences: {
                language: 'es',
                theme: 'dark',
                notifications: true,
                twoFactorEnabled: false
              }
            }
          },
          'profesor@ejemplo.com': {
            password: 'profesor123',
            user: {
              id: '2',
              email: 'profesor@ejemplo.com',
              name: 'Prof. García',
              role: UserRole.TEACHER,
              isActive: true,
              createdAt: new Date(),
              preferences: {
                language: 'es',
                theme: 'light',
                notifications: true,
                twoFactorEnabled: true
              }
            }
          },
          'estudiante@ejemplo.com': {
            password: 'estudiante123',
            user: {
              id: '3',
              email: 'estudiante@ejemplo.com',
              name: 'Ana Pérez',
              role: UserRole.STUDENT,
              isActive: true,
              createdAt: new Date(),
              preferences: {
                language: 'es',
                theme: 'light',
                notifications: true,
                twoFactorEnabled: false
              }
            }
          }
        };

        const mockUser = mockUsers[credentials.email];

        if (!mockUser || mockUser.password !== credentials.password) {
          return throwError(() => ({
            error: 'Credenciales inválidas',
            code: 'INVALID_CREDENTIALS'
          }));
        }

        const response: AuthResponse = {
          user: { ...mockUser.user, lastLogin: new Date() },
          token: `mock_jwt_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          expiresIn: 3600 // 1 hora
        };

        return of(response);
      })
    );
  }

  /**
   * Establecer datos de autenticación
   */
  private setAuthData(authResponse: AuthResponse): void {
    const { user, token, refreshToken } = authResponse;

    // Almacenar en localStorage si "recordarme" está activo
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Actualizar estado
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearStoredAuth();
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Limpiar datos almacenados
   */
  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(resource: string, action: string): boolean {
    const permissions = this.userPermissions();

    return permissions.some(permission =>
      (permission.resource === '*' && permission.actions.includes('*')) ||
      (permission.resource === resource &&
       (permission.actions.includes(action) || permission.actions.includes('*')))
    );
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  /**
   * Verificar si el usuario tiene al menos uno de los roles especificados
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.userRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Obtener token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Refrescar token (implementación simplificada)
   */
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // En producción, hacer petición al endpoint de refresh
    return timer(500).pipe(
      map(() => {
        const newToken = `refreshed_token_${Date.now()}`;
        localStorage.setItem(this.TOKEN_KEY, newToken);
        return newToken;
      })
    );
  }
}
