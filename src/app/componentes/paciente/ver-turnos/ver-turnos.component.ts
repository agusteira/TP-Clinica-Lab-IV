import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { NavPacienteComponent } from '../../navbar/nav-paciente/nav-paciente.component';
import { CommonModule } from '@angular/common';
import { FiltroTurnosPipe } from '../../../pipelines/filtro-turnos.pipe';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { FirebaseServices } from '../../../services/firebase.services';
import { TurnosAdminDirective } from '../../../directivas/turnos-admin.directive';
import { HoverTablaDirective } from '../../../directivas/hover-tabla.directive';

@Component({
  selector: 'app-ver-turnos',
  standalone: true,
  imports: [NavPacienteComponent, CommonModule, FiltroTurnosPipe, FormsModule, SpinnerComponent, TurnosAdminDirective, HoverTablaDirective],
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.scss',
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
export class VerTurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  especialidades: Set<string> = new Set();
  especialistas: Set<string> = new Set();
  filterForm: FormGroup;
  pacienteId: string | null = null;

  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  filtroHistoriaClinica:string = ''

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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private fbsvc: FirebaseServices
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
    }
    //this.filterForm.valueChanges.subscribe(() => this.aplicarFiltros());
  }
  /*
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
  }*/


  cargarTurnos() {
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('pacienteId', '==', this.pacienteId)
    );
  
    // Suscribirse a los cambios en Firestore
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      this.turnos = [];
  
      querySnapshot.forEach((doc) => {
        const turno = doc.data();
        turno['id'] = doc.id;
        this.especialidades.add(turno['especialidad']);
        this.especialistas.add(turno['especialistaId']);

        if (turno['estado'] === 'realizado') {
          this.verificarQueNoSeAgregoLaHistoriaClinica(turno);
        }
        
        this.turnos.push(turno);
      });
  
      // Ordenar por fecha y luego por horaInicio
      this.turnos.sort((a, b) => {
        // Formato esperado: "DD/MM/YYYY" para fecha y "HH:mm" para horaInicio
        const [diaA, mesA, anioA] = a.fecha.split('/').map(Number);
        const [diaB, mesB, anioB] = b.fecha.split('/').map(Number);
  
        // Crear objetos Date solo con fecha
        const fechaA = new Date(anioA, mesA - 1, diaA);
        const fechaB = new Date(anioB, mesB - 1, diaB);
  
        if (fechaA.getTime() !== fechaB.getTime()) {
          // Ordenar por fecha
          return fechaA.getTime() - fechaB.getTime();
        } else {
          // Ordenar por horaInicio si las fechas son iguales
          const [horaA, minutoA] = a.horaInicio.split(':').map(Number);
          const [horaB, minutoB] = b.horaInicio.split(':').map(Number);
  
          // Comparar horas y minutos
          return horaA !== horaB ? horaA - horaB : minutoA - minutoB;
        }
      });
      this.cdr.detectChanges(); // Forzar detección de cambios en el DOM
    });
  
    // Retornamos la función para cancelar la suscripción si es necesario
    return unsubscribe;
  }

  async verificarQueNoSeAgregoLaHistoriaClinica(turno: any): Promise<void> {
    const paciente = await this.fbsvc.traerUsuario(turno.pacienteId);

    if(paciente!['historiaClinica']['datosVariables'][turno.id]){
      turno.historiaClinica = paciente!['historiaClinica']['datosVariables'][turno.id];
      console.log(turno.historiaClinica )
    }
    
    turno.mostrarBotonAgregarHistoria =
      !paciente!['historiaClinica'] ||
      !paciente!['historiaClinica']['datosVariables'] ||
      !paciente!['historiaClinica']['datosVariables'][turno.id];

      this.cdr.detectChanges();
      
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
      //this.aplicarFiltros();
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
      //this.aplicarFiltros();
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
