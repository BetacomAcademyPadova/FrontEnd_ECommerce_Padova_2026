import { Component, inject, OnInit, signal } from "@angular/core";

import { FormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

import { ProdottoServices } from "../../services/prodotto-services";
import { ImmaginiServices } from "../../services/immagini-services";
import { ProdottoDetails } from "../../dialogs/prodotto-details/prodotto-details";
import { AuthServices } from "../../auth/auth-services";
import { CarelloServices } from "../../services/carello-services";
import { ProdottiCarrelloServices } from "../../services/prodotti-carrello-services";

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

  private authService = inject(AuthServices);

  private carrelloService = inject(CarelloServices);

  private prodottiCarrelloService = inject(ProdottiCarrelloServices);

  ngOnInit(): void {
    this.caricaProdotti();
  }

  puoGestireProdotto(): boolean {
    return this.authService.isRoleAdmin() || this.authService.isRoleVenditore();
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
    const nessunFiltro =
      this.descrizione.trim() === "" &&
      this.prezzo == null &&
      this.colore.trim() === "" &&
      this.sottocategoria.trim() === "" &&
      this.materiale.trim() === "" &&
      this.altezza == null &&
      this.lunghezza == null &&
      this.larghezza == null &&
      this.sconti === false;

    if (nessunFiltro) {
      this.caricaProdotti();
      return;
    }

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
          let richieste = response.map((prodotto) => {
            return this.immaginiService
              .getByProdotto(prodotto.idProdotto)
              .subscribe({
                next: (immagini) => {
                  prodotto.immagini = immagini;
                },

                error: () => {
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

            console.log("Ricerca con immagini:", response);
          });
        },

        error: (errore) => {
          console.error("Errore ricerca prodotti:", errore);
        },
      });
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

  aggiungiAlCarrello(prodotto: any): void {
    const userId = Number(this.authService.grant().userId);

    if (!userId) {
      console.error("Utente non autenticato");
      return;
    }

    this.carrelloService.getByUser(userId).subscribe({
      next: (carrello: any) => {

        const quantita = prodotto.quantitaCarrello ?? 1;
        const divisione = prodotto.divisioni?.[0];

        if (!divisione) {
          console.error("Nessuna variante disponibile");
          return;
        }

        

        const body = {
          idCarrello: carrello.idCarrello,
          idDivisioneProdotto: divisione.idDivisione,
          quantita: prodotto.quantitaCarrello ?? 1,
        };

        console.log("Invio:", body);

        this.prodottiCarrelloService.create(body).subscribe({
          next: () => {
            console.log("Prodotto aggiunto al carrello");
            this.carrelloService.aggiornaConteggio();
          },

          error: (err) => {
            console.error(err);
          },
        });
      },

      error: (err) => {
        console.error(err);
      },
    });
  }
}