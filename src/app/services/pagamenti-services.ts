import { inject, Service } from "@angular/core";
import { AppSettings } from "../settings/token/config-model";
import { APP_SETTING } from "../settings/token/token";
import { HttpClient } from "@angular/common/http";
import { PaymentIntentReq, PaymentIntentDTO, StripeConfigDTO } from './pagamenti-types';


@Service()
export class PagamentiServices {
    private readonly settings: AppSettings = inject(APP_SETTING);
    private readonly http = inject(HttpClient);

    private getBaseUrl(): string {
        return this.settings.apiUrl + 'Pagamenti/';
    }

    createIntent(req: PaymentIntentReq) {
        return this.http.post<PaymentIntentDTO>(this.getBaseUrl() + 'create-intent', req);
    }

    getConfig() {
        return this.http.get<StripeConfigDTO>(this.getBaseUrl() + 'config');
    }
}