import { inject, Service } from "@angular/core";
import { AppSettings } from "../settings/token/config-model";
import { APP_SETTING } from "../settings/token/token";
import { HttpClient, HttpParams } from "@angular/common/http";

@Service()
export class NotificheServices 
{
    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);

    getBaseUrl(): string {
        return this.settings.apiUrl + 'Notifica/';
    }

    getNonLette(userId: number){
        return this.http.get<any[]>(this.getBaseUrl() + 'nonLette/' + userId);
    }

    getTutteNonLette() {
        return this.http.get<any[]>(this.getBaseUrl() + 'tutteNonLette');
    }

    segnaComeLetta(idNotifica: number){
        return this.http.put(this.getBaseUrl() + 'segnaLetta/' + idNotifica, {});
    }

    inviaRichiesta(userId: number, messaggio: string) {
        const params = new HttpParams().set('messaggio', messaggio);
        return this.http.post<any>(this.getBaseUrl() + 'invia/' + userId, null, { params });
    }
}
