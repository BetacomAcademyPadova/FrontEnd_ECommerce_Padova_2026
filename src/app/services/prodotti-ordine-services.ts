import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Service()
export class ProdottiOrdineServices {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:9090/rest/ProdottiOrdine/';
    prodottiOrdine = signal<any[]>([]);

    list() {
        return this.http.get<any[]>(
            this.baseUrl + 'getAll'
        )
        .subscribe({
            next: (r) => {
                this.prodottiOrdine.set(r);
            },
            error: (err) => {
                console.error('Errore caricamento prodotti ordine', err);
            }
        });
    }

    getById(idItem:number) {
        return this.http.get<any>(this.baseUrl + 'getById/' + idItem);
    }

    create(body:any) {
        return this.http.post(this.baseUrl + 'create', body)

        .pipe(
            tap(() => this.list())
        );
    }

    update(body:any) {
        return this.http.put( this.baseUrl + 'update', body)

        .pipe(
            tap(() => this.list())
        );
    }
    delete(idItem:number) {

        return this.http.delete(this.baseUrl + 'delete/' + idItem)
        .pipe(
            tap(() => this.list())
        );
    }
}