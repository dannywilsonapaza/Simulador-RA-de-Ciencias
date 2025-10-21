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
import { ChatModalComponent } from '../../tutor/components/chat-modal/chat-modal.component';
import { SimulationContext } from '../../tutor/services/ai-tutor.service';

@Component({
  selector: 'app-tiro-parabolico',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, ChatModalComponent],
  templateUrl: './tiro-parabolico.component.html',
  styleUrls: ['./tiro-parabolico.component.css'],
})
export class TiroParabolicoComponent implements AfterViewInit, OnDestroy {
  // Parámetros de la simulación
  velocity = 20; // m/s
  angle = 45; // grados
  gravity = 9.8; // m/s²
  height = 0; // altura inicial en metros

  // Estado de la simulación
  isPlaying = false;
  time = 0;
  position = { x: 0, y: 0 };
  currentVelocity = { x: 0, y: 0 };

  // Mediciones en tiempo real
  flightTime = 0;
  maxHeight = 0;
  range = 0;

  // Chat con IA
  showChat = false;
  simulationContext: SimulationContext = {
    topic: 'Tiro Parabólico (Movimiento Parabólico)',
    velocity: this.velocity,
    angle: this.angle,
    gravity: this.gravity,
    height: this.height,
    time: this.time,
    position: this.position,
    currentVelocity: this.currentVelocity
  };

  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private ball!: THREE.Mesh;
  private trajectoryLine!: THREE.Line;
  private animationId?: number;

  // Simulación
  private trajectoryPoints: THREE.Vector3[] = [];

  // Escalado dinámico
  private scale = 1;
  private maxViewDistance = 50;
  private floor!: THREE.Mesh;
  private axesHelper!: THREE.AxesHelper;
  private gridHelper!: THREE.GridHelper;

  // Interval para actualización de física
  private physicsInterval?: number;

  constructor(private telemetry: TelemetryService) {}

  ngAfterViewInit() {
    this.telemetry.startSession('tiro-parabolico');
    setTimeout(() => {
      this.initThree();
      this.calculateTrajectory();
      this.resetSimulation();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.physicsInterval) clearInterval(this.physicsInterval);
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
    const height = rect.height || 600;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(30, 20, 40);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a9d4a });
    this.floor = new THREE.Mesh(groundGeometry, groundMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.scene.add(this.floor);

    // Grid
    this.gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x888888);
    this.scene.add(this.gridHelper);

    // Axes
    this.axesHelper = new THREE.AxesHelper(15);
    this.scene.add(this.axesHelper);

    // Ball
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.ball.position.set(0, 0.5, 0);
    this.scene.add(this.ball);

