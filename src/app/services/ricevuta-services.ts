import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';

@Service()
export class RicevutaServices {

    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);

    private getBaseUrl(): string {
        return this.settings.apiUrl + 'Ricevuta/';
    }

    // Endpoint attivi in RicevutaController:
    //   getById/{idFattura}
    //   user/{userId}            user/{userId}/date
    //   venditore/{venditoreId}  venditore/{venditoreId}/date
    // getAll, update e getRicevutaBy sono commentati nel controller: le
    // chiamate precedenti tornavano 404 e la lista restava sempre vuota.

    getById(idFattura: number) {
        return this.http.get<any>(this.getBaseUrl() + 'getById/' + idFattura);
    }

    /** Le ricevute del cliente: serve alla pagina "i miei ordini". */
    getByUser(userId: number) {
        return this.http.get<any[]>(this.getBaseUrl() + 'user/' + userId);
    }

    getByUserAndDate(userId: number, da: string, a: string) {
        return this.http.get<any[]>(
            this.getBaseUrl() + 'user/' + userId + '/date?dataInizio=' + da + '&dataFine=' + a
        );
    }

    getByVenditore(venditoreId: number) {
        return this.http.get<any[]>(this.getBaseUrl() + 'venditore/' + venditoreId);
    }

    getByVenditoreAndDate(venditoreId: number, da: string, a: string) {
        return this.http.get<any[]>(
            this.getBaseUrl() + 'venditore/' + venditoreId + '/date?dataInizio=' + da + '&dataFine=' + a
        );
    }

    // create resta per i test da Postman: nel flusso reale la ricevuta la
    // emette il backend dentro markSucceeded quando Stripe conferma.
    create(body: any) {
        return this.http.post(this.getBaseUrl() + 'create', body);
    }
}