import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FirebaseServices } from '../../../../services/firebase.services';
import { SpinnerComponent } from "../../../../spinner/spinner.component";
import { EspecialidadPipe } from "../../../../pipelines/especialidad.pipe";  // Importar el pipe
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-control-especialistas',
  standalone: true,
  imports: [SpinnerComponent, CommonModule, DatePipe, EspecialidadPipe],  // Añadir el pipe aquí
  templateUrl: './control-especialistas.component.html',
  styleUrls: ['./control-especialistas.component.scss']
})
export class ControlEspecialistasComponent implements OnChanges, OnInit {
  @Input() activarFuncion: string | null = null; // Recibimos el valor desde el componente padre
  spinner: boolean = false;
  listaUsuarios: any[] = []; // Array para almacenar la lista de usuarios

  constructor(private firebaseService: FirebaseServices) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activarFuncion'] && this.activarFuncion === 'habilitarEspecialistas') {
      console.log("Activando la sección habilitarEspecialistas...");
      this.cargarEspecialistasPendientes(); // Llamamos a la función cuando la sección se activa
    }
  }

  ngOnInit() {
    if (this.activarFuncion === 'habilitarEspecialistas') {
      console.log("Componente cargado con seccionActiva 'habilitarEspecialistas'");
      this.cargarEspecialistasPendientes();
    }
  }

  async cargarEspecialistasPendientes() {
    try {
      this.spinner = true;
      this.listaUsuarios = await this.firebaseService.traerEspecialistasPendientes(); // Llamamos al servicio para obtener los usuarios
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    } finally {
      this.spinner = false;
    }
  }

  async aceptarEspecialista(id: string) {
    this.spinner = true;
    console.log(`aceptar especialista con ID: ${id}`);
    await this.firebaseService.accionEspecialistaPendiente(id, "aprobado");
    this.cargarEspecialistasPendientes();
  }

  async rechazarEspecialista(id: string) {
    this.spinner = true;
    console.log(`rechazar especialista con ID: ${id}`);
    await this.firebaseService.accionEspecialistaPendiente(id, "rechazado");
    this.cargarEspecialistasPendientes();
  }
}
