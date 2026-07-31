import { Component, computed, inject, signal, OnInit } from '@angular/core'; // Aggiunto OnInit
import { CarelloServices } from '../../services/carello-services';
import { AuthServices } from '../../auth/auth-services';
import { Carrello } from '../../models/carrello';
import { ProdottoCarrelloView } from '../../models/prodotto-carrello-view';
import { ProdottoServices } from '../../services/prodotto-services'; // Rimosso .js
import { ProdottiCarrelloServices } from '../../services/prodotti-carrello-services';
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from "@angular/material/divider";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carello',
  imports: [MatCard, MatCardContent, MatIcon, MatDivider, CurrencyPipe, MatIconModule, MatButtonModule],
  templateUrl: './carello.html',
  styleUrl: './carello.css'
})
export class Carello implements OnInit { // Implementa OnInit
  private carrelloService = inject(CarelloServices);
  private auth = inject(AuthServices);
  private router = inject(Router);
  private prodottoService = inject(ProdottoServices);
  private prodottiCarrelloService = inject(ProdottiCarrelloServices);

  carrello = signal<Carrello | null>(null);
  prodottiView = signal<ProdottoCarrelloView[]>([]);

  totale = computed(() =>
    this.prodottiView().reduce((tot, p) => tot + (p.subtotale ?? 0), 0)
  );

  // Questo metodo serve a lanciare il caricamento non appena la pagina si apre
  ngOnInit() {
    this.caricaCarrello();
  }

  caricaCarrello() {
    const userId = Number(this.auth.grant().userId);
    this.carrelloService
      .getByUser(userId)
      .subscribe({
        next: (res) => {
          this.carrello.set(res);
          this.caricaDettagliProdotti(res);
          console.log("Carrello caricato:", res);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  caricaDettagliProdotti(carrello: Carrello) {
    this.prodottoService.getAll()
      .subscribe({
        next: (prodotti) => {
          const lista: ProdottoCarrelloView[] = [];

          // Cicliamo sui prodotti attualmente dentro il carrello dell'utente
          carrello.prodotti.forEach(pc => {
            // Cerchiamo il prodotto master che possiede la divisione corretta
            const prodottoTrovato = prodotti.find((p: any) =>
              p.divisioni?.some((d: any) => d.idDivisione === pc.idDivisioneProdotto)
            );

            if (prodottoTrovato) {
              // Recuperiamo i dettagli specifici di quella divisione
              const divisione = prodottoTrovato.divisioni.find(
                (d: any) => d.idDivisione === pc.idDivisioneProdotto
              );

              // Uniamo i dati della riga carrello con i dettagli del catalogo prodotti
              lista.push({
                ...pc,
                descrizione: prodottoTrovato.descrizione,
                colore: divisione.colore,
                materiale: divisione.materiale,
                altezza: divisione.altezza,
                lunghezza: divisione.lunghezza,
                larghezza: divisione.larghezza,
                // Assicurati che il subtotale sia calcolato se manca dal backend
                subtotale: pc.subtotale ?? (pc.prezzo * pc.quantita) 
              });
            }
          });

          this.prodottiView.set(lista);
          console.log("Prodotti mappati per la view:", lista);
        },
        error: (err) => console.error("Errore dettagli prodotti", err)
      });
  }

  modificaQuantita(prodotto: ProdottoCarrelloView, nuovaQuantita: number) {
    if (nuovaQuantita < 1) {
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
        next: () => {
          this.prodottiView.update(prodotti =>
            prodotti.map(p =>
              p.idRiga === prodotto.idRiga
                ? { ...p, quantita: nuovaQuantita, subtotale: p.prezzo * nuovaQuantita }
                : p
            )
          );
        },
        error: (err) => {
          console.error("Errore aggiornamento quantità", err);
        }
      });
  }

  eliminaProdotto(prodotto: any) {
    this.prodottiCarrelloService
      .delete(prodotto.idRiga)
      .subscribe({
        next: () => {
          console.log("Prodotto eliminato");
          this.prodottiView.update(
            prodotti => prodotti.filter(p => p.idRiga !== prodotto.idRiga)
          );
          this.carrelloService.aggiornaConteggio();

          const carrelloAttuale = this.carrello();
          if (carrelloAttuale) {
            carrelloAttuale.prodotti = carrelloAttuale.prodotti.filter(
              p => p.idRiga !== prodotto.idRiga
            );
            this.carrello.set({ ...carrelloAttuale });
          }
        },
        error: (err) => {
          console.error("Errore eliminazione prodotto", err);
        }
      });
  }

  vaiAlCheckout() {
    this.router.navigate(['/checkout']);
  }
}