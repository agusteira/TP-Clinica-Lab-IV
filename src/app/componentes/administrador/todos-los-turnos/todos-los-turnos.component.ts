import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { NavPacienteComponent } from '../../navbar/nav-paciente/nav-paciente.component';
import { CommonModule } from '@angular/common';
import { FiltroTurnosPipe } from '../../../pipelines/filtro-turnos.pipe';
import { NavAdminComponent } from '../../navbar/nav-admin/nav-admin.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { TurnosAdminDirective } from '../../../directivas/turnos-admin.directive';
import { HoverTablaDirective } from '../../../directivas/hover-tabla.directive';


@Component({
  selector: 'app-todos-los-turnos',
  standalone: true,
  imports: [NavAdminComponent, CommonModule, FiltroTurnosPipe, FormsModule, TurnosAdminDirective, HoverTablaDirective],
  templateUrl: './todos-los-turnos.component.html',
  styleUrl: './todos-los-turnos.component.scss',
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
export class TodosLosTurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filterForm: FormGroup;
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';

  //modal
  showModal: boolean = false;
  modalTitle: string = '';
  modalComment: string = '';
  accion: string = '';
  turnoId: string | null = null;
  especialidades: any;
  especialistas: any;

  constructor(
    private firestore: Firestore,
    //private auth: Auth,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      especialidad: [''],
      especialista: ['']
    });
  }

  async ngOnInit() {
    //this.pacienteId = this.auth.currentUser ? this.auth.currentUser.email : null;

    await this.cargarTurnos();
    this.aplicarFiltros();

    this.filterForm.valueChanges.subscribe(() => this.aplicarFiltros());
  }
  //======TURNOS=======
  async cargarTurnos() {
    const q = query(
      collection(this.firestore, 'Turnos'),
    );
    const querySnapshot = await getDocs(q);

    this.turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id; // Guardamos el ID del documento
      //this.especialidades.add(turno['especialidad']);
      //this.especialistas.add(turno['especialistaId']);
      return turno;
    });

    this.turnosFiltrados = [...this.turnos]; // Iniciar con todos los turnos
  }


  //======FILTRO=======
  aplicarFiltros() {
    const { especialidad, especialista } = this.filterForm.value;
    this.turnosFiltrados = this.turnos.filter(turno => {
      return (
        (especialidad ? turno.especialidad === especialidad : true) &&
        (especialista ? turno.especialistaId === especialista : true)
      );
    });
  }

  //======MODAL=======

  abrirModal(accion: string, turnoId: string) {
    this.accion = accion;
    this.turnoId = turnoId;
    this.modalComment = '';
    
    switch (accion) {
      case 'cancelar':
        this.modalTitle = 'Cancelar Turno';
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
    }

    this.cerrarModal();
    await this.cargarTurnos(); // Actualiza la lista de turnos
  }
}




