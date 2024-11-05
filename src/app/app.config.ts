import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()), provideFirebaseApp(() => initializeApp({"projectId":"clinica-1af50","appId":"1:468867245562:web:32c5d8c98cb0209c7a3043","storageBucket":"clinica-1af50.firebasestorage.app","apiKey":"AIzaSyD5ML0Gc6TWNAkg0iqggSTq07RnS1sdkUs","authDomain":"clinica-1af50.firebaseapp.com","messagingSenderId":"468867245562"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())
  ]
};
