import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';

@Service()
export class UtenteServices {
    url = "http://localhost:9090/rest/Utente/"
    accounts = signal<any[]>([]);

    private http = inject(HttpClient);


    list(userName?: string, nome?: string, cognome?: string, role?: string) {
        let params = new HttpParams();
        if (nome) params = params.set('nome', nome);
        if (cognome) params = params.set('cognome', cognome);
        if (role) params = params.set('role', role);


        this.http.get(this.url + "getAll", { params })
            .subscribe({
                next: ((r: any) => this.accounts.set(r)),
            })
    }

    create(body: {}) {
        return this.http.post(this.url + "create", body)
            .pipe(tap(() => this.list()));
    }
    update(body: {}) {
        return this.http.patch(this.url + "update", body)
            .pipe(tap(() => this.list()));
    }

    findByUserName(id: string) {
        const params = new HttpParams().set("userName", id);
        return this.http.get(this.url + "getById", { params });
    }

    setRole(id: string, ruolo: string){
        const urlCompleto = `${this.url}setRuolo/${id}/${ruolo}`;
        return this.http.put(urlCompleto, {});
    }

    deleteUser(id: string){
        const params = new HttpParams().set("userName", id);
        return this.http.put(this.url + "getById", { params });
    }
}
