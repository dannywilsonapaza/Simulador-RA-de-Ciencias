export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  preferences?: UserPreferences;
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  GUEST = 'guest'
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  twoFactorEnabled: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [
    { resource: 'simulations', actions: ['view_demo'] }
  ],
  [UserRole.STUDENT]: [
    { resource: 'simulations', actions: ['view', 'interact'] },
    { resource: 'progress', actions: ['view_own'] },
    { resource: 'profile', actions: ['view_own', 'edit_own'] }
  ],
  [UserRole.TEACHER]: [
    { resource: 'simulations', actions: ['view', 'interact', 'assign'] },
    { resource: 'students', actions: ['view', 'manage_progress'] },
    { resource: 'classes', actions: ['create', 'edit', 'delete', 'view'] },
    { resource: 'reports', actions: ['generate', 'export'] },
    { resource: 'profile', actions: ['view_own', 'edit_own'] }
  ],
  [UserRole.ADMIN]: [
    { resource: '*', actions: ['*'] } // Acceso completo
  ]
};
