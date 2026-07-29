import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RicevutaServices } from '../../services/ricevuta-services';
import { AuthServices } from '../../auth/auth-services';

@Component({
    selector: 'app-ricevuta',
    imports: [ MatCardModule, MatDividerModule, MatButtonModule, MatIconModule, DecimalPipe],
    templateUrl: './ricevuta.html',
    styleUrl: './ricevuta.css'
})
export class Ricevuta implements OnInit {
    private readonly ricevutaS = inject(RicevutaServices);
    readonly authS = inject(AuthServices);
    userId!: number;
    ricevutaSelezionata: any = null;
    modalita: 'ordini' | 'vendite' = 'ordini';

    ngOnInit(): void {
        const id = this.authS.grant().userId;
        if (id) {
            this.userId = Number(id);
            this.caricaRicevute();
        }
    }

    get ricevute() {
        return this.ricevutaS.ricevute();
    }

    get isVenditore(): boolean {
        return this.authS.grant().isVenditore;
    }

    cambiaVista(
        vista: 'ordini' | 'vendite'
    ) {
        this.modalita = vista;
        this.ricevutaSelezionata = null;
        this.caricaRicevute();
    }

    caricaRicevute() {
        if (this.modalita === 'ordini') {
            this.ricevutaS
                .getByUserId(this.userId)
                .subscribe({
                    next: data => {
                        this.ricevutaS.setRicevute(data);
                    },
                    error: err => {
                        console.error('Errore caricamento ricevute', err);
                    }
                });
        } else {
            this.ricevutaS
                .getRicevuteVenditore(this.userId)
                .subscribe({
                    next: data => {
                        this.ricevutaS.setRicevute(data);
                    },
                    error: err => {
                        console.error('Errore caricamento ricevute venditore', err);
                    }
                });
        }
    }

    filtraDate(
        inizio:string,
        fine:string
    ) {
        if (this.modalita === 'ordini') {
            this.ricevutaS
                .getByUserIdAndDateRange(
                    this.userId,
                    inizio,
                    fine
                )
                .subscribe({
                    next: data => {
                        this.ricevutaS.setRicevute(data);
                    },
                    error: err => {
                        console.error(err);
                    }
                });
        } else {
            this.ricevutaS
                .getRicevuteVenditoreByDateRange(
                    this.userId,
                    inizio,
                    fine
                )
                .subscribe({
                    next: data => {
                        this.ricevutaS.setRicevute(data);
                    },
                    error: err => {
                        console.error(err);
                    }
                });
        }
    }

    selezionaRicevuta(
        ric:any
    ) {
        this.ricevutaS
            .getById(ric.idFattura)
            .subscribe({
                next: data => {
                    this.ricevutaSelezionata = data;
                },
                error: err => {
                    console.error('Errore dettaglio ricevuta', err);
                }
            });
    }

    chiudiDettaglio() {
        this.ricevutaSelezionata = null;
    }

    stampa() {
        window.print();
    }
}