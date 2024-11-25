import { Component, inject } from '@angular/core';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { NavPacienteComponent } from "../../navbar/nav-paciente/nav-paciente.component";
import { TurnosService } from '../../../services/turnos.service';
import { FirebaseServices } from '../../../services/firebase.services';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormatoHoraPipe } from "../../../pipelines/formato-hora.pipe";
import { CommonModule, NgClass } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { NavAdminComponent } from "../../navbar/nav-admin/nav-admin.component";

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [SpinnerComponent, NavPacienteComponent, FormatoHoraPipe, CommonModule, NavAdminComponent, NgClass],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss',
  animations: [
    trigger('slideInOut', [
      // Página entrando desde abajo
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('1300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      // Página saliendo hacia abajo
      transition(':leave', [
        animate('1300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class SolicitarTurnoAdminComponent {
  especialidades: string[] = [];
  pacientes: any[] = [];
  especialistas: { nombre: string, id: string, foto1: string}[] = [];
  turnosDisponibles: string[] = [];
  fechasDisponibles: string[] = [];

  selectedEspecialidad: string = '';
  selectedEspecialista: string = '';
  selectedFecha: string = '';
  selectedHora: string = '';
  selectedPacienteId: string = "";

  nombreEspecialista: string = '';
  adminId!: string;
  showErrorModal: boolean = false;
  spinner: boolean = false;

  tituloModal: string = ""
  mensaje: string = ""

  imagenesEspecialidades: { especialidad: string, imagen: string }[] = [];
  imagenPorDefecto = 'https://firebasestorage.googleapis.com/v0/b/clinica-1fd9a.firebasestorage.app/o/especialidades%2F8cf83fe9-930d-45c5-b5b8-a4107ae6b76c.webp?alt=media&token=1cb6b38f-a8ef-4e89-99c3-ae57a2227cfe'; // Ruta de la imagen por defecto

  constructor(
    private turnosService: TurnosService,
    private auth: Auth,
    private fbsvc: FirebaseServices
  ) { }

  async ngOnInit() {
    this.spinner = true;
    this.especialistas = await this.turnosService.cargarTodosLosEspecialistas(); // Cargar todos los especialistas inicialmente
    this.imagenesEspecialidades = await this.turnosService.cargarImagenesEspecialidades();
    this.cargarPacientes()
      //console.log(this.imagenesEspecialidades)
    this.spinner = false;
    
  }

  async onEspecialistaChange() {
    const especialistaSeleccionado = this.especialistas.find(especialista => especialista.id === this.selectedEspecialista);
    if (especialistaSeleccionado) {
      this.nombreEspecialista = especialistaSeleccionado.nombre;
      this.selectedEspecialidad = ''; // Reiniciar especialidad seleccionada
      this.selectedFecha = ''; // Reiniciar fecha seleccionada
      this.selectedHora = ''; // Reiniciar hora seleccionada
      
      this.especialidades = await this.turnosService.cargarEspecialidadesPorEspecialista(this.selectedEspecialista); // Cargar especialidades del especialista seleccionado
      
    
    }
  }

  async cargarHorarios() {
    this.spinner = true;
    this.turnosDisponibles = await this.turnosService.cargarHorarios(this.selectedEspecialidad, this.selectedEspecialista, this.selectedFecha);
    this.spinner = false;
  }

  async cargarPacientes(){
    this.spinner = true;
    this.pacientes = await this.fbsvc.traerUsuariosPorTipo("paciente");
    console.log(this.pacientes)
    this.spinner = false;
  }

  async solicitarTurno() {
    if (this.selectedEspecialidad && this.selectedEspecialista && this.selectedFecha && this.selectedHora && this.selectedPacienteId) {
      try {
        this.spinner = true;
        const [horaInicio, horaFin] = this.selectedHora.split(" - ");

        const turnoData = {
          especialistaId: this.selectedEspecialista,
          pacienteId: this.selectedPacienteId,
          especialidad: this.selectedEspecialidad,
          fecha: this.selectedFecha,
          horaInicio: horaInicio,
          horaFin: horaFin,
          estado: 'pendiente',
          motivoCancelacion: null,
          comentariosEspecialista: null,
          calificacion: null,
          nombreEspecialista: this.nombreEspecialista,
          nombrePaciente: await this.fbsvc.traerNombreApellido(this.selectedPacienteId)
        };

        await this.turnosService.solicitarTurno(turnoData);
        console.log("turno solicitado")
        this.setModal("Turno registrado", `Turno solicitado para el ${this.selectedFecha} a las ${this.selectedHora} con ${this.nombreEspecialista} en la especialidad de ${this.selectedEspecialidad}.`);

        // Vaciar todos los campos después de solicitar el turno exitosamente
        this.selectedEspecialidad = '';
        this.selectedEspecialista = '';
        this.selectedFecha = '';
        this.selectedHora = '';
        this.nombreEspecialista = '';
        this.turnosDisponibles = [];
        this.fechasDisponibles = [];
      } catch (error) {
        console.log(error)
        this.setModal("Error", "Hubo un error al solicitar el turno");
      } finally {
        this.spinner = false;
      }
    } else {
      this.setModal("Error", "Por favor complete todos los campos correctamente");
    }
  }

  async generarFechasDisponibles() {
    this.spinner = true;
    this.fechasDisponibles = await this.turnosService.generarFechasDisponibles(this.selectedEspecialidad, this.selectedEspecialista);
    this.spinner = false;
  }

  closeModal() {
    this.showErrorModal = false;
    window.location.reload(); // Recarga la página actual
  }

  private setModal(titulo: string, message: string) {
    this.tituloModal = titulo;
    this.mensaje = message;
    this.showErrorModal = true;
  }

  obtenerImagenEspecialidad(especialidad: string): string {
    let imagen = this.imagenPorDefecto
    this.imagenesEspecialidades.forEach(element => {
      //console.log("Imagen: ", element.especialidad, " |||| Especialidad: ", especialidad)
      if(element.especialidad	== especialidad){
        imagen = element.imagen
        console.log("imagen encontrada")
      }
    });
    //const especialidadEncontrada = this.imagenesEspecialidades.find(e => e.especialidad === especialidad);
    //return especialidadEncontrada ? especialidadEncontrada.imagen : this.imagenPorDefecto;
    return imagen
  }
}
