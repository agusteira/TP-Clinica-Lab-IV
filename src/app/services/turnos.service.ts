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
    const fechaString = `${dia}/${mes}/${año}`; //Fecha seleccionada

    //=====Traigo los turnos ya reservados=====
    const turnosQuery = query(
      collection(this.firestore, 'Turnos'),
      where('especialistaId', '==', selectedEspecialista),
      where('fecha', '==', fechaString)
    );
    const turnosSnapshot = await getDocs(turnosQuery);
    const horariosReservados = turnosSnapshot.docs.map(doc => doc.data()['horaInicio']);

    //=====Traigo los horarios que trabaja el especialista=====
    const q = query(
      collection(this.firestore, 'HorariosEspecialistas'),
      where('especialidad', '==', selectedEspecialidad),
      where('correo', '==', selectedEspecialista)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      //=====Descarto los horarios ya ocupados=====
      const data = querySnapshot.docs[0].data();
      const diaSemana = new Date(`${mes}/${dia}/${año}`).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
      const diaDisponible = data['disponibilidad'].find((dia: any) => dia.dia === diaSemana);

      if (diaDisponible) {
        diaDisponible.horarios.forEach((horario: any) => {
          const inicio = this.convertirAHorasMinutos(horario.inicio);
          const fin = this.convertirAHorasMinutos(horario.fin);

          let actual = inicio;
          //=====Cargo todos los horarios disponibles=====
          while (actual < fin) {
            const siguiente = actual + data['duracionTurno'];
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
  //================== MÉTODOS ADICIONALES ==================

async cargarEspecialidadesPorEspecialista(selectedEspecialista: string): Promise<string[]> {
  const especialidadesSet = new Set<string>();
  
  const q = query(
    collection(this.firestore, 'HorariosEspecialistas'),
    where('correo', '==', selectedEspecialista)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    const data = doc.data();
    especialidadesSet.add(data['especialidad']);
  });

  return Array.from(especialidadesSet); // Convertimos el Set a Array para devolver una lista única de especialidades
}

/*async cargarTodosLosEspecialistas(): Promise<{ nombre: string, id: string }[]> {
  const especialistas: { nombre: string, id: string }[] = [];
  const nombresUnicos = new Set<string>();

  const horariosQuery = query(collection(this.firestore, 'HorariosEspecialistas'));
  console.log(1)
  const horariosSnapshot = await getDocs(horariosQuery);
  for (const doc of horariosSnapshot.docs) {
    const data = doc.data();
    console.log(data)
    const correo = data['correo'];

    const usuarioQuery = query(
      collection(this.firestore, 'usuarios'),
      where('correo', '==', correo)
    );
    console.log(2)
    const usuarioSnapshot = await getDocs(usuarioQuery);
    console.log(usuarioSnapshot.docs[0].data())

    if (!usuarioSnapshot.empty) {
      const usuarioData = usuarioSnapshot.docs[0].data();
      const nombreCompleto = `${usuarioData['nombre']} ${usuarioData['apellido']}`;

      // Agregar solo si el nombre no está en nombresUnicos
      if (!nombresUnicos.has(nombreCompleto)) {
        nombresUnicos.add(nombreCompleto);
        especialistas.push({ nombre: nombreCompleto, id: correo });
      }
    }
  }

  return especialistas; // Devolver la lista de especialistas sin duplicados
}



  //==================VER TURNOS PACIENTE==================
}
*/
async cargarTodosLosEspecialistas(): Promise<{ nombre: string, id: string, foto1: string }[]> {
  const especialistas: { nombre: string, id: string, foto1: string }[] = [];
  const nombresUnicos = new Set<string>();

  // 1. Cargar todos los horarios de especialistas
  const horariosQuery = query(collection(this.firestore, 'HorariosEspecialistas'));
  const horariosSnapshot = await getDocs(horariosQuery);

  // 2. Extraer correos únicos de los horarios
  const correosUnicos = new Set<string>();
  horariosSnapshot.forEach(doc => {
    const correo = doc.data()['correo'];
    if (correo) {
      correosUnicos.add(correo);
    }
  });

  // 3. Hacer una sola consulta para obtener todos los usuarios con correos únicos
  if (correosUnicos.size > 0) {
    const usuariosQuery = query(
      collection(this.firestore, 'usuarios'),
      where('correo', 'in', Array.from(correosUnicos))
    );
    const usuariosSnapshot = await getDocs(usuariosQuery);

    // 4. Crear un mapa de correos a nombres completos y fotos
    const correoANombreMap = new Map<string, { nombreCompleto: string, foto1: string }>();
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      const nombreCompleto = `${data['nombre']} ${data['apellido']}`;
      const foto1 = data['foto1'] || ''; // Aseguramos que foto1 sea un string (vacío si no existe)
      correoANombreMap.set(data['correo'], { nombreCompleto, foto1 });
    });

    // 5. Recorrer los horarios y armar la lista de especialistas sin duplicados
    horariosSnapshot.forEach(doc => {
      const correo = doc.data()['correo'];
      const usuarioData = correoANombreMap.get(correo);

      if (usuarioData && !nombresUnicos.has(usuarioData.nombreCompleto)) {
        nombresUnicos.add(usuarioData.nombreCompleto);
        especialistas.push({ 
          nombre: usuarioData.nombreCompleto, 
          id: correo, 
          foto1: usuarioData.foto1 
        });
      }
    });
  }

  return especialistas; // Devolver la lista de especialistas con nombre, id y foto1 sin duplicados
}

async cargarImagenesEspecialidades(): Promise<{ especialidad: string, imagen: string }[]> {
  const imagenesEspecialidades: { especialidad: string, imagen: string }[] = [];
  const especialidadesQuery = query(collection(this.firestore, 'Especialidades'));
  const especialidadesSnapshot = await getDocs(especialidadesQuery);

  especialidadesSnapshot.forEach(doc => {
    const data = doc.data();
    const especialidad = data['especialidad'];
    const imagen = data['imagen'];
    if (especialidad && imagen) {
      imagenesEspecialidades.push({ especialidad, imagen });
    }
  });

  return imagenesEspecialidades;
}


}
