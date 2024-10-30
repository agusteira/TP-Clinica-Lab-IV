import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-nav-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-default.component.html',
  styleUrl: './nav-default.component.scss'
})
export class NavDefaultComponent {
  userEmail: string | null = null;

  constructor(private router: Router) {}

  redirigir(ruta:string) {
    this.router.navigate([ruta]);
  }
}
