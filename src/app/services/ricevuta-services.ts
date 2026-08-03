import { HttpClient } from "@angular/common/http";
import { inject, Service, signal } from "@angular/core";

import { APP_SETTING } from "../settings/token/token";
import { AppSettings } from "../settings/token/config-model";

@Service()
export class RicevutaServices {
  private readonly settings: AppSettings = inject(APP_SETTING);

  private readonly http = inject(HttpClient);

  ricevute = signal<any[]>([]);

  private getBaseUrl(): string {
    return this.settings.apiUrl;
  }

  getByUserId(userId: number) {
    return this.http.get<any[]>(this.getBaseUrl() + "Ricevuta/user/" + userId);
  }

  getByUserIdAndDateRange(
    userId: number,

    dataInizio: string,

    dataFine: string,
  ) {
    return this.http.get<any[]>(
      this.getBaseUrl() + "Ricevuta/user/" + userId + "/date",

      {
        params: {
          dataInizio,

          dataFine,
        },
      },
    );
  }

  getRicevuteVenditore(venditoreId: number) {
    return this.http.get<any[]>(
      this.getBaseUrl() + "Ricevuta/venditore/" + venditoreId,
    );
  }

  getRicevuteVenditoreByDateRange(
    venditoreId: number,

    dataInizio: string,

    dataFine: string,
  ) {
    return this.http.get<any[]>(
      this.getBaseUrl() + "Ricevuta/venditore/" + venditoreId + "/date",

      {
        params: {
          dataInizio,

          dataFine,
        },
      },
    );
  }

  getById(idFattura: number) {
    return this.http.get<any>(
      this.getBaseUrl() + "Ricevuta/getById/" + idFattura,
    );
  }
}

