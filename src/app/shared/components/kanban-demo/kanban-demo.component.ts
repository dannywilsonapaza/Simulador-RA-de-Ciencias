import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  type: 'task' | 'bug' | 'feature';
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-kanban-demo',
  imports: [CommonModule],
  template: `
    <div class="board-wrapper">
      <!-- Board Header -->
      <div class="board-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold">Proyecto de Simulaciones</h2>
            <span class="text-sm opacity-70">Mostrando todas las actividades</span>
          </div>

          <!-- Header Controls -->
          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="search-container">
              <svg class="search-icon" fill="none" viewBox="0 0 16 16">
                <path fill="currentcolor" fill-rule="evenodd"
                      d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M1 7a6 6 0 1 1 10.74 3.68l3.29 3.29-1.06 1.06-3.29-3.29A6 6 0 0 1 1 7"
                      clip-rule="evenodd"></path>
              </svg>
              <input type="text" placeholder="Buscar tareas..." class="search-input">
            </div>

            <!-- Filter Button -->
            <button class="filter-button">
              <span>Filtro</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path fill="currentcolor"
                      d="m14.53 6.03-6 6a.75.75 0 0 1-1.004.052l-.056-.052-6-6 1.06-1.06L8 10.44l5.47-5.47z"></path>
              </svg>
            </button>

            <!-- Group Button -->
            <button class="group-button">
              <span>Grupo: Estado</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Board Content -->
      <div class="board-content">
        <div class="board-columns-container">
          <div *ngFor="let column of columns; trackBy: trackByColumnId"
               class="board-column"
               [style.border-top]="'3px solid ' + column.color">

            <!-- Column Header -->
            <div class="board-column-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <h3 class="column-title">{{ column.title }}</h3>
                  <span class="task-count">{{ column.cards.length }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Collapse button -->
                  <button class="icon-button" [attr.aria-label]="'Contraer ' + column.title">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                      <path fill="currentcolor" fill-rule="evenodd"
                            d="M6.25 8.75H0v-1.5h6.25zm3.5-1.5H16v1.5H9.75z"
                            clip-rule="evenodd"></path>
                      <path fill="currentcolor" fill-rule="evenodd"
                            d="M5.19 8 2.22 5.03l1.06-1.06 3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5-1.06-1.06zm4.03-.53 3.5-3.5 1.06 1.06L10.81 8l2.97 2.97-1.06 1.06-3.5-3.5a.75.75 0 0 1 0-1.06"
                            clip-rule="evenodd"></path>
                    </svg>
                  </button>

                  <!-- Menu button -->
                  <button class="icon-button" [attr.aria-label]="'Acciones de columna en ' + column.title">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                      <path fill="currentcolor" fill-rule="evenodd"
                            d="M0 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m6.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0M13 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0"
                            clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Column Content -->
            <div class="board-column-content">
              <!-- Cards -->
              <div *ngFor="let card of column.cards; trackBy: trackByCardId" class="kanban-card">
                <div class="card-content">
                  <!-- Card Header -->
                  <div class="flex items-start justify-between mb-3">
                    <h4 class="card-title">{{ card.title }}</h4>
                    <button class="icon-button card-menu" [attr.aria-label]="'Acciones para ' + card.title">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                        <path fill="currentcolor" fill-rule="evenodd"
                              d="M0 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m6.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0M13 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0"
                              clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </div>

                  <!-- Card Description -->
                  <p class="card-description">{{ card.description }}</p>

                  <!-- Card Footer -->
                  <div class="card-footer">
                    <!-- Assignee -->
                    <div class="assignee-badge">
                      {{ card.assignee }}
                    </div>

                    <!-- Meta info -->
                    <div class="flex items-center gap-2">
                      <!-- Type icon -->
                      <div class="type-icon" [ngClass]="'type-' + card.type">
                        <svg *ngIf="card.type === 'task'" class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm2 0v12h8V2H4z"/>
                        </svg>
                        <svg *ngIf="card.type === 'bug'" class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4.355.522a.5.5 0 01.623.333l.291.956A4.979 4.979 0 008 1c1.007 0 1.946.298 2.731.811l.291-.956a.5.5 0 11.957.29l-.41 1.352A4.985 4.985 0 0113 6h.5a.5.5 0 010 1H13v1h1.5a.5.5 0 010 1H13v1h.5a.5.5 0 010 1H13a5 5 0 01-10 0h-.5a.5.5 0 010-1H3V9H1.5a.5.5 0 010-1H3V7h-.5a.5.5 0 010-1H3c0-1.364.547-2.601 1.432-3.503l-.41-1.352a.5.5 0 01.333-.623zM4 7v4a4 4 0 008 0V7a4 4 0 00-8 0z"/>
                        </svg>
                        <svg *ngIf="card.type === 'feature'" class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z"/>
                          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 002.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 001.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 00-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 00-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 00-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 001.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 003.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 002.692-1.115l.094-.319z"/>
                        </svg>
                      </div>

                      <!-- Card ID -->
                      <span class="card-id">{{ card.id }}</span>

                      <!-- Priority indicator -->
                      <div class="priority-indicator" [ngClass]="'priority-' + card.priority"></div>

                      <!-- Avatar -->
                      <div class="avatar">
                        {{ getInitials(card.assignee) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add card button -->
              <button class="add-card-button">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 16 16">
                  <path fill="currentcolor" fill-rule="evenodd"
                        d="M7.25 8.75V15h1.5V8.75H15v-1.5H8.75V1h-1.5v6.25H1v1.5z"
                        clip-rule="evenodd"></path>
                </svg>
                <span>Crear</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Board Wrapper */
    .board-wrapper {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #0f1419;
      color: white;
    }

    /* Board Header */
    .board-header {
      flex-shrink: 0;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
    }

    /* Search Container */
    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      max-width: 200px;
    }

    .search-icon {
      width: 16px;
      height: 16px;
      margin-right: 0.5rem;
      opacity: 0.6;
      flex-shrink: 0;
    }

    .search-input {
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-size: 0.875rem;
      width: 100%;
      min-width: 0;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Buttons */
    .filter-button,
    .group-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      color: white;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-button:hover,
    .group-button:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .icon-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 4px;
      padding: 0.375rem;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .icon-button:hover {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }

    /* Board Content */
    .board-content {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .board-columns-container {
      display: flex;
      height: 100%;
      gap: 1rem;
      padding: 1rem;
      min-width: max-content;
    }

    /* Board Column */
    .board-column {
      flex: 0 0 300px;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      max-height: calc(100vh - 120px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .board-column-header {
      flex-shrink: 0;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .column-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      margin: 0;
    }

    .task-count {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .board-column-content {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Kanban Cards */
    .kanban-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .kanban-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-content {
      width: 100%;
    }

    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      margin: 0;
      line-height: 1.3;
      word-wrap: break-word;
    }

    .card-description {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0.5rem 0 1rem 0;
      line-height: 1.4;
    }

    .card-menu {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .kanban-card:hover .card-menu {
      opacity: 1;
    }

    /* Card Footer */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }

    .assignee-badge {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Type Icons */
    .type-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .type-task {
      color: #3b82f6;
    }

    .type-bug {
      color: #ef4444;
    }

    .type-feature {
      color: #10b981;
    }

    /* Card ID */
    .card-id {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }

    /* Priority Indicators */
    .priority-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .priority-low {
      background-color: #10b981;
    }

    .priority-medium {
      background-color: #f59e0b;
    }

    .priority-high {
      background-color: #ef4444;
    }

    /* Avatar */
    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b45ff, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 600;
      color: white;
    }

    /* Add Card Button */
    .add-card-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: transparent;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1rem;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }

    .add-card-button:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);
    }

    /* Utility Classes */
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .font-bold { font-weight: 700; }
    .opacity-70 { opacity: 0.7; }

    /* Responsive Design */
    @media (max-width: 768px) {
      .board-header {
        padding: 1rem;
      }

      .search-container {
        max-width: 150px;
      }

      .board-columns-container {
        padding: 0.5rem;
        gap: 0.5rem;
      }

      .board-column {
        flex: 0 0 280px;
      }

      .filter-button span,
      .group-button span {
        display: none;
      }

      .filter-button,
      .group-button {
        padding: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .board-column {
        flex: 0 0 260px;
      }

      .kanban-card {
        padding: 0.75rem;
      }

      .search-container {
        max-width: 120px;
      }
    }

    /* Scrollbar Styling */
    .board-content::-webkit-scrollbar,
    .board-column-content::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }

    .board-content::-webkit-scrollbar-track,
    .board-column-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .board-content::-webkit-scrollbar-thumb,
    .board-column-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .board-content::-webkit-scrollbar-thumb:hover,
    .board-column-content::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class KanbaDemoComponent {
  columns: KanbanColumn[] = [
    {
      id: 'backlog',
      title: 'Backlog',
      color: '#6b7280',
      cards: []
    },
    {
      id: 'todo',
      title: 'Por Hacer',
      color: '#3b82f6',
      cards: [
        {
          id: 'SIM-1',
          title: 'Implementar simulación de caída libre',
          description: 'Crear la simulación 3D con Three.js para mostrar la caída libre de objetos',
          assignee: 'Danny Wilson',
          priority: 'high',
          type: 'feature'
        }
      ]
    },
    {
      id: 'inprogress',
      title: 'En Progreso',
      color: '#f59e0b',
      cards: [
        {
          id: 'SIM-2',
          title: 'Mejorar interfaz de usuario',
          description: 'Actualizar los estilos y hacer la aplicación más responsiva',
          assignee: 'Alex Developer',
          priority: 'medium',
          type: 'task'
        },
        {
          id: 'SIM-3',
          title: 'Corregir bug en gráfico de energía',
          description: 'El gráfico de energía no se muestra correctamente en el péndulo',
          assignee: 'Maria Tester',
          priority: 'high',
          type: 'bug'
        }
      ]
    },
    {
      id: 'review',
      title: 'En Revisión',
      color: '#8b5cf6',
      cards: [
        {
          id: 'SIM-4',
          title: 'Documentación de API',
          description: 'Crear documentación completa para las funciones de simulación',
          assignee: 'Doc Writer',
          priority: 'low',
          type: 'task'
        }
      ]
    },
    {
      id: 'done',
      title: 'Completado',
      color: '#10b981',
      cards: [
        {
          id: 'SIM-5',
          title: 'Setup inicial del proyecto',
          description: 'Configuración de Angular, Three.js y estructura base',
          assignee: 'Danny Wilson',
          priority: 'high',
          type: 'task'
        }
      ]
    }
  ];

  trackByColumnId(index: number, column: KanbanColumn): string {
    return column.id;
  }

  trackByCardId(index: number, card: KanbanCard): string {
    return card.id;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
