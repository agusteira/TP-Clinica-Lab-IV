import { Routes } from '@angular/router';
import { LandingComponent } from './componentes/landing/landing.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { UsuariosComponent } from './componentes/administrador/usuarios/usuarios.component';
import { AdminHomeComponent } from './componentes/administrador/admin-home/admin-home.component';
import { HomeComponent } from './componentes/home/home.component';
import { HomePacienteComponent } from './componentes/paciente/home-paciente/home-paciente.component';
import { SolicitarTurnoComponent } from './componentes/solicitar-turno/solicitar-turno.component';
import { VerTurnosComponent } from './componentes/paciente/ver-turnos/ver-turnos.component';
import { HomeEspecialistaComponent } from './componentes/especialista/home/home.component';
import { VerTurnosEspecialistaComponent } from './componentes/especialista/ver-turnos-especialista/ver-turnos-especialista.component';
import { TodosLosTurnosComponent } from './componentes/administrador/todos-los-turnos/todos-los-turnos.component';
import { SolicitarTurnoAdminComponent } from './componentes/administrador/solicitar-turno/solicitar-turno.component';
import { MiPerfilComponent } from './componentes/mi-perfil/mi-perfil.component';
import { PacientesComponent } from './componentes/especialista/pacientes/pacientes.component';
import { EstadisticasComponent } from './componentes/administrador/estadisticas/estadisticas.component';

export const routes: Routes = [
    { path: 'landing', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path:"admin",
        children:[
            {
                path:"home", component: AdminHomeComponent
            },
            {
                path: 'adminUsers', component: UsuariosComponent 
            },
            {
                path: "ver-turnos", component: TodosLosTurnosComponent
            },
            {
                path:"solicitar-turno", component: SolicitarTurnoAdminComponent
            },
            {
                path:"estadisticas", component: EstadisticasComponent
            }
        ]
    },
    {
        path:"paciente",
        children:[
            {
                path:"home", component: HomePacienteComponent
            },
            {
                path:"solicitar-turno", component: SolicitarTurnoComponent
            },
            {
                path:"mis-turnos", component: VerTurnosComponent
            },
            {
                path:"mi-perfil", component: MiPerfilComponent
            }
        ]
    },
    {
        path:"especialista",
        children:[
            {
                path:"home", component: HomeEspecialistaComponent
            },
            {
                path:"mis-turnos", component: VerTurnosEspecialistaComponent
            },
            {
                path:"mi-perfil", component: MiPerfilComponent
            },
            {
                path:"pacientes", component: PacientesComponent
            }
        ]
    },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },  // Ruta por defecto
];
