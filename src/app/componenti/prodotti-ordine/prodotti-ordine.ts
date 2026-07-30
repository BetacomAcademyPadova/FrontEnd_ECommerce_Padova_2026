import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ProdottiOrdineServices } from '../../services/prodotti-ordine-services';

@Component({
  selector: 'app-prodotti-ordine',
  standalone: true,
  imports: [ MatCardModule, MatDividerModule, DecimalPipe ],
  templateUrl: './prodotti-ordine.html',
  styleUrl: './prodotti-ordine.css',
})
export class ProdottiOrdine implements OnInit {
  private readonly prodottiOrdineS = inject(ProdottiOrdineServices);

  ngOnInit(): void {
    this.prodottiOrdineS.list();
  }

  get prodottiOrdine() {
    return this.prodottiOrdineS.prodottiOrdine();
  }

  selezionaProdottoOrdine(row: any) {
    console.log('Prodotto ordine selezionato:', row);
  }
}