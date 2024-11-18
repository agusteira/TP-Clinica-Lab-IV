
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
  usuario = "";
  
  constructor(private router: Router, ) {  //public auth: Auth, private firestore: Firestore
  }


  ngOnInit(): void {
  }


  closeModal() {
    this.showErrorModal = false; // Ocultar el modal
  }

  

}
