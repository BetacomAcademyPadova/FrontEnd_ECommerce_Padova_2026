import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";

@Service()
export class ProfiloServices 
{
    url = "http://localhost:9090/rest/User/"

    private http = inject(HttpClient);

    updateProfilo(utente: any) 
    {
        return this.http.put(`${this.url}/update`, utente);
    }

    deleteProfilo(idUser: number) 
    {
        return this.http.delete(`${this.url}/delete/${idUser}`);
    }
}
