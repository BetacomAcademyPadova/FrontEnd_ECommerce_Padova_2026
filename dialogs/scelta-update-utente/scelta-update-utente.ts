import { ChangeDetectorRef, Component, Inject, inject } from "@angular/core";
import { MatDialog, MatDialogRef, MatDialogContent, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { FormsModule  } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UtenteServices } from "../../services/user-services";

@Component({
  selector: "app-scelta-update-utente",
  imports: [MatIconModule, MatDialogContent, MatButtonToggleModule, FormsModule,
    MatButtonModule],
  templateUrl: "./scelta-update-utente.html",
  styleUrl: "./scelta-update-utente.css",
})
export class SceltaUpdateUtente 
{
  updateUt:any;
  errorMessage: string | null = null;

  private cd = inject(ChangeDetectorRef);

  readonly dialog = inject(MatDialog);

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private userS: UtenteServices,
    private dialogRef: MatDialogRef<SceltaUpdateUtente>
  ) { }

  chiudi() {
    this.dialogRef.close();
  }

  confermaScelta() {
    this.errorMessage = null;

    if (this.updateUt === 'update') {
      this.dialogRef.close('update');
    } 
    else if (this.updateUt === 'delete') {
      const idUtente = this.data.userId;

      this.userS.deleteUser(idUtente).subscribe({
        next: () => {
          console.log("Utente eliminato con successo");
          this.dialogRef.close('delete');
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione dell'utente", err);
          this.errorMessage = "Questo venditore ha dei prodotti attivi e non può essere eliminato.";
          this.cd.detectChanges();
        }
      });
    }
  }
}
