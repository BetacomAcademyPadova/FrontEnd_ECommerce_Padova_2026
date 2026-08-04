import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ImmaginiServices {

  private readonly url = "http://localhost:9090/rest/Upload";

  private readonly http = inject(HttpClient);


  getByProdotto(idProdotto: number) {

    return this.http.get<any[]>(
      `${this.url}/product?id=${idProdotto}`
    );

  }


  upload(files: File[], idProdotto: number) {

    const formData = new FormData();

    files.forEach(file => {
      formData.append("files", file);
    });


    return this.http.post(
      `${this.url}/image?id=${idProdotto}`,
      formData
    );

  }

  delete(id: number){

    return this.http.delete(
      `${this.url}/${id}`
    );
  
  }

}
