import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class AutentificazioneServices {
    url = "http://localhost:9090/rest/User/"
    private http = inject(HttpClient);

    login(body: {}) {
        return this.http.post(this.url + "login", body)
    }



}
