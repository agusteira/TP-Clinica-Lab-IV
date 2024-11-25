import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTurnos',
  standalone: true
})
export class FiltroTurnosPipe implements PipeTransform {

  transform(turnos: any[], filtroEspecialidad: string, filtroEspecialista: string, filtroHistoriaClinica:string): any[] {
    if (!turnos) return [];
    return turnos.filter(turno => {
      //filtro por especialidad
      const cumpleEspecialidad = filtroEspecialidad ? turno.especialidad.toLowerCase().includes(filtroEspecialidad.toLowerCase()) : true;
      //filtro por especialista
      const cumpleEspecialista = filtroEspecialista ? turno.nombreEspecialista.toLowerCase().includes(filtroEspecialista.toLowerCase()) : true;
      
      let cumpleHistoriaClinica = true;
      if (filtroHistoriaClinica) {
        const historiaClinica = turno.historiaClinica;
        if (historiaClinica) {
          // Buscar en datosFijos
          const valoresFijos = Object.values(historiaClinica.datosFijos || {});
          const cumpleFijos = valoresFijos.some(valor =>
            valor?.toString().toLowerCase().includes(filtroHistoriaClinica.toLowerCase())
          );

          // Buscar en datosVariables
          /*
          const datosVariables = Object.values(historiaClinica.datosVariables || {});
          const valoresVariables = Object.values(datosVariables).flatMap(variable =>
            Object.values(variable as Record<string, any>)
          );
          const cumpleVariables = valoresVariables.some(valor =>
            valor?.toString().toLowerCase().includes(filtroHistoriaClinica.toLowerCase())
          );*/
          const valoresVariables = Object.values(historiaClinica.datosVariables || {});
          const cumpleVariables = valoresVariables.some(valor =>
            valor?.toString().toLowerCase().includes(filtroHistoriaClinica.toLowerCase())
          );


          cumpleHistoriaClinica = cumpleFijos || cumpleVariables;
        } else {
          cumpleHistoriaClinica = false; // No cumple si no hay historia clínica
        }
      }
      
      
      return cumpleEspecialidad && cumpleEspecialista && cumpleHistoriaClinica;
    });
  }

}
