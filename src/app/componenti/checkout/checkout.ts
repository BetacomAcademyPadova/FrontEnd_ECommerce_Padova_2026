import { Component, ElementRef, ViewChild, afterNextRender, inject, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { PagamentiServices } from '../../services/pagamenti-services';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrdineServices } from '../../services/ordine-services';


@Component({
  selector: "app-checkout",
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink, DecimalPipe],
  templateUrl: "./checkout.html",
  styleUrl: "./checkout.css",
})
export class Checkout {

  @ViewChild('paymentElement') paymentElementRef!: ElementRef;

  private pagS = inject(PagamentiServices);
  private ordineS = inject(OrdineServices);
  private stripe: Stripe | null = null;
  private elements?: StripeElements;

  private route = inject(ActivatedRoute);
  idOrdine = Number(this.route.snapshot.queryParamMap.get('idOrdine'));

  caricamento = signal(true);
  elaborazione = signal(false);
  messaggio = signal('');
  totale = signal<number | null>(null);

  constructor() {
    afterNextRender(() => this.init());
  }

  private async init() {
    if (!this.idOrdine || Number.isNaN(this.idOrdine)) {
      this.caricamento.set(false);
      this.messaggio.set('Ordine non valido: idOrdine mancante nella URL.');
      return;
    }
    try {
      const ordine = await firstValueFrom(this.ordineS.getById(this.idOrdine));
      this.totale.set(ordine.totale);

      const cfg = await firstValueFrom(this.pagS.getConfig());
      this.stripe = await loadStripe(cfg.publishableKey);

      const intent = await firstValueFrom(
        this.pagS.createIntent({ idOrdine: this.idOrdine, salvaMetodo: false })
      );

      this.elements = this.stripe!.elements({ clientSecret: intent.clientSecret });
      this.elements.create('payment').mount(this.paymentElementRef.nativeElement);

      this.caricamento.set(false);

    } catch (e: any) {
      this.caricamento.set(false);
      this.messaggio.set('Errore : ' + (e?.error?.msg ?? e?.message ?? e));
      console.log(e);
    }
  }
  async paga() {
    if (!this.stripe || !this.elements) return;

    this.elaborazione.set(true);
    this.messaggio.set('');

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/dash/checkout-result?idOrdine=' + this.idOrdine
      }
    });

    if (error) {
      this.messaggio.set(error.message ?? 'Errore durante il pagamento');
      this.elaborazione.set(false);
    }
  }
}
