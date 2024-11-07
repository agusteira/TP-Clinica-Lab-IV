import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FirebaseServices } from '../../../../services/firebase.services';
import { SpinnerComponent } from "../../../../spinner/spinner.component";
import { EspecialidadPipe } from '../../../../pipelines/especialidad.pipe';

@Component({
  selector: 'app-ver-usuarios',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, EspecialidadPipe],
  templateUrl: './ver-usuarios.component.html',
  styleUrl: './ver-usuarios.component.scss'
})
export class VerUsuariosComponent implements OnChanges, OnInit {
  @Input() activarFuncion: string | null = null; // Recibimos el valor desde el componente padre
  listaUsuarios: any[] = []; // Array para almacenar la lista de usuarios
  spinner:boolean=false;
  spinner2:boolean=false

  constructor(private firebaseService: FirebaseServices) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Verificamos si hubo un cambio en activarFuncion
    if (changes['activarFuncion'] && this.activarFuncion === 'verUsuarios') {
      console.log("Activando la sección verUsuarios...");
      this.cargarUsuarios(); // Llamamos a la función cuando la sección se activa
    }
  }

  ngOnInit() {
    // Llamamos a cargarUsuarios cuando el componente se inicia (por si ya está activado al cargarse)
    if (this.activarFuncion === 'verUsuarios') {
      console.log("Componente cargado con seccionActiva 'verUsuarios'");
      this.cargarUsuarios();
    }
  }

  async cargarUsuarios() {
    try {
      this.spinner=true;
      this.listaUsuarios = await this.firebaseService.traerUsuarios(); // Llamamos al servicio para obtener los usuarios
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }finally{
      this.spinner=false;
    }
  }

  // Función para inhabilitar usuario
  async inhabilitarUsuario(usuarioId: string) {
    this.spinner=true;
    console.log(`Inhabilitar usuario con ID: ${usuarioId}`);
    await this.firebaseService.deshabilitarusuario(usuarioId);
    // Actualizar la lista para reflejar el cambio
    this.cargarUsuarios();
  }

  // Función para habilitar usuario
  async habilitarUsuario(usuarioId: string) {
    this.spinner=true;
    console.log(`Habilitar usuario con ID: ${usuarioId}`);
    await this.firebaseService.habilitarusuario(usuarioId);
    // Actualizar la lista para reflejar el cambio
    this.cargarUsuarios();
  }
}
