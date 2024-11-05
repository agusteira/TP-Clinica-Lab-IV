import { Component } from '@angular/core';
import { NavAdminComponent } from "../../navbar/nav-admin/nav-admin.component";

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [NavAdminComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent {

}
