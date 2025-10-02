export interface SimulationSummary {
  code: string;
  nombre: string;
  categoria: 'fisica' | 'quimica';
  dificultad: 'básico' | 'intermedio' | 'avanzado';
  ruta: string;
  descripcion: string;
  estado?: 'estable' | 'beta' | 'prototipo';
}

// Interfaz más completa que podría provenir del backend (ejemplo), extendiendo el resumen.
export interface Simulation extends SimulationSummary {
  id?: string;          // ID interno si el backend lo expone
  version?: string;     // Versión de la simulación
  createdAt?: string;   // Fechas en ISO
  updatedAt?: string;
  // Añade aquí campos futuros que el backend devuelva
}
