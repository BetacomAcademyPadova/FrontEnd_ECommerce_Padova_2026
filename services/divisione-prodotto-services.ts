import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DivisioneProdottoServices {
  private readonly url = "http://localhost:9090/rest/DivisioneProdotto";

  private readonly http = inject(HttpClient);

  create(divisione: any) {
    return this.http.post(`${this.url}/create`, divisione);
  }

  update(divisione: any) {
    return this.http.put(`${this.url}/update`, divisione);
  }

  delete(idDivisione: number) {
    return this.http.delete(`${this.url}/delete/${idDivisione}`);
  }

  getById(idDivisione: number) {
    return this.http.get<any>(`${this.url}/getById/${idDivisione}`);
  }

  getAll() {
    return this.http.get<any[]>(`${this.url}/getAll`);
  }
}
