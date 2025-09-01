import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { TelemetryService } from '../../../core/services/telemetry.service';

@Component({
  selector: 'app-campo-electrico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campo-electrico.component.html',
  styleUrls: ['./campo-electrico.component.css'],
})
export class CampoElectricoComponent implements AfterViewInit, OnDestroy {
  // Exponer Math para usar en el template
  Math = Math;

  // Constantes físicas
  readonly k_e = 8.99e9; // Constante de Coulomb en N⋅m²/C²
  readonly q_e = 1.602e-19; // Carga elemental en C

  // Parámetros de las cargas
  charge1 = 1.0; // Carga 1 en μC
  charge2 = -1.0; // Carga 2 en μC
  testCharge = 0.1; // Carga de prueba en μC
  separation = 3.0; // Separación entre cargas en metros

  // Parámetros de la carga de prueba
  testChargeX = 0.0; // Posición X de la carga de prueba
  testChargeY = 0.0; // Posición Y de la carga de prueba
  testChargeVx = 0.0; // Velocidad inicial X
  testChargeVy = 0.0; // Velocidad inicial Y
  testChargeMass = 1e-6; // Masa de la carga de prueba en kg

  // Configuración de visualización
  showFieldLines = true;
  showEquipotentials = true;
  showVectors = true;
  showTrajectory = true;
  fieldLinesCount = 20;
  vectorGridSize = 15;

  // Estado de la simulación
  isRunning = false;
  time = 0;
  deltaTime = 0.016; // 60 FPS
  animationSpeed = 1.0;

  // Resultados calculados
  electricField = { x: 0, y: 0, magnitude: 0 };
  electricPotential = 0;
  forceOnTestCharge = { x: 0, y: 0, magnitude: 0 };
  kineticEnergy = 0;
  potentialEnergy = 0;
  totalEnergy = 0;

  // Referencias a canvas
  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fieldCanvas') fieldCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private charge1Object!: THREE.Mesh;
  private charge2Object!: THREE.Mesh;
  private testChargeObject!: THREE.Mesh;
  private fieldLines: THREE.Line[] = [];
  private vectorField: THREE.ArrowHelper[] = [];
  private trajectoryPoints: THREE.Vector3[] = [];
  private trajectoryLine!: THREE.Line;

  // Canvas 2D para visualización de campo
  private fieldContext!: CanvasRenderingContext2D;

  // Animation frame
  private animationFrame?: number;

  // Historial para gráficos
  private timeHistory: number[] = [];
  private energyHistory: { kinetic: number[], potential: number[], total: number[] } = {
    kinetic: [],
    potential: [],
    total: []
  };

  constructor(private telemetryService: TelemetryService) {}

  ngAfterViewInit() {
    this.initializeScene();
    this.initializeFieldCanvas();
    this.setupEventListeners();
    this.calculateResults();
    this.updateVisualization();
    this.logSimulationStart();
  }

  ngOnDestroy() {
    this.stopSimulation();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initializeScene() {
    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Configurar cámara
    const canvas = this.canvasRef.nativeElement;
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 10);

    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Crear luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Crear cargas
    this.createChargeObjects();

    // Crear sistema de coordenadas
    this.createCoordinateSystem();

    // Crear líneas de campo y vectores
    this.createFieldVisualization();
  }

