import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp({"projectId":"clinica-online-75b53","appId":"1:500844406686:web:87607d162451222f64988f","storageBucket":"clinica-online-75b53.appspot.com","apiKey":"AIzaSyDq4pXGvXn2h1ZOyCpRVnUmAlA90k7ptx4","authDomain":"clinica-online-75b53.firebaseapp.com","messagingSenderId":"500844406686"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideFirebaseApp(() => initializeApp({"projectId":"clinica-online-75b53","appId":"1:500844406686:web:87607d162451222f64988f","storageBucket":"clinica-online-75b53.appspot.com","apiKey":"AIzaSyDq4pXGvXn2h1ZOyCpRVnUmAlA90k7ptx4","authDomain":"clinica-online-75b53.firebaseapp.com","messagingSenderId":"500844406686"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())]
};
