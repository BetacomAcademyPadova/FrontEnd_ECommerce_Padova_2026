import { Component, inject, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { DecimalPipe } from '@angular/common';

import { RicevutaServices } from '../../services/ricevuta-services';

@Component({

  selector: 'app-ricevuta',

  imports: [ MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, DecimalPipe ],
  templateUrl: './ricevuta.html',
  styleUrl: './ricevuta.css',

})
export class Ricevuta implements OnInit {
  private readonly ricevutaS = inject(RicevutaServices);

  ngOnInit(): void {
    this.ricevutaS.list();
  }

  get ricevute() {
    return this.ricevutaS.ricevute();
  }

  creaRicevuta() {
    console.log("creazione ricevuta");
  }

  selezionaRicevuta(row:any) {
    console.log("ricevuta selezionata:", row);
  }

  dettaglio(row:any) {
    console.log("dettaglio ricevuta:", row);
  }

  aggiorna(row:any) {
    const body = {
      idFattura: row.idFattura
    };

    this.ricevutaS.update(body)

      .subscribe({

        next: () => {
          console.log("ricevuta aggiornata");
        },

        error: (err) => {
          console.error(err);
        }
      });
  }
}