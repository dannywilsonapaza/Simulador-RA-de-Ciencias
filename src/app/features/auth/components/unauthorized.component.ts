import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-unauthorized',
  imports: [CommonModule],
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .unauthorized-card {
      background: white;
      border-radius: 15px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      font-size: 4rem;
      color: #e74c3c;
      margin-bottom: 20px;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 2rem;
    }

    p {
      color: #7f8c8d;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .btn-back {
      background: #3498db;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .btn-back:hover {
      background: #2980b9;
    }
  `],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="error-icon">
          <i class="fas fa-ban"></i>
        </div>
        <h1>Acceso Denegado</h1>
        <p>
          No tienes permisos suficientes para acceder a esta página.
          Si crees que esto es un error, contacta al administrador.
        </p>
        <button class="btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Volver al Inicio
        </button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
