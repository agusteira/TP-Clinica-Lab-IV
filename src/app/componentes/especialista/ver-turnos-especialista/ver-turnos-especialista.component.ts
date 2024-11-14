import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroDelEspecialistaPipe } from '../../../pipelines/filtro-del-especialista.pipe';
import { NavEspecialistaComponent } from '../../navbar/nav-especialista/nav-especialista.component';
import { SpinnerComponent } from "../../../spinner/spinner.component";

@Component({
  selector: 'app-ver-turnos-especialista',
  standalone: true,
  imports: [NavEspecialistaComponent, CommonModule, FormsModule, FiltroDelEspecialistaPipe, SpinnerComponent],
  templateUrl: './ver-turnos-especialista.component.html',
  styleUrls: ['./ver-turnos-especialista.component.scss']
})
export class VerTurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad: string = '';
  filtroPaciente: string = '';
  especialistaId: string | null = null;

  // Variables para el modal
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

  spinner:boolean = false;
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async ngOnInit() {
    this.especialistaId = this.auth.currentUser ? this.auth.currentUser.email : null;
    if (this.especialistaId) {
      this.spinner = true;
      await this.cargarTurnos();
      this.spinner = false;
    }
  }

  async cargarTurnos() {
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('especialistaId', '==', this.especialistaId)
    );
    const querySnapshot = await getDocs(q);

    this.turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id;
      return turno;
    });
  }
  verComentario(comentariosEspecialista: string | null, motivoCancelacion: string | null, calificacion: string | null): void {
    this.comentariosEspecialista = comentariosEspecialista && comentariosEspecialista.trim() ? comentariosEspecialista : null;
    this.motivoCancelacion = motivoCancelacion && motivoCancelacion.trim() ? motivoCancelacion : null;
    this.calificacionAtencion  = calificacion && calificacion.trim() ? calificacion : null;
    this.showComentarioModal = true;
  }

  cerrarComentarioModal(): void {
    this.showComentarioModal = false;
    this.comentariosEspecialista = null;
    this.motivoCancelacion = null;
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
    this.spinner = true;
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
    this.spinner = false;
  }
}
