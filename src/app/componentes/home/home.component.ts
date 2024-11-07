import { Component } from '@angular/core';
import { NavDefaultComponent } from "../navbar/nav-default/nav-default.component";
import { LandingComponent } from "../landing/landing.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavDefaultComponent, LandingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
