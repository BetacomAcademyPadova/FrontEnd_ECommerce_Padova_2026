import { Component, afterNextRender, inject, signal } from '@angular/core';
import { AuthServices } from '../../auth/auth-services';

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
export class Ricevuta {
  private readonly ricevutaS = inject(RicevutaServices);
  private readonly auth = inject(AuthServices);

  ricevute = signal<any[]>([]);
  caricamento = signal(true);
  errore = signal('');

  // afterNextRender e non ngOnInit: in SSR non c'e' sessione, l'userId
  // sarebbe 0 e la chiamata partirebbe due volte.
  constructor() {
    afterNextRender(() => this.carica());
  }

  private carica() {
    const userId = Number(this.auth.grant().userId);
    if (!userId) {
      this.caricamento.set(false);
      this.errore.set('Accedi per vedere le tue ricevute.');
      return;
    }

    this.ricevutaS.getByUser(userId).subscribe({
      next: (r) => {
        this.ricevute.set(r);
        this.caricamento.set(false);
      },
      error: (e) => {
        this.caricamento.set(false);
        this.errore.set(e?.error?.msg ?? 'Non e\' stato possibile caricare le ricevute.');
      },
    });
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
}