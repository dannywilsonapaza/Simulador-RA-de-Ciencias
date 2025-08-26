import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SimulationSummary } from '../../../core/models/simulation.model';
@Component({
  standalone:true,selector:'app-card-sim',imports:[RouterLink, CommonModule],
  template:`<a [routerLink]="simulation.ruta" class="card"><h3>{{simulation.nombre}}<span *ngIf="simulation.estado==='prototipo'" class="badge prot">Proto</span><span *ngIf="simulation.estado==='beta'" class="badge beta">Beta</span></h3><p>{{simulation.descripcion}}</p><div class="meta"><span>{{simulation.dificultad}}</span><span>{{simulation.categoria}}</span></div></a>`,
  styles:[`.card{display:block;padding:14px 16px;border-radius:12px;background:rgba(0,0,0,.35);color:#fff;text-decoration:none;min-height:150px}.card:hover{background:rgba(0,0,0,.45)}h3{margin:0 0 8px;font-size:1rem;display:flex;align-items:center;gap:6px}p{margin:0 0 12px;font-size:.8rem;line-height:1.2rem}.meta{font-size:.65rem;display:flex;gap:10px;opacity:.8;text-transform:uppercase}.badge{font-size:.55rem;padding:2px 5px;border-radius:5px;font-weight:600}.prot{background:#ff9800}.beta{background:#3f51b5}`]
})
export class CardSimComponent { @Input() simulation!: SimulationSummary; }
