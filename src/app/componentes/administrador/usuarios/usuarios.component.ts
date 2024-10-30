import { Component } from '@angular/core';
import { NavAdminComponent } from "../../navbar/nav-admin/nav-admin.component";

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NavAdminComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {

}
