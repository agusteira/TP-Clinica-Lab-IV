import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'especialidad',
  standalone: true
})
export class EspecialidadPipe implements PipeTransform {
  transform(value: any): string {
    if (!value || value.length === 0) {
      return 'No especificada';
    }
    return value.join(', '); // Unimos las especialidades con una coma
  }
}