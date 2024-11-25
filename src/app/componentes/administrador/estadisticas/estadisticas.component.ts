import { Component, OnInit } from '@angular/core';
import { NavAdminComponent } from "../../navbar/nav-admin/nav-admin.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseServices } from '../../../services/firebase.services';
import { ChartData, ChartOptions } from 'chart.js';

import { Chart, ArcElement, Tooltip, Legend, Title, PieController, LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';

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
  imports: [NavAdminComponent, CommonModule],
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


  async ngOnInit() {
    await this.traerEstadisticas()
  }

  constructor(private router: Router, private fbsvc: FirebaseServices,
    //private firestore: Firestore
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
  
    this.turnosPorMedico = this.turnos.reduce((acc, turno) => {
      // Convertir la fecha del turno al formato Date
      const [day, month, year] = turno.fecha.split('/'); // Formato 'dd/mm/yyyy'
      const turnoFecha = new Date(`${year}-${month}-${day}`).getTime();
  
      // Verificar si la fecha está dentro del rango
      if (turnoFecha >= start && turnoFecha <= end) {
        const medico = turno.nombreEspecialista; // Tomamos el nombre del médico
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
  
  
}
