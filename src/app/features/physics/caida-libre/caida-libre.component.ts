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
  selector: 'app-caida-libre',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './caida-libre.component.html',
  styleUrls: ['./caida-libre.component.css'],
})
export class CaidaLibreComponent implements AfterViewInit, OnDestroy {
  height = 20;
  gravity = 10;
  mass = 10;
  initialVelocity = 0;
  fallTime = 0;
  finalVelocity = 0;
  kineticEnergy = 0;
  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.Mesh;
  private animationId?: number;
  isSimulating = false;
  private startTime = 0;
  private scaledHeight = 0;
  constructor(private telemetry: TelemetryService) {}
  ngAfterViewInit() {
    this.telemetry.startSession('caida-libre');
    // Pequeño retraso para asegurar que el canvas esté completamente renderizado
    setTimeout(() => {
      this.initThree();
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
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Iluminación mejorada
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Suelo
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({
        color: 0x0077be,
        metalness: 0.2,
        roughness: 0.5,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Esfera
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xff5722,
        metalness: 0.3,
        roughness: 0.4,
      })
    );
    this.sphere.castShadow = true;
    this.scene.add(this.sphere);

    // Helpers
    this.scene.add(new THREE.AxesHelper(5));
    this.scene.add(new THREE.GridHelper(30, 30));

    // Event listeners
    window.addEventListener('resize', this.onResize);

    // Renderizado inicial
    console.log('Three.js inicializado, renderizando escena...');
    this.renderFrame();
  }
  private onResize = () => {
    if (!this.renderer || !this.canvasRef) return;
    const c = this.canvasRef.nativeElement;

    // Obtener las dimensiones reales del contenedor
    const rect = c.parentElement?.getBoundingClientRect();
    if (rect) {
      this.renderer.setSize(rect.width, rect.height);
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
      this.renderFrame();
    }
  };
  startSimulation() {
    if (this.isSimulating) return;
    this.fallTime = Math.sqrt((2 * this.height) / this.gravity);
    this.finalVelocity = this.initialVelocity + this.gravity * this.fallTime;
    this.kineticEnergy =
      0.5 * this.mass * this.finalVelocity * this.finalVelocity;
    this.isSimulating = true;
    this.startTime = performance.now();
    this.telemetry.event('start_simulation', {
      h: this.height,
      g: this.gravity,
      v0: this.initialVelocity,
      m: this.mass,
    });
    this.animate();
  }
  resetSimulation() {
    this.isSimulating = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
    this.scaledHeight = this.height / 2;
    if (this.sphere) {
      this.sphere.position.set(0, this.scaledHeight, 0);
      this.sphere.rotation.set(0, 0, 0);
    }
    this.fallTime = this.finalVelocity = this.kineticEnergy = 0;
    this.renderFrame();
  }
  onParamChange() {
    if (!this.isSimulating) this.resetSimulation();
  }
  private animate = () => {
    if (!this.isSimulating) return;
    const elapsed = (performance.now() - this.startTime) / 1000;
    const newY = this.scaledHeight - 0.5 * this.gravity * elapsed * elapsed;
    if (newY <= 1) {
      this.sphere.position.y = 1;
      this.isSimulating = false;
      this.telemetry.event('end_freefall', { t: elapsed });
      this.renderFrame();
      return;
    }
    this.sphere.position.y = newY;
    this.sphere.rotation.x += 0.02;
    this.sphere.rotation.y += 0.03;
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
    alert('Modo RA (placeholder).');
  }
}
