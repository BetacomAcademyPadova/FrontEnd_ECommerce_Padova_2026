import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { AppSettings } from '../settings/token/config-model';
import { APP_SETTING } from '../settings/token/token';

@Service()
export class ProdottiOrdineServices {
  private readonly settings: AppSettings = inject(APP_SETTING);
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'ProdottiOrdine/';

  prodottiOrdine = signal<any[]>([]);

  getBaseUrl(): string {
    return this.settings.apiUrl + this.endpoint;
  }

  list() {
    this.http
      .get<any[]>(this.getBaseUrl() + 'getAll')
      .subscribe({
        next: (r) => {
          this.prodottiOrdine.set(r);
        },
        error: (err) => {
          console.error('Errore caricamento prodotti ordine', err);
        },
      });
  }

  getById(idItem: number) {
    return this.http.get<any>(this.getBaseUrl() + 'getById/' + idItem);
  }

  create(body: any) {
    return this.http
      .post(this.getBaseUrl() + 'create', body)
      .pipe(tap(() => this.list()));
  }
}