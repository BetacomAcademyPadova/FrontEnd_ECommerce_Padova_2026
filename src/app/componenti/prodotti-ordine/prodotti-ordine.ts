import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { ProdottiOrdineServices } from '../../services/prodotti-ordine-services';


@Component({
  selector: 'app-prodotti-ordine',
  imports: [ MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, DecimalPipe],
  templateUrl: './prodotti-ordine.html',
  styleUrl: './prodotti-ordine.css',
})
export class ProdottiOrdine implements OnInit {
  private readonly prodottiOrdineS = inject(ProdottiOrdineServices);

  ngOnInit(): void {
    this.prodottiOrdineS.list();
  }

  get prodottiOrdine() {
    return this.prodottiOrdineS.prodottiOrdine();
  }

  selezionaProdottoOrdine(row: any) {
    console.log(
      "Prodotto ordine selezionato:",
      row
    );
  }

  elimina(row: any) {
    if (!row.idItem) {
      console.log(
        "ID prodotto ordine mancante"
      );
      return;
    }

    this.prodottiOrdineS.delete(row.idItem)
      .subscribe({
        next: () => {
          console.log(
            "Prodotto ordine eliminato"
          );
        },
        error: (err) => {
          console.log(
            "Errore eliminazione:",
            err
          );
        }
      });
  }

  aggiorna(row: any) {
    const body = {
      idItem: row.idItem,
      ordineId: row.ordineId,
      prodottoId: row.prodottoId,
      prodottiCarrelloId: row.prodottiCarrelloId,
      indirizzoSpedizioneId: row.indirizzoSpedizioneId,
      divisioneOrdineId: row.divisioneOrdineId
    };
    this.prodottiOrdineS.update(body)
      .subscribe({
        next: () => {
          console.log(
            "Prodotto ordine aggiornato"
          );
        },
        error: (err) => {
          console.log(
            "Errore update:",
            err
          );
        }
      });
  }
}