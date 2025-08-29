import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="app-wrapper">
      <div class="main-content-wrapper">
        <!-- Header responsivo -->
        <header class="flex items-center justify-between px-4 md:px-8 py-6 border-b border-white/10">
          <h1 class="text-2xl md:text-3xl font-bold">Laboratorio Virtual RA</h1>
          <div class="hidden md:block text-sm opacity-80">
            Simulaciones de Física con Realidad Aumentada
          </div>
        </header>

        <!-- Contenido principal -->
        <main class="flex-1 container mx-auto px-4 md:px-8 py-8">
          <div class="max-w-4xl mx-auto">
            <!-- Descripción -->
            <div class="text-center mb-8">
              <p class="text-lg md:text-xl opacity-90 mb-4">
                Selecciona un área para comenzar tu experiencia de aprendizaje
              </p>
              <div class="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
            </div>

            <!-- Grid responsivo de opciones -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <!-- Simulaciones de Física -->
              <a routerLink="/fisica" class="navigation-card group">
                <div class="card-icon">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 class="card-title">Simulaciones de Física</h3>
                <p class="card-description">
                  Experimenta con caída libre, movimiento parabólico y péndulo simple
                </p>
                <div class="card-features">
                  <span class="feature-tag">3D</span>
                  <span class="feature-tag">Interactivo</span>
                  <span class="feature-tag">Tiempo Real</span>
                </div>
              </a>

              <!-- Modo RA -->
              <a routerLink="/ra" class="navigation-card group">
                <div class="card-icon">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="card-title">Modo RA</h3>
                <p class="card-description">
                  Realidad aumentada para una experiencia inmersiva de aprendizaje
                </p>
                <div class="card-features">
                  <span class="feature-tag">AR</span>
                  <span class="feature-tag">Cámara</span>
                  <span class="feature-tag">Próximamente</span>
                </div>
              </a>

              <!-- Tutor IA -->
              <a routerLink="/tutor" class="navigation-card group md:col-span-2 lg:col-span-1">
                <div class="card-icon">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 class="card-title">Tutor IA</h3>
                <p class="card-description">
                  Asistente inteligente para resolver dudas y guiar tu aprendizaje
                </p>
                <div class="card-features">
                  <span class="feature-tag">IA</span>
                  <span class="feature-tag">Chat</span>
                  <span class="feature-tag">24/7</span>
                </div>
              </a>
            </div>

            <!-- Stats section responsive -->
            <div class="mt-12 pt-8 border-t border-white/10">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div class="stat-item">
                  <div class="stat-number">3</div>
                  <div class="stat-label">Simulaciones</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">100%</div>
                  <div class="stat-label">Interactivo</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">AR</div>
                  <div class="stat-label">Tecnología</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">∞</div>
                  <div class="stat-label">Posibilidades</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Navigation Cards */
    .navigation-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      text-decoration: none;
      color: #ffffff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 280px;
    }

    .navigation-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(139, 69, 255, 0.1), rgba(59, 130, 246, 0.1));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .navigation-card:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(139, 69, 255, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .navigation-card:hover::before {
      opacity: 1;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #8b45ff, #3b82f6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
    }

    .navigation-card:hover .card-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }

    .card-description {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }

    .card-features {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .feature-tag {
      background: rgba(139, 69, 255, 0.2);
      border: 1px solid rgba(139, 69, 255, 0.3);
      color: #c084fc;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Stats */
    .stat-item {
      padding: 1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b45ff, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Utility classes específicas */
    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }

    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .font-bold {
      font-weight: 700;
    }

    .font-weight-600 {
      font-weight: 600;
    }

    .opacity-80 {
      opacity: 0.8;
    }

    .opacity-90 {
      opacity: 0.9;
    }

    .border-b {
      border-bottom-width: 1px;
    }

    .border-t {
      border-top-width: 1px;
    }

    .border-white\/10 {
      border-color: rgba(255, 255, 255, 0.1);
    }

    .w-16 {
      width: 4rem;
    }

    .h-0\.5 {
      height: 0.125rem;
    }

    .w-8 {
      width: 2rem;
    }

    .h-8 {
      height: 2rem;
    }

    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops));
    }

    .from-purple-500 {
      --tw-gradient-from: #8b5cf6;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0));
    }

    .to-blue-500 {
      --tw-gradient-to: #3b82f6;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .navigation-card {
        min-height: 240px;
        padding: 1.5rem;
      }

      .card-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
      }

      .card-title {
        font-size: 1.125rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .navigation-card {
        min-height: 200px;
        padding: 1.25rem;
      }

      .feature-tag {
        font-size: 0.625rem;
        padding: 0.1875rem 0.5rem;
      }
    }
  `]
})
export class HomeComponent {}
