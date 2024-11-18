import { Component, OnInit } from '@angular/core';
import { NavEspecialistaComponent } from "../../navbar/nav-especialista/nav-especialista.component";
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { CommonModule } from '@angular/common';
import { EspecialidadPipe } from "../../../pipelines/especialidad.pipe";
import { FirebaseServerApp } from 'firebase/app';
import { FirebaseServices } from '../../../services/firebase.services';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [NavEspecialistaComponent, SpinnerComponent, CommonModule, EspecialidadPipe],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent implements OnInit {
  listaUsuarios: any [] = []
  spinner: boolean = false 

  constructor(private fbsvc: FirebaseServices){}

  async ngOnInit() {
    try {
      // Traer los IDs de los pacientes atendidos por el especialista
      const mispacientes = await this.fbsvc.traerUsuariosAtendidosPorEspecialistaSinCorreo();
  
      // Usar Promise.all para traer los datos de cada usuario basado en pacienteId
      this.listaUsuarios = await Promise.all(
        mispacientes.map(async (pacienteId) => {
          return this.fbsvc.traerUsuario(pacienteId); // Asume que traerUsuario recibe un pacienteId
        })
      );
  

    } catch (error) {
      console.error('Error al traer los usuarios:', error);
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}
