import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-ricevuta-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: "./ricevuta-dialog.html",
  styleUrl: "./ricevuta-dialog.css",
})
export class RicevutaDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public ricevuta: any,
  ) {}

  stampa() {
    const contenuto = document.getElementById("stampa-ricevuta")?.innerHTML;

    const finestra = window.open("", "", "width=900,height=700");

    finestra?.document.write(`


<html>

<head>

<title>
Ricevuta ${this.ricevuta.numeroFattura}
</title>


<style>


body {

font-family:Arial;

padding:30px;

}


table {

width:100%;

border-collapse:collapse;

}


th {

background:#5D4037;

color:white;

padding:10px;

}


td {

padding:10px;

border-bottom:1px solid #ddd;

}


.totale {

font-size:20px;

font-weight:bold;

text-align:right;

}


</style>


</head>


<body>


${contenuto}


</body>


</html>


`);

    finestra?.document.close();

    finestra?.print();
  }
}
