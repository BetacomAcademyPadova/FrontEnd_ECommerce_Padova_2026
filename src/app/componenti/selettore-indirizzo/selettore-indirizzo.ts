import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { switchMap } from 'rxjs';

import { IndirizzoServices } from '../../services/indirizzo-services';
import { IndirizzoDTO, IndirizzoReq } from '../../services/ordine-types';

/**
 * Address picker: choose one of the user's saved addresses, or add a new one.
 * Used twice on the confirm page (shipping + billing), so it owns no page-level
 * state -- the list and the current selection are passed in by the parent.
 */
@Component({
  selector: 'app-selettore-indirizzo',
  imports: [
    FormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './selettore-indirizzo.html',
  styleUrl: './selettore-indirizzo.css',
})
export class SelettoreIndirizzo {

  // ---- inputs from the parent -------------------------------------------
  titolo = input('Indirizzo');
  indirizzi = input.required<IndirizzoDTO[]>();
  idUser = input.required<number>();
  selezionato = input<number | null>(null);

  // ---- outputs to the parent --------------------------------------------
  /** An existing address was picked. */
  cambiato = output<number>();
  /** A new address was saved: refreshed list + the id to select. */
  aggiunto = output<{ lista: IndirizzoDTO[]; idNuovo: number }>();

  private indirizzoS = inject(IndirizzoServices);

  // ---- local state -------------------------------------------------------
  modalitaNuovo = signal(false);
  salvataggio = signal(false);
  errore = signal('');

  via = signal('');
  citta = signal('');
  cap = signal('');
  predefinito = signal(false);

  /** CAP italiano: esattamente 5 cifre. */
  capValido = computed(() => /^\d{5}$/.test(this.cap().trim()));

  nuovoValido = computed(() =>
    this.via().trim().length > 0 &&
    this.citta().trim().length > 0 &&
    this.capValido()
  );

  scegli(id: number) {
    this.cambiato.emit(id);
  }

  apriNuovo() {
    this.errore.set('');
    this.modalitaNuovo.set(true);
  }

  annullaNuovo() {
    this.modalitaNuovo.set(false);
    this.svuotaCampi();
  }

  salvaNuovo() {
    if (!this.nuovoValido() || this.salvataggio()) return;

    this.salvataggio.set(true);
    this.errore.set('');

    const req: IndirizzoReq = {
      idUser: this.idUser(),
      via: this.via().trim(),
      citta: this.citta().trim(),
      cap: this.cap().trim(),
      predefinito: this.predefinito(),
    };

    // Indirizzi/create returns only { msg }, never the new id, so we re-read
    // the list and take the highest id. Replace this with the id from the
    // response as soon as the backend returns one.
    this.indirizzoS.create(req)
      .pipe(switchMap(() => this.indirizzoS.getAllByUser(this.idUser())))
      .subscribe({
        next: (lista) => {
          const idNuovo = lista.reduce(
            (max, i) => (i.idIndirizzo > max ? i.idIndirizzo : max), 0);

          this.salvataggio.set(false);
          this.modalitaNuovo.set(false);
          this.svuotaCampi();
          this.aggiunto.emit({ lista, idNuovo });
        },
        error: (e) => {
          this.salvataggio.set(false);
          this.errore.set(e?.error?.msg ?? 'Non è stato possibile salvare l\'indirizzo.');
        },
      });
  }

  private svuotaCampi() {
    this.via.set('');
    this.citta.set('');
    this.cap.set('');
    this.predefinito.set(false);
  }
}