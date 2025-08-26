import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `<h1>Laboratorio Virtual RA</h1><p>Selecciona un área para comenzar.</p><div class="quick"><a routerLink="/fisica" class="box">Simulaciones de Física</a><a routerLink="/ra" class="box">Modo RA</a><a routerLink="/tutor" class="box">Tutor IA</a></div>`,
  styles:[`.quick{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-top:20px}.box{background:rgba(255,255,255,.15);backdrop-filter:blur(4px);padding:18px;border-radius:12px;text-decoration:none;color:#fff;font-weight:600;text-align:center}.box:hover{background:rgba(255,255,255,.25)}`]
})
export class HomeComponent {}
