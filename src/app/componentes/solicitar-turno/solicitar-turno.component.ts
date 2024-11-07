import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavPacienteComponent } from "../navbar/nav-paciente/nav-paciente.component";
import { Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc } from '@angular/fire/firestore';
import { FirebaseServices } from '../../services/firebase.services';
import { Auth, getAuth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, NavPacienteComponent],
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss']
})
export class SolicitarTurnoComponent implements OnInit {
  especialidades: string[] = [];
  especialistas: { nombre: string, id: string }[] = [];
  turnosDisponibles: string[] = [];
  fechasDisponibles: string[] = [];

  selectedEspecialidad: string = '';
  selectedEspecialista: string = '';
  selectedFecha: string = '';
  selectedHora: string = '';

  nombreEspecialista: string = '';
  pacienteId!:string;

  constructor(private firestore: Firestore, private firebaseService: FirebaseServices, // Servicio opcional
    private auth: Auth) { }

  async ngOnInit() {
    await this.cargarEspecialidades();
    if(this.auth.currentUser){
      this.pacienteId = this.auth.currentUser.email!;
      console.log(this.pacienteId)
    }
    
  }

  async cargarEspecialidades() {
    const especialidadesSet = new Set<string>();
    const q = query(collection(this.firestore, 'HorariosEspecialistas'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      const data = doc.data();
      especialidadesSet.add(data['especialidad']);
    });

    this.especialidades = Array.from(especialidadesSet);
  }

  async cargarEspecialistas() {
    this.especialistas = [];
    
    const horariosQuery = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', this.selectedEspecialidad)
    );
    const horariosSnapshot = await getDocs(horariosQuery);
    
    for (const doc of horariosSnapshot.docs) {
      const data = doc.data();
      const correo = data['correo'];
      
      const usuarioQuery = query(
        collection(this.firestore, 'usuarios'),
        where('correo', '==', correo)
      );
      const usuarioSnapshot = await getDocs(usuarioQuery);
      
      if (!usuarioSnapshot.empty) {
        const usuarioData = usuarioSnapshot.docs[0].data();
        const nombreCompleto = `${usuarioData['nombre']} ${usuarioData['apellido']}`;
        
        this.especialistas.push({ nombre: nombreCompleto, id: correo });
      }
    }

    console.log(this.especialistas);
  }

  onEspecialistaChange() {
    const especialistaSeleccionado = this.especialistas.find(especialista => especialista.id === this.selectedEspecialista);
    if (especialistaSeleccionado) {
      this.nombreEspecialista = especialistaSeleccionado.nombre;
    }
  }

  async cargarHorarios() {
    this.turnosDisponibles = [];
    if (!this.selectedFecha) return;
  
    const [dia, mes, año] = this.selectedFecha.split('/').map(Number);
    const fechaSeleccionada = new Date(`${mes}/${dia}/${año}`);
    const fechaString = `${dia}/${mes}/${año}`;

    const turnosQuery = query(
      collection(this.firestore, 'Turnos'),
      where('especialistaId', '==', this.selectedEspecialista),
      where('fecha', '==', fechaString)
    );

    const turnosSnapshot = await getDocs(turnosQuery);
    const horariosReservados = turnosSnapshot.docs.map(doc => doc.data()['horaInicio']);

    const q = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', this.selectedEspecialidad),
      where('correo', '==', this.selectedEspecialista)
    );
  
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      const diaSemana = fechaSeleccionada.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
      const diaDisponible = data['disponibilidad'].find((dia: any) => dia.dia === diaSemana);
  
      if (diaDisponible) {
        diaDisponible.horarios.forEach((horario: any) => {
          const inicio = this.convertirAHorasMinutos(horario.inicio);
          const fin = this.convertirAHorasMinutos(horario.fin);
  
          let actual = inicio;
          while (actual < fin) {
            const siguiente = actual + 30;
            if (siguiente <= fin) {
              const horarioInicio = this.formatoHora(actual);
              if (!horariosReservados.includes(horarioInicio)) {
                this.turnosDisponibles.push(`${horarioInicio} - ${this.formatoHora(siguiente)}`);
              }
            }
            actual = siguiente;
          }
        });
      }
    }
  }
  
  convertirAHorasMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }
  
  formatoHora(minutosDesdeMedianoche: number): string {
    const horas = Math.floor(minutosDesdeMedianoche / 60);
    const minutos = minutosDesdeMedianoche % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  async generarFechasDisponibles() {
    this.fechasDisponibles = [];
    
    const q = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', this.selectedEspecialidad),
      where('correo', '==', this.selectedEspecialista)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      const hoy = new Date();

      for (let i = 0; i < 15; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);

        const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

        const diaDisponible = data['disponibilidad'].find((dia: any) => dia.dia === diaSemana);

        if (diaDisponible) {
          this.fechasDisponibles.push(fecha.toLocaleDateString());
        }
      }
    }
  }

  async solicitarTurno() {
    if (this.selectedEspecialidad && this.selectedEspecialista && this.selectedFecha && this.selectedHora) {
      try {
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
          nombreEspecialista: this.nombreEspecialista // Guardar el nombre completo del especialista
        };
  
        await addDoc(collection(this.firestore, 'Turnos'), turnoData);
        alert(`Turno solicitado para el ${this.selectedFecha} a las ${this.selectedHora} con ${this.nombreEspecialista} en la especialidad de ${this.selectedEspecialidad}.`);
      } catch (error) {
        console.error("Error al solicitar el turno:", error);
        alert('Hubo un error al solicitar el turno. Inténtelo de nuevo.');
      }
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }
  

}


