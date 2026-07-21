import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loadStripe } from '@stripe/stripe-js';
import type { PaymentIntent } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { PagamentiServices } from '../../services/pagamenti-services';

type Stato = PaymentIntent['status'] | 'loading' | 'errore';

@Component({
  selector: 'app-checkout-result',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './checkout-result.html',
  styleUrl: './checkout-result.css',
})
export class CheckoutResult {

  private route = inject(ActivatedRoute);
  private pagS = inject(PagamentiServices);

  stato = signal<Stato>('loading');
  messaggio = signal('Verifica del pagamento in corso...');

  icona = computed(() => {
    switch (this.stato()) {
      case 'succeeded': return 'check_circle';
      case 'processing': return 'schedule';
      case 'loading': return 'hourglass_empty';
      default: return 'error';
    }
  });

  tema = computed(() => {
    switch (this.stato()) {
      case 'succeeded': return 'ok';
      case 'processing':
      case 'loading': return 'attesa';
      default: return 'ko';
    }
  });
  
  constructor() {
    afterNextRender(() => this.verifica());
  }

  private async verifica() {
    const clientSecret = this.route.snapshot
      .queryParamMap.get('payment_intent_client_secret');

    if (!clientSecret) {
      this.stato.set('errore');
      this.messaggio.set('Nessun pagamento da verificare.');
      return;
    }

    try {
      const cfg = await firstValueFrom(this.pagS.getConfig());
      const stripe = await loadStripe(cfg.publishableKey);
      const { paymentIntent } = await stripe!.retrievePaymentIntent(clientSecret);

      this.stato.set(paymentIntent?.status ?? 'errore');

      switch (this.stato()) {
        case 'succeeded':
          this.messaggio.set('Pagamento completato con successo.');
          break;
        case 'processing':
          this.messaggio.set('Pagamento in elaborazione. Riceverai una conferma a breve.');
          break;
        case 'requires_payment_method':
          this.messaggio.set('Pagamento non riuscito. Prova con un altro metodo.');
          break;
        default:
          this.messaggio.set('Stato del pagamento: ' + this.stato());
      }
    } catch (e: any) {
      this.stato.set('errore');
      this.messaggio.set('Errore: ' + (e?.message ?? e));
      console.log(e);
    }
  }
}