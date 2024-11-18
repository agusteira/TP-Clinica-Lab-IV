import { Component } from '@angular/core';
import { NavEspecialistaComponent } from "../../navbar/nav-especialista/nav-especialista.component";
import { LandingComponent } from "../../landing/landing.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavEspecialistaComponent, LandingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeEspecialistaComponent {

}
