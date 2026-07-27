import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ProdottoServices {
  private url = "http://localhost:9090/rest/Prodotto";

  private http = inject(HttpClient);

  getAll() {
    return this.http.get<any[]>(`${this.url}/getAll`);
  }

  getById(idProdotto: number) {
    return this.http.get<any>(`${this.url}/getById/${idProdotto}`);
  }

  search(
    descrizione: string,
    prezzo: number | null,
    colore: string,
    sottocategoria: string,
    materiale: string,
    altezza: number | null,
    lunghezza: number | null,
    larghezza: number | null,
    sconti: boolean
  ) {
    let params = new HttpParams();

    if (descrizione.trim() !== "") {
      params = params.set("descrizione", descrizione.trim());
    }

    if (prezzo !== null) {
      params = params.set("prezzo", prezzo.toString());
    }

    if (colore.trim() !== "") {
      params = params.set("colore", colore.trim());
    }

    if (sottocategoria.trim() !== "") {
      params = params.set("sottocategoria", sottocategoria.trim());
    }

    if (materiale.trim() !== "") {
      params = params.set("materiale", materiale.trim());
    }

    if (altezza !== null) {
      params = params.set("altezza", altezza.toString());
    }

    if (lunghezza !== null) {
      params = params.set("lunghezza", lunghezza.toString());
    }

    if (larghezza !== null) {
      params = params.set("larghezza", larghezza.toString());
    }

    params = params.set("sconti", sconti.toString());

    return this.http.get<any[]>(`${this.url}/search`, { params });
  }

  create(prodotto: any) {
    return this.http.post<number>(`${this.url}/create`, prodotto);
  }

  update(prodotto: any) {
    return this.http.put(
      `${this.url}/update`,
      prodotto
    );
  }

  delete(idProdotto: number) {
    return this.http.delete(`${this.url}/delete/${idProdotto}`);
  }
}
