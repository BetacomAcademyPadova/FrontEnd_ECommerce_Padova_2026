import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';
import { ProdottiServices } from './prodotti-services';

@Service()
export class UploadServices {
    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);
    private readonly prodottiServices = inject(ProdottiServices);

    getBaseUrl(): string {
        return this.settings.apiUrl + 'upload/';
    }
    upload(file: File, id: any) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', id);

        return this.http.post(this.getBaseUrl() + "image", formData)
            .pipe(tap(() => this.prodottiServices.getAll()))
    }
    getUrl(name: string) {
        let params = new HttpParams().set("filename", name);
        return this.http.get(this.getBaseUrl() + "getUrl", { params });
    }

}