import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDelEspecialista',
  standalone: true
})
export class FiltroDelEspecialistaPipe implements PipeTransform {

  transform(turnos: any[], filtroEspecialidad: string, filtroPaciente: string, filtroHistoriaClinica: string): any[] {
    if (!turnos) return [];
    return turnos.filter(turno => {
      const cumpleEspecialidad = filtroEspecialidad ? turno.especialidad.toLowerCase().includes(filtroEspecialidad.toLowerCase()) : true;
      const cumplePaciente = filtroPaciente ? turno.nombrePaciente.toLowerCase().includes(filtroPaciente.toLowerCase()) : true;
      
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

      
      return cumpleEspecialidad && cumplePaciente && cumpleHistoriaClinica;
    });
  }

}
