import { Component, signal } from '@angular/core';
import { SimulationRegistryService } from '../../../core/services/simulation-registry.service';
import { CardSimComponent } from '../../../shared/components/card-sim/card-sim.component';
import { NgFor } from '@angular/common';
@Component({
  standalone:true,selector:'app-lista-simulaciones',imports:[CardSimComponent,NgFor],
  template:`<h1>Simulaciones de Física</h1><div class="grid"><app-card-sim *ngFor="let s of sims()" [simulation]="s"/></div>`,
  styles:[`.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));margin-top:16px}`]
})
export class ListaSimulacionesComponent {
  sims = signal([] as any[]);
  constructor(private registry: SimulationRegistryService){
    this.sims.set(this.registry.getSimulations('fisica'));
  }
}
