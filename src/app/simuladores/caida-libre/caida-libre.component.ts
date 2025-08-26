import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

@Component({
  selector: 'app-caida-libre',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './caida-libre.component.html',
  styleUrl: './caida-libre.component.css'
})
export class CaidaLibreComponent implements AfterViewInit, OnDestroy {
  // Parámetros ligados a la UI
  height = 20;          // metros
  gravity = 10;         // m/s^2
  mass = 10;            // kg
  initialVelocity = 0;  // m/s

  // Resultados calculados
  fallTime = 0;         // s
  finalVelocity = 0;    // m/s
  kineticEnergy = 0;    // J

  // Referencia al canvas
  @ViewChild('simulationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Escena Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.Mesh;
  private animationId?: number;
  isSimulating = false; // pública para template
  private startTime = 0; // ms (performance.now)
  private scaledHeight = 0; // altura escalada para visualización

  ngAfterViewInit(): void {
    this.initThree();
    this.resetSimulation();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
  }

  // Inicializa escena Three.js
  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 15);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight, new THREE.AmbientLight(0x404040));

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x0077be, metalness: 0.2, roughness: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff5722, metalness: 0.3, roughness: 0.4 })
    );
    this.scene.add(this.sphere);

    const axes = new THREE.AxesHelper(5);
    const grid = new THREE.GridHelper(30, 30);
    this.scene.add(axes, grid);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.renderer) return;
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderFrame();
  };

  startSimulation() {
    if (this.isSimulating) return;
    // Calcular resultados teóricos (movimiento uniformemente acelerado)
    this.fallTime = Math.sqrt((2 * this.height) / this.gravity);
    this.finalVelocity = this.initialVelocity + this.gravity * this.fallTime;
    this.kineticEnergy = 0.5 * this.mass * this.finalVelocity * this.finalVelocity;

    this.isSimulating = true;
    this.startTime = performance.now();
    this.animate();
  }

  resetSimulation() {
    this.isSimulating = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
    this.scaledHeight = this.height / 2; // Escala para la escena
    if (this.sphere) {
      this.sphere.position.set(0, this.scaledHeight, 0);
      this.sphere.rotation.set(0, 0, 0);
    }
    this.fallTime = 0;
    this.finalVelocity = 0;
    this.kineticEnergy = 0;
    this.renderFrame();
  }

  // Cada vez que cambian parámetros reiniciamos (opcional: se podría debounce)
  onParamChange() {
    if (!this.isSimulating) this.resetSimulation();
  }

  private animate = () => {
    if (!this.isSimulating) return;
    const elapsed = (performance.now() - this.startTime) / 1000; // s
    const newY = this.scaledHeight - 0.5 * this.gravity * elapsed * elapsed;
    if (newY <= 1) {
      this.sphere.position.y = 1;
      this.isSimulating = false;
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
    this.renderer.render(this.scene, this.camera);
  }

  activateAR() {
    alert('Modo RA: integración con A-Frame/AR.js se añadirá en fase siguiente.');
  }
}
