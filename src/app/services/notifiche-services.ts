import { inject, Service, signal } from "@angular/core";
import { AppSettings } from "../settings/token/config-model";
import { APP_SETTING } from "../settings/token/token";
import { HttpClient, HttpParams } from "@angular/common/http";

@Service()
export class NotificheServices 
{
    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);

    public badgeCount = signal<number>(0);

    getBaseUrl(): string {
        return this.settings.apiUrl + 'Notifica/';
    }

    aggiornaConteggio(isAdmin: boolean): void {
        if (isAdmin) {
            this.getTutteNonLette().subscribe({
                next: (res) => 
                {
                    console.log("NOTIFICHE RICEVUTE DAL SERVER:", res);
                    const quantita = Array.isArray(res) ? res.length : 0;
                    this.badgeCount.set(quantita);
                },
                error: (err) => 
                {
                    console.error("ERRORE:", err);
                    this.badgeCount.set(0);
                }
            });
        }
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

    accettaRichiesta(idNotifica: number) {
        return this.http.put(this.getBaseUrl() + 'accetta/' + idNotifica, {});
    }

    rifiutaRichiesta(idNotifica: number) {
        return this.http.put(this.getBaseUrl() + 'rifiuta/' + idNotifica, {});
    }

    getRichiesteUtente(userId: number)
    {
        return this.http.get<any[]>(this.getBaseUrl() + 'utente/' + userId);
    }
}
