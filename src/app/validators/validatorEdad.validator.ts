import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador personalizado para comprobar si la edad es mayor a 18
export function edadMayorDe18(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const edad = control.value;
    // Verificamos si la edad es un número y mayor que 18
    if (edad && (isNaN(edad) || edad < 18)) {
      return { mayorDe18: true };  // Si no cumple, devolvemos un error
    }
    return null;  // Si cumple, devolvemos null (sin error)
  };
}
