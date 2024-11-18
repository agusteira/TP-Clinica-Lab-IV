import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { NavPacienteComponent } from '../../navbar/nav-paciente/nav-paciente.component';
import { CommonModule } from '@angular/common';
import { FiltroTurnosPipe } from '../../../pipelines/filtro-turnos.pipe';
import { SpinnerComponent } from "../../../spinner/spinner.component";

@Component({
  selector: 'app-ver-turnos',
  standalone: true,
  imports: [NavPacienteComponent, CommonModule, FiltroTurnosPipe, FormsModule, SpinnerComponent],
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.scss'
})
export class VerTurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  especialidades: Set<string> = new Set();
  especialistas: Set<string> = new Set();
  filterForm: FormGroup;
  pacienteId: string | null = null;

  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';


  //modal
  showModal: boolean = false;
  modalTitle: string = '';
  modalComment: string = '';
  accion: string = '';
  turnoId: string | null = null;

  //Modal2
  showComentarioModal = false;
  comentariosEspecialista: string | null = null;
  motivoCancelacion: string | null = null;
  calificacionAtencion : string | null = null;

  //Modal3
  showCalificarModal: boolean = false;
  calificacionComentario: string = '';

  //spinner
  spinner:boolean = false;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      especialidad: [''],
      especialista: ['']
    });
  }

  async ngOnInit() {

    this.pacienteId = this.auth.currentUser ? this.auth.currentUser.email : null;

    if (this.pacienteId) {
      await this.cargarTurnos();
      this.aplicarFiltros();
    }

    this.filterForm.valueChanges.subscribe(() => this.aplicarFiltros());
  }

  async cargarTurnos() {
    this.spinner = true;
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('pacienteId', '==', this.pacienteId)
    );
    const querySnapshot = await getDocs(q);

    this.turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id; // Guardamos el ID del documento
      this.especialidades.add(turno['especialidad']);
      this.especialistas.add(turno['especialistaId']);
      return turno;
    });

    this.turnosFiltrados = [...this.turnos]; // Iniciar con todos los turnos
    this.spinner = false;
  }

  aplicarFiltros() {
    const { especialidad, especialista } = this.filterForm.value;
    this.turnosFiltrados = this.turnos.filter(turno => {
      return (
        (especialidad ? turno.especialidad === especialidad : true) &&
        (especialista ? turno.especialistaId === especialista : true)
      );
    });
  }


  async completarEncuesta(turnoId: string) {
    const comentarios = prompt('Ingrese sus comentarios para la encuesta:');
    if (comentarios) {
      const turnoDocRef = doc(this.firestore, 'Turnos', turnoId);
      await updateDoc(turnoDocRef, {
        comentariosEspecialista: comentarios
      });
      alert('Encuesta completada exitosamente.');
      await this.cargarTurnos();
      this.aplicarFiltros();
    }
  }

  async calificarAtencion(turnoId: string) {
    this.turnoId = turnoId; // Guardar el ID del turno actual
    this.calificacionComentario = ''; // Limpiar el comentario previo
    this.showCalificarModal = true; // Mostrar el modal
  }
  
  cerrarCalificarModal() {
    this.showCalificarModal = false;
  }
  
  async confirmarCalificacion() {
    
    if (this.calificacionComentario && this.turnoId) {
      const turnoDocRef = doc(this.firestore, 'Turnos', this.turnoId);
      this.spinner = true;
      await updateDoc(turnoDocRef, {
        calificacion: this.calificacionComentario
      });
      this.spinner = false
      this.cerrarCalificarModal(); // Cerrar el modal
      await this.cargarTurnos(); // Recargar los turnos
      this.aplicarFiltros();
    }
  }

  abrirModal(accion: string, turnoId: string) {
    this.accion = accion;
    this.turnoId = turnoId;
    this.modalComment = '';
    
    switch (accion) {
      case 'cancelar':
        
        this.modalTitle = 'Cancelar Turno';
        break;
      case 'rechazar':
        this.modalTitle = 'Rechazar Turno';
        break;
      case 'finalizar':
        this.modalTitle = 'Finalizar Turno';
        break;
      case 'aceptar':
        this.modalTitle = 'Aceptar Turno';
        break;
      case 'verResena':
        this.modalTitle = 'Reseña del Turno';
        const turno = this.turnos.find(t => t.id === turnoId);
        this.modalComment = turno?.comentariosEspecialista || '';
        break;
    }
    
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  async confirmarAccion() {
    if (!this.turnoId) return;
    const turnoDocRef = doc(this.firestore, 'Turnos', this.turnoId);

    switch (this.accion) {
      case 'cancelar':
        await updateDoc(turnoDocRef, { estado: 'cancelado', motivoCancelacion: this.modalComment });
        break;
      case 'rechazar':
        await updateDoc(turnoDocRef, { estado: 'rechazado', motivoRechazo: this.modalComment });
        break;
      case 'finalizar':
        await updateDoc(turnoDocRef, { estado: 'realizado', comentariosEspecialista: this.modalComment });
        break;
      case 'aceptar':
        await updateDoc(turnoDocRef, { estado: 'aceptado' });
        break;
    }

    this.cerrarModal();
    await this.cargarTurnos(); // Actualiza la lista de turnos
  }

  verComentario(comentariosEspecialista: string | null, motivoCancelacion: string | null, calificacion: string | null): void {
    this.comentariosEspecialista = comentariosEspecialista && comentariosEspecialista.trim() ? comentariosEspecialista : null;
    this.motivoCancelacion = motivoCancelacion && motivoCancelacion.trim() ? motivoCancelacion : null;
    this.calificacionAtencion  = calificacion && calificacion.trim() ? calificacion : null;
    this.showComentarioModal = true;
  }

  // Método para cerrar el nuevo modal de comentarios
  cerrarComentarioModal(): void {
    this.showComentarioModal = false;
    this.comentariosEspecialista = null;
    this.motivoCancelacion = null;
  }

}
