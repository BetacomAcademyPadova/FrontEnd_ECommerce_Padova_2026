import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';
import { OrdineServices } from '../../services/ordine-services';
import { IndirizzoServices } from '../../services/indirizzo-services';
import { OrdineReq, IndirizzoDTO } from '../../services/ordine-types';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { CarelloServices } from '../../services/carello-services';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { SelettoreIndirizzo } from '../selettore-indirizzo/selettore-indirizzo';
import { CarrelloDTO } from '../../services/carello-types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-conferma-ordine',
  imports: [
     MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SelettoreIndirizzo,
    DecimalPipe,
  ],
  templateUrl: './conferma-ordine.html',
  styleUrl: './conferma-ordine.css',
})
export class ConfermaOrdine {

  private auth = inject(AuthServices);
  private ordineS = inject(OrdineServices);
  private indirizzoS = inject(IndirizzoServices);
  private router = inject(Router);
  private carrelloS = inject(CarelloServices);

  indirizzi = signal<IndirizzoDTO[]>([]);
  // indirizzoScelto = signal<number | null>(null);
  // totale = signal(0);
  // messaggio = signal('');
  statoId = signal<number | null>(null);
  carrello = signal<CarrelloDTO | null>(null);
  spedizioneId = signal<number | null>(null);
  fatturazioneUguale = signal(true);
  fatturazioneScelta = signal<number | null>(null);

  // TODO: sostituire quando esisterà Carrello/getByUser/{userId}
  private readonly ID_CARRELLO_TEST = 4;


  fatturazioneId = computed(() =>
    this.fatturazioneUguale() ? this.spedizioneId() : this.fatturazioneScelta()
  );
  
  caricamento = signal(true);
  invio = signal(false);
  errore = signal('');

  righe = computed(() => this.carrello()?.prodotti ?? []);
  totale = computed(() => this.carrello()?.totale ?? 0);
  carrelloVuoto = computed(() => !this.caricamento() && this.righe().length === 0);

  puoConfermare = computed(() =>
    !this.caricamento() &&
    !this.invio() &&
    this.righe().length > 0 &&
    this.totale() > 0 &&
    this.spedizioneId() !== null &&
    this.fatturazioneId() !== null &&
    this.statoId() !== null
  );

  userId = signal(0);

  // private getUserId(): number {
  //   return Number(this.auth.grant().userId);
  // }

  constructor() {
    afterNextRender(() => this.carica());
  }

   private carica() {
    this.userId.set(Number(this.auth.grant().userId));
 
    if (!this.userId()) {
      this.caricamento.set(false);
      this.errore.set('Accedi per completare l\'ordine.');
      return;
    }
 
    // Un'unica forkJoin: o la pagina è pronta, o mostra un errore. Niente
    // stati intermedi in cui metà schermo è popolata e metà no.
    forkJoin({
      indirizzi: this.indirizzoS.getAllByUser(this.userId()),
      stati: this.ordineS.getStati(),
      carrello: this.carrelloS.getById(this.ID_CARRELLO_TEST),
    }).subscribe({
      next: ({ indirizzi, stati, carrello }) => {
        this.indirizzi.set(indirizzi);
        const pref = indirizzi.find(i => i.predefinito) ?? indirizzi[0];
        if (pref) this.spedizioneId.set(pref.idIndirizzo);
 
        // Confronto tollerante: il seed del team contiene "In Attessa".
        const attesa = stati.find(s =>
          s.statoOrdine?.trim().toLowerCase().startsWith('in attes'));
        if (attesa) this.statoId.set(attesa.idStatoOrdine);
        else this.errore.set('Stato ordine iniziale non configurato.');
 
        this.carrello.set(carrello);
        this.caricamento.set(false);
      },
      error: (e) => {
        this.caricamento.set(false);
        this.errore.set(e?.error?.msg ?? 'Non è stato possibile caricare la pagina.');
      },
    });
  }
 
  // callback dal selettore indirizzo
  indirizzoAggiunto(ev: { lista: IndirizzoDTO[]; idNuovo: number }, perSpedizione: boolean) {
    this.indirizzi.set(ev.lista);
    if (perSpedizione) this.spedizioneId.set(ev.idNuovo);
    else this.fatturazioneScelta.set(ev.idNuovo);
  }
 
  cambiaFatturazioneUguale(uguale: boolean) {
    this.fatturazioneUguale.set(uguale);
    // Riparti dalla spedizione: è la scelta più probabile anche quando differiscono.
    if (!uguale && this.fatturazioneScelta() === null) {
      this.fatturazioneScelta.set(this.spedizioneId());
    }
  }
 
  conferma() {
    if (!this.puoConfermare()) return;
 
    this.invio.set(true);
    this.errore.set('');
 
    const req: OrdineReq = {
      data: new Date().toISOString().slice(0, 10),
      // totale: this.totale(),
      userId: this.userId(),
      indirizzoSpedizioneId: this.spedizioneId()!,
      indirizzoFatturazioneId: this.fatturazioneId()!,
      statoId: this.statoId()!,
    };
 
    this.ordineS.create(req).subscribe({
      next: (r) => {
        this.router.navigate(['/dash/checkout'], {
          queryParams: { idOrdine: r.idOrdine },
          // queryParams: {
          //   idOrdine: r.idOrdine,
          //   idSpedizione: this.spedizioneId(),
          // },
        });
      },
      error: (e) => {
        this.invio.set(false);
        this.errore.set(e?.error?.msg ?? 'Non è stato possibile creare l\'ordine.');
      },
    });
  }
}