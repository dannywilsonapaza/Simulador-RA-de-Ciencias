import { Injectable } from '@angular/core';
import { SimulationSummary } from '../models/simulation.model';

@Injectable({ providedIn: 'root' })
export class SimulationRegistryService {
  private sims: SimulationSummary[] = [
    { code: 'caida-libre', nombre: 'Caída Libre', categoria: 'fisica', dificultad: 'básico', ruta: '/fisica/caida-libre', descripcion: 'Explora la aceleración gravitatoria', estado: 'estable' },
    { code: 'tiro-parabolico', nombre: 'Tiro Parabólico', categoria: 'fisica', dificultad: 'intermedio', ruta: '/fisica/tiro-parabolico', descripcion: 'Movimiento en dos dimensiones', estado: 'estable' },
    { code: 'pendulo-simple', nombre: 'Péndulo Simple', categoria: 'fisica', dificultad: 'intermedio', ruta: '/fisica/pendulo-simple', descripcion: 'Movimiento armónico simple y conservación de energía', estado: 'estable' }
  ];
  getSimulations(cat?: 'fisica' | 'quimica') { return cat ? this.sims.filter(s=>s.categoria===cat) : this.sims; }
  getByCode(code: string) { return this.sims.find(s=>s.code===code); }
}
