import { Component, ElementRef, ViewChild, afterNextRender, inject, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { PagamentiServices } from '../../services/pagamenti-services';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: "app-checkout",
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: "./checkout.html",
  styleUrl: "./checkout.css",
})
export class Checkout {

  @ViewChild('paymentElement') paymentElementRef!: ElementRef;

  private pagS = inject(PagamentiServices);
  private stripe: Stripe | null = null;
  private elements?: StripeElements;

  caricamento = signal(true);
  elaborazione = signal(false);
  messaggio = signal('');

  constructor() {
    afterNextRender(() => this.init());
  }

  private async init() {
    try {
      const cfg = await firstValueFrom(this.pagS.getConfig());
      this.stripe = await loadStripe(cfg.publishableKey);

      const intent = await firstValueFrom(
        this.pagS.createIntent({ idOrdine: 3, salvaMetodo: false })
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

    this.elaborazione.set(false);
    this.messaggio.set('');

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/dash/checkout-result?idOrdine=3'
      }
    });

    if (error) {
      this.messaggio.set(error.message ?? 'Errore durante il pagamento');
      this.elaborazione.set(false);
    }
  }
}
