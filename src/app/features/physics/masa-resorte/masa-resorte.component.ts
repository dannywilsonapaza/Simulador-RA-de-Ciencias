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
  selector: 'app-masa-resorte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './masa-resorte.component.html',
  styleUrls: ['./masa-resorte.component.css'],
})
export class MasaResorteComponent implements AfterViewInit, OnDestroy {
  // Parámetros de la simulación
  mass = 2.0; // masa en kg
  springConstant = 50.0; // constante del resorte (k) en N/m
  naturalLength = 2.0; // longitud natural del resorte en metros
  initialDisplacement = 1.0; // desplazamiento inicial en metros
  damping = 0.1; // factor de amortiguamiento
  gravity = 9.8; // gravedad en m/s²

  // Resultados calculados
  angularFrequency = 0; // ω = √(k/m)
  period = 0; // T = 2π/ω
  frequency = 0; // f = 1/T
  amplitude = 0; // amplitud del movimiento
  equilibriumPosition = 0; // posición de equilibrio
  maxVelocity = 0;
  totalEnergy = 0;
  kineticEnergy = 0;
  potentialEnergy = 0;
  elasticEnergy = 0;
  gravitationalEnergy = 0;

  // Referencias a canvas
  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('energyCanvas') energyCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private massObject!: THREE.Mesh;
  private springGeometry!: THREE.CylinderGeometry;
  private springMesh!: THREE.Mesh;
  private supportBeam!: THREE.Mesh;
  private animationId?: number;

  // Simulación
  isSimulating = false;
  showEnergyGraph = false;
  private startTime = 0;
  private currentPosition = 0; // posición actual de la masa
  private velocity = 0; // velocidad de la masa
  private scale = 1;
  private maxViewDistance = 12;

  // Gráfico de energía
  private energyData: {
    time: number;
    kinetic: number;
    elastic: number;
    gravitational: number;
    total: number
  }[] = [];
  private energyContext?: CanvasRenderingContext2D;

  // Referencias a elementos de la escena
  private floor!: THREE.Mesh;
  private axesHelper!: THREE.AxesHelper;
  private gridHelper!: THREE.GridHelper;

  constructor(private telemetry: TelemetryService) {}

