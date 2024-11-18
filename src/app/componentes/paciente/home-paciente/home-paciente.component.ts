import { Component } from '@angular/core';
import { NavPacienteComponent } from "../../navbar/nav-paciente/nav-paciente.component";
import { AdminHomeComponent } from "../../administrador/admin-home/admin-home.component";
import { LandingComponent } from "../../landing/landing.component";

@Component({
  selector: 'app-home-paciente',
  standalone: true,
  imports: [NavPacienteComponent, AdminHomeComponent, LandingComponent],
  templateUrl: './home-paciente.component.html',
  styleUrl: './home-paciente.component.scss'
})
export class HomePacienteComponent {

}
