import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTurnos',
  standalone: true
})
export class FiltroTurnosPipe implements PipeTransform {

  transform(turnos: any[], filtroEspecialidad: string, filtroEspecialista: string): any[] {
    if (!turnos) return [];
    return turnos.filter(turno => {
      //filtro por especialidad
      const cumpleEspecialidad = filtroEspecialidad ? turno.especialidad.toLowerCase().includes(filtroEspecialidad.toLowerCase()) : true;
      //filtro por especialista
      const cumpleEspecialista = filtroEspecialista ? turno.nombreEspecialista.toLowerCase().includes(filtroEspecialista.toLowerCase()) : true;
      return cumpleEspecialidad && cumpleEspecialista;
    });
  }

}
