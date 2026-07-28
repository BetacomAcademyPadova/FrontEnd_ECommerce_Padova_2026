import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";


@Service()
export class ProdottiCarrelloServices {
  private url = "http://localhost:9090/rest/ProdottiCarrello";
  private http = inject(HttpClient);

  create(body:any){
    return this.http.post(`${this.url}/create`, body);
  }

  update(body:any){
    return this.http.put(`${this.url}/update`, body);
  }

  delete(idRiga:number){
    return this.http.delete(`${this.url}/delete/${idRiga}`);
  }

  getById(idRiga:number){
    return this.http.get<any>(`${this.url}/getById/${idRiga}`);
  }

  listByCarrello(idCarrello:number){
    return this.http.get<any[]>(`${this.url}/listByCarrello/${idCarrello}`);
  }

}