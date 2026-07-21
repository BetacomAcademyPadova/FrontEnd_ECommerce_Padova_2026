import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { APP_SETTING } from '../settings/token/token';
import { AppSettings } from '../settings/token/config-model';
@Service()
export class AttibutiServices {

    private readonly settings: AppSettings = inject(APP_SETTING);
    private http = inject(HttpClient);

    tipoRuolo = signal<any[]>([]);
    statoOrdine = signal<any[]>([]);
    statoPagamento = signal<any[]>([]);
    categoria = signal<any[]>([]);
    sottoCategoria = signal<any[]>([]);
    
    getBaseUrl(): string {
        return this.settings.apiUrl;
    }

}