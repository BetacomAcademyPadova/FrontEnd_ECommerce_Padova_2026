import { Component, inject } from "@angular/core";
import { MatDialog, MatDialogRef, MatDialogContent } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { FormsModule  } from '@angular/forms';

@Component({
  selector: "app-scelta-update-utente",
  imports: [MatIconModule, MatDialogContent, MatButtonToggleModule, FormsModule],
  templateUrl: "./scelta-update-utente.html",
  styleUrl: "./scelta-update-utente.css",
})
export class SceltaUpdateUtente 
{
  updateUt:any;

  readonly dialog = inject(MatDialog);

  constructor(
    private dialogRef: MatDialogRef<SceltaUpdateUtente>
  ) { }

  chiudi() {
    this.dialogRef.close();
  }

  confermaScelta() {
    if (this.updateUt) {
      this.dialogRef.close(this.updateUt);
    }
  }
}
