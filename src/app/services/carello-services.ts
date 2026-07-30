import { HttpClient } from '@angular/common/http';
import { inject, Service , signal} from '@angular/core';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';
import { Carrello } from '../models/carrello';
import { AuthServices } from '../auth/auth-services';


@Service()
export class CarelloServices {

  private readonly settings: AppSettings = inject(APP_SETTING);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthServices);

  public badgeCount = signal<number>(0);
  

  private getBaseUrl(): string {
    return this.settings.apiUrl + 'Carrello/';
  }

  aggiornaConteggio(): void {
    const grant = this.auth.grant();

    if (!grant?.isLogged || !grant.userId) {
      this.badgeCount.set(0);
      return;
    }

    this.getByUser(Number(grant.userId)).subscribe({
      next: (carrello) => {
        const pezzi = (carrello?.prodotti ?? [])
          .reduce((tot, p) => tot + (p.quantita ?? 0), 0);
        this.badgeCount.set(pezzi);
      },
      error: () => this.badgeCount.set(0)
    });
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