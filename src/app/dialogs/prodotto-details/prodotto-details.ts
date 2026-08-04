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

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { CategoriaServices } from "../../services/categoria-services";
import { SottoCategoriaServices } from "../../services/sotto-categoria-services";
import { ProdottoServices } from "../../services/prodotto-services";
import { DivisioneProdottoServices } from "../../services/divisione-prodotto-services";
import { AuthServices } from "../../auth/auth-services";
import { ImmaginiServices } from "../../services/immagini-services";
import { ProdottiCarrelloServices } from "../../services/prodotti-carrello-services";
import { CarelloServices } from "../../services/carello-services";
import { ScontoServices } from "../../services/sconto-services";

@Component({
  selector: "app-prodotto-details",
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
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
  private readonly carrelloService = inject(CarelloServices);
  private readonly prodottiCarrelloService = inject(ProdottiCarrelloServices);
  private readonly scontoService = inject(ScontoServices);

  mod = signal("");
  prodotto = signal<any>(null);
  categorie = signal<any[]>([]);
  tutteSottocategorie = signal<any[]>([]);
  sottocategorie = signal<any[]>([]);
  msg = signal("");
  immagini = signal<any[]>([]);
  selectedFiles: File[] = [];
  imagePreview: string | null = null;
  valoreSconto: number | null = null;
  dataInizio = "";
  dataFine = "";
  scontoEsistente = signal<any>(null);

  // --- GESTIONE VARIANTI (DIVISIONI PRODOTTO) ---

  // Varianti già esistenti sul prodotto (mod V/U) oppure bozze in creazione (mod C)
  divisioni = signal<any[]>([]);

  // Variante attualmente mostrata / in modifica (mod V/U)
  divisioneSelezionata = signal<any>(null);

  // Bozze di varianti da creare insieme al nuovo prodotto (solo mod C)
  private divisioniDaCreare: any[] = [];

  // true quando si sta compilando il form per aggiungere una NUOVA variante
  // a un prodotto già esistente (mod U)
  modalitaNuovaVariante = signal(false);

  // Dati generali del prodotto (condivisi da tutte le varianti)
  prodottoForm: FormGroup = new FormGroup({
    descrizione: new FormControl(null, Validators.required),
    prezzo: new FormControl(null, [Validators.required, Validators.min(0)]),
    categoria: new FormControl(null, Validators.required),
    sottoCategoria: new FormControl(null, Validators.required),
  });

  // Dati specifici della singola variante (divisione prodotto)
  divisioneForm: FormGroup = new FormGroup({
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
      if (this.prodotto().sconto) {
        this.scontoEsistente.set(this.prodotto().sconto);
        this.valoreSconto = this.prodotto().sconto.valore;
        this.dataInizio = this.prodotto().sconto.dataInizio;
        this.dataFine = this.prodotto().sconto.dataFine;
      }
      this.caricaImmagini();
      this.caricaDivisioni();
    }

    if (this.mod() === "V") {
      this.prodottoForm.disable();
      this.divisioneForm.disable();
    }
  }

  // --- CARICAMENTO E SELEZIONE VARIANTI ESISTENTI ---

  private caricaDivisioni(): void {
    const divisioni = this.prodotto()?.divisioni ?? [];
    this.divisioni.set(divisioni);

    if (divisioni.length > 0) {
      this.selezionaDivisione(divisioni[0]);
    }
  }

  selezionaDivisione(divisione: any): void {
    this.divisioneSelezionata.set(divisione);
    this.modalitaNuovaVariante.set(false);

    this.divisioneForm.patchValue(
      {
        colore: divisione.colore ?? null,
        materiale: divisione.materiale ?? null,
        altezza: divisione.altezza ?? null,
        lunghezza: divisione.lunghezza ?? null,
        larghezza: divisione.larghezza ?? null,
        quantitaDisponibile: divisione.quantitaDisponibile ?? null,
        stockAlert: divisione.stockAlert ?? null,
      },
      { emitEvent: false },
    );

    if (this.mod() === "V") {
      this.divisioneForm.disable();
    } else {
      this.divisioneForm.enable();
    }
  }

  private precompilaForm(): void {
    const prodotto = this.prodotto();
    if (!prodotto) {
      return;
    }

    const categoria =
      typeof prodotto.sottoCategoria?.categoria === "object"
        ? prodotto.sottoCategoria?.categoria?.categoria
        : prodotto.sottoCategoria?.categoria;

    this.prodottoForm.patchValue(
      {
        descrizione: prodotto.descrizione ?? null,
        prezzo: prodotto.prezzoOriginale ?? prodotto.prezzo ?? null,
        categoria: categoria ?? null,
        sottoCategoria: prodotto.sottoCategoria?.idSottoCategoria ?? null,
      },
      {
        emitEvent: false,
      },
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

  rimuoviImmagine(idImmagine: number): void {
    const conferma = confirm("Sei sicuro di voler eliminare questa immagine?");

    if (!conferma) {
      return;
    }

    this.immaginiService.delete(idImmagine).subscribe({
      next: () => {
        console.log("Immagine eliminata");

        // aggiorna la lista senza chiudere il dialog
        this.immagini.update((lista) =>
          lista.filter((img) => img.id !== idImmagine)
        );

        // aggiorna anteprima principale
        if (this.immagini().length > 0) {
          this.imagePreview = this.immagini()[0].url;
        } else {
          this.imagePreview = null;
        }
      },

      error: (errore) => {
        console.error("Errore eliminazione immagine:", errore);
      },
    });
  }

  caricaCategorie(): void {
    this.categoriaService.getAll().subscribe({
      next: (response: any[]) => {
        this.categorie.set(response ?? []);
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
        categoriaSelezionata,
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
            categoriaSelezionata,
        );

        this.sottocategorie.set(risultato);
        console.log("Sottocategorie filtrate:", risultato);
      },
    );
  }

  // --- GESTIONE VARIANTI DURANTE LA CREAZIONE DI UN NUOVO PRODOTTO (mod C) ---

  aggiungiVarianteACreazione(): void {
    if (this.divisioneForm.invalid) {
      this.divisioneForm.markAllAsTouched();
      this.msg.set("Compila tutti i campi della variante prima di aggiungerla");
      return;
    }

    const formValue = this.divisioneForm.getRawValue();
    const nuovaVariante = {
      colore: formValue.colore,
      materiale: formValue.materiale,
      altezza: Number(formValue.altezza),
      lunghezza: Number(formValue.lunghezza),
      larghezza: Number(formValue.larghezza),
      quantitaDisponibile: Number(formValue.quantitaDisponibile),
      stockAlert: Number(formValue.stockAlert),
    };

    this.divisioniDaCreare.push(nuovaVariante);
    this.divisioni.set([...this.divisioniDaCreare]);
    this.divisioneForm.reset();
    this.msg.set("");
  }

  rimuoviVarianteDaCreazione(index: number): void {
    this.divisioniDaCreare.splice(index, 1);
    this.divisioni.set([...this.divisioniDaCreare]);
  }

  // --- GESTIONE NUOVA VARIANTE SU PRODOTTO GIA' ESISTENTE (mod U) ---

  apriFormNuovaVariante(): void {
    this.modalitaNuovaVariante.set(true);
    this.divisioneSelezionata.set(null);
    this.divisioneForm.reset();
    this.divisioneForm.enable();
  }

  annullaNuovaVariante(): void {
    this.modalitaNuovaVariante.set(false);
    const divisioni = this.divisioni();
    if (divisioni.length > 0) {
      this.selezionaDivisione(divisioni[0]);
    }
  }

  salvaNuovaVariante(): void {
    if (this.divisioneForm.invalid) {
      this.divisioneForm.markAllAsTouched();
      this.msg.set("Compila tutti i campi obbligatori della variante");
      return;
    }

    const formValue = this.divisioneForm.getRawValue();
    const divisioneReq = {
      colore: formValue.colore,
      materiale: formValue.materiale,
      altezza: Number(formValue.altezza),
      lunghezza: Number(formValue.lunghezza),
      larghezza: Number(formValue.larghezza),
      quantitaDisponibile: Number(formValue.quantitaDisponibile),
      stockAlert: Number(formValue.stockAlert),
      idProdotto: this.prodotto().idProdotto,
    };

    console.log("Nuova variante da creare:", divisioneReq);

    this.divisioneProdottoService.create(divisioneReq).subscribe({
      next: (response: any) => {
        console.log("Nuova variante creata:", response);

        const nuovaDivisione = {
          ...divisioneReq,
          idDivisione: response?.idDivisione ?? response,
        };

        this.divisioni.set([...this.divisioni(), nuovaDivisione]);
        this.modalitaNuovaVariante.set(false);
        this.selezionaDivisione(nuovaDivisione);
        this.msg.set("Variante aggiunta con successo");
      },

      error: (errore) => {
        console.error("Errore creazione variante:", errore);
        this.msg.set(errore?.error?.msg ?? "Errore creazione variante");
      },
    });
  }

  eliminaVariante(divisione: any, event?: Event): void {
    event?.stopPropagation();

    if (this.divisioni().length <= 1) {
      alert("Il prodotto deve avere almeno una variante");
      return;
    }

    const conferma = confirm("Sei sicuro di voler eliminare questa variante?");
    if (!conferma) {
      return;
    }

    this.divisioneProdottoService.delete(divisione.idDivisione).subscribe({
      next: () => {
        const restanti = this.divisioni().filter(
          (d: any) => d.idDivisione !== divisione.idDivisione,
        );
        this.divisioni.set(restanti);

        if (restanti.length > 0) {
          this.selezionaDivisione(restanti[0]);
        }

        this.msg.set("Variante eliminata");
      },

      error: (errore) => {
        console.error("Errore eliminazione variante:", errore);
        this.msg.set(errore?.error?.msg ?? "Errore eliminazione variante");
      },
    });
  }

  // --- SUBMIT PRINCIPALE ---

  onSubmit(): void {
    this.msg.set("");

    if (this.mod() === "V") {
      return;
    }

    if (this.prodottoForm.invalid) {
      this.prodottoForm.markAllAsTouched();
      this.msg.set("Compila tutti i campi obbligatori del prodotto");
      return;
    }

    if (this.mod() === "U") {
      this.salvaModificaProdotto();
      return;
    }

    this.creaProdottoConVarianti();
  }

  // --- AGGIORNAMENTO PRODOTTO ESISTENTE + VARIANTE SELEZIONATA ---

  private salvaModificaProdotto(): void {
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

        const divisione = this.divisioneSelezionata();
        if (!divisione) {
          console.warn("Nessuna variante selezionata da aggiornare");
          this.finalizzaSalvataggio();
          return;
        }

        if (this.divisioneForm.invalid) {
          this.divisioneForm.markAllAsTouched();
          this.msg.set("Compila tutti i campi obbligatori della variante");
          return;
        }

        const formDivisione = this.divisioneForm.getRawValue();
        const divisioneReq = {
          idDivisione: divisione.idDivisione,
          colore: formDivisione.colore,
          materiale: formDivisione.materiale,
          altezza: Number(formDivisione.altezza),
          lunghezza: Number(formDivisione.lunghezza),
          larghezza: Number(formDivisione.larghezza),
          quantitaDisponibile: Number(formDivisione.quantitaDisponibile),
          stockAlert: Number(formDivisione.stockAlert),
        };

        console.log("Aggiornamento variante:", divisioneReq);

        this.divisioneProdottoService.update(divisioneReq).subscribe({
          next: () => {
            console.log("Variante aggiornata");
            this.finalizzaSalvataggio();
          },

          error: (errore) => {
            console.error("Errore aggiornamento variante:", errore);
            this.msg.set(errore?.error?.msg ?? "Errore aggiornamento variante");
          },
        });
      },

      error: (errore) => {
        console.error("Errore aggiornamento prodotto:", errore);
        this.msg.set(errore?.error?.msg ?? "Errore aggiornamento prodotto");
      },
    });
  }

  private finalizzaSalvataggio(): void {
    if (this.selectedFiles.length > 0) {
      this.immaginiService
        .upload(this.selectedFiles, this.prodotto().idProdotto)
        .subscribe({
          next: (response) => {
            console.log("Nuova immagine caricata:", response);
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
  }

  // --- CREAZIONE NUOVO PRODOTTO CON UNA O PIU' VARIANTI ---

  private creaProdottoConVarianti(): void {
    if (this.divisioniDaCreare.length === 0) {
      this.msg.set(
        "Aggiungi almeno una variante prima di registrare il prodotto",
      );
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
        this.creaDivisioniInSequenza(
          idProdotto,
          [...this.divisioniDaCreare],
          0,
        );
      },

      error: (errore) => {
        console.error("Errore creazione prodotto:", errore);
        this.msg.set(
          errore?.error?.msg ?? "Errore durante la creazione del prodotto",
        );
      },
    });
  }

  private creaDivisioniInSequenza(
    idProdotto: number,
    varianti: any[],
    indice: number,
  ): void {
    if (indice >= varianti.length) {
      this.finalizzaSalvataggio();
      return;
    }

    const divisioneReq = {
      ...varianti[indice],
      idProdotto: Number(idProdotto),
    };

    console.log(
      `Creazione variante ${indice + 1}/${varianti.length}:`,
      divisioneReq,
    );

    this.divisioneProdottoService.create(divisioneReq).subscribe({
      next: (response) => {
        console.log(`Variante ${indice + 1} creata correttamente:`, response);
        this.creaDivisioniInSequenza(idProdotto, varianti, indice + 1);
      },

      error: (errore) => {
        console.error(`Errore creazione variante ${indice + 1}:`, errore);
        this.msg.set(
          errore?.error?.msg ??
            `Prodotto creato, ma errore nella creazione della variante ${indice + 1}`,
        );
        // Prosegue comunque con le varianti successive
        this.creaDivisioniInSequenza(idProdotto, varianti, indice + 1);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }
    this.selectedFiles = Array.from(input.files);
    const file = this.selectedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    // permette di riselezionare anche lo stesso file
    input.value = "";
  }

  abilitaModifica(): void {
    this.mod.set("U");
    this.prodottoForm.enable();
    this.divisioneForm.enable();
    this.precompilaForm();
    this.filtraSottocategorieIniziali();
    this.msg.set("");
    console.log("Modalità aggiornamento attivata");
  }

  annullaModifica(): void {
    this.mod.set("V");
    this.precompilaForm();
    this.prodottoForm.disable();
    this.divisioneForm.disable();
    this.modalitaNuovaVariante.set(false);
    this.msg.set("");
    this.filtraSottocategorieIniziali();
    console.log("Modifica annullata");
  }

  creaSconto() {
    if (
      !this.valoreSconto ||
      this.valoreSconto <= 0 ||
      this.valoreSconto > 100
    ) {
      alert("Lo sconto deve essere compreso tra 1 e 100%");
      return;
    }
    const formattaData = (data: string) => {
      const [anno, mese, giorno] = data.split("-");
      return `${giorno}/${mese}/${anno}`;
    };

    const body = {
      idProdotto: this.prodotto()?.idProdotto,
      valore: this.valoreSconto,
      dataInizio: formattaData(this.dataInizio),
      dataFine: formattaData(this.dataFine),
    };

    console.log("BODY SCONTO:", body);

    this.scontoService.create(body).subscribe({
      next: (res) => {
        console.log("Sconto creato", res);
      },
      error: (err) => {
        console.error("Errore creazione sconto", err);
      },
    });
  }

  eliminaSconto(): void {
    const idSconto = this.scontoEsistente()?.idSconto;

    if (!idSconto) {
      return;
    }

    this.scontoService.delete(idSconto).subscribe({
      next: () => {
        console.log("Sconto eliminato");
        this.scontoEsistente.set(null);
        this.msg.set("Sconto eliminato");
      },
      error: (errore) => {
        console.error("Errore eliminazione sconto", errore);
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
