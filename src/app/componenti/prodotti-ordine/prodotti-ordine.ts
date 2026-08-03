import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";

import { ProdottiOrdineServices } from "../../services/prodotti-ordine-services";
import { AuthServices } from "../../auth/auth-services";

@Component({
  selector: "app-prodotti-ordine",
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    DecimalPipe,
    FormsModule,
  ],
  templateUrl: "./prodotti-ordine.html",
  styleUrl: "./prodotti-ordine.css",
})
export class ProdottiOrdine implements OnInit {
  private readonly prodottiOrdineS = inject(ProdottiOrdineServices);

  private readonly auth = inject(AuthServices);

  private readonly cdr = inject(ChangeDetectorRef);

  prodottiOrdine: any[] = [];

  vista: "cliente" | "venditore" | "tutti" = "cliente";

  isVenditore = false;

  userId = 0;

  dataInizio = "";

  dataFine = "";

  ngOnInit(): void {
    const grant = this.auth.grant();

    console.log("UTENTE LOGIN:", grant);

    if (!grant?.userId) {
      console.error("Utente non trovato");

      return;
    }

    this.userId = Number(grant.userId);

    this.isVenditore = grant.isVenditore === true;

    this.caricaCliente();
  }

  caricaCliente(): void {
    this.vista = "cliente";

    this.prodottiOrdineS.getByCliente(this.userId).subscribe({
      next: (res) => {
        console.log("RISPOSTA CLIENTE:", res);

        this.prodottiOrdine = [...res];

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  caricaVenditore(): void {
    this.vista = "venditore";

    this.prodottiOrdineS.getByVenditore(this.userId).subscribe({
      next: (res) => {
        console.log("RISPOSTA VENDITORE:", res);

        this.prodottiOrdine = [...res];

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  caricaTutti(): void {
    this.vista = "tutti";

    this.prodottiOrdineS.getAll().subscribe({
      next: (res) => {
        this.prodottiOrdine = [...res];

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  cercaCliente(): void {
    if (!this.dataInizio || !this.dataFine) {
      this.caricaCliente();

      return;
    }

    this.prodottiOrdineS
      .getByClienteDate(this.userId, this.dataInizio, this.dataFine)
      .subscribe({
        next: (res) => {
          console.log("FILTRO CLIENTE:", res);

          this.prodottiOrdine = [...res];

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(err);
        },
      });
  }

  cercaVenditore(): void {
    if (!this.dataInizio || !this.dataFine) {
      this.caricaVenditore();

      return;
    }

    this.prodottiOrdineS
      .getByVenditoreDate(this.userId, this.dataInizio, this.dataFine)
      .subscribe({
        next: (res) => {
          console.log("FILTRO VENDITORE:", res);

          this.prodottiOrdine = [...res];

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(err);
        },
      });
  }
}
