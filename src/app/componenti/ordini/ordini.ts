import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";
import { DecimalPipe } from "@angular/common";

import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";

import { AuthServices } from "../../auth/auth-services";

import { OrdineServices } from "../../services/ordine-services";
import { ProdottiOrdineServices } from "../../services/prodotti-ordine-services";

import { OrdineDTO } from "../../services/ordine-types";

import { ProdottiOrdineDialog } from "../../dialogs/prodotti-ordine-dialog/prodotti-ordine-dialog";

@Component({
  selector: "app-ordini",
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    DecimalPipe,
  ],
  templateUrl: "./ordini.html",
  styleUrl: "./ordini.css",
})
export class Ordini implements OnInit {
  private readonly auth = inject(AuthServices);

  private readonly ordineS = inject(OrdineServices);

  private readonly prodottiOrdineS = inject(ProdottiOrdineServices);

  private readonly dialog = inject(MatDialog);

  private readonly cdr = inject(ChangeDetectorRef);

  ordiniCliente: OrdineDTO[] = [];

  ordiniVenditore: OrdineDTO[] = [];

  isVenditore = false;

  vista: "acquisti" | "vendite" = "acquisti";

  userId = 0;

  ngOnInit(): void {
    const grant = this.auth.grant();

    if (!grant?.userId) {
      return;
    }

    this.userId = Number(grant.userId);

    this.isVenditore = grant.isVenditore === true;

    this.caricaAcquisti();

    if (this.isVenditore) {
      this.caricaVendite();
    }
  }

  caricaAcquisti() {
    this.ordineS.getAllByUserId(this.userId).subscribe({
      next: (res) => {
        this.ordiniCliente = res;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  caricaVendite() {
    this.ordineS.getAllByVenditore(this.userId).subscribe({
      next: (res) => {
        this.ordiniVenditore = res;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  cambiaVista(vista: "acquisti" | "vendite") {
    this.vista = vista;

    if (vista === "acquisti") {
      this.caricaAcquisti();
    }

    if (vista === "vendite") {
      this.caricaVendite();
    }
  }

  apriOrdine(idOrdine: number) {
    this.prodottiOrdineS
      .getByOrdine(idOrdine, this.userId, this.vista === "vendite")
      .subscribe({
        next: (prodotti) => {
          this.dialog.open(ProdottiOrdineDialog, {
            width: "850px",
            data: prodotti,
          });
        },

        error: (err) => {
          console.error(err);
        },
      });
  }
}
