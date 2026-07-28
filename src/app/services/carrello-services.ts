import { inject, Injectable, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Carrello } from "../models/carrello";


@Service()
export class CarrelloServices {

  private http = inject(HttpClient);
  private url = "http://localhost:9090/rest/Carrello/";

  getByUser(userId: number) {
    return this.http.get<Carrello>(this.url + "getByUser/" + userId);
  }

  delete(idCarrello: number) {
    return this.http.delete(this.url + "delete/" + idCarrello);
  }

}