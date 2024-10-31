
import { NavDefaultComponent } from "../navbar/nav-default/nav-default.component";
import { Component, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Form, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';  // Importa FormsModule
import { CommonModule } from '@angular/common';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
//import { confirmarClaveValidator } from '../../validadores/repiteClave';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterEspecialistaComponent } from "./register-especialista/register-especialista.component";
import { RegisterPacienteComponent } from "./register-paciente/register-paciente.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, ReactiveFormsModule, NavDefaultComponent, RegisterEspecialistaComponent, RegisterPacienteComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  showErrorModal: boolean = false;
  errorMessage: string = "";
  formPaciente!: FormGroup;
  usuario = "paciente";
  
  constructor(private router: Router, ) {  //public auth: Auth, private firestore: Firestore
  }


  ngOnInit(): void {
  }

  

  

  RegistrarsEspecialista(){
    /*const correo = this.formEspecialista.get('correo')?.value;
    const clave = this.formEspecialista.get('clave')?.value;
    const confirmarClave = this.formEspecialista.get('confirmarClave')?.value;
    const nombre = this.formEspecialista.get('nombre')?.value;

    if (!correo || !clave || !nombre ||clave.length < 6) {
      this.errorMessage = "Error: credenciales invalidas";
      this.showErrorModal = true; 
    }else if(clave != confirmarClave){
      this.errorMessage = "Error: las contraseñas NO coinciden";
      this.showErrorModal = true; 
    }
    else{

      
    createUserWithEmailAndPassword(this.auth, correo, clave).then((res) =>{
      //this.GuardarDatosUsuarios(nombre,correo)
      this.router.navigate(['/home'])
    }).catch((e)=>{
      this.showErrorModal = true; 
      switch(e.code){
        case "auth/invalid-email":
          this.errorMessage = "Error: email invalido.";
          break;
        case "auth/email-already-in-use":
          this.errorMessage = "Error: email YA en uso.";
          break;
        case "auth/network-request-failed":
          this.errorMessage = "Error: Hubo un error con el internet";
          break;
        default:
          this.errorMessage = e.code;
      }
    });
  }*/}

  /*GuardarDatosUsuarios(nombre:string, correo:string){
    let col = collection(this.firestore, "Registro");
    addDoc (col, {
      "Email": correo,
      "Nombre": nombre,
      "Fecha": Date.now()
    })
  }*/

  closeModal() {
    this.showErrorModal = false; // Ocultar el modal
  }

  

}
