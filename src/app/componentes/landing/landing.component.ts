import { Component } from '@angular/core';
import { NavDefaultComponent } from "../navbar/nav-default/nav-default.component";
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavDefaultComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}