  private initializeFieldCanvas() {
    const canvas = this.fieldCanvasRef.nativeElement;
    this.fieldContext = canvas.getContext('2d')!;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  private createChargeObjects() {
    // Carga 1 (positiva - roja)
    const charge1Geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const charge1Material = new THREE.MeshPhongMaterial({
      color: this.charge1 > 0 ? 0xff4444 : 0x4444ff,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    this.charge1Object = new THREE.Mesh(charge1Geometry, charge1Material);
    this.charge1Object.position.set(-this.separation / 2, 0, 0);
    this.charge1Object.castShadow = true;
    this.scene.add(this.charge1Object);

    // Añadir signo a la carga 1
    // Simulamos el texto con geometría simple
    const signGeometry = new THREE.PlaneGeometry(0.1, 0.1);
    const signMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const sign1 = new THREE.Mesh(signGeometry, signMaterial);
    sign1.position.copy(this.charge1Object.position);
    sign1.position.z += 0.2;
    this.scene.add(sign1);

    // Carga 2 (negativa - azul)
    const charge2Geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const charge2Material = new THREE.MeshPhongMaterial({
      color: this.charge2 > 0 ? 0xff4444 : 0x4444ff,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    this.charge2Object = new THREE.Mesh(charge2Geometry, charge2Material);
    this.charge2Object.position.set(this.separation / 2, 0, 0);
    this.charge2Object.castShadow = true;
    this.scene.add(this.charge2Object);

    // Carga de prueba (verde)
    const testChargeGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const testChargeMaterial = new THREE.MeshPhongMaterial({
      color: 0x44ff44,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    this.testChargeObject = new THREE.Mesh(testChargeGeometry, testChargeMaterial);
    this.testChargeObject.position.set(this.testChargeX, this.testChargeY, 0);
    this.testChargeObject.castShadow = true;
    this.scene.add(this.testChargeObject);

    // Crear trayectoria
    const trajectoryGeometry = new THREE.BufferGeometry();
    const trajectoryMaterial = new THREE.LineBasicMaterial({
      color: 0x44ff44,
      transparent: true,
      opacity: 0.7
    });
    this.trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    this.scene.add(this.trajectoryLine);
  }

  private createCoordinateSystem() {
    // Ejes de coordenadas
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Grilla
    const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    this.scene.add(gridHelper);
  }

  createFieldVisualization() {
    this.updateFieldLines();
    this.updateVectorField();
  }

  private updateFieldLines() {
    // Limpiar líneas existentes
    this.fieldLines.forEach(line => this.scene.remove(line));
    this.fieldLines = [];

    if (!this.showFieldLines) return;

    // Crear líneas de campo eléctrico
    const charge1Pos = new THREE.Vector2(-this.separation / 2, 0);
    const charge2Pos = new THREE.Vector2(this.separation / 2, 0);

    for (let i = 0; i < this.fieldLinesCount; i++) {
      const angle = (2 * Math.PI * i) / this.fieldLinesCount;
      const startRadius = 0.2;

      // Líneas desde carga positiva
      if (this.charge1 > 0) {
        const startPoint = new THREE.Vector2(
          charge1Pos.x + startRadius * Math.cos(angle),
          charge1Pos.y + startRadius * Math.sin(angle)
        );

        const fieldLine = this.traceFieldLine(startPoint, true);
        if (fieldLine.length > 2) {
          const geometry = new THREE.BufferGeometry().setFromPoints(
            fieldLine.map(p => new THREE.Vector3(p.x, p.y, 0))
          );
          const material = new THREE.LineBasicMaterial({
            color: 0xff6666,
            transparent: true,
            opacity: 0.6
          });
          const line = new THREE.Line(geometry, material);
          this.fieldLines.push(line);
          this.scene.add(line);
        }
      }

      // Líneas hacia carga negativa
      if (this.charge2 < 0) {
        const endPoint = new THREE.Vector2(
          charge2Pos.x + startRadius * Math.cos(angle),
          charge2Pos.y + startRadius * Math.sin(angle)
        );

        const fieldLine = this.traceFieldLine(endPoint, false);
        if (fieldLine.length > 2) {
          const geometry = new THREE.BufferGeometry().setFromPoints(
            fieldLine.map(p => new THREE.Vector3(p.x, p.y, 0))
          );
          const material = new THREE.LineBasicMaterial({
            color: 0x6666ff,
            transparent: true,
            opacity: 0.6
          });
          const line = new THREE.Line(geometry, material);
          this.fieldLines.push(line);
          this.scene.add(line);
        }
      }
    }
  }

  private traceFieldLine(startPoint: THREE.Vector2, forward: boolean): THREE.Vector2[] {
    const points: THREE.Vector2[] = [];
    let currentPoint = startPoint.clone();
    const stepSize = 0.1;
    const maxSteps = 200;

    for (let step = 0; step < maxSteps; step++) {
      points.push(currentPoint.clone());

      const field = this.calculateElectricFieldAt(currentPoint.x, currentPoint.y);
      if (field.magnitude < 1e-6) break;

      const direction = new THREE.Vector2(field.x, field.y).normalize();
      if (!forward) direction.multiplyScalar(-1);

      currentPoint.add(direction.multiplyScalar(stepSize));

      // Verificar si se sale de los límites
      if (Math.abs(currentPoint.x) > 8 || Math.abs(currentPoint.y) > 8) break;

      // Verificar si se acerca demasiado a una carga
      const dist1 = currentPoint.distanceTo(new THREE.Vector2(-this.separation / 2, 0));
      const dist2 = currentPoint.distanceTo(new THREE.Vector2(this.separation / 2, 0));
      if (dist1 < 0.2 || dist2 < 0.2) break;
    }

    return points;
  }

  private updateVectorField() {
    // Limpiar vectores existentes
    this.vectorField.forEach(vector => this.scene.remove(vector));
    this.vectorField = [];

    if (!this.showVectors) return;

    // Crear campo vectorial
    const gridSize = this.vectorGridSize;
    const range = 4;
    const step = (2 * range) / gridSize;

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const x = -range + i * step;
        const y = -range + j * step;

        // Evitar puntos muy cerca de las cargas
        const dist1 = Math.sqrt((x + this.separation/2)**2 + y**2);
        const dist2 = Math.sqrt((x - this.separation/2)**2 + y**2);
        if (dist1 < 0.3 || dist2 < 0.3) continue;

        const field = this.calculateElectricFieldAt(x, y);
        if (field.magnitude < 1e-6) continue;

        const direction = new THREE.Vector3(field.x, field.y, 0).normalize();
        const origin = new THREE.Vector3(x, y, 0);

        // Escalar la longitud del vector según la magnitud del campo
        const length = Math.min(0.3, Math.log10(field.magnitude + 1) * 0.1);

        const arrowHelper = new THREE.ArrowHelper(
          direction,
          origin,
          length,
          0xffff44,
          length * 0.2,
          length * 0.1
        );

        this.vectorField.push(arrowHelper);
        this.scene.add(arrowHelper);
      }
    }
  }

  private calculateElectricFieldAt(x: number, y: number): {x: number, y: number, magnitude: number} {
    // Campo debido a la carga 1
    const r1x = x - (-this.separation / 2);
    const r1y = y - 0;
    const r1_mag = Math.sqrt(r1x * r1x + r1y * r1y);

    if (r1_mag < 1e-10) return { x: 0, y: 0, magnitude: 0 };

    const E1_mag = this.k_e * Math.abs(this.charge1 * 1e-6) / (r1_mag * r1_mag);
    const E1x = E1_mag * (r1x / r1_mag) * Math.sign(this.charge1);
    const E1y = E1_mag * (r1y / r1_mag) * Math.sign(this.charge1);

    // Campo debido a la carga 2
    const r2x = x - (this.separation / 2);
    const r2y = y - 0;
    const r2_mag = Math.sqrt(r2x * r2x + r2y * r2y);

    if (r2_mag < 1e-10) return { x: 0, y: 0, magnitude: 0 };

    const E2_mag = this.k_e * Math.abs(this.charge2 * 1e-6) / (r2_mag * r2_mag);
    const E2x = E2_mag * (r2x / r2_mag) * Math.sign(this.charge2);
    const E2y = E2_mag * (r2y / r2_mag) * Math.sign(this.charge2);

    // Campo total
    const Ex = E1x + E2x;
    const Ey = E1y + E2y;
    const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);

    return { x: Ex, y: Ey, magnitude };
  }

  private calculateElectricPotentialAt(x: number, y: number): number {
    // Potencial debido a la carga 1
    const r1 = Math.sqrt((x - (-this.separation / 2))**2 + y**2);
    const V1 = r1 > 1e-10 ? this.k_e * (this.charge1 * 1e-6) / r1 : 0;

    // Potencial debido a la carga 2
    const r2 = Math.sqrt((x - (this.separation / 2))**2 + y**2);
    const V2 = r2 > 1e-10 ? this.k_e * (this.charge2 * 1e-6) / r2 : 0;

    return V1 + V2;
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Listener para mover la carga de prueba con el mouse
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('click', (event) => this.onCanvasClick(event));
  }

  private onCanvasClick(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Convertir coordenadas de pantalla a mundo
    const vector = new THREE.Vector3(x, y, 0);
    vector.unproject(this.camera);

    this.testChargeX = vector.x;
    this.testChargeY = vector.y;
    this.updateTestChargePosition();
    this.calculateResults();
    this.updateVisualization();
  }

  private onWindowResize() {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const fieldCanvas = this.fieldCanvasRef.nativeElement;
    fieldCanvas.width = fieldCanvas.clientWidth;
    fieldCanvas.height = fieldCanvas.clientHeight;
  }

  updateParameters() {
    this.updateChargeColors();
    this.updateChargePositions();
    this.calculateResults();
    this.updateVisualization();
    this.createFieldVisualization();
  }

  private updateChargeColors() {
    // Actualizar color de la carga 1
    (this.charge1Object.material as THREE.MeshPhongMaterial).color.setHex(
      this.charge1 > 0 ? 0xff4444 : 0x4444ff
    );

    // Actualizar color de la carga 2
    (this.charge2Object.material as THREE.MeshPhongMaterial).color.setHex(
      this.charge2 > 0 ? 0xff4444 : 0x4444ff
    );
  }

  private updateChargePositions() {
    this.charge1Object.position.set(-this.separation / 2, 0, 0);
    this.charge2Object.position.set(this.separation / 2, 0, 0);
  }

  updateTestChargePosition() {
    this.testChargeObject.position.set(this.testChargeX, this.testChargeY, 0);
  }

  startSimulation() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.trajectoryPoints = [];
    this.animate();
    this.logSimulationEvent('start');
  }

  stopSimulation() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.logSimulationEvent('stop');
  }

  resetSimulation() {
    this.stopSimulation();
    this.time = 0;
    this.testChargeX = 0;
    this.testChargeY = 0;
    this.testChargeVx = 0;
    this.testChargeVy = 0;
    this.trajectoryPoints = [];
    this.timeHistory = [];
    this.energyHistory = { kinetic: [], potential: [], total: [] };

    this.updateTestChargePosition();
    this.calculateResults();
    this.updateVisualization();
    this.logSimulationEvent('reset');
  }

  private animate() {
    if (!this.isRunning) return;

    this.updatePhysics();
    this.updateTestChargePosition();
    this.updateTrajectory();
    this.calculateResults();
    this.updateVisualization();
    this.drawFieldVisualization();

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  private updatePhysics() {
    const dt = this.deltaTime * this.animationSpeed;

    // Calcular fuerza sobre la carga de prueba
    const field = this.calculateElectricFieldAt(this.testChargeX, this.testChargeY);
    const forceX = this.testCharge * 1e-6 * field.x;
    const forceY = this.testCharge * 1e-6 * field.y;

    // Integración usando Verlet
    const ax = forceX / this.testChargeMass;
    const ay = forceY / this.testChargeMass;

    this.testChargeVx += ax * dt;
    this.testChargeVy += ay * dt;

    this.testChargeX += this.testChargeVx * dt;
    this.testChargeY += this.testChargeVy * dt;

    // Agregar punto a la trayectoria
    this.trajectoryPoints.push(new THREE.Vector3(this.testChargeX, this.testChargeY, 0));

    // Limitar número de puntos
    if (this.trajectoryPoints.length > 1000) {
      this.trajectoryPoints.shift();
    }

    this.time += dt;

    // Guardar datos para gráficos
    this.timeHistory.push(this.time);
    this.energyHistory.kinetic.push(this.kineticEnergy);
    this.energyHistory.potential.push(this.potentialEnergy);
    this.energyHistory.total.push(this.totalEnergy);

    if (this.timeHistory.length > 500) {
      this.timeHistory.shift();
      this.energyHistory.kinetic.shift();
      this.energyHistory.potential.shift();
      this.energyHistory.total.shift();
    }
  }

  private updateTrajectory() {
    if (!this.showTrajectory || this.trajectoryPoints.length < 2) return;

    const geometry = new THREE.BufferGeometry().setFromPoints(this.trajectoryPoints);
    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = geometry;
  }

  calculateResults() {
    // Campo eléctrico en la posición de la carga de prueba
    this.electricField = this.calculateElectricFieldAt(this.testChargeX, this.testChargeY);

    // Potencial eléctrico
    this.electricPotential = this.calculateElectricPotentialAt(this.testChargeX, this.testChargeY);

    // Fuerza sobre la carga de prueba
    this.forceOnTestCharge = {
      x: this.testCharge * 1e-6 * this.electricField.x,
      y: this.testCharge * 1e-6 * this.electricField.y,
      magnitude: this.testCharge * 1e-6 * this.electricField.magnitude
    };

    // Energías
    this.kineticEnergy = 0.5 * this.testChargeMass * (this.testChargeVx**2 + this.testChargeVy**2);
    this.potentialEnergy = this.testCharge * 1e-6 * this.electricPotential;
    this.totalEnergy = this.kineticEnergy + this.potentialEnergy;
  }

  private updateVisualization() {
    this.renderer.render(this.scene, this.camera);
  }

  private drawFieldVisualization() {
    if (!this.fieldContext) return;

    const canvas = this.fieldCanvasRef.nativeElement;
    this.fieldContext.clearRect(0, 0, canvas.width, canvas.height);

    if (this.showEquipotentials) {
      this.drawEquipotentialLines();
    }
  }

  private drawEquipotentialLines() {
    const canvas = this.fieldCanvasRef.nativeElement;
    const ctx = this.fieldContext;

    // Dibujar líneas equipotenciales
    const numLines = 15;
    const range = 4;
    const resolution = 2;

    for (let line = 0; line < numLines; line++) {
      const targetPotential = (-5 + (line * 10) / numLines) * 1000; // Rango de potenciales

      ctx.strokeStyle = `hsl(${240 + line * 12}, 70%, 60%)`;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();

      let pathStarted = false;

      for (let x = -range; x <= range; x += resolution / canvas.width * 8) {
        for (let y = -range; y <= range; y += resolution / canvas.height * 8) {
          const potential = this.calculateElectricPotentialAt(x, y);

          if (Math.abs(potential - targetPotential) < Math.abs(targetPotential) * 0.1) {
            const screenX = ((x + range) / (2 * range)) * canvas.width;
            const screenY = canvas.height - ((y + range) / (2 * range)) * canvas.height;

            if (!pathStarted) {
              ctx.moveTo(screenX, screenY);
              pathStarted = true;
            } else {
              ctx.lineTo(screenX, screenY);
            }
          }
        }
      }

      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  toggleFieldLines() {
    this.showFieldLines = !this.showFieldLines;
    this.createFieldVisualization();
  }

  toggleEquipotentials() {
    this.showEquipotentials = !this.showEquipotentials;
  }

  toggleVectors() {
    this.showVectors = !this.showVectors;
    this.createFieldVisualization();
  }

  toggleTrajectory() {
    this.showTrajectory = !this.showTrajectory;
  }

  private logSimulationStart() {
    this.telemetryService.startSession('campo-electrico');
    this.telemetryService.event('campo_electrico_simulation_start', {
      charge1: this.charge1,
      charge2: this.charge2,
      separation: this.separation,
      testCharge: this.testCharge
    });
  }

  private logSimulationEvent(event: string) {
    this.telemetryService.event(`campo_electrico_${event}`, {
      time: this.time,
      energy: this.totalEnergy
    });
  }
}
