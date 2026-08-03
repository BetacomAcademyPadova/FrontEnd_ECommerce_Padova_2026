import { HttpClient } from "@angular/common/http";
import { inject, Service, signal } from "@angular/core";
import { tap } from "rxjs";

@Service()
export class ProdottiOrdineServices {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = "http://localhost:9090/rest/ProdottiOrdine/";

  prodottiOrdine = signal<any[]>([]);

  getAll() {
    return this.http.get<any[]>(this.baseUrl + "getAll").pipe(
      tap((res) => {
        this.prodottiOrdine.set(res);
      }),
    );
  }

  getByCliente(userId: number) {
    return this.http.get<any[]>(this.baseUrl + "cliente/" + userId).pipe(
      tap((res) => {
        this.prodottiOrdine.set(res);
      }),
    );
  }

  getByClienteDate(userId: number, dataInizio: string, dataFine: string) {
    return this.http
      .get<any[]>(
        this.baseUrl + "cliente/" + userId + "/" + dataInizio + "/" + dataFine,
      )
      .pipe(
        tap((res) => {
          this.prodottiOrdine.set(res);
        }),
      );
  }

  getByVenditore(userId: number) {
    return this.http.get<any[]>(this.baseUrl + "venditore/" + userId).pipe(
      tap((res) => {
        this.prodottiOrdine.set(res);
      }),
    );
  }

  getByVenditoreDate(userId: number, dataInizio: string, dataFine: string) {
    return this.http
      .get<any[]>(
        this.baseUrl +
          "venditore/" +
          userId +
          "/" +
          dataInizio +
          "/" +
          dataFine,
      )
      .pipe(
        tap((res) => {
          this.prodottiOrdine.set(res);
        }),
      );
  }

  getById(idItem: number) {
    return this.http.get<any>(this.baseUrl + "getById/" + idItem);
  }
}
