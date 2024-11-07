import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { NavPacienteComponent } from '../../navbar/nav-paciente/nav-paciente.component';
import { CommonModule } from '@angular/common';
import { FiltroTurnosPipe } from '../../../pipelines/filtro-turnos.pipe';

@Component({
  selector: 'app-ver-turnos',
  standalone: true,
  imports: [NavPacienteComponent, CommonModule, FiltroTurnosPipe, FormsModule],
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

  async cancelarTurno(turnoId: string) {
    const motivo = prompt('Ingrese el motivo de la cancelación del turno:');
    if (motivo) {
      const turnoDocRef = doc(this.firestore, 'Turnos', turnoId);
      await updateDoc(turnoDocRef, {
        estado: 'cancelado',
        motivoCancelacion: motivo
      });
      alert('Turno cancelado exitosamente.');
      await this.cargarTurnos();
      this.aplicarFiltros();
    }
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
    const calificacion = prompt('Ingrese su calificación y comentarios sobre la atención:');
    if (calificacion) {
      const turnoDocRef = doc(this.firestore, 'Turnos', turnoId);
      await updateDoc(turnoDocRef, {
        calificacion: calificacion
      });
      alert('Calificación guardada exitosamente.');
      await this.cargarTurnos();
      this.aplicarFiltros();
    }
  }
}
