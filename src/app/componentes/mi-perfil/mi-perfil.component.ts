import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavAdminComponent } from "../navbar/nav-admin/nav-admin.component";
import { NavPacienteComponent } from "../navbar/nav-paciente/nav-paciente.component";
import { NavEspecialistaComponent } from "../navbar/nav-especialista/nav-especialista.component";
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { FirebaseServices } from '../../services/firebase.services';
import { EspecialidadPipe } from "../../pipelines/especialidad.pipe";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { animate, style, transition, trigger } from '@angular/animations';

interface Horario {
  especialidad: string;
  duracionTurno: number;
  disponibilidad: Dia[];
  editando?: boolean;
}

interface Dia {
  dia: string;
  horarios: Intervalo[];
}

interface Intervalo {
  inicio: string;
  fin: string;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NavAdminComponent, NavPacienteComponent, NavEspecialistaComponent, CommonModule, SpinnerComponent, EspecialidadPipe],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss',
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
export class MiPerfilComponent {
  rutaActual: string = '';
  params: any
  usuario: any
  horarios: any
  spinner: boolean = false
  horariosForm!: FormArray;
  especialidadSeleccionada!: any
  especialidades: string[] = [];
  turnosFinalizados: any

  constructor(private route: ActivatedRoute, public fbsvc: FirebaseServices, private fb: FormBuilder) {}

  async ngOnInit() {
    
    this.spinner = true
    try{
      this.route.queryParams.subscribe(params => {
        this.params = params
      });
  
      this.usuario = await this.fbsvc.traerUsuarioSinCorreo()
  
      if(this.params.tipo == "especialista"){
        this.horarios = await this.fbsvc.traerHorariosEspecialistas()
        //Form validador de horarios
        this.horariosForm = this.fb.array(
          this.horarios.map((horario: Horario) =>
            this.fb.array(
              horario.disponibilidad.map((dia: Dia) =>
                this.fb.group({
                  inicio: [dia.horarios?.[0]?.inicio || '', [Validators.required]],
                  fin: [dia.horarios?.[0]?.fin || '', [Validators.required]]
                })
              )
            )
          )
        );
      }
      if(this.params.tipo == "paciente"){
        console.log(this.params.tipo)
        this.turnosFinalizados = await this.fbsvc.cargarTurnosFinalizadosSinCorte(this.usuario.correo);
        this.turnosFinalizados.forEach((turno: any) => {
          console.log(turno)
          if (!this.especialidades.includes(turno.especialidad)) {
            this.especialidades.push(turno.especialidad);
          }
        });
        
      }
    }finally{
      
    this.spinner = false
    }
  }
  

  activarEdicion(horario: any) {
    horario.editando = true;
  }

  guardarEdicion(horario: Horario, index: number): void {
    this.spinner = true
    const horarioFormArray = this.getHorarioArray(index); // Obtén el FormArray del horario
    const valoresFormulario = horarioFormArray.value; // Obtén los valores del formulario
  
    // Actualiza los valores en el array `this.horarios`
    horario.disponibilidad = horario.disponibilidad.map((dia, diaIndex) => ({
      ...dia,
      horarios: [
        {
          inicio: valoresFormulario[diaIndex].inicio,
          fin: valoresFormulario[diaIndex].fin,
        },
      ],
    }));
  
    horario.editando = false;
    //console.log('Horarios guardados:',horario);
    this.fbsvc.actualizarHorarioEspecialista(horario)
    this.spinner = false
    
  }

  cancelarEdicion(horario: any, index: number) {
    // Restablece los datos (puedes hacer una copia original si es necesario)
    horario.editando = false;
    console.log(`Edición cancelada para la especialidad ${horario.especialidad}`);
  }



