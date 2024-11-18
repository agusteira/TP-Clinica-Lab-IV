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
  styleUrl: './mi-perfil.component.scss'
})
export class MiPerfilComponent {
  rutaActual: string = '';
  params: any
  usuario: any
  horarios: any
  spinner: boolean = false
  horariosForm!: FormArray;

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
      console.log(this.horarios)
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
}
