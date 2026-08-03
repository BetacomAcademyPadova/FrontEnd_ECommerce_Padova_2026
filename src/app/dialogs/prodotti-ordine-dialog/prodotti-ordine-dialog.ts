import { Component, Inject } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-prodotti-ordine-dialog",
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatDialogModule, MatButtonModule],
  templateUrl: "./prodotti-ordine-dialog.html",
  styleUrl: "./prodotti-ordine-dialog.css",
})
export class ProdottiOrdineDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public prodotti: any[],
  ) {}
}
