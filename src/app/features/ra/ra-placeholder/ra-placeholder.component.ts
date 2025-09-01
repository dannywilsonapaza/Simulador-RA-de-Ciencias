import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	selector: 'app-ra-placeholder',
	styles: [`
	:host { display:block; }
	.ra-container { position: relative; width: 100%; height: 100vh; overflow:hidden; background:#000; }
	.toolbar { position: absolute; top: .5rem; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap:.5rem; }
	button { background:#0d47a1; color:#fff; border:none; padding:.6rem 1rem; border-radius:4px; font-size:.9rem; cursor:pointer; }
	button[disabled]{ opacity:.5; cursor: default; }
	.info { position:absolute; bottom:.5rem; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.55); color:#fff; padding:.5rem .75rem; font-size:.8rem; line-height:1.2; border-radius:6px; max-width:92%; text-align:center; z-index:20; backdrop-filter: blur(2px); }
	a-scene { position:absolute !important; top:0; left:0; width:100% !important; height:100% !important; }
	/* Forzar lienzo de A-Frame a ocupar contenedor */
	.ra-container canvas, .ra-container .a-canvas { position:absolute; top:0; left:0; width:100% !important; height:100% !important; }
	.placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:calc(100vh - 2rem); gap:1rem; padding:1rem; text-align:center; }
	.placeholder ol { padding-left:1.1rem; }
	`],
		schemas: [CUSTOM_ELEMENTS_SCHEMA],
		imports: [CommonModule],
		template: `
		<div class="ra-container" *ngIf="started(); else idle">
			<div class="toolbar">
				<button (click)="stop()">Salir RA</button>
			</div>
			<!-- Escena A-Frame AR.js. El atributo embedded evita pantalla completa, 'vr-mode-ui' desactiva icono VR. -->
			<a-scene
				embedded
				vr-mode-ui="enabled: false"
				renderer="logarithmicDepthBuffer: true;"
				arjs="sourceType: webcam; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
			>
				<!-- Marcador Hiro (predefinido). Reemplazar en futuro por pattern propio en assets/markers -->
				<a-marker preset="hiro">
					<a-box position="0 0.5 0" material="color: #4CC3D9; metalness:0.1; roughness:0.8;"></a-box>
					<a-text value="Simulación" position="0 1.2 0" align="center" color="#FFF" width="2"></a-text>
				</a-marker>
				<a-entity camera></a-entity>
			</a-scene>
			<div class="info">Apunta la cámara al marcador Hiro (cuadrado con H). Iluminación buena ayuda al tracking.</div>
		</div>
		<ng-template #idle>
			<div class="placeholder">
				<h2>Realidad Aumentada (Demo)</h2>
				<p>Esta demo usa AR.js + A-Frame con el marcador Hiro.</p>
				<ol style="font-size:.85rem; max-width:420px; text-align:left; line-height:1.2;">
					<li>Imprime o muestra en otra pantalla el marcador Hiro.</li>
					<li>Presiona "Iniciar RA" (necesita permiso de cámara).</li>
					<li>Apunta el dispositivo al marcador.</li>
				</ol>
				<button (click)="start()">Iniciar RA</button>
			</div>
		</ng-template>
	`
})
export class RaPlaceholderComponent {
	started = signal(false);
	start(){ this.started.set(true); }
	stop(){ this.started.set(false); }
}
