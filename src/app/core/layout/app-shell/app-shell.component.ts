import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="side">
        <h2>🔬 Laboratorio RA</h2>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            🏠 Inicio
          </a>
          <a routerLink="/fisica" routerLinkActive="active">
            ⚛️ Física
          </a>
          <a routerLink="/ra" routerLinkActive="active">
            🥽 RA
          </a>
          <a routerLink="/tutor" routerLinkActive="active">
            🤖 Tutor IA
          </a>
        </nav>
      </aside>
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles:[`
    .layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    .side {
      width: 220px;
      min-width: 220px;
      background: #1f2330;
      color: #fff;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }

    .side h2 {
      margin: 0 0 10px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    nav a {
      display: block;
      padding: 8px 12px;
      border-radius: 6px;
      color: #cfd3db;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    nav a.active,
    nav a:hover {
      background: #2d3342;
      color: #fff;
      border-color: #4CAF50;
      transform: translateX(2px);
    }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
      overflow-y: auto;
      position: relative;
      padding: 20px;
      min-height: 0; /* Importante para que funcione el flex */
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .layout {
        flex-direction: column;
      }

      .side {
        width: 100%;
        min-width: unset;
        padding: 12px 18px;
      }

      nav {
        flex-direction: row;
        overflow-x: auto;
        gap: 12px;
      }

      nav a {
        white-space: nowrap;
        min-width: 80px;
        text-align: center;
      }

      .main {
        min-height: calc(100vh - 80px);
      }
    }

    /* Mejoras para accesibilidad */
    @media (prefers-reduced-motion: reduce) {
      nav a {
        transition: none;
      }

      nav a:hover {
        transform: none;
      }
    }
  `]
})
export class AppShellComponent {}
