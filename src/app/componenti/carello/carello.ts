import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { CarelloServices } from '../../services/carello-services';
import { AuthServices } from '../../auth/auth-services';
import { Carrello } from '../../models/carrello';
import { ProdottoCarrelloView } from '../../models/prodotto-carrello-view';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProdottoServices } from '../../services/prodotto-services';
import { ProdottiCarrelloServices } from '../../services/prodotti-carrello-services'; 
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-carello',
  imports: [CurrencyPipe, MatDivider, MatIcon],
  templateUrl: './carello.html',
  styleUrl: './carello.css'
})
export class Carello {
  private carrelloService = inject(CarelloServices);
  private prodottiCarrelloService = inject(ProdottiCarrelloServices);
  private auth = inject(AuthServices);
  private router = inject(Router);
  private prodottoService = inject(ProdottoServices);

  carrello = signal<Carrello | null>(null);
  prodottiView = signal<ProdottoCarrelloView[]>([]);
  
  totale = computed(() =>
    this.prodottiView().reduce((tot, p) => tot + (p.subtotale || 0), 0)
  );

  constructor() {
    afterNextRender(() => this.caricaCarrello());
  }

  caricaCarrello() {
    const userId = Number(this.auth.grant().userId);
    this.carrelloService
      .getByUser(userId)
      .subscribe({
        next: (res) => {
          this.carrello.set(res);
          this.caricaDettagliProdotti(res);
        },
        error: (err) => console.error(err)
      });
  }

  caricaDettagliProdotti(carrello: Carrello) {
    this.prodottoService.getAll()
      .subscribe({
        next: (prodotti) => {
          const lista = carrello.prodotti.map(pc => {
            // Trova direttamente il prodotto che contiene la divisione corretta
            const prodottoTrovato = prodotti.find((p: any) =>
              p.divisioni?.some((d: any) => d.idDivisione === pc.idDivisioneProdotto)
            );

            if (!prodottoTrovato) return null;

            const divisione = prodottoTrovato.divisioni.find(
              (d: any) => d.idDivisione === pc.idDivisioneProdotto
            );

            // Calcola il prezzo basandoti sulla struttura dati del tuo backend
            const prezzoProdotto = divisione.prezzo || prodottoTrovato.prezzo || 0;

            return {
              ...pc,
              descrizione: prodottoTrovato.descrizione,
              colore: divisione.colore,
              materiale: divisione.materiale,
              altezza: divisione.altezza,
              lunghezza: divisione.lunghezza,
              larghezza: divisione.larghezza,
              prezzo: prezzoProdotto,
              subtotale: prezzoProdotto * pc.quantita // <--- FISSA IL NAN INIZIALE
            } as ProdottoCarrelloView;
          }).filter(p => p !== null) as ProdottoCarrelloView[]; // Rimuove eventuali prodotti non trovati

          this.prodottiView.set(lista);
        },
        error: (err) => console.error("Errore caricamento dettagli", err)
      });
  }

  modificaQuantita(prodotto: ProdottoCarrelloView, nuovaQuantita: number) {
    if (!Number.isFinite(nuovaQuantita)) return;

    if (nuovaQuantita < 1) {
      this.eliminaProdotto(prodotto);
      return;
    }

    const body = {
      idRiga: prodotto.idRiga,
      idDivisioneProdotto: prodotto.idDivisioneProdotto,
      quantita: nuovaQuantita
    };

    this.prodottiCarrelloService
      .update(body)
      .subscribe({
        next: () => {
          this.prodottiView.update(prodotti =>
            prodotti.map(p => 
              p.idRiga === prodotto.idRiga
                ? { ...p, quantita: nuovaQuantita, subtotale: (p.prezzo || 0) * nuovaQuantita }
                : p
            )
          );
          this.carrelloService.aggiornaConteggio();
        },
        error: (err: any) => console.error("Errore aggiornamento quantità", err)
      });
  }

  eliminaProdotto(prodotto: ProdottoCarrelloView) {
    this.prodottiCarrelloService
      .delete(prodotto.idRiga)
      .subscribe({
        next: () => {
          this.prodottiView.update(prodotti =>
            prodotti.filter(p => p.idRiga !== prodotto.idRiga)
          );
          this.carrelloService.aggiornaConteggio();
        },
        error: (err: any) => console.error("Errore eliminazione prodotto", err)
      });
  }

  vaiAllaConferma() {
    this.router.navigate(['/dash/conferma-ordine']);
  }
}
