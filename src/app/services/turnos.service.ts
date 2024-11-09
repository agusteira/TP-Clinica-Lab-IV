import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  constructor(private firestore: Firestore) {}

  //==================GENERAR TURNOS==================

  async cargarEspecialidades(): Promise<string[]> {
    const especialidadesSet = new Set<string>();
    const q = query(collection(this.firestore, 'HorariosEspecialistas'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      const data = doc.data();
      especialidadesSet.add(data['especialidad']);
    });

    return Array.from(especialidadesSet);
  }

  async cargarEspecialistas(selectedEspecialidad: string): Promise<{ nombre: string, id: string }[]> {
    const especialistas: { nombre: string, id: string }[] = [];
    const horariosQuery = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', selectedEspecialidad)
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
        especialistas.push({ nombre: nombreCompleto, id: correo });
      }
    }

    return especialistas;
  }

  async generarFechasDisponibles(selectedEspecialidad: string, selectedEspecialista: string): Promise<string[]> {
    const fechasDisponibles: string[] = [];
    const q = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', selectedEspecialidad),
      where('correo', '==', selectedEspecialista)
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
          fechasDisponibles.push(fecha.toLocaleDateString());
        }
      }
    }
    return fechasDisponibles;
  }

  async cargarHorarios(selectedEspecialidad: string, selectedEspecialista: string, selectedFecha: string): Promise<string[]> {
    const turnosDisponibles: string[] = [];
    const [dia, mes, año] = selectedFecha.split('/').map(Number);
    const fechaString = `${dia}/${mes}/${año}`;

    const turnosQuery = query(
      collection(this.firestore, 'Turnos'),
      where('especialistaId', '==', selectedEspecialista),
      where('fecha', '==', fechaString)
    );

    const turnosSnapshot = await getDocs(turnosQuery);
    const horariosReservados = turnosSnapshot.docs.map(doc => doc.data()['horaInicio']);

    const q = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', selectedEspecialidad),
      where('correo', '==', selectedEspecialista)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      const diaSemana = new Date(`${mes}/${dia}/${año}`).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
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
                turnosDisponibles.push(`${horarioInicio} - ${this.formatoHora(siguiente)}`);
              }
            }
            actual = siguiente;
          }
        });
      }
    }
    return turnosDisponibles;
  }

  async solicitarTurno(turnoData: any): Promise<void> {
    await addDoc(collection(this.firestore, 'Turnos'), turnoData);
  }

  private convertirAHorasMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  private formatoHora(minutosDesdeMedianoche: number): string {
    const horas = Math.floor(minutosDesdeMedianoche / 60);
    const minutos = minutosDesdeMedianoche % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  //==================VER TURNOS PACIENTE==================
}
