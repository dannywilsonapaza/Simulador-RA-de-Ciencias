import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
	{ path: 'fisica', children: [
			{ path: '', loadComponent: () => import('./features/physics/lista-simulaciones/lista-simulaciones.component').then(m=>m.ListaSimulacionesComponent) },
			{ path: 'caida-libre', loadComponent: () => import('./features/physics/caida-libre/caida-libre.component').then(m=>m.CaidaLibreComponent) },
			{ path: 'tiro-parabolico', loadComponent: () => import('./features/physics/tiro-parabolico/tiro-parabolico.component').then(m=>m.TiroParabolicoComponent) },
			{ path: 'pendulo-simple', loadComponent: () => import('./features/physics/pendulo-simple/pendulo-simple.component').then(m=>m.PenduloSimpleComponent) },
			{ path: 'masa-resorte', loadComponent: () => import('./features/physics/masa-resorte/masa-resorte.component').then(m=>m.MasaResorteComponent) },
			{ path: 'campo-electrico', loadComponent: () => import('./features/physics/campo-electrico/campo-electrico.component').then(m=>m.CampoElectricoComponent) }
		]},
	{ path: 'ra', loadComponent: () => import('./features/ra/ra-placeholder/ra-placeholder.component').then(m=>m.RaPlaceholderComponent) },
	{ path: 'tutor', loadComponent: () => import('./features/tutor/chat-placeholder/chat-placeholder.component').then(m=>m.ChatPlaceholderComponent) },
	{ path: '**', redirectTo: '' }
];