    // Trajectory line
    const trajectoryMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 2
    });
    const trajectoryGeometry = new THREE.BufferGeometry();
    this.trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    this.scene.add(this.trajectoryLine);

    // Event listeners
    window.addEventListener('resize', this.onResize);

    // Start animation loop
    this.animate();

    console.log('Three.js inicializado para tiro parabólico');
  }

  private onResize = () => {
    if (!this.renderer || !this.canvasRef) return;
    const c = this.canvasRef.nativeElement;

    const rect = c.parentElement?.getBoundingClientRect();
    if (rect) {
      this.renderer.setSize(rect.width, rect.height);
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
    }
  };

  private calculateTrajectory() {
    const angleRad = (this.angle * Math.PI) / 180;
    const vx = this.velocity * Math.cos(angleRad);
    const vy = this.velocity * Math.sin(angleRad);

    // Calcular tiempo de vuelo
    this.flightTime = (2 * vy + Math.sqrt(4 * vy * vy + 8 * this.gravity * this.height)) / (2 * this.gravity);

    // Calcular altura máxima
    this.maxHeight = this.height + (vy * vy) / (2 * this.gravity);

    // Calcular alcance
    this.range = vx * this.flightTime;

    // Calcular escala dinámica
    const maxDimension = Math.max(this.range, this.maxHeight * 2);
    if (maxDimension > this.maxViewDistance) {
      this.scale = this.maxViewDistance / maxDimension;
    } else if (maxDimension < this.maxViewDistance * 0.3) {
      this.scale = Math.min(3, (this.maxViewDistance * 0.5) / maxDimension);
    } else {
      this.scale = 1;
    }

    // Generar puntos de la trayectoria
    this.trajectoryPoints = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (this.flightTime * i) / steps;
      const x = vx * t * this.scale;
      const y = (this.height + vy * t - 0.5 * this.gravity * t * t) * this.scale;

      if (y >= 0) {
        this.trajectoryPoints.push(new THREE.Vector3(x, y + 0.5, 0));
      }
    }

    this.updateTrajectoryLine();
    this.updateSceneElements();
    this.updateCameraPosition();
  }

  private updateTrajectoryLine() {
    if (this.trajectoryLine) {
      const geometry = new THREE.BufferGeometry().setFromPoints(this.trajectoryPoints);
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.geometry = geometry;
    }
  }

  startSimulation() {
    if (this.isPlaying) return;

    this.calculateTrajectory();
    this.isPlaying = true;
    this.time = 0;
    this.trajectoryPoints = [];

    // Limpiar trayectoria visual
    if (this.trajectoryLine) {
      const emptyGeometry = new THREE.BufferGeometry().setFromPoints([]);
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.geometry = emptyGeometry;
    }

    this.telemetry.event('start_simulation', {
      v0: this.velocity,
      angle: this.angle,
      g: this.gravity,
      h: this.height,
    });

    // Actualizar física en intervalo
    this.physicsInterval = window.setInterval(() => {
      this.updatePhysics();
    }, 50);
  }

  private updatePhysics() {
    if (!this.isPlaying) return;

    this.time += 0.05;
    const angleRad = (this.angle * Math.PI) / 180;
    const vx = this.velocity * Math.cos(angleRad);
    const vy = this.velocity * Math.sin(angleRad);

    const x = vx * this.time;
    const y = this.height + vy * this.time - 0.5 * this.gravity * this.time * this.time;

    if (y < 0) {
      this.isPlaying = false;
      if (this.physicsInterval) {
        clearInterval(this.physicsInterval);
        this.physicsInterval = undefined;
      }
      return;
    }

    this.position = { x, y };
    this.currentVelocity = {
      x: vx,
      y: vy - this.gravity * this.time
    };

    // Actualizar contexto de simulación para el chat
    this.updateSimulationContext();

    // Actualizar posición de la bola
    if (this.ball) {
      this.ball.position.set(x * this.scale, (y + 0.5) * this.scale, 0);
    }

    // Agregar punto a la trayectoria
    this.trajectoryPoints.push(new THREE.Vector3(
      x * this.scale,
      (y + 0.5) * this.scale,
      0
    ));

    // Actualizar línea de trayectoria
    if (this.trajectoryLine && this.trajectoryPoints.length > 1) {
      const points = this.trajectoryPoints.slice(-100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.geometry = geometry;
    }
  }

  resetSimulation() {
    this.isPlaying = false;
    this.time = 0;
    this.position = { x: 0, y: 0 };
    this.currentVelocity = { x: 0, y: 0 };
    this.trajectoryPoints = [];

    if (this.physicsInterval) {
      clearInterval(this.physicsInterval);
      this.physicsInterval = undefined;
    }

    if (this.ball) {
      this.ball.position.set(0, (this.height * this.scale) + 0.5, 0);
      this.ball.rotation.set(0, 0, 0);
    }

    if (this.trajectoryLine) {
      const emptyGeometry = new THREE.BufferGeometry().setFromPoints([]);
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.geometry = emptyGeometry;
    }

    this.calculateTrajectory();
    this.updateSimulationContext();
  }

  onParamChange() {
    if (!this.isPlaying) {
      this.calculateTrajectory();
      this.resetSimulation();
    }
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private updateCameraPosition() {
    if (!this.camera) return;

    const scaledRange = this.range * this.scale;
    const scaledMaxHeight = this.maxHeight * this.scale;

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
      new THREE.MeshLambertMaterial({ color: 0x4a9d4a })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.scene.add(this.floor);

    // Actualizar helpers
    this.scene.remove(this.axesHelper);
    this.scene.remove(this.gridHelper);

    const helperSize = Math.max(10, Math.max(scaledRange, scaledMaxHeight) * 0.3);
    this.axesHelper = new THREE.AxesHelper(helperSize);
    this.scene.add(this.axesHelper);

    const gridSize = Math.max(50, scaledRange * 1.5);
    const gridDivisions = Math.min(50, Math.max(10, Math.floor(gridSize / 2)));
    this.gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x888888);
    this.scene.add(this.gridHelper);
  }

  private updateSimulationContext() {
    this.simulationContext = {
      topic: 'Tiro Parabólico (Movimiento Parabólico)',
      velocity: this.velocity,
      angle: this.angle,
      gravity: this.gravity,
      height: this.height,
      time: this.time,
      position: this.position,
      currentVelocity: this.currentVelocity
    };
  }

  toggleChat() {
    this.showChat = !this.showChat;
    this.updateSimulationContext();
  }

  closeChat() {
    this.showChat = false;
  }
}
