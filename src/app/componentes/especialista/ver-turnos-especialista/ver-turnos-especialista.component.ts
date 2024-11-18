import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroDelEspecialistaPipe } from '../../../pipelines/filtro-del-especialista.pipe';
import { NavEspecialistaComponent } from '../../navbar/nav-especialista/nav-especialista.component';
import { SpinnerComponent } from "../../../spinner/spinner.component";
import { FirebaseServices } from '../../../services/firebase.services';

@Component({
  selector: 'app-ver-turnos-especialista',
  standalone: true,
  imports: [NavEspecialistaComponent, CommonModule, FormsModule, FiltroDelEspecialistaPipe, SpinnerComponent],
  templateUrl: './ver-turnos-especialista.component.html',
  styleUrls: ['./ver-turnos-especialista.component.scss']
})
export class VerTurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad: string = '';
  filtroPaciente: string = '';
  especialistaId: string | null = null;

  // Variables para el modal
  showModal: boolean = false;
  modalTitle: string = '';
  modalComment: string = '';
  accion: string = '';
  turnoId: string | null = null;

  //Modal2
  showComentarioModal = false;
  comentariosEspecialista: string | null = null;
  motivoCancelacion: string | null = null;
  calificacionAtencion : string | null = null;

  spinner:boolean = false;

  //Historia clinica
  showModalHistoriaClinica :boolean = false;
  datosFijos = {
    altura: 0,
    peso: 0,
    temperatura: 0,
    presion: ''
  }
  datosVariables: { clave: string; valor: string }[] = [];
  turnoAbierto: any
  pacienteAbierto: any
  turnazo:any

  private unsubscribeTurnos?: () => void;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private fbsvc:FirebaseServices,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.especialistaId = this.auth.currentUser ? this.auth.currentUser.email : null;
    if (this.especialistaId) {
      this.spinner = true;
      // Iniciar la suscripción a Firestore
      await this.cargarTurnos();

      this.spinner = false;
    }
  }

  ngOnDestroy() {
    // Cancelar la suscripción cuando el componente se destruya
    if (this.unsubscribeTurnos) {
      this.unsubscribeTurnos();
    }
  }

  cargarTurnos() {
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('especialistaId', '==', this.especialistaId)
    );
  
    // Suscribirse a los cambios en Firestore
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      this.turnos = [];
  
      querySnapshot.forEach((doc) => {
        const turno = doc.data();
        turno['id'] = doc.id;
  
        // Verificar si se debe mostrar el botón de agregar historia clínica
        if (turno['estado'] === 'realizado') {
          this.verificarQueNoSeAgregoLaHistoriaClinica(turno);
        }
  
        this.turnos.push(turno);
      });
  
      console.log('Turnos actualizados:', this.turnos);
      this.cdr.detectChanges(); // Forzar detección de cambios en el DOM
    });
  
    // Retornamos la función para cancelar la suscripción si es necesario
    return unsubscribe;
  }
  
  verComentario(comentariosEspecialista: string | null, motivoCancelacion: string | null, calificacion: string | null): void {
    this.comentariosEspecialista = comentariosEspecialista && comentariosEspecialista.trim() ? comentariosEspecialista : null;
    this.motivoCancelacion = motivoCancelacion && motivoCancelacion.trim() ? motivoCancelacion : null;
    this.calificacionAtencion  = calificacion && calificacion.trim() ? calificacion : null;
    this.showComentarioModal = true;
  }

  cerrarComentarioModal(): void {
    this.showComentarioModal = false;
    this.comentariosEspecialista = null;
    this.motivoCancelacion = null;
  }

  abrirModal(accion: string, turnazo: any) {
    this.accion = accion;
    this.turnazo = turnazo
    this.turnoId = turnazo.id;
    this.modalComment = '';
    
    switch (accion) {
      case 'cancelar':
        this.modalTitle = 'Cancelar Turno';
        break;
      case 'rechazar':
        this.modalTitle = 'Rechazar Turno';
        break;
      case 'finalizar':
        this.modalTitle = 'Finalizar Turno';
        break;
      case 'aceptar':
        this.modalTitle = 'Aceptar Turno';
        break;
      case 'verResena':
        this.modalTitle = 'Reseña del Turno';
        const turno = this.turnos.find(t => t.id === turnazo.id);
        this.modalComment = turno?.comentariosEspecialista || '';
        break;
    }
    
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  async confirmarAccion() {
    this.spinner = true;
    if (!this.turnoId) return;
    const turnoDocRef = doc(this.firestore, 'Turnos', this.turnoId);
  
    switch (this.accion) {
      case 'cancelar':
        await updateDoc(turnoDocRef, { estado: 'cancelado', motivoCancelacion: this.modalComment });
        break;
      case 'rechazar':
        await updateDoc(turnoDocRef, { estado: 'rechazado', motivoRechazo: this.modalComment });
        break;
      case 'finalizar':
        await updateDoc(turnoDocRef, { estado: 'realizado', comentariosEspecialista: this.modalComment });
        break;
      case 'aceptar':
        await updateDoc(turnoDocRef, { estado: 'aceptado' });
        break;
    }
  
    this.cerrarModal();
    //await this.cargarTurnos(); // Actualiza completamente los turnos desde Firebase
    this.spinner = false;
  }
  

  //===========GENERAR HISTORIA CLINICA=============

  async abrirModalHistoriaClinica(turno: any){
    this.spinner = true
    this.turnoAbierto = turno
    this.pacienteAbierto = await this.fbsvc.traerUsuario(turno.pacienteId)
    if(this.pacienteAbierto!['historiaClinica']){
      this.datosFijos = this.pacienteAbierto!['historiaClinica']["datosFijos"]
    }
    this.spinner = false
    this.showModalHistoriaClinica = true
  }
  cerrarModalHistoriaClinica(){
    this.showModalHistoriaClinica = false
    this.turnoAbierto = null
  }

  agregarDatoVariable() {
    if (this.datosVariables.length < 3) {
      this.datosVariables.push({ clave: '', valor: '' });
    }
  }

  eliminarDatoVariable(index: number) {
    this.datosVariables.splice(index, 1);
  }

  enviarDatos(turno:any) {
    const datosCompletos = {
      datosFijos: this.datosFijos,
      datosVariables: this.datosVariables,
    };
    this.agregarHistoriaClinica(turno, datosCompletos)
    this.cerrarModalHistoriaClinica();
  }

  async agregarHistoriaClinica(turno:any, datosCompletos:any){
    this.spinner = true

    if(!this.pacienteAbierto!['historiaClinica']){
      console.log("NO tiene historia clinica")
      const historiaClinica ={
        "datosFijos": datosCompletos.datosFijos
      }
      await this.fbsvc.generarHistoria(turno.pacienteId, historiaClinica)
      this.pacienteAbierto!['historiaClinica'] = historiaClinica
      
    }
    console.log(this.pacienteAbierto)
    this.agregarDatosVaribles(turno, this.pacienteAbierto, datosCompletos.datosVariables)
  }

  async agregarDatosVaribles(turno:any, paciente: any, datosVariables:any){
    if (!paciente.historiaClinica?.datosVariables) {
      paciente.historiaClinica.datosVariables = {}; 
    }

    paciente.historiaClinica.datosVariables[turno.id] = datosVariables
    await this.fbsvc.agregarDatosVariables(turno.pacienteId, paciente.historiaClinica)
    .then(async() => {console.log('Proceso completado')
      this.verificarQueNoSeAgregoLaHistoriaClinica(turno)
      this.datosVariables = []
    })
    .catch(error => console.error('Error en el componente:', error));


    this.spinner = false
  }

  async verificarQueNoSeAgregoLaHistoriaClinica(turno: any): Promise<void> {
    const paciente = await this.fbsvc.traerUsuario(turno.pacienteId);
    // Evaluamos la condición y almacenamos el resultado en una propiedad del turno
    turno.mostrarBotonAgregarHistoria =
      !paciente!['historiaClinica'] ||
      !paciente!['historiaClinica']['datosVariables'] ||
      !paciente!['historiaClinica']['datosVariables'][turno.id];

      this.cdr.detectChanges();
  }
  
}
/*
historiaClinica:{
  datosFijos{
    altura:{}
    peso:{}
    temperatura:{}
    presion:{}
  }
  variables{
    {id-turno}{
      {clave}:{valor}
      {clave}:{valor}
      {clave}:{valor}
    }
  }
}
  */