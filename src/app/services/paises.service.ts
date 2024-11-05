import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Pais {
  flags: {
    png: string;
  };
  translations: {
    spa: {
      common: string;
    };
  };
  region: string; // Agregar la propiedad region
}

@Injectable({
  providedIn: 'root'
})
export class PaisesServices {
  constructor(private http: HttpClient) {}

  obtenerPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>('https://restcountries.com/v3.1/all').pipe(
      map(paises => 
        paises
          .filter(pais => pais.region === 'Americas' || pais.region === 'Asia') // Filtra países americanos y asiáticos
          .sort((a, b) => 
            a.translations.spa.common.localeCompare(b.translations.spa.common)
          )
      )
    );
  }
}
