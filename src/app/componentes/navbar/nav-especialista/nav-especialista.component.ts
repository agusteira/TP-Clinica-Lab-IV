import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-especialista',
  standalone: true,
  imports: [],
  templateUrl: './nav-especialista.component.html',
  styleUrl: './nav-especialista.component.scss'
})
export class NavEspecialistaComponent {
  constructor(private router: Router) {}
  redirigir(ruta: string, parametros: any = null) {
    this.router.navigate([ruta], { queryParams: parametros });
  }
}