   // Retorna el horario mínimo permitido basado en el día
   getMinTime(dia: string): string {
    if (['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].includes(dia.toLowerCase())) {
      return '08:00';
    } else if (dia.toLowerCase() === 'sábado') {
      return '08:00';
    }
    return '00:00';
  }

  // Retorna el horario máximo permitido basado en el día
  getMaxTime(dia: string): string {
    if (['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].includes(dia.toLowerCase())) {
      return '19:00';
    } else if (dia.toLowerCase() === 'sábado') {
      return '14:00';
    }
    return '23:59';
  }

  // Valida si el horario está dentro de los límites
  esHorarioValido(horarioIndex: number, diaIndex: number): boolean {
    // Asegurarte de que los tipos sean explícitos
    const horarioArray = this.horariosForm.at(horarioIndex) as FormArray;
    const grupo = horarioArray.at(diaIndex) as FormGroup;
  
    const inicio = grupo.get('inicio')?.value;
    const fin = grupo.get('fin')?.value;
  
    const dia = this.horarios[horarioIndex].disponibilidad[diaIndex].dia;
    return (
      inicio >= this.getMinTime(dia) &&
      fin <= this.getMaxTime(dia) &&
      inicio < fin // Validar que inicio sea menor que fin
    );
  }
  

  // Acción al cambiar un valor
  validarHorario(horarioIndex: number, diaIndex: number): void {
    const valido = this.esHorarioValido(horarioIndex, diaIndex);
  
    // Acceder explícitamente al FormGroup usando "at"
    const horarioArray = this.horariosForm.at(horarioIndex) as FormArray; // Casteo a FormArray
    const grupo = horarioArray.at(diaIndex) as FormGroup; // Casteo a FormGroup
  
    if (!valido) {
      grupo.get('inicio')?.setErrors({ invalid: true });
      grupo.get('fin')?.setErrors({ invalid: true });
    } else {
      grupo.get('inicio')?.setErrors(null);
      grupo.get('fin')?.setErrors(null);
    }
  }
  
  getHorarioArray(horarioIndex: number): FormArray {
    return this.horariosForm.at(horarioIndex) as FormArray; // Casteamos a FormArray
  }
  
  getDiaGroup(horarioIndex: number, diaIndex: number): FormGroup {
    return this.getHorarioArray(horarioIndex).at(diaIndex) as FormGroup; // Casteamos a FormGroup
  }
  isFormGroupValid(horarioIndex: number): boolean {
    const horarioArray = this.getHorarioArray(horarioIndex);
    return horarioArray.valid; // Verifica si el FormArray completo es válido
  }
  
  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }


  async exportarHistoriaClinicaFiltrada(especialidadSeleccionada: any) {
    this.spinner = true;
    
    //Filtrar por especialidad seleccionada
    const turnosFiltrados = this.turnosFinalizados.filter(
      (turno: any) => turno.especialidad === especialidadSeleccionada
    );
    
    const historiaClinicaDiccionario = await this.traerHistoriaClinica(turnosFiltrados)
    console.log(historiaClinicaDiccionario)
    this.exportarPDF(historiaClinicaDiccionario)
    this.spinner = false;
  }

  private async traerHistoriaClinica(turnos:any){
    const historiaClinicaDiccionario: any = {};
  
    turnos.forEach((turno: { [x: string]: any; }) => {
      console.log(`Procesando turno con ID: ${turno['id']}`);
  
      const historiaClinicaKey = Object.keys(this.usuario.historiaClinica.datosVariables).find(
        key => key === turno['id'] // Comparar el nombre del objeto (key) con el id del turno
      );
  
      if (historiaClinicaKey) {
        // Si se encuentra, obtener el valor asociado
        const historiaClinica = this.usuario.historiaClinica.datosVariables[historiaClinicaKey];
        //console.log(`Historia clínica encontrada para el turno ${turno['id']}:`, historiaClinica);
        historiaClinicaDiccionario[turno['id']] = historiaClinica;
      } else {
        console.warn(`No se encontró historia clínica para el turno ${turno['id']}`);
      }
    });
  
    return historiaClinicaDiccionario
  }


  private exportarPDF(historiaClinica: any) {
    const doc = new jsPDF();
    const logo = 'data:image/png;base64,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'; // Base64 del logo
    doc.addImage(logo, 'PNG', 10, 10, 25, 25); // x, y, ancho, alto
  
    doc.setFontSize(18);
    const titulo = `Historia Clínica - ${this.usuario.nombre} ${this.usuario.apellido} - ${this.especialidadSeleccionada}`;
    doc.text(titulo, 70, 30); 

    const fechaActual = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaActual}`, 180, 290);
  
    const historiaClinicaArray = Object.keys(historiaClinica).map((key, index) => {
      const item = historiaClinica[key];
  

      const datosVariables = Object.keys(item.datosVariables)
        .map(
          (varKey) => `• ${varKey}: ${item.datosVariables[varKey]}`
        )
        .join('\n');
  
      return {
        numero: index + 1,
        altura: item.datosFijos.altura || 'N/A',
        peso: item.datosFijos.peso || 'N/A',
        presion: item.datosFijos.presion || 'N/A',
        temperatura: item.datosFijos.temperatura || 'N/A',
        datosVariables: datosVariables,
      };
    });
  
    // CREAR TABLA
    autoTable(doc, {
      head: [['#', 'Altura', 'Peso', 'Presión', 'Temperatura', 'Datos Variables']],
      body: historiaClinicaArray.map((item) => [
        item.numero,
        item.altura,
        item.peso,
        item.presion,
        item.temperatura,
        item.datosVariables,
      ]),
      startY: 50, // Donde empieza la tabla
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [22, 160, 133] }, // Color del encabezado
      columnStyles: {
        5: { cellWidth: 60 }, // Ajustar ancho para "Datos Variables"
      },
      didParseCell: function (data) {
        // Aplicar estilos específicos si es necesario
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.styles.fontSize = 9;
        }
      },
    });
  
    // GUARDAR PDF
    doc.save(`Historia Clínica - ${this.usuario.nombre} ${this.usuario.apellido} - ${this.especialidadSeleccionada}.pdf`);
  }
  
  
  
}
