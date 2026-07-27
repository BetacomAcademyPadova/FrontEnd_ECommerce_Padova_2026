import { Component, inject, OnInit, signal } from "@angular/core";

import { FormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

import { ProdottoServices } from "../../services/prodotto-services";
import { ImmaginiServices } from "../../services/immagini-services";
import { ProdottoDetails } from "../../dialogs/prodotto-details/prodotto-details";

@Component({
  selector: "app-prodotti",
  standalone: true,

  imports: [FormsModule, MatDialogModule],

  templateUrl: "./prodotti.html",
  styleUrl: "./prodotti.css",
})
export class Prodotti implements OnInit {
  prodotti = signal<any[]>([]);

  descrizione = "";

  prezzo: number | null = null;

  colore = "";

  sottocategoria = "";

  materiale = "";

  altezza: number | null = null;

  lunghezza: number | null = null;

  larghezza: number | null = null;

  sconti = false;

  private prodottoService = inject(ProdottoServices);

  private immaginiService = inject(ImmaginiServices);

  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.caricaProdotti();
  }

  caricaProdotti(): void {
    this.prodottoService.getAll().subscribe({
      next: (response: any[]) => {
        let richieste = response.map((prodotto) => {
          return this.immaginiService
            .getByProdotto(prodotto.idProdotto)
            .subscribe({
              next: (immagini) => {
                prodotto.immagini = immagini;

                console.log("Immagini prodotto", prodotto.idProdotto, immagini);
              },

              error: (errore) => {
                console.error(
                  "Errore caricamento immagini prodotto",
                  prodotto.idProdotto,
                  errore
                );

                prodotto.immagini = [];
              },
            });
        });

        Promise.all(
          richieste.map(
            (req) =>
              new Promise((resolve) => {
                req.add(() => resolve(true));
              })
          )
        ).then(() => {
          this.prodotti.set(response);

          console.log("Prodotti completi con immagini:", response);
        });
      },

      error: (errore) => {
        console.error("Errore caricamento prodotti:", errore);
      },
    });
  }

  cercaProdotti(): void {
    this.prodottoService
      .search(
        this.descrizione,
        this.prezzo,
        this.colore,
        this.sottocategoria,
        this.materiale,
        this.altezza,
        this.lunghezza,
        this.larghezza,
        this.sconti
      )
      .subscribe({
        next: (response: any[]) => {
          this.prodotti.set(response ?? []);

          console.log("Risultati ricerca:", response);
        },

        error: (errore) => {
          console.error("Errore ricerca prodotti:", errore);
        },
      });
  }

  resetRicerca(): void {
    this.descrizione = "";

    this.prezzo = null;

    this.colore = "";

    this.sottocategoria = "";

    this.materiale = "";

    this.altezza = null;

    this.lunghezza = null;

    this.larghezza = null;

    this.sconti = false;

    this.caricaProdotti();
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(ProdottoDetails, {
      width: "1100px",
      maxWidth: "95vw",
      maxHeight: "90vh",

      data: {
        mod: "C",
        prodotto: null,
      },
    });

    dialogRef.afterClosed().subscribe((risultato: boolean) => {
      if (risultato) {
        this.caricaProdotti();
      }
    });
  }

  openDetails(prodotto: any): void {
    const dialogRef = this.dialog.open(ProdottoDetails, {
      width: "1100px",
      maxWidth: "95vw",
      maxHeight: "90vh",

      data: {
        mod: "V",
        prodotto: prodotto,
      },
    });

    dialogRef.afterClosed().subscribe((risultato: boolean) => {
      if (risultato) {
        this.caricaProdotti();
      }
    });
  }
}
