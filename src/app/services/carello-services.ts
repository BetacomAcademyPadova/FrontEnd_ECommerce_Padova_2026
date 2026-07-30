import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';
import { Carrello } from '../models/carrello';

@Service()
export class CarelloServices {

  private readonly settings: AppSettings = inject(APP_SETTING);
  private readonly http = inject(HttpClient);

  private getBaseUrl(): string {
    return this.settings.apiUrl + 'Carrello/';
  }

  getById(idCarrello: number) {
    return this.http.get<Carrello>(this.getBaseUrl() + 'getById/' + idCarrello);
  }
  getByUser(userId: number) {
    return this.http.get<Carrello>(this.getBaseUrl() + 'getByUser/' + userId);
  }

  delete(idCarrello: number) {
    return this.http.delete(this.getBaseUrl() + 'delete/' + idCarrello);
  }
}