import { Component } from '@angular/core';
import { NavAdminComponent } from "../../navbar/nav-admin/nav-admin.component";
import { CommonModule } from '@angular/common';
import { FirebaseServices } from '../../../services/firebase.services';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { VerUsuariosComponent } from "./ver-usuarios/ver-usuarios.component";
import { ControlEspecialistasComponent } from "./control-especialistas/control-especialistas.component";
import { RegisterEspecialistaComponent } from "../../register/register-especialista/register-especialista.component";
import { RegisterPacienteComponent } from "../../register/register-paciente/register-paciente.component";
import { RegisterAdminComponent } from "../../register/register-admin/register-admin.component";
import { LandingComponent } from "../../landing/landing.component";
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NavAdminComponent, CommonModule, SpinnerComponent, VerUsuariosComponent, ControlEspecialistasComponent, RegisterEspecialistaComponent, RegisterPacienteComponent, RegisterAdminComponent, LandingComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  animations: [
    trigger('slideInOut', [
      // Página entrando desde abajo
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('1300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      // Página saliendo hacia abajo
      transition(':leave', [
        animate('1300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class UsuariosComponent {
  seccionActiva: string = '';
  spinner:boolean=false;
  usuarioSignUp!:string;

  constructor(private firebaseService: FirebaseServices) {}

  ngOnInit(): void {
  }
  
  // Método para cambiar la sección activa
  async seleccionarSeccion(seccion: string) {
    this.spinner = true;
    this.seccionActiva = seccion;
    this.spinner = false;
  }

  
}
