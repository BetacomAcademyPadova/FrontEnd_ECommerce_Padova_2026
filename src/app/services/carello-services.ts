import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';
import { CarrelloDTO } from './carello-types';

@Service()
export class CarrelloServices {

  private readonly settings: AppSettings = inject(APP_SETTING);
  private readonly http = inject(HttpClient);

  private getBaseUrl(): string {
    return this.settings.apiUrl + 'Carrello/';
  }

  getById(idCarrello: number) {
    return this.http.get<CarrelloDTO>(this.getBaseUrl() + 'getById/' + idCarrello);
  }
}