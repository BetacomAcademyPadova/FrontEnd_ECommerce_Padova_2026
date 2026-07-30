import { Component, inject, OnInit, signal } from "@angular/core";

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FormsModule } from "@angular/forms";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

import { CategoriaServices } from "../../services/categoria-services";
import { SottoCategoriaServices } from "../../services/sotto-categoria-services";
import { ProdottoServices } from "../../services/prodotto-services";
import { DivisioneProdottoServices } from "../../services/divisione-prodotto-services";
import { AuthServices } from "../../auth/auth-services";
import { ImmaginiServices } from "../../services/immagini-services";
import { ProdottiCarrelloServices } from "../../services/prodotti-carrello-services";
import { CarrelloServices } from "../../services/carrello-services";
import { ScontoServices } from "../../services/sconto-services";

@Component({
  selector: "app-prodotto-details",
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: "./prodotto-details.html",
  styleUrl: "./prodotto-details.css",
})
export class ProdottoDetails implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);

  private readonly dialogRef = inject(MatDialogRef<ProdottoDetails>);

  private readonly categoriaService = inject(CategoriaServices);

  private readonly sottoCategoriaService = inject(SottoCategoriaServices);

  private readonly prodottoService = inject(ProdottoServices);

  private readonly divisioneProdottoService = inject(DivisioneProdottoServices);

  private readonly authService = inject(AuthServices);

  private readonly immaginiService = inject(ImmaginiServices);

  private readonly carrelloService = inject(CarrelloServices);

  private readonly prodottiCarrelloService = inject(ProdottiCarrelloServices);

  private readonly scontoService = inject(ScontoServices);

  valoreSconto: number | null = null;

  dataInizio: string = "";

  dataFine: string = "";

  mod = signal("");

  prodotto = signal<any>(null);

  categorie = signal<any[]>([]);

  tutteSottocategorie = signal<any[]>([]);

  sottocategorie = signal<any[]>([]);

  scontoEsistente = signal<any>(null);

  msg = signal("");

  immagini = signal<any[]>([]);

  selectedFiles: File[] = [];

  imagePreview: string | null = null;

  prodottoForm: FormGroup = new FormGroup({
    descrizione: new FormControl(null, Validators.required),

    prezzo: new FormControl(null, [Validators.required, Validators.min(0)]),

    categoria: new FormControl(null, Validators.required),

    sottoCategoria: new FormControl(null, Validators.required),

    colore: new FormControl(null, Validators.required),

    materiale: new FormControl(null, Validators.required),

    altezza: new FormControl(null, [Validators.required, Validators.min(0)]),

    lunghezza: new FormControl(null, [Validators.required, Validators.min(0)]),

    larghezza: new FormControl(null, [Validators.required, Validators.min(0)]),

    quantitaDisponibile: new FormControl(null, [
      Validators.required,
      Validators.min(0),
    ]),

    stockAlert: new FormControl(null, [Validators.required, Validators.min(0)]),
  });

  constructor() {
    if (this.data) {
      this.mod.set(this.data.mod);

      this.prodotto.set(this.data.prodotto);
    }
  }

  ngOnInit(): void {
    this.caricaCategorie();

    this.caricaSottocategorie();

    this.ascoltaCambioCategoria();

    if (this.prodotto()) {
      this.caricaImmagini();

      const prodotto = this.prodotto();

      if (prodotto.sconto) {
        this.scontoEsistente.set(prodotto.sconto);

        this.valoreSconto = prodotto.sconto.valore;

        this.dataInizio = prodotto.sconto.dataInizio;

        this.dataFine = prodotto.sconto.dataFine;
      }
    }

    if (this.mod() === "V") {
      this.prodottoForm.disable();
    }

    console.log("Modalità dialog:", this.mod());

    console.log("Prodotto ricevuto:", this.prodotto());
  }

  private precompilaForm(): void {
    const prodotto = this.prodotto();

    if (!prodotto) {
      return;
    }

    const divisione = prodotto.divisioni?.[0] ?? null;

    const categoria =
      typeof prodotto.sottoCategoria?.categoria === "object"
        ? prodotto.sottoCategoria?.categoria?.categoria
        : prodotto.sottoCategoria?.categoria;

    this.prodottoForm.patchValue(
      {
        descrizione: prodotto.descrizione ?? null,

        prezzo: prodotto.prezzo ?? null,

        categoria: categoria ?? null,

        sottoCategoria: prodotto.sottoCategoria?.idSottoCategoria ?? null,

        colore: divisione?.colore ?? null,

        materiale: divisione?.materiale ?? null,

        altezza: divisione?.altezza ?? null,

        lunghezza: divisione?.lunghezza ?? null,

        larghezza: divisione?.larghezza ?? null,

        quantitaDisponibile: divisione?.quantitaDisponibile ?? null,

        stockAlert: divisione?.stockAlert ?? null,
      },
      {
        emitEvent: false,
      }
    );
  }

  cambiaImmagine(url: string): void {
    this.imagePreview = url;
  }

  puoGestireProdotto(): boolean {
    return this.authService.isRoleAdmin() || this.authService.isRoleVenditore();
  }

  caricaImmagini(): void {
    const idProdotto = this.prodotto().idProdotto;

    this.immaginiService.getByProdotto(idProdotto).subscribe({
      next: (response) => {
        console.log("Immagini ricevute:", response);

        this.immagini.set(response);

        if (response.length > 0) {
          this.imagePreview = response[0].url;
        }
      },

      error: (errore) => {
        console.error("Errore caricamento immagini:", errore);
      },
    });
  }

  caricaCategorie(): void {
    this.categoriaService.getAll().subscribe({
      next: (response: any[]) => {
        this.categorie.set(response ?? []);

        console.log("Categorie ricevute:", response);
      },

      error: (errore) => {
        console.error("Errore caricamento categorie:", errore);

        this.msg.set(errore?.error?.msg ?? "Errore caricamento categorie");
      },
    });
  }

  caricaSottocategorie(): void {
    this.sottoCategoriaService.getAll().subscribe({
      next: (response: any[]) => {
        this.tutteSottocategorie.set(response ?? []);

        console.log("Sottocategorie ricevute:", response);

        if (this.mod() === "V" || this.mod() === "U") {
          this.precompilaForm();

          this.filtraSottocategorieIniziali();
        }
      },

      error: (errore) => {
        console.error("Errore caricamento sottocategorie:", errore);

        this.msg.set(errore?.error?.msg ?? "Errore caricamento sottocategorie");
      },
    });
  }

  private filtraSottocategorieIniziali(): void {
    const categoriaSelezionata = this.prodottoForm.controls["categoria"].value;

    if (!categoriaSelezionata) {
      this.sottocategorie.set([]);

      return;
    }

    const risultato = this.tutteSottocategorie().filter(
      (sottoCategoria: any) =>
        this.leggiNomeCategoria(sottoCategoria.categoria) ===
        categoriaSelezionata
    );

    this.sottocategorie.set(risultato);
  }

  private leggiNomeCategoria(categoria: any): string | null {
    if (!categoria) {
      return null;
    }

    if (typeof categoria === "string") {
      return categoria;
    }

    return categoria.categoria ?? null;
  }

  ascoltaCambioCategoria(): void {
    this.prodottoForm.controls["categoria"].valueChanges.subscribe(
      (categoriaSelezionata: string | null) => {
        this.prodottoForm.controls["sottoCategoria"].setValue(null);

        if (categoriaSelezionata === null) {
          this.sottocategorie.set([]);

          return;
        }

        const risultato = this.tutteSottocategorie().filter(
          (sottoCategoria: any) =>
            this.leggiNomeCategoria(sottoCategoria.categoria) ===
            categoriaSelezionata
        );

        this.sottocategorie.set(risultato);

        console.log("Sottocategorie filtrate:", risultato);
      }
    );
  }

  onSubmit(): void {
    this.msg.set("");

    if (this.mod() === "V") {
      return;
    }

    if (this.prodottoForm.invalid) {
      this.prodottoForm.markAllAsTouched();

      this.msg.set("Compila tutti i campi obbligatori");

      return;
    }

    if (this.mod() === "U") {
      const formValue = this.prodottoForm.getRawValue();

      const prodottoReq = {
        idProdotto: this.prodotto().idProdotto,

        descrizione: formValue.descrizione,

        prezzo: Number(formValue.prezzo),

        idSottoCategoria: Number(formValue.sottoCategoria),
      };

      console.log("Aggiornamento prodotto:", prodottoReq);

      this.prodottoService.update(prodottoReq).subscribe({
        next: () => {
          console.log("Prodotto aggiornato");

          const divisione = this.prodotto().divisioni?.[0];

          if (!divisione) {
            console.error("Nessuna divisione trovata");

            this.dialogRef.close(true);

            return;
          }

          const divisioneReq = {
            idDivisione: divisione.idDivisione,

            colore: formValue.colore,

            materiale: formValue.materiale,

            altezza: Number(formValue.altezza),

            lunghezza: Number(formValue.lunghezza),

            larghezza: Number(formValue.larghezza),

            quantitaDisponibile: Number(formValue.quantitaDisponibile),

            stockAlert: Number(formValue.stockAlert),
          };

          console.log("Aggiornamento divisione:", divisioneReq);

          this.divisioneProdottoService.update(divisioneReq).subscribe({
            next: () => {
              console.log("Divisione aggiornata");

              this.dialogRef.close(true);
            },

            error: (errore) => {
              console.error("Errore aggiornamento divisione:", errore);

              this.msg.set(
                errore?.error?.msg ?? "Errore aggiornamento divisione"
              );
            },
          });
        },

        error: (errore) => {
          console.error("Errore aggiornamento prodotto:", errore);

          this.msg.set(errore?.error?.msg ?? "Errore aggiornamento prodotto");
        },
      });

      return;
    }

    const formValue = this.prodottoForm.getRawValue();

    const userId = this.authService.grant().userId;

    if (!userId) {
      this.msg.set("Utente non autenticato");

      console.error("User ID non presente");

      return;
    }

    const prodottoReq = {
      descrizione: formValue.descrizione,

      prezzo: Number(formValue.prezzo),

      idSottoCategoria: Number(formValue.sottoCategoria),

      idUser: Number(userId),
    };

    console.log("Prodotto da creare:", prodottoReq);

    this.prodottoService.create(prodottoReq).subscribe({
      next: (idProdotto: number) => {
        console.log("Prodotto creato con ID:", idProdotto);

        const divisioneReq = {
          colore: formValue.colore,

          materiale: formValue.materiale,

          altezza: Number(formValue.altezza),

          lunghezza: Number(formValue.lunghezza),

          larghezza: Number(formValue.larghezza),

          quantitaDisponibile: Number(formValue.quantitaDisponibile),

          stockAlert: Number(formValue.stockAlert),

          idProdotto: Number(idProdotto),
        };

        console.log("Divisione da creare:", divisioneReq);

        this.creaDivisione(divisioneReq, idProdotto);
      },

      error: (errore) => {
        console.error("Errore creazione prodotto:", errore);

        this.msg.set(
          errore?.error?.msg ?? "Errore durante la creazione del prodotto"
        );
      },
    });
  }

  private creaDivisione(divisioneReq: any, idProdotto: number): void {
    this.divisioneProdottoService.create(divisioneReq).subscribe({
      next: (response) => {
        console.log("Divisione creata correttamente:", response);

        if (this.selectedFiles.length > 0) {
          this.immaginiService
            .upload(this.selectedFiles, idProdotto)
            .subscribe({
              next: (response) => {
                console.log("Immagine caricata:", response);

                this.dialogRef.close(true);
              },

              error: (errore) => {
                console.error("Errore caricamento immagine:", errore);

                this.dialogRef.close(true);
              },
            });
        } else {
          this.dialogRef.close(true);
        }
      },

      error: (errore) => {
        console.error("Errore creazione divisione:", errore);

        this.msg.set(
          errore?.error?.msg ??
            "Prodotto creato, ma errore nella creazione della divisione"
        );
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFiles = [input.files[0]];

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(this.selectedFiles[0]);
  }

  abilitaModifica(): void {
    this.mod.set("U");

    this.prodottoForm.enable();

    this.precompilaForm();

    this.filtraSottocategorieIniziali();

    this.msg.set("");

    console.log("Modalità aggiornamento attivata");
    console.log("Stato form:", this.prodottoForm.status);
  }

  annullaModifica(): void {
    this.mod.set("V");

    this.precompilaForm();

    this.prodottoForm.disable();

    this.msg.set("");

    this.filtraSottocategorieIniziali();

    console.log("Modifica annullata");
  }

  aggiungiAlCarrello(): void {
    const userId = Number(this.authService.grant().userId);

    if (!userId) {
      console.error("Utente non autenticato");

      return;
    }

    this.carrelloService.getByUser(userId).subscribe({
      next: (carrello) => {
        const divisione = this.prodotto().divisioni?.[0];

        if (!divisione) {
          console.error("Nessuna divisione disponibile");

          return;
        }

        const body = {
          idCarrello: carrello.idCarrello,

          idDivisioneProdotto: divisione.idDivisione,

          quantita: 1,
        };

        console.log("Dati invio carrello:", body);

        this.prodottiCarrelloService.create(body).subscribe({
          next: (response) => {
            console.log("Prodotto aggiunto al carrello:", response);

            this.msg.set("Prodotto aggiunto al carrello");
          },

          error: (errore) => {
            console.error("Errore aggiunta prodotto:", errore);
          },
        });
      },

      error: (errore) => {
        console.error("Errore recupero carrello:", errore);
      },
    });
  }

  private convertiData(data: string): string {
    const parti = data.split("-");

    return `${parti[2]}/${parti[1]}/${parti[0]}`;
  }

  creaSconto(): void {
    const prodotto = this.prodotto();

    if (!prodotto) {
      console.error("Nessun prodotto selezionato");
      return;
    }

    if (!this.valoreSconto || !this.dataInizio || !this.dataFine) {
      this.msg.set("Compila tutti i campi dello sconto");

      return;
    }

    const scontoReq = {
      idProdotto: prodotto.idProdotto,

      valore: this.valoreSconto,

      dataInizio: this.convertiData(this.dataInizio),

      dataFine: this.convertiData(this.dataFine),
    };

    console.log("Sconto inviato:", scontoReq);

    this.scontoService.create(scontoReq).subscribe({
      next: (response) => {
        console.log("Sconto creato correttamente:", response);

        const nuovoSconto = {
          valore: this.valoreSconto,
          dataInizio: this.dataInizio,
          dataFine: this.dataFine,
        };

        this.scontoEsistente.set(nuovoSconto);

        this.msg.set("Sconto applicato al prodotto");
      },

      error: (errore) => {
        console.error("Errore creazione sconto:", errore);

        this.msg.set(errore?.error?.msg ?? "Errore creazione sconto");
      },
    });
  }

  eliminaSconto(): void {
    const sconto = this.scontoEsistente();

    if (!sconto) {
      console.error("Nessuno sconto da eliminare");
      return;
    }

    const conferma = confirm("Sei sicuro di voler eliminare questo sconto?");

    if (!conferma) {
      return;
    }

    this.scontoService.delete(sconto.idSconto).subscribe({
      next: () => {
        console.log("Sconto eliminato");

        this.scontoEsistente.set(null);

        this.valoreSconto = null;

        this.dataInizio = "";

        this.dataFine = "";

        this.msg.set("Sconto eliminato");
      },

      error: (errore) => {
        console.error("Errore eliminazione sconto:", errore);

        this.msg.set(errore?.error?.msg ?? "Errore eliminazione sconto");
      },
    });
  }

  remove(): void {
    const conferma = confirm("Sei sicuro di voler eliminare questo prodotto?");

    if (!conferma) {
      console.log("Eliminazione annullata");
      return;
    }

    const idProdotto = this.prodotto().idProdotto;

    this.prodottoService.delete(idProdotto).subscribe({
      next: () => {
        console.log("Prodotto eliminato");

        this.dialogRef.close(true);
      },

      error: (errore) => {
        console.error("Errore eliminazione prodotto:", errore);

        this.msg.set(errore?.error?.msg ?? "Errore eliminazione prodotto");
      },
    });
  }
}
