# Sistema de Autenticación y Autorización

Este módulo implementa un sistema completo de autenticación y autorización para la plataforma educativa con RA.

## 🔐 Características Implementadas

### Autenticación
- ✅ Login con email/contraseña
- ✅ Validación de formularios reactivos
- ✅ Simulación de JWT tokens
- ✅ Persistencia de sesión en localStorage
- ✅ Manejo de estados de carga
- ✅ Mensajes de error detallados
- ⏳ Login social (Google, Microsoft, Apple) - Preparado para implementar
- ⏳ Autenticación de dos factores (2FA)

### Autorización
- ✅ Sistema de roles (Admin, Profesor, Estudiante, Invitado)
- ✅ Guards de autenticación para rutas
- ✅ Guards basados en roles
- ✅ Sistema de permisos granular
- ✅ Página de acceso denegado

### Seguridad
- ✅ Validación en frontend
- ✅ Protección de rutas sensibles
- ✅ Manejo seguro de tokens
- ✅ Expiración de sesiones
- ⏳ Rate limiting - Para implementar en backend
- ⏳ CSRF protection - Para implementar en backend

## 🚀 Uso Rápido

### 1. Acceder al Login
Navega a `/login` o serás redirigido automáticamente si no estás autenticado.

### 2. Usuarios de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|--------|-----------|----------|
| Administrador | `admin@ejemplo.com` | `admin123` | Acceso completo |
| Profesor | `profesor@ejemplo.com` | `profesor123` | Gestión de estudiantes y clases |
| Estudiante | `estudiante@ejemplo.com` | `estudiante123` | Acceso a simulaciones |

### 3. Verificar Estado de Autenticación

```typescript
import { inject } from '@angular/core';
import { AuthService } from './features/auth';

export class MiComponente {
  private authService = inject(AuthService);
  
  // Verificar si está autenticado
  isLoggedIn = this.authService.isAuthenticated();
  
  // Obtener usuario actual
  currentUser = this.authService.currentUser();
  
  // Verificar rol
  isAdmin = this.authService.hasRole(UserRole.ADMIN);
  
  // Verificar permiso
  canViewReports = this.authService.hasPermission('reports', 'view');
}
```

### 4. Proteger Rutas

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component'),
  canActivate: [authGuard, adminGuard]
}
```

## 📁 Estructura del Módulo

```
auth/
├── components/
│   ├── login.component.ts          # Componente de login
│   └── unauthorized.component.ts   # Página de acceso denegado
├── guards/
│   ├── auth.guard.ts              # Guard de autenticación básica
│   └── role.guard.ts              # Guards basados en roles
├── models/
│   └── user.model.ts              # Interfaces y tipos
├── services/
│   └── auth.service.ts            # Servicio principal de autenticación
└── index.ts                       # Exportaciones del módulo
```

## 🔧 Configuración

### Tokens de Autenticación
Los tokens se almacenan en localStorage:
- `auth_token`: JWT principal
- `refresh_token`: Token para renovar sesión
- `current_user`: Datos del usuario

### Permisos por Rol

```typescript
// Invitado
- simulations: ['view_demo']

// Estudiante
- simulations: ['view', 'interact']
- progress: ['view_own']
- profile: ['view_own', 'edit_own']

// Profesor
- simulations: ['view', 'interact', 'assign']
- students: ['view', 'manage_progress']
- classes: ['create', 'edit', 'delete', 'view']
- reports: ['generate', 'export']
- profile: ['view_own', 'edit_own']

// Administrador
- *: ['*'] // Acceso completo
```

## 🚧 Próximas Implementaciones

### Backend Integration
- [ ] Integrar con API real (reemplazar simulación)
- [ ] Implementar refresh token automático
- [ ] Validación de tokens JWT
- [ ] Rate limiting para intentos de login

### OAuth Social Login
- [ ] Google OAuth2
- [ ] Microsoft Azure AD
- [ ] Apple Sign In

### Seguridad Avanzada
- [ ] Autenticación de dos factores (TOTP)
- [ ] Recuperación de contraseña por email
- [ ] Logs de auditoría
- [ ] Detección de sesiones concurrentes

### UX Improvements
- [ ] Componente de registro
- [ ] Perfil de usuario editable
- [ ] Configuraciones de privacidad
- [ ] Tema oscuro/claro por usuario

## 🔍 Testing

### Flujo de Login
1. Ir a `/login`
2. Usar credenciales de prueba
3. Verificar redirección según rol
4. Probar navegación protegida
5. Hacer logout y verificar redirección

### Verificar Guards
1. Intentar acceder a `/admin` sin ser admin
2. Verificar redirección a `/unauthorized`
3. Login como admin y verificar acceso

## 📞 Integración con Componentes Existentes

Para agregar información del usuario autenticado a cualquier componente:

```typescript
import { Component, inject } from '@angular/core';
import { AuthService, UserRole } from './features/auth';

@Component({
  template: `
    <div *ngIf="authService.isAuthenticated()">
      <p>Hola, {{ authService.currentUser()?.name }}!</p>
      <p *ngIf="authService.hasRole(UserRole.ADMIN)">Eres administrador</p>
    </div>
  `
})
export class MiComponente {
  authService = inject(AuthService);
  UserRole = UserRole; // Para usar en template
}
```

## ⚠️ Consideraciones de Seguridad

1. **Nunca confiar solo en validación frontend**
2. **Tokens en localStorage**: Considerar httpOnly cookies para producción
3. **HTTPS obligatorio** en producción
4. **Validar permisos en cada endpoint del backend**
5. **Implementar CSRF protection** para formularios
6. **Logs de actividad** para auditoría
