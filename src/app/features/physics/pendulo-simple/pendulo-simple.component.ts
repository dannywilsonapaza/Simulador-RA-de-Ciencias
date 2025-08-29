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
  selector: 'app-pendulo-simple',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './pendulo-simple.component.html',
  styleUrls: ['./pendulo-simple.component.css'],
})
export class PenduloSimpleComponent implements AfterViewInit, OnDestroy {
  // Parámetros de la simulación
  length = 2.0; // longitud del péndulo en metros
  initialAngle = 30; // ángulo inicial en grados
  mass = 1.0; // masa del péndulo en kg
  gravity = 9.8; // gravedad en m/s²
  damping = 0.01; // factor de amortiguamiento

  // Resultados calculados
  theoreticalPeriod = 0;
  frequency = 0;
  maxVelocity = 0;
  totalEnergy = 0;
  kineticEnergy = 0;
  potentialEnergy = 0;

  // Referencias a canvas
  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('energyCanvas') energyCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private pendulumBob!: THREE.Mesh;
  private pendulumString!: THREE.Line;
  private pivot!: THREE.Mesh;
  private animationId?: number;

  // Simulación
  isSimulating = false;
  showEnergyGraph = false;
  private startTime = 0;
  private currentAngle = 0; // ángulo actual en radianes
  private angularVelocity = 0; // velocidad angular
  private scale = 1;
  private maxViewDistance = 15;

  // Gráfico de energía
  private energyData: { time: number; kinetic: number; potential: number; total: number }[] = [];
  private energyContext?: CanvasRenderingContext2D;

  // Referencias a elementos de la escena
  private floor!: THREE.Mesh;
  private axesHelper!: THREE.AxesHelper;
  private gridHelper!: THREE.GridHelper;

  constructor(private telemetry: TelemetryService) {}

