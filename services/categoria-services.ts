import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoriaServices {

  private readonly http = inject(HttpClient);

  private readonly url =
    'http://localhost:9090/rest/Categoria';

  getAll() {

    return this.http.get<any[]>(
      `${this.url}/getAll`
    );
  }
}
