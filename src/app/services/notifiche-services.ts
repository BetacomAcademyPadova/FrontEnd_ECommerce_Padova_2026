import { inject, Service, signal } from "@angular/core";
import { AppSettings } from "../settings/token/config-model";
import { APP_SETTING } from "../settings/token/token";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthServices } from "../auth/auth-services";

@Service()
export class NotificheServices 
{
    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);
    private readonly auth = inject(AuthServices);

    public badgeCount = signal<number>(0);

    getBaseUrl(): string {
        return this.settings.apiUrl + 'Notifica/';
    }

    aggiornaConteggio(isAdmin?: boolean): void {
        const grant = this.auth.grant();
        const checkAdmin = isAdmin !== undefined ? isAdmin : grant.isAdmin;

        if (checkAdmin) {
            this.getTutteNonLette().subscribe({
                next: (res) => {
                    const soloRichieste = Array.isArray(res) 
                        ? res.filter(n => !n.messaggio?.includes('Stock basso')) 
                        : [];
                    this.badgeCount.set(soloRichieste.length);
                },
                error: () => this.badgeCount.set(0)
            });
        } 
        else if (grant.isVenditore) {
            this.getNonLette(Number(grant.userId)).subscribe({
                next: (res) => {
                    const alerts = Array.isArray(res) 
                        ? res.filter(n => n.messaggio?.includes('Stock basso')) 
                        : [];
                    this.badgeCount.set(alerts.length);
                },
                error: () => this.badgeCount.set(0)
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
