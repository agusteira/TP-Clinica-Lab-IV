import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavDefaultComponent } from '../../navbar/nav-default/nav-default.component';
import { FirebaseServices } from '../../../services/firebase.services';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { edadMayorDe18 } from '../../../validators/validatorEdad.validator';

@Component({
  selector: 'app-register-especialista',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, ReactiveFormsModule, NavDefaultComponent, SpinnerComponent],
  templateUrl: './register-especialista.component.html',
  styleUrl: './register-especialista.component.scss'
})
export class RegisterEspecialistaComponent {
  showErrorModal: boolean = false;
  spinner: boolean = false;
  errorMessage: string = ""
  tituloModal: string = ""

  formEspecialista!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private fbsvc: FirebaseServices) { }

  ngOnInit(): void {
    this.formEspecialista = new FormGroup({
      nombre: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      apellido: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      edad: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$'), edadMayorDe18()]),
      DNI: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$')
      ]),
      cardiologia: new FormControl(false),
      dermatologia: new FormControl(false),
      pediatria: new FormControl(false),
      neurologia: new FormControl(false),
      otra: new FormControl(false),
      especialidadesPersonalizadas: new FormArray([]), // Array para las especialidades personalizadas
      correo: new FormControl("", [Validators.required, Validators.email]),
      clave: new FormControl("", [Validators.required, Validators.minLength(7)]),
      foto: new FormControl("", Validators.required),
    });
  }

  get especialidadesPersonalizadas() {
    return (this.formEspecialista.get('especialidadesPersonalizadas') as FormArray);
  }

  addEspecialidad() {
    const especialidadGroup = new FormGroup({
      nombre: new FormControl("", Validators.required),
    });
    this.especialidadesPersonalizadas.push(especialidadGroup);
  }

  removeEspecialidad(index: number) {
    this.especialidadesPersonalizadas.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formEspecialista.patchValue({ foto: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async RegistrarsEspecialista() {
    try {
      this.spinner = true;

      // Extraemos las especialidades seleccionadas
      const especialidadesSeleccionadas = this.getEspecialidadesSeleccionadas();
      const retorno = await this.fbsvc.subirEspecialista(this.formEspecialista, especialidadesSeleccionadas);
      this.spinner = false;

      if (retorno == true) {
        this.mostrarMensaje("Registro exitoso", "Verifique su mail e inicie sesión");
      } else {
        this.mostrarMensaje("Registro fracasado", retorno);
      }
    } catch {
      this.mostrarMensaje("Registro fracasado", "El registro no pude llevarse a cabo de manera exitosa");
    }
  }

  getEspecialidadesSeleccionadas() {
    const especialidades = [];
    if (this.formEspecialista.get('cardiologia')?.value) especialidades.push("Cardiología");
    if (this.formEspecialista.get('dermatologia')?.value) especialidades.push("Dermatología");
    if (this.formEspecialista.get('pediatria')?.value) especialidades.push("Pediatría");
    if (this.formEspecialista.get('neurologia')?.value) especialidades.push("Neurología");
    if (this.formEspecialista.get('otra')?.value) {
      // Agregar las especialidades personalizadas
      this.especialidadesPersonalizadas.controls.forEach((control, index) => {
        const nombre = (control as FormGroup).get('nombre')?.value;
        if (nombre) {
          especialidades.push(nombre);
        }
      });
    }
    return especialidades;
  }

  onOtraChange() {
    const otra = this.formEspecialista.get('otra')?.value;
    if (otra) {
      this.addEspecialidad(); // Agregar una especialidad por defecto si "Otra" está seleccionada
    }
  }

  mostrarMensaje(titulo: string, mensaje: string) {
    this.showErrorModal = true;
    this.errorMessage = mensaje;
    this.tituloModal = titulo;
  }

  closeModal() {
    this.showErrorModal = false;
  }
}