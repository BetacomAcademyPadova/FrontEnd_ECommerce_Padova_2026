import { inject, Service } from "@angular/core";
import { PaymentIntentReq, PaymentIntentDTO, MetodoPagamentoDTO } from './pagamenti-types';
import { HttpClient } from "@angular/common/http";


@Service()
export class PagamentiServices {
    private url = "http://localhost:9090/rest/Pagamenti/";
    private configUrl = "http://localhost:9090/rest/test/config";

    private http = inject(HttpClient);

    createIntent(req: PaymentIntentReq) {
        return this.http.post<PaymentIntentDTO>(this.url + "create-intent", req);
    }

    getMetodiSalvati(idOrdine: number) {
        return this.http.get<MetodoPagamentoDTO[]>(this.url + "metodi-salvati/" + idOrdine);
    }

    getConfig() {
        return this.http.get<{ publishableKey: string }>(this.configUrl);
    }
}