  ngAfterViewInit() {
    this.telemetry.startSession('pendulo-simple');
    setTimeout(() => {
      this.initThree();
      this.calculateParameters();
      this.resetSimulation();
      if (this.showEnergyGraph) {
        this.initEnergyGraph();
      }
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
    this.scene.background = new THREE.Color(0x2c3e50);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    // La posición se ajustará dinámicamente
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Iluminación
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Suelo
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x34495e,
        metalness: 0.1,
        roughness: 0.8,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -8;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Pivot (punto de suspensión)
    this.pivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16),
      new THREE.MeshStandardMaterial({
        color: 0x8e44ad,
        metalness: 0.5,
        roughness: 0.3,
      })
    );
    this.pivot.position.set(0, 5, 0);
    this.pivot.castShadow = true;
    this.scene.add(this.pivot);

    // Bob del péndulo (masa)
    this.pendulumBob = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xe74c3c,
        metalness: 0.4,
        roughness: 0.3,
      })
    );
    this.pendulumBob.castShadow = true;
    this.scene.add(this.pendulumBob);

    // Cuerda del péndulo
    const stringGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 0, 0)
    ]);
    this.pendulumString = new THREE.Line(
      stringGeometry,
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 })
    );
    this.scene.add(this.pendulumString);

    // Helpers
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
    this.gridHelper.position.y = -8;
    this.scene.add(this.gridHelper);

    // Event listeners
    window.addEventListener('resize', this.onResize);

    console.log('Three.js inicializado para péndulo simple');
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

  private calculateParameters() {
    // Período teórico para ángulos pequeños
    this.theoreticalPeriod = 2 * Math.PI * Math.sqrt(this.length / this.gravity);

    // Para ángulos grandes, usar aproximación más precisa
    const angleRad = (this.initialAngle * Math.PI) / 180;
    if (angleRad > 0.2) { // ~11.5 grados
      // Corrección para ángulos grandes (primera aproximación)
      const correction = 1 + (1/4) * Math.sin(angleRad/2) ** 2;
      this.theoreticalPeriod *= correction;
    }

    this.frequency = 1 / this.theoreticalPeriod;

    // Velocidad máxima (en el punto más bajo)
    this.maxVelocity = Math.sqrt(2 * this.gravity * this.length * (1 - Math.cos(angleRad)));

    // Energía total del sistema
    const height = this.length * (1 - Math.cos(angleRad));
    this.totalEnergy = this.mass * this.gravity * height;

    // Calcular escala dinámica
    this.scale = Math.min(1, this.maxViewDistance / (this.length * 2));

    this.updateSceneElements();
    this.updateCameraPosition();
  }

  private updateCameraPosition() {
    if (!this.camera) return;

    const scaledLength = this.length * this.scale;
    const cameraZ = Math.max(8, scaledLength * 3);
    const cameraY = Math.max(2, scaledLength * 0.5);

    this.camera.position.set(0, cameraY, cameraZ);
    this.camera.lookAt(0, 5 - scaledLength * 0.5, 0);
  }

  private updateSceneElements() {
    if (!this.scene || !this.pivot) return;

    const scaledLength = this.length * this.scale;

    // Actualizar posición del pivot
    this.pivot.position.y = 5;

    // Actualizar suelo y grid
    this.scene.remove(this.floor);
    this.scene.remove(this.gridHelper);

    const floorSize = Math.max(20, scaledLength * 4);
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, floorSize),
      new THREE.MeshStandardMaterial({
        color: 0x34495e,
        metalness: 0.1,
        roughness: 0.8,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 5 - scaledLength - 3;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.gridHelper = new THREE.GridHelper(floorSize, Math.min(50, floorSize), 0x555555, 0x333333);
    this.gridHelper.position.y = 5 - scaledLength - 3;
    this.scene.add(this.gridHelper);

    // Actualizar tamaño del bob basado en la masa y escala
    const bobSize = Math.max(0.1, Math.min(0.8, (this.mass * 0.2 + 0.2) * this.scale));
    this.pendulumBob.scale.set(bobSize, bobSize, bobSize);
  }

  private updatePendulumPosition() {
    if (!this.pendulumBob || !this.pendulumString) return;

    const scaledLength = this.length * this.scale;
    const pivotY = 5;

    // Calcular posición del bob
    const bobX = scaledLength * Math.sin(this.currentAngle);
    const bobY = pivotY - scaledLength * Math.cos(this.currentAngle);

    this.pendulumBob.position.set(bobX, bobY, 0);

    // Actualizar la cuerda
    const stringGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, pivotY, 0),
      new THREE.Vector3(bobX, bobY, 0)
    ]);
    this.pendulumString.geometry.dispose();
    this.pendulumString.geometry = stringGeometry;

    // Calcular energías actuales
    const height = scaledLength * (1 - Math.cos(this.currentAngle));
    this.potentialEnergy = this.mass * this.gravity * height / this.scale;

    const velocity = this.angularVelocity * this.length;
    this.kineticEnergy = 0.5 * this.mass * velocity * velocity;
  }

  startSimulation() {
    if (this.isSimulating) return;

    this.calculateParameters();
    this.isSimulating = true;
    this.startTime = performance.now();
    this.currentAngle = (this.initialAngle * Math.PI) / 180;
    this.angularVelocity = 0;
    this.energyData = [];

    this.telemetry.event('start_simulation', {
      length: this.length,
      angle: this.initialAngle,
      mass: this.mass,
      gravity: this.gravity,
      damping: this.damping,
    });

    this.animate();
  }

  resetSimulation() {
    this.isSimulating = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;

    this.currentAngle = (this.initialAngle * Math.PI) / 180;
    this.angularVelocity = 0;
    this.energyData = [];

    this.calculateParameters();
    this.updatePendulumPosition();
    this.renderFrame();
  }

  onParamChange() {
    if (!this.isSimulating) {
      this.calculateParameters();
      this.resetSimulation();
    }
  }

  toggleEnergyGraph() {
    this.showEnergyGraph = !this.showEnergyGraph;
    if (this.showEnergyGraph) {
      // Asegurar que el canvas esté disponible
      setTimeout(() => {
        if (this.energyCanvasRef) {
          this.initEnergyGraph();
        }
      }, 200);
    }
  }

  private initEnergyGraph() {
    if (!this.energyCanvasRef) {
      console.warn('Energy canvas ref not available');
      return;
    }

    const canvas = this.energyCanvasRef.nativeElement;
    this.energyContext = canvas.getContext('2d') || undefined;

    if (this.energyContext) {
      canvas.width = 250;
      canvas.height = 150;

      // Dibujar fondo y ejes iniciales
      this.setupEnergyGraphBackground();

      // Si ya hay datos, dibujarlos
      if (this.energyData.length > 0) {
        this.drawEnergyGraph();
      }
    }
  }

  private setupEnergyGraphBackground() {
    if (!this.energyContext) return;

    const ctx = this.energyContext;
    const canvas = ctx.canvas;

    // Limpiar canvas con fondo oscuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Líneas verticales
    for (let x = 20; x < canvas.width - 20; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, canvas.height - 20);
      ctx.stroke();
    }

    // Líneas horizontales
    for (let y = 20; y < canvas.height - 20; y += 25) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Energía vs Tiempo', canvas.width / 2 - 50, 15);

    // Leyenda inicial
    ctx.font = '10px Arial';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('● Cinética', 10, canvas.height - 30);
    ctx.fillStyle = '#3498db';
    ctx.fillText('● Potencial', 10, canvas.height - 15);
    ctx.fillStyle = '#27ae60';
    ctx.fillText('● Total', 10, canvas.height - 5);
  }

  private drawEnergyGraph() {
    if (!this.energyContext || !this.showEnergyGraph) return;

    const ctx = this.energyContext;
    const canvas = ctx.canvas;

    // Redibujar fondo
    this.setupEnergyGraphBackground();

    if (this.energyData.length < 2) {
      // Mostrar mensaje cuando no hay datos suficientes
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Inicia la simulación', canvas.width / 2, canvas.height / 2);
      ctx.fillText('para ver el gráfico', canvas.width / 2, canvas.height / 2 + 15);
      ctx.textAlign = 'left';
      return;
    }

    // Configurar estilo para las líneas
    ctx.lineWidth = 2;

    // Encontrar valores máximos para escalar
    const maxEnergy = Math.max(...this.energyData.map(d => Math.max(d.kinetic, d.potential, d.total)));
    const minEnergy = Math.min(...this.energyData.map(d => Math.min(d.kinetic, d.potential, d.total)));
    const energyRange = maxEnergy - minEnergy;
    const timeSpan = this.energyData[this.energyData.length - 1].time - this.energyData[0].time;

    if (energyRange === 0 || timeSpan === 0) return;

    const graphWidth = canvas.width - 40;
    const graphHeight = canvas.height - 40;

    // Función helper para calcular coordenadas
    const getX = (time: number) => ((time - this.energyData[0].time) / timeSpan) * graphWidth + 20;
    const getY = (energy: number) => canvas.height - 20 - ((energy - minEnergy) / energyRange) * graphHeight;

    // Dibujar energía cinética (rojo)
    ctx.strokeStyle = '#e74c3c';
    ctx.beginPath();
    this.energyData.forEach((data, i) => {
      const x = getX(data.time);
      const y = getY(data.kinetic);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dibujar energía potencial (azul)
    ctx.strokeStyle = '#3498db';
    ctx.beginPath();
    this.energyData.forEach((data, i) => {
      const x = getX(data.time);
      const y = getY(data.potential);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dibujar energía total (verde)
    ctx.strokeStyle = '#27ae60';
    ctx.beginPath();
    this.energyData.forEach((data, i) => {
      const x = getX(data.time);
      const y = getY(data.total);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Mostrar valores actuales
    if (this.energyData.length > 0) {
      const latest = this.energyData[this.energyData.length - 1];
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Arial';
      ctx.fillText(`K: ${latest.kinetic.toFixed(2)}J`, canvas.width - 80, canvas.height - 30);
      ctx.fillText(`U: ${latest.potential.toFixed(2)}J`, canvas.width - 80, canvas.height - 18);
      ctx.fillText(`E: ${latest.total.toFixed(2)}J`, canvas.width - 80, canvas.height - 6);
    }
  }

  private animate = () => {
    if (!this.isSimulating) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const dt = 0.016; // ~60 FPS

    // Ecuación diferencial del péndulo simple con amortiguamiento
    // d²θ/dt² = -(g/L)sin(θ) - c(dθ/dt)
    const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.currentAngle) - this.damping * this.angularVelocity;

    // Integración de Euler
    this.angularVelocity += angularAcceleration * dt;
    this.currentAngle += this.angularVelocity * dt;

    // Actualizar posición del péndulo
    this.updatePendulumPosition();

    // Guardar datos de energía siempre (para tenerlos disponibles si se activa el gráfico)
    if (this.energyData.length < 1000) {
      this.energyData.push({
        time: elapsed,
        kinetic: this.kineticEnergy,
        potential: this.potentialEnergy,
        total: this.kineticEnergy + this.potentialEnergy
      });

      // Solo dibujar si el gráfico está visible
      if (this.showEnergyGraph) {
        this.drawEnergyGraph();
      }
    }

    // Parar si la energía es muy baja (péndulo parado)
    if (Math.abs(this.angularVelocity) < 0.001 && Math.abs(this.currentAngle) < 0.01) {
      this.isSimulating = false;
      this.telemetry.event('end_pendulum', { t: elapsed });
      this.renderFrame();
      return;
    }

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

  activateAR() {
    alert('Modo RA para péndulo simple (placeholder).');
  }
}
