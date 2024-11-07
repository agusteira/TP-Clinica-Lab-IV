import { Routes } from '@angular/router';
import { LandingComponent } from './componentes/landing/landing.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { UsuariosComponent } from './componentes/administrador/usuarios/usuarios.component';
import { AdminHomeComponent } from './componentes/administrador/admin-home/admin-home.component';
import { HomeComponent } from './componentes/home/home.component';
import { HomePacienteComponent } from './componentes/paciente/home-paciente/home-paciente.component';
import { SolicitarTurnoComponent } from './componentes/solicitar-turno/solicitar-turno.component';
import { VerTurnosComponent } from './componentes/ver-turnos/ver-turnos.component';

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
            }
        ]
    },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },  // Ruta por defecto
];
