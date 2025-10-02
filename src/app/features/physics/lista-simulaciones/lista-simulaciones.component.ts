import { Component, OnInit, signal, computed } from '@angular/core';
import { SimulationRegistryService } from '../../../core/services/simulation-registry.service';
import { CardSimComponent } from '../../../shared/components/card-sim/card-sim.component';
import { NgFor, NgIf } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-lista-simulaciones',
  imports: [CardSimComponent, NgFor, NgIf],
  template: `
    <h1>Simulaciones de Física</h1>
    <section *ngIf="loading()">Cargando simulaciones...</section>
    <section *ngIf="error()" class="error">Error cargando simulaciones</section>
    <div class="grid" *ngIf="!loading() && !error()">
      <app-card-sim *ngFor="let s of sims()" [simulation]="s" />
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        margin-top: 16px;
      }
      .error { color: #c00; margin: 8px 0; }
    `,
  ],
})
export class ListaSimulacionesComponent implements OnInit {
  sims = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<boolean>(false);

  // Computado opcional para contar
  total = computed(() => this.sims().length);

  constructor(private registry: SimulationRegistryService) {}

  ngOnInit() {
    this.fetch();
  }

  private fetch() {
    this.loading.set(true);
    this.error.set(false);
    this.registry.listExperiments('fisica').subscribe({
      next: sims => {
        this.sims.set(sims);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}
