import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ScontoServices {
  private http = inject(HttpClient);

  private url = "http://localhost:9090/rest/Sconto";

  create(req: any) {
    return this.http.post(`${this.url}/create`, req);
  }

  getAll() {
    return this.http.get<any[]>(`${this.url}/getAll`);
  }

  delete(idSconto: number) {
    return this.http.delete(`${this.url}/delete/${idSconto}`);
  }
}
