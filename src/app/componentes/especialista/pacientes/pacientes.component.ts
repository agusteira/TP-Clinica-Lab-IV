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
  showModalHistoriaClinica: boolean = false 
  usuarioSeleccionado: any
  turnoSeleccionado!: string
  

  constructor(private fbsvc: FirebaseServices){}

  async ngOnInit() {
    try {
      this.spinner = true
      // Traer los IDs de los pacientes atendidos por el especialista
      const mispacientes = await this.fbsvc.traerUsuariosAtendidosPorEspecialistaSinCorreo();
  
      // Usar Promise.all para traer los datos de cada usuario basado en pacienteId
      this.listaUsuarios = await Promise.all(
        mispacientes.map(async (pacienteId) => {
          const usuario = await this.fbsvc.traerUsuario(pacienteId); // Obtener datos del usuario
          usuario!['ultimosTurnos'] = await this.obtenerUltimosTresTurnos(usuario!['correo']); // Cargar últimos 3 turnos
          return usuario;
        })
      );
  

    } catch (error) {
      console.error('Error al traer los usuarios:', error);
    }finally{
      this.spinner = false
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  async obtenerUltimosTresTurnos(correo: string){
    return await this.fbsvc.cargarTurnosFinalizadosConCorte(correo)
  }

  abrirHistoriaClinica(turnoId: string, usuario:any){
    console.log(usuario.historiaClinica.datosVariables[turnoId])
    this.usuarioSeleccionado = usuario
    this.turnoSeleccionado = turnoId
    console.log(this.usuarioSeleccionado.historiaClinica.datosVariables[this.turnoSeleccionado].datosVariables)
    this.showModalHistoriaClinica = true
    //this.fbsvc.TraerHistoriaPorIddeturno(usuario, turnoId)
  }

  cerrarModalHistoriaClinica(){
    this.showModalHistoriaClinica = false
  }
}
