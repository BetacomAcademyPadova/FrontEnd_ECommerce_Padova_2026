import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';

@Service()
export class UtenteServices {
    accounts = signal<any[]>([]);

    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);

    getBaseUrl(): string {
        return this.settings.apiUrl + 'User/';
    }

    list(userName?: string, nome?: string, cognome?: string, role?: string) {
        let params = new HttpParams();
        if (nome) params = params.set('nome', nome);
        if (cognome) params = params.set('cognome', cognome);
        if (role) params = params.set('role', role);


        this.http.get(this.getBaseUrl() + "getAll", { params })
            .subscribe({
                next: ((r: any) => this.accounts.set(r)),
            })
    }

    create(body: {}) {
        return this.http.post(this.getBaseUrl() + "create", body)
            .pipe(tap(() => this.list()));
    }
    update(body: {}) {
        return this.http.patch(this.getBaseUrl() + "update", body)
            .pipe(tap(() => this.list()));
    }
    updateProfile(body: {}) {
        return this.http.patch(this.getBaseUrl() + "update", body);
    }

    findByUserName(id?: string) {
        return this.http.get(this.getBaseUrl() + "getByUsername");
    }
    changePwd(body: {}) {
       return this.http.put(this.getBaseUrl() + "changePwd", body);
    }
}