import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.css'
})
export class AuthenticatedLayoutComponent {
  constructor(private router: Router) {}

  logout(): void {
    // Limpiar datos de sesión si los hay
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('blockUntil');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
