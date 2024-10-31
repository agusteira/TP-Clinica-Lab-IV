import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-register-paciente',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, ReactiveFormsModule,],
  templateUrl: './register-paciente.component.html',
  styleUrl: './register-paciente.component.scss'
})
export class RegisterPacienteComponent {

  formPaciente!: FormGroup;
  previewUrl1: string | ArrayBuffer | null = null;
  previewUrl2: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    this.formPaciente = new FormGroup({
      nombre: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      apellido: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
      edad: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$')]), // Acepta solo números
      DNI: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$')]), // Acepta solo números
      obraSocial: new FormControl("", Validators.required), // Nueva propiedad
      correo: new FormControl("", [Validators.required, Validators.email]),
      clave: new FormControl("", [Validators.required, Validators.minLength(7)]),
      foto1: new FormControl("", Validators.required), // Imagen 1
      foto2: new FormControl("", Validators.required), // Imagen 2
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

  RegistrarPaciente() {
      // Implementa la lógica de registro aquí
  }

}
