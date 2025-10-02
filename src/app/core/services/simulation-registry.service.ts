import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Simulation, SimulationSummary } from '../models/simulation.model';

@Injectable({ providedIn: 'root' })
export class SimulationRegistryService {
  private api = inject(ApiService);

  // Fallback local para cuando no haya backend disponible (desarrollo offline)
  private local: SimulationSummary[] = [
    { code: 'caida-libre', nombre: 'Caída Libre', categoria: 'fisica', dificultad: 'básico', ruta: '/fisica/caida-libre', descripcion: 'Explora la aceleración gravitatoria', estado: 'estable' },
    { code: 'tiro-parabolico', nombre: 'Tiro Parabólico', categoria: 'fisica', dificultad: 'intermedio', ruta: '/fisica/tiro-parabolico', descripcion: 'Movimiento en dos dimensiones', estado: 'estable' },
    { code: 'pendulo-simple', nombre: 'Péndulo Simple', categoria: 'fisica', dificultad: 'intermedio', ruta: '/fisica/pendulo-simple', descripcion: 'Movimiento armónico simple y conservación de energía', estado: 'estable' },
    { code: 'masa-resorte', nombre: 'Sistema Masa-Resorte', categoria: 'fisica', dificultad: 'intermedio', ruta: '/fisica/masa-resorte', descripcion: 'Oscilaciones verticales con efectos gravitatorios y amortiguamiento', estado: 'estable' },
    { code: 'campo-electrico', nombre: 'Campo Eléctrico', categoria: 'fisica', dificultad: 'avanzado', ruta: '/fisica/campo-electrico', descripcion: 'Interacciones electroestáticas entre cargas puntuales y visualización de campos', estado: 'estable' }
  ];

  listExperiments(cat?: 'fisica' | 'quimica'): Observable<SimulationSummary[]> {
    return this.api.get<Simulation[] | SimulationSummary[]>('experiments').pipe(
      map(list => Array.isArray(list) ? list : []),
      map(list => cat ? list.filter(s => s.categoria === cat) : list),
      catchError(() => of(cat ? this.local.filter(s => s.categoria === cat) : this.local))
    );
  }

  getExperiment(code: string): Observable<Simulation | SimulationSummary | undefined> {
    return this.api.get<Simulation>(`experiments/${code}`).pipe(
      catchError(() => of(this.local.find(s => s.code === code)))
    );
  }

  saveResult<T = unknown>(payload: unknown): Observable<T> {
    return this.api.post<T>('results', payload);
  }
}
