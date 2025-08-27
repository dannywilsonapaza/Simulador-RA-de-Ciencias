import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { TelemetryService } from '../../../core/services/telemetry.service';

@Component({
  selector: 'app-tiro-parabolico',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './tiro-parabolico.component.html',
  styleUrls: ['./tiro-parabolico.component.css'],
})
export class TiroParabolicoComponent implements AfterViewInit, OnDestroy {
  // Parámetros de la simulación
  initialVelocity = 20; // m/s
  angle = 45; // grados
  gravity = 9.8; // m/s²
  mass = 5; // kg
  height = 0; // altura inicial en metros

  // Resultados calculados
  flightTime = 0;
  maxHeight = 0;
  range = 0;
  maxVelocity = 0;
  kineticEnergy = 0;

  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private projectile!: THREE.Mesh;
  private trajectory!: THREE.Line;
  private animationId?: number;

  // Simulación
  isSimulating = false;
  private startTime = 0;
  private trajectoryPoints: THREE.Vector3[] = [];

  // Escalado dinámico
  private scale = 1;
  private maxViewDistance = 50; // Distancia máxima visible en la escena
  private floor!: THREE.Mesh;
  private axesHelper!: THREE.AxesHelper;
  private gridHelper!: THREE.GridHelper;

  constructor(private telemetry: TelemetryService) {}

  ngAfterViewInit() {
    this.telemetry.startSession('tiro-parabolico');
    // Pequeño retraso para asegurar que el canvas esté completamente renderizado
    setTimeout(() => {
      this.initThree();
      this.calculateTrajectory();
      this.resetSimulation();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
    this.telemetry.endSession();
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;

    if (!container) {
      console.error('No se pudo encontrar el contenedor del canvas');
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    // La posición inicial se ajustará dinámicamente en calculateTrajectory()
    this.camera.position.set(20, 15, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Iluminación
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Suelo (terreno) - inicialmente grande
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: 0x228B22,
        metalness: 0.1,
        roughness: 0.8,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Proyectil (esfera)
    this.projectile = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xff4444,
        metalness: 0.3,
        roughness: 0.4,
      })
    );
    this.projectile.castShadow = true;
    this.scene.add(this.projectile);

    // Helpers
    this.axesHelper = new THREE.AxesHelper(10);
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
    this.scene.add(this.gridHelper);

    // Event listeners
    window.addEventListener('resize', this.onResize);

    // Renderizado inicial
    console.log('Three.js inicializado para tiro parabólico');
    this.renderFrame();
  }

  private onResize = () => {
    if (!this.renderer || !this.canvasRef) return;
    const c = this.canvasRef.nativeElement;

    const rect = c.parentElement?.getBoundingClientRect();
    if (rect) {
      this.renderer.setSize(rect.width, rect.height);
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
      this.renderFrame();
    }
  };

  private calculateTrajectory() {
    const angleRad = (this.angle * Math.PI) / 180;
    const vx = this.initialVelocity * Math.cos(angleRad);
    const vy = this.initialVelocity * Math.sin(angleRad);

    // Calcular tiempo de vuelo
    this.flightTime = (2 * vy + Math.sqrt(4 * vy * vy + 8 * this.gravity * this.height)) / (2 * this.gravity);

    // Calcular altura máxima
    this.maxHeight = this.height + (vy * vy) / (2 * this.gravity);

    // Calcular alcance
    this.range = vx * this.flightTime;

    // Calcular escala dinámica basada en el alcance y altura máxima
    const maxDimension = Math.max(this.range, this.maxHeight * 2);
    // Ajustar escala para mantener la simulación visible pero no demasiado pequeña
    if (maxDimension > this.maxViewDistance) {
      this.scale = this.maxViewDistance / maxDimension;
    } else if (maxDimension < this.maxViewDistance * 0.3) {
      // Si es muy pequeño, escalar hacia arriba para mejor visualización
      this.scale = Math.min(3, (this.maxViewDistance * 0.5) / maxDimension);
    } else {
      this.scale = 1;
    }

    // Velocidad máxima (al inicio)
    this.maxVelocity = this.initialVelocity;

    // Energía cinética inicial
    this.kineticEnergy = 0.5 * this.mass * this.initialVelocity * this.initialVelocity;

    // Generar puntos de la trayectoria escalada
    this.trajectoryPoints = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (this.flightTime * i) / steps;
      const x = vx * t * this.scale;
      const y = (this.height + vy * t - 0.5 * this.gravity * t * t) * this.scale;

      if (y >= 0) {
        this.trajectoryPoints.push(new THREE.Vector3(x, y, 0));
      }
    }

    this.updateTrajectoryLine();
    this.updateSceneElements();
    this.updateProjectileScale();
    this.updateCameraPosition();
  }

