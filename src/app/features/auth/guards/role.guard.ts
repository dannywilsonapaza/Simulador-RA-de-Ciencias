import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Factory para crear guards basados en roles
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // No tiene el rol necesario, redirigir a página de acceso denegado o dashboard
    router.navigate(['/unauthorized']);
    return false;
  };
}

// Guards específicos para cada rol
export const adminGuard = roleGuard([UserRole.ADMIN]);
export const teacherGuard = roleGuard([UserRole.TEACHER, UserRole.ADMIN]);
export const studentGuard = roleGuard([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]);

/**
 * Guard para verificar permisos específicos
 */
export function permissionGuard(resource: string, action: string): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    if (authService.hasPermission(resource, action)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}
