import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { APP_SETTING } from "../settings/token/token";
import { AppSettings } from "../settings/token/config-model";

import { ProdottiOrdineDTO } from "./ordine-types";

@Injectable({
  providedIn: "root",
})
export class ProdottiOrdineServices {
  private readonly http = inject(HttpClient);

  private readonly settings: AppSettings = inject(APP_SETTING);

  private getBaseUrl() {
    return this.settings.apiUrl + "ProdottiOrdine/";
  }

  getByOrdine(idOrdine: number, userId: number, venditore: boolean = false) {
    if (venditore) {
      return this.http.get<ProdottiOrdineDTO[]>(
        this.getBaseUrl() + "ordine/venditore/" + idOrdine + "/" + userId,
      );
    }

    return this.http.get<ProdottiOrdineDTO[]>(
      this.getBaseUrl() + "ordine/" + idOrdine + "/" + userId,
    );
  }
}