  ngAfterViewInit() {
    this.telemetry.startSession('masa-resorte');
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
    this.scene.background = new THREE.Color(0x1a1a1a);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(8, 0, 8);

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
    dirLight.position.set(10, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    this.scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Suelo
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        metalness: 0.1,
        roughness: 0.8,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -8;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Viga de soporte superior
    this.supportBeam = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.3, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x8e44ad,
        metalness: 0.7,
        roughness: 0.2,
      })
    );
    this.supportBeam.position.set(0, 6, 0);
    this.supportBeam.castShadow = true;
    this.scene.add(this.supportBeam);

    // Resorte inicial
    this.createSpring();

    // Masa
    this.massObject = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.8, 1),
      new THREE.MeshStandardMaterial({
        color: 0xe74c3c,
        metalness: 0.4,
        roughness: 0.3,
      })
    );
    this.massObject.castShadow = true;
    this.scene.add(this.massObject);

    // Helpers
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
    this.gridHelper.position.y = -8;
    this.scene.add(this.gridHelper);

    // Event listeners
    window.addEventListener('resize', this.onResize);

    console.log('Three.js inicializado para sistema masa-resorte');
    this.renderFrame();
  }

  private createSpring() {
    // Eliminar resorte anterior si existe
    if (this.springMesh) {
      this.scene.remove(this.springMesh);
      this.springGeometry?.dispose();
    }

    // Crear geometría del resorte como un cilindro helicoidal
    const springHeight = this.naturalLength * this.scale;
    const springRadius = 0.3;
    const coils = Math.max(8, Math.floor(springHeight * 2));

    this.springGeometry = new THREE.CylinderGeometry(springRadius, springRadius, springHeight, 16, coils, true);

    // Crear material con wireframe para simular espiras
    const springMaterial = new THREE.MeshStandardMaterial({
      color: 0x95a5a6,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });

    this.springMesh = new THREE.Mesh(this.springGeometry, springMaterial);
    this.springMesh.position.set(0, 6 - springHeight / 2, 0);
    this.scene.add(this.springMesh);

    // Añadir líneas para representar las espiras del resorte
    this.addSpringCoils(springHeight, springRadius, coils);
  }

  private addSpringCoils(height: number, radius: number, coils: number) {
    const points = [];
    const angleStep = (coils * 2 * Math.PI) / 100;
    const heightStep = height / 100;

    for (let i = 0; i <= 100; i++) {
      const angle = i * angleStep;
      const y = 6 - (i * heightStep);
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, z));
    }

    const springCoilGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const springCoilMaterial = new THREE.LineBasicMaterial({
      color: 0x7f8c8d,
      linewidth: 3
    });
    const springCoils = new THREE.Line(springCoilGeometry, springCoilMaterial);
    this.scene.add(springCoils);
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
    // Posición de equilibrio (donde la fuerza del resorte equilibra el peso)
    this.equilibriumPosition = (this.mass * this.gravity) / this.springConstant;

    // Frecuencia angular
    this.angularFrequency = Math.sqrt(this.springConstant / this.mass);

    // Período y frecuencia
    this.period = (2 * Math.PI) / this.angularFrequency;
    this.frequency = 1 / this.period;

    // Amplitud (desde la posición de equilibrio)
    this.amplitude = Math.abs(this.initialDisplacement - this.equilibriumPosition);

    // Velocidad máxima
    this.maxVelocity = this.amplitude * this.angularFrequency;

    // Energía total del sistema
    this.totalEnergy = 0.5 * this.springConstant * this.amplitude * this.amplitude;

    // Calcular escala dinámica
    const totalSystemHeight = this.naturalLength + this.equilibriumPosition + this.amplitude;
    this.scale = Math.min(1, this.maxViewDistance / totalSystemHeight);

    this.updateSceneElements();
    this.updateCameraPosition();
  }

  private updateCameraPosition() {
    if (!this.camera) return;

    const systemHeight = (this.naturalLength + this.equilibriumPosition + this.amplitude) * this.scale;
    const cameraDistance = Math.max(10, systemHeight * 2);
    const cameraY = Math.max(0, systemHeight * 0.2);

    this.camera.position.set(cameraDistance * 0.7, cameraY, cameraDistance * 0.7);
    this.camera.lookAt(0, 3, 0);
  }

  private updateSceneElements() {
    if (!this.scene) return;

    // Recrear el resorte con la nueva escala
    this.createSpring();

    // Actualizar tamaño de la masa basado en el valor de masa y escala
    const massSize = Math.max(0.3, Math.min(1.5, (this.mass * 0.3 + 0.5) * this.scale));
    this.massObject.scale.set(massSize, massSize * 0.8, massSize);

    // Actualizar suelo y grid
    this.scene.remove(this.floor);
    this.scene.remove(this.gridHelper);

    const floorSize = Math.max(20, (this.naturalLength + this.equilibriumPosition + this.amplitude) * this.scale * 3);
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, floorSize),
      new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        metalness: 0.1,
        roughness: 0.8,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -8;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.gridHelper = new THREE.GridHelper(floorSize, Math.min(50, floorSize), 0x555555, 0x333333);
    this.gridHelper.position.y = -8;
    this.scene.add(this.gridHelper);
  }

  private updateSystemPosition() {
    if (!this.massObject || !this.springMesh) return;

    const scaledNaturalLength = this.naturalLength * this.scale;
    const scaledPosition = this.currentPosition * this.scale;

    // Posición de la masa
    const massY = 6 - scaledNaturalLength - scaledPosition;
    this.massObject.position.set(0, massY, 0);

    // Actualizar longitud del resorte
    const currentSpringLength = scaledNaturalLength + scaledPosition;
    this.springMesh.scale.y = currentSpringLength / scaledNaturalLength;
    this.springMesh.position.y = 6 - currentSpringLength / 2;

    // Calcular energías
    this.calculateEnergies();
  }

  private calculateEnergies() {
    // Energía cinética
    this.kineticEnergy = 0.5 * this.mass * this.velocity * this.velocity;

    // Energía potencial elástica (respecto a la longitud natural)
    const springExtension = this.currentPosition;
    this.elasticEnergy = 0.5 * this.springConstant * springExtension * springExtension;

    // Energía potencial gravitacional (respecto a la posición de equilibrio)
    const heightFromEquilibrium = this.currentPosition - this.equilibriumPosition;
    this.gravitationalEnergy = -this.mass * this.gravity * heightFromEquilibrium;

    // Energía potencial total
    this.potentialEnergy = this.elasticEnergy + this.gravitationalEnergy;
  }

  startSimulation() {
    if (this.isSimulating) return;

    this.calculateParameters();
    this.isSimulating = true;
    this.startTime = performance.now();
    this.currentPosition = this.initialDisplacement;
    this.velocity = 0;
    this.energyData = [];

    this.telemetry.event('start_simulation', {
      mass: this.mass,
      springConstant: this.springConstant,
      naturalLength: this.naturalLength,
      initialDisplacement: this.initialDisplacement,
      damping: this.damping,
    });

    this.animate();
  }

  resetSimulation() {
    this.isSimulating = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;

    this.currentPosition = this.initialDisplacement;
    this.velocity = 0;
    this.energyData = [];

    this.calculateParameters();
    this.updateSystemPosition();
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
      canvas.width = 300;
      canvas.height = 180;
      this.setupEnergyGraphBackground();

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
    for (let x = 30; x < canvas.width - 30; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 25);
      ctx.lineTo(x, canvas.height - 35);
      ctx.stroke();
    }

    // Líneas horizontales
    for (let y = 25; y < canvas.height - 35; y += 25) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(canvas.width - 30, y);
      ctx.stroke();
    }

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Energías del Sistema Masa-Resorte', canvas.width / 2, 15);

    // Leyenda
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('● Cinética', 10, canvas.height - 25);
    ctx.fillStyle = '#3498db';
    ctx.fillText('● Elástica', 10, canvas.height - 15);
    ctx.fillStyle = '#f39c12';
    ctx.fillText('● Gravitacional', 10, canvas.height - 5);
    ctx.fillStyle = '#27ae60';
    ctx.fillText('● Total', 70, canvas.height - 15);
  }

  private drawEnergyGraph() {
    if (!this.energyContext || !this.showEnergyGraph) return;

    const ctx = this.energyContext;
    const canvas = ctx.canvas;

    this.setupEnergyGraphBackground();

    if (this.energyData.length < 2) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Inicia la simulación', canvas.width / 2, canvas.height / 2);
      ctx.fillText('para ver las energías', canvas.width / 2, canvas.height / 2 + 15);
      ctx.textAlign = 'left';
      return;
    }

    ctx.lineWidth = 2;

    // Encontrar valores para escalar
    const allEnergies = this.energyData.flatMap(d => [d.kinetic, d.elastic, d.gravitational, d.total]);
    const maxEnergy = Math.max(...allEnergies);
    const minEnergy = Math.min(...allEnergies);
    const energyRange = maxEnergy - minEnergy;
    const timeSpan = this.energyData[this.energyData.length - 1].time - this.energyData[0].time;

    if (energyRange === 0 || timeSpan === 0) return;

    const graphWidth = canvas.width - 60;
    const graphHeight = canvas.height - 60;

    const getX = (time: number) => ((time - this.energyData[0].time) / timeSpan) * graphWidth + 30;
    const getY = (energy: number) => canvas.height - 35 - ((energy - minEnergy) / energyRange) * graphHeight;

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

    // Dibujar energía elástica (azul)
    ctx.strokeStyle = '#3498db';
    ctx.beginPath();
    this.energyData.forEach((data, i) => {
      const x = getX(data.time);
      const y = getY(data.elastic);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dibujar energía gravitacional (naranja)
    ctx.strokeStyle = '#f39c12';
    ctx.beginPath();
    this.energyData.forEach((data, i) => {
      const x = getX(data.time);
      const y = getY(data.gravitational);
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
      ctx.font = '8px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`K: ${latest.kinetic.toFixed(2)}J`, canvas.width - 35, canvas.height - 25);
      ctx.fillText(`Uel: ${latest.elastic.toFixed(2)}J`, canvas.width - 35, canvas.height - 15);
      ctx.fillText(`Ugrav: ${latest.gravitational.toFixed(2)}J`, canvas.width - 35, canvas.height - 5);
      ctx.fillText(`Total: ${latest.total.toFixed(2)}J`, canvas.width - 100, canvas.height - 15);
    }
  }

  private animate = () => {
    if (!this.isSimulating) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const dt = 0.016; // ~60 FPS

    // Ecuación de movimiento para sistema masa-resorte con amortiguamiento y gravedad
    // F = -kx + mg - cv
    // ma = -k(x - x_eq) - cv  (donde x_eq es la posición de equilibrio)

    const displacement = this.currentPosition - this.equilibriumPosition;
    const springForce = -this.springConstant * displacement;
    const dampingForce = -this.damping * this.velocity;
    const totalForce = springForce + dampingForce;

    const acceleration = totalForce / this.mass;

    // Integración de Euler
    this.velocity += acceleration * dt;
    this.currentPosition += this.velocity * dt;

    // Actualizar posición del sistema
    this.updateSystemPosition();

    // Guardar datos de energía
    if (this.energyData.length < 1000) {
      this.energyData.push({
        time: elapsed,
        kinetic: this.kineticEnergy,
        elastic: this.elasticEnergy,
        gravitational: this.gravitationalEnergy,
        total: this.kineticEnergy + this.potentialEnergy
      });

      if (this.showEnergyGraph) {
        this.drawEnergyGraph();
      }
    }

    // Parar si la energía es muy baja (sistema en reposo)
    if (Math.abs(this.velocity) < 0.001 && Math.abs(displacement) < 0.001) {
      this.isSimulating = false;
      this.telemetry.event('end_mass_spring', { t: elapsed });
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
    alert('Modo RA para sistema masa-resorte (placeholder).');
  }
}
