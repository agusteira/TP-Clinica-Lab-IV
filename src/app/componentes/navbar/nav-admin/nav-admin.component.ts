import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-admin.component.html',
  styleUrl: './nav-admin.component.scss'
})
export class NavAdminComponent {
  constructor(private router: Router) {}
  redirigir(ruta:string) {
    this.router.navigate([ruta]);
  }
}
