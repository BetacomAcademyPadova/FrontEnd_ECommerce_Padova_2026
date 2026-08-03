import { Component, ChangeDetectorRef, inject, OnInit } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";

import { RicevutaServices } from "../../services/ricevuta-services";
import { AuthServices } from "../../auth/auth-services";
import { RicevutaDialog } from "../../dialogs/ricevuta-dialog/ricevuta-dialog";

@Component({
  selector: "app-ricevuta",
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    DecimalPipe,
    FormsModule,
  ],
  templateUrl: "./ricevuta.html",
  styleUrl: "./ricevuta.css",
})
export class Ricevuta implements OnInit {
  private readonly ricevutaS = inject(RicevutaServices);
  private readonly auth = inject(AuthServices);
  private readonly dialog = inject(MatDialog);
  private readonly cd = inject(ChangeDetectorRef);

  ricevuteCliente: any[] = [];
  ricevuteVenditore: any[] = [];

  isVenditore = false;

  vista: "acquisti" | "vendite" = "acquisti";

  dataInizio = "";
  dataFine = "";

  ngOnInit(): void {
    const grant = this.auth.grant();

    if (!grant.isLogged || !grant.userId) {
      console.error("Utente non autenticato");
      return;
    }

    const userId = Number(grant.userId);

    this.isVenditore = grant.isVenditore;

    this.caricaAcquisti(userId);

    if (this.isVenditore) {
      this.caricaVendite(userId);
    }
  }

  caricaAcquisti(userId: number) {
    this.ricevutaS.getByUserId(userId).subscribe({
      next: (res) => {
        this.ricevuteCliente = res;

        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  caricaVendite(userId: number) {
    this.ricevutaS.getRicevuteVenditore(userId).subscribe({
      next: (res) => {
        this.ricevuteVenditore = res;

        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  cambiaVista(vista: "acquisti" | "vendite") {
    this.vista = vista;

    const userId = Number(this.auth.grant().userId);

    if (vista === "acquisti") {
      this.caricaAcquisti(userId);
    }

    if (vista === "vendite") {
      this.caricaVendite(userId);
    }
  }

  cercaCliente() {
    const userId = Number(this.auth.grant().userId);

    if (!this.dataInizio || !this.dataFine) {
      this.caricaAcquisti(userId);
      return;
    }

    this.ricevutaS
      .getByUserIdAndDateRange(userId, this.dataInizio, this.dataFine)
      .subscribe({
        next: (res) => {
          this.ricevuteCliente = res;
        },

        error: (err) => {
          console.error(err);
        },
      });
  }

  cercaVenditore() {
    const userId = Number(this.auth.grant().userId);

    if (!this.dataInizio || !this.dataFine) {
      this.caricaVendite(userId);
      return;
    }

    this.ricevutaS
      .getRicevuteVenditoreByDateRange(userId, this.dataInizio, this.dataFine)
      .subscribe({
        next: (res) => {
          this.ricevuteVenditore = res;
        },

        error: (err) => {
          console.error(err);
        },
      });
  }

  apriRicevuta(r: any) {
    this.ricevutaS.getById(r.idFattura).subscribe({
      next: (res) => {
        this.dialog.open(RicevutaDialog, {
          width: "850px",
          data: res,
        });
      },

      error: (err) => {
        console.error(err);
      },
    });
  }
}
