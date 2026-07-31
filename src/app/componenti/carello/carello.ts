import { Component, inject, signal } from '@angular/core';
import { CarrelloServices } from '../../services/carrello-services';
import { AuthServices } from '../../auth/auth-services';
import { Carrello } from '../../models/carrello';
import { ProdottoCarrelloView } from '../../models/prodotto-carrello-view';
import { ProdottoServices } from '../../services/prodotto-services.js';
import { ProdottiCarrelloServices } from '../../services/prodotti-carrello-services';
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from "@angular/material/divider";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector:'app-carello',
  imports: [MatCard, MatCardContent, MatIcon, MatDivider, CurrencyPipe, MatIconModule, MatButtonModule],
  templateUrl:'./carello.html',
  styleUrl:'./carello.css'
})

export class Carello {
  private carrelloService = inject(CarrelloServices);
  private auth = inject(AuthServices);
  private router = inject(Router);
  private prodottoService = inject(ProdottoServices);
  private prodottiCarrelloService = inject(ProdottiCarrelloServices);

  carrello = signal<Carrello | null>(null);
  prodottiView = signal<ProdottoCarrelloView[]>([]);

  ngOnInit(){
    this.caricaCarrello();
  }

  caricaCarrello(){
    const userId = Number(this.auth.grant().userId);
    this.carrelloService
    .getByUser(userId)
    .subscribe({
        next:(res)=>{
            this.carrello.set(res);
            this.caricaDettagliProdotti(res);
            console.log(res);
        },
        error:(err)=>{
            console.error(err);
        }
    });
}

caricaDettagliProdotti(carrello:Carrello){
  this.prodottoService.getAll()
  .subscribe({
      next:(prodotti)=>{
          const lista = carrello.prodotti.map(pc=>{
              let prodottoFinale:any = {};
              prodotti.forEach((p:any)=>{
                  const divisione = p.divisioni?.find(
                      (d:any)=>
                      d.idDivisione === pc.idDivisioneProdotto
                  );
                  if(divisione){
                      prodottoFinale = {
                          ...pc,
                          descrizione:p.descrizione,
                          colore:divisione.colore,
                          materiale:divisione.materiale,
                          altezza:divisione.altezza,
                          lunghezza:divisione.lunghezza,
                          larghezza:divisione.larghezza
                      };
                  }
              });
              return prodottoFinale;
          });
          this.prodottiView.set(lista);
      }
  });
}

modificaQuantita(prodotto:ProdottoCarrelloView, nuovaQuantita:number){
  if(nuovaQuantita < 1){
    this.eliminaProdotto(prodotto);
    return;
  }

  const body = {
    idRiga: prodotto.idRiga,
    quantita: nuovaQuantita
  };

  this.prodottiCarrelloService
  .update(body)
  .subscribe({
    next:()=>{
      this.prodottiView.update(prodotti =>
        prodotti.map(p => 
          p.idRiga === prodotto.idRiga
          ? {...p, quantita:nuovaQuantita, subtotale:p.prezzo * nuovaQuantita} 
          : p 
        )
      );
    },

    error:(err)=>{
      console.error("Errore aggiornamento quantità", err);
    }
  });
}

eliminaProdotto(prodotto:any){
  this.prodottiCarrelloService
  .delete(prodotto.idRiga)
  .subscribe({
    next:()=>{
      console.log("Prodotto eliminato");
      this.prodottiView.update(
        prodotti => 
          prodotti.filter(
            p => p.idRiga !== prodotto.idRiga
          )
      );
      this.carrelloService.aggiornaConteggio();

      const carrelloAttuale = this.carrello();
      if(carrelloAttuale){
        carrelloAttuale.prodotti =
          carrelloAttuale.prodotti.filter(
            p => p.idRiga !== prodotto.idRiga
          );
        carrelloAttuale.totale =
          carrelloAttuale.prodotti.reduce(
            (tot,p)=> tot + p.subtotale,
            0
          );
        this.carrello.set({
          ...carrelloAttuale
        });
      }
    },
    error:(err)=>{
      console.error("Errore eliminazione prodotto", err);
    }
  });
}

vaiAlCheckout(){
  this.router.navigate(['/checkout']);
}

}
