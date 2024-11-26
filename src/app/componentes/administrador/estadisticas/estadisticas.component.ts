import { Component, OnInit } from '@angular/core';
import { NavAdminComponent } from "../../navbar/nav-admin/nav-admin.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseServices } from '../../../services/firebase.services';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Chart, ArcElement, Tooltip, Legend, Title, PieController, LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from "../../../spinner/spinner.component";

Chart.register(
  PieController,        // Para el gráfico de torta
  LineController,       // Para el gráfico de línea
  BarController,        // Para el gráfico de barras
  ArcElement,           // Elementos de la torta
  PointElement,         // Puntos en gráficos lineales
  LineElement,          // Líneas de conexión
  BarElement,           // Elementos de las barras
  Tooltip,              // Tooltip al pasar el mouse
  Legend,               // Leyenda de los gráficos
  Title,                // Títulos de los gráficos
  CategoryScale,        // Escala para el eje X
  LinearScale           // Escala para el eje Y
);



@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [NavAdminComponent, CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {
  logs: any[] = []
  turnos: any []=[]

  turnosPorEspecialidad: { [key: string]: number } = {};
  turnosPorEspecialidadChart: any;

  turnosPorDia: { [key: string]: number } = {};
  turnosPorDiaChart: any;

  turnosPorMedico: { [key: string]: number } = {};
  turnosPorMedicoChart: any;
  fechaInicio: string | null = null; // Usamos string porque el valor del input es una cadena
  fechaFin: string | null = null;

  turnosFinalizadosPorMedico: { [key: string]: number } = {};
  turnosFinalizadosPorMedicoChart: any;
  fechaInicioFinalizados: string | null = null;
  fechaFinFinalizados: string | null = null;

  spinner: boolean = false
  async ngOnInit() {
    this.spinner = true
    await this.traerEstadisticas()
    this.spinner = false
  }

  constructor(private router: Router, private fbsvc: FirebaseServices,
  ) { // Inyecta Router

  }

  async traerEstadisticas(){
    await this.traerLogs()
    await this.traerTurnos()
  }

  async traerLogs(){
    this.logs = await this.fbsvc.traerLogs()
  }

  async traerTurnos(){
    this.turnos = await this.fbsvc.cargarTurnos()

    this.generarDatosParaGrafico();
    this.renderizarGrafico(); 

    this.generarDatosParaGraficoDeTurnosPorDia();
    this.renderizarGraficoLineal();

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    this.generarDatosParaGraficoDeTurnosPorMedico(startDate, endDate);
    this.renderizarGraficoDeTurnosPorMedico();

    this.generarDatosParaGraficoDeTurnosFinalizadosPorMedico(startDate, endDate);
    this.renderizarGraficoDeTurnosFinalizadosPorMedico();

  }
  //=================GRAFICO 1=================
  
  generarDatosParaGrafico() {
    // Contar turnos por especialidad
    this.turnosPorEspecialidad = this.turnos.reduce((acc, turno) => {
      const especialidad = turno.especialidad; // Cambiado a especialidad
      acc[especialidad] = (acc[especialidad] || 0) + 1;
      return acc;
    }, {});
  }

  renderizarGrafico() {
    setTimeout(() => {
      const ctx = document.getElementById('turnosPorEspecialidadChart') as HTMLCanvasElement;

      if (this.turnosPorEspecialidadChart) {
        this.turnosPorEspecialidadChart.destroy(); // Destruir gráfico anterior si existe
      }

      this.turnosPorEspecialidadChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(this.turnosPorEspecialidad), // Especialidades
          datasets: [
            {
              label: 'Turnos por Especialidad',
              data: Object.values(this.turnosPorEspecialidad), // Cantidades
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'white' // Cambiar color de la leyenda
              }
            },
          }
        }
      });
    }, 0);
  }


  //=================GRAFICO 2=================
  generarDatosParaGraficoDeTurnosPorDia() {
    this.turnosPorDia = this.turnos.reduce((acc, turno) => {
      const fecha = turno.fecha; // Suponiendo que el campo `fecha` tiene el formato 'dd/mm/yyyy'
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});
  }

  renderizarGraficoLineal() {
    setTimeout(() => {
      const ctx = document.getElementById('turnosPorDiaChart') as HTMLCanvasElement;
  
      if (this.turnosPorDiaChart) {
        this.turnosPorDiaChart.destroy(); // Destruir gráfico anterior si existe
      }
  
      this.turnosPorDiaChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(this.turnosPorDia), // Fechas ordenadas
          datasets: [
            {
              label: 'Turnos por Día',
              data: Object.values(this.turnosPorDia), // Cantidades
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              tension: 0.4 // Para suavizar la curva
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'white' // Cambiar color de la leyenda
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'white'
              },
              title: {
                display: true,
                text: 'Fechas',
                color: 'white'
              }
            },
            y: {
              ticks: {
                color: 'white'
              },
              title: {
                display: true,
                text: 'Cantidad de Turnos',
                color: 'white'
              }
            }
          }
        }
      });
    }, 0);
  }

  //=================GRAFICO 3=================

  generarDatosParaGraficoDeTurnosPorMedico(startDate: Date, endDate: Date) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    //Aca quiero generar un filtro en donde a this.turnos le dejamos SOLAMENTE los turnos
    //donde turno[x].estado != "realizado" y lo guardamos en una constante nueva
    const turnosFiltrados = this.turnos.filter(turno => turno.estado !== "realizado");
  
    this.turnosPorMedico = turnosFiltrados.reduce((acc, turno) => {
      const [day, month, year] = turno.fecha.split('/'); // Formato 'dd/mm/yyyy'
      const turnoFecha = new Date(`${year}-${month}-${day}`).getTime();
  
      if (turnoFecha >= start && turnoFecha <= end) {
        const medico = turno.nombreEspecialista; 
        acc[medico] = (acc[medico] || 0) + 1;
      }
      return acc;
    }, {});
  }
  

  renderizarGraficoDeTurnosPorMedico() {
    setTimeout(() => {
      const ctx = document.getElementById('turnosPorMedicoChart') as HTMLCanvasElement;
  
      if (this.turnosPorMedicoChart) {
        this.turnosPorMedicoChart.destroy(); // Destruye el gráfico anterior si existe
      }
  
      this.turnosPorMedicoChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.turnosPorMedico), // Nombres de los médicos
          datasets: [
            {
              label: 'Turnos por Médico',
              data: Object.values(this.turnosPorMedico), // Cantidad de turnos
              backgroundColor: 'rgba(153, 102, 255, 0.8)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'white'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'white'
              },
              title: {
                display: true,
                text: 'Médicos',
                color: 'white'
              }
            },
            y: {
              ticks: {
                color: 'white'
              },
              title: {
                display: true,
                text: 'Cantidad de Turnos',
                color: 'white'
              }
            }
          }
        }
      });
    }, 0);
  }
  
  filtrarTurnos() {
    if (this.fechaInicio && this.fechaFin) {
      const startDate = new Date(this.fechaInicio);
      const endDate = new Date(this.fechaFin);

      this.generarDatosParaGraficoDeTurnosPorMedico(startDate, endDate);
      this.renderizarGraficoDeTurnosPorMedico();
    }
  }

   //=================GRAFICO 4=================
  
   generarDatosParaGraficoDeTurnosFinalizadosPorMedico(startDate: Date, endDate: Date) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
  
    // Filtrar los turnos realizados
    const turnosFinalizados = this.turnos.filter(turno => turno.estado === "realizado");
  
    // Reducir los datos para calcular los turnos finalizados por médico
    this.turnosFinalizadosPorMedico = turnosFinalizados.reduce((acc, turno) => {
      const [day, month, year] = turno.fecha.split('/'); // Formato 'dd/mm/yyyy'
      const turnoFecha = new Date(`${year}-${month}-${day}`).getTime();
  
      if (turnoFecha >= start && turnoFecha <= end) {
        const medico = turno.nombreEspecialista;
        acc[medico] = (acc[medico] || 0) + 1;
      }
      return acc;
    }, {});
  }
  renderizarGraficoDeTurnosFinalizadosPorMedico() {
    setTimeout(() => {
      const ctx = document.getElementById('turnosFinalizadosPorMedicoChart') as HTMLCanvasElement;
  
      if (this.turnosFinalizadosPorMedicoChart) {
        this.turnosFinalizadosPorMedicoChart.destroy(); // Destruye el gráfico anterior si existe
      }
  
      this.turnosFinalizadosPorMedicoChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.turnosFinalizadosPorMedico), // Nombres de los médicos
          datasets: [
            {
              label: 'Turnos Finalizados por Médico',
              data: Object.values(this.turnosFinalizadosPorMedico), // Cantidad de turnos
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'white'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'white'
              },
              title: {
                display: true,
                text: 'Médicos',
                color: 'white'
              }
            },
            y: {
              ticks: {
                color: 'white'
              },
              title: {
                display: true,
                text: 'Cantidad de Turnos',
                color: 'white'
              }
            }
          }
        }
      });
    }, 0);
  }
  filtrarTurnosFinalizados() {
    if (this.fechaInicioFinalizados && this.fechaFinFinalizados) {
      const startDate = new Date(this.fechaInicioFinalizados);
      const endDate = new Date(this.fechaFinFinalizados);
  
      this.generarDatosParaGraficoDeTurnosFinalizadosPorMedico(startDate, endDate);
      this.renderizarGraficoDeTurnosFinalizadosPorMedico();
    } else {
      alert('Por favor, selecciona ambas fechas.');
    }
  }
  
  //==============EXPORTAR PDF==================
  exportarPDF() {
    this.spinner = true
    const pdf = new jsPDF('p', 'mm', 'a4'); // Formato A4
    const content = document.getElementById('exportContent'); // Contenedor a exportar
    const elementsToHide = document.querySelectorAll('.to-hide'); // Elementos a ocultar
  
    // Obtener la fecha actual
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  
    // Ocultar los elementos no deseados
    elementsToHide.forEach((el) => (el as HTMLElement).style.display = 'none');
    this.spinner = false
    if (content) {
      html2canvas(content, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        this.spinner = true
        const imgWidth = 210; // Ancho A4 en mm
        const pageHeight = 297; // Alto A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 20; // Deja espacio para el título
  
        // Agregar título al PDF
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(`Reporte Clínica - ${fechaFormateada}`, imgWidth / 2, 13, { align: 'center' });
  
        // Agregar la imagen generada por html2canvas
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.text(`Reporte Clínica - ${fechaFormateada}`, imgWidth / 2, 10, { align: 'center' }); // Agregar título en cada página
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Mostrar nuevamente los elementos ocultos
        elementsToHide.forEach((el) => (el as HTMLElement).style.display = '');
  
        // Descargar el PDF
        pdf.save(`reporte-clinica-${fechaFormateada}.pdf`);
        this.spinner = false
      }).catch((error) => {
        console.error('Error al generar el PDF:', error);
  
        // Restaurar los elementos incluso en caso de error
        elementsToHide.forEach((el) => (el as HTMLElement).style.display = '');
        this.spinner = false
      });
    }
  }
  
  
  
}
