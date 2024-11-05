import { Routes } from '@angular/router';
import { LandingComponent } from './componentes/landing/landing.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { UsuariosComponent } from './componentes/administrador/usuarios/usuarios.component';
import { AdminHomeComponent } from './componentes/administrador/admin-home/admin-home.component';

export const routes: Routes = [
    { path: 'landing', component: LandingComponent },
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
    { path: '', redirectTo: '/landing', pathMatch: 'full' },  // Ruta por defecto
];
