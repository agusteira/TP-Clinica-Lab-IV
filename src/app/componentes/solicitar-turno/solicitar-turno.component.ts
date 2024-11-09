import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavPacienteComponent } from "../navbar/nav-paciente/nav-paciente.component";
import { Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc } from '@angular/fire/firestore';
import { FirebaseServices } from '../../services/firebase.services';
import { Auth, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, NavPacienteComponent, SpinnerComponent],
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss']
})
export class SolicitarTurnoComponent implements OnInit{
  especialidades: string[] = [];
  especialistas: { nombre: string, id: string }[] = [];
  turnosDisponibles: string[] = [];
  fechasDisponibles: string[] = [];

  selectedEspecialidad: string = '';
  selectedEspecialista: string = '';
  selectedFecha: string = '';
  selectedHora: string = '';

  nombreEspecialista: string = '';
  pacienteId!: string;
  showErrorModal: boolean = false;
  spinner: boolean = false;

  tituloModal: string = ""
  mensaje: string = ""

  constructor(
    private turnosService: TurnosService,
    private auth: Auth,
    private fbsvc: FirebaseServices
  ) { }

  async ngOnInit() {
    this.spinner = true;
    this.especialidades = await this.turnosService.cargarEspecialidades();
    this.spinner = false;
    
    if (this.auth.currentUser) {
      this.pacienteId = this.auth.currentUser.email!;
    }
  }

  async cargarEspecialistas() {
    this.spinner = true;
    this.especialistas = await this.turnosService.cargarEspecialistas(this.selectedEspecialidad);
    this.spinner = false;
  }

  onEspecialistaChange() {
    const especialistaSeleccionado = this.especialistas.find(especialista => especialista.id === this.selectedEspecialista);
    if (especialistaSeleccionado) {
      this.nombreEspecialista = especialistaSeleccionado.nombre;
    }
  }

  async cargarHorarios() {
    this.spinner = true;
    this.turnosDisponibles = await this.turnosService.cargarHorarios(this.selectedEspecialidad, this.selectedEspecialista, this.selectedFecha);
    this.spinner = false;
  }

  async solicitarTurno() {
    if (this.selectedEspecialidad && this.selectedEspecialista && this.selectedFecha && this.selectedHora) {
      try {
        this.spinner = true;
        const [horaInicio, horaFin] = this.selectedHora.split(" - ");

        const turnoData = {
          especialistaId: this.selectedEspecialista,
          pacienteId: this.pacienteId,
          especialidad: this.selectedEspecialidad,
          fecha: this.selectedFecha,
          horaInicio: horaInicio,
          horaFin: horaFin,
          estado: 'pendiente',
          motivoCancelacion: null,
          comentariosEspecialista: null,
          calificacion: null,
          nombreEspecialista: this.nombreEspecialista,
          nombrePaciente: await this.fbsvc.traerNombreApellido(this.pacienteId)
        };

        await this.turnosService.solicitarTurno(turnoData);
        this.setModal("Turno registrado", `Turno solicitado para el ${this.selectedFecha} a las ${this.selectedHora} con ${this.nombreEspecialista} en la especialidad de ${this.selectedEspecialidad}.`);

        // Vaciar todos los campos después de solicitar el turno exitosamente
        this.selectedEspecialidad = '';
        this.selectedEspecialista = '';
        this.selectedFecha = '';
        this.selectedHora = '';
        this.nombreEspecialista = '';
        this.turnosDisponibles = [];
        this.fechasDisponibles = [];
        this.especialistas = [];
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
  }

  private setModal(titulo: string, message: string) {
    this.tituloModal = titulo;
    this.mensaje = message;
    this.showErrorModal = true;
  }
}
