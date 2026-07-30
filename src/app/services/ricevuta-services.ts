import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';


@Service()
export class RicevutaServices {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:9090/rest/Ricevuta/';

    ricevute = signal<any[]>([]);

    list() {

        this.http.get<any[]>(
            this.baseUrl + 'getAll'
        )

        .subscribe({

            next: (r) => {
                this.ricevute.set(r);
            },

            error: (err) => {

                console.error(
                    'Errore caricamento ricevute',
                    err
                );
            }
        });
    }

    create(body: any) {

        return this.http.post(
            this.baseUrl + 'create',
            body
        )

        .pipe(
            tap(() => this.list())
        );
    }

    update(body: any) {

        return this.http.put(
            this.baseUrl + 'update',
            body
        )

        .pipe(
            tap(() => this.list())
        );
    }

    getById(idFattura: number) {

        return this.http.get<any>(
            this.baseUrl + 'getById/' + idFattura
        );
    }

    getByVenditore(venditoreId: number) {

        return this.http.get<any[]>(
            this.baseUrl + 'getRicevutaBy/' + venditoreId
        );
    }
}
