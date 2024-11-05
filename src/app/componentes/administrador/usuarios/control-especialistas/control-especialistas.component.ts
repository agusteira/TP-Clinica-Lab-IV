import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FirebaseServices } from '../../../../services/firebase.services';
import { SpinnerComponent } from "../../../../spinner/spinner.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-especialistas',
  standalone: true,
  imports: [SpinnerComponent,CommonModule],
  templateUrl: './control-especialistas.component.html',
  styleUrl: './control-especialistas.component.scss'
})
export class ControlEspecialistasComponent implements OnChanges, OnInit {
  @Input() activarFuncion: string | null = null; // Recibimos el valor desde el componente padre
  spinner:boolean=false;
  listaUsuarios: any[] = []; // Array para almacenar la lista de usuarios

  constructor(private firebaseService: FirebaseServices) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Verificamos si hubo un cambio en activarFuncion
    if (changes['activarFuncion'] && this.activarFuncion === 'habilitarEspecialistas') {
      console.log("Activando la sección habilitarEspecialistas...");
      this.cargarEspecialistasPendientes(); // Llamamos a la función cuando la sección se activa
    }
  }

  ngOnInit() {
    // Llamamos a cargarUsuarios cuando el componente se inicia (por si ya está activado al cargarse)
    if (this.activarFuncion === 'habilitarEspecialistas') {
      console.log("Componente cargado con seccionActiva 'habilitarEspecialistas'");
      this.cargarEspecialistasPendientes();
    }
  }

  async cargarEspecialistasPendientes() {
    try {
      this.spinner=true;
      this.listaUsuarios = await this.firebaseService.traerEspecialistasPendientes(); // Llamamos al servicio para obtener los usuarios
      console.log("Especialistas cargados:", this.listaUsuarios);
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }finally{
      this.spinner=false;
    }
  }

  // Función para aceptar especialista
  async aceptarEspecialista(id: string) {

    this.spinner=true;
    console.log(`aceptar especialista con ID: ${id}`);
    await this.firebaseService.accionEspecialistaPendiente(id, "aprobado");
    // Actualizar la lista para reflejar el cambio
    this.cargarEspecialistasPendientes();
  }

  // Función para rechazar especialista
  async rechazarEspecialista(id: string) {
    this.spinner=true;
    console.log(`rechazar especialista con ID: ${id}`);
    await this.firebaseService.accionEspecialistaPendiente(id, "rechazado");
    // Actualizar la lista para reflejar el cambio
    this.cargarEspecialistasPendientes();
  }
}
