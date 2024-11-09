import { Component } from '@angular/core';
import { NavDefaultComponent } from "../navbar/nav-default/nav-default.component";
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule
import { Firestore } from '@angular/fire/firestore';
import { FirebaseServices } from '../../services/firebase.services';
import { SpinnerComponent } from "../../spinner/spinner.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, NavDefaultComponent, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  correo!: string;
  clave!: string;
  showErrorModal: boolean = false;
  errorMessage: string = "";
  spinner: boolean = false;
  tituloModal:string="";

  usuarios = [
    { correo: 'dicejet330@gianes.com', clave: '1234567', rol: 'Paciente', imagen: 'https://cdn-icons-png.flaticon.com/512/387/387585.png' },
    { correo: 'soyakod465@anypng.com', clave: '1234567', rol: 'Paciente', imagen: 'https://cdn-icons-png.flaticon.com/512/387/387585.png' },
    { correo: 'pafij27134@gianes.com', clave: '1234567', rol: 'Paciente', imagen: 'https://cdn-icons-png.flaticon.com/512/387/387585.png' },
    { correo: 'cetaho4087@cironex.com', clave: '1234567', rol: 'Especialista', imagen: 'https://static.vecteezy.com/system/resources/previews/018/914/708/non_2x/doctor-woman-flat-icon-png.png' },
    { correo: 'vogokeg611@cironex.com', clave: '1234567', rol: 'Especialista', imagen: 'https://static.vecteezy.com/system/resources/previews/018/914/708/non_2x/doctor-woman-flat-icon-png.png' },
    { correo: 'admin@admin.com', clave: '123456', rol: 'Admin', imagen: 'https://cdn-icons-png.flaticon.com/512/2206/2206368.png' }
  ];
  

  constructor(private router: Router, private auth: Auth, private fbsvc: FirebaseServices) { // Inyecta Router

  }

  async IniciarSesion(correo: string, clave: string) {
    if (!correo || !clave || clave.length < 6) {
      this.setModal("ERROR", "Error: No se pudo iniciar sesión. Verifica tus credenciales.");
      return;
    }
    this.spinner = true; 
  
    try {
      const loginResult = await this.fbsvc.loguear(correo, clave);

      if (loginResult) {
        await this.handleLoginSuccess(correo);
      }
    } catch (e: any) {
      this.handleError(e);
    } finally {
      this.spinner = false;
    }
  }
  
  private async handleLoginSuccess(correo: string) {
    try {
      const flag = await this.fbsvc.traerFlag(correo);
      if(flag=="true"){
        const tipoUsuario = await this.fbsvc.traerTipoUsuario(correo);

      switch(tipoUsuario){
        case"paciente":
          this.router.navigate(['paciente/home']);
          break
        case"admin":
          this.redirigir("admin/home")
          break
        case"especialista":
          const habilitacionEspecialista = await this.fbsvc.verificarHabilitacion(correo)
          switch(habilitacionEspecialista){
            case"aprobado":
              this.router.navigate(['/especialista/home']);
              break
            case"pendiente":
              this.setModal("PENDIENTE", "Su usuario todavia esta pendiente de aprobacion")
              break
            case"rechazado":
              this.setModal("RECHAZADO", "Su usuario ha sido rechazado")
              break
          }
          break
      }
      }else{
        this.setModal("ERROR","Este usuario NO esta habilitado para entrar");
      }
      
    } catch (error) {
      this.setModal("ERROR","Error al obtener el tipo de usuario.");
    }
  }
  
  private handleError(error: any) {
    this.showErrorModal = true;
  
    // Verificamos si el error es por correo no verificado
    if (error.message === "El email no ha sido verificado.") {
      this.tituloModal = "Email no verificado"
      this.errorMessage = "Por favor, verifica tu correo electrónico antes de iniciar sesión.";
    } else {
      // Manejamos errores específicos de Firebase Authentication
      this.errorMessage = this.getFirebaseErrorMessage(error);
    }
  }
  
  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case "auth/invalid-email":
        return "Error: Email inválido.";
      case "auth/invalid-credential":
        return "Error: Credenciales inválidas.";
      case "auth/network-request-failed":
        return "Error: Hubo un error con el internet.";
      default:
        return "Error desconocido. Intenta nuevamente.";
    }
  }
  
  private setModal(titulo:string, message: string) {
    this.tituloModal = titulo
    this.errorMessage = message;
    this.showErrorModal = true;
  }
  
  

  /*LogIniciarSesion(){
    let col = collection(this.firestore, "logIniciarSesion");
    addDoc (col, {
      "user": this.correo,
      "fecha": Date.now()
    })
  }*/

  closeModal() {
    this.showErrorModal = false; // Ocultar el modal
  }

  AccesoRapido(correo:string, clave:string) {
    this.correo =correo;
    this.clave = clave;
  }
  redirigir(ruta:string) {
    this.router.navigate([ruta]);
  }
}
