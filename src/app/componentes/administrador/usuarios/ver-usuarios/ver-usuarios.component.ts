import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FirebaseServices } from '../../../../services/firebase.services';
import { SpinnerComponent } from "../../../../spinner/spinner.component";
import { EspecialidadPipe } from '../../../../pipelines/especialidad.pipe';
import * as XLSX from 'xlsx'; // Importar la librería xlsx
import { saveAs } from 'file-saver'; // Importar file-saver

@Component({
  selector: 'app-ver-usuarios',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, EspecialidadPipe],
  templateUrl: './ver-usuarios.component.html',
  styleUrl: './ver-usuarios.component.scss'
})
export class VerUsuariosComponent implements OnChanges, OnInit {
  @Input() activarFuncion: string | null = null; // Recibimos el valor desde el componente padre
  listaUsuarios: any[] = []; // Array para almacenar la lista de usuarios
  spinner:boolean=false;
  spinner2:boolean=false

  constructor(private firebaseService: FirebaseServices) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Verificamos si hubo un cambio en activarFuncion
    if (changes['activarFuncion'] && this.activarFuncion === 'verUsuarios') {
      console.log("Activando la sección verUsuarios...");
      this.cargarUsuarios(); // Llamamos a la función cuando la sección se activa
    }
  }

  ngOnInit() {
    // Llamamos a cargarUsuarios cuando el componente se inicia (por si ya está activado al cargarse)
    if (this.activarFuncion === 'verUsuarios') {
      console.log("Componente cargado con seccionActiva 'verUsuarios'");
      this.cargarUsuarios();
    }
  }

  async cargarUsuarios() {
    try {
      this.spinner=true;
      this.listaUsuarios = await this.firebaseService.traerUsuarios(); // Llamamos al servicio para obtener los usuarios
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }finally{
      this.spinner=false;
    }
  }

  // Función para inhabilitar usuario
  async inhabilitarUsuario(usuarioId: string) {
    this.spinner=true;
    console.log(`Inhabilitar usuario con ID: ${usuarioId}`);
    await this.firebaseService.deshabilitarusuario(usuarioId);
    // Actualizar la lista para reflejar el cambio
    this.cargarUsuarios();
  }

  // Función para habilitar usuario
  async habilitarUsuario(usuarioId: string) {
    this.spinner=true;
    console.log(`Habilitar usuario con ID: ${usuarioId}`);
    await this.firebaseService.habilitarusuario(usuarioId);
    // Actualizar la lista para reflejar el cambio
    this.cargarUsuarios();
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  exportarUsuariosExcel() {
    // Preparar los datos en formato de arreglo plano
    const datos = this.listaUsuarios.map((usuario) => ({
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      Edad: usuario.edad,
      DNI: usuario.DNI,
      Correo: usuario.correo,
      TipoUsuario: usuario.tipoUsuario,
      ObraSocial: usuario.tipoUsuario === 'paciente' ? usuario.obraSocial : '-',
      Especialidades: usuario.tipoUsuario === 'especialista' ? usuario.especialidades.join(', ') : '-', // Convertir el array a string
      //Habilitado: usuario.tipoUsuario === 'especialista' ? usuario.habilitado : '-',
    }));

    // Crear un libro de trabajo y una hoja de trabajo
    const hojaTrabajo = XLSX.utils.json_to_sheet(datos);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Usuarios');

    // Generar el archivo Excel y guardarlo
    const excelBuffer = XLSX.write(libroTrabajo, {
      bookType: 'xlsx',
      type: 'array',
    });
    const archivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(archivo, 'usuarios.xlsx');
  }

  async exportarTurnosExcel(usuario:any) {
    this.spinner = true
    const turnos = await this.firebaseService.traerTurnosPorUsuario(usuario.correo)
    console.log(turnos)
    const datos = turnos.map((turno) => ({
      Fecha: turno['fecha'] || '-',
      Hora: turno['horaInicio'] || '-',
      NombreEspecialista: turno['nombreEspecialista'] || '-',
      NombrePaciente: turno['nombrePaciente'] || '-',
      Especialidad: turno['especialidad'] || '-',
      Estado: turno['estado'] || '-',
      ComentariosEspecialista: turno['comentariosEspecialista'] || '-',
      Calificacion: turno['calificacion'] || '-',
      MotivoCancelacion: turno['motivoCancelacion'] || '-',
    }));
    

    const hojaTrabajo = XLSX.utils.json_to_sheet(datos);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, `Turnos-${usuario.nombre}_${usuario.apellido}`);

    // Generar el archivo Excel y guardarlo
    const excelBuffer = XLSX.write(libroTrabajo, {
      bookType: 'xlsx',
      type: 'array',
    });
    const archivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(archivo, `Turnos-${usuario.nombre}${usuario.apellido}.xlsx`);
    this.spinner = false
  }
}
