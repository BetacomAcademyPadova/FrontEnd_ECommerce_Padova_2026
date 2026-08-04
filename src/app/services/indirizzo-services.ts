import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';
import { IndirizzoDTO, IndirizzoReq } from '../componenti/models/ordine-types';

@Service()
export class IndirizzoServices {

  private readonly settings: AppSettings = inject(APP_SETTING);
  private readonly http = inject(HttpClient);

  private getBaseUrl(): string {
    return this.settings.apiUrl + 'Indirizzi/';
  }

  getAllByUser(idUser: number) {
    return this.http.get<IndirizzoDTO[]>(this.getBaseUrl() + 'getAllByUser/' + idUser);
  }

  create(req: IndirizzoReq) {
    return this.http.post<{ msg: string }>(this.getBaseUrl() + 'create', req);
  }

  update(req: IndirizzoReq) {
    return this.http.put<{ msg: string }>(this.getBaseUrl() + 'update', req);
  }

  delete(idIndirizzo: number) {
    return this.http.delete<{ msg: string }>(this.getBaseUrl() + 'delete/' + idIndirizzo);
  }
}