import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoHora',
  standalone: true
})
export class FormatoHoraPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    // Asumimos que la entrada es un rango en el formato "HH:mm - HH:mm"
    const [start] = value.split(' - ');

    return this.convertTo12HourFormat(start);
  }

  private convertTo12HourFormat(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convierte a formato 12 horas

    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  }

}
