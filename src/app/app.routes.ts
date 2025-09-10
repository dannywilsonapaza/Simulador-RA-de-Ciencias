import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './features/auth/guards/auth.guard';
import { studentGuard, teacherGuard, adminGuard } from './features/auth/guards/role.guard';

export const routes: Routes = [
	// Ruta principal - Login (pantalla principal)
	{
		path: '',
		redirectTo: '/login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent),
		canActivate: [noAuthGuard]
	},
	{
		path: 'unauthorized',
		loadComponent: () => import('./features/auth/components/unauthorized.component').then(m => m.UnauthorizedComponent)
	},

	// Dashboards específicos por rol
	{
		path: 'dashboard',
		loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
		canActivate: [authGuard]
	},

	// Dashboard del estudiante
	{
		path: 'student-dashboard',
		loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
		canActivate: [authGuard, studentGuard]
	},

	// Dashboard del profesor
	{
		path: 'teacher-dashboard',
		loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
		canActivate: [authGuard, teacherGuard]
	},

	// Dashboard del administrador
	{
		path: 'admin-dashboard',
		loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
		canActivate: [authGuard, adminGuard]
	},

	// Rutas protegidas - requieren autenticación
	{
		path: 'fisica',
		canActivate: [authGuard, studentGuard], // Estudiantes, profesores y admins
		children: [
			{ path: '', loadComponent: () => import('./features/physics/lista-simulaciones/lista-simulaciones.component').then(m=>m.ListaSimulacionesComponent) },
			{ path: 'caida-libre', loadComponent: () => import('./features/physics/caida-libre/caida-libre.component').then(m=>m.CaidaLibreComponent) },
			{ path: 'tiro-parabolico', loadComponent: () => import('./features/physics/tiro-parabolico/tiro-parabolico.component').then(m=>m.TiroParabolicoComponent) },
			{ path: 'pendulo-simple', loadComponent: () => import('./features/physics/pendulo-simple/pendulo-simple.component').then(m=>m.PenduloSimpleComponent) },
			{ path: 'masa-resorte', loadComponent: () => import('./features/physics/masa-resorte/masa-resorte.component').then(m=>m.MasaResorteComponent) },
			{ path: 'campo-electrico', loadComponent: () => import('./features/physics/campo-electrico/campo-electrico.component').then(m=>m.CampoElectricoComponent) }
		]
	},
	{
		path: 'ra',
		loadComponent: () => import('./features/ra/ra-placeholder/ra-placeholder.component').then(m=>m.RaPlaceholderComponent),
		canActivate: [authGuard, studentGuard]
	},
	{
		path: 'tutor',
		loadComponent: () => import('./features/tutor/chat-placeholder/chat-placeholder.component').then(m=>m.ChatPlaceholderComponent),
		canActivate: [authGuard, studentGuard]
	},

	// Rutas de administración (solo admins)
	{
		path: 'admin',
		canActivate: [authGuard, adminGuard],
		children: [
			{ path: '', redirectTo: '/admin-dashboard', pathMatch: 'full' },
			// Aquí se pueden agregar rutas de admin en el futuro
		]
	},

	// Rutas de profesor (profesores y admins)
	{
		path: 'teacher',
		canActivate: [authGuard, teacherGuard],
		children: [
			{ path: '', redirectTo: '/teacher-dashboard', pathMatch: 'full' },
			// Aquí se pueden agregar rutas de profesor en el futuro
		]
	},

	{ path: '**', redirectTo: '/login' }
];
