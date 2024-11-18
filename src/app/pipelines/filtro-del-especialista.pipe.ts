import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDelEspecialista',
  standalone: true
})
export class FiltroDelEspecialistaPipe implements PipeTransform {

  transform(turnos: any[], filtroEspecialidad: string, filtroPaciente: string): any[] {
    if (!turnos) return [];
    return turnos.filter(turno => {
      const cumpleEspecialidad = filtroEspecialidad ? turno.especialidad.toLowerCase().includes(filtroEspecialidad.toLowerCase()) : true;
      const cumplePaciente = filtroPaciente ? turno.nombrePaciente.toLowerCase().includes(filtroPaciente.toLowerCase()) : true;
      return cumpleEspecialidad && cumplePaciente;
    });
  }

}