  private updateTrajectoryLine() {
    // Remover línea anterior si existe
    if (this.trajectory) {
      this.scene.remove(this.trajectory);
    }

    // Crear nueva línea de trayectoria
    const geometry = new THREE.BufferGeometry().setFromPoints(this.trajectoryPoints);
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 3,
      transparent: true,
      opacity: 0.7
    });

    this.trajectory = new THREE.Line(geometry, material);
    this.scene.add(this.trajectory);
  }

  startSimulation() {
    if (this.isSimulating) return;

    this.calculateTrajectory();
    this.isSimulating = true;
    this.startTime = performance.now();

    this.telemetry.event('start_simulation', {
      v0: this.initialVelocity,
      angle: this.angle,
      g: this.gravity,
      m: this.mass,
      h: this.height,
    });

    this.animate();
  }

  resetSimulation() {
    this.isSimulating = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;

    if (this.projectile) {
      this.projectile.position.set(0, this.height * this.scale, 0);
      this.projectile.rotation.set(0, 0, 0);
    }

    this.calculateTrajectory();
    this.renderFrame();
  }

  onParamChange() {
    if (!this.isSimulating) {
      this.calculateTrajectory();
      this.resetSimulation();
    }
  }

  private animate = () => {
    if (!this.isSimulating) return;

    const elapsed = (performance.now() - this.startTime) / 1000;

    if (elapsed >= this.flightTime) {
      // Simulación terminada
      const finalX = this.range * this.scale;
      this.projectile.position.set(finalX, 0, 0);
      this.isSimulating = false;
      this.telemetry.event('end_projectile_motion', { t: elapsed });
      this.renderFrame();
      return;
    }

    // Calcular posición actual
    const angleRad = (this.angle * Math.PI) / 180;
    const vx = this.initialVelocity * Math.cos(angleRad);
    const vy = this.initialVelocity * Math.sin(angleRad);

    const x = vx * elapsed * this.scale;
    const y = (this.height + vy * elapsed - 0.5 * this.gravity * elapsed * elapsed) * this.scale;

    this.projectile.position.set(x, Math.max(y, 0), 0);

    // Rotación del proyectil
    this.projectile.rotation.x += 0.1;
    this.projectile.rotation.y += 0.05;

    this.renderFrame();
    this.animationId = requestAnimationFrame(this.animate);
  };

  private renderFrame() {
    if (!this.renderer || !this.scene || !this.camera) {
      console.warn('Renderer, scene o camera no están inicializados');
      return;
    }
    this.renderer.render(this.scene, this.camera);
  }

  private updateCameraPosition() {
    if (!this.camera) return;

    const scaledRange = this.range * this.scale;
    const scaledMaxHeight = this.maxHeight * this.scale;

    // Calcular posición óptima de la cámara
    const cameraX = scaledRange * 0.6;
    const cameraY = Math.max(10, scaledMaxHeight * 1.5);
    const cameraZ = Math.max(20, scaledRange * 0.8);

    this.camera.position.set(cameraX, cameraY, cameraZ);
    this.camera.lookAt(scaledRange * 0.5, scaledMaxHeight * 0.3, 0);
  }

  private updateSceneElements() {
    if (!this.scene || !this.floor || !this.axesHelper || !this.gridHelper) return;

    const scaledRange = this.range * this.scale;
    const scaledMaxHeight = this.maxHeight * this.scale;

    // Actualizar suelo
    this.scene.remove(this.floor);
    const floorSize = Math.max(100, scaledRange * 2);
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, floorSize),
      new THREE.MeshStandardMaterial({
        color: 0x228B22,
        metalness: 0.1,
        roughness: 0.8,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Actualizar helpers
    this.scene.remove(this.axesHelper);
    this.scene.remove(this.gridHelper);

    const helperSize = Math.max(10, Math.max(scaledRange, scaledMaxHeight) * 0.3);
    this.axesHelper = new THREE.AxesHelper(helperSize);
    this.scene.add(this.axesHelper);

    const gridSize = Math.max(50, scaledRange * 1.5);
    const gridDivisions = Math.min(50, Math.max(10, Math.floor(gridSize / 2)));
    this.gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
    this.scene.add(this.gridHelper);
  }

  private updateProjectileScale() {
    if (!this.projectile) return;

    // Ajustar el tamaño del proyectil basado en la escala
    const baseSize = 0.5;
    const scaledSize = Math.max(0.2, Math.min(2, baseSize * this.scale));
    this.projectile.scale.set(scaledSize, scaledSize, scaledSize);
  }

  activateAR() {
    alert('Modo RA para tiro parabólico (placeholder).');
  }
}
