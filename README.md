# Clinica online de Teira

Bienvenido a la clinica online hecha por Agustin Teira, vamos a repasar brevemente un poco de las cosas que se puede nrealizar en esta pagina web

## Landing

![landing](https://github.com/user-attachments/assets/fd566937-2e11-4bd5-a7ea-5f70e6ebd9e9)

Esta es la pagina de bievenida a la clinica, con un navbar que nos deja la opcion de loguearse o registrarse en la aplicacion. Si ya estamos logueados la pagina principal va a ser la misma pero con las opciones de navbar correspondientes para cada usuario.

## Registro
![registro](https://github.com/user-attachments/assets/b8784808-ccf1-466c-8595-c29ea97ab503)

En esta pagina vamos a poder registrarnos tanto como pacientes como especialistas. Son distitnos registros para cada uno, la diferencia en si radica en que los especialistas deben registrar sus especialidades (Las que ellos quieran, hay unas posibilidades, y se puede agregar otras si se lo desea asi), y los pacientes su obra social. Ademas se incluye un captcha para evitar problemas. Todos los campos incluyen los validadores.
Una vez registrado, se va a pedir que se verifique el mail seleccionado mediante un link que se envia a ese correo. Los especialistas ademas deben ser aprobados por el Administrador.

## Inicio de sesion
![login](https://github.com/user-attachments/assets/09553226-c4fc-4f4a-b550-d1701e08124f)

Pagina simple de inicio de sesion, con alertas personalizadas si no logra loguear, indicando el problema (Usuario sin verificacion, usuario rechazado, contraseña y/o mail incorrecto)

# Pacientes
## Solicitar turno

![paciente-SolicitarTurno](https://github.com/user-attachments/assets/9c0c1a73-4254-4063-ae90-24218b78c9f7)

En esta pagina, los pacientes van a poder solicitar un turno eligiendo:
Especialista -> Alguan de sus especialidades -> Dia que tengan disponibles -> horarios que tengan disponibles.

## Mis turnos

![paciente-MisTurnos](https://github.com/user-attachments/assets/6279abcf-0f6b-403c-a86a-640ee772a086)

Aca el paciente podra ver todos sus turnos asignados, con toda la informacion detalladas, y unas opciones segun el estado del turno. 
El ciclo de vida de un turno es el siguiente:
  - El paciente pide un turno (Luego de pedido puede cancelarlo en cualquier momento, y agregar un comentario)
  - El especialista acepta o rechaza el turno (Puede cancelarlo en cualquier momento, y agregar un comentario)
  - El especialista finaliza el turno (Puede subir la historia clinica y dejar una reseña)
  - El paciente puede calificar la atencion y completar la encuesta
  - Siempre que haya comentarios, estos se pueden ver.

Ademas se puede filtrar los turnos por:
  - Especialidad
  - Paciente o especialista
  - Historia clinica (Los valores de las claves que asigno el especialista)

## Mi perfil
![Paciente-MiPerfil](https://github.com/user-attachments/assets/e42aa0d8-7bef-42ee-82b1-19dc9c72810b)

Aca los pacietes podran ver su perfil, los datos, sus imagenes cargas, su historia clinica, y descargar su historia clinica en formato PDF segun la especialidad

# Especialistas
## Ver turnos
![especialista-verTurnos](https://github.com/user-attachments/assets/f28b39eb-58d6-43bc-a9a4-b12018d31b21)

Lo mismo que se menciono anteriormente en los turnos de los pacientes, pero del lado del especialista. Ademas se podra cargar la historia clinica, esto solamente despues de un turno, habiendo 3 datos fijos, y la posibilidad de agregar 3 datos variable. La historia clinica se vincula con el paciente, y con ese turno especificamente.

## Mi perfil
![especialista-MiPerfil](https://github.com/user-attachments/assets/0a511528-ad53-4d6f-96ee-806d9d191998)
Al igual que en los pacientes, aca el especialista podra ver todos sus datos e imagenes que se cargaron cuando se registro.
Ademas se podra ver su disponibilidad horarios SEGUN especialidad y dia de la semana, esta podra editarse, e impactara en la solicitudes de turnos, los horarios disponibles

## Mis pacientes
![especialista-MisPacientes](https://github.com/user-attachments/assets/ae06fef3-e59a-49d1-87c3-1a37c99bbf71)

Aca el especialista podra ver a todos los pacientes que haya atendido al menos una vez, y la historia clinica de los ultimos 3 turnos.

# Administrador
## Ver usuarios
![admin-CrearUsuarios](https://github.com/user-attachments/assets/43c3d2ac-d30e-4afc-bc70-2b489de182ea)
![admin-verUsuarios](https://github.com/user-attachments/assets/e46a9f85-b123-495c-b9c7-3c0305061d76)
![admin-habilitarEspecilistas](https://github.com/user-attachments/assets/e0ce880c-8167-4efa-9ccc-4afaec8a6b54)

Desde esta pagina, el administrador podra controlar todo respecto a los usuarios, podra verlos, deshabilitarlos, crearlos, exportarlos en excel, habilitar a los especialistas que se registran, etc.

## Solicitar turno
![admin-SolicitarTurno](https://github.com/user-attachments/assets/15ac992e-bfca-4306-85d1-fd4938f9c0c6)

Al igual que los pacientes, el administrador tambien podra solicitar turnos para los pacientes, es la misma mecanica que la de los pacientes, pero con la diferencia de que primero debe seleccionar al paciente a quien le va a solicitar el turno

## Ver turnos
![admin-VerTurnos](https://github.com/user-attachments/assets/ccf73894-ef8e-4ecc-b943-828d9e07d435)

Desde esta pagina el administrador podra ver los turnos de todos los pacientes y especialistas, igualmente, su unica opcion posible es la de cancelarlos cuando aun no se han realizado

## Estadisticas
![admin-Estadisticas](https://github.com/user-attachments/assets/bd537b89-d5df-4410-b3a0-21b931324032)

Desde esta pagina, los administradores podran ver todas las estadisticas de la clinica y exportarlas en un pdf.

# Pagina web
Si queres ver la pagina completa, te invito a acceder al siguiente link y probarle. En el login hay accesos rapidos a los distintos tipos de usuarios.

https://clinica-1fd9a.web.app/
