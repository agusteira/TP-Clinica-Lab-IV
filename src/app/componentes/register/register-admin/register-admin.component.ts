import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { FirebaseServices } from '../../../services/firebase.services';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './register-admin.component.html',
  styleUrl: './register-admin.component.scss'
})
export class RegisterAdminComponent {
  formAdministrador!: FormGroup;
  previewUrl: string | null = null; // Para la vista previa de la imagen
  showErrorModal: boolean = true; // Para mostrar modal de error
  tituloModal: string = ''; // Título del modal de error
  errorMessage: string = ''; // Mensaje de error
  spinner: boolean = false; // Control del spinner de carga

  constructor(private fb: FormBuilder, private fbsvc:FirebaseServices) {}

  ngOnInit(): void {
    this.formAdministrador = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Solo letras
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Solo letras
      edad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],  // Solo números
      DNI: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],  // Solo números
      correo: ['', [Validators.required, Validators.email]],  // Email válido
      clave: ['', [Validators.required, Validators.minLength(6)]],  // Contraseña mínima de 6 caracteres
      foto: [null, [Validators.required]]  // Foto de perfil obligatoria
    });
  }

  // Función para manejar el registro del administrador
  async RegistrarAdministrador() {
    if (this.formAdministrador.invalid) {
      this.showErrorModal = true;
      this.tituloModal = 'Error';
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }
    try{
      this.spinner = true;
      const retorno = await this.fbsvc.subirAdmin(this.formAdministrador)
      if(retorno == true){
        this.mostrarMensaje("Registro exitoso", "Verifique su mail e inicie sesion")
      }else{
        this.mostrarMensaje("Registro fracasado", retorno)

      } 
    }catch{
      this.mostrarMensaje("Registro fracasado", "El registro no pude llevarse a cabo de manera exitosa")
    }
    finally{
      this.spinner = false;
    }
    
  }

  mostrarMensaje(titulo:string,mensaje:string){
    this.showErrorModal=true;
    this.errorMessage=mensaje
    this.tituloModal=titulo
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      this.previewUrl = URL.createObjectURL(file);
      this.formAdministrador.patchValue({ foto: file });
    }
  }

  // Función para cerrar el modal de error
  closeModal(): void {
    this.showErrorModal = false;
  }
}
