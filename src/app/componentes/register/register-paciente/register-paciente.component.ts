import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FirebaseServices } from '../../../services/firebase.services';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { edadMayorDe18 } from '../../../validators/validatorEdad.validator';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxCaptchaModule } from 'ngx-captcha';

@Component({
  selector: 'app-register-paciente',
  standalone: true,
  imports: [NgxCaptchaModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './register-paciente.component.html',
  styleUrl: './register-paciente.component.scss'
})
export class RegisterPacienteComponent {
  //=========CAPTCHA=============
  siteKey: string = "6LdBZ3YqAAAAALLmG7Jp4zxYIjoHbsSsqAr12t2-"

  //=========CAPTCHA=============

  showErrorModal: boolean = false;
  errorMessage: string = ""
  tituloModal:string = ""
  spinner:boolean=false;

  formPaciente!: FormGroup;
  previewUrl1: string | ArrayBuffer | null = null;
  previewUrl2: string | ArrayBuffer | null = null;

  constructor(private fbsvc: FirebaseServices,private http: HttpClient){

  }

  ngOnInit(): void {
    this.formPaciente = new FormGroup({
      nombre: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      apellido: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      edad: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$'), edadMayorDe18()]), // Acepta solo números
      DNI: new FormControl("", [Validators.required, Validators.pattern('^[0-9]{8}$')]), // Acepta solo números
      obraSocial: new FormControl("", Validators.required), // Nueva propiedad
      correo: new FormControl("", [Validators.required, Validators.email]),
      clave: new FormControl("", [Validators.required, Validators.minLength(7)]),
      foto1: new FormControl("", Validators.required), // Imagen 1
      foto2: new FormControl("", Validators.required), // Imagen 2
      recaptcha: new FormControl("", Validators.required)
    });
  }

  onFileSelected(event: Event, inputNumber: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        if (inputNumber === 1) {
            this.formPaciente.patchValue({ foto1: file });

            // Vista previa de la primera imagen
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl1 = reader.result;
            };
            reader.readAsDataURL(file);
        } else if (inputNumber === 2) {
            this.formPaciente.patchValue({ foto2: file });

            // Vista previa de la segunda imagen
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl2 = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }
}

  async RegistrarPaciente() {
    try{
      this.spinner = true
      const retorno = await this.fbsvc.subirPaciente(this.formPaciente)
      this.spinner = false
      if(retorno == true){
        this.mostrarMensaje("Registro exitoso", "Verifique su mail e inicie sesion")
        this.formPaciente.reset();  // Vaciar el formulario
        this.previewUrl1 = null;    // Limpiar las vistas previas de las imágenes
        this.previewUrl2 = null;
      }else{
        this.mostrarMensaje("Registro fracasado", retorno)
      } 
    }
    catch{
      this.mostrarMensaje("Registro fracasado", "El registro no pude llevarse a cabo de manera exitosa")
    }
    
  }

  mostrarMensaje(titulo:string,mensaje:string){
    this.showErrorModal=true;
    this.errorMessage=mensaje
    this.tituloModal=titulo
  }

  closeModal() {
    this.showErrorModal = false; // Ocultar el modal
  }

}
