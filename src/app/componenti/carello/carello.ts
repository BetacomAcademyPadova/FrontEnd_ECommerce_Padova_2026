import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carello',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './carello.html',
  styleUrl: './carello.css',
})
export class Carello {
    idCarrello:number;

    dataUltimoAgg:string;

    user:any;

   // prodotti:ProdottiCarrello[];

    totale:number;
}
