import { inject, Service } from "@angular/core";
import { AppSettings } from "../settings/token/config-model";
import { APP_SETTING } from "../settings/token/token";
import { HttpClient } from "@angular/common/http";
import { OrdineDTO, OrdineReq, StatoOrdineDTO } from "./ordine-types";


@Service()
export class OrdineServices {
    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);

    private getBaseUrl(): string {
        return this.settings.apiUrl + 'Ordine/';
    }

    create(req: OrdineReq) {
        return this.http.post<OrdineDTO>(this.getBaseUrl() + 'create', req);
    }

    getById(idOrdine: number) {
        return this.http.get<OrdineDTO>(this.getBaseUrl() + 'getById/' + idOrdine);
    }

    getAllByUserId(userId: number) {
        return this.http.get<OrdineDTO[]>(this.getBaseUrl() + 'getAllByUserId/' + userId);
    }

    getStati() {
        return this.http.get<StatoOrdineDTO[]>(this.settings.apiUrl + 'StatoOrdine/getAll');
    }
}
