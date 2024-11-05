import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavDefaultComponent } from '../../navbar/nav-default/nav-default.component';
import { FirebaseServices } from '../../../services/firebase.services';
import { SpinnerComponent } from "../../../spinner/spinner.component";

@Component({
  selector: 'app-register-especialista',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, ReactiveFormsModule, NavDefaultComponent, SpinnerComponent],
  templateUrl: './register-especialista.component.html',
  styleUrl: './register-especialista.component.scss'
})
export class RegisterEspecialistaComponent {
  showErrorModal: boolean = false;
  spinner:boolean=false;
  errorMessage: string = ""
  tituloModal:string = ""

  formEspecialista!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private fbsvc: FirebaseServices){

  }

  ngOnInit(): void {
    this.formEspecialista = new FormGroup({
      nombre: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      apellido: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      edad: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$')]), // Acepta solo números
      DNI: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$')]), // Acepta solo números
      especialidad: new FormControl("", Validators.required),
      especialidadPersonalizada: new FormControl("", Validators.required),
      correo: new FormControl("", [Validators.required, Validators.email]),
      clave: new FormControl("", [Validators.required, Validators.minLength(7)]),
      foto: new FormControl("", Validators.required), // Asegúrate de que la foto es obligatoria
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        this.formEspecialista.patchValue({ foto: file });

        // Vista previa de la imagen
        const reader = new FileReader();
        reader.onload = () => {
            this.previewUrl = reader.result;
        };
        reader.readAsDataURL(file);
    }
}

  onEspecialidadChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue !== 'otra') {
        this.formEspecialista.get('especialidadPersonalizada')?.clearValidators();
    } else {
        this.formEspecialista.get('especialidadPersonalizada')?.setValidators([Validators.required]);
    }
    this.formEspecialista.get('especialidadPersonalizada')?.updateValueAndValidity();
  }

  async RegistrarsEspecialista(){
    try{
      this.spinner = true
      console.log(this.spinner)
      const retorno = await this.fbsvc.subirEspecialista(this.formEspecialista)
      this.spinner = false
      if(retorno == true){
        this.mostrarMensaje("Registro exitoso", "Verifique su mail e inicie sesion")
        console.log(1)
      }else{
        this.mostrarMensaje("Registro fracasado", retorno)
        console.log(2)
      } 
    }
    catch{
      this.mostrarMensaje("Registro fracasado", "El registro no pude llevarse a cabo de manera exitosa")
      console.log(2)
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
