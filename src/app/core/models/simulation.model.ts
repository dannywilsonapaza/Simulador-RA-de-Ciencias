export interface SimulationSummary {
  code: string;
  nombre: string;
  categoria: 'fisica' | 'quimica';
  dificultad: 'básico' | 'intermedio' | 'avanzado';
  ruta: string;
  descripcion: string;
  estado?: 'estable' | 'beta' | 'prototipo';
}
