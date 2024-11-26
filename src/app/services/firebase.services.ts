import { Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, doc, Firestore, getDocs, getFirestore, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { Storage, getStorage, ref, uploadBytes, getDownloadURL,uploadString } from "@angular/fire/storage";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FirebaseError } from '@angular/fire/app';


@Injectable({
  providedIn: 'root'
})
export class FirebaseServices {
  private auth = getAuth();

  constructor(private firestore: Firestore, private storage:Storage) { }

  //===================REGISTRAR PACIENTE===================
  async subirPaciente(form: FormGroup) {
    const col = collection(this.firestore, "usuarios");

    // Extraer valores del formulario
    const { nombre, apellido, edad, DNI, obraSocial, correo, clave, foto1, foto2 } = this.extractFormValues(form);
    const tipoUsuario = "paciente"
    let url1 = '';
    let url2 = '';

    try {
      // Crear usuario y obtener resultado
      const userCreationResult = await this.createUser(correo, clave);
      if (typeof userCreationResult === 'string') {
        return userCreationResult; // Retorna el error si no se creó el usuario
      }

      // Subir imágenes y obtener URLs
      url1 = await this.uploadImage(foto1, correo);
      url2 = await this.uploadImage(foto2, correo);

      // Subir datos a Firestore
      await this.addUserToFirestore(col, { nombre, apellido, edad, DNI, obraSocial, correo, clave, foto1: url1, foto2: url2, tipoUsuario, flag:"true" });

      console.log("Datos subidos correctamente");
      return true;
    } catch (error) {
      console.error("Error al subir los datos: ", error);
      return this.handleError(error); // Manejo de errores más claro
    }
  }
  private extractFormValues(form: FormGroup) {
    return {
      nombre: form.get('nombre')?.value,
      apellido: form.get('apellido')?.value,
      edad: form.get('edad')?.value,
      DNI: form.get('DNI')?.value,
      obraSocial: form.get('obraSocial')?.value,
      correo: form.get('correo')?.value,
      clave: form.get('clave')?.value,
      foto1: form.get('foto1')?.value,
      foto2: form.get('foto2')?.value,
    };
  }
  private async createUser(correo: string, clave: string): Promise<boolean | string> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, correo, clave);
      console.log("Usuario creado");

      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);
      console.log("Enviando mail de verificación...");
      return true; // Indica que el usuario fue creado exitosamente
    } catch (error) {
      return this.handleError(error); // Maneja el error de forma centralizada
    }
  }


  //===================REGISTRAR ESPECIALISTA===================
  async subirEspecialista(form: FormGroup, especialidadesSeleccionadas: string[]) {
    const col = collection(this.firestore, "usuarios");
  
    // Extraer valores del formulario
    const { nombre, apellido, edad, DNI, correo, clave, foto } = this.extractFormEspecialista(form);
  
    const habilitado = "pendiente";
    const tipoUsuario = "especialista";
    let foto1 = '';
  
    try {
      // Crear usuario y obtener resultado
      const userCreationResult = await this.createUser(correo, clave);
      if (typeof userCreationResult === 'string') {
        return userCreationResult;
      }
  
      // Subir imágenes y obtener URLs
      foto1 = await this.uploadImage(foto, correo);
  
      // Subir datos a Firestore, incluyendo las especialidades seleccionadas
      await this.addUserToFirestore(col, {
        nombre,
        apellido,
        edad,
        DNI,
        especialidades: especialidadesSeleccionadas, // Guardamos las especialidades seleccionadas
        correo,
        clave,
        foto1,
        habilitado,
        tipoUsuario,
        flag:"true"
      });

      await this.crearHorariosEspecialista(correo, especialidadesSeleccionadas);
  
      console.log("Datos subidos correctamente");
      return true;
    } catch (error) {
      console.error("Error al subir los datos: ", error);
      return this.handleError(error);
    }
  }

  private async crearHorariosEspecialista(correo: string, especialidades: string[]) {
    const horariosCollection = collection(this.firestore, "HorariosEspecialistas");
  
    // Definir horarios por defecto para cada día
    const disponibilidad = [
      { dia: "lunes", horarios: [{ inicio: "08:00", fin: "19:00" }] },
      { dia: "martes", horarios: [{ inicio: "08:00", fin: "19:00" }] },
      { dia: "miércoles", horarios: [{ inicio: "08:00", fin: "19:00" }] },
      { dia: "jueves", horarios: [{ inicio: "08:00", fin: "19:00" }] },
      { dia: "viernes", horarios: [{ inicio: "08:00", fin: "19:00" }] },
      { dia: "sábado", horarios: [{ inicio: "08:00", fin: "14:00" }] }
    ];
  
    // Crear un documento de horarios para cada especialidad seleccionada
    for (const especialidad of especialidades) {
      await addDoc(horariosCollection, {
        correo,
        especialidad,
        disponibilidad,
        duracionTurno: 30
      });
    }
  }
  
  private extractFormEspecialista(form: FormGroup) {
    return {
      nombre: form.get('nombre')?.value,
      apellido: form.get('apellido')?.value,
      edad: form.get('edad')?.value,
      DNI: form.get('DNI')?.value,
      especialidad: form.get('especialidad')?.value,
      especialidadPersonalizada: form.get('especialidadPersonalizada')?.value,
      correo: form.get('correo')?.value,
      clave: form.get('clave')?.value,
      foto: form.get('foto')?.value,
    };
  }

  //===================REGISTRAR ADMIN===================
  async subirAdmin(form: FormGroup) {
    const col = collection(this.firestore, "usuarios");
  
    const { nombre, apellido, edad, DNI, correo, clave, foto } = this.extractFormAdmin(form);
    const tipoUsuario = "admin";
  
    let foto1 = '';
  
    try {
      // Crear usuario y obtener resultado
      try{
        const userCreationResult = await createUserWithEmailAndPassword(this.auth, correo, clave);
      }catch (error) {
        return this.handleError(error); // Maneja el error de forma centralizada
      }
  
      // Subir imágenes y obtener URLs
      foto1 = await this.uploadImage(foto, correo);
  
      // Subir datos a Firestore, usando la especialidad final
      await this.addUserToFirestore(col, { 
        nombre, 
        apellido, 
        edad, 
        DNI, 
        correo, 
        clave, 
        foto1, 
        tipoUsuario,
        flag:"true"
      });
  
      console.log("Datos subidos correctamente");
      return true;
    } catch (error) {
      console.error("Error al subir los datos: ", error);
      return this.handleError(error); // Manejo de errores más claro
    }
  }
  
  private extractFormAdmin(form: FormGroup) {
    return {
      nombre: form.get('nombre')?.value,
      apellido: form.get('apellido')?.value,
      edad: form.get('edad')?.value,
      DNI: form.get('DNI')?.value,
      correo: form.get('correo')?.value,
      clave: form.get('clave')?.value,
      foto: form.get('foto')?.value,
    };
  }

  //=======FUNCIONES COMUNES======

  private async uploadImage(file: File | null, correo: string): Promise<string> {
    if (!file) return '';
    const imgRef = ref(this.storage, `usuarios/${correo}/${file.name}`);

    try {
      await uploadBytes(imgRef, file);
      const downloadURL = await getDownloadURL(imgRef);
      return downloadURL;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error; // Lanza el error para manejarlo en el método padre
    }
  }

  private handleError(error: unknown): string {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return "Este correo ya está en uso. Intenta con otro.";
        case 'auth/invalid-email':
          return "El correo ingresado no es válido.";
        case 'auth/weak-password':
          return "La contraseña debe tener al menos 6 caracteres.";
        default:
          return "Error desconocido. Intenta nuevamente.";
      }
    } else {
      // En caso de que no sea un FirebaseError, retornar un mensaje genérico
      return "Error desconocido. Intenta nuevamente.";
    }
  }

  private async addUserToFirestore(col: CollectionReference, userData: any) {
    try {
      await addDoc(col, userData);
    } catch (error) {
      console.error("Error al subir los datos a Firestore:", error);
      throw error; // Lanza el error para manejarlo en el método padre
    }
  }
  //=========================================================
  //==============================LOGUEO===========================
  
  async loguear(correo: string, clave: string) {
    try {
      const res = await signInWithEmailAndPassword(this.auth, correo, clave);
      const user = res.user;
      
      if(await this.traerTipoUsuario(correo) != "admin"){
        if (user) {
          console.log("Usuario activo");
          if (user.emailVerified) {
            console.log("Email verificado");

            return true; // Inicio de sesión exitoso
          } else {
            console.log("Email NO verificado");
            await this.auth.signOut();
            throw new Error("El email no ha sido verificado.");
          }
        }
      }else{
        console.log("Ingreso login");
        return true
      }

      
    } catch (e) {
      console.log("Error al iniciar sesión:", e);
      throw e; // Re-lanza el error para manejarlo en el componente
    }
    return false;
  }


  //========================TRAER USUARIOS=================================

  async traerUsuarios() {
    const usuariosCollection = collection(this.firestore, 'usuarios'); // Acceder a la colección 'usuarios'

    try {
      const querySnapshot = await getDocs(usuariosCollection); // Obtener todos los documentos de la colección

      if (querySnapshot.empty) {
        console.log("No se encontraron usuarios.");
        return []; // Si no hay usuarios, retornar un arreglo vacío
      }

      // Si hay documentos, mapearlos a un arreglo de usuarios
      const usuarios = querySnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }; // Devolvemos el id del documento y sus datos
      });

      return usuarios; // Devolver el arreglo de usuarios

    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      throw new Error("Error al obtener los usuarios desde Firestore.");
    }
  }

  async traerUsuariosPorTipo(tipo:string) {
    const usuariosCollection = collection(this.firestore, 'usuarios'); // Acceder a la colección 'usuarios'

    const usuariosQuery = query(usuariosCollection, where('tipoUsuario', '==', tipo));


    try {
      const querySnapshot = await getDocs(usuariosQuery); // Obtener todos los documentos de la colección

      if (querySnapshot.empty) {
        console.log("No se encontraron usuarios.");
        return []; // Si no hay usuarios, retornar un arreglo vacío
      }

      // Si hay documentos, mapearlos a un arreglo de usuarios
      const usuarios = querySnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }; // Devolvemos el id del documento y sus datos
      });

      return usuarios; // Devolver el arreglo de usuarios

    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      throw new Error("Error al obtener los usuarios desde Firestore.");
    }
  }

  async traerEspecialistasPendientes() {
    const usuariosCollection = collection(this.firestore, 'usuarios'); // Acceder a la colección 'usuarios'
  
    try {
      // Creamos la consulta para obtener solo los usuarios que son 'especialista' y tienen habilitado: 'pendiente'
      const q = query(
        usuariosCollection,
        where('tipoUsuario', '==', 'especialista'), // Filtro para tipoUsuario = "especialista"
        where('habilitado', '==', 'pendiente') // Filtro para habilitado = "pendiente"
      );
  
      const querySnapshot = await getDocs(q); // Obtener los documentos que cumplen con la consulta
  
      if (querySnapshot.empty) {
        console.log("No se encontraron usuarios con las condiciones especificadas.");
        return []; // Si no hay usuarios, retornar un arreglo vacío
      }
  
      // Si hay documentos, mapearlos a un arreglo de usuarios
      const usuarios = querySnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }; // Devolvemos el id del documento y sus datos
      });
  
      return usuarios; // Devolver el arreglo de usuarios
  
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      throw new Error("Error al obtener los usuarios desde Firestore.");
    }
  }

  async traerUsuarioSinCorreo(){
    const usuariosCollection = collection(this.firestore, 'usuarios'); // Cambia 'usuarios' por el nombre de tu colección
    const q = query(usuariosCollection, where('correo', '==', this.auth.currentUser?.email));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("No se encontró ningún usuario con ese correo.");
        return null; // No se encontró usuario
      }

      // Si hay resultados, devolver el primer usuario encontrado
      const usuarioDoc = querySnapshot.docs[0]; // Usualmente, un correo será único, así que tomamos el primero
      const usuario = usuarioDoc.data();
      return usuario;
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      throw new Error("Error al obtener el usuario desde Firestore.");
    }
  }

  async traerHorariosEspecialistas(): Promise<any[]> {
    const usuariosCollection = collection(this.firestore, 'HorariosEspecialistas'); // Colección
    const q = query(usuariosCollection, where('correo', '==', this.auth.currentUser?.email)); // Filtra por correo (puedes quitar el where si no necesitas filtro)
  
    try {
      const querySnapshot = await getDocs(q); // Obtiene todos los documentos que cumplen con la condición
  
      if (querySnapshot.empty) {
        console.log("No se encontraron documentos con ese correo.");
        return [];
      }
  
      const documentos = querySnapshot.docs.map(doc => ({
        id: doc.id,      
        ...doc.data()    
      }));
    
      return documentos;
    } catch (error) {
      console.error("Error al obtener los documentos:", error);
      throw new Error("Error al obtener los documentos desde Firestore.");
    }
  }

  async traerUsuario(correo: string) {
    const usuariosCollection = collection(this.firestore, 'usuarios'); // Cambia 'usuarios' por el nombre de tu colección
    const q = query(usuariosCollection, where('correo', '==', correo));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("No se encontró ningún usuario con ese correo.");
        return null; // No se encontró usuario
      }

      // Si hay resultados, devolver el primer usuario encontrado
      const usuarioDoc = querySnapshot.docs[0]; // Usualmente, un correo será único, así que tomamos el primero
      const usuario = usuarioDoc.data();
      return usuario;
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      throw new Error("Error al obtener el usuario desde Firestore.");
    }
  }

  async traerUsuariosAtendidosPorEspecialista(correo: string): Promise<string[]> {
    const usuariosCollection = collection(this.firestore, 'Turnos'); // Acceder a la colección 'Turnos'
  
    const usuariosQuery = query(usuariosCollection, where('especialistaId', '==', correo), where('estado', '==', "realizado"));
  
    try {
      const querySnapshot = await getDocs(usuariosQuery); // Obtener todos los documentos de la colección
  
      if (querySnapshot.empty) {
        console.log("No se encontraron usuarios.");
        return []; // Si no hay usuarios, retornar un arreglo vacío
      }
  
      // Extraer únicamente el campo 'pacienteId' de cada documento y eliminar duplicados
      const pacienteIds = Array.from(
        new Set(
          querySnapshot.docs
            .map(doc => doc.data()?.['pacienteId']) // Extraer la propiedad 'pacienteId'
            .filter(pacienteId => pacienteId !== undefined) // Filtrar valores undefined
        )
      );
  
      return pacienteIds; // Devolver el arreglo único de 'pacienteId'
  
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      throw new Error("Error al obtener los usuarios desde Firestore.");
    }
  }
  
  

  async traerUsuariosAtendidosPorEspecialistaSinCorreo() {
    const email = this.auth.currentUser?.email;
    if (!email) {
      throw new Error('El correo del usuario actual es nulo o indefinido.');
    }
    return this.traerUsuariosAtendidosPorEspecialista(email);
  }

  async traerTipoUsuario(correo:string){
    const usuario = await this.traerUsuario(correo)
    return usuario!['tipoUsuario']
  }

  async traerNombreApellido(correo:string){
    const usuario = await this.traerUsuario(correo)
    const nombre = usuario!['nombre'] + " " + usuario!['apellido']
    return nombre
  }

  async traerFlag(correo:string){
    const usuario = await this.traerUsuario(correo)
    return usuario!['flag']
  }

  async verificarHabilitacion(correo:string){
    const usuario = await this.traerUsuario(correo)
    return usuario!['habilitado']
  }

  //========================ACTUALIZAR USUARIOS=================================

  async deshabilitarusuario(usuarioId: string) {
    const usuarioDocRef = doc(this.firestore, 'usuarios', usuarioId); // Referencia al documento del usuario

    try {
      // Actualizamos el campo "habilitado" a 'no-aceptado' o cualquier valor que indique inhabilitación
      await updateDoc(usuarioDocRef, {
        flag: 'false'
      });
      console.log('usuario inhabilitado correctamente');
    } catch (error) {
      console.error('Error al inhabilitar usuario:', error);
    }
  }

  async habilitarusuario(usuarioId: string) {
    const usuarioDocRef = doc(this.firestore, 'usuarios', usuarioId); // Referencia al documento del usuario

    try {
      // Actualizamos el campo "habilitado" a 'aceptado'
      await updateDoc(usuarioDocRef, {
        flag: 'true'
      });
      console.log('usuario habilitado correctamente');
    } catch (error) {
      console.error('Error al habilitar usuario:', error);
    }
  }

  async accionEspecialistaPendiente(usuarioId: string, accion:string) {
    const usuarioDocRef = doc(this.firestore, 'usuarios', usuarioId); // Referencia al documento del usuario

    try {
      // Actualizamos el campo "habilitado" a 'no-aceptado' o cualquier valor que indique inhabilitación
      await updateDoc(usuarioDocRef, {
        habilitado: accion
      });
      console.log('usuario cambiado correctamente');
    } catch (error) {
      console.error('Error al cambiar usuario:', error);
    }
  }

  async actualizarHorarioEspecialista(datos: any): Promise<void> {
    try {
      // Referencia al documento específico basado en el ID
      const documentoRef = doc(this.firestore, 'HorariosEspecialistas', datos.id);
      //console.log("Datos a guardar: ", datos)
      // Actualiza el documento con los datos proporcionados
      await updateDoc(documentoRef, datos);
  
      console.log(`Documento con ID ${datos.id} actualizado correctamente.`);
    } catch (error) {
      console.error(`Error al actualizar el documento con ID ${datos.id}:`, error);
      throw new Error("Error al actualizar el documento en Firestore.");
    }
  }

  async agregarDatosVariables(correo: string, historiaClinica: any) {
    try {
      // Paso 1: Referencia a la colección de pacientes
      const pacientesCollection = collection(this.firestore, 'usuarios');

      // Paso 2: Consulta al paciente por correo
      const q = query(pacientesCollection, where('correo', '==', correo));
      const pacientesSnapshot = await getDocs(q);

      if (pacientesSnapshot.empty) {
        throw new Error('No se encontró un paciente con el correo proporcionado.');
      }

      // Paso 3: Obtén el ID del documento del paciente
      const pacienteDoc = pacientesSnapshot.docs[0];
      const pacienteId = pacienteDoc.id;

      // Paso 4: Referencia al documento del paciente
      const pacienteRef = doc(this.firestore, `usuarios/${pacienteId}`);

      // Paso 6: Actualizar o crear el campo `historiaClinica`
      await updateDoc(pacienteRef, {
        historiaClinica
      });

      console.log('Historia clínica actualizada correctamente.');
    } catch (error) {
      console.error('Error al agregar la historia clínica:', error);
    }
  }

  async generarHistoria(correo: string, historiaClinica: any) {
    try {
      // Paso 1: Referencia a la colección de pacientes
      const pacientesCollection = collection(this.firestore, 'usuarios');

      // Paso 2: Consulta al paciente por correo
      const q = query(pacientesCollection, where('correo', '==', correo));
      const pacientesSnapshot = await getDocs(q);

      if (pacientesSnapshot.empty) {
        throw new Error('No se encontró un paciente con el correo proporcionado.');
      }

      // Paso 3: Obtén el ID del documento del paciente
      const pacienteDoc = pacientesSnapshot.docs[0];
      const pacienteId = pacienteDoc.id;

      // Paso 4: Referencia al documento del paciente
      const pacienteRef = doc(this.firestore, `usuarios/${pacienteId}`);

      // Paso 6: Actualizar o crear el campo `historiaClinica`
      await updateDoc(pacienteRef, {
        historiaClinica: {
          ...historiaClinica, // Sobrescribir o añadir nueva data
        },
      });

      console.log('Historia clínica actualizada correctamente.');
      return historiaClinica
    } catch (error) {
      console.error('Error al agregar la historia clínica:', error);
    }
  }
  
  async cargarTurnosFinalizadosSinCorte(correo:string ){
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('pacienteId', '==', correo),
      where('estado', '==', "realizado"),
    );
    const querySnapshot = await getDocs(q);

    const turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id; // Guardamos el ID del documento
      return turno;
    });
    // Ordenar los turnos por fecha y hora
    const turnosOrdenados = turnos.sort((a, b) => {
      // Convertir fecha y hora a objetos Date para comparar
      const fechaHoraA = this.convertirAFecha(a['fecha'], a['horaInicio']);
      const fechaHoraB = this.convertirAFecha(b['fecha'], b['horaInicio']);
      return fechaHoraB.getTime() - fechaHoraA.getTime(); // Orden descendente
    });

    // Retornar solo los 3 últimos turnos
    return turnosOrdenados;
  }

  async cargarTurnosFinalizadosConCorte(correo:string ){
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('pacienteId', '==', correo),
      where('estado', '==', "realizado"),
    );
    const querySnapshot = await getDocs(q);

    const turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id; // Guardamos el ID del documento
      return turno;
    });
    // Ordenar los turnos por fecha y hora
    const turnosOrdenados = turnos.sort((a, b) => {
      // Convertir fecha y hora a objetos Date para comparar
      const fechaHoraA = this.convertirAFecha(a['fecha'], a['horaInicio']);
      const fechaHoraB = this.convertirAFecha(b['fecha'], b['horaInicio']);
      return fechaHoraB.getTime() - fechaHoraA.getTime(); // Orden descendente
    });

    // Retornar solo los 3 últimos turnos
    return turnosOrdenados.slice(0, 3);
  }
  private convertirAFecha(fecha: string, hora: string): Date {
    const [dia, mes, anio] = fecha.split('/').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);
    return new Date(anio, mes - 1, dia, horas, minutos);
  }
  
  async traerTurnosPorUsuario(correo: string){
    const q = query(
      collection(this.firestore, 'Turnos'),
      where('pacienteId', '==', correo),
    );
    const querySnapshot = await getDocs(q);

    const turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id; // Guardamos el ID del documento
      return turno;
    });
    // Ordenar los turnos por fecha y hora
    const turnosOrdenados = turnos.sort((a, b) => {
      // Convertir fecha y hora a objetos Date para comparar
      const fechaHoraA = this.convertirAFecha(a['fecha'], a['horaInicio']);
      const fechaHoraB = this.convertirAFecha(b['fecha'], b['horaInicio']);
      return fechaHoraB.getTime() - fechaHoraA.getTime(); // Orden descendente
    });

    // Retornar solo los 3 últimos turnos
    return turnosOrdenados;
  }

  async cargarTurnos() {
    const q = query(
      collection(this.firestore, 'Turnos')
    );
    const querySnapshot = await getDocs(q);
  
    const turnos = querySnapshot.docs.map(doc => {
      const turno = doc.data();
      turno['id'] = doc.id; // Guardamos el ID del documento
      return turno;
    });
  
    // Ordenar los turnos por fecha
    turnos.sort((a, b) => {
      // Convertir las fechas de dd/mm/yyyy a yyyy/mm/dd para compararlas
      const fechaA = a['fecha'].split('/').reverse().join('-'); // 'dd/mm/yyyy' -> 'yyyy-mm-dd'
      const fechaB = b['fecha'].split('/').reverse().join('-');
      return new Date(fechaA).getTime() - new Date(fechaB).getTime();
    });
  
    return turnos; // Retornar los turnos ordenados por fecha
  }
  

  //===============LOGS==================

  async traerLogs() {
    const col = collection(this.firestore, "logIniciarSesion");

    // Construir la consulta base
    let q = query(col, orderBy('datetime', 'desc')); // Ordenar por fecha y hora en orden descendente

    // Agregar filtros opcionales
    

    // Obtener los documentos desde Firestore
    const querySnapshot = await getDocs(q);

    // Mapear los resultados a un array de objetos
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id, // ID del documento
      ...doc.data(), // Datos del documento
    }));

    return logs;
  }

}
