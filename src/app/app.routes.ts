import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: 'caida-libre', loadComponent: () => import('./simuladores/caida-libre/caida-libre.component').then(m => m.CaidaLibreComponent) },
	{ path: '', pathMatch: 'full', redirectTo: 'caida-libre' }
];
