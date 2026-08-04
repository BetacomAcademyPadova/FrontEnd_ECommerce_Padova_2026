import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { forkJoin } from 'rxjs';

import { AuthServices } from '../../auth/auth-services';
import { UtenteServices } from '../../services/user-services';
import { UtilitiesServices } from '../../services/utilities-services';
import { IndirizzoServices } from '../../services/indirizzo-services';
import { IndirizzoDTO } from '../models/ordine-types';
import { Registrazione } from '../../dialogs/registrazione/registrazione';
import { ChangePassword } from '../../dialogs/change-password/change-password';
import { IndirizzoDialog } from '../../dialogs/indirizzo-dialog/indirizzo-dialog';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './profilo.html',
  styleUrl: './profilo.css'
})
export class Profilo implements OnInit {

  private readonly auth = inject(AuthServices);
  private readonly userS = inject(UtenteServices);
  private readonly util = inject(UtilitiesServices);
  private readonly indirizzoS = inject(IndirizzoServices);

  sezione = signal<'profilo' | 'indirizzi' | 'sicurezza'>('profilo');

  utente = signal<any>(null);
  indirizzi = signal<IndirizzoDTO[]>([]);
  selezionati = signal<Set<number>>(new Set());

  haSelezione = computed(() => this.selezionati().size > 0);
  puoModificare = computed(() => this.selezionati().size === 1);

  ngOnInit(): void {
    this.caricaProfilo();
    this.caricaIndirizzi();
  }

  cambiaSezione(tab: 'profilo' | 'indirizzi' | 'sicurezza'): void {
    this.sezione.set(tab);
  }

  caricaProfilo(): void {
    const userId = this.auth.grant().userId;
    this.userS.findByUserNameNumber(Number(userId))
      .subscribe({
        next: (resp) => this.utente.set(resp),
        error: (err) => console.error("Errore profilo:", err)
      });
  }

  caricaIndirizzi(): void {
    const userId = this.auth.grant().userId;

    this.indirizzoS.getAllByUser(Number(userId))
      .subscribe({
        next: (resp) => {
          this.indirizzi.set(resp);
          this.selezionati.set(new Set());
        },
        error: (err) => console.error("Errore indirizzi:", err)
      });
  }

  isSelezionato(id: number): boolean {
    return this.selezionati().has(id);
  }

  toggleSelezione(id: number): void {
    const nuovi = new Set(this.selezionati());
    if (nuovi.has(id)) {
      nuovi.delete(id);
    } else {
      nuovi.add(id);
    }
    this.selezionati.set(nuovi);
  }

  aggiungiIndirizzo(): void {
    const dialogRef = this.util.openDialog(
      IndirizzoDialog,
      { indirizzo: null, mode: 'C' },
      { width: '450px', disableClose: true }
    );

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.caricaIndirizzi();
      }
    });
  }

  modificaIndirizzo(): void {
    if (!this.puoModificare()) {
      return;
    }

    const id = Array.from(this.selezionati())[0];
    const indirizzo = this.indirizzi().find(i => i.idIndirizzo === id) ?? null;

    const dialogRef = this.util.openDialog(
      IndirizzoDialog,
      { indirizzo, mode: 'U' },
      { width: '450px', disableClose: true }
    );

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.caricaIndirizzi();
      }
    });
  }

  cancellaIndirizzo(): void {
    if (!this.haSelezione()) {
      return;
    }

    const ids = Array.from(this.selezionati());
    const conferma = confirm(
      ids.length === 1
        ? "Vuoi eliminare l'indirizzo selezionato?"
        : `Vuoi eliminare i ${ids.length} indirizzi selezionati?`
    );

    if (!conferma) {
      return;
    }

    const richieste = ids.map(id => this.indirizzoS.delete(id));

    forkJoin(richieste).subscribe({
      next: () => this.caricaIndirizzi(),
      error: (err) => console.error("Errore eliminazione:", err)
    });
  }

  modificaProfilo(): void {
    const dialogRef = this.util.openDialog(
      Registrazione,
      { account: this.utente(), mode: 'U' },
      { width: '900px', disableClose: true }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.caricaProfilo();
      }
    });
  }

  changePassword(): void {
    this.util.openDialog(
      ChangePassword,
      {},
      { width: '450px', disableClose: true }
    );
  }
}