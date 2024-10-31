import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavDefaultComponent } from '../../navbar/nav-default/nav-default.component';

@Component({
  selector: 'app-register-especialista',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, ReactiveFormsModule, NavDefaultComponent],
  templateUrl: './register-especialista.component.html',
  styleUrl: './register-especialista.component.scss'
})
export class RegisterEspecialistaComponent {
  formEspecialista!: FormGroup;
  formPaciente!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

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

  RegistrarsEspecialista(){}

}
