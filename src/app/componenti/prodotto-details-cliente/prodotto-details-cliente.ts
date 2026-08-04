import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";

import { AuthServices } from "../../auth/auth-services";
import { CarelloServices } from "../../services/carello-services";
import { ProdottiCarrelloServices } from "../../services/prodotti-carrello-services";

@Component({
  selector: "app-prodotto-cliente-details",
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
  ],

  templateUrl: "./prodotto-details-cliente.html",
  styleUrl: "./prodotto-details-cliente.css",
})
export class ProdottoClienteDetails implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);

  private readonly dialogRef = inject(MatDialogRef<ProdottoClienteDetails>);

  private readonly authService = inject(AuthServices);

  private readonly carrelloService = inject(CarelloServices);

  private readonly prodottiCarrelloService = inject(ProdottiCarrelloServices);

  prodotto = signal<any>(null);

  immagini = signal<any[]>([]);

  imagePreview = signal<string | null>(null);

  divisioni = signal<any[]>([]);

  divisioneSelezionata = signal<any>(null);

  materiale = signal<string | null>(null);

  colore = signal<string | null>(null);

  altezza = signal<number | null>(null);

  lunghezza = signal<number | null>(null);

  larghezza = signal<number | null>(null);

  quantita = signal<number>(1);

  constructor() {
    this.prodotto.set(this.data.prodotto);
  }

  ngOnInit(): void {
    const prodotto = this.prodotto();

    this.immagini.set(prodotto.immagini ?? []);

    if (this.immagini().length > 0) {
      this.imagePreview.set(this.immagini()[0].url);
    }

    this.divisioni.set(prodotto.divisioni ?? []);

    /*
       selezione iniziale:
       prende la prima variante disponibile
    */

    if (this.divisioni().length > 0) {
      this.selezionaDivisione(this.divisioni()[0]);
    }
  }

  /*
     FILTRO DINAMICO
     Ogni scelta restringe
     le combinazioni possibili
  */

  private getDivisioniCompatibili(escluso?: string): any[] {
    return this.divisioni().filter((d) => {
      if (
        escluso !== "materiale" &&
        this.materiale() &&
        d.materiale !== this.materiale()
      ) {
        return false;
      }

      if (escluso !== "colore" && this.colore() && d.colore !== this.colore()) {
        return false;
      }

      if (
        escluso !== "altezza" &&
        this.altezza() &&
        d.altezza !== this.altezza()
      ) {
        return false;
      }

      if (
        escluso !== "lunghezza" &&
        this.lunghezza() &&
        d.lunghezza !== this.lunghezza()
      ) {
        return false;
      }

      if (
        escluso !== "larghezza" &&
        this.larghezza() &&
        d.larghezza !== this.larghezza()
      ) {
        return false;
      }

      return true;
    });
  }

  materialiDisponibili = computed(() => {
    return [
      ...new Set(
        this.getDivisioniCompatibili("materiale").map((d) => d.materiale),
      ),
    ];
  });

  coloriDisponibili = computed(() => {
    return [
      ...new Set(this.getDivisioniCompatibili("colore").map((d) => d.colore)),
    ];
  });

  altezzeDisponibili = computed(() => {
    return [
      ...new Set(this.getDivisioniCompatibili("altezza").map((d) => d.altezza)),
    ];
  });

  lunghezzeDisponibili = computed(() => {
    return [
      ...new Set(
        this.getDivisioniCompatibili("lunghezza").map((d) => d.lunghezza),
      ),
    ];
  });

  larghezzeDisponibili = computed(() => {
    return [
      ...new Set(
        this.getDivisioniCompatibili("larghezza").map((d) => d.larghezza),
      ),
    ];
  });
  onMaterialeChange(value: string | null): void {
    this.materiale.set(value);

    this.verificaVariante();
  }

  onColoreChange(value: string | null): void {
    this.colore.set(value);

    this.verificaVariante();
  }

  onAltezzaChange(value: number | null): void {
    this.altezza.set(value);

    this.verificaVariante();
  }

  onLunghezzaChange(value: number | null): void {
    this.lunghezza.set(value);

    this.verificaVariante();
  }

  onLarghezzaChange(value: number | null): void {
    this.larghezza.set(value);

    this.verificaVariante();
  }

  private verificaVariante(): void {
    const disponibile = this.divisioni().find((d) => {
      return (
        (!this.materiale() || d.materiale === this.materiale()) &&
        (!this.colore() || d.colore === this.colore()) &&
        (!this.altezza() || d.altezza === this.altezza()) &&
        (!this.lunghezza() || d.lunghezza === this.lunghezza()) &&
        (!this.larghezza() || d.larghezza === this.larghezza())
      );
    });

    if (disponibile) {
      this.selezionaDivisione(disponibile);
    } else {
      this.divisioneSelezionata.set(null);
    }
  }

  selezionaDivisione(divisione: any): void {
    this.divisioneSelezionata.set(divisione);

    this.materiale.set(divisione.materiale);

    this.colore.set(divisione.colore);

    this.altezza.set(divisione.altezza);

    this.lunghezza.set(divisione.lunghezza);

    this.larghezza.set(divisione.larghezza);
  }

  prezzo(): number {
    const divisione = this.divisioneSelezionata();

    if (divisione?.prezzo) {
      return divisione.prezzo;
    }

    return this.prodotto()?.prezzo ?? 0;
  }

  aumentaQuantita(): void {
    const divisione = this.divisioneSelezionata();

    if (!divisione) {
      return;
    }

    if (this.quantita() < divisione.quantitaDisponibile) {
      this.quantita.update((q) => q + 1);
    }
  }

  diminuisciQuantita(): void {
    if (this.quantita() > 1) {
      this.quantita.update((q) => q - 1);
    }
  }

  cambiaImmagine(url: string): void {
    this.imagePreview.set(url);
  }

  resetVarianti(): void {
    this.materiale.set(null);

    this.colore.set(null);

    this.altezza.set(null);

    this.lunghezza.set(null);

    this.larghezza.set(null);

    this.quantita.set(1);

    this.divisioneSelezionata.set(null);
  }

  aggiungiAlCarrello(): void {
    const divisione = this.divisioneSelezionata();

    if (!divisione) {
      alert("Seleziona una variante disponibile");

      return;
    }

    const userId = Number(this.authService.grant().userId);

    if (!userId) {
      alert("Devi effettuare il login");

      return;
    }

    this.carrelloService.getByUser(userId).subscribe({
      next: (carrello: any) => {
        const body = {
          idCarrello: carrello.idCarrello,

          idDivisioneProdotto: divisione.idDivisione,

          quantita: this.quantita(),
        };

        this.prodottiCarrelloService.create(body).subscribe({
          next: () => {
            this.carrelloService.aggiornaConteggio();

            this.dialogRef.close(true);
          },

          error: (err) => {
            console.error("Errore carrello", err);
          },
        });
      },

      error: (err) => {
        console.error("Errore recupero carrello", err);
      },
    });
  }

  chiudi(): void {
    this.dialogRef.close();
  }
}
