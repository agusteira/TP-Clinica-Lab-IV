import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-paciente',
  standalone: true,
  imports: [],
  templateUrl: './nav-paciente.component.html',
  styleUrl: './nav-paciente.component.scss'
})
export class NavPacienteComponent {

  constructor(private router: Router) {}

  redirigir(ruta: string, parametros: any = null) {
    this.router.navigate([ruta], { queryParams: parametros });
  }
  
}
